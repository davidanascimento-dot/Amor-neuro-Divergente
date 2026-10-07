# PROPOSTA — EXPERIÊNCIA VISUAL DE ROLAGEM · PÁGINA "SEUS DIREITOS"

> **Esta etapa é só proposta.** Nenhum arquivo da página foi alterado.
> Diagnóstico exclusivamente de `DOCUMENTACAO-DIREITOS-ESTADO-ATUAL.md`.
>
> Proposta escrita em 2026-10-07. Nada aqui foi implementado.

---

## 0. O QUE O DIAGNÓSTICO CONFIRMA

O documento mediu o problema com número:

| trecho | y | extensão | % do documento |
|---|---|---|---|
| **Categorias → Leis → Fontes → Editorial → Recursos** | 1421–6243 | **4.822px** | **62%** |
| (subtrecho sem quebra alguma: Leis → Fontes → Editorial) | 1421–5431 | 4.010px | 51% |

E mediu a causa: **7 das 10 seções de conteúdo compartilham dois brancos cuja
diferença é de 8, 8 e 9 níveis por canal** (`#faf9fe` vs `#ffffff`) — abaixo do
degrau de percepção. Somado a isso, **25 linhas com a mesma anatomia** em 4 seções
(4 áreas, 12 leis, 6 do FAQ, 3 recursos).

A proposta abaixo não tenta preencher isso com imagem. Tenta dar a cada momento
da página **uma composição que só ele tem**, para que a rolagem seja lida como
*mudança de assunto* e não como *continuação de papel*.

---

## 1. A NARRATIVA: CINCO ATOS, NÃO DEZ SEÇÕES

A sequência que você propôs (9 seções) está certa na ordem. Mas a **quebra** não
pode ser por seção — porque 9 quebras em 7.811px dão uma quebra a cada 870px, e
isso vira ruído.

Agrupo em **cinco atos**. Cada ato é um ambiente visual distinto, e as seções
dentro dele dividem a mesma linguagem. Isso é o que faz a pessoa sentir "estou
entrando em outra parte" — e o que impede que sinta "mais uma seção".

