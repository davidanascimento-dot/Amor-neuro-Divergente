# DOCUMENTAÇÃO DO SITE — CONTEXTO PARA REDESIGN

> Documento descritivo. Não propõe layout, não propõe redesign, não critica.
> Tudo aqui foi medido no código em 06/10/2026.
> Quando algo não está claro no código, o documento diz que não está claro.

---

## 1. Visão geral do site

### 1.1 Proposta geral

O **Amor NeuroDivergente** é um site de conteúdo e comunidade para pessoas neurodivergentes (autismo, TDAH, dislexia, altas habilidades). O eixo declarado nas descrições `<meta>` é: *"conteúdo, comunidade e acolhimento para pessoas neurodivergentes"*, com promessa de **tradução** — o vocabulário técnico é sistematicamente reescrito em linguagem corrente (ex.: o título "Juridiquês? Aqui a gente traduz.").

Não há uma biblioteca, framework ou bundler de front-end. É HTML, CSS e JavaScript escritos à mão, servidos como arquivos estáticos.

### 1.2 Como o site é construído e servido

| Camada | Arquivo | O que faz |
|---|---|---|
| Servidor de desenvolvimento | `vite` (`npm run dev`) | serve os arquivos estáticos |
| Servidor de desenvolvimento (alternativo) | `server.js` (`npm run dev:server`, porta 3000) | serve estáticos **e** expõe `POST /api/acolheria`, que encaminha a mensagem para a API Groq com um prompt de sistema próprio |
| Build | `build.js` (`npm run build`) | copia tudo para `dist/` substituindo `%VITE_SUPABASE_URL%` e `%VITE_SUPABASE_ANON_KEY%` |
| Deploy (Netlify) | `netlify.toml` | `command = "npm run build"`, `publish = "dist"` |
| Deploy (Vercel) | `vercel.json` | `buildCommand = ""`, `outputDirectory = "."` — publica a **raiz**, não o `dist` |

Ponto factual relevante: **`dist/` está desatualizado em relação à raiz.** As versões em `dist/` de `inicio.html`, `index.html`, `Explorar.html`, `recursos.html`, `blog.html`, `direitos.html`, `apoiar.html` e `loja.html` são menores que as da raiz (ex.: `inicio.html` 52.419 bytes no `dist` contra 56.224 na raiz). `dist/` não contém `Direitos/design-direitos.css`, `foto-forma.css`, `elementos-decorativos.css`, `espacos-banner.css` nem `lia-chibi.css`. `dist/` está no `.gitignore`. Com as duas configurações de deploy atuais, a Netlify serviria uma versão sem os arquivos de estilo mais novos; a Vercel serviria a raiz.

### 1.3 Principais áreas

O site se organiza em uma área de **conteúdo editorial** (Explorar, Artigos e Guias, Blog, Eventos), uma área de **serviço/informação** (Seus Direitos, Apoiar, Loja) e uma área **social** (Comunidade, AcolherIA/chat com a Lia), mais Login e Configurações.

### 1.4 Navegação entre as áreas

Existem **três mecanismos de navegação simultâneos e independentes**, e eles não concordam entre si:

1. **Sidebar** (menu lateral, presente em 9 páginas) — 4 itens principais (Início, Explorar, Comunidade, Seus Direitos) + 2 secundários (Loja, Apoiar) + botão Entrar/Sair.
2. **Footer** (4 colunas, presente em 9 páginas) — 5 links em "Navegue", 3 em "Sobre", 2 em "Apoie", 3 redes sociais.
3. **Busca** — `busca.js` cria uma lupa no cabeçalho de 12 páginas, campo dentro de um diálogo, buscando num índice de 31 páginas.

Além disso: breadcrumb no cabeçalho (presente só em 7 páginas, com profundidades diferentes), links no corpo do conteúdo, e um **hub flutuante** (botão "Ajuda" fixo) presente em 10 páginas.

**Medição da divergência entre os três menus:** o mesmo destino aparece escrito de formas diferentes conforme a página.

| Destino | Sidebar em `inicio.html` | Sidebar em `apoiar/apoiar.html` | Footer |
|---|---|---|---|
| Explorar | `Explorar/Explorar.html` (relativo) | `/Explorar/Explorar.html` | `/explorar/explorar.html` |
| Apoiar / Doações | `apoiar/apoiar.html` | `/doacoes/doacoes.html` | `/doacoes/doacoes.html` (início: `/doações/doações.html`) |

O resultado é que **o menu pode levar a três URLs diferentes para a mesma área**, e algumas dessas formas não existem no disco (ver 7.4).

### 1.5 A função de Explorar

Explorar é, no código, o **hub editorial do site**: é a página que reúne, em um só lugar, as três áreas de conteúdo (Artigos e Guias, Blog, Eventos), apresenta destaques e leituras recentes, traz FAQ e — unicamente entre as páginas de conteúdo — um **formulário de atendimento com protocolo**.

Medido: Explorar é a terceira página mais referenciada do site (14 páginas apontam para ela), atrás só de `inicio.html` (34) e `comunidade/comunidade.html` (22).

Explorar também funciona como **nó de passagem**: os três cards `featured-card` que ela contém não levam a conteúdos próprios, e sim a `recursos.html`, `blog.html` e `eventos.html`. Ela não publica nenhum artigo — ela publica *a lista de lugares onde os artigos estão*.

---

## 2. Mapa das páginas

### 2.1 Inventário

**Páginas de conteúdo**

| Arquivo | Tamanho | `<title>` | Seções | Na busca |
|---|---|---|---|---|
| `inicio.html` | 55,2 KB | Comunidade neuroinclusiva | 9 | sim |
| `index.html` | 33,6 KB | Um espaço para se encontrar | 11 | sim |
| `Explorar/Explorar.html` | 46,7 KB | Explorar | 9 | sim |
| `Recursos/recursos.html` | 33,3 KB | Artigos e Guias | 7 | sim |
| `blog/blog.html` | 27,4 KB | Blog | 3 | sim |
| `blog/post-masking.html` | 21,4 KB | artigo individual | 3 | sim |
| `Recursos/eventos.html` | 13,6 KB | Eventos | 3 | sim |
| `Direitos/direitos.html` | 35,2 KB | Seus Direitos | 9 | sim |
| `Direitos/arquivo3leis/arquivo.html` | 26,5 KB | Estrutura Jurídica | — | sim |
| `Recursos/autismo/autismo.html` | 65,5 KB | Espectro Autista | — | sim |
| `Recursos/autismo/Tdah.html` | 61,1 KB | Espectro Autista | — | sim |
| `Recursos/autismo/dislexia.html` | 61,1 KB | Espectro Autista | — | sim |
| `Recursos/autismo/altas-abilidades.html` | 61,1 KB | Espectro Autista | — | sim |
| `Recursos/autismo/saúde.html` | 61,1 KB | Espectro Autista | — | sim |
| `Recursos/autismo/talentos.html` | **0 KB** | (arquivo vazio) | — | não |

**Páginas de serviço**

| Arquivo | Tamanho | `<title>` | Seções |
|---|---|---|---|
| `apoiar/apoiar.html` | 36,9 KB | Doações | 5 |
| `loja/loja.html` | 27,6 KB | Loja | 2 |
| `chat-Ia/chat-Ia.html` | 9,0 KB | Conversar com a Lia | 0 |
| `login/login.html` | 14,7 KB | Login | 2 |
| `privacidade.html` | 13,3 KB | Política de Privacidade | — |
| `termos.html` | 9,8 KB | Termos de Uso | — |

**Páginas sociais e de conta**

| Arquivo | Tamanho | Conteúdo |
|---|---|---|
| `comunidade/comunidade.html` | 27,0 KB | 4 abas (Fórum, Grupos, Eventos, Conversa) |
| `comunidade/conversas.html` | 11,2 KB | lista de conversas |
| `comunidade/perfil.html` | 16,0 KB | perfil |
| `comunidade/post.html` | 9,2 KB | publicação individual |
| `comunidade/explorar-grupos.html` | 12,8 KB | explorar grupos |
| `comunidade/meus-grupos.html` | 11,2 KB | meus grupos |
| `comunidade/chat.html` | 7,8 KB | conversa |
| `comunidade/grupo.html` | 5,9 KB | grupo |
| `comunidade/detalhes-canal.html` | 6,4 KB | detalhes de canal |
| `comunidade/perfil-amigo.html` | 1,1 KB | perfil de amigo |
| `configurações/configurações.html` | 34,9 KB | 9 abas de conta |
| `configurações/{PainelSac,eventos,gerenciarloja,grupos,moderação}/*.html` | 6–36 KB | 5 painéis administrativos |
| `panel-admin/painel.html` | 10,2 KB | índice dos painéis |
| `login/redefinir-senha.html` | 8,0 KB | redefinir senha |

**Outras**: `hacker-trap.html` (11,7 KB) — página de brincadeira, title *"😅 Ops! Algo deu errado..."*, texto *"VOCÊ CAIU NA ARMADILHA!"*. Não está no índice de busca nem é apontada por nenhuma página.

### 2.2 Grafo de navegação

```
                    index.html  (landing — órfã: nenhum link interno aponta pra ela)
                         │
  ┌──────────────────────┼───────────────────────────────────────┐
  │                      │                                       │
inicio.html ────► Explorar/Explorar.html ──┬──► Recursos/recursos.html ──► Recursos/autismo/*.html (5)
  │                     │                 ├──► blog/blog.html ─────────► blog/post-masking.html
  │                     │                 └──► Recursos/eventos.html
  │                     │
  │                     └──► FORMULÁRIO DE ATENDIMENTO (só existe aqui)
  │                               └── Supabase RPC + realtime
  │
  ├──► comunidade/comunidade.html ──► conversas, perfil, post, grupos, explorar-grupos, meus-grupos
  ├──► Direitos/direitos.html ──► Direitos/arquivo3leis/arquivo.html
  ├──► apoiar/apoiar.html        (sem página seguinte — termina em "Doar agora")
  ├──► loja/loja.html             (produtos externos: AliExpress, Shopee, Mercado Livre, Amazon)
  ├──► chat-Ia/chat-Ia.html       (AcolherIA em página cheia)
  └──► configurações/configurações.html
            └──► (não se liga aos painéis administrativos; só painel-admin/painel.html liga)
```

