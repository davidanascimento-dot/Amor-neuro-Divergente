/**
 * busca.js — pesquisa em todo o site
 *
 * O site não tem nenhuma busca de texto (nem em páginas, nem em
 * publicações). Esta é a primeira, e ela é honesta sobre o alcance:
 * procura nas PÁGINAS. Não promete achar post de comunidade, grupo ou
 * evento, porque hoje não tem como — o banco não tem busca textual e os
 * grupos são restritos por RLS.
 *
 * O botão entra sozinho em qualquer .header-links que existir na página.
 * Isso evita editar 16 arquivos de HTML toda vez que a busca muda de
 * lugar. Páginas sem cabeçalho não recebem busca — e são só login,
 * administração e a própria comunidade, que têm navegação própria.
 *
 * Diálogo: <dialog> nativo, com foco preso, Esc para fechar e foco de
 * volta para o botão. Funciona por teclado sem código extra.
 */
(function () {
    'use strict';

    if (window.Busca) return;

    const INDICE = window.BUSCA_INDICE || [];

    // -----------------------------------------------------------------
    // Normalização
    //
    // "Acessibilidade", "acessibilidade" e "ACESSIBILIDADE" precisam dar
    // o mesmo resultado. E "direitos" tem que achar "Direitos".
    // -----------------------------------------------------------------
    function normalizar(texto) {
        return String(texto || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    /** Remove acentos e junta, para o texto ficar pesado só uma vez. */
    function chave(texto) {
        return normalizar(texto).replace(/\s+/g, ' ').trim();
    }

    // -----------------------------------------------------------------
    // Busca
    // -----------------------------------------------------------------

    /**
     * Pontua um registro. Título pesa mais que seção, seção mais que
     * descrição — por isso "direitos" traz "Seus Direitos" para o topo,
     * e não a página que só menciona a palavra no meio de um parágrafo.
     */
    function pontuar(registro, termos) {
        const titulo = chave(registro.titulo);
        const h1 = chave(registro.h1);
        const descricao = chave(registro.descricao);
        const secoes = registro.secoes.map(chave);
        const categoria = chave(registro.categoria);

        let pontos = 0;
        for (let i = 0; i < termos.length; i++) {
            const termo = termos[i];
            const peso = termos.length - i;       // a primeira palavra pesa mais

            if (titulo === termo) pontos += 120 * peso;
            else if (titulo.indexOf(termo) === 0) pontos += 60 * peso;
            else if (titulo.indexOf(termo) !== -1) pontos += 30 * peso;

            if (h1.indexOf(termo) !== -1) pontos += 20 * peso;

            let achouSecao = false;
            for (let s = 0; s < secoes.length; s++) {
                if (secoes[s].indexOf(termo) !== -1) {
                    pontos += 12 * peso;
                    achouSecao = true;
                    break;
                }
            }

            if (descricao.indexOf(termo) !== -1) pontos += 5 * peso;
            if (categoria.indexOf(termo) !== -1) pontos += 8 * peso;

            // Sem nenhuma ocorrência: fora do resultado. Sem isto, a
            // busca devolveria as 38 páginas para qualquer palavra.
            if (!achouSecao && titulo.indexOf(termo) === -1 &&
                h1.indexOf(termo) === -1 && descricao.indexOf(termo) === -1 &&
                categoria.indexOf(termo) === -1) {
                return 0;
            }
        }
        return pontos;
    }

    function buscar(texto) {
        const termos = chave(texto).split(' ').filter(function (t) { return t.length > 1; });
        if (!termos.length) return [];

        const achados = [];
        for (let i = 0; i < INDICE.length; i++) {
            const pontos = pontuar(INDICE[i], termos);
            if (pontos > 0) achados.push({ registro: INDICE[i], pontos: pontos });
        }

        achados.sort(function (a, b) {
            if (b.pontos !== a.pontos) return b.pontos - a.pontos;
            return a.registro.titulo.localeCompare(b.registro.titulo, 'pt-BR');
        });
        return achados;
    }

    // -----------------------------------------------------------------
    // Interface
    // -----------------------------------------------------------------

    let botao = null;
    let caixaDialogo = null;
    let campo = null;
    let areaResultados = null;
    let contadorResultados = null;

    function criar() {
        // O botão entra no container de ações do cabeçalho, ao lado de
        // "Entrar". Cada página do site tem um nome diferente para esse
        // container, e a lista abaixo é o que existe de fato — se cair
        // numa classe que não está em nenhuma página, o botão não entra.
        const alvos = ['.nav-actions', '.landing-nav-actions', '.header-actions', '.header-links'];
        let onde = null;
        for (let i = 0; i < alvos.length && !onde; i++) {
            const alvo = document.querySelector(alvos[i]);
            if (alvo && !alvo.querySelector('.busca-btn')) onde = alvo;
        }
        // Último recurso: o próprio cabeçalho. Melhor a lupa um pouco fora
        // do lugar ideal do que nenhuma lupa.
        if (!onde) {
            const cabecalho = document.querySelector('header');
            if (cabecalho && !cabecalho.querySelector('.busca-btn')) onde = cabecalho;
        }
        if (!onde) return false;

        botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'busca-btn';
        botao.setAttribute('aria-label', 'Pesquisar no site');
        botao.title = 'Pesquisar no site';
        botao.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>';
        botao.addEventListener('click', abrir);
        onde.insertBefore(botao, onde.firstChild);

        caixaDialogo = document.createElement('dialog');
        caixaDialogo.className = 'busca-caixa';
        caixaDialogo.setAttribute('aria-label', 'Pesquisar no site');
        caixaDialogo.innerHTML = [
            '<div class="busca-campo-linha">',
            '  <i class="fa-solid fa-magnifying-glass busca-campo-icone" aria-hidden="true"></i>',
            '  <input type="search" id="buscaCampo" class="busca-campo"',
            '         placeholder="O que você procura?" autocomplete="off"',
            '         aria-describedby="buscaAjuda" aria-controls="buscaResultados">',
            '  <button type="button" class="busca-limpar" id="buscaLimpar" aria-label="Limpar pesquisa" hidden>',
            '    <i class="fa-solid fa-xmark" aria-hidden="true"></i>',
            '  </button>',
            '</div>',
            '<p class="busca-ajuda" id="buscaAjuda">',
            '  Pesquisa nas páginas do site. Use a seta para navegar e Enter para abrir.',
            '</p>',
            '<div class="busca-resultados" id="buscaResultados" role="region" aria-live="polite"></div>'
        ].join('');
        document.body.appendChild(caixaDialogo);

        campo = caixaDialogo.querySelector('#buscaCampo');
        areaResultados = caixaDialogo.querySelector('#buscaResultados');
        const limpar = caixaDialogo.querySelector('#buscaLimpar');

        let indiceAtivo = -1;

        campo.addEventListener('input', function () {
            limpar.hidden = !campo.value;
            indiceAtivo = -1;
            desenhar(campo.value);
        });

        limpar.addEventListener('click', function () {
            campo.value = '';
            limpar.hidden = true;
            campo.focus();
            desenhar('');
        });

        // Navegar pelos resultados sem sair do teclado: quem não usa
        // mouse precisa chegar na página, não só lê-la na lista.
        campo.addEventListener('keydown', function (ev) {
            const links = areaResultados.querySelectorAll('a');
            if (!links.length) return;

            if (ev.key === 'ArrowDown') {
                ev.preventDefault();
                indiceAtivo = Math.min(indiceAtivo + 1, links.length - 1);
                focar(links, indiceAtivo);
            } else if (ev.key === 'ArrowUp') {
                ev.preventDefault();
                indiceAtivo = Math.max(indiceAtivo - 1, 0);
                focar(links, indiceAtivo);
            } else if (ev.key === 'Enter' && indiceAtivo >= 0) {
                ev.preventDefault();
                links[indiceAtivo].click();
            }
        });

        // "/" abre a busca de qualquer lugar, como em qualquer editor.
        document.addEventListener('keydown', function (ev) {
            if (ev.key !== '/' || ev.ctrlKey || ev.metaKey || ev.altKey) return;
            const alvo = ev.target;
            const digitando = alvo && (alvo.tagName === 'INPUT' ||
                alvo.tagName === 'TEXTAREA' || alvo.isContentEditable);
            if (digitando) return;
            ev.preventDefault();
            abrir();
        });

        return true;
    }

    function focar(links, i) {
        links.forEach(function (l, k) { l.classList.toggle('busca-resultado-ativo', k === i); });
        if (links[i]) {
            links[i].focus();
            links[i].scrollIntoView({ block: 'nearest' });
        }
    }

    function abrir() {
        if (!caixaDialogo) return;
        if (typeof caixaDialogo.showModal === 'function') {
            if (!caixaDialogo.open) caixaDialogo.showModal();
        } else {
            caixaDialogo.setAttribute('open', '');   // navegador antigo
        }
        campo.focus();
        campo.select();
    }

    function fechar() {
        if (!caixaDialogo) return;
        if (typeof caixaDialogo.close === 'function' && caixaDialogo.open) {
            caixaDialogo.close();
        } else {
            caixaDialogo.removeAttribute('open');
        }
        if (botao) botao.focus();      // o foco volta para onde saiu
    }

    function desenhar(texto) {
        const bruto = String(texto || '').trim();
        areaResultados.textContent = '';

        if (!bruto) {
            const vazio = document.createElement('p');
            vazio.className = 'busca-dica';
            vazio.textContent = INDICE.length
                ? INDICE.length + ' páginas no site. Digite para filtrar.'
                : 'Nenhuma página indexada.';
            areaResultados.appendChild(vazio);
            return;
        }

        const achados = buscar(bruto);

        if (!achados.length) {
            const nada = document.createElement('p');
            nada.className = 'busca-dica';
            nada.innerHTML = 'Nada encontrado para <strong></strong>. ' +
                'Tente outra palavra: a busca cobre as páginas do site.';
            nada.querySelector('strong').textContent = bruto;
            areaResultados.appendChild(nada);
            return;
        }

        // Agrupado por categoria: a pessoa vê "o que tipo de coisa é
        // isso" antes de ler o título.
        const grupos = {};
        achados.forEach(function (a) {
            const c = a.registro.categoria;
            if (!grupos[c]) grupos[c] = [];
            grupos[c].push(a.registro);
        });

        Object.keys(grupos).forEach(function (categoria) {
            const lista = grupos[categoria];
            const titulo = document.createElement('h2');
            titulo.className = 'busca-grupo';
            titulo.textContent = categoria + ' (' + lista.length + ')';
            areaResultados.appendChild(titulo);

            lista.forEach(function (p) {
                const item = document.createElement('a');
                item.className = 'busca-resultado';
                item.href = p.url;

                const nome = document.createElement('span');
                nome.className = 'busca-resultado-titulo';
                nome.textContent = p.titulo;

                const desc = document.createElement('span');
                desc.className = 'busca-resultado-desc';
                desc.textContent = p.descricao || p.h1 || p.url;

                const url = document.createElement('span');
                url.className = 'busca-resultado-url';
                url.textContent = p.url;

                item.appendChild(nome);
                item.appendChild(desc);
                item.appendChild(url);
                areaResultados.appendChild(item);
            });
        });
    }

    function iniciar() {
        if (!INDICE.length) return;
        if (!criar()) return;
        desenhar('');
    }

    window.Busca = { buscar: buscar, abrir: abrir, fechar: fechar, total: INDICE.length };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
