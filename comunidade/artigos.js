/* ==========================================================================
   ARTIGOS.JS — a área "Artigos" da Comunidade
   --------------------------------------------------------------------------
   A tela que reúne o que a comunidade escreveu: a listagem, os filtros e os
   botões de cada card (ouvir, favoritar).

   A leitura do banco e a montagem do card NÃO são feitas aqui — elas estão
   em /comunidade/artigos-dados.js, o mesmo arquivo que o Blog, o Explorar e
   o perfil usam. É o que garante que o mesmo artigo tenha a mesma forma em
   toda parte.
   ========================================================================== */

(function () {
    'use strict';

    const D = window.artigosDados;
    if (!D) {
        console.error('[artigos] O módulo artigos-dados.js não carregou.');
        return;
    }

    const EL = {
        filtroSecao: document.getElementById('artigoFiltroSecao'),
        filtroTipo:  document.getElementById('artigoFiltroTipo'),
        carregando: document.getElementById('artigoCarregando'),
        estado:     document.getElementById('artigoEstado'),
        grade:      document.getElementById('artigoGrade'),
        loginAviso: document.getElementById('artigoLoginAviso'),
        btnEscrever: document.getElementById('btnEscreverArtigo')
    };

    const ESTADO = {
        artigos: [],
        filtros: { secao: '', tipo: '' }
    };

    /* =====================================================================
       1. OS FILTROS
       ===================================================================== */

    /* Monta os botões de seção. "Todas" vem primeiro e sempre está lá:
     * um filtro que não tem como ser desligado é um filtro que prende. */
    function montarFiltroSecao() {
        if (!EL.filtroSecao) return;

        const secoes = ['Todas', ...D.SECOES];
        EL.filtroSecao.innerHTML = '';

        for (const secao of secoes) {
            const botao = document.createElement('button');
            botao.type = 'button';
            botao.className = 'artigos-chip' + (secao === 'Todas' ? ' is-ativo' : '');
            botao.textContent = secao;
            botao.dataset.secao = secao === 'Todas' ? '' : secao;
            botao.setAttribute('aria-pressed', secao === 'Todas' ? 'true' : 'false');
            EL.filtroSecao.appendChild(botao);
        }
    }

    /* O filtro por tipo é o que diferencia o que a auditoria pediu: um
     * relato não é a mesma coisa que um guia, e a pessoa filtra por isso
     * quando sabe o que procura. */
    function montarFiltroTipo() {
        if (!EL.filtroTipo) return;

        const tipos = ['Todos', ...D.TIPOS];
        EL.filtroTipo.innerHTML = '';

        for (const tipo of tipos) {
            const botao = document.createElement('button');
            botao.type = 'button';
            botao.className = 'artigos-chip' + (tipo === 'Todos' ? ' is-ativo' : '');
            botao.textContent = tipo;
            botao.dataset.tipo = tipo === 'Todos' ? '' : tipo;
            botao.setAttribute('aria-pressed', tipo === 'Todos' ? 'true' : 'false');
            EL.filtroTipo.appendChild(botao);
        }
    }

    function marcarAtivo(container, atributo, valor) {
        if (!container) return;
        container.querySelectorAll('.artigos-chip').forEach(chip => {
            const ativado = (chip.dataset[atributo] || '') === valor;
            chip.classList.toggle('is-ativo', ativado);
            chip.setAttribute('aria-pressed', ativado ? 'true' : 'false');
        });
    }

    /* =====================================================================
       2. FILTRAR E DESENHAR
       ===================================================================== */

    function filtrar() {
        const { secao, tipo } = ESTADO.filtros;

        return ESTADO.artigos.filter(artigo => {
            if (secao && (artigo.category || '') !== secao) return false;
            if (tipo && (artigo.kind || '') !== tipo) return false;

            return true;
        });
    }

    function mostrarCarregando() {
        if (EL.carregando) EL.carregando.hidden = false;
        if (EL.estado) EL.estado.innerHTML = '';
        if (EL.grade) EL.grade.innerHTML = '';
    }

    function mostrarErro(texto) {
        if (EL.carregando) EL.carregando.hidden = true;
        if (EL.grade) EL.grade.innerHTML = '';
        if (EL.estado) EL.estado.innerHTML = D.estadoErro(texto);
    }

    function mostrarVazio() {
        if (EL.carregando) EL.carregando.hidden = true;
        if (EL.grade) EL.grade.innerHTML = '';
        if (EL.estado) {
            EL.estado.innerHTML = D.estadoVazio(
                'Nenhum artigo com esses filtros',
                'Tente outra seção ou outro tipo. Se ninguém escreveu ainda, o primeiro artigo pode ser o seu.',
                'Escrever o primeiro artigo',
                '/comunidade/escrever-artigo.html'
            );
        }
    }

    function desenhar() {
        const lista = filtrar();

        if (!lista.length) {
            mostrarVazio();
            return;
        }

        if (EL.carregando) EL.carregando.hidden = true;
        if (EL.estado) EL.estado.innerHTML = '';

        const frag = document.createDocumentFragment();
        for (const artigo of lista) {
            const perfil = ESTADO.perfis ? ESTADO.perfis.get(artigo.author_id) : null;
            frag.appendChild(D.montarCard(artigo, perfil, { mostrarFavorito: true }));
        }

        if (EL.grade) EL.grade.replaceChildren(frag);
    }

    /* =====================================================================
       3. CARREGAR
       ===================================================================== */

    async function carregar() {
        mostrarCarregando();

        // Promise.race com timeout de 8s: se o banco não responder, a consulta
        // é considerada falha e o carregando some. Isso evita a tela ficar
        // travada para sempre em "Carregando artigos…".
        const timeout = new Promise((_, rejeita) =>
            setTimeout(() => rejeita(new Error('timeout')), 8000)
        );

        try {
            const consulta = D.lerArtigos({ limite: 60 });
            const { artigos, erro } = await Promise.race([consulta, timeout]);

            if (erro) {
                console.error('[artigos] Erro ao carregar os artigos:', erro);

                if (D.ehTabelaAusente(erro)) {
                    mostrarErro(D.AVISO_BANCO);
                } else if (D.ehErroDeSessao(erro)) {
                    mostrarErro('Sua sessão expirou. Entre novamente para ver os artigos da comunidade.');
                } else {
                    mostrarErro('Não foi possível carregar os artigos agora. Verifique sua conexão e tente de novo.');
                }
                return;
            }

            ESTADO.artigos = artigos;

            // Os autores são buscados em UMA consulta para todos os artigos.
            const ids = artigos.map(a => a.author_id).filter(Boolean);
            const perfis = await D.lerAutores(ids);
            ESTADO.perfis = perfis;

            desenhar();
        } catch (e) {
            console.error('[artigos] Erro inesperado ao carregar:', e);
            mostrarErro('Não foi possível carregar os artigos agora. Verifique sua conexão e tente de novo.');
        } finally {
            // Garante que o carregando nunca fique travado na tela.
            if (EL.carregando) EL.carregando.hidden = true;
        }
    }

    /* =====================================================================
       4. EVENTOS
       ===================================================================== */

    /* O clique nos botões do card é delegado: os cards são recriados a cada
     * desenho da lista, e um listener em cada card seria trabalho jogado
     * fora. */
    function onCardClick(evento) {
        const botao = evento.target.closest('[data-acao]');
        if (!botao) return;

        const cartao = botao.closest('[data-article-id]');
        if (!cartao) return;

        const id = cartao.getAttribute('data-article-id');
        const acao = botao.getAttribute('data-acao');

        if (acao === 'favoritar') {
            const agoraFavorito = D.alternarFavorito(id);
            botao.classList.toggle('is-ativo', agoraFavorito);
            botao.setAttribute('aria-pressed', agoraFavorito ? 'true' : 'false');
            const icone = botao.querySelector('i');
            if (icone) icone.className = `fa-${agoraFavorito ? 'solid' : 'regular'} fa-heart`;
            return;
        }

        if (acao === 'ouvir') {
            const artigo = ESTADO.artigos.find(a => a.id === id);
            if (!artigo) return;

            if (!D.podeFalar()) {
                avisar('Este navegador não tem leitura em voz alta.');
                return;
            }

            const começou = D.falar(artigo);
            botao.classList.toggle('is-ativo', começou);
            if (!começou) D.pararDeFalar();
        }
    }

    /* Um aviso curto, no canto. some sozinho. */
    let avisoTimer = null;
    function avisar(texto) {
        let caixa = document.getElementById('artigoAviso');

        if (!caixa) {
            caixa = document.createElement('div');
            caixa.id = 'artigoAviso';
            caixa.setAttribute('role', 'status');
            caixa.style.cssText = [
                'position:fixed', 'left:50%', 'bottom:1.5rem', 'transform:translateX(-50%)',
                'z-index:90', 'padding:.7rem 1.1rem', 'border-radius:999px',
                'background:var(--cm-text)', 'color:var(--cm-bg)',
                'font-size:.88rem', 'font-weight:600', 'box-shadow:var(--cm-shadow-hover)'
            ].join(';');
            document.body.appendChild(caixa);
        }

        caixa.textContent = texto;
        caixa.hidden = false;

        clearTimeout(avisoTimer);
        avisoTimer = setTimeout(() => { caixa.hidden = true; }, 3200);
    }

    function ligarEventos() {
        if (EL.filtroSecao) {
            EL.filtroSecao.addEventListener('click', (evento) => {
                const chip = evento.target.closest('.artigos-chip');
                if (!chip) return;
                ESTADO.filtros.secao = chip.dataset.secao || '';
                marcarAtivo(EL.filtroSecao, 'secao', ESTADO.filtros.secao);
                desenhar();
            });
        }

        if (EL.filtroTipo) {
            EL.filtroTipo.addEventListener('click', (evento) => {
                const chip = evento.target.closest('.artigos-chip');
                if (!chip) return;
                ESTADO.filtros.tipo = chip.dataset.tipo || '';
                marcarAtivo(EL.filtroTipo, 'tipo', ESTADO.filtros.tipo);
                desenhar();
            });
        }

        if (EL.grade) EL.grade.addEventListener('click', onCardClick);

        // Parar de falar quando a pessoa sai da página.
        window.addEventListener('beforeunload', D.pararDeFalar);
    }

    /* =====================================================================
       5. A SESSÃO
       ===================================================================== */

    /* O espelho do login é gerenciado pelo auth-global.js, que grava
     * userLoggedIn no localStorage de forma assíncrona (sincronizaComSupabase).
     * Ler o localStorage logo de cara pode dar visitante falso quando o
     * espelho ainda não foi gravado. Então a gente:
     *   1. usa window.AuthGlobal.isLoggedIn() (a API pública do auth-global);
     *   2. se ainda não deu true, espera um pouco e tenta de novo (até 3x);
     *   3. como último recurso, olha o data-auth no body, que o auth-global
     *      define após sincronizar com o Supabase. */
    function ajustarSessao() {
        function checar() {
            const authGlobal = window.AuthGlobal;
            const logado = authGlobal
                ? authGlobal.isLoggedIn()
                : localStorage.getItem('userLoggedIn') === 'true';

            if (EL.loginAviso) EL.loginAviso.hidden = logado;
            if (EL.btnEscrever && !logado) {
                EL.btnEscrever.setAttribute('aria-disabled', 'true');
                EL.btnEscrever.setAttribute('title', 'Entre para escrever um artigo');
            }

            // Fallback: data-auth no body, definido pelo auth-global.js.
            if (!logado && document.body.dataset.auth === 'member') {
                if (EL.loginAviso) EL.loginAviso.hidden = true;
                if (EL.btnEscrever) {
                    EL.btnEscrever.removeAttribute('aria-disabled');
                    EL.btnEscrever.removeAttribute('title');
                }
            }

            // Se ainda não sabe se está logado, tenta de novo depois.
            if (!logado && tentativas < 3) {
                tentativas++;
                setTimeout(checar, 400);
            }
        }

        let tentativas = 0;
        checar();
    }

    /* =====================================================================
       6. INÍCIO
       ===================================================================== */

    function iniciar() {
        montarFiltroSecao();
        montarFiltroTipo();
        ligarEventos();
        ajustarSessao();
        carregar();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
