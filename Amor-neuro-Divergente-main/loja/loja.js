// =========================================================================
// LOJA.JS — Amor NeuroDivergente
// Sidebar + Acessibilidade + Hub Flutuante + Scroll Top + Loja + Banner
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
    
    const body = document.body;
    const searchInput = document.getElementById("productSearch");
    const productsGrid = document.getElementById("productsGrid");
    const noResults = document.getElementById("noResults");
    const productCounter = document.getElementById("productCounter");
    const loadingSpinner = document.getElementById("loadingSpinner");

    let activeMarketplaceFilter = 'todos';
    let activeCategoryFilter = 'todos';
    let searchTimeout = null;
    let allCurrentResults = [];
    let renderedCount = 0;
    const PRODUCTS_PER_PAGE = 6;
    let isLoading = false;
    let currentQuery = '';

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
    // 1. SIDEBAR RESPONSIVA (PADRÃO DO PROJETO)
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
    // 2. PERFIL COLAPSÁVEL
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

    // =============================================
    // 3. ACESSIBILIDADE NA SIDEBAR
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

    // Funções de acessibilidade
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
        const section = document.querySelector('.products-section');
        if (section) {
            section.classList.remove('a11y-large-text', 'a11y-small-text');
            if (textSize === 'large') section.classList.add('a11y-large-text');
            if (textSize === 'small') section.classList.add('a11y-small-text');
        }
    }

    applyA11ySettings();

    // Eventos dos botões de acessibilidade
    document.querySelectorAll('.a11y-option, .a11y-reset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const action = btn.getAttribute('data-a11y');
            const section = document.querySelector('.products-section');

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
                        section?.classList.remove('a11y-large-text');
                    } else {
                        setA11y('textSize', 'large');
                        section?.classList.remove('a11y-small-text');
                        section?.classList.add('a11y-large-text');
                    }
                    break;
                }
                case 'decreaseText': {
                    const current = getA11y('textSize', 'normal');
                    if (current === 'small') {
                        setA11y('textSize', 'normal');
                        section?.classList.remove('a11y-small-text');
                    } else {
                        setA11y('textSize', 'small');
                        section?.classList.remove('a11y-large-text');
                        section?.classList.add('a11y-small-text');
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
                    section?.classList.remove('a11y-large-text', 'a11y-small-text');
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

    // =============================================
    // 4. HUB FLUTUANTE
    // =============================================
    const hubToggle = document.getElementById('floatingHubToggle');
    const hubMenu = document.getElementById('floatingHubMenu');
    const hubOverlay = document.getElementById('floatingOverlay');

    function toggleHub() {
        if (!hubMenu || !hubOverlay) {
            console.warn('⚠️ Hub elements not found!');
            return;
        }
        const isOpen = !hubMenu.hidden;
        hubMenu.hidden = isOpen;
        hubOverlay.hidden = isOpen;
        if (hubToggle) hubToggle.setAttribute('aria-expanded', !isOpen);
        console.log('🔄 Hub toggled:', isOpen ? 'closed' : 'open');
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
            console.log('🖱️ Hub button clicked!');
            toggleHub();
        });
    } else {
        console.warn('⚠️ floatingHubToggle not found!');
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
            const section = document.querySelector('.products-section');

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
                        section?.classList.remove('a11y-large-text');
                    } else {
                        setA11y('textSize', 'large');
                        section?.classList.remove('a11y-small-text');
                        section?.classList.add('a11y-large-text');
                    }
                    break;
                }
                case 'decreaseText': {
                    const current = getA11y('textSize', 'normal');
                    if (current === 'small') {
                        setA11y('textSize', 'normal');
                        section?.classList.remove('a11y-small-text');
                    } else {
                        setA11y('textSize', 'small');
                        section?.classList.remove('a11y-large-text');
                        section?.classList.add('a11y-small-text');
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
                    section?.classList.remove('a11y-large-text', 'a11y-small-text');
                    updateStatus('darkModeStatus', false);
                    updateStatus('linksStatus', false);
                    updateStatus('dyslexiaStatus', false);
                    updateStatus('motionStatus', false);
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
    // 7. BOTÃO VOLTAR AO TOPO
    // =============================================
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    if (scrollTopBtn) {
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

        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // =============================================
    // 8. LOGOUT
    // =============================================
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

    // =========================================================================
    // 9. BANCO DE PRODUTOS
    // =========================================================================
    const synonymMap = {
        'aba': ['terapia aba', 'autismo', 'comportamento', 'fonoaudiologia'],
        'stimming': ['fidget', 'estimulação', 'movimento', 'mastigável'],
        'meltdown': ['crise', 'regulação', 'calma', 'peso', 'compressão'],
        'seletividade': ['alimentar', 'comida', 'textura', 'sensorial', 'prato'],
        'hiperfoco': ['foco', 'concentração', 'atenção', 'tdah'],
    };

    const detailedProductDB = [
        { keywords: ['manta peso', 'cobertor pesado', 'sensorial', 'ansiedade', 'autismo', 'tdah', 'meltdown'], title: 'Manta de Peso Sensorial Terapêutica 5kg', vendor: 'SensorPeso', rating: 5, ratingCount: 215, price: 'R$ 199,90', marketplace: 'amazon', category: 'sensorial', image: 'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=400&h=300&fit=crop', link: '#' },
        { keywords: ['fidget', 'stimming', 'cubo', 'anti estresse', 'tdah'], title: 'Fidget Toy Cubo Infinito Anti Estresse', vendor: 'FidgetBrasil', rating: 4, ratingCount: 327, price: 'R$ 24,90', marketplace: 'shopee', category: 'foco-tdah', image: 'https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?w=400&h=300&fit=crop', link: '#' },
        { keywords: ['pulseira mastigável', 'morder', 'stimming', 'sensorial'], title: 'Pulseira Mastigável Sensorial Antiestresse', vendor: 'ChewyWear', rating: 5, ratingCount: 303, price: 'R$ 19,90', marketplace: 'shopee', category: 'sensorial', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop', link: '#' },
        { keywords: ['timer', 'visual', 'pomodoro', 'foco', 'tdah', 'rotina'], title: 'Relógio Timer Visual 60min para TDAH', vendor: 'TimeManager', rating: 4, ratingCount: 283, price: 'R$ 39,90', marketplace: 'aliexpress', category: 'foco-tdah', image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=400&h=300&fit=crop', link: '#' },
        { keywords: ['fone', 'cancelamento ruído', 'anc', 'silêncio', 'tdah', 'autismo'], title: 'Fone Bluetooth Cancelamento de Ruído ANC', vendor: 'AudioPro', rating: 4, ratingCount: 456, price: 'R$ 149,90', marketplace: 'shopee', category: 'audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', link: '#' },
        { keywords: ['camiseta', 'orgulho', 'neurodivergente', 'frase', 'autismo'], title: 'Camiseta Orgulho Neurodivergente', vendor: 'NeuroStore', rating: 5, ratingCount: 142, price: 'R$ 49,90', marketplace: 'aliexpress', category: 'vestuario', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop', link: '#' },
        { keywords: ['projetor', 'estrelas', 'luz', 'relaxamento', 'sono', 'sensorial'], title: 'Projetor de Estrelas Giratório Sensorial', vendor: 'StarLight', rating: 5, ratingCount: 532, price: 'R$ 79,90', marketplace: 'amazon', category: 'sensorial', image: 'https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?w=400&h=300&fit=crop', link: '#' },
        { keywords: ['prato', 'divisória', 'seletividade', 'alimentar', 'autismo'], title: 'Prato com Divisórias Seletividade Alimentar', vendor: 'FoodFun', rating: 5, ratingCount: 312, price: 'R$ 34,90', marketplace: 'shopee', category: 'casa', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=300&fit=crop', link: '#' },
        { keywords: ['cartão', 'comunicação', 'pecs', 'autismo', 'não verbal'], title: 'Kit Cartões PECS para Autismo 200 Figuras', vendor: 'PECSCom', rating: 5, ratingCount: 278, price: 'R$ 79,90', marketplace: 'mercado-livre', category: 'livros', image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=300&fit=crop', link: '#' },
        { keywords: ['planejador', 'semanal', 'rotina', 'tdah', 'organização'], title: 'Planejador Semanal para Rotina TDAH', vendor: 'PlanPro', rating: 4, ratingCount: 167, price: 'R$ 27,90', marketplace: 'aliexpress', category: 'foco-tdah', image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop', link: '#' },
        { keywords: ['massinha', 'slime', 'sensorial', 'criança', 'tátil'], title: 'Kit Massinha Sensorial Terapêutica 12 Cores', vendor: 'KidsPlay', rating: 5, ratingCount: 198, price: 'R$ 34,90', marketplace: 'mercado-livre', category: 'sensorial', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=300&fit=crop', link: '#' },
        { keywords: ['abafador', 'ruído', 'criança', 'autismo', 'ouvido'], title: 'Abafador de Ruído Infantil para Autismo', vendor: 'SafeEar', rating: 5, ratingCount: 189, price: 'R$ 59,90', marketplace: 'amazon', category: 'audio', image: 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=400&h=300&fit=crop', link: '#' },
    ];

    const defaultProducts = [...detailedProductDB];

    // =========================================================================
    // 10. RENDERIZAÇÃO
    // =========================================================================
    function createProductCard(product) {
        const stars = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
        const mpNames = { 'aliexpress': 'AliExpress', 'shopee': 'Shopee', 'mercado-livre': 'Mercado Livre', 'amazon': 'Amazon' };
        
        const card = document.createElement('article');
        card.className = 'product-card';
        card.style.animation = 'fadeIn 0.4s ease forwards';
        card.innerHTML = `
            <div class="product-image-area">
                <img src="${product.image}" alt="${product.title}" class="product-img" loading="lazy">
                <span class="marketplace-badge ${product.marketplace}">${mpNames[product.marketplace]}</span>
                <button class="btn-wishlist" aria-label="Favorito"><i class="fa-regular fa-heart"></i></button>
            </div>
            <div class="product-info-area">
                <h4 class="product-title">${product.title}</h4>
                <div class="product-vendor">${product.vendor}</div>
                <div class="product-rating">${stars} <span class="rating-count">(${product.ratingCount})</span></div>
                <div class="product-price">${product.price}</div>
                <a href="${product.link}" target="_blank" rel="nofollow" class="btn-buy">Ver na ${mpNames[product.marketplace]}</a>
            </div>`;
        
        card.querySelector('.btn-wishlist').addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('active');
            const icon = this.querySelector('i');
            icon.className = this.classList.contains('active') ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        });
        return card;
    }

    function searchProducts(query) {
        const term = query.toLowerCase().trim();
        if (!term) return [];
        let terms = [term];
        for (const [key, syns] of Object.entries(synonymMap)) {
            if (term.includes(key)) terms = [...terms, ...syns];
        }
        return detailedProductDB.filter(p => terms.some(t => p.keywords.join(' ').toLowerCase().includes(t)));
    }

    function applyFilters(results) {
        let filtered = [...results];
        if (activeMarketplaceFilter !== 'todos') filtered = filtered.filter(p => p.marketplace === activeMarketplaceFilter);
        if (activeCategoryFilter !== 'todos') filtered = filtered.filter(p => p.category === activeCategoryFilter);
        return filtered;
    }

    function renderBatch() {
        productsGrid.innerHTML = '';
        renderedCount = 0;
        const filtered = applyFilters(allCurrentResults);
        if (filtered.length === 0) { 
            noResults.style.display = 'block'; 
            productCounter.textContent = '0 produtos'; 
            return; 
        }
        noResults.style.display = 'none';
        const batch = filtered.slice(0, PRODUCTS_PER_PAGE);
        batch.forEach(p => productsGrid.appendChild(createProductCard(p)));
        renderedCount = PRODUCTS_PER_PAGE;
        productCounter.textContent = `${filtered.length} produto${filtered.length>1?'s':''} encontrado${filtered.length>1?'s':''}`;
    }

    function loadMore() {
        if (isLoading) return;
        const filtered = applyFilters(allCurrentResults);
        if (renderedCount >= filtered.length) return;
        isLoading = true;
        loadingSpinner.style.display = 'block';
        setTimeout(() => {
            filtered.slice(renderedCount, renderedCount + PRODUCTS_PER_PAGE).forEach(p => productsGrid.appendChild(createProductCard(p)));
            renderedCount += PRODUCTS_PER_PAGE;
            isLoading = false;
            loadingSpinner.style.display = 'none';
        }, 400);
    }

    async function updateAll(query) {
        currentQuery = query;
        loadingSpinner.style.display = 'block';
        await new Promise(r => setTimeout(r, 300));
        allCurrentResults = query ? searchProducts(query) : [...defaultProducts];
        renderBatch();
        loadingSpinner.style.display = 'none';
    }

    // =========================================================================
    // 11. EVENTOS
    // =========================================================================
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => updateAll(searchInput.value.trim()), 400);
        });
    }

    document.querySelectorAll('.filter-row').forEach((row, i) => {
        row.querySelectorAll('.pill-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                row.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const f = this.getAttribute('data-filter');
                if (i === 0) activeMarketplaceFilter = f;
                if (i === 1) activeCategoryFilter = f;
                updateAll(currentQuery);
            });
        });
    });

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500) loadMore();
    });

    // =========================================================================
    // 12. HEADER SCROLL EFFECT
    // =========================================================================
    const headerGlass = document.getElementById('headerGlass');
    if (headerGlass) {
        window.addEventListener('scroll', () => {
            headerGlass.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // =========================================================================
    // 13. SCROLL REVEAL (opcional)
    // =========================================================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // =========================================================================
    // 14. BANNER CARROSSEL AUTOMÁTICO
    // =========================================================================
    function initBannerCarousel() {
        const scroll = document.getElementById('bannerScroll');
        const dots = document.getElementById('bannerDots');
        const prevBtn = document.getElementById('bannerPrev');
        const nextBtn = document.getElementById('bannerNext');

        if (!scroll || !dots) {
            console.warn('⚠️ Banner elements not found, skipping carousel init.');
            return;
        }

        const slides = scroll.querySelectorAll('.banner-slide');
        const total = slides.length;

        if (total === 0) {
            console.warn('⚠️ No slides found in banner.');
            return;
        }

        let currentIndex = 0;
        let autoInterval = null;
        const AUTO_TIME = 4000; // 4 segundos

        // ===== CRIA AS BOLINHAS =====
        dots.innerHTML = '';
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('span');
            dot.dataset.index = i;
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', function() {
                goTo(parseInt(this.dataset.index));
                resetAuto();
            });
            dots.appendChild(dot);
        }

        const dotElements = dots.querySelectorAll('span');

        // ===== FUNÇÃO PARA IR PARA UM SLIDE =====
        function goTo(index) {
            if (index < 0) index = total - 1;
            if (index >= total) index = 0;
            currentIndex = index;
            scroll.style.transform = `translateX(-${index * 100}%)`;

            // Atualiza bolinhas
            dotElements.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        // ===== PRÓXIMO / ANTERIOR =====
        function next() {
            goTo(currentIndex + 1);
        }

        function prev() {
            goTo(currentIndex - 1);
        }

        // ===== SCROLL AUTOMÁTICO =====
        function startAuto() {
            if (autoInterval) clearInterval(autoInterval);
            autoInterval = setInterval(next, AUTO_TIME);
        }

        function stopAuto() {
            if (autoInterval) {
                clearInterval(autoInterval);
                autoInterval = null;
            }
        }

        function resetAuto() {
            stopAuto();
            startAuto();
        }

        // ===== EVENTOS DAS SETAS =====
        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                next();
                resetAuto();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                prev();
                resetAuto();
            });
        }

        // ===== PAUSA NO HOVER =====
        const container = document.querySelector('.banner-carousel-container');
        if (container) {
            container.addEventListener('mouseenter', stopAuto);
            container.addEventListener('mouseleave', startAuto);
        }

        // ===== TOQUE (mobile) =====
        let touchStartX = 0;
        let touchEndX = 0;
        const wrapper = document.querySelector('.banner-carousel-wrapper');

        if (wrapper) {
            wrapper.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            wrapper.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                if (Math.abs(diff) > 40) {
                    if (diff > 0) {
                        next();
                    } else {
                        prev();
                    }
                    resetAuto();
                }
            }, { passive: true });
        }

        // ===== CONTADOR REGRESSIVO =====
        let totalSeconds = 10 * 3600 + 55 * 60 + 52;

        function updateCountdown() {
            if (totalSeconds <= 0) {
                const el = document.getElementById('countdownBanner');
                if (el) el.textContent = '00:00:00';
                return;
            }
            totalSeconds--;
            const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
            const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
            const s = String(totalSeconds % 60).padStart(2, '0');
            const el = document.getElementById('countdownBanner');
            if (el) el.textContent = `${h}:${m}:${s}`;
        }

        // Inicia o contador imediatamente e depois a cada 1 segundo
        updateCountdown();
        setInterval(updateCountdown, 1000);

        // ===== INICIA O AUTOMÁTICO =====
        startAuto();

        console.log('🎯 Banner carrossel automático iniciado!');
        console.log(`📦 Total de banners: ${total}`);
    }

    // =========================================================================
    // 15. INICIALIZAÇÃO
    // =========================================================================
    updateAll('');
    
    // Inicializa o banner carrossel
    initBannerCarousel();
    
    console.log('🛍️ Loja ND pronta!');
    console.log('👤 Perfil:', localStorage.getItem('userName') || 'Visitante');
});