### 2.3 Referências recebidas (top 10)

| Página | Quantas páginas apontam para ela |
|---|---|
| `inicio.html` | 34 |
| `comunidade/comunidade.html` | 22 |
| `chat-Ia/chat-Ia.html` | 18 |
| `Direitos/direitos.html` | 18 |
| `blog/blog.html` | 17 |
| `login/login.html` | 17 |
| `privacidade.html` / `termos.html` | 17 cada |
| `configurações/configurações.html` | 15 |
| `Explorar/Explorar.html` | 14 |
| `loja/loja.html` | 14 |

O alto número vem do footer repetido: cada página que o contém gera 1 link para cada uma dessas páginas.

### 2.4 Páginas órfãs

Nenhuma página do site aponta para elas (verificação por busca de `href` em todos os HTML):

`Recursos/autismo/talentos.html` (vazio) · `comunidade/chat.html` · `comunidade/detalhes-canal.html` · `comunidade/grupo.html` · `comunidade/perfil-amigo.html` · `comunidade/post.html` · `hacker-trap.html` · `index.html` · `login/redefinir-senha.html`

**Sobre `index.html`:** ela é órfã do ponto de vista de link interno, mas é a página que a Netlify/Vercel serve como raiz do domínio. Ela é a landing page de entrada do site, e por isso está no índice de busca com o título *"Amor Neurodivergente — Um espaço para se encontrar"*. Não está órfã funcionalmente, só por link interno.

**Sobre as páginas de comunidade:** `comunidade.js` recebe parâmetros e navega por URL em tempo de execução, o que a busca estática de `href` não capta. Não é possível afirmar, só pelo HTML, se essas páginas são alcançáveis em uso real.


---

## 3. Análise página por página

### Início (`inicio.html`)

**Função atual:**
 aggregating page of the logged-in experience. Concentrates in one screen the site's areas, recent content, and the entry to community and AcolherIA. It is the destination of 34 internal links — the most-referenced page.

**Objetivo para o usuário:**
 Give someone who has already entered the site a single screen from which to leave toward any other area, plus a quick view of what is new. The section order encodes this: mission first, then "what you find here", then content highlights, then the other areas at the end.

**Conteúdo:**
 9 `<section>`, in this order (line numbers):
 - `L147` **hero carousel** — `.carousel-wrapper`, 6 slides, **not a `<section>`**, and not inside any section; it is a direct child of `<main>`
 - `L265` `mission-section` — "NINGUÉM PRECISA SE SENTIR SOZINHO." + 2 paragraphs + 1 photo (the only section with the `foto-forma` treatment)
 - `L294` `ct-section` — "O que você encontra por aqui" — carousel of editorial cards (48 `card` occurrences)
 - `L507` `explore-highlights` — "Publicações em Destaque" — the 6-card carousel
 - `L593` `explore-latest` — "Leituras recentes da comunidade"
 - `L669` `blog-highlights-section` — "Artigos & Leituras Recomendadas"
 - `L731` `rights-quick-section` — "Saber seus direitos não precisa ser complicado" (text only, no cards)
 - `L758` `releases` — 4 "book cards" (Blog, Direitos, Comunidade, Artigos), no `<h2>`
 - `L799` `whoweare-section` — "Um espaço feito por pessoas neurodivergentes" + 1 photo
 - `L861` — a `<section class="community-card">` **is present only inside an HTML comment**, with a note saying it can be restored; its CSS still exists in `inicio.css`
 - `L880` `acolheria-banner-section banner--inicio` — Lia Chibi banner

**Estrutura atual:**
 `<main>` (L124) → hero carousel → 9 sections → `<footer>` (L934) → `</main>` (L944).
 Modal AcolherIA and sidebar come before `<main>`. The commented-out `community-card` does not affect the section count once comments are stripped (9 open / 9 close).

**Interações:**
 - Hero carousel: previous/next, autoplay with progress bar, pause button (`#pauseBtn`), drag/swipe, keyboard support
 - `.ct-carousel`: previous/next
 - `explore-highlights`: 6-card horizontal carousel with pagination (see 3.3)
 - Sidebar, floating hub, search, AcolherIA modal

**Navegação:**
 Sidebar + footer + the 4 "releases" cards + the `rights-quick-section` (which has no cards but links out) + the AcolherIA banner. Breadcrumb shows only "Início". Header has "Entrar" and "Criar Conta".

**Elementos visuais:**
 30 `<img>` (24 external, 6 local), of which 6 are repeated Unsplash photos also used in Explorar. CSS loaded: `inicio.css` (4143 lines) **plus `Explorar/Explorar.css` (2668 lines) loaded after it** — the classes `.hl-*` and `.latest-*` used by the two shared sections are styled by Explorar's CSS, not Início's.

**Funcionamento técnico relevante:**
 `inicio.js` (822 lines) has 11 sections, of which 7 are duplicated infrastructure (profile sync, sidebar, collapsible profile, accessibility, floating hub, header scroll, logout) and only 1 is unique (the 3D carousel). Supabase is **not** loaded on this page; `auth-global.js` is.

**Relação com outras páginas:**
 Reuses the `explore-highlights` and `explore-latest` blocks, which are near-duplicates of Explorar's (see 4.2). The `releases` cards point to `blog/`, `direitos/`, `comunidade/` and `Recursos/recursos.html` with **relative** hrefs (`blog/blog.html`), whereas the sidebar in the same file uses absolute. `post-masking.html` is linked 4× from here.

**Observações importantes para uma futura análise de layout:**
 - This page presents content originating in other areas (the two shared blocks, the 4 releases cards, the 9 cards of `blog-highlights-section`).
 - The hero is the only page-level element that is not a `<section>`.
 - A section exists in CSS and is commented out in HTML; whether it should come back is not decidable from the code.
 - Two different CSS files with different `.container` max-widths (1100px and 1000px) apply to the same page, and which one wins depends on declaration order inside `inicio.css`, not on file order.

---

### Explorar (`Explorar/Explorar.html`)

**Função atual:**
 Editorial hub and the only place in the site with an **assistance request flow** (form → waiting → live chat). It gathers the three content areas without publishing any of them itself.

**Objetivo para o usuário:**
 Let someone who arrived from the sidebar see what is being published, jump to any of the three areas, resolve a doubt from the FAQ, and — if the doubt is not resolved — open a ticket and get a protocol.

**Conteúdo:**
 9 `<section>`, in this order:
 - `L116` `explore-banner` — photo full-width + `<h1>` "Identifique e aprimore suas habilidades" + subtitle
 - `L137` **`nav.explore-nav`** — 6 chips fixed at the bottom of the screen: Destaques, Recentes, Artigos, Blog, Eventos, FAQ
 - `L178` `explore-intro` — "Clique em um dos tópicos abaixo para ir direto ao conteúdo:"
 - `L193` `explore-topics` — 3 `topic-card` (Talentos neurodivergentes / Avaliações de interesse e habilidade / Aprimore suas habilidades)
 - `L253` `explore-highlights` — "Publicações em Destaque" — carousel of 6 `hl-card` + 7-button pagination
 - `L336` `explore-latest` — "Leituras recentes da comunidade" — 1 `latest-feature` + list of `latest-item`
 - `L403` `explore-featured explore-section` — "Artigos e Guias" — 1 `featured-card` → `/Recursos/recursos.html`
 - `L445` `… explore-section-reverse` — "Blog" → `/blog/blog.html`
 - `L488` `… explore-section-reverse` — "Eventos" → `/Recursos/eventos.html`
 - `L529` `faq-section` — 7 `<details class="faq-item">` with `data-keywords` + search field `#faqSearchInput`
 - `L592` **`div.form-card`** — the assistance flow, **outside any `<section>`** (a direct child of `<main>`)

**Estrutura atual:**
 `<main>` (L96) → `<header class="header-glass">` (L99, breadcrumb "Início > Explorar") → the 9 sections → `div.form-card` → `<footer>` (L774) → `</main>` (L811).
 **The `<footer>` is inside `<main>`** on this page, unlike Início (where it is also inside) and unlike `index.html`.
 Two `</body>` tags at L861 and L870. Five `<script>` tags are loaded twice each (`pular-conteudo.js`, `busca-indice.js`, `busca.js`, `userway.js`, `vlibras.js`) — 16 script tags for 11 distinct files.

**Interações:**
 - **The 6 fixed chips have no JavaScript.** `Explorar.js` contains zero occurrences of `explore-nav` or `explore-nav__chip`. They work as in-page anchors (`#destaques`, `#ultimas`, `#artigos`, `#blog`, `#eventos`, `#faq`), and `is-active` is only on the first one and never changes. There is no scroll-spy.
 - `explore-highlights` carousel: arrows scroll by one card, pagination buttons scroll per page.
 - FAQ: native `<details>`; search filters by `data-keywords`.
 - Assistance flow: 3 states switched by `hidden`, character counter with thresholds (3200 / 3800), protocol copy button, "check now" button.

**Navegação:**
 The 3 `featured-card` link only to the areas' index pages (verified: the only `href` inside each of those 3 sections is the target area). The 6 `hl-card` link to `/blog/post-masking.html` (1st) and `/blog/blog.html` (the other 5). The chips are anchors. Breadcrumb has 2 levels. Header has no action buttons (no "Entrar" here — the login is in the sidebar).

