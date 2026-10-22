// =========================================================================
// BLOG.JS — Amor NeuroDivergente
// Sidebar + Perfil + Acessibilidade + Hub + Blog dinâmico + Vídeos
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;

    // =============================================
    // 0. SINCRONIZAÇÃO DE PERFIL
    // =============================================
    function syncProfile() {
        const savedName = localStorage.getItem('userName');
        const savedEmail = localStorage.getItem('userEmail');
        const savedAvatar = localStorage.getItem('userAvatar');

        const sidebarAvatar = document.getElementById('sidebarAvatar');
        const sidebarUserName = document.getElementById('sidebarUserName');
        const sidebarUserEmail = document.getElementById('sidebarUserEmail');

        if (sidebarAvatar && savedAvatar) {
            sidebarAvatar.src = savedAvatar;
            sidebarAvatar.onerror = () => { sidebarAvatar.src = '/img/foto-padrão.jpg'; };
        }
        if (sidebarUserName && savedName) sidebarUserName.textContent = savedName;
        if (sidebarUserEmail && savedEmail) sidebarUserEmail.textContent = savedEmail;
    }
    syncProfile();
    window.addEventListener('storage', (e) => {
        if (['userAvatar', 'userName', 'userEmail'].includes(e.key)) syncProfile();
    });

    // =============================================
    // 1. SIDEBAR RESPONSIVA
    // =============================================
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
        if (!sidebar) return;
        sidebar.classList.add('open');
        if (sidebarOverlay) sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (sidebarToggleBtn) {
            sidebarToggleBtn.setAttribute('aria-label', 'Fechar menu lateral');
            sidebarToggleBtn.setAttribute('aria-expanded', 'true');
        }
    }
    function closeSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
        if (sidebarToggleBtn) {
            sidebarToggleBtn.setAttribute('aria-label', 'Abrir menu lateral');
            sidebarToggleBtn.setAttribute('aria-expanded', 'false');
        }
    }
    function toggleSidebar() {
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    }

    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });
    }
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) closeSidebar();
    });

    // =============================================
    // 2. PERFIL COLAPSÁVEL
    // =============================================
    const profileToggle = document.getElementById('profileToggle');
    const profileDetail = document.getElementById('profileDetail');

    if (profileToggle && profileDetail) {
        profileToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const hidden = profileDetail.hasAttribute('hidden');
            if (hidden) {
                profileDetail.removeAttribute('hidden');
                profileToggle.setAttribute('aria-expanded', 'true');
            } else {
                profileDetail.setAttribute('hidden', '');
                profileToggle.setAttribute('aria-expanded', 'false');
            }
        });
        document.addEventListener('click', (e) => {
            if (!profileDetail.hasAttribute('hidden') &&
                !profileDetail.contains(e.target) &&
                !profileToggle.contains(e.target)) {
                profileDetail.setAttribute('hidden', '');
                profileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // =============================================
    // 3. ACESSIBILIDADE
    // =============================================
    function getA11y(key, defaultValue = 'false') {
        return localStorage.getItem('a11y_' + key) || defaultValue;
    }
    function setA11y(key, value) {
        localStorage.setItem('a11y_' + key, value);
    }
    function updateStatus(id, isActive) {
        const el = document.getElementById(id);
        if (el) el.textContent = isActive ? 'Ligado' : 'Desligado';
    }

    function applyA11ySettings() {
        const isDarkMode = getA11y('darkMode') === 'true';
        body.classList.toggle('a11y-dark-mode', isDarkMode);
        updateStatus('darkModeStatus', isDarkMode);

        const isHighlightLinks = getA11y('highlightLinks') === 'true';
        body.classList.toggle('a11y-highlight-links', isHighlightLinks);
        updateStatus('linksStatus', isHighlightLinks);

        const isDyslexia = getA11y('dyslexiaFont') === 'true';
        body.classList.toggle('a11y-dyslexia', isDyslexia);
        updateStatus('dyslexiaStatus', isDyslexia);

        const isReducedMotion = getA11y('reduceMotion') === 'true';
        body.classList.toggle('a11y-reduce-motion', isReducedMotion);
        updateStatus('motionStatus', isReducedMotion);

        const textSize = getA11y('textSize', 'normal');
        const main = document.getElementById('mainContent') || document.querySelector('.main-content');
        if (main) {
            main.classList.remove('a11y-large-text', 'a11y-small-text');
            if (textSize === 'large') main.classList.add('a11y-large-text');
            if (textSize === 'small') main.classList.add('a11y-small-text');
        }
    }
    applyA11ySettings();

    function handleA11yAction(action) {
        const main = document.getElementById('mainContent') || document.querySelector('.main-content');
        switch (action) {
            case 'darkMode': {
                const current = getA11y('darkMode') === 'true';
                setA11y('darkMode', current ? 'false' : 'true');
                body.classList.toggle('a11y-dark-mode', !current);
                updateStatus('darkModeStatus', !current);
                updateHubStatus();
                break;
            }
            case 'increaseText': {
                const current = getA11y('textSize', 'normal');
                if (current === 'large') {
                    setA11y('textSize', 'normal');
                    if (main) main.classList.remove('a11y-large-text');
                } else {
                    setA11y('textSize', 'large');
                    if (main) {
                        main.classList.remove('a11y-small-text');
                        main.classList.add('a11y-large-text');
                    }
                }
                break;
            }
            case 'decreaseText': {
                const current = getA11y('textSize', 'normal');
                if (current === 'small') {
                    setA11y('textSize', 'normal');
                    if (main) main.classList.remove('a11y-small-text');
                } else {
                    setA11y('textSize', 'small');
                    if (main) {
                        main.classList.remove('a11y-large-text');
                        main.classList.add('a11y-small-text');
                    }
                }
                break;
            }
            case 'highlightLinks': {
                const current = getA11y('highlightLinks') === 'true';
                setA11y('highlightLinks', current ? 'false' : 'true');
                body.classList.toggle('a11y-highlight-links', !current);
                updateStatus('linksStatus', !current);
                break;
            }
            case 'dyslexiaFont': {
                const current = getA11y('dyslexiaFont') === 'true';
                setA11y('dyslexiaFont', current ? 'false' : 'true');
                body.classList.toggle('a11y-dyslexia', !current);
                updateStatus('dyslexiaStatus', !current);
                updateHubStatus();
                break;
            }
            case 'reduceMotion': {
                const current = getA11y('reduceMotion') === 'true';
                setA11y('reduceMotion', current ? 'false' : 'true');
                body.classList.toggle('a11y-reduce-motion', !current);
                updateStatus('motionStatus', !current);
                updateHubStatus();
                break;
            }
            case 'reset': {
                ['darkMode', 'highlightLinks', 'dyslexiaFont', 'reduceMotion', 'textSize'].forEach(k => {
                    localStorage.removeItem('a11y_' + k);
                });
                body.classList.remove('a11y-dark-mode', 'a11y-highlight-links', 'a11y-dyslexia', 'a11y-reduce-motion');
                if (main) main.classList.remove('a11y-large-text', 'a11y-small-text');
                updateStatus('darkModeStatus', false);
                updateStatus('linksStatus', false);
                updateStatus('dyslexiaStatus', false);
                updateStatus('motionStatus', false);
                updateHubStatus();
                break;
            }
        }
    }

    document.querySelectorAll('.a11y-option, .a11y-reset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleA11yAction(btn.getAttribute('data-a11y'));
        });
    });

    // =============================================
    // 4. HUB FLUTUANTE
    // =============================================
    const hubToggle = document.getElementById('floatingHubToggle');
    const hubMenu = document.getElementById('floatingHubMenu');
    const overlay = document.getElementById('floatingOverlay');

    function toggleHub() {
        if (!hubToggle || !hubMenu || !overlay) return;
        const isOpen = !hubMenu.hidden;
        hubMenu.hidden = isOpen;
        overlay.hidden = isOpen;
        hubToggle.setAttribute('aria-expanded', !isOpen);
    }
    function closeHub() {
        if (!hubToggle || !hubMenu || !overlay) return;
        hubMenu.hidden = true;
        overlay.hidden = true;
        hubToggle.setAttribute('aria-expanded', 'false');
    }

    if (hubToggle && hubMenu && overlay) {
        hubToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleHub();
        });
        overlay.addEventListener('click', closeHub);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeHub();
        });
    }

    function updateHubStatus() {
        const darkLabel = document.querySelector('.hub-action[data-a11y="darkMode"] .hub-action-label');
        if (darkLabel) darkLabel.textContent = body.classList.contains('a11y-dark-mode') ? 'Claro' : 'Escuro';

        const dyslexiaLabel = document.querySelector('.hub-action[data-a11y="dyslexiaFont"] .hub-action-label');
        if (dyslexiaLabel) dyslexiaLabel.textContent = body.classList.contains('a11y-dyslexia') ? 'Ativo' : 'Dislexia';

        const motionLabel = document.querySelector('.hub-action[data-a11y="reduceMotion"] .hub-action-label');
        if (motionLabel) motionLabel.textContent = body.classList.contains('a11y-reduce-motion') ? 'Ativo' : 'Movimento';
    }
    updateHubStatus();

    document.querySelectorAll('.hub-action[data-a11y]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            handleA11yAction(item.getAttribute('data-a11y'));
            closeHub();
        });
    });
    document.querySelectorAll('.hub-action[href]').forEach(link => {
        link.addEventListener('click', closeHub);
    });

    // =============================================
    // 5. HEADER SCROLL EFFECT
    // =============================================
    const headerGlass = document.getElementById('headerGlass');
    if (headerGlass) {
        window.addEventListener('scroll', () => {
            headerGlass.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // =============================================
    // 6. LOGOUT
    // =============================================
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Tem certeza que deseja sair?')) {
            ['userLoggedIn', 'userName', 'userEmail', 'userAvatar'].forEach(k => localStorage.removeItem(k));
            window.location.href = '/login/login.html';
        }
    });

    // =============================================
    // 7. SCROLL TOP
    // =============================================
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
        });
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // =============================================
    // 8. TOAST
    // =============================================
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toastMsg');
        if (!toast) return;
        toast.textContent = message;
        toast.className = `toast-msg-custom ${type} show`;
        setTimeout(() => { toast.classList.remove('show'); }, 2500);
    }
    window.showToast = showToast;

    // =============================================
    // 9. FILTROS POR CATEGORIA (chips)
    // =============================================
    const blogNavChips = document.querySelectorAll('.blog-nav__chip');
    // `.bl-item`, e nao `.editorial-card`: o card em destaque do hero
    // tambem tem `.editorial-card`, e filtrar por ela sumia com o
    // destaque da pagina sempre que alguem clicasse num filtro.
    const editorialCards = document.querySelectorAll('.bl-item');
    const blogEmpty = document.getElementById('blogEmpty');

    if (blogNavChips.length && editorialCards.length) {
        blogNavChips.forEach(chip => {
            chip.addEventListener('click', () => {
                blogNavChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                const filter = chip.getAttribute('data-filter');
                let visibleCount = 0;

                editorialCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    const shouldShow = filter === 'todos' || category === filter;
                    card.hidden = !shouldShow;
                    if (shouldShow) visibleCount++;
                });

                if (blogEmpty) blogEmpty.hidden = visibleCount > 0;
            });
        });
    }

    // =============================================
    // 10. MODAL DE VÍDEO (Lightbox)
    // =============================================
    const videoModal = document.getElementById('videoModal');
    const videoModalBg = document.getElementById('videoModalBg');
    const videoModalClose = document.getElementById('videoModalClose');
    const videoModalEmbed = document.getElementById('videoModalEmbed');

    function openVideoModal(videoId) {
        if (!videoModal || !videoModalEmbed) return;
        videoModalEmbed.innerHTML = `
            <iframe 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
                title="Vídeo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
            </iframe>
        `;
        videoModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeVideoModal() {
        if (!videoModal || !videoModalEmbed) return;
        videoModalEmbed.innerHTML = '';
        videoModal.hidden = true;
        document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-video-id]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const videoId = trigger.getAttribute('data-video-id');
            if (videoId) openVideoModal(videoId);
        });
    });

    videoModalClose?.addEventListener('click', closeVideoModal);
    videoModalBg?.addEventListener('click', closeVideoModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal && !videoModal.hidden) {
            closeVideoModal();
        }
    });

    // =============================================
    // 11. PAGINAÇÃO (placeholder visual)
    // =============================================
    const paginationBtns = document.querySelectorAll('.blog-pagination__page');
    if (paginationBtns.length) {
        paginationBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                paginationBtns.forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                const target = document.querySelector('.blog-grid-section');
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // =============================================
    // 12. PUBLICAÇÕES DA COMUNIDADE (tabela `posts`)
    // =============================================
    /* Lê a tabela `posts` — a MESMA que a Comunidade grava — e monta os
     * cards da seção #blogComunidade.
     *
     * POR QUE AQUI E NÃO EM blog.html
     * O restante dos cards da página é HTML fixo. Só esta seção vem do
     * banco, porque só ela representa conteúdo que a comunidade escreve.
     *
     * RESOLUÇÃO DO AUTOR, e por que ela é necessária
     * Verificado no banco: `posts.author_name` e `posts.author_avatar`
     * são SEMPRE null — o insert em comunidade.js:251 não os envia.
     * Então o nome tem de vir de `profiles`, pelo `author_id`. É a mesma
     * cadeia de fallback que comunidade/post.js:226 já usa:
     *
     *     post.author_name  ||  profiles.username  ||  'Membro da comunidade'
     *
     * Se as duas primeiras faltarem, mostramos o rótulo genérico — nunca
     * inventamos um nome nem uma data.
     *
     * O QUE NÃO É FEITO
     * - Não filtramos por categoria: o banco não tem esse dado (a coluna
     *   `tag` guarda só "# Geral", o nome do canal do Fórum). Filtrar por
     *   ela daria a impressão falsa de classificação.
     * - Não cortamos conteúdo por tamanho: não há como saber ainda o que
     *   é post curto e o que é relato. Isso é a Fase 3, adiada.
     */
    const PUBLICA_COMUNIDADE = {
        /* Os ARTIGOS: a mesma lista, o mesmo card, o mesmo modulo da area
         * Artigos da Comunidade. Vem da tabela `articles`. */
        artigos:    document.getElementById('comunidadeArtigosLista'),
        rotuloArtigos: document.getElementById('comunidadeArtigosRotulo'),
        carregando: document.getElementById('comunidadeCarregando'),
        erro:       document.getElementById('comunidadeErro'),
        erroTexto:  document.getElementById('comunidadeErroTexto'),
        vazio:      document.getElementById('comunidadeVazio'),
        rodape:     document.getElementById('comunidadeRodape'),
    };

    /* Quantos posts buscar. O Blog é vitrine, não o repositório inteiro:
     * a página da Comunidade é o lugar de ver tudo. */
    const LIMITE_COMUNIDADE = 6;

    /* Escapa o que vem do banco antes de entrar no HTML. O conteúdo é
     * escrito por usuário: sem isto, um post com "<script>" rodaria. */
    function escapeHtml(texto) {
        return String(texto ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /* Só aceita http(s) ou caminho do próprio site. Bloqueia
     * `javascript:` e `data:` vindos de um avatar gravado no banco. */
    function urlSegura(url) {
        if (!url) return null;
        const t = String(url).trim();
        if (t.startsWith('/')) return t;
        if (/^https?:\/\//i.test(t)) return t;
        return null;
    }

    /* Data em formato curto e legível. Sem data → sem data (não chuta). */
    function formatarData(iso) {
        if (!iso) return null;
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return null;
        const dias = Math.floor((Date.now() - d.getTime()) / 86400000);
        if (dias <= 0) return 'hoje';
        if (dias === 1) return 'ontem';
        if (dias < 30) return `há ${dias} dias`;
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    /* Trecho: o conteúdo pode ser curto ("post") ou longo. Não mexemos no
     * texto — só cortamos com reticências quando passa do limite. */
    function trecho(texto, limite = 220) {
        const t = String(texto ?? '').trim();
        if (t.length <= limite) return t;
        return t.slice(0, limite).replace(/\s+\S*$/, '') + '…';
    }

    /* Sentinela: evita mostrar "há 0 dias" ou um nome vazio. */
    const AVATAR_PADRAO = '/img/foto-padrão.jpg';

    /* O estado da seção. `posts` e `artigos` dizem o que TEM conteúdo:
     * às vezes há artigo e não há post (ninguém postou no Fórum, mas
     * alguém escreveu um artigo), e as duas listas precisam aparecer e
     * sumir separadamente. */
    function mostrarEstado(nome, opcoes = {}) {
        // 'carregando' | 'erro' | 'vazio' | 'lista'
        const { artigos = false } = opcoes;

        if (PUBLICA_COMUNIDADE.carregando) PUBLICA_COMUNIDADE.carregando.hidden = nome !== 'carregando';
        if (PUBLICA_COMUNIDADE.erro)       PUBLICA_COMUNIDADE.erro.hidden       = nome !== 'erro';
        if (PUBLICA_COMUNIDADE.vazio)      PUBLICA_COMUNIDADE.vazio.hidden      = nome !== 'vazio';
        if (PUBLICA_COMUNIDADE.artigos)    PUBLICA_COMUNIDADE.artigos.hidden    = nome !== 'lista' || !artigos;
        if (PUBLICA_COMUNIDADE.rotuloArtigos) PUBLICA_COMUNIDADE.rotuloArtigos.hidden = nome !== 'lista' || !artigos;
        if (PUBLICA_COMUNIDADE.rodape)     PUBLICA_COMUNIDADE.rodape.hidden     = nome !== 'lista';
    }

    /* Tempo de leitura: o mesmo resultado do módulo de artigos, para o
     * card dizer "3 min de leitura" igual a referência. Calcula sobre o
     * texto INTEIRO — o trecho do card está truncado e sempre daria 1. */
    function minutosDeLeitura(textoInteiro) {
        const D = window.artigosDados;
        if (D && typeof D.minutosLeitura === 'function') {
            return D.minutosLeitura(textoInteiro);
        }
        const palavras = String(textoInteiro ?? '').trim().split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.round(palavras / 220));
    }

    /* O card da publicação. O desenho segue a referência do cartão do
     * Substack: autor e data numa linha (data encostada na direita), o
     * texto no meio, e no rodapé curtidas, comentários e o tempo de
     * leitura. O card INTEIRO é o link — não há botão "Abrir" solto. */
    function montarCard(post, autor) {
        const nome = post.author_name || autor?.username || 'Membro da comunidade';
        const avatar = urlSegura(post.author_avatar) || urlSegura(autor?.avatar_url) || AVATAR_PADRAO;
        const data = formatarData(post.created_at);
        const texto = trecho(post.content);
        const url = `/comunidade/post.html?id=${encodeURIComponent(post.id)}`;
        const inicial = nome.trim().charAt(0).toUpperCase() || '?';
        const minutos = minutosDeLeitura(post.content);

        const card = document.createElement('article');
        card.className = 'comunidade-card';

        // O link cobre o card inteiro: um alvo de clique, não vários.
        card.innerHTML = `
            <a class="comunidade-card__link" href="${url}">
                <div class="comunidade-card__autor">
                    <span class="comunidade-card__avatar" aria-hidden="true">
                        <img src="${escapeHtml(avatar)}" alt="" loading="lazy"
                             onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'comunidade-card__inicial',textContent:'${escapeHtml(inicial)}'}))">
                    </span>
                    <strong class="comunidade-card__nome">${escapeHtml(nome)}</strong>
                    ${data ? `<span class="comunidade-card__data">${escapeHtml(data)}</span>` : ''}
                </div>
                <p class="comunidade-card__texto">${escapeHtml(texto)}</p>
                <span class="comunidade-card__rodape">
                    <span class="comunidade-card__contagem">
                        <i class="fa-regular fa-heart" aria-hidden="true"></i>
                        <span>${Number(post.likes) || 0}</span>
                    </span>
                    <span class="comunidade-card__contagem">
                        <i class="fa-regular fa-comment" aria-hidden="true"></i>
                        <span>${Number(post.comment_count) || 0}</span>
                    </span>
                    <span class="comunidade-card__tempo">${minutos} min de leitura</span>
                </span>
            </a>
        `;
        return card;
    }

    /* ------------------------------------------------------------------
     * Os ARTIGOS da comunidade.
     *
     * Vêm do módulo compartilhado (artigos-dados.js) — o mesmo que a área
     * Artigos, o perfil e o Explorar usam. É o que garante que o mesmo
     * artigo tenha o mesmo card nas quatro telas, em vez de quatro
     * formatos diferentes.
     *
     * Se a tabela `articles` ainda não existir (o sql/28_artigos.sql não
     * foi rodado), a falha é absorvida aqui: os posts continuam
     * aparecendo. Uma tabela que falta não pode derrubar a seção toda.
     * ------------------------------------------------------------------ */
    async function lerArtigosComunidade() {
        const D = window.artigosDados;
        if (!D) return [];

        try {
            const { artigos, erro } = await D.lerArtigos({ limite: LIMITE_COMUNIDADE });

            if (erro) {
                console.warn('[blog] Artigos indisponíveis; mostrando só as publicações.', erro);
                return [];
            }

            return artigos || [];
        } catch (e) {
            console.warn('[blog] Artigos indisponíveis; mostrando só as publicações.', e);
            return [];
        }
    }

    async function desenharArtigosComunidade(artigos) {
        const D = window.artigosDados;
        if (!D || !PUBLICA_COMUNIDADE.artigos) return;

        if (!artigos.length) {
            PUBLICA_COMUNIDADE.artigos.replaceChildren();
            return;
        }

        /* Os perfis dos autores em UMA consulta, e não uma por artigo. */
        const ids = [...new Set(artigos.map(a => a.author_id).filter(Boolean))];
        const perfis = ids.length ? await D.lerAutores(ids) : new Map();

        const frag = document.createDocumentFragment();
        for (const artigo of artigos) {
            frag.appendChild(D.montarCard(artigo, perfis.get(artigo.author_id), { compacto: true, destino: 'blog' }));
        }

        PUBLICA_COMUNIDADE.artigos.replaceChildren(frag);
    }

    /* ------------------------------------------------------------------
     * Consulta que sobrevive a uma SESSÃO QUEBRADA.
     *
     * O DEFEITO QUE ISTO CORRIGE (visto em 21/10/2026)
     * Quando o navegador guarda uma sessão que o servidor não aceita mais
     * (token expirado, ou o "espelho" do login desalinhado), o supabase-js
     * troca a chave anônima por aquele token no header Authorization. O
     * PostgREST responde 401 e a consulta inteira falha — mesmo sendo uma
     * leitura pública, que a chave anônima faria sem problema.
     *
     * Por isso não basta tentar de novo: é preciso DESCARTAR a sessão
     * inválida e refazer a leitura como visitante. É o que os outros
     * módulos do site já fazem ao encontrar um 401 (comunidade.js:221,
     * loja.js:409, auth-global.js:351).
     *
     * Só tratamos 401. Um erro de rede ou de tabela não é sessão, e não
     * deve apagar o login de ninguém.
     * ------------------------------------------------------------------ */
    function ehErroDeSessao(error) {
        if (!error) return false;
        const status = error.status ?? error.statusCode ?? error.code;
        const texto = String(error.message ?? '');
        return status === 401
            || texto.includes('PGRST301')
            || /jwt|token|unauthorized/i.test(texto);
    }

    async function consultarPosts(supabase) {
        const montarConsulta = () => supabase
            .from('posts')
            .select('id, author_id, author_name, author_avatar, content, likes, comment_count, created_at, is_active')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(LIMITE_COMUNIDADE);

        const primeira = await montarConsulta();

        // Deu certo, ou o erro não é de sessão: devolve como veio.
        if (!primeira.error || !ehErroDeSessao(primeira.error)) return primeira;

        // Sessão inválida: encerra no Supabase e tenta de novo como visitante.
        console.warn('[blog] Sessão inválida na leitura de posts; refazendo como visitante.', primeira.error);
        try {
            if (supabase.auth && typeof supabase.auth.signOut === 'function') {
                await supabase.auth.signOut({ scope: 'local' });
            }
        } catch (e) {
            console.warn('[blog] Não foi possível encerrar a sessão:', e);
        }

        return await montarConsulta();
    }

    async function carregarPublicacoesComunidade() {
        // A se��o pode n�o existir em outra p�gina que reusa este script.
        if (!PUBLICA_COMUNIDADE.artigos) return;

        mostrarEstado('carregando');

        const artigos = await lerArtigosComunidade();

        if (!artigos.length) {
            mostrarEstado('vazio');
            return;
        }

        await desenharArtigosComunidade(artigos);
        mostrarEstado('lista', { artigos: true });
    }

    carregarPublicacoesComunidade();

    // =============================================
    // 13. INICIALIZAÇÃO
    // =============================================
    console.log('📝 Blog inicializado!');
    console.log('   ♿ Acessibilidade integrada (hub flutuante + sidebar)');
    console.log('   🎬 Modal de vídeo + filtros por chips');
    console.log('   💬 Publicações e artigos da comunidade carregados do banco');
    console.log('   👤 Perfil:', localStorage.getItem('userName') || 'Visitante');
});