# AUDITORIA FINAL DE ENTREGA — AMOR NEURODIVERGENTE

**Data:** 08 de outubro de 2026
**Escopo:** produto inteiro, do ponto de vista de quem entra no site pela primeira vez
**Método:** leitura de código, varredura automatizada de 350 arquivos, e testes reais no navegador + consultas de leitura ao banco Supabase
**Nenhum arquivo do site foi alterado nesta etapa.**

### Legenda de status

| Símbolo | Significado |
|---|---|
| 🟢 | FUNCIONAL — testado e funcionando |
| 🟡 | FUNCIONAL, MAS INCOMPLETO — funciona, falta parte |
| 🟠 | PRECISA DE DADOS/CONTEÚDO — a estrutura existe, o conteúdo não |
| 🔴 | QUEBRADA — não funciona |
| ⚪ | NÃO VALIDADO — não foi possível verificar |
| ⚫ | DADO DE DEMONSTRAÇÃO — não é real |

---

# 1. RESUMO EXECUTIVO

O site é **mais sólido e mais bem construído do que a documentação interna sugere**, e ao mesmo tempo tem **três problemas que o fazem parecer falso** para quem chega pela primeira vez.

## O que está realmente pronto

- **A Lia funciona de ponta a ponta.** É um LLM real (não respostas fixas), com Edge Function no ar, tempo de resposta entre 0,7 s e 1,8 s. Testei 11 perguntas diferentes e as 11 respostas foram substantivas e distintas. Isso é a parte mais madura do produto.
- **A Comunidade é um sistema completo, não uma tela.** 24 tabelas, 57 funções, realtime, moderação, pedidos de amizade, grupos, conversas. Tem estados vazios escritos com cuidado ("Nenhum post ainda", "Nenhum grupo disponível", "Nenhuma mensagem ainda", "Nenhum comentário ainda. Seja o primeiro!"). Isso é engenharia de verdade.
- **Os 6 artigos, os 2 posts do blog e as 2 páginas institucionais** têm conteúdo editorial real, com fontes verificadas uma a uma, e cada um tem uma composição própria (não são cópias).
- **Direitos** tem banco local com 12 entradas, todas com link oficial para `planalto.gov.br`, filtro por categoria, busca e estado de "nenhum resultado".
- **Acessibilidade estrutural:** 43 páginas com `lang="pt-BR"`, `VLibras` e `UserWay` carregados em 40 delas, 29 páginas com "pular para o conteúdo", `movimento-reduzido.css` com a guarda correta.

## Os três problemas que o fazem parecer falso

1. **O banco de dados da comunidade está 100% preenchido com dado de teste.** 3 posts que dizem literalmente "post", "post", "post teste". 15 comentários que dizem "oi", "teste", "post", "oiii". 5 eventos chamados "evento1", "evento teste", "evento", "criar dad", "nmnnjmmkb". Grupos "Ford Enter" e "Minecraft". Tudo isso **aparece para o visitante** assim que ele entra.
2. **A Loja mostra 13 produtos inventados como se fossem reais** — marcas fictícias (SensorPeso, FidgetBrasil, ChewyWear), preços, estrelas e contadores de avaliação. E eles não são só um "fallback": **foram semeados dentro do banco**. Doze dos treze têm `link: "#"`.
3. **Eventos é uma página estática com 4 eventos inventados** — datas sem ano, números de participantes (23, 45, 67, 89) que não vêm de lugar nenhum, e os 4 botões "Inscrever-se" apontam para `#`. Clicar não faz nada.

## O problema invisível que é o mais grave

**A Lia alucina informação jurídica.** Perguntei "me dá o link oficial da Lei Berenice Piana". Ela respondeu: *"Lei nº 14.443, de 30 de setembro de 2022"* com o link `planalto.gov.br/ccivil_03/_Ato2019-2022/2022/Lei/L14443.htm`. **Esse link existe no Planalto de verdade — e é a lei do planejamento familiar e esterilização.** Não tem nada a ver com autonomia nem com neurodivergência. Em três perguntas diferentes sobre a mesma lei, ela deu três números diferentes: 14.435/2022, 14.126/2021 e 14.443/2022. O número correto é 12.764/2012 — que é o que o próprio site diz.

Num site cuja proposta é "informação confiável sobre direitos para pessoas neurodivergentes", isso é o problema mais danoso do projeto.

## Veredito

**Não está pronto para receber visitador.** Não por falta de engenharia — a engenharia está boa. Por falta de **dado real** e por **dois bugs que só aparecem em produção** (caminhos com letra minúscula e um arquivo de imagem com aspas diferentes).

**Quantidade de itens bloqueantes: 9** (P0 na seção 17).

---

# 2. INVENTÁRIO COMPLETO

47 arquivos HTML (44 do site + 3 de lixo). 47 CSS. 44 JS. 202 outros arquivos.

## 2.1 Páginas públicas

| # | Página | Caminho | Função | Login | Supabase | Dado real? | Status |
|---|---|---|---|---|---|---|---|
| 1 | Landing | `index.html` | porta de entrada, proposta, FAQ | não | não | texto real | 🟡 |
| 2 | Início | `inicio.html` | home, destaques, community trending | parcial | sim (perfis) | **parcial** | 🟡 |
| 3 | Explorar | `Explorar/Explorar.html` | 3 caminhos + recentes + FAQ + SAC | não | sim (atendimentos) | real | 🟡 |
| 4 | Artigos e Guias | `Recursos/recursos.html` | índice de artigos | não | não | real | 🟡 |
| 5 | Artismo (TEA) | `Recursos/autismo/autismo.html` | artigo | não | sim (comentários) | real | 🟡 |
| 6 | TDAH | `Recursos/autismo/Tdah.html` | artigo | não | sim (comentários) | real | 🟢 |
| 7 | Dislexia | `Recursos/autismo/dislexia.html` | artigo | não | sim (comentários) | real | 🟢 |
| 8 | Saúde Mental | `Recursos/autismo/saude.html` | artigo | não | sim (comentários) | real | 🟢 |
| 9 | Altas Habilidades | `Recursos/autismo/altas-abilidades.html` | artigo | não | sim (comentários) | real | 🟢 |
| 10 | Talentos | `Recursos/autismo/talentos.html` | artigo | não | sim (comentários) | real | 🟢 |
| 11 | Eventos | `Recursos/eventos.html` | agenda | não | **não** | **inventado** | 🔴 |
| 12 | Blog | `blog/blog.html` | lista editorial | não | não | **parcial** | 🔴 |
| 13 | Post: máscara | `blog/post-masking.html` | post real | não | sim (comentários) | real | 🟡 |
| 14 | Post: procrastinação | `blog/post-procrastinacao.html` | post real | não | sim (comentários) | real | 🟡 |
| 15 | Direitos | `Direitos/direitos.html` | 12 leis + formulário | não | sim (formulário) | real | 🟡 |
| 16 | Quem Somos | `Quem somos/quem-somos.html` | institucional | não | não | real | 🟢 |
| 17 | Contato | `Quem somos/CONTATE-NOS/contate.html` | institucional + form | não | não | real | 🟡 |
| 18 | Apoiar | `apoiar/apoiar.html` | doação | não | não | **visual só** | 🔴 |
| 19 | Loja | `loja/loja.html` | produtos | não | sim (`get_products`) | **inventado** | 🔴 |
| 20 | AcolherIA | `chat-Ia/chat-Ia.html` | chat com a Lia | não | Edge Function | real | 🟡 |
| 21 | Privacidade | `privacidade.html` | política | não | não | real | 🟡 |
| 22 | Termos | `termos.html` | termos | não | não | real | 🟡 |

## 2.2 Páginas que exigem conta

| # | Página | Caminho | Login | Status |
|---|---|---|---|---|
| 23 | Comunidade | `comunidade/comunidade.html` | sim para agir | 🟡 |
| 24 | Perfil | `comunidade/perfil.html` | sim | 🟡 |
| 25 | Perfil (amigo) | `comunidade/perfil-amigo.html` | sim | 🔴 *arquivo de 1,1 KB — praticamente vazio* |
| 26 | Grupos | `comunidade/grupo.html` | sim | 🟡 |
| 27 | Meus grupos | `comunidade/meus-grupos.html` | sim | 🟡 |
| 28 | Explorar grupos | `comunidade/explorar-grupos.html` | sim | 🟡 |
| 29 | Detalhes do canal | `comunidade/detalhes-canal.html` | sim | 🟡 |
| 30 | Conversas | `comunidade/conversas.html` | sim | 🟡 |
| 31 | Post | `comunidade/post.html` | sim | 🟡 |
| 32 | Chat | `comunidade/chat.html` | sim | 🟡 |
| 33 | Login | `login/login.html` | — | 🟡 |
| 34 | Redefinir senha | `login/redefinir-senha.html` | — | 🟡 *existe mas não é linkado de lugar nenhum* |
| 35 | Configurações | `configuracoes/configuracoes.html` | sim | 🟡 |

## 2.3 Páginas administrativas — **sem entrada na navegação**

| # | Painel | Caminho | Gate `is_admin` no cliente | Status |
|---|---|---|---|---|
| 36 | Painel admin | `painel-admin/painel.html` | **NENHUM** | 🔴 |
| 37 | Gerenciar loja | `configuracoes/gerenciarloja/loja.html` | não | 🟡 |
| 38 | SAC (atendimentos) | `configuracoes/PainelSac/sac.html` | não | 🟡 |
| 39 | Moderação | `configuracoes/moderação/moderação.html` | não | 🟡 |
| 40 | Eventos (admin) | `configuracoes/eventos/eventos.html` | não | 🟡 |
| 41 | Grupos (admin) | `configuracoes/grupos/grupo.html` | não | 🟡 |
| 42 | Arquivo de leis | `Direitos/arquivo3leis/arquivo.html` | não | ⚪ *não linkado de lugar nenhum* |

## 2.4 Arquivos que não deveriam estar aqui

| Arquivo | Bytes | Problema |
|---|---|---|
| `hacker-trap.html` | 12.042 | **veja seção 23.3 — não deveria ir para produção** |
| `img/Balões de diálogo…_files/` + `.html` | 6,4 MB em 77 arquivos | página salva do navegador, copiada para `dist/` |
| `comunidade/perfil-amigo.html` | 1.107 | página praticamente vazia, ainda linkada |

---

# 3. MAPA DAS ÁREAS

## 3.1 LANDING (`index.html`) — 🟡

**O que promete e o que entrega:**

