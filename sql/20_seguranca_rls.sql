-- ============================================================================
-- 20_seguranca_rls.sql
-- ============================================================================
-- Fecha os buracos que a auditoria de entrega encontrou testando o projeto
-- com a chave anonima (a que vai no navegador).
--
-- COMO RODAR: cole no SQL Editor do Supabase e execute. Pode rodar mais de
-- uma vez — todas as regras usam IF EXISTS / IF NOT EXISTS.
--
-- ANTES DE RODAR, vale saber:
--   1. Este script so mexe em POLITICA. Nao apaga dado nenhum.
--   2. O script DICA as politicas das tabelas listadas antes de criar as
--      novas. Politicas no Postgres se somam com OU: se eu apenas criasse
--      regras novas, as permissivas antigas continuariam valendo. Por isso
--      o DROP de todas as politicas de cada tabela primeiro.
--   3. Se alguma regra apertar demais, o sintoma e o app cair para o
--      fallback e mostrar estado vazio. Isso e sinal de que a regra
--      precisa ser afrouxada — nao de que o dado sumiu.
--   4. A secao 5 (conversas) e a mais delicada. Se a tela "Minhas conversas"
--      ficar vazia, e a secao 5 que esta apertada demais.
--   5. O script guarda as politicas antigas em comments no proprio banco
--      (secao 9), entao da para inspecionar depois o que existia.
--
-- O QUE ESTAVA ABERTO (medido com a anon key, nao moderado):
--   - 13 conversas legiveis sem conta, incluindo uma PRIVADA
--   - codigos de group_invites legiveis sem conta
--   - logs de moderacao legiveis (dizem quem denunciou o que)
--   - atendimentos e mensagens do SAC legiveis
--   - account_deletion_log legivel
--   - admin_get_products devolvia 13 produtos para a anon key
--   - get_moderation_logs devolvia registros para a anon key
--   - INSERT em posts passava pelo RLS (so falhava por chave estrangeira)
-- ============================================================================


-- ============================================================================
-- 1. FUNCOES AUXILIARES
-- ============================================================================
-- SECURITY DEFINER para conseguir ler as tabelas de participacao sem cair
-- na propria politica que este script esta criando (senao vira laco).

CREATE OR REPLACE FUNCTION public.e_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT COALESCE(
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
        false
    );
$$;

COMMENT ON FUNCTION public.e_admin() IS
    'true quando o usuario logado tem is_admin.';


CREATE OR REPLACE FUNCTION public.e_participa_da_conversa(p_conversa uuid, p_user uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = p_conversa
          AND cp.user_id = p_user
    );
$$;

COMMENT ON FUNCTION public.e_participa_da_conversa(uuid, uuid) IS
    'Verifica se o usuario participa de uma conversa especifica.';


-- ============================================================================
-- 2. TABELAS QUE SO DEVEM ABRIR PARA QUEM ESTA LOGADO
-- ============================================================================
-- Politicas se somam com OU. Por isso: derruba TODAS as politicas da
-- tabela e recria so a regra desejada. As antigas ficam salvas no comment
-- da secao 9.

