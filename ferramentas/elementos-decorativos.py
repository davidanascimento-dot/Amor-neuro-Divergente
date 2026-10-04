"""
Insere os elementos decorativos recorrentes nas secoes visualmente
secas do site.

POR QUE UM SCRIPT E NAO EDICAO MANUAL
-------------------------------------
O mesmo elemento vai aparecer em dezenas de paginas. Editar cada uma
a mao garantiria que a proxima pagina nova nascesse sem ele. Aqui o mapa
vive em um lugar so: para mudar a distribuicao, muda-se a lista
MAPA abaixo e roda-se de novo.

O QUE O SCRIPT SE RECUSA A FAZER
--------------------------------
* Inserir em secao que ja tem <img>  -> regra do briefing: nao
  decorar o que ja esta funcionando.
* Inserir duas vezes na mesma secao -> a lista tem chave unica.
* Inserir o mesmo tipo em duas secoes seguida -> verificado.
* Inserir onde a ancora nao existe   -> a pagina fica intacta.

Nenhum texto, botao, link, imagem ou funcionalidade e tocado. O
script INSERE um <span> decorativo e acrescenta uma classe. Nunca
remove nada.

Para rodar de novo sem duplicar, cada secao recebe a classe
`deco-hospedeiro`; uma secao que ja a tem e pulada.
"""

import io
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CSS = "elementos-decorativos.css"
LINK = '    <link rel="stylesheet" href="/%s">' % CSS

# (pagina, secao, tipo, posicao, tamanho, rotacao)
#
# "posicao" sao os modificadores de borda. "tamanho" e "rotacao" vao
# em variaveis de estilo inline, para que a distribuicao possa ter
# duas nuvens de tamanhos diferentes sem precisar de outra classe.
#
# A ordem de cada pagina segue a ordem das secoes no HTML, e nenhum
# tipo se repete em secoes consecutivas.
MAPA = [
    # ---------------- EXPLORAR ----------------
    # A intro e um h2 que so diz "clique abaixo". Uma forma organica
    # discreta na lateral tira o aspecto de placeholder sem competir.
    ("Explorar/Explorar.html", "explore-intro", "organicas",
     "esq base s2", "88px", "-6deg"),
    # O FAQ tem 210 palavras e zero imagem. A nuvem entra pelo alto
    # da direita, longe das perguntas.
    ("Explorar/Explorar.html", "faq-section", "nuvem",
     "dir topo s2", "124px", "-7deg"),

    # ---------------- DIREITOS ----------------
    ("Direitos/direitos.html", "rights-intro", "nuvem",
     "esq topo s2", "120px", "-8deg"),
    # Coracao na lei: e o conteudo que mais diz "acolhimento" do site.
    ("Direitos/direitos.html", "laws-section", "coracao",
     "esq topo s1", "46px", "-11deg"),
    ("Direitos/direitos.html", "sources-banner", "organicas",
     "dir base s2", "80px", "8deg"),
    ("Direitos/direitos.html", "resources-section", "nuvem",
     "dir topo s2", "112px", "6deg"),
    # 232 palavras de FAQ. A forma organica e a menor das tres, entao
    # e a que menos pesa visualmente ao lado de tanto texto.
    ("Direitos/direitos.html", "rights-faq", "organicas",
     "esq base s3", "86px", "-5deg"),
    ("Direitos/direitos.html", "rights-contact", "coracao",
     "dir topo s1", "50px", "9deg"),

    # ---------------- INICIO ----------------
    # mission-section e whoweare-section tem imagem: nao entram.
    ("inicio.html", "rights-quick-section", "nuvem",
     "dir topo s2", "118px", "-7deg"),
    # community-card NAO entra: no inicio.html essa <section> nunca e
    # fechada (10 abrem, 9 fecham), entao o casamento de chaves nao
    # acha a borda dela e o script se recusa a inserir. Nao e um
    # problema do script — e o HTML. Corrigir o fechamento e uma
    # decisao separada.
    #
    # acolheria-banner-section NAO entra: e a secao da Lia, e o cliente
    # vai fazer uma arte especifica para cada banner dela. Nao se mexe.

    # ---------------- ARTIGOS ----------------
    # recursos-section--alt nao entra: tem 4 imagens (1 local e 3 do
    # Unsplash). Nao se decora o que ja esta funcionando.
    ("Recursos/recursos.html", "recursos-newsletter", "nuvem",
     "dir topo s2", "108px", "6deg"),

    # ---------------- APOIAR ----------------
    ("apoiar/apoiar.html", "donation-hero", "nuvem",
     "esq topo s2", "126px", "-8deg"),
    # Formulario: no maximo 1 elemento, e fora da area dos campos.
    ("apoiar/apoiar.html", "donation-form-section", "organicas",
     "dir topo s2", "78px", "8deg"),
    ("apoiar/apoiar.html", "transparency-section", "coracao",
     "dir base s2", "46px", "10deg"),

    # ---------------- LANDING ----------------
    # Pagina longa (12 secoes). O limite do briefing e 5 a 8; aqui
    # entram 4, e apenas nas secoes de conteudo — nunca dentro de
    # card, grade ou carrossel.
    ("index.html", "landing-stats-band", "nuvem",
     "dir topo s2", "104px", "-6deg"),
    # landing-believe tem imagem, entao nao entra. Escolhidas as secoes
    # de conteudo que nao tem imagem nenhuma.
    ("index.html", "landing-steps", "organicas",
     "esq topo s2", "78px", "-7deg"),
    ("index.html", "landing-stories", "coracao",
     "esq base s3", "50px", "9deg"),
    ("index.html", "landing-cta-section", "nuvem",
     "dir base s2", "110px", "7deg"),

    # ---------------- BLOG ----------------
    ("blog/blog.html", "blog-newsletter", "nuvem",
     "dir topo s2", "100px", "6deg"),

    # ---------------- EVENTOS ----------------
    ("Recursos/eventos.html", "categories-section", "organicas",
     "dir base s2", "76px", "8deg"),

    # ---------------- LOJA ----------------
    # banner-carousel-container tem 5 banners dentro. A regra para
    # banner e "no maximo 2, preferencialmente nas extremidades" —
    # este e o unico banner da pagina, entao leva 1 so.
    ("loja/loja.html", "banner-carousel-container", "nuvem",
     "esq topo s2", "96px", "-7deg"),
]