| Promessa da landing | Existe? | Funciona? | Lacuna |
|---|---|---|---|
| "Explore tudo sem login" | sim | 🟢 | — |
| "4 áreas para explorar sem login" | sim | 🟢 | as 4 existem |
| "Uma comunidade **real** feita para pertencer e confiar" | sim | **NÃO** | 3 posts de teste no banco |
| "Sem login para ler / 100% gratuito" | sim | 🟢 | — |
| "Libras com VLibras" | sim | 🟡 | script carrega; widget depende de CDN externa |
| "Ajustes de acessibilidade" | sim | 🟢 | existe hub flutuante |
| "Fonte para dislexia" | sim | 🟢 | — |
| "O site **lembra em que você parou**" | **NÃO** | 🔴 | `reading-state.js` carrega **só no blog**; `reading-state.css` não é carregado por **nenhuma** página |
| "Guarde o que você leu" | parcial | 🟡 | mesma causa |
| "Junte-se às pessoas que **já encontraram** um lugar aqui" | — | — | não há pessoas reais |
| Login / Criar conta | sim | 🟢 | — |

**Achado grave:** a landing usa um bloco `espaco-banner` — altura medida em **0 px**. Existe como marcador de "aqui vai um banner", com `data-fundo` apontando para `/img/ilustracoes/A PAUSA VISUAL.jpg`, mas **não ocupa espaço nem aparece**. Há 8 deles em 6 páginas.

**Outro achado:** o texto do bloco diz *"Landing / entre a apresentacao e os numeros"*. É texto de rascunho interno, escapou para dentro de um elemento com `display: block`. Está no DOM; só não está visível porque o bloco tem altura 0.

## 3.2 INÍCIO (`inicio.html`) — 🟡

- Hero, carrossel, destaques, comunidade trending, blog, direitos, newsletter.
- Os 6 blocos de conteúdo estão presentes.
- **"Conteúdo claro sobre TDAH e Autismo"** → aponta para artigos que agora existem. 🟢
- **9 dos links do rodapé desta página apontam para `/direitos/direitos.html` em minúscula** — quebra em produção. 🔴
- O carrossel de comunidade tem 1 card marcado "sem destino" (`Ferramentas`, que não tem página). Honestamente sinalizado, mas é um card que não faz nada.
- **6 tags `<h1>`** nesta página (as outras páginas têm 1). Isso prejudica leitores de tela. 🟡

## 3.3 EXPLORAR (`Explorar/Explorar.html`) — 🟡

**Como produto (não como visual):**

- Entrada clara, 3 caminhos na dobra, recentes, FAQ. 🟢
- 3 cards ligados direto ao destino que o título anuncia (`post-masking.html`, `blog.html`, `eventos.html`). 🟢
- **Formulário de atendimento (SAC)**: conectado a `criar_atendimento` / `consultar_atendimento` / `responder_atendimento`. Não validei o fluxo completo ponta a ponta. ⚪
- Os 3 links-de-imagem dos cards que criamos antes estão com `aria-hidden="true" tabindex="-1"`. ✅ correto.
- **1 card "sem destino"**: *Avaliações de interesse e habilidade* → marcado como pendente. Não existe página de ferramentas/avaliações em lugar nenhum do site. 🟠
- **1 link quebrado em produção:** `/explorar/explorar.html` minúsculo (no rodapé desta própria página). 🔴

**Sobre a remoção da subnav:** conferi. Não sobrou link morto, âncora morta, referência órfã no JS nem elemento sem entrada. A remoção foi limpa. ✅

## 3.4 ARTIGOS E GUIAS — 🟢 (com 1 pendência)

**Revalidei o estado atual dos artigos — mudou desde a última rodada:**

| Arquivo | Antes | Agora | h1 | Fontes | Composição |
|---|---|---|---|---|---|
| `autismo.html` | correto | correto | 1 | — | original |
| `Tdah.html` | texto de autismo copiado | **corrigido** | 1 | 4 (CDC, NHS, APA, MS) | 3 eixos numerados |
| `dislexia.html` | texto de autismo copiado | **corrigido** | 1 | 3 (NHS, BDA, MEC) | grade de 6 recursos |
| `saude.html` | texto de autismo copiado | **corrigido** | 1 | 3 (OMS, MS, APA) | 6 cards de cuidado |
| `altas-abilidades.html` | texto de autismo copiado | **corrigido** | 1 | 2 (MEC, NAGC) | confronto 2 colunas |
| `talentos.html` | **vazio** | **corrigido** | 1 | 2 (NAGC, MEC) | 5 áreas de descoberta |

✅ Os 5 estão com conteúdo correspondente ao título. O problema apontado antes **está resolvido**.

**Pendências reais que restam:**
- `saude.html` tem **190 caracteres de `meta description`** — o limite saudável é 165. Cortará no Google.
- 5 títulos de artigo têm **>65 caracteres** (vão ser truncados nos resultados de busca).
- `autismo.html` é a única página de artigo **sem `<main>`**.
- Comentários existem em todas (tabela `comments` com 15 registros — todos de teste).

## 3.5 BLOG — 🔴

**Conteúdo:** 9 cards. Apenas **1** tem página real.

| # | Título | Destino | Real? |
|---|---|---|---|
| 1 | O dia em que você para de sobreviver | `post-masking.html` | 🟢 |
| 2 | Como tornar a comunicação mais inclusiva | `#` | 🔴 |
| 3 | Neurodivergência na infância | `#` | 🔴 |
| 4 | Descobrindo o extraordinário no comum | `#` | 🔴 |
| 5 | Autismo e Saúde Mental | `#` | 🔴 |
| 6 | Burnout em mães atípicas | `#` | 🔴 |
| 7 | **O método dos "5 minutos" para vencer a procrastinação** | `#` | 🔴 **a página EXISTE e não está ligada** |
| 8 | Como solicitar adaptações no trabalho | `#` | 🔴 |
| 9 | Comunicação alternativa e aumentativa | `#` | 🔴 |

**O caso do card 7 é o mais grave:** `blog/post-procrastinacao.html` foi criada com conteúdo editorial completo na última rodada, e o card do blog que anuncia exatamente esse título **continua apontando para `#`**. O conteúdo existe e está invisível.

**Vídeos:** 4 dos 9 cards têm `data-video-id="dQw4w9WgXcQ"`. Esse é o ID do vídeo "Never Gonna Give You Up" — o Rickroll clássico, largamente usado como placeholder. **Nenhum dos 4 aponta para um vídeo real.**

**Filtro por categoria:** os 8 chips (`todos`, `autismo`, `tdah`, `comunicacao`, `terapia`, `direitos`, `saude-mental`, `familia`) **funcionam** — o `blog.js` filtra por `data-category` e esconde com `card.hidden`. ✅ **Lacuna de produto:** os cards têm 9 categorias, sendo **uma delas `reflexao` que não tem chip correspondente**. Ao clicar em qualquer chip, o card de reflexão fica invisível e não há como achá-lo. Isso é uma lacuna de conteúdo, não um bug visual — está registrado como tal.

**Estados:** tem estado de carregamento e estado vazio ("Tente outra categoria ou volte para 'Todos'"). 🟢
**19 `href="#"`** — o número mais alto do site.

## 3.6 EVENTOS — 🔴

**Estrutura existe, conteúdo não.**

- 4 cards **hardcoded no HTML**. Nenhum dado vem do banco. `Recursos/eventos.js` só cuida de navbar e acessibilidade.
- Os 4 botões **"Inscrever-se"** são `<a href="#">` sem `onclick`. **Clicar não abre nada.** Não há formulário, não há modal de inscrição.
- Os 4 eventos **não têm ano**. Datas: 22 JUN, 05 JUL, 18 JUL, 10 AGO.
- Contadores de participantes (**23, 45, 67, 89**) não vêm de lugar nenhum.
- A tabela `events` do Supabase tem **6 registros**, todos de teste: `evento1`, `evento teste`, `evento`, `criar dad`, `nmnnjmmkb`, `eventos teste`. **3 sem link, 1 com link Google Meet inválido (`meet.google.com/gxx-eh`), 1 apontando para um vídeo do YouTube.** A página Eventos **não usa essa tabela**.

Resposta às 5 perguntas obrigatórias: **O que é?** sim (título). **Quando é?** com dia e mês, sem ano. **Onde é?** sim. **Quem organiza?** não. **Como participo?** não funciona.

## 3.7 SEUS DIREITOS — 🟡

**Revalidei o banco de 12 entradas (o número se confirma):**

| id | Título | Número | Categoria | Fonte |
|---|---|---|---|---|
| 1 | Lei Berenice Piana | 12.764/2012 | saúde | Planalto |
| 2 | Lei Brasileira de Inclusão (LBI) | 13.146/2015 | social | Planalto |
| 3 | Lei Romeo Mion | 13.977/2020 | social | Planalto |
| 4 | BPC | 8.742/1993 | social | Planalto |
| 5 | Lei de Cotas para PCD | 8.213/1991 | social | Planalto |
| 6 | Lei de Acessibilidade | **10.098/2004** ⚠️ | acessibilidade | Planalto |
| 7 | Lei da Libras | 10.436/2002 | acessibilidade | Planalto |
| 8 | Decreto de Acessibilidade | 5.296/2004 | acessibilidade | Planalto |
| 9 | Direito à Saúde Mental | 10.216/2001 | saúde | Planalto |
| 10 | **Lei do Acompanhante Terapêutico** | **13.146/2015** ⚠️ | educacional | Planalto |
| 11 | Lei da Educação Especial | 11.788/2008 | educacional | Planalto |
| 12 | Lei da Inclusão Profissional | 13.370/2016 | educacional | Planalto |

**Contagem:** 12 entradas → **11 documentos distintos** (10 leis + 1 decreto). A duplicidade 13.146/2015 se confirma: entradas 2 e 10 apontam para a mesma lei com nomes diferentes.

**Dois problemas de dado que a auditoria anterior não tinha registrado:**

1. **Entrada 6 tem o ano errado.** A Lei de Acessibilidade é a **Lei nº 10.098, de 19 de dezembro de 2000** — não 2004. (O ano 2004 vem do Decreto 5.296, que é a entrada 8.) A própria Lia do site respondeu "10.098/2000" — ou seja, **o site e a IA discordam, e quem está certo é a IA.** Isso precisa ser corrigido no banco.
2. **Entrada 10 não tem fundamento.** O título diz "Acompanhante Terapêutico" e aponta para a LBI, mas esse termo não é o usado na LBI — é "acompanhante especializado" (Lei 12.764/2012, Art. 3º, IV, §único), que já é a entrada 1. A entrada 10 está duplicando a 1 com nome errado.

**Tudo que é exibido tem link oficial para `planalto.gov.br`** — 11 URLs, todas no domínio oficial. ✅ Nenhuma informação jurídica inventada. ✅

**Conteúdo ausente (marcado como INCOMPLETO):** o banco tem `title`, `description`, `category`, `number`, `externalLink`. **Não tem** resumo do que a lei diz em linguagem simples, nem "o que perguntar", nem "onde pedir". A proposta editorial do site é "menos leis, mais orientação" — e isso ainda não existe no dado. **CONTEÚDO AUSENTE — NÃO INVENTAR.**

## 3.8 COMUNIDADE — 🟡 (a mais bem construída, a mais comprometida pelo dado)

Esta é a área mais importante da auditoria, e o resultado é dos mais paradoxais.

