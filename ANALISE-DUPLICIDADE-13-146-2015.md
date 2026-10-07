# ANÁLISE DA DUPLICIDADE — LEI 13.146/2015

> **Nenhum dado foi corrigido.** As duas entradas continuam no banco, exatamente
> como estavam. Este documento é a análise que você pediu antes da decisão.
>
> Verificado contra o **texto primário no Planalto** em 2026-10-07.

---

## 1. O QUE ESTÁ NO BANCO, VERBATIM

```js
{ id: 2,
  title: "Lei Brasileira de Inclusão (LBI)",
  description: "Assegura e promove condições de igualdade e exercício dos direitos das pessoas com deficiência.",
  category: "social",
  number: "13.146/2015",
  icon: "fa-solid fa-handshake",
  iconClass: "law-icon-social",
  externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm" },

{ id: 10,
  title: "Lei do Acompanhante Terapêutico",
  description: "Garante o direito ao acompanhante terapêutico em instituições de ensino para pessoas com deficiência.",
  category: "educacional",
  number: "13.146/2015",
  icon: "fa-solid fa-chalkboard-user",
  iconClass: "law-icon-educacional",
  externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm" }
```

**O `externalLink` é idêntico nos dois.** Mesmo arquivo, mesmo número, mesmo
documento. A pessoa que rola a página vê duas leis com nomes diferentes e links
iguais.

---

## 2. O QUE O TEXTO DA LEI DIZ

Baixei a Lei 13.146/2015 inteira do Planalto e procurei.

| busca | resultado na LBI |
|---|---|
| **"acompanhante terapêutico"** | **0 ocorrências** |
| "acompanhante" | 8 ocorrências |
| "atendente pessoal" | 7 ocorrências |
| "profissional de apoio" | 1 ocorrência |
| "acompanhante especializado" | 0 ocorrências |

**A expressão que dá nome à entrada 10 não existe na lei que ela aponta.**

O que a LBI diz sobre educação e apoio:

- **Art. 3º, XII** — *atendente pessoal*: "assiste ou presta cuidados básicos e
  essenciais à pessoa com deficiência, excluídas as técnicas e os procedimentos
  identificados porallenge legislações específicas"
- **Art. 3º, XIII** — *profissional de apoio escolar*: "realiza atividades de
  alimentação, higiene e locomoção do estudante"
- **Art. 3º, XIV** — *acompanhante*: "aquele que acompanha a pessoa com
  deficiência, podendo ou não desempenhar as funções de atendente pessoal"
- **Art. 28, XVII** — o poder público deve assegurar "oferta de profissionais de
  apoio escolar"

Ou seja: a LBI tem **três figuras distintas** — atendente pessoal, profissional de
apoio escolar e acompanhante — e **nenhuma delas se chama acompanhante
terapêutico**.

---

## 3. DE ONDE VEM, ENTÃO, O DIREITO AO ACOMPANHANTE NA ESCOLA

Este é o ponto que resolve a duplicidade. Busquei o fundamento real.

**É a Lei 12.764/2012 — a Lei Berenice Piana.** Texto primário, Planalto:

> **Art. 3º** São direitos da pessoa com transtorno do espectro autista:
>
> IV - o acesso:
> ...
> a) à educação e ao ensino profissionalizante;
>
> **Parágrafo único.** Em casos de comprovada necessidade, a pessoa com
> transtorno do espectro autista incluída nas classes comuns de ensino regular,
> nos termos do inciso IV do art. 2º, terá direito a **acompanhante
> especializado**.
> *(Redação dada pela Lei nº 15.131, de 2025)*

**Três consequências:**

1. **A Lei 12.764/2012 já está no banco** — é a entrada `id: 1`, "Lei Berenice
   Piana", categoria `saude`. A informação não se perde: ela está no documento
   certo.

2. **O termo correto é "acompanhante especializado", não "terapêutico".** Não é
   detalhe de redação. A distinção tem consequência: o acompanhante especializado
   é profissional de **educação**; o atendente terapêutico (AT) é profissional de
   **saúde** com atuação clínica. A lei **não** obriga a escola a ter AT — obriga
   o acompanhante especializado. A entrada 10 promete um direito que a norma não
   dá.