```
╔══════════════════════════════════════════════════════════════════════╗
║ ATO I — ORIENTAR                    y 0 … 1.421                    ║
║   dobra (arte) · navegação · fontes oficiais · 4 áreas             ║
║   linguagem: ATMOSFERA + NAVEGAÇÃO. o papel é quase todo              ║
╠══════════════════════════════════════════════════════════════════════╣
║ ══════════ A MUDANÇA 1 ══════════                                   ║
║ ATO II — CONSULTAR                  y 1.421 … 4.200                 ║
║   as 12 leis, agrupadas por área                                      ║
║   linguagem: DOCUMENTO. fundo frio, tipografia serifada nos títulos  ║
╠══════════════════════════════════════════════════════════════════════╣
║ ══════════ A MUDANÇA 2 ══════════                                   ║
║ ATO III — CONFERIR DE ONDE VEM      y 4.200 … 4.900                 ║
║   as fontes oficiais                                                  ║
║   linguagem: ARQUIVO/FONTE. o brasão entra aqui — e só aqui          ║
╠══════════════════════════════════════════════════════════════════════╣
║ ══════════ A MUDANÇA 3 ══════════                                   ║
║ ATO IV — SAI DO PAPEL               y 4.900 … 6.400                 ║
║   editorial (as 2 fotos) · recursos práticos                         ║
║   linguagem: HUMANO. fundo quente, fotos grandes, sem lista          ║
╠══════════════════════════════════════════════════════════════════════╣
║ ══════════ A MUDANÇA 4 ══════════                                   ║
║ ATO V — PERGUNTAR E SER ACOLHIDO     y 6.400 … 7.811                 ║
║   FAQ · contato · Lia · formulário · footer                         ║
║   linguagem: DIÁLOGO. volta o claro, mas em registro diferente       ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Cada ato tem:** um fundo próprio, uma tipografia de título própria, um
tratamento de linha próprio, e um ritmo de leitura próprio. As transições são
marcadas por **uma** coisa nova cada vez — nunca por duas.

---

## 2. MEDIÇÃO QUE MUDA A IDEIA DAS LOGOS

Sua ideia central era: logo/foto da instituição por lei + assinatura da fonte.
Antes de propor, medi o dado que ela depende. O resultado muda o desenho.

### 2.1 As 12 leis vêm **todas** do mesmo lugar

```
id  1  Lei Berenice Piana              → planalto.gov.br
id  2  Lei Brasileira de Inclusão      → planalto.gov.br
id  3  Lei Romeo Mion                  → planalto.gov.br
id  4  BPC                             → planalto.gov.br
id  5  Lei de Cotas para PCD           → planalto.gov.br
id  6  Lei de Acessibilidade           → planalto.gov.br
id  7  Lei da Libras                   → planalto.gov.br
id  8  Decreto de Acessibilidade       → planalto.gov.br
id  9  Direito à Saúde Mental          → planalto.gov.br
id 10  Lei do Acompanhante Terapêutico → planalto.gov.br
id 11  Lei da Educação Especial        → planalto.gov.br
id 12  Lei da Inclusão Profissional    → planalto.gov.br
```

**12 de 12 em `planalto.gov.br`.** Não há 12 instituições — há **uma**.

Consequência direta: **12 logos iguais é 12 vezes a mesma imagem.** Não
diferencia nada, e ainda transforma a seção mais importante da página num
cartão de Visitantes repeats. A ideia não está errada — está *bem posicionada*:
a **assinatura da fonte** é valuable demais para ser a informação por lei, e
**inútil** como repetição.

### 2.2 Onde a assinatura é verdadeiramente informativa

O Planalto é a origem de 100% das leis. E medindo a página: **o Planalto não está
na seção FONTES.** Ela lista MDH, MEC, Saúde, IPEA, APAE, ABDA — nenhum é o
Planalto. O Planalto só aparece, hoje, como uma pílula lilás na INTRO.

Ou seja: **a página mostra 12 links para o Planalto e nunca diz, em um lugar
onde a pessoa possa conferir, que é de lá que vem tudo.** Isso é uma falha de
transparência real, não uma questão estética. A assinatura da fonte resolve
exatamente isso — e fica muito melhor **uma vez por ato** do que 12 vezes.

### 2.3 A imagem que você colocou

`img/ilustracoes/leis-planalto.br.png` — 444×450, 48 KB, PNG modo paleta.
É o **brasão da República Federativa do Brasil**. Medido:

| propriedade | valor | consequência |
|---|---|---|
| Fundo | **opaco `#ffffff`**, não transparente | sobre o papel `#faf9fe` vira um retângulo branco de 5,6,7 níveis de diferença — o mesmo defeito do slot de banner que já existe no site |
| Paleta | `#0099cc` azul, `#339933` verde, `#ffcc00` amarelo, `#cc0033` vermelho | 4 cores saturadas (100% de saturação em 3 delas), mais vivas que **qualquer** cor da página |
| Cobertura | 100% opaco, 0px de margem | sem respiro interno: o brasão encosta na própria borda |

É a imagem certa para o conceito. Mas **é uma imagem institucional de alta
saturação numa página que vive entre 2% e 100% de saturação.** Usada 12 vezes
vira o oposto do que a página precisa.

### 2.4 Onde ela funciona

**Uma vez, no Ato III**, como assinatura do bloco de fontes. Ali astitutionalidade
é a mensagem: "isto aqui é o lugar oficial de onde vêm os textos". Uma imagem
saturada naquele ponto é **informação**, não enfeite — porque é o único momento
em que a pessoa precisa acreditar na procedência.

Para usar bem, precisa de 2 preparações (nenhuma inventa conteúdo):
1. **Recortar o fundo branco** e ficar com o brasão em alfa real, para ele não
   aparecer como um quadrado colado no papel.
2. **Conter as 4 cores dentro de um único elemento** — o brasão não pode
   "espalhar" azul, verde e amarelo pela seção, senão vira o mosaico de cores
   sem função que você vetou.

---

## 3. DADOS EXISTENTES QUE A PROPOSTA USA