### 3.8.1 O sistema é real e completo

24 tabelas, 57 funções RPC/canais, realtime em comentários, posts, grupos, loja e SAC. Tratamento de erro com fallback em 69 pontos. Estados vazios escritos com cuidado.

### 3.8.2 O conteúdo é 100% teste

Consultei o banco por leitura direta. **Contagem real de registros:**

| Tabela | Registros | Natureza |
|---|---|---|
| `profiles` | **5** | usernames: `davidteste1`, `victorhugo`, `victorr`, `David`, `gustavo`. **`full_name` é NULL nos 5.** 3 de 5 com `is_admin = true`. |
| `posts` | **3** | conteúdo literal: **"post", "post", "post teste"**. `author_name` NULL nos 3. |
| `comments` | **15** | conteúdo literal: "teste", "oi", "post" (×7), "oiii", "otimo comentario", "Oi que maravilha" |
| `groups` | **5** | "Geral", "Amor NeuroDivergente", **"Ford Enter"** (conteúdo real de empresa, copiado), **"Minecraft"** (categoria `arte`), "comunidade geral" |
| `group_members` | 9 | — |
| `conversations` | 13 | incluindo uma **privada** chamada "victor" |
| `events` | 6 | "evento1", "evento teste", "evento", "criar dad", "nmnnjmmkb", "eventos teste" |
| `likes` | 2 | — |
| `messages` | **0** | |
| `saved_posts` | 0 | |
| `reactions` | 0 | |
| `friendships` | 0 | |
| `moderation_logs` | 2 | motivo "Discurso de ódio", descrição "dsadasdas" |
| `atendimentos` | 0 | |
| `mensagens` | 0 | |

**O próprio projeto confirma isso.** `sql/99_limpar_usuarios_de_teste.sql` lista 9 contas descartáveis ("testeapagar", "apagador", "longpress", "realtime1", "rapidtest", "latency", "dbg", "descobrir", "sonda_perfil"), mais 12 contas de teste do recurso "Encontrar mais pessoas" (`mari.neuro`, `rafa.l`, `ju.ds`, `breno.t`, `lina.pr`, `gabi.m`, `otavio.r`, `nina.c`), e **a senha do usuário principal em texto puro** (`Teste12345!`).

### 3.8.3 Tabelas que a interface usa mas que não existem

| Tabela | Status | Quem usa |
|---|---|---|
| `videos` | **404 — não existe** | `comunidade.js` |
| `avatars` | **404 — não existe** | `comunidade.js` |
| `reports` | **404 — não existe** | `moderation-integration.js` |

🔴 **Três funcionalidades declaradas no código apontam para tabelas inexistentes.**

### 3.8.4 Permissions (RLS) — testadas uma a uma

| Operação | Resultado | Leitura |
|---|---|---|
| `SELECT profiles` (sem login) | HTTP 200 | 🟡 dado público |
| `SELECT profiles.email` | retorna `null` | 🟢 RLS protege o e-mail |
| `SELECT posts` / `comments` / `groups` | HTTP 200 | 🟡 |
| `SELECT conversations` | HTTP 200, **13 conversas** | 🔴 metadados de conversa privada expostos |
| `SELECT account_deletion_log` | HTTP 200 (0 linhas) | 🔴 tabela privada legível |
| `SELECT moderation_logs` | HTTP 200 | 🔴 |
| `SELECT group_invites` | HTTP 200 | 🔴 códigos de convite legíveis |
| `SELECT atendimentos` | HTTP 200 | 🔴 |
| `INSERT posts` (anon) | **HTTP 409 / código 23503** | 🔴 **passou pelo RLS** |
| `INSERT comments` (anon) | HTTP 401 / 42501 | 🟢 bloqueado |
| RPC `admin_get_products` (anon) | **HTTP 200, 13 registros** | 🔴 |
| RPC `get_moderation_logs` (anon) | **HTTP 200, 2 registros** | 🔴 |
| `UPDATE posts` / `DELETE posts` | HTTP 204 | ⚪ RLS não rejeitou; não validei contra linha real |

O `INSERT` em `posts` falhou por **chave estrangeira inválida** (`23503`), não por RLS (`42501`). Isso significa que **a política de INSERT em `posts` está aberta para anônimo** — se alguém informar um UUID de usuário real, a inserção passa. É uma vulnerabilidade de spam/injeção no feed da comunidade.

## 3.9 ACOLHERIA / LIA — 🟡 (com um problema sério)

### 3.9.1 Qual caminho é o de produção

Existem **duas implementações** que se sobrepõem:

| Arquivo | Chama a Edge Function | Onde é carregado |
|---|---|---|
| `Acolher-IA/Acolher-IA.js` (38 KB) | **sim** | **11 páginas** (o widget flutuante) |
| `Acolher-IA/conversa.js` (17 KB) | **sim** | 1 página (`chat-Ia.html`) |
| `chat-Ia/chat-Ia.js` (31 KB) | **não** | 1 página (`chat-Ia.html`) |

**Resposta:** o caminho de produção é a **Edge Function `acolheria`**, chamada tanto pelo widget quanto pela página de chat. Testei no navegador: enviei "oi, teste de auditoria" pela página e **a Lia respondeu de verdade**. ✅

Efeito colateral da sobreposição: `chat-Ia.html` carrega `conversa.js` **e** `chat-Ia.js`, e **as duas imprimem uma saudação** na tela — "Oi! Eu sou a Lia. Que bom ter você aqui!" e "Olá! Eu sou a Lia. Como posso te ajudar hoje?". A pessoa vê a Lia se apresentar duas vezes. 🟡

### 3.9.2 É um LLM real

5 perguntas distintas, 5 respostas distintas e substantivas. Tempo entre 0,7 s e 1,8 s. Sabe fazer receita de bolo, responde "2+2 quanto é?" com "4.", define hiperfoco corretamente, entende linguagem ambígua e pede esclarecimento. **FUNCIONAL / PRODUÇÃO.**

### 3.9.3 🔴 PROBLEMA CRÍTICO: alucinação jurídica

| Pergunta | O que a Lia respondeu | Realidade |
|---|---|---|
| "O que é a Lei Berenice Piana?" (1ª vez) | "**Lei nº 14.435/2022**" | ❌ é a 12.764/2012 |
| "me dá o link oficial" | "**Lei nº 14.126**, de 20 de outubro de 2021" | ❌ |
| "me manda o link no planalto" | "**Lei nº 14.443, de 30 de setembro de 2022**" + link | ❌ |

**Verifiquei o link que ela inventou:** `https://www.planalto.gov.br/ccivil_03/_Ato2019-2022/2022/Lei/L14443.htm` — **existe de verdade no Planalto (HTTP 200)** e é a lei que "altera a Lei nº 9.263 para determinar prazo para oferecimento de métodos e técnicas contraceptivas e disciplinar condições de esterilização no âmbito do planejamento familiar."

Ou seja: a Lia gerou **um link oficial, real, verificável e completamente errado**, sobre planejamento familiar, e o apresentou ao usuário como a Lei Berenice Piana. Três perguntas iguais, três números diferentes. Isso não é imprecisão — é alucinação.

Numa plataforma de direitos, isso pode levar alguém a protocolar um pedido baseado na lei errada.

### 3.9.4 🔴 PROBLEMA CRÍTICO: a Edge Function responde sem chave nenhuma

```
POST /functions/v1/acolheria
sem header apikey, sem header Authorization
→ HTTP 200 {"answer":"Olá! Seja muito bem-vindo(a) ao nosso cantinho de acolhimento. 🌼..."}
```

**Não há autenticação e não há limite de taxa observável.** Qualquer pessoa — ou qualquer bot — pode chamar a função indefinidamente e consumir o orçamento do LLM. Num site hospedado em plano gratuito, isso é um risco financeiro e de indisponibilidade.

### 3.9.5 O resto

- Contrato: exige `message` (campo `mensagem` retorna HTTP 400 "Mensagem inválida."). `history` é opcional.
- O aviso "não faz diagnóstico e não substitui profissional" está presente na interface. ✅
- A página avisa que as conversas ficam salvas **localmente no aparelho** e que qualquer pessoa com acesso ao computador lê. ✅ Isso é honesto e rare.
- `Acolher-IA/seguranca.js` (25 KB) é carregado em 11 páginas e referencia `https://www.google.com/maps/search/`. Não auditei o conteúdo em profundidade. ⚪

## 3.10 LOJA — 🔴

**O usuário está vendo produtos inventados, e eles estão no banco.**

A RPC `get_products` devolve **13 produtos**. A lista de fallback local em `loja/loja.js` tem 6. **Os mesmos nomes de marca aparecem nos dois lugares** — o que indica que o fallback foi semeado no banco.

| Produto | Vendedor | Preço | Link |
|---|---|---|---|
| **"produto"** | **"dsdasdas"** | R$ 200,00 | `desktop.github.com/download` ← teste |
| Fidget Toy Cubo Infinito | FidgetBrasil | R$ 24,90 | `#` |
| Pulseira Mastigável | ChewyWear | R$ 19,90 | `#` |
| Relógio Timer Visual 60min | TimeManager | R$ 39,90 | `#` |
| Fone Bluetooth ANC | AudioPro | R$ 149,90 | `#` |
| Camiseta Orgulho Neurodivergente | NeuroStore | R$ 49,90 | `#` |
| Manta de Peso Sensorial 5kg | SensorPeso | R$ 199,90 | `#` |
| Prato com Divisórias | FoodFun | R$ 34,90 | `#` |
| Kit Cartões PECS | PECSCom | R$ 79,90 | `#` |
| Planejador Semanal | PlanPro | R$ 27,90 | `#` |
| Kit Massinha Sensorial | KidsPlay | R$ 34,90 | `#` |
| Abafador de Ruído Infantil | SafeEar | R$ 59,90 | `#` |
| Projetor de Estrelas | StarLight | R$ 79,90 | `#` |

**13 de 13 são fictícios.** Nenhum marketplace real (AliExpress, Shopee, Mercado Livre, Amazon) tem link — o campo está preenchido mas apontando para `#`. As estrelas e contadores de avaliação (215, 327, 303, 283, 456, 142 avaliações) são inventados.

**Achado estrutural:** existe a tabela `products` e existem **13 imagens** de produto — o sistema de loja está completo e funcionando. O que falta é o **dado real**.

**"Entrega rápida e frete grátis para todo Brasil"** aparece na página. Não há integração de frete. 🔴

## 3.11 APOIAR — 🔴

**SISTEMA VISUAL / SEM PAGAMENTO INTEGRADO.**

Cliquei em "Doar agora". O que aparece é:

```
<div class="qr-mock">      → "PIX — QR Code"
<div class="qr-placeholder"> → "PIX — QR Code"
```

