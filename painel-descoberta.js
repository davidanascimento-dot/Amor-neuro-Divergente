/* ============================================================================
   PAINEL DE DESCOBERTA — cartao compacto, no canto inferior direito
   ============================================================================
   Um cartao pequeno que deixa a pagina inteira visivel. Nao abre modal e nao
   escurece o fundo: a pessoa continua lendo o site enquanto a sugestao esta na
   tela. A rotacao comeca sozinha e para quando a aba vai para segundo
   plano. Ha um controle de voltar e o contador.

   O sorteio usa uma semente guardada no navegador: a pessoa ve sempre os
   mesmos itens, e nao tres novos a cada recarga. Outro visitante recebe outros
   — e ai que esta a descoberta.

   O que aparece vem de fontes que ja existiam:
     window.CONTEUDO_SITE  (conteudo-site.js)   blog, recursos, eventos
     window.LEIS           (leis-dados.js)      os direitos
   Na home so entra CONTEUDO_SITE: o leis-dados.js tem 122 KB e nao justifica
   ser baixado por causa de um cartao. A categoria Direitos liga quando este
   mesmo arquivo roda numa pagina que ja tem a biblioteca carregada.

   Nao ha autor, nem tempo de leitura, nem newsletter: o site nunca registrou
   esses tres, e inventar dado foi a regra deste trabalho.
   ============================================================================ */
