// =========================================================================
// RECURSOS.JS — Amor NeuroDivergente
// Sidebar responsiva + Perfil + Acessibilidade + Filtros + Hub Flutuante
// Novo formato: Hero + Grid de Cards
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
                e.target !== profileToggle && 
                !profileToggle.contains(e.target)) {
                profileDetail.setAttribute('hidden', '');
                profileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ============================================
    // 3. ACESSIBILIDADE NA SIDEBAR
    // ============================================
    const a11yToggle = document.getElementById('a11yToggle');
    const a11yOptions = document.getElementById('a11yOptions');

    if (a11yToggle && a11yOptions) {
        a11yToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const hidden = a11yOptions.hasAttribute('hidden');
            if (hidden) {
                a11yOptions.removeAttribute('hidden');
                a11yToggle.setAttribute('aria-expanded', 'true');
            } else {
                a11yOptions.setAttribute('hidden', '');
                a11yToggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('click', (e) => {
            if (!a11yOptions.hasAttribute('hidden') && 
                !a11yOptions.contains(e.target) && 
                e.target !== a11yToggle && 
                !a11yToggle.contains(e.target)) {
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

    // ============================================
    // 4. FUNÇÕES DE ACESSIBILIDADE
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
        // Modo escuro
        const isDarkMode = getA11y('darkMode') === 'true';
        body.classList.toggle('a11y-dark-mode', isDarkMode);
        updateStatus('darkModeStatus', isDarkMode);

        // Destacar links
        const isHighlightLinks = getA11y('highlightLinks') === 'true';
        body.classList.toggle('a11y-highlight-links', isHighlightLinks);
        updateStatus('linksStatus', isHighlightLinks);

        // Fonte para dislexia
        const isDyslexia = getA11y('dyslexiaFont') === 'true';
        body.classList.toggle('a11y-dyslexia', isDyslexia);
        updateStatus('dyslexiaStatus', isDyslexia);

        // Reduzir animações
        const isReducedMotion = getA11y('reduceMotion') === 'true';
        body.classList.toggle('a11y-reduce-motion', isReducedMotion);
        updateStatus('motionStatus', isReducedMotion);

        // Tamanho do texto
        const textSize = getA11y('textSize', 'normal');
        const main = document.getElementById('mainContent') || document.querySelector('.main-content');
        if (main) {
            main.classList.remove('a11y-large-text', 'a11y-small-text');
            if (textSize === 'large') main.classList.add('a11y-large-text');
            if (textSize === 'small') main.classList.add('a11y-small-text');
        }
        
        // Atualiza labels do hub
        updateHubStatus();
    }

    // Aplica configurações iniciais
    applyA11ySettings();

    // Eventos dos botões de acessibilidade na sidebar
    document.querySelectorAll('.a11y-option, .a11y-reset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const action = btn.getAttribute('data-a11y');
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
        });
    });

    // ============================================
    // 5. HUB FLUTUANTE - ACESSIBILIDADE
    // ============================================
    const hubToggle = document.getElementById('floatingHubToggle');
    const hubMenu = document.getElementById('floatingHubMenu');
    const overlay = document.getElementById('floatingOverlay');

    function toggleHub() {
        const isOpen = !hubMenu.hidden;
        hubMenu.hidden = isOpen;
        overlay.hidden = isOpen;
        hubToggle.setAttribute('aria-expanded', !isOpen);
    }

    function closeHub() {
        hubMenu.hidden = true;
        overlay.hidden = true;
        hubToggle.setAttribute('aria-expanded', 'false');
    }

    if (hubToggle && hubMenu && overlay) {
        hubToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleHub();
        });

        overlay.addEventListener('click', closeHub);

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeHub();
            }
        });
    }

    // ============================================
    // 6. FUNÇÕES DO HUB - ATUALIZAR STATUS
    // ============================================
    function updateHubStatus() {
        // Dark Mode
        const darkLabel = document.querySelector('.hub-action[data-a11y="darkMode"] .hub-action-label');
        if (darkLabel) {
            darkLabel.textContent = document.body.classList.contains('a11y-dark-mode') ? 'Claro' : 'Escuro';
        }

        // Dislexia
        const dyslexiaLabel = document.querySelector('.hub-action[data-a11y="dyslexiaFont"] .hub-action-label');
        if (dyslexiaLabel) {
            dyslexiaLabel.textContent = document.body.classList.contains('a11y-dyslexia') ? 'Ativo' : 'Dislexia';
        }

        // Reduzir Movimento
        const motionLabel = document.querySelector('.hub-action[data-a11y="reduceMotion"] .hub-action-label');
        if (motionLabel) {
            motionLabel.textContent = document.body.classList.contains('a11y-reduce-motion') ? 'Ativo' : 'Movimento';
        }
    }

    // Atualiza status ao carregar
    updateHubStatus();

    // ============================================
    // 7. AÇÕES DO HUB - ACESSIBILIDADE
    // ============================================
    document.querySelectorAll('.hub-action[data-a11y]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.getAttribute('data-a11y');
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

            // Fecha o hub após a ação
            closeHub();
        });
    });

    // Clicar em links dentro do hub também fecha
    document.querySelectorAll('.hub-action[href]').forEach(link => {
        link.addEventListener('click', function() {
            closeHub();
        });
    });

    // ============================================
    // 8. HEADER SCROLL EFFECT
    // ============================================
    const headerGlass = document.getElementById('headerGlass');
    if (headerGlass) {
        window.addEventListener('scroll', () => {
            headerGlass.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ============================================
    // 9. LOGOUT
    // ============================================
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem('userLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userAvatar');
            window.location.href = '/login/login.html';
        }
    });

    // ============================================
    // 10. FILTRO DE TABS (novo formato)
    // ============================================
    const tabItems = document.querySelectorAll('.tab-item');
    const allCards = document.querySelectorAll('.card');
    const heroCard = document.querySelector('.hero-card');

    // Extrai a categoria do hero
    let heroCategory = '';
    if (heroCard) {
        const heroTag = heroCard.querySelector('.category-tag');
        if (heroTag) heroCategory = heroTag.textContent.trim();
    }

    tabItems.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active de todos
            tabItems.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.textContent.trim();
            
            // Filtra os cards
            allCards.forEach(card => {
                const cardTag = card.querySelector('.category-tag');
                if (!cardTag) {
                    card.style.display = 'block';
                    return;
                }
                const cardCategory = cardTag.textContent.trim();
                
                if (filter === 'Todos') {
                    card.style.display = 'block';
                } else {
                    card.style.display = cardCategory === filter ? 'block' : 'none';
                }
            });
            
            // Filtra o hero
            if (heroCard) {
                if (filter === 'Todos') {
                    heroCard.style.display = 'grid';
                } else {
                    heroCard.style.display = heroCategory === filter ? 'grid' : 'none';
                }
            }
        });
    });

    // ============================================
    // 11. RECURSOS - DADOS PARA FILTROS (fallback)
    // ============================================
    const resourcesData = [
        { id: 1, title: "Autismo (TEA)", description: "Artigos sobre diagnóstico, stimming, comunicação, vida adulta e o universo autista.", icon: "fa-solid fa-puzzle-piece", category: "Autismo", link: "/Recursos/artigos/autismo.html" },
        { id: 2, title: "TDAH", description: "Estratégias práticas para rotina, funções executivas e tudo sobre viver com TDAH.", icon: "fa-solid fa-brain", category: "TDAH", link: "/Recursos/artigos/tdah.html" },
        { id: 3, title: "Altas Habilidades", description: "Dupla excepcionalidade, desenvolvimento de talentos e desafios emocionais.", icon: "fa-solid fa-star", category: "Altas Habilidades", link: "/Recursos/artigos/altas-habilidades.html" },
        { id: 4, title: "Dislexia", description: "Guia para famílias, adaptações escolares e métodos que respeitam cada ritmo.", icon: "fa-solid fa-book", category: "Dislexia", link: "/Recursos/artigos/dislexia.html" },
        { id: 5, title: "Saúde Mental", description: "Burnout neurodivergente, ansiedade, autocuidado e saúde emocional.", icon: "fa-solid fa-heart", category: "Saúde Mental", link: "/Recursos/artigos/saude-mental.html" },
        { id: 6, title: "Direitos e Leis", description: "Informações atualizadas sobre direitos legais e como acessá-los.", icon: "fa-solid fa-scale-balanced", category: "Direitos", link: "/Direitos/direitos.html" },
    ];

    console.log('📚 Recursos pronto! Perfil + Acessibilidade + Filtros + Hub Flutuante');
    console.log('👤 Perfil:', localStorage.getItem('userName') || 'Visitante');
});