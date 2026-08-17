/**
 * DIREITOS.JS — Amor NeuroDivergente
 * Sidebar + Acessibilidade + Leis + Busca + Filtros + Formulário + Hub + Scroll Top
 */
document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;

    // ============================================
    // 0. SINCRONIZAÇÃO DE PERFIL
    // ============================================
    function syncProfileFromStorage() {
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
    syncProfileFromStorage();
    window.addEventListener('storage', (e) => {
        if (e.key === 'userAvatar' || e.key === 'userName' || e.key === 'userEmail') syncProfileFromStorage();
    });

    // ============================================
    // 1. SIDEBAR — NOVA (toggle redondo)
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
        if (sidebar.classList.contains('open')) closeSidebar(); else openSidebar();
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
            if (isHidden) { profileDetail.removeAttribute('hidden'); profileToggle.setAttribute('aria-expanded', 'true'); }
            else { profileDetail.setAttribute('hidden', ''); profileToggle.setAttribute('aria-expanded', 'false'); }
        });
    }

    // ============================================
    // 3. ACESSIBILIDADE (Sidebar)
    // ============================================
    const a11yToggle = document.getElementById('a11yToggle');
    const a11yOptions = document.getElementById('a11yOptions');
    if (a11yToggle && a11yOptions) {
        a11yToggle.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            const isHidden = a11yOptions.hasAttribute('hidden');
            if (isHidden) { a11yOptions.removeAttribute('hidden'); a11yToggle.setAttribute('aria-expanded', 'true'); }
            else { a11yOptions.setAttribute('hidden', ''); a11yToggle.setAttribute('aria-expanded', 'false'); }
        });
        document.addEventListener('click', (e) => {
            if (!a11yOptions.contains(e.target) && e.target !== a11yToggle) {
                a11yOptions.setAttribute('hidden', ''); a11yToggle.setAttribute('aria-expanded', 'false');
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
            e.preventDefault(); e.stopPropagation();
            const action = btn.getAttribute('data-a11y');
            const main = document.getElementById('mainContent');
            switch (action) {
                case 'darkMode': const dm=gs('darkMode')==='true'; ss('darkMode',dm?'false':'true'); if(dm)body.classList.remove('a11y-dark-mode'); else body.classList.add('a11y-dark-mode'); usl('darkModeStatus',!dm); updateHubStatus(); break;
                case 'increaseText': const cs=gs('textSize','normal'); if(cs==='large'){ss('textSize','normal');if(main)main.classList.remove('a11y-large-text');}else{ss('textSize','large');if(main){main.classList.remove('a11y-small-text');main.classList.add('a11y-large-text');}} break;
                case 'decreaseText': const cz=gs('textSize','normal'); if(cz==='small'){ss('textSize','normal');if(main)main.classList.remove('a11y-small-text');}else{ss('textSize','small');if(main){main.classList.remove('a11y-large-text');main.classList.add('a11y-small-text');}} break;
                case 'highlightLinks': const hl=gs('highlightLinks')==='true'; ss('highlightLinks',hl?'false':'true'); if(hl)body.classList.remove('a11y-highlight-links'); else body.classList.add('a11y-highlight-links'); usl('linksStatus',!hl); break;
                case 'dyslexiaFont': const df=gs('dyslexiaFont')==='true'; ss('dyslexiaFont',df?'false':'true'); if(df)body.classList.remove('a11y-dyslexia'); else body.classList.add('a11y-dyslexia'); usl('dyslexiaStatus',!df); updateHubStatus(); break;
                case 'reduceMotion': const rm=gs('reduceMotion')==='true'; ss('reduceMotion',rm?'false':'true'); if(rm)body.classList.remove('a11y-reduce-motion'); else body.classList.add('a11y-reduce-motion'); usl('motionStatus',!rm); updateHubStatus(); break;
                case 'reset': ['darkMode','highlightLinks','dyslexiaFont','reduceMotion','textSize'].forEach(k=>localStorage.removeItem('a11y_'+k)); body.classList.remove('a11y-dark-mode','a11y-highlight-links','a11y-dyslexia','a11y-reduce-motion'); if(main)main.classList.remove('a11y-large-text','a11y-small-text'); usl('darkModeStatus',false);usl('linksStatus',false);usl('dyslexiaStatus',false);usl('motionStatus',false); updateHubStatus(); break;
            }
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

    // ============================================
    // 5. ATUALIZAR STATUS DO HUB
    // ============================================
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

    // ============================================
    // 6. AÇÕES DO HUB
    // ============================================
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


    // ============================================
    // 8. HEADER SCROLL
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
            window.location.href = '/login/login.html';
        }
    });

    // ============================================
    // 10. TOAST
    // ============================================
    function showToast(message, type = 'info') {
        const existing = document.querySelector('.toast-msg-dynamic');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'toast-msg-dynamic';
        toast.textContent = message;
        toast.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:${type==='success'?'#10b981':type==='error'?'#ef4444':'#2d2a28'};color:#fff;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:500;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.15);animation:toastIn 0.3s ease;`;
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity='0';toast.style.transition='opacity .3s';setTimeout(()=>toast.remove(),300); }, 2500);
    }
    if (!document.getElementById('toastAnim')) {
        const s = document.createElement('style'); s.id = 'toastAnim';
        s.textContent = '@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
        document.head.appendChild(s);
    }

    // No seu arquivo script.js (fora do array de leis)


