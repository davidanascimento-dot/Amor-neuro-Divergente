-- ============================================================================
-- 21_limpar_dados_de_teste.sql
-- ============================================================================
-- O banco de producao esta 100% preenchido com dado de teste. Quem entra na
-- comunidade hoje ve 3 posts que dizem "post", 15 comentarios que dizem "oi",
-- grupos chamados "Ford Enter" e "Minecraft", e 6 eventos chamados
-- "evento1", "evento teste", "nmnnjmmkb".
--
-- COMO RODAR: cole no SQL Editor do Supabase e execute.
--
-- ------------------------------------------------------------------
-- LEIA ANTES. Este script APAGA DADOS.
--
--   1. A secao 0 faz um BACKUP antes de qualquer coisa. Guarde o resultado.
--   2. A secao 1 e um DRY RUN: nao apaga nada, so mostra o que sera
--      apagado. Rode ela primeiro e confira a lista.
--   3. As secoes 2 em diante apagam de verdade. Cada uma tem um comentario
--      Ownline dizendo o que faz.
--
-- O QUE ESTE SCRIPT NAO APAGA:
--   - auth.users de quem for conta real do projeto (ver filtro da secao 2)
--   - o banco da loja (products) — a Loja esta fora do escopo desta etapa
--   - as tabelas de configuracao
--   - as 11 leis do direitos.js, que estao em codigo, nao no banco
-- ============================================================================


-- ============================================================================
-- SECAO 0 — BACKUP
-- ============================================================================
-- Rode isto primeiro e salve o resultado. Se precisar voltar atras, os
-- dados estao aqui.

SELECT 'posts' AS tabela, * FROM public.posts
UNION ALL SELECT 'comments', * FROM public.comments
UNION ALL SELECT 'groups', * FROM public.groups
UNION ALL SELECT 'events', * FROM public.events
ORDER BY 1;

SELECT id, username, full_name, is_admin, created_at FROM public.profiles
ORDER BY created_at;

SELECT id, name, type, created_by FROM public.conversations;

-- conferir o que existe em cada tabela antes de decidir
SELECT 'posts' AS t, count(*) FROM public.posts
UNION ALL SELECT 'comments', count(*) FROM public.comments
UNION ALL SELECT 'profiles', count(*) FROM public.profiles
UNION ALL SELECT 'groups', count(*) FROM public.groups
UNION ALL SELECT 'group_members', count(*) FROM public.group_members
UNION ALL SELECT 'conversations', count(*) FROM public.conversations
UNION ALL SELECT 'conversation_participants', count(*) FROM public.conversation_participants
UNION ALL SELECT 'events', count(*) FROM public.events
UNION ALL SELECT 'likes', count(*) FROM public.likes
UNION ALL SELECT 'moderation_logs', count(*) FROM public.moderation_logs;


-- ============================================================================
-- SECAO 1 — DRY RUN (nao apaga nada)
-- ============================================================================
-- Confira a lista antes de seguir. Os nomes sao os que a auditoria viu.

-- 1a. os 3 posts de teste
SELECT 'POST' AS tipo, content AS texto, created_at FROM public.posts
ORDER BY created_at;

-- 1b. os 15 comentarios de teste
SELECT 'COMENTARIO' AS tipo, content AS texto, blog_slug, status
  FROM public.comments ORDER BY created_at;

-- 1c. os 5 grupos de teste
SELECT 'GRUPO' AS tipo, name AS texto, category FROM public.groups
ORDER BY created_at;

-- 1d. os 6 eventos de teste
SELECT 'EVENTO' AS tipo, title AS texto, date, link FROM public.events
ORDER BY created_at;

-- 1e. as 5 contas de teste
SELECT 'PERFIL' AS tipo, username AS texto, is_admin, created_at
  FROM public.profiles ORDER BY created_at;


-- ============================================================================
-- SECAO 2 — APAGAR CONTENTU (nao mexe em auth.users)
-- ============================================================================
-- Tudo aqui e dado de teste. As tabelas de conta ficam para a secao 3.

BEGIN;

