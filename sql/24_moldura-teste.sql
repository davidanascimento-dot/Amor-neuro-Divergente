/* ==========================================================================
   24_MOLDURA-GATINHO.SQL — cria a coluna `frame` e aplica a moldura

   Rode no painel do Supabase: SQL Editor -> New query -> colar -> Run.
   Da para rodar o arquivo inteiro de uma vez, na ordem.

   ========================================================================== */


-- --------------------------------------------------------------------------
   1. CRIAR A COLUNA
   --------------------------------------------------------------------------
   profiles.frame nao existe: nenhum arquivo da pasta sql/ a cria. A mesma
   situacao da is_assistant (23_ASSISTENTE.SQL).

   Por que isso e urgente, e nao cosmetico: o salvar do perfil em
   comunidade/perfil.js faz UM unico UPDATE com username, bio, location,
   website, banner_url, avatar_url, frame e updated_at. Sem a coluna
   frame, o Postgres rejeita o UPDATE INTEIRO — trocar o avatar, mudar a
   bio, editar o nome: nada disso salva. O toast mostra "Erro ao salvar
   perfil" e nao ha pista de que a causa e uma coluna de moldura.

   IF NOT EXISTS deixa este passo seguro para rodar mais de uma vez.
-- --------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS frame text NOT NULL DEFAULT 'none';

COMMENT ON COLUMN public.profiles.frame IS
  'Chave da moldura do avatar. Precisa bater exatamente com o atributo
   data-frame em comunidade/perfil.html. Valores: none, gold, purple, neon,
   rainbow, gatinho-teste.';


-- --------------------------------------------------------------------------
   2. APLICAR NA SUA CONTA
   --------------------------------------------------------------------------
   Troque pelo seu nome de exibicao. Este e o passo que "coloca a sua
   moldura" — o resto e infraestrutura.

   Se preferir nao depender do nome, troque por:

       WHERE id = (SELECT id FROM auth.users WHERE email = 'SEU-EMAIL')
-- --------------------------------------------------------------------------
UPDATE public.profiles
   SET frame = 'gatinho-teste'
 WHERE username = 'SEU-NOME-AQUI';


-- --------------------------------------------------------------------------
   3. CONFERIR
   --------------------------------------------------------------------------
   Deve voltar 1 linha com frame = gatinho-teste:

       SELECT username, frame
         FROM public.profiles
        WHERE frame = 'gatinho-teste';

   E quantas contas estao com ela:

       SELECT count(*) FROM public.profiles WHERE frame <> 'none';


-- --------------------------------------------------------------------------
   4. VOLTAR AO PADRAO
   --------------------------------------------------------------------------
   Depois do teste:

       UPDATE public.profiles SET frame = 'none' WHERE frame = 'gatinho-teste';

   Limpa todas de uma vez, e nao so a conta de cobaia.


-- ==========================================================================
   POR QUE O VALOR E 'gatinho-teste' E NAO 'Moldura-gatinho-teste-comunidade'

   profiles.frame e texto livre e nao ha validacao em lugar nenhum: o que
   o codigo le e o atributo data-frame do botao em perfil.html, e a
   resposta do CSS e esse mesmo texto.

       perfil.html : data-frame="gatinho-teste"
                     <span class="frame-preview frame-gatinho-teste">
       perfil.css  : .profile-hero-avatar[data-frame="gatinho-teste"]::before
                     .frame-preview.frame-gatinho-teste

   Se o valor gravado nao bater, a moldura NAO aparece — sem erro no
   console, sem aviso, sem toast. O sintoma se parece exatamente com
   "o sistema de moldura nao funciona", que e a conclusao errada que
   mais custa tempo depois.

   Se a coluna frame ja existir, pule o passo 1 e rode do 2 em diante.
   ========================================================================== */
