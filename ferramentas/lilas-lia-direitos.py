"""
Prepara a Lia de Direitos para o card, do jeito que o avatar e feito.

O alvo
------
O avatar da AcolherIA e 92% vazio: so o contorno da Lia, em traco violeta
escuro, com o miolo transparente. A Lia de Direitos tem que ter esse
mesmo aspecto, porque o card dela tem fundo roxo escuro.

O que estava errado
-------------------
Duas coisas, e as duas apareceram na tela antes de esta versao:

1. O MIOLO FICAVA PREENCHIDO DE CINZA.
   A arte tem sombreado leve no interior: o histograma mostra 4,25% de
   pixels abaixo de 180 (o traco de verdade) e mais 2,03% entre 180 e 232
   (o sombreado). O script tratava tudo abaixo de 232 como traco, entao
   pintava o sombreado de lilac apagado e a Lia aparecia com o corpo
   cheio. O avatar nao tem nada disso.

   A correcao e nao usar limiar alto. Tudo que for mais claro que o
   limiar vira TRANSPARENTE, inclusive o miolo. E o que da o mesmo
   aspecto de "so o contorno" do avatar.

2. O CONTOURO DA MOLDURA FICAVA NO QUADRO.
   A moldura na direita e um retangulo ralo, e a linha da mesa atravessa
   ate ela — por isso as duas sao o mesmo pedaco de desenho e nenhum
   recorte por conexao as separa. So que, depois de limpo o miolo, a
   moldura cai para 8%-14% da densidade do pico, e a Lia fica entre 24% e
   100%. Nessa hora o corte por densidade apanha.

Por isso a ordem aqui e: limpar o miolo ANTES de medir onde esta a
figura. Na ordem inversa a moldura se escondia dentro do sombreado.

Os passos
---------
1. limpar o miolo   — bimza, alpha
2. cortar na figura — laterais firmes (20%), base tolerante (4%)
3. trocar o pigmento — traco escuro vira o lilac do banner

Arquivos
--------
ENTRADA  img/lia/lia-direitos.jpg    a arte original, como veio
SAIDA    img/lia/lia-direitos-clara.png   a arte pronta para o card

A ENTRADA NUNCA e sobrescrita. E o unico jeito de voltar atras.
"""

from PIL import Image
import importlib.util
import os

ENTRADAS = ("img/lia/lia-direitos.jpg", "img/lia/lia-direitos.jpeg")
SAIDA = "img/lia/lia-direitos-clara.png"

# Traco escuro. Abaixo de 180 e linha; entre 180 e 232 e o sombreado do
# miolo, que precisa sumir para a Lia ficar so no contorno, como o avatar.
LIMIAR_TRACO = 200

# Abaixo disso a tinta do traco e solida; entre o joelho e o limiar fica
# so a borda suave da linha.
JOELHO_TRACO = 150

# Traco claro do banner da AcolherIA (banner-lia.png): 98% do traco dele.
LILAC_CLARO = (0xF0, 0xE2, 0xFF)

# Densidade minima para uma faixa contar como parte da figura, em fracao
# do pico. Lateral e vertical sao diferentes porque as medidas da arte
# sao diferentes:
#
#   coluna  moldura: 8% a 14%      |  Lia: 24% a 100%   -> corta em 20%
#   linha   borda do papel: 1% e 5% |  base do martelo: 14% e 41% -> corta em 4%
#
# Um limiar so nao serviria: ou cortava a base do martelo junto com a
# moldura, ou deixava a moldura no quadro.
PICO_LATERAL = 0.20
PICO_VERTICAL = 0.04

# Respiro depois do corte. Lateral e minimo de proposito: com 32px a
# folga voltava a pegar o comeco da moldura, que e o que o corte existe
# para tirar. O traco tem 2 a 3px, entao 8px bastam.
FOLGA_LADO = 8
BLOCO = 32


def pixels(img):
    dados = img.get_flattened_data() if hasattr(img, "get_flattened_data") else img.getdata()
    return list(dados)


def medir_densidade(mascara, w, h):
    """Densidade de traco por faixa, em colunas e em linhas."""
    col = []
    for x in range(0, w - BLOCO + 1, BLOCO):
        n = 0
        for y in range(h):
            base = y * w
            for xx in range(x, x + BLOCO):
                if mascara[base + xx]:
                    n += 1
        col.append((x, n))

    lin = []
    for y in range(0, h - BLOCO + 1, BLOCO):
        n = 0
        for yy in range(y, y + BLOCO):
            base = yy * w
            for x in range(w):
                if mascara[base + x]:
                    n += 1
        lin.append((y, n))
    return col, lin


