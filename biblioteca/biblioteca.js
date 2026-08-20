// =========================================================================
// BIBLIOTECA.JS — Amor NeuroDivergente
// Sidebar responsiva + Perfil + Acessibilidade + Hub Flutuante + Biblioteca
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
        const darkLabel = document.querySelector('.hub-action[data-a11y="darkMode"] .hub-action-label');
        if (darkLabel) {
            darkLabel.textContent = document.body.classList.contains('a11y-dark-mode') ? 'Claro' : 'Escuro';
        }

        const dyslexiaLabel = document.querySelector('.hub-action[data-a11y="dyslexiaFont"] .hub-action-label');
        if (dyslexiaLabel) {
            dyslexiaLabel.textContent = document.body.classList.contains('a11y-dyslexia') ? 'Ativo' : 'Dislexia';
        }

        const motionLabel = document.querySelector('.hub-action[data-a11y="reduceMotion"] .hub-action-label');
        if (motionLabel) {
            motionLabel.textContent = document.body.classList.contains('a11y-reduce-motion') ? 'Ativo' : 'Movimento';
        }
    }

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

            closeHub();
        });
    });

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
    // 10. BANCO DE DADOS (Carregado do JSON)
    // =============================================
    let booksDatabase = [];
    let categoriasRecomendadas = [
        'Ficção Brasileira',
        'Romance',
        'Clássicos',
        'Psicologia',
        'Autoajuda',
        'Infantil',
        'Ficção Histórica'
    ];

    // =============================================
    // 11. CARREGAR LIVROS DO JSON
    // =============================================
    async function carregarLivrosDoJSON() {
        try {
            const response = await fetch('/data/livros.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            booksDatabase = data.livros || [];
            
            console.log(`✅ ${booksDatabase.length} livros carregados do JSON!`);
            
            renderDestaques();
            renderCategoriasRecomendadas();
            renderBooks();
            
            return booksDatabase;
            
        } catch (error) {
            console.error('❌ Erro ao carregar livros do JSON:', error);
            
            // Fallback: usa dados locais
            booksDatabase = getLivrosFallback();
            renderDestaques();
            renderCategoriasRecomendadas();
            renderBooks();
            
            return booksDatabase;
        }
    }

    // =============================================
    // 12. FALLBACK (caso o JSON não carregue)
    // =============================================
    function getLivrosFallback() {
        return [
            {
                id: 1,
                title: 'O Silêncio das Marés',
                author: 'Mariana K. Alves',
                cover: '/img/livro-1.png',
                genre: ['Ficção', 'Drama', 'Realismo Mágico'],
                age: 'adulto',
                pages: 38,
                year: 2024,
                publisher: 'Edições Comunidade',
                sinopse: 'Em uma vila pesqueira esquecida pelo tempo, as marés trazem não apenas peixes, mas memórias de quem já se foi.',
                category: 'ficcao',
                destaque: true,
                recomendado: 'Literatura Comunitária',
                isTexto: true,
                textoCompleto: `### Prólogo — Quando o mar parou\n\nNaquela noite, o mar ficou em silêncio...`,
                download: null
            },
            {
                id: 2,
                title: 'O Mapa das Almas Perdidas',
                author: 'Thiago S. Mendes',
                cover: '/img/livro-2.png',
                genre: ['Filosofia', 'Poesia'],
                age: 'adulto',
                pages: 208,
                year: 2023,
                publisher: 'Coletivo Editorial',
                sinopse: 'Uma coletânea de poemas e reflexões escritas por moradores de uma periferia, mapeando afetos, dores e resistências.',
                category: 'autoajuda',
                destaque: true,
                recomendado: 'Poesia Marginal',
                isTexto: true,
                textoCompleto: `### Poema 1 — O mapa\n\nNo papel rasgado,\na cidade inteira cabe...`,
                download: null
            },
            {
                id: 3,
                title: 'O Jardim das Horas Quebradas',
                author: 'Carla D. Rocha',
                cover: '/img/livro-3.png',
                genre: ['Romance', 'Fantasia'],
                age: 'jovem',
                pages: 352,
                year: 2024,
                publisher: 'Selva Urbana',
                sinopse: 'Uma jovem encontra um jardim abandonado onde as flores desabrocham apenas em horários específicos.',
                category: 'romance',
                destaque: true,
                recomendado: 'Fantasia Jovem',
                isTexto: true,
                textoCompleto: `### Capítulo 1 — O jardim escondido\n\nO vento carregava cheiro de terra molhada...`,
                download: null
            },
            {
                id: 4,
                title: 'A Última Receita de Tinta',
                author: 'Jorge L. Arantes',
                cover: '/img/livro-4.png',
                genre: ['Ficção', 'História'],
                age: 'adulto',
                pages: 276,
                year: 2022,
                publisher: 'Tinta & Papel Coletivo',
                sinopse: 'Na década de 1940, um mestre tipógrafo guardava a receita de uma tinta indestrutível.',
                category: 'ficcao',
                destaque: false,
                recomendado: 'Ficção Histórica',
                isTexto: true,
                textoCompleto: `### Prólogo — A tinta vermelha\n\nO velho mestre guardava o segredo...`,
                download: null
            },
            {
                id: 5,
                title: 'Sete Luas sobre Cinza',
                author: 'Eduarda F. Nunes',
                cover: '/img/livro-5.png',
                genre: ['Ficção', 'Distopia'],
                age: 'adulto',
                pages: 398,
                year: 2025,
                publisher: 'Nuvem Negra Edições',
                sinopse: 'Em uma cidade coberta por cinzas vulcânicas, sete luas aparecem no céu uma vez por século.',
                category: 'ficcao',
                destaque: true,
                recomendado: 'Distopia',
                isTexto: true,
                textoCompleto: `### Prólogo — A primeira lua\n\nO céu escureceu como nunca antes...`,
                download: null
            },
            {
                id: 6,
                title: 'A Biblioteca dos Sonhos Esquecidos',
                author: 'Lucas P. Moreira',
                cover: '/img/livro-1.png',
                genre: ['Romance', 'Clássico'],
                age: 'adulto',
                pages: 286,
                year: 2021,
                publisher: 'Acervo Popular',
                sinopse: 'Uma biblioteca comunitária guarda livros que ninguém mais lembra.',
                category: 'romance',
                destaque: false,
                recomendado: 'Romance Contemporâneo',
                isTexto: true,
                textoCompleto: `### Capítulo 1 — O livro esquecido\n\nO cheiro de papel velho dominava o ambiente...`,
                download: null
            },
            {
                id: 7,
                title: 'O Eco do Nono Trovão',
                author: 'Mônica C. Rios',
                cover: '/img/livro-2.png',
                genre: ['Ficção', 'Infantil'],
                age: 'infantil',
                pages: 68,
                year: 2023,
                publisher: 'Ciranda de Histórias',
                sinopse: 'Numa aldeia onde os trovões têm nomes, o nono trovão nunca foi ouvido.',
                category: 'ficcao',
                destaque: false,
                recomendado: 'Infantil',
                isTexto: true,
                textoCompleto: `### Era uma vez...\n\nEm uma aldeia bem no meio da floresta...`,
                download: null
            },
            {
                id: 8,
                title: 'O Alfaiate de Estrelas',
                author: 'Rafaela A. Souza',
                cover: '/img/livro-3.png',
                genre: ['Ficção', 'Fantasia'],
                age: 'infantil',
                pages: 112,
                year: 2024,
                publisher: 'Lunetas Editora',
                sinopse: 'Um alfaiate que mora no topo da montanha mais alta costura estrelas que caem do céu.',
                category: 'ficcao',
                destaque: false,
                recomendado: 'Fantasia Infantil',
                isTexto: true,
                textoCompleto: `### O primeiro fio\n\nLá no alto da montanha mais alta...`,
                download: null
            },
            {
                id: 9,
                title: 'A Estrada sem Nome',
                author: 'Sergio M. Lins',
                cover: '/img/livro-4.png',
                genre: ['Autoajuda', 'Filosofia'],
                age: 'adulto',
                pages: 224,
                year: 2023,
                publisher: 'Caminhos Coletivos',
                sinopse: 'Moradores de uma comunidade rural escreveram coletivamente este livro sobre os desafios de viver sem endereço formal.',
                category: 'autoajuda',
                destaque: false,
                recomendado: 'Autoajuda Social',
                isTexto: true,
                textoCompleto: `### O começo da estrada\n\nNão tinha placa. Não tinha nome...`,
                download: null
            },
            {
                id: 10,
                title: 'Memórias do Fogo e da Névoa',
                author: 'Fernanda T. Barros',
                cover: '/img/livro-5.png',
                genre: ['Romance', 'Clássico'],
                age: 'jovem',
                pages: 304,
                year: 2022,
                publisher: 'Fogaréu Edições',
                sinopse: 'Duas famílias rivais em um vale coberto por névoa constante.',
                category: 'romance',
                destaque: false,
                recomendado: 'Romance Juvenil',
                isTexto: true,
                textoCompleto: `### O vale da névoa\n\nO sol nunca alcançava o fundo do vale...`,
                download: null
            },
            {
                id: 11,
                title: 'O Relógio de Areia Vermelha',
                author: 'André C. Melo',
                cover: '/img/livro-1.png',
                genre: ['Romance', 'Drama'],
                age: 'jovem',
                pages: 256,
                year: 2025,
                publisher: 'Areia & Tempo',
                sinopse: 'Um relógio de areia com grãos vermelhos é encontrado em uma garagem comunitária.',
                category: 'romance',
                destaque: false,
                recomendado: 'Drama Juvenil',
                isTexto: true,
                textoCompleto: `### O encontro\n\nO relógio estava coberto de poeira...`,
                download: null
            },
            {
                id: 12,
                title: 'Cartas para um Lugar Inexistente',
                author: 'Beatriz L. Castro',
                cover: '/img/livro-2.png',
                genre: ['Romance', 'Clássico'],
                age: 'adulto',
                pages: 196,
                year: 2020,
                publisher: 'Correio Invisível',
                sinopse: 'Uma coletânea de cartas trocadas entre moradores de uma comunidade que foi demolida.',
                category: 'romance',
                destaque: false,
                recomendado: 'Clássicos Modernos',
                isTexto: true,
                textoCompleto: `### Carta I\n\nQuerido amigo...`,
                download: null
            }
        ];
    }

    // =============================================
    // 13. FUNÇÕES DE RENDERIZAÇÃO
    // =============================================

    // RENDERIZAR DESTAQUES (CARROSSEL)
    function renderDestaques() {
        const pista = document.getElementById('carrosselPista');
        if (!pista) return;
        
        const destaques = booksDatabase.filter(book => book.destaque === true);
        
        if (destaques.length === 0) {
            pista.innerHTML = '<div class="no-books">Nenhum livro em destaque no momento.</div>';
            return;
        }
        
        pista.innerHTML = destaques.map(book => `
            <div class="card-livro-destaque" onclick="openBookModal(${book.id})" role="button" aria-label="Ver detalhes de ${book.title}">
                <div class="capa-livro">
                    <img src="${book.cover}" alt="${book.title}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="book-placeholder" style="display:none;"><i class="fa-solid fa-book"></i></div>
                </div>
            </div>
        `).join('');
    }

    // RENDERIZAR CATEGORIAS RECOMENDADAS
    function renderCategoriasRecomendadas() {
        const container = document.getElementById('containerCategorias');
        if (!container) return;

        let html = '';
        
        categoriasRecomendadas.forEach(categoria => {
            const livrosCategoria = booksDatabase.filter(book => book.recomendado === categoria);
            
            if (livrosCategoria.length === 0) return;

            html += `
                <div class="categoria-recomendada">
                    <div class="categoria-header">
                        <h2><i class="fa-solid fa-star" style="color: #fbbf24; margin-right: 10px;"></i> ${categoria}</h2>
                        <span class="categoria-count">${livrosCategoria.length} livro${livrosCategoria.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="categoria-grid">
                        ${livrosCategoria.map(book => `
                            <div class="book-card" onclick="openBookModal(${book.id})" role="button" aria-label="Ver livro ${book.title}">
                                <div class="book-card-image">
                                    <img src="${book.cover}" alt="${book.title}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                    <div class="book-placeholder" style="display:none; font-size:32px; color:var(--text-muted);"><i class="fa-solid fa-book"></i></div>
                                    <span class="book-card-badge">${book.age === 'infantil' ? '🧒' : book.age === 'jovem' ? '🧑‍🎓' : '👨‍💼'}</span>
                                </div>
                                <div class="book-card-title">${book.title}</div>
                                <div class="book-card-author">${book.author}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // RENDERIZAR TODOS OS LIVROS (GRID)
    function renderBooks() {
        const booksGrid = document.getElementById('booksGrid');
        if (!booksGrid) return;

        let filtered = [...booksDatabase];
        
        // Filtro de idade
        const activeFilter = document.querySelector('.filter-btn.active');
        if (activeFilter) {
            const filter = activeFilter.getAttribute('data-filter');
            if (filter !== 'todos') {
                filtered = filtered.filter(book => book.age === filter || book.category === filter);
            }
        }

        // Filtro de busca
        const searchInput = document.getElementById('bookSearch');
        if (searchInput && searchInput.value.trim()) {
            const term = searchInput.value.toLowerCase().trim();
            filtered = filtered.filter(book =>
                book.title.toLowerCase().includes(term) ||
                book.author.toLowerCase().includes(term) ||
                book.genre.some(g => g.toLowerCase().includes(term))
            );
        }

        // Atualização do contador
        const booksCounter = document.getElementById('booksCounter');
        if (booksCounter) {
            booksCounter.textContent = `${filtered.length} livro${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`;
        }

        if (filtered.length === 0) {
            booksGrid.innerHTML = `
                <div class="no-books" style="grid-column:1/-1; text-align:center; padding:40px 20px;">
                    <i class="fa-solid fa-book-open" style="font-size:40px; color:var(--text-muted); display:block; margin-bottom:12px;"></i>
                    <h3 style="font-size:18px; font-weight:700; color:var(--text-dark); margin-bottom:4px;">Nenhum livro encontrado</h3>
                    <p style="color:var(--text-muted);">Tente outro filtro ou termo de busca.</p>
                </div>
            `;
            return;
        }

        booksGrid.innerHTML = filtered.map(book => `
            <div class="book-card" onclick="openBookModal(${book.id})" role="button" aria-label="Ver livro ${book.title}">
                <div class="book-card-image">
                    <img src="${book.cover}" alt="${book.title}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="book-placeholder" style="display:none; font-size:32px; color:var(--text-muted);"><i class="fa-solid fa-book"></i></div>
                    <span class="book-card-badge">${book.age === 'infantil' ? '🧒' : book.age === 'jovem' ? '🧑‍🎓' : '👨‍💼'}</span>
                </div>
                <div class="book-card-title">${book.title}</div>
                <div class="book-card-author">${book.author}</div>
            </div>
        `).join('');
    }

    // =============================================
    // 14. FILTROS E BUSCA
    // =============================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderBooks();
        });
    });

    const searchInput = document.getElementById('bookSearch');
    if (searchInput) {
        let debounceTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                renderBooks();
            }, 300);
        });
    }

    // =============================================
    // 15. CARROSSEL
    // =============================================
    let currentSlide = 0;
    const carrosselPista = document.getElementById('carrosselPista');

    function moverCarrossel(direcao) {
        if (!carrosselPista) return;
        const slides = carrosselPista.children;
        const totalSlides = slides.length;
        if (totalSlides === 0) return;

        currentSlide = (currentSlide + direcao + totalSlides) % totalSlides;
        const slideWidth = slides[0]?.offsetWidth || 200;
        const gap = 16;
        const offset = currentSlide * (slideWidth + gap);
        carrosselPista.style.transform = `translateX(-${offset}px)`;
    }

    document.getElementById('setaEsquerda')?.addEventListener('click', () => moverCarrossel(-1));
    document.getElementById('setaDireita')?.addEventListener('click', () => moverCarrossel(1));

    // =============================================
    // 16. MODAL DO LIVRO (openBookModal)
    // =============================================
    window.openBookModal = function(bookId) {
        const book = booksDatabase.find(b => b.id == bookId);
        if (!book) return;

        const overlay = document.getElementById('bookModalOverlay');
        const content = document.getElementById('bookModalContent');

        if (!overlay || !content) return;

        const temTexto = book.isTexto && book.textoCompleto;
        const temPDF = book.download;

        content.innerHTML = `
            <div class="book-modal-top">
                <div class="book-modal-cover">
                    <img src="${book.cover}" alt="${book.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="book-placeholder" style="display:none; font-size:40px; color:var(--text-muted);"><i class="fa-solid fa-book"></i></div>
                </div>
                <div class="book-modal-details">
                    <h2>${book.title}</h2>
                    <div class="book-modal-author">${book.author}</div>
                    <div class="book-modal-tags">
                        ${book.genre.map(g => `<span>${g}</span>`).join('')}
                        <span>${book.age === 'infantil' ? '🧒 Infantil' : book.age === 'jovem' ? '🧑‍🎓 Jovem' : '👨‍💼 Adulto'}</span>
                        ${book.recomendado ? `<span>⭐ ${book.recomendado}</span>` : ''}
                    </div>
                    <div class="book-modal-meta">
                        <span><i class="fa-regular fa-clock"></i> ${book.pages} páginas</span>
                        <span><i class="fa-regular fa-calendar"></i> ${book.year}</span>
                        <span><i class="fa-regular fa-building"></i> ${book.publisher}</span>
                    </div>
                    <div class="book-modal-sinopse">${book.sinopse}</div>
                    <div class="book-modal-actions">
                        ${(temTexto || temPDF) ? `
                            <button class="book-modal-btn book-modal-btn-download" onclick="abrirLeitor(${book.id})" style="background: #7c3aed; color: #fff;">
                                <i class="fa-solid fa-book-open"></i> Ler Livro
                            </button>
                        ` : ''}
                        ${temPDF ? `
                            <a href="${book.download}" target="_blank" rel="noopener" class="book-modal-btn book-modal-btn-secondary" style="border-color: #10b981; color: #10b981;">
                                <i class="fa-solid fa-download"></i> Baixar PDF
                            </a>
                        ` : ''}
                        ${(!temTexto && !temPDF) ? `
                            <span style="font-size:13px; color:var(--text-muted); font-style:italic;">📖 Livro disponível em breve</span>
                        ` : ''}
                        <button class="book-modal-btn book-modal-btn-secondary" onclick="closeBookModal()">
                            <i class="fa-solid fa-xmark"></i> Fechar
                        </button>
                    </div>
                </div>
            </div>
        `;

        overlay.hidden = false;
        document.body.style.overflow = 'hidden';
    };

    window.closeBookModal = function() {
        const overlay = document.getElementById('bookModalOverlay');
        if (overlay) {
            overlay.hidden = true;
            document.body.style.overflow = '';
        }
    };

    document.getElementById('bookModalClose')?.addEventListener('click', closeBookModal);
    document.getElementById('bookModalBg')?.addEventListener('click', closeBookModal);

    // =============================================
    // 17. LEITOR DE PDF E TEXTO
    // =============================================

    function carregarPdfJs() {
        return new Promise((resolve) => {
            if (typeof pdfjsLib !== 'undefined') {
                resolve(pdfjsLib);
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
            script.onload = () => {
                const workerScript = document.createElement('script');
                workerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                workerScript.onload = () => resolve(pdfjsLib);
                document.head.appendChild(workerScript);
            };
            document.head.appendChild(script);
        });
    }

    const leitorEstado = {
        pdfDoc: null,
        paginaAtual: 1,
        totalPaginas: 0,
        escala: 1.0,
        darkMode: false,
        fullscreen: false,
        livroAtual: null,
        pdfUrl: null,
        isTexto: false,
        textoPaginas: [],
        palavrasPorPagina: 300
    };

    const leitorElements = {
        overlay: document.getElementById('leituraModalOverlay'),
        bg: document.getElementById('leituraModalBg'),
        modal: document.querySelector('.leitura-modal'),
        titulo: document.getElementById('leituraTitulo'),
        autor: document.getElementById('leituraAutor'),
        canvas: document.getElementById('leituraPdfCanvas'),
        container: document.getElementById('leituraPdfContainer'),
        pageNum: document.getElementById('leituraPageNum'),
        pageCount: document.getElementById('leituraPageCount'),
        prevBtn: document.getElementById('leituraPrevPage'),
        nextBtn: document.getElementById('leituraNextPage'),
        zoomIn: document.getElementById('leituraZoomIn'),
        zoomOut: document.getElementById('leituraZoomOut'),
        zoomLevel: document.getElementById('leituraZoomLevel'),
        fullscreenBtn: document.getElementById('leituraFullscreen'),
        darkModeBtn: document.getElementById('leituraDarkMode'),
        fecharBtn: document.getElementById('leituraFechar'),
        progressoBar: document.getElementById('leituraProgressoPreenchido'),
        progressoTexto: document.getElementById('leituraProgressoTexto')
    };

    // =============================================
    // ABRIR LEITOR
    // =============================================
    window.abrirLeitor = async function(bookId) {
        const book = booksDatabase.find(b => b.id == bookId);
        if (!book) {
            console.error('❌ Livro não encontrado!');
            alert('Livro não encontrado.');
            return;
        }

        console.log('📖 Abrindo livro:', book.title);

        leitorEstado.livroAtual = book;
        leitorElements.titulo.textContent = book.title;
        leitorElements.autor.textContent = `por ${book.author}`;

        leitorElements.overlay.hidden = false;
        document.body.style.overflow = 'hidden';

        if (book.isTexto && book.textoCompleto) {
            console.log('📝 MODO TEXTO detectado!');
            abrirLeitorTexto(book);
        } else if (book.download) {
            console.log('📄 MODO PDF detectado!');
            await abrirLeitorPDF(book);
        } else {
            alert('Este livro não está disponível para leitura.');
            fecharLeitor();
        }
    };

    // =============================================
    // LEITOR DE TEXTO
    // =============================================
    function abrirLeitorTexto(book) {
        console.log('📝 Iniciando leitor de texto para:', book.title);
        
        if (!book.textoCompleto || book.textoCompleto.length === 0) {
            console.error('❌ Texto vazio!');
            alert('Este livro não tem conteúdo.');
            fecharLeitor();
            return;
        }

        leitorEstado.isTexto = true;
        leitorEstado.palavrasPorPagina = 300;

        const texto = book.textoCompleto;
        const palavras = texto.split(/\s+/);
        const paginas = [];
        
        console.log(`📊 Total de palavras: ${palavras.length}`);
        
        for (let i = 0; i < palavras.length; i += leitorEstado.palavrasPorPagina) {
            const pagina = palavras.slice(i, i + leitorEstado.palavrasPorPagina).join(' ');
            paginas.push(pagina);
        }

        if (paginas.length === 0) {
            paginas.push('(Texto vazio)');
        }

        leitorEstado.textoPaginas = paginas;
        leitorEstado.totalPaginas = paginas.length;
        leitorEstado.paginaAtual = 1;

        console.log(`📖 ${paginas.length} páginas criadas`);

        leitorElements.pageCount.textContent = paginas.length;
        leitorElements.pageNum.textContent = 1;

        atualizarBotoesNavegacao();

        leitorElements.canvas.style.display = 'none';
        
        let textContainer = document.getElementById('leituraTextoContainer');
        if (!textContainer) {
            textContainer = document.createElement('div');
            textContainer.id = 'leituraTextoContainer';
            textContainer.className = 'leitura-texto-container';
            leitorElements.container.appendChild(textContainer);
            console.log('✅ Container de texto criado');
        }
        textContainer.style.display = 'block';

        renderizarPaginaTexto(1);
        atualizarProgresso(1);

        console.log(`✅ Leitor de texto aberto: ${paginas.length} páginas`);
    }

    // =============================================
    // RENDERIZAR PÁGINA DE TEXTO
    // =============================================
    function renderizarPaginaTexto(numPagina) {
        console.log(`📄 Renderizando página ${numPagina}`);
        
        if (!leitorEstado.isTexto) return;
        if (numPagina < 1 || numPagina > leitorEstado.textoPaginas.length) return;

        const textContainer = document.getElementById('leituraTextoContainer');
        if (!textContainer) return;

        const conteudo = leitorEstado.textoPaginas[numPagina - 1];
        
        let textoFormatado = conteudo
            .replace(/\n/g, '<br>')
            .replace(/(#{1,3})\s*(.+)/g, (match, hashes, titulo) => {
                const nivel = hashes.length;
                const tag = nivel === 1 ? 'h1' : nivel === 2 ? 'h2' : 'h3';
                return `<${tag}>${titulo.trim()}</${tag}>`;
            })
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/---/g, '<hr>');
        
        textContainer.innerHTML = `
            <div class="leitura-texto-pagina">
                <div class="leitura-texto-conteudo">
                    ${textoFormatado}
                </div>
                <div class="leitura-texto-numero">Página ${numPagina} de ${leitorEstado.textoPaginas.length}</div>
            </div>
        `;

        textContainer.scrollTop = 0;

        leitorElements.pageNum.textContent = numPagina;
        leitorEstado.paginaAtual = numPagina;

        atualizarBotoesNavegacao();
        atualizarProgresso(numPagina);
    }

    // =============================================
    // LEITOR DE PDF
    // =============================================
    async function abrirLeitorPDF(book) {
        leitorEstado.isTexto = false;
        leitorEstado.pdfUrl = book.download;

        const ctx = leitorElements.canvas.getContext('2d');
        ctx.clearRect(0, 0, leitorElements.canvas.width, leitorElements.canvas.height);
        ctx.fillStyle = '#f0ede8';
        ctx.fillRect(0, 0, leitorElements.canvas.width, leitorElements.canvas.height);
        ctx.fillStyle = '#7c3aed';
        ctx.font = '16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📖 Carregando PDF...', leitorElements.canvas.width / 2, leitorElements.canvas.height / 2);

        leitorElements.canvas.style.display = 'block';
        const textContainer = document.getElementById('leituraTextoContainer');
        if (textContainer) textContainer.style.display = 'none';

        try {
            const pdfjs = await carregarPdfJs();
            const loadingTask = pdfjs.getDocument(book.download);
            const pdf = await loadingTask.promise;
            
            leitorEstado.pdfDoc = pdf;
            leitorEstado.totalPaginas = pdf.numPages;
            leitorEstado.paginaAtual = 1;

            leitorElements.pageCount.textContent = pdf.numPages;
            leitorElements.pageNum.textContent = 1;

            atualizarBotoesNavegacao();
            await renderizarPaginaPDF(1);
            atualizarProgresso(1);

        } catch (error) {
            console.error('Erro ao carregar PDF:', error);
            const ctx = leitorElements.canvas.getContext('2d');
            ctx.clearRect(0, 0, leitorElements.canvas.width, leitorElements.canvas.height);
            ctx.fillStyle = '#fef2f2';
            ctx.fillRect(0, 0, leitorElements.canvas.width, leitorElements.canvas.height);
            ctx.fillStyle = '#ef4444';
            ctx.font = '16px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('❌ Erro ao carregar o PDF.', leitorElements.canvas.width / 2, leitorElements.canvas.height / 2);
        }
    }

    async function renderizarPaginaPDF(numPagina) {
        if (!leitorEstado.pdfDoc) return;

        try {
            const page = await leitorEstado.pdfDoc.getPage(numPagina);
            const viewport = page.getViewport({ scale: leitorEstado.escala });

            const canvas = leitorElements.canvas;
            const context = canvas.getContext('2d');

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport: viewport }).promise;

            leitorElements.pageNum.textContent = numPagina;
            leitorEstado.paginaAtual = numPagina;

            atualizarBotoesNavegacao();
            atualizarProgresso(numPagina);
            leitorElements.zoomLevel.textContent = `${Math.round(leitorEstado.escala * 100)}%`;

        } catch (error) {
            console.error('Erro ao renderizar página PDF:', error);
        }
    }

    // =============================================
    // NAVEGAÇÃO
    // =============================================
    function paginaAnterior() {
        if (leitorEstado.paginaAtual > 1) {
            if (leitorEstado.isTexto) {
                renderizarPaginaTexto(leitorEstado.paginaAtual - 1);
            } else {
                renderizarPaginaPDF(leitorEstado.paginaAtual - 1);
            }
        }
    }

    function proximaPagina() {
        const total = leitorEstado.isTexto 
            ? leitorEstado.textoPaginas.length 
            : leitorEstado.totalPaginas;
        
        if (leitorEstado.paginaAtual < total) {
            if (leitorEstado.isTexto) {
                renderizarPaginaTexto(leitorEstado.paginaAtual + 1);
            } else {
                renderizarPaginaPDF(leitorEstado.paginaAtual + 1);
            }
        }
    }

    function atualizarBotoesNavegacao() {
        const total = leitorEstado.isTexto 
            ? leitorEstado.textoPaginas.length 
            : leitorEstado.totalPaginas;
        
        leitorElements.prevBtn.disabled = leitorEstado.paginaAtual <= 1;
        leitorElements.nextBtn.disabled = leitorEstado.paginaAtual >= total;
    }

    function atualizarProgresso(pagina) {
        const total = leitorEstado.isTexto 
            ? leitorEstado.textoPaginas.length 
            : leitorEstado.totalPaginas;
        
        if (total === 0) return;
        const percentual = Math.round((pagina / total) * 100);
        leitorElements.progressoBar.style.width = `${percentual}%`;
        leitorElements.progressoTexto.textContent = `${percentual}% lido`;
    }

    // =============================================
    // ZOOM
    // =============================================
    function aumentarZoom() {
        if (leitorEstado.isTexto) return;
        leitorEstado.escala = Math.min(leitorEstado.escala + 0.1, 3.0);
        if (leitorEstado.pdfDoc) {
            renderizarPaginaPDF(leitorEstado.paginaAtual);
        }
    }

    function diminuirZoom() {
        if (leitorEstado.isTexto) return;
        leitorEstado.escala = Math.max(leitorEstado.escala - 0.1, 0.3);
        if (leitorEstado.pdfDoc) {
            renderizarPaginaPDF(leitorEstado.paginaAtual);
        }
    }

    // =============================================
    // MODO ESCURO E TELA CHEIA
    // =============================================
    function alternarModoEscuro() {
        leitorEstado.darkMode = !leitorEstado.darkMode;
        leitorElements.modal.classList.toggle('dark-mode', leitorEstado.darkMode);
        leitorElements.darkModeBtn.innerHTML = leitorEstado.darkMode 
            ? '<i class="fa-regular fa-sun"></i>' 
            : '<i class="fa-solid fa-moon"></i>';
    }

    function alternarTelaCheia() {
        const modal = leitorElements.modal;
        if (!document.fullscreenElement) {
            modal.requestFullscreen?.() || modal.webkitRequestFullscreen?.();
        } else {
            document.exitFullscreen?.() || document.webkitExitFullscreen?.();
        }
    }

    // =============================================
    // FECHAR LEITOR
    // =============================================
    window.fecharLeitor = function() {
        leitorElements.overlay.hidden = true;
        document.body.style.overflow = '';
        
        leitorEstado.pdfDoc = null;
        leitorEstado.paginaAtual = 1;
        leitorEstado.totalPaginas = 0;
        leitorEstado.isTexto = false;
        leitorEstado.textoPaginas = [];
        
        const canvas = leitorElements.canvas;
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'block';
        
        const textContainer = document.getElementById('leituraTextoContainer');
        if (textContainer) {
            textContainer.style.display = 'none';
            textContainer.innerHTML = '';
        }
        
        leitorElements.progressoBar.style.width = '0%';
        leitorElements.progressoTexto.textContent = '0% lido';
    };

    // =============================================
    // 18. EVENTOS DO LEITOR
    // =============================================

    leitorElements.prevBtn?.addEventListener('click', paginaAnterior);
    leitorElements.nextBtn?.addEventListener('click', proximaPagina);
    leitorElements.zoomIn?.addEventListener('click', aumentarZoom);
    leitorElements.zoomOut?.addEventListener('click', diminuirZoom);
    leitorElements.darkModeBtn?.addEventListener('click', alternarModoEscuro);
    leitorElements.fullscreenBtn?.addEventListener('click', alternarTelaCheia);
    leitorElements.fecharBtn?.addEventListener('click', window.fecharLeitor);
    leitorElements.bg?.addEventListener('click', (e) => {
        if (e.target === leitorElements.bg) window.fecharLeitor();
    });

    // Teclas de atalho
    document.addEventListener('keydown', (e) => {
        if (leitorElements.overlay?.hidden) return;

        switch (e.key) {
            case 'Escape': window.fecharLeitor(); break;
            case 'ArrowRight': 
            case ' ': 
                e.preventDefault(); 
                proximaPagina(); 
                break;
            case 'ArrowLeft': 
                e.preventDefault(); 
                paginaAnterior(); 
                break;
            case '+': aumentarZoom(); break;
            case '-': diminuirZoom(); break;
            case 'f': alternarTelaCheia(); break;
            case 'd': alternarModoEscuro(); break;
        }
    });

    // =============================================
    // 19. EXPOR FUNÇÕES GLOBAIS
    // =============================================
    window.booksDatabase = booksDatabase;
    window.adicionarLivro = adicionarLivro;
    window.baixarJSON = baixarJSON;
    window.importarJSON = importarJSON;
    window.abrirLeitor = window.abrirLeitor;
    window.fecharLeitor = window.fecharLeitor;
    window.openBookModal = window.openBookModal;
    window.closeBookModal = window.closeBookModal;

    // =============================================
    // 20. FUNÇÕES ADICIONAIS (para compatibilidade)
    // =============================================
    function adicionarLivro(livro) {
        const novoId = booksDatabase.length > 0 
            ? Math.max(...booksDatabase.map(b => b.id)) + 1 
            : 1;

        const novoLivro = {
            id: novoId,
            title: livro.title || 'Título não informado',
            author: livro.author || 'Autor não informado',
            cover: livro.cover || '/img/livro-padrao.png',
            genre: livro.genre || ['Geral'],
            age: livro.age || 'adulto',
            pages: livro.pages || 0,
            year: livro.year || new Date().getFullYear(),
            publisher: livro.publisher || 'Comunidade',
            sinopse: livro.sinopse || 'Este livro foi adicionado pela comunidade.',
            category: livro.category || 'geral',
            destaque: livro.destaque || false,
            recomendado: livro.recomendado || 'Comunidade',
            isTexto: livro.isTexto || false,
            textoCompleto: livro.textoCompleto || null,
            download: livro.download || null
        };

        booksDatabase.push(novoLivro);
        
        renderDestaques();
        renderCategoriasRecomendadas();
        renderBooks();

        console.log(`✅ Livro adicionado: "${novoLivro.title}" (ID: ${novoId})`);
        salvarBackupJSON();
        
        return novoLivro;
    }

    function salvarBackupJSON() {
        const data = JSON.stringify({ livros: booksDatabase }, null, 2);
        localStorage.setItem('biblioteca_backup', data);
        console.log('💾 Backup salvo no localStorage');
    }

    function baixarJSON() {
        const data = JSON.stringify({ livros: booksDatabase }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `livros_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('📥 JSON baixado!');
    }

    function importarJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const livros = data.livros || [];
                
                if (livros.length === 0) {
                    alert('❌ Nenhum livro encontrado no arquivo.');
                    return;
                }
                
                booksDatabase = livros;
                
                renderDestaques();
                renderCategoriasRecomendadas();
                renderBooks();
                
                salvarBackupJSON();
                
                alert(`✅ ${livros.length} livros importados com sucesso!`);
                console.log(`📚 ${livros.length} livros importados do JSON`);
                
            } catch (error) {
                console.error('❌ Erro ao importar:', error);
                alert('❌ Erro ao importar. Verifique o arquivo JSON.');
            }
        };
        reader.readAsText(file);
    }

    // =============================================
    // 21. INICIALIZAÇÃO
    // =============================================
    carregarLivrosDoJSON();

    console.log('📚 Biblioteca inicializada!');
    console.log('   ♿ Acessibilidade integrada (hub flutuante + sidebar)');
    console.log('   🔍 Filtros e busca');
    console.log('   📖 Leitor de PDF e texto');
    console.log('   👤 Perfil:', localStorage.getItem('userName') || 'Visitante');
});