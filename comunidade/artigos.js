/* ==========================================================================
   ARTIGOS.JS - a área "Artigos" da Comunidade
   --------------------------------------------------------------------------
   A tela que reúne o que a comunidade escreveu: a listagem, os filtros e os
   botões de cada card (ouvir, favoritar).

   A leitura do banco e a montagem do card NÃO são feitas aqui - elas estão
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
        btnEscrever: document.getElementById('btnEscreverArtigo'),

        // Modal Substack
        modalBackdrop:    document.getElementById('modalBackdrop'),
        modalContainer:   document.getElementById('modalContainer'),
        modalCloseBtn:    document.getElementById('closeModalBtn'),
        modalContent:     document.getElementById('modalContent'),
        modalArticleBody: document.getElementById('modalArticleBody'),
        modalLikeBtn:     document.getElementById('modalLikeBtn'),
        modalLikeCount:   document.getElementById('modalLikeCount'),
        modalCommentBtn:  document.getElementById('modalCommentBtn'),
        modalCommentCount: document.getElementById('modalCommentCount'),
        modalRestackBtn:  document.getElementById('modalRestackBtn'),
        modalRestackCount: document.getElementById('modalRestackCount'),
        modalShareBtn:    document.getElementById('modalShareBtn'),
        modalPrevBtn:     document.getElementById('modalPrevBtn'),
        modalNextBtn:     document.getElementById('modalNextBtn'),
        modalPlayBtn:     document.getElementById('modalPlayBtn'),
        modalMoreBtn:     document.getElementById('modalMoreBtn'),
    };

    const ESTADO = {
        artigos: [],
        filtros: { aba: 'todos' },
        ordenacao: 'prioridade'
    };
    let artigoSelecionadoModal = null;
    let artigoSelecionadoIndex = -1;

    /* =====================================================================
       1. AS ABAS E A ORDENAÇÃO
       ===================================================================== */

    const ORDENACOES = ['prioridade', 'recentes', 'lidos', 'curtidos', 'az'];

    function temAudio(artigo) {
        const c = String(artigo?.content || '');
        return /\[[áa]udio:/i.test(c) || /<audio\b/i.test(c);
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
            const card = D.montarCard(artigo, perfil, { mostrarFavorito: true });
            const link = card.querySelector('.art-card__link');
            if (link) {
                link.setAttribute('href', 'javascript:void(0)');
                link.style.cursor = 'pointer';
            }
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                if (e.target.closest('[data-acao]')) return;
                e.preventDefault();
                e.stopPropagation();
                const idx = ESTADO.artigos.findIndex(a => a.id === artigo.id);
                abrirModalArtigo(artigo, idx);
            });
            frag.appendChild(card);
        }

        if (EL.grade) EL.grade.replaceChildren(frag);
    }

    /* =====================================================================
       3. CARREGAR
       ===================================================================== */

    async function carregar() {
        mostrarCarregando();

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

            const ids = artigos.map(a => a.author_id).filter(Boolean);
            const perfis = await D.lerAutores(ids);
            ESTADO.perfis = perfis;

            desenhar();
        } catch (e) {
            console.error('[artigos] Erro inesperado ao carregar:', e);
            mostrarErro('Não foi possível carregar os artigos agora. Verifique sua conexão e tente de novo.');
        } finally {
            if (EL.carregando) EL.carregando.hidden = true;
        }
    }

    /* =====================================================================
       4. MODAL SUBSTACK - Leitura em overlay
       ===================================================================== */

    function resetarBarraModal() {
        const likeBtn = EL.modalLikeBtn;
        const restackBtn = EL.modalRestackBtn;

        if (likeBtn) {
            likeBtn.classList.remove('text-red-500');
            // Base muted colors are in HTML: text-brand-lightTextMuted dark:text-brand-textMuted
            const icon = likeBtn.querySelector('i');
            if (icon) icon.removeAttribute('fill');
        }
        if (restackBtn) {
            restackBtn.classList.remove('text-green-500');
        }
    }

    async function abrirModalArtigo(artigo, index) {
        if (!EL.modalBackdrop || !EL.modalContainer) return;

        artigoSelecionadoModal = artigo;
        artigoSelecionadoIndex = index;

        // Reset UI
        resetarBarraModal();

        // Show backdrop with animation
        EL.modalBackdrop.hidden = false;
        requestAnimationFrame(() => {
            EL.modalBackdrop.classList.remove('opacity-0', 'pointer-events-none');
            EL.modalBackdrop.classList.add('opacity-100');
            EL.modalContainer.classList.remove('scale-98');
            EL.modalContainer.classList.add('scale-100');
        });
        document.body.style.overflow = 'hidden';

        try {
            desenharArtigoNoModal(artigo);
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }
        } catch (e) {
            console.error('[artigos] Erro ao abrir modal de leitura:', e);
        }
    }

    function fecharModalArtigo() {
        if (!EL.modalBackdrop || !EL.modalContainer) return;

        EL.modalBackdrop.classList.remove('opacity-100');
        EL.modalBackdrop.classList.add('opacity-0', 'pointer-events-none');
        EL.modalContainer.classList.remove('scale-100');
        EL.modalContainer.classList.add('scale-98');

        setTimeout(() => {
            EL.modalBackdrop.hidden = true;
            document.body.style.overflow = '';
            artigoSelecionadoModal = null;
            artigoSelecionadoIndex = -1;
        }, 200);
    }

    function desenharArtigoNoModal(artigo) {
        if (!D) return;

        const nomeAutor = artigo.author_name || 'Membro da Comunidade';
        const tipoTag = artigo.kind || 'Artigo';
        const secaoTag = artigo.category || 'Reflexão';
        const min = Number(artigo.read_minutes) || (D ? D.minutosLeitura(artigo.content) : 3);
        const data = D ? D.formatarData(artigo.created_at) || 'recente' : 'recente';
        const renderizado = D ? D.renderizarConteudo(artigo.content) : '<p>' + (artigo.content || '') + '</p>';

        const avatarUrl = (D ? D.urlSegura(artigo.author_avatar) : null) || '/img/foto-padrão.jpg';

        // Build article HTML matching Substack style - prose handles colors via light/dark
        EL.modalArticleBody.innerHTML =
            '<header class="mb-8 space-y-4">' +
            '  <div class="flex items-center space-x-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">' +
            '    <span>' + D.escapeHtml(secaoTag) + '</span>' +
            '  </div>' +
            '  <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">' + D.escapeHtml(artigo.title || 'Sem título') + '</h1>' +
            (artigo.subtitle ? '<p class="text-lg sm:text-xl leading-relaxed font-normal">' + D.escapeHtml(artigo.subtitle) + '</p>' : '') +
            '  <div class="flex items-center space-x-3 pt-4 border-t">' +
            '    <img src="' + avatarUrl + '" alt="Avatar" class="w-10 h-10 rounded-full object-cover border" />' +
            '    <div>' +
            '      <p class="text-sm font-semibold">' + D.escapeHtml(nomeAutor) + '</p>' +
            '      <p class="text-xs">' + D.escapeHtml(data) + ' · ' + min + ' min de leitura</p>' +
            '    </div>' +
            '  </div>' +
            '</header>' +
            '<div class="prose dark:prose-invert max-w-none space-y-7">' + renderizado + '</div>';

        // Update toolbar counts
        if (EL.modalLikeCount) EL.modalLikeCount.textContent = Number(artigo.likes || 0);
        if (EL.modalCommentCount) EL.modalCommentCount.textContent = Number(artigo.comments_count || artigo.comments || 0);
        if (EL.modalRestackCount) EL.modalRestackCount.textContent = Number(artigo.restacks || artigo.reposts || 0);

        // Recreate Lucide icons in injected content
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }

    function navegarArtigo(direcao) {
        if (!artigoSelecionadoModal) return;
        const lista = ordenar(filtrar());
        const novoIndex = artigoSelecionadoIndex + direcao;
        if (novoIndex >= 0 && novoIndex < lista.length) {
            abrirModalArtigo(lista[novoIndex], novoIndex);
        }
    }

    function ligarEventosModalArtigo() {
        // Close button
        if (EL.modalCloseBtn) {
            EL.modalCloseBtn.addEventListener('click', fecharModalArtigo);
        }

        // Click backdrop to close
        if (EL.modalBackdrop) {
            EL.modalBackdrop.addEventListener('click', (e) => {
                if (e.target === EL.modalBackdrop) fecharModalArtigo();
            });
        }

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && EL.modalBackdrop && !EL.modalBackdrop.hidden) {
                fecharModalArtigo();
            }
        });

        // Navigation
        if (EL.modalPrevBtn) {
            EL.modalPrevBtn.addEventListener('click', () => navegarArtigo(-1));
        }
        if (EL.modalNextBtn) {
            EL.modalNextBtn.addEventListener('click', () => navegarArtigo(1));
        }

        // Keyboard nav (j/k or arrow keys)
        document.addEventListener('keydown', (e) => {
            if (EL.modalBackdrop && !EL.modalBackdrop.hidden) {
                if (e.key === 'ArrowUp' || e.key === 'j') {
                    e.preventDefault();
                    navegarArtigo(-1);
                } else if (e.key === 'ArrowDown' || e.key === 'k') {
                    e.preventDefault();
                    navegarArtigo(1);
                }
            }
        });

        // Like toggle
        if (EL.modalLikeBtn) {
            EL.modalLikeBtn.addEventListener('click', () => {
                const countEl = EL.modalLikeCount;
                const icon = EL.modalLikeBtn.querySelector('i');
                const liked = EL.modalLikeBtn.classList.toggle('text-red-500');
                if (liked) {
                    if (icon) icon.setAttribute('fill', 'currentColor');
                    if (countEl) countEl.textContent = (Number(countEl.textContent) || 0) + 1;
                } else {
                    if (icon) icon.removeAttribute('fill');
                    if (countEl) countEl.textContent = Math.max(0, (Number(countEl.textContent) || 0) - 1);
                }
                // Sync with article data
                if (artigoSelecionadoModal) {
                    artigoSelecionadoModal.likes = Number(countEl.textContent) || 0;
                }
            });
        }

        // Restack toggle
        if (EL.modalRestackBtn) {
            EL.modalRestackBtn.addEventListener('click', () => {
                const countEl = EL.modalRestackCount;
                const restacked = EL.modalRestackBtn.classList.toggle('text-green-500');
                if (restacked) {
                    if (countEl) countEl.textContent = (Number(countEl.textContent) || 0) + 1;
                } else {
                    if (countEl) countEl.textContent = Math.max(0, (Number(countEl.textContent) || 0) - 1);
                }
                if (artigoSelecionadoModal) {
                    artigoSelecionadoModal.restacks = Number(countEl.textContent) || 0;
                }
            });
        }

        // Share
        if (EL.modalShareBtn) {
            EL.modalShareBtn.addEventListener('click', () => {
                const url = window.location.origin + '/comunidade/artigo.html?id=' + encodeURIComponent(artigoSelecionadoModal?.id);
                if (navigator.clipboard && url) {
                    navigator.clipboard.writeText(url).then(() => {
                        if (typeof avisar === 'function') avisar('Link copiado!');
                    });
                }
            });
        }

        // Comment - scroll to comments section or show prompt
        if (EL.modalCommentBtn) {
            EL.modalCommentBtn.addEventListener('click', () => {
                // Could open a comment panel or navigate to article page
                if (typeof avisar === 'function') {
                    avisar('Comentários disponíveis na página do artigo');
                }
            });
        }

        // Play button - could trigger TTS
        if (EL.modalPlayBtn) {
            EL.modalPlayBtn.addEventListener('click', () => {
                if (D && D.podeFalar && D.falar) {
                    const comeu = D.falar(artigoSelecionadoModal);
                    if (!comeu && D.pararDeFalar) D.pararDeFalar();
                }
            });
        }
    }

    /* =====================================================================
       5. EVENTOS DOS CARDS
       ===================================================================== */

    function onCardClick(evento) {
        const link = evento.target.closest('.art-card__link');
        if (link) {
            evento.preventDefault();
            const cartao = link.closest('[data-article-id]');
            if (cartao) {
                const id = cartao.getAttribute('data-article-id');
                const artigo = ESTADO.artigos.find(a => a.id === id);
                if (artigo) {
                    const idx = ESTADO.artigos.findIndex(a => a.id === id);
                    abrirModalArtigo(artigo, idx);
                }
            }
            return;
        }

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

            const comecou = D.falar(artigo);
            botao.classList.toggle('is-ativo', comecou);
            if (!comecou) D.pararDeFalar();
        }
    }

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

        ligarEventosModalArtigo();

        window.addEventListener('beforeunload', D.pararDeFalar);
    }

    /* =====================================================================
       6. SESSÃO
       ===================================================================== */

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

            if (!logado && document.body.dataset.auth === 'member') {
                if (EL.loginAviso) EL.loginAviso.hidden = true;
                if (EL.btnEscrever) {
                    EL.btnEscrever.removeAttribute('aria-disabled');
                    EL.btnEscrever.removeAttribute('title');
                }
            }

            if (!logado && tentativas < 3) {
                tentativas++;
                setTimeout(checar, 400);
            }
        }

        let tentativas = 0;
        checar();
    }

    /* =====================================================================
       7. INÍCIO
       ===================================================================== */

    function iniciar() {
        ligarEventos();
        ajustarSessao();
        carregar();
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();