/* ==========================================================================
   LEITURA-NEURO.JS — Leitura confortável para pessoas neurodivergentes
   --------------------------------------------------------------------------
   Use junto com leitura-neuro.css, nas páginas de leitura de artigo:

       <link rel="stylesheet" href="/leitura-neuro.css">
       <script src="/leitura-neuro.js"></script>

   O que faz:
     1. Painel "Ajustes de leitura" (botão fixo no canto inferior esquerdo):
        Bionic Reading, fonte (padrão / Atkinson / OpenDyslexic), tamanho,
        espaço entre linhas e parágrafos, largura da coluna, tema de
        leitura (site / claro / sépia / escuro / alto contraste) e
        Modo foco (só o texto).
     2. Resumo automático + índice com âncoras no topo do artigo, e um
        índice lateral fixo (telas largas) que mostra onde você está.
     3. Selo de "energia mental" estimada (baixa / média / alta).
     4. Lembra onde a pessoa parou e oferece retomar — sem pular sozinho.

   Tudo fica no navegador (localStorage). Nada é enviado para servidor.
   Se o JavaScript falhar, o artigo continua legível, como antes.
   ========================================================================== */

(function () {
    'use strict';

    var CHAVE_PREFS = 'ln_prefs_v1';
    var CHAVE_POS = 'ln_pos_';
    var CHAVE_LISTA = 'ln_continuar';
    var PADRAO = {
        bionic: false,
        fonte: 'padrao',
        tema: 'site',
        linha: 1,
        para: 1,
        largura: 'normal',
        tam: null,
        resumoAberto: true
    };

    var html = document.documentElement;
    var prefs = carregarPrefs();
    var corpo = null;
    var observador = null;
    var iniciouConteudo = false;
    var reduzMovimento = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ----------------------------------------------------------------------
       Armazenamento (com try/catch: modo privado pode bloquear)
       ---------------------------------------------------------------------- */
    function ler(chave) {
        try { return JSON.parse(localStorage.getItem(chave)); } catch (e) { return null; }
    }
    function gravar(chave, valor) {
        try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* ignora */ }
    }
    function apagar(chave) {
        try { localStorage.removeItem(chave); } catch (e) { /* ignora */ }
    }
    function carregarPrefs() {
        var salvas = ler(CHAVE_PREFS) || {};
        var p = {};
        Object.keys(PADRAO).forEach(function (k) {
            p[k] = salvas[k] !== undefined ? salvas[k] : PADRAO[k];
        });
        return p;
    }
    function salvarPrefs() { gravar(CHAVE_PREFS, prefs); }

    /* ----------------------------------------------------------------------
       Utilidades
       ---------------------------------------------------------------------- */
    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function slug(s) {
        return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'secao';
    }
    function el(tag, attrs, filhos) {
        var n = document.createElement(tag);
        Object.keys(attrs || {}).forEach(function (k) {
            if (k === 'text') n.textContent = attrs[k];
            else if (k === 'html') n.innerHTML = attrs[k];
            else n.setAttribute(k, attrs[k]);
        });
        (filhos || []).forEach(function (f) { n.appendChild(f); });
        return n;
    }

    /* ----------------------------------------------------------------------
       Aplicar preferências ao <html> (o CSS faz o resto)
       ---------------------------------------------------------------------- */
    function aplicarPrefs() {
        html.setAttribute('data-ln-fonte', prefs.fonte);
        html.setAttribute('data-ln-tema', prefs.tema);
        html.setAttribute('data-ln-linha', String(prefs.linha));
        html.setAttribute('data-ln-para', String(prefs.para));
        html.setAttribute('data-ln-largura', prefs.largura);
        if (prefs.tam) html.style.setProperty('--ln-tam', prefs.tam + 'px');
        else html.style.removeProperty('--ln-tam');
        if (corpo) {
            if (prefs.bionic) aplicarBionic(corpo); else removerBionic(corpo);
        }
        atualizarPainel();
    }

    /* ----------------------------------------------------------------------
       BIONIC READING
       Negrito nas primeiras letras de cada palavra. Reversível: cada trecho
       trocado guarda o texto original e volta ao normal ao desligar.
       ---------------------------------------------------------------------- */
    var PULAR = 'pre, code, kbd, samp, script, style, textarea, button, .ln-bio-w';

    function qtdNegrito(tamanho) {
        if (tamanho <= 3) return 1;
        if (tamanho <= 5) return 2;
        return Math.ceil(tamanho * 0.45);
    }

    function bionicEmTexto(texto) {
        var re = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;
        var saida = '';
        var fim = 0;
        var m;
        while ((m = re.exec(texto)) !== null) {
            var letras = Array.from(m[0]);
            var n = qtdNegrito(letras.length);
            saida += esc(texto.slice(fim, m.index));
            saida += '<b class="ln-bio">' + esc(letras.slice(0, n).join('')) + '</b>' +
                esc(letras.slice(n).join(''));
            fim = m.index + m[0].length;
        }
        return saida + esc(texto.slice(fim));
    }

    function aplicarBionic(raiz) {
        pausarObservador();
        var alvos = [];
        var walker = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
            acceptNode: function (no) {
                if (!no.nodeValue || !no.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                if (no.parentElement && no.parentElement.closest(PULAR)) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        while (walker.nextNode()) alvos.push(walker.currentNode);
        alvos.forEach(function (no) {
            var span = document.createElement('span');
            span.className = 'ln-bio-w';
            span.setAttribute('data-orig', no.nodeValue);
            span.innerHTML = bionicEmTexto(no.nodeValue);
            no.parentNode.replaceChild(span, no);
        });
        retomarObservador();
    }

    function removerBionic(raiz) {
        var spans = raiz.querySelectorAll('.ln-bio-w');
        if (!spans.length) return;
        pausarObservador();
        spans.forEach(function (s) {
            s.parentNode.replaceChild(document.createTextNode(s.getAttribute('data-orig') || s.textContent), s);
        });
        raiz.normalize();
        retomarObservador();
    }

    /* ----------------------------------------------------------------------
       PAINEL DE AJUSTES
       ---------------------------------------------------------------------- */
    var botao, painel, botaoSairFoco;

    function grupoOpcoes(titulo, chave, opcoes) {
        var fs = el('fieldset', { 'class': 'ln-grupo' }, [el('legend', { text: titulo })]);
        var caixa = el('div', { 'class': 'ln-opcoes' });
        opcoes.forEach(function (o) {
            var b = el('button', { type: 'button', 'class': 'ln-op', text: o[1] });
            b.setAttribute('data-chave', chave);
            b.setAttribute('data-valor', String(o[0]));
            b.addEventListener('click', function () {
                var v = o[0];
                prefs[chave] = (typeof PADRAO[chave] === 'number') ? Number(v) : v;
                salvarPrefs();
                aplicarPrefs();
            });
            caixa.appendChild(b);
        });
        fs.appendChild(caixa);
        return fs;
    }

    function construirPainel() {
        botao = el('button', {
            type: 'button', 'class': 'ln-botao', 'aria-expanded': 'false',
            'aria-controls': 'lnPainel', html: '<i class="fa-solid fa-sliders" aria-hidden="true"></i> Ajustes de leitura'
        });
        painel = el('div', {
            id: 'lnPainel', 'class': 'ln-painel', role: 'dialog',
            'aria-label': 'Ajustes de leitura'
        });
        painel.hidden = true;

        painel.appendChild(el('h2', { text: 'Ajustes de leitura' }));
        painel.appendChild(el('p', { 'class': 'ln-sub', text: 'Suas escolhas ficam salvas neste navegador.' }));

        // Bionic
        var bio = el('fieldset', { 'class': 'ln-grupo' }, [el('legend', { text: 'Leitura Bionic (negrito no início das palavras)' })]);
        var bioBtn = el('button', { type: 'button', 'class': 'ln-op', id: 'lnBionic' });
        bioBtn.addEventListener('click', function () {
            prefs.bionic = !prefs.bionic;
            salvarPrefs();
            aplicarPrefs();
        });
        bio.appendChild(el('div', { 'class': 'ln-opcoes' }, [bioBtn]));
        painel.appendChild(bio);

        painel.appendChild(grupoOpcoes('Fonte', 'fonte', [
            ['padrao', 'Padrão'], ['atkinson', 'Atkinson (clara)'], ['dislexia', 'OpenDyslexic']
        ]));

        // Tamanho
        var tam = el('fieldset', { 'class': 'ln-grupo' }, [el('legend', { text: 'Tamanho do texto' })]);
        var menos = el('button', { type: 'button', 'class': 'ln-op', 'aria-label': 'Diminuir texto', text: 'A−' });
        var mais = el('button', { type: 'button', 'class': 'ln-op', 'aria-label': 'Aumentar texto', text: 'A+' });
        var rot = el('span', { id: 'lnTamRot', 'aria-live': 'polite', style: 'align-self:center;font-weight:600' });
        menos.addEventListener('click', function () { mudarTam(-2); });
        mais.addEventListener('click', function () { mudarTam(2); });
        tam.appendChild(el('div', { 'class': 'ln-opcoes' }, [menos, mais, rot]));
        painel.appendChild(tam);

        painel.appendChild(grupoOpcoes('Espaço entre linhas', 'linha', [[1, 'Normal'], [2, 'Amplo'], [3, 'Máximo']]));
        painel.appendChild(grupoOpcoes('Espaço entre parágrafos', 'para', [[1, 'Normal'], [2, 'Amplo'], [3, 'Máximo']]));
        painel.appendChild(grupoOpcoes('Largura do texto', 'largura', [['normal', 'Normal'], ['estreita', 'Estreita']]));
        painel.appendChild(grupoOpcoes('Tema de leitura', 'tema', [
            ['site', 'Do site'], ['claro', 'Claro'], ['sepia', 'Sépia'], ['escuro', 'Escuro'], ['contraste', 'Alto contraste']
        ]));

        // Modo foco
        var foco = el('fieldset', { 'class': 'ln-grupo' }, [el('legend', { text: 'Modo foco' })]);
        var focoBtn = el('button', { type: 'button', 'class': 'ln-op', id: 'lnFoco', text: 'Só o texto, sem distrações' });
        focoBtn.addEventListener('click', function () { alternarFoco(true); fecharPainel(false); });
        foco.appendChild(el('div', { 'class': 'ln-opcoes' }, [focoBtn]));
        painel.appendChild(foco);

        var reset = el('button', { type: 'button', 'class': 'ln-reset', text: 'Voltar ao padrão do site' });
        reset.addEventListener('click', function () {
            prefs = {};
            Object.keys(PADRAO).forEach(function (k) { prefs[k] = PADRAO[k]; });
            apagar(CHAVE_PREFS);
            aplicarPrefs();
        });
        painel.appendChild(reset);

        botaoSairFoco = el('button', {
            type: 'button', 'class': 'ln-foco-sair', html: '<i class="fa-solid fa-xmark" aria-hidden="true"></i> Sair do modo foco'
        });
        botaoSairFoco.addEventListener('click', function () { alternarFoco(false); botao.focus(); });

        botao.addEventListener('click', function () {
            if (painel.hidden) abrirPainel(); else fecharPainel(true);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            if (html.getAttribute('data-ln-foco') === 'on') { alternarFoco(false); botao.focus(); return; }
            if (!painel.hidden) fecharPainel(true);
        });

        document.body.appendChild(botao);
        document.body.appendChild(painel);
        document.body.appendChild(botaoSairFoco);
    }

    function abrirPainel() {
        painel.hidden = false;
        botao.setAttribute('aria-expanded', 'true');
        var primeiro = painel.querySelector('button');
        if (primeiro) primeiro.focus();
    }
    function fecharPainel(devolverFoco) {
        painel.hidden = true;
        botao.setAttribute('aria-expanded', 'false');
        if (devolverFoco) botao.focus();
    }

    function mudarTam(delta) {
        var atual = prefs.tam || 19;
        prefs.tam = Math.max(16, Math.min(30, atual + delta));
        salvarPrefs();
        aplicarPrefs();
    }

    function alternarFoco(ligar) {
        if (ligar) html.setAttribute('data-ln-foco', 'on');
        else html.removeAttribute('data-ln-foco');
        if (ligar) window.scrollTo(0, 0);
    }

    function atualizarPainel() {
        if (!painel) return;
        painel.querySelectorAll('button.ln-op[data-chave]').forEach(function (b) {
            var chave = b.getAttribute('data-chave');
            b.setAttribute('aria-pressed', String(String(prefs[chave]) === b.getAttribute('data-valor')));
        });
        var bio = painel.querySelector('#lnBionic');
        if (bio) {
            bio.setAttribute('aria-pressed', String(!!prefs.bionic));
            bio.textContent = prefs.bionic ? 'Ligado' : 'Desligado';
        }
        var rot = painel.querySelector('#lnTamRot');
        if (rot) rot.textContent = prefs.tam ? prefs.tam + ' px' : 'padrão';
    }

    /* ----------------------------------------------------------------------
       RESUMO + ÍNDICE
       ---------------------------------------------------------------------- */
    function frases(texto) {
        return texto.replace(/\s+/g, ' ').trim()
            .split(/(?<=[.!?…])\s+(?=[A-ZÀ-ÝÇ“"(])/u)
            .filter(function (f) { return f.length > 0; });
    }
    function curto(s, max) {
        if (s.length <= max) return s;
        var corte = s.slice(0, max);
        var i = corte.lastIndexOf(' ');
        return (i > 40 ? corte.slice(0, i) : corte).replace(/[,;:\s]+$/, '') + '…';
    }

    function coletarTitulos(raiz) {
        var lista = [];
        raiz.querySelectorAll('h2, h3').forEach(function (h) {
            var t = h.textContent.replace(/\s+/g, ' ').trim();
            if (!t) return;
            if (!h.id) {
                var base = 'ln-' + slug(t), id = base, n = 2;
                while (document.getElementById(id)) { id = base + '-' + n++; }
                h.id = id;
            }
            lista.push({ id: h.id, texto: t, nivel: h.tagName === 'H3' ? 3 : 2, no: h });
        });
        return lista;
    }

    function pontosPrincipais(raiz, titulos) {
        var pontos = [];
        var h2s = titulos.filter(function (t) { return t.nivel === 2; });
        if (h2s.length >= 2) {
            h2s.slice(0, 6).forEach(function (t) {
                var p = t.no.nextElementSibling;
                while (p && !/^P$/.test(p.tagName) && !/^H[1-6]$/.test(p.tagName)) p = p.nextElementSibling;
                if (p && /^P$/.test(p.tagName)) {
                    var f = frases(p.textContent)[0];
                    if (f && f.length > 25) pontos.push({ titulo: t.texto, texto: curto(f, 190) });
                }
            });
        }
        if (pontos.length < 2) {
            pontos = [];
            var ps = Array.prototype.filter.call(raiz.querySelectorAll('p'), function (p) {
                return p.textContent.trim().length > 60 && !p.closest('blockquote');
            });
            var alvo = Math.min(4, ps.length);
            for (var i = 0; i < alvo; i++) {
                var idx = alvo === 1 ? 0 : Math.round(i * (ps.length - 1) / (alvo - 1));
                var f2 = frases(ps[idx].textContent)[0];
                if (f2) pontos.push({ titulo: '', texto: curto(f2, 190) });
            }
        }
        return pontos;
    }

    function montarResumoEIndice(raiz, titulos, palavras) {
        if (document.querySelector('.ln-resumo')) return;
        var pontos = palavras >= 250 ? pontosPrincipais(raiz, titulos) : [];
        var temIndice = titulos.length >= 2;
        if (!pontos.length && !temIndice) return;

        var det = el('details', { 'class': 'ln-resumo' });
        if (prefs.resumoAberto) det.open = true;
        det.appendChild(el('summary', { text: 'Resumo e índice deste artigo' }));
        var corpoDet = el('div', { 'class': 'ln-resumo__corpo' });

        if (pontos.length) {
            corpoDet.appendChild(el('h3', { text: 'Resumo rápido' }));
            var ul = el('ul');
            pontos.forEach(function (p) {
                ul.appendChild(el('li', { html: (p.titulo ? '<strong>' + esc(p.titulo) + ':</strong> ' : '') + esc(p.texto) }));
            });
            corpoDet.appendChild(ul);
            corpoDet.appendChild(el('small', { text: 'Resumo automático: pega a primeira ideia de cada parte do texto. Não substitui a leitura.' }));
        }
        if (temIndice) {
            corpoDet.appendChild(el('h3', { text: 'Neste artigo' }));
            var ol = el('ol');
            titulos.forEach(function (t) {
                var li = el('li', { style: t.nivel === 3 ? 'margin-left:1rem;list-style:circle' : '' });
                li.appendChild(el('a', { href: '#' + t.id, text: t.texto }));
                ol.appendChild(li);
            });
            corpoDet.appendChild(ol);
        }
        det.appendChild(corpoDet);
        det.addEventListener('toggle', function () {
            prefs.resumoAberto = det.open;
            salvarPrefs();
        });
        raiz.parentNode.insertBefore(det, raiz);

        // Âncoras: rolar sem animação se a pessoa pediu movimento reduzido
        det.addEventListener('click', function (e) {
            var a = e.target.closest && e.target.closest('a[href^="#"]');
            if (!a) return;
            var alvo = document.getElementById(a.getAttribute('href').slice(1));
            if (!alvo) return;
            e.preventDefault();
            alvo.scrollIntoView({ behavior: reduzMovimento ? 'auto' : 'smooth', block: 'start' });
            alvo.setAttribute('tabindex', '-1');
            alvo.focus({ preventScroll: true });
            history.replaceState(null, '', '#' + alvo.id);
        });
    }

    function montarIndiceFixo(titulos) {
        if (titulos.length < 2 || document.querySelector('.ln-indice-fixo')) return;
        var nav = el('nav', { 'class': 'ln-indice-fixo', 'aria-label': 'Índice do artigo' });
        nav.appendChild(el('strong', { text: 'Neste artigo' }));
        var ol = el('ol');
        titulos.forEach(function (t) {
            var li = el('li', { 'class': t.nivel === 3 ? 'ln-n3' : '' });
            li.appendChild(el('a', { href: '#' + t.id, text: t.texto, 'data-alvo': t.id }));
            ol.appendChild(li);
        });
        nav.appendChild(ol);
        document.body.appendChild(nav);

        nav.addEventListener('click', function (e) {
            var a = e.target.closest('a[data-alvo]');
            if (!a) return;
            var alvo = document.getElementById(a.getAttribute('data-alvo'));
            if (!alvo) return;
            e.preventDefault();
            alvo.scrollIntoView({ behavior: reduzMovimento ? 'auto' : 'smooth', block: 'start' });
            history.replaceState(null, '', '#' + alvo.id);
        });

        if (!('IntersectionObserver' in window)) return;
        var visiveis = {};
        var io = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (en) { visiveis[en.target.id] = en.isIntersecting; });
            var atual = null;
            for (var i = 0; i < titulos.length; i++) { if (visiveis[titulos[i].id]) { atual = titulos[i].id; break; } }
            if (!atual) {
                // nenhum título visível: usa o último que já ficou para cima
                for (var j = titulos.length - 1; j >= 0; j--) {
                    if (titulos[j].no.getBoundingClientRect().top < 120) { atual = titulos[j].id; break; }
                }
            }
            nav.querySelectorAll('a').forEach(function (a) {
                if (a.getAttribute('data-alvo') === atual) a.setAttribute('aria-current', 'true');
                else a.removeAttribute('aria-current');
            });
        }, { rootMargin: '-80px 0px -60% 0px' });
        titulos.forEach(function (t) { io.observe(t.no); });
    }

    /* ----------------------------------------------------------------------
       ENERGIA MENTAL (estimativa simples e honesta)
       Considera: tamanho, comprimento médio das frases e se há código.
       ---------------------------------------------------------------------- */
    function estimarEnergia(raiz, palavras) {
        var texto = raiz.textContent.replace(/\s+/g, ' ');
        var fr = frases(texto);
        var media = fr.length ? palavras / fr.length : palavras;
        var pontos = 0;
        pontos += palavras < 450 ? 0 : palavras < 1100 ? 1 : 2;
        pontos += media <= 14 ? 0 : media <= 21 ? 1 : 2;
        if (raiz.querySelector('pre')) pontos += 1;
        return pontos <= 1 ? 'baixa' : pontos <= 3 ? 'media' : 'alta';
    }

    function mostrarEnergia(raiz, palavras) {
        var alvo = document.querySelector('.article-meta-bar__right');
        if (!alvo || alvo.querySelector('.ln-energia')) return;
        var nivel = estimarEnergia(raiz, palavras);
        var rotulo = { baixa: 'baixa', media: 'média', alta: 'alta' }[nivel];
        var icone = { baixa: 'fa-battery-quarter', media: 'fa-battery-half', alta: 'fa-battery-full' }[nivel];
        var s = el('span', {
            'class': 'ln-energia', 'data-nivel': nivel,
            title: 'Estimativa pelo tamanho do texto e pelo comprimento das frases.',
            html: '<i class="fa-solid ' + icone + '" aria-hidden="true"></i> Energia mental: ' + rotulo
        });
        alvo.appendChild(s);
    }

    /* ----------------------------------------------------------------------
       CONTINUAR DE ONDE PAROU
       Nunca rola sozinho: só oferece o botão.
       ---------------------------------------------------------------------- */
    function idDoArtigo() {
        var id = new URLSearchParams(window.location.search).get('id');
        return id || window.location.pathname;
    }

    function porcentagemAtual() {
        var total = document.documentElement.scrollHeight - window.innerHeight;
        if (total <= 0) return 0;
        return Math.round((window.scrollY / total) * 100);
    }

    function registrarLista(pct) {
        var lista = ler(CHAVE_LISTA) || [];
        var id = idDoArtigo();
        lista = lista.filter(function (x) { return x.id !== id; });
        if (pct !== null) {
            lista.unshift({
                id: id,
                titulo: (document.title || '').replace(/ — Blog Amor NeuroDivergente$/, ''),
                url: window.location.pathname + window.location.search,
                pct: pct,
                quando: Date.now()
            });
        }
        gravar(CHAVE_LISTA, lista.slice(0, 8));
    }

    function acompanharLeitura() {
        var chave = CHAVE_POS + idDoArtigo();
        var timer = null;
        window.addEventListener('scroll', function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                var pct = porcentagemAtual();
                if (pct >= 96) { apagar(chave); registrarLista(null); }       // terminou
                else if (pct >= 4) { gravar(chave, pct); registrarLista(pct); }
            }, 500);
        }, { passive: true });
    }

    function oferecerRetomar(raiz) {
        var pct = ler(CHAVE_POS + idDoArtigo());
        if (!pct || pct < 5 || pct > 94 || document.querySelector('.ln-retomar')) return;

        var caixa = el('div', { 'class': 'ln-retomar', role: 'region', 'aria-label': 'Retomar leitura' });
        caixa.appendChild(el('span', { text: 'Você tinha lido cerca de ' + pct + '% deste artigo.' }));
        var sim = el('button', { type: 'button', text: 'Continuar de onde parei' });
        var nao = el('button', { type: 'button', 'class': 'ln-retomar__nao', text: 'Ler do início' });
        sim.addEventListener('click', function () {
            var total = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo({ top: total * pct / 100, behavior: reduzMovimento ? 'auto' : 'smooth' });
            caixa.remove();
        });
        nao.addEventListener('click', function () { apagar(CHAVE_POS + idDoArtigo()); caixa.remove(); });
        caixa.appendChild(sim);
        caixa.appendChild(nao);
        raiz.parentNode.insertBefore(caixa, raiz.parentNode.firstChild);
    }

    /* ----------------------------------------------------------------------
       Descobrir o corpo do artigo (ele chega depois, vindo do Supabase)
       ---------------------------------------------------------------------- */
    function pausarObservador() { if (observador) observador.disconnect(); }
    function retomarObservador() {
        if (observador && corpo) observador.observe(corpo, { childList: true });
    }

    function contarPalavras(raiz) {
        var t = raiz.textContent.trim();
        return t ? t.split(/\s+/).length : 0;
    }

    function prepararConteudo() {
        if (!corpo || iniciouConteudo || !corpo.textContent.trim()) return;
        iniciouConteudo = true;
        pausarObservador();
        var titulos = coletarTitulos(corpo);
        var palavras = contarPalavras(corpo);
        montarResumoEIndice(corpo, titulos, palavras);
        montarIndiceFixo(titulos);
        mostrarEnergia(corpo, palavras);
        if (prefs.bionic) aplicarBionic(corpo);
        oferecerRetomar(corpo);
        acompanharLeitura();
        retomarObservador();
    }

    function procurarCorpo() {
        corpo = document.getElementById('artigoCorpo') || document.querySelector('.article-content');
        if (!corpo) return false;
        if (corpo.textContent.trim()) { prepararConteudo(); }
        if (!iniciouConteudo && 'MutationObserver' in window) {
            observador = new MutationObserver(function () {
                if (!iniciouConteudo) prepararConteudo();
            });
            observador.observe(corpo, { childList: true });
        }
        return true;
    }

    function iniciar() {
        if (!document.getElementById('artigoCorpo') && !document.querySelector('.article-content')) return;
        construirPainel();
        procurarCorpo();
        aplicarPrefs();
    }

    // Aplica já as preferências visuais para não piscar o estilo antigo
    aplicarPrefs();

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();
})();
