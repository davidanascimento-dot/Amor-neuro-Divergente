# DOCUMENTAÇÃO — PÁGINA "SEUS DIREITOS" · ESTADO ATUAL

> **Esta etapa é só leitura.** Nenhum arquivo da página foi alterado.
> Todas as medidas abaixo saíram do DOM em execução (985px de largura, janela de 700px)
> e de capturas de tela reais. Onde o código não responde, está marcado
> **não identificado**.
>
> Documento gerado em 2026-10-07. Commit de referência: `a6eb220`.
> Arquivo medido: `Direitos/direitos.html` + `Direitos/direitos-percurso.css`.

---

## 0. RESUMO EXECUTIVO

A página tem **7.811px de altura** e **13 blocos de nível 1**. Ela já tem uma
identidade forte e coerente — o sistema de percurso, com a arte de fundo na dobra,
o fio de cor por área e a Lia no formulário.

O problema **não é falta de imagem**. É que **93% do documento é a mesma coisa**:

| fundo | pixels | % do documento |
|---|---|---|
| papel `#faf9fe` | 3.867 | 50% |
| branco `#ffffff` | 3.339 | 43% |
| fotos/imagens visíveis | 878 | 11% (7% fora da dobra) |

**A diferença entre `#faf9fe` e `#ffffff` é de 8, 8 e 9 níveis por canal (250,249,254 vs 255,255,255).**
Isso está abaixo do degrau de percepção. Ou seja: **7 das 10 seções de conteúdo são
visualmente a mesma coisa.**

A maior sequênciapathy é **CATEGORIAS → LEIS → FONTES → EDITORIAL → RECURSOS**:
2.537px seguidos (y 1421 → 3889 → 4230 → 5431) sem nenhuma mudança perceptível de
composição, cor ou hierarquia. É ali que a experiência de rolagem perde a personalidade.

---

## 1. MAPA VISUAL DA PÁGINA

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER (fixed, 75px)                    ← branco 90%, vidro  │  0..75
│   Início › Explorar › Seus Direitos · logo · [busca]          │
├──────────────────────────────────────────────────────────────┤
│ PRIMEIRA DOBRA — arte de fundo + 4 gradientes + 2 formas      │  0..398
│   "Conheça seus direitos."                                    │   ÚNICA
│   "E descubra como usar cada um deles."  (Playfair, roxo)      │   SEÇÃO
│   subtítulo + 01/02/03 percurso à direita                     │   COM ARTE
│   ░░ arte: caminho subindo até a porta, livro aberto ░░       │
├──────────────────────────────────────────────────────────────┤
│ NAVEGAÇÃO (sticky, top 75px, 80px)                            │  398..478
│   ORIENTE-SE · [Categorias] Leis Aprenda Recursos FAQ Contato │
├──────────────────────────────────────────────────────────────┤
│ INTRO — "Direitos não se limitam a um site."                  │  478..699
│   fundo BRANCO PURO · nuvem decorativa à esquerda            │
│   5 chips lilás: Gov.br · Defensoria · MP · INSS · Planalto  │
├─ ─ ─ ─ ✦ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤  699..775
│ CATEGORIAS — "Escolha uma categoria"                          │  775..1421
│   fundo PAPEL · 4 LINHAS com fio de cor por área              │
│   Educação (roxo) 3 leis │ Saúde (verde) 2 leis               │
│   Assistência Social (azul) 4 │ Acessibilidade (rosa) 3       │
├──────────────────────────────────────────────────────────────┤
│ LEIS — "Leis que protegem você"                              │  1421..3889
│   fundo BRANCO PURO · 2.468px = 31,6% DA PÁGIA INTEIRA       │
│   12 LINHAS de percurso, altura 172/196px, gap 0             │
│   rótulo de área em cor + nº da lei em cor + link à direita   │
│   ─ as 12 fotos de lei foram REMOVIDAS (display:none)         │
├──────────────────────────────────────────────────────────────┤
│ FONTES — "Quer se aprofundar?"                                │  3889..4230
│   fundo PAPEL · 6 chips com borda (fonte oficial)             │
├──────────────────────────────────────────────────────────────┤
│ EDITORIAL — 2 cards fotográficos                              │  4230..5431
│   fundo PAPEL · CARD BRANCO + raio 20 + sombra + foto 240px   │
│   ⚠ ÚNICO lugar com card "de verdade" na página               │
│   ⚠language visual de outra página (o percurso não a tocou)   │
├──────────────────────────────────────────────────────────────┤
│ RECURSOS — grade de 2 colunas                                 │  5431..6243
│   fundo PAPEL · ESQ: 3 resource-item + botão roxo             │
│                      DIR: Lia + 4 clarezas + FORMULÁRIO       │
├─ ─ ─ ─ ✦ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤  6243..6319
│ FAQ — "Perguntas sobre direitos"                              │  6319..6970
│   fundo BRANCO PURO · 6 <details> em lista, cintilhao roxo    │
├──────────────────────────────────────────────────────────────┤
│ CONTATO — "Ainda com dúvidas sobre seus direitos?"           │  6970..7359
│   fundo PAPEL · grid 2 col: texto+botões | Lia roxa em linha  │
├──────────────────────────────────────────────────────────────┤
│ FOOTER — cinza azulado #f0f4f8, única quebra de cor real     │  7359..7811
│   Navegue · Sobre · Apoie · Redes · 15 links                 │
└──────────────────────────────────────────────────────────────┘
      flutuantes: sidebar-toggle (esq), floating-hub (dir baixo),
                  botão AcolherIA, botão "?" de acessibilidade
```

---

## 2. LEVANTAMENTO POR SEÇÃO

### 2.1 HEADER — `header.header-glass#headerGlass`

| item | valor medido |
|---|---|
| Altura | 75px |
| Posição | `fixed`, `top: 0`, `z-index: 40` |
| Fundo | `rgba(255,255,255,0.9)` |
| Borda inferior | `1px rgba(238,123,1,0.54)` — **laranja**, a única cor quente do cabeçalho |
| Conteúdo | breadcrumb (`nav.breadcrumb-nav`), logo (`a.logo` + `img` 113KB), `nav.header-links` **vazio** |
| Busca | campo `button.busca-btn` injetado por `busca.js`; abre um `<dialog class="busca-caixa">` |
| Observação | `nav.header-links` está vazio no HTML — o `busca.js` insere o botão ali em execução |

O breadcrumb diz `Início › Explorar › Seus Direitos`. O link "Explorar" não é a
página atual — é a anterior na trilha.

### 2.2 PRIMEIRA DOBRA — `section.rights-banner.rd-banner.dp-hero`

| item | valor |
|---|---|
| Altura | 398px a 985px de largura (2,47:1) |
| Fundo | `#faf9fe` + **5 camadas** em `::after` |
| Arte | `/img/ilustracoes/imagem-direitos.jpg` 1024×572, 30 KB |
| Enquadramento | `background-position: 50% 55%` / `size: cover` |
| Véus | esquerda (0,90 → 0 em 60%) + vertical (topo 9%, base 86%) |
| Formas CSS | ponto de marcação `circle 4.5px` roxo 55% + arco `circle 230px` anel 1px a 11% |
| Título | `h1.dp-hero__titulo` Inter 800, **35px**, 497px de largura |
| 2ª linha | `span.dp-hero__accent` Playfair Display itálico 700, roxo `#7c3aed` |
| Subtítulo | `p.dp-hero__apoio` 17px, `max-width: 460px` |
| Percurso | `ol/ul.dp-percurso` com 3 itens: `01` Playfair roxo 15px + texto Inter 600 15px |
| Markup | `div.dp-hero__grade` (max-width 1200px) > 2 colunas |

