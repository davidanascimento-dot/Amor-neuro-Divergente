# Guia-base visual — Amor NeuroDivergente

> **Não substituir imagens boas. Transformar imagens secas, grandes ou
> genéricas em composições visuais usando HTML + CSS.**

Este documento é a referência canônica. Ele existe para que cada página
receba um tratamento próprio **sem inventar um estilo novo** — todas as
composições devem pertenecer à mesma família.

---

## Regra de ouro

O site nunca deve parecer que só colocou:

> texto + foto + card + foto + card

Cada seção tem uma composição visual própria, mas todas precisam
pertencer à mesma família. A sensação final é:

> **"O Amor NeuroDivergente tem uma linguagem visual própria."**

e não:

> "Cada seção foi feita de um jeito."

---

## Regra para o OpenCode

> **ANTES DE ALTERAR QUALQUER IMAGEM, tente resolver o problema visual
> com HTML/CSS.**
>
> - Não substituir imagens existentes automaticamente.
> - Não criar novas imagens sem necessidade.
> - Priorizar composição, espaçamento, formas, cores, bordas, ícones e
>   pseudo-elementos.

---

## 1. Imagem não é um retângulo

Sempre que houver fotografia ou ilustração dentro de uma seção, avaliar
se ela está visualmente **seca**.

Evitar:

```
┌──────────────────────┐
│                      │
│        FOTO          │
│                      │
└──────────────────────┘
```

Preferir:

```
        ✦
   ╭──────────────╮
  ╱                ╲
 │       FOTO       │
  ╲                ╱
   ╰──────────────╯
       ◆
```

Criar com CSS:

- formas orgânicas atrás da imagem;
- molduras deslocadas;
- bordas assimétricas;
- `border-radius` personalizado;
- `clip-path` quando apropriado;
- pequenas estrelas, pontos, losangos, linhas, círculos;
- sombras suaves;
- faixas de cor.

**Não editar permanentemente esses elementos dentro da imagem** quando
eles puderem ser criados pelo CSS.

---

## 2. Banners

Não devem ser automaticamente imagens gigantes ocupando toda a tela.
Três possibilidades:

| Tipo | Quando |
|---|---|
| **Editorial** | Texto de um lado + imagem estilizada do outro |
| **Ilustrativo** | Imagem maior, com elementos CSS integrados e espaço para o conteúdo |
| **Compacto** | Quando a página não precisa de grande introdução — faixa horizontal menor, com cor, formas e uma pequena imagem/ícone |

**Nunca aumentar uma imagem apenas para preencher espaço vazio.** A
imagem deve ter uma função.

---

## 3. Tratamento das fotografias

| A imagem é importante? | → manter |
|---|---|
| Está grande demais? | → reduzir e criar composição ao redor |
| Está seca? | → adicionar tratamento CSS |
| Está repetindo outra imagem? | → considerar ícone, ilustração pequena ou composição CSS |
| Não acrescenta informação? | → remover |

Uma fotografia nunca deve existir apenas porque "faltava alguma coisa
naquela área".

---

## 4. Formas orgânicas

Biblioteca reutilizável: blob suave, arco, círculo deslocado, forma
ondulada, faixa curva, sombra orgânica.

```
      ╭─────────────╮
   ╭──│             │
  │   │    FOTO     │
   ╰──│             │
      ╰─────────────╯
```

Devem ser suaves e discretas. **Não transformar cada seção em uma
composição exagerada.**

---

## 5. Estrelas e pequenos elementos

Linguagem: `✦` `✧` `◆` `•`

**Regra: 1–3 elementos decorativos por composição.** Devem parecer parte
da identidade visual, não enfeite aleatório.

Podem aparecer: próximos a títulos, ao redor de fotografias, em
divisores, próximos a banners, em espaços vazios estratégicos.

**Não colocar estrelas em todos os cards.**

---

## 6. Cores

Paleta pequena. As cores aparecem em **barras, fundos pequenos, ícones,
bordas, formas, etiquetas** — não pintando seções inteiras.

| Cor | Uso |
|---|---|
| Roxo | identidade principal |
| Rosa | acolhimento / destaque |
| Azul | informação / comunidade |
| Verde suave | apoio / recursos |
| Amarelo suave | pequenos detalhes e estrelas |
| Branco / off-white | espaço e descanso |

**Não transformar cada seção em uma cor diferente.**

---

## 7. Cards

Evitar `[ CARD ] [ CARD ] [ CARD ] [ CARD ]` todos idênticos.

Criar variações que pertençam ao mesmo sistema:

- card com imagem;
- card sem imagem;
- card com ícone;
- card destacado;
- card horizontal;
- card com borda;
- card com pequena forma decorativa.

---

## 8. Ícones no lugar de imagens

Se uma informação pode ser representada por um pequeno ícone, **não criar
uma imagem para isso**.

- Artigo → ícone de página
- Comunidade → ícone de pessoas/conversa
- Direitos → ícone documental
- Ajuda → ícone de orientação
- Eventos → ícone de calendário

Ícones simples, consistentes e acessíveis.

---

## 9. Espaçamento

O espaço vazio é parte do design. **Não preencher todos os espaços com
imagens ou decoração.**

Aumentar o espaçamento quando uma seção estiver visualmente apertada.
A página deve parecer confortável, não comprimida.

---

## 10. Divisores de seção

Não depender apenas de uma linha horizontal.

```
────────── ✦ ──────────
      •
──────────────
```

Ou uma pequena faixa de cor. **Ou simplesmente um grande espaço em
branco.**

Os divisores ajudam o usuário a perceber que está entrando em uma nova
parte da página.

---

## 11. Microinterações

Animações pequenas e previsíveis:

- imagem subir 3–5px no hover;
- estrela aparecer suavemente;
- borda mudar de intensidade;
- ícone deslocar 2px;
- elemento decorativo com movimento extremamente sutil.

**Nada de animações constantes ou chamativas.** Respeitar sempre:

```css
@media (prefers-reduced-motion: reduce)
```

---

## 12. A Lia

A Lia é **personagem de identidade**, não elemento decorativo
obrigatório.

**Não colocar Lia em todas as seções.** Usar principalmente em: banners,
AcolherIA, momentos de orientação, estados vazios, algumas áreas
especiais.

A **Lia Chibi** funciona como pequena assinatura visual em determinados
banners.

---

## 13. Regra para cada seção

Antes de adicionar uma imagem, perguntar:

> **"Essa imagem realmente acrescenta alguma coisa?"**

| Se... | Então |
|---|---|
| não acrescenta | usar CSS + ícone + composição |
| acrescenta | manter a imagem e criar tratamento visual próprio |
| é muito grande | reduzir e criar composição ao redor |
| está seca | adicionar forma, moldura, estrela ou outro elemento CSS |
| é repetitiva | criar variação de composição |

---

## 14. Estados especiais — Lia como parte da composição

Em telas de **atendimento aberto, aguardando resposta, envio concluído,
protocolo gerado, confirmação, nenhum conteúdo encontrado, carregamento,
primeira visita e erro amigável**, avaliar se uma Lia de corpo inteiro
pode substituir elementos gráficos genéricos ou complementar a mensagem.

**Não transformar a Lia em uma imagem solta no centro da tela.** Ela deve
fazer parte da composição.

A Lia de corpo inteiro deve:

- manter o design oficial da personagem (não redesenhar);
- ter tamanho proporcional ao conteúdo;
- não competir com o título ou o protocolo;
- aparecer só quando realmente acrescentar acolhimento;
- poder ficar em uma lateral ou acima/abaixo do conteúdo;
- usar pequenas formas CSS ao redor quando necessário;
- permitir uma pequena frase contextual;
- não transformar a tela em uma ilustração gigante.

**Frases curtas e naturais**, relacionadas ao estado atual:

| Estado | Frase |
|---|---|
| Atendimento aberto | "Recebemos seu pedido." |
| Aguardando resposta | "Agora é só aguardar um pouquinho." |
| Protocolo gerado | "Guarde esse número com carinho." |
| Nenhum resultado | "Ainda não encontramos nada por aqui." |
| Busca sem resultado | "Vamos tentar outro caminho?" |
| Erro | "Ops! Algo não saiu como esperado." |
| Conteúdo vazio | "Esse espaço ainda está esperando por você." |

Não é "coloque Lia em toda tela" — é "quando o estado da interface tiver
uma mensagem humana, considere a Lia como parte da composição visual".

---

## Biblioteca no repositório

| Arquivo | O que resolve |
|---|---|
| `espacos-banner.css` | Espaço reservado para banner (chave liga/desliga) |
| `elementos-decorativos.css` | Nuvem, coração e formas orgânicas recorrentes |
| `lia-chibi.css` | Lia Chibi como broche na borda do banner |

Ferramentas:

| Script | O que faz |
|---|---|
| `ferramentas/espacos-banner.py` | Insere os espaços para banner no mapa de páginas |
| `ferramentas/elementos-decorativos.py` | Insere os elementos decorativos no mapa de páginas |
