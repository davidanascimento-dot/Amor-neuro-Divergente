# Auditoria de experiência e arquitetura da informação — Explorar, Blog e Comunidade

**Projeto:** Amor NeuroDivergente
**Data:** 21 de outubro de 2026
**Escopo:** organizar, navegar e compreender as áreas Explorar, Blog e Comunidade
**Natureza:** diagnóstico. **Nenhum arquivo foi alterado.**

---

## Como ler este relatório

Separei o que é **fato observado** (lido direto no código, com arquivo e linha) do que é **hipótese** ou **sugestão**. Fatos vêm marcados com o arquivo onde estão. Quando eu não consigo provar algo pelo código, eu digo.

Uma convenção importante: quando eu escrevo "isto está errado", quero dizer "isto funciona de um jeito diferente do que o texto da página promete". Não é opinião estética.

---

## 1. Diagnóstico geral

O problema não é de texto, nem de estilo. **É de arquitetura de conteúdo.**

As três áreas foram construídas como páginas independentes, e cada uma acabou ocupando, em parte, o lugar da outra:

| Área | O que o texto promete | O que ela de fato entrega |
|---|---|---|
| **Explorar** | Central de descoberta | **Metade são posts do Blog** (3 de 4 cards) |
| **Blog** | Textos da comunidade | **6 de 8 cards levam a páginas de `/Recursos/`** |
| **Comunidade** | Interação social | Cria posts que **nenhuma outra área lê** |

Isso não é um detalhe de copy. É a causa direta da confusão que você descreveu: **o usuário não entende por que os conteúdos estão separados porque, na prática, eles não estão separados de forma coerente — eles estão embaralhados.**

Três consequências concretas:

1. **O Blog não é um blog.** Dois dos oito cards são posts próprios. Os outros seis apontam para páginas informativas de outra área (`/Recursos/autismo/...`). A página chama isso de "Conteúdos da comunidade" (`blog/blog.html:187`), mas o subtítulo se contradiz na mesma frase: *"Artigos escritos por profissionais, pessoas neurodivergentes e aliados, e revisados na fonte oficial"* (`blog/blog.html:188`). Profissional e comunidade, na mesma linha, sem distinção.

2. **Explorar entrega o Blog.** A seção "Leituras recentes da comunidade" (`Explorar/Explorar.html:445`) mostra justamente os posts do Blog — inclusive com crédito de autoria de uma pessoa real: **Luti Christóforo**, "há 1 dia · 4 min de leitura" (`Explorar/Explorar.html:457-458`). O que a área informativa apresenta como "da comunidade" é conteúdo de autoria profissional assinada. E a área que deveria ser a casa disso (Blog) está mostrando páginas de Recursos.

3. **A Comunidade é uma ilha.** O Fórum cria posts de verdade (`comunidade/comunidade.js:251`), a tabela `posts` **já guarda** `author_name`, `author_avatar`, `tag` e `video_url`, o post tem página própria com comentários, curtidas e autor (`comunidade/post.js:226-227`). Mas **nenhum arquivo da pasta `/blog/` lê a tabela `posts`.** Verifiquei: os únicos leitores são `comunidade/comunidade.js`, `comunidade/perfil.js` e `comunidade/post.js`. O que a pessoa escreve na Comunidade nunca aparece no Blog.

Em uma frase: **o Blog mostra conteúdo informativo, o Explorar mostra relatos, e o relato que a pessoa escreve não circula.** As três áreas trocaram de função entre si.

---

## 2. Inventário atual

### 2.1 Explorar

| Item | Onde está | Fato observado |
|---|---|---|
| Página principal | `Explorar/Explorar.html` | |
| Hero | `:180-260` | Título, Lia como marca d'água, 3 caminhos grandes |
| Três caminhos | `:210-235` | **Artigos e Guias** → `/Recursos/recursos.html` · **Blog** → `/blog/blog.html` · **Eventos** → `/Recursos/eventos.html` |
| Grade de tópicos | `:312-320` | Cards com imagens do Unsplash apontando para `/Recursos/autismo/*.html` |
| Destaques | `:420-436` | Carrossel com paginação (7 botões) |
| "Leituras recentes da comunidade" | `:441-476` | Feature com autor + lista lateral |