**Conteúdo:** "Conheça seus direitos." / "E descubra como usar cada um deles." /
"Conheça as leis que protegem você e saiba como usá-las no dia a dia. Sem palavras difíceis."

**Percurso:** 01 "Quais são meus direitos?" · 02 "Como eu uso esses direitos?" ·
03 "Onde encontro ajuda?"

**Contraste medido** (fundo simulado pixel a pixel + leitura da captura, concordam):
título 16,28:1 · 2ª linha roxa 5,44:1 · subtítulo 6,89:1 · percurso 16,28:1.
Todos passam AA/AAA.

**Interações:** `dp-percurso__item:hover` muda cor do texto e `padding-left` (+8px);
`:focus-visible` com outline roxo de 2px.

### 2.3 NAVEGAÇÃO — `nav.rights-nav`

| item | valor |
|---|---|
| Altura | 80px |
| Posição | **`sticky`, `top: 75px`** (o `bottom: 0` que existed antes foi corrigido) |
| Fundo | `rgba(250,249,254,0.92)` |
| Rótulo | `span.rights-nav__rotulo` "ORIENTE-SE" 11px uppercase |
| Chips | 6 `a.rights-nav__chip`, com `fa-solid`: layer-group, book, lightbulb, toolbox, circle-question, comment-dots |
| Ativo | `.is-active` = fundo roxo sólido, texto branco (1º: "Categorias") |
| Alvos | `#categorias`, `#leis`, `#editorial`, `#recursos`, `#faq`, `#contato` |
| `scroll-margin-top` | `var(--dp-nav-altura)` = **168px** nos 6 alvos |
| Mobile | container vira `overflow-x: auto`, chips com margem, `scrollbar-width: none` |

⚠ **O `is-active` é estático.** Não há JS de scroll-spy nesta página: o chip
"Categorias" fica roxo do início ao fim da rolagem, mesmo com a pessoa lendo o FAQ.

### 2.4 INTRO — `section.deco-hospedeiro.rights-intro`

| item | valor |
|---|---|
| Altura | 221px · fundo **branco puro** `#ffffff` |
| Padding | 60px topo / 30px base |
| Decorativo | `span.deco.deco--nuvem.deco--esq.deco--topo.deco--s2` 120px, −8° |
| Título | `h2.rights-intro__title` **Playfair Display 700, 28px**, 820px — *centralizado* |
| Subtítulo | 16px, `max-width: 620px`, centralizado |
| Chips | 5 `a` com `background: #f5f3ff`, **sem borda**, raio 30px, 37px de altura, 13px, cor `#6d28d9` |
| Alvos | Gov.br · Defensoria Pública · Ministério Público · INSS · Planalto (todos `href` externo em `gov.br`) |

**Único título da página em Playfair fora do percurso.** Todos os outros h2 são Inter 800.

### 2.5 SEPARADOR 1 — `div.rd-sep`

76px de altura. `display: flex`, `align-items: center`, e um `::after` que é
`height: 1px; background: linear-gradient(90deg, #ddd6fe, transparent)` com um
`span.rd-sep__losango` de 8×8px roxo rotacionado 45° no centro. `aria-hidden="true"`.

O `percurso.css` **não tem nenhuma regra** para `.rd-sep` (0 ocorrências) — vem
inteiro do `design-direitos.css`.

### 2.6 CATEGORIAS — `section.categories-nav.dp-areas#categorias`

| item | valor |
|---|---|
| Altura | 646px · fundo papel `#faf9fe` · padding 88px topo, **0 base** |
| Head | `header.categories-nav__head` — **106px**, igual às outras heads |
| Badge | `span.section-badge` "EXPLORE POR ÁREA" 10px uppercase `#5c5652` |
| Título | `h2.categories-nav__title` Inter 800 **22px**, alinhado à esquerda |
| Subtítulo | 15px |
| Fio | `border-bottom: 2px solid var(--dp-tinta)` sob a head |
| Grade | `div.dp-areas__grade` > 4 `a.category-tile`, cada uma `display: grid`, 921×104px |
| Título da área | `span.category-tile__title` **Playfair Display 700, 22px** |
| Fio da área | `::before` — barra vertical 3×20px, na cor da área |
| Cobertura | `span.dp-areas__cobertura` 13px `#5c5652`, os termos de cobertura do banco |
| Contagem | `span.category-tile__count` na cor da área, opacidade 0,75 |
| Seta | `::after` = `\f061` na cor da área, opacidade 0,6 |

**Cores por área** (reaproveitadas do `--cat-ink` do `design-direitos.css`):

| área | `data-filter` | cor | contraste | leis |
|---|---|---|---|---|
| Educação | educacional | `#6d28d9` | 7,1:1 | 3 |
| Saúde | saude | `#15803d` | 5,0:1 | 2 |
| Assistência Social | social | `#1d4ed8` | 6,7:1 | 4 |
| Acessibilidade | acessibilidade | `#be185d` | 6,0:1 | 3 |

**Interação:** clicar no tile filtra as leis (`category-tile.addEventListener('click')`
em `direitos.js`, §9). Também `hover` (só dentro de `@media (hover: hover)`) e
`:focus-visible`.

### 2.7 LEIS — `section.deco-hospedeiro.laws-section.dp-leis#leis`

| item | valor |
|---|---|
| Altura | **2.468px — 31,6% do documento** · fundo branco puro |
| Padding | 96px topo, **0 base** |
| Head | `header.laws-section__head.dp-leis__head` 106px · badge "BIBLIOTECA DE LEIS" (fa-book) |
| Título | `h2.laws-section-title` Inter 800 22px · fio 2px |
| Lista | `div#lawsGrid.laws-grid.dp-leis__lista` — **`display: flex; flex-direction: column; gap: 0`** |
| Markup | **gerado por JS**: `renderLaws()` monta `article.law-editorial-card` por lei |
| Estado vazio | `p#lawsNoResults` (existe no HTML, `hidden` enquanto há resultado) |

**As 12 leis, com a estrutura repetida:**

```
article.law-editorial-card[data-category]
  ├ div.law-editorial-card__image   → display:none  (a foto foi removida)
  │   └ img + div.law-editorial-card__image-overlay   (ambos escondidos)
  └ div.law-editorial-card__panel
      ├ span.law-editorial-card__category   10px uppercase, cor da área
      │   └ i.fa-solid (ícone da área)
      ├ h3.law-editorial-card__title        Inter 800 18px
      ├ p.law-editorial-card__description    15px, `max-width: 68ch`
      └ div.law-editorial-card__footer      flex, espaço entre
          ├ span.law-editorial-card__number  12,5px, cor da área, sem uppercase
          └ a.law-editorial-card__link  →  target=_blank rel=noopener
```

**Alturas medidas:** 5 leis de 196px, 1 de 196px, 6 de 172px → ritmado pela
quantidade de linhas de descrição. `padding: 26px 0`, `border-bottom: 1px solid var(--dp-borda)`.

