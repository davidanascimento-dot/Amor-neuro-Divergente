-- =============================================================
-- 11_invite_code_system.sql
-- Conserta o sistema de código de convite das comunidades.
--
-- Sintoma: o código é gerado, mas ao usá-lo o Supabase responde
--   "Could not find the function public.use_invite_code(p_code)
--    in the schema cache"
-- Causa: as funções SECURITY DEFINER de convite nunca foram
--   instaladas, e group_members só tem política de SELECT (RLS
--   bloqueia INSERT direto do cliente), então o resgate 100%
--   client-side é impossível.
--
-- Execute no SQL Editor do Supabase. É idempotente: pode rodar
-- quantas vezes quiser sem quebrar nada.
-- Depois: Settings → API → Reload schema (ou esperar ~1 min).
-- =============================================================

-- -------------------------------------------------------------
-- 1. Garante o contrato de colunas usado pelas funções.
-- -------------------------------------------------------------
ALTER TABLE public.groups
    ADD COLUMN IF NOT EXISTS members INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.group_members
    ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'group_invites' AND column_name = 'code') THEN
        ALTER TABLE public.group_invites ADD COLUMN code TEXT NOT NULL DEFAULT '';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'group_invites' AND column_name = 'active') THEN
        ALTER TABLE public.group_invites ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'group_invites' AND column_name = 'created_by') THEN
        ALTER TABLE public.group_invites ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'group_invites' AND column_name = 'expires_at') THEN
        ALTER TABLE public.group_invites ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;
END $$;

UPDATE public.group_invites
SET expires_at = now() + interval '7 days'
WHERE expires_at IS NULL;

-- Índice único do código. Se já houver códigos repetidos legados,
-- apenas avisa e segue — a geração garante unicidade por loop.
DO $$
BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS group_invites_code_unique
        ON public.group_invites (code);
EXCEPTION WHEN others THEN
    RAISE NOTICE 'group_invites.code duplicado no legado: %', SQLERRM;
END $$;

CREATE INDEX IF NOT EXISTS idx_group_invites_group_active
    ON public.group_invites (group_id, active);

-- -------------------------------------------------------------
-- 2. RLS de group_invites (cliente gera o código direto quando
--    a RPC não está disponível).
-- -------------------------------------------------------------
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "group_invites_select_all" ON public.group_invites;
CREATE POLICY "group_invites_select_all"
    ON public.group_invites FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "group_invites_insert_creator" ON public.group_invites;
CREATE POLICY "group_invites_insert_creator"
    ON public.group_invites FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "group_invites_update_creator" ON public.group_invites;
CREATE POLICY "group_invites_update_creator"
    ON public.group_invites FOR UPDATE TO authenticated
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "group_invites_delete_creator" ON public.group_invites;
CREATE POLICY "group_invites_delete_creator"
    ON public.group_invites FOR DELETE TO authenticated
    USING (auth.uid() = created_by);

