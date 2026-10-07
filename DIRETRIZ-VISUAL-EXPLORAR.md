# DIRETRIZ VISUAL E DE EXPERIÊNCIA — ECOSSISTEMA EXPLORAR

> Documento canônico de direção. Substitui qualquer orientação anterior de redesign.
> Companion de `DOCUMENTACAO-SITE.md` (o levantamento factual) e `GUIA-VISUAL.md` (as regras visuais).
>
> Este documento diz **o que não pode mudar** e **qual é o critério de aprovação**.
> Ele não diz como implementar. A implementação é deduzida a partir daqui.

---

## OBJETIVO

Definir como trabalhar visualmente as páginas do ecossistema **Explorar**:

- Explorar
- Artigos e Guias
- Blog
- Eventos

O objetivo **não é reconstruir o site**, trocar a arquitetura ou remover funcionalidades.

O objetivo é fazer com que, ao navegar entre essas páginas, a pessoa sinta:

> **"Nossa, essa página é diferente."**
> **"Essa outra também é muito boa."**
> **"Mudou de área, mas continuo sentindo que estou dentro do Amor NeuroDivergente."**

Hoje as funções são distintas mas a aparência é parecida. A regra passa a ser:

> **Mesma identidade. Diferentes experiências.**

---

# 1. REGRA MAIS IMPORTANTE

**Não criar quatro páginas com o mesmo layout trocando apenas o conteúdo.**

Não queremos `BANNER → CARDS → CARDS → CARDS → FINAL` em todas.

```
EXPLORAR      → experiência de descoberta
ARTIGOS E GUIAS → experiência editorial e leitura
BLOG          → experiência de conteúdo vivo e recorrente
EVENTOS       → experiência de agenda e participação
```

A mudança de página tem que ser perceptível.

---

# 2. O QUE NÃO DEVE SER ALTERADO

Preservar:

- estrutura funcional existente
- conteúdos existentes
- links e navegação
- Supabase, autenticação, formulários
- **filtros que já funcionam**
- busca quando existente
- carrosséis, modais, FAQ
- estados de carregamento e estados vazios
- integrações
- responsividade e acessibilidade
- sidebar, header, footer
- sistema de ajuda/acessibilidade
- Lia principal
- funcionalidades específicas de cada página

O redesign trabalha **sobre** o que já existe, não substitui essas funções.

---

# 3. O QUE PODE MUDAR

Composição · hierarquia visual · espaçamento · proporção dos elementos · posicionamento ·
tratamento das imagens · tamanho e posição dos títulos · organização dos conteúdos · formato
visual dos blocos · composição dos cards · formas · linhas · pequenos elementos gráficos ·
estrelas · pontos · ilustrações · elementos orgânicos · cores de apoio · fundos · divisores ·
tipografia dentro da identidade existente · destaque de conteúdos · relação entre texto e imagem ·
formas de apresentar informações.

A intenção é fazer bastante coisa usando **HTML + CSS + composição**, em vez de simplesmente
colocar novas imagens em todos os lugares.

---

# 4. PRINCÍPIO CENTRAL

```
Menos imagens obrigatórias → mais composição visual → imagens melhor utilizadas.
```

Não adicionar imagem porque existe espaço vazio. Antes de colocar, perguntar:

> Essa imagem ajuda a entender, sentir ou navegar pelo conteúdo?

Se não, seguir esta ordem:

```
imagem
 ↓
ilustração / composição CSS
 ↓
ícone / pequeno elemento gráfico
 ↓
espaço vazio
```

**O espaço vazio também faz parte do design.** Não preencher todos os espaços.

---

# 5. A IDENTIDADE DEVE CONTINUAR SENDO A MESMA

Elementos comuns que permanecem:

- identidade cromática
- tipografia
- acessibilidade
- linguagem de ilustração
- Lia
- pequenos elementos gráficos (estrelas, pontos, linhas) quando fizer sentido
- formas orgânicas
- sensação de acolhimento, leveza, bastante respiro
- linguagem visual **não infantilizada**

A página pode mudar bastante, mas a pessoa deve pensar "essa página é diferente",
**não** "entrei em outro site".

---

# 6. NÃO USAR CORES DIFERENTES COMO PRINCIPAL FORMA DE DIFERENCIAÇÃO

