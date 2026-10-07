# PROPOSTA VISUAL — DIREITOS
## Sistema de orientação: ORIENTAÇÃO → ÁREA → DIREITO → COMO USAR → AJUDA

**Fase:** proposta. Nada implementado.
**Base:** `GUIA-VISUAL-PAGINA-SEUS-DIREITOS.md` (13 seções) + `GUIA-CONTINUIDADE.md`
**Levantamento:** `Direitos/direitos.html` (35.855 bytes), `direitos.css` (45.607 bytes, 319 chaves), `direitos.js` (22.621 bytes, banco de 12 leis embutido)

---

## 1. Onde a página está hoje, medido

Nove seções, nesta ordem:

| linha | seção | o que é |
|---|---|---|
| 117 | `rd-banner` | banner fotográfico com foto de "Documentos e símbolo de justiça" |
| 165 | `rights-intro` | texto + 5 links |
| 192 | `#categorias` | 4 `category-tile` (Educação, Saúde, Assistência Social, Acessibilidade) |
| 237 | `#leis` | `#lawsGrid` **vazio no HTML** — preenchido por `direitos.js` |
| 267 | `sources-banner` | 6 links |
| 302 | `#editorial` | 2 cards com imagem |
| 339 | `#recursos` | 3 `resource-item` + `#caseForm` (nome, e-mail, textarea) |
| 415 | `#faq` | 6 `<details>` |
| 484 | `#contato` | card de contato com fundo escuro |

O banco tem **12 leis** com 8 campos: `id`, `title`, `description`, `category`, `number`, `icon`, `iconClass`, `externalLink`. As 4 categorias batem com os 4 tiles (`educacional`, `saude`, `social`, `acessibilidade`).

**Dois bugs de dado, já existentes:**

- O tile de Assistência Social declara **"5 leis"**; o banco tem **4**. Os outros três batem (3, 2, 3).
- O `#lawsGrid` não existe no HTML como conteúdo — ele só ganha cards quando o JS roda. O filtro e a busca escrevem nele com `innerHTML`.

---

## 2. O problema da primeira dobra atual

O banner é a 4ª ocorrência do template que medimos em Artigos, Blog e Direitos: `__media` + `__overlay` + `__eyebrow` + `__title-accent`. Aqui o accent é **azul** (`#38bdf8`), o mesmo hex medido nas outras três.

E o banner tem **duas veus sobrepostas** — `.rights-banner__overlay` e uma `.rd-banner__veu` que não tem nenhuma regra no CSS. Ou seja, alguém tentou corrigir o véu e a regra nunca existiu. A foto é de "Documentos e símbolo de justiça", com `filter` de escurecimento.

E há um número que vale corrigir: **20 das regras do `direitos.css` usam
fundo escuro** na página clara (as outras 60 são `body.a11y-dark-mode`,
que só valem no modo escuro). Três delas criam ilhas de marinho quase
preto no meio de um site claro:

- `.law-editorial-card__panel { background: #071524 }` — o painel de cada lei
- `.case-box { background: linear-gradient(135deg, #1a1525, #2d1b3d, ...) }`
- `.rights-contact__card { background: linear-gradient(...rgba(15,...)) }`

O painel das leis é o pior: **as 12 leis são o conteúdo principal da
página e cada uma é uma caixa azul-escura.** Uma página sobre clareza e
segurança com o conteúdo principal em marinho de tribunal.

Isso viola três coisas do guia:

1. **Não deve parecer banner fotográfico tradicional** (§4 do guia)
2. **Nada de símbolos jurídicos** (§2): a foto é literalmente "documentos e balança"
3. **Não deve parecer institucional fria** (§2)

---

## 3. O sistema próprio: percurso de orientação

O guia define a cadeia `ORIENTAÇÃO → ÁREA → DIREITO → COMO USAR → AJUDA`.

Os quatro sistemas já implementados:

```
Explorar  → caminhos        (2 colunas, onde ir)
Eventos   → eixo temporal   (data abre a linha)
Artigos   → diagramação     (estante + perfil de coluna + índice)
Blog      → fluxo           (8 pesos, destaque na dobra)
```

