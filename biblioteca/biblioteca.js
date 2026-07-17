/**
 * BIBLIOTECA.JS — Versão Otimizada com Carrossel de Destaques e Categorias
 */

document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // 1. BANCO DE DADOS DE LIVROS
    // =============================================
    const booksDatabase = [
        {
            id: 1,
            title: 'O Perfume das Flores à Noite',
            author: 'Ruta Simões Ribeiro',
            cover: '/img/livro-1.png',
            genre: ['Ficção', 'Drama'],
            age: 'adulto',
            pages: 256,
            year: 2022,
            publisher: 'Companhia das Letras',
            sinopse: 'Uma história de perda e redescoberta. O protagonista perde sua identidade em um acidente e precisa reconstruir quem ele é.',
            link: '#',
            download: 'https://www.example.com/download/perfume-flores.pdf',
            category: 'ficcao',
            destaque: true,
            recomendado: 'Ficção Brasileira'
        },
        {
            id: 2,
            title: 'Sobre Desistir',
            author: 'Adam Phillips',
            cover: '/img/livro-1.png',
            genre: ['Psicologia', 'Filosofia'],
            age: 'adulto',
            pages: 192,
            year: 2022,
            publisher: 'Editora 34',
            sinopse: 'Uma reflexão profunda sobre o ato de desistir — não como fracasso, mas como uma escolha consciente e libertadora.',
            link: '#',
            download: 'https://www.example.com/download/sobre-desistir.pdf',
            category: 'autoajuda',
            destaque: true,
            recomendado: 'Psicologia'
        },
        {
            id: 3,
            title: 'A Diplomata',
            author: 'G.G. Diniz',
            cover: '/img/livro-1.png',
            genre: ['Romance', 'Drama'],
            age: 'jovem',
            pages: 320,
            year: 2023,
            publisher: 'Intrínseca',
            sinopse: 'Uma história de amor e política que atravessa fronteiras. Um diplomata brasileiro e uma ativista se encontram em meio a conflitos internacionais.',
            link: '#',
            download: 'https://www.example.com/download/diplomata.pdf',
            category: 'romance',
            destaque: true,
            recomendado: 'Romance'
        },
        {
            id: 4,
            title: 'O Homem sem Mim',
            author: 'Ruta Simões Ribeiro',
            cover: '/img/livro-1.png',
            genre: ['Ficção', 'Drama'],
            age: 'adulto',
            pages: 288,
            year: 2021,
            publisher: 'Companhia das Letras',
            sinopse: 'Uma jornada de autodescoberta após a perda de um ente querido. O protagonista precisa aprender a viver sem a pessoa que sempre esteve ao seu lado.',
            link: '#',
            download: 'https://www.example.com/download/o-homem-sem-mim.pdf',
            category: 'ficcao',
            destaque: true,
            recomendado: 'Ficção Brasileira'
        },
        {
            id: 5,
            title: 'A Hipótese Humana',
            author: 'Alberto Mussa',
            cover: '/img/livro-1.png',
            genre: ['Ficção', 'História'],
            age: 'adulto',
            pages: 224,
            year: 2021,
            publisher: 'Record',
            sinopse: 'Uma investigação sobre as origens da humanidade, misturando ficção, história e ciência.',
            link: '#',
            download: 'https://www.example.com/download/a-hipotese-humana.pdf',
            category: 'ficcao',
            destaque: true,
            recomendado: 'Ficção Histórica'
        },
        {
            id: 6,
            title: 'O Amor nos Tempos do Cólera',
            author: 'Gabriel García Márquez',
            cover: '/img/livro-1.png',
            genre: ['Romance', 'Clássico'],
            age: 'adulto',
            pages: 368,
            year: 1985,
            publisher: 'Record',
            sinopse: 'Uma história de amor que atravessa décadas. Florentino Ariza espera 51 anos para declarar seu amor a Fermina Daza.',
            link: '#',
            download: 'https://www.example.com/download/o-amor-nos-tempos-do-colera.pdf',
            category: 'romance',
            destaque: true,
            recomendado: 'Clássicos'
        },
        {
            id: 7,
            title: 'O Pequeno Príncipe',
            author: 'Antoine de Saint-Exupéry',
            cover: 'https://images-na.ssl-images-amazon.com/images/images/I/91bHsXPH9PL.jpg',
            genre: ['Ficção', 'Infantil'],
            age: 'infantil',
            pages: 96,
            year: 1943,
            publisher: 'Agir',
            sinopse: 'O Pequeno Príncipe é uma obra-prima da literatura mundial. Através da história de um piloto que cai no deserto e conhece um pequeno príncipe vindo de outro planeta.',
            link: '#',
            download: 'https://www.example.com/download/pequeno-principe.pdf',
            category: 'ficcao',
            destaque: false,
            recomendado: 'Infantil'
        },
        {
            id: 8,
            title: 'O Menino do Dedo Verde',
            author: 'Maurice Druon',
            cover: 'https://images-na.ssl-images-amazon.com/images/images/I/81YQxBm3ZYL.jpg',
            genre: ['Ficção', 'Infantil'],
            age: 'infantil',
            pages: 144,
            year: 1957,
            publisher: 'Editora WMF Martins Fontes',
            sinopse: 'Tistu é um menino que nasceu com um dom especial: tudo o que ele toca com o dedo vira uma planta.',
            link: '#',
            download: null,
            category: 'ficcao',
            destaque: false,
            recomendado: 'Infantil'
        },
        {
            id: 9,
            title: 'Ansiedade - Como Enfrentar o Mal do Século',
            author: 'Augusto Cury',
            cover: 'https://images-na.ssl-images-amazon.com/images/images/I/81Q2UhRrQmL.jpg',
            genre: ['Autoajuda', 'Psicologia'],
            age: 'adulto',
            pages: 208,
            year: 2019,
            publisher: 'Benvirá',
            sinopse: 'Em um mundo cada vez mais acelerado, a ansiedade se tornou um dos maiores desafios da saúde mental.',
            link: '#',
            download: null,
            category: 'autoajuda',
            destaque: false,
            recomendado: 'Autoajuda'
        },
        {
            id: 10,
            title: 'Orgulho e Preconceito',
            author: 'Jane Austen',
            cover: 'https://images-na.ssl-images-amazon.com/images/images/I/91sPwB9T0ZL.jpg',
            genre: ['Romance', 'Clássico'],
            age: 'jovem',
            pages: 368,
            year: 1813,
            publisher: 'Penguin Companhia',
            sinopse: 'Elizabeth Bennet, uma jovem inteligente e espirituosa, enfrenta as pressões sociais de sua época ao mesmo tempo em que lida com seus próprios preconceitos.',
            link: '#',
            download: null,
            category: 'romance',
            destaque: false,
            recomendado: 'Clássicos'
        },
        {
            id: 11,
            title: 'A Culpa é das Estrelas',
            author: 'John Green',
            cover: 'https://images-na.ssl-images-amazon.com/images/images/I/91gNYB0D8aL.jpg',
            genre: ['Romance', 'Drama'],
            age: 'jovem',
            pages: 288,
            year: 2012,
            publisher: 'Intrínseca',
            sinopse: 'Hazel e Gus são dois adolescentes que se conhecem em um grupo de apoio para jovens com câncer.',
            link: '#',
            download: null,
            category: 'romance',
            destaque: false,
            recomendado: 'Romance'
        },
        {
            id: 12,
            title: 'Noites Brancas',
            author: 'Fiódor Dostoiévski',
            cover: 'https://images-na.ssl-images-amazon.com/images/images/I/71x3mCz-srL.jpg',
            genre: ['Romance', 'Clássico'],
            age: 'adulto',
            pages: 144,
            year: 1848,
            publisher: 'Editora 34',
            sinopse: 'Em São Petersburgo, durante as noites brancas, um jovem sonhador conhece uma garota em uma ponte.',
            link: '#',
            download: null,
            category: 'romance',
            destaque: false,
            recomendado: 'Clássicos'
        }
    ];

    // =============================================
    // 2. CATEGORIAS RECOMENDADAS
    // =============================================
    const categoriasRecomendadas = [
        'Ficção Brasileira',
        'Romance',
        'Clássicos',
        'Psicologia',
        'Autoajuda',
        'Infantil',
        'Ficção Histórica'
    ];

    // =============================================
    // 3. VARIÁVEIS / ELEMENTOS DO DOM
    // =============================================
    const pista = document.getElementById('carrosselPista');
    const setaEsquerda = document.getElementById('setaEsquerda');
    const setaDireita = document.getElementById('setaDireita');
    const booksGrid = document.getElementById('booksGrid');
    const bookSearch = document.getElementById('bookSearch');
    const booksCounter = document.getElementById('booksCounter');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const containerCategorias = document.getElementById('containerCategorias');
    
    let currentFilter = 'todos';
    let currentSearch = '';

    // UTILS: Função Debounce para otimizar digitação na pesquisa
    function debounce(func, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    }

    // =============================================
    // 4. RENDERIZAR DESTAQUES (CARROSSEL)
    // =============================================
    function renderDestaques() {
        if (!pista) return;
        
        const destaques = booksDatabase.filter(book => book.destaque === true);
        
        pista.innerHTML = destaques.map(book => `
            <div class="card-livro-destaque" onclick="openBookModal(${book.id})" role="button" aria-label="Ver detalhes de ${book.title}">
                <div class="capa-livro">
                    <img src="${book.cover}" alt="${book.title}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="book-placeholder" style="display:none;"><i class="fa-solid fa-book"></i></div>
                </div>
            </div>
        `).join('');
        
        // Atualiza estado inicial das setas após renderizar os itens
        setTimeout(atualizarEstadoSetas, 100);
    }

    // =============================================
    // 5. RENDERIZAR CATEGORIAS RECOMENDADAS
    // =============================================
    function renderCategoriasRecomendadas() {
        if (!containerCategorias) return;

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

        containerCategorias.innerHTML = html;
    }

    // =============================================
    // 6. CONTROLE E ATUALIZAÇÃO DO CARROSSEL
    // =============================================
    const valorRolagem = 210;

    function atualizarEstadoSetas() {
        if (!pista) return;
        
        const scrollLeftMax = pista.scrollWidth - pista.clientWidth;
        
        if (setaEsquerda) {
            if (pista.scrollLeft <= 5) {
                setaEsquerda.classList.add('disabled');
                setaEsquerda.setAttribute('disabled', 'true');
            } else {
                setaEsquerda.classList.remove('disabled');
                setaEsquerda.removeAttribute('disabled');
            }
        }
        
        if (setaDireita) {
            if (pista.scrollLeft >= scrollLeftMax - 5) {
                setaDireita.classList.add('disabled');
                setaDireita.setAttribute('disabled', 'true');
            } else {
                setaDireita.classList.remove('disabled');
                setaDireita.removeAttribute('disabled');
            }
        }
    }

    if (pista) {
        pista.addEventListener('scroll', atualizarEstadoSetas);
        window.addEventListener('resize', atualizarEstadoSetas);
    }

    if (setaEsquerda) {
        setaEsquerda.addEventListener('click', () => {
            pista?.scrollBy({ left: -valorRolagem, behavior: 'smooth' });
        });
    }

    if (setaDireita) {
        setaDireita.addEventListener('click', () => {
            pista?.scrollBy({ left: valorRolagem, behavior: 'smooth' });
        });
    }

    // =============================================
    // 7. RENDERIZAR TODOS OS LIVROS (GRID)
    // =============================================
    function renderBooks() {
        if (!booksGrid) return;

        let filtered = [...booksDatabase];

        // Filtro de Categorias / Idade
        if (currentFilter !== 'todos') {
            const filterLower = currentFilter.toLowerCase();
            filtered = filtered.filter(book => 
                book.age === currentFilter || 
                book.category === currentFilter ||
                book.genre.some(g => g.toLowerCase() === filterLower) ||
                book.recomendado?.toLowerCase().includes(filterLower)
            );
        }

        // Filtro da Barra de Pesquisa
        if (currentSearch.trim()) {
            const term = currentSearch.toLowerCase().trim();
            filtered = filtered.filter(book =>
                book.title.toLowerCase().includes(term) ||
                book.author.toLowerCase().includes(term) ||
                book.genre.some(g => g.toLowerCase().includes(term)) ||
                book.sinopse.toLowerCase().includes(term) ||
                book.recomendado?.toLowerCase().includes(term)
            );
        }

        // Atualização do contador de livros encontrados
        if (booksCounter) {
            booksCounter.textContent = `${filtered.length} livro${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`;
        }

        // Estado Vazio (Nenhum resultado)
        if (filtered.length === 0) {
            booksGrid.innerHTML = `
                <div class="no-books" style="grid-column:1/-1; text-align:center; padding:40px 20px;">
                    <i class="fa-solid fa-book-open" style="font-size:40px; color:var(--text-muted); display:block; margin-bottom:12px;"></i>
                    <h3 style="font-size:18px; font-weight:700; color:var(--text-dark); margin-bottom:4px;">Nenhum livro encontrado</h3>
                    <p style="color:var(--text-muted);">Tente alterar o termo digitado ou escolher outro filtro.</p>
                </div>
            `;
            return;
        }

        // Geração dos cards de livros
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
    // 8. MODAL DO LIVRO
    // =============================================
    function openBookModal(bookId) {
        const book = booksDatabase.find(b => b.id == bookId);
        if (!book) return;

        const overlay = document.getElementById('bookModalOverlay');
        const content = document.getElementById('bookModalContent');

        if (!overlay || !content) return;

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
                        ${book.download ? `
                            <a href="${book.download}" target="_blank" rel="noopener" class="book-modal-btn book-modal-btn-download">
                                <i class="fa-solid fa-download"></i> Baixar PDF
                            </a>
                        ` : `
                            <span style="font-size:13px; color:var(--text-muted); font-style:italic;">📖 Livro disponível em breve</span>
                        `}
                        <button class="book-modal-btn book-modal-btn-secondary" onclick="closeBookModal()">
                            <i class="fa-solid fa-xmark"></i> Fechar
                        </button>
                    </div>
                </div>
            </div>
        `;

        overlay.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeBookModal() {
        const overlay = document.getElementById('bookModalOverlay');
        if (overlay) {
            overlay.hidden = true;
            document.body.style.overflow = '';
        }
    }

    // Exposição das funções ao escopo global (necessário para os gatilhos inline onclick)
    window.openBookModal = openBookModal;
    window.closeBookModal = closeBookModal;

    // =============================================
    // 9. EVENTOS E ESCUTADORES
    // =============================================

    // Fechar modal ao apertar a tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeBookModal();
    });

    // Fechar modal ao clicar fora da caixa interna (no fundo escuro)
    const modalBg = document.getElementById('bookModalBg') || document.getElementById('bookModalOverlay');
    modalBg?.addEventListener('click', (e) => {
        // Garante que o clique foi exatamente no fundo, e não se propagou de dentro do modal
        if (e.target === modalBg || e.target.id === 'bookModalBg') {
            closeBookModal();
        }
    });

    document.getElementById('bookModalClose')?.addEventListener('click', closeBookModal);

    // Ouvinte da barra de pesquisa com a proteção Debounce criada acima
    bookSearch?.addEventListener('input', debounce((e) => {
        currentSearch = e.target.value;
        renderBooks();
    }, 300));

    // Filtros por botão
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter || 'todos';
            renderBooks();
        });
    });

    // =============================================
    // 10. INICIALIZAÇÃO DA APLICAÇÃO
    // =============================================
    renderDestaques();
    renderCategoriasRecomendadas();
    renderBooks();

    console.log('📚 Biblioteca atualizada com sucesso!');
    console.log('📖 Total catalogado:', booksDatabase.length);
    console.log('⭐ Total em Destaque:', booksDatabase.filter(b => b.destaque).length);
    console.log('📂 Categorias:', categoriasRecomendadas);
});