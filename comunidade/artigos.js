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
        abas:        document.getElementById('artigoAbas'),
        ordenacao:   document.getElementById('artigoOrdenacao'),
        carregando: document.getElementById('artigoCarregando'),
        estado:     document.getElementById('artigoEstado'),
        grade:      document.getElementById('artigoGrade'),
        loginAviso: document.getElementById('artigoLoginAviso'),
        btnEscrever: document.getElementById('btnEscreverArtigo')
    };

    const ESTADO = {
        artigos: [],
        filtros: { aba: 'todos' },
        ordenacao: 'prioridade'
    };

    /* =====================================================================
       1. AS ABAS E A ORDENAÇÃO
       --------------------------------------------------------------------------
       A barra vem do mockup: Todos | Ouça | Pago | Favorito | História, com a
       ordenação por Prioridade do outro lado. Cada aba é um filtro sobre a
       MESMA lista — nada de nova consulta ao banco.

       O que cada aba significa, com o que existe no card e na tabela:

         Todos     — a lista inteira.
         Ouça      — artigos que trazem áudio embutido (bloco [Áudio: ...]
                     do markdown-lite ou <audio> do editor visual). Todo
                     card tem o botão de leitura em voz alta; esta aba é
                     para quem procura gravação de verdade.
         Pago      — artigos com is_paid (o editor tem o campo "Pago").
         Favorito  — as leituras salvas desta pessoa (localStorage, a mesma
                     lista do coração dos cards).
         História  — kind "História" (ou a seção "Histórias").
       ===================================================================== */

    const ORDENACOES = ['prioridade', 'recentes', 'lidos', 'curtidos', 'az'];

    /* Áudio embutido: o bloco do markdown-lite ou o <audio> do editor visual. */
    function temAudio(artigo) {
        const c = String(artigo?.content || '');
        return /\[[Áá]udio:/i.test(c) || /<audio\b/i.test(c);
    }

    function marcarAtivo(container, atributo, valor) {
        if (!container) return;
        container.querySelectorAll('[data-' + atributo + ']').forEach(botao => {
            const ativado = (botao.dataset[atributo] || '') === valor;
            botao.classList.toggle('is-ativo', ativado);
            botao.setAttribute('aria-pressed', ativado ? 'true' : 'false');
        });
    }

    /* =====================================================================
       2. FILTRAR E DESENHAR
       ===================================================================== */

    function filtrar() {
        const aba = ESTADO.filtros.aba;

        return ESTADO.artigos.filter(artigo => {
            switch (aba) {
                case 'pago':     return artigo.is_paid === true;
                case 'favorito': return D.ehFavorito(artigo.id);
                case 'historia': return (artigo.kind || '') === 'História'
                                      || (artigo.category || '') === 'Histórias';
                case 'ouca':     return temAudio(artigo);
                default:         return true;
            }
        });
    }

    /* A ordenação é local: os artigos já estão todos na página. O empate
     * em prioridade cai na data — o mais novo primeiro, como antes. */
    function porDataDesc(a, b) {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }

    function ordenar(lista) {
        const copia = [...lista];
        const numero = v => Number(v) || 0;

        switch (ESTADO.ordenacao) {
            case 'recentes': return copia.sort(porDataDesc);
            case 'lidos':    return copia.sort((a, b) => numero(b.views) - numero(a.views) || porDataDesc(a, b));
            case 'curtidos': return copia.sort((a, b) => numero(b.likes) - numero(a.likes) || porDataDesc(a, b));
            case 'az':       return copia.sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR'));
            default:         return copia.sort((a, b) => numero(b.priority) - numero(a.priority) || porDataDesc(a, b));
        }
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

        // Um "nenhum resultado" honesto: diz o que a aba procura e por que
        // ela pode estar vazia, em vez de um genérico "tente de novo".
        const avisos = {
            ouca: ['Nenhum artigo com áudio ainda',
                   'Todo artigo pode ser lido em voz alta pelo coração do card. Quando alguém publicar uma gravação, ela aparece aqui.'],
            pago: ['Nenhum artigo pago agora',
                   'Quando a comunidade publicar algo pago, ele aparece nesta aba.'],
            favorito: ['Sua lista de favoritos está vazia',
                   'Toque no coração de um artigo para guardar a leitura aqui.'],
            historia: ['Nenhuma história por enquanto',
                   'Quando alguém publicar uma História, ela aparece nesta aba.']
        };

        const [titulo, texto, linkTexto, linkUrl] = avisos[ESTADO.filtros.aba] || [
            'Nenhum artigo nesta seleção',
            'Tente outra aba. Se ninguém escreveu ainda, o primeiro artigo pode ser o seu.',
            'Escrever o primeiro artigo',
            '/comunidade/escrever-artigo.html'
        ];

        if (EL.estado) {
            EL.estado.innerHTML = D.estadoVazio(titulo, texto, linkTexto, linkUrl);
        }
    }

    function desenhar() {
        const lista = ordenar(filtrar());

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

            // Na aba Favorito, desfavoritar tira o card da vista na hora —
            // e favoritar de outra aba já deixa o card pronto para a próxima.
            if (ESTADO.filtros.aba === 'favorito') desenhar();
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
        if (EL.abas) {
            EL.abas.addEventListener('click', (evento) => {
                const botao = evento.target.closest('[data-aba]');
                if (!botao) return;
                ESTADO.filtros.aba = botao.dataset.aba || 'todos';
                marcarAtivo(EL.abas, 'aba', ESTADO.filtros.aba);
                desenhar();
            });
        }

        if (EL.ordenacao) {
            EL.ordenacao.addEventListener('change', () => {
                const valor = EL.ordenacao.value;
                ESTADO.ordenacao = ORDENACOES.includes(valor) ? valor : 'prioridade';
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