DO $$
DECLARE
    t     text;
    mapa  text;
    regras text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'group_invites',
        'group_members',
        'atendimentos',
        'mensagens',
        'account_deletion_log',
        'moderation_logs',
        'attack_logs',
        'saved_posts',
        'reactions',
        'friendships',
        'follows'
    ]
    LOOP
        -- guarda o texto das politicas atuais antes de derrubar
        SELECT string_agg(policyname || ' :: ' || cmd || ' :: ' || coalesce(roles::text, ''), E'\n      ')
          INTO mapa
          FROM pg_policies
         WHERE schemaname = 'public' AND tablename = t;

        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

        FOR regras IN
            SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = t
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', regras, t);
        END LOOP;

        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)',
            t || '_leitura_logada', t);

        IF t IN ('moderation_logs', 'atendimentos', 'mensagens', 'attack_logs',
                 'account_deletion_log') THEN
            -- estas sao de administracao: leitura so para admin
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_leitura_logada', t);
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR ALL TO authenticated '
                'USING (public.e_admin()) WITH CHECK (public.e_admin())',
                t || '_so_admin', t);
        END IF;

        -- proprio dono pode mexer no que e dele.
        -- ATENCAO: cada tabela nomeia o dono de um jeito.
        --   saved_posts / reactions -> user_id
        --   friendships            -> requester_id e receiver_id (nao tem user_id)
        --   follows                -> follower_id   (nao tem user_id)
        IF t IN ('saved_posts', 'reactions') THEN
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)',
                t || '_insere_proprio', t);
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (auth.uid() = user_id)',
                t || '_remove_proprio', t);
        END IF;

        IF t = 'friendships' THEN
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated '
                'USING (requester_id = auth.uid() OR receiver_id = auth.uid())',
                'friendships_so_as_duas_partes', t);
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated '
                'WITH CHECK (requester_id = auth.uid())',
                'friendships_solicitante_insere', t);
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated '
                'USING (requester_id = auth.uid() OR receiver_id = auth.uid())',
                'friendships_as_duas_partes_atualiza', t);
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated '
                'USING (requester_id = auth.uid() OR receiver_id = auth.uid())',
                'friendships_as_duas_partes_remove', t);
        END IF;

        IF t = 'follows' THEN
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated '
                'WITH CHECK (follower_id = auth.uid())',
                'follows_insere_proprio', t);
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated '
                'USING (follower_id = auth.uid())',
                'follows_remove_proprio', t);
        END IF;

        IF t = 'group_members' THEN
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)',
                'group_members_insere_proprio', t);
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (auth.uid() = user_id)',
                'group_members_remove_proprio', t);
        END IF;

        IF t = 'group_invites' THEN
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR ALL TO authenticated '
                'USING (public.e_admin() OR created_by = auth.uid()) '
                'WITH CHECK (public.e_admin() OR created_by = auth.uid())',
                'group_invites_dono_ou_admin', t);
        END IF;

        EXECUTE format(
            'COMMENT ON POLICY %I ON public.%I IS %L',
            (SELECT policyname FROM pg_policies
              WHERE schemaname = 'public' AND tablename = t LIMIT 1), t,
            'POLITICAS ANTERIORES DESTA TABELA (derrubadas por 20_seguranca_rls.sql):' ||
            E'\n      ' || coalesce(mapa, '(nenhuma)'));
    END LOOP;
END $$;


-- ============================================================================
-- 3. CONVERSAS: SO QUEM PARTICIPA
-- ============================================================================

DO $$
DECLARE
    t      text;
    regras text;
    mapa   text;
BEGIN
    FOREACH t IN ARRAY ARRAY['conversations', 'conversation_participants', 'messages']
    LOOP
        SELECT string_agg(policyname || ' :: ' || cmd || ' :: ' || coalesce(roles::text, ''), E'\n      ')
          INTO mapa
          FROM pg_policies
         WHERE schemaname = 'public' AND tablename = t;

        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

        FOR regras IN
            SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = t
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', regras, t);
        END LOOP;

        EXECUTE format(
            'COMMENT ON TABLE public.%I IS %L', t,
            'POLITICAS ANTERIORES (derrubadas por 20_seguranca_rls.sql):' ||
            E'\n      ' || coalesce(mapa, '(nenhuma)'));
    END LOOP;
END $$;

-- conversas
CREATE POLICY conversa_participante_le
    ON public.conversations
    FOR SELECT TO authenticated
    USING (public.e_participa_da_conversa(id, auth.uid()));

CREATE POLICY conversa_criador_insere
    ON public.conversations
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY conversa_criador_edita
    ON public.conversations
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY conversa_criador_remove
    ON public.conversations
    FOR DELETE TO authenticated
    USING (created_by = auth.uid());

-- participacao: voce ve a sua, e quem divide a mesma conversa
CREATE POLICY participante_le
    ON public.conversation_participants
    FOR SELECT TO authenticated
    USING (user_id = auth.uid()
           OR public.e_participa_da_conversa(conversation_id, auth.uid()));

CREATE POLICY participante_insere_proprio
    ON public.conversation_participants
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY participante_remove_proprio
    ON public.conversation_participants
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- mensagens: so da conversa da qual voce participa
CREATE POLICY mensagem_le_da_minha_conversa
    ON public.messages
    FOR SELECT TO authenticated
    USING (public.e_participa_da_conversa(conversation_id, auth.uid()));

CREATE POLICY mensagem_insere_na_minha_conversa
    ON public.messages
    FOR INSERT TO authenticated
    WITH CHECK (public.e_participa_da_conversa(conversation_id, auth.uid())
               AND sender_id = auth.uid());

COMMENT ON POLICY mensagem_insere_na_minha_conversa ON public.messages IS
    'A coluna de autor em messages e sender_id, nao author_id (confirmado em comunidade.js e no select=* do banco).';

COMMENT ON POLICY conversa_participante_le ON public.conversations IS
    'Antes, a anon key lia as 13 conversas, incluindo uma privada.';


-- ============================================================================
-- 4. POSTS: O INSERT ANONIMO PASSAVA PELO RLS
-- ============================================================================
-- Medido: INSERT com a anon key devolveu 23503 (chave estrangeira) e nao
-- 42501 (politica). O RLS deixava passar; o banco barrou so no final.
-- Bastava informar um UUID valido para escrever no feed da comunidade.

