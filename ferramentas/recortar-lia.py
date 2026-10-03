"""
Remove o fundo branco das artes da Lia preservando o desenho.

O truque aqui e NAO apagar todo pixel branco: o rosto, o jaleco e as
calcadas dela tambem sao brancos no original, e um "apagar tudo branco"
abriria buracos na personagem.

O que este script faz e um preenchimento a partir dos cantos, que so
alcanca o branco ligado a borda da imagem. O branco cercado pelo traco
roxo fica intacto.
"""

from PIL import Image, ImageDraw
import os
import sys

# Perto de branco o suficiente para o JPEG ter comprimido, longe o
# suficiente para nao pegar o rosto claro nem o lilac do avatar.
LIMIAR = 34


def remover_fundo(origem, destino, nota="", quadro=False):
    img = Image.open(origem).convert("RGBA")
    w, h = img.size

    # Preenche a partir dos quatro cantos e das quatro bordas. Os cantos
    # sozinhos nao bastam: num desenho que encosta na borda, o fundo pode
    # nao ser alcancavel pelos cantos.
    pontos = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    for x in range(0, w, max(1, w // 40)):
        pontos.append((x, 0))
        pontos.append((x, h - 1))
    for y in range(0, h, max(1, h // 40)):
        pontos.append((0, y))
        pontos.append((w - 1, y))

    # floodfill e funcao do modulo ImageDraw, nao metodo do objeto
    # ImageDraw. Um except largo aqui esconderia o erro e a imagem sairia
    # sem fundo nenhum — que foi exatamente o que aconteceu na primeira
    # tentativa.
    for p in pontos:
        try:
            ImageDraw.floodfill(img, p, (255, 255, 255, 0), thresh=LIMIAR)
        except ValueError:
            # "Starting point is not opaque" ou ja preenchido. Sem
            # problema: a borda foi tratada por outro ponto.
            pass

    # Corta a margem vazia. Sem isso a arte chega com 30% de espaco
    # invisivel e o layout precisa adivinhar o tamanho certo.
    caixa = img.getbbox()
    if caixa:
        img = img.crop(caixa)

    if quadro:
        img = enquadrar(img)

    img.save(destino, "PNG", optimize=True)

    # Quanto do arquivo sobrou opaco? Serve para saber se o preenchimento
    # vazou para dentro da personagem.
    alfa = img.getchannel("A")
    opaco = sum(1 for p in alfa.getdata() if p > 40)
    total = img.size[0] * img.size[1]

    print(f"  {origem}")
    print(f"    -> {destino}  {img.size[0]}x{img.size[1]}")
    print(f"    opaco: {100.0 * opaco / total:.1f}% da imagem")
    if nota:
        print(f"    {nota}")


def enquadrar(img, nota=""):
    """Coloca a arte num quadro quadrado, centralizada.

    O avatar vira circulo por CSS (border-radius: 50%). Numa imagem
    retangular o circulo recorta o que sobrar na largura ou na altura — e
    num desenho de rosto isso corta o queixo ou o topo da cabeca. O
    quadrado garante que o circulo caiba inteiro.
    """
    w, h = img.size
    lado = max(w, h)
    nova = Image.new("RGBA", (lado, lado), (255, 255, 255, 0))
    nova.paste(img, ((lado - w) // 2, (lado - h) // 2))
    print(f"    quadrado: {w}x{h} -> {lado}x{lado}")
    if nota:
        print(f"    {nota}")
    return nova


def reducer(origem, destino, lado, nota=""):
    """Reduz a arte mantendo o quadriculado e a transparencia."""
    img = Image.open(origem).convert("RGBA")
    img = img.resize((lado, lado), Image.LANCZOS)
    img.save(destino, "PNG", optimize=True)
    kb = os.path.getsize(destino) / 1024.0
    print(f"  {origem}\n    -> {destino}  {lado}x{lado}  {kb:.0f} KB")
    if nota:
        print(f"    {nota}")


if __name__ == "__main__":
    print("Removendo fundo das artes da Lia\n")
    remover_fundo(
        "img/lia/lia-corpo-todo.jpeg",
        "img/lia/lia-corpo.png",
        "corpo inteiro, para a tela de abertura da pagina",
    )
    print()
    remover_fundo(
        "img/lia/Avatarclicavel.jpeg",
        "img/lia/lia-avatar-circular.png",
        "versao cheia, referencia e uso grande",
        quadro=True,
    )
    print()

    # O avatar aparece em 34px (mensagens), 42px (cabecalho) e 60px (botao
    # do hub). A versao de 1109px pesa 1 MB para ser vista em 60px.
    # 256px cobre 4x de densidade sem serrilhado.
    reducer(
        "img/lia/lia-avatar-circular.png",
        "img/lia/lia-avatar-256.png",
        256,
        "avatar pequeno, para cabecalho, botoes e mensagens",
    )
