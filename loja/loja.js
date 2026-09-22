// =========================================================================
// LOJA.JS — Amor NeuroDivergente (VERSÃO SUPABASE)
// Sidebar + Acessibilidade + Hub + Loja + Banner + Wishlist
// =========================================================================

document.addEventListener("DOMContentLoaded", async () => {
    const body = document.body;
    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error('❌ Supabase não inicializado!');
        alert('Erro: Supabase não inicializado. Recarregue a página.');
        return;
    }

    // =============================================
    // ESTADO GLOBAL
    // =============================================
    let currentUser = null;
    let userProfile = null;
    let wishlistIds = new Set();
    let allProducts = [];
    let filteredProducts = [];
    let renderedCount = 0;
    const PRODUCTS_PER_PAGE = 6;
    let isLoading = false;
    let activeMarketplaceFilter = 'todos';
    let activeCategoryFilter = 'todos';
    let currentQuery = '';
    let searchTimeout = null;

    // Elementos DOM
    const searchInput = document.getElementById("productSearch");
    const productsGrid = document.getElementById("productsGrid");
    const noResults = document.getElementById("noResults");
    const productCounter = document.getElementById("productCounter");
    const loadingSpinner = document.getElementById("loadingSpinner");

    // =============================================
    // 0. AUTENTICAÇÃO + PERFIL
    // =============================================
    async function initAuth() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                currentUser = session.user;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username, avatar_url, full_name')
                    .eq('id', currentUser.id)
                    .maybeSingle();

                userProfile = profile;

                // Atualiza sidebar
                const sidebarAvatar = document.getElementById('sidebarAvatar');
                const sidebarUserName = document.getElementById('sidebarUserName');
                const sidebarUserEmail = document.getElementById('sidebarUserEmail');

                if (sidebarAvatar && profile?.avatar_url) sidebarAvatar.src = profile.avatar_url;
                if (sidebarUserName && (profile?.username || profile?.full_name)) {
                    sidebarUserName.textContent = profile.username || profile.full_name;
                }
                if (sidebarUserEmail && currentUser.email) sidebarUserEmail.textContent = currentUser.email;

                // Carrega wishlist
                await loadWishlist();

                console.log('👤 Logado como:', profile?.username || currentUser.email);
            } else {
                // Visitante
                const savedName = localStorage.getItem('userName');
                const savedEmail = localStorage.getItem('userEmail');
                const savedAvatar = localStorage.getItem('userAvatar');

                const sidebarAvatar = document.getElementById('sidebarAvatar');
                const sidebarUserName = document.getElementById('sidebarUserName');
                const sidebarUserEmail = document.getElementById('sidebarUserEmail');

                if (sidebarAvatar && savedAvatar) sidebarAvatar.src = savedAvatar;
                if (sidebarUserName && savedName) sidebarUserName.textContent = savedName;
                if (sidebarUserEmail && savedEmail) sidebarUserEmail.textContent = savedEmail;

                console.log('👤 Visitante');
            }
        } catch (e) {
            console.warn('⚠️ Erro ao verificar sessão:', e);
        }
    }

    // =============================================
    // WISHLIST
    // =============================================
    async function loadWishlist() {
        if (!currentUser) return;
        try {
            const { data, error } = await supabase.rpc('get_my_wishlists');
            if (error) throw error;
            wishlistIds = new Set((data || []).map(w => w.product_id));
            console.log(`❤️ ${wishlistIds.size} favoritos carregados`);
        } catch (e) {
            console.warn('⚠️ Erro ao carregar wishlist:', e);
        }
    }

    async function toggleWishlist(productId, btnElement) {
        if (!currentUser) {
            showToast('Faça login para favoritar produtos', 'warning');
            return;
        }

        const icon = btnElement.querySelector('i');
        const wasActive = btnElement.classList.contains('active');

        // Optimistic update
        btnElement.classList.toggle('active');
        icon.className = wasActive ? 'fa-regular fa-heart' : 'fa-solid fa-heart';

        try {
            const { data, error } = await supabase.rpc('toggle_wishlist', {
                p_product_id: productId
            });

            if (error) throw error;

            if (data?.success) {
                if (data.action === 'added') {
                    wishlistIds.add(productId);
                    showToast('❤️ Adicionado aos favoritos', 'success');
                } else {
                    wishlistIds.delete(productId);
                    showToast('💔 Removido dos favoritos', 'info');
                }
            } else {
                // Reverte
                btnElement.classList.toggle('active');
                icon.className = wasActive ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
                showToast(data?.error || 'Erro ao atualizar favorito', 'error');
            }
        } catch (e) {
            console.error('❌', e);
            // Reverte
            btnElement.classList.toggle('active');
            icon.className = wasActive ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            showToast('Erro ao atualizar favorito', 'error');
        }
    }

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
        if (sidebar.classList.contains('open')) closeSidebar();
        else openSidebar();
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
        const section = document.querySelector('.products-section');
        if (section) {
            section.classList.remove('a11y-large-text', 'a11y-small-text');
            if (textSize === 'large') section.classList.add('a11y-large-text');
            if (textSize === 'small') section.classList.add('a11y-small-text');
        }
    }

    applyA11ySettings();

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

    if (hubOverlay) hubOverlay.addEventListener('click', closeHub);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeHub();
    });

    function updateHubStatus() {
        const darkLabel = document.querySelector('.hub-action[data-a11y="darkMode"] .hub-action-label');
        if (darkLabel) darkLabel.textContent = body.classList.contains('a11y-dark-mode') ? 'Claro' : 'Escuro';

        const dyslexiaLabel = document.querySelector('.hub-action[data-a11y="dyslexiaFont"] .hub-action-label');
        if (dyslexiaLabel) dyslexiaLabel.textContent = body.classList.contains('a11y-dyslexia') ? 'Ativo' : 'Dislexia';

        const motionLabel = document.querySelector('.hub-action[data-a11y="reduceMotion"] .hub-action-label');
        if (motionLabel) motionLabel.textContent = body.classList.contains('a11y-reduce-motion') ? 'Ativo' : 'Movimento';
    }

    updateHubStatus();

    // Ações do Hub
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
    // 5. LOGOUT
    // =============================================
    document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('Tem certeza que deseja sair?')) {
            try {
                await supabase.auth.signOut();
            } catch (err) {
                console.warn('Erro ao fazer logout:', err);
            }
            localStorage.removeItem('userLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userAvatar');
            window.location.href = '/login/login.html';
        }
    });

    // =============================================
    // 6. CARREGAR PRODUTOS DO SUPABASE
    // =============================================
    async function loadProducts() {
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (productsGrid) productsGrid.innerHTML = '';

        try {
            const { data, error } = await supabase.rpc('get_products', {
                p_search: currentQuery || null,
                p_marketplace: activeMarketplaceFilter === 'todos' ? null : activeMarketplaceFilter,
                p_category: activeCategoryFilter === 'todos' ? null : activeCategoryFilter,
                p_limit: 200,
                p_offset: 0
            });

            if (error) throw error;

            allProducts = (data || []).map(p => ({
                ...p,
                price_formatted: formatPrice(p.price),
                old_price_formatted: p.old_price ? formatPrice(p.old_price) : null
            }));

            filteredProducts = allProducts;
            renderBatch();

            console.log(`🛍️ ${allProducts.length} produtos carregados do Supabase`);
        } catch (error) {
            console.error('❌ Erro ao carregar produtos:', error);
            showToast('Erro ao carregar produtos. Usando dados locais.', 'warning');
            // Fallback para dados locais
            loadLocalFallback();
        } finally {
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
    }

    // =============================================
    // 7. FALLBACK LOCAL (se Supabase falhar)
    // =============================================
    function loadLocalFallback() {
        const fallbackDB = [
            { id: 'local-1', title: 'Manta de Peso Sensorial Terapêutica 5kg', vendor: 'SensorPeso', rating: 5, rating_count: 215, price: 199.90, old_price: 249.90, marketplace: 'amazon', category: 'sensorial', image: 'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=400&h=300&fit=crop', link: '#' },
            { id: 'local-2', title: 'Fidget Toy Cubo Infinito Anti Estresse', vendor: 'FidgetBrasil', rating: 4, rating_count: 327, price: 24.90, old_price: 39.90, marketplace: 'shopee', category: 'foco-tdah', image: 'https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?w=400&h=300&fit=crop', link: '#' },
            { id: 'local-3', title: 'Pulseira Mastigável Sensorial Antiestresse', vendor: 'ChewyWear', rating: 5, rating_count: 303, price: 19.90, old_price: 34.90, marketplace: 'shopee', category: 'sensorial', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop', link: '#' },
            { id: 'local-4', title: 'Relógio Timer Visual 60min para TDAH', vendor: 'TimeManager', rating: 4, rating_count: 283, price: 39.90, old_price: 59.90, marketplace: 'aliexpress', category: 'foco-tdah', image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=400&h=300&fit=crop', link: '#' },
            { id: 'local-5', title: 'Fone Bluetooth Cancelamento de Ruído ANC', vendor: 'AudioPro', rating: 4, rating_count: 456, price: 149.90, old_price: 249.90, marketplace: 'shopee', category: 'audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', link: '#' },
            { id: 'local-6', title: 'Camiseta Orgulho Neurodivergente', vendor: 'NeuroStore', rating: 5, rating_count: 142, price: 49.90, old_price: 79.90, marketplace: 'aliexpress', category: 'vestuario', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop', link: '#' },
        ].map(p => ({
            ...p,
            price_formatted: formatPrice(p.price),
            old_price_formatted: p.old_price ? formatPrice(p.old_price) : null
        }));

        allProducts = fallbackDB;
        filteredProducts = fallbackDB;
        renderBatch();
    }

    // =============================================
    // 8. FORMATAR PREÇO
    // =============================================
    function formatPrice(value) {
        if (value === null || value === undefined) return 'R$ 0,00';
        return 'R$ ' + Number(value).toFixed(2).replace('.', ',');
    }

    // =============================================
    // 9. CRIAR CARD DE PRODUTO
    // =============================================
    function createProductCard(product) {
        const stars = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
        const mpNames = { 'aliexpress': 'AliExpress', 'shopee': 'Shopee', 'mercado-livre': 'Mercado Livre', 'amazon': 'Amazon' };
        const isFav = wishlistIds.has(product.id);

        const card = document.createElement('article');
        card.className = 'product-card';
        card.style.animation = 'fadeIn 0.4s ease forwards';
        card.dataset.productId = product.id;

        card.innerHTML = `
            <div class="product-image-area">
                <img src="${product.image || 'https://via.placeholder.com/400x300?text=Produto'}" alt="${escapeHtml(product.title)}" class="product-img" loading="lazy">
                <span class="marketplace-badge ${product.marketplace}">${mpNames[product.marketplace] || product.marketplace}</span>
                <button class="btn-wishlist ${isFav ? 'active' : ''}" aria-label="Favorito" data-product-id="${product.id}">
                    <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                </button>
            </div>
            <div class="product-info-area">
                <h4 class="product-title">${escapeHtml(product.title)}</h4>
                <div class="product-vendor">${escapeHtml(product.vendor)}</div>
                <div class="product-rating">${stars} <span class="rating-count">(${product.rating_count})</span></div>
                <div class="product-price">
                    ${product.old_price_formatted ? `<span class="old-price">${product.old_price_formatted}</span>` : ''}
                    <span class="current-price">${product.price_formatted}</span>
                </div>
                <a href="${product.link || '#'}" target="_blank" rel="nofollow" class="btn-buy">Ver na ${mpNames[product.marketplace] || 'Loja'}</a>
            </div>`;

        const wishBtn = card.querySelector('.btn-wishlist');
        wishBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id, wishBtn);
        });

        return card;
    }

    // =============================================
    // 10. RENDERIZAR EM LOTES
    // =============================================
    function renderBatch() {
        if (!productsGrid) return;
        productsGrid.innerHTML = '';
        renderedCount = 0;

        if (filteredProducts.length === 0) {
            if (noResults) noResults.style.display = 'block';
            if (productCounter) productCounter.textContent = '0 produtos';
            return;
        }

        if (noResults) noResults.style.display = 'none';

        const batch = filteredProducts.slice(0, PRODUCTS_PER_PAGE);
        batch.forEach(p => productsGrid.appendChild(createProductCard(p)));
        renderedCount = PRODUCTS_PER_PAGE;

        if (productCounter) {
            productCounter.textContent = `${filteredProducts.length} produto${filteredProducts.length > 1 ? 's' : ''} encontrado${filteredProducts.length > 1 ? 's' : ''}`;
        }
    }

    // =============================================
    // 11. CARREGAR MAIS (INFINITE SCROLL)
    // =============================================
    function loadMore() {
        if (isLoading) return;
        if (renderedCount >= filteredProducts.length) return;

        isLoading = true;
        if (loadingSpinner) loadingSpinner.style.display = 'block';

        setTimeout(() => {
            const nextBatch = filteredProducts.slice(renderedCount, renderedCount + PRODUCTS_PER_PAGE);
            nextBatch.forEach(p => productsGrid.appendChild(createProductCard(p)));
            renderedCount += PRODUCTS_PER_PAGE;
            isLoading = false;
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }, 400);
    }

    // =============================================
    // 12. APLICAR FILTROS
    // =============================================
    function applyFilters() {
        filteredProducts = allProducts.filter(p => {
            if (activeMarketplaceFilter !== 'todos' && p.marketplace !== activeMarketplaceFilter) return false;
            if (activeCategoryFilter !== 'todos' && p.category !== activeCategoryFilter) return false;
            return true;
        });
        renderBatch();
    }

    // =============================================
    // 13. BUSCA
    // =============================================
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                currentQuery = searchInput.value.trim();
                await loadProducts();
            }, 400);
        });
    }

    // =============================================
    // 14. FILTROS (BOTÕES PILL)
    // =============================================
    document.querySelectorAll('.filter-row').forEach((row, i) => {
        row.querySelectorAll('.pill-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                row.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const f = this.getAttribute('data-filter');
                if (i === 0) activeMarketplaceFilter = f;
                if (i === 1) activeCategoryFilter = f;
                applyFilters();
            });
        });
    });

    // =============================================
    // 15. INFINITE SCROLL
    // =============================================
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500) {
            loadMore();
        }
    });

    // =============================================
    // 16. HEADER SCROLL EFFECT
    // =============================================
    const headerGlass = document.getElementById('headerGlass');
    if (headerGlass) {
        window.addEventListener('scroll', () => {
            headerGlass.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // =============================================
    // 17. BANNER CARROSSEL
    // =============================================
    function initBannerCarousel() {
        const scroll = document.getElementById('bannerScroll');
        const dots = document.getElementById('bannerDots');
        const prevBtn = document.getElementById('bannerPrev');
        const nextBtn = document.getElementById('bannerNext');

        if (!scroll || !dots) return;

        const slides = scroll.querySelectorAll('.banner-slide');
        const total = slides.length;
        if (total === 0) return;

        let currentIndex = 0;
        let autoInterval = null;
        const AUTO_TIME = 4000;

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

        function goTo(index) {
            if (index < 0) index = total - 1;
            if (index >= total) index = 0;
            currentIndex = index;
            scroll.style.transform = `translateX(-${index * 100}%)`;
            dotElements.forEach((dot, i) => dot.classList.toggle('active', i === index));
        }

        function next() { goTo(currentIndex + 1); }
        function prev() { goTo(currentIndex - 1); }
        function startAuto() {
            if (autoInterval) clearInterval(autoInterval);
            autoInterval = setInterval(next, AUTO_TIME);
        }
        function stopAuto() {
            if (autoInterval) { clearInterval(autoInterval); autoInterval = null; }
        }
        function resetAuto() { stopAuto(); startAuto(); }

        nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); next(); resetAuto(); });
        prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); prev(); resetAuto(); });

        const container = document.querySelector('.banner-carousel-container');
        if (container) {
            container.addEventListener('mouseenter', stopAuto);
            container.addEventListener('mouseleave', startAuto);
        }

        let touchStartX = 0;
        const wrapper = document.querySelector('.banner-carousel-wrapper');
        if (wrapper) {
            wrapper.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            wrapper.addEventListener('touchend', (e) => {
                const diff = touchStartX - e.changedTouches[0].screenX;
                if (Math.abs(diff) > 40) {
                    diff > 0 ? next() : prev();
                    resetAuto();
                }
            }, { passive: true });
        }

        // Contador regressivo
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
        updateCountdown();
        setInterval(updateCountdown, 1000);

        startAuto();
        console.log(`🎯 Banner carrossel iniciado (${total} slides)`);
    }

    // =============================================
    // 18. TOAST DE NOTIFICAÇÃO
    // =============================================
    function showToast(msg, type = 'info', duration = 3000) {
        const existing = document.querySelector('.shop-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'shop-toast';
        toast.textContent = msg;

        const colors = { success: '#10b981', error: '#ef4444', info: '#7c3aed', warning: '#f59e0b' };
        toast.style.cssText = `
            position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(100px);
            background:${colors[type] || colors.info};color:#fff;padding:14px 32px;
            border-radius:30px;font-size:14px;font-weight:500;z-index:99999;
            box-shadow:0 8px 30px rgba(0,0,0,0.2);transition:all 0.4s ease;
            opacity:0;pointer-events:none;max-width:90vw;text-align:center;
            font-family:Inter,sans-serif;
        `;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }

    // =============================================
    // 19. ESCAPE HTML (Segurança)
    // =============================================
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =============================================
    // 20. REALTIME — Atualizações em tempo real
    // =============================================
    function subscribeToProductsRealtime() {
        supabase
            .channel('shop-products-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'products'
            }, (payload) => {
                console.log('🔄 Produto atualizado em tempo real:', payload);
                // Recarrega apenas se for mudança relevante
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
                    loadProducts();
                }
            })
            .subscribe();
    }

    // =============================================
    // 21. INICIALIZAÇÃO
    // =============================================
    await initAuth();
    await loadProducts();
    initBannerCarousel();
    subscribeToProductsRealtime();

    console.log('🛍️ Loja ND pronta (Supabase)!');
    console.log('👤 Usuário:', currentUser?.email || 'Visitante');
    console.log('❤️ Favoritos:', wishlistIds.size);
});