DO $$
DECLARE
    t      text;
    regras text;
    mapa   text;
BEGIN
    FOREACH t IN ARRAY ARRAY['posts']
    LOOP
        SELECT string_agg(policyname || ' :: ' || cmd || ' :: ' || coalesce(roles::text, ''), E'\n      ')
          INTO mapa
          FROM pg_policies
         WHERE schemaname = 'public' AND tablename = t;

        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

        FOR regras IN
            SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = t
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', regras, t);
        END LOOP;

        EXECUTE format(
            'COMMENT ON TABLE public.%I IS %L', t,
            'POLITICAS ANTERIORES (derrubadas por 20_seguranca_rls.sql):' ||
            E'\n      ' || coalesce(mapa, '(nenhuma)'));
    END LOOP;
END $$;

-- leitura publica continua: e o que o visitante sem conta ve
CREATE POLICY post_leitura_publica
    ON public.posts
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY post_autor_insere
    ON public.posts
    FOR INSERT TO authenticated
    WITH CHECK (author_id = auth.uid());

CREATE POLICY post_autor_edita
    ON public.posts
    FOR UPDATE TO authenticated
    USING (author_id = auth.uid() OR public.e_admin())
    WITH CHECK (author_id = auth.uid());

CREATE POLICY post_autor_remove
    ON public.posts
    FOR DELETE TO authenticated
    USING (author_id = auth.uid() OR public.e_admin());

COMMENT ON POLICY post_autor_insere ON public.posts IS
    'Exige author_id = usuario logado. Antes, anon inseria com qualquer UUID valido.';


-- ============================================================================
-- 5. RPCs ADMINISTRATIVAS: TIRAR O EXECUTE DO anon
-- ============================================================================
-- Medido: admin_get_products e get_moderation_logs respondiam HTTP 200
-- para a anon key.

DO $$
DECLARE
    f     text;
    existe boolean;
BEGIN
    FOREACH f IN ARRAY ARRAY[
        'admin_get_products',
        'admin_create_product',
        'admin_update_product',
        'admin_delete_product',
        'admin_get_groups',
        'admin_create_group',
        'admin_update_group',
        'admin_delete_group',
        'admin_toggle_ban_group',
        'get_moderation_logs',
        'create_moderation_log',
        'update_moderation_status',
        'log_attack_simple',
        'admin-events-sync',
        'admin-products-changes',
        'groups-admin-changes',
        'moderation-admin-changes',
        'moderation-changes-community'
    ]
    LOOP
        SELECT p.proname IS NOT NULL INTO existe
          FROM pg_proc p
          JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname = 'public' AND p.proname = f;

        IF existe THEN
            EXECUTE format('REVOKE ALL ON FUNCTION public.%I FROM anon', f);
            EXECUTE format('REVOKE ALL ON FUNCTION public.%I FROM public', f);
            EXECUTE format(
                'GRANT EXECUTE ON FUNCTION public.%I TO authenticated, service_role', f);
            RAISE NOTICE 'revisada: %', f;
        ELSE
            RAISE NOTICE 'nao existe, ignorada: %', f;
        END IF;
    END LOOP;
END $$;


-- ============================================================================
-- 6. COMO CONFERIR QUE FUNCIONOU
-- ============================================================================
--   -- deve retornar 0 linhas (antes devolvia 13, uma delas privada)
--   SELECT count(*) FROM conversations;
--
--   -- deve falhar com 42501 (antes gravava)
--   INSERT INTO posts (content, author_id) VALUES ('teste', gen_random_uuid());
--
--   -- deve falhar com 42501 (antes devolvia 13 produtos)
--   SELECT * FROM admin_get_products();
--
--   -- deve falhar (antes devolvia 2 registros com nome de quem denunciou)
--   SELECT * FROM get_moderation_logs();
--
--   -- deve continuar funcionando: e o que o visitante sem conta ve
--   SELECT count(*) FROM posts;
--   SELECT count(*) FROM profiles;
--
-- Para ver as politicas todas:
--   SELECT tablename, policyname, cmd, roles
--   FROM pg_policies WHERE schemaname = 'public'
--   ORDER BY tablename, policyname;
--
-- Para ver as politicas antigas que foram derrubadas:
--   SELECT relname, obj_description(c.oid) FROM pg_class c
--    JOIN pg_namespace n ON n.oid = c.relnamespace
--   WHERE n.nspname = 'public' AND relname IN
--     ('conversations','conversation_participants','messages','posts');
-- ============================================================================