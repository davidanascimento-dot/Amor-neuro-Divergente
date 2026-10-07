# PROPOSTA VISUAL — PRIMEIRA DOBRA DE EXPLORAR

> Documento de proposta. **Nada foi implementado.** Nenhum HTML, CSS ou JS foi alterado.
> Companion de `DIRETRIZ-VISUAL-EXPLORAR.md` (diretriz) e `DOCUMENTACAO-SITE.md` (levantamento).
>
> Seções: **A** diagnóstico · **B** proposta · **C** justificativa · **D** preservação · **E** responsivo
>
> Medido em `Explorar/Explorar.html` + `Explorar/Explorar.css`, viewport 1000×700, em 06/10/2026.

---

# A. DIAGNÓSTICO DA PRIMEIRA DOBRA ATUAL

## A.1 Como ela funciona hoje

Geometria medida:

| Elemento | Posição | Tamanho | Estilo |
|---|---|---|---|
| `header.header-glass` | y 0 | 985 × 75 | breadcrumb + logo + lupa |
| `section.explore-banner` | y 0 | 985 × **520** | `min-height: 520px`, `border-radius: 0`, `overflow: hidden` |
| `__media img` | y 0 | 985 × 520 | `object-fit: cover`, `filter: brightness(0.75) saturate(0.9)` |
| `__overlay` | y 0 | 985 × 520 | `linear-gradient(180deg, rgba(15,10,30,.55) → .65 → .85)` |
| `__content` | y 52 | 624 × 416 | `text-align: center`, `max-width: 780px`, `padding: 80px 32px` |
| `__eyebrow` | y 132 | 131 × 33 | pílula roxa translúcida, uppercase 12px |
| `h1` | y 187 | — | `clamp(2rem, 5.5vw, 3.4rem)` = **54,4px**, `line-height: 1.1` = 59,84, `weight: 800` |
| `__title-accent` | dentro do h1 | — | `#38bdf8` + `'Playfair Display'` **itálico** |
| `__sub` | y 330 | 560 × 58 | 17px, `rgba(255,255,255,.85)` |
| `nav.explore-nav` | y 628 | 985 × 72 | **`position: fixed`**, 6 chips de 44px |

O fluxo é: o header tem 75px, e o banner **começa em y=0** — ou seja, o banner é Total sob o header, e o header fica sobre a foto escura. Depois, `.explore-intro` começa em y=520, **colado no banner, sem folga alguma**.

## A.2 O que pertence ao template repetido

A comparação entre as quatro páginas não foi por impressão — foi por medição de arquivo:

| Peça | Explorar | Artigos | Blog | Direitos |
|---|---|---|---|---|
| `__media` | ✓ | ✓ | ✓ | ✓ |
| `__overlay` | ✓ | ✓ | ✓ | ✓ |
| `__content` | ✓ | ✓ | ✓ | ✓ |
| `__eyebrow` | ✓ | ✓ | ✓ | ✓ |
| `__title` | ✓ | ✓ | ✓ | ✓ |
| `__title-accent` | ✓ | ✓ | ✓ | ✓ |
| `__sub` | ✓ | ✓ | ✓ | ✓ |
| `min-height` do banner | 520px | idem | idem | idem |
| **`color` do accent** | **`#38bdf8`** | **`#38bdf8`** | **`#38bdf8`** | **`#38bdf8`** |
| **`font-family` do accent** | **Playfair itálico** | **Playfair itálico** | **Playfair itálico** | **Playfair itálico** |
| **overlay** | `180deg, rgba(15,10,30,.55)…` | **idêntico** | **idêntico** | idem |
| `<br>` + `<span>` no h1 | ✓ | ✓ | ✓ | ✓ |

**Achado que não era visível a olho:** o accent não é "uma cor parecida" — é **o mesmo hex, a mesma fonte e o mesmo gradiente de véu nas quatro páginas**. O que se vê como "todas parecidas" é literalmente o mesmo código de estilo declarado quatro vezes com prefixo diferente.

