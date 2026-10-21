-- ============================================================================
-- 28_artigos.sql
-- ============================================================================
-- O SISTEMA DE ARTIGOS DA COMUNIDADE
--
-- O QUE ISTO CRIA
--   1. A tabela `articles` — o artigo escrito pela pessoa.
--   2. A tabela `article_likes` — quem curtiu.
--   3. A tabela `article_comments` — a conversa em volta do artigo.
--   4. Um contador de leituras (`increment_article_views`).
--   5. As políticas de RLS das três tabelas.
--
-- COMO RODAR: cole no SQL Editor do Supabase e execute. É idempotente:
-- pode rodar mais de uma vez sem erro.
--
-- POR QUE UMA TABELA NOVA E NÃO A COLUNA `post_kind`
-- A auditoria (AUDITORIA-EXPLORAR-BLOG-COMUNIDADE.md) recomendou reusar a
-- tabela `posts` e marcar o tipo dela. Isso foi feito para a FASE 2 (filtrar
-- relato x post de fórum), onde a diferença é mínima: o mesmo texto curto,
-- a mesma página, o mesmo comentário.
--
-- Um ARTIGO é outra coisa. Ele tem título, subtítulo, capa, seção, aviso de
-- conteúdo sensível, tempo de leitura e tipografia própria — a página de
-- leitura não é a página de post. Forçar isso dentro de `posts` significaria
-- encher a tabela do Fórum de colunas que o Fórum não usa, e um CHECK em
-- `post_kind` que aceitaria três valores em vez de dois.
--
-- Então: `posts` continua sendo o Fórum (mensagem curta, conversa rápida).
-- `articles` é a publicação (texto longo, lida com calma, com autor, capa
-- e conversa). As duas se cruzam por link, não por tabela — que é o que a
-- auditoria pediu ("uma ponte", não uma fusão).
--
-- POR QUE NÃO APAGAR NADA
-- Este arquivo só cria. Nenhuma tabela existente é alterada, nenhuma coluna
-- é removida, nenhum dado é reclassificado. O Fórum continua funcionando
-- exatamente como estava, mesmo que este arquivo nunca seja rodado.
--
-- ============================================================================


-- ============================================================================
-- 1. A TABELA DOS ARTIGOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.articles (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Quem escreveu. `author_id` é o id do auth.users; o nome e o avatar são
    -- uma cópia do momento da publicação, para o card continuar legível se o
    -- perfil mudar depois (mesma lógica que `posts.author_name`).
    author_id       uuid,
    author_name     text,
    author_avatar   text,

    -- O texto. O título é obrigatório e o corpo tem um mínimo: um artigo de
    -- duas linhas não é artigo, é post — e post tem o Fórum.
    title           text NOT NULL,
    subtitle        text,
    content         text NOT NULL,

    -- Classificação.
    --   category  -> a SEÇÃO (aparece em maiúsculas no topo do card)
    --   kind      -> o TIPO (Relato, História, Guia, Análise)
    --   template  -> o MODELO de layout da página de leitura
    --   style     -> o ESTILO tipográfico do corpo
    category        text NOT NULL DEFAULT 'Relatos',
    kind            text NOT NULL DEFAULT 'Relato',
    template        text NOT NULL DEFAULT 'padrao',
    style           text NOT NULL DEFAULT 'serifada',

    -- Capa e aviso.
    cover_url       text,
    sensitive       boolean NOT NULL DEFAULT false,
    warning         text,

    -- Sinalizadores que o card mostra.
    is_paid         boolean NOT NULL DEFAULT false,
    priority        integer,

    -- Estado.
    --   status = 'rascunho'  -> só o autor enxerga
    --   status = 'publicado' -> todo mundo enxerga
    status          text NOT NULL DEFAULT 'publicado',
    is_active       boolean NOT NULL DEFAULT true,

    -- Contadores.
    likes           integer NOT NULL DEFAULT 0,
    comment_count   integer NOT NULL DEFAULT 0,
    views           integer NOT NULL DEFAULT 0,
    read_minutes    integer NOT NULL DEFAULT 1,

    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT articles_status_check
        CHECK (status IN ('rascunho', 'publicado')),
    CONSTRAINT articles_kind_check
        CHECK (kind IN ('Relato', 'História', 'Guia', 'Análise')),
    CONSTRAINT articles_title_check
        CHECK (char_length(btrim(title)) BETWEEN 3 AND 140),
    CONSTRAINT articles_content_check
        CHECK (char_length(btrim(content)) >= 50),
    CONSTRAINT articles_priority_check
        CHECK (priority IS NULL OR (priority >= 0 AND priority <= 10))
);