**O achado mais forte do Explorar:** a seção "Últimas publicações" / "Leituras recentes da comunidade" (`:444-445`) aponta para `/blog/post-masking.html` e `/blog/post-procrastinacao.html`. E os itens da lista lateral têm **ícone de play** (`:475`) mas o link vai para `/blog/blog.html` (`:468`) — o ícone promete vídeo, o clique leva a uma lista de texto.

### 2.2 Blog

| Item | Onde está | Fato observado |
|---|---|---|
| Listagem | `blog/blog.html` | |
| Hero | `:130-143` | "Histórias, reflexões e informação de verdade" |
| Destaque | `:144-165` | Card grande → `/blog/post-masking.html` |
| Seção "Em alta" | `:181-190` | Eyebrow + `<h2>Conteúdos da comunidade</h2>` |
| Grade | `:193-...` | 8 cards, todos com `data-category` |
| Cards que são posts | 2 | `/blog/post-masking.html`, `/blog/post-procrastinacao.html` |
| Cards que são Recursos | **6** | `/Recursos/autismo/{autismo,Tdah,dislexia,saúde,altas-abilidades,talentos}.html` |
| Post individual | `blog/post-masking.html`, `blog/post-procrastinacao.html` | Autoria real: **Luti Christóforo** (`post-masking.html:119-121`) |
| Comentários | `post-masking.html:250-262` | Autor exibido como **"Visitante"** (hardcoded) |
| Filtros por categoria | — | **8 `data-category` no HTML, 0 `data-filter`, 0 `.blog-nav__chip`** |
| JS de filtro | `blog/blog.js:336-362` | Procura `.blog-nav__chip`; como não existe, **não faz nada** (guard `:343`) |
| Leitura da tabela `posts` | — | **Nenhuma referência em `/blog/`** |

**Não existe nenhuma forma de publicar, enviar ou criar texto no Blog.** Verifiquei os 4 arquivos HTML e os JS da pasta: não há formulário, botão, link de envio, nem "escreva para nós". A lista de autores é fixa no HTML.

Bug encontrado de passagem: `blog.js:343-362` é **código morto**. O comentário em `:337-339` explica uma decisão cuidadosa sobre o card do hero — mas o `if` nunca passa, porque os chips foram removidos do HTML. Menção a registrar: você já tinha me dito antes que a remoção dos chips foi sua; o que eu não sabia é que o JS ficou órfão atrás dela.

### 2.3 Comunidade

| Item | Onde está | Fato observado |
|---|---|---|
| Página | `comunidade/comunidade.html` | |
| Subnav | `:53-62` | 4 abas: Fórum, Grupos, Eventos, Conversa |
| Explicação das áreas | `:133-160` | Lista oculta até clicar "Conhecer a comunidade" |
| Fórum | `:74-80` | `<h2>Fórum</h2>` + botão "Novo Post" |
| Modal de Novo Post | `:317-346` | `<textarea rows="4">`, placeholder "O que está acontecendo?" |
| Ferramentas do modal | `:338-341` | Mídia, GIF, Enquete, Emoji |
| Insert na tabela | `comunidade.js:251` | `content`, `video_url`, `author_id`… |
| Página do post | `/comunidade/post.html?id=...` | Autor, avatar, comentários, curtidas (`post.js:226-227`) |
| Links para o Blog | — | **Zero referências a `/blog/` dentro de `/comunidade/`** |

**A infraestrutura de publicação existe e funciona.** A tabela `posts` tem `author_name`, `author_avatar`, `tag`, `video_url` — confirmado por consulta direta ao Supabase (2 linhas, 11 colunas). `post.js` já monta o perfil do autor com fallback: `post.author_name || authorProfile?.username || 'Membro da comunidade'` (`post.js:226`).