E é o caso inverso também: Eventos **não usa nenhum** desses elementos — tem `.page-hero`. Ou seja, Eventos já é estruturalmente diferente; foi herança acidental de template, não decisão.

## A.3 O que está errado na primeira dobra como "experiência de descoberta"

Cinco problemas, em ordem de gravidade:

**1. A dobra não responde "onde estou".** O texto é "Identifique e aprimore suas habilidades" — é um **verbo de autoaperfeiçoamento**, não uma descrição de lugar. Quem entra não lê "aqui tem conteúdo sobre neurodiversidade"; lê "eu deveria melhorar". Explorar, pelo papel que o código mostra (encaminhar para 3 áreas), não é um lugar de autoaperfeiçoamento — é um lugar de descoberta. O texto promete o que a página não entrega.

**2. A foto não comunica nada doExplorar.** É `photo-1503676260728` — um caderno e uma maçã sobre uma pilha de livros. É a mesma foto de "pessoa lendo" que já aparece em `Explorar.css` na lista de fallback de imagem do Banco de Leis do Direitos. Uma pilha de livros é metáfora de "acervo", não de "caminhos". E com `brightness(0.75)` + véu de 0,55–0,85, ela está quase invisível: serve só como textura.

**3. Não há nada que sugira percurso.** A composição é uma pirâmide Perfectamente centralizada: eyebrow → h1 → sub, tudo no eixo vertical médio, com 624px de conteúdo perdido num campo de 985px. Isso é a **antítese de descoberta** — é simetria total, que comunica ordem e fechamento, não convite a olhar.

**4. Os 6 chips estão longe do conteúdo que nomeiam.** Eles são `position: fixed` no rodapé da tela, dentro de uma faixa de 72px que **flutua sobre o conteúdo**. Medido: em viewport 700px os chips ficam em y=628, e `.explore-intro` ocupa y=520–690 — **os chips cobrem o texto "Cada área foi pensada para você explorar no seu ritmo"**. Além disso, os chips dizem "Artigos / Blog / Eventos" e apontam para `#artigos`, `#blog`, `#eventos` — que **são as três seções do meio da própria página**, não as páginas. Quem lê "Eventos" e clica desce 600px, não sai da página.

**5. Não há espaço vazio de propósito.** O banner é 520px de foto + texto; depois, colado, vem o intro. Não existe um respiro. E os 2 `espaco-banner` reservados na página (um deles apontando para `A ESTANTE DAS POSSIBILIDADES.jpg`, que existe no disco e não é usado) estão **dentro** do banner e depois dele — escondidos.

## A.4 O que NÃO está errado

- O `h1` tem 54,4px com `line-height: 1.1` e `weight: 800` — a escala é boa e deve ser preservada ou ampliada.
- O `sub` tem largura máxima de 560px — medida de linha confortável, boa.
- Os 6 chips têm 44px de altura — alvo de toque correto, não deve diminuir.
- O `nav` tem `padding-bottom: max(12px, env(safe-area-inset-bottom))` — cuidado correto com notch de iPhone.

---

# B. PROPOSTA DE COMPOSIÇÃO

## B.1 A ideia em uma frase

> **Um mapa de partida, não uma vitrine.**

A dobra deixa de ser uma foto com texto em cima e passa a ser uma **instrução de navegação**: à esquerda, o título diz onde a pessoa está; à direita, os caminhos mostram para onde dá para ir. Os chips sobem da barra flutuante para dentro da composição e viram **o próprio conteúdo da metade direita** — assim cada chip faz as duas coisas ao mesmo tempo: é o caminho e é a navegação.