// Injeta na div principal da página (ex: <div id="rights-section"></div>)


    // ============================================
    // 11. BANCO DE DADOS DE LEIS
    // ============================================
    const lawsDatabase = [

        { id: 1, title: "Lei Berenice Piana", description: "Estabelece direitos da pessoa com Transtorno do Espectro Autista, garantindo acesso à educação e serviços públicos.", category: "saude", year: "2012", number: "12.764/2012", icon: "fa-solid fa-heart-pulse", iconClass: "law-icon-saude", externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12764.htm" },
        { id: 2, title: "Lei do Acompanhante Terapêutico", description: "Garante o direito ao acompanhante terapêutico em instituições de ensino para pessoas com deficiência.", category: "educacional", year: "2015", number: "13.146/2015", icon: "fa-solid fa-chalkboard-user", iconClass: "law-icon-educacional", externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm" },
        { id: 3, title: "Direito à Saúde Mental", description: "Redirecionamento do modelo assistencial em saúde mental, priorizando o tratamento em comunidade.", category: "saude", year: "2001", number: "10.216/2001", icon: "fa-solid fa-brain", iconClass: "law-icon-saude", externalLink: "http://www.planalto.gov.br/ccivil_03/leis/leis_2001/l10216.htm" },
        { id: 4, title: "Lei Brasileira de Inclusão (LBI)", description: "Assegura e promove condições de igualdade e exercício dos direitos das pessoas com deficiência.", category: "social", year: "2015", number: "13.146/2015", icon: "fa-solid fa-handshake", iconClass: "law-icon-social", externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm" },
        { id: 5, title: "Lei Romeo Mion", description: "Cria a Carteira de Identificação da Pessoa com TEA (CIPTEA), facilitando o acesso a direitos.", category: "social", year: "2020", number: "13.977/2020", icon: "fa-solid fa-id-card", iconClass: "law-icon-social", externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/lei/L13977.htm" },
        { id: 6, title: "BPC - Benefício de Prestação Continuada", description: "Garante um salário mínimo mensal à pessoa com deficiência de baixa renda.", category: "social", year: "1993", number: "8.742/1993", icon: "fa-solid fa-money-bill-wave", iconClass: "law-icon-social", externalLink: "http://www.planalto.gov.br/ccivil_03/leis/l8742.htm" },
        { id: 7, title: "Lei de Cotas para PCD", description: "Reserva de vagas para pessoas com deficiência em empresas com mais de 100 funcionários.", category: "social", year: "1991", number: "8.213/1991", icon: "fa-solid fa-briefcase", iconClass: "law-icon-social", externalLink: "http://www.planalto.gov.br/ccivil_03/leis/l8213cons.htm" },
        { id: 8, title: "Lei de Acessibilidade", description: "Normas gerais e critérios básicos para promoção da acessibilidade das pessoas com deficiência.", category: "acessibilidade", year: "2004", number: "10.098/2004", icon: "fa-solid fa-universal-access", iconClass: "law-icon-acessibilidade", externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l10.098.htm" },
        { id: 9, title: "Decreto de Acessibilidade", description: "Regulamenta a acessibilidade em edificações, mobiliário urbano e transporte.", category: "acessibilidade", year: "2004", number: "5.296/2004", icon: "fa-solid fa-wheelchair", iconClass: "law-icon-acessibilidade", externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/decreto/d5296.htm" },
        { id: 10, title: "Lei da Libras", description: "Reconhece a Língua Brasileira de Sinais como meio legal de comunicação e expressão.", category: "acessibilidade", year: "2002", number: "10.436/2002", icon: "fa-solid fa-hands", iconClass: "law-icon-acessibilidade", externalLink: "http://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm" },
        { id: 11, title: "Lei da Inclusão Profissional", description: "Estabelece quotas para pessoas com deficiência no mercado de trabalho.", category: "social", year: "2016", number: "13.370/2016", icon: "fa-solid fa-briefcase", iconClass: "law-icon-social", externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/lei/l13370.htm" },
        { id: 12, title: "Lei da Educação Especial", description: "Diretrizes para a educação especial na perspectiva da educação inclusiva.", category: "educacional", year: "2008", number: "11.788/2008", icon: "fa-solid fa-graduation-cap", iconClass: "law-icon-educacional", externalLink: "http://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11788.htm" },
    ];

    

    const categoryMap = {
        "educacional": "Educacional",
        "social": "Social",
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
    // 12. RENDERIZAR LEIS
    // ============================================
    function renderLaws() {
        const grid = document.getElementById('lawsGrid');
        if (!grid) return;

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
            grid.innerHTML = `
                <div class="laws-no-results" style="display:block;grid-column:1/-1;text-align:center;padding:60px 20px;">
                    <i class="fa-solid fa-search" style="font-size:48px;color:#b8b0a8;display:block;margin-bottom:16px;"></i>
                    <h3 style="font-size:20px;font-weight:700;color:var(--text-dark);margin-bottom:8px;">Nenhuma lei encontrada</h3>
                    <p style="color:var(--text-muted);">Tente outro termo ou filtro.</p>
                </div>`;
            return;
        }

        grid.innerHTML = filtered.map(law => `
            <article class="law-card" data-category="${law.category}">
                <div class="law-card-icon ${law.iconClass}">
                    <i class="${law.icon}"></i>
                </div>
                <div class="law-card-content">
                    <span class="law-category">${categoryMap[law.category]}</span>
                    <h3>${escapeHtml(law.title)}</h3>
                    <p>${escapeHtml(law.description)}</p>
                    <div class="law-card-footer">
                        <span class="law-number">Lei ${law.number}</span>
                        <a href="${law.externalLink}" target="_blank" rel="noopener" class="law-link">
                            Ver lei completa <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
        `).join('');
    }

    // ============================================
    // 13. FILTROS
    // ============================================
    document.querySelectorAll('.rights-pill').forEach(pill => {
        pill.addEventListener('click', function() {
            document.querySelectorAll('.rights-pill').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            renderLaws();
        });
    });

    // ============================================
    // 14. BUSCA
    // ============================================
    const searchInput = document.getElementById('rightsSearch');
    let searchDebounce;
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(() => {
                currentSearch = this.value;
                renderLaws();
            }, 400);
        });
    }

    // ============================================
    // 15. FORMULÁRIO DE CASO
    // ============================================
    const caseForm = document.getElementById('caseForm');
    if (caseForm) {
        caseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(caseForm);
            const nome = formData.get('nome') || caseForm.querySelector('input[type="text"]')?.value || '';
            const email = formData.get('email') || caseForm.querySelector('input[type="email"]')?.value || '';
            const descricao = caseForm.querySelector('textarea')?.value || '';

            if (!nome || !email || !descricao) {
                showToast('Preencha todos os campos para enviar seu caso.', 'error');
                return;
            }

            console.log('📋 Caso enviado:', { nome, email, descricao });
            showToast('Caso enviado com sucesso! Nossa equipe vai analisar. 💜', 'success');
            caseForm.reset();
        });
    }

    // ============================================
    // 16. SCROLL REVEAL (opcional)
    // ============================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ============================================
    // 17. INICIALIZAÇÃO
    // ============================================
    renderLaws();

    console.log('⚖️ Página de Direitos inicializada!');
    console.log('👤 Perfil:', localStorage.getItem('userName') || 'Visitante');
    console.log('📜 Leis carregadas:', lawsDatabase.length);
});