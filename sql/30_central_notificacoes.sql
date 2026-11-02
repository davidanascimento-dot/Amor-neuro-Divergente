-- ============================================================================
-- 30_central_notificacoes.sql
-- Central Inteligente de Notificações da Lia — Amor NeuroDivergente
-- ============================================================================
-- NÃO duplica tabelas existentes. Cria apenas public.notifications.
-- Executar no Supabase SQL Editor. Idempotente.
-- ============================================================================

-- 1. TABELA PRINCIPAL
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('mensagens','eventos','artigos','grupos','publicacoes','social','sistema')),
    title TEXT NOT NULL,
    body TEXT,
    link TEXT,
    icon TEXT,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_name TEXT,
    actor_avatar TEXT,
    entity_type TEXT,
    entity_id TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT false,
    dedupe_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT notifications_dedupe_unique UNIQUE (user_id, dedupe_key)
);

-- Compatibilidade com bancos onde public.notifications já existia sem todas
-- as colunas novas. Adiciona o que falta sem apagar dados.
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS actor_name TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS actor_avatar TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS entity_type TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS entity_id TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS dedupe_key TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE public.notifications SET category = 'sistema' WHERE category IS NULL;
UPDATE public.notifications SET title = 'Notificação' WHERE title IS NULL;
UPDATE public.notifications SET metadata = '{}'::jsonb WHERE metadata IS NULL;
UPDATE public.notifications SET is_read = false WHERE is_read IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
    ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON public.notifications (user_id, is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE p text;
BEGIN
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='notifications' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications', p);
    END LOOP;
END $$;

CREATE POLICY notifications_select_own
    ON public.notifications FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY notifications_update_own
    ON public.notifications FOR UPDATE TO authenticated
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY notifications_delete_own
    ON public.notifications FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- 2. HELPER DE CRIAÇÃO (SECURITY DEFINER: navegador não insere diretamente)
CREATE OR REPLACE FUNCTION public.criar_notificacao(
    p_user_id UUID,
    p_category TEXT,
    p_title TEXT,
    p_body TEXT DEFAULT NULL,
    p_link TEXT DEFAULT NULL,
    p_dedupe_key TEXT DEFAULT NULL,
    p_actor_id UUID DEFAULT NULL,
    p_actor_name TEXT DEFAULT NULL,
    p_actor_avatar TEXT DEFAULT NULL,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_icon TEXT DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_user_id IS NULL OR p_title IS NULL OR btrim(p_title) = '' THEN RETURN; END IF;
    -- Não notificar o próprio autor.
    IF p_actor_id IS NOT NULL AND p_actor_id = p_user_id THEN RETURN; END IF;

    BEGIN
        INSERT INTO public.notifications (
            user_id, category, title, message, body, link, icon,
            actor_id, actor_name, actor_avatar, entity_type, entity_id, metadata, dedupe_key
        ) VALUES (
            p_user_id, p_category, p_title, COALESCE(p_title, p_body, ''), p_body, p_link, p_icon,
            p_actor_id, p_actor_name, p_actor_avatar, p_entity_type, p_entity_id, COALESCE(p_metadata, '{}'::jsonb), p_dedupe_key
        )
        ON CONFLICT (user_id, dedupe_key) DO UPDATE
            SET title = EXCLUDED.title,
                message = EXCLUDED.message,
                body = EXCLUDED.body,
                link = EXCLUDED.link,
                actor_id = EXCLUDED.actor_id,
                actor_name = EXCLUDED.actor_name,
                actor_avatar = EXCLUDED.actor_avatar,
                metadata = EXCLUDED.metadata,
                created_at = now(),
                is_read = false
            WHERE public.notifications.dedupe_key IS NOT NULL;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
END;
$$;

REVOKE ALL ON FUNCTION public.criar_notificacao(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,UUID,TEXT,TEXT,TEXT,TEXT,JSONB,TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.criar_notificacao(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,UUID,TEXT,TEXT,TEXT,TEXT,JSONB,TEXT) TO authenticated, service_role;

-- 3. TRIGGERS

-- 3.1 Mensagens privadas (somente conversas diretas)
CREATE OR REPLACE FUNCTION public.trg_notify_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_conv RECORD;
    v_sender_name TEXT;
    v_sender_avatar TEXT;
    v_preview TEXT;
    v_part RECORD;
BEGIN
    IF NEW.sender_id IS NULL THEN RETURN NEW; END IF;
    SELECT * INTO v_conv FROM public.conversations WHERE id = NEW.conversation_id;
    IF NOT FOUND OR v_conv.type = 'group' THEN RETURN NEW; END IF;

    SELECT username, avatar_url INTO v_sender_name, v_sender_avatar
      FROM public.profiles WHERE id = NEW.sender_id;

    v_preview := left(regexp_replace(COALESCE(NEW.content, ''), '\s+', ' ', 'g'), 90);

    BEGIN
        FOR v_part IN
            SELECT user_id FROM public.conversation_participants
             WHERE conversation_id = NEW.conversation_id AND user_id <> NEW.sender_id
        LOOP
            PERFORM public.criar_notificacao(
                v_part.user_id, 'mensagens',
                COALESCE(v_sender_name, 'Amigo') || ' enviou uma mensagem para você.',
                v_preview,
                '/comunidade/conversas.html?id=' || NEW.conversation_id::text,
                'msg:' || NEW.conversation_id::text,
                NEW.sender_id, v_sender_name, v_sender_avatar, 'conversation', NEW.conversation_id::text,
                jsonb_build_object('message_id', NEW.id)
            );
        END LOOP;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_message_insert ON public.messages;
CREATE TRIGGER notifications_message_insert
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.trg_notify_message();

-- 3.2 Amizades (solicitação e aceitação)
CREATE OR REPLACE FUNCTION public.trg_notify_friendship()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_requester_name TEXT; v_requester_avatar TEXT;
    v_receiver_name TEXT; v_receiver_avatar TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT username, avatar_url INTO v_requester_name, v_requester_avatar
          FROM public.profiles WHERE id = NEW.requester_id;
        PERFORM public.criar_notificacao(
            NEW.receiver_id, 'social',
            COALESCE(v_requester_name, 'Alguém') || ' quer ser seu amigo.',
            'Abra o perfil para aceitar ou recusar.',
            '/comunidade/perfil.html?id=' || NEW.requester_id::text,
            'friend-req:' || NEW.id::text,
            NEW.requester_id, v_requester_name, v_requester_avatar, 'friendship', NEW.id::text,
            jsonb_build_object('status', NEW.status)
        );
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
        SELECT username, avatar_url INTO v_receiver_name, v_receiver_avatar
          FROM public.profiles WHERE id = NEW.receiver_id;
        PERFORM public.criar_notificacao(
            NEW.requester_id, 'social',
            COALESCE(v_receiver_name, 'Amigo') || ' aceitou sua amizade.',
            'Agora vocês estão conectados.',
            '/comunidade/perfil.html?id=' || NEW.receiver_id::text,
            'friend-accept:' || NEW.id::text,
            NEW.receiver_id, v_receiver_name, v_receiver_avatar, 'friendship', NEW.id::text,
            jsonb_build_object('status', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_friendship_insert ON public.friendships;
CREATE TRIGGER notifications_friendship_insert
    AFTER INSERT ON public.friendships
    FOR EACH ROW EXECUTE FUNCTION public.trg_notify_friendship();

DROP TRIGGER IF EXISTS notifications_friendship_update ON public.friendships;
CREATE TRIGGER notifications_friendship_update
    AFTER UPDATE ON public.friendships
    FOR EACH ROW EXECUTE FUNCTION public.trg_notify_friendship();

-- 3.3 Publicações de amigos (post público ou de grupo)
CREATE OR REPLACE FUNCTION public.trg_notify_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_author_name TEXT; v_author_avatar TEXT; v_preview TEXT; v_rec RECORD;
BEGIN
    IF NEW.is_active IS NOT TRUE THEN RETURN NEW; END IF;

    SELECT username, avatar_url INTO v_author_name, v_author_avatar
      FROM public.profiles WHERE id = NEW.author_id;
    v_preview := left(regexp_replace(COALESCE(NEW.content, ''), '\s+', ' ', 'g'), 120);

    IF NEW.group_id IS NOT NULL THEN
        FOR v_rec IN
            SELECT user_id FROM public.group_members
             WHERE group_id = NEW.group_id AND user_id <> NEW.author_id
        LOOP
            PERFORM public.criar_notificacao(
                v_rec.user_id, 'publicacoes',
                COALESCE(v_author_name, 'Amigo') || ' publicou no grupo.',
                v_preview,
                '/comunidade/post.html?id=' || NEW.id::text,
                'post-group:' || NEW.id::text,
                NEW.author_id, v_author_name, v_author_avatar, 'post', NEW.id::text,
                jsonb_build_object('group_id', NEW.group_id)
            );
        END LOOP;
        RETURN NEW;
    END IF;

    FOR v_rec IN
        SELECT CASE WHEN requester_id = NEW.author_id THEN receiver_id ELSE requester_id END AS amigo_id
          FROM public.friendships
         WHERE status = 'accepted'
           AND (requester_id = NEW.author_id OR receiver_id = NEW.author_id)
    LOOP
        PERFORM public.criar_notificacao(
            v_rec.amigo_id, 'publicacoes',
            COALESCE(v_author_name, 'Amigo') || ' compartilhou uma novidade.',
            v_preview,
            '/comunidade/post.html?id=' || NEW.id::text,
            'friend-post:' || NEW.author_id::text || ':' || date_trunc('day', now())::date::text,
            NEW.author_id, v_author_name, v_author_avatar, 'post', NEW.id::text,
            jsonb_build_object('post_id', NEW.id)
        );
    END LOOP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_post_insert ON public.posts;
CREATE TRIGGER notifications_post_insert
    AFTER INSERT ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.trg_notify_post();

-- 3.4 Comentários e respostas
CREATE OR REPLACE FUNCTION public.trg_notify_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_post_author UUID;
    v_author_name TEXT; v_author_avatar TEXT;
    v_preview TEXT;
    v_recipient UUID;
BEGIN
    IF NEW.is_active IS NOT TRUE THEN RETURN NEW; END IF;
    IF NEW.status IS NOT NULL AND NEW.status <> 'approved' THEN RETURN NEW; END IF;

    SELECT username, avatar_url INTO v_author_name, v_author_avatar
      FROM public.profiles WHERE id = NEW.author_id;
    v_preview := left(regexp_replace(COALESCE(NEW.content, ''), '\s+', ' ', 'g'), 100);

    -- Resposta: notifica o autor do comentário pai.
    IF NEW.parent_id IS NOT NULL THEN
        SELECT author_id INTO v_recipient FROM public.comments WHERE id = NEW.parent_id;
        IF v_recipient IS NOT NULL AND v_recipient <> NEW.author_id THEN
            PERFORM public.criar_notificacao(
                v_recipient, 'social',
                COALESCE(v_author_name, 'Alguém') || ' respondeu seu comentário.',
                v_preview,
                '/comunidade/post.html?id=' || COALESCE(NEW.post_id::text, ''),
                'reply:' || NEW.post_id::text || ':' || v_recipient::text,
                NEW.author_id, v_author_name, v_author_avatar, 'comment', NEW.id::text,
                jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id)
            );
        END IF;
    END IF;

    -- Comentário novo: notifica o autor do post (se for post da comunidade).
    IF NEW.post_id IS NOT NULL THEN
        SELECT author_id INTO v_post_author FROM public.posts WHERE id = NEW.post_id;
        IF v_post_author IS NOT NULL AND v_post_author <> NEW.author_id THEN
            PERFORM public.criar_notificacao(
                v_post_author, 'social',
                COALESCE(v_author_name, 'Alguém') || ' comentou sua publicação.',
                v_preview,
                '/comunidade/post.html?id=' || NEW.post_id::text,
                'comment:' || NEW.post_id::text || ':' || v_post_author::text,
                NEW.author_id, v_author_name, v_author_avatar, 'post', NEW.post_id::text,
                jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id)
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_comment_insert ON public.comments;
CREATE TRIGGER notifications_comment_insert
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.trg_notify_comment();

-- 3.5 Curtidas (agregadas por post)
CREATE OR REPLACE FUNCTION public.trg_notify_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_post_author UUID; v_actor_name TEXT; v_actor_avatar TEXT;
BEGIN
    SELECT author_id INTO v_post_author FROM public.posts WHERE id = NEW.post_id;
    IF v_post_author IS NULL OR v_post_author = NEW.user_id THEN RETURN NEW; END IF;

    SELECT username, avatar_url INTO v_actor_name, v_actor_avatar
      FROM public.profiles WHERE id = NEW.user_id;

    PERFORM public.criar_notificacao(
        v_post_author, 'social',
        COALESCE(v_actor_name, 'Alguém') || ' curtiu sua publicação.',
        'A interação foi registrada no seu post.',
        '/comunidade/post.html?id=' || NEW.post_id::text,
        'like:' || NEW.post_id::text || ':' || v_post_author::text,
        NEW.user_id, v_actor_name, v_actor_avatar, 'post', NEW.post_id::text,
        jsonb_build_object('like_id', NEW.id)
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_like_insert ON public.likes;
CREATE TRIGGER notifications_like_insert
    AFTER INSERT ON public.likes
    FOR EACH ROW EXECUTE FUNCTION public.trg_notify_like();

-- 3.6 Eventos novos e atualizados
CREATE OR REPLACE FUNCTION public.trg_notify_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_rec RECORD;
BEGIN
    IF NEW.is_active IS NOT TRUE THEN RETURN NEW; END IF;

    IF TG_OP = 'INSERT' THEN
        FOR v_rec IN
            SELECT id FROM public.profiles WHERE COALESCE(is_active, true) = true AND id <> COALESCE(NEW.created_by, '00000000-0000-0000-0000-000000000000'::uuid)
        LOOP
            PERFORM public.criar_notificacao(
                v_rec.id, 'eventos',
                'Novo evento: ' || NEW.title,
                COALESCE(NEW.description, '') || ' · ' || to_char(NEW.date, 'DD/MM/YYYY HH24:MI'),
                '/comunidade/comunidade.html#eventos',
                'event:' || NEW.id::text,
                NEW.created_by, NULL, NEW.image_url, 'event', NEW.id::text,
                jsonb_build_object('date', NEW.date, 'image', NEW.image_url)
            );
        END LOOP;
        RETURN NEW;
    END IF;

    -- Atualização importante: notifica inscritos.
    IF TG_OP = 'UPDATE' AND (
        NEW.title IS DISTINCT FROM OLD.title OR
        NEW.date IS DISTINCT FROM OLD.date OR
        NEW.link IS DISTINCT FROM OLD.link OR
        NEW.is_active IS DISTINCT FROM OLD.is_active
    ) THEN
        FOR v_rec IN
            SELECT user_id FROM public.event_participants WHERE event_id = NEW.id
        LOOP
            IF v_rec.user_id = COALESCE(NEW.created_by, '00000000-0000-0000-0000-000000000000'::uuid) THEN CONTINUE; END IF;
            PERFORM public.criar_notificacao(
                v_rec.user_id, 'eventos',
                'Evento atualizado: ' || NEW.title,
                'Houve uma alteração importante no evento em que você está inscrito.',
                '/comunidade/comunidade.html#eventos',
                'event-update:' || NEW.id::text,
                NEW.created_by, NULL, NEW.image_url, 'event', NEW.id::text,
                jsonb_build_object('date', NEW.date)
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_event_insert ON public.events;
CREATE TRIGGER notifications_event_insert
    AFTER INSERT ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.trg_notify_event();

DROP TRIGGER IF EXISTS notifications_event_update ON public.events;
CREATE TRIGGER notifications_event_update
    AFTER UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.trg_notify_event();

-- 3.7 Artigos publicados
CREATE OR REPLACE FUNCTION public.trg_notify_article()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_rec RECORD;
BEGIN
    IF NEW.is_active IS NOT TRUE THEN RETURN NEW; END IF;
    IF NEW.status <> 'publicado' THEN RETURN NEW; END IF;
    IF TG_OP = 'UPDATE' AND OLD.status = 'publicado' THEN RETURN NEW; END IF;

    FOR v_rec IN
        SELECT id FROM public.profiles WHERE COALESCE(is_active, true) = true AND id <> COALESCE(NEW.author_id, '00000000-0000-0000-0000-000000000000'::uuid)
    LOOP
        PERFORM public.criar_notificacao(
            v_rec.id, 'artigos',
            'Novo artigo: ' || NEW.title,
            COALESCE(NEW.author_name, 'Comunidade') || ' · ' || NEW.category,
            '/comunidade/artigo.html?id=' || NEW.id::text,
            'article:' || NEW.id::text,
            NEW.author_id, NEW.author_name, NEW.author_avatar, 'article', NEW.id::text,
            jsonb_build_object('cover', NEW.cover_url, 'category', NEW.category)
        );
    END LOOP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_article_insert ON public.articles;
CREATE TRIGGER notifications_article_insert
    AFTER INSERT ON public.articles
    FOR EACH ROW EXECUTE FUNCTION public.trg_notify_article();

DROP TRIGGER IF EXISTS notifications_article_update ON public.articles;
CREATE TRIGGER notifications_article_update
    AFTER UPDATE ON public.articles
    FOR EACH ROW EXECUTE FUNCTION public.trg_notify_article();

-- 4. RECOMENDAÇÕES DE GRUPOS (ocasionais, 1/semana por usuário)
CREATE OR REPLACE FUNCTION public.recomendar_grupos(p_limit INT DEFAULT 1)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid UUID := auth.uid();
    v_count INT := 0;
    v_group RECORD;
BEGIN
    IF v_uid IS NULL THEN RETURN 0; END IF;

    -- No máximo uma recomendação por semana.
    IF EXISTS (
        SELECT 1 FROM public.notifications
         WHERE user_id = v_uid AND category = 'grupos'
           AND created_at > now() - interval '7 days'
    ) THEN
        RETURN 0;
    END IF;

    FOR v_group IN
        SELECT g.id, g.name, g.description, g.avatar_url, g.image_url, g.members
          FROM public.groups g
         WHERE COALESCE(g.banned, false) = false
           AND COALESCE(g.is_private, false) = false
           AND g.created_by IS DISTINCT FROM v_uid
           AND NOT EXISTS (
               SELECT 1 FROM public.group_members gm
                WHERE gm.group_id = g.id AND gm.user_id = v_uid
           )
         ORDER BY COALESCE(g.members, 0) DESC, g.created_at DESC
         LIMIT p_limit
    LOOP
        PERFORM public.criar_notificacao(
            v_uid, 'grupos',
            'Que tal conhecer o grupo ' || v_group.name || '?',
            COALESCE(v_group.description, 'Um novo grupo para você explorar.'),
            '/comunidade/explorar-grupos.html',
            'group-rec:' || v_group.id::text,
            NULL, v_group.name, COALESCE(v_group.avatar_url, v_group.image_url), 'group', v_group.id::text,
            jsonb_build_object('members', v_group.members, 'avatar', COALESCE(v_group.avatar_url, v_group.image_url))
        );
        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.recomendar_grupos(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.recomendar_grupos(INT) TO authenticated, service_role;

-- 5. AVISOS DO SISTEMA (somente admin)
CREATE OR REPLACE FUNCTION public.enviar_aviso_sistema(
    p_title TEXT,
    p_body TEXT DEFAULT NULL,
    p_link TEXT DEFAULT NULL,
    p_dedupe_key TEXT DEFAULT NULL
) RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INT := 0;
    v_uid UUID;
BEGIN
    IF NOT public.e_admin() THEN
        RAISE EXCEPTION 'Apenas administradores podem enviar avisos.';
    END IF;

    FOR v_uid IN
        SELECT id FROM public.profiles WHERE is_active IS NOT FALSE
    LOOP
        PERFORM public.criar_notificacao(
            v_uid, 'sistema', p_title, p_body, p_link,
            COALESCE(p_dedupe_key, 'system:' || md5(p_title || coalesce(p_body,''))),
            NULL, 'Amor NeuroDivergente', NULL, 'system', NULL,
            jsonb_build_object('official', true)
        );
        v_count := v_count + 1;
    END LOOP;
    RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.enviar_aviso_sistema(TEXT,TEXT,TEXT,TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.enviar_aviso_sistema(TEXT,TEXT,TEXT,TEXT) TO authenticated, service_role;

-- 6. REALTIME
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

-- 7. CONFERÊNCIA
SELECT 'notificacoes_configuradas' AS status, count(*) AS total
  FROM public.notifications;

NOTIFY pgrst, 'reload schema';