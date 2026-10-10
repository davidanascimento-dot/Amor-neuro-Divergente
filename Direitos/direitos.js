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

    // ============================================
    // 7. BANCO DE LEIS - le a fonte unica
    // ============================================
    //
    // Os dados foram para `leis-dados.js`, que expoe `window.LEIS`.
    // A razao e a duplicacao: as mesmas leis estavam escritas aqui e nos
    // cards do documento "Nossas 3 Leis Aplicadas". Dois lugares, uma
    // atualizacao por vez, e nenhuma pista de qual ficou para tras.
    //
    // Este bloco so traduz nomes de campo. `renderLaws()` e as folhas de
    // estilo continuam recebendo exatamente o que recebiam antes - e por
    // isso que a biblioteca nao muda de aparencia, e por isso a pagina
    // detalhada pode ler `window.LEIS` direto, com o registro inteiro,
    // sem passar por esta traducao.

    const CATEGORIAS_NOVAS = (window.LEIS_CATEGORIAS && typeof window.LEIS_CATEGORIAS === 'object')
        ? window.LEIS_CATEGORIAS
        : null;

    function normalizarParaOCard(registro) {
        // "13.146" + 2015 vira "13.146/2015", que e o que o card mostra.
        // Quando o numero nao existe - o caso dos temas - fica vazio em
        // vez de virar "null/ano".
        const identificacao = (registro.numero && registro.ano)
            ? registro.numero + '/' + registro.ano
            : '';

        return {
            // `id` novo e o slug: estavel, e e o que vai na URL da pagina
            // detalhada. `idAntigo` guarda o numero que ja circulava.
            id: registro.id,
            idAntigo: registro.idAntigo,
            tipo: registro.tipo || 'lei',
            base: registro.base === true,
            status: registro.status || 'em-preparacao',
            temaDe: registro.temaDe || null,

            title: registro.nomePopular || registro.nomeOficial || 'Sem titulo',
            description: registro.resumo || '',
            category: registro.categoria,
            number: identificacao,
            icon: registro.icone,
            iconClass: registro.iconeClasse,
            externalLink: registro.url || '',

            // o registro inteiro, para quem precisar de um campo que nao
            // cabe no card - a pagina da lei usa este
            registro: registro
        };
    }

    function carregarLeis() {
        if (window.LEIS && Array.isArray(window.LEIS) && window.LEIS.length) {
            return window.LEIS.map(normalizarParaOCard);
        }

        // A rede de seguranca. Se `leis-dados.js` falhar ao carregar -
        // 404, erro de sintaxe, bloqueio de rede - a biblioteca continua
        // mostrando as 12 leis de antes, em vez de virar uma pagina vazia.
        //
        // Esta lista esta na MESMA FORMA de leis-dados.js (bruta), e passa
        // pela mesma normalizacao. Por isso os dois ramos produzem saida
        // identica - que e o que o teste de rede de seguranca confere.
        //
        // ESTA LISTA E UMA REDE, NAO UMA FONTE. Ela nao deve ser
        // atualizada: existe so para o dia em que o arquivo novo falhar e
        // sera removida assim que a fonte unica estiver estavel. Edita-la
        // seria recriar a duplicacao que este bloco existe para eliminar.
        console.warn('[Direitos] leis-dados.js nao carregou. Usando lista de ' +
            'emergencia com os dados antigos. A biblioteca funciona, mas nao ' +
            'esta usando a fonte de dados oficial do projeto.');

        return [

            { id: 'lbi', idAntigo: 2, tipo: 'lei', categoria: 'social', icone: 'fa-solid fa-handshake', iconeClasse: 'law-icon-social', numero: '13.146', ano: 2015, data: '2015-07-06', nomePopular: 'Lei Brasileira de Inclusão (LBI)', resumo: 'Assegura e promove condições de igualdade e exercício dos direitos das pessoas com deficiência.', url: 'http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm', status: 'em-preparacao' },
            { id: 'berenice-piana', idAntigo: 1, tipo: 'lei', categoria: 'saude', icone: 'fa-solid fa-heart-pulse', iconeClasse: 'law-icon-saude', numero: '12.764', ano: 2012, data: '2012-11-27', nomePopular: 'Lei Berenice Piana', resumo: 'Estabelece direitos da pessoa com Transtorno do Espectro Autista, garantindo acesso à educação e serviços públicos.', url: 'http://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12764.htm', status: 'em-preparacao' },
            { id: 'romeo-mion', idAntigo: 3, tipo: 'lei', categoria: 'social', icone: 'fa-solid fa-id-card', iconeClasse: 'law-icon-social', numero: '13.977', ano: 2020, data: '2020-01-08', nomePopular: 'Lei Romeo Mion', resumo: 'Cria a Carteira de Identificação da Pessoa com TEA (CIPTEA), facilitando o acesso a direitos.', url: 'http://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/lei/l13977.htm', status: 'em-preparacao' },
            { id: 'bpc', idAntigo: 4, tipo: 'lei', categoria: 'social', icone: 'fa-solid fa-money-bill-wave', iconeClasse: 'law-icon-social', numero: '8.742', ano: 1993, data: '1993-12-07', nomePopular: 'BPC - Benefício de Prestação Continuada', resumo: 'Garante um salário mínimo mensal à pessoa com deficiência de baixa renda.', url: 'http://www.planalto.gov.br/ccivil_03/leis/l8742.htm', status: 'em-preparacao' },
            { id: 'cotas-pcd', idAntigo: 5, tipo: 'lei', categoria: 'social', icone: 'fa-solid fa-briefcase', iconeClasse: 'law-icon-social', numero: '8.213', ano: 1991, data: '1991-07-23', nomePopular: 'Lei de Cotas para PCD', resumo: 'Reserva vagas para pessoas com deficiência em empresas com mais de 100 funcionários.', url: 'http://www.planalto.gov.br/ccivil_03/leis/l8213cons.htm', status: 'em-preparacao' },
            { id: 'acessibilidade', idAntigo: 6, tipo: 'lei', categoria: 'acessibilidade', icone: 'fa-solid fa-universal-access', iconeClasse: 'law-icon-acessibilidade', numero: '10.098', ano: 2000, data: '2000-12-19', nomePopular: 'Lei de Acessibilidade', resumo: 'Normas gerais e critérios básicos para promoção da acessibilidade das pessoas com deficiência.', url: 'https://www.planalto.gov.br/ccivil_03/leis/l10098.htm', status: 'em-preparacao' },
            { id: 'libras', idAntigo: 7, tipo: 'lei', categoria: 'acessibilidade', icone: 'fa-solid fa-hands', iconeClasse: 'law-icon-acessibilidade', numero: '10.436', ano: 2002, data: '2002-04-24', nomePopular: 'Lei da Libras', resumo: 'Reconhece a Língua Brasileira de Sinais como meio legal de comunicação e expressão.', url: 'http://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm', status: 'em-preparacao' },
            { id: 'decreto-acessibilidade', idAntigo: 8, tipo: 'decreto', categoria: 'acessibilidade', icone: 'fa-solid fa-wheelchair', iconeClasse: 'law-icon-acessibilidade', numero: '5.296', ano: 2004, data: '2004-11-02', nomePopular: 'Decreto de Acessibilidade', resumo: 'Regulamenta a acessibilidade em edificações, mobiliário urbano e transporte.', url: 'http://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/decreto/d5296.htm', status: 'em-preparacao' },
            { id: 'saude-mental', idAntigo: 9, tipo: 'lei', categoria: 'saude', icone: 'fa-solid fa-brain', iconeClasse: 'law-icon-saude', numero: '10.216', ano: 2001, data: '2001-08-15', nomePopular: 'Direito à Saúde Mental', resumo: 'Redireciona o modelo assistencial em saúde mental, priorizando o tratamento em comunidade.', url: 'http://www.planalto.gov.br/ccivil_03/leis/leis_2001/l10216.htm', status: 'em-preparacao' },
            { id: 'educacao-especial', idAntigo: 11, tipo: 'lei', categoria: 'educacional', icone: 'fa-solid fa-graduation-cap', iconeClasse: 'law-icon-educacional', numero: '11.788', ano: 2008, data: '2008-07-22', nomePopular: 'Lei da Educação Especial', resumo: 'Diretrizes para a educação especial na perspectiva da educação inclusiva.', url: 'http://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11788.htm', status: 'em-preparacao' },
            { id: 'inclusao-profissional', idAntigo: 12, tipo: 'lei', categoria: 'educacional', icone: 'fa-solid fa-user-tie', iconeClasse: 'law-icon-educacional', numero: '13.370', ano: 2016, data: '2016-12-16', nomePopular: 'Lei da Inclusão Profissional', resumo: 'Estabelece quotas para pessoas com deficiência no mercado de trabalho.', url: 'http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/lei/l13370.htm', status: 'em-preparacao' },
            { id: 'tema-acompanhante', idAntigo: 10, tipo: 'tema', temaDe: 'lbi', categoria: 'social', icone: 'fa-solid fa-user-nurse', iconeClasse: 'law-icon-social', numero: null, ano: null, data: null, nomePopular: 'Acompanhante e atendente pessoal (LBI)', resumo: 'A LBI define acompanhante como quem acompanha a pessoa com deficiência, podendo ou não desempenhar as funções de atendente pessoal, e estende a essa pessoa os direitos previstos no art. 21.', url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm', status: 'em-preparacao' },
        ].map(normalizarParaOCard);
    }

    const lawsDatabase = carregarLeis();

    // "Lei", "Decreto" e "Tema" sao palavras diferentes e nao podem ser
    // trocadas. Um Decreto nao e uma Lei, e um tema dentro de uma lei
    // nao e instrumento nenhum. Antes, o card escrevia "Lei" fixo para
    // todo mundo - inclusive para o Decreto 5.296/2004 e para o item
    // "Acompanhante e atendente pessoal", que nao e lei nenhuma.
    const etiquetasTipo = (window.LEIS_ETIQUETAS_TIPO && typeof window.LEIS_ETIQUETAS_TIPO === 'object')
        ? window.LEIS_ETIQUETAS_TIPO
        : { lei: 'Lei', decreto: 'Decreto', tema: 'Tema' };

    const categoryMap = CATEGORIAS_NOVAS || {
        "educacional": "Educacional",
        "social": "Assistencia Social",
        "acessibilidade": "Acessibilidade",
        "saude": "Saude"
    };

    // -------------------------------------------------------------------
    // CONTAGEM DAS CATEGORIAS, TIRADA DOS DADOS
    // -------------------------------------------------------------------
    // O numero estava escrito a mao no HTML e ja divergia: a pagina
    // anunciava "3 leis" em Educacao e "4 leis" em Assistencia Social,
    // enquanto os dados tinham 2 e 5. O total (12) batia, porque os dois
    // erros se compensavam - e por isso ninguem notou.
    //
    // Agora o numero sai dos proprios dados. Nao ha mais como divergir:
    // quem cadastrar ou tirar uma lei ve a contagem mudar junto, sem
    // ninguem editar HTML.
    //
    // E o substantivo tambem vem do dado. Uma categoria que tem um tema
    // dentro de uma lei nao pode dizer "N leis", porque nao sao N leis:
    // na Assistencia Social existem 4 instrumentos e 1 tema.
    function atualizarContagensDasCategorias() {
        document.querySelectorAll('.category-tile[data-filter]').forEach(tile => {
            const filtro = tile.dataset.filter;
            if (!filtro || filtro === 'todas') return;

            const daCategoria = lawsDatabase.filter(l => l.category === filtro);
            if (!daCategoria.length) return;

            const instrumentos = daCategoria.filter(
                l => l.tipo === 'lei' || l.tipo === 'decreto'
            ).length;
            const temas = daCategoria.length - instrumentos;

            let texto;
            if (temas === 0) {
                texto = instrumentos + (instrumentos === 1 ? ' lei' : ' leis');
            } else if (instrumentos === 0) {
                texto = temas + (temas === 1 ? ' tema' : ' temas');
            } else {
                texto = instrumentos + (instrumentos === 1 ? ' lei' : ' leis') +
                        ' + ' + temas + (temas === 1 ? ' tema' : ' temas');
            }

            const alvo = tile.querySelector('.category-tile__count');
            if (alvo) {
                alvo.textContent = texto;
                // O rotulo inteiro fica no title, que e onde a diferenca
                // entre "lei" e "tema" aparece por extenso.
                alvo.title = temas > 0
                    ? (instrumentos + ' instrumento' + (instrumentos === 1 ? '' : 's') +
                       ' e ' + temas + (temas === 1 ? ' tema' : ' temas') +
                       ' associado' + (temas === 1 ? '' : 's'))
                    : '';
            }
        });
    }

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
            // `number` pode vir vazio nos temas, que nao tem numero de
            // instrumento proprio. `String()` evita que a busca quebre
            // nesse caso - e sem ele, procurar "acompanhante" derrubaria
            // a biblioteca inteira na hora.
            String(l.number).includes(term) ||
            // o nome oficial nao estava na busca. Sem isso, quem digitasse
            // "Estatuto da Pessoa com Deficiencia" nao achava a LBI.
            String(l.registro && l.registro.nomeOficial || '').toLowerCase().includes(term)
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
                        <span class="law-editorial-card__number">${
                            law.number
                                ? (etiquetasTipo[law.tipo] || 'Lei') + ' ' + law.number
                                : 'Tema dentro de: ' + (lawsDatabase.find(p => p.id === law.temaDe) || {}).title
                        }</span>
                        <a href="${law.externalLink}" target="_blank" rel="noopener" class="law-editorial-card__link">
                            Ver o texto no Planalto <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
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
    atualizarContagensDasCategorias();

    console.log('⚖️ Página de Direitos inicializada!');
});