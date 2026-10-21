-- ============================================================================
-- 27_post_kind.sql
-- ============================================================================
-- Cria a coluna `post_kind` em `public.posts` e, opcionalmente, publicacoes de
-- exemplo para o Blog ter conteudo com que testar.
--
-- COMO RODAR: cole no SQL Editor do Supabase e execute.
--   - A SECAO 1 (a coluna) e idempotente: pode rodar mais de uma vez.
--   - A SECAO 2 (dados de exemplo) NAO e idempotente por padrao: ela insere.
--     Leia o comentario dela antes de rodar. Para rodar de novo, apague
--     primeiro com o comando que esta no fim do arquivo.
--
-- ============================================================================
-- POR QUE ISTA COLUNA EXISTE
-- ============================================================================
-- A auditoria (AUDITORIA-EXPLORAR-BLOG-COMUNIDADE.md) e a Fase 2 da integracao
-- mostraram que o Blog nao consegue separar:
--
--     (a) um RELATO  -- texto longo, escrito para ser lido
--     (b) um POST DE FORUM -- mensagem curta e conversacional
--
-- Hoje os dois tipos sao a mesma coisa na tabela: mesmo `content`, mesmo tudo.
-- O `tag` NAO resolve: ele guarda o nome do canal do Forum ("# Geral"), nao uma
-- categoria editorial. Confirmado por consulta direta ao banco em 21/10/2026.
--
-- Sem uma marca, qualquer filtro no Blog seria chute. Foi por isso que a Fase 3
-- (filtros) parou e voltou para decisao, em vez de inventar classificacao.
--
-- ============================================================================
-- A MENOR ALTERACAO POSSIVEL
-- ============================================================================
-- Uma coluna, um valor padrao, nenhuma tabela nova, nenhuma coluna removida.
--
--     post_kind text NOT NULL DEFAULT 'forum'
--
-- O padrao e 'forum' DE PROPOSITO: tudo o que ja existe e o que for inserido
-- por codigo antigo continua sendo o que sempre foi — post de Forum. Nada muda
-- de comportamento sozinho. Um relato passa a existir quando alguem escolhe
-- criar um ('relato'), e so entao.
--
-- Valores aceitos: 'forum' | 'relato'. O CHECK impede um terceiro valor de
-- entrar por engano.
--
-- O QUE ISTO NAO FAZ
--   - Nao decide quem escreve relato. Isso e a tela (o "modo publicacao" da
--     Fase 5, ainda nao construida).
--   - Nao mexe em RLS. As politicas de `posts` continuam valendo para a coluna
--     nova, porque politica e por tabela.
--   - Nao apaga nem reclassifica dado existente. Os 2 posts atuais ficam
--     'forum', que e o que eles sao.
--
-- DEPOIS DE RODAR ISTO
--   - O Blog pode filtrar: .eq('post_kind', 'relato')
--   - A Fase 3 (filtros visiveis) fica desbloqueada
--   - O composer da Comunidade precisa escolher o valor ao inserir (Fase 5)
-- ============================================================================


-- ============================================================================
-- SECAO 1 — A COLUNA
-- ============================================================================
-- Idempotente: IF NOT EXISTS em tudo.

ALTER TABLE public.posts
    ADD COLUMN IF NOT EXISTS post_kind text NOT NULL DEFAULT 'forum';

-- O CHECK precisa de nome para poder ser criado sob condicao. Sem o nome, um
-- segundo `ALTER TABLE ADD CONSTRAINT` daria erro na segunda execucao.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'posts_post_kind_check'
          AND conrelid = 'public.posts'::regclass
    ) THEN
        ALTER TABLE public.posts
            ADD CONSTRAINT posts_post_kind_check
            CHECK (post_kind IN ('forum', 'relato'));
    END IF;
END $$;

-- Indice para o filtro do Blog. Consulta tipica:
--   select ... from posts where is_active and post_kind = 'relato'
--   order by created_at desc
-- O indice composto cobre os tres campos na ordem em que sao usados.
CREATE INDEX IF NOT EXISTS posts_kind_criado_idx
    ON public.posts (post_kind, created_at DESC)
    WHERE is_active;

-- Garante que os 2 registros que ja existiam sejam 'forum'. E redundante por
-- causa do DEFAULT, mas explicito: se alguem rodar isto depois de a coluna ja
-- existir por outro caminho, o estado fica conhecido.
UPDATE public.posts
   SET post_kind = 'forum'
 WHERE post_kind IS NULL;


