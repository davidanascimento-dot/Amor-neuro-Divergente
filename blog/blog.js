document.addEventListener('DOMContentLoaded', () => {
    
    const body = document.body;

    // =============================================
    // 1. SINCRONIZAÇÃO DE PERFIL
    // =============================================
    function syncProfileFromStorage() {
        const savedAvatar = localStorage.getItem('userAvatar');
        const headerAvatar = document.getElementById('headerAvatar');
        if (savedAvatar && headerAvatar) {
            headerAvatar.src = savedAvatar;
            headerAvatar.onerror = () => {
                headerAvatar.src = '/img/avatar-padrao.png';
            };
        }
    }
    syncProfileFromStorage();
    window.addEventListener('storage', (e) => {
        if (e.key === 'userAvatar') syncProfileFromStorage();
    });

    // =============================================
    // 2. ACESSIBILIDADE NO HEADER
    // =============================================
    const a11yToggle = document.getElementById('a11yToggle');
    const a11yDropdown = document.getElementById('a11yDropdown');

    if (a11yToggle && a11yDropdown) {
        a11yToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isHidden = a11yDropdown.hasAttribute('hidden');
            if (isHidden) {
                a11yDropdown.removeAttribute('hidden');
                a11yToggle.setAttribute('aria-expanded', 'true');
            } else {
                a11yDropdown.setAttribute('hidden', '');
                a11yToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!a11yDropdown.contains(e.target) && e.target !== a11yToggle) {
                a11yDropdown.setAttribute('hidden', '');
                a11yToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Fechar com Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !a11yDropdown.hasAttribute('hidden')) {
                a11yDropdown.setAttribute('hidden', '');
                a11yToggle.setAttribute('aria-expanded', 'false');
                a11yToggle.focus();
            }
        });
    }

    // Funções de acessibilidade
    function getSetting(key, fallback = 'false') {
        return localStorage.getItem(`a11y_${key}`) || fallback;
    }

    function setSetting(key, value) {
        localStorage.setItem(`a11y_${key}`, value);
    }

    function updateStatusLabel(elementId, isActive) {
        const el = document.getElementById(elementId);
        if (el) el.textContent = isActive ? 'Ligado' : 'Desligado';
    }

    function applySavedSettings() {
        const mainContent = document.querySelector('.main-content');
        
        if (getSetting('darkMode') === 'true') body.classList.add('a11y-dark-mode');
        if (getSetting('highlightLinks') === 'true') body.classList.add('a11y-highlight-links');
        if (getSetting('dyslexiaFont') === 'true') body.classList.add('a11y-dyslexia');
        if (getSetting('reduceMotion') === 'true') body.classList.add('a11y-reduce-motion');
        
        const textSize = getSetting('textSize', 'normal');
        if (mainContent) {
            mainContent.classList.remove('a11y-large-text', 'a11y-small-text');
            if (textSize === 'large') mainContent.classList.add('a11y-large-text');
            if (textSize === 'small') mainContent.classList.add('a11y-small-text');
        }
        
        updateStatusLabel('darkModeStatus', getSetting('darkMode') === 'true');
        updateStatusLabel('linksStatus', getSetting('highlightLinks') === 'true');
        updateStatusLabel('dyslexiaStatus', getSetting('dyslexiaFont') === 'true');
        updateStatusLabel('motionStatus', getSetting('reduceMotion') === 'true');
    }

    // Botões de acessibilidade
    document.querySelectorAll('.a11y-option, .a11y-reset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const action = btn.getAttribute('data-a11y');
            const mainContent = document.querySelector('.main-content');
            let message = '';

            switch (action) {
                case 'darkMode':
                    const dm = getSetting('darkMode') === 'true';
                    setSetting('darkMode', dm ? 'false' : 'true');
                    if (dm) body.classList.remove('a11y-dark-mode');
                    else body.classList.add('a11y-dark-mode');
                    updateStatusLabel('darkModeStatus', !dm);
                    message = !dm ? '🌙 Modo escuro ativado' : '☀️ Modo claro ativado';
                    break;

                case 'increaseText':
                    const cs = getSetting('textSize', 'normal');
                    if (cs === 'large') {
                        setSetting('textSize', 'normal');
                        if (mainContent) mainContent.classList.remove('a11y-large-text');
                        message = '📝 Texto normal';
                    } else {
                        setSetting('textSize', 'large');
                        if (mainContent) {
                            mainContent.classList.remove('a11y-small-text');
                            mainContent.classList.add('a11y-large-text');
                        }
                        message = '🔍 Texto aumentado';
                    }
                    break;

                case 'decreaseText':
                    const csz = getSetting('textSize', 'normal');
                    if (csz === 'small') {
                        setSetting('textSize', 'normal');
                        if (mainContent) mainContent.classList.remove('a11y-small-text');
                        message = '📝 Texto normal';
                    } else {
                        setSetting('textSize', 'small');
                        if (mainContent) {
                            mainContent.classList.remove('a11y-large-text');
                            mainContent.classList.add('a11y-small-text');
                        }
                        message = '🔍 Texto diminuído';
                    }
                    break;

                case 'highlightLinks':
                    const hl = getSetting('highlightLinks') === 'true';
                    setSetting('highlightLinks', hl ? 'false' : 'true');
                    if (hl) body.classList.remove('a11y-highlight-links');
                    else body.classList.add('a11y-highlight-links');
                    updateStatusLabel('linksStatus', !hl);
                    message = '🔗 Links destacados';
                    break;

                case 'dyslexiaFont':
                    const df = getSetting('dyslexiaFont') === 'true';
                    setSetting('dyslexiaFont', df ? 'false' : 'true');
                    if (df) body.classList.remove('a11y-dyslexia');
                    else body.classList.add('a11y-dyslexia');
                    updateStatusLabel('dyslexiaStatus', !df);
                    message = !df ? '🔤 Fonte dislexia ativada' : '🔤 Fonte padrão';
                    break;

                case 'reduceMotion':
                    const rm = getSetting('reduceMotion') === 'true';
                    setSetting('reduceMotion', rm ? 'false' : 'true');
                    if (rm) body.classList.remove('a11y-reduce-motion');
                    else body.classList.add('a11y-reduce-motion');
                    updateStatusLabel('motionStatus', !rm);
                    message = !rm ? '🧘 Animações reduzidas' : '🏃 Animações normais';
                    break;

                case 'reset':
                    ['darkMode', 'highlightLinks', 'dyslexiaFont', 'reduceMotion', 'textSize'].forEach(k => localStorage.removeItem(`a11y_${k}`));
                    body.classList.remove('a11y-dark-mode', 'a11y-highlight-links', 'a11y-dyslexia', 'a11y-reduce-motion');
                    if (mainContent) mainContent.classList.remove('a11y-large-text', 'a11y-small-text');
                    updateStatusLabel('darkModeStatus', false);
                    updateStatusLabel('linksStatus', false);
                    updateStatusLabel('dyslexiaStatus', false);
                    updateStatusLabel('motionStatus', false);
                    message = '🔄 Configurações restauradas';
                    break;
            }
            
            if (message) showToast(message, 'info');
        });
    });

    applySavedSettings();

    // =============================================
    // 3. TOAST
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
    // 4. BANCO DE DADOS DE ARTIGOS
    // =============================================
    let articles = [
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
            link: "/blog/artigos - 2/blog1.html"
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
            link: "/blog/artigos -3/blog1.html"
        }
    ];

    const additionalArticles = [
        {
            id: 4, title: "Neurodiversidade no ambiente de trabalho",
            description: "Como empresas podem se tornar mais inclusivas para profissionais neurodivergentes.",
            category: "Inclusão", tags: ["Blog", "Inclusão", "Trabalho"],
            date: "10/02/2026", readTime: "3 min", image: "/img/blog-post-4.jpg",
            link: "/blog/artigos/neurodiversidade-trabalho.html"
        },
        {
            id: 5, title: "Estratégias para lidar com a sobrecarga sensorial",
            description: "Técnicas e ferramentas para gerenciar a sobrecarga sensorial no dia a dia.",
            category: "Autismo", tags: ["Blog", "Autismo", "Sensorial"],
            date: "12/02/2026", readTime: "2 min", image: "/img/blog-post-5.jpg",
            link: "/blog/artigos/sobrecarga-sensorial.html"
        },
        {
            id: 6, title: "TDAH em adultos: desafios e estratégias",
            description: "Como o TDAH se manifesta na vida adulta e quais estratégias podem ajudar.",
            category: "TDAH", tags: ["Blog", "TDAH", "Adultos"],
            date: "15/02/2026", readTime: "2 min", image: "/img/blog-post-6.jpg",
            link: "/blog/artigos/tdah-adultos.html"
        }
    ];

    let currentFilter = "Blog";
    let currentSearch = "";
    let currentPage = 1;
    let isLoading = false;
    let hasMoreArticles = true;

    const blogGrid = document.getElementById('blogGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');

    // =============================================
    // 5. FUNÇÕES
    // =============================================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function renderArticles() {
        if (!blogGrid) return;

        let filtered = articles.filter(a => {
            if (currentFilter !== "Blog") {
                return a.category === currentFilter || a.tags.includes(currentFilter);
            }
            return true;
        });

        if (currentSearch.trim()) {
            const term = currentSearch.toLowerCase();
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(term) ||
                a.description.toLowerCase().includes(term) ||
                a.tags.some(t => t.toLowerCase().includes(term))
            );
        }

        if (filtered.length === 0) {
            blogGrid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
                    <i class="fa-solid fa-search" style="font-size:48px;color:#9F7AEA;margin-bottom:20px;"></i>
                    <h3>Nenhum artigo encontrado</h3>
                    <p>Tente outro termo ou filtro.</p>
                </div>`;
            hasMoreArticles = false;
            return;
        }

        const display = filtered.slice(0, currentPage * 3);
        hasMoreArticles = display.length < filtered.length;

        blogGrid.innerHTML = display.map(a => `
            <div class="blog-card">
                <div class="card-image" style="background-image:url('${a.image}')">
                    <div class="card-badges">
                        <span class="badge"><i class="fa-regular fa-clock"></i> ${a.date}</span>
                        <span class="badge badge-purple"><i class="fa-solid fa-book-open"></i> ~${a.readTime}</span>
                    </div>
                </div>
                <div class="card-content">
                    <h3>${escapeHtml(a.title)}</h3>
                    <div class="card-tags">${a.tags.slice(0,4).map(t => `<span><i class="fa-solid fa-tag"></i> ${escapeHtml(t)}</span>`).join('')}</div>
                    <p>${escapeHtml(a.description)}</p>
                    <a href="${a.link}" class="btn-outline">Ler mais <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>`).join('');
    }

    async function loadMore() {
        if (isLoading || !hasMoreArticles) return;
        isLoading = true;
        
        const sentinel = document.querySelector('.scroll-sentinel');
        const spinner = sentinel?.querySelector('.loading-spinner');
        if (spinner) spinner.style.display = 'flex';
        
        await new Promise(r => setTimeout(r, 600));
        
        if (additionalArticles.length > 0) {
            articles.push(additionalArticles.shift());
        }
        
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
        sentinel.innerHTML = '<div class="loading-spinner" style="display:none;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando mais artigos...</div>';
        blogGrid.parentElement.appendChild(sentinel);
        
        new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isLoading && hasMoreArticles) loadMore();
        }, { threshold: 0.1, rootMargin: '100px' }).observe(sentinel);
    }

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

    // Busca
    let debounce;
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                currentSearch = this.value;
                currentPage = 1;
                hasMoreArticles = true;
                renderArticles();
                setupInfiniteScroll();
            }, 400);
        });
    }

    // =============================================
    // 6. INICIALIZAÇÃO
    // =============================================
    renderArticles();
    setupInfiniteScroll();

    console.log('📝 Blog inicializado!');
    console.log('   ♿ Acessibilidade no header');
    console.log('   🔍 Filtros e busca');
    console.log('   📜 Scroll infinito');
});