Direitos será o quinto:

```
Direitos  → PERCURSO        (numeração que atravessa a página)
```

### O que é um percurso

Não é uma timeline e não é um índice. É uma **trilha numerada que a pessoa segue e que atravessa todas as seções**:

```
01  Quais são meus direitos?      → os 4 temas, cada um abrindo a lista
02  Como eu uso esses direitos?   → o que fazer, passo a passo
03  Onde encontro ajuda formal?    → órgãos, DENATRAN, Defensoria
```

O número não fica na seção como um título. Ele vive numa **coluna de marcação à esquerda**, com um fio vertical correndo por ela, e a página inteira é lida como um percurso numerado. É o que o guia pede em §8 quando escreve `01 → 02 → 03`.

### Por que isso não é o índice de Artigos

Artigos tem um índice de 4 linhas numeradas (`01`–`04`) **dentro da dobra**, apontando para seções da própria página. É um sumário editorial, uma peça local.

Direitos tem uma marcação que **começa na dobra e continua por três seções**, e o número é a estrutura de leitura, não um rótulo. Mesma família visual (número + fio), função diferente: Artigos mostra o que tem; Direitos mostra por onde se anda.

---

## 4. A primeira dobra

Título, à esquerda:

```
Conheça seus direitos.
E descubra como usar cada um deles.
```

A segunda linha em Playfair itálico roxo, como nas outras quatro. O primeiro "Conheça seus direitos." em Inter 800.

**Subtítulo:** a frase atual é boa e entra inteira — "Conheça as leis que protegem você e saiba como usá-las no dia a dia. Sem palavras difíceis." É a promessa da página em uma linha.

**Marca:** `── ✦` como Explorar e Artigos? Não. As três marcas já usadas são:

- Explorar: 1 linha + estrela amarela, estrela **antes** da linha
- Artigos: 1 linha + estrela roxa, estrela **depois** da linha
- Eventos: 1 linha + losango verde

Para Direitos, que é um percurso, a marca é **1 linha + 1 ponto + 1 linha**:

```
──── · ────
```

Um ponto no meio de um fio. É a mesma gramática (linha fina + forma pequena), e o ponto diz "marcação" — é literalmente um marco no percurso. Diferente das três por forma e por posição, não por cor.

**A atmosfera.** Sem foto de banner. A arte disponível é `img/ilustracoes/OS SEIS SÍMBOLOS DOS DIREITOS.jpg` (1024×559, 98 KB).

Medi antes de decidir:

- É uma arte de **6 símbolos não jurídicos** ligados por fios finos que formam um percurso: mãos+envelope, mochila+livro, caneca+relógio, documento, óculos+chave, duas cadeiras. Isso é literalmente "documentos → caminhos → marcações" — a atmosfera que o guia descreve em §4. E é o oposto da foto atual: nada de martelo, balança, tribunal, advogado.
- **Mas o arquivo não serve como está.** Está em modo RGB, sem canal alfa, e o fundo é um cinza ~233 desenhado com aparência de xadrez na prévia. Colocada como fundo, apareceria um retângulo cinza do tamanho da imagem na dobra.
- Testei a recuperação por dois métodos. Por **distância ao branco** o resultado foi sujo (erro médio 1,20/255 é bom nas bordas, mas o cinza do xadrez vira mancha). Por **chaveamento de saturação** ficou limpo: **94,9% do fundo transparente**, arte intacta, os traços finos em cinza-escuro preservados, e composta sobre o `#faf9fe` do site sem nenhuma borda visível. Gerei o PNG resultante e conferi visualmente.

**Recomendação:** gerar `imagem-fundo-direitos.png` a partir dessa arte por chaveamento de saturação, e usá-la como atmosfera da dobra a **baixa opacidade e grande escala**, não como foto de banner. É a diferença entre "ilustração que informa" e "foto que decora".

Proporção: 1,83:1 contra uma dobra de ~2,3:1. `cover` cortaria ~20% na vertical, e o corte pegaria a fileira de baixo (documento, óculos+chave, cadeiras). Enquadramento em `50% 42%` para manter as duas fileiras.

