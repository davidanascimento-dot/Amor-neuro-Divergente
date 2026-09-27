-- =============================================================
-- 13_media_messages.sql
-- Imagens e vídeos nas conversas (privadas e de comunidade).
--
-- Complementa o 12_audio_messages.sql. Mesma lógica: bucket fechado e
-- acesso só para quem participa da conversa. Foto e vídeo de alguém numa
-- conversa privada não podem ser públicos só porque ficaram no storage.
--
-- Execute APÓS o 12. Idempotente: pode rodar quantas vezes quiser.
-- Depois: Settings → API → Reload schema (ou esperar ~1 min).
-- =============================================================

-- -------------------------------------------------------------
-- 1. Colunas da mídia
-- -------------------------------------------------------------
ALTER TABLE public.messages
    ADD COLUMN IF NOT EXISTS media_path TEXT,
    ADD COLUMN IF NOT EXISTS media_mime TEXT,
    ADD COLUMN IF NOT EXISTS media_size BIGINT,
    ADD COLUMN IF NOT EXISTS media_width INTEGER,
    ADD COLUMN IF NOT EXISTS media_height INTEGER;

-- O CHECK do 12 travava message_type em texto/audio. Agora precisa
-- aceitar imagem e video, então o constraint antigo é removido antes
-- de recriar. Se o 12 ainda não tiver rodado, cai no guard do DO.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_message_type_check') THEN
        ALTER TABLE public.messages DROP CONSTRAINT messages_message_type_check;
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Nao foi possivel remover o CHECK anterior: %', SQLERRM;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_message_type_check') THEN
        ALTER TABLE public.messages
            ADD CONSTRAINT messages_message_type_check
            CHECK (message_type IN ('texto', 'audio', 'imagem', 'video'));
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'CHECK de message_type nao criado: %', SQLERRM;
END $$;

-- Áudio e mídia não podem vir pela metade.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_media_consistente') THEN
        ALTER TABLE public.messages
            ADD CONSTRAINT messages_media_consistente
            CHECK (
                (message_type = 'texto'  AND media_path IS NULL AND audio_path IS NULL)
                OR (message_type = 'audio'  AND audio_path IS NOT NULL)
                OR (message_type = 'imagem' AND media_path IS NOT NULL)
                OR (message_type = 'video'  AND media_path IS NOT NULL)
            );
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'CHECK de consistencia nao criado: %', SQLERRM;
END $$;

-- -------------------------------------------------------------
-- 2. Bucket fechado de imagem e vídeo
-- -------------------------------------------------------------
-- 20 MB: vídeo curto de celular cabe com folga. Acima disso o upload
-- trava a conversa inteira em internet lenta.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chat-media',
    'chat-media',
    false,
    20971520,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
          'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg']
        ::text[]
)
ON CONFLICT (id) DO UPDATE
SET file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types,
    public = EXCLUDED.public;

-- Reaproveita a mesma verificação de participante do áudio.
DROP POLICY IF EXISTS "Midia legivel por participante" ON storage.objects;
CREATE POLICY "Midia legivel por participante"
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'chat-media'
        AND public.audio_path_is_participant(name, auth.uid())
    );

DROP POLICY IF EXISTS "Midia enviada pelo dono na conversa" ON storage.objects;
CREATE POLICY "Midia enviada pelo dono na conversa"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'chat-media'
        AND public.audio_path_is_participant(name, auth.uid())
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Midia removida pelo dono" ON storage.objects;
CREATE POLICY "Midia removida pelo dono"
    ON storage.objects FOR DELETE TO authenticated
    USING (
        bucket_id = 'chat-media'
        AND public.audio_path_is_participant(name, auth.uid())
    );