Nada aqui é novo. Tudo já está no banco de `direitos.js` ou é medível na página.

### 3.1 O dado mais valioso que hoje não aparece em lugar nenhum

O tipo do documento já está no caminho do link. Li e confirmei:

| no link | tipo | quantidade |
|---|---|---|
| `/ccivil_03/leis/...` ou `/.../lei/lXXXX.htm` | **Lei** | **11** |
| `/ccivil_03/.../decreto/d5296.htm` | **Decreto** | **1** |

Hoje a tela diz "Lei 12.764/2012" para as 11 leis **e para o decreto**. A
distinção é fato documental verificável no próprio dado, e é informação que muda
o peso da fonte: decreto é regulamentação, lei é norma. **Isso entra como
rótulo, não como invenção.**

### 3.2 Os dois bugs que encontrei (não corrigidos aqui, por serem de dado)

Antes de propor agrupamento, encontrei dois problemas no banco. **Nenhum é
estético, e nenhum está na minha proposta para corrigir automaticamente** —
são decisão de conteúdo, e registro para você decidir.

**BUG A — a lei 13.146/2015 aparece duas vezes, com nomes diferentes:**

```
id  2  category: social       "Lei Brasileira de Inclusão (LBI)"
id 10  category: educacional  "Lei do Acompanhante Terapêutico"
     ambos → l13146.htm  (o MESMO link)
```

São **duas entradas apontando para o mesmo documento**, com títulos e
descrições diferentes. A Lei Brasileira de Inclusão (Estatuto da PCD) de fato
prevê o acompanhante terapêutico — mas isso é **um artigo dela**, não uma lei
separada. Como está, a página mostra 12 leis e a pessoa conta 11 documentos
distintos.

**BUG B — o filtro por área conta as entradas, não os documentos.**
Como 13.146/2015 aparece em `social` e em `educacional`, o número "3 leis"
da Educação e "4 leis" da Assistência Social incluem o mesmo documento duas
vezes em blocos diferentes.

> **Impacto na proposta:** se as 12 leis forem agrupadas visualmente por área,
> esse duplicado vira **visível** — a mesma lei apareceria em dois grupos. Isso
> é bom: transparency. Mas exige a decisão antes da implementação.
>
> **Opções (sua escolha, eu não implemento sem ela):**
> (a) manter as 12 entradas e marcar a 10 como "artigo da LBI" com o link da LBI;
> (b) remover a entrada 10 e Mentionar o acompanhante dentro da descrição da LBI;
> (c) manter como está e aceitar a duplicidade.

### 3.3 A ordem atual não é agrupada

```
rolagem de hoje:  saúde, social, social, social, social,
                  acess, acess, acess, saúde, educ, educ, educ
```

A 1ª lei é de saúde, a 9ª também — separadas por 7 itens. A pessoa rola sem
saber que está numa área ou noutra. **Agrupar por área não é reordenar por
gosto: é fazer visível o agrupamento que o filtro já promete.**

⚠️ **Cuidado:** o filtro usa `data-category` e `renderLaws()` recria o DOM na
ordem do array filtrado. Agrupar na rolagem significa **mudar a ordem do array
em `lawsDatabase`** (ou ordenar em `renderLaws`). Isso é mudança de dado, não de
CSS — precisa da sua aprovação.

---

## 4. A PROPOSTA, ATO POR ATO

Para cada ato: **o que muda** (com a medição do "antes"), **como muda**, e
**por que essa mudança existe**.

---

### ATO I — ORIENTAR · y 0 … 1.421

**Seções:** dobra · navegação · INTRO (fontes oficiais) · separador · CATEGORIAS

**Estado atual (medido):** dobra com arte `#faf9fe`; nav em vidro; INTRO em
`#ffffff` com título Playfair 28px **centralizado** e 5 pílulas lilás; 76px de
separador; CATEGORIAS em `#faf9fe` com título Inter 22px **à esquerda** e 4
linhas com fio colorido.

**Problema medido:** a passagem INTRO → CATEGORIAS é uma **inversão de
linguagem sem ponte** — Playfair centralizado vira Inter alinhado à esquerda,
separadas pelo mesmo separador genérico da outra transição da página.