---

## 5. As três perguntas viram a estrutura

O guia define três momentos de jornada, não três cards iguais (§5). O que existe hoje na página:

- "Quais são meus direitos?" — **existe**, dentro dos 4 tiles de `#categorias`. Mas está como *grade de 4 caixas com ícone e contagem*.
- "Como eu uso esses direitos?" — **não existe**
- "Onde encontro ajuda formal?" — **não existe como pergunta**; o mais perto é `#recursos` ("Recursos Úteis", 3 itens) e `#contato`.

O que a proposta propõe, em três momentos com peso visual diferente:

**Momento 1 — ONDE VOCÊ ESTÁ.** As 4 áreas, como o guia exemplifica:

```
EDUCAÇÃO
Matrícula · adaptação · apoio
───────────────────────────── →
```

Sem ícone em caixa, sem contagem no canto. Os 4 termos de cobertura vêm do que a área realmente cobre — os `description` do banco. Uma linha de cobertura + um fio + a seta.

**Momento 2 — O QUE VOCÊ FAZ COM ISSO.** Uma seção nova, construída a partir de dados que já existem no banco. Cada lei tem 6 campos; `description` é o resumo, `number` é a base legal. As 5 camadas do guia (§7) mapeiam assim:

| camada do guia | de onde vem |
|---|---|
| O que é? | `description` — já existe |
| Quem pode usar? | `title` + `category` — já existe |
| Como faço? | **não existe** — o JS teria de ganhar um campo |
| O que posso precisar? | **não existe** |
| Onde buscar ajuda? | `externalLink` — já existe |
| Base legal | `number` — já existe |

**Esta é a decisão que preciso do usuário.** Três caminhos:

- **A.** Implemento só o que existe: as 4 áreas + as 12 leis com o painel claro e a base legal discreta. O "como faço" fica para uma segunda etapa. É o que dá para fazer sem inventar texto jurídico.
- **B.** Escrevo o "como faço" e o "o que preciso" para as 12 leis. Exige ~36 blocos de texto novo, e é conteúdo jurídico — precisa de revisão de quem entende do assunto.
- **C.** Faço as 5 camadas visuais no sistema e deixo 2 delas vazias num estado que explica o porquê, para quando o conteúdo chegar.

Recomendo **A**, e digo por quê: o guia diz "menos leis, mais orientação", e orientação inventada é pior que orientação adiada. Um campo vazio honesto é melhor que um texto plausível e errado.

**Momento 3 — QUEM TE AJUDA.** `#recursos` e `#contato` existindo separados hoje viram um bloco único de ajuda formal. Os 3 `resource-item` já são caminhos ("passo a passo para denunciar", "modelos de solicitação", "ONGs e associações").

---

## 6. As 12 leis: o painel escuro sai

Hoje cada lei é `.law-editorial-card` com imagem 200px, overlay em gradiente, e um painel `#071524`. 26 regras no CSS.

Proposta: **linha de percurso, não caixa.**

```
01  Lei Berenice Piana                                    12.764/2012  →
    Estabelece direitos da pessoa com TEA, garantindo acesso à
    educação e serviços públicos.
```

- Número da lei à direita, em 12px uppercase — a base legal fica **visível e discreta**, que é o que o guia quer (§7: "a legislação aparece como referência, mas não domina")
- Sem imagem. As 12 imagens vêm de `getLawImage(law, index)` e são decorativas — nenhuma acrescenta informação que o título não diga
- Sem overlay, sem `transform: translateY(-4px)` no hover
- Fio de 1px entre as linhas

Ganho: 12 fotos → 0. A página fica mais leve e o conteúdo principal deixa de ser uma parede de caixas escuras.

O `getLawImage` e o bloco de `<img>` do template ficam no JS intocados — se algum dia a imagem voltar a ter função, é uma linha. Mas enquanto o `img` não for usado, ele simplesmente não carrega.

---

## 7. A Lia

O guia é explícito (§10): só com função narrativa, não no topo para preencher.

Onde há função real na página: **Momento 3, antes do formulário de casos.** O texto que já existe no `#caseForm` é "Conte-nos seu caso" — e é exatamente o momento em que a pessoa não sabe por onde começar.

