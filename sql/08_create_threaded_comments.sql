-- =============================================
-- 08_create_threaded_comments.sql
-- Comentários e respostas em cadeia usando a MESMA tabela public.comments
-- (parent_id). Este script não cria uma tabela separada.
-- Execute no Supabase SQL Editor
-- =============================================

-- parent_id já existe no banco atual; esta linha também cobre instalações novas.
ALTER TABLE public.comments
    ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_comments_post_visible_created
    ON public.comments(post_id, created_at, id)
    WHERE is_active = true AND status = 'approved';

CREATE INDEX IF NOT EXISTS idx_comments_parent_visible_created
    ON public.comments(parent_id, created_at, id)
    WHERE is_active = true AND status = 'approved';

-- Impede que uma resposta seja vinculada a um comentário de outra publicação.
CREATE OR REPLACE FUNCTION public.validate_comment_thread()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_parent_post_id UUID;
    v_parent_blog_slug TEXT;
    v_depth INTEGER := 0;
    v_has_cycle BOOLEAN := FALSE;
BEGIN
    IF NEW.parent_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF NEW.id IS NOT NULL AND NEW.parent_id = NEW.id THEN
        RAISE EXCEPTION 'Um comentário não pode responder a si mesmo.'
            USING ERRCODE = '23514';
    END IF;

    SELECT parent.post_id, parent.blog_slug
      INTO v_parent_post_id, v_parent_blog_slug
    FROM public.comments AS parent
    WHERE parent.id = NEW.parent_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Comentário pai não existe.'
            USING ERRCODE = '23503';
    END IF;

    IF NEW.post_id IS DISTINCT FROM v_parent_post_id
       OR NEW.blog_slug IS DISTINCT FROM v_parent_blog_slug THEN
        RAISE EXCEPTION 'O comentário pai pertence a outro conteúdo.'
            USING ERRCODE = '23514';
    END IF;

    WITH RECURSIVE ancestors AS (
        SELECT
            parent.id,
            parent.parent_id,
            1 AS depth,
            ARRAY[parent.id]::UUID[] AS path
        FROM public.comments AS parent
        WHERE parent.id = NEW.parent_id

        UNION ALL

        SELECT
            parent.id,
            parent.parent_id,
            ancestors.depth + 1,
            ancestors.path || parent.id
        FROM public.comments AS parent
        JOIN ancestors ON parent.id = ancestors.parent_id
        WHERE parent.id <> ALL(ancestors.path)
          AND ancestors.depth < 20
    )
    SELECT
        COALESCE(MAX(depth), 0),
        COALESCE(BOOL_OR(parent_id = ANY(path)), FALSE)
      INTO v_depth, v_has_cycle
    FROM ancestors;

    IF v_has_cycle THEN
        RAISE EXCEPTION 'Ciclo detectado na cadeia de comentários.'
            USING ERRCODE = '23514';
    END IF;

    IF v_depth > 10 THEN
        RAISE EXCEPTION 'Limite de 10 níveis de respostas atingido.'
            USING ERRCODE = '22023';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS comments_validate_thread ON public.comments;
CREATE TRIGGER comments_validate_thread
    BEFORE INSERT OR UPDATE OF parent_id, post_id, blog_slug
    ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_comment_thread();

-- Cria comentários e respostas com autor derivado da sessão autenticada.
CREATE OR REPLACE FUNCTION public.create_post_comment(
    p_post_id UUID,
    p_content TEXT,
    p_parent_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_content TEXT := btrim(COALESCE(p_content, ''));
    v_parent public.comments%ROWTYPE;
    v_depth INTEGER := 0;
    v_author_name TEXT;
    v_author_avatar TEXT;
    v_comment public.comments%ROWTYPE;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado.'
            USING ERRCODE = '42501';
    END IF;

    IF char_length(v_content) < 1 OR char_length(v_content) > 2000 THEN
        RAISE EXCEPTION 'O comentário deve ter entre 1 e 2000 caracteres.'
            USING ERRCODE = '22023';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.posts AS post
        WHERE post.id = p_post_id
          AND post.is_active = true
    ) THEN
        RAISE EXCEPTION 'Publicação não encontrada ou indisponível.'
            USING ERRCODE = '23503';
    END IF;

    IF p_parent_id IS NOT NULL THEN
        SELECT *
          INTO v_parent
        FROM public.comments AS parent
        WHERE parent.id = p_parent_id
          AND parent.post_id = p_post_id
          AND parent.blog_slug IS NULL
          AND parent.is_active = true
          AND parent.status = 'approved';

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Comentário pai inválido.'
                USING ERRCODE = '23503';
        END IF;

        WITH RECURSIVE ancestors AS (
            SELECT parent.id, parent.parent_id, 1 AS depth
            FROM public.comments AS parent
            WHERE parent.id = p_parent_id

            UNION ALL

            SELECT comment.id, comment.parent_id, ancestors.depth + 1
            FROM public.comments AS comment
            JOIN ancestors ON comment.id = ancestors.parent_id
        )
        SELECT COALESCE(MAX(depth), 0)
          INTO v_depth
        FROM ancestors;

        IF v_depth > 10 THEN
            RAISE EXCEPTION 'Limite de 10 níveis de respostas atingido.'
                USING ERRCODE = '22023';
        END IF;
    END IF;

    SELECT profile.username, profile.avatar_url
      INTO v_author_name, v_author_avatar
    FROM public.profiles AS profile
    WHERE profile.id = auth.uid();

    INSERT INTO public.comments (
        post_id,
        blog_slug,
        parent_id,
        author_id,
        author_name,
        author_avatar,
        content,
        status,
        is_active,
        likes
    )
    VALUES (
        p_post_id,
        NULL,
        p_parent_id,
        auth.uid(),
        COALESCE(v_author_name, 'Membro da comunidade'),
        v_author_avatar,
        v_content,
        'approved',
        true,
        0
    )
    RETURNING * INTO v_comment;

    -- A contagem é recalculada pela página de detalhe a partir dos comentários
    -- visíveis. Não alteramos posts aqui para não depender de permissões da tabela
    -- nem duplicar o contador de rotinas legadas.
    RETURN to_jsonb(v_comment);
END;
$$;

REVOKE ALL ON FUNCTION public.create_post_comment(UUID, TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_post_comment(UUID, TEXT, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_post_comment(UUID, TEXT, UUID) TO authenticated;

-- Atualiza o cache de schema do PostgREST sem exigir reiniciar o projeto.
NOTIFY pgrst, 'reload schema';