**O que foi desligado do `direitos.css`:** `transform: translateY(-4px)` no hover,
`box-shadow` de 40px, o `grid-template-columns: repeat(2,1fr)` e o
`--left`/`--right` que o JS alterna.

**⚠ Fragilidade a registrar:** `.law-editorial-card[hidden] { display: none }` é
(0,2,0) e **o filtro do JS depende dele**. Qualquer regra de `display` em seletor
de peso igual ou maior quebra o filtro.

### 2.8 FONTES — `section.deco-hospedeiro.sources-banner`

| item | valor |
|---|---|
| Altura | 341px · fundo papel · **é a única seção com `border-top: 1px`** (`--dp-borda`) |
| Padding | 60px / 60px · `text-align: center` |
| Decorativo | `deco--organicas` 80px, +8°, canto inferior direito |
| Título | `h3.sources-banner__title` Inter 800 22,4px, com `fa-book-open-reader` |
| Subtítulo | 15px, `max-width: 620px` |
| Chips | 6 `a.source-pill`, 43px de altura, raio 30px, **fundo branco + borda 1px `--dp-borda`**, 13px `#1a1a2e` |
| Ícones | landmark, graduation-cap, heart-pulse, chart-line, people-group, hand-holding-heart |
| Links | todos externos, `target="_blank" rel="noopener"` |
| Tratamento do percurso | **0 ocorrências.** Veio do `direitos.css` |

### 2.9 EDITORIAL — `section.editorial-grid#editorial`

| item | valor |
|---|---|
| Altura | 1.201px · fundo papel · padding 60/80 |
| Container | `div.editorial-grid__container` — `display: flex`, **889px** |
| Cards | 2 `article.editorial-card`, **889×519px cada** |
| Card | fundo **branco**, `border: 1px solid #e8e3dd`, raio **20px**, `box-shadow: rgba(0,0,0,0.04) 0 1px 3px` |
| Foto | 887×240px, `object-fit: cover`, raio 0 (o card corta) |
| Eyebrow | `span.editorial-card__eyebrow` 12px 800 roxo — "APRENDA" / "CONECTE-SE" |
| Título | `h3.editorial-card__title` Inter 800 **22,4px**, largura do texto **815px** |
| Botão | `.editorial-card__cta` — **fundo marrom/tijolo `#a8734a`**, texto branco |
| Tratamento do percurso | **0 ocorrências.** É o único bloco que não recebeu o sistema |

**⚠ Este é o corpo estranho da página.** É o único card com raio 20, sombra,
fundo branco e foto — uma linguagem de "landing page" que não aparece em mais
nenhum lugar. Também é a única seção com botão de cor quente.

**As fotos:** `unsplash.com/photo-1434030216411-0b793f4b4173` ("Pessoa estudando")
e `unsplash.com/photo-1521737604893-d14cc237f11d` ("Pessoas em reunião online"),
ambas com `alt` descritivo.

### 2.10 RECURSOS — `section.deco-hospedeiro.resources-section.dp-ajuda#recursos`

| item | valor |
|---|---|
| Altura | 812px · fundo papel · padding 96px topo, **0 base** |
| Container | `div.dp-ajuda__container` (max-width 1200px) |
| Grade | `div.dp-ajuda__grade` — **2 colunas, `gap: 0 64px`** |
| Decorativo | `deco--nuvem` 112px, +6°, topo direito |

**Coluna esquerda** — `h3` "Recursos Úteis" + 3 `a.resource-item`:
1. "Passo a passo para denunciar discriminação" / "Saiba como e onde registrar uma ocorrência" (megafone)
2. "Modelos de solicitação" / "Para escola, empresa e serviços públicos" (mão com papel)
3. "ONGs e associações de apoio" / "Rede de suporte em todo o Brasil" (construção)

⚠ **Os 3 `href` são literalmente `#`** — não vão a lugar nenhum. Botão
"Baixar modelos de documentação" é `<button class="case-submit-btn">` roxo, sem
ação identificada no JS.

**Coluna direita** — a Lia e o formulário:
- `div.dp-lia` com `img.dp-lia__img` = `/img/ilustracoes/lia-gif-chibi-alpha.gif` (202KB, `alt=""`)
- `h3` "Não sabe por onde começar?" em Playfair itálico
- `p` com **3 leis principais** em negrito dentro do texto corrido
- `ul.dp-clarezas` com 4 itens (bola roxa como marcador)
- `form#caseForm`: `input[type=text]` ("Seu nome"), `input[type=email]` ("Seu e-mail"), `textarea` (descrição do caso)
- Botão: "Enviar e receber análise gratuita" (`fa-file-arrow-up`)
- `p` de segurança: "Seus dados estão seguros. Não compartilhamos com terceiros."

**Campos do formulário (medido):** os 3 têm `required`, **nenhum tem `<label>`**,
nenhum tem `name`, nenhum tem `id`, nenhum tem `autocomplete`. Vivem só de
`placeholder` — o nome acessível vem do placeholder, o que é frágil.

### 2.11 SEPARADOR 2 — `div.rd-sep`

Idêntico ao primeiro. 76px. Cai entre `#recursos` e `#faq`.

### 2.12 FAQ — `section.deco-hospedeiro.rights-faq.dp-faq#faq`

| item | valor |
|---|---|
| Altura | 650px · fundo **branco puro** · padding 88px topo, 0 base |
| Head | `header.rights-faq__head` — 106px, **text-align: center** (as outras 2 heads são à esquerda) |
| Badge | "DÚVIDAS FREQUENTES" (fa-circle-question) |
| Título | `h2.dp-secao__titulo` Inter 800 22px |
| Subtítulo | "As dúvidas mais comuns de quem chega até aqui." |
| Fio | `border-bottom: 2px solid var(--dp-tinta)`, 921px de largura |
| Itens | **6 `<details>`** + `<summary>`, `border-bottom: 1px solid var(--dp-borda)` |
| Marca de aberto | `fa-solid fa-chevron-down` roxo, **girada 180°** |
| **Intocado** | o `percurso.css` declara "6 `<details>`, intocados" |

As 6 perguntas: laudo médico · adaptações na escola · demissão por neurodivergência ·
BPC/LOAS · acompanhante terapêutico · denunciar discriminação.

### 2.13 CONTATO — `section.deco-hospedeiro.rights-contact.dp-contato#contato`

| item | valor |
|---|---|
| Altura | 389px · fundo papel · padding 96px topo, 0 base |
| Decorativo | `deco--coracao` 50px, +9°, topo direito |
| Badge | `span.acolheria-badge-nome` (fa-robot) "ASSISTENTE VIRTUAL" |
| Título | `h2` Inter 800 **26px** — o maior h2 da página |
| Fio | `border-bottom: 2px solid var(--dp-tinta)`, só 488px (não vai até o fim) |
| Parágrafo | "Converse com a **Lia** sobre leis, benefícios e como agir em situações específicas." |
| Card | `div.rights-contact__card.dp-contato__container` — **`display: grid`, 2 colunas (`1fr` + 300px)** |
| Coluna 1 | `div.rights-contact__content` + `p.acolheria-card-nota` (nota de IA) |
| Coluna 2 | `img.dp-contato__lia` = `/img/lia/lia-direitos-percurso.png` 720×603, 73KB |
| Botões | "Conversar com a Lia" (roxo, `/chat-Ia/chat-Ia.html`) · "Entrar na comunidade" (contorno) |
| Nota | "AcolherIA é uma inteligência artificial. Ajuda com informação e acolhimento, mas não faz diagnóstico e não substitui profissional de saúde." |

