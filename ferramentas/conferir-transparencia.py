"""Confere, ponto a ponto, se a moldura ficou transparente no meio.

Confiar na imagem aberta "parece" certain porque fundo transparente
tambem e desenhado em branco. So o numero do canal alfa separa as duas
coisas: e ele que decide se a foto do avatar aparece por baixo.
"""
from pathlib import Path
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ARQ = RAIZ / "img" / "molduras" / "moldura-gatinho-teste.png"

im = Image.open(ARQ).convert("RGBA")
w, h = im.size
px = im.load()

print(f"\n  {ARQ.name}: {w}x{h}\n")

print("  dentro do circulo (tem de ser transparente):")
for nome, x, y in [
    ("centro", w // 2, h // 2),
    ("centro esq", w // 2 - 60, h // 2),
    ("centro dir", w // 2 + 70, h // 2),
    ("meio cima", w // 2, h // 2 - 80),
    ("meio baixo", w // 2, h // 2 + 90),
]:
    r, g, b, a = px[x, y]
    print(f"    {nome:<12} rgb=({r:3},{g:3},{b:3})  alfa={a:3}  {'ok' if a == 0 else 'OPACO'}")

print("\n  na arte (tem de ser opaco):")
for nome, x, y in [
    ("anel topo", w // 2, 40),
    ("orelha esq", 80, 40),
    ("bigode dir", w - 25, h // 2),
]:
    r, g, b, a = px[x, y]
    print(f"    {nome:<12} rgb=({r:3},{g:3},{b:3})  alfa={a:3}  {'ok' if a > 200 else 'PERDIDO'}")

transparentes = sum(1 for y in range(0, h, 4) for x in range(0, w, 4) if px[x, y][3] == 0)
total = len(range(0, h, 4)) * len(range(0, w, 4))
print(f"\n  {transparentes * 100.0 / total:.1f}% transparente (amostra a cada 4px)")
print()
