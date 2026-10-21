-- ============================================================================
-- 29_dicas_artigos.sql
-- ============================================================================
-- Atualiza a tabela `articles` para aceitar o tipo 'Dica' e otimiza indices.
--
-- COMO RODAR: execute no SQL Editor do Supabase se desejar atualizar a
-- constraint de tipo para incluir formalmente 'Dica'.
-- O front-end já possui fallback seguro caso a constraint ainda não tenha sido
-- alterada no banco.
-- ============================================================================

DO $$
BEGIN
    -- Atualiza a constraint de tipo para aceitar 'Dica'
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'articles_kind_check'
    ) THEN
        ALTER TABLE public.articles DROP CONSTRAINT articles_kind_check;
        ALTER TABLE public.articles ADD CONSTRAINT articles_kind_check
            CHECK (kind IN ('Dica', 'Relato', 'História', 'Guia', 'Análise'));
    END IF;
END $$;