3. **A descrição da entrada 10 está errada em dois pontos.** Diz "acompanhante
   terapêutico em instituições de ensino para pessoas com deficiência". O
   fundamento é para **pessoa com TEA** em classes comuns — não "pessoas com
   deficiência" em geral. E o fundamento é a 12.764/2012, não a 13.146/2015.

---

## 4. A ENTRADA 10 TEM TRÊS PROBLEMAS, NÃO UM

| # | problema | evidência |
|---|---|---|
| **1** | **Não é uma lei independente.** Aponta para a LBI, outro diploma. | `externalLink` idêntico ao da entrada 2 |
| **2** | **O título nomeia uma lei que não existe.** Não há "Lei do Acompanhante Terapêutico" no legislação brasileira. | busca por essa expressão retorna apenas a LBI e a LBI sem a expressão |
| **3** | **O conceito está trocado.** Confundiu "acompanhante especializado" (educação) com "atendente terapêutico" (saúde). | LBI Art. 3º XII/XIII/XIV + 12.764/2012 Art. 3º IV § único |

O problema 3 é o mais sério, porque os dois outros são consequência dele: alguém
quis criar uma entrada para o direito do acompanhante na escola, procurou a lei
errada e ainda deu ao documento o nome de um diploma que não existe.

---

## 5. CONSEQUÊNCIA NA CONTAGEM — E UM ALERTA SOBRE O "11 · 1"

Você Propôs exibir **"11 leis · 1 decreto"**. Medi, e há uma armadilha:

| contagem | resultado |
|---|---|
| **12 entradas** no banco | 11 leis + 1 decreto ✅ |
| **11 documentos distintos** | **10 leis + 1 decreto** |

O "11 leis" é verdade **só enquanto a LBI for contada duas vezes**.

| cenário | documentos | composição |
|---|---|---|
| Hoje (mantendo as 2 entradas) | 12 | 11 leis · 1 decreto |
| Depois de resolver a duplicidade | **11** | **10 leis · 1 decreto** |

Ou seja: **corrigir o duplicado muda o número que você quer exibir.** Isso não é
um problema — é uma informação que precisa entrar na decisão, porque a linha
editorial tem que dizer a verdade depois da correção.

**Minha recomendação:** exibir o número de **documentos** (11), que é o que a
pessoa pode conferir, e não o número de entradas. "12 documentos" seria falso.

---

## 6. PROPOSTAS DE TRATAMENTO — SUA ESCOLHA

Não implementei nada disto. As três são completas e mutuamente exclusivas.

---

### OPÇÃO A — a informação volta para onde o direito está
### *(recomendada)*

**A entrada 10 sai do banco.** O conteúdo não se perde: ele volta para a entrada
que já fala do assunto.

```
Entrada 1 — Lei Berenice Piana  ·  Lei nº 12.764/2012  ·  categoria: saúde
  descrição atual (mantida integralmente)
  + linha nova: "Também assegura acompanhante especializado em classes
    comuns de ensino regular, em caso de comprovada necessidade
    (art. 3º, IV)."
  + tag de área secundária: EDUCAÇÃO
```

**Resultado:**
- banco passa a 11 entradas = 11 documentos = **10 leis · 1 decreto**
- a entrada de educação ganha 2 leis (11.788/2008 e 13.370/2016) em vez de 3
- a filtro de Educação deixa de mostrar a LBI, que nunca foi uma lei de educação
- a pessoa que procura "acompanhante" acha — na lei que realmente o garante

**Custo:** uma entrada a menos; uma linha a mais na entrada 1; o filtro de
Educação muda de 3 para 2.

**Risco:** baixo. Nada de existente é apagado — a descrição da 1 só cresce, e o
conteúdo da 10 migrou para ela.

---

### OPÇÃO B — as duas continuam, mas a 10 vira referência

**A entrada 10 deixa de ser lei e vira referência.** Continua no banco e no filtro,
mas marcada como não sendo um documento independente.

