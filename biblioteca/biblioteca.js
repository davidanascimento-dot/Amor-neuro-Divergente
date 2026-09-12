// =========================================================================
// BIBLIOTECA.JS — Amor NeuroDivergente
// Sidebar + Perfil + Acessibilidade + Hub + Biblioteca + Leitor PDF/Texto
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;

    // =============================================
    // 0. PERFIL
    // =============================================
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

    // =============================================
    // 1. SIDEBAR
    // =============================================
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

    // =============================================
    // 2. PERFIL COLAPSÁVEL
    // =============================================
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
    function gs(k, fb) { return localStorage.getItem('a11y_' + k) || fb; }
    function ss(k, v) { localStorage.setItem('a11y_' + k, v); }
    function usl(id, active) { const el = document.getElementById(id); if (el) el.textContent = active ? 'Ligado' : 'Desligado'; }

    function applySettings() {
        if (gs('darkMode') === 'true') body.classList.add('a11y-dark-mode');
        if (gs('highlightLinks') === 'true') body.classList.add('a11y-highlight-links');
        if (gs('dyslexiaFont') === 'true') body.classList.add('a11y-dyslexia');
        if (gs('reduceMotion') === 'true') body.classList.add('a11y-reduce-motion');

        const ts = gs('textSize', 'normal');
        const main = document.getElementById('mainContent') || document.querySelector('.main-content');
        if (main) {
            main.classList.remove('a11y-large-text', 'a11y-small-text');
            if (ts === 'large') main.classList.add('a11y-large-text');
            if (ts === 'small') main.classList.add('a11y-small-text');
        }
    }

    function handleA11yAction(action) {
        const main = document.getElementById('mainContent') || document.querySelector('.main-content');
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

    // =============================================
    // 4. HUB FLUTUANTE
    // =============================================
    const hubToggle = document.getElementById('floatingHubToggle');
    const hubMenu = document.getElementById('floatingHubMenu');
    const overlay = document.getElementById('floatingOverlay');

    function toggleHub() {
        if (!hubMenu || !overlay) return;
        const isOpen = !hubMenu.hidden;
        hubMenu.hidden = isOpen;
        overlay.hidden = isOpen;
        if (hubToggle) hubToggle.setAttribute('aria-expanded', !isOpen);
    }
    function closeHub() {
        if (!hubMenu || !overlay) return;
        hubMenu.hidden = true;
        overlay.hidden = true;
        if (hubToggle) hubToggle.setAttribute('aria-expanded', 'false');
    }

    if (hubToggle) hubToggle.addEventListener('click', (e) => { e.stopPropagation(); toggleHub(); });
    if (overlay) overlay.addEventListener('click', closeHub);
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

    document.querySelectorAll('.hub-action[data-a11y]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            handleA11yAction(item.getAttribute('data-a11y'));
            closeHub();
        });
    });
    document.querySelectorAll('.hub-action[href]').forEach(link => link.addEventListener('click', closeHub));

    // =============================================
    // 5. HEADER / SCROLL TOP / LOGOUT
    // =============================================
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

    // =============================================
    // 6. BANCO DE LIVROS
    // =============================================
    let booksDatabase = [];

    async function carregarLivrosDoJSON() {
        try {
            const res = await fetch('/data/livros.json');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            booksDatabase = data.livros || [];
            console.log(`✅ ${booksDatabase.length} livros carregados do JSON`);
        } catch (err) {
            console.warn('⚠️ JSON não encontrado. Usando fallback local.', err);
            booksDatabase = getLivrosFallback();
        }

        renderDestaques();
        renderContinueLendo();
        renderBooks();
        renderRecomendados();
    }

    // FALLBACK (mantido do seu arquivo original, resumido)
    function getLivrosFallback() {
        return [
            {
                id: 1, title: 'O Silêncio das Marés', author: 'Mariana K. Alves',
                cover: '/img/livro-1.png', genre: ['Ficção','Drama'],
                age: 'adulto', pages: 38, year: 2024, publisher: 'Edições Comunidade',
                sinopse: 'Em uma vila pesqueira esquecida pelo tempo, as marés trazem não apenas peixes, mas memórias de quem já se foi.',
                category: 'ficcao', destaque: true, recomendado: 'Literatura Comunitária',
                isTexto: true,
                textoCompleto: `### Prólogo — Quando o mar parou\n\nNaquela noite, o mar ficou em silêncio...`,
                download: null
            },
            {
                id: 2, title: 'O Mapa das Almas Perdidas', author: 'Thiago S. Mendes',
                cover: '/img/livro-2.png', genre: ['Filosofia','Poesia'],
                age: 'adulto', pages: 208, year: 2023, publisher: 'Coletivo Editorial',
                sinopse: 'Uma coletânea de poemas e reflexões sobre afetos, dores e resistências.',
                category: 'autoajuda', destaque: true, recomendado: 'Poesia Marginal',
                isTexto: true,
                textoCompleto: `### Poema 1 — O mapa\n\nNo papel rasgado,\na cidade inteira cabe...`,
                download: null
            },
            {
                id: 3, title: 'O Jardim das Horas Quebradas', author: 'Carla D. Rocha',
                cover: '/img/livro-3.png', genre: ['Romance','Fantasia'],
                age: 'jovem', pages: 352, year: 2024, publisher: 'Selva Urbana',
                sinopse: 'Uma jovem encontra um jardim abandonado onde as flores desabrocham apenas em horários específicos.',
                category: 'romance', destaque: true, recomendado: 'Fantasia Jovem',
                isTexto: true,
                textoCompleto: `### Capítulo 1 — O jardim escondido\n\nO vento carregava cheiro de terra molhada...`,
                download: null
            }
        ];
    }

    // =============================================
    // 7. RENDER — DESTAQUES (carrossel)
    // =============================================
    function renderDestaques() {
        const track = document.getElementById('carrosselPista');
        if (!track) return;

        const destaques = booksDatabase.filter(b => b.destaque);
        if (!destaques.length) {
            track.innerHTML = `<p style="color:var(--text-muted);padding:20px;">Nenhum livro em destaque no momento.</p>`;
            return;
        }

        track.innerHTML = destaques.map(book => `
            <div class="book-spine" onclick="openBookModal(${book.id})" role="button" tabindex="0" aria-label="Ver detalhes de ${book.title}">
                <div class="book-spine__cover">
                    <img src="${book.cover}" alt="${book.title}" loading="lazy"
                        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                    <div class="book-placeholder" style="display:none;"><i class="fa-solid fa-book"></i></div>
                </div>
                <h3 class="book-spine__title">${escapeHtml(book.title)}</h3>
                <p class="book-spine__author">${escapeHtml(book.author)}</p>
            </div>
        `).join('');
    }

    // =============================================
    // 8. RENDER — CONTINUE LENDO
    // =============================================
    function renderContinueLendo() {
        const grid = document.getElementById('continueGrid');
        if (!grid) return;

        // Simula histórico de leitura (idealmente viria do localStorage)
        let historico = [];
        try {
            historico = JSON.parse(localStorage.getItem('biblioteca_historico') || '[]');
        } catch { historico = []; }

        if (!historico.length) {
            grid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:32px 20px;">
                    <i class="fa-solid fa-bookmark" style="font-size:32px;color:var(--text-muted);opacity:0.5;display:block;margin-bottom:12px;"></i>
                    <p style="color:var(--text-muted);font-size:14px;">Você ainda não começou nenhum livro.<br>Escolha um da biblioteca para começar!</p>
                </div>`;
            return;
        }

        grid.innerHTML = historico.slice(0, 3).map(item => {
            const book = booksDatabase.find(b => b.id === item.id);
            if (!book) return '';
            return `
                <article class="continue-card">
                    <div class="continue-card__cover">
                        <img src="${book.cover}" alt="${book.title}" loading="lazy">
                    </div>
                    <div class="continue-card__body">
                        <h3>${escapeHtml(book.title)}</h3>
                        <p class="continue-card__author">${escapeHtml(book.author)}</p>
                        <div class="continue-card__progress">
                            <div class="continue-progress-bar">
                                <div class="continue-progress-fill" style="width: ${item.percent || 0}%;"></div>
                            </div>
                            <span class="continue-card__percent">${item.percent || 0}% concluído</span>
                        </div>
                        <a href="#" onclick="event.preventDefault();abrirLeitor(${book.id});" class="btn-primary btn-small">
                            Continuar <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </article>
            `;
        }).join('');
    }

    // =============================================
    // 9. RENDER — TODOS OS LIVROS
    // =============================================
    function renderBooks() {
        const grid = document.getElementById('booksGrid');
        const counter = document.getElementById('booksCounter');
        if (!grid) return;

        let filtered = [...booksDatabase];

        const activeTab = document.querySelector('.filter-tab.active');
        if (activeTab) {
            const filter = activeTab.getAttribute('data-filter');
            if (filter !== 'todos') {
                filtered = filtered.filter(b => b.category === filter || b.age === filter);
            }
        }

        const search = document.getElementById('bookSearch');
        if (search && search.value.trim()) {
            const term = search.value.toLowerCase().trim();
            filtered = filtered.filter(b =>
                b.title.toLowerCase().includes(term) ||
                b.author.toLowerCase().includes(term) ||
                (b.genre || []).some(g => g.toLowerCase().includes(term))
            );
        }

        if (counter) counter.textContent = `${filtered.length} livro${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`;

        if (!filtered.length) {
            grid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
                    <i class="fa-solid fa-book-open" style="font-size:48px;color:var(--text-muted);opacity:0.5;display:block;margin-bottom:16px;"></i>
                    <h3 style="font-size:18px;font-weight:700;color:var(--text-dark);margin-bottom:6px;">Nenhum livro encontrado</h3>
                    <p style="color:var(--text-muted);font-size:14px;">Tente outro filtro ou termo de busca.</p>
                </div>`;
            return;
        }

        grid.innerHTML = filtered.map(book => `
            <article class="book-card" onclick="openBookModal(${book.id})" role="button" tabindex="0" aria-label="Ver livro ${book.title}">
                <div class="book-card__cover">
                    <img src="${book.cover}" alt="${book.title}" loading="lazy"
                        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                    <div class="book-placeholder" style="display:none;"><i class="fa-solid fa-book"></i></div>
                    <span class="book-card__badge">${book.age === 'infantil' ? '🧒' : book.age === 'jovem' ? '🧑‍🎓' : '👨‍💼'}</span>
                </div>
                <h3 class="book-card__title">${escapeHtml(book.title)}</h3>
                <p class="book-card__author">${escapeHtml(book.author)}</p>
            </article>
        `).join('');
    }

    // =============================================
    // 10. RENDER — RECOMENDADOS
    // =============================================
    function renderRecomendados() {
        const grid = document.getElementById('recommendedGrid');
        if (!grid) return;

        const recomendados = booksDatabase.filter(b => b.recomendado).slice(0, 4);
        if (!recomendados.length) {
            grid.innerHTML = `<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">Em breve teremos recomendações personalizadas.</p>`;
            return;
        }

        grid.innerHTML = recomendados.map(book => `
            <article class="book-card" onclick="openBookModal(${book.id})" role="button" tabindex="0">
                <div class="book-card__cover">
                    <img src="${book.cover}" alt="${book.title}" loading="lazy">
                    <div class="book-placeholder" style="display:none;"><i class="fa-solid fa-book"></i></div>
                </div>
                <h3 class="book-card__title">${escapeHtml(book.title)}</h3>
                <p class="book-card__author">${escapeHtml(book.author)}</p>
            </article>
        `).join('');
    }

    // =============================================
    // 11. FILTROS E BUSCA
    // =============================================
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            renderBooks();
        });
    });

    const searchInput = document.getElementById('bookSearch');
    if (searchInput) {
        let debounce;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounce);
            debounce = setTimeout(renderBooks, 300);
        });
    }

    // =============================================
    // 12. CARROSSEL DE DESTAQUES
    // =============================================
    const track = document.getElementById('carrosselPista');
    document.getElementById('setaEsquerda')?.addEventListener('click', () => {
        track?.scrollBy({ left: -240, behavior: 'smooth' });
    });
    document.getElementById('setaDireita')?.addEventListener('click', () => {
        track?.scrollBy({ left: 240, behavior: 'smooth' });
    });

    // =============================================
    // 13. MODAL DO LIVRO
    // =============================================
    window.openBookModal = function (bookId) {
        const book = booksDatabase.find(b => b.id == bookId);
        if (!book) return;

        const modalOverlay = document.getElementById('bookModalOverlay');
        const content = document.getElementById('bookModalContent');
        if (!modalOverlay || !content) return;

        const temTexto = book.isTexto && book.textoCompleto;
        const temPDF = book.download;

        content.innerHTML = `
            <div class="book-modal-top">
                <div class="book-modal-cover">
                    <img src="${book.cover}" alt="${book.title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                    <div class="book-placeholder" style="display:none;font-size:40px;color:var(--text-muted);"><i class="fa-solid fa-book"></i></div>
                </div>
                <div class="book-modal-details">
                    <h2>${escapeHtml(book.title)}</h2>
                    <p class="book-modal-author">${escapeHtml(book.author)}</p>
                    <div class="book-modal-tags">
                        ${(book.genre || []).map(g => `<span>${escapeHtml(g)}</span>`).join('')}
                        <span>${book.age === 'infantil' ? '🧒 Infantil' : book.age === 'jovem' ? '🧑‍🎓 Jovem' : '👨‍💼 Adulto'}</span>
                        ${book.recomendado ? `<span>⭐ ${escapeHtml(book.recomendado)}</span>` : ''}
                    </div>
                    <div class="book-modal-meta">
                        <span><i class="fa-regular fa-clock"></i> ${book.pages} páginas</span>
                        <span><i class="fa-regular fa-calendar"></i> ${book.year}</span>
                        <span><i class="fa-regular fa-building"></i> ${escapeHtml(book.publisher || '—')}</span>
                    </div>
                    <p class="book-modal-sinopse">${escapeHtml(book.sinopse)}</p>
                    <div class="book-modal-actions">
                        ${(temTexto || temPDF) ? `
                            <button class="book-modal-btn book-modal-btn-download" onclick="abrirLeitor(${book.id})">
                                <i class="fa-solid fa-book-open"></i> Ler livro
                            </button>
                        ` : ''}
                        ${temPDF ? `
                            <a href="${book.download}" target="_blank" rel="noopener" class="book-modal-btn book-modal-btn-secondary">
                                <i class="fa-solid fa-download"></i> Baixar PDF
                            </a>
                        ` : ''}
                        ${(!temTexto && !temPDF) ? `
                            <span style="font-size:13px;color:var(--text-muted);font-style:italic;">📖 Disponível em breve</span>
                        ` : ''}
                        <button class="book-modal-btn book-modal-btn-secondary" onclick="closeBookModal()">
                            <i class="fa-solid fa-xmark"></i> Fechar
                        </button>
                    </div>
                </div>
            </div>
        `;

        modalOverlay.hidden = false;
        document.body.style.overflow = 'hidden';
    };

    window.closeBookModal = function () {
        const overlay = document.getElementById('bookModalOverlay');
        if (overlay) {
            overlay.hidden = true;
            document.body.style.overflow = '';
        }
    };

    document.getElementById('bookModalClose')?.addEventListener('click', window.closeBookModal);
    document.getElementById('bookModalBg')?.addEventListener('click', window.closeBookModal);

    // =============================================
    // 14. LEITOR (PDF + Texto)
    // =============================================
    const leitorEstado = {
        pdfDoc: null,
        paginaAtual: 1,
        totalPaginas: 0,
        escala: 1.0,
        darkMode: false,
        isTexto: false,
        textoPaginas: [],
        palavrasPorPagina: 300,
        livroAtual: null
    };

    // ATENÇÃO: IDs atualizados para o novo HTML (reading-* em vez de leitura-*)
    const leitorEl = {
        overlay: document.getElementById('readingModalOverlay'),
        bg: document.getElementById('readingModalBg'),
        modal: document.getElementById('readingModal'),
        titulo: document.getElementById('readingTitle'),
        autor: document.getElementById('readingAuthor'),
        canvas: document.getElementById('readingPdfCanvas'),
        container: document.getElementById('readingPdfContainer'),
        pageNum: document.getElementById('readingPageNum'),
        pageCount: document.getElementById('readingPageCount'),
        prevBtn: document.getElementById('readingPrevPage'),
        nextBtn: document.getElementById('readingNextPage'),
        zoomIn: document.getElementById('readingZoomIn'),
        zoomOut: document.getElementById('readingZoomOut'),
        zoomLevel: document.getElementById('readingZoomLevel'),
        fullscreenBtn: document.getElementById('readingFullscreen'),
        darkModeBtn: document.getElementById('readingDarkMode'),
        fecharBtn: document.getElementById('readingClose'),
        progressoBar: document.getElementById('readingProgressFill'),
        progressoTexto: document.getElementById('readingProgressText')
    };

    function carregarPdfJs() {
        return new Promise((resolve) => {
            if (typeof pdfjsLib !== 'undefined') { resolve(pdfjsLib); return; }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
            script.onload = () => {
                const worker = document.createElement('script');
                worker.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                worker.onload = () => resolve(pdfjsLib);
                document.head.appendChild(worker);
            };
            document.head.appendChild(script);
        });
    }

    window.abrirLeitor = async function (bookId) {
        const book = booksDatabase.find(b => b.id == bookId);
        if (!book) return;

        leitorEstado.livroAtual = book;
        if (leitorEl.titulo) leitorEl.titulo.textContent = book.title;
        if (leitorEl.autor) leitorEl.autor.textContent = `por ${book.author}`;

        if (leitorEl.overlay) leitorEl.overlay.hidden = false;
        document.body.style.overflow = 'hidden';

        // Registra no histórico
        salvarHistorico(book.id);

        if (book.isTexto && book.textoCompleto) {
            abrirLeitorTexto(book);
        } else if (book.download) {
            await abrirLeitorPDF(book);
        } else {
            alert('Este livro não está disponível para leitura.');
            window.fecharLeitor();
        }
    };

    function salvarHistorico(bookId) {
        let historico = [];
        try { historico = JSON.parse(localStorage.getItem('biblioteca_historico') || '[]'); } catch {}
        const idx = historico.findIndex(h => h.id === bookId);
        if (idx >= 0) {
            historico[idx].ultimaLeitura = Date.now();
        } else {
            historico.unshift({ id: bookId, percent: 0, ultimaLeitura: Date.now() });
        }
        localStorage.setItem('biblioteca_historico', JSON.stringify(historico.slice(0, 10)));
    }

    function abrirLeitorTexto(book) {
        leitorEstado.isTexto = true;

        const palavras = book.textoCompleto.split(/\s+/);
        const paginas = [];
        for (let i = 0; i < palavras.length; i += leitorEstado.palavrasPorPagina) {
            paginas.push(palavras.slice(i, i + leitorEstado.palavrasPorPagina).join(' '));
        }
        if (!paginas.length) paginas.push('(Texto vazio)');

        leitorEstado.textoPaginas = paginas;
        leitorEstado.totalPaginas = paginas.length;
        leitorEstado.paginaAtual = 1;

        if (leitorEl.pageCount) leitorEl.pageCount.textContent = paginas.length;
        if (leitorEl.pageNum) leitorEl.pageNum.textContent = 1;
        if (leitorEl.canvas) leitorEl.canvas.style.display = 'none';

        // Container de texto
        let textContainer = document.getElementById('readingTextoContainer');
        if (!textContainer) {
            textContainer = document.createElement('div');
            textContainer.id = 'readingTextoContainer';
            textContainer.className = 'reading-text-container';
            leitorEl.container?.appendChild(textContainer);
        }
        textContainer.style.display = 'block';

        renderizarPaginaTexto(1);
    }

    function renderizarPaginaTexto(numPagina) {
        const textContainer = document.getElementById('readingTextoContainer');
        if (!textContainer) return;
        if (numPagina < 1 || numPagina > leitorEstado.textoPaginas.length) return;

        const conteudo = leitorEstado.textoPaginas[numPagina - 1];
        const formatado = conteudo
            .replace(/\n/g, '<br>')
            .replace(/(#{1,3})\s*(.+)/g, (_, h, t) => {
                const tag = h.length === 1 ? 'h1' : h.length === 2 ? 'h2' : 'h3';
                return `<${tag}>${t.trim()}</${tag}>`;
            })
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/---/g, '<hr>');

        textContainer.innerHTML = `
            <div class="reading-text-page">
                <div class="reading-text-content">${formatado}</div>
                <div class="reading-text-number">Página ${numPagina} de ${leitorEstado.textoPaginas.length}</div>
            </div>
        `;
        textContainer.scrollTop = 0;

        if (leitorEl.pageNum) leitorEl.pageNum.textContent = numPagina;
        leitorEstado.paginaAtual = numPagina;

        atualizarBotoesNavegacao();
        atualizarProgresso(numPagina);
    }

    async function abrirLeitorPDF(book) {
        leitorEstado.isTexto = false;
        if (leitorEl.canvas) leitorEl.canvas.style.display = 'block';
        const textContainer = document.getElementById('readingTextoContainer');
        if (textContainer) textContainer.style.display = 'none';

        try {
            const pdfjs = await carregarPdfJs();
            const pdf = await pdfjs.getDocument(book.download).promise;
            leitorEstado.pdfDoc = pdf;
            leitorEstado.totalPaginas = pdf.numPages;
            leitorEstado.paginaAtual = 1;

            if (leitorEl.pageCount) leitorEl.pageCount.textContent = pdf.numPages;
            if (leitorEl.pageNum) leitorEl.pageNum.textContent = 1;

            atualizarBotoesNavegacao();
            await renderizarPaginaPDF(1);
        } catch (err) {
            console.error('Erro ao carregar PDF:', err);
            alert('Não foi possível carregar o PDF.');
            window.fecharLeitor();
        }
    }

    async function renderizarPaginaPDF(numPagina) {
        if (!leitorEstado.pdfDoc) return;
        const page = await leitorEstado.pdfDoc.getPage(numPagina);
        const viewport = page.getViewport({ scale: leitorEstado.escala });
        const canvas = leitorEl.canvas;
        const ctx = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        if (leitorEl.pageNum) leitorEl.pageNum.textContent = numPagina;
        leitorEstado.paginaAtual = numPagina;
        if (leitorEl.zoomLevel) leitorEl.zoomLevel.textContent = `${Math.round(leitorEstado.escala * 100)}%`;

        atualizarBotoesNavegacao();
        atualizarProgresso(numPagina);
    }

    function paginaAnterior() {
        if (leitorEstado.paginaAtual > 1) {
            leitorEstado.isTexto
                ? renderizarPaginaTexto(leitorEstado.paginaAtual - 1)
                : renderizarPaginaPDF(leitorEstado.paginaAtual - 1);
        }
    }
    function proximaPagina() {
        const total = leitorEstado.isTexto ? leitorEstado.textoPaginas.length : leitorEstado.totalPaginas;
        if (leitorEstado.paginaAtual < total) {
            leitorEstado.isTexto
                ? renderizarPaginaTexto(leitorEstado.paginaAtual + 1)
                : renderizarPaginaPDF(leitorEstado.paginaAtual + 1);
        }
    }

    function atualizarBotoesNavegacao() {
        const total = leitorEstado.isTexto ? leitorEstado.textoPaginas.length : leitorEstado.totalPaginas;
        if (leitorEl.prevBtn) leitorEl.prevBtn.disabled = leitorEstado.paginaAtual <= 1;
        if (leitorEl.nextBtn) leitorEl.nextBtn.disabled = leitorEstado.paginaAtual >= total;
    }

    function atualizarProgresso(pagina) {
        const total = leitorEstado.isTexto ? leitorEstado.textoPaginas.length : leitorEstado.totalPaginas;
        if (!total) return;
        const pct = Math.round((pagina / total) * 100);
        if (leitorEl.progressoBar) leitorEl.progressoBar.style.width = `${pct}%`;
        if (leitorEl.progressoTexto) leitorEl.progressoTexto.textContent = `${pct}% lido`;

        // Persiste progresso
        if (leitorEstado.livroAtual) {
            let hist = [];
            try { hist = JSON.parse(localStorage.getItem('biblioteca_historico') || '[]'); } catch {}
            const idx = hist.findIndex(h => h.id === leitorEstado.livroAtual.id);
            if (idx >= 0) { hist[idx].percent = pct; hist[idx].ultimaLeitura = Date.now(); }
            else hist.unshift({ id: leitorEstado.livroAtual.id, percent: pct, ultimaLeitura: Date.now() });
            localStorage.setItem('biblioteca_historico', JSON.stringify(hist.slice(0, 10)));
        }
    }

    function aumentarZoom() {
        if (leitorEstado.isTexto) return;
        leitorEstado.escala = Math.min(leitorEstado.escala + 0.1, 3.0);
        if (leitorEstado.pdfDoc) renderizarPaginaPDF(leitorEstado.paginaAtual);
    }
    function diminuirZoom() {
        if (leitorEstado.isTexto) return;
        leitorEstado.escala = Math.max(leitorEstado.escala - 0.1, 0.3);
        if (leitorEstado.pdfDoc) renderizarPaginaPDF(leitorEstado.paginaAtual);
    }

    function alternarModoEscuro() {
        leitorEstado.darkMode = !leitorEstado.darkMode;
        leitorEl.modal?.classList.toggle('dark-mode', leitorEstado.darkMode);
        if (leitorEl.darkModeBtn) {
            leitorEl.darkModeBtn.innerHTML = leitorEstado.darkMode
                ? '<i class="fa-regular fa-sun"></i>'
                : '<i class="fa-solid fa-moon"></i>';
        }
    }

    function alternarTelaCheia() {
        const modal = leitorEl.modal;
        if (!document.fullscreenElement) {
            modal?.requestFullscreen?.() || modal?.webkitRequestFullscreen?.();
        } else {
            document.exitFullscreen?.() || document.webkitExitFullscreen?.();
        }
    }

    window.fecharLeitor = function () {
        if (leitorEl.overlay) leitorEl.overlay.hidden = true;
        document.body.style.overflow = '';
        leitorEstado.pdfDoc = null;
        leitorEstado.paginaAtual = 1;
        leitorEstado.totalPaginas = 0;
        leitorEstado.isTexto = false;
        leitorEstado.textoPaginas = [];

        const tc = document.getElementById('readingTextoContainer');
        if (tc) { tc.style.display = 'none'; tc.innerHTML = ''; }

        if (leitorEl.progressoBar) leitorEl.progressoBar.style.width = '0%';
        if (leitorEl.progressoTexto) leitorEl.progressoTexto.textContent = '0% lido';
    };

    // Eventos do leitor
    leitorEl.prevBtn?.addEventListener('click', paginaAnterior);
    leitorEl.nextBtn?.addEventListener('click', proximaPagina);
    leitorEl.zoomIn?.addEventListener('click', aumentarZoom);
    leitorEl.zoomOut?.addEventListener('click', diminuirZoom);
    leitorEl.darkModeBtn?.addEventListener('click', alternarModoEscuro);
    leitorEl.fullscreenBtn?.addEventListener('click', alternarTelaCheia);
    leitorEl.fecharBtn?.addEventListener('click', window.fecharLeitor);
    leitorEl.bg?.addEventListener('click', (e) => { if (e.target === leitorEl.bg) window.fecharLeitor(); });

    document.addEventListener('keydown', (e) => {
        if (leitorEl.overlay?.hidden) return;
        switch (e.key) {
            case 'Escape': window.fecharLeitor(); break;
            case 'ArrowRight':
            case ' ': e.preventDefault(); proximaPagina(); break;
            case 'ArrowLeft': e.preventDefault(); paginaAnterior(); break;
            case '+': aumentarZoom(); break;
            case '-': diminuirZoom(); break;
            case 'f': alternarTelaCheia(); break;
            case 'd': alternarModoEscuro(); break;
        }
    });

    // =============================================
    // 15. HELPERS
    // =============================================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =============================================
    // 16. INICIALIZAÇÃO
    // =============================================
    carregarLivrosDoJSON();

    console.log('📚 Biblioteca inicializada!');
    console.log('   ♿ Acessibilidade + Sidebar + Hub');
    console.log('   🔍 Filtros por gênero + busca');
    console.log('   📖 Leitor de PDF e texto');
});