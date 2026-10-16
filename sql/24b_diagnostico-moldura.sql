/* ==========================================================================
   24b_DIAGNOSTICO-MOLDURA.SQL — por que a moldura nao aparece

   A cadeia do codigo esta correta:

       profiles.frame  ->  perfil.js:109  ->  perfil.js:190
                      ->  data-frame="..." no #avatarWrapper

   Se a moldura nao aparece, o problema e o DADO, nao o codigo. Sao duas
   possibilidades, e este arquivo separa as duas.

   Rode o PASSO 1 e olhe o resultado antes de rodar o passo 2: se a coluna
   nao existir, o passo 2 da erro.

   ========================================================================== */


-- ==========================================================================
   PASSO 1 — a coluna existe?
   ==========================================================================
   Rode isto primeiro.

       SELECT column_name, data_type, column_default
         FROM information_schema.columns
        WHERE table_name = 'profiles'
          AND column_name = 'frame';

   --------------------------------------------------------------------------
   VOLTOU 1 LINHA          -> coluna existe. Vá para o passo 2.
   VOLTOU "0 rows"         -> a coluna NAO existe. Rode:

                                   ALTER TABLE public.profiles
                                     ADD COLUMN IF NOT EXISTS frame text
                                     NOT NULL DEFAULT 'none';

                               E depois o passo 2 de novo.
   DEU ERRO                -> o passo 2 do arquivo 24 foi alterado em
                               outro projeto, ou a tabela profiles se
                               chama outra coisa. Confira o nome.
   ========================================================================== */


-- ==========================================================================
   PASSO 2 — quem tem moldura?
   ==========================================================================
   Só depois do passo 1 dar 1 linha.

       SELECT username, frame
         FROM public.profiles
        ORDER BY username;

   --------------------------------------------------------------------------
   LEIA ASSIM
   --------------------------------------------------------------------------
   frame = 'none' em todo mundo
       O UPDATE do passo 2 do arquivo 24 nao pegou ninguem. Quase
       sempre e porque o WHERE ficou com o texto de exemplo:

           WHERE username = 'SEU-NOME-AQUI'

       Aquilo e literalmente o nome de exemplo, nao o seu. Trocar pelo
       nome de exibicao EXATO, incluindo maiusculas e acentos. Na sua
       tela o nome de exibicao e "David" e o @ e david — mas o banco
       guarda o que foi digitado no cadastro, e um "David" com D
       maiusculo nao casa com 'david'.

       Query que nao erra maiuscula nem espaco:

           UPDATE public.profiles
              SET frame = 'gatinho-teste'
            WHERE id = (SELECT id FROM auth.users
                         WHERE email = 'SEU-EMAIL-AQUI');

       O e-mail identifica sem ambiguidade.

   frame = 'gatinho-teste' em algum
       O dado esta certo. Então o problema passou a ser outra coisa:

         1. Cache. O perfil.css antigo pode estar no navegador.
            Ctrl+Shift+R, ou abra em janela anonima.

         2. O valor no HTML. Abra o console (F12) e rode:

                document.getElementById('avatarWrapper').dataset.frame

            Esperado: "gatinho-teste"
            Se vier "none": o JS nao esta lendo o valor — me avise,
            que aí o problema volta a ser de codigo.
   ========================================================================== */


-- ==========================================================================
   PASSO 3 — atalho que nao depende de nome nenhum
   ==========================================================================
   Se o passo 2 estiver dando trabalho, use a propria interface:

       /comunidade/perfil.html  (o SEU perfil)
         -> Editar Perfil
         -> Moldura do avatar: botao rosa, o sexto
         -> Salvar

   Esse caminho grava por currentUser.id, que vem da sessao. Nao ha
   nome para errar. E o mesmo caminho que o resto do formulario usa,
   entao se ele falhar o toast mostra o erro de verdade.

   Vale rodar mesmo com o banco resolvido: assim se confirma que o
   SELECT do perfil esta levando o valor ate a tela.
   ========================================================================== */
