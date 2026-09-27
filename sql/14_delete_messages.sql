-- =============================================================
-- 14_delete_messages.sql
-- Apagar a PROPRIA mensagem, nos 15 minutos seguintes ao envio.
--
-- Quem apaga: so o autor, e so na janela. Dono e admin NAO apagam
-- mensagem de outra pessoa por aqui. Se alguem precisa tirar algo do
-- ar, isso e moderacao e passa por outro caminho.
--
-- Decisao: apagamento LOGICO, nao DELETE fisico. A linha continua
-- existindo com deleted_at preenchido. Tres motivos:
--   1. Moderacao precisa de rastro. "Quem apagou o que, e quando?"
--      e a primeira pergunta de qualquer auditoria.
--   2. Se a linha sumisse, a conversa perderia a ordem de criacao e
--      as mensagens ao redor poderiam reordenar.
--   3. O conteudo e limpo (content='', audio_path=NULL, media_path=NULL),
--      entao nao sobra o texto nem o arquivo acessivel.
--
-- Execute APOS o 13. Idempotente.
-- Depois: Settings -> API -> Reload schema (ou esperar ~1 min).
-- =============================================================

-- -------------------------------------------------------------
-- 1. Colunas
-- -------------------------------------------------------------
ALTER TABLE public.messages
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_messages_deleted
    ON public.messages (conversation_id, deleted_at)
    WHERE deleted_at IS NOT NULL;

-- -------------------------------------------------------------
-- 2. Quem pode apagar
-- -------------------------------------------------------------
-- Somente o autor, e somente dentro de 15 minutos. Deliberadamente
-- NAO ha caminho para apagar mensagem de outra pessoa: nem dono da
-- comunidade, nem admin, nem moderacao. Apagar o que outra pessoa
-- escreveu e uma decisao de moderacao, e nao um botao de chat.
CREATE OR REPLACE FUNCTION public.can_delete_message(
    p_message_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_msg RECORD;
BEGIN
    IF p_user_id IS NULL OR p_message_id IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT m.id, m.sender_id, m.created_at, m.deleted_at
    INTO v_msg
    FROM public.messages m
    WHERE m.id = p_message_id;

    IF v_msg.id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Ja apagada: nao apaga de novo.
    IF v_msg.deleted_at IS NOT NULL THEN
        RETURN FALSE;
    END IF;

    -- So o autor.
    IF v_msg.sender_id IS DISTINCT FROM p_user_id THEN
        RETURN FALSE;
    END IF;

    -- E so na janela.
    RETURN (now() - v_msg.created_at) <= interval '15 minutes';
END;
$$;

-- -------------------------------------------------------------
-- 3. Apagar
-- -------------------------------------------------------------
-- Nao apaga o arquivo do storage: o client faz isso depois. Deixar
-- orfao no bucket e melhor do que derrubar a acao inteira se o
-- DELETE do arquivo falhar.
CREATE OR REPLACE FUNCTION public.delete_message(p_message_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user UUID := auth.uid();
    v_msg RECORD;
BEGIN
    IF v_user IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Faça login para apagar mensagens.');
    END IF;

    IF NOT public.can_delete_message(p_message_id, v_user) THEN
        RETURN json_build_object('success', false, 'error', 'Você só pode apagar sua própria mensagem, nos 15 minutos após enviá-la.');
    END IF;

    -- Guarda o caminho para o client limpar o arquivo do storage.
    UPDATE public.messages
    SET deleted_at = now(),
        deleted_by = v_user,
        content = '',
        audio_path = NULL,
        audio_duration = NULL,
        media_path = NULL,
        media_mime = NULL,
        media_size = NULL,
        media_width = NULL,
        media_height = NULL
    WHERE id = p_message_id
    RETURNING * INTO v_msg;

    IF v_msg.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Mensagem não encontrada.');
    END IF;

    RETURN json_build_object(
        'success', true,
        'message_id', v_msg.id,
        'was_mine', v_msg.sender_id = v_user
    );
EXCEPTION
    WHEN others THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.can_delete_message(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_message(UUID) TO authenticated;

COMMENT ON FUNCTION public.delete_message(UUID) IS 'Apaga a propria mensagem, de forma logica, dentro de 15 minutos do envio.';
COMMENT ON FUNCTION public.can_delete_message(UUID, UUID) IS 'Diz se o usuario pode apagar a mensagem. So o autor, e so na janela.';

-- -------------------------------------------------------------
-- 4. Releitura com as colunas novas
-- -------------------------------------------------------------
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
    media_height INTEGER,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID
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
           m.media_path, m.media_mime, m.media_size, m.media_width, m.media_height,
           m.deleted_at, m.deleted_by
    FROM public.messages m
    WHERE m.conversation_id = p_conversation_id
    ORDER BY m.created_at ASC
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 100), 1), 300);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_conversation_messages(UUID, INTEGER) TO authenticated;

-- -------------------------------------------------------------
-- 5. Conferencia
-- -------------------------------------------------------------
SELECT 'coluna' AS item, column_name AS nome
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'messages'
  AND column_name IN ('deleted_at', 'deleted_by')
UNION ALL
SELECT 'funcao', p.proname
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('can_delete_message', 'delete_message')
ORDER BY 1, 2;