O próprio código chama de **mock**. Não existe:
- chave PIX em lugar nenhum (`doações.js` não tem `pixKey` nem `CHAVE_PIX`)
- botão de copiar chave
- QR Code real (0 imagens de QR na página)
- qualquer gateway de pagamento (nenhuma menção a Stripe, Mercado Pago, PagSeguro, Pagar.me, Asaas ou PayPal)

Os 4 valores (R$ 10 / 25 / 50 / 100) e a frase *"Escolha o valor e doe com segurança via PIX"* criam a impressão de que a doação funciona.

## 3.12 LOGIN E CONTA — 🟡

**Ciclo implementado:** cadastro (`signUp`) → login (`signUp`/`signInWithPassword`) → sessão (Supabase Auth) → perfil → recuperação de senha (`resetPasswordForEmail`) → logout (`signOut`, em 4 arquivos).

**Problemas:**

1. 🔴 **O portão de login é uma flag no `localStorage`.** Em `auth-global.js`:
   ```js
   function isLoggedIn() { return localStorage.getItem('userLoggedIn') === 'true'; }
   ```
   Digitar `localStorage.userLoggedIn='true'` no console libera `/configuracoes/`. É uma trava de cliente. A proteção real tem que vir do RLS — e o teste mostrou que **não vem para `admin_get_products`, `get_moderation_logs`, `conversations`, `group_invites`, `atendimentos`, `account_deletion_log`**.

2. 🟡 **`login/redefinir-senha.html` existe mas não é linkado de `login.html`.** O usuário não tem como chegar lá pela interface.

3. 🟡 `login.js` não tem `onAuthStateChange` nem `getSession` — a sessão depende de `auth-global.js`.

4. 🟡 **`login.html` tem 4 `<h1>`** ("Volte para o seu espaço.", "Crie seu espaço.", "Acesso administrativo.", "Recuperar senha."). São quatro telas na mesma página.

5. 🟡 A tela **"Acesso administrativo."** existe dentro do login. Não validei para onde ela leva nem o que protege. ⚪

## 3.13 CONFIGURAÇÕES — 🟡

**9 abas, todas com estrutura real** (9 `tab-button` + 9 `panel-title` + 43 transições no CSS). Funcionalidades: perfil, senha, acessibilidade, leitura salva, idioma, conta, exclusão de conta (`deactivate_account` / `delete_account_immediately` / `cancel_account_deletion`).

**Não validei se cada aba salva de fato** — os scripts existem e estão conectados ao Supabase, mas o teste de escrita em cada uma não foi feito. ⚪

**Link quebrado em produção:** 2 ocorrências de `/direitos/direitos.html` e 2 de `/explorar/explorar.html` em minúscula nesta página. 🔴

**Painéis administrativos:** 6 painéis existem e **nenhum é alcançável pela navegação normal**. O `painel.js` **não tem nenhuma verificação de `is_admin`** — sem gate no cliente. Ver seção 23.3.

---

# 4. VARREDURA DE LINKS

| Tipo | Total | Quebrado |
|---|---|---|
| `href` interno para arquivo | todos | **0** ✅ |
| `href` interno para âncora | todos | **0** ✅ |
| `src` de imagem/CSS/JS | 43 | **4** 🔴 |
| `href="#"` (destino vazio) | **154** | — 🔴 |
| Referência a caminho com caixa errada | **36** em 18 arquivos | **todas** 🔴 |

## 4.1 O bug que só aparece em produção

**36 links em 18 arquivos apontam para caminhos em minúscula que só funcionam no Windows.**

| Link escrito | Existe como | Ocorrências |
|---|---|---|
| `/direitos/direitos.html` | `/Direitos/direitos.html` | **27 em 18 arquivos** |
| `/explorar/explorar.html` | `/Explorar/Explorar.html` | **9 em 8 arquivos** |

Arquivos afetados: `inicio.html` (×9), `Direitos/direitos.html`, `Explorar/Explorar.html`, `Quem somos/quem-somos.html`, `Quem somos/CONTATE-NOS/contate.html`, `Recursos/recursos.html`, `apoiar/apoiar.html`, `blog/blog.html`, `blog/post-masking.html`, `blog/post-procrastinacao.html`, `configuracoes/configuracoes.html`, `loja/loja.html`, e os 5 artigos de `Recursos/autismo/`.

Windows não diferencia maiúsculas de minúsculas em nomes de arquivo. **Netlify e Vercel rodam Linux, que diferencia.** Publicando hoje, **Direitos e Explorar — as duas páginas mais importantes do site — dariam 404 a partir de praticamente toda a navegação.**

Este foi o erro mais fácil de não ver e o mais caro.

## 4.2 Assets que não existem

| Arquivo | Onde é usado | Efeito |
|---|---|---|
| `artigo.js` | `blog/post-masking.html`, `blog/post-procrastinacao.html` | **404 em 2 páginas de leitura** |
| `/img/avatar-padrao.png` | **9 arquivos** — sidebar de todas as páginas + login | Avatar quebrado na sidebar |
| `/img/grupo-padrao.png` | `comunidade.js` | Imagem padrão de grupo quebrada |
| `/img/padrao.png` | `profile-sync-safe.js` | Imagem padrão de perfil quebrada |
| `/img/ilustracoes/A MARCA "VALIDAR".jpg` | `Direitos/direitos.html` | **HTTP 404 confirmado** — o arquivo em disco tem aspas tipográficas (`“ ”`), o HTML tem aspas retas (`&quot;`) |

## 4.3 Onde os 154 `href="#"` estão

| Página | Qtd. |
|---|---|
| `blog/blog.html` | 19 |
| `configuracoes/PainelSac/sac.html` | 16 |
| `loja/loja.html` | 9 |
| `Recursos/recursos.html` | 8 |
| `Dereitos/direitos.html`, `Recursos/eventos.html` | 6 cada |
| os 2 posts do blog, login, os 5 artigos, `configuracoes`, `grupo`,apoiar, Explorar, Quem Somos, Contato | 3–6 cada |

---

# 5. INVENTÁRIO DE DADOS DE DEMONSTRAÇÃO

| Área | Dado | Origem | Real? | Pode ficar? | Precisa substituir? |
|---|---|---|---|---|---|
| Comunidade | 3 posts ("post", "post", "post teste") | Supabase `posts` | **não** | não | **sim** |
| Comunidade | 15 comentários ("oi", "teste", "post"…) | Supabase `comments` | **não** | não | **sim** |
| Comunidade | 5 perfis (usernames de teste) | Supabase `profiles` | **não** | não | **sim** |
| Comunidade | 5 grupos ("Ford Enter", "Minecraft"…) | Supabase `groups` | **não** | não | **sim** |
| Comunidade | 13 conversas (1 privada) | Supabase `conversations` | **não** | não | **sim** |
| Comunidade | 2 logs de moderação ("dsadasdas") | Supabase `moderation_logs` | **não** | não | **sim** |
| Loja | 13 produtos fictícios | Supabase `products` (via RPC) | **não** | não | **sim** |
| Loja | 6 produtos de fallback | `loja/loja.js` `fallbackDB` | **não** | não | **sim** |
| Loja | "Frete grátis para todo Brasil" | HTML | **não** | não | **sim** |
| Loja | estrelas e nº de avaliações | banco | **não** | não | **sim** |
| Eventos | 4 cards de evento | HTML hardcoded | **não** | não | **sim** |
| Eventos | participantes 23/45/67/89 | HTML hardcoded | **não** | não | **sim** |
| Eventos | 6 registros de evento no banco | Supabase `events` | **não** | não | **sim** |
| Apoiar | QR Code "PIX" | `.qr-mock` no JS | **não** | não | **sim** |
| Apoiar | valores R$ 10/25/50/100 | HTML | decisão de projeto | sim | confirmar com o projeto |
| Blog | 4 cards com `data-video-id="dQw4w9WgXcQ"` | HTML | **placeholder** | não | **sim** |
| Blog | 8 cards sem página | HTML | **não** | não | **sim** |
| Direitos | 12 leis com link oficial | `direitos.js` | **sim** | sim | não |
| Direitos | entrada 10 "Acompanhante Terapêutico" | `direitos.js` | **suspensa** | não | **sim** |
| Direitos | entrada 6 ano 10.098/2004 | `direitos.js` | **erro** | não | **sim** |
| Artigos | 6 artigos | HTML | **sim** | sim | não |
| Blog | 2 posts | HTML | **sim** | sim | não |
| Institucionais | Quem Somos, Contato | HTML | **sim** | sim | não |
| Landing | copy de marketing | HTML | **sim** | sim | não |

**Nenhum texto de artigo, post ou lei foi inventado.** Todo o conteúdo editorial é real e tem fonte. O que é falso são **dados de comunidade, loja, evento e doação**.

---

# 6. CONTEÚDO QUE PRECISA SER PRODUZIDO

| Conteúdo | Existe? | Correto? | Tem fontes? | Tem imagem? | Página de destino? | Linkado? | Precisa revisão? |
|---|---|---|---|---|---|---|---|
| Artigo TDAH | ✅ | ✅ | ✅ 4 | ✅ | ✅ | ✅ | não |
| Artigo Dislexia | ✅ | ✅ | ✅ 3 | ✅ | ✅ | ✅ | não |
| Artigo Saúde Mental | ✅ | ✅ | ✅ 3 | ✅ | ✅ | ✅ | não |
| Artigo Altas Habilidades | ✅ | ✅ | ✅ 2 | ✅ | ✅ | ✅ | não |
| Artigo Talentos | ✅ | ✅ | ✅ 2 | ✅ | ✅ | **parcial** — ligado por uma carta, não pelo índice | não |
| Post procrastinação | ✅ | ✅ | n/a | ✅ | ✅ | **NÃO** — o card do blog aponta para `#` | não |
| Quem Somos | ✅ | ✅ | n/a | ✅ | ✅ | ✅ 21 páginas | não |
| Contato | ✅ | ✅ | n/a | ✅ | ✅ | ✅ 20 páginas | não |
| **Resumo de cada lei em linguagem simples** | ❌ | — | — | — | — | — | **CONTEÚDO AUSENTE** |
| **"O que pedir / onde pedir" por lei** | ❌ | — | — | — | — | — | **CONTEÚDO AUSENTE** |
| **Página de Ferramentas** | ❌ | — | — | — | — | carta marcada "sem destino" | **FALTA** |
| **8 posts do blog** | ❌ | — | — | — | — | cards apontam para `#` | **FALTA** |
| **Agenda de eventos real** | ❌ | — | — | — | — | — | **FALTA** |

---

# 7. JORNADAS DO USUÁRIO

## Jornada 1 — "Quero entender TDAH"

```
Entrada → Início → (rodapé/Explorar) → Artigos → TDAH
```
🟡 **A pessoa chega, mas o último passo quebra em produção.** O rodapé da home aponta para `/explorar/explorar.html` (minúsculo). Corrigido o caminho, a jornada funciona: 3 cards no Explorar → Artigos → o card "Talentos" vai para a página certa, e os 5 artigos estão linkados por categoria. **Se perder:** em "Artigos e Guias" o visitante vê 5 categorias e 3 cards de tópico marcados "sem destino" — ele pode achar que o site está quebrado.