-- -------------------------------------------------------------
-- 3. generate_group_invite: devolve SEMPRE código de 5 dígitos.
--    Nunca link.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_group_invite(p_group_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user UUID := auth.uid();
    v_group RECORD;
    v_code TEXT;
    v_existing RECORD;
    v_invite RECORD;
BEGIN
    IF v_user IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Faça login para gerar o código.');
    END IF;

    SELECT * INTO v_group FROM public.groups WHERE id = p_group_id;
    IF v_group.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Comunidade não encontrada.');
    END IF;
    IF v_group.created_by IS DISTINCT FROM v_user THEN
        RETURN json_build_object('success', false, 'error', 'Apenas o criador pode gerar o código.');
    END IF;

    -- Reaproveita o código ainda válido antes de invalidar o antigo.
    SELECT * INTO v_existing
    FROM public.group_invites
    WHERE group_id = p_group_id
      AND COALESCE(active, true) = true
      AND expires_at > now()
    ORDER BY expires_at DESC
    LIMIT 1;

    IF v_existing.id IS NOT NULL THEN
        RETURN json_build_object(
            'success', true,
            'code', v_existing.code,
            'expires_at', v_existing.expires_at
        );
    END IF;

    UPDATE public.group_invites
    SET active = false
    WHERE group_id = p_group_id AND COALESCE(active, true) = true;

    FOR i IN 1..40 LOOP
        v_code := lpad(floor(random() * 100000)::integer::text, 5, '0');
        EXIT WHEN NOT EXISTS (
            SELECT 1 FROM public.group_invites
            WHERE code = v_code AND COALESCE(active, true) = true
        );
    END LOOP;

    INSERT INTO public.group_invites (group_id, code, created_by, active, expires_at)
    VALUES (p_group_id, v_code, v_user, true, now() + interval '7 days')
    RETURNING * INTO v_invite;

    RETURN json_build_object(
        'success', true,
        'code', v_invite.code,
        'expires_at', v_invite.expires_at
    );
EXCEPTION
    WHEN others THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- -------------------------------------------------------------
-- 4. redeem_group_invite (nome V2) e use_invite_code (nome legado).
--    Os dois fazem o mesmo: validam o código e adicionam a pessoa
--    em group_members + conversation_participants.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.redeem_group_invite(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user UUID := auth.uid();
    v_code TEXT := trim(COALESCE(p_code, ''));
    v_invite RECORD;
    v_count INTEGER;
BEGIN
    IF v_user IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Faça login para usar um convite.');
    END IF;

    IF v_code !~ '^[0-9]{5}$' THEN
        RETURN json_build_object('success', false, 'error', 'O código deve ter 5 dígitos numéricos.');
    END IF;

    SELECT gi.group_id, g.name AS group_name
    INTO v_invite
    FROM public.group_invites gi
    JOIN public.groups g ON g.id = gi.group_id
    WHERE gi.code = v_code
      AND COALESCE(gi.active, true) = true
      AND gi.expires_at > now()
    LIMIT 1;

    IF v_invite.group_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Código inválido ou expirado.');
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.group_members
        WHERE group_id = v_invite.group_id AND user_id = v_user
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Você já participa desta comunidade.');
    END IF;

    INSERT INTO public.group_members (group_id, user_id, joined_at, is_admin)
    VALUES (v_invite.group_id, v_user, now(), false);

    INSERT INTO public.conversation_participants (conversation_id, user_id, joined_at)
    VALUES (v_invite.group_id, v_user, now())
    ON CONFLICT DO NOTHING;

    SELECT count(*)::integer INTO v_count
    FROM public.group_members WHERE group_id = v_invite.group_id;

    UPDATE public.groups SET members = v_count WHERE id = v_invite.group_id;

    RETURN json_build_object(
        'success', true,
        'group_id', v_invite.group_id,
        'group_name', v_invite.group_name
    );
EXCEPTION
    WHEN others THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION public.use_invite_code(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN public.redeem_group_invite(p_code);
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_group_invite(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_group_invite(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.use_invite_code(TEXT) TO authenticated;

COMMENT ON FUNCTION public.generate_group_invite(UUID) IS 'Gera/reaproveita o código de 5 dígitos da comunidade. Nunca devolve link.';
COMMENT ON FUNCTION public.redeem_group_invite(TEXT) IS 'Usa o código de 5 dígitos e adiciona a pessoa em group_members + conversation_participants.';
COMMENT ON FUNCTION public.use_invite_code(TEXT) IS 'Alias legado de redeem_group_invite.';

-- -------------------------------------------------------------
-- 5. Confere se tudo ficou no lugar.
-- -------------------------------------------------------------
SELECT 'função' AS item, p.proname AS nome
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('generate_group_invite', 'redeem_group_invite', 'use_invite_code')
UNION ALL
SELECT 'coluna', c.column_name
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name = 'group_invites'
  AND c.column_name IN ('code', 'active', 'created_by', 'expires_at')
ORDER BY 1, 2;
