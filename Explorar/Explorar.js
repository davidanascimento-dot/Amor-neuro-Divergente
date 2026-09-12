/**
 * EXPLORAR.JS — Amor NeuroDivergente
 * Sidebar responsiva + Acessibilidade + Perfil + Hub Flutuante + Scroll Top + FAQ Busca
 */
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
            sidebarAvatar.onerror = () => { sidebarAvatar.src = '/img/avatar-padrao.png'; };
        }
        if (sidebarUserName && savedName) sidebarUserName.textContent = savedName;
        if (sidebarUserEmail && savedEmail) sidebarUserEmail.textContent = savedEmail;
    }
    syncProfile();
    window.addEventListener('storage', (e) => {
        if (e.key === 'userAvatar' || e.key === 'userName' || e.key === 'userEmail') syncProfile();
    });

    // =============================================
    // 1. SIDEBAR RESPONSIVA
    // =============================================
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
        if (!sidebar) return;
        sidebar.classList.add('open');
        if (sidebarOverlay) sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function toggleSidebar() {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });

    // =============================================
    // 2. PERFIL COLAPSÁVEL NA SIDEBAR
    // =============================================
    const profileToggle = document.getElementById('profileToggle');
    const profileDetail = document.getElementById('profileDetail');
    if (profileToggle && profileDetail) {
        profileToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isHidden = profileDetail.hasAttribute('hidden');
            if (isHidden) {
                profileDetail.removeAttribute('hidden');
                profileToggle.setAttribute('aria-expanded', 'true');
            } else {
                profileDetail.setAttribute('hidden', '');
                profileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // =============================================
    // 3. ACESSIBILIDADE INTEGRADA NA SIDEBAR
    // =============================================
    const a11yToggle = document.getElementById('a11yToggle');
    const a11yOptions = document.getElementById('a11yOptions');

    if (a11yToggle && a11yOptions) {
        a11yToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isHidden = a11yOptions.hasAttribute('hidden');
            if (isHidden) {
                a11yOptions.removeAttribute('hidden');
                a11yToggle.setAttribute('aria-expanded', 'true');
            } else {
                a11yOptions.setAttribute('hidden', '');
                a11yToggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('click', (e) => {
            if (!a11yOptions.contains(e.target) && e.target !== a11yToggle) {
                a11yOptions.setAttribute('hidden', '');
                a11yToggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !a11yOptions.hasAttribute('hidden')) {
                a11yOptions.setAttribute('hidden', '');
                a11yToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function gs(k, fb) { return localStorage.getItem('a11y_' + k) || fb; }
    function ss(k, v) { localStorage.setItem('a11y_' + k, v); }
    function usl(id, active) { const el = document.getElementById(id); if (el) el.textContent = active ? 'Ligado' : 'Desligado'; }

    function applySettings() {
        if (gs('darkMode') === 'true') body.classList.add('a11y-dark-mode');
        if (gs('highlightLinks') === 'true') body.classList.add('a11y-highlight-links');
        if (gs('dyslexiaFont') === 'true') body.classList.add('a11y-dyslexia');
        if (gs('reduceMotion') === 'true') body.classList.add('a11y-reduce-motion');
        const ts = gs('textSize', 'normal');
        const main = document.getElementById('mainContent');
        if (main) {
            main.classList.remove('a11y-large-text', 'a11y-small-text');
            if (ts === 'large') main.classList.add('a11y-large-text');
            if (ts === 'small') main.classList.add('a11y-small-text');
        }
        usl('darkModeStatus', gs('darkMode') === 'true');
        usl('linksStatus', gs('highlightLinks') === 'true');
        usl('dyslexiaStatus', gs('dyslexiaFont') === 'true');
        usl('motionStatus', gs('reduceMotion') === 'true');
    }

    document.querySelectorAll('.a11y-option, .a11y-reset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const action = btn.getAttribute('data-a11y');
            const main = document.getElementById('mainContent');

            switch (action) {
                case 'darkMode':
                    const dm = gs('darkMode') === 'true';
                    ss('darkMode', dm ? 'false' : 'true');
                    if (dm) body.classList.remove('a11y-dark-mode');
                    else body.classList.add('a11y-dark-mode');
                    usl('darkModeStatus', !dm);
                    updateHubStatus();
                    break;
                case 'increaseText':
                    const cs = gs('textSize', 'normal');
                    if (cs === 'large') { ss('textSize', 'normal'); if (main) main.classList.remove('a11y-large-text'); }
                    else { ss('textSize', 'large'); if (main) { main.classList.remove('a11y-small-text'); main.classList.add('a11y-large-text'); } }
                    break;
                case 'decreaseText':
                    const cz = gs('textSize', 'normal');
                    if (cz === 'small') { ss('textSize', 'normal'); if (main) main.classList.remove('a11y-small-text'); }
                    else { ss('textSize', 'small'); if (main) { main.classList.remove('a11y-large-text'); main.classList.add('a11y-small-text'); } }
                    break;
                case 'highlightLinks':
                    const hl = gs('highlightLinks') === 'true';
                    ss('highlightLinks', hl ? 'false' : 'true');
                    if (hl) body.classList.remove('a11y-highlight-links');
                    else body.classList.add('a11y-highlight-links');
                    usl('linksStatus', !hl);
                    break;
                case 'dyslexiaFont':
                    const df = gs('dyslexiaFont') === 'true';
                    ss('dyslexiaFont', df ? 'false' : 'true');
                    if (df) body.classList.remove('a11y-dyslexia');
                    else body.classList.add('a11y-dyslexia');
                    usl('dyslexiaStatus', !df);
                    updateHubStatus();
                    break;
                case 'reduceMotion':
                    const rm = gs('reduceMotion') === 'true';
                    ss('reduceMotion', rm ? 'false' : 'true');
                    if (rm) body.classList.remove('a11y-reduce-motion');
                    else body.classList.add('a11y-reduce-motion');
                    usl('motionStatus', !rm);
                    updateHubStatus();
                    break;
                case 'reset':
                    ['darkMode', 'highlightLinks', 'dyslexiaFont', 'reduceMotion', 'textSize'].forEach(k => localStorage.removeItem('a11y_' + k));
                    body.classList.remove('a11y-dark-mode', 'a11y-highlight-links', 'a11y-dyslexia', 'a11y-reduce-motion');
                    if (main) main.classList.remove('a11y-large-text', 'a11y-small-text');
                    usl('darkModeStatus', false);
                    usl('linksStatus', false);
                    usl('dyslexiaStatus', false);
                    usl('motionStatus', false);
                    updateHubStatus();
                    break;
            }
        });
    });

    applySettings();

    // =============================================
    // 4. HUB FLUTUANTE
    // =============================================
    const hubToggle = document.getElementById('floatingHubToggle');
    const hubMenu = document.getElementById('floatingHubMenu');
    const hubOverlay = document.getElementById('floatingOverlay');

    function toggleHub() {
        if (!hubMenu || !hubOverlay) return;
        const isOpen = !hubMenu.hidden;
        hubMenu.hidden = isOpen;
        hubOverlay.hidden = isOpen;
        if (hubToggle) hubToggle.setAttribute('aria-expanded', !isOpen);
    }

    function closeHub() {
        if (!hubMenu || !hubOverlay) return;
        hubMenu.hidden = true;
        hubOverlay.hidden = true;
        if (hubToggle) hubToggle.setAttribute('aria-expanded', 'false');
    }

    if (hubToggle) {
        hubToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleHub();
        });
    }

    if (hubOverlay) {
        hubOverlay.addEventListener('click', closeHub);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeHub();
        }
    });

    // =============================================
    // 5. ATUALIZAR STATUS DO HUB
    // =============================================
    function updateHubStatus() {
        const darkLabel = document.querySelector('.hub-action[data-a11y="darkMode"] .hub-action-label');
        if (darkLabel) {
            darkLabel.textContent = body.classList.contains('a11y-dark-mode') ? 'Claro' : 'Escuro';
        }

        const dyslexiaLabel = document.querySelector('.hub-action[data-a11y="dyslexiaFont"] .hub-action-label');
        if (dyslexiaLabel) {
            dyslexiaLabel.textContent = body.classList.contains('a11y-dyslexia') ? 'Ativo' : 'Dislexia';
        }

        const motionLabel = document.querySelector('.hub-action[data-a11y="reduceMotion"] .hub-action-label');
        if (motionLabel) {
            motionLabel.textContent = body.classList.contains('a11y-reduce-motion') ? 'Ativo' : 'Movimento';
        }
    }

    updateHubStatus();

    // =============================================
    // 6. AÇÕES DO HUB
    // =============================================
    document.querySelectorAll('.hub-action[data-a11y]').forEach((item) => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = item.getAttribute('data-a11y');
            const main = document.getElementById('mainContent');

            switch (action) {
                case 'darkMode': {
                    const dm = gs('darkMode') === 'true';
                    ss('darkMode', dm ? 'false' : 'true');
                    if (dm) body.classList.remove('a11y-dark-mode');
                    else body.classList.add('a11y-dark-mode');
                    usl('darkModeStatus', !dm);
                    updateHubStatus();
                    break;
                }
                case 'increaseText': {
                    const cs = gs('textSize', 'normal');
                    if (cs === 'large') { ss('textSize', 'normal'); if (main) main.classList.remove('a11y-large-text'); }
                    else { ss('textSize', 'large'); if (main) { main.classList.remove('a11y-small-text'); main.classList.add('a11y-large-text'); } }
                    break;
                }
                case 'decreaseText': {
                    const cz = gs('textSize', 'normal');
                    if (cz === 'small') { ss('textSize', 'normal'); if (main) main.classList.remove('a11y-small-text'); }
                    else { ss('textSize', 'small'); if (main) { main.classList.remove('a11y-large-text'); main.classList.add('a11y-small-text'); } }
                    break;
                }
                case 'dyslexiaFont': {
                    const df = gs('dyslexiaFont') === 'true';
                    ss('dyslexiaFont', df ? 'false' : 'true');
                    if (df) body.classList.remove('a11y-dyslexia');
                    else body.classList.add('a11y-dyslexia');
                    usl('dyslexiaStatus', !df);
                    updateHubStatus();
                    break;
                }
                case 'reduceMotion': {
                    const rm = gs('reduceMotion') === 'true';
                    ss('reduceMotion', rm ? 'false' : 'true');
                    if (rm) body.classList.remove('a11y-reduce-motion');
                    else body.classList.add('a11y-reduce-motion');
                    usl('motionStatus', !rm);
                    updateHubStatus();
                    break;
                }
                case 'reset': {
                    ['darkMode', 'highlightLinks', 'dyslexiaFont', 'reduceMotion', 'textSize'].forEach(k => localStorage.removeItem('a11y_' + k));
                    body.classList.remove('a11y-dark-mode', 'a11y-highlight-links', 'a11y-dyslexia', 'a11y-reduce-motion');
                    if (main) main.classList.remove('a11y-large-text', 'a11y-small-text');
                    usl('darkModeStatus', false);
                    usl('linksStatus', false);
                    usl('dyslexiaStatus', false);
                    usl('motionStatus', false);
                    updateHubStatus();
                    break;
                }
            }

            closeHub();
        });
    });

    document.querySelectorAll('.hub-action[href]').forEach((link) => {
        link.addEventListener('click', closeHub);
    });

    // =============================================
    // 7. BOTÃO VOLTAR AO TOPO (CORRIGIDO)
    // =============================================
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    if (scrollTopBtn) {
        // Mostra/esconde o botão baseado no scroll
        window.addEventListener('scroll', function() {
            if (window.scrollY > 400) {
                scrollTopBtn.style.opacity = '1';
                scrollTopBtn.style.transform = 'translateY(0)';
                scrollTopBtn.style.pointerEvents = 'auto';
            } else {
                scrollTopBtn.style.opacity = '0';
                scrollTopBtn.style.transform = 'translateY(20px)';
                scrollTopBtn.style.pointerEvents = 'none';
            }
        });

        // Volta ao topo com animação suave
        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // =============================================
    // 8. HEADER SCROLL EFFECT
    // =============================================
    const headerGlass = document.getElementById('headerGlass');
    if (headerGlass) {
        window.addEventListener('scroll', () => {
            headerGlass.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // =============================================
    // 9. FAQ — ABRIR UM FECHA OS OUTROS
    // =============================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                faqItems.forEach(other => {
                    if (other !== item && other.open) {
                        other.open = false;
                    }
                });
            }
        });
    });

    // =============================================
    // 10. FAQ — BUSCA
    // =============================================
    const faqSearchInput = document.getElementById('faqSearchInput');
    const faqNoResults = document.getElementById('faqNoResults');
    const faqSearchTerm = document.getElementById('faqSearchTerm');

    if (faqSearchInput) {
        faqSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            let found = false;

            faqItems.forEach((item) => {
                const keywords = item.getAttribute('data-keywords') || '';
                const summaryText = item.querySelector('summary span')?.textContent?.toLowerCase() || '';
                const answerText = item.querySelector('.faq-answer p')?.textContent?.toLowerCase() || '';
                
                const matches = searchTerm === '' || 
                    keywords.includes(searchTerm) || 
                    summaryText.includes(searchTerm) || 
                    answerText.includes(searchTerm);

                if (searchTerm === '') {
                    item.style.display = '';
                    found = true;
                } else if (matches) {
                    item.style.display = '';
                    found = true;
                } else {
                    item.style.display = 'none';
                }
            });

            if (faqNoResults && faqSearchTerm) {
                if (searchTerm !== '' && !found) {
                    faqNoResults.style.display = 'block';
                    faqSearchTerm.textContent = searchTerm;
                } else {
                    faqNoResults.style.display = 'none';
                }
            }
        });
    }

    // =============================================
    // 11. LOGOUT
    // =============================================
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem('userLoggedIn');
            window.location.href = '/login/login.html';
        }
    });

    // =============================================
    // 12. SCROLL REVEAL (opcional)
    // =============================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    // =============================================
    // 13. CARROSSEL "PUBLICAÇÕES EM DESTAQUE"
    // =============================================
    const hlTrack = document.getElementById('hlTrack');
    const hlPrev = document.querySelector('.hl-arrow--prev');
    const hlNext = document.querySelector('.hl-arrow--next');
    const hlPagination = document.getElementById('hlPagination');

    if (hlTrack && hlPrev && hlNext) {

        // Calcula quantos cards cabem na tela
        function getVisibleCards() {
            const cardWidth = hlTrack.querySelector('.hl-card')?.offsetWidth || 300;
            const gap = 20;
            const visible = Math.max(1, Math.floor(hlTrack.clientWidth / (cardWidth + gap)));
            return visible;
        }

        // Rola para a esquerda
        hlPrev.addEventListener('click', () => {
            const card = hlTrack.querySelector('.hl-card');
            const step = card ? card.offsetWidth + 20 : 320;
            hlTrack.scrollBy({ left: -step, behavior: 'smooth' });
        });

        // Rola para a direita
        hlNext.addEventListener('click', () => {
            const card = hlTrack.querySelector('.hl-card');
            const step = card ? card.offsetWidth + 20 : 320;
            hlTrack.scrollBy({ left: step, behavior: 'smooth' });
        });

        // Sincroniza botões da paginação com a rolagem
        const hlPages = hlPagination ? hlPagination.querySelectorAll('.hl-page[data-page]') : [];
        const totalCards = hlTrack.querySelectorAll('.hl-card').length;

        function updatePaginationUI() {
            if (!hlPagination) return;

            const card = hlTrack.querySelector('.hl-card');
            if (!card) return;

            const step = card.offsetWidth + 20;
            const currentIndex = Math.round(hlTrack.scrollLeft / step);
            const visible = getVisibleCards();
            const totalPages = Math.max(1, Math.ceil(totalCards / visible));
            const currentPage = Math.min(totalPages, Math.floor(currentIndex / visible) + 1);

            hlPages.forEach(btn => {
                const page = parseInt(btn.getAttribute('data-page'), 10);
                btn.classList.toggle('is-active', page === currentPage);
            });
        }

        // Detecta scroll e atualiza
        let scrollTimeout;
        hlTrack.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updatePaginationUI, 80);
        });

        // Cliques nos números das páginas
        hlPages.forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.getAttribute('data-page'), 10);
                const card = hlTrack.querySelector('.hl-card');
                if (!card) return;

                const step = card.offsetWidth + 20;
                const visible = getVisibleCards();
                const targetScroll = (page - 1) * visible * step;

                hlTrack.scrollTo({ left: targetScroll, behavior: 'smooth' });
            });
        });

        // Botões de primeira/última página
        if (hlPagination) {
            const firstBtn = hlPagination.querySelector('.hl-page[aria-label="Primeira página"]');
            const lastBtn = hlPagination.querySelector('.hl-page[aria-label="Última página"]');
            const prevPageBtn = hlPagination.querySelector('.hl-page[aria-label="Anterior"]');
            const nextPageBtn = hlPagination.querySelector('.hl-page[aria-label="Próxima"]');

            firstBtn?.addEventListener('click', () => {
                hlTrack.scrollTo({ left: 0, behavior: 'smooth' });
            });

            lastBtn?.addEventListener('click', () => {
                hlTrack.scrollTo({ left: hlTrack.scrollWidth, behavior: 'smooth' });
            });

            prevPageBtn?.addEventListener('click', () => {
                const card = hlTrack.querySelector('.hl-card');
                if (!card) return;
                const step = card.offsetWidth + 20;
                hlTrack.scrollBy({ left: -step * getVisibleCards(), behavior: 'smooth' });
            });

            nextPageBtn?.addEventListener('click', () => {
                const card = hlTrack.querySelector('.hl-card');
                if (!card) return;
                const step = card.offsetWidth + 20;
                hlTrack.scrollBy({ left: step * getVisibleCards(), behavior: 'smooth' });
            });
        }

        // Atualiza ao redimensionar
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updatePaginationUI, 150);
        });

        // Inicializa
        updatePaginationUI();
    }
    console.log('🧭 Explorar pronto! Sidebar + Acessibilidade + Hub + FAQ + Scroll Top');
});