## B.2 A tela, aproximadamente

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ☰   Início › Explorar                    ♥ Amor NeuroDivergente     🔍  │ 75px  header (mantém)
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ✦                          COMO ESTA PÁGINA FUNCIONA                    │
│                          ──────────────────────                          │
│  DESCUBRA O QUE                                                         │
│  EXISTE AQUI ▏                                                            │
│                                                                          │
│  ──────────────                                                          │
│                                                                          │
│  Artigos, guias,                                                         │
│  eventos e história                                                     │
│  do site — sem pressa,                                                   │
│  sem ruído.                          ┌────────────────────────────────┐  │
│                                     │ ✦ Destaques    Recentes       │  │
│  ┌──────────┐                       │   Artigos      Blog            │  │ 580px
│  │ ◗ Lia    │                       │   Eventos     FAQ             │  │ (era 520)
│  │  Chibi   │                       │                                 │  │
│  └──────────┘                       │  → cada destino vira          │  │
│                                     │    um caminho, não um botão    │  │
│   ✧  ·                              └────────────────────────────────┘  │
│      ◆                                                                     │
│  ── ── ──        (aqui começa o espaço vazio intencional)                 │
├──────────────────────────────────────────────────────────────────────────┤
│  ⌇  Cada área foi pensada para você explorar no seu ritmo                │  intro
└──────────────────────────────────────────────────────────────────────────┘
```

**Proporção da dobra:** 580px de altura, contra 520px atuais. Os +60px vêm de **espaço vazio**, não de conteúdo.

## B.3 Onde fica cada coisa

### O título — à esquerda, com endereço

`h1` alinhado à esquerda, dentro de uma coluna de **~48% da largura** (≈460px em 985px).

- Linha 1: "Descubra o que" — `Inter 800`, 56px, `line-height: 1.04`
- Linha 2: "existe aqui" — **Playfair Display itálico, 62px**, na cor roxa do site (`#7c3aed`), não mais no azul `#38bdf8`

**Por que isso importa:** o accent azul Playfair é hoje a **assinatura idêntica das 4 páginas**. Trocá-lo de função (de "cor decorativa do accent" para "cor da marca") e de eixo (de "linha 2 de um h1 centralizado" para "bloco próprio do título") já é diferenciação por hierarquia, não por cor decorativa — que é o que a diretriz pede no item 6.

### O texto de apoio — logo abaixo, ainda à esquerda

`sub` com 17px, `max-width: 420px`, cor `#5c5652` (o `--explore-muted` que já existe). **Sem véu escuro, sem fundo.** Texto escuro sobre fundo claro — o que abre a possibilidade de tipografia muito mais limpa do que a atual (17px brancos sobre foto escura).

**Texto proposto:** *"Artigos, guias, eventos e histórias do site — sem pressa, sem ruído."* Mantém a frase original quase intacta ("organizados com calma. Sem pressa, sem ruído."), porque ela já descreve a função da página. Só deixa de prometer autoaperfeiçoamento.

### Os chips — à direita, dentro da composição

**Esta é a decisão central da proposta.** Os 6 chips saem de `position: fixed` e passam a ser **o conteúdo da coluna direita**, num bloco de ~340px de largura.

- Grid de 2 colunas × 3 linhas
- Cada chip vira um item de caminho: ícone + rótulo à esquerda, uma seta fina `→` à direita
- O chip `is-active` (Destaques) ganha um tratamento de estado — **sem JS novo**, apenas o que já existe
- Os 6 mantém-se exatamente os mesmos, com os mesmos `href`

**Consequência funcional que é a favor, não contra:** os chips deixam de flutuar sobre o conteúdo (resolve o problema medido em A.3.4) e passam a estar onde a pessoa está olhando quando lê o título. Passam a ser **o segundo conteúdo da dobra**, o que transforma uma barra de ferramental flutuante em elemento de orientação.

**O que isso custa:** os chips deixam de estar disponíveis durante a rolagem. Trade-off real — a proposta assume que a pessoa que está lendo o meio da página tem rolado, e que os chips interessam **na chegada**. Se preferir, dá para manter as duas camadas: chips dentro da dobra (compostos) e a barra flutuante só a partir do momento em que o hero sai de vista — isso é CSS puro com `position: sticky`, sem JS.

### Imagem — uma, e com função

**Uma ilustração**, não uma fotografia. A candidata que já existe no disco e hoje está escondida num `espaco-banner` sem uso: **`A ESTANTE DAS POSSIBILIDADES.jpg`** (80 KB, em `img/ilustracoes/`).