**Elementos visuais:**
 22 `<img>`, 14 external. The `espaco-banner` placeholder at L~180 points to `A ESTANTE DAS POSSIBILIDADES.jpg` as `data-fundo`. The `form-card` uses `Ilustração Fale Conosco.png` as a real `<img>` (not a placeholder). CSS: `Explorar/Explorar.css` (2668 lines, 472 balanced braces) + `inicio.css` loaded before it.

**Funcionamento técnico relevante:**
 The only page with the **assistance RPCs**: `criar_atendimento`, `consultar_atendimento`, `responder_atendimento`, plus a Supabase realtime channel on table `atendimentos`. State is persisted in `localStorage` under `amn_atendimento_ativo`. Access to the chat is gated on `at.aprovado === true`, so a waiting user sees the protocol but not the chat. The waiting state uses a full-body Lia image (`img/lia/lia-corpo.png`, 412×1502) with the caption "Recebemos seu pedido." — decorative, `aria-hidden` + `alt=""`. Supabase JS is loaded here; `auth-global.js` too.

**Relação com outras páginas:**
 The `explore-topics` block is **identical** in `Recursos/recursos.html` (same 3 titles, same 3 hrefs, same markup). The `explore-highlights` and `explore-latest` blocks are near-duplicates of the ones in `inicio.html` (see 4.2). It is the only page that links to all three content areas *and* has its own form.

**Observações importantes para uma futura análise de layout:**
 - This page presents content originating in other areas: the 3 topic-cards, the 6 highlight cards, the 6 recent items, and the 3 featured cards are all about content published elsewhere; only the FAQ and the form are original to this page.
 - The form is not a `<section>`, so it is invisible to any count or selection based on sections.
 - Two parts of the fixed navigation have different implementations for the same intent: the chips do anchors, while the sidebar and footer do real navigation.
 - The 6 chips and the 3 topic-cards do different things with the same visual language (both are pills) and land on overlapping destinations.

---

### Artigos e Guias (`Recursos/recursos.html`)

**Função atual:**
 Index of long-form editorial content. Aggregates external articles, the site's own articles, and 5 in-depth reading pages.

**Objetivo para o usuário:**
 Someone looking for material to read, who wants to know whether it was written by the site or by someone else, and to be able to enter by theme.

**Conteúdo:**
 7 `<section>`:
 - banner "Artigos e Guias para entender sem esforço"
 - `#artigos-externos` "Artigos de fora" — 3 `externo-card`, with `externo-card__badge` and `externo-card__source`
 - `#artigos-equipe` "Da nossa equipe" — 3 `topic-card` + 1 `equipe-featured__title`
 - `explore-topics` — the same 3 `topic-card` as Explorar
 - `#categorias` "Explore por categoria" — 6 cards with badges (`--autismo`, `--tdah`, `--altas`, `--dislexia`, `--saude`, `--direitos`)
 - `#em-breve` "Novos temas chegando" — 4 `breve-card` (icon + badge, no images)
 - `recursos-newsletter`

**Estrutura atual:**
 7 sections, all `container`-less at the HTML level — each has its own `__container` (1200px). The 2 `espaco-banner` placeholders point to `AS DUAS MÃOS.jpg` and `DIVISÓRIAS DE CONHECIMENTO.jpg`.

**Interações:**
 `recursos.js` (396 lines) declares a category-chip filter and a hero search. **Neither exists in the HTML**: `.filter-chip` count is 0 and there is no search input. The chips it looks for (`.filter-chip`) and the sections it scrolls to (`.category-section`) are not present. Newsletter shows feedback on submit. The only working filter is the browser's own scroll.

**Navegação:**
 The 6 category cards link to the 5 `Recursos/autismo/*.html` pages. Breadcrumb "Início > Explorar > Artigos". The sidebar's "Explorar" item is marked active even though this is a different page.

**Elementos visuais:**
 18 `<img>`, 7 external. `recursos.css` (1222 lines) uses a palette that differs from the rest of the site (see 4.5).

**Funcionamento técnico:**
 Supabase JS is loaded but the file has no `.from()` or `.rpc()` calls. `auth-global.js` is loaded.

**Relação com outras páginas:**
 Receives 10 links. It is the target of Explorar's "Artigos e Guias" featured card and of `index.html`. Its `explore-topics` block is a copy of Explorar's.

**Observações importantes:**
 - Two of the JS features declared (category filter, hero search) have no corresponding HTML, so a reader cannot reach them.
 - The section titled "Explore por categoria" presents the 5 in-depth pages, not a category taxonomy.

---

### Blog (`blog/blog.html`)

**Função atual:**
 Filterable editorial list, mixing written articles and videos.

**Objetivo para o usuário:**
 Browse by theme, distinguishing what is text from what is video.

**Conteúdo:**
 3 `<section>`: `blog-banner`, `blog-grid-section`, `blog-newsletter`. The grid has 9 cards: 5 `editorial-card--article` and 4 `editorial-card--video`. The video variant adds a `<button>` with a play icon and a paragraph; the article variant does not.

**Estrutura atual:**
 3 sections, with `blog-grid-section__container` and `blog-nav__container` at 1200px.

**Interações:**
 The only fully implemented filter in the site: 8 chips with `data-filter` (`todos`, `autismo`, `tdah`, `comunicacao`, `terapia`, `direitos`, `saude-mental`, `familia`), and cards carry `data-category`. Clicking a chip toggles `active` and sets `card.hidden`. Cards exist with 8 distinct `data-category` values, so `reflexao` appears in cards but is not offered as a chip. Video cards open a lightbox modal. Pagination is declared as "placeholder visual".

**Navegação:**
 Cards link to `/blog/blog.html` and `/blog/post-masking.html`. `post-masking.html` is one of only 2 real article pages on the site and is linked from Início (4×), Explorar (3×) and Blog (2×).

**Elementos visuais:**
 13 `<img>`, 10 external, with 6 Unsplash photos also used on Início and Explorar. 1 `espaco-banner` placeholder → `A FOLHA ESCRITA.jpg`.

**Funcionamento técnico:**
 10 script tags. Supabase not loaded. `reading-state.js` tracks reading state.

**Relação com outras páginas:**
 Receives 17 links. It is the target of Explorar's "Blog" featured card.

**Observações importantes:**
 - The chip set does not cover the categories present in the cards (`reflexao`).
 - It presents content that also appears on Início and Explorar.

---

### Artigos de leitura longa (`Recursos/autismo/*.html` — 5 arquivos)

**Função atual:**
 Long-form reading pages with a sidebar table of contents and a reading-progress bar.

**Objetivo para o usuário:**
 Read a complete text on a single subject without navigation.

**Conteúdo — este é o achado mais significativo desta área:**
 The 5 files are **near-copies of each other**. Measured:
 - All 5 have the identical `<title>`: *"Compreendendo o Espectro Autista — Amor NeuroDivergente"*
 - All 5 have the identical `<meta description>`
 - All 5 have the identical `<h1>`: *"Compreendendo o Espectro Autista: muito além dos estereótipos"*
 - All 5 have the identical 5 `<h2>`: "O que é o autismo?", "Diagnóstico: nunca é tarde", "Stimming: mexer o corpo é saudável", "Vida adulta e autonomia", "Área de comentários"
 - The body text of the 5 files differs by only ~40 characters (4827 vs 5031/5073/5044/5051)
 - Only `autismo.html` has a differently-sized body (41143 vs ~35050 chars of stripped text) and "Área de comentários (0)" instead of "Área de comentários"

 The visible difference between the files is in the CSS, not the content: `autismo.html` has 1577 lines, the others 1417, and the diff is essentially the removal of section comments.

**Estrutura atual:**
 Each is self-contained: inline `<style>` of ~35 KB (`autismo.html`) with its own reset, progress bar, sidebar and TOC, plus `inicio.css`.

**Interações:**
 Reading progress bar, collapsible TOC, comment area.

**Navegação:**
 **Linked only from `Recursos/recursos.html`** (1 link each). Nothing else in the site points to them.

**Elementos visuais:**
 1 image each, plus a sidebar avatar.

**Funcionamento técnico:**
 No dedicated JS file — behaviour is inline.

**Relação com outras páginas:**
 Reached only through Artigos e Guias. Nothing links back out of them except the shared chrome.

**Observações importantes:**
 - 5 files named after 5 different subjects (autismo, TDAH, dislexia, altas habilidades, saúde) that carry the same title and the same headings. Whether the intent was 5 texts or 1 text reused is **not clear from the code**.
 - `Recursos/autismo/talentos.html` is a 0-byte file with no title and no content.

---

### Eventos (`Recursos/eventos.html`)

**Função atual:**
 Listing of events, workshops and support groups.

**Objetivo para o usuário:**
 Find something with a date and sign up or learn more.

**Conteúdo:**
 3 `<section>`: `page-hero`, `events-section`, `categories-section`.

**Estrutura atual:**
 3 sections, 6 images (4 external). `eventos.css` has 262 lines.

**Interações:**
 Almost none: `eventos.js` is 99 lines and covers only "navbar hides on scroll" and an accessibility block. **There is no filter, no search and no chip anywhere** (`filter` and `chip` appear 0 times in the HTML).

**Navegação:**
 Breadcrumb with only "Início". No outgoing links to other areas beyond the shared chrome.

**Elementos visuais:**
 Does not load `espacos-banner.css` nor `elementos-decorativos.css`, so it has neither the banner placeholders nor the decorative elements that the other content pages have.

**Funcionamento técnico:**
 Loads `sidebar.js` — the only page that does. No Supabase, no `auth-global.js`.

**Relação com outras páginas:**
 Target of Explorar's "Eventos" featured card. It is also reachable from `configurações/eventos/eventos.html` (an admin panel with the same name).