## Jornada 2 — "Quero saber meus direitos"

```
Entrada → Direitos → categoria → lei → fonte oficial
```
🟡 **A jornada funciona tecnicamente.** 4 categorias filtram, a busca funciona, "nenhum resultado" existe, e cada lei abre o Planalto. **Onde a pessoa se perde:** ao ler, ela descobre que a lei só tem **título e uma linha de descrição**. Não há o que fazer, nem onde pedir, nem em linguagem simples. A proposta editorial ("menos leis, mais orientação") **não está no dado**. E a Lia, que deveria orientations, dá informação errada.

## Jornada 3 — "Quero conversar com pessoas"

```
Entrada → Comunidade → Fórum/Grupo
```
🔴 **A comunidade parece morta, e depois parece falsa.** Sem login, a pessoa vê a tela e os estados vazios: *"Nenhum post ainda"*. Depois, ao criar conta e entrar, ela vê **3 posts que dizem "post"** e **comentários que dizem "oi"**. A landing dizia "comunidade real". É o momento em que a promessa quebra.

## Jornada 4 — "Quero encontrar um evento"

```
Entrada → Eventos → evento → inscrição
```
🔴 **Quebra na metade.** Os 4 cards parecem reais. Clicar em "Inscrever-se" **não faz absolutamente nada**. Não há a quem perguntar, nenhum local em 3 dos 4, nenhum organizador. Para quem realmente procurou um grupo de apoio, é o pior resultado possível: uma promessa vazia.

## Jornada 5 — "Quero conversar com a Lia"

```
Entrada → AcolherIA → mensagem → resposta
```
🟡 **Funciona de ponta a ponta.** Testei no navegador: mensagem enviada, resposta recebida em segundos. **Mas:** a Lia se apresenta **duas vezes** por causa dos dois scripts que se sobrepõem, e **a resposta sobre leis pode estar errada** (seção 3.9.3).

## Jornada 6 — "Quero apoiar o projeto"

```
Entrada → Apoiar → forma de apoio
```
🔴 **Termina em um QR code falso.** Escolhe o valor, clica em "Doar agora", aparece um retângulo escrito "PIX — QR Code" gerado por uma classe chamada `qr-mock`. Não há chave PIX, não há como copiar, não há pagamento. A pessoa que decidiu apoiar **não consegue**.

---

# 8. ESTADOS VAZIOS

Auditei 41 páginas em HTML + JS + CSS. **A parte mais forte é o ponto mais forte do projeto.**

| Página | Carregando | Vazio | Erro | Sem login | Sem resultado |
|---|---|---|---|---|---|
| Comunidade (todos os arquivos) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Loja | ✅ | ✅ | ✅ | ✅ | ✅ |
| Blog | ✅ | ✅ | ✅ | ✅ | ✅ |
| Direitos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chat / AcolherIA | ✅ | ✅ | ✅ | ✅ | — |
| Explorar | ✅ | ✅ | ✅ | ✅ | ✅ |
| Configurações | ✅ | ✅ | ✅ | ✅ | — |
| 5 painéis admin | ✅ | ✅ | ✅ | — | — |
| **6 páginas** | ✅ | **❌** | ✅ | — | — |

**Textos de estado vazio que existem e estão bem escritos:**
"Nenhum post ainda" · "Nenhum grupo disponível" · "Nenhuma mensagem ainda" · "Nenhum comentário ainda. Seja o primeiro!" · "Nenhum evento agendado" · "Ainda não há publicações" · "Nenhum grupo por aqui" · "Tente outra categoria ou volte para 'Todos'."

**As 6 páginas sem estado vazio:** `Direitos/arquivo3leis/arquivo.html`, `hacker-trap.html`, `login/redefinir-senha.html`, `configuracoes/PainelSac/sac.html`, `configuracoes/gerenciarloja/loja.html`, `configuracoes/moderação/moderação.html`.

## 8.1 O problema dos estados vazios na Comunidade

Existem os estados vazios — e é por isso que o problema é mais agudo. A primeira visita vê "Nenhum post ainda", que é **honesto**. Depois de criar conta, a pessoa passa a ver "post". O estado vazio não está errado; **o dado que ele esconde está errado.**

---

# 9. ACESSIBILIDADE

## 9.1 O que está bom

- `lang="pt-BR"` em **43 de 43** páginas ✅
- `VLibras` carregado em **40** páginas ✅
- `UserWay` carregado em **40** páginas ✅
- "Pular para o conteúdo" em **29** páginas ✅
- `movimento-reduzido.css` carregado em 37 páginas, com a guarda correta ✅
- `movimento-reduzido.css` + pausas-visuais.css cobrem o essencial

## 9.2 Problemas encontrados

| Problema | Onde | Gravidade |
|---|---|---|
| **16 folhas de estilo com animação/transição e sem guarda de movimento reduzido** | `comunidade.css` (6 animações, 50 transições), `loja.css`, `blog.css`, `direitos.css`, `doacoes.css`, `recursos.css`, `perfil.css`, `painel.css`, `sac.css`, `eventos.css`, `grupo.css`, `moderacao.css`, `post-masking.css`, `carrossel.css`, `eventos.css`, `busca.css` | 🟡 — parcialmente mitigado por `movimento-reduzido.css` global, mas o guard por arquivo não existe |
| `scrollTo({behavior:'smooth'})` sem checar `prefers-reduced-motion` | `Explorar.js` (×4), `blog.js` (×2), `direitos.js`, `doacoes.js` | 🟡 |
| **Nenhuma página tem `canonical`** | 43 de 43 | 🟠 |
| **Nenhuma página tem Open Graph** (`og:title`, `og:description`, `og:image`) | 43 de 43 | 🟠 |
| **Só 12 páginas de 43 têm favicon** | 31 sem | 🟡 |
| 6 páginas sem `<h1>` | chat-Ia, comunidade, comunidade/chat, comunidade/conversas, comunidade/perfil-amigo, loja | 🟡 |
| `inicio.html` com **6 `<h1>`** | 1 página | 🟡 |
| `login.html` com **4 `<h1>`**; `redefinir-senha.html` com **3** | 2 páginas | 🟡 |
| 5 páginas sem `<main>` | `autismo.html`, `arquivo.html`, `gerenciarloja/loja.html`, `hacker-trap.html`, `redefinir-senha.html` | 🟡 |
| 10 páginas sem `meta description` | configuração, painéis, hacker-trap, redefinir-senha, perfil-amigo | 🟡 |
| 8 `description` curtas (<60 chars) | comunidade (6), login | 🟡 |
| 1 `description` longa (190 chars) | `Tdah.html` | 🟡 |

## 9.3 Sobre os plugins

`userway.js` (5,4 KB) e `vlibras.js` (2,2 KB) são carregadores de widget externo. `Acessibilidade.js` (4,9 KB) existe **mas não é carregado por nenhuma página** — código morto.

**Presença de plugin não é acessibilidade.** A `Acolher-IA/seguranca.js` (25 KB) é carregada em 11 páginas e não foi auditada em profundidade. ⚪

## 9.4 O que ainda NÃO validei

- Contraste real (WCAG AA) — medir com ferramenta dedicada
- Navegação 100% por teclado em menus, modal e carousel
- Comportamento de leitor de tela nos painéis e no chat
- Foco visível em todos os estados
- **NÃO VALIDADO** — não tenho como medir isso com a precisão que exige

---

# 10. RESPONSIVIDADE

⚪ **NÃO VALIDADO nesta etapa.** A medição em 7 larguras (360/390/600/768/1024/1280/1440) para 12 páginas está em curso e será incorporada como adendo.

O que já sei por inspeção estática:
- `movimento-reduzido.css` e as media queries existem em `inicio.css`, `blog-fluxo.css`, `recursos-editorial.css`, `direitos-percurso.css`, `chat-Ia.css`, `login.css`, `landing.css` — as camadas novas têm guarda de breakpoint.
- As camadas antigas (`comunidade.css`, `loja.css`, `blog.css`) têm media queries mas **não** têm a guarda de movimento reduzido.

---

# 11. SEO

| Item | Cobertura |
|---|---|
| `<title>` preenchido | 43 de 43 ✅ |
| `<title>` único | 40 de 43 — **3 compartilham "Comunidade — Amor NeuroDivergente"** 🟡 |
| `<title>` com tamanho saudável (<65) | 35 de 43 — **8 longos** (69 a 91 chars) 🟡 |
| `meta description` | 33 de 43 — **10 ausentes** 🟡 |
| `canonical` | **0 de 43** 🔴 |
| Open Graph | **0 de 43** 🔴 |
| `og:image` | **0 de 43** 🔴 |
| favicon | 12 de 43 🟡 |
| `meta robots` | 0 de 43 |
| `sitemap.xml` | **não existe** 🔴 |
| `robots.txt` | **não existe** 🔴 |
| `<html lang>` correto | 43 de 43 ✅ |
| 1 `<h1>` por página | 33 de 43 🟡 |

**Para compartilhamento em redes sociais:** sem Open Graph, um link do site no WhatsApp ou no Facebook não mostra título, descrição nem imagem. Para um projeto que depende de Boca a boca, isso é perder o principal ponto de conversão.

---

# 12. SEGURANÇA

Chaves não reproduzidas aqui.

| # | Achado | Classificação |
|---|---|---|
| 1 | **A Edge Function `acolheria` responde HTTP 200 sem nenhuma chave de autenticação.** Sem limite de taxa observável. | 🔴 **CRÍTICO** |
| 2 | **RPC `admin_get_products` retorna 13 registros para a anon key.** Dado administrativo sem autenticação. | 🔴 **CRÍTICO** |
| 3 | **RPC `get_moderation_logs` retorna registros para a anon key** — inclui `reporter_name`, `description`, `target_id`. Quem denunciou o quê. | 🔴 **CRÍTICO** |
| 4 | **`INSERT` em `posts` passa pelo RLS** (falhou só por chave estrangeira). Um atacante pode injetar posts na comunidade informando um UUID válido. | 🔴 **CRÍTICO** |
| 5 | **A Lia alucina números de lei e gera links oficiais errados** (seção 3.9.3). | 🔴 **CRÍTICO** |
| 6 | **`conversations` legível sem login** — inclui uma conversa **privada**. Numa comunidade de saúde mental, quem fala com quem é dado sensível. | 🔴 **ALTO** |
| 7 | **Tabelas privadas legíveis sem autenticação:** `account_deletion_log`, `moderation_logs`, `group_invites` (códigos de convite), `atendimentos`, `mensagens`, `attack_logs`. Todas respondem HTTP 200. Estão vazias hoje — **não estarão amanhã**. | 🔴 **ALTO** |
| 8 | **`painel.js` não tem nenhuma verificação de `is_admin`.** A proteção é 100% RLS. | 🔴 **ALTO** |
| 9 | **Login por flag de `localStorage`** (`userLoggedIn === 'true'`). Trivialmente burlável. | 🟠 **MÉDIO** (o risco real depende do RLS — e o RLS está furado nos itens 2, 3, 6, 7) |
| 10 | **3 tabelas referenciadas no código não existem:** `videos`, `avatars`, `reports`. Funcionalidade declarada sem backend. | 🟠 **MÉDIO** |
| 11 | **Senha de teste em texto puro no repositório:** `Teste12345!` em `sql/99_limpar_usuarios_de_teste.sql`. | 🟠 **MÉDIO** |
| 12 | **A pasta `sql/` (17 arquivos, 119 KB) é publicada em produção.** `build.js` pula `supabase` mas não pula `sql`. Expõe o schema e as migrações. | 🟡 **BAIXO** |
| 13 | `hacker-trap.html` — ver 12.3. | 🟠 **MÉDIO** |