**Função dela:** a ilustração tem o tema "estante" — Object.keys() numa estante, "_proto_ e protótipos", e um personagem empurrando uma bola. É literalmente **"a estante das possibilidades"** — o vocabulário certo para uma página de descoberta, e não o vocabulário de "acervo" que a pilha de livros transmite hoje.

**Onde fica:** canto inferior direito, **atravessando a borda da dobra** — sangrando para dentro do espaço branco que vem abaixo. Isso elimina o retângulo e cria a sensação de que a página continua além da dobra.

**Como é tratada:**
- recorte orgânico (mesmo `border-radius` assimétrico já validado no `foto-forma.css`)
- uma folha de cor clara 12px deslocada atrás (o mesmo deslocamento validado no teste da Missão)
- **1 estrela de 4 pontas** a 30px do canto, em `#f2b705` — o amarelo do site
- nada mais

**Por que ilustração e não foto:** a diretriz pede referências como The Pudding e Are.na, onde o doméstico/ilustrado cria proximidade e o fotográfico cria distância editorial. Para uma página de descoberta, ilustração é a escolha certa — e é o que diferencia Explorar de Artigos e Guias, que vai ser editorial com fotografia.

### A Lia — Chibi, com função

`lia-gif-chibi-alpha.gif` (202 KB), já usada como broche em Início e Direitos via `lia-chibi.css`.

- Tamanho: ~110px
- Posição: canto inferior esquerdo, apoiada na linha do `sub`
- Estados: bottom-left, ao lado da estrela `✧` e do ponto `·`

**Função visual:** ela é o **marcador de "você está em Explorar"**. Quem abre Explorar vê a Lia; quem abre Artigos não vê. É a assinatura do lugar, não enfeite. E fica em posição quem a pessoa não associa a "botão".

**O que NÃO entra:** a Lia principal de corpo inteiro. Ela já tem uso definido e potente no estado de espera do atendimento (regra 14 do `GUIA-VISUAL.md`) e não deve competir com a primeira dobra.

### Elementos decorativos — 3, no máximo

| Elemento | Onde | Tamanho | Cor |
|---|---|---|---|
| `✦` estrela 4 pontas | acima do título, à esquerda | 12px | `#f2b705` |
| `✧` estrela menor | junto da Lia | 8px | `#c4b5e8` |
| `◆` losango | canto inferior esquerdo, abaixo da Lia | 6px | `#ddd6fe` |
| linha divisória | entre `✦` e o `h1` | 40px × 1px | `#e8e3dd` |

**O que entra no lugar dos 7 elementos do template:** saem o `eyebrow` em pílula, o `overlay` em degradê e o `__media` ocupando a dobra inteira. **Entram 3 elementos pequenos e uma linha.** Isso é a inversão exata do `Explorar` atual: onde havia 3 camadas derscoamento (foto + filtro de brilho + degradê de véu), passa a haver 3 marcas de pontuação.

### Espaço vazio — onde e quanto

**Três áreas deliberadamente vazias:**

1. **A faixa entre o título e a ilustração** — ~60px de coluna vazia, para que o olho respire depois do h1 de 62px
2. **O canto superior direito, acima dos chips** — ~90px vazios, que é onde o olhar descansa antes de descer
3. **A faixa de 60px abaixo do conteúdo, antes do intro** — separa a dobra do resto sem precisar de borda

**Nenhuma delas será preenchida.** É o que a diretriz pede no item 4 e no item 13.

### Hierarquia — a ordem de leitura

```
1.  "Descubra o que existe aqui"        ← 62px, é o que a pessoa lê primeiro
2.  a ilustração da estante              ← dá o "¿o que é isso?"
3.  os 6 caminhos                       ← responde "para onde eu vou?"
4.  o sub                               ← confirma o tom
5.  a Lia + 3 elementos                 ← assinatura do lugar
```

O inverso do atual, onde o `eyebrow` (12px) vem antes do `h1` e nada depois do `sub` compete.

## B.4 O que sai da primeira dobra