```
Entrada 10 — "Acompanhante especializado na escola"
  número:    referência à Lei nº 12.764/2012, art. 3º, IV
  tipo:      Referência (não é um diploma)
  link:      o da 12.764/2012  (não o da LBI)
```

**Resultado:** banco com 12 entradas, 11 documentos. A linha editorial teria que
dizer **"11 documentos · 10 leis · 1 decreto · 1 referência"** — fica mais
honesta, mas mais pesada para uma pessoa que só quer saber quantos textos pode
consultar.

**Vantagem:** nada sai do banco; a pessoa que procura por "acompanhante" na área
educacional ainda acha.

**Risco:** médio. Mantém na tela um item que não é uma lei, numa página que tem
"11 leis" no título. É a opção com mais chance de gerar a mesma dúvida que
tentamos resolver.

---

### OPÇÃO C — só corrigir o conteúdo, manter as 2 entradas

**Mantém as duas entradas, corrige o título, o número e o link da 10** para o
fundamento certo.

```
Entrada 10 — "Acompanhante especializado na escola"
  descrição: "Garante o acompanhante especializado para estudantes
              autistas incluídos em classes comuns, em caso de
              comprovada necessidade (Lei 12.764/2012, art. 3º, IV)."
  número:    "12.764/2012, art. 3º"
  link:      o da 12.764/2012
```

**Resultado:** 12 entradas, **12 documentos** (o mesmo texto twice). A LBI deixa
de ser contada na educação e a 12.764 passa a contar duas vezes — o duplicado
**muda de documento**, não desaparece.

**Risco:** alto, e por isso não recomendo. Troca um erro por outro, e agora a lei
mais citada da área de saúde aparece duas vezes.

---

## 7. MINHA RECOMENDAÇÃO

**Opção A**, por três razões:

1. **O duplicado não é editorial — é um erro de fonte.** A entrada 10 aponta para
   um documento que não contém o direito que ela nomeia. Não há razão editorial
   a preservar: foi um registro errado, não escolha de organização.

2. **A informação não se perde.** O direito ao acompanhante especializado está na
   Lei 12.764/2012, que já está no banco. Ele volta para lá — com a referência
   ao artigo, o que é **mais** útil do que a entrada atual.

3. **É a única opção em que a contagem editorial fica verdadeira.** Depois dela:
   "11 documentos · 10 leis · 1 decreto". As outras duas obrigam a página a
   exibir um número que não corresponde aos documentos.

**Mas a decisão é sua, e eu não aplico sem ela.** O item 7 da sua autorização é
exatamente isso: não corrigir ainda, mostrar a relação primeiro. Este documento
é essa etapa.

---

## 8. O QUE NÃO FIZ NESTA ETAPA

- **Não alterei** `direitos.js`. As 12 entradas estão intactas.
- **Não reordenei** as leis por área (item 4 da sua autorização, mas ela depende
  desta decisão — agrupar por área torna a duplicidade visível).
- **Não apliquei** a linha editorial "11 leis · 1 decreto" — ela depende de qual
  opção for escolhida.
- **Não toquei** nas 2 fotos do editorial, no formulário, no filtro, na busca, no
  Supabase ou na autenticação.

**Prévia do que já está pronto e aprovado:**

| item | estado |
|---|---|
| Remover o fundo branco do brasão | ✅ feito — `img/ilustracoes/leis-planalto-alfa.png`, alfa real, estrelas e fita intactas |
| Original preservado | ✅ `leis-planalto.br.png` intocado |
| Estrutura dos 5 atos | ✅ aprovada, aguardando implementação |
| Assinatura da fonte | ✅ aprovada, aguardando implementação |
| Brasão no Ato CONFERIR | ✅ aprovada, aguardando implementação |
| Reordenar por área | ⏸ depende da decisão da duplicidade |
| Duplicidade 13.146/2015 | ⏸ **sua decisão** |
| "11 leis · 1 decreto" | ⏸ o número depende da decisão da duplicidade |

---

*Fim. Nenhum dado do banco foi alterado.*