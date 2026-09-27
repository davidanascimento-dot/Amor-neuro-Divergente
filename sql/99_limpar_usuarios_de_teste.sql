-- =============================================================
-- 99_limpar_usuarios_de_teste.sql
-- Remove os usuarios que criei durante os testes de apagamento de
-- mensagem. Pode rodar uma vez e depois apagar o arquivo.
--
-- Execute no SQL Editor do Supabase.
-- Sao accounts de teste descartaveis, criadas hoje:
--   username: testeapagar  (id c57b138d-3c15-4ff4-9c08-08694d27ede5)
--   username: apagador     (id f8efc6ed-3e65-4cda-aab7-a5ee157b28a3)
--   username: longpress    (id 1ec5abf9-67b5-4ac1-afe4-906be1136daf)
--   username: realtime1    (id 561f2f87-b37d-44cb-be47-0f06d412d818)
--   username: rapidtest    (id c3637017-7587-46fe-9337-b05eb7168c23)
--   username: latency      (id 147fd1ad-3ea8-4e93-82a1-61c14e3dceb5)
--
-- Ja limpei da chave anon: mensagens, participacoes em conversas,
-- membros de grupo e friendships. Restam os perfis e o auth.users,
-- que exigem service_role ou o SQL Editor.
-- =============================================================

DO $$
DECLARE
    v_ids UUID[] := ARRAY[
        'c57b138d-3c15-4ff4-9c08-08694d27ede5',   -- testeapagar
        'f8efc6ed-3e65-4cda-aab7-a5ee157b28a3',   -- apagador
        '1ec5abf9-67b5-4ac1-afe4-906be1136daf',   -- longpress
        '561f2f87-b37d-44cb-be47-0f06d412d818',   -- realtime1
        'c3637017-7587-46fe-9337-b05eb7168c23',   -- rapidtest
        '147fd1ad-3ea8-4e93-82a1-61c14e3dceb5'    -- latency
    ];
    v_id UUID;
BEGIN
    -- Sai de qualquer tabela que possa referenciar o usuario. As tabelas
    -- que nao existirem sao ignoradas pelo bloco EXCEPTION.
    FOREACH v_id IN ARRAY v_ids LOOP
        BEGIN
            DELETE FROM public.conversation_participants WHERE user_id = v_id;
        EXCEPTION WHEN undefined_table THEN NULL;
        END;
        BEGIN
            DELETE FROM public.group_members WHERE user_id = v_id;
        EXCEPTION WHEN undefined_table THEN NULL;
        END;
        BEGIN
            DELETE FROM public.messages WHERE sender_id = v_id;
        EXCEPTION WHEN undefined_table THEN NULL;
        END;
        BEGIN
            DELETE FROM public.friendships WHERE requester_id = v_id OR receiver_id = v_id;
        EXCEPTION WHEN undefined_table THEN NULL;
        END;
        BEGIN
            DELETE FROM public.group_invites WHERE created_by = v_id;
        EXCEPTION WHEN undefined_table THEN NULL;
        END;
        BEGIN
            DELETE FROM public.messages WHERE deleted_by = v_id;
        EXCEPTION WHEN undefined_table THEN NULL;
        END;
        BEGIN
            DELETE FROM public.profiles WHERE id = v_id;
        EXCEPTION WHEN undefined_table THEN NULL;
        END;
    END LOOP;

    -- O auth.users e a ultima etapa. Precisa de service_role; o SQL
    -- Editor roda com essa permissao.
    DELETE FROM auth.users WHERE id = ANY(v_ids);
END;
$$;

-- Conferir: nao deve voltar nenhuma linha.
SELECT 'profiles' AS tabela, count(*) AS restantes
FROM public.profiles
WHERE id IN ('c57b138d-3c15-4ff4-9c08-08694d27ede5', 'f8efc6ed-3e65-4cda-aab7-a5ee157b28a3', '1ec5abf9-67b5-4ac1-afe4-906be1136daf', '561f2f87-b37d-44cb-be47-0f06d412d818', 'c3637017-7587-46fe-9337-b05eb7168c23', '147fd1ad-3ea8-4e93-82a1-61c14e3dceb5')
UNION ALL
SELECT 'auth.users', count(*)
FROM auth.users
WHERE id IN ('c57b138d-3c15-4ff4-9c08-08694d27ede5', 'f8efc6ed-3e65-4cda-aab7-a5ee157b28a3', '1ec5abf9-67b5-4ac1-afe4-906be1136daf', '561f2f87-b37d-44cb-be47-0f06d412d818', 'c3637017-7587-46fe-9337-b05eb7168c23', '147fd1ad-3ea8-4e93-82a1-61c14e3dceb5');