Não fazer `Explorar = roxo / Artigos = azul / Blog = rosa / Eventos = verde` e considerar
isso suficiente.

A diferença precisa vir principalmente de: composição · hierarquia · ritmo · organização ·
tratamento das imagens · tamanho dos elementos · espaços · forma dos blocos · maneira como o
conteúdo é apresentado.

A cor pode ajudar, mas não deve ser a identidade inteira da página.

---

# 7. CADA PÁGINA DEVE TER UM "MOMENTO DE ENTRADA"

Ao abrir uma página, é preciso perceber imediatamente que entrou em outra área.

**Não necessariamente por animação.** O impacto vem da composição.

A primeira dobra responde visualmente "onde estou agora?" — sem necessariamente repetir o mesmo
banner das outras páginas. O banner atual pode ser aproveitado quando fizer sentido, mas sua
composição pode mudar conforme a função da página.

---

# 8. EXPLORAR

**Função:** ponto de descoberta do conteúdo. A documentação define Explorar como o hub editorial
que reúne Artigos e Guias, Blog e Eventos, além de destaques, leituras recentes, FAQ e o fluxo de
solicitação de ajuda.

> **Explorar não deve parecer uma lista de conteúdos.** Deve parecer uma porta de entrada para o
> universo do site.

**Sensação:** "O que será que existe aqui?"

**Direção:** experiência de descoberta. Caminhos visuais, divisões orgânicas, grandes destaques,
pequenas chamadas, elementos que conduzam o olhar, diferentes escalas, blocos que pareçam
"descobertas", pequenas ilustrações, CSS decorativo. Não precisa transformar tudo em cards.

**A pessoa deve sentir:** "Posso voltar aqui várias vezes e sempre encontrar alguma coisa."

---

# 9. ARTIGOS E GUIAS

**Função:** área de conteúdo editorial mais profundo. A documentação identifica esta página como
índice de leitura longa: artigos externos, conteúdos próprios e páginas de leitura aprofundada.

> **Artigos e Guias deve parecer uma área de leitura.** Não precisa parecer um catálogo.

**Sensação:** "Quero parar aqui e entender alguma coisa."

**Direção:** dar mais importância ao conteúdo. Hierarquia editorial, títulos fortes, resumos
claros, um grande destaque, conteúdos secundários menores, bastante espaço, composição assimétrica
quando fizer sentido, imagens só quando agregarem, diferentes níveis de importância.

Nem todos os conteúdos precisam ter o mesmo tamanho. Um artigo importante pode ocupar muito mais
espaço visual; outro pode aparecer como chamada menor.

**A pessoa deve sentir:** "Aqui tem coisa para ler" — e não "aqui tem uma grade de produtos".

---

# 10. BLOG

**Função:** área editorial mais dinâmica. Hoje mistura artigos escritos e vídeos (9 cards: 5
artigo + 4 vídeo) e tem 8 filtros por categoria que funcionam.

> **Blog não deve parecer uma cópia de Artigos e Guias.**

**Sensação:** "O que tem de novo por aqui?"

**Direção:** publicação recente em destaque, datas mais evidentes, categorias, conteúdos menores,
vídeos, chamadas, conteúdos relacionados, tamanhos diferentes, composição mais irregular,
personalidade. Pode ter mais movimento visual que Artigos e Guias, **sem depender de animações**.

**A pessoa deve sentir:** "Esse lugar está vivo" — e não "é outra página de artigos".

---

# 11. EVENTOS

**Função:** apresentar eventos, workshops e grupos de apoio. Hoje é uma listagem com pouca
interação: sem filtro, sem busca, sem chips.

> **Eventos deve ser a página mais claramente diferente das três anteriores.**

**Sensação:** "Tem alguma coisa acontecendo. Posso participar."

**Direção:**

```
DATA → EVENTO → INFORMAÇÃO → AÇÃO
```

A data pode ser um elemento visual importante. A pessoa deve entender rápido: o que é, quando,
onde, para quem, como participar. Não tratar evento como se fosse outro artigo.

**A pessoa deve sentir:** "Quero ver o que está acontecendo."

---

# 12. A TRANSIÇÃO ENTRE AS PÁGINAS

```
EXPLORAR          "Quero descobrir."
      ↓
ARTIGOS E GUIAS   "Quero entender."
      ↓
BLOG              "Quero acompanhar."
      ↓
EVENTOS           "Quero participar."
```

