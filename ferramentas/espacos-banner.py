"""
Insere os espacos para os banners do projeto.

Cada pagina recebe um ou dois blocos `<div class="espaco-banner">`
nas posicoes ja definidas na analise visual. Nao mexe em texto, em
botoes, em imagens nem em funcionalidade: o script so INSERE um
elemento antes de uma ancora que ja existe, e nunca Remove nada.

Se a ancora nao for encontrada, a pagina fica intacta e o script
avisa. Nada e adivinhado.

Para rodar de novo sem duplicar, cada bloco recebe data-espaco; um
espaco ja presente na pagina e pulado.
"""

import io
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# (arquivo, data-espaco, nome do espaco, caminho de fundo, tamanho, ancora)
ESPACOS = [
    ("inicio.html", "home-01", "Home / pertencimento",
     "/img/ilustracoes/A CADEIRA VAZIA.png", "grande", "explore-highlights"),
    ("inicio.html", "home-02", "Home / transicao",
     "/img/ilustracoes/A LINHA QUE CONECTA.png", "largo", "blog-highlights-section"),

    ("index.html", "landing-01", "Landing / entre a apresentacao e os numeros",
     "/img/ilustracoes/A PAUSA VISUAL.jpg", "grande", "landing-stats-band"),

    ("Explorar/Explorar.html", "explorar-01", "Explorar / antes dos topicos",
     "/img/ilustracoes/A ESTANTE DAS POSSIBILIDADES.jpg", "grande", "explore-intro"),

    ("Recursos/recursos.html", "artigos-01", "Artigos / entre texto de fora e da casa",
     "/img/ilustracoes/AS DUAS MÃOS.jpg", "grande", "recursos-section recursos-section--alt"),
    ("Recursos/recursos.html", "artigos-02", "Artigos / antes das categorias",
     "/img/ilustracoes/DIVISÓRIAS DE CONHECIMENTO.jpg", "largo", "recursos-newsletter"),

    ("blog/blog.html", "blog-01", "Blog / antes do grid",
     "/img/ilustracoes/A FOLHA ESCRITA.jpg", "grande", "blog-grid-section"),

    ("Direitos/direitos.html", "direitos-01", "Direitos / antes das leis",
     "/img/ilustracoes/OS SEIS SÍMBOLOS DOS DIREITOS.jpg", "grande", "laws-section"),
    ("Direitos/direitos.html", "direitos-02", "Direitos / depois das leis",
     "/img/ilustracoes/A MARCA &quot;VALIDAR&quot;.jpg", "largo", "sources-banner"),

    ("apoiar/apoiar.html", "apoiar-01", "Apoiar / entre impacto e depoimentos",
     "/img/ilustracoes/CAMINHO DOS RECURSOS.jpg", "largo", "carousel-triple-section"),
]

TPL = """
        <!-- ESPAÇO PARA BANNER — {nome}
             data-espaco identifica este lugar de forma estável.
             Quando a arte entrar, troque por <img> ou marque o bloco
             com .espaco-banner--preenchido. -->
        <div class="espaco-banner espaco-banner--{tam}" data-espaco="{chave}"
             data-fundo="{fundo}">
            <span class="espaco-banner__marca">
                <i class="fa-solid fa-image" aria-hidden="true"></i>
                espaço para banner
            </span>
            <span class="espaco-banner__nome">{nome}</span>
            <span class="espaco-banner__fundo">{fundo}</span>
        </div>
"""


def inserir(caminho_rel, chave, nome, fundo, tam, ancora):
    caminho = os.path.join(RAIZ, caminho_rel.replace("/", os.sep))
    if not os.path.exists(caminho):
        return "arquivo ausente"

    with io.open(caminho, encoding="utf-8") as f:
        html = f.read()

    if 'data-espaco="%s"' % chave in html:
        return "ja existe"

    # A ancora precisa ser uma <section ... class="... ancora ...">.
    m = re.search(r'<section[^>]*class="([^"]*\b%s\b[^"]*)"' % re.escape(ancora), html)
    if not m:
        return "ANCORA NAO ENCONTRADA"

    bloco = TPL.format(nome=nome, tam=tam, chave=chave, fundo=fundo)
    novo = html[:m.start()] + bloco + html[m.start():]

    with io.open(caminho, "w", encoding="utf-8", newline="") as f:
        f.write(novo)
    return "inserido"


def main():
    print("Inserindo os espacos para banners\n")

    # o CSS entra uma vez por pagina
    css = '    <link rel="stylesheet" href="/espacos-banner.css">'
    ligadas = []

    for rel, chave, nome, fundo, tam, ancora in ESPACOS:
        caminho = os.path.join(RAIZ, rel.replace("/", os.sep))
        with io.open(caminho, encoding="utf-8") as f:
            html = f.read()

        if css.strip() not in html:
            m = re.search(r'[ \t]*<link rel="stylesheet"[^>]*>', html)
            if m:
                html = html[:m.end()] + "\n" + css + html[m.end():]
                with io.open(caminho, "w", encoding="utf-8", newline="") as f:
                    f.write(html)
                ligadas.append(rel)

        r = inserir(rel, chave, nome, fundo, tam, ancora)
        print("  %-34s %-14s %s" % (rel, chave, r))

    print()
    if ligadas:
        print("  CSS ligado em: " + ", ".join(sorted(set(ligadas))))
    return 0


if __name__ == "__main__":
    sys.exit(main())