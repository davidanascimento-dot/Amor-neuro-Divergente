// =========================================================================
// BLOG.JS — Amor NeuroDivergente
// Sidebar responsiva + Perfil + Acessibilidade + Hub Flutuante + Blog dinâmico
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
        if (e.key === 'userAvatar' || e.key === 'userName' || e.key === 'userEmail') syncProfile();
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

    // =============================================
    // 3. ACESSIBILIDADE NA SIDEBAR
    // =============================================
    const a11yToggle = document.getElementById('a11yToggle');
    const a11yOptions = document.getElementById('a11yOptions');

    // Verifica se existem os elementos no HTML (podem não estar)
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

    // =============================================
    // 4. FUNÇÕES DE ACESSIBILIDADE
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
    }

    // Aplica configurações iniciais
    applyA11ySettings();

    // Botões de acessibilidade na sidebar (se existirem)
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

    // =============================================
    // 5. HUB FLUTUANTE - ACESSIBILIDADE
    // =============================================
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

    // =============================================
    // 6. FUNÇÕES DO HUB - ATUALIZAR STATUS
    // =============================================
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

    // =============================================
    // 7. AÇÕES DO HUB - ACESSIBILIDADE
    // =============================================
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
    // 9. LOGOUT
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

    // =============================================
    // 10. BLOG - BANCO DE DADOS DE ARTIGOS
    // =============================================
    let allArticles = [
        {
            id: 1,
            title: "Autonomia no autismo com apoio da comunicação visual",
            description: "Descubra como a comunicação visual pode ajudar crianças com autismo a desenvolver autonomia no dia a dia.",
            category: "Autismo",
            tags: ["Blog", "Autismo", "Comunicação"],
            date: "05/02/2026",
            readTime: "1 min",
            image: "/img/blog-post-1-DvwhQAY4.jpg",
            link: "/blog/artigos/artigo.html"
        },
        {
            id: 2,
            title: "Como conseguir terapia de graça para autistas?",
            description: "Guia completo sobre como acessar terapias gratuitas pelo SUS e outros programas para crianças autistas.",
            category: "Direitos",
            tags: ["Blog", "Terapia", "Direitos", "SUS"],
            date: "05/02/2026",
            readTime: "1 min",
            image: "/img/blog-post-2-Dk5Jy2bJ.jpg",
            link: "/blog/artigos-2/blog1.html"
        },
        {
            id: 3,
            title: "Fonoaudiologia ABA: qual é o papel desse profissional na comunicação do autista?",
            description: "Entenda como o fonoaudiólogo especializado em ABA pode auxiliar no desenvolvimento da comunicação.",
            category: "Fonoaudiologia",
            tags: ["Blog", "ABA", "Fonoaudiologia", "TDAH"],
            date: "05/02/2026",
            readTime: "1 min",
            image: "/img/blog-post-3-EqM0ehGW.jpg",
            link: "/blog/artigos-3/blog1.html"
        },
        {
            id: 4,
            title: "Neurodiversidade no ambiente de trabalho",
            description: "Como empresas podem se tornar mais inclusivas para profissionais neurodivergentes.",
            category: "Inclusão",
            tags: ["Blog", "Inclusão", "Trabalho"],
            date: "10/02/2026",
            readTime: "3 min",
            image: "/img/blog-post-4.jpg",
            link: "/blog/artigos/neurodiversidade-trabalho.html"
        },
        {
            id: 5,
            title: "Estratégias para lidar com a sobrecarga sensorial",
            description: "Técnicas e ferramentas para gerenciar a sobrecarga sensorial no dia a dia.",
            category: "Autismo",
            tags: ["Blog", "Autismo", "Sensorial"],
            date: "12/02/2026",
            readTime: "2 min",
            image: "/img/blog-post-5.jpg",
            link: "/blog/artigos/sobrecarga-sensorial.html"
        },
        {
            id: 6,
            title: "TDAH em adultos: desafios e estratégias",
            description: "Como o TDAH se manifesta na vida adulta e quais estratégias podem ajudar.",
            category: "TDAH",
            tags: ["Blog", "TDAH", "Adultos"],
            date: "15/02/2026",
            readTime: "2 min",
            image: "/img/blog-post-6.jpg",
            link: "/blog/artigos/tdah-adultos.html"
        },
        {
            id: 7,
            title: "O que é Neurodivergente? Exemplos, sinais e principais dúvidas!",
            description: "Entenda o conceito de neurodivergência, exemplos de condições e as principais dúvidas sobre o tema.",
            category: "Blog",
            tags: ["Blog", "Neurodivergência", "Informação"],
            date: "20/02/2026",
            readTime: "5 min",
            image: "/img/blog-post-7.jpg",
            link: "/blog/artigos/neurodivergente.html"
        }
    ];

    let articles = [...allArticles];
    let currentFilter = "Blog";
    let currentSearch = "";
    let currentPage = 1;
    let isLoading = false;
    let hasMoreArticles = true;
    const ARTICLES_PER_PAGE = 6;

    const blogGrid = document.getElementById('blogGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');

    // =============================================
    // 11. FUNÇÕES DO BLOG
    // =============================================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        const parts = dateStr.split('/');
        return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }

    function getFilteredArticles() {
        let filtered = articles.filter(a => {
            // Filtro por categoria/tag
            if (currentFilter !== "Blog") {
                return a.category === currentFilter || a.tags.includes(currentFilter);
            }
            return true;
        });

        // Filtro por busca
        if (currentSearch.trim()) {
            const term = currentSearch.toLowerCase().trim();
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(term) ||
                a.description.toLowerCase().includes(term) ||
                a.tags.some(t => t.toLowerCase().includes(term))
            );
        }

        return filtered;
    }

    function renderArticles() {
        if (!blogGrid) return;

        const filtered = getFilteredArticles();

        if (filtered.length === 0) {
            blogGrid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
                    <i class="fa-solid fa-search" style="font-size:48px;color:#9F7AEA;margin-bottom:20px;"></i>
                    <h3>Nenhum artigo encontrado</h3>
                    <p style="color:#888;">Tente outro termo ou filtro.</p>
                </div>`;
            hasMoreArticles = false;
            const sentinel = document.querySelector('.scroll-sentinel');
            if (sentinel) {
                const spinner = sentinel.querySelector('.loading-spinner');
                if (spinner) spinner.style.display = 'none';
            }
            return;
        }

        const display = filtered.slice(0, currentPage * ARTICLES_PER_PAGE);
        hasMoreArticles = display.length < filtered.length;

        blogGrid.innerHTML = display.map(a => `
            <article class="blog-card">
                <div class="card-image" style="background-image:url('${a.image}')">
                    <div class="card-badges">
                        <span class="badge"><i class="fa-regular fa-clock"></i> ${a.date}</span>
                        <span class="badge badge-purple"><i class="fa-solid fa-book-open"></i> ~${a.readTime}</span>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-tags">
                        ${a.tags.slice(0, 3).map(t => `<span><i class="fa-solid fa-tag"></i> ${escapeHtml(t)}</span>`).join('')}
                    </div>
                    <h3>${escapeHtml(a.title)}</h3>
                    <p>${escapeHtml(a.description)}</p>
                    <a href="${a.link}" class="btn-outline">Leia mais <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </article>
        `).join('');

        // Atualiza o sentinel
        const sentinel = document.querySelector('.scroll-sentinel');
        if (sentinel) {
            const spinner = sentinel.querySelector('.loading-spinner');
            if (spinner) {
                spinner.style.display = hasMoreArticles ? 'none' : 'none';
            }
            sentinel.style.display = hasMoreArticles ? 'block' : 'none';
        }
    }

    async function loadMore() {
        if (isLoading || !hasMoreArticles) return;
        isLoading = true;

        const sentinel = document.querySelector('.scroll-sentinel');
        const spinner = sentinel?.querySelector('.loading-spinner');
        if (spinner) spinner.style.display = 'flex';

        // Simula carregamento
        await new Promise(r => setTimeout(r, 600));

        currentPage++;
        isLoading = false;
        renderArticles();
        if (spinner) spinner.style.display = 'none';
    }

    function setupInfiniteScroll() {
        const existing = document.querySelector('.scroll-sentinel');
        if (existing) existing.remove();

        const sentinel = document.createElement('div');
        sentinel.className = 'scroll-sentinel';
        sentinel.innerHTML = `
            <div class="loading-spinner" style="display:none;">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Carregando mais artigos...
            </div>
        `;
        
        const blogSection = document.querySelector('.blog-section');
        if (blogSection) {
            blogSection.appendChild(sentinel);
        } else if (blogGrid) {
            blogGrid.parentElement.appendChild(sentinel);
        }

        // Observer para scroll infinito
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isLoading && hasMoreArticles) {
                loadMore();
            }
        }, { threshold: 0.1, rootMargin: '100px' });

        observer.observe(sentinel);

        // Guarda referência para cleanup
        window._blogObserver = observer;
    }

    // =============================================
    // 12. EVENTOS DO BLOG
    // =============================================
    // Filtros
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.textContent.trim();
            currentPage = 1;
            hasMoreArticles = true;
            renderArticles();
            setupInfiniteScroll();
        });
    });

    // Busca com debounce
    let debounceTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                currentSearch = this.value;
                currentPage = 1;
                hasMoreArticles = true;
                renderArticles();
                setupInfiniteScroll();
            }, 400);
        });
    }

    // =============================================
    // 13. SCROLL TO TOP
    // =============================================
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // =============================================
    // 14. TOAST
    // =============================================
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toastMsg');
        if (!toast) return;
        toast.textContent = message;
        toast.className = `toast-msg-custom ${type}`;
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.opacity = '0'; }, 2500);
    }

    // =============================================
    // 15. INICIALIZAÇÃO
    // =============================================
    renderArticles();
    setupInfiniteScroll();

    console.log('📝 Blog inicializado!');
    console.log('   ♿ Acessibilidade integrada (hub flutuante + sidebar)');
    console.log('   🔍 Filtros e busca com debounce');
    console.log('   📜 Scroll infinito');
    console.log('   👤 Perfil:', localStorage.getItem('userName') || 'Visitante');
});