**Observações importantes:**
 - Has a `categories-section` but no filter mechanism.
 - Is the only content page without the shared "system" CSS (`busca.js` is loaded but `elementos-decorativos.css` and `espacos-banner.css` are not).

---

### Seus Direitos (`Direitos/direitos.html`)

**Função atual:**
 Legal information organized by area, plus a contact form for individual cases.

**Objetivo para o usuário:**
 Understand a right, find the law that establishes it, and — if the situation is personal — describe the case.

**Conteúdo:**
 9 `<section>`: `rights-banner rd-banner`, `rights-intro`, `categories-nav` (4 `category-tile`), `laws-section`, `sources-banner`, `editorial-grid`, `resources-section`, `rights-faq`, `rights-contact`.

**Estrutura atual:**
 The 12 laws are **not in the HTML** — they live in a `lawsDatabase` array inside `direitos.js` (438 lines) and are rendered into `#lawsGrid` at runtime. Distribution: `social` 4, `educacional` 3, `acessibilidade` 3, `saude` 2. The 4 category tiles are **icon-only** (`category-tile__icon` + title + count) — there is no image. `dereitos.css` (1692 lines) contains a `.category-tile__arte` rule (268px) that **no element in the HTML uses**.

**Interações:**
 4 `category-tile` with `data-filter` filter the array and re-render (they do not hide cards, and they get no `active` class, so the click gives no visual feedback). Search field `#lawsSearch` with 300ms debounce; searching resets the category filter. 4 law-card images come from a per-category Unsplash mapping (`getLawImage`).

**Navegação:**
 Category tiles link to `#leis`; laws link to `planalto.gov.br`. `Direitos/arquivo3leis/arquivo.html` is linked from here.

**Elementos visuais:**
 8 images, 3 external. 2 `espaco-banner` placeholders: one to `OS SEIS SÍMBOLOS DOS DIREITOS.jpg` (exists), one to a path with HTML-escaped quotes `A MARCA &quot;VALIDAR&quot;.jpg` — **that file does not exist on disk**; the file that exists is named with typographic quotes (`A MARCA “VALIDAR”.jpg`). 6 decorative elements. The page is the only one carrying the Lia Chibi (`lia-gif-chibi-alpha.gif`) as a brooch in the `rights-contact` banner.

**Funcionamento técnico:**
 Supabase not loaded. `direitos.js` has 12 numbered sections, 7 of which are duplicated infrastructure; the unique ones are the law database, the image mapping, the renderer, the filter, the search and the case form.

**Relação com outras páginas:**
 Receives 18 links. Reaches only `arquivo3leis/arquivo.html`.

**Observações importantes:**
 - Content is generated at runtime from JS, so it is absent from the static HTML, from `busca-indice.js` and from any static analysis.
 - The category tiles' count text ("3 leis", "2 leis", "5 leis", "3 leis") does not match the actual distribution in the database (`educacional` 3 ✓, `saude` 2 ✓, `social` 5 ✗ — the database has 4, `acessibilidade` 3 ✓).
 - CSS exists for an illustration on these cards that the HTML does not use.

---

### Apoiar (`apoiar/apoiar.html`)

**Função atual:**
 Donation page with impact statement, testimonials and a PIX payment step.

**Objetivo para o usuário:**
 Understand what a donation produces, then donate.

**Conteúdo:**
 5 `<section>`: `donation-hero`, `impact-section` ("O que sua doação proporciona"), `carousel-triple-section` (testimonials), `donation-form-section` ("Faça sua doação"), `transparency-section` ("Compromisso com a transparência").

**Estrutura atual:**
 5 sections. The donation area is a `<div id="donationForm">` (not a `<form>`) with 4 preset buttons (`data-value` 10/25/50/100, 25 pre-selected), a custom amount field and `#btnDonate`.

**Interações:**
 Presets and custom amount synchronize. Clicking "Doar agora" swaps the form for a `#checkoutBox` showing a **mock QR code** (`fa-qrcode` icon + the text "PIX — QR Code") and the chosen amount.

**Funcionamento técnico relevante:**
 **`doações.js` (837 lines) contains no `submit` handler, no `fetch`, no Supabase call and no payment provider.** The word "submit" appears 0 times. There is no Stripe, Mercado Pago, PayPal or PIX integration in the code — the only occurrence of `window.location` in the file is the logout redirect. **There is no real payment.** Whether this is an intentional placeholder or an unfinished integration is not stated in the code.

**Navegação:**
 No outgoing links to other content areas beyond the shared chrome. Reached from 12 pages (mostly via the footer).

**Elementos visuais:**
 10 images, 7 external. **This is the only page with inline CSS: 11.618 bytes inside a `<style>` block**, containing the hero gradient and hero layout that `doações.css` does not have.

**Funcionamento técnico:**
 Supabase JS is loaded but `doações.js` makes no database call. Also carries the full 11-action floating hub (see 4.1).

**Observações importantes:**
 - The page's terminal action is not connected to any payment system.
 - Its hero styles live in the HTML, not in `doações.css`, so any change to `doações.css` does not reach the hero.

---

### Loja (`loja/loja.html`)

**Função atual:**
 Affiliate product listing with filters, wishlist, flash sales and infinite scroll.

**Objetivo para o usuário:**
 Find a product by need, see where it is sold, and save it for later.

**Conteúdo:**
 2 `<section>`: `shop-filter-section` (search + 2 filter rows) and `banner-carousel-container` (5 banner slides + dots). Then, **outside any section**, `div.flash-sales` (4 `flash-card` with progress bars) and `div.products-grid`.

**Estrutura atual:**
 Products are **not in the HTML**: they are fetched with the RPC `get_products` and rendered into `#productsGrid`. A local fallback array exists in `loja.js` with hardcoded products and Unsplash images.

**Interações:**
 The most complex interaction set in the site: 2 independent filter rows (marketplace: AliExpress/Shopee/Mercado Livre/Amazon; category: Vestuário/Foco & TDAH/Sensorial/Livros/Áudio/Casa/Criativo/Outros) — both have their own `data-filter="todos"` button; search `#productSearch`; infinite scroll; wishlist via the RPCs `get_my_wishlists`/`toggle_wishlist`; banner carousel; realtime subscription.

**Navegação:**
 Filters are pills; cards link to external marketplaces. Breadcrumb shows only "Início".

**Elementos visuais:**
 6 images, **0 external** — the banners use local files (`/img/camisas100.png`) and the product images come from JS. Does not load `espacos-banner.css`, so it has no banner placeholders. `loja.css` (1430 lines) declares its own `--primary: #8b3dff`, different from the site's `#7c3aed` (see 4.5).

**Funcionamento técnico:**
 The only page besides comunidade that uses Supabase tables (`profiles`) and realtime. It also loads the 11-action floating hub.

**Observações importantes:**
 - The grid, the flash sales and the product counter are all outside any `<section>`.
 - Two filter rows use the same `data-filter="todos"` on different buttons; both rows are active at once, so "which category am I in" is not represented by a single state.

---

### Comunidade (`comunidade/comunidade.html` e 9 subpáginas)

**Função atual:**
 The social area. Single-page shell with 4 tabs, plus separate pages for the deeper screens.

**Objetivo para o usuário:**
 Publish, find people, join groups, and talk.

**Conteúdo:**
 4 `<section class="community-screen">`: `#screen-forum` (active), `#screen-grupos`, `#screen-eventos`, `#screen-conversa`.

**Estrutura atual:**
 4/4 balanced sections, 104/104 divs — the only page in the site with fully balanced markup apart from `index.html`, `login.html` and `comunidade.html`. No `<footer>`. No sidebar. No breadcrumb. Does not load `elementos-decorativos.css`, `espacos-banner.css` nor `busca.js`. Uses its own `theme.js`.

**Interações:**
 The heaviest database usage in the site: `comunidade.js` (213,9 KB) touches 17 tables (`posts`, `comments`, `likes`, `messages`, `groups`, `group_members`, `conversations`, `profiles`, `friendships`, `saved_posts`, `videos`, `events`, `avatars`, `reactions`, `group_invites`, `conversation_participants`, `event_participants`) and 22 RPCs.

**Funcionamento técnico relevante:**
 The 9 subpages are **mostly shells** — `grupo.html` (5,9 KB) and `detalhes-canal.html` (6,4 KB) have 0–1 buttons and no inputs; `perfil-amigo.html` is 1,1 KB. They are driven by `comunidade.js` at runtime via URL parameters.

**Relação com outras páginas:**
 Most-referenced content area (22 links). Internal navigation among the 9 subpages exists and is consistent. `comunidade/post.html` is a *different page* from `blog/post-masking.html` — they share the concept (a single post) and both load `inicio.css`, but have different CSS and different JS.

**Observações importantes:**
 - This is the only area whose pages do not share the site's header/sidebar/footer chrome.
 - It is the only area with `moderation-integration.js`, `honeypot.js` and `testes-referencias.js`.

---

### AcolherIA / Chat com a Lia (`chat-Ia/chat-Ia.html`)

**Função atual:**
 Full-page conversation interface with Lia, as opposed to the modal version available everywhere else.

**Objetivo para o usuário:**
 Talk to the assistant with more room than the 420px modal allows.

**Conteúdo:**
 0 `<section>`. 23 ids (`#ciaMensagens`, `#ciaFerramentas`, `#ciaSugestoes`, `#ciaRecursosLista`, `#ciaListaConversas`, …). Content of the site organized by subject is hardcoded in `chat-Ia.js`.

**Estrutura atual:**
 The smallest content page (9 KB) with almost all of its behaviour in JS.