**O que muda:**

| | Antes | Proposta |
|---|---|---|
| INTRO | `#ffffff`, título Playfair **centralizado** | permanece clara, mas vira **painel de origem**: título alinhado à esquerda, mesmo esqueleto de todas as cabeçalhas do ato |
| Separador INTRO→CATEGORIAS | `rd-sep` genérico (losango + fio) | **marca devirada**: o fio ganha a cor do ato seguinte e o losango vira um pequeno "12" — as 12 leis que estão por vir |
| CATEGORIAS | 4 linhas com fio colorido | **permanece**, mas passa a ser o *cardápio* do Ato II: ganha a mesma numeração romana que o Ato I usa |

**Por que:** o Ato I precisa **terminar** como uma coisa só. Hoje ele tem duas
metades que não se reconhecem. Alinhar a INTRO às cabeçalhas do resto do Ato
custa pouco e resolve a inversão sem tirar o respiro (que é bom e fica).

**O que NÃO muda:** a dobra (é a referência do site), a navegação, a marca `— · —`,
as 4 áreas com fio colorido, os chips da INTRO.

---

### ATO II — CONSULTAR · y 1.421 … 4.200

**Este é o momento principal. É onde 62% da página vive, e onde a proposta
trabalha mais.**

#### 4.1 O que muda: as 12 leis deixam de ser 12 linhas iguais

**Estado atual (medido):** 2.468px de `#ffffff` puro. 12 linhas de 172/196px,
`gap: 0`, borda 1px entre elas, sem foto, sem sombra, sem número. Densidade de
tinta entre **1,2% e 9,1%**. A seção inteira ocupa **31,6% do documento**.

**Proposta — a lei vira uma unidade editorial/documental:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ÁREA                                                      [fio]│
│  Lei 12.764/2012                                              │  ← Playfair, maior que hoje
│  Lei Berenice Piana                                            │  ← Inter 800, como hoje
│                                                                 │
│  Estabelece direitos da pessoa com Transtorno do Espectro      │
│  Autista, garantindo acesso à educação e serviços públicos.   │
│                                                                 │
│  ──────────────────────────────────────────────                │
│  FONTE: Planalto              → Consultar fonte oficial  →     │  ← assinatura
└─────────────────────────────────────────────────────────────────┘
```

**As 5 peças, e de onde vem cada uma:**

| peça | origem | é dado novo? |
|---|---|---|
| fio + nome da área | `--dp-cat` + `categoryMap` | **já existe** |
| **Lei nº / Decreto nº** | tipo lido do próprio `externalLink` | **não, é leitura do dado** |
| número (`12.764/2012`) | `law.number` | **já existe** (hoje em 12,5px; aqui sobe) |
| título | `law.title` | **já existe** |
| descrição | `law.description` | **já existe** |
| **FONTE: Planalto** | host do `externalLink` | **não, é leitura do dado** |
| **→ Consultar fonte oficial** | o `externalLink` que já existe | **já existe** (hoje "Ver lei completa") |

**A assinatura de fonte:** vem do host do link. Todas as 12 vão dar "Planalto" —
e é por isso que ela vai ser **uma declaration do ato**, não um bloco repetido:

```
No cabeçalho do Ato II:
   ┌──────────────────────────────────────────────────┐
   │  Toda a legislação nesta página vem de uma       │
   │  fonte só: Planalto, o repositório oficial do     │
   │  governo federal.                                │
   └──────────────────────────────────────────────────┘
```

E a assinatura por lei entra **discreta, no rodapé da unidade** — a
transparência que você quer, sem 12 repetições do mesmo brasão.

#### 4.2 O que mais muda dentro do ato

| | Antes (medido) | Proposta |
|---|---|---|
| **Agrupamento** | 12 linhas soltas, ordem do banco, sem cabeçalho de área | **4 grupos com cabeçalho**, na ordem das 4 áreas — casando com o filtro |
| **Fundo** | `#ffffff` puro, 2.468px | fundo **frio** (`--dp-papel` com leve tom azulado), para marcar "aqui é o documento" |
| **Título da lei** | Inter 800 18px | **Playfair 700** — o documento tem voz própria, diferente do título de seção |
| **Altura** | 172/196px por lei | **mais generosa**: cada unidade ganha respiro interno e uma linha de assinatura |
| **Contagem** | "3 leis" no tile da área | **"3 documentos"** ou a contagem real, coerente com a decisão do Bug A |
| **Nº de série** | nenhum | a lei recebe um **número de ordem dentro do grupo** (ex.: 2 de 3), reforçando que é percurso |