COMMENT ON TABLE public.articles IS
    'Artigos escritos pela comunidade. Diferente de `posts` (que e o Forum: '
    'mensagem curta), aqui tem titulo, subtitulo, capa, secao, tipo, aviso de '
    'conteudo sensivel e tempo de leitura.';

-- A listagem: só publicados, mais recentes primeiro. É a consulta que toda
-- página que mostra artigo faz.
CREATE INDEX IF NOT EXISTS articles_publicados_criado_idx
    ON public.articles (created_at DESC)
    WHERE is_active AND status = 'publicado';

-- O filtro por seção, quando a pessoa está olhando uma seção só.
CREATE INDEX IF NOT EXISTS articles_categoria_criado_idx
    ON public.articles (category, created_at DESC)
    WHERE is_active AND status = 'publicado';

-- O painel do autor: "meus artigos".
CREATE INDEX IF NOT EXISTS articles_autor_criado_idx
    ON public.articles (author_id, created_at DESC);


-- ============================================================================
-- 2. AS CURTIDAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.article_likes (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id  uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  timestamptz NOT NULL DEFAULT now(),

    -- Uma curtida por pessoa por artigo. É o que impede o contador de
    -- inflar com cliques repetidos.
    CONSTRAINT article_likes_unico UNIQUE (article_id, user_id)
);

CREATE INDEX IF NOT EXISTS article_likes_article_idx
    ON public.article_likes (article_id);