```
Não sabe por onde começar?
Conte o que aconteceu e veja quais caminhos podem ajudar.
```

A Lia aparece **nesse** ponto, pequena, ao lado. Não na dobra. Na dobra, ela não teria função: a página já tem a marcação e a atmosfera fazendo o trabalho de orientar.

---

## 8. O formulário de casos

O guia (§11) pede que não pareça "formulário jurídico". O atual diz "Conte-nos seu caso" e tem um botão "Enviar e receber análise gratuita" — o texto está bom. O que muda é o enquadramento:

**Título:** "Precisa de orientação sobre uma situação?" com o apoio "Conte o que aconteceu e veja quais caminhos podem ajudar."

**As 4 clarezas** que o guia pede, e que hoje não estão todas:

| o guia pede | hoje |
|---|---|
| que o envio exige conta | não dito |
| que a pessoa está relatando o próprio caso | não dito |
| quais informações serão necessárias | só os placeholders |
| o que acontece depois do envio | o botão promete "análise gratuita" |

As 4 são texto novo. As duas primeiras são as que mais importam e as mais fáceis: duas linhas acima do botão.

**O formulário não muda:** mesmo `#caseForm`, mesmos 3 campos, mesmo `<textarea>`, mesmo botão. Zero alteração funcional.

O `case-box` escuro (`#1a1525` → `#2d1b3d`) vira claro. Uma caixa marinho quase preta num formulário sobre "seus dados estão seguros" trabalha contra a mensagem.

---

## 9. O que sai da primeira dobra

| peça | motivo |
|---|---|
| `__media` + `__overlay` | 4ª ocorrência do template; §4 pede sem banner fotográfico |
| `.rd-banner__veu` | elemento no HTML sem nenhuma regra no CSS — véu duplicado |
| `fa-scale-balanced` (balança) | §2: nada de símbolos jurídicos |
| `alt="Documentos e símbolo de justiça"` | §2: nada de símbolos jurídicos |
| accent `#38bdf8` | medido: o mesmo hex das outras 3 páginas que já foram refeitas |

---

## 10. O que não muda

- **As 12 leis** do banco, com os 8 campos, os `externalLink` e os 4 `data-category`
- **Os 4 tiles** de categoria, os 4 `data-filter`, o `categoryMap`
- **A busca** (`lawsSearch`, com debounce de 300ms)
- **O filtro** (`currentFilter`, re-render por `innerHTML`)
- **`#lawsNoResults`** e o estado vazio
- **O `#caseForm`**, os 3 campos, o botão
- **Os 6 `<details>`** do FAQ
- **Os 3 `resource-item`** e o botão de download
- **Os 6 links** do `sources-banner`
- **Os 2 cards** do `#editorial`
- **Supabase**, RPCs, realtime, autenticação — `direitos.js` não é tocado
- **header, sidebar, breadcrumb, busca global, footer**

---

## 11. Decisões que preciso antes de implementar

1. **O "como faço" e o "o que preciso"** das 12 leis: caminho A, B ou C da §5. Recomendo A.
2. **A contagem errada** do tile de Assistência Social: diz 5, o banco tem 4. Corrijo o dado (4) ou deixo?
3. **A atmosfera:** gero o PNG por chaveamento de saturação a partir da arte dos 6 símbolos? Ou faço a dobra só com CSS (linhas e pontos), sem imagem nenhuma?
4. **A Lia no formulário:** entro com ela ou fica para depois?

---

## 12. Arquivos

Novos:
- `Direitos/direitos-percurso.css` — a camada, prefixo `.dp-`, carregada por último
- `PROPOSTA-VISUAL-DIREITOS.md` — este documento
- (se a 3 for sim) `img/ilustracoes/imagem-fundo-direitos.png`

Modificados:
- `Direitos/direitos.html` — dobra, seção das 12 leis, `#recursos`/`#contato` unificados

Intocados:
- `Direitos/direitos.css` (45.607 bytes, 319 chaves)
- `Direitos/direitos.js` (22.621 bytes, banco de 12 leis)