#### 4.3 Por que o agrupamento é a mudança principal

Sem agrupamento, as 12 leis continuam sendo "12 linhas iguais" — a forma não
muda, só enfeita. **Com agrupamento, a pessoa vê a estrutura da informação:**
saúde tem 2, assistência social tem 4, acessibilidade tem 3, educação tem 3.
O filtro deixa de ser o único lugar onde a estrutura aparece.

E cria uma consequência boa: **cada grupo pode ter seu próprio respiro**, o que
dá 4 micro-momentos dentro de um ato em vez de 2.468px de nada.

⚠️ **Isso exige reordenar `lawsDatabase`.** Ver 3.3 e o Bug A.

---

### ATO III — CONFERIR DE ONDE VEM · y 4.200 … 4.900

**Seção:** FONTES ("Quer se aprofundar?")

**Estado atual (medido):** 341px. Fundo `#faf9fe`. Título Inter 800 22,4px
**centralizado**, 1 frase, 6 chips brancos com borda (43px, raio 30px). Único
`border-top: 1px` da página. **O percurso.css não tem nenhuma regra aqui.**

**Problema medido:** é a seção mais "de fora" da página — e a mais silenciosa.
341px com 6 chips não dizem nada sobre a confiabilidade que tentam comunicar.

**Proposta — a "estante de origens":**

1. **O brasão entra aqui, e só aqui.** Uma vez, grande, com o fundo branco
   recortado (ver 2.4), ao lado do texto que declara a procedência. Substitui o
   título centralizado por um **cabeçalho alinhado à esquerda** — a assinatura do
   seção, casando com o Ato III.

2. **As 6 pílulas ganham hierarquia de 2 níveis.** Hoje são iguais. Proposta:
   - **4 órgãos oficiais** (MDH, MEC, Saúde, IPEA) — com selo de "oficial"
   - **2 organizações da sociedade civil** (APAE, ABDA) — com selo de
     "organização"

   A distinção é verificável nos próprios domínios (`.gov.br` vs `.org.br`) e
   **já está implícita nos links existentes**. Não é invenção: é tornar legível
   o que o link já diz.

3. **O Planalto entra nesta seção** como a **fonte primária** — ver 2.2. Hoje ele
   não está aqui, apesar de ser a origem de tudo. Vai no topo da estante, com o
   brasão ao lado.

**Por que essa mudança existe:** o Ato III é a **confirmação** de que o Ato II é
confiável. Hoje essa confirmação é uma frase e 6 botões. Com a assinatura de
procedência visível, a página faz o que uma fonte oficial faz: mostrar de onde
veio.

---

### ATO IV — SAI DO PAPEL · y 4.900 … 6.400

**Seções:** EDITORIAL (2 cards com foto) · RECURSOS (3 itens + Lia + formulário)

**Estado atual (medido):** 2.013px em `#faf9fe`. EDITORIAL é o **único** card
com raio 20, sombra, foto de 240px e botão tijolo `#a8734a` — e é a **única seção
que o `percurso.css` não tocou** (0 regras). Chega em y 4.230, depois de 2.800px
de lista, e aparece como exceção tardia.

**Problema medido:** o Ato IV é o único momento "humano" da página e ele está
**disfarçado de página institucional**. O botão tijolo e o raio 20 não são de
nenhum outro lugar aqui.

**Proposta:**