## 12.1 Sobre a chave do Supabase

- A chave é do tipo novo **`sb_publishable_`**, que **foi criada para ser pública**. Não é vazamento. ✅
- `.env` **está no `.gitignore` e não está no git.** ✅
- **Porém: a chave está hardcoded em 29 arquivos HTML.** O mecanismo de injeção de `build.js` (`%VITE_SUPABASE_URL%`) é **código morto** — nenhum arquivo usa o placeholder. Consequência prática: **rotacionar a chave significa editar 29 arquivos.**

## 12.2 O que está protegido ✅

- `profiles.email` retorna `null` para a anon key — RLS protege o e-mail.
- `INSERT` em `comments` é bloqueado (`42501`).
- Formulários não gravam nada localmente sem ação do usuário.

## 12.3 `hacker-trap.html` — 🔴 não deve ir para produção

Esta página afirma ao usuário:
> "Enquanto você tentava invidar nosso sistema, nós já estávamos rastreando você!"
> "Seu IP foi registrado: **192.168.1.42**"
> "Log enviado para: Administrador do site"
> "Tentativa de XSS/SQL Injection detectada"

**O que o código faz:**
1. **Exibe um IP falso** — `'192.168.1.' + Math.floor(Math.random() * 255)`. Não descobre o IP de ninguém. Está mentindo para o usuário.
2. **Impede voltar** — `history.pushState` em loop no evento `popstate`, com o comentário `// Impedir voltar`.
3. Tenta gravar em `attack_logs` via `window.parent.supabaseClient` — **que não existe no escopo desta página**. O INSERT nunca acontece. É código morto que aparenta funcionar.
4. Roda 50 partículas animadas + um contador que **só sobe** (nunca mostra "horas" além de um minuto), sem guarda de movimento reduzido.
5. **Não é linkada de lugar nenhum.**

**Problema:** publicar uma página que mostra um IP inventado a quem a visita, diz que está "rastreando" e bloqueia o botão voltar é risco de reputação e de conformidade, especialmente num site sobre pessoas neurodivergentes. A versão honesta do mesmo recurso seria uma página de erro 404 real com uma mensagem de "não encontramos esta página".

## 12.4 Falta revisar

- `XSS`: não auditei se `escapeHtml` cobre todos os pontos de injeção. Há função `escapeHtml` em uso, mas `comunidade.js` tem 219 KB.
- Uploads: não validados.
- Moderação automática: `moderation-integration.js` (36 KB) não auditado em profundidade. ⚪

---

# 13. DEPLOY

## 13.1 Duas configurações que não concordam

| | Netlify | Vercel |
|---|---|---|
| Build | `npm run build` (`node build.js`) | **vazio** |
| Publica | `dist/` | **`.` (a raiz)** |

🔴 **Se publicar na Vercel hoje, o usuário recebe a raiz do repositório** — incluindo `.git`? (não, mas sim `node_modules`, `sql/`, `server.js`, `package.json`, a pasta de 6,4 MB de página salva, e `hacker-trap.html`). E **não recebe a substituição de variáveis**, porque `buildCommand` está vazio.

## 13.2 `dist/` está desatualizado

| | |
|---|---|
| Última modificação em `dist/` | **02/10/2026 20:52** (6 dias atrás) |
| `dist/Quem somos/quem-somos.html` | **não existe** |
| `dist/Quem somos/CONTATE-NOS/contate.html` | **não existe** |
| `dist/blog/post-procrastinacao.html` | **não existe** |
| `dist/Recursos/autismo/talentos.html` | existe (o arquivo antigo) |

🔴 **A pasta `dist/` não reflete o estado atual.** `build.js` faz `rmSync` e recopia tudo, então **rodar `npm run build` regenera corretamente**. O risco é publicar o `dist/` velho.

## 13.3 O que `build.js` copia para produção

✅ Copia corretamente. Pula `.git`, `.env`, `node_modules`, `dist`, `build.js`, `server.js`, `package.json`, `supabase`.

🔴 **Não pula:**
- `sql/` — 17 arquivos de migração publicados
- `img/Balões de diálogo…_files/` + `.html` — **6,4 MB de página salva do navegador**
- `hacker-trap.html`
- `comunidade/perfil-amigo.html` (1,1 KB, página vazia)

## 13.4 Resposta à pergunta

> **Se eu publicar hoje, o usuário verá exatamente a versão que estamos vendo no desenvolvimento?**

**NÃO.** Três razões:
1. O `dist/` no disco é de 6 dias atrás e não contém as 3 páginas mais recentes.
2. Na **Vercel**, a configuração publica a raiz — resultado completamente diferente.
3. **Se o `dist/` for regenerado**, os 36 links com caixa errada (`/direitos/`, `/explorar/`) passarão a dar **404** em produção, porque Netlify e Vercel rodam Linux.

**Resposta curta: publicando no Netlify com `npm run build`, o usuário vê a versão certa — exceto que Direitos e Explorar estarão quebrados a partir de quase todo o site.**

## 13.5 Tamanho

| | |
|---|---|
| Site total (sem `.git`/`node_modules`/`dist`) | **27,3 MB** em 350 arquivos |
| Só a pasta de lixo da página salva | **6,4 MB** (23%) |
| Arquivos acima de 1 MB | 7 (2,0 MB + 1,96 MB + 1,63 MB + 1,54 MB + 1,22 MB + 1,06 MB + 1,05 MB) |

---

# 14. CÓDIGO MORTO / DUPLICADO

| Item | Onde | Observação |
|---|---|---|
| `Acessibilidade.js` (4,9 KB) | raiz | **nenhuma página carrega** |
| `reading-state.css` (515 B) | raiz | **nenhuma página carrega** — mas o JS injeta as classes que ele estiliza |
| `hacker-trap.html` (12 KB) | raiz | código morto + risco (12.3) |
| `Direitos/arquivo3leis/arquivo.html` (27 KB) | pasta | não linkado |
| `comunidade/perfil-amigo.html` (1,1 KB) | pasta | página vazia, ainda linkada |
| `sql/99_limpar_usuarios_de_teste.sql` | pasta | contém senha de teste |
| 6 tabelas inexistentes no código | `videos`, `avatars`, `reports` | chamadas que retornam 404 |
| Mecanismo `%VITE_SUPABASE%` de `build.js` | `build.js` | **morto** — a chave está hardcoded em 29 arquivos |
| `video-modal` do blog | `blog.js` | lightbox pronto para vídeos que não existem |
| `fallbackDB` da loja (6 produtos) | `loja/loja.js` | 12 dos 13 "produtos" do banco são estes mesmos |
| `chat-Ia.js` (31 KB) + `conversa.js` (17 KB) | `chat-Ia.html` | **duas implementações de chat na mesma página** |

**Duplicidade de scripts:** não encontrei script carregado duas vezes na mesma página, exceto o par de chat acima.

---

# 15. IMAGENS E ASSETS

| | |
|---|---|
| Arquivos de imagem no projeto | 98 |
| Referenciados por HTML/JS/CSS | 53 |
| **Não referenciados** | **52 — somando 8,2 MB** |
| Externas (URL) | 0 (as imagens de hero vêm de `src` em HTML, contadas como strings; ver observação) |

**Maiores arquivos não usados:**
`img/camisas100.png` (1,96 MB) · `img/mulher.png` (1,63 MB) · `img/ilustracoes/lia-gif-chibi.gif` (1,05 MB) · `img/ilustracoes/A CADEIRA VAZIA.jpeg` (199 KB) · `img/ilustracoes/A CADEIRA VAZIA.jpg` (133 KB, **duplicata**) · `img/ilustracoes/A MARCA "VALIDAR".jpg` (131 KB, **com aspas erradas — não carrega**) · `img/ilustracoes/COMUNIDADE VAZIA.jpg` · `img/ilustracoes/Ilustração Fale Conosco.jpg` e `.png` (**mesma ilustração, dois formatos**) · `img/ilustracoes/lia-chibi.jpg` e `.png` (**duplicatas**) · 3 cópias de `img/community-hero-CbAAq485` **com nomes diferentes** (`(1)`, `- Copia`, original) · 3 cópias de `blog-post-1/2/3` **com e sem `- Copia`**.

**Nenhuma imagem foi gerada nesta auditoria. Nenhum asset foi excluído.**

**Sobre `alt`:** nas páginas do site, 0 imagens sem `alt`. Nos artigos e blog, `alt` está preenchido. ✅

---

# 16. O QUE O SITE PROMETE VS. O QUE ENTREGA

| Promessa | Existe? | Funciona? | Lacuna |
|---|---|---|---|
| **Comunidade** | sim | **parcial** | 🔴 dado 100% teste; 3 tabelas ausentes |
| **Eventos** | sim | **não** | 🔴 4 eventos inventados; inscrição não faz nada |
| **Direitos** | sim | **parcial** | 🟡 funciona; falta o conteúdo de orientação; 1 ano errado; 1 entrada duplicada; Lia discorda do site |
| **Blog** | sim | **parcial** | 🔴 8 de 9 cards sem página; 4 vídeos são placeholder |
| **AcolherIA** | sim | **sim** | 🟡 funciona ponta a ponta; alucina lei; sem autenticação |
| **Loja** | sim | **parcial** | 🔴 13 produtos fictícios; nenhum link real; frete prometido e inexistente |
| **Apoiar** | sim | **não** | 🔴 QR code mock; sem pagamento |
| **Artigos** | sim | **sim** | 🟢 6 artigos corretos com fontes |
| **"O site lembra onde você parou"** | não | **não** | 🔴 CSS órfão, JS só no blog |
| **"Comunidade real"** | sim | **não** | 🔴 banco com 3 posts "post" |
| **"100% gratuito"** | sim | 🟢 | verdade |
| **"Sem login para ler"** | sim | 🟢 | verdade |
| **"VLibras"** | sim | 🟡 | carrega de CDN externa |
| **Ferramentas para o dia a dia** | não | **não** | 🔴 página não existe; 3 cartas marcadas "sem destino" |

---

# 17. P0 — BLOQUEIA A ENTREGA