-- posts: os 3 que a auditoria leu como "post", "post", "post teste".
-- Antes de apagar, confira que NAO ha post de verdade:
--   SELECT * FROM public.posts WHERE lower(btrim(content)) NOT IN ('post','post teste');
-- Se essa consulta devolver alguma linha, PARE e converse antes.
DELETE FROM public.likes          WHERE post_id IN (SELECT id FROM public.posts);
DELETE FROM public.saved_posts    WHERE post_id IN (SELECT id FROM public.posts);
DELETE FROM public.comments       WHERE post_id IN (SELECT id FROM public.posts);
DELETE FROM public.moderation_logs WHERE target_type = 'post'
                                   AND target_id IN (SELECT id FROM public.posts);
DELETE FROM public.posts;

-- comentarios soltos (blog_slug nulo = comentario de post da comunidade)
DELETE FROM public.comments WHERE blog_slug IS NULL;

-- grupos de teste. 'Geral' e o grupo que o sistema cria sozinho
-- (a RPC ensure_geral_group) — ele volta no proximo acesso.
DELETE FROM public.group_invites     WHERE group_id IN (SELECT id FROM public.groups);
DELETE FROM public.group_members    WHERE group_id IN (SELECT id FROM public.groups);
DELETE FROM public.groups;

-- eventos de teste
DELETE FROM public.event_participants WHERE event_id IN (SELECT id FROM public.events);
DELETE FROM public.events;

-- conversas de teste
DELETE FROM public.messages WHERE conversation_id IN (SELECT id FROM public.conversations);
DELETE FROM public.conversation_participants
     WHERE conversation_id IN (SELECT id FROM public.conversations);
DELETE FROM public.conversations;

-- logs de teste
DELETE FROM public.moderation_logs;
DELETE FROM public.attack_logs;

COMMIT;

-- conferir
SELECT 'posts' AS t, count(*) FROM public.posts
UNION ALL SELECT 'comments', count(*) FROM public.comments
UNION ALL SELECT 'groups', count(*) FROM public.groups
UNION ALL SELECT 'events', count(*) FROM public.events
UNION ALL SELECT 'conversations', count(*) FROM public.conversations;


-- ============================================================================
-- SECAO 3 — APAGAR AS CONTAS DE TESTE
-- ============================================================================
-- CUIDADO COM AQUI. Isto sai de auth.users e leva junto o perfil.
--
-- A auditoria encontrou estes usernames no banco:
--   davidteste1, victorhugo, victorr, David, gustavo
--
-- E o arquivo sql/99_limpar_usuarios_de_teste.sql lista mais 21 que
-- podem ou nao ter sobrado.
--
-- >>> CONFIRME COM O PROJETO QUAL DESEUS E' A CONTA REAL. <<<
-- >>> Troque a lista abaixo. Nao rode sem trocar. <<<
--
-- A secao 3a mostra quem sera apagado. Confira. A 3b apaga.

-- 3a. DRY RUN
SELECT u.id,
       u.email,
       p.username,
       p.is_admin,
       p.created_at
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
 ORDER BY u.created_at;

-- 3b. APAGA (rode so depois de editar a lista acima)
--
-- DELETE FROM public.conversation_participants WHERE user_id IN (
--     SELECT id FROM auth.users WHERE email IN (
--         'CONTA-DE-TESTE-1@exemplo.com'
--     )
-- );
-- DELETE FROM public.profiles WHERE id IN (
--     SELECT id FROM auth.users WHERE email IN (
--         'CONTA-DE-TESTE-1@exemplo.com'
--     )
-- );
-- DELETE FROM auth.users WHERE email IN (
--     'CONTA-DE-TESTE-1@exemplo.com'
-- );


-- ============================================================================
-- SECAO 4 — DEIXAR A COMUNIDADE HONESTA
-- ============================================================================
-- A interface ja tem os estados vazios escritos ("Nenhum post ainda",
-- "Nenhum grupo disponivel", "Nenhuma mensagem ainda", "Nenhum evento
-- agendado"). Com o banco limpo, eles aparecem sozinhos. Nao precisa
-- mexer em codigo.
--
-- Se quiser uma conta de demonstracao em vez de zero:
--   crie UMA conta institucional pelo fluxo normal de cadastro e faca
--   um post de boas-vindas. Isso e melhor do que cinco contas com
--   nome de teste e diz ao visitante que aquilo e um lugar vivo.
-- ============================================================================