**A Lia do contato** é um `background-image`-derivado de `/img/lia/lia-direitos-clara.png`
com a linha trocada para `#7c3aed` e recortada na bounding box da tinta.
`alt=""`, `aria-hidden="true"`, `pointer-events: none`, `rotate(-2deg)`.
Estoura 3,4px do card à direita (é a rotação numa arte de 209px de altura) —
invisível porque o card é transparente e sem borda.

### 2.14 FOOTER — `footer.footer`

| item | valor |
|---|---|
| Altura | 452px · **fundo `#f0f4f8`, cinza azulado — a única quebra de cor real** |
| Borda superior | `1px #d0dce8` |
| Blocos | `div.footer-main` + `div.footer-bottom` |
| Colunas | 4 `h4`: Navegue · Sobre · Apoie · Redes |
| Links | 15 no total, **0 externos** (`target="_blank` = 0) |

---

## 3. EXPERIÊNCIA DE ROLAGEM — A PARTE CENTRAL

### 3.1 Mapa de fundo, seção por seção

| seção | y | fundo | o que muda |
|---|---|---|---|
| DOBRA | 0–398 | **arte + gradientes** | ← o único momento com imagem |
| NAV | 398–478 | papel 92% | vidro, sticky |
| INTRO | 478–699 | **branco** | nuvem |
| SEP | 699–775 | papel | losango + fio |
| CATEGORIAS | 775–1421 | papel | 4 linhas com cor |
| LEIS | 1421–3889 | **branco** | 12 linhas |
| FONTES | 3889–4230 | papel | 6 chips |
| EDITORIAL | 4230–5431 | papel | **card branco + foto** |
| RECURSOS | 5431–6243 | papel | grade 2 col |
| SEP | 6243–6319 | papel | losango + fio |
| FAQ | 6319–6970 | **branco** | 6 details |
| CONTATO | 6970–7359 | papel | grid 2 col + Lia |
| FOOTER | 7359–7811 | `#f0f4f8` | **cinza azulado** |

### 3.2 Onde a página fica "branco + preto + texto + branco + preto + texto"

Existem **dois** trechos assim. Estão medidos.

#### TRECHO A — y 1421 a 5431 (4.010px, **51% da página**)

```
1421  LEIS ───── branco puro, 2.468px
        ├ head: badge 10px + h2 22px + subtítulo, fio 2px
        └ 12 linhas iguais: rótulo 10px + h3 18px + p 15px + nº + link
                             gap 0, borda 1px entre elas
3889  FONTES ─── papel, 341px
        ├ h3 22,4px CENTRALIZADO (≠ as heads vizinhas)
        └ 6 chips brancos com borda, 43px, raio 30px
4230  EDITORIAL ─ papel, 1.201px
        └ 2 cards brancos, raio 20, sombra, foto 240px
5431  RECURSOS ── papel, 812px
```

**Por que acontece:** as três seções empilham o mesmo esquema —
um cabeçalho pequeno em cima, depois uma lista de itens com borda fina embaixo.
Nenhuma muda de grade, de cor de fundo, de escala ou de alinhamento.
O `#editorial` tenta quebrar com um card de verdade, mas ele está **quase no fim
do trecho** (4230 de 1421–5431), e como é a única seção com foto ali, ele aparece
como uma exceção tardia, não como uma virada.

Resultado: 2.537px de rolagem contínua (y 1421 → 3889 → 4230) sem um único
momento visualmente distinto.

#### TRECHO B — y 6970 a 7359 (389px, o fim)

```
6970  FAQ     ── branco puro, 650px, 6 linhas com fio
7359  CONTATO ── papel, grid 2 colunas
7811  FOOTER  ── cinza azulado
```

O FAQ é 6 linhas de pergunta em negrito com borda de 1px. A seção do contato é
um grid de 2 colunas. A passagem entre as duas é um salto de fundo de 8 níveis
(visualmente nada) e nada mais. Quem rola do fim do FAQ para o início do contato
não recebe nenhum sinal de que chegou ao fim.

#### TRECHO C (menor, mas igualmente visível) — y 478 a 1421

```
478   INTRO       ── branco, título Playfair 28px CENTRALIZADO, 5 chips
775   SEP         ── losango + fio
775   CATEGORIAS  ── papel, título Inter 22px À ESQUERDA, 4 linhas
1421  LEIS        ── branco, título Inter 22px À ESQUERDA, 12 linhas
```

**A inversão mais brusca da página está entre a INTRO e CATEGORIAS.** A INTRO é
centralizada com Playfair; a CATEGORIAS é alinhada à esquerda com Inter. Duas
linguagens opostas, separadas por 76px de losango. Não há ponte entre elas.

### 3.3 Onde existem respiro proposital

- **y 699–775 e y 6243–6319**: os dois `rd-sep`, 76px com fio em degradê e
  losango. São a única divisória tipográfica da página — e é sempre a mesma.
- **O fim de cada seção tem `padding-bottom: 0`.** Nenhuma das 5 seções do
  percurso declara piso. A distância entre o fim de uma seção e o começo da
  próxima vem só do `padding-top` da próxima (88 ou 96px). Isso **uniformiza**
  as transições — não as diferencia.
- **CATEGORIAS e LEIS se tocam** (`gap: 0`): CATEGORIAS termina em 1421 e LEIS
  começa em 1421. As duas heads têm 106px de altura e a mesma anatomia
  (badge 10px + h2 22px + p 15px + fio 2px). Passagem invisível.

### 3.4 Onde existe repetição visual

| repetição | onde | nº |
|---|---|---|
| head de seção com fio 2px sob o título | CATEGORIAS, LEIS, FAQ, CONTATO | **4** |
| head de seção com 106px de altura | CATEGORIAS, LEIS, FAQ | **3** |
| h2 Inter 800 22px | CATEGORIAS, LEIS, FAQ | **3** |
| badge 10px uppercase cinza | CATEGORIAS, LEIS, FAQ | **3** |
| chip em raio 30px | INTRO (5), FONTES (6) | **11** |
| borda 1px `--dp-borda` separando itens | CATEGORIAS, LEIS, FAQ, RECURSOS | **4** |
| item = rótulo + título + descrição + ação à direita | 4 áreas, 12 leis, 6 FAQ, 3 recursos | **25 linhas** |
| `padding: 96px 48px 0` ou `88px 48px 0` | 5 seções | **5** |
| container `max-width: 1200px` | NAV, DOBRA, CATEGORIAS, RECURSOS, CONTATO | **5** |

**Quantidade de linhas com a mesma anatomia:** 25. É o dado mais importante
deste documento. Quatro em cinco seções da página são listas do mesmo formato.

### 3.5 Onde existe repetição CONSISTENTE (manter) × repetição MONÓTONA (rever)

**Consistente — a Repetir é a assinatura da página:**
- As 12 leis como linhas: sem número, sem foto, sem sombra. A decisão foi
  documentada e funciona — o número da lei em destaque é o que importa.
- A anatomia da head de seção (badge + h2 + p + fio): cria um ritmo estável.
- A cor por área repetida em 3 lugares (fio da linha, rótulo da lei, nº da lei).
- O chip-âncora da navegação.