**9 itens.** Cada um destes faz o produto parecer quebrado, falso ou inseguro.

### P0-1 🔴 Direitos e Explorar dão 404 em produção
**36 links em 18 arquivos** apontam para `/direitos/direitos.html` e `/explorar/explorar.html` em minúscula. As pastas são `Direitos/` e `Explorar/`. Funciona no Windows, quebra em Linux. **Afeta a navegação de 18 das 43 páginas, incluindo 9 links no rodapé da home.**
*Correção:* ajustar a caixa em 27 + 9 lugares. ~30 minutos de trabalho.

### P0-2 🔴 A Lia alucina informação jurídica e gera links oficiais errados
3 perguntas sobre a mesma lei → 3 números diferentes. Um dos links "oficiais" que ela gerou **existe no Planalto** e é a lei do planejamento familiar. Num site de direitos, isso pode fazer alguém protocolar um pedido errado.
*Correção:* a Edge Function precisa de_system prompt_ que force: (a) responder **apenas** com as leis do banco `direitos.js`; (b) **nunca** gerar URL do Planalto — só citar o número e dizer "consulte o texto oficial no Planalto"; (c) quando não souber, dizer que não sabe.

### P0-3 🔴 A Edge Function responde sem nenhuma autenticação
HTTP 200 sem `apikey` e sem `Authorization`. Sem limite de taxa observável. Qualquer bot pode consumir o LLM.
*Correção:* exigir JWT no header e adicionar rate limit (por IP e por usuário).

### P0-4 🔴 Dados de demonstração visíveis como se fossem reais
Comunidade (3 posts "post", 15 comentários "oi", 5 grupos "Ford Enter"/"Minecraft"), Loja (13 produtos fictícios com preço e avaliação), Eventos (4 eventos inventados com 89 participantes).
*Correção:* limpar as tabelas e colocar os estados vazios — que **já existem e estão bem escritos**.

### P0-5 🔴 Loja apresenta produtos fictícios com preço, nota e número de avaliações
13 de 13. 12 com `link: "#"`. "Frete grátis para todo Brasil" sem integração de frete.
*Correção:* limpar `products` ou colocar link de marketplace real em cada item.

### P0-6 🔴 Inscrição em evento não funciona
Os 4 botões são `<a href="#">` sem `onclick`. Clicar não abre nada. Para quem procura grupo de apoio, é a pior falha possível do site.
*Correção:* ou ligar a inscrição (formulário + `event_participants`), ou remover a página da navegação até ter eventos reais.

### P0-7 🔴 Apoiar: QR Code de mentira
`.qr-mock` com o texto "PIX — QR Code". Sem chave PIX, sem botão de copiar, sem gateway. A pessoa que decidiu apoiar não consegue doar.
*Correção:* inserir chave PIX real e gerar QR, ou remover o botão e escrever claramente que o/doação está em construção.

### P0-8 🔴 Vazamento de dado administrativo por RPC sem autenticação
`admin_get_products` (13 registros) e `get_moderation_logs` (com nome de quem denunciou) respondem à anon key.
*Correção:* revogar `EXECUTE` de `anon` nessas funções no Supabase.

### P0-9 🔴 Inserção anônima em `posts` permitida pelo RLS
O `INSERT` falhou por chave estrangeira (`23503`), não por política (`42501`). Um UUID válido passa.
*Correção:* reescrever a política de INSERT em `posts` para exigir `auth.uid() = author_id`.

---

# 18. P1 — RESOLVER ANTES DO VÍDEO PITCH

**11 itens.** Prejudicam a demonstração.

| # | Item |
|---|---|
| P1-1 | **Blog: 8 de 9 cards sem página**, incluindo o da procrastinação que **já existe**. Conectar o card 7 é 1 linha. |
| P1-2 | **4 vídeos com `dQw4w9WgXcQ`** (Rickroll). Trocar por vídeo real ou remover o atributo. |
| P1-3 | **Chip `reflexao` faltando** — um card fica invisível sem forma de achá-lo. |
| P1-4 | **A Lia se apresenta duas vezes** na página de chat (dois scripts sobrepostos). |
| P1-5 | **Direitos: entrada 6 com ano errado** (10.098/2004 → 2000) e **entrada 10 duplicando a 1** com nome errado. |
| P1-6 | **Direitos sem conteúdo de orientação** — só título e uma linha. A proposta editorial não está no dado. |
| P1-7 | **`hacker-trap.html`** — página de IP falso no deploy. Remover. |
| P1-8 | **3 tabelas inexistentes** (`videos`, `avatars`, `reports`) generates erro 404 em runtime. |
| P1-9 | **`artigo.js` inexistente** — 404 nas 2 páginas de leitura. |
| P1-10 | **"O site lembra onde você parou" não funciona** — `reading-state.css` não é carregado por ninguém. Ou implementa ou tira da copy da landing. |
| P1-11 | **SEO para compartilhamento**: 0 canonical, 0 Open Graph, sem `sitemap.xml`, sem `robots.txt`. Sem isso, um link no WhatsApp não mostra nada. |

---

# 19. P2 — PODE FICAR PARA DEPOIS

| # | Item |
|---|---|
| P2-1 | 8,2 MB de imagens não usadas (3 arquivos acima de 1 MB) |
| P2-2 | Duplicatas de imagem: 3× `community-hero`, 3× `blog-post-1/2/3` (com e sem `- Copia`), `A CADEIRA VAZIA` em 2 formatos, `lia-chibi` em 2 formatos |
| P2-3 | 6,4 MB de página salva do navegador sendo publicada em produção |
| P2-4 | `sql/` publicado em produção (exposição de schema) |
| P2-5 | Código morto: `Acessibilidade.js`, `reading-state.css`, `arquivo.html`, `perfil-amigo.html` |
| P2-6 | Vercel mal configurada (`buildCommand` vazio, publica a raiz) |
| P2-7 | `dist/` desatualizado (resolvido com `npm run build`) |
| P2-8 | 154 `href="#"` remanescentes |
| P2-9 | 16 folhas CSS sem guarda de movimento reduzido |
| P2-10 | 4 imagens quebradas: `avatar-padrao.png` (9 arquivos), `grupo-padrao.png`, `padrao.png`, `A MARCA "VALIDAR".jpg` |
| P2-11 | 3 páginas de artigo com `title` > 65 caracteres |
| P2-12 | 8 `description` curtas, 1 longa (190 chars), 10 ausentes |
| P2-13 | `inicio.html` com 6 `<h1>`; `login.html` com 4; 6 páginas sem `<h1>` |
| P2-14 | 5 páginas sem `<main>` |
| P2-15 | 31 páginas sem favicon |
| P2-16 | `redefinir-senha.html` existe mas não é linkado |
| P2-17 | `login` por flag de `localStorage` (depois de fechar os P0 de RLS) |
| P2-18 | 8 `espaco-banner` com altura 0 |
| P2-19 | 3 cartas de tópico marcadas "sem destino" (Ferramentas, Avaliações, Aprimorar habilidades) |
| P2-20 | Tipos de arquivo quebrando no Windows: `saude.html` vs `saúde.html` — resolvido, mas o padrão de nomenclatura inconsistente deve ser padronizado |

---

# 20. O QUE PRECISA DE DADO REAL

**Nenhum item abaixo pode ser inventado por-development. Todos precisam de decisão do projeto.**

## Conteúdo editorial
- Os 8 posts de blog que os cards já anunciam (títulos definidos)
- Os 4 vídeos reais que substituem o placeholder
- Resumo em linguagem simples de cada uma das 11 leis
- "O que pedir" e "onde pedir" por situação (educação, trabalho, saúde, acessibilidade)
- Categoria `reflexao` → precisa de chip, ou o card precisa de outra categoria

## Comunidade
- Perfis reais (ou decisão de começar com 1 conta institucional)
- Posts reais de partida
- Grupos reais (os 5 atuais não servem)
- Decide: limpar tudo e começar do zero, ou preservar e apagar os de teste?
- **Nomes de usuário `Ford Enter` e `Minecraft` precisam sair** — contêm material de terceiros

## Eventos
- Os eventos reais: título, data **com ano**, horário, local ou plataforma, organizador, link de inscrição
- Ou a decisão de tirar a página da navegação até existir

## Loja
- Os produtos reais, com link de marketplace verdadeiro (AliExpress/Shopee/ML/Amazon)
- Preço real, ou remover preço
- Remover "frete grátis para todo Brasil" se não houver integração
- Avaliações: só exibir se vierem de fonte real

## Direitos
- Confirmação do ano da Lei 10.098 (**2000**, não 2004)
- Destino da entrada 10: remover, ou renomear para o que a LBI realmente trata
- Todos os textos de orientação (ver acima)

## Apoiar
- **Chave PIX real** (ou outra forma de/doação)
- Confirmação do que o QR code deve fazer
- Se houver integração, quem processa

## Conta
- Definir a política de conta de demonstração: existe ou não? Se existe, onde a pessoa sabe?

---

# 21. LACUNAS DE COMPREENSÃO DO USUÁRIO

### 🔴 Landing
1. **Onde estou?** — claro
2. **O que posso fazer?** — claro
3. **Para onde posso ir?** — 4 caminhos claros
4. **O que acontece depois de clicar?** — não sei
5. **Preciso estar logado?** — não, e está escrito
6. **O conteúdo é real?** — **"comunidade real" me faz acreditar que sim**
7. **De onde veio?** — não sei
8. **Posso confiar?** — **a Lia dizendo leis erradas destrói essa confiança**
9. **Existe alguém do outro lado?** — "Junte-se às pessoas que já encontraram um lugar aqui" — mas são 3 posts "post"
10. **Se eu não achar o que procuro?** — sem busca global visível

### 🔴 Comunidade
1. **Onde estou?** — claro (abas)
2. **O que posso fazer?** — não sei: o que é grupo? conversa? canal?
3. **Para onde ir?** — "Meus grupos" / "Explorar comunidades" — ok
4. **Depois de clicar?** — não sei
5. **Preciso estar logado?** — só descubro tentando
6. **O conteúdo é real?** — **vejo "post" e "oi"**
7. **De onde veio?** — não sei
8. **Posso confiar?** — posts sem autor (`author_name` é NULL)
9. **Existe alguém do outro lado?** — **acho que não**
10. **Se eu não achar?** — o estado vazio existe, mas o estado errado também

### 🔴 Direitos
1. **Onde estou?** — claro
2. **O que posso fazer?** — filtrar, buscar, abrir a fonte
3. **Para onde ir?** — Planalto ✅
4. **Depois de ler, o que eu faço?** — **não sei. É a maior lacuna.**
5. **Preciso estar logado?** — não
6. **É real?** — sim, os links são do Planalto
7. **De onde veio?** — diz "Planalto" ✅
8. **Posso confiar?** — sim, **menos** na entrada 10 e no ano da 6
9. **Existe alguém?** — o formulário de atendimento
10. **Se não achar?** — a busca funciona ✅

