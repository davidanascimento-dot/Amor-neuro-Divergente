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
            sidebarAvatar.onerror = () => { sidebarAvatar.src = '/img/avatar-padrao.png'; };
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
    const editorialCards = document.querySelectorAll('.editorial-card');
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
    // 12. INICIALIZAÇÃO
    // =============================================
    console.log('📝 Blog inicializado!');
    console.log('   ♿ Acessibilidade integrada (hub flutuante + sidebar)');
    console.log('   🎬 Modal de vídeo + filtros por chips');
    console.log('   👤 Perfil:', localStorage.getItem('userName') || 'Visitante');
});