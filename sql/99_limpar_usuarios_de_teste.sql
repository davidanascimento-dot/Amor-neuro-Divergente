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
--   username: dbg          (id 38a3d69e-e171-4280-8c4d-51447b26e437)
--   username: descobrir    (id ffc5996b-074d-498d-8d71-0dde0e21aa76)
--   username: sonda_perfil (id 0a8650ea-eb34-42be-9e43-b807ce3fb647)
--
-- -------------------------------------------------------------
-- COORDENACAO DE TESTE DO "ENCONTRAR MAIS PESSOAS"
--
-- Estas NAO sao lixo: sao as 12 contas que criei para voce ver a
-- lista de pessoas com estados variados. Apague so depois de
-- terminar de testar o recurso. A conta principal e a sua:
--
--   email:    sua.conta.teste@teste.com
--   senha:    Teste12345!
--   username: sua.conta.teste
--
-- O grupo de teste (aaaa1111-2222-4333-8444-555566667777) e
-- removido junto, e vale a pena apagar antes das contas.
-- -------------------------------------------------------------
--   username: mari.neuro   (id b6aad0d3-2159-4ea0-916d-5b1235a61323) 3 grupos em comum, mutuo
--   username: rafa.l       (id af4ed58d-4063-45c0-9786-dc55c4b89f8f) 3 grupos em comum, mutuo
--   username: ju.ds        (id d13285d5-2abb-4821-ba82-85cca53ce10c) amigos
--   username: breno.t      (id 4e953e8f-2169-4273-9465-d76e00de24cb) sem ligacao
--   username: lina.pr      (id 4dd76b64-f752-4e6d-9c7b-370bf96cbfe0) voce segue
--   username: gabi.m       (id 0b0cae16-b097-46b5-a5fe-f89ae93da8c9) te segue
--   username: otavio.r     (id ccce1f85-5bd6-4cef-9322-5f426095fd5b) 1 grupo em comum
--   username: nina.c       (id c5c00a4b-49a2-4062-b4b2-0c41b58136bc) te segue
--   username: pedro.a      (id 94348e6c-396d-4ee3-a65d-9dae7b7e1cee) pedido enviado por voce
--   username: sofia.v      (id 2cf93a26-bad0-4cb6-9979-af78420a5e93) te pediu_amizade
--   username: caio.l       (id 2c950417-4574-4d4d-bbda-14e1a2564c9e) 1 grupo em comum
--   username: duda.p       (id 37aa5b27-b7f8-4724-b02f-66aa8da75087) te segue
--   conta principal        (id 54dfcaa9-00e6-46ba-885d-02cf572502da) e a SUA
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
        '147fd1ad-3ea8-4e93-82a1-61c14e3dceb5',   -- latency
        '38a3d69e-e171-4280-8c4d-51447b26e437',   -- dbg
        'ffc5996b-074d-498d-8d71-0dde0e21aa76',   -- descobrir
        '0a8650ea-eb34-42be-9e43-b807ce3fb647',   -- sonda_perfil
        -- coordenacao de teste do "Encontrar mais pessoas"
        '54dfcaa9-00e6-46ba-885d-02cf572502da',   -- sua.conta.teste (a sua)
        'b6aad0d3-2159-4ea0-916d-5b1235a61323',   -- mari.neuro
        'af4ed58d-4063-45c0-9786-dc55c4b89f8f',   -- rafa.l
        'd13285d5-2abb-4821-ba82-85cca53ce10c',   -- ju.ds
        '4e953e8f-2169-4273-9465-d76e00de24cb',   -- breno.t
        '4dd76b64-f752-4e6d-9c7b-370bf96cbfe0',   -- lina.pr
        '0b0cae16-b097-46b5-a5fe-f89ae93da8c9',   -- gabi.m
        'ccce1f85-5bd6-4cef-9322-5f426095fd5b',   -- otavio.r
        'c5c00a4b-49a2-4062-b4b2-0c41b58136bc',   -- nina.c
        '94348e6c-396d-4ee3-a65d-9dae7b7e1cee',   -- pedro.a
        '2cf93a26-bad0-4cb6-9979-af78420a5e93',   -- sofia.v
        '2c950417-4574-4d4d-bbda-14e1a2564c9e',   -- caio.l
        '37aa5b27-b7f8-4724-b02f-66aa8da75087'    -- duda.p
    ];
    v_id UUID;
BEGIN
    -- O grupo de teste da coordenacao. Vai antes dos usuarios porque tem
    -- conversation e participantes proprios.
    BEGIN
        DELETE FROM public.conversation_participants
        WHERE conversation_id = 'aaaa1111-2222-4333-8444-555566667777';
        DELETE FROM public.conversations
        WHERE id = 'aaaa1111-2222-4333-8444-555566667777';
        DELETE FROM public.groups
        WHERE id = 'aaaa1111-2222-4333-8444-555566667777';
    EXCEPTION WHEN undefined_table THEN NULL;
    END;

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
            -- Os dois lados: a conta de teste segue e e seguida.
            DELETE FROM public.follows
            WHERE follower_id = v_id OR followed_id = v_id;
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

-- Conferir: tudo deve voltar 0.
--
-- A contagem por '@teste.com' e proposital: ela pega tambem qualquer conta
-- de teste que eu tenha esquecido de listar no array acima, em vez de
-- passar em silencio e deixar lixo para tras.
SELECT 'auth.users @teste.com' AS tabela, count(*) AS restantes
FROM auth.users
WHERE email LIKE '%@teste.com'
UNION ALL
SELECT 'profiles @teste.com', count(*)
FROM public.profiles AS p
WHERE EXISTS (
    SELECT 1 FROM auth.users AS u
    WHERE u.id = p.id AND u.email LIKE '%@teste.com'
)
UNION ALL
SELECT 'grupo de teste', count(*)
FROM public.groups
WHERE id = 'aaaa1111-2222-4333-8444-555566667777'
UNION ALL
-- Integridade: nenhum follow pode apontar para um usuario que nao existe
-- mais. Se vier linha aqui, sobrou residuo.
SELECT 'follows orfaos', count(*)
FROM public.follows AS f
WHERE NOT EXISTS (SELECT 1 FROM auth.users AS u WHERE u.id = f.follower_id)
   OR NOT EXISTS (SELECT 1 FROM auth.users AS u WHERE u.id = f.followed_id);