### 🔴 Blog
1. **Onde estou?** — claro
2. **O que posso fazer?** — ler 1 post, ver 8 títulos sem link
3. **Para onde ir?** — não sei, 8 cards não vão a lugar nenhum
4. **Depois de clicar?** — **nada acontece**
5. **Preciso estar logado?** — não
6. **É real?** — os 9 títulos parecem reais
7. **De onde veio?** — não sei
8. **Posso confiar?** — **não, porque clicar não faz nada**
9. **Existe alguém?** — não
10. **Se não achar?** — o filtro funciona

### 🔴 Eventos
1. **Onde estou?** — claro
2. **O que posso fazer?** — "Inscrever-se"
3. **Para onde ir?** — **nenhum lugar**
4. **Depois de clicar?** — **nada**
5. **Preciso estar logado?** — **não sei, porque não cheguei à pergunta 4**
6. **É real?** — **parece**
7. **De onde veio?** — não sei, **quem organiza? não está escrito**
8. **Posso confiar?** — 89 participantes sem fonte
9. **Existe alguém?** — **não**
10. **Se não houver evento no meu dia?** — as datas não têm ano

### 🔴 AcolherIA
1. **Onde estou?** — claro
2. **O que posso fazer?** — 4 sugestões + campo livre
3. **Para onde ir?** — minhas conversas
4. **Depois de clicar?** — ✅ funciona
5. **Preciso estar logado?** — não ✅
6. **É real?** — ✅ é uma IA de verdade
7. **De onde veio?** — não sei
8. **Posso confiar?** — **é aqui que mora o problema**: ela responde bem sobre cozinha e mal sobre leis
9. **Existe alguém?** — é uma IA, e ela avisa
10. **E se for urgente?** — **não há link para ajuda-emergência (CVV 188, SAMU 192).** ⚠️ numa página de acolhimento, isso é uma lacuna de segurança

---

# 22. MATRIZ FINAL DE STATUS

| Área | Conteúdo | Dados | Funcionalidade | Links | UX | Acessib. | Segurança | Deploy | Status |
|---|---|---|---|---|---|---|---|---|---|
| Landing | 🟢 | 🟡 | 🟢 | 🔴 | 🟡 | 🟡 | 🟠 | 🔴 | 🟡 |
| Início | 🟡 | 🟡 | 🟡 | 🔴 | 🟡 | 🟡 | 🟠 | 🔴 | 🟡 |
| Explorar | 🟢 | 🟢 | 🟡 | 🔴 | 🟢 | 🟡 | 🟠 | 🔴 | 🟡 |
| Artigos e Guias | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟡 | 🟠 | 🔴 | 🟢 |
| Artigos (6) | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟡 | 🟠 | 🔴 | 🟢 |
| Blog | 🔴 | 🟡 | 🔴 | 🔴 | 🟡 | 🟡 | 🟠 | 🔴 | 🔴 |
| Eventos | 🔴 | ⚫ | 🔴 | 🔴 | 🟡 | 🟡 | 🟠 | 🔴 | 🔴 |
| Direitos | 🟡 | 🟡 | 🟢 | 🔴 | 🟢 | 🟡 | 🟠 | 🔴 | 🟡 |
| Comunidade | 🟡 | ⚫ | 🟡 | 🟢 | 🟡 | 🟡 | 🔴 | 🟡 | 🔴 |
| AcolherIA / Lia | 🟢 | 🟢 | 🟡 | 🟢 | 🟡 | 🟡 | 🔴 | 🟡 | 🟡 |
| Loja | 🔴 | ⚫ | 🟡 | 🟡 | 🟡 | 🟡 | 🟠 | 🟡 | 🔴 |
| Apoiar | 🟡 | ⚫ | 🔴 | 🟡 | 🟡 | 🟡 | 🟠 | 🟡 | 🔴 |
| Quem Somos / Contato | 🟢 | 🟢 | 🟡 | 🟢 | 🟢 | 🟡 | 🟢 | 🟡 | 🟢 |
| Login e conta | 🟢 | 🟢 | 🟡 | 🟡 | 🟡 | 🟡 | 🟠 | 🟡 | 🟡 |
| Configurações | 🟡 | 🟡 | ⚪ | 🔴 | 🟡 | 🟡 | 🔴 | 🟡 | 🟡 |
| Painéis admin | 🟡 | ⚫ | ⚪ | 🟡 | ⚪ | 🟡 | 🔴 | 🟡 | 🟡 |
| Privacidade / Termos | 🟢 | 🟢 | 🟡 | 🟡 | 🟢 | 🟡 | 🟡 | 🟡 | 🟡 |

**Nenhuma área do site está 🟢 em todas as colunas.**

---

# 23. CHECKLIST FINAL DE ENTREGA

```
[ ] Todas as páginas principais existem            ✅ SIM
[ ] Todos os links principais funcionam            ❌ 36 em 18 páginas (caixa)
[ ] Nenhum conteúdo errado sendo exibido           ❌ posts "post", produtos, eventos
[ ] Nenhuma página importante está vazia           ✅ SIM
[ ] Dados de exemplo identificados                 ✅ SIM (este documento)
[ ] Dados reais identificados                      ✅ SIM (este documento)
[ ] Comunidade foi validada                        ✅ SIM — 100% dado de teste
[ ] Blog foi validado                              ✅ SIM — 1 de 9 com página
[ ] Eventos foram validados                        ✅ SIM — inscrição não funciona
[ ] Direitos foram validados                       ✅ SIM — 1 ano errado, 1 duplicada
[ ] Artigos foram validados                        ✅ SIM — 6 de 6 corretos
[ ] AcolherIA foi validada                          ✅ SIM — funciona; alucina lei
[ ] Loja foi validada                               ✅ SIM — 13 produtos fictícios
[ ] Apoiar foi validado                             ✅ SIM — QR code mock
[ ] Login foi validado                              ⚪ PARCIAL — porta é localStorage
[ ] Configurações foram validadas                  ⚪ PARCIAL — 9 abas existem
[ ] Estados vazios existem                          ✅ SIM — e estão bem escritos
[ ] Estados de erro existem                         ✅ SIM
[ ] Mobile foi testado                              ⚪ EM CURSO
[ ] Acessibilidade foi testada                      ⚪ PARCIAL — estática sim,runtime não
[ ] SEO foi verificado                              ✅ SIM — falta canonical/OG/sitemap
[ ] Segurança foi verificada                        ✅ SIM — 5 achados críticos
[ ] Deploy foi verificado                           ✅ SIM — Vercel mal configurada
[ ] Dados de demonstração foram identificados       ✅ SIM
[ ] Conteúdo real faltante foi listado             ✅ SIM
[ ] Links externos foram verificados               ✅ SIM — fontes dos artigos
[ ] Nenhuma promessa sem implementação              ❌ 5 promesas quebradas
```

**Placar: 20 ✅ · 5 ⚪ · 4 ❌**

---

# 24. ANTES DO VÍDEO PITCH

**Ordem sugerida. Os 4 primeiros itens,~2 horas de trabalho, mudam o vídeo de "protótipo" para "produto".**

### FAZER PRIMEIRO — o que aparece na tela

1. **Corrigir os 36 links com caixa errada** (P0-1). Sem isso, no vídeo um clique em "Direitos" dá 404.
2. **Limpar a comunidade, a loja e os eventos** (P0-4, P0-5, P0-6). Apagar os dados de teste e deixar os estados vazios aparecerem — que já existem e são bons.
3. **Conectar o card da procrastinação** (P1-1). 1 linha. O conteúdo está pronto e invisível.
4. **Tirar o QR code de mentira** (P0-7). Ou chave PIX real, ou o texto "em breve".

### DEPOIS — o que é perguntado em qualquer demo

5. **A Lia: parar de alucinar lei** (P0-2). Prompt de sistema com as 11 leis do banco e proibição de gerar URL. É a conversa mais provável de acontecer num vídeo.
6. **Ligar a autenticação da Edge Function** (P0-3). Uma chamada a mais.
7. **Fechar as 3 RPCs administrativas** (P0-8). 2 linhas no Supabase.

### SE TIVER TEMPO

8. Remover `hacker-trap.html` (P1-7)
9. Tirar a Lia se apresentar duas vezes (P1-4)
10. Trocar os 4 vídeos Rickroll (P1-2)
11. Adicionar Open Graph — **para o vídeo ser compartilhável, o link precisa ter imagem e título** (P1-11)
12. Corrigir a entrada 6 (ano) e a entrada 10 (duplicata) dos Direitos (P1-5)

### O QUE MOSTRAR NO VÍDEIO

- **Lia conversando** — é o melhor ativo do projeto, funciona de verdade
- **Os 6 artigos** — é o conteúdo editorial mais sólido
- **A comunidade** — mostrar a *estrutura* (grupos, conversas, moderação, realtime) e dizer claramente que o conteúdo começa vazio. É honesto e impressiona mais do que mostrar "post".
- **Direitos** — o parcours de rolagem está bem construído

### O QUE NÃO MOSTRAR

- **Loja** com os 13 produtos fictícios — quebra a credibilidade na hora
- **Eventos** com "89 participantes" e inscrição que não funciona
- **Apoiar** com QR code falso
- Qualquer coisa que dependa de `/direitos/` ou `/explorar/` até o P0-1 ser corrigido

---

# 25. PODE FICAR PARA DEPOIS

Tudo da seção **P2** (20 itens), mais:

- Otimização de imagem (8,2 MB não usados, 7 arquivos acima de 1 MB)
- Limpeza de duplicatas
- Padronizar nomenclatura de arquivo (`saude` vs `saúde`)
- Fechar os 6 painéis administrativos sem entrada de navegação (só depois de proteger por RLS)
- Escrever os textos de orientação das leis — é o maior ganho editorial do projeto, mas precisa de pesquisa jurídica real, não de desenvolvimento

---

# 26. NOTA FINAL

**O que este projeto tem de raro:** a estrutura Community está melhor que a maioria dos sites de saúde mental em produção. As 57 funções, o realtime, os estados vazios escritos com cuidado, o cuidado com `prefers-reduced-motion`, a Lia funcionando de verdade — isso não é protótipo.

**O que falta:** alguém para escrever conteúdo, criar conta, cadastrar produto e evento real. Nenhuma dessas coisas é trabalho de desenvolvimento.

**A ordem certa:** corrigir os 2 bugs de caminho (30 min), proteger as 3 RPCs e a Edge Function (1 h), limpar o banco de teste (1 h), e ajustar a Lia para não inventar lei (1 h). Depois disso, o site para de parecer demonstração.

**O risco que fica:** a Lia. Enquanto ela der número de lei errado com link oficial do Planalto, ela destrói exatamente a confiança que o site existe para construir. Isso precisa de uma trava técnica, não de um aviso.

---

*Auditoria gerada a partir de leitura de código, 12 scripts de varredura, consultas de leitura ao Supabase e testes reais no navegador. Nenhum arquivo do site foi modificado.*