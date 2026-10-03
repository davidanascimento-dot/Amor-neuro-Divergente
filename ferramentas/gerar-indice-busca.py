"""
Gera o indice de busca do site a partir das paginas reais.

Nao escrevi titulo nem descricao no olho: tudo e extraido do arquivo.
Assim o indice nunca fica errado em relacao a pagina que ele indexa.

O que entra em cada registro:
  url         caminho real, com a caixa verdadeira da pasta
  titulo      <title> sem o sufixo "- Amor NeuroDivergente"
  h1          o titulo principal da pagina, quando existe e e diferente
  descricao   <meta name="description">, ou o primeiro paragrafo real
  secoes      os <h2> e <h3>, que viram termos de busca
  categoria   o agrupamento usado na interface

Uso: python ferramentas/gerar-indice-busca.py
"""

import json
import os
import re
import unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Paginas fora do alcance da busca.
#
# A administracao foi excluida de proposito, e nao so agrupada: essas
# paginas carregam o VLibras e o UserWay, entao "acessibilidade", "libras"
# e "teclado" casavam nelas — e a busca devolvia "Admin · Grupos" para
# quem queria a secao de acessibilidade do site. Um resultado de busca
# que aponta para o painel da loja e pior do que nao ter resultado.
ARQUIVOS_IGNORADOS = ("hacker-trap.html", "talentos.html", "painel.html")
PREFIXOS_IGNORADOS = ("configurações/", "painel-admin/")

CATEGORIAS = [
    (r"^comunidade/", "Comunidade", "Publicações, grupos e conversas"),
    (r"^(inicio|index)\.html", "Início", "A porta de entrada do site"),
    (r"^chat-Ia/", "AcolherIA", "Conversa com a Lia"),
    (r"^Direitos/", "Direitos", "Leis, benefícios e caminhos"),
    (r"^Explorar/", "Conteúdos", "Descoberta de material"),
    (r"^Recursos/", "Conteúdos", "Guias e artigos"),
    (r"^blog/", "Conteúdos", "Histórias e publicações"),
    (r"^loja/", "Loja", "Produtos e apoios"),
    (r"^apoiar/", "Apoiar", "Doações e transparência"),
    (r"^login/", "Conta", "Entrar e recuperar senha"),
    (r"^(privacidade|termos)\.html", "Institucional", "Políticas do site"),
]


def limpar(texto):
    # Aceita tanto string quanto o objeto de re.search, para não repetir
    # ".group(1)" em cada chamada.
    if texto is None:
        return ""
    if hasattr(texto, "group"):
        texto = texto.group(1)
    texto = re.sub(r"<[^>]+>", " ", texto or "")
    texto = texto.replace("&nbsp;", " ").replace("&amp;", "&")
    texto = texto.replace("&quot;", '"').replace("&#39;", "'")
    return re.sub(r"\s+", " ", texto).strip()


def sem_acento(texto):
    return "".join(
        c for c in unicodedata.normalize("NFD", texto or "")
        if unicodedata.category(c) != "Mn"
    )


def categoria_de(caminho):
    for padrao, nome, resumo in CATEGORIAS:
        if re.match(padrao, caminho):
            return nome, resumo
    return "Outros", "Outras páginas"


def extrair(caminho_rel):
    caminho_abs = os.path.join(RAIZ, caminho_rel.replace("/", os.sep))
    with open(caminho_abs, encoding="utf-8", errors="replace") as f:
        html = f.read()

    titulo = limpar(re.search(r"(?is)<title[^>]*>(.*?)</title>", html))
    # O sufixo usa travessão (—), não hífen. Sem esta tolerância o índice
    # mostrava "Login — Amor NeuroDivergente" em toda página.
    titulo = re.sub(r"\s*[—–-]\s*Amor\s+Neuro\s*Divergente\s*$", "", titulo).strip()
    titulo = re.sub(r"\s*\|\s*Amor NeuroDivergente\s*$", "", titulo).strip()

    m_h1 = re.search(r"(?is)<h1[^>]*>(.*?)</h1>", html)
    h1 = limpar(m_h1.group(1)) if m_h1 else ""
    if h1.lower() == titulo.lower():
        h1 = ""

    m_desc = re.search(r'(?is)<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']', html)
    if not m_desc:
        m_desc = re.search(r'(?is)<meta[^>]+content=["\'](.*?)["\'][^>]+name=["\']description["\']', html)
    descricao = limpar(m_desc.group(1)) if m_desc else ""

    if not descricao:
        for p in re.findall(r"(?is)<p[^>]*>(.*?)</p>", html):
            limpa = limpar(p)
            # Um parágrafo de menu não serve de descrição.
            if len(limpa) > 60 and "fa-solid" not in limpa:
                descricao = limpa
                break
    if len(descricao) > 190:
        descricao = descricao[:187].rstrip() + "..."

    secoes = []
    for m in re.finditer(r"(?is)<h([23])[^>]*>(.*?)</h\1>", html):
        s = limpar(m.group(2))
        if 3 < len(s) < 70 and s not in secoes:
            secoes.append(s)
        if len(secoes) >= 14:
            break

    categoria, resumo = categoria_de(caminho_rel)

    # O breadcrumb é a única parte do HTML que distingue as páginas de
    # neurodivergência umas das outras: título, H1, meta description e
    # seções são o mesmo texto nas cinco. Sem ele, o índice descreveria
    # "Dislexia e Outras Dificuldades de Aprendizagem" com a frase do
    # artigo, que é sobre autismo.
    m_bc = re.search(r'(?is)<nav class="breadcrumb-nav".*?</nav>', html)
    migalha = ""
    if m_bc:
        for pedaco in re.findall(r"(?is)<span[^>]*>(.*?)</span>", m_bc.group(0)):
            p = limpar(pedaco)
            if p and p.lower() not in ("início", "inicio", "explorar", "artigos e guias"):
                migalha = p
                break

    # Um pagina "Compreendendo o Espectro Autista" repetida em cinco
    # arquivos de neurodivergencia diferentes não ajuda ninguém a buscar.
    # A palavra que diferencia (TDAH, dislexia...) entra como termo.
    return {
        "url": "/" + caminho_rel.replace(os.sep, "/"),
        "titulo": titulo,
        "h1": h1,
        "descricao": descricao,
        "secoes": secoes,
        "categoria": categoria,
        "resumo": resumo,
        "migalha": migalha,
    }