-- -------------------------------------------------------------
-- 3. Enviar imagem ou vídeo
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.send_media_message(
    p_conversation_id UUID,
    p_media_path TEXT,
    p_media_mime TEXT,
    p_media_size BIGINT DEFAULT NULL,
    p_width INTEGER DEFAULT NULL,
    p_height INTEGER DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user UUID := auth.uid();
    v_sender RECORD;
    v_message_id UUID;
    v_tipo TEXT;
BEGIN
    IF v_user IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Faça login para enviar mídia.');
    END IF;

    IF NOT public.is_conversation_participant(p_conversation_id, v_user) THEN
        RETURN json_build_object('success', false, 'error', 'Você não participa desta conversa.');
    END IF;

    IF p_media_path IS NULL OR p_media_path = '' THEN
        RETURN json_build_object('success', false, 'error', 'Arquivo vazio.');
    END IF;

    IF NOT public.audio_path_is_participant(p_media_path, v_user) THEN
        RETURN json_build_object('success', false, 'error', 'Caminho de arquivo inválido.');
    END IF;

    IF p_media_mime LIKE 'image/%' THEN
        v_tipo := 'imagem';
    ELSIF p_media_mime LIKE 'video/%' THEN
        v_tipo := 'video';
    ELSE
        RETURN json_build_object('success', false, 'error', 'Formato não suportado.');
    END IF;

    -- O bucket já restringe, mas o limite é repetido aqui porque a
    -- function é SECURITY DEFINER e não passa pelas policies do storage.
    IF p_media_size IS NOT NULL AND p_media_size > 20971520 THEN
        RETURN json_build_object('success', false, 'error', 'O arquivo passa de 20 MB.');
    END IF;

    SELECT username, avatar_url INTO v_sender
    FROM public.profiles
    WHERE id = v_user;

    INSERT INTO public.messages (
        conversation_id, sender_id, sender_name, sender_avatar,
        content, message_type, media_path, media_mime,
        media_size, media_width, media_height, created_at
    )
    VALUES (
        p_conversation_id, v_user,
        COALESCE(v_sender.username, 'Membro'), v_sender.avatar_url,
        '', v_tipo, p_media_path, p_media_mime,
        p_media_size, p_width, p_height, now()
    )
    RETURNING id INTO v_message_id;

    RETURN json_build_object(
        'success', true,
        'message_id', v_message_id,
        'message_type', v_tipo,
        'media_path', p_media_path
    );
EXCEPTION
    WHEN others THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- -------------------------------------------------------------
-- 4. Releitura das mensagens com as colunas novas
-- -------------------------------------------------------------
-- A função do 12 já é nossa, então pode ser recriada com DROP. Sem
-- DROP, o PostgreSQL recusa: mudar a lista de retorno não é permitido
-- em CREATE OR REPLACE.
DROP FUNCTION IF EXISTS public.get_conversation_messages(UUID, INTEGER);

CREATE FUNCTION public.get_conversation_messages(
    p_conversation_id UUID,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    conversation_id UUID,
    sender_id UUID,
    sender_name TEXT,
    sender_avatar TEXT,
    content TEXT,
    created_at TIMESTAMPTZ,
    message_type TEXT,
    audio_path TEXT,
    audio_duration NUMERIC,
    media_path TEXT,
    media_mime TEXT,
    media_size BIGINT,
    media_width INTEGER,
    media_height INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Faça login para ler as conversas.';
    END IF;
    IF NOT public.is_conversation_participant(p_conversation_id, auth.uid()) THEN
        RAISE EXCEPTION 'Você não participa desta conversa.';
    END IF;

    RETURN QUERY
    SELECT m.id, m.conversation_id, m.sender_id, m.sender_name, m.sender_avatar,
           m.content, m.created_at,
           COALESCE(m.message_type, 'texto'), m.audio_path, m.audio_duration,
           m.media_path, m.media_mime, m.media_size, m.media_width, m.media_height
    FROM public.messages m
    WHERE m.conversation_id = p_conversation_id
    ORDER BY m.created_at ASC
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 100), 1), 300);
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_media_message(UUID, TEXT, TEXT, BIGINT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_conversation_messages(UUID, INTEGER) TO authenticated;

COMMENT ON FUNCTION public.send_media_message(UUID, TEXT, TEXT, BIGINT, INTEGER, INTEGER) IS 'Grava imagem ou video. O caminho precisa pertencer a mesma conversa.';
COMMENT ON FUNCTION public.get_conversation_messages(UUID, INTEGER) IS 'Lista mensagens (texto, audio, imagem e video) de uma conversa da qual o usuario participa.';

-- -------------------------------------------------------------
-- 5. Conferência
-- -------------------------------------------------------------
SELECT 'coluna' AS item, column_name AS nome
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'messages'
  AND column_name IN ('message_type', 'audio_path', 'audio_duration',
                      'media_path', 'media_mime', 'media_size',
                      'media_width', 'media_height')
UNION ALL
SELECT 'bucket', id::text FROM storage.buckets WHERE id IN ('chat-audio', 'chat-media')
UNION ALL
SELECT 'funcao', p.proname
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('get_conversation_messages', 'send_audio_message', 'send_media_message')
ORDER BY 1, 2;