| Sai | Por quê |
|---|---|
| `__media img` (foto da pilha de livros) | não comunica "descoberta", e está quase invisível sob `brightness(0.75)` + véu 0,85 |
| `__overlay` (degradê 0,55→0,85) | existia só para proteger texto branco sobre foto; sem foto, não há o que proteger |
| `filter: brightness(0.75) saturate(0.9)` | serve à foto que sai |
| `__eyebrow` em pílula roxa | é o elemento mais padronizado das 4 páginas; e 12px é pequeno demais para ser o primeiro contato |
| `position: fixed` dos chips | medido: cobrem o texto do intro |
| `text-align: center` | simetria total é antítese de descoberta |
| `min-height: 520px` | vira 580px, com o acréscimo sendo espaço vazio |

## B.5 Identidade preservada

O que **não** muda e garante que ainda é Amor NeuroDivergente:

- `Inter` 800 no título principal, `Playfair Display` itálico no accent — as duas fontes já carregadas na página
- `#7c3aed` como cor do accent — o roxo já é `--explore-accent`
- `#f2b705` nos elementos amarelos — o mesmo amarelo do `foto-forma.css`
- a Lia Chibi, no mesmo asset e no mesmo tratamento dos outros lugares
- a largura de linha do `sub` (420–560px), que é medida de leitura confortável
- o header, o breadcrumb e a busca exatamente como estão

---

# C. JUSTIFICATIVA — POR QUE ISSO É "DESCOBRIR"

## C.1 Cada decisão contra a sensação desejada

**A sensação pedida é "o que será que existe aqui?"**

| Decisão | Como produz "o que existe aqui?" |
|---|---|
| Título = "Descubra o que existe aqui" | **é a pergunta, respondida.** O texto atual ("Identifique e aprimore suas habilidades") é uma cobrança, não uma pergunta |
| Título à esquerda, não ao centro | composição assimétrica sugere que o mapa continua do outro lado — ela "descobre" junto com quem lê |
| Os 6 chips como conteúdo, não como barra | a pessoa **lê os destinos antes de clicar em qualquer um.** Hoje ela só descobre que existem ao rolar até o fim |
| Ilustração da estante sangrando a borda | diz "tem mais coisa depois daqui" sem precisar de seta ou de "veja mais" |
| 60px de espaço vazio | dá à dobra um compasso lento — oposto de "catálogo", coerente com "sem pressa, sem ruído" |
| 3 elementos pequenos, 0 camada de véu | a página **respira** e o olho finds things |

## C.2 Por que não é a fórmula "quatro páginas iguais"

Se Artigos e Guias, Blog e Eventos receberem o mesmo tratamento, o resultado seria o template atual de novo. O que torna esta proposta **específica de Explorar** e não transferível:

- **A coluna direita com os destinos só funciona aqui**, porque Explorar é a única página cujo papel é **encaminhar** para as outras três. Artigos não encaminha para Blog. Eventos não encaminha para Artigos.
- **A lista de caminhos em vez de cards** é o oposto do que as outras três vão precisar. As três vão ser conteúdos para ler/consumir, e precisam de **hierarquia editorial** (um grande, outros menores). Explorar não tem conteúdo próprio para hierarquizar — tem **destinos**. Destinos pedem lista; conteúdo pede destaque.
- **Ilustração em vez de fotografia** inverte o registro: as outras três vão ser fotográficas/editoriais. Explorar fica ilustrada, o que a coloca em outra camada.
- **A cor do accent deixa de ser decorativa e vira a cor da marca** (`#7c3aed`). É o acento que as outras três **não** devem usar como destaque de título, senão a identidade se embaralha.

Ou seja: **esta dobra é impossível de reaproveitar nas outras três páginas** — e é isso que faz ela ser uma experiência, e não uma variação.

## C.3 A primeira impressão de 3 segundos

| Pergunta | Resposta com a proposta |
|---|---|
| "Onde estou?" | "Descubra o que existe aqui" —respondido na primeira linha, sem ler o resto |
| "O que isso é?" | ilustração de estante + mapa de caminhos — o objeto e a ação |
| "Isso é o site?" | mesma tipografia, mesma Lia, mesmo amarelo, mesmo roxo |
| "Isso mudou?" | sim: saiu a foto full-bleed com véu, entrou espaço vazio, ilustração e mapa |

