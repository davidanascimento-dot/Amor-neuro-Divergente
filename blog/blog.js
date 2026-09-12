// =========================================================================
// BLOG.JS — Amor NeuroDivergente
// Sidebar + Perfil + Acessibilidade + Hub Flutuante + Blog dinâmico
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
    // 8. BLOG — BANCO DE ARTIGOS
    // =============================================
    const allArticles = [
        {
            id: 1,
            title: "O dia em que você para de sobreviver e começa a viver",
            description: "Existe uma diferença silenciosa entre estar vivo e sentir que estamos vivendo. Um convite à pausa e ao reconhecimento do cansaço.",
            category: "autismo",
            tags: ["Autismo", "Reflexão", "Vida Adulta"],
            date: "12/09/2026",
            readTime: "4 min",
            image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80",
            link: "/blog/post-masking.html"
        },
        {
            id: 2,
            title: "Neurodivergência no ambiente de trabalho: desafios e oportunidades",
            description: "Como empresas podem criar ambientes mais inclusivos para profissionais neurodivergentes, promovendo diversidade e inovação.",
            category: "autismo",
            tags: ["Autismo", "Trabalho", "Inclusão"],
            date: "10/09/2026",
            readTime: "5 min",
            image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
            link: "/blog/blog.html"
        },
        {
            id: 3,
            title: "Estratégias para gerenciar o TDAH no dia a dia",
            description: "Dicas práticas e ferramentas que ajudam na organização, foco e bem-estar para pessoas com TDAH.",
            category: "tdah",
            tags: ["TDAH", "Rotina", "Produtividade"],
            date: "08/09/2026",
            readTime: "7 min",
            image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
            link: "/blog/blog.html"
        },
        {
            id: 4,
            title: "Comunicação alternativa e aumentativa: o que é e como usar",
            description: "Conheça os recursos de comunicação alternativa para pessoas autistas não-verbais e como eles funcionam.",
            category: "comunicacao",
            tags: ["Autismo", "Comunicação", "Terapia"],
            date: "06/09/2026",
            readTime: "4 min",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
            link: "/blog/blog.html"
        },
        {
            id: 5,
            title: "Neurodivergência e Ansiedade: como o cérebro atípico processa o medo",
            description: "Uma explicação clara sobre por que a ansiedade é tão comum em pessoas neurodivergentes e o que fazer.",
            category: "saude-mental",
            tags: ["Saúde Mental", "Ansiedade", "Neurociência"],
            date: "04/09/2026",
            readTime: "4 min",
            image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
            link: "/blog/blog.html"
        },
        {
            id: 6,
            title: "Como solicitar adaptações no trabalho: passo a passo",
            description: "Guia prático sobre seus direitos e como pedir adaptações razoáveis no ambiente profissional.",
            category: "direitos",
            tags: ["Direitos", "Trabalho", "Legislação"],
            date: "02/09/2026",
            readTime: "6 min",
            image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
            link: "/blog/blog.html"
        },
        {
            id: 7,
            title: "Burnout em mães atípicas: quem cuida de quem cuida?",
            description: "Existe um cansaço que não aparece quando olhamos rapidamente para uma mãe. Um olhar sobre a maternidade atípica.",
            category: "familia",
            tags: ["Família", "Cuidado", "Maternidade"],
            date: "02/09/2026",
            readTime: "3 min",
            image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&q=80",
            link: "/blog/blog.html"
        },
        {
            id: 8,
            title: "Autismo e Saúde Mental: olhando além do diagnóstico",
            description: "Quando uma criança autista muda de comportamento, tudo é atribuído ao autismo? Reflexão importante.",
            category: "autismo",
            tags: ["Autismo", "Saúde Mental", "Infância"],
            date: "04/09/2026",
            readTime: "3 min",
            image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
            link: "/blog/blog.html"
        },
        {
            id: 9,
            title: "Descobrindo o extraordinário que existe no comum",
            description: "Talvez tenhamos aprendido a procurar a felicidade nos lugares errados. Uma reflexão sobre presença.",
            category: "saude-mental",
            tags: ["Reflexão", "Bem-estar", "Vida"],
            date: "04/09/2026",
            readTime: "4 min",
            image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80",
            link: "/blog/blog.html"
        }
    ];

    let currentFilter = 'todos';
    let currentSearch = '';
    let visibleCount = 6;
    const PAGE_SIZE = 6;

    const blogGrid = document.getElementById('blogGrid');
    const blogEmpty = document.getElementById('blogEmpty');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function tagClass(tag) {
        const slug = tag.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-');
        return `tag tag--${slug}`;
    }

    function getFilteredArticles() {
        let filtered = [...allArticles];

        if (currentFilter !== 'todos') {
            filtered = filtered.filter(a => a.category === currentFilter);
        }

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
        const display = filtered.slice(0, visibleCount);

        if (filtered.length === 0) {
            blogGrid.innerHTML = '';
            if (blogEmpty) blogEmpty.hidden = false;
            if (loadMoreBtn) loadMoreBtn.parentElement.style.display = 'none';
            return;
        }

        if (blogEmpty) blogEmpty.hidden = true;

        blogGrid.innerHTML = display.map(a => `
            <article class="blog-card">
                <div class="card-image" style="background-image:url('${a.image}')">
                    <div class="card-badges">
                        <span class="badge badge-purple">
                            <i class="fa-regular fa-clock"></i> ${a.readTime}
                        </span>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-tags">
                        ${a.tags.slice(0, 3).map(t =>
                            `<span class="${tagClass(t)}">${escapeHtml(t)}</span>`
                        ).join('')}
                    </div>
                    <h3><a href="${a.link}">${escapeHtml(a.title)}</a></h3>
                    <p>${escapeHtml(a.description)}</p>
                    <a href="${a.link}" class="btn-outline">
                        Leia mais <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </article>
        `).join('');

        // Mostra/esconde botão "carregar mais"
        if (loadMoreBtn) {
            if (display.length >= filtered.length) {
                loadMoreBtn.parentElement.style.display = 'none';
            } else {
                loadMoreBtn.parentElement.style.display = 'block';
            }
        }

        if (window.enhanceReadingCards) window.enhanceReadingCards();
    }

    // Filtros
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter || 'todos';
            visibleCount = PAGE_SIZE;
            renderArticles();
        });
    });

    // Busca com debounce
    let debounceTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                currentSearch = this.value;
                visibleCount = PAGE_SIZE;
                renderArticles();
            }, 300);
        });
    }

    // Load more
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            visibleCount += PAGE_SIZE;
            renderArticles();
        });
    }

    // Inicializa
    renderArticles();

    // =============================================
    // 9. TOAST
    // =============================================
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toastMsg');
        if (!toast) return;
        toast.textContent = message;
        toast.className = `toast-msg-custom ${type} show`;
        setTimeout(() => { toast.classList.remove('show'); }, 2500);
    }
    window.showToast = showToast;

    console.log('📝 Blog inicializado!');
    console.log('   ♿ Acessibilidade integrada (hub flutuante + sidebar)');
    console.log('   🔍 Filtros e busca funcionando');
    console.log('   👤 Perfil:', localStorage.getItem('userName') || 'Visitante');
});