**Monótona — a Repetir empobrece:**
- 3 heads idênticas de 106px em sequência (CATEGORIAS, LEIS, e a head do FAQ
  que só muda o alinhamento).
- 4 seções com `padding-top` de 88 ou 96px e **nenhuma** com piso declarado.
- As 11 pílulas em raio 30px, com dois visuais distintos (#f5f3ff sem borda na
  INTRO; branco com borda nas FONTES) que não conversam entre si.
- 25 linhas com a mesma anatomia em 4 seções diferentes.

### 3.6 Onde a página fica excessivamente branca

**A seção LEIS: 2.468px de branco puro.** Ela ocupa 31,6% do documento inteiro.
Dentro dela:
- as 12 fotos foram removidas (decisão certa, documentada);
- as 12 linhas são de 172 ou 196px com `border-bottom` de 1px;
- não há uma única imagem, ilustração, marca ou bloco de cor que quebre a sequência.

Medindo a densidade de "tinta" (pixel a 60+ de distância do fundo) por faixa de
100px, a seção LEIS fica entre **1,2% e 9,1%** — contra **96% a 100%** nas faixas
de foto do EDITORIAL. É a maior inversão de contraste da página: de 4% para 100%
em 300px, e de volta.

### 3.7 Onde existe muito texto consecutivo

- **LEIS**: 12 títulos + 12 descrições de 2 linhas cada, sem nada entre eles.
  Em 1440px de largura, o texto de descrição é limitado a `68ch`, mas a linha
  ocupa 921px — sobra **~300px vazios à direita de cada parágrafo**.
- **FAQ**: 6 perguntas, nenhuma resposta visível até o clique. 650px de
  perguntas sem resposta.
- **INTRO**: título + 1 frase + 5 chips.

### 3.8 Onde a página fica excessivamente "vazia"

- **y 6900–7000**: 100px de papel entre FAQ e CONTATO (medido na captura:
  0,5% de tinta).
- **y 700–800**: 100px de papel puro entre o separador e as CATEGORIAS
  (medido: **0,0% de tinta**).
- **CATEGORIAS**: `padding-bottom: 0` e 4 linhas de 104px = a seção é 646px
  mas só 86% dela tem container.

---

## 4. IDENTIFIQUE OS "VAZIOS VISUAIS"

### Vazio 1 — As 5 seções que são listas do mesmo formato

| | |
|---|---|
| **Seção** | CATEGORIAS, LEIS, RECURSOS, FAQ (e, em parte, FONTES) |
| **Problema** | 4 listas com a mesma anatomia, em sequência, sem mudança de linguagem entre elas |
| **Por que parece simples** | Todas usam: cabeçalho pequeno → lista de itens com borda de 1px → texto de 2 linhas → ação à direita. Nenhuma muda de grade, escala ou cor de fundo |
| **É visual ou proposital?** | **Visual.** O branco proposital existe e está bem colocado (respiro, separação de blocos). O que falta é diferenciação entre blocos de conteúdo de naturezas diferentes |
| **Oportunidade?** | Sim, alta. É aqui que a página perde a personalidade. Não precisa de mais imagens — precisa de **composição diferente por natureza de conteúdo**: uma área é navegação, outra é referência, outra é pergunta |

### Vazio 2 — FONTES como bloco de texto genérico

| | |
|---|---|
| **Seção** | FONTES (y 3889–4230) |
| **Problema** | Uma seção de 341px com 1 título, 1 frase e 6 chips, centralizada — sem nenhum elemento visual próprio |
| **Por que parece simples** | É o único lugar da página onde 6 pílulas brancas com borda aparecem, mas o contexto não diz "aqui estão as fontes oficiais". Nada ancorando visualmente a ideia de "confiabilidade" |
| **É visual ou proposital?** | Parcialmente proposital — 341px é pouco espaço para inventar. **Mas** a seção tem o único `border-top: 1px` da página, sinalizando que ela é um bloco de referência, e o resto não acompanha |
| **Oportunidade?** | Sim, moderada. É um candidato natural a receber a **ilustração que já existe no disco** (`OS SEIS SÍMBOLOS DOS DIREITOS.jpg`, 1024×559, 98KB) — que hoje está Referenciada pelo slot `direitos-01` e **não é exibida** |

### Vazio 3 — EDITORIAL: o corpo estranho

| | |
|---|---|
| **Seção** | EDITORIAL (y 4230–5431) |
| **Problema** | É o único card com raio 20, sombra, botão tijolo — de outra página. E mesmo assim não destaca o bastante para marcar a transição do trecho mais longo |
| **Por que parece simples** | Na verdade ele é **simpático demais** para a página. Chega tarde (após 2.800px de lista) e seus 2 cards de 519px com foto de 240px viram mais "mais do mesmo" |
| **É visual ou proposital?** | Não é proposital. É herança do `direitos.css`, que o percurso **não tocou** (`percurso_toca_editorial: []`) |
| **Oportunidade?** | Sim, alta. Tem 1.201px e 2 fotos — é o maior bloco de imagem da página fora da dobra, e ele não está cumprindo a função que poderia |

### Vazio 4 — A quebra INTRO → CATEGORIAS

| | |
|---|---|
| **Seção** | Transição y 699 → 1421 |
| **Problema** | Inversão de linguagem sem ponte: Playfair centralizado → Inter à esquerda |
| **Por que parece simples** | O `rd-sep` entre elas é a **mesma** marca genérica usada na outra transição da página (6243). Não sinaliza "começa o percurso", sinaliza "mais uma seção" |
| **É visual ou proposital?** | **Visual.** O branco entre elas (76px + 88px de padding) é bom respiro e deve ficar. O que falta é uma marca de transição que diga "aqui o percurso começa" |
| **Oportunidade?** | Sim, alta, e é barato: o `rd-sep` já é um elemento de 76px que existe duas vezes. Ele pode carregar hierarquia |

### Vazio 5 — O fim da página (FAQ → CONTATO → FOOTER)

| | |
|---|---|
| **Seção** | y 6319 → 7811 |
| **Problema** | 3 seções, 1.492px, e o único sinal de "chegou ao fim" é o cinza do footer |
| **Por que parece simples** | FAQ (branco) → CONTATO (papel, 8 níveis de diferença) → FOOTER (cinza). O salto perceptual real só vem no footer, depois de 389px de seção que já parece paperão |
| **É visual ou proposital?** | O CONTATO tem 389px com respiro — isso é bom e proposital. O problema é que o CONTATO é **a única seção sem badge e sem fio de head**, então quebra o padrão sem motivo funcional |
| **Oportunidade?** | Sim, moderada |

### Vazio 6 — A navegação não acompanha a rolagem

| | |
|---|---|
| **Seção** | NAV (sticky, 80px, presente na tela durante 6.900px) |
| **Problema** | O chip "Categorias" fica roxo sólido durante toda a rolagem, inclusive quando a pessoa está lendo o FAQ |
| **Por que parece simples** | Não é um vazio visual, é uma **funcionalidade ausente**: não existe scroll-spy nesta página |
| **É visual ou proposital?** | Funcional, não visual |
| **Oportunidade?** | Sim — e é das poucas mudanças que **somam** em vez de tirar |

---

## 5. INVENTÁRIO VISUAL

### 5.1 Imagens e ilustrações