## C.4 O que a proposta **não** faz

- Não muda nenhuma cor de identidade
- Não adiciona animação
- Não adiciona JavaScript
- Não adiciona cards
- Não remove nenhum conteúdo: o h1, o sub e os 6 chips continuam todos na dobra
- Não copia Headspace, Duolingo, The Pudding ou Are.na — as referências estão no item 23 da diretriz como estudo de princípio, e a tradução foi feita para o vocabulário do site (a Lia, a estante, o amarelo, o roxo)

---

# D. PRESERVAÇÃO — O QUE CONTINUA EXATAMENTE FUNCIONANDO

Tudo abaixo continua idêntico depois da implementação. A lista é resultado de medição, não de intenção.

## D.1 Funcionalidades

| Funcionalidade | Estado | Como fica |
|---|---|---|
| **6 chips / âncoras** | `#destaques` `#ultimas` `#artigos` `#blog` `#eventos` `#faq` | mesmos `href`, mesmos `<a>`, mesmo texto. Só a apresentação muda |
| **`is-active`** | hoje só o 1º chip tem a classe e **nenhum JS a muda** | continua assim. Nenhum JS novo |
| **JavaScript de chips** | **zero** (`explore-nav` aparece 0× no `Explorar.js`) | continua zero |
| **Carrossel de destaques** | 6 `.hl-card` + setas | intacto, fora da dobra |
| **Paginação do carrossel** | `#hlPagination` com 7 botões | intacta |
| **FAQ** | 5 `<details class="faq-item">` com `data-keywords` | intacta |
| **Busca do FAQ** | `#faqSearchInput` + `#faqNoResults` | intacta |
| **Formulário de atendimento** | `#support-form` | intacto |
| **3 estados** | `#estado-formulario` `#estado-espera` `#estado-chat` | intactos |
| **3 RPCs** | `criar_atendimento` `consultar_atendimento` `responder_atendimento` | intactas |
| **Canal realtime** | em `atendimentos` | intacto |
| **Protocolo** | `#protocoloExibido` + `#btnCopiarProtocolo` | intacto |
| **A Lia no estado de espera** | `lia-corpo.png` + "Recebemos seu pedido." (regra 14) | intacta |
| **Contador de caracteres** | 3200 / 3800 | intacto |
| **Hub flutuante / sidebar / header / footer** | — | intactos |
| **`espaco-banner--grande`** | `data-fundo="...A ESTANTE DAS POSSIBILIDADES.jpg"` | se a ilustração entrar, o marcador sai de uso — **é o único item desta tabela que muda**, e só porque a imagem dele é a que passa a ser usada |

## D.2 Acessibilidade (não é-negociável)

| Item | Estado | Como fica |
|---|---|---|
| `prefers-reduced-motion` | `movimento-reduzido.css` em 12/12 páginas | respeitado; a proposta não introduz animação nova |
| Alvos de toque | chips com 44px | **não podem diminuir** |
| Safe area (notch) | `padding-bottom: max(12px, env(safe-area-inset-bottom))` | preservado se a barra flutuante for mantida |
| Contraste do texto | hoje branco sobre foto escura | passa a ser `#1a1a2e` sobre `#faf9fe` — **contraste sobe de ~5:1 para ~15:1**, e nenhum valor precisa ser medido às cegas |
| `alt` da imagem | "Pessoa lendo em ambiente tranquilo" | a nova ilustração recebe `alt` descritivo; se decorativa, `alt=""` + `aria-hidden` |
| Ordem de leitura | DOM | a reordenação só é CSS (`order`/`flex`), **o HTML não muda de ordem**, então o leitor de tela não sente nada |
| `aria-hidden` nos decorativos | prática já existente | mantida nos 3 elementos e na Lia |

## D.3 O que precisa de decisão sua antes de implementar

