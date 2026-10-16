"""
converte-gatinho.py — tira o branco de fundo da moldura e vira PNG.

POR QUE ISSO PRECISA EXISTIR

    Uma moldura de avatar tem que ser TRANSPARENTE no meio, para a foto
    aparecer. JPG nao tem canal alfa: o que nao e desenho vira branco
    solido. Ja teve duas versoes do arquivo aqui:

        1. com xadrez cinza no centro (mockup de preview)
        2. com branco solido no centro

    As duas tem o mesmo problema — o centro opaco cobre o avatar. O
    branco e mais facil de remover do que o xadrez, porque nao ha padrao
    que confunda a deteccao de borda: e so um grande bloco quase branco.

    Por isso PNG e nao JPG: so o PNG guarda transparencia.

O QUE O SCRIPT FAZ

    1. Le a imagem.
    2. Mede o que e "quase branco" e "quase preto" na imagem INTEIRA —
       inclusive nas bordas, que tem o mesmo fundo branco.
    3. Aplica um degrade suave: o que e claramente branco vira 100%
       transparente; o que tem qualquer tinta fica opaco. A borda do
       desenho nao fica dura.
    4. Corta a area vazia em volta, para sobrar so a moldura.
    5. Salva PNG em img/molduras/.

    O arquivo original em img/ilustracoes/ NAO e tocado. O branco la
    dentro e o que a ferramenta de design precisa para voce continuar
    mexendo na arte.

 USO:  python ferramentas/converter-gatinho.py
"""

import sys
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / "img" / "ilustracoes" / "Moldura-gatinho-teste-comunidade.jpg"
DESTINO = RAIZ / "img" / "molduras" / "moldura-gatinho-teste.png"

# Abaixo disso o pixel e considerado "papel" e some. Acima, e desenho.
# 232 cobre branco puro e JPEG sujo sem comecar a comer o rosa claro
# do interior das orelhas.
LIMITE_PAPEL = 232

# Faixa de dubia: some completamente. Evita a borda dura que apareceria
# se o alpha fosse um degrau seco entre branco e colorido.
INICIO_SUAVE = LIMITE_PAPEL - 12


def main() -> int:
    if not ORIGEM.exists():
        print(f"  nao achei {ORIGEM}")
        return 1

    imagem = Image.open(ORIGEM).convert("RGBA")
    px = imagem.load()
    largura, altura = imagem.size

    total = largura * altura
    became_transparente = 0

    for y in range(altura):
        for x in range(largura):
            r, g, b, _ = px[x, y]

            # min() em vez de media: uma unica banda saturada ja conta
            # como tinta. Usando media, um pixel (250, 250, 200) passaria
            # como papel e abriria um buraco no desenho.
            mais_escuro = min(r, g, b)

            if mais_escuro >= LIMITE_PAPEL:
                alpha = 0
            elif mais_escuro >= INICIO_SUAVE:
                # de 0 a 255, linear entre os dois limites
                alpha = int(255 * (mais_escuro - INICIO_SUAVE) / (LIMITE_PAPEL - INICIO_SUAVE))
            else:
                alpha = 255

            if alpha == 0:
                became_transparente += 1

            px[x, y] = (r, g, b, alpha)

    print(f"\n  {ORIGEM.name}: {largura}x{altura}")
    print(f"  {became_transparente * 100.0 / total:.1f}% da imagem ficou transparente")

    # Corta a margem vazia. Sem isso a moldura fica com uma moldura
    # quadrada invisivel em volta, e o background-size do CSS precisa
    #Rcitar por ela.
    caixa = imagem.getbbox()
    if caixa:
        imagem = imagem.crop(caixa)
        print(f"  recortado para {imagem.size[0]}x{imagem.size[1]}")

    DESTINO.parent.mkdir(parents=True, exist_ok=True)
    imagem.save(DESTINO, "PNG", optimize=True)

    kb = DESTINO.stat().st_size / 1024
    print(f"  salvo: {DESTINO.relative_to(RAIZ)}  ({kb:.1f} KB)\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