| arquivo | onde | estado | alt |
|---|---|---|---|
| `img/ilustracoes/imagem-direitos.jpg` | **fundo da dobra**, 5ª camada do `::after` | **ativa**, 30KB, 1024×572 | n/a (`background-image`) |
| `img/ilustracoes/OS SEIS SÍMBOLOS DOS DIREITOS.jpg` | slot `direitos-01` (`data-fundo`) | **NÃO exibida** — o slot está `display:none` | n/a |
| `img/ilustracoes/A MARCA "VALIDAR".jpg` | slot `direitos-02` (`data-fundo`) | **NÃO exibida** + **o arquivo não existe** | n/a |
| `img/lia/lia-direitos-percurso.png` | `#contato`, coluna 2 do grid | **ativa**, 73KB, 720×603 | `alt=""` + `aria-hidden` |
| `img/ilustracoes/lia-gif-chibi-alpha.gif` | `#recursos`, `img.dp-lia__img` | **ativa**, 202KB, 240×240 | `alt=""` |
| `img/logo-LHN9gCw1.png` | header | ativa, 113KB | "Amor NeuroDivergente" |
| `img/foto-padrão.jpg` | perfil (sidebar) | ativa, 4KB | "Sua…" |
| `img/lia/lia-direitos-clara.png` | — | **origem** da Lia roxa; intocado, 54.157B | — |
| 2 fotos `unsplash` | `#editorial` | **ativas**, 887×240px cada | descritivos |
| 12 fotos `unsplash` | `direitos.js` `getLawImage()` | **geradas no `innerHTML` e escondidas** por `display:none` | o título da lei, repetido |
| `img/lia/lia-direitos-clara.png` → base | `/img/lia/` tem 15 arquivos | não referenciados por esta página | — |

**Contagem de imagem visível na página: 5** (dobra, 2 fotos do editorial, 2 Lias)
em 7.811px. **As 12 fotos de lei continuam sendo baixadas do Unsplash**
(12 URLs × `loading="lazy"`) mesmo com `display:none` — porque `loading="lazy"`
só adia a carga de elemento que entra no viewport, e estes estão.

### 5.2 Formas e gradientes

| elemento | onde | medida |
|---|---|---|
| `radial-gradient(circle 4.5px…)` | dobra, ponto de marcação | roxo 55%, 9px |
| `radial-gradient(circle 230px…)` | dobra, arco aberto | anel 1px a 11% |
| `radial-gradient(ellipse 58% 70% at 84% 10%)` | dobra `::before` | `#7c3aed` a 0,048 |
| `radial-gradient(ellipse 46% 58% at 8% 86%)` | dobra `::before` | `#ec4899` a 0,030 |
| `radial-gradient(ellipse 52% 62% at 52% 46%)` | dobra `::before` | `#38bdf8` a 0,034 |
| `linear-gradient(to right…)` | dobra, véu do título | 0,90 → 0 em 60% |
| `linear-gradient(to bottom…)` | dobra, véu vertical | papel em 0% e 100% |
| `linear-gradient(90deg, #ddd6fe, transparent)` | `.rd-sep::after` ×2 | 1px, esvanece à direita |

⚠ **Armadilha registrada no arquivo:** `radial-gradient(circle Npx, cor 0, cor 100%)`
**estende a última cor para fora do círculo**. Foi a causa de um banner roxo
`(180,144,244)` na dobra. Todo `circle` precisa de `transparent 100%` no fim.
Já está aplicado nas 3 camadas.

### 5.3 Decorativos (`elementos-decorativos.css`)

| elemento | seção | tamanho | rotação |
|---|---|---|---|
| `deco--nuvem` esq topo s2 | INTRO | 120px | −8° |
| `deco--coracao` esq topo s1 | LEIS | 46px | −11° |
| `deco--organicas` dir base s2 | FONTES | 80px | +8° |
| `deco--nuvem` dir topo s2 | RECURSOS | 112px | +6° |
| `deco--organicas` dir topo s3 | FAQ | 78px | −5° |
| `deco--coracao` dir topo s1 | CONTATO | 50px | +9° |

**6 elementos, todos `aria-hidden="true"`.** A distribuição é irregular: 3 no
canto superior esquerdo, 3 no direito, e nenhum no EDITORIAL (a única seção com
foto) nem na dobra (que já tem arte).

**Fora do fluxo:** sidebar-toggle, floating-hub (com WhatsApp, comunidade,
doações), botão da AcolherIA, botão de acessibilidade "?", `userway`, `vlibras`.

### 5.4 Ícones (Font Awesome 6.4.0 via CDN)

| contexto | ícones |
|---|---|
| Header | `chevron-right` (breadcrumb ×2), `magnifying-glass` |
| Percurso | nenhum |
| NAV (6 chips) | `layer-group`, `book`, `lightbulb`, `toolbox`, `circle-question`, `comment-dots` |
| Badges de seção | `image`, `book`, `book-open-reader`, `circle-question`, `robot` |
| 4 áreas | 1 ícone por área (via `law.icon` do banco) |
| 12 leis | 1 ícone por área, repetido |
| FONTES | `landmark`, `graduation-cap`, `heart-pulse`, `chart-line`, `people-group`, `hand-holding-heart` |
| RECURSOS | `megaphone`, `hand`, `building`, `file-arrow-up` |
| FAQ | `chevron-down` (gira ao abrir) |
| Links de lei | `arrow-right` |

### 5.5 Cores — o vocabulário real

```
--dp-tinta     #1a1a2e   texto principal
--dp-suave     #5c5652   texto secundário
--dp-roxo      #7c3aed   a cor da marca
--dp-roxo-claro#ede9fe
--dp-aviso     #f2b705   DECLARADO E NUNCA USADO (1 ocorrência, só a definição)
--dp-borda     #e8e3dd   as linhas divisórias
--dp-papel     #faf9fe   o fundo das 7 seções
--dp-papel-quente #f5f3fa DECLARADO E NUNCA USADO (1 ocorrência)
```

**Cores por área:** educacional `#6d28d9` · saude `#15803d` · social `#1d4ed8` ·
acessibilidade `#be185d`.

**Fora do sistema (heranças):**
- laranja do header `rgba(238,123,1,0.54)`
- tijolo do botão do editorial `#a8734a`
- fundo do footer `#f0f4f8`
- chips da INTRO `#f5f3ff` / `#6d28d9`
- cinza do título do FAQ? não — o FAQ herda `--dp-tinta`

### 5.6 Tipografia — a hierarquia medida

| nível | elemento | família | tamanho | peso |
|---|---|---|---|---|
| 1 | `h1` dobra | Inter | **35px** | 800 |
| 1b | `accent` do h1 | Playfair itálico | 35px | 700 |
| 2 | `h2` INTRO | **Playfair** | **28px** | 700 |
| 2 | `h2` CONTATO | Inter | **26px** | 800 |
| 3 | `h3` EDITORIAL | Inter | **22,4px** | 800 |
| 3 | `h3` FONTES | Inter | **22,4px** | 800 |
| 3 | `h2` CATEGORIAS / LEIS / FAQ | Inter | **22px** | 800 |
| 4 | `h3` da lei | Inter | **18px** | 800 |
| 4 | `span` área | **Playfair** | **22px** | 700 |
| 5 | num do percurso | **Playfair** | 15px | 700 |
| 5 | texto do percurso | Inter | 15px | 600 |
| — | badges | Inter | **10px** | 700 |
| — | corpo | Inter | 15–17px | 400–500 |