1. **Os chips saem da barra flutuante?** A proposta assume que sim. Se quiser manter a barra durante a rolagem, dá para fazer com `position: sticky` (CSS puro, sem JS) — mas é uma decisão sua, porque muda o comportamento de navegação.
2. **O texto do `h1` pode mudar?** A proposta troca "Identifique e aprimore suas habilidades" por "Descubra o que existe aqui". É a maior mudança de conteúdo da proposta. Se preferir manter o texto original, a composição assimétrica ainda funciona, mas perde a coerência com a função da página.
3. **A ilustração da estante pode ser usada?** Ela existe no disco, mas nunca foi usada em lugar nenhum. Usá-la é a primeira vez que entra em produção — vale saber se há motivo para ter ficado de fora.

---

# E. DESKTOP E MOBILE

## E.1 Desktop — três larguras

| Faixa | Comportamento |
|---|---|
| **≥1200px** | layout de 2 colunas: título à esquerda (~48%), mapa de chips à direita (~340px, alinhado ao fim). Ilustração sangrando a borda inferior direita. Altura 580px |
| **900–1199px** | as duas colunas se mantêm, mas a coluna de chips reduz para 300px e a ilustração encolhe para 92px. Altura 560px |
| **<900px** | **coluna única.** Título e sub no topo, mapa de chips em 2 colunas logo abaixo, ilustração no fim da dobra sangrando a borda. Altura ~auto (deixa de ser fixa) |

## E.2 Mobile — o que muda e o que não

**Muda:**

- A dobra deixa de ter altura fixa — passa a ser `height: auto` com `padding-block`, para não criar vão vazio em telas baixas
- Os chips passam a 2 colunas (não 3, para caber sem rolar horizontal) — cada chip continua com 44px de altura mínima
- A ilustração encolhe para 76px e vai para o canto inferior direito, ainda sangrando
- A Lia Chibi encolhe para 84px
- **2 dos 3 elementos decorativos saem** (o `✧` e o `◆`). A diretriz pede isso explicitamente no item 19, e a regra do `GUIA-VISUAL.md` é idêntica
- O `h1` vai para `clamp(1.75rem, 8vw, 2.5rem)` — cerca de 40px no celular, ainda sendo o elemento dominante

**Não muda:**

- Os 6 chips continuam os 6, com os mesmos `href`
- Nenhuma rolagem horizontal (o grid de chips usa `min-width: 0` nos itens)
- O `sub` continua com largura máxima de 420px, que em 390px de tela simplesmente ocupa a largura toda com margem lateral
- O header, o breadcrumb e a busca

## E.3 Tela baixa (landscape de celular, ~400px de altura)

Este é o caso que costuma quebrar o layout. Medido: hoje, em viewport 700px, os chips fixos em y=628 **já cobrem** o texto do intro. Com a nova composição, os chips deixam de ser fixos, então o problema desaparece por construção — mas a dobra de 580px continuaria maior que a tela.

**Proposta:** abaixo de 620px de **altura** (não de largura), a dobra colapsa para o essencial — `eyebrow` + `h1` + `sub`, sem ilustria, sem Lia, sem elementos decorativos. Isso é raro e evita que a página vire rolagem pura em landscape.

## E.4 O que não fazer no mobile

Não transformar a dobra em uma pilha de 6 blocos de altura total. A regra da diretriz: *"não simplesmente transformar tudo em uma pilha idêntica"* — no celular, a hierarquia se mantém (título grande, mapa de chips, ilustração pequena), ela só **encolhe e perde o que é decoração**.

---

# NOTA FINAL

Esta proposta não foi implementada. Os arquivos `Explorar/Explorar.html`, `Explorar/Explorar.css` e `Explorar/Explorar.js` estão inalterados.

**Três decisões dependem de você** (seção D.3): se os chips saem da barra flutuante, se o texto do `h1` pode mudar, e se a ilustração da estante pode entrar em produção.

Depois da aprovação, a implementação deve:
1. criar uma camada nova de estilo (mesmo padrão de `design-direitos.css`: prefixo próprio, carregada por último) para não disputar especificidade com as 472 chaves existentes do `Explorar.css`
2. nunca reordenar o HTML por `order` sem conferir o leitor de tela
3. medir o contraste do texto novo em vez de assumir