-- ============================================================================
-- 3. OS COMENTÁRIOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.article_comments (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id    uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    author_id     uuid,
    author_name   text,
    author_avatar text,
    content       text NOT NULL,
    status        text NOT NULL DEFAULT 'approved',
    is_active     boolean NOT NULL DEFAULT true,
    likes         integer NOT NULL DEFAULT 0,
    created_at    timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT article_comments_content_check
        CHECK (char_length(btrim(content)) BETWEEN 1 AND 2000),
    CONSTRAINT article_comments_status_check
        CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS article_comments_article_criado_idx
    ON public.article_comments (article_id, created_at DESC)
    WHERE is_active AND status = 'approved';


-- ============================================================================
-- 4. O CONTADOR DE LEITURAS
-- ============================================================================
-- Incrementar com `views = views + 1` a partir do navegador tem um problema:
-- duas pessoas abrem o artigo ao mesmo tempo, as duas leem o valor antigo e
-- uma escrita se perde. A função resolve isso: o incremento acontece no
-- banco, em uma operação só.

CREATE OR REPLACE FUNCTION public.increment_article_views(p_article_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    novo integer;
BEGIN
    UPDATE public.articles
       SET views = views + 1
     WHERE id = p_article_id
    RETURNING views INTO novo;

    RETURN COALESCE(novo, 0);
END;
$$;

-- Quem pode chamar: qualquer pessoa que consiga abrir a página. O número de
-- leituras é público e não exige login — do contrário, o visitante sem
-- conta não contaria, e a métrica valeria menos que o real.
GRANT EXECUTE ON FUNCTION public.increment_article_views(uuid) TO anon, authenticated;


-- ============================================================================
-- 5. SEGURANÇA (RLS)
-- ============================================================================
-- Regras, em uma frase cada:
--   - Todo mundo lê artigo publicado. Inclusive quem não tem conta.
--   - Só quem escreveu publica.
--   - Só quem escreveu (ou o admin) edita e apaga.
--   - Rascunho é privado: só o autor enxerga o próprio rascunho.

ALTER TABLE public.articles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_likes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;

-- As políticas são derrumbadas antes de recriadas, para este arquivo poder
-- ser rodado quantas vezes for.
DO $$
DECLARE
    t text;
    regras text;
BEGIN
    FOREACH t IN ARRAY ARRAY['articles', 'article_likes', 'article_comments']
    LOOP
        FOR regras IN
            SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = t
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', regras, t);
        END LOOP;
    END LOOP;
END $$;


-- --- ARTICLES ---------------------------------------------------------------

CREATE POLICY articles_leitura_publica
    ON public.articles
    FOR SELECT
    TO anon, authenticated
    USING (
        is_active
        AND status = 'publicado'
    );

-- O autor enxerga o próprio rascunho. Sem isto, "Salvar rascunho" salvaria
-- um texto que ninguém — nem quem escreveu — conseguiria abrir.
CREATE POLICY articles_autor_le_rascunho
    ON public.articles
    FOR SELECT
    TO authenticated
    USING (
        author_id = auth.uid()
        AND status = 'rascunho'
    );

CREATE POLICY articles_autor_insere
    ON public.articles
    FOR INSERT
    TO authenticated
    WITH CHECK (author_id = auth.uid());

CREATE POLICY articles_autor_edita
    ON public.articles
    FOR UPDATE
    TO authenticated
    USING (author_id = auth.uid())
    WITH CHECK (author_id = auth.uid());

CREATE POLICY articles_autor_remove
    ON public.articles
    FOR DELETE
    TO authenticated
    USING (author_id = auth.uid());

COMMENT ON POLICY articles_leitura_publica ON public.articles IS
    'Leitura publica: artigo publicado e ativo, por qualquer pessoa.';
COMMENT ON POLICY articles_autor_edita ON public.articles IS
    'Somente o autor edita. O admin precisa de uma politica a parte se um dia '
    'precisar moderar — ate la, artigo de ninguem e de ninguem.';


-- --- ARTICLE_LIKES ----------------------------------------------------------

CREATE POLICY article_likes_leitura
    ON public.article_likes
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY article_likes_insere
    ON public.article_likes
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY article_likes_remove
    ON public.article_likes
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());


-- --- ARTICLE_COMMENTS -------------------------------------------------------

CREATE POLICY article_comments_leitura
    ON public.article_comments
    FOR SELECT
    TO anon, authenticated
    USING (is_active AND status = 'approved');

CREATE POLICY article_comments_insere
    ON public.article_comments
    FOR INSERT
    TO authenticated
    WITH CHECK (author_id = auth.uid());

CREATE POLICY article_comments_autor_edita
    ON public.article_comments
    FOR UPDATE
    TO authenticated
    USING (author_id = auth.uid())
    WITH CHECK (author_id = auth.uid());

CREATE POLICY article_comments_autor_remove
    ON public.article_comments
    FOR DELETE
    TO authenticated
    USING (author_id = auth.uid());


-- ============================================================================
-- 6. SEGURANÇA DO ADMINISTRADOR
-- ============================================================================
-- A função `e_admin()` já existe no banco (criada por 20_seguranca_rls.sql).
-- Se ela não estiver lá — banco novo, por exemplo — este arquivo não pode
-- falhar por causa dela. Por isso a checagem é feita antes.

DO $$
BEGIN
    IF to_regprocedure('public.e_admin()') IS NOT NULL THEN
        EXECUTE 'DROP POLICY IF EXISTS articles_admin_edita ON public.articles';
        EXECUTE 'DROP POLICY IF EXISTS articles_admin_remove ON public.articles';
        EXECUTE 'DROP POLICY IF EXISTS article_comments_admin_remove ON public.article_comments';

        EXECUTE '
            CREATE POLICY articles_admin_edita ON public.articles
                FOR UPDATE TO authenticated
                USING (public.e_admin())
                WITH CHECK (public.e_admin())';

        EXECUTE '
            CREATE POLICY articles_admin_remove ON public.articles
                FOR DELETE TO authenticated
                USING (public.e_admin())';

        EXECUTE '
            CREATE POLICY article_comments_admin_remove ON public.article_comments
                FOR DELETE TO authenticated
                USING (public.e_admin())';
    END IF;
END $$;


-- ============================================================================
-- 7. REALTIME
-- ============================================================================
-- Para o contador de curtidas e a conversa se atualizarem sozinhos enquanto a
-- pessoa está lendo. É opcional: se a tabela já estiver no publication,
-- o comando abaixo não faz nada.

DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.article_comments;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;


-- ============================================================================
-- 8. CONFERENCIA
-- ============================================================================
-- Depois de rodar, isto deve mostrar 3 tabelas:
--
--   article_comments | article_likes | articles
--
-- E as políticas de `articles` devem ser 5 (leitura pública, leitura de
-- rascunho, insere, edita, remove) — 7 se o `e_admin()` existir.

SELECT tablename, policyname, cmd
  FROM pg_policies
 WHERE schemaname = 'public'
   AND tablename IN ('articles', 'article_likes', 'article_comments')
 ORDER BY tablename, policyname;

SELECT count(*) AS artigos_publicados
  FROM public.articles
 WHERE is_active AND status = 'publicado';