O que **não** existe é qualquer ponte entre essa infraestrutura e o Blog.

### 2.4 Navegação entre as áreas

- O **Explorar** linka para o Blog: sim (`:219`).
- O **Blog** linka para o Explorar: indireto, via breadcrumb/nav.
- A **Comunidade** linka para o Blog: **não** (0 ocorrências).
- O **Blog** linka para a Comunidade: não.
- Existe um link de Blog no rodapé do `apoiar/apoiar.html:755`.

Fato: **a Comunidade e o Blog não se conhecem.** São funcionalidades que não se mencionam em nenhum lugar.

---

## 3. Problemas concretos

Ordenados por gravidade. Todos com exemplo da experiência real.

### P1 — O rótulo "comunidade" é usado para conteúdo que não é da comunidade

Esta é a raiz da confusão. Onde a palavra aparece:

| Arquivo | Linha | Texto | O que o link realmente mostra |
|---|---|---|---|
| `blog/blog.html` | 187 | `<h2>Conteúdos da comunidade</h2>` | 6 de 8 cards são páginas de Recursos |
| `Explorar/Explorar.html` | 445 | `<h2>Leituras recentes da comunidade</h2>` | Posts com autoria profissional assinada |
| `Explorar/Explorar.html` | 457 | `Luti Christóforo · há 1 dia · 4 min` | Autora real, não "a comunidade" |

**Efeito no usuário:** ele lê "da comunidade", clica, e encontra um artigo institucional. Na segunda vez que isso acontece, ele para de confiar no rótulo. É exatamente o efeito que você descreveu.

### P2 — O Blog se contradiz na própria descrição

`blog/blog.html:187-188`:

> **Conteúdos da comunidade**
> *Artigos escritos por profissionais, pessoas neurodivergentes e aliados, e revisados na fonte oficial.*

"Da comunidade" e "por profissionais" e "revisados na fonte oficial" são três coisas diferentes na mesma frase. O usuário não sabe se está lendo um relato ou um artigo técnico — e a página não ajuda, porque **todos os cards têm a mesma forma visual** (`editorial-card--article`). `data-category` existe (`:195`, `:207`, `:219`…) mas não é visível: é só metadado para o filtro morto.

### P3 — O ícone de play leva a texto

`Explorar/Explorar.html:468-476`: o item tem `<span class="latest-item__play"><i class="fa-solid fa-play"></i></span>` e o `href` é `/blog/blog.html`.

**Efeito no usuário:** ele clica esperando vídeo e recebe uma lista de artigos. Isso é um erro de affordance — o ícone faz uma promessa que o link não cumpre.

### P4 — O post da comunidade fica preso na comunidade

Fato: `posts` é lida **apenas** por `comunidade/comunidade.js`, `comunidade/perfil.js` e `comunidade/post.js`. Nenhum arquivo de `/blog/` a consulta.

**Efeito no usuário:** ele escreve um relato no Fórum, alguém comenta, e aquilo **não chega a lugar nenhum** que se chame Blog. O relato existe, tem URL própria (`/comunidade/post.html?id=...`), mas não há como descobri-lo fora do Fórum. Um visitante que só usa o Blog nunca verá nada produzido por outra pessoa da comunidade.

### P5 — Nenhuma forma de publicar no Blog

Não há botão, formulário nem instrução. O Blog só é lido.

**Efeito no usuário:** se ele quer contribuir depois de ler um relato, não há caminho. Ele teria que descobrir sozinho que a publicação mora na Comunidade — e nada na interface diz isso.

### P6 — Autoria inconsistente

| Contexto | Como o autor aparece | Arquivo |
|---|---|---|
| Post do Blog | "Luti Christóforo" (nome real) | `post-masking.html:119-121` |
| Explorar (mesmo post) | "Luti Christóforo · há 1 dia · 4 min" | `Explorar.html:457` |
| Comentário no Blog | **"Visitante"** | `post-masking.html:250` |
| Post da Comunidade | `author_name \|\| username \|\| 'Membro da comunidade'` | `post.js:226` |

