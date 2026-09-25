-- =============================================================
-- 09_groups_public_flow.sql
-- Grupos públicos/privados, edição, imagens e listagem "Meus grupos"
-- Execute no SQL Editor do Supabase após as migrações anteriores.
-- Depois de executar, recarregue o schema da API em Settings → API
-- caso o projeto não detecte imediatamente as novas funções.
-- =============================================================

-- 1. Campos de identidade da comunidade.
-- image_url continua sendo o campo legado e permanece compatível.
ALTER TABLE public.groups
    ADD COLUMN IF NOT EXISTS banner_url TEXT,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT;

UPDATE public.groups
SET banner_url = image_url
WHERE banner_url IS NULL
  AND image_url IS NOT NULL
  AND image_url <> '/img/grupo-padrao.png';

CREATE INDEX IF NOT EXISTS idx_groups_public_created
    ON public.groups (is_private, banned, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_members_user
    ON public.group_members (user_id, group_id);

-- Publicações de grupo ficam separadas do feed público.
ALTER TABLE public.posts
    ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_posts_group_id
    ON public.posts (group_id, created_at DESC);

-- 2. Helpers de autorização usados pelas políticas ( SECURITY DEFINER ).
CREATE OR REPLACE FUNCTION public.is_group_moderator(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(p.is_admin, false) OR COALESCE(p.is_moderator, false)
    FROM public.profiles p
    WHERE p.id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.group_members gm
        WHERE gm.group_id = p_group_id
          AND gm.user_id = p_user_id
    );
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.groups g
        WHERE g.id = p_group_id
          AND (
              g.created_by = p_user_id
              OR EXISTS (
                  SELECT 1
                  FROM public.group_members gm
                  WHERE gm.group_id = p_group_id
                    AND gm.user_id = p_user_id
                    AND COALESCE(gm.is_admin, false)
              )
          )
    );
$$;

CREATE OR REPLACE FUNCTION public.can_view_group(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.groups g
        WHERE g.id = p_group_id
          AND COALESCE(g.banned, false) = false
          AND (
              COALESCE(g.is_private, false) = false
              OR g.created_by = p_user_id
              OR public.is_group_member(g.id, p_user_id)
          )
    );
$$;

-- 3. RLS: remove políticas permissivas antigas e mantém privados
-- visíveis apenas para membros/criador/moderadores.
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'groups'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.groups', policy_record.policyname);
    END LOOP;
END $$;

CREATE POLICY "Groups accessible by visibility or membership"
    ON public.groups FOR SELECT
    USING (
        public.can_view_group(id, auth.uid())
        OR public.is_group_moderator(auth.uid())
    );

CREATE POLICY "Groups can be created by authenticated owner"
    ON public.groups FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid() OR public.is_group_moderator(auth.uid()));

CREATE POLICY "Groups can be edited by owner or admin"
    ON public.groups FOR UPDATE TO authenticated
    USING (public.is_group_admin(id, auth.uid()) OR public.is_group_moderator(auth.uid()))
    WITH CHECK (public.is_group_admin(id, auth.uid()) OR public.is_group_moderator(auth.uid()));

CREATE POLICY "Groups can be deleted by owner or moderator"
    ON public.groups FOR DELETE TO authenticated
    USING (created_by = auth.uid() OR public.is_group_moderator(auth.uid()));

-- Evita listar convites de grupos privados para qualquer visitante.
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'group_invites'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.group_invites', policy_record.policyname);
    END LOOP;
END $$;

CREATE POLICY "Group invites visible to group members"
    ON public.group_invites FOR SELECT TO authenticated
    USING (
        created_by = auth.uid()
        OR public.is_group_member(group_id, auth.uid())
        OR public.is_group_moderator(auth.uid())
    );

CREATE POLICY "Group invites created by group admins"
    ON public.group_invites FOR INSERT TO authenticated
    WITH CHECK (
        created_by = auth.uid()
        AND public.is_group_admin(group_id, auth.uid())
    );

CREATE POLICY "Group invites updated by group admins"
    ON public.group_invites FOR UPDATE TO authenticated
    USING (public.is_group_admin(group_id, auth.uid()))
    WITH CHECK (public.is_group_admin(group_id, auth.uid()));

CREATE POLICY "Group invites deleted by group admins"
    ON public.group_invites FOR DELETE TO authenticated
    USING (public.is_group_admin(group_id, auth.uid()));

