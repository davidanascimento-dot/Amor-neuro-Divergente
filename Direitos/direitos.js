// =========================================================================
// DIREITOS.JS — Amor NeuroDivergente
// Sidebar + Acessibilidade + Leis + Busca + Categorias + Hub
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;

    // ============================================
    // 0. PERFIL
    // ============================================
    function syncProfile() {
        const savedName = localStorage.getItem('userName');
        const savedEmail = localStorage.getItem('userEmail');
        const savedAvatar = localStorage.getItem('userAvatar');
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        const sidebarUserName = document.getElementById('sidebarUserName');
        const sidebarUserEmail = document.getElementById('sidebarUserEmail');

        if (savedAvatar && sidebarAvatar) {
            sidebarAvatar.src = savedAvatar;
            sidebarAvatar.onerror = () => { sidebarAvatar.src = '/img/avatar-padrao.png'; };
        }
        if (savedName && sidebarUserName) sidebarUserName.textContent = savedName;
        if (savedEmail && sidebarUserEmail) sidebarUserEmail.textContent = savedEmail;
    }
    syncProfile();
    window.addEventListener('storage', (e) => {
        if (['userAvatar', 'userName', 'userEmail'].includes(e.key)) syncProfile();
    });

    // ============================================
    // 1. SIDEBAR
    // ============================================
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

    // ============================================
    // 2. PERFIL COLAPSÁVEL
    // ============================================
    const profileToggle = document.getElementById('profileToggle');
    const profileDetail = document.getElementById('profileDetail');
    if (profileToggle && profileDetail) {
        profileToggle.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
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

    // ============================================
    // 3. ACESSIBILIDADE
    // ============================================
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
    }

    function handleA11yAction(action) {
        const main = document.getElementById('mainContent');
        switch (action) {
            case 'darkMode': {
                const dm = gs('darkMode') === 'true';
                ss('darkMode', dm ? 'false' : 'true');
                body.classList.toggle('a11y-dark-mode', !dm);
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
            case 'highlightLinks': {
                const hl = gs('highlightLinks') === 'true';
                ss('highlightLinks', hl ? 'false' : 'true');
                body.classList.toggle('a11y-highlight-links', !hl);
                break;
            }
            case 'dyslexiaFont': {
                const df = gs('dyslexiaFont') === 'true';
                ss('dyslexiaFont', df ? 'false' : 'true');
                body.classList.toggle('a11y-dyslexia', !df);
                updateHubStatus();
                break;
            }
            case 'reduceMotion': {
                const rm = gs('reduceMotion') === 'true';
                ss('reduceMotion', rm ? 'false' : 'true');
                body.classList.toggle('a11y-reduce-motion', !rm);
                updateHubStatus();
                break;
            }
            case 'reset': {
                ['darkMode', 'highlightLinks', 'dyslexiaFont', 'reduceMotion', 'textSize'].forEach(k => localStorage.removeItem('a11y_' + k));
                body.classList.remove('a11y-dark-mode', 'a11y-highlight-links', 'a11y-dyslexia', 'a11y-reduce-motion');
                if (main) main.classList.remove('a11y-large-text', 'a11y-small-text');
                updateHubStatus();
                break;
            }
        }
    }

    document.querySelectorAll('.a11y-option, .a11y-reset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            handleA11yAction(btn.getAttribute('data-a11y'));
        });
    });
    applySettings();

    // ============================================
    // 4. HUB FLUTUANTE
    // ============================================
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

    if (hubToggle) hubToggle.addEventListener('click', (e) => { e.stopPropagation(); toggleHub(); });
    if (hubOverlay) hubOverlay.addEventListener('click', closeHub);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeHub(); });

    function updateHubStatus() {
        const darkLabel = document.querySelector('.hub-action[data-a11y="darkMode"] .hub-action-label');
        if (darkLabel) darkLabel.textContent = body.classList.contains('a11y-dark-mode') ? 'Claro' : 'Escuro';

        const dyslexiaLabel = document.querySelector('.hub-action[data-a11y="dyslexiaFont"] .hub-action-label');
        if (dyslexiaLabel) dyslexiaLabel.textContent = body.classList.contains('a11y-dyslexia') ? 'Ativo' : 'Dislexia';

        const motionLabel = document.querySelector('.hub-action[data-a11y="reduceMotion"] .hub-action-label');
        if (motionLabel) motionLabel.textContent = body.classList.contains('a11y-reduce-motion') ? 'Ativo' : 'Movimento';
    }
    updateHubStatus();

    document.querySelectorAll('.hub-action[data-a11y]').forEach((item) => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            handleA11yAction(item.getAttribute('data-a11y'));
            closeHub();
        });
    });
    document.querySelectorAll('.hub-action[href]').forEach(link => link.addEventListener('click', closeHub));

    // ============================================
    // 5. HEADER SCROLL / SCROLL TOP / LOGOUT
    // ============================================
    const headerGlass = document.getElementById('headerGlass');
    if (headerGlass) {
        window.addEventListener('scroll', () => {
            headerGlass.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Tem certeza que deseja sair?')) {
            ['userLoggedIn', 'userName', 'userEmail', 'userAvatar'].forEach(k => localStorage.removeItem(k));
            window.location.href = '/login/login.html';
        }
    });

    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
        });
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================================
    // 6. TOAST
    // ============================================
    function showToast(message, type = 'info') {
        const existing = document.querySelector('.toast-msg-dynamic');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'toast-msg-dynamic';
        toast.textContent = message;
        toast.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:${type==='success'?'#10b981':type==='error'?'#ef4444':'#2d2a28'};color:#fff;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:500;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.15);`;
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; setTimeout(() => toast.remove(), 300); }, 2500);
    }

    // ============================================
    // 7. BANCO DE LEIS
    // ============================================
    const lawsDatabase = [
        { id: 1, title: "Lei Berenice Piana", description: "Estabelece direitos da pessoa com Transtorno do Espectro Autista, garantindo acesso à educação e serviços públicos.", category: "saude", number: "12.764/2012", icon: "fa-solid fa-heart-pulse", iconClass: "law-icon-saude", externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12764.htm" },
        { id: 2, title: "Lei Brasileira de Inclusão (LBI)", description: "Assegura e promove condições de igualdade e exercício dos direitos das pessoas com deficiência.", category: "social", number: "13.146/2015", icon: "fa-solid fa-handshake", iconClass: "law-icon-social", externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm" },
        { id: 3, title: "Lei Romeo Mion", description: "Cria a Carteira de Identificação da Pessoa com TEA (CIPTEA), facilitando o acesso a direitos.", category: "social", number: "13.977/2020", icon: "fa-solid fa-id-card", iconClass: "law-icon-social", externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/lei/L13977.htm" },
        { id: 4, title: "BPC - Benefício de Prestação Continuada", description: "Garante um salário mínimo mensal à pessoa com deficiência de baixa renda.", category: "social", number: "8.742/1993", icon: "fa-solid fa-money-bill-wave", iconClass: "law-icon-social", externalLink: "http://www.planalto.gov.br/ccivil_03/leis/l8742.htm" },
        { id: 5, title: "Lei de Cotas para PCD", description: "Reserva de vagas para pessoas com deficiência em empresas com mais de 100 funcionários.", category: "social", number: "8.213/1991", icon: "fa-solid fa-briefcase", iconClass: "law-icon-social", externalLink: "http://www.planalto.gov.br/ccivil_03/leis/l8213cons.htm" },
        { id: 6, title: "Lei de Acessibilidade", description: "Normas gerais e critérios básicos para promoção da acessibilidade das pessoas com deficiência.", category: "acessibilidade", number: "10.098/2004", icon: "fa-solid fa-universal-access", iconClass: "law-icon-acessibilidade", externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l10.098.htm" },
        { id: 7, title: "Lei da Libras", description: "Reconhece a Língua Brasileira de Sinais como meio legal de comunicação e expressão.", category: "acessibilidade", number: "10.436/2002", icon: "fa-solid fa-hands", iconClass: "law-icon-acessibilidade", externalLink: "http://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm" },
        { id: 8, title: "Decreto de Acessibilidade", description: "Regulamenta a acessibilidade em edificações, mobiliário urbano e transporte.", category: "acessibilidade", number: "5.296/2004", icon: "fa-solid fa-wheelchair", iconClass: "law-icon-acessibilidade", externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/decreto/d5296.htm" },
        { id: 9, title: "Direito à Saúde Mental", description: "Redirecionamento do modelo assistencial em saúde mental, priorizando o tratamento em comunidade.", category: "saude", number: "10.216/2001", icon: "fa-solid fa-brain", iconClass: "law-icon-saude", externalLink: "http://www.planalto.gov.br/ccivil_03/leis/leis_2001/l10216.htm" },
        { id: 10, title: "Lei do Acompanhante Terapêutico", description: "Garante o direito ao acompanhante terapêutico em instituições de ensino para pessoas com deficiência.", category: "educacional", number: "13.146/2015", icon: "fa-solid fa-chalkboard-user", iconClass: "law-icon-educacional", externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm" },
        { id: 11, title: "Lei da Educação Especial", description: "Diretrizes para a educação especial na perspectiva da educação inclusiva.", category: "educacional", number: "11.788/2008", icon: "fa-solid fa-graduation-cap", iconClass: "law-icon-educacional", externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11788.htm" },
        { id: 12, title: "Lei da Inclusão Profissional", description: "Estabelece quotas para pessoas com deficiência no mercado de trabalho.", category: "educacional", number: "13.370/2016", icon: "fa-solid fa-user-tie", iconClass: "law-icon-educacional", externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/lei/l13370.htm" },
    ];

    const categoryMap = {
        "educacional": "Educacional",
        "social": "Assistência Social",
        "acessibilidade": "Acessibilidade",
        "saude": "Saúde"
    };

    let currentFilter = 'todas';
    let currentSearch = '';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

 // ============================================
// 8. MAPEAMENTO DE IMAGENS POR CATEGORIA
// ============================================
function getLawImage(law, index) {
    // Fallback por categoria
    const categoryImages = {
        educacional: [
            "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=900&q=80",
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80",
            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&q=80"
        ],
        saude: [
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80",
            "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=900&q=80",
            "https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=900&q=80"
        ],
        social: [
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80",
            "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=900&q=80",
            "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=900&q=80",
            "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=80",
            "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80"
        ],
        acessibilidade: [
            "https://images.unsplash.com/photo-1584467735815-f778f274e296?w=900&q=80",
            "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=900&q=80",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80"
        ]
    };
    const arr = categoryImages[law.category] || categoryImages.social;
    return arr[index % arr.length];
}

// ============================================
// 9. RENDERIZAR LEIS — Estilo editorial
// ============================================
const lawsGrid = document.getElementById('lawsGrid');
const lawsNoResults = document.getElementById('lawsNoResults');

function renderLaws() {
    if (!lawsGrid) return;

    let filtered = [...lawsDatabase];
    if (currentFilter !== 'todas') {
        filtered = filtered.filter(l => l.category === currentFilter);
    }
    if (currentSearch.trim()) {
        const term = currentSearch.toLowerCase();
        filtered = filtered.filter(l =>
            l.title.toLowerCase().includes(term) ||
            l.description.toLowerCase().includes(term) ||
            l.number.includes(term)
        );
    }

    if (filtered.length === 0) {
        lawsGrid.innerHTML = '';
        if (lawsNoResults) lawsNoResults.hidden = false;
        return;
    }

    if (lawsNoResults) lawsNoResults.hidden = true;

    lawsGrid.innerHTML = filtered.map((law, index) => {
        const position = index % 2 === 0 ? 'left' : 'right';
        const imgSrc = getLawImage(law, index);

        return `
            <article class="law-editorial-card law-editorial-card--${position}" data-category="${law.category}">
                <div class="law-editorial-card__image">
                    <img src="${imgSrc}" alt="${escapeHtml(law.title)}" loading="lazy">
                    <div class="law-editorial-card__image-overlay"></div>
                </div>
                <div class="law-editorial-card__panel">
                    <span class="law-editorial-card__category">
                        <i class="${law.icon}"></i> ${categoryMap[law.category]}
                    </span>
                    <h3 class="law-editorial-card__title">${escapeHtml(law.title)}</h3>
                    <p class="law-editorial-card__description">${escapeHtml(law.description)}</p>
                    <div class="law-editorial-card__footer">
                        <span class="law-editorial-card__number">Lei ${law.number}</span>
                        <a href="${law.externalLink}" target="_blank" rel="noopener" class="law-editorial-card__link">
                            Ver lei completa <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

   

    // ============================================
    // 9. FILTROS POR CATEGORIA (tiles)
    // ============================================
    document.querySelectorAll('.category-tile').forEach(tile => {
        tile.addEventListener('click', () => {
            currentFilter = tile.dataset.filter || 'todas';
            currentSearch = '';
            if (lawsSearch) lawsSearch.value = '';
            renderLaws();
        });
    });

    // ============================================
    // 10. BUSCA
    // ============================================
    const lawsSearch = document.getElementById('lawsSearch');
    let debounce;
    if (lawsSearch) {
        lawsSearch.addEventListener('input', function () {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                currentSearch = this.value;
                currentFilter = 'todas';
                renderLaws();
            }, 300);
        });
    }

    // ============================================
    // 11. FORMULÁRIO DE CASO
    // ============================================
    const caseForm = document.getElementById('caseForm');
    if (caseForm) {
        caseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = caseForm.querySelector('input[type="text"]')?.value || '';
            const email = caseForm.querySelector('input[type="email"]')?.value || '';
            const descricao = caseForm.querySelector('textarea')?.value || '';

            if (!nome || !email || !descricao) {
                showToast('Preencha todos os campos para enviar seu caso.', 'error');
                return;
            }

            showToast('Caso enviado! Nossa equipe vai analisar em breve. 💜', 'success');
            caseForm.reset();
        });
    }

    // ============================================
    // 12. INICIALIZAÇÃO
    // ============================================
    renderLaws();

    console.log('⚖️ Página de Direitos inicializada!');
});