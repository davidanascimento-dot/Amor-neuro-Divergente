-- =============================================================
-- 15_realtime_apagar.sql
-- Manda mensagens E apagamentos por postgres_changes, em vez de so
-- por broadcast do cliente.
--
-- DIAGNOSTICO (26/09/2026): o canal assinava (SUBSCRIBED) mas nao
-- chegava evento nenhum, nem de INSERT. Tabela so entra no realtime
-- se estiver na publicacao supabase_realtime. Neste projeto nao esta.
--
-- O app contorna isso com broadcast: o cliente avisa o outro pelo
-- mesmo websocket, sem configuracao de banco. A conversa ja atualiza
-- em ~600ms e este script NAO e obrigatorio.
--
-- Vale a pena rodar porque o postgres_changes tambem pega mudanca
-- vinda de fora do app: moderacao, importacao, outra versao do
-- cliente. Com ele, o broadcast deixa de ser o unico caminho.
--
-- Execute no SQL Editor do Supabase. Idempotente: pode rodar de novo.
-- =============================================================

-- -------------------------------------------------------------
-- 1. DIAGNOSTICO: existe publicacao? tem messages dentro?
-- -------------------------------------------------------------
SELECT 'publicacao existe' AS verificacao,
       CASE WHEN count(*) > 0 THEN 'SIM' ELSE 'NAO' END AS resultado
FROM pg_publication
WHERE pubname = 'supabase_realtime'

UNION ALL

SELECT 'messages na publicacao',
       CASE WHEN count(*) > 0 THEN 'SIM' ELSE 'NAO' END
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
  AND tablename = 'messages';

-- Lista o que JAI esta na publicacao. Se vier vazia, o realtime
-- nunca funcionou neste projeto.
SELECT tablename AS tabelas_publicadas
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
ORDER BY tablename;

-- -------------------------------------------------------------
-- 2. CORRECAO: garantir a publicacao e colocar messages dentro
-- -------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
        RAISE NOTICE 'publicacao supabase_realtime criada';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
        RAISE NOTICE 'messages ADICIONADO a supabase_realtime (era esta a causa)';
    ELSE
        RAISE NOTICE 'messages ja estava em supabase_realtime';
    END IF;
END $$;

-- -------------------------------------------------------------
-- 3. REPLICA IDENTITY FULL
--
-- O apagamento e LOGICO: a 14 marca deleted_at, entao o Postgres
-- emite UPDATE, nao DELETE. Com RLS ligado na tabela, o realtime
-- so entrega UPDATE/DELETE se a replica trouxer o registro antigo.
-- Sem isto, apagar chega para quem fez e NAO chega para o outro.
-- -------------------------------------------------------------
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- -------------------------------------------------------------
-- 4. CONFERENCIA FINAL (o resultado esperado e tudo SIM)
-- -------------------------------------------------------------
SELECT 'replica_identity' AS item,
       CASE c.relreplident
           WHEN 'f' THEN 'FULL (ok)'
           WHEN 'd' THEN 'DEFAULT'
           ELSE c.relreplident::text
       END AS valor
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'messages'

UNION ALL

SELECT 'messages na publicacao',
       CASE WHEN count(*) > 0 THEN 'SIM (ok)' ELSE 'NAO (falhou)' END
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
  AND tablename = 'messages';

-- -------------------------------------------------------------
-- 5. APOS RODAR: feche as abas e abra de novo (Ctrl+Shift+R).
-- O canal ja assinado com a publicacao errada nao se recupera
-- sozinho; so vale reabrir a conversa depois de rodar este script.
-- -------------------------------------------------------------