| | Antes (medido) | Proposta |
|---|---|---|
| **Fundo** | `#faf9fe` | fundo **quente** (`--dp-papel-quente`, que **está declarado no CSS e nunca é usado** — 1 ocorrência, só a definição) |
| **EDITORIAL** | card genérico com sombra e botão tijolo | **as 2 fotos assumem a seção.** Fotos grandes, sem moldura de card, com o texto ao lado. Sem raio 20, sem sombra, sem botão tijolo |
| **Botão** | tijolo `#a8734a` | **roxo da marca** — o único botão de ação primária que fica fora do formulário |
| **RECURSOS** | grade 2 colunas: 3 itens à esquerda, Lia+form à direita | **separa**: os 3 itens práticos ficam em faixa larga acima; a Lia + formulário descem como **chegada** do ato |
| **Nuvem decorativa** | 112px no topo direito | mantém — é a única marca orgânica do ato |

**Por que a mudança de temperatura:** o Ato II é o mais frio da página
(frio = documento, texto oficial). O Ato IV é o mais quente. Essa inversão de
temperatura é o que dá a sensação de "sai do papel". E usa um token que **já
existe** no arquivo, o que é a forma mais barata de ganhar um ambiente novo.

---

### ATO V — PERGUNTAR E SER ACOLHIDO · y 6.400 … 7.811

**Seções:** FAQ · CONTATO + Lia · FOOTER

**Estado atual (medido):** 1.411px. FAQ é `#ffffff` com 6 `<details>` em lista
com fio de 1px, head **centralizada** (as outras 3 são à esquerda), título Inter
22px. CONTATO é `#faf9fe`, grid 2 colunas, é a **única seção sem badge e sem fio
de head**. FOOTER é `#f0f4f8` — **a única quebra de cor real da página**.

**Problema medido (o trecho B do diagnóstico):** 1.492px de fim de página e o
único sinal de chegada é o cinza do footer, **depois** de 389px que já parecem
papelão. E a inversão centralizado/alinhado da head do FAQ é um accidento: as
outras 3 heads são à esquerda.

**Proposta:**

1. **A head do FAQ alinha à esquerda** com as outras — resolve o accidento e
   mantém o ritmo do ato. (Mudança de 1 propriedade.)

2. **A CONTATO ganha badge e fio de head.** Hoje é a única seção sem os dois.
   Com eles, a passagem FAQ → CONTATO passa a ter a mesma gramática das outras —
   e a pessoa entende que chegou ao fim do percurso.

3. **O separador entre FAQ e CONTATO vira o fecho do percurso.** Hoje é o mesmo
   `rd-sep` da vez 2. Aqui ele ganha a marca da página (`— · —`) fechando o
   arco que a dobra abriu.

4. **O FAQ muda de "lista de perguntas" para "conversa".** As 6 perguntas ficam
   em duas colunas (3+3) em vez de 6 linhas de largura total. Mudança de
   densidade: as perguntas passam a ser lidas como um bloco, não como 6 itens.

5. **O pé do Ato V é a Lia.** O grid 2 colunas do contato (texto + Lia) fica,
   mas a Lia ganha a hierarquia de **chegada** — ela é o fim da jornada, e é a
   única pessoa na página.

**Por que:** o Ato V é o único que pode ser **mais leve**, e não mais pesado.
A regra que vale aqui é a da sua própria filosofia: a página não precisa ter uma
imagem em cada seção. O Ato V é conversa — e conversa se faz com espaço e
tipografia, não com ilustração.

---

## 5. A SEQUÊNCIA DE ROLAGEM, LIDA DE PERTO

O que a pessoa vai sentir, e onde cada virada é **perceptível**:

```
y        O QUE ENTRA NO CAMPO          POR QUE É PERCEPTÍVEL
─────────────────────────────────────────────────────────────────
0        arte, título, percurso        referência; já funciona
398      a nav gruda e não solta        o header é fixo; a barra também
699      pílulas oficiais entram       ELAS — não são texto, são botões
775      4 áreas com fio colorido      ELAS — cor, a 1ª vez na página
─────────────────────────────────────────────────────────────────
1421    FUNDO ESFRIA                   tonalidade baixa; é a 1ª virada de ambiente
1500    "documento oficial"            SERIFADA nos títulos das leis
1700    cabeçalho da 1ª área           agrupamento — a estrutura aparece
1850    assinatura "FONTE: Planalto"   linha nova, informação nova
─────────────────────────────────────────────────────────────────
4200    a fonte, com brasão            ELAS + o brasão + selos de oficial/ONG
─────────────────────────────────────────────────────────────────
4900    FUNDO ESQUENTA                 ELAS — a inversão mais forte da página
5000    as 2 fotos grandes             ELAS — 96–100% de tinta contra 4% acima
6000    3 itens práticos em faixa      ELES
─────────────────────────────────────────────────────────────────
6400    a FAQ em 2 colunas             densidade muda; head alinha
7000    a badge+fio do contato         ELES — mesma gramática das outras
7100    a Lia                          ELAS — a única pessoa da página
7359    o cinza do footer              ELAS — a única quebra de cor real
```