TPL = ('\n        <!-- elemento decorativo: {tipo}. Nao recebe foco, nao e '
       'clicavel, nao entra na ordem de leitura. -->\n'
       '        <span class="deco deco--{tipo} {pos}"\n'
       '              style="--tam: {tam}; --rot: {rot}" aria-hidden="true"></span>')


def classes_de_posicao(pos):
    """'esq topo s2' -> 'deco--esq deco--topo deco--s2'

    O prefixo precisa ser aplicado a CADA modificador, nao so ao
    primeiro. Sem isso as classes saem como `deco--esq topo s2`, e
    `.deco--topo` / `.deco--s2` nunca existem — o elemento fica no
    recuo padrao de 16 px e ignora o `--s2`.
    """
    return " ".join("deco--" + p for p in pos.split())


def secao(html, classe):
    """(inicio_do_tag, fim_do_tag, corpo) da <section class="...classe...">."""
    m = re.search(r'<section\b[^>]*class="([^"]*\b%s\b[^"]*)"[^>]*>' % re.escape(classe), html)
    if not m:
        return None
    ini, tag_fim = m.start(), m.end()
    prof, k = 1, tag_fim
    while prof > 0:
        ab = re.compile(r"<section\b").search(html, k)
        fe = re.compile(r"</section>").search(html, k)
        if fe is None:
            return None
        if ab and ab.start() < fe.start():
            prof += 1
            k = ab.end()
        else:
            prof -= 1
            k = fe.end()
    return ini, tag_fim, k, m


def ligar_css(html):
    if LINK.strip() in html:
        return html, False
    m = re.search(r'[ \t]*<link rel="stylesheet"[^>]*>', html)
    if not m:
        return html, False
    return html[:m.end()] + "\n" + LINK + html[m.end():], True


def main():
    # ---- trava 1: nenhum tipo repetido em secoes consecutivas ----
    por_pagina = {}
    for pag, cls, tipo, pos, tam, rot in MAPA:
        por_pagina.setdefault(pag, []).append((cls, tipo))
    for pag, itens in por_pagina.items():
        for a, b in zip(itens, itens[1:]):
            if a[1] == b[1]:
                print("ABORTO: %s tem '%s' em %s e %s seguidas"
                      % (pag, a[1], a[0], b[0]))
                return 1

    # ---- trava 2: a secao tem de existir e estar sem imagem ----
    cache = {}
    plano = []
    for pag, cls, tipo, pos, tam, rot in MAPA:
        caminho = os.path.join(RAIZ, pag.replace("/", os.sep))
        if not os.path.exists(caminho):
            print("  %-30s %-28s arquivo ausente" % (pag, cls))
            continue
        if pag not in cache:
            cache[pag] = io.open(caminho, encoding="utf-8").read()
        html = cache[pag]
        achado = secao(html, cls)
        if not achado:
            print("  %-30s %-28s SECAO NAO ENCONTRADA" % (pag, cls))
            continue
        ini, tag_fim, corpo_fim, m = achado
        tag = html[ini:tag_fim]
        corpo = html[tag_fim:corpo_fim]
        if re.search(r'<img\b', corpo):
            print("  %-30s %-28s tem imagem, pulada" % (pag, cls))
            continue
        if "deco-hospedeiro" in tag:
            print("  %-30s %-28s ja tem elemento" % (pag, cls))
            continue
        plano.append((pag, caminho, html, ini, tag_fim, tag, cls, tipo, pos, tam, rot))

    # ---- aplica de tras para frente, para os offsets nao se deslocarem ----
    por_arq = {}
    for item in plano:
        por_arq.setdefault(item[1], []).append(item)

    aplicadas, css_ligadas = 0, set()
    for caminho, itens in por_arq.items():
        html = cache[os.path.relpath(caminho, RAIZ).replace(os.sep, "/")]
        for item in sorted(itens, key=lambda x: -x[3]):
            _, _, _, ini, tag_fim, tag, cls, tipo, pos, tam, rot = item
            tag_nova = tag.replace('class="', 'class="deco-hospedeiro ', 1)
            bloco = TPL.format(tipo=tipo, pos=classes_de_posicao(pos),
                               tam=tam, rot=rot)
            html = html[:ini] + tag_nova + bloco + html[tag_fim:]
            aplicadas += 1
        html, mudou = ligar_css(html)
        if mudou:
            css_ligadas.add(os.path.relpath(caminho, RAIZ).replace(os.sep, "/"))
        io.open(caminho, "w", encoding="utf-8", newline="").write(html)

    print()
    print("  %d elemento(s) inserido(s) em %d pagina(s)" % (aplicadas, len(por_arq)))
    if css_ligadas:
        print("  CSS ligado em: %s" % ", ".join(sorted(css_ligadas)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