def caixa_da_figura(mascara, w, h):
    col, lin = medir_densidade(mascara, w, h)
    pico_c = max(n for _, n in col)
    pico_l = max(n for _, n in lin)
    if pico_c == 0 or pico_l == 0:
        raise SystemExit("  a arte esta em branco?")

    cols = [x for x, n in col if n >= pico_c * PICO_LATERAL]
    lins = [y for y, n in lin if n >= pico_l * PICO_VERTICAL]
    if not cols or not lins:
        raise SystemExit("  nao encontrei a figura — o limiar esta alto demais?")

    folga_v = max(BLOCO, int(min(w, h) * 0.02))
    return (max(0, cols[0] - BLOCO - FOLGA_LADO),
            max(0, lins[0] - folga_v),
            min(w, cols[-1] + BLOCO + FOLGA_LADO),
            min(h, lins[-1] + BLOCO + folga_v))


def gerar(origem, destino):
    img = Image.open(origem).convert("L")
    w, h = img.size
    cinza = pixels(img)

    # 1) Limpa o miolo. A luminancia vira alpha: papel e sombreado saem
    #    transparentes, e o que sobra e a linha com a borda suave.
    #
    #    O JOELHO importa mais que o limiar. Medido nesta arte, 69% do
    #    traco esta abaixo de 150 e a mediana e 111: a linha e feita de
    #    varios pixels, quase todos esafrados pela borda. Se o alpha
    #    subisse linearmente do limiar ate o pixel mais escuro, quase
    #    toda a tinta ficava com alpha baixo e a Lia aparecia fantasma —
    #    1,6% opaco, contra os 2,9% do avatar. Ate o joelho a tinta e
    #    solida, como no avatar; depois disso e a borda suave.
    brutos = [v for v in cinza if v < LIMIAR_TRACO]
    if len(brutos) < 200:
        raise SystemExit(f"  {origem}: quase sem traco (limiar {LIMIAR_TRACO}?).")

    def alfa(v):
        if v >= LIMIAR_TRACO:
            return 0
        if v <= JOELHO_TRACO:
            return 255
        a = int(255 * (LIMIAR_TRACO - v) / (LIMIAR_TRACO - JOELHO_TRACO))
        return 255 if a > 255 else a

    mascara = [v < LIMIAR_TRACO for v in cinza]
    cobertura_antes = 100.0 * sum(mascara) / len(mascara)

    # 2) Corta na figura, agora que o miolo nao atrapalha a medicao.
    esq, topo, dir_, baix = caixa_da_figura(mascara, w, h)
    area = (dir_ - esq) * (baix - topo)
    # conta primeiro, percentual depois: multiplied twice, dava 674%.
    dentro = sum(1 for y in range(topo, baix)
                for x in range(esq, dir_) if mascara[y * w + x])
    cobertura_depois = 100.0 * dentro / area

    # 3) Monta a arte final: contorno lilac, miolo transparente.
    saida = Image.new("RGBA", (dir_ - esq, baix - topo))
    dados = []
    for y in range(topo, baix):
        base = y * w
        for x in range(esq, dir_):
            a = alfa(cinza[base + x])
            dados.append((LILAC_CLARO[0], LILAC_CLARO[1], LILAC_CLARO[2], a))
    saida.putdata(dados)
    saida.save(destino, "PNG", optimize=True)

    opaco = sum(1 for d in dados if d[3] > 200)
    print(f"     {w}x{h} -> {dir_ - esq}x{baix - topo}")
    print(f"     traco na arte inteira: {cobertura_antes:.1f}%")
    print(f"     traco depois do corte: {cobertura_depois:.1f}%")
    print(f"     opaco na arte final: {100.0*opaco/len(dados):.1f}%"
          f"   (o avatar tem 2,9%)")
    return dir_ - esq, baix - topo


def main():
    print("Preparando a Lia de Direitos para o card\n")

    entrada = next((p for p in ENTRADAS if os.path.exists(p)), None)
    if entrada is None:
        raise SystemExit("  arte original nao encontrada: " + " ou ".join(ENTRADAS))
    if os.path.abspath(entrada) == os.path.abspath(SAIDA):
        raise SystemExit("  entrada e saida sao o mesmo arquivo.")

    print(f"  arte: {entrada}")
    print("\n  limpando o miolo, cortando na figura e trocando o pigmento")
    gerar(entrada, SAIDA)

    print(f"\n  pronta: {SAIDA}  ({os.path.getsize(SAIDA)/1024.0:.0f} KB)")
    print(f"  a original ({entrada}) continua no lugar.")


if __name__ == "__main__":
    main()