**Só 2 famílias no total: Inter e Playfair Display.** Playfair aparece em 4 lugares
(marca do percurso, accent do h1, título da INTRO, título de cada área) — sempre
em itálico ou em Playfair puro, sempre como contraste com Inter 800.

⚠ **Só existe 1 `h1`** na página (o da dobra). Tudo o mais é `h2` ou `h3`.
Os 4 títulos "de seção" são `h2`; os títulos dos 2 cards do editorial e o
título das FONTES são **`h3`** — ou seja, o "Quer se aprofundar?" é um `h3`
mesmo tendo a mesma Importance visual dos `h2` vizinhos.

---

## 6. FUNCIONALIDADE QUE NÃO PODE SER QUEBRADA

### 6.1 As 12 leis

- **Origem:** banco embutido em `direitos.js` (array `lawsDatabase`), 12 objetos
  com `title`, `description`, `category`, `number`, `icon`, `iconClass`, `externalLink`.
- **Renderização:** `renderLaws()` monta o `innerHTML` do `#lawsGrid`. Chamado
  uma vez no `DOMContentLoaded` e a cada filtro/busca.
- **Classes geradas:** `law-editorial-card law-editorial-card--{left|right}`,
  `data-category="{categoria}"`.
- **`categoryMap`:** educacional → "Educacional", social → "Assistência Social",
  acessibilidade → "Acessibilidade", saude → "Saúde".
- **`getLawImage()`:** escolhe entre 12 URLs do Unsplash por categoria + índice.
  As imagens não são exibidas, mas **continuam no DOM**.
- **`escapeHtml()`** é aplicado a título, descrição e número.
- **Links:** `http://www.planalto.gov.br/...` com `target="_blank" rel="noopener"`.
- **⚠ Dependência frágil:** `.law-editorial-card[hidden] { display: none }` é
  (0,2,0) e é o que faz o filtro funcionar. **Não declarar `display` em seletor
  de peso ≥ (0,2,0) nesta classe.**

### 6.2 Filtro por categoria

- **Gatilho:** clique em `a.category-tile`.
- **Código:** `currentFilter = tile.dataset.filter || 'todas'; currentSearch = '';`
- **Comportamento:** o clique também **limpa a busca**.
- **Comportamento confirmado:** 12 → 3 (educacional) / 2 (saude) / 4 (social) /
  3 (acessibilidade). Cada grupo mostra só a cor da sua área.
- **Não há** estado visual persistente do filtro ativo no tile.

### 6.3 Estado vazio

`p#lawsNoResults` — existe no HTML, `hidden = false` quando o filtro não acha nada.
Contém `<i>` + texto.

### 6.4 Navegação interna

- 6 chips `a` → `#categorias`, `#leis`, `#editorial`, `#recursos`, `#faq`, `#contato`.
- `scroll-margin-top: 168px` nos 6 (o header tem 75px, a nav tem 80px → 155px + folga).
- **`is-active` é estático**, sem scroll-spy.

### 6.5 Formulário `#caseForm`

```js
caseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome      = caseForm.querySelector('input[type="text"]')?.value || '';
    const email     = caseForm.querySelector('input[type="email"]')?.value || '';
    const descricao = caseForm.querySelector('textarea')?.value || '';
    if (!nome || !email || !descricao) {
        showToast('Preencha todos os campos para enviar seu caso.', 'error');
        return;
    }
    showToast('Caso enviado! Nossa equipe vai analisar em breve. 💜', 'success');
    caseForm.reset();
});
```

- **Não há Supabase, não há `fetch`, não há envio real.** É um toast local.
- **Busca por seletor de tag**, não por `name`/`id` → **os campos podem ser
  reordenados ou renomeados à vontade**, desde que as tags se mantenham.
- Os 3 campos têm `required` (validação nativa) mas **nenhum tem `<label>`**.
- Toast: `showToast(mensagem, tipo)` com `error`/`success`.

### 6.6 AcolherIA (widget da Lia)

- `div#acolheriaOverlay` > `div.acolheria-modal` — `hidden`, `display: none`.
- Botão flutuante com `data-ia-abrir`, `title="Conversar com a Lia"`.
- **6 `.acolheria-suggestion`** (sugestões prontas).
- Carregado por `/Acolher-IA/seguranca.js` + `/Acolher-IA/Acolher-IA.js`.
- A nota "AcolherIA é uma inteligência artificial…" é **conteúdo editorial
  obrigatório** (transparência sobre a natureza do serviço).

### 6.7 Busca global

- `busca.js` cria o `<button class="busca-btn">` e o `<dialog class="busca-caixa">`
  **em execução**, dentro de `nav.header-links` (que está vazio no HTML).
- Índice: `busca-indice.js` (21KB, gerado por `ferramentas/gerar-indice-busica.py`),
  31 páginas.
- **A entrada de Direitos no índice ainda diz:**
  - `h1`: "Juridiquês? Aqui a gente traduz." ← **obsoleto** (o h1 real mudou)
  - `descricao`: "Seus direitos como pessoa neurodivergente…"
  - 10 seções listadas
- Busca com `role="region" aria-live="polite"`, navegação por setas e Enter.

### 6.8 Supabase

**Nenhuma referência a Supabase nesta página.** Nenhum `supabase.from()`, nenhuma
chave. Os dados das leis são locais (`direitos.js`). O widget da AcolherIA tem
`seguranca.js`, mas não toca banco nesta página — **não verificado em detalhe**.

### 6.9 Perfil e sessão

`syncProfile()` lê `localStorage` (`userAvatar`, `userName`, `userRole`) e
atualiza o header. `storage` como listener para sincronizar entre abas.
`logoutBtn` aparece/desaparece com o `scroll`.

### 6.10 FAQ

6 `<details>` nativos, **sem JS**. Abre e fecha nativamente; o
`::details-marker` é substituído por um `fa-chevron-down` que gira 180°.

### 6.11 Link "voltar ao topo"

`#scrollTopBtn` — **procurado 5 vezes em `direitos.js`, mas não existe no HTML
desta página.** O listener faz `if (scrollTopBtn)`, então não quebra, mas é
código morto aqui.

### 6.12 Acessibilidade de terceiros

`userway.js` (alto contraste / daltonismo) e `vlibras.js` (Libras).
Ambos presentes. O botão flutuante "?" da direita é o vLibras.

### 6.13 Estado do modo escuro

`body.a11y-dark-mode` tem regras em `direitos.css` (fundos `#0f0f1a`, `#0a0f1c`,
`#1c1430`…). **A camada `percurso.css` não define nenhuma regra para
`a11y-dark-mode`** — o modo escuro é herança do CSS antigo e **não foi
verificado visualmente** nesta sessão.

### 6.14 Movimento reduzido

`/movimento-reduzido.css` + bloco próprio do `percurso.css` (§9).
Verificado: com `prefers-reduced-motion: reduce`, as 186 transições da página caem
para `1e-05s`.

### 6.15 Inventário de scripts

| script | papel |
|---|---|
| `/imagens.js` | ponto único para trocar as imagens da Lia (não altera esta página) |
| `direitos.js` | **leis, filtro, busca de lei, formulário, sidebar, hub, toast, perfil** |
| `/Acolher-IA/seguranca.js` | proteção do widget |
| `/Acolher-IA/Acolher-IA.js` | widget da Lia |
| `/pular-conteudo.js` | link de pular para o conteúdo |
| `/busca-indice.js` | índice gerado |
| `/busca.js` | UI da busca |
| `/userway.js` | acessibilidade |
| `/vlibras.js` | Libras |