**Efeito no usuário:** ele não sabe se aquilo é escrito por uma pessoa identificada ou por ninguém. E "Visitante" como autor de comentário é confuso: parece que o comentário não tem dono.

### P7 — O filtro do Blog não existe mais, mas o JS ainda acha que existe

`blog.html`: 8 `data-category`, 0 `data-filter`, 0 `.blog-nav__chip`.
`blog.js:343`: `if (blogNavChips.length && editorialCards.length)` → como o primeiro é 0, o bloco inteiro é ignorado.

**Efeito no usuário:** nenhum, hoje. As categorias estão no HTML e não podem ser usadas. É dívida técnica, não bug perceptível — mas explica por que a seção "Em alta" parece sem filtro.

### P8 — Explorar repete o Blog, e o Blog repete o Explorar

Os mesmos dois posts aparecem nas duas áreas:
- `post-masking.html`: destaque no Blog (`:145`) **e** feature no Explorar (`:450`).
- `post-procrastinacao.html`: card no Blog (`:196`) **e** item no Explorar (via `latest-list`).

E a grade de tópicos do Explorar (`:312-320`) aponta para o **mesmo conjunto de páginas** `/Recursos/autismo/*.html` que ocupa 6 dos 8 cards do Blog.

**Efeito no usuário:** ele visita duas áreas com nomes e promessas diferentes e encontra o mesmo acervo. Parece que uma delas é uma cópia da outra — porque, em conteúdo, é.

### P9 — Comentários com autor hardcoded

`post-masking.html:250-262` e `post-procrastinacao.html`: `<strong class="nome-autor">Visitante</strong>`, repetido. São comentários estáticos de exemplo, não lidos do banco. `artigo.js` é carregado (`post-masking.html:368`) — não verifiquei se ele sobrescreve isso em runtime; **registro como não confirmado.**

---

## 4. Sobreposições

### O que se repete

| Conteúdo | Aparece em | Vezes |
|---|---|---|
| `/Recursos/autismo/autismo.html` | Blog card, Explorar tópico | 2 |
| `/Recursos/autismo/Tdah.html` | Blog card, Explorar tópico | 2 |
| `/Recursos/autismo/dislexia.html` | Blog card, Explorar tópico | 2 |
| `/Recursos/autismo/saúde.html` | Blog card, Explorar tópico | 2 |
| `/Recursos/autismo/altas-abilidades.html` | Blog card, Explorar tópico | 2 |
| `/Recursos/autismo/talentos.html` | Blog card, Explorar tópico | 2 |
| `post-masking.html` | Blog destaque, Explorar feature | 2 |
| `post-procrastinacao.html` | Blog card, Explorar lista | 2 |

**Conclusão:** 8 conteúdos ocupam 16 posições nas duas páginas. As duas áreas são, do ponto de vista de conteúdo, **a mesma vitrine com nomes trocados**.

### Quais diferenças são legítimas

Nem tudo que se repete é problema. Estas diferenças **são reais e devem ser preservadas**:

| Diferença | Por que é legítima |
|---|---|
| **Autoria** | Um artigo revisado na fonte oficial e um relato pessoal têm responsabilidades diferentes. O primeiro responde por informação; o segundo, por experiência. |
| **Durabilidade** | Página de Recurso é permanente e versionada. Post de comunidade é cronológico, pode envelhecer, pode ser editado pelo autor. |
| **Comentário** | Recurso não recebe comentário; post recebe. A discussão é própria do relato. |
| **Achabilidade** | Recurso se encontra por assunto (autismo, TDAH). Post se encontra por autor, tempo e afinidade. |
| **Tom** | Informativo x testemunhal. Não é estilo — é contrato com quem lê. |

**O que não é legítimo:** a mesma pessoa encontrar os mesmos seis links em duas áreas com promessas diferentes, sem saber qual das duas é "a certa".

---

## 5. Arquitetura recomendada