Não é para escrever essas frases literalmente na interface. Elas representam **a sensação que
cada página deve transmitir**.

---

# 13. "PÁGINA FORTE" NÃO SIGNIFICA "PÁGINA CHEIA"

O objetivo não é mais animação, cor, imagem, card, elemento ou efeito.

Uma página pode ser visualmente forte com: um título muito bem posicionado · uma imagem tratada
de forma diferente · muito espaço em branco · uma pequena estrela · uma forma orgânica · uma
linha · uma grande área de destaque · uma composição assimétrica · uma mudança de escala · uma
boa hierarquia tipográfica.

> **Impacto visual ≠ quantidade de elementos.**

---

# 14. IMAGENS

Evitar simplesmente `[ imagem retangular ]`.

Sempre que fizer sentido, trabalhar com: recorte orgânico · bordas arredondadas diferentes ·
formas atrás · pequenos elementos · estrelas · pontos · linhas · sombras suaves · deslocamento ·
sobreposição · molduras · etiquetas · composição assimétrica.

A imagem deve parecer parte da página, **não um arquivo colocado dentro de um quadrado**.

---

# 15. ELEMENTOS DECORATIVOS

Podem ser reutilizados: estrelas, nuvens, corações, formas orgânicas, linhas, pontos, elementos
relacionados à Lia.

**Mas não devem aparecer em todos os blocos.** O objetivo é criar uma linguagem recorrente, não
um padrão repetitivo.

```
Explorar  ✦
Artigos   não necessariamente ✦
Blog      • ✧
Eventos   uma linha / forma diferente
```

O elemento muda de posição e contexto — assim vira identidade, não enfeite automático.

---

# 16. LIA

A Lia continua sendo a personagem principal. **Não redesenhar, não substituir.**

Pode aparecer em momentos estratégicos: entrada, estados especiais, confirmação, acolhimento,
áreas vazias, pequenos detalhes. A Lia Chibi pode funcionar como pequena assinatura visual
recorrente.

> **Lia não deve aparecer em todos os lugares.** Se aparece em todas as páginas da mesma forma,
> deixa de ser especial.

---

# 17. ESPAÇAMENTO

```
8–12px    elementos do mesmo grupo
16–24px   elementos relacionados
24–32px   conteúdos diferentes
40–64px   mudança clara de seção
72px+     grande mudança ou destaque
```

Não é regra matemática. O princípio:

> Quanto maior a mudança de assunto, maior pode ser a distância visual.

---

# 18. CARDS NÃO DEVEM SER PADRÃO UNIVERSAL

Cards podem existir, mas devem assumir formas diferentes conforme o conteúdo:

- destaque horizontal
- chamada editorial
- bloco pequeno
- conteúdo grande
- lista
- item de agenda
- destaque com imagem
- destaque somente tipográfico
- composição com ilustração
- bloco assimétrico

**A estrutura deve nascer da função do conteúdo.**

---

# 19. RESPONSIVIDADE

A diferenciação visual continua funcionando no celular. **Não simplesmente uma pilha idêntica.**

No mobile: preservar hierarquia · preservar destaque · reorganizar elementos · esconder decoração
quando necessário · evitar overflow · manter leitura confortável · manter acessibilidade.

A experiência pode diferir entre desktop e mobile, mas a personalidade da página continua
reconhecível.

---

# 20. ACESSIBILIDADE CONTINUA SENDO PRIORIDADE

Nenhuma mudança pode prejudicar: contraste · leitura · tamanho de texto · foco · teclado ·
leitores de tela · navegação · redução de movimento · responsividade.

> A identidade visual trabalha **junto** da acessibilidade. Nunca o contrário.

---

# 21. MICROINTERAÇÕES

Hover, movimento de 2–5px, mudança de borda, pequenos deslocamentos, aparecimento suave,
movimento discreto. **Secundárias.** Não transformar a página em experiência de animação.

Respeitar `prefers-reduced-motion`.

---

# 22. NÃO ALTERAR TODAS AS PÁGINAS PARA PARECEREM "NOVAS" AO MESMO TEMPO

A sensação deve ser:

> "Mudou bastante, mas ainda reconheço o site."

E **não** "refizeram o site inteiro".

A mudança vem principalmente de **composição e experiência**.

---

# 23. REFERÊNCIAS VISUAIS

Usadas para **estudar princípios**, não para copiar páginas.

| Página | Referências | O que observar |
|---|---|---|
| Explorar | Headspace, Duolingo, The Pudding, Are.na | descoberta, caminhos, organização, pequenas surpresas, composição |
| Artigos e Guias | The New York Times, Vox, NPR, Aeon, The Guardian | hierarquia, leitura, destaque editorial, ritmo |
| Blog | Medium, Substack, It's Nice That, Nowness | conteúdo recorrente, personalidade, variedade, atualidade |
| Eventos | Eventbrite, Meetup, Time Out, agendas culturais | data, informação rápida, ação, participação |
| Identidade geral | Headspace + referências de ilustração | personagem recorrente, leveza, elementos pequenos, identidade consistente |

**Não copiar o design.**

---

# 24. O QUE NÃO FAZER

Não: reconstruir o site · trocar a arquitetura · remover funcionalidades · remover conteúdo sem
autorização · substituir a Lia · transformar tudo em cards · usar a mesma composição em todas as
páginas · colocar imagens apenas para preencher espaço · usar animação como solução para falta de
impacto · usar cores diferentes como única diferenciação · copiar Headspace · transformar o site em
dashboard · transformar o site em rede social · transformar o site em loja · deixar todas as
páginas visualmente iguais · criar quatro páginas completamente desconectadas.

---

# 25. CRITÉRIO FINAL DE APROVAÇÃO

Abrir as quatro páginas em sequência — Explorar ↓ Artigos e Guias ↓ Blog ↓ Eventos — e perguntar:

1. A página parece diferente da anterior?
2. Consigo identificar rapidamente qual é a função daquela página?
3. A página ainda parece parte do Amor NeuroDivergente?
4. O conteúdo continua sendo o protagonista?
5. A composição é visualmente interessante sem depender de excesso de imagens?
6. A página continua confortável para quem vai voltar várias vezes?
7. A pessoa navega sem precisar "aprender" uma interface nova a cada página?

Se as respostas forem sim, a direção está funcionando.

---

# 26. RESULTADO QUE QUEREMOS

> "Eu estava no Explorar e descobri coisas."

> "Agora entrei em Artigos e Guias e parece um espaço próprio para leitura."

> "Agora fui para o Blog e parece um lugar mais vivo e atualizado."

> "Agora fui para Eventos e parece realmente uma agenda de coisas acontecendo."

E, mesmo assim:

> "Tudo isso claramente pertence ao mesmo site."

---

## PRINCÍPIO DEFINITIVO

> **Não criar páginas iguais com conteúdos diferentes.**
>
> **Criar experiências diferentes para conteúdos diferentes, mantendo a mesma identidade do Amor
> NeuroDivergente.**

**Estrutura e funcionalidades existentes são preservadas. A mudança principal está na composição,
hierarquia, ritmo, tratamento visual e personalidade de cada página.**

---

## NOTA DE IMPLEMENTAÇÃO

Pontos do `DOCUMENTACAO-SITE.md` que restringem como estas quatro páginas podem ser trabalhadas:

- **Eventos não tem filtro nem busca** no código atual (seção 4.4). Se a composição mostrar chips,
  isso é funcionalidade nova — precisa de autorização.
- **Recursos declara no JS um filtro (`.filter-chip`) e uma busca no hero que não existem no
  HTML** (seção 3). A composição não pode contar com eles.
- **O Blog tem 8 filtros funcionando** e cards com 2 variantes (`--article`, `--video`) — é o
  filtro mais bem implementado do site e deve continuar legível em qualquer novo layout.
- **O bloco `explore-topics` é idêntico em Explorar e Recursos** (seção 4.3), com uma âncora
  quebrada (`#ferramentas` não existe no site). As duas cópias precisam de tratamento coerente.
- **`explore-latest` é byte-a-byte idêntico entre Início e Explorar** (seção 4.2), e em Início ele
  é estilizado por `Explorar.css`, não por `inicio.css`. Qualquer mudança visual aqui tem efeito
  nas duas páginas.
- **A ordem de carregamento de CSS decide o que vence** (seção 7.1) e há `.container` com 1100px e
  1000px dentro do mesmo `inicio.css`.