Nenhum `<script>` inline. 8 folhas de estilo locais + 1 CDN.

---

## 7. DIAGNÓSTICO FINAL

### Onde a página está forte e onde ela perde força

#### Pontos fortes atuais

1. **A dobra.** É a melhor parte da página e a única com três camadas de profundidade real:
   arte de fundo, 4 gradientes, 2 formas CSS, título em 2 famílias, e um percurso
   de 3 itens à direita. Contraste medido entre 5,44:1 e 16,28:1. É referência
   para o resto do site.
2. **As 12 leis como linhas.** A decisão de remover as 12 fotos está documentada e
   é a decisão certa: as imagens diziam o mesmo que o título. O número da lei em
   destaque (12,5px, na cor da área) é o que importa e está no tamanho certo.
3. **A cor por área, repetida em 3 lugares** — fio da linha, rótulo da lei, nº da
   lei. Um código só, três lugares, e o filtro e a linha falam a mesma língua.
4. **A Lia antes do formulário**, com 4 clarezas e a nota de transparência sobre a IA.
5. **A navegação sticky** com os 6 alvos e o `scroll-margin-top` de 168px — o bug
   recorrente de cobrir conteúdo está resolvido nesta página.
6. **Só duas famílias tipográficas** em toda a página. Disciplina rara.
7. **A métrica de contraste das 4 áreas**: 7,1 / 5,0 / 6,7 / 6,0 — todas passam AA
   com folga, e nenhuma delas compete com o texto do título.

#### Pontos que estão simples demais

1. **As 5 seções entre y 1421 e 5431.** 4.010px — 51% da página — sem uma única
   quebra perceptível. É o problema central.
2. **As 12 leis em 2.468px de branco puro.** 31,6% do documento, densidade de tinta
   entre 1,2% e 9,1%. Medida de silêncio visual.
3. **LEIS → FONTES → EDITORIAL**: a mesma anatomia de cabeçalho + lista, três vezes.
   A única variação é o alinhamento do título do FAQ (centro vs esquerda).
4. **EDITORIAL é o corpo estranho.** Único card com raio 20, sombra, botão tijolo —
   e é a única seção que o percurso **não tocou** (`percurso_toca_editorial: []`).
   Chega tarde demais para marcar a transição.
5. **FONTES**: 341px, 1 título, 1 frase, 6 chips. Tem o único `border-top` da página
   e nenhum elemento visual que diga "aqui está a fonte oficial". E a ilustração
   `OS SEIS SÍMBOLOS DOS DIREITOS.jpg` que existe no disco **não é exibida**.
6. **A inversão INTRO → CATEGORIAS** sem ponte: Playfair centralizado → Inter à
   esquerda, com um separador que é a mesma marca genérica da outra transição.
7. **O fim da página**: FAQ → CONTATO → FOOTER em 1.492px, e o único sinal de fim
   é o cinza do footer, depois de 389px que já parecem papelão.
8. **A navegação não acompanha a rolagem** — o chip ativo é fixo.
9. **300px vazios à direita de cada parágrafo de lei.** O texto é limitado a `68ch`
   numa linha de 921px.
10. **Os 2 tokens de cor nunca usados** (`--dp-aviso`, `--dp-papel-quente`) e as
    **12 imagens de lei baixadas e escondidas** — resíduo de uma decisão anterior.

#### Pontos que funcionam bem e não devem ser mexidos

- A **dobra** inteira (arte + véus + título + percurso). É a referência do site.
- O **`rd-sep`** como dispositivo de 76px. Ele existe, é limpo e tem `aria-hidden`.
  Precisa de hierarquia, não de remoção.
- A **cor por área** e os 3 pontos onde ela se repete.
- A **ficha das 12 leis**: sem foto, sem sombra, sem número. Funciona.
- O **`pointer-events: none` + `aria-hidden`** nos decorativos e nas 2 Lias.
- O **`scroll-margin-top` de 168px** nos 6 alvos.
- A **nota de transparência** da AcolherIA no contato.
- As **4 clarezas** do formulário.
- O **`overflow-x: clip`** no pai, que preserva o `position: sticky`.
- A **âncora de filtro nas 4 áreas** — clicar filtra e limpa a busca.

#### Pontos que precisam de nova composição visual

| trecho | y | por quê |
|---|---|---|
| **LEIS** | 1421–3889 | 2.468px de lista única. 12 itens com a mesma anatomia, 6 áreas filtráveis que não têm presença visual como filtro. É o maior bloco e o mais silencioso |
| **CATEGORIAS → LEIS** | 1421 | As duas heads têm **exatamente 106px** e `gap: 0` entre as seções. A passagem é invisível; e as duas seções são naturezas diferentes (navegar vs consultar) com o mesmo formato |
| **FONTES** | 3889–4230 | 341px com 6 chips. A seção mais "de fora" e a que menos se diferencia |
| **EDITORIAL** | 4230–5431 | 1.201px e 2 fotos num formato que não é da página. Precisa entrar no sistema, não sair dele |
| **FAQ → CONTATO** | 6319–7359 | 1.040px de fim de página sem sinal de chegada |

#### Pontos que precisam apenas de acabamento

- O chip ativo da navegação acompanha a rolagem (scroll-spy) — **ganho funcional**.
- O `h1` obsoleto no índice de busca ("Juridiquês? Aqui a gente traduz.").
- Remover os 2 tokens de cor não usados.
- Remover as 12 imagens de lei do `innerHTML` ou pelo menos do `loading`, em vez de
  escondê-las com `display: none`.
- O `width: 68ch` das descrições de lei vs os 921px de linha.
- `<label>` nos 3 campos do formulário (hoje o nome acessível vem do `placeholder`).
- O `href="#"` dos 3 `resource-item` — não vão a lugar nenhum.
- O `#scrollTopBtn` que o JS procura e que não existe nesta página.
- `box-sizing` e o `.dp-lia` que aparece em `img` com 202KB de GIF sem `width`/`height`.
- Verificar o `a11y-dark-mode`, que o percurso não cobre.

---

## 8. O QUE ESTE DOCUMENTO **NÃO** PROPÕE

Nenhuma solução de redesign está aqui. Este arquivo é um **levantamento**.

O que ele estabelece:

- onde a experiência de rolagem perde a personalidade (o trecho y 1421–5431, e o fim y 6319–7811);
- quantas vezes cada linguagem visual se repete (25 linhas com a mesma anatomia;
  4 heads com o mesmo fio; 3 heads de 106px; 11 chips em raio 30px);
- que **93% do documento é um dos dois brancos** e a diferença entre eles é de
  8 níveis — abaixo do degrau de percepção;
- que a página **não tem falta de imagem** (5 imagens visíveis, 11% do documento)
  e sim **falta de diferenciação entre blocos de naturezas diferentes**.

A filosofia que já vale para o resto do site e que este mapa deve orientar:
**menos imagens → mais composição → melhor tratamento das imagens que realmente
importam.** E: **branco é problema quando várias seções seguidas têm exatamente a
mesma linguagem** — não quando ele existe.

---

*Fim. Nenhum arquivo de código foi alterado nesta etapa.*