**4 viradas de ambiente + 5 marcos internos.** Em 7.811px: uma virada a cada
~1.600px, com marcos dentro dos atos.

Hoje existe **uma** virada perceptível na página inteira (o cinza do footer).

---

## 6. O QUE **NÃO** VAI ACONTECER

Porque a proposta é do problema, não do gosto:

| vetado | como a proposta respeita |
|---|---|
| uma imagem por seção | **1 imagem nova** em uso (o brasão, uma vez). As 2 fotos do editorial **já existem** e só mudam de tratamento |
| mosaico de cores | 4 cores de área, já existentes, agora agrupadas. O brasão é **1 elemento**, com as 4 cores contidas dentro dele |
| virar tudo card | as 12 leis continuam **linhas**, não cards. Ganham agrupamento e assinatura, não moldura |
| mudar conteúdo jurídico | nenhum `title`, `description` ou `number` muda. A única leitura nova é **lei × decreto**, extraída do próprio link |
| inventar fonte/logo/instituição | a assinatura vem do host real do link. Não existe fonte inventada: as 12 são Planalto, e o texto diz isso |
| copiar Explorar / Artigos / Blog / Eventos | o sistema é **documento**, não ilustração de fundo nem grade editorial. O brasão é único daqui |
| quebrar filtro/busca/link/formulário | o filtro continua em `data-category` + `card.hidden`. A assinatura é texto, o link é o mesmo `externalLink` |
| mexer em Supabase | não há Supabase nesta página (medido) |
| tocar no `direitos.js` | **nenhuma alteração de dado é proposta.** O agrupamento exige decisão sua (3.3) |

---

## 7. OS 3 PONTOS QUE EXIGEM SUA DECISÃO ANTES DE IMPLEMENTAR

Não são detalhes de execução. São decisões que mudam o desenho.

**1. O duplicado 13.146/2015.** Ver 3.2 (Bug A). Como o agrupamento torna isso
visível, precisa estar resolvido antes. Três opções em 3.2.

**2. Reordenar `lawsDatabase` por área.** Sem isso, o Ato II não tem agrupamento
— e o agrupamento é a mudança central do ato. Reordenar é mexer em dado.

**3. O brasão como fundo branco.** Precisa ser recortado para ter alfa real
(2.4, item 1). É manipulação de imagem — não gero nada novo, só removo o branco
de fundo que é arte de fundo, não parte do brasão. Mas é uma alteração de
arquivo, e por isso precisa da sua palavra.

---

## 8. O QUE ESTE DOCUMENTO **NÃO** PROPÕE

- **Não escolhe** as novas cores de fundo — só nomeia a direção (frio/quente) e
  indica que `--dp-papel-quente` já existe no arquivo.
- **Não escreve** as descrições das 4 áreas nem os textos dos atos.
- **Não redesenha** a dobra, a navegação, as 4 áreas, o formulário ou a Lia.
- **Não corrige** os 2 bugs de dado (3.2) — só os registra.
- **Não promete** altura final de nenhuma seção: as medidas de altura vêm depois
  que a composição existir.

O que ele estabelece, em uma frase: **cinco atos, cada um com uma composição
que só ele tem, e a procedência das leis elevada de link solto a assinatura
visível** — usando 1 imagem que você já colocou, no único ponto onde ela carrega
informação em vez de enfeite.

---

*Fim. Nenhum arquivo de código da página foi alterado.*