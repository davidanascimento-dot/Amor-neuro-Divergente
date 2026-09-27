-- =============================================================
-- 12_audio_messages.sql
-- Mensagens de áudio nas conversas (privadas e de comunidade).
--
-- O áudio é conteúdo privado de uma conversa, então o bucket é FECHADO e
-- o acesso passa por participante. Bucket público entregaria qualquer
-- mensagem de voz para quem tivesse o link.
--
-- Execute no SQL Editor do Supabase. Idempotente: pode rodar quantas vezes.
-- Depois: Settings → API → Reload schema (ou esperar ~1 min).
-- =============================================================

-- -------------------------------------------------------------
-- 1. Colunas da mensagem
-- -------------------------------------------------------------
ALTER TABLE public.messages
    ADD COLUMN IF NOT EXISTS message_type TEXT NOT NULL DEFAULT 'texto',
    ADD COLUMN IF NOT EXISTS audio_path TEXT,
    ADD COLUMN IF NOT EXISTS audio_duration NUMERIC;

-- Trava o tipo: sem isso, 'texto' e 'audio' viram livre-forma e o cliente
-- precisa adivinhar o que é cada coisa.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'messages_message_type_check'
    ) THEN
        ALTER TABLE public.messages
            ADD CONSTRAINT messages_message_type_check
            CHECK (message_type IN ('texto', 'audio'));
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'CHECK de message_type nao criado: %', SQLERRM;
END $$;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
    ON public.messages (conversation_id, created_at DESC);

-- -------------------------------------------------------------
-- 2. Quem pode acessar a conversa
-- -------------------------------------------------------------
-- conversation_participants é a fonte de verdade tanto para conversa
-- direta quanto para comunidade: as duas inserem a pessoa lá.
CREATE OR REPLACE FUNCTION public.is_conversation_participant(
    p_conversation_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_user_id IS NULL OR p_conversation_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1
        FROM public.conversation_participants
        WHERE conversation_id = p_conversation_id
          AND user_id = p_user_id
    );
END;
$$;

-- O caminho do arquivo é {conversa}/{remetente}/{arquivo}. Esta função
-- evita fazer cast de texto para uuid direto na policy, porque um caminho
-- inválido derrubaria a query com erro em vez de simplesmente negar acesso.
CREATE OR REPLACE FUNCTION public.audio_path_is_participant(
    p_path TEXT,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    partes TEXT[];
BEGIN
    IF p_user_id IS NULL OR p_path IS NULL THEN
        RETURN FALSE;
    END IF;

    partes := string_to_array(p_path, '/');
    IF array_length(partes, 1) < 1 OR partes[1] IS NULL THEN
        RETURN FALSE;
    END IF;
    IF partes[1] !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
        RETURN FALSE;
    END IF;

    RETURN public.is_conversation_participant(partes[1]::uuid, p_user_id);
END;
$$;

-- -------------------------------------------------------------
-- 3. Bucket fechado para o áudio
-- -------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chat-audio',
    'chat-audio',
    false,
    10485760,   -- 10 MB: ~5 minutos de áudio comprimido
    ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/m4a']
        ::text[]
)
ON CONFLICT (id) DO UPDATE
SET file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types,
    public = EXCLUDED.public;

DROP POLICY IF EXISTS "Audio legivel por participante" ON storage.objects;
CREATE POLICY "Audio legivel por participante"
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'chat-audio'
        AND public.audio_path_is_participant(name, auth.uid())
    );

DROP POLICY IF EXISTS "Audio gravado pelo dono na conversa" ON storage.objects;
CREATE POLICY "Audio gravado pelo dono na conversa"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'chat-audio'
        AND public.audio_path_is_participant(name, auth.uid())
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Audio removido pelo dono" ON storage.objects;
CREATE POLICY "Audio removido pelo dono"
    ON storage.objects FOR DELETE TO authenticated
    USING (
        bucket_id = 'chat-audio'
        AND public.audio_path_is_participant(name, auth.uid())
    );

-- -------------------------------------------------------------
-- 4. Ler mensagens (traz texto e áudio)
-- -------------------------------------------------------------
-- Função nova em vez de mexer em get_messages: a definição atual não está
-- no repositório, então CREATE OR REPLACE poderia quebrar a assinatura.
-- Esta devolve as colunas explicitamente, incluindo as de áudio.
CREATE OR REPLACE FUNCTION public.get_conversation_messages(
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
    audio_duration NUMERIC
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
           COALESCE(m.message_type, 'texto'), m.audio_path, m.audio_duration
    FROM public.messages m
    WHERE m.conversation_id = p_conversation_id
    ORDER BY m.created_at ASC
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 100), 1), 300);
END;
$$;

-- -------------------------------------------------------------
-- 5. Enviar áudio
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.send_audio_message(
    p_conversation_id UUID,
    p_audio_path TEXT,
    p_duration NUMERIC DEFAULT NULL
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
BEGIN
    IF v_user IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Faça login para enviar áudio.');
    END IF;

    IF NOT public.is_conversation_participant(p_conversation_id, v_user) THEN
        RETURN json_build_object('success', false, 'error', 'Você não participa desta conversa.');
    END IF;

    IF p_audio_path IS NULL OR p_audio_path = '' THEN
        RETURN json_build_object('success', false, 'error', 'Áudio vazio.');
    END IF;

    IF NOT public.audio_path_is_participant(p_audio_path, v_user) THEN
        RETURN json_build_object('success', false, 'error', 'Caminho de áudio inválido.');
    END IF;

    SELECT username, avatar_url INTO v_sender
    FROM public.profiles
    WHERE id = v_user;

    INSERT INTO public.messages (
        conversation_id, sender_id, sender_name, sender_avatar,
        content, message_type, audio_path, audio_duration, created_at
    )
    VALUES (
        p_conversation_id, v_user,
        COALESCE(v_sender.username, 'Membro'), v_sender.avatar_url,
        '', 'audio', p_audio_path, p_duration, now()
    )
    RETURNING id INTO v_message_id;

    RETURN json_build_object(
        'success', true,
        'message_id', v_message_id,
        'audio_path', p_audio_path,
        'audio_duration', p_duration
    );
EXCEPTION
    WHEN others THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_conversation_participant(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.audio_path_is_participant(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_conversation_messages(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_audio_message(UUID, TEXT, NUMERIC) TO authenticated;

COMMENT ON FUNCTION public.get_conversation_messages(UUID, INTEGER) IS 'Lista mensagens (texto e áudio) de uma conversa da qual o usuário participa.';
COMMENT ON FUNCTION public.send_audio_message(UUID, TEXT, NUMERIC) IS 'Grava uma mensagem de áudio. O caminho precisa pertencer à mesma conversa.';

-- -------------------------------------------------------------
-- 6. Conferência
-- -------------------------------------------------------------
SELECT 'coluna' AS item, column_name AS nome
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'messages'
  AND column_name IN ('message_type', 'audio_path', 'audio_duration')
UNION ALL
SELECT 'bucket', id::text FROM storage.buckets WHERE id = 'chat-audio'
UNION ALL
SELECT 'funcao', p.proname
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('is_conversation_participant', 'audio_path_is_participant',
                    'get_conversation_messages', 'send_audio_message')
ORDER BY 1, 2;