(function () {
    "use strict";

    const CHAVE_SEMENTE = "pd:semente";
    const CHAVE_VISTO = "pd:visto";
    const CHAVE_FECHADO = "pd:fechado";
    const ABRE_EM_MS = 8000;          // aparece 8s depois de a home carregar
    const TROCA_EM_MS = 9000;         // tempo de cada sugestao antes da proxima
    const SILENCIO_MS = 24 * 60 * 60 * 1000;
    const MAX_ITENS = 6;              // quantos entram na rotacao

    // ---------- sorteio estavel ----------
    function semente() {
        let s = null;
        try { s = localStorage.getItem(CHAVE_SEMENTE); } catch (e) { /* modo privado */ }
        if (!s) {
            s = String(Math.floor(Math.random() * 1e9));
            try { localStorage.setItem(CHAVE_SEMENTE, s); } catch (e) { /* ignora */ }
        }
        return s;
    }
    // PRNG semeado: mesma semente, mesma sequencia, em qualquer navegador.
    function rand(seed) {
        let a = 0;
        for (let i = 0; i < seed.length; i++) a = (a * 31 + seed.charCodeAt(i)) >>> 0;
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    function sortear(lista, quantos, seed) {
        const r = rand(seed);
        const copia = lista.slice();
        for (let i = copia.length - 1; i > 0; i--) {
            const j = Math.floor(r() * (i + 1));
            const t = copia[i]; copia[i] = copia[j]; copia[j] = t;
        }
        return copia.slice(0, quantos);
    }

    function escapar(s) {
        const d = document.createElement("div");
        d.textContent = s == null ? "" : String(s);
        return d.innerHTML;
    }

    // ---------- candidatos: so o que existe de verdade ----------
    function candidatos() {
        const lista = [];
        const C = window.CONTEUDO_SITE || {};

        (C.recursos || []).forEach(function (r) {
            lista.push({
                tipo: "Recurso", titulo: r.titulo, imagem: r.imagem,
                resumo: r.descricao,
                url: r.url, externo: /^https?:\/\//.test(r.url || "")
            });
        });
        (C.blog || []).forEach(function (b) {
            lista.push({ tipo: "Artigo", titulo: b.titulo, imagem: b.imagem, resumo: b.resumo, url: b.url });
        });
        (C.eventos || []).forEach(function (e) {
            /* O url do evento no dado e o botao "Quero participar", que aponta
               para a mesma pagina de contato nos quatro. O evento vive na
               pagina de eventos: e para la que o link honesto leva. */
            lista.push({ tipo: "Evento", titulo: e.titulo, imagem: e.imagem, resumo: e.descricao, url: "/Recursos/eventos.html" });
        });

        // Os direitos entram so os que tem artigo conferido: um card vazio
        // pareceria completo.
        ((window.LEIS || [])).filter(function (l) { return l.artigos && l.artigos.length; })
            .forEach(function (l) {
                lista.push({
                    tipo: "Direitos",
                    titulo: l.nomePopular || l.nomeOficial,
                    imagem: null,
                    resumo: l.resumo,
                    url: "/Direitos/direitos.html#leis"
                });
            });

        /* Remove repeticao, com duas regras diferentes.
         *
         * 1. O MESMO ITEM: mesma url e mesmo titulo. Cai fora.
         *
         * 2. A MESMA PAGINA com rotulos diferentes: no blog e nos recursos,
         *    cinco cartoes apontam para /Recursos/autismo/....html — uma vez
         *    como "Artigo" e outra como "Recurso". Mostra-se so um, o de maior
         *    prioridade na ordem acima. Sem isso a pessoa ve o mesmo link duas
         *    vezes e conclui que sao paginas diferentes.
         *
         * Nao se aplica a regra 2 quando os itens sao do mesmo tipo e tem
         * titulos diferentes: os quatro eventos vivem em /Recursos/eventos.html
         * e sao quatro eventos distintos. */
        const exatos = {}, semRepeticao = [];
        lista.forEach(function (x) {
            if (!x.titulo || !x.url) return;
            const chave = x.url + "|" + x.titulo;
            if (exatos[chave]) return;
            exatos[chave] = true;
            semRepeticao.push(x);
        });
        const porPagina = {}, unicos = [];
        semRepeticao.forEach(function (x) {
            const anterior = porPagina[x.url];
            if (!anterior) { porPagina[x.url] = x; unicos.push(x); return; }
            if (anterior.tipo === x.tipo) unicos.push(x);
        });
        return unicos;
    }

    // ---------- montagem ----------
    function construir(itens) {
        const raiz = document.createElement("aside");
        raiz.className = "pd-canto";
        raiz.id = "pdCanto";
        raiz.setAttribute("aria-label", "Sugestoes de conteudo do site");
        raiz.hidden = true;
        raiz.innerHTML =
            '<div class="pd-cartao">' +
                '<button class="pd-fechar" type="button" aria-label="Dispensar as sugestoes">' +
                    '<i class="fa-solid fa-xmark" aria-hidden="true"></i>' +
                "</button>" +
                '<span class="pd-rotulo">Destaques para você</span>' +
                '<div class="pd-item" id="pdItem"></div>' +
                '<a class="pd-vermais" id="pdVerMais" href="/Explorar/Explorar.html">' +
                    'VER MAIS <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>' +
                "</a>" +
                '<div class="pd-controles">' +
                    '<button class="pd-btn pd-btn--ant" type="button" aria-label="Sugestao anterior">' +
                        '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i>' +
                    "</button>" +
                    '<span class="pd-contagem" id="pdContagem" aria-live="polite"></span>' +
                "</div>" +
            "</div>";
        document.body.appendChild(raiz);
        return raiz;
    }

    function pintar(raiz, item) {
        /* A reserva da imagem existe porque foto de terceiro falha. Sem ela, um
         * 404 deixa um retangulo vazio e o cartao parece quebrado.
         *
         * O handler e ligado por addEventListener depois do render em vez de
         * onerror no atributo: as aspas do HTML inline nunca fecham direito
         * quando a imagem vem de um endereco com acento ou espaco. */
        const reserva = "<span class='pd-thumb pd-thumb--vazia' aria-hidden='true'><i class='fa-solid fa-scale-balanced'></i></span>";
        const celula = raiz.querySelector("#pdItem");
        celula.innerHTML =
            '<span class="pd-info">' +
                '<span class="pd-titulo">' + escapar(item.titulo) + "</span>" +
                (item.resumo ? '<span class="pd-resumo">' + escapar(item.resumo) + "</span>" : "") +
                '<span class="pd-tipo">' + escapar(item.tipo) + "</span>" +
            "</span>";

        const img = document.createElement("img");
        img.className = "pd-thumb";
        img.alt = item.titulo;
        img.loading = "lazy";
        img.decoding = "async";
        img.addEventListener("error", function () {
            img.replaceWith(document.createRange().createContextualFragment(reserva));
        });
        img.src = item.imagem;
        celula.insertBefore(img, celula.firstChild);

        const v = raiz.querySelector("#pdVerMais");
        v.setAttribute("href", item.url);
        if (item.externo) { v.setAttribute("target", "_blank"); v.setAttribute("rel", "noopener"); }
        else { v.removeAttribute("target"); v.removeAttribute("rel"); }
    }

    // ---------- rotacao ----------
    function iniciar() {
        if (document.getElementById("pdCanto")) return;
        const pool = candidatos();
        if (!pool.length) return;                       // sem dado real, nao mostra

        const itens = sortear(pool, Math.min(MAX_ITENS, pool.length), semente());
        const raiz = construir(itens);
        let indice = 0;
        let timer = null;
        let rodando = true;

        function mostrar(i) {
            indice = (i + itens.length) % itens.length;
            pintar(raiz, itens[indice]);
            raiz.querySelector("#pdContagem").textContent = (indice + 1) + " / " + itens.length;
        }
        function parar() {
            rodando = false;
            if (timer) { clearInterval(timer); timer = null; }
            /* Nao mexe no botao de pausa aqui: ele saiu do cartao. Mexer
             * deixaria um null.setAttribute e quebraria justamente quando a
             * pessoa clicasse em voltar. */
        }

        function comecar() {
            if (!rodando) return;
            if (timer) clearInterval(timer);
            timer = setInterval(function () { mostrar(indice + 1); }, TROCA_EM_MS);
        }

        function dispensar() {
            parar();
            raiz.hidden = true;
            try { localStorage.setItem(CHAVE_FECHADO, String(Date.now())); } catch (e) { /* ignora */ }
        }

        mostrar(0);

        raiz.querySelector(".pd-btn--ant").addEventListener("click", function () {
            parar();
            mostrar(indice - 1);
        });
        raiz.querySelector(".pd-fechar").addEventListener("click", dispensar);

        // A rotacao para quando a aba vai para segundo plano: nao adianta
        // trocar de sugestao em uma aba que ninguem esta vendo.
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) { if (timer) { clearInterval(timer); timer = null; } }
            else if (rodando) comecar();
        });

        function jaDispensou() {
            try {
                const t = Number(localStorage.getItem(CHAVE_FECHADO) || 0);
                return t > 0 && (Date.now() - t) < SILENCIO_MS;
            } catch (e) { return false; }
        }

        if (!jaDispensou()) {
            setTimeout(function () {
                raiz.hidden = false;
                try { localStorage.setItem(CHAVE_VISTO, String(Date.now())); } catch (e) { /* ignora */ }
                comecar();
            }, ABRE_EM_MS);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