-- ============================================================================
-- SECAO 2 — PUBLICACOES DE EXEMPLO (leia antes de rodar)
-- ============================================================================
-- ISTO INSERE DADO DE DEMONSTRACAO. Nao e dado real de ninguem.
--
-- POR QUE EXISTE: hoje a tabela inteira tem 2 posts, os dois com o conteudo
-- literal "post". Com isso, o Blog novo mostra dois cards que dizem "post" —
-- integracao funcionando, tela sem sentido. Estes exemplos existem para que a
-- Fase 3 (filtros) e a Fase 5 (modo publicacao) tenham o que exibir enquanto
-- nao ha conteudo real.
--
-- O QUE ELES SAO: relatos plausiveis, escritos para o projeto, sobre autismo,
-- TDAH e vida neurodivergente. Nao sao texto de pessoa real e nao devem ir para
-- producao como se fossem.
--
-- APAGUE ASSIM QUE HOUVER CONTEUDO DE VERDADE:
--     DELETE FROM public.posts WHERE id IN (
--         'a1000000-0000-4000-8000-000000000001',
--         'a1000000-0000-4000-8000-000000000002',
--         'a1000000-0000-4000-8000-000000000003',
--         'a1000000-0000-4000-8000-000000000004',
--         'a1000000-0000-4000-8000-000000000005'
--     );
--
-- Os ids sao fixos e comecam com `a1` exatamente para isso: sao reconheciveis
-- a olho nu e podem ser apagados em bloco sem tocar em post real.
--
-- O AUTOR: usa o autor que JA existe no banco (David, o dono dos 2 posts
-- atuais), para nao criar usuario falso nem perfil inventado. O `author_name`
-- fica NULL de proposito — o Blog resolve o nome por `profiles`, do mesmo jeito
-- que comunidade/post.js:226 ja faz. Preencher aqui criaria um segundo lugar
-- com o nome, que sairia de sincronia com o perfil.

INSERT INTO public.posts
    (id, author_id, author_name, author_avatar, content, tag, post_kind, likes, comment_count, created_at, is_active)
VALUES
    (
        'a1000000-0000-4000-8000-000000000001',
        '4ab296ca-99f9-4398-b14e-3401d6dd63b6',
        NULL, NULL,
        'Passei anos achando que era só preguiça. A lista sempre existia, os apps de tarefa, os post-its na parede. O problema nunca foi saber o que fazer: era a distância entre saber e começar. Quando entendi que meu cérebro pede o primeiro passo menor do que eu estava dando, tudo mudou. O método dos cinco minutos não me fez produtivo. Me fez menos cruel comigo mesmo.',
        '# Relatos', 'relato', 12, 3,
        now() - interval '2 days', true
    ),
    (
        'a1000000-0000-4000-8000-000000000002',
        '4ab296ca-99f9-4398-b14e-3401d6dd63b6',
        NULL, NULL,
        'O diagnóstico chegou aos trinta e quatro. Antes disso eu era "a que reclama de barulho", "a que não olha nos olhos", "a que some no meio da festa". Depois do laudo, nada mudou por fora e tudo mudou por dentro: os mesmos fatos, um outro nome. Chorei menos por não ser forte e mais por ter passado tanto tempo me explicando errado.',
        '# Relatos', 'relato', 27, 8,
        now() - interval '6 days', true
    ),
    (
        'a1000000-0000-4000-8000-000000000003',
        '4ab296ca-99f9-4398-b14e-3401d6dd63b6',
        NULL, NULL,
        'Mascarar não é mentir. É traduzir o tempo inteiro, sem intervalo, e sem saber quando acaba. Você sorri na hora certa, segura o corpo na posição que os outros esperam, ensaia a resposta antes da pergunta terminar. É performar normalidade num idioma que não é o seu. Cansa porque não é atuação: é sobrevivência. E um dia, quando você para, percebe o tamanho do que estava segurando.',
        '# Relatos', 'relato', 41, 12,
        now() - interval '11 days', true
    ),
    (
        'a1000000-0000-4000-8000-000000000004',
        '4ab296ca-99f9-4398-b14e-3401d6dd63b6',
        NULL, NULL,
        'Na escola, o comportamento era o problema. Em casa, o comportamento era o problema. Ninguém perguntava o que o comportamento estava tentando dizer. Quando finalmente perguntaram, a resposta era simples: o barulho doía, a luz incomodava, e trocar de atividade sem aviso era como levar um empurrão. Não era falta de educação. Era excesso de mundo.',
        '# Relatos', 'relato', 19, 5,
        now() - interval '18 days', true
    ),
    (
        'a1000000-0000-4000-8000-000000000005',
        '4ab296ca-99f9-4398-b14e-3401d6dd63b6',
        NULL, NULL,
        'Meu filho não fala como as outras crianças. Fala do jeito dele, quando quer, sobre o que interessa. Passei muito tempo tentando corrigir isso. Depois parei de tentar e comecei a escutar — e descobri um menino que sabe nomes de dinossauros que eu nunca vou decorar, e que explica o mundo melhor do que muitos adultos. A mudança não foi nele. Foi em mim.',
        '# Relatos', 'relato', 33, 9,
        now() - interval '25 days', true
    )
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- CONFERENCIA
-- ============================================================================
-- Depois de rodar, isto deve mostrar:
--   forum  -> 2  (os posts que ja existiam)
--   relato -> 5  (os exemplos da SECAO 2)

SELECT post_kind, count(*) AS total
  FROM public.posts
 WHERE is_active
 GROUP BY post_kind
 ORDER BY post_kind;
