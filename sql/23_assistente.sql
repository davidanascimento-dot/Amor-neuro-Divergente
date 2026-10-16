/* ==========================================================================
   23_ASSISTENTE.SQL — marca a Lia como assistente virtual

   POR QUE ESTE ARQUIVO É NECESSÁRIO

   O selo "🤖 IA" no perfil (perfil.html + perfil.js) lê a coluna
   `is_assistant` da tabela `profiles`. Essa coluna **não existe** no
   banco: o sql/16_descobrir_pessoas.sql cria `is_verified`, e o
   `is_assistant` não está em nenhum arquivo da pasta sql/.

   Sem rodar isto, `profile.is_assistant` vem `undefined`, o
   `|| false` transforma em false e o selo simplesmente nunca aparece —
   sem erro no console, sem aviso. É o tipo de falha que parece "o
   código não rodou" quando na verdade falta a coluna.

   Não precisa mexer em perfil.js: a busca usa `select('*')`, então a
   coluna aparece sozinha assim que existir.

   ========================================================================== */


-- ==========================================================================
   1. A COLUNA
   ==========================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_assistant boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.is_assistant IS
  'Conta de assistente virtual (ex.: Lia). Exibe o selo "IA" no perfil.';


-- ==========================================================================
   2. MARCAR A CONTA DA LIA
   --------------------------------------------------------------------------
   Troque o UUID abaixo pelo id da conta da Lia na comunidade.
   Descubra o id em: painel do Supabase -> Authentication -> Users,
   ou no console do navegador com:
       (await supabase.auth.getUser()).user.id
   logado como a Lia.
-- ==========================================================================
-- UPDATE public.profiles
--    SET is_assistant = true
--  WHERE id = 'COLE-AQUI-O-UUID-DA-LIA';


-- ==========================================================================
   3. CHECAGEM — rode depois de aplicar
   ==========================================================================
/*
  Deve devolver 1 linha, com is_assistant = true:

      SELECT id, username, is_verified, is_assistant
        FROM public.profiles
       WHERE is_assistant = true;

  Se a coluna não existir, este SELECT vai reclamar de
  "column does not exist" — é assim que se confirma que o passo 1 rodou.

  E para conferir que só a Lia está marcada:

      SELECT count(*) FROM public.profiles WHERE is_assistant;
*/


-- ==========================================================================
   4. QUEM PODE MARCAR
   --------------------------------------------------------------------------
   Por enquanto a coluna é livre: qualquer pessoa com acesso de escrita
   em `profiles` pode setar is_assistant em si mesma, e aparecer com
   selo de IA quando não é.

   O selo é uma afirmação sobre a conta — "isto é uma assistente
   virtual" — e não deveria ser autodeclarado. Se a coluna for ficar
   em produção, restrinja a escrita:

   ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

   -- Trigger: ignora tentativas de altering is_assistant por quem
   -- não for admin. Substitui o DEFAULT acima se preferir travar no
   -- banco em vez de confiar na aplicação.

   CREATE OR REPLACE FUNCTION public.proteger_is_assistant()
   RETURNS trigger LANGUAGE plpgsql AS $$
   BEGIN
       IF NEW.is_assistant IS DISTINCT FROM OLD.is_assistant THEN
           IF NOT EXISTS (
               SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND is_admin = true
           ) THEN
               RAISE EXCEPTION 'is_assistant só pode ser alterado por um administrador';
           END IF;
       END IF;
       RETURN NEW;
   END;
   $$;

   CREATE TRIGGER tg_proteger_is_assistant
     BEFORE UPDATE ON public.profiles
     FOR EACH ROW EXECUTE FUNCTION public.proteger_is_assistant();
*/