Avaliei as cinco propostas que você listou. Minha conclusão: **as propostas estão certas na direção, mas subestimam o problema.** O texto não resolve, porque o problema não é de texto — é de conteúdo mal alocado. Segue o que cada proposta resolve e onde ela tropeça.

### Proposta 1 — Explorar como central de descoberta

**Concordo.** Mas exige uma mudança que a proposta não menciona: **o Explorar precisa parar de exibir posts do Blog como se fossem descoberta de conteúdo informativo.** Hoje a seção "Leituras recentes da comunidade" (`:441-476`) é uma vitrine de Blog dentro do Explorar — e é ela que causa a sobreposição P8.

Se o Explorar é central de descoberta, ele **pode** mostrar o Blog, mas como **um dos destinos** (o caminho `:219` já faz isso corretamente), não como uma seção que reproduz a home do Blog.
*Requer:* só apresentação. Nenhuma mudança de dados.

### Proposta 2 — Blog como espaço de leitura de relatos

**Concordo, e é aqui que a proposta tem o maior obstáculo.** Para o Blog ser "de relatos da comunidade", os 6 cards de `/Recursos/` precisam sair. Isso é seguro? **Sim, tecnicalmente** — as páginas de Recurso continuam existindo em `/Recursos/` e continuam acessíveis pelo Explorar. Mas há um custo: hoje o Blog é a única outra porta de entrada para essas 6 páginas. Tirá-las reduz a descoberta delas, e é por isso que a Proposta 1 e a 2 têm que ser decididas **juntas**.

*Requer:* edição de HTML (troca de cards). Nenhum dado precisa mudar.

### Proposta 3 — Criar publicação pela Comunidade, aparecendo no Blog

**Concordo, e é mais viável do que parece** — a infraestrutura já existe:

- `posts` já tem `author_name`, `author_avatar`, `tag`, `video_url` (verificado no banco).
- O insert já acontece (`comunidade.js:251`).
- O perfil do autor já tem fallback (`post.js:226`).
- Existe uma página de post funcional (`post.js`).

O que falta é **um campo** que diga "este post é uma publicação" (o `tag` já existe e guarda `"# Geral"`, então há onde apoiar) e **uma leitura** — o Blog consultar `posts`.

**Ressalva importante:** hoje o post da Comunidade é curto por natureza — o modal tem `<textarea rows="4">` com placeholder *"O que está acontecendo?"* (`comunidade.html:328`), que é o modelo de rede social, não de publicação. Um relato para o Blog pede mais: título, texto longo. **Isso é funcionalidade nova, não reaproveitamento.** Não quero vender como "já está pronto".

*Requer:* banco (talvez nada — `tag` pode servir), backend (nenhum novo), frontend (uma consulta no Blog + um modo "publicação" no composer).

### Proposta 4 — Tornar a relação explícita

**Concordo, e é a única que é puramente textual.** É a mais barata e a que produz efeito imediato. Mas sozinha não resolve: um texto bem escrito dizendo "o Blog é da comunidade" não convence se os cards do Blog continuam levando para Recursos. **Texto precisa acompanhar a correção de conteúdo, não substituí-la.**

*Requer:* só apresentação.

### Proposta 5 — Diferenciar visual e editorialmente

**Concordo em parte, com uma ressalva.** Hoje **todos** os cards do Blog usam a mesma classe (`editorial-card--article`). Diferenciar por tipo é bom. Mas atenção: `blog-fluxo.css:10-16` documenta uma decisão deliberada — cada página tem um sistema de layout próprio (Explorar = caminhos, Blog = fluxo). Mexer na forma dos cards pode colidir com isso.

Sugiro o mínimo: um **rótulo visível** de tipo (informativo / guia / relato) e a **autoria visível no card**, em vez de formas radicalmente diferentes. `data-category` já existe em cada card — é o dado pronto, só não é mostrado.

*Requer:* só apresentação.

### Alternativa mais simples (você pediu para considerar)

Se o objetivo é resolver a confusão com o mínimo de mudança, existe um caminho que **não** cria funcionalidade nenhuma:

> **Fazer do Blog a casa de dois tipos de conteúdo, com filtro visível, e do Explorar uma porta única para assuntos.**

Concretamente: o Blog passa a exibir artigos de `/Recursos/` **e** posts da comunidade, com um filtro que os separa (o JS do filtro já está escrito, `blog.js:336-362` — só precisa dos chips de volta). O Explorar deixa de reproduzir o Blog e passa a ser só navegação por assunto. A Comunidade ganha um link para o Blog.

Isso resolve **P1, P2, P5, P8 e P9** sem criar nenhuma tela nova e sem tocar no banco. É menos elegante que as cinco propostas juntas, mas é honesto sobre o custo. **Se você tem pouco tempo, é por aqui que eu começaria.**

---

## 6. Fluxo do usuário (como deveria ser)

Hoje esse fluxo **não existe**. Segue como ficaria depois da arquitetura do item 5:

```
1. DESCOBRIR
   Explorar → escolhe o assunto "TDAH"
   → chega em /Recursos/autismo/Tdah.html (informativo, revisado)

2. APROFUNDAR
   No fim do artigo, um bloco: "Quem vive isso conta de outro jeito"
   → leva ao Blog, filtrado por TDAH          [não existe hoje]

3. LER UM RELATO
   Blog (filtro: relatos) → lê post de alguém da comunidade
   → vê o nome de quem escreveu, a data, os comentários

4. PARTICIPAR
   No fim do relato: "Escreva o seu" + "Converse sobre isso"
   → "Escreva o seu" leva à Comunidade, modo publicação   [não existe hoje]
   → "Converse" leva ao Fórum

5. PUBLICAR
   Comunidade → escreve, publica
   → o post aparece no Blog (filtro: relatos)             [não existe hoje]
   → e continua acessível em /comunidade/post.html?id=...
```

**Os passos 2, 4 e 5 são inexistentes hoje.** O passo 5 é o mais importante: é o que faz a Comunidade alimentar o Blog. Sem ele, não existe relação entre as áreas — só vizinhança.

---

## 7. Plano de melhorias

Separei em **A (apresentação)** e **B (funcional)**. Isso é a distinção que você pediu, e ela importa: A pode ser feito hoje sem risco; B precisa de decisão sua.

### A — Ajustes de texto e navegação (só apresentação)

| # | Ação | Problema que resolve | Onde |
|---|---|---|---|
| A1 | Trocar "Leituras recentes da comunidade" por um título que descreva o que é: ex. "Publicações recentes" | P1 | `Explorar/Explorar.html:445` |
| A2 | Corrigir o título **e** o subtítulo do Blog para não misturar comunidade e profissional | P1, P2 | `blog/blog.html:187-188` |
| A3 | Exibir a autoria e o tipo no card do Blog (o `data-category` já existe) | P2, P5 | `blog/blog.html`, `blog.css` |
| A4 | Trocar o ícone de play por um de leitura nos itens que levam a texto | P3 | `Explorar/Explorar.html:475` |
| A5 | Corrigir "Visitante" nos comentários do Blog, ou marcar como exemplo | P6, P9 | `post-masking.html:250`, `post-procrastinacao.html` |
| A6 | Adicionar um link para o Blog na Comunidade (e vice-versa) | P4, P8 | `comunidade/comunidade.html`, `blog/blog.html` |
| A7 | Remover o bloco morto do filtro **ou** devolver os chips | P7 | `blog/blog.js:336-362` |
| A8 | Uma frase explicando, em cada área, quem produz o quê | P1, P2 | as três páginas |

Nada em A toca banco de dados, backend ou lógica. A2 e A8 são as de maior efeito pelo menor custo.

### B — Alterações funcionais (precisam de decisão)

| # | Ação | Problema que resolve | Requer |
|---|---|---|---|
| B1 | Fazer o Blog ler a tabela `posts` | P4, P5 | Frontend (`blog.js`) — **só leitura**, o banco já tem os campos |
| B2 | Repartir os cards do Blog: artigos de Recursos x relatos | P2, P8 | HTML + decisão editorial sobre as 6 páginas |
| B3 | Modo "publicação" no composer da Comunidade (título + texto longo) | P5 | Frontend; campo novo ou uso do `tag` |
| B4 | Bloco "relatos relacionados a este assunto" nas páginas de Recurso | passo 2 do fluxo | Frontend |
| B5 | Marcar explicitamente o que é relato e o que é informativo (flag no dado) | P1, P2 | **Banco** (coluna nova em `posts` ou convenção no `tag`) |

**B1 é a mais valiosa e a menos arriscada:** é uma consulta de leitura a uma tabela que já existe, com campos que já existem. É o passo que transforma "duas áreas vizinhas" em "duas áreas ligadas".

**B3 é a mais enganosa.** Parece pequena, mas o composer atual é de rede social (`rows="4"`, "O que está acontecendo?"). Publicar um relato para o Blog pede outro tipo de entrada. Não é reaproveitamento — é tela nova.

**B5 é a que eu deixaria por último.** Dá para chegar longe com o `tag` que já existe antes de criar coluna nova.

---

## 8. Ressalvas — o que eu não consegui confirmar

Sendo explícito, para você não tomar decisão sobre algo que eu não verifiquei:

1. **Não vi nenhuma página renderizada.** Todo este relatório é leitura de código. Não abri navegador. Descrevi o que o código manda fazer, não o que o navegador mostra.
2. **`artigo.js` pode alterar os comentários do Blog em runtime.** Vi o `<strong>Visitante</strong>` no HTML estático, mas não li o `artigo.js` inteiro. A ressalva P9 pode ser menor do que parece.
3. **Não sei de onde o Fórum carrega os posts exibidos.** Vi o insert (`comunidade.js:251`) e as leituras (`:1344`, `:1368`, `:4966`), mas não rastreei o caminho completo até a tela.
4. **Não medi quantos posts existem.** A consulta retornou 2 linhas porque eu pedi `limit=3`. O número real de posts do Fórum não foi medido.
5. **A hipótese "profissional x comunidade" é minha leitura do texto**, não um campo no banco. O subtítulo de `blog.html:188` ("escritos por profissionais... e aliados") foi o que me levou a ela. Não há flag distinguindo os dois no dado.
6. **Não avaliei as outras três áreas** (Grupos, Eventos, Conversa) além do necessário para entender como elas se ligam ao Blog.
7. **O `dist/` reflete uma build antiga.** Todas as leituras que eu fiz foram do código-fonte; o `dist/` será regenerado.

---

## 9. Resumo em uma página

**O que está confuso:** as três áreas trocaram de função. O Blog mostra conteúdo informativo, o Explorar mostra relatos, e o que a comunidade escreve não circula.

**Prova mais forte:** os 8 cards do Blog levam 6 vezes para `/Recursos/`; a seção "Leituras recentes da comunidade" do Explorar leva a posts do Blog; e nenhum arquivo de `/blog/` lê a tabela `posts`, onde os relatos realmente vivem.

**O que já existe e ajuda:** a publicação funciona, a autoria tem campo, o post tem página própria, e o JS do filtro do Blog está escrito.

**O que falta de verdade:** uma ponte. Nada mais estrutural do que isso.

**Por onde começar, se for para começar por algo:** A1, A2 e A6 — três edições de texto, zero risco, efeito imediato. Depois B1, que é uma consulta de leitura.

**O que eu não recomendo fazer ainda:** criar uma coluna nova no banco (B5). Dá para ir longe com o `tag` que já está lá.

**Uma pergunta que ainda não sei responder:** os 6 artigos de `/Recursos/autismo/` são conteúdo editorial do site, ou eram para ser posts? A resposta muda a Proposta 2 de "trocar cards" para "decidir onde esse conteúdo mora".
