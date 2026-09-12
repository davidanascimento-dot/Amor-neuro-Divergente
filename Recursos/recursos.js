// =========================================================================
// RECURSOS.JS — Amor NeuroDivergente
// Sidebar + Perfil + Acessibilidade + Busca + Filtro + Hub Flutuante
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;

    // ============================================
    // 0. SINCRONIZAÇÃO DE PERFIL
    // ============================================
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

    // ============================================
    // 1. SIDEBAR RESPONSIVA
    // ============================================
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
        if (sidebar.classList.contains('open')) closeSidebar();
        else openSidebar();
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

    // ============================================
    // 2. PERFIL COLAPSÁVEL
    // ============================================
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

    // ============================================
    // 3. ACESSIBILIDADE
    // ============================================
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

    // Handler unificado de ações a11y
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
                ['darkMode', 'highlightLinks', 'dyslexiaFont', 'reduceMotion', 'textSize'].forEach(key => {
                    localStorage.removeItem('a11y_' + key);
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

    // Sidebar a11y (se existir)
    document.querySelectorAll('.a11y-option, .a11y-reset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleA11yAction(btn.getAttribute('data-a11y'));
        });
    });

    // ============================================
    // 4. HUB FLUTUANTE
    // ============================================
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
        if (!hubMenu || !overlay || !hubToggle) return;
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

    // ============================================
    // 5. STATUS DO HUB
    // ============================================
    function updateHubStatus() {
        const darkLabel = document.querySelector('.hub-action[data-a11y="darkMode"] .hub-action-label');
        if (darkLabel) darkLabel.textContent = body.classList.contains('a11y-dark-mode') ? 'Claro' : 'Escuro';

        const dyslexiaLabel = document.querySelector('.hub-action[data-a11y="dyslexiaFont"] .hub-action-label');
        if (dyslexiaLabel) dyslexiaLabel.textContent = body.classList.contains('a11y-dyslexia') ? 'Ativo' : 'Dislexia';

        const motionLabel = document.querySelector('.hub-action[data-a11y="reduceMotion"] .hub-action-label');
        if (motionLabel) motionLabel.textContent = body.classList.contains('a11y-reduce-motion') ? 'Ativo' : 'Movimento';
    }
    updateHubStatus();

    // ============================================
    // 6. AÇÕES DO HUB
    // ============================================
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

    // ============================================
    // 7. HEADER SCROLL EFFECT
    // ============================================
    const headerGlass = document.getElementById('headerGlass');
    if (headerGlass) {
        window.addEventListener('scroll', () => {
            headerGlass.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ============================================
    // 8. LOGOUT
    // ============================================
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Tem certeza que deseja sair?')) {
            ['userLoggedIn', 'userName', 'userEmail', 'userAvatar'].forEach(k => localStorage.removeItem(k));
            window.location.href = '/login/login.html';
        }
    });

    // ============================================
    // 9. 🆕 BUSCA NO HERO
    // ============================================
    const recursosSearch = document.getElementById('recursosSearch');
    if (recursosSearch) {
        recursosSearch.addEventListener('input', () => {
            const term = recursosSearch.value.toLowerCase().trim();
            const cards = document.querySelectorAll('.article-card, .featured-article__card');

            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = (!term || text.includes(term)) ? '' : 'none';
            });
        });
    }

    // ============================================
    // 10. 🆕 FILTRO DE CATEGORIAS (chips)
    // ============================================
    const filterChips = document.querySelectorAll('.filter-chip');
    const categorySections = document.querySelectorAll('.category-section');

    filterChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.preventDefault();
            filterChips.forEach(c => c.classList.remove('is-active'));
            chip.classList.add('is-active');

            const target = chip.getAttribute('href');
            if (target && target !== '#') {
                const el = document.querySelector(target);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Sincroniza chip ativo ao scroll (opcional)
    if (categorySections.length) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = '#' + entry.target.id;
                    filterChips.forEach(c => {
                        c.classList.toggle('is-active', c.getAttribute('href') === id);
                    });
                }
            });
        }, { threshold: 0.4 });
        categorySections.forEach(sec => sectionObserver.observe(sec));
    }

    // ============================================
    // 11. 🆕 NEWSLETTER (feedback)
    // ============================================
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input[type="email"]');
            const email = input?.value.trim();
            if (!email) return;

            const btn = newsletterForm.querySelector('button');
            if (btn) {
                const original = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Inscrito!';
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = original;
                    input.value = '';
                }, 2500);
            }
        });
    }

    console.log('📚 Recursos pronto! Perfil + Acessibilidade + Busca + Filtros + Hub');
});