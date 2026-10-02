# Imagens da Lia (AcolherIA)

Coloque os arquivos **nesta pasta** com os nomes exatos abaixo. Não precisa
editar HTML nem CSS: o site lê o caminho em `/imagens.js`, na raiz do projeto.

## Nomes de arquivo

| Arquivo | Onde aparece | Observação |
|---|---|---|
| `banner-lia.png` | Fundo do card da AcolherIA | **versão processada**: fundo transparente, traço lilac claro. Vem do `avatar.jpg` |
| `avatar-lia.png` | Avatar circular do chat | **versão processada**: fundo transparente, traço escuro. Vem do `avatar.jpg` |
| `avatar.jpg` | Original do retrato (busto e rosto) | fonte das duas versões acima |
| `banner.jpeg` | Original de corpo inteiro | **hoje não é usado** |

## Por que existem duas versões do mesmo retrato

`avatar.jpg` e `banner.jpeg` têm **fundo branco opaco**, não transparente.
Usados direto, aparecem como um retângulo branco em cima do banner escuro
— era o que deixava o bloco com cara de inacabado. Sobre fundo escuro, o
traço preto também sumiria.

As versões `-lia.png` passaram por um tratamento que:

- deixa o branco transparente;
- troca o traço preto por **lilac claro** no banner (o fundo é escuro);
- mantém o traço **escuro** no avatar (o cabeçalho do chat é claro);
- preserva as partes coloridas, como o colar de infinitude.

## Por que o banner usa o retrato, e não o corpo inteiro

O banner é largo e tem botões flutuantes (UserWay, VLibras, hub de ajuda)
ocupando o **canto inferior direito**. Com a Lia de corpo inteiro, os pés e
as pernas ficavam exatamente embaixo deles.

O retrato resolve de três formas:

- o **rosto** ocupa 60% da altura do bloco, e fica no alto — longe dos
  botões;
- os **ombros**, que são a parte larga do desenho, ficam abaixo do limite
  do banner e nunca aparecem;
- a base do busto tem **fade**, então não há corte reto denunciando que a
  imagem é quadrada colada num bloco largo.

## Como trocar

Duas formas, sem mexer em HTML nem CSS:

1. **Trocar o arquivo.** Mantenha o nome e sobrescreva o que está na pasta.
2. **Trocar o caminho.** Abra `/imagens.js` e edite a linha do slot.
   Serve para usar outro nome, outra pasta ou imagem hospedada fora.

Depois de qualquer uma das duas, atualize a página (`Ctrl+Shift+R`).

**Se você refizer a arte, gere com fundo transparente.** O tratamento que
removeu o branco foi feito uma vez, na mão; não é preciso refazer.

Duas coisas para respeitar, senão o enquadramento sai errado:

- **quadrada**. O CSS dimensiona a arte por `auto 150%` da altura do card e
  assume largura igual. Uma imagem retangular vai esticar.
- **com margem em volta**. O traço ocupa de 10% a 90% da largura. Se a arte
  encostar nas bordas, o rosto sai do lugar e invade o texto.

## Enquanto a imagem não carregar

Aparece um quadro tracejado com o nome "Lia". Placeholder, não imagem
quebrada. Dá para deixar o caminho apontando para um arquivo que você
ainda vai criar, sem quebrar a página.

## Cores que combinam com a Lia

As do banner da comunidade:
- roxo `#7c3aed`
- rosa `#db2777`
- verde-água `#10b981`
- fundo escuro dos banners: `rgba(35, 18, 42, 0.72)`

O colar de infinitude e o broche de cérebro podem virar a identidade visual
do site: dá para usar o símbolo da infinitude como favicon e como marca
d'água das imagens da Lia.

## Cores que combinam com a Lia

As do banner da comunidade:
- roxo `#7c3aed`
- rosa `#db2777`
- verde-água `#10b981`
- fundo escuro dos banners: `rgba(35, 18, 42, 0.72)`

O colar de infinitude e o broche de cérebro podem virar a identidade visual
do site: dá para usar o símbolo da infinitude como favicon e como marca
d'água das imagens da Lia.