-- A lista de membros também não pode ser enumerada anonimamente.
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'group_members'
          AND cmd = 'SELECT'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.group_members', policy_record.policyname);
    END LOOP;
END $$;

CREATE POLICY "Group members visible to members"
    ON public.group_members FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR public.can_view_group(group_id, auth.uid())
        OR public.is_group_moderator(auth.uid())
    );

-- 4. Bucket público para as imagens da comunidade.
-- O bucket é público para que os cards e banners possam ser exibidos
-- diretamente. Em uma etapa posterior, grupos privados podem usar
-- URLs assinadas em um bucket separado.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'group-images',
    'group-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Group image public read" ON storage.objects;
CREATE POLICY "Group image public read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'group-images');

DROP POLICY IF EXISTS "Group image authenticated upload" ON storage.objects;
CREATE POLICY "Group image authenticated upload"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'group-images'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = 'groups'
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Group image owner update" ON storage.objects;
CREATE POLICY "Group image owner update"
    ON storage.objects FOR UPDATE TO authenticated
    USING (
        bucket_id = 'group-images'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = 'groups'
        AND (storage.foldername(name))[2] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'group-images'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = 'groups'
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Group image owner delete" ON storage.objects;
CREATE POLICY "Group image owner delete"
    ON storage.objects FOR DELETE TO authenticated
    USING (
        bucket_id = 'group-images'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = 'groups'
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

-- 3. Lists used by the public groups page.
CREATE OR REPLACE FUNCTION public.get_public_groups()
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    category TEXT,
    members INTEGER,
    is_admin BOOLEAN,
    is_private BOOLEAN,
    image_url TEXT,
    banner_url TEXT,
    avatar_url TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    status TEXT,
    banned BOOLEAN,
    is_member BOOLEAN,
    is_owner BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        g.id,
        g.name,
        g.description,
        g.category,
        COALESCE(g.members, 0)::INTEGER,
        COALESCE(g.is_admin, false),
        COALESCE(g.is_private, false),
        g.image_url,
        COALESCE(g.banner_url, g.image_url),
        g.avatar_url,
        g.created_by,
        g.created_at,
        g.updated_at,
        COALESCE(g.status, 'ativo'),
        COALESCE(g.banned, false),
        (
            g.created_by = auth.uid()
            OR EXISTS (
                SELECT 1
                FROM public.group_members gm
                WHERE gm.group_id = g.id AND gm.user_id = auth.uid()
            )
            OR g.name = 'Geral'
        ),
        (g.created_by IS NOT NULL AND g.created_by = auth.uid())
    FROM public.groups g
    WHERE COALESCE(g.is_private, false) = false
      AND COALESCE(g.banned, false) = false
      AND LOWER(COALESCE(g.status, 'ativo')) = 'ativo'
    ORDER BY g.created_at DESC NULLS LAST;
$$;

CREATE OR REPLACE FUNCTION public.get_my_groups()
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    category TEXT,
    members INTEGER,
    is_admin BOOLEAN,
    is_private BOOLEAN,
    image_url TEXT,
    banner_url TEXT,
    avatar_url TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    status TEXT,
    banned BOOLEAN,
    is_member BOOLEAN,
    is_owner BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        g.id,
        g.name,
        g.description,
        g.category,
        COALESCE(g.members, 0)::INTEGER,
        COALESCE(g.is_admin, false)
            OR EXISTS (
                SELECT 1 FROM public.group_members gm
                WHERE gm.group_id = g.id AND gm.user_id = auth.uid() AND COALESCE(gm.is_admin, false)
            ),
        COALESCE(g.is_private, false),
        g.image_url,
        COALESCE(g.banner_url, g.image_url),
        g.avatar_url,
        g.created_by,
        g.created_at,
        g.updated_at,
        COALESCE(g.status, 'ativo'),
        COALESCE(g.banned, false),
        true,
        (g.created_by IS NOT NULL AND g.created_by = auth.uid())
    FROM public.groups g
    WHERE auth.uid() IS NOT NULL
      AND COALESCE(g.banned, false) = false
      AND (
          g.created_by = auth.uid()
          OR EXISTS (
              SELECT 1
              FROM public.group_members gm
              WHERE gm.group_id = g.id AND gm.user_id = auth.uid()
          )
      )
    ORDER BY g.created_at DESC NULLS LAST;
$$;

CREATE OR REPLACE FUNCTION public.get_group_for_user(p_group_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    category TEXT,
    members INTEGER,
    is_admin BOOLEAN,
    is_private BOOLEAN,
    image_url TEXT,
    banner_url TEXT,
    avatar_url TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    status TEXT,
    banned BOOLEAN,
    is_member BOOLEAN,
    is_owner BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        g.id,
        g.name,
        g.description,
        g.category,
        COALESCE(g.members, 0)::INTEGER,
        COALESCE(g.is_admin, false)
            OR EXISTS (
                SELECT 1 FROM public.group_members gm
                WHERE gm.group_id = g.id AND gm.user_id = auth.uid() AND COALESCE(gm.is_admin, false)
            ),
        COALESCE(g.is_private, false),
        g.image_url,
        COALESCE(g.banner_url, g.image_url),
        g.avatar_url,
        g.created_by,
        g.created_at,
        g.updated_at,
        COALESCE(g.status, 'ativo'),
        COALESCE(g.banned, false),
        (
            g.created_by = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.group_members gm
                WHERE gm.group_id = g.id AND gm.user_id = auth.uid()
            )
            OR g.name = 'Geral'
        ),
        (g.created_by IS NOT NULL AND g.created_by = auth.uid())
    FROM public.groups g
    WHERE g.id = p_group_id
      AND COALESCE(g.banned, false) = false
      AND (
          COALESCE(g.is_private, false) = false
          OR g.created_by = auth.uid()
          OR EXISTS (
              SELECT 1 FROM public.group_members gm
              WHERE gm.group_id = g.id AND gm.user_id = auth.uid()
          )
      );
END;
$$;

-- 4. Feed exclusivo do grupo.
CREATE OR REPLACE FUNCTION public.get_group_posts(
    p_group_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    author_id UUID,
    author_name TEXT,
    author_avatar TEXT,
    content TEXT,
    tag TEXT,
    likes INTEGER,
    created_at TIMESTAMPTZ,
    video_url TEXT,
    is_active BOOLEAN,
    comment_count INTEGER,
    group_id UUID
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.can_view_group(p_group_id, auth.uid()) THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        p.id,
        p.author_id,
        p.author_name,
        p.author_avatar,
        p.content,
        p.tag,
        COALESCE(p.likes, 0)::INTEGER,
        p.created_at,
        p.video_url,
        COALESCE(p.is_active, true),
        COALESCE(p.comment_count, 0)::INTEGER,
        p.group_id
    FROM public.posts p
    WHERE p.group_id = p_group_id
      AND COALESCE(p.is_active, true) = true
    ORDER BY p.created_at DESC NULLS LAST
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100)
    OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$$;

-- 5. Criação atômica: grupo + conversa + participante + membro admin.
CREATE OR REPLACE FUNCTION public.create_group(
    p_name TEXT,
    p_description TEXT DEFAULT NULL,
    p_category TEXT DEFAULT 'geral',
    p_is_private BOOLEAN DEFAULT false,
    p_banner_url TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user UUID := auth.uid();
    v_group_id UUID := gen_random_uuid();
    v_name TEXT := trim(COALESCE(p_name, ''));
    v_description TEXT := COALESCE(NULLIF(trim(COALESCE(p_description, '')), ''), 'Uma comunidade para trocar experiências e apoio.');
    v_category TEXT := lower(trim(COALESCE(p_category, 'geral')));
    v_private BOOLEAN := COALESCE(p_is_private, false);
    v_now TIMESTAMPTZ := now();
    v_invite_code TEXT;
BEGIN
    IF v_user IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Faça login para criar uma comunidade.');
    END IF;
    IF length(v_name) < 2 OR length(v_name) > 50 THEN
        RETURN json_build_object('success', false, 'error', 'Informe um nome com entre 2 e 50 caracteres.');
    END IF;

    INSERT INTO public.groups (
        id, name, description, category, members, is_admin, is_private,
        image_url, banner_url, avatar_url, created_by, created_at, updated_at,
        status, banned
    ) VALUES (
        v_group_id, v_name, v_description, v_category, 1, true, v_private,
        p_banner_url, p_banner_url, p_avatar_url, v_user, v_now, v_now,
        'ativo', false
    );

    INSERT INTO public.conversations (id, name, type, created_by, created_at)
    VALUES (v_group_id, v_name, 'group', v_user, v_now)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.group_members (group_id, user_id, joined_at, is_admin)
    VALUES (v_group_id, v_user, v_now, true);

    INSERT INTO public.conversation_participants (conversation_id, user_id, joined_at)
    VALUES (v_group_id, v_user, v_now)
    ON CONFLICT DO NOTHING;

    IF v_private THEN
        LOOP
            v_invite_code := lpad(floor(random() * 100000)::text, 5, '0');
            EXIT WHEN NOT EXISTS (
                SELECT 1 FROM public.group_invites
                WHERE code = v_invite_code AND active = true
            );
        END LOOP;

        INSERT INTO public.group_invites (
            group_id, code, created_by, active, created_at, expires_at
        ) VALUES (
            v_group_id, v_invite_code, v_user, true, v_now, v_now + interval '7 days'
        );
    END IF;

    RETURN json_build_object(
        'success', true,
        'group_id', v_group_id,
        'name', v_name,
        'is_private', v_private,
        'is_owner', true,
        'invite_code', v_invite_code
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 5. Edição somente pelo criador ou por um administrador do grupo.
CREATE OR REPLACE FUNCTION public.update_group(
    p_group_id UUID,
    p_name TEXT,
    p_description TEXT DEFAULT NULL,
    p_category TEXT DEFAULT 'geral',
    p_is_private BOOLEAN DEFAULT false,
    p_banner_url TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_group RECORD;
    v_name TEXT := trim(COALESCE(p_name, ''));
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Faça login para editar a comunidade.');
    END IF;
    IF length(v_name) < 2 OR length(v_name) > 50 THEN
        RETURN json_build_object('success', false, 'error', 'Informe um nome com entre 2 e 50 caracteres.');
    END IF;

    SELECT g.* INTO v_group
    FROM public.groups g
    WHERE g.id = p_group_id
      AND COALESCE(g.banned, false) = false;

    IF v_group.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Comunidade não encontrada.');
    END IF;

    IF v_group.created_by <> auth.uid()
       AND NOT EXISTS (
           SELECT 1
           FROM public.group_members gm
           WHERE gm.group_id = p_group_id
             AND gm.user_id = auth.uid()
             AND COALESCE(gm.is_admin, false)
       ) THEN
        RETURN json_build_object('success', false, 'error', 'Você não pode editar esta comunidade.');
    END IF;

    UPDATE public.groups
    SET name = v_name,
        description = COALESCE(NULLIF(trim(COALESCE(p_description, '')), ''), v_group.description),
        category = lower(trim(COALESCE(p_category, 'geral'))),
        is_private = COALESCE(p_is_private, false),
        banner_url = p_banner_url,
        image_url = p_banner_url,
        avatar_url = p_avatar_url,
        updated_at = now()
    WHERE id = p_group_id;

    RETURN json_build_object('success', true, 'group_id', p_group_id, 'name', v_name);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 6. Entrada e saída com auth.uid() no servidor.
CREATE OR REPLACE FUNCTION public.join_group(p_group_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_group RECORD;
    v_user UUID := auth.uid();
    v_count INTEGER;
BEGIN
    IF v_user IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Faça login para entrar na comunidade.');
    END IF;

    SELECT * INTO v_group FROM public.groups
    WHERE id = p_group_id AND COALESCE(banned, false) = false;

    IF v_group.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Comunidade não encontrada.');
    END IF;
    IF COALESCE(v_group.is_private, false) THEN
        RETURN json_build_object('success', false, 'error', 'Use um código de convite para entrar nesta comunidade.');
    END IF;
    IF EXISTS (SELECT 1 FROM public.group_members WHERE group_id = p_group_id AND user_id = v_user) THEN
        RETURN json_build_object('success', true, 'already_member', true, 'group_name', v_group.name);
    END IF;

    INSERT INTO public.group_members (group_id, user_id, joined_at, is_admin)
    VALUES (p_group_id, v_user, now(), false);

    INSERT INTO public.conversations (id, name, type, created_by, created_at)
    VALUES (p_group_id, v_group.name, 'group', v_group.created_by, now())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.conversation_participants (conversation_id, user_id, joined_at)
    VALUES (p_group_id, v_user, now())
    ON CONFLICT DO NOTHING;

    SELECT count(*)::INTEGER INTO v_count FROM public.group_members WHERE group_id = p_group_id;
    UPDATE public.groups SET members = v_count, updated_at = now() WHERE id = p_group_id;

    RETURN json_build_object('success', true, 'group_name', v_group.name);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION public.leave_group(p_group_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_group RECORD;
    v_user UUID := auth.uid();
    v_count INTEGER;
BEGIN
    IF v_user IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Faça login para sair da comunidade.');
    END IF;

    SELECT * INTO v_group FROM public.groups WHERE id = p_group_id;
    IF v_group.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Comunidade não encontrada.');
    END IF;
    IF v_group.name = 'Geral' OR v_group.created_by = v_user THEN
        RETURN json_build_object('success', false, 'error', 'O criador ou a comunidade Geral não pode ser removido.');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.group_members WHERE group_id = p_group_id AND user_id = v_user) THEN
        RETURN json_build_object('success', true, 'already_left', true);
    END IF;

    DELETE FROM public.group_members WHERE group_id = p_group_id AND user_id = v_user;
    DELETE FROM public.conversation_participants WHERE conversation_id = p_group_id AND user_id = v_user;

    SELECT count(*)::INTEGER INTO v_count FROM public.group_members WHERE group_id = p_group_id;
    UPDATE public.groups SET members = v_count, updated_at = now() WHERE id = p_group_id;

    RETURN json_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 7. Convites privados sem expor a tabela inteira para anônimos.
-- A tabela pode ter colunas legadas diferentes; esta função usa o
-- contrato atual (active/expires_at) e deve ser executada no mesmo banco
-- que já possui group_invites.
CREATE OR REPLACE FUNCTION public.redeem_group_invite(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invite RECORD;
    v_user UUID := auth.uid();
    v_count INTEGER;
BEGIN
    IF v_user IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Faça login para usar um convite.');
    END IF;

    SELECT gi.group_id, gi.code, g.name AS group_name
    INTO v_invite
    FROM public.group_invites gi
    JOIN public.groups g ON g.id = gi.group_id
    WHERE gi.code = trim(COALESCE(p_code, ''))
      AND gi.active = true
      AND gi.expires_at > now()
      AND COALESCE(g.banned, false) = false;

    IF v_invite.group_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Código inválido ou expirado.');
    END IF;
    IF EXISTS (SELECT 1 FROM public.group_members WHERE group_id = v_invite.group_id AND user_id = v_user) THEN
        RETURN json_build_object('success', false, 'error', 'Você já participa desta comunidade.');
    END IF;

    INSERT INTO public.group_members (group_id, user_id, joined_at, is_admin)
    VALUES (v_invite.group_id, v_user, now(), false);
    INSERT INTO public.conversation_participants (conversation_id, user_id, joined_at)
    VALUES (v_invite.group_id, v_user, now())
    ON CONFLICT DO NOTHING;

    SELECT count(*)::INTEGER INTO v_count FROM public.group_members WHERE group_id = v_invite.group_id;
    UPDATE public.groups SET members = v_count, updated_at = now() WHERE id = v_invite.group_id;

    RETURN json_build_object('success', true, 'group_id', v_invite.group_id, 'group_name', v_invite.group_name);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_group_moderator(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_admin(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_group(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_groups() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_groups() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_for_user(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_posts(UUID, INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_group(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_group(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_group(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_group(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_group_invite(TEXT) TO authenticated;

COMMENT ON FUNCTION public.get_public_groups() IS 'Lista somente comunidades públicas ativas para a vitrine.';
COMMENT ON FUNCTION public.get_my_groups() IS 'Lista grupos públicos e privados do usuário autenticado.';
COMMENT ON FUNCTION public.create_group(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT) IS 'Cria grupo, conversa e membership do criador de forma atômica.';
COMMENT ON FUNCTION public.update_group(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT) IS 'Edita grupo e identidade visual somente para autor/admin.';
COMMENT ON FUNCTION public.join_group(UUID) IS 'Entra em grupo público usando auth.uid().';
COMMENT ON FUNCTION public.leave_group(UUID) IS 'Sai de grupo usando auth.uid() e limpa participante.';
COMMENT ON FUNCTION public.redeem_group_invite(TEXT) IS 'Usa convite privado sem expor group_invites ao cliente.';
