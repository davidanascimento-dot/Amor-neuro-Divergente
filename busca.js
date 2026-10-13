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
 * A barra fica NA NAV, não em modal: clicar na lupa expande o campo no
 * lugar e encolhe o resto dos itens da navegação. Os resultados aparecem
 * logo abaixo do campo. Sem backdrop, sem travar a página — quem navega
 * pelo teclado continua indo e voltando sem perder o foco.
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

    /* Mesma tabela do gerador (ferramentas/gerar-indice-busca.py). Existe
       porque três registros do índice foram gerados sem "categoria" e
       apareciam soltos no grupo "Outras páginas". Python não está instalado
       aqui, então o índice não pode ser regenerado agora. */
    const CATEGORIAS = [
        [/^comunidade\//, 'Comunidade'],
        [/^(inicio|index)\.html/, 'Início'],
        [/^chat-Ia\//, 'AcolherIA'],
        [/^Direitos\//, 'Direitos'],
        [/^Explorar\//, 'Conteúdos'],
        [/^Recursos\//, 'Conteúdos'],
        [/^blog\//, 'Conteúdos'],
        [/^loja\//, 'Loja'],
        [/^apoiar\//, 'Apoiar'],
        [/^login\//, 'Conta'],
        [/^(privacidade|termos)\.html/, 'Institucional']
    ];

    function categoriaDe(registro) {
        if (registro && registro.categoria) return registro.categoria;
        /* Os padrões são do gerador e não levam "/" no começo, mas a URL do
           índice tem. Sem tirar a barra, nenhum casava. */
        const caminho = String((registro && registro.url) || '');
        const url = caminho.charAt(0) === '/' ? caminho.slice(1) : caminho;
        for (let i = 0; i < CATEGORIAS.length; i++) {
            if (CATEGORIAS[i][0].test(url)) return CATEGORIAS[i][1];
        }
        return 'Outras páginas';
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
        if (!registro) return 0;

        const titulo = chave(registro.titulo);
        const h1 = chave(registro.h1);
        const descricao = chave(registro.descricao);
        const categoria = chave(categoriaDe(registro));

        /* O índice não é uniforme: a maioria dos registros traz "secoes",
           mas alguns (as páginas de artigo) trazem só "palavrasChave".
           Sem isto, um registro sem "secoes" derrubava a busca inteira
           com "Cannot read properties of undefined (reading 'map')". */
        const secoesBrutas = Array.isArray(registro.secoes) ? registro.secoes
            : (Array.isArray(registro.palavrasChave) ? registro.palavrasChave : []);
        const extras = Array.isArray(registro.palavrasChave) ? registro.palavrasChave : [];
        const secoes = secoesBrutas.concat(extras).map(chave).filter(Boolean);

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
            // busca devolveria todas as páginas para qualquer palavra.
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
            let pontos = 0;
            try {
                pontos = pontuar(INDICE[i], termos);
            } catch (e) {
                // Um registro quebrado não pode derrubar a busca inteira.
                console.warn('[busca] registro ignorado:', INDICE[i] && INDICE[i].url, e);
                continue;
            }
            if (pontos > 0) achados.push({ registro: INDICE[i], pontos: pontos });
        }

        achados.sort(function (a, b) {
            if (b.pontos !== a.pontos) return b.pontos - a.pontos;
            return String(a.registro.titulo || '').localeCompare(String(b.registro.titulo || ''), 'pt-BR');
        });
        return achados;
    }

    // -----------------------------------------------------------------
    // Interface — barra dentro da navegação
    // -----------------------------------------------------------------

    let botao = null;
    let campo = null;
    let limpar = null;
    let linha = null;
    let painel = null;
    let areaResultados = null;
    let nav = null;

    function criar() {
        // A barra entra no container de ações do cabeçalho, ao lado de
        // "Entrar". Cada página do site tem um nome diferente para esse
        // container, e a lista abaixo é o que existe de fato — se cair
        // numa classe que não está em nenhuma página, a busca não entra.
        const alvos = ['.nav-actions', '.landing-nav-actions', '.header-actions', '.header-links'];
        let onde = null;
        for (let i = 0; i < alvos.length && !onde; i++) {
            const alvo = document.querySelector(alvos[i]);
            if (alvo && !alvo.querySelector('.busca-inline')) onde = alvo;
        }
        // Último recurso: o próprio cabeçalho. Melhor a lupa um pouco fora
        // do lugar ideal do que nenhuma lupa.
        if (!onde) {
            const cabecalho = document.querySelector('header');
            if (cabecalho && !cabecalho.querySelector('.busca-inline')) onde = cabecalho;
        }
        if (!onde) return false;

        nav = onde;
        nav.classList.add('busca-nav');

        linha = document.createElement('div');
        linha.className = 'busca-inline';

        botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'busca-btn';
        botao.setAttribute('aria-label', 'Pesquisar no site');
        botao.setAttribute('aria-expanded', 'false');
        botao.setAttribute('aria-controls', 'buscaResultados');
        botao.title = 'Pesquisar no site';
        botao.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>';

        campo = document.createElement('input');
        campo.type = 'search';
        campo.id = 'buscaCampo';
        campo.className = 'busca-campo';
        campo.placeholder = 'O que você procura?';
        campo.autocomplete = 'off';
        campo.hidden = true;
        campo.setAttribute('aria-controls', 'buscaResultados');

        limpar = document.createElement('button');
        limpar.type = 'button';
        limpar.className = 'busca-limpar';
        limpar.setAttribute('aria-label', 'Limpar pesquisa');
        limpar.hidden = true;
        limpar.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';

        painel = document.createElement('div');
        painel.className = 'busca-painel';
        painel.id = 'buscaPainel';
        painel.hidden = true;

        areaResultados = document.createElement('div');
        areaResultados.className = 'busca-resultados';
        areaResultados.id = 'buscaResultados';
        areaResultados.setAttribute('role', 'region');
        areaResultados.setAttribute('aria-live', 'polite');
        painel.appendChild(areaResultados);

        linha.appendChild(botao);
        linha.appendChild(campo);
        linha.appendChild(limpar);
        nav.insertBefore(linha, nav.firstChild);
        document.body.appendChild(painel);

        let indiceAtivo = -1;

        botao.addEventListener('click', function () {
            if (linha.classList.contains('busca-aberta')) fechar(true);
            else abrir();
        });

        campo.addEventListener('input', function () {
            limpar.hidden = !campo.value;
            indiceAtivo = -1;
            desenhar(campo.value);
            posicionar();
        });

        campo.addEventListener('focus', function () {
            if (!painel.hidden) posicionar();
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

            if (ev.key === 'Escape') {
                ev.preventDefault();
                fechar(true);
                return;
            }
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

        // Clicar fora fecha. Sem isso a barra ficaria aberta atravessando
        // a página inteira enquanto a pessoa rola o conteúdo.
        document.addEventListener('click', function (ev) {
            if (!linha.classList.contains('busca-aberta')) return;
            if (linha.contains(ev.target) || painel.contains(ev.target)) return;
            fechar(false);
        });

        window.addEventListener('resize', function () {
            if (!painel.hidden) posicionar();
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

    /** O painel é "fixed" e acompanha o campo, porque a nav pode ter
        overflow escondido e cortaria o dropdown se ele morasse dentro dela. */
    function posicionar() {
        if (!painel || !linha || painel.hidden) return;
        const r = linha.getBoundingClientRect();
        const largura = Math.max(r.width, 280);
        const esquerda = Math.max(8, Math.min(r.right - largura, window.innerWidth - largura - 8));
        painel.style.left = esquerda + 'px';
        painel.style.top = (r.bottom + 8) + 'px';
        painel.style.width = largura + 'px';
    }

    function focar(links, i) {
        links.forEach(function (l, k) { l.classList.toggle('busca-resultado-ativo', k === i); });
        if (links[i]) {
            links[i].focus();
            links[i].scrollIntoView({ block: 'nearest' });
        }
    }

    function abrir() {
        if (!linha) return;
        linha.classList.add('busca-aberta');
        // Encolhe o resto da navegação para o campo caber no lugar.
        if (nav) nav.classList.add('busca-nav-comprimida');
        campo.hidden = false;
        painel.hidden = false;
        botao.setAttribute('aria-expanded', 'true');
        posicionar();
        desenhar(campo.value);
        campo.focus();
    }

    function fechar(devolverFoco) {
        if (!linha) return;
        linha.classList.remove('busca-aberta');
        if (nav) nav.classList.remove('busca-nav-comprimida');
        painel.hidden = true;
        campo.hidden = true;
        botao.setAttribute('aria-expanded', 'false');
        if (devolverFoco) botao.focus();
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
            const c = categoriaDe(a.registro);
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
    }

    window.Busca = { buscar: buscar, abrir: abrir, fechar: fechar, total: INDICE.length };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();