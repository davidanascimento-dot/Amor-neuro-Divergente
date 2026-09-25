-- =============================================================
-- 10_delete_group.sql
-- Exclusão de comunidades pelo criador, admin do grupo ou moderação
-- Execute no SQL Editor do Supabase após a 09_groups_public_flow.sql.
-- Depois de executar, recarregue o schema da API em Settings → API
-- caso o projeto não detecte imediatamente a nova função.
-- =============================================================

-- 1. A política anterior cobria apenas o criador; passa a valer o mesmo
-- contrato da RPC (dono, admin do grupo e moderação).
DROP POLICY IF EXISTS "Groups can be deleted by owner or moderator" ON public.groups;

CREATE POLICY "Groups can be deleted by owner or moderator"
    ON public.groups FOR DELETE TO authenticated
    USING (public.is_group_admin(id, auth.uid()) OR public.is_group_moderator(auth.uid()));

-- 2. Exclusão em cascata. Somente posts e group_invites têm FK para
-- groups; conversa, participantes, mensagens e memberships são limpos
-- aqui para não deixar registros órfãos.
CREATE OR REPLACE FUNCTION public.delete_group(p_group_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_group RECORD;
    v_user UUID := auth.uid();
BEGIN
    IF v_user IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Faça login para excluir a comunidade.');
    END IF;
    IF p_group_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Comunidade não informada.');
    END IF;

    SELECT g.* INTO v_group FROM public.groups g WHERE g.id = p_group_id;
    IF v_group.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Comunidade não encontrada.');
    END IF;
    IF v_group.id = '00000000-0000-0000-0000-000000000001'::uuid
       OR lower(trim(COALESCE(v_group.name, ''))) = 'geral' THEN
        RETURN json_build_object('success', false, 'error', 'A comunidade Geral não pode ser excluída.');
    END IF;
    IF v_group.created_by IS DISTINCT FROM v_user
       AND NOT EXISTS (
           SELECT 1
           FROM public.group_members gm
           WHERE gm.group_id = p_group_id
             AND gm.user_id = v_user
             AND COALESCE(gm.is_admin, false)
       )
       AND NOT public.is_group_moderator(v_user) THEN
        RETURN json_build_object('success', false, 'error', 'Apenas o criador, um administrador do grupo ou a moderação pode excluir esta comunidade.');
    END IF;

    IF to_regclass('public.messages') IS NOT NULL THEN
        EXECUTE 'DELETE FROM public.messages WHERE conversation_id = $1' USING p_group_id;
    END IF;
    IF to_regclass('public.conversation_participants') IS NOT NULL THEN
        DELETE FROM public.conversation_participants WHERE conversation_id = p_group_id;
    END IF;
    IF to_regclass('public.conversations') IS NOT NULL THEN
        DELETE FROM public.conversations WHERE id = p_group_id;
    END IF;
    IF to_regclass('public.group_members') IS NOT NULL THEN
        DELETE FROM public.group_members WHERE group_id = p_group_id;
    END IF;
    IF to_regclass('public.group_invites') IS NOT NULL THEN
        DELETE FROM public.group_invites WHERE group_id = p_group_id;
    END IF;

    DELETE FROM public.groups WHERE id = p_group_id;

    RETURN json_build_object('success', true, 'group_id', p_group_id, 'group_name', v_group.name);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_group(UUID) TO authenticated;

COMMENT ON FUNCTION public.delete_group(UUID) IS 'Exclui a comunidade e seus vínculos somente para o criador, admin do grupo ou moderação.';