def main():
    paginas = []
    for base, pastas, arquivos in os.walk(RAIZ):
        pastas[:] = [p for p in pastas if p not in ("dist", "node_modules", ".git", "img", "ferramentas")]
        for nome in arquivos:
            if not nome.lower().endswith(".html"):
                continue
            if nome in ARQUIVOS_IGNORADOS:
                continue
            rel = os.path.relpath(os.path.join(base, nome), RAIZ).replace(os.sep, "/")
            if rel.startswith(PREFIXOS_IGNORADOS):
                continue
            if (os.path.getsize(os.path.join(base, nome)) or 0) == 0:
                print(f"  ignorada (vazia): {rel}")
                continue
            paginas.append(extrair(rel))

    paginas.sort(key=lambda p: (p["categoria"], p["titulo"]))

    # Cinco arquivos em Recursos/autismo/ declaram o mesmo <title>:
    # "Compreendendo o Espectro Autista". A página de dislexia aparece
    # com o nome do TDAH, e a busca fica inútil justamente para o
    # conteúdo de neurodivergência — que e o coracao do site.
    #
    # Aqui não se arruma a página (isso é outro trabalho); usa-se a
    # palavra do breadcrumb — "Dislexia e Outras Dificuldades", "Saúde
    # Mental" — para diferenciar o resultado. Quem busca "dislexia" acha
    # a página de dislexia.
    repetidos = {}
    for p in paginas:
        chave = sem_acento(p["titulo"]).lower()
        repetidos.setdefault(chave, []).append(p)

    for chave, grupo in repetidos.items():
        if len(grupo) < 2:
            continue
        for p in grupo:
            # A breadcrumb é melhor que o nome do arquivo: "Dislexia e
            # Outras Dificuldades de Aprendizagem" diz mais que "dislexia".
            palavra = p.get("migalha") or ""
            if not palavra:
                nome = os.path.splitext(os.path.basename(p["url"]))[0]
                palavra = re.sub(r"[^\w\s-]", " ", nome)
                palavra = re.sub(r"\s+", " ", palavra.replace("_", " ")).strip()
            if palavra and sem_acento(palavra).lower() not in chave:
                p["titulo"] = f"{p['titulo']} — {palavra}"
                p["secoes"] = p["secoes"] + [palavra]
                # A descrição original é o texto do artigo, idêntico nas
                # cinco. Repetir isso embaixo de "Dislexia" seria pior do
                # que não descrever: a pessoa leria sobre autismo numa
                # página que pediu dislexia. A página do próprio autismo
                # mantém a descrição, que ali está correta.
                if "autismo" not in sem_acento(palavra).lower():
                    p["descricao"] = (
                        f"Artigo em {palavra}. O texto desta página ainda "
                        "é o do artigo sobre autismo."
                    )

    destino = os.path.join(RAIZ, "busca-indice.js")
    with open(destino, "w", encoding="utf-8") as f:
        f.write("/**\n")
        f.write(" * busca-indice.js — gerado por ferramentas/gerar-indice-busca.py\n")
        f.write(" *\n")
        f.write(" * Não edite à mão. Para mudar o índice, mude a página e rode:\n")
        f.write(" *     python ferramentas/gerar-indice-busca.py\n")
        f.write(" *\n")
        f.write(f" * {len(paginas)} páginas.\n")
        f.write(" */\n")
        f.write("window.BUSCA_INDICE = ")
        json.dump(paginas, f, ensure_ascii=False, indent=4)
        f.write(";\n")

    kb = os.path.getsize(destino) / 1024.0
    print(f"\n  {len(paginas)} páginas -> busca-indice.js ({kb:.0f} KB)\n")
    for p in paginas:
        print(f"    {p['categoria']:<15} {p['titulo'][:46]}")


if __name__ == "__main__":
    main()