**Funcionamento técnico relevante:**
 Two coexisting paths for the same assistant:
 - `Acolher-IA/conversa.js` (467 lines) and `Acolher-IA/Acolher-IA.js` (959 lines) call the Supabase Edge Function `acolheria` at `https://qyixzontuhrxrrjrmzvy.supabase.co/functions/v1/acolheria`
 - `server.js` exposes a local `POST /api/acolheria` that calls the Groq API directly, with its own system prompt including a crisis protocol (CVV 188, SAMU 192) and the marker `[[CRISE]]`
 `chat-Ia/chat-Ia.js` itself makes **no** call — it delegates to `conversa.js`.
 `Acolher-IA/seguranca.js` (607 lines) does crisis detection, normalization without accents, CVV/SAMU resource listing, 4-7-8 breathing and markup sanitization.

**Observações importantes:**
 - The edge function is the production path; the `server.js` path is a local alternative. Which one is intended for production is not clear from the code.
 - `chat-Ia/chat-Ia.html` does not load `Acolher-IA.js` (only `seguranca.js` and `conversa.js`), so the modal and the full page use different entry points.

---

### Configurações (`configurações/configurações.html`)

**Função atual:**
 Account settings, with 9 tabs.

**Objetivo para o usuário:**
 Manage account, profile, language, privacy, appearance, accessibility, notifications, AcolherIA and reading preferences.

**Conteúdo:**
 2 `<section class="profile-reading-section">` (2 `<h2>`). 9 `.tab-button`: Minha Conta, Perfil, Idioma, Privacidade e Segurança, Aparência, Acessibilidade, Notificações, AcolherIA, Leitura.

**Estrutura atual:**
 2 sections for 9 tabs. No `<header class="header-glass">`. Sidebar differs from the other pages: 5 main items and it links to `/explorar/explorar.html` (lowercase, non-existent path) and `/direitos/direitos.html`.

**Interações:**
 Tab switching, Supabase `profiles`/`avatars`/`account_deletion_log`, RPCs `delete_account_immediately`, `cancel_account_deletion`, `deactivate_account`. Contains the only `#acessibilidadePane` in the site.

**Funcionamento técnico:**
 Loads `inicio.js` (822 lines) — the carousel code of the home page — although this page has no carousel.

**Observações importantes:**
 - **This page does not link to any of the 5 administrative panels.** Those are reachable only from `painel-admin/painel.html`, which is itself pointed to by nothing in the site.

---

### Login (`login/login.html`)

**Função atual:**
 Authentication form.

**Objetivo para o usuário:**
 Enter or create an account.

**Conteúdo:**
 2 `<section>`: `form-section` and `illustration-section`. 4 forms. No sidebar, no footer, no breadcrumb.

**Funcionamento técnico:**
 Loads `landing.css` and `landing.js` (the landing page's files), plus `login.js`. Supabase JS loaded. No `auth-global.js`. Does not load `busca.js`, so **the search button is not available here**.

---

### Páginas administrativas (`painel-admin/painel.html` + 5 subpáginas)

**Função atual:**
 Admin panels: SAC (support), events management, store management, groups management, moderation.

**Objetivo para o usuário:**
 Internal operators.

**Estrutura atual:**
 `painel-admin/painel.html` is 10,2 KB with no inbound link. The 5 subpages are between 6,0 and 36,5 KB and are linked only from `painel-admin/painel.html` (and `moderação` also from `moderation-integration.js`).

**Observações importantes:**
 - `configurações/gerenciarloja/loja.html` (36,5 KB, title *"Painel da Loja · Admin"*) is a **different page** from `loja/loja.html` (28,2 KB), with a similar name and a similar purpose for a different audience.

---

### Landing (`index.html`)

**Função atual:**
 Public entry page explaining what the site is, before login.

**Objetivo para o usuário:**
 Decide whether to enter.

**Conteúdo:**
 11 `<section>`: `landing-hero`, `landing-believe`, `landing-stats-band`, `landing-areas`, `landing-cards` ("Três jeitos de usar o site"), `landing-split` ("Comece a explorar sem precisar se cadastrar"), `landing-steps`, `landing-stories`, `landing-features`, `landing-faq`, `landing-cta-section`. 9 images, all local. 4 `espaco-banner`/decorative hosts, the most of any page.

**Estrutura atual:**
 11 sections — the second most of any page. No sidebar; different footer (1.063 bytes, no columns); no `header-glass`. `body class="landing-page"`. Fully balanced markup (89/89 divs, 11/11 sections).

**Funcionamento técnico:**
 No Supabase, no `auth-global.js`. Loads `landing.css` (435 lines). Search available via `busca.js`.

**Observações importantes:**
 - It is the page that explains the areas, and it is not reachable by internal link.
 - It has 4 `espaco-banner` placeholders and 4 decorative hosts — a density of decoration higher than the pages it links to.

---

### Conteúdo institucional (`privacidade.html`, `termos.html`)

Static legal texts, 13,3 and 9,8 KB, with their own CSS (`privacidade.css`). Linked from the footer of 17 pages each. No sidebar, no shared chrome.

---

---

## 4. Páginas que repetem estrutura/layout

A repetição existe em cinco níveis diferentes, com graus diferentes de acoplamento.

---

### 4.1 Grupo A — O cromo compartilhado (o mais replicado do site)

**Páginas do grupo:** as 9 com sidebar + header + footer
`inicio.html` · `Explorar/Explorar.html` · `Recursos/recursos.html` · `blog/blog.html` · `Direitos/direitos.html` · `apoiar/apoiar.html` · `loja/loja.html` · `Recursos/eventos.html` · `configurações/configurações.html`

**O que elas compartilham:**

| Bloco | Onde | Estado |
|---|---|---|
| `aside.sidebar` | antes do `<main>` | **copiado arquivo a arquivo** — 8 links, variantes entre 1739 e 2448 bytes |
| `header.header-glass` | início do `<main>` | copiado; presente em 7 das 9 (ausente em `configurações.html` e `index.html`) |
| `nav.breadcrumb-nav` | dentro do header | presente em 7, com profundidades diferentes: 1 nível (Início), 2 (Início > Explorar), 3 (Início > Explorar > X) |
| `div.floating-hub` | depois do `<main>` | copiado em **duas variantes**: 1777 bytes (5 ações) em 5 páginas, 4435 bytes (11 ações) em 3 páginas |
| `<footer>` | fim do `<main>` | copiado em **4 variantes**, de 1191 a 1734 bytes |
| `div.modal-acolheria` | antes do `<main>` | presente em 11 páginas |
| `<script>` do sistema | fim do body | `imagens.js`, `busca-indice.js`, `busca.js`, `pular-conteudo.js`, `userway.js`, `vlibras.js`, `movimento-reduzido.css`, `inicio.css` |

**O que difere:**
 - O item ativo da sidebar (classe `active` + `aria-current="page"`)
 - A forma dos `href` (relativos em `inicio.html`, absolutos em `apoiar.html`)
 - Se o bloco de e-mail do perfil começa `hidden` ou mostra `carregando@email.com`
 - Se o botão diz "Entrar" ou "Sair" (`data-logged`)
 - A profundidade do breadcrumb
 - Se há botões no header (só `inicio.html` tem "Entrar" e "Criar Conta")

**É repetição visual ou estrutural?**
 **Estrutural.** São blocos completos de HTML repetidos em 9 arquivos, com conteúdo idêntico em forma e pequenas diferenças textuais. Não há componente, nem template, nem geração: qualquer mudança precisa ser aplicada 9 vezes, e já é o caso de haver 3 versões diferentes do mesmo footer e 2 do mesmo hub.

**Função dentro do grupo:** idêntica em todas — navegação global. Não há variação de propósito entre elas.

---

### 4.2 Grupo B — Início e Explorar (repetição de conteúdo, não só de layout)

**Páginas:** `inicio.html` e `Explorar/Explorar.html`

**O que elas compartilham:**

| Bloco | Estado medido |
|---|---|
| `section.explore-latest` | **byte-a-byte idêntico** depois de normalizar espaços em branco (md5 `455f109` nos dois arquivos) |
| `section.explore-highlights` | mesmo conteúdo; a única diferença é que Explorar tem o bloco de paginação `#hlPagination` (7 botões) e Início não |
| `section.explore-topics` (3 `topic-card`) | idêntico em Início? Não — presente só em Explorar e `Recursos/recursos.html` (ver 4.3) |

**O que difere:** Início tem o hero carrossel (6 slides) que Explorar não tem; Explorar tem a nav de chips, o FAQ e o formulário de atendimento que Início não tem.

**É repetição visual ou estrutural?**
 **Os dois.** O HTML é o mesmo, e as classes CSS são as mesmas — mas quem estiliza essas classes em cada página é um arquivo diferente: em `inicio.html`, `.hl-*` e `.latest-*` são estilizadas por `Explorar/Explorar.css`, carregado **depois** de `inicio.css`; em `Explorar/Explorar.html` são estilizadas pelo mesmo `Explorar.css`. Ou seja, as duas páginas dependem do CSS da outra para parte do seu conteúdo.

**Função dentro do grupo:** a mesma seção cumpre funções diferentes. Em Explorar é o miolo da página ("Publicações em Destaque" é o 4º bloco de 9). Em Início é um dos 9 blocos, entre a Missão e as Leituras Recentes. O mesmo componente aparece em posições diferentes da hierarquia das páginas.

---

### 4.3 Grupo C — Explorar e Recursos (o bloco `explore-topics`)

**Páginas:** `Explorar/Explorar.html` e `Recursos/recursos.html`

**O que compartilham:** a `<section class="explore-topics">` com 3 `topic-card`. Medido: **títulos idênticos, `href` idênticos** (`#artigos`, `#ferramentas`, `#blog`), ícones idênticos (`fa-arrow-right`), mesmo markup.

**O que difere:**
 - Em Explorar está na posição 3 de 9, precedido pelo texto "Clique em um dos tópicos abaixo para ir direto ao conteúdo:"
 - Em Recursos está na posição 4 de 7, dentro de uma seção de conteúdo própria
 - Os `href` são **âncoras internas em ambas** (`#artigos`, `#ferramentas`, `#blog`). Em Explorar, `#artigos` e `#blog` existem (seções 4 e 5), mas **`#ferramentas` não existe em nenhuma das duas páginas** — não há seção, `id` ou elemento com esse nome no site.

**É repetição visual ou estrutural?**
 **Estrutural**, com uma diferença importante: o bloco é o mesmo, mas a função pretendida não é a mesma. Em Explorar ele deveria levar a três áreas; em Recursos ele está entre listas de artigos. Nos dois casos os `href` apontam para âncoras locais, e uma delas não existe.

---

### 4.4 Grupo D — As páginas de conteúdo editorial

**Páginas:** `Recursos/recursos.html` · `blog/blog.html` · `Recursos/eventos.html`

**O que compartilham:**
 - Mesma estrutura de cabeçalho: breadcrumb "Início > Explorar > [nome]"
 - Even sidebar com "Explorar" marcado como ativo, embora não seja a página atual
 - Mesmos 3 `<script>` de sistema
 - Mesmo padrão: banner → lista de cards → newsletter

**O que difere — e é a parte importante:**

| | Recursos | Blog | Eventos |
|---|---|---|---|
| Seções | 7 | 3 | 3 |
| Filtro | declarado no JS, **ausente no HTML** | 8 chips, **funciona** | **nenhum** |
| Container | `recursos-section__container` 1200px | `blog-grid-section__container` 1200px | sem container próprio |
| CSS próprio | 1222 linhas | 1116 linhas | 262 linhas |
| Newsletter | sim | sim | não |
| Conteúdo dinâmico | não | não | não |
| `espaco-banner.css` | sim | sim | **não** |
| `elementos-decorativos.css` | sim | sim | **não** |
| `auth-global.js` | sim | não | não |
| Supabase | carregado, não usado | não | não |
| CSS inline | não | não | não |

**É repetição visual ou estrutural?**
 **Só visual.** As três têm a mesma *silhueta* (banner, lista, fechamento), mas a estrutura interna, a paleta, o número de seções e a quantidade de CSS são completamente diferentes. Eventos tem 262 linhas de CSS para 3 seções; Blog tem 1116 para 3 seções. Os três arquivos de filtro são implementações distintas e duas delas não funcionam.

**Função dentro do grupo:**
 - **Recursos** serve para encontrar e filtrar leitura (mas o filtro não funciona)
 - **Blog** serve para navegar por tema, distinguindo vídeo de texto
 - **Eventos** serve para saber o que vai acontecer e quando — e é a única do grupo sem nenhum mecanismo de filtragem ou busca

---

### 4.5 Grupo E — Repetição de tokens de CSS (identidade replicada, não unificada)

Não é um grupo de páginas, mas um achado transversal que afeta todas.

Cada arquivo de CSS declara seu próprio bloco `:root`. Medido:

| Arquivo | Variáveis | Cores |
|---|---|---|
| `inicio.css` | 37 | 27 |
| `apoiar/doações.css` | 35 | 27 |
| `loja/loja.css` | 30 | 22 |
| `comunidade/comunidade.css` | 30 | 26 |
| `landing.css` | 15 | 14 |
| `recursos.css` | 14 | 13 |
| `blog.css` | 14 | 13 |
| `direitos.css` | 23 | 18 |
| `login.css` | 13 | 12 |
| `Explorar.css` | 11 | 10 |
| `eventos.css` | 21 | 14 |
| `configurações.css` | 11 | 10 |

**Valores repetidos literalmente em 5 ou mais arquivos:** `#ffffff` (11×), `#7c3aed` (6×), `#1a1a2e` (6×), `#5c5652` (6×), `#8a827c` (6×), `#e8e3dd` (6×), `#ede9fe` (5×), `#faf9fe` (5×), `#0ea5e9` (4×).

**Nomes iguais com valores diferentes — a identidade diverge por arquivo:**

| Variável | Valores por arquivo |
|---|---|
| `--primary` | `#7c3aed` (inicio, direitos, doações, comunidade) **vs** `#8b3dff` (loja) |
| `--radius-lg` | `20px` (inicio, direitos, doações) **vs** `16px` (loja) |
| `--radius-xl` | `28px` (inicio, doações) **vs** `24px` (direitos) **vs** `20px` (loja) |
| `--shadow-lg` | 4 valores distintos entre inicio, direitos, doações e loja |
| `--text-dark` | `#1a1a2e` (inicio, direitos, doações) **vs** `#1e293b` (recursos) |
| `--text-muted` | `#8a827c` (inicio, direitos, doações) **vs** `#64748b` (recursos) |
| `--transition` | `0.2s ease` / `0.25s cubic-bezier(...)` / `0.25s cubic-bezier(...)` / `all 0.25s ease` |

**Duas famílias de paleta coexistem:**
 - **Roxo/rosa** (`#7c3aed`, `#db2777`, `#a855f7`) — inicio, Explorar, comunidade, apoiar, direitos
 - **Auburn/creme** (`#a8836a`, `#eba66d`, `#f5f0eb`) — recursos, blog, eventos
 - `blog.css` tem **as duas** ao mesmo tempo: `--blog-accent: #7c3aed` e `--primary-purple-dark: #5a3d96` com `#a8836a` presente.

**E o `.container` tem larguras diferentes dentro do mesmo arquivo:**
 - `inicio.css`: `max-width: 1100px` (L1163), `1100px` (L1294), `1000px` (L1416)
 - `Explorar.css`: `1200px` (L315), `1200px` (L478), `1100px` (L728), `1100px` (L801)

 Qual vale depende da ordem de declaração dentro do próprio arquivo, não da ordem de carregamento.

---

## 5. Diferenças entre páginas semelhantes

Esta seção existe porque "página parecida" e "página igual" são coisas diferentes aqui.

### 5.1 Mesma silhueta, funções muito diferentes

| Par | O que parece igual | O que é de fato diferente |
|---|---|---|
| `loja/loja.html` × `configurações/gerenciarloja/loja.html` | Nome quase idêntico, ambos com "loja" | A primeira mostra produtos de marketplace ao público; a segunda é um painel admin (title: *"Painel da Loja · Admin"*), 8 KB maior, e não é ligada por nenhuma página |
| `Recursos/eventos.html` × `configurações/eventos/eventos.html` | Mesmo nome, mesma pasta visível | A primeira é a listagem pública de eventos; a segunda é o painel de gestão de eventos, só acessível pelo painel admin |
| `blog/post-masking.html` × `comunidade/post.html` | Ambas são "uma publicação" | A primeira é artigo editorial estático, com `post-masking.css` e 21,8 KB; a segunda é post de usuário, com `post.css`, 9,2 KB, e Supabase |
| `comunidade/grupo.html` × `configurações/grupos/grupo.html` | Mesmo nome | Uma exibe um grupo, a outra administra grupos |
| `Explorar.html` (form) × `apoiar.html` (doação) | Ambos têm um formulário com estados | O de Explorar grava em banco via RPC, tem protocolo e realtime; o de Apoiar não tem handler nenhum e mostra um QR fictício |

### 5.2 Mesma função, implementações diferentes

Quatro telas de filtro, quatro códigos diferentes, duas quebradas:

| Página | Seletor | Tipo | Estado |
|---|---|---|---|
| Blog | `.blog-nav__chip[data-filter]` | esconde cards com `hidden` | funciona |
| Loja | `.pill-btn[data-filter]` (2 linhas) | filtra array renderizado | funciona |
| Direitos | `.category-tile[data-filter]` | re-renderiza a lista | funciona, **sem feedback visual** |
| Recursos | `.filter-chip` | scroll até seção | **não funciona** — o elemento não existe no HTML |
| Eventos | — | — | **não existe** |
| Explorar | `.explore-nav__chip` | âncoras | funciona como âncora; **sem JS, sem scroll-spy, `is-active` nunca muda** |

### 5.3 O mesmo objeto aparece com nomes diferentes

| Objeto | Nomes usados no código |
|---|---|
| Menu principal | `sidebar-nav`, `explore-nav`, `blog-nav`, `recursos-nav`, `rights-nav`, `breadcrumb-nav`, `floating-hub` |
| Card de conteúdo | `hl-card`, `latest-item`, `featured-card`, `editorial-card`, `externo-card`, `topic-card`, `breve-card`, `book-card`, `category-tile`, `product-card`, `ct-card`, `flash-card`, `carousel-triple-card`, `law-editorial-card`, `law-card` |
| Contêiner de largura | `.container` (com 3 larguras), `__container` por seção (1200px), `.container` de 1000px |
| Estado ativo de filtro | `.active` (blog, loja), `.is-active` (recursos, chips do Explorar) |

**15 nomes de classe diferentes para o que a pessoa vê como "um card com imagem e texto".**

### 5.4 Diferenças de montagem entre Explorar e Início

Mesmo template (`<main>` → header → seções → footer), mas:
 - Explorar tem o footer **dentro** do `<main>`; Início também — mas `index.html` não tem header nem footer no mesmo lugar
 - Explorar tem 2 `</body>` e 5 scripts duplicados; Início tem 1 de cada
 - Início tem o hero fora de qualquer `<section>`; Explorar não tem hero, mas tem o formulário fora de qualquer `<section>`
 - Início tem a sidebar com 2448 bytes (mais itens); Explorar tem 1752

---

## 6. Relação entre as áreas do site

### 6.1 Como as áreas se classificam por função

Classificação feita a partir do conteúdo e do funcionamento medidos, não da aparência:

| Área | Função | Evidência no código |
|---|---|---|
| **Explorar** | agregar e encaminhar | seus 3 cards `featured` só contêm links para outras áreas; o formulário é o único elemento com função própria |
| **Recursos (Artigos e Guias)** | porta de entrada para texto longo | 6 cards que apontam para 5 páginas de leitura |
| **Recursos/autismo/*** | leitura contínua | 5 arquivos de artigo completo, com sumário e barra de progresso |
| **Blog** | navegar por tema | 8 chips que filtram cards já existentes |
| **Eventos** | listar e datar | sem filtro; apenas lista |
| **Direitos** | informar e receber caso | banco de 12 leis + formulário de caso individual |
| **Comunidade** | interagir entre pessoas | 17 tabelas, 22 RPCs, 4 abas |
| **AcolherIA** | conversar | Edge Function, Realtime, protocolo de crise |
| **Loja** | listar produto externo | RPC `get_products` com fallback local; links para marketplaces |
| **Apoiar** | solicitar doação | sem integração de pagamento |
| **Configurações** | gerenciar conta | 9 abas; não leva aos painéis admin |
| **Painéis admin** | operação interna | inalcançáveis pela navegação normal |
| **Landing** | apresentar o site | 11 seções, nenhuma delas interativa além de FAQ e CTA |

### 6.2 As relações que existem de fato

- **Landing → Início**: a landing promete "Comece a explorar sem precisar se cadastrar" e tem CTA para `inicio.html`. Mas não há link de volta.
- **Início → tudo**: 34 links de saída. É o redistribuidor.
- **Explorar → 3 áreas de conteúdo**: 3 cards, 1 por área. Também → `post-masking.html`, e → a comunidade, a loja, a AcolherIA, o Apoiar e a Configurações pelo rodapé.
- **Recursos → os 5 artigos**: única porta de entrada para as páginas de leitura longa.
- **Blog → `post-masking.html`**: o único artigo real do site, mais acessado de Início (4×) e Explorar (3×) do que do próprio Blog (2×).
- **Comunidade → si mesma**: 10 páginas internas, o sistema mais fechado do site.
- **Configurações → nada**: não há link de Configurações para os 5 painéis admin.
- **Apoiar → fim**: termina em "Doar agora" sem destino.

### 6.3 Uma assimetria que vale registrar

`Recursos/recursos.html` **é** a única porta de entrada para 5 páginas de leitura longa (60 KB cada). `Explorar.html` **não** alcança nenhuma delas — seus cards vão para `recursos.html` e `blog.html`. Ou seja: as 5 páginas de leitura longa são inalcançáveis a partir do hub editorial, e alcançáveis apenas pela página que lista artigos externos e da equipe.

### 6.4 Dependências de dados entre as áreas

| Dependência | Onde |
|---|---|
| `profiles` | comunidade, loja, configurações, moderação |
| `auth-global.js` | só em Início, Explorar, Recursos |
| `inicio.css` | 9 páginas |
| `Explorar.css` | Início e Comunidade |
| `busca.js` | 12 páginas (não em Comunidade nem Login) |
| `elementos-decorativos.css` | 8 páginas (não em Comunidade, Login, Configurações) |
| `espacos-banner.css` | 7 páginas (não em Loja, Comunidade, Eventos, Login, Configurações) |
| `movimento-reduzido.css` | 12 páginas — todas |
| `Acolher-IA.js` | 11 páginas |

`Comunidade` carrega `Explorar.css` sem usar nenhuma das classes dele (verificado: 0 ocorrências de `explore-`, `hl-`, `latest-` no HTML de comunidade).

---

## 7. Pontos que precisam ser conhecidos antes de qualquer redesign

### 7.1 Dependências de ordem de carregamento

O `<link>` do CSS decide o que vence. Três casos medidos:

1. **`Direitos/direitos.html`**: `direitos.css` (L6) antes de `design-direitos.css` (L9). Um bloco novo em `direitos.css` **vence** um bloco novo em `design-direitos.css` se tiver a mesma especificidade.
2. **`inicio.html`**: `inicio.css` (L4) antes de `Explorar.css` (L8). As classes `.hl-*` e `.latest-*` usadas no HTML do Início são definidas no CSS do Explorar.
3. **Dentro do mesmo arquivo**: `inicio.css` declara `.container` três vezes com `1100px`, `1100px` e `1000px`. A que vale é a última, por ordem de declaração.

### 7.2 Especificidade como fator de projeto

Medido em `foto-forma.css`: um seletor de classe (`.foto-forma__foto`, 0,1,0) **perde** para `.mission-image img` (0,1,1) do `inicio.css`, mesmo carregado depois. A correção exigiu subir para `img.foto-forma__foto`. Qualquer camada nova que vá compete com um `<img>` dentro de uma classe de página vai esbarrar nisso.

### 7.3 Três bugs de HTML pré-existentes (medidos)

| Arquivo | Problema |
|---|---|
| `Explorar/Explorar.html` | **2× `</body>`** (L861 e L870); **5 `<script>` carregados 2× cada** (16 tags para 11 arquivos); **1 `</div>` a mais** que `<div>` de abertura |
| `Recursos/recursos.html` | 1 `</div>` a mais |
| `blog/blog.html`, `direitos.html`, `apoiar.html`, `loja.html`, `eventos.html`, `inicio.html`, `configurações.html` | 1 `</div>` a mais cada |

A contagem de `<section>` está balanceada em todas as páginas **quando comentários HTML são removidos antes da contagem** — `inicio.html` aparenta ter 11 `<section>` e 9 `</section>`, mas 2 deles estão dentro de comentários.

O `</div>` órfão não quebra a renderização (o navegador fecha o elemento na ordem do documento), mas significa que **qualquer seletor que dependa do fechamento correto do `</div>` pode estar afetado**.

### 7.4 Links que não resolvem

Verificados contra o disco:

| Link | Onde aparece | Existe |
|---|---|---|
| `/explorar/explorar.html` | footer de 9 páginas, sidebar de Configurações | **não** |
| `/direitos/direitos.html` | footer de 9 páginas, sidebar de Configurações | **não** |
| `/Quem somos/quem-somos.html` | footer de 9 páginas | **não** |
| `/contato/contato.html` | footer de 9 páginas | **não** |
| `/doacoes/doacoes.html` | sidebar de Apoiar e Loja, footer | **não** |
| `/doações/doações.html` | footer de Início | **não** |
| `/configuracoes.html` | Configurações | **não** |
| `/Quem somos/CONTATE-NOS/contate.html` | hub flutuante | **não** |
| `/img/avatar-padrao.png` | sidebar.js | **não** |
| `img/ilustracoes/A MARCA "VALIDAR".jpg` | `data-fundo` em Direitos | **não** (o nome real usa aspas tipográficas) |

Somados a isso, caminhos que só funcionam porque o Windows não diferencia maiúsculas de minúsculas — em Linux/Netlify quebram: `/Recursos/…`, `/Direitos/…`, `/Explorar/…`, `/configurações/…`.

### 7.5 Conteúdo que não existe no HTML

- **As 12 leis de Direitos** vivem em `direitos.js`. Não estão no HTML, não entram no índice de busca, e não aparecem em nenhuma análise estática do HTML.
- **Os produtos da Loja** vêm de `get_products` com fallback local.
- **Os posts e mensagens da Comunidade** vêm de 17 tabelas.
- **As 4 categorias de Direitos**: a arte esperada não existe no HTML — só ícone. O CSS tem `.category-tile__arte` (268px) que nenhum elemento usa.
- **`Recursos/autismo/talentos.html`** é um arquivo de 0 bytes.
- **Comentários** das páginas de leitura longa são declarados (`Área de comentários`) mas não há backend visível.

### 7.6 Fotografias repetidas

Medido no conjunto: **30 fotografias distintas** em 7 páginas de conteúdo. Destas, **14 aparecem em mais de uma página**:

| Foto | Ocorrências | Páginas |
|---|---|---|
| `photo-1544027993-37dbfe43562a` | 8× | Explorar, Blog, Início |
| `photo-1573497019940-1c28c88b4f3e` | 7× | Explorar, Apoiar, Blog, Início, Recursos |
| `photo-1499750310107-…` | 6× | Explorar, Blog, Início |
| `photo-1503454537195-…` | 5× | Explorar, Blog, Início |
| `photo-1499209974431-…` | 4× | Explorar, Blog, Início, Recursos |
| `photo-1434030216411-…` | 4× | Explorar, Direitos, Início, Recursos |

A mesma fotografia do Unsplash aparece como capa de destaque, como miniatura de "leitura recente" e como card de "artigos recomendados", em três páginas diferentes.

### 7.7 Elementos decorativos existentes

Sistema já implementado em `elementos-decorativos.css` + `espacos-banner.css`, gerado por `ferramentas/*.py`:

| Conceito | Estado |
|---|---|
| Hospedeiro (`deco-hospedeiro`) | Direitos 6 · Início 1 · Apoiar 3 · Explorar 2 · Recursos 1 · Blog 1 · Loja 1 · Landing 4 |
| Elementos | nuvem, coração, formas orgânicas |
| Marcador de espaço vazio (`espaco-banner` com `data-espaco`) | Landing 4 · Explorar 4 · Recursos 8 · Blog 4 · Direitos 8 · Apoiar 4 · Início 2 |
| Lia Chibi (`lia-chibi.css`) | Início e Direitos |
| Foto com forma orgânica (`foto-forma.css`) | apenas a Missão, em Início |

O `espaco-banner` é um **marcador de espaço reservado**, com um `data-fundo` apontando para uma ilustração. Comentários no código dizem que a arte deve entrar ali. Em 6 dos 8 marcadores o arquivo existe; em 2 não.

**Ilustrações em disco nunca referenciadas:** 23 dos 30 arquivos em `img/ilustracoes/` (incluindo `QUEM SOMOS.jpg`, `COMUNIDADE VAZIA.jpg`, `CORREDOR DAS QUATRO PORTAS.jpg`, `Nuvem principal.jpg`, `Pequenas formas orgânicas.jpg`, `coração.jpg`, `A CADEIRA VAZIA-hero.png`).

### 7.8 Dependências de runtime

- **Sem Supabase:** Início, Landing, Blog, Direitos, Eventos, Login.
- **Com Supabase JS mas sem uso:** Recursos, Apoiar.
- **Com `auth-global.js`:** só Início, Explorar, Recursos — sendo que as outras 6 páginas com sidebar também precisam de sessão e fazem isso por conta própria.
- **`sidebar.js`** é carregado só por `Recursos/eventos.html`, e a página não tem `sidebar-nav` (só `header-links`).
- **`configurações.html` carrega `inicio.js`** (o carrossel da home) sem ter carrossel.
- **`comunidade.html` carrega `Explorar.css`** sem usar nenhuma classe dele.

### 7.9 Autenticação

- `auth-global.js` (318 linhas) expõe `AuthGlobal` com `isLoggedIn`, `getUserData`, `isProtectedRoute`, `applyProtectedLinksState`, `guardCurrentRoute`, `applyHeaderAuthState`. Guarda sessão em `localStorage` (`userName`, `userEmail`, `userAvatar`, `userLoggedIn`).
- As páginas que não o carregam reimplementam a mesma lógica dentro do próprio JS (7 dos 8 arquivos JS têm uma seção "perfil").
- `login.html` e `redefinir-senha.html` são as únicas telas do fluxo; `redefinir-senha.html` não é alcançável por link.
- `painel-admin/painel.html` e os 5 painéis não têm indicação no código de como o acesso é restringido.

### 7.10 Coisas que não está claro no código

Registrado honestamente, sem dedução:

1. **Os 5 arquivos de `Recursos/autismo/`.** São 5 arquivos com o mesmo título, a mesma descrição e os mesmos 5 `<h2>`, divergindo em ~40 caracteres de texto. Não há comentário no código dizendo se é um texto com 5 clone, 5 textos planejados com conteúdo pendente, ou erro de cópia. `talentos.html` vazio sugere que a série foi interrompida, mas isso é inferência.
2. **O arquivo `A MARCA "VALIDAR".jpg`.** O `data-fundo` usa `&quot;` (aspas HTML) e o arquivo em disco usa aspas tipográficas. Não fica claro se o nome do arquivo foi alterado depois ou se o `data-fundo` nunca funcionou.
3. **A doação.** Não há integração de pagamento nem handler de submissão. Não há comentário dizendo se é maquete intencional ou integração abandonada.
4. **A Edge Function `acolheria`.** O código do frontend chama `https://qyixzontuhrxrrjrmzvy.supabase.co/functions/v1/acolheria`. O código dessa função **não está no repositório** (a pasta `supabase` não foi analisada nesta rodada). O `server.js` tem um caminho alternativo com prompt de sistema próprio — inclusive protocolo de crise — e não está claro qual é a fonte da verdade em produção.
5. **A navegação em `comunidade/*.html`.** Os 9 subpáginas são cascas com poucos elementos, preenchidos por `comunidade.js` em runtime. Não foi possível determinar, só pelo HTML, quais são alcançáveis.
6. **O propósito do `espaco-banner`.** Os comentários dizem que a arte deve entrar ali; 6 de 8 têm arte disponível e não foi usada. Não fica claro se o sistema está em uso ou abandonado.
7. **A seção `community-card` de `inicio.html`.** Está comentada no HTML, com uma nota dizendo que pode ser restaurada, e o CSS continua em `inicio.css`. Não há indicação de quando ou se.
8. **Os `.container` com larguras diferentes dentro do mesmo arquivo.** Não há comentário indicando se a diferença é intencional (ex.: seção mais estreita de propósito) ou resíduo.

---

## 8. Resumo executivo

### 8.1 O que o site oferece

Um portal de conteúdo e comunidade para pessoas neurodivergentes, construído como site estático (HTML + CSS + JS sem framework), com 14 áreas, um índice de busca de 31 páginas, backend Supabase para a parte social e comercial, e uma assistente virtual (AcolherIA) disponível como modal em 11 páginas ou como página inteira.

### 8.2 O que cada área faz

- **Landing** — apresenta o site a quem não entrou (11 seções, não acessível por link interno, é a raiz do domínio)
- **Início** — agrega e redistribui; 34 links de saída, o maior do site
- **Explorar** — hub editorial: reúne as 3 áreas de conteúdo, tem FAQ e é a **única** página com fluxo de atendimento (form → espera com protocolo → chat, com RPC e Realtime)
- **Artigos e Guias** — índice de textos; só ela dá acesso às 5 páginas de leitura longa
- **Leitura longa** — 5 arquivos que são cópias uns dos outros
- **Blog** — lista editorial com o único filtro que funciona por `hidden`
- **Eventos** — listagem sem nenhum filtro nem busca
- **Direitos** — 12 leis em JS + 4 categorias por ícone + formulário de caso
- **Comunidade** — 10 páginas, 17 tabelas, 22 RPCs; única área sem o cromo do site
- **AcolherIA** — Edge Function com detecção de crise
- **Loja** — produtos externos via RPC com fallback local, 2 filtros, infinite scroll
- **Apoiar** — impacto + depoimentos + PIX (sem integração)
- **Configurações** — 9 abas de conta; não alcança os painéis admin
- **Painéis admin** — 5 telas, inalcançáveis pela navegação normal

### 8.3 Páginas semelhantes e onde há repetição

| Tipo de repetição | Onde | Grau |
|---|---|---|
| Bloco de navegação (sidebar, header, footer, hub, modal) | 9–11 páginas, copiado arquivo a arquivo | **Estrutural** — 4 versões de footer, 2 de hub, 3 profundidades de breadcrumb |
| Seção de conteúdo (`explore-latest`, `explore-highlights`) | Início + Explorar | **Byte-a-byte** em um caso |
| Bloco `explore-topics` | Explorar + Recursos | **Idêntico**, mas com uma âncora quebrada (`#ferramentas`) |
| Silhueta editorial (banner → cards → newsletter) | Recursos, Blog, Eventos | **Só visual** — CSS de 262 a 1222 linhas, filtros diferentes, 2 dos 3 quebrados |
| Tokens de CSS (`:root`) | 12 arquivos | **Identidade replicada e divergente** — `--primary` tem 2 valores, 7 tokens têm 3+ valores |
| Nomenclatura | todo o site | 15 nomes de classe para o mesmo card |

### 8.4 Diferenças funcionais dentro de layouts parecidos

O caso mais ilustrativo: as 4 telas de filtro do site são 4 implementações diferentes, e **apenas 2 funcionam**. Duas páginas com nome parecido (`loja/loja.html` e `configurações/gerenciarloja/loja.html`) têm propósitos opostos. Duas páginas chamadas "post" (`blog/post-masking.html` e `comunidade/post.html`) são sistemas diferentes. `Recursos/eventos.html` e `configurações/eventos/eventos.html` são a mesma palavra para público e admin.

### 8.5 O que precisa ser preservado em qualquer layouts futuro

**Conteúdo**
- As 12 leis e seus 4 categorias (hoje em JS)
- Os 12 `href` dos 3 blocos de navegação global — e a decisão sobre as 10 URLs que não existem
- Os 3 estados do fluxo de atendimento e o protocolo
- As 9 abas de Configurações e os 5 painéis admin (mesmo inalcançáveis)
- A série de 5 artigos de leitura longa, e a decisão sobre o `talentos.html` vazio

**Identidade**
- A Lia (avatar, corpo inteiro, Chibi) em seus 3 formatos e 3 tamanhos
- O nome, o logo, a fonte Atkinson Hyperlegible (usada como opção de acessibilidade)

**Acessibilidade (existe e é transversal)**
- `movimento-reduzido.css` em 12 de 12 páginas
- `pular-conteudo.js` em 12 de 12
- `userway.js` e `vlibras.js` em 11 de 12
- Leitor de tela em elementos decorativos (`aria-hidden`, `alt=""`)
- O hub flutuante como caminho de ajuda

**Técnico**
- A ordem de carregamento de CSS (item 7.1) — mudar a ordem muda o resultado
- A especificidade em disputa com `.mission-image img` e com outras regras que atingem `<img>` (7.2)
- As arestas do `localStorage` (`amn_atendimento_ativo`, `userName`, `userEmail`, `userAvatar`)
- As RPCs e o canal Realtime do atendimento
- O `build.js` e as duas configurações de deploy divergentes (Netlify publica `dist`, Vercel publica a raiz)

### 8.6 Fatos que valem mais que qualquer opinião sobre o visual

1. **`dist/` está desatualizado** e não contém 5 arquivos de estilo que existem na raiz. Uma das duas configurações de deploy não serviria o site atual.
2. **10 URLs do menu global não existem.** O mesmo destino aparece escrito de 3 formas diferentes conforme a página.
3. **O `</div>` órfão em 10 páginas** e os 5 scripts duplicados + 2 `</body>` em Explorar.
4. **Recursos tem filtro e busca declarados no JS que não existem no HTML.**
5. **Os 5 artigos de leitura longa são cópias com o mesmo título.**
6. **Scripts carregados onde não servem:** `sidebar.js` só em Eventos, que não tem sidebar; `inicio.js` em Configurações, que não tem carrossel; `Explorar.css` em Comunidade, que não usa nenhuma classe dele.
7. **A doação não tem integração de pagamento.**
8. **Configurações não alcança os painéis admin, e o painel admin não é alcançado por nada.**
9. **14 fotografias se repetem em até 8 lugares; 23 das 30 ilustrações em disco não são usadas.**
10. **O mesmo componente (`explore-latest`) é estilizado, em Início, por um CSS de outra página.**

---

*Fim do documento. Todas as medições foram feitas por leitura do código em 06/10/2026; nenhum arquivo do site foi alterado para produzir este documento.*
