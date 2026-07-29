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
    title: 'O Silêncio das Marés',
    author: 'Mariana K. Alves',
    cover: '/img/livro-1.png',
    genre: ['Ficção', 'Drama', 'Realismo Mágico'],
    age: 'adulto',
    pages: 312,
    year: 2024,
    publisher: 'Edições Comunidade',
    sinopse: 'Em uma vila pesqueira esquecida pelo tempo, as marés trazem não apenas peixes, mas memórias de quem já se foi. A comunidade local decide registrar essas histórias antes que o mar as engula para sempre.',
    link: '#',
    download: 'https://comunidade.livros/download/silencio-das-mares.pdf',
    category: 'ficcao',
    destaque: true,
    recomendado: 'Literatura Comunitária'
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
    sinopse: 'Uma coletânea de poemas e reflexões escritas por moradores de uma periferia, mapeando afetos, dores e resistências. Cada poema é um ponto no mapa afetivo do bairro.',
    link: '#',
    download: 'https://comunidade.livros/download/mapa-almas.pdf',
    category: 'autoajuda',
    destaque: true,
    recomendado: 'Poesia Marginal'
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
    sinopse: 'Uma jovem encontra um jardim abandonado onde as flores desabrocham apenas em horários específicos. Ao lado de outros jovens da comunidade, ela descobre que o jardim guarda segredos sobre o tempo e o amor.',
    link: '#',
    download: 'https://comunidade.livros/download/jardim-horas.pdf',
    category: 'romance',
    destaque: true,
    recomendado: 'Fantasia Jovem'
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
    sinopse: 'Na década de 1940, um mestre tipógrafo guardava a receita de uma tinta indestrutível. Anos depois, seus netos resgatam a fórmula e transformam a antiga gráfica em um centro cultural comunitário.',
    link: '#',
    download: 'https://comunidade.livros/download/receita-tinta.pdf',
    category: 'ficcao',
    destaque: true,
    recomendado: 'Ficção Histórica'
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
    sinopse: 'Em uma cidade coberta por cinzas vulcânicas, sete luas aparecem no céu uma vez por século. A comunidade local criou rituais e lendas em torno desse fenômeno, e uma jovem decide investigar sua origem.',
    link: '#',
    download: 'https://comunidade.livros/download/sete-luas.pdf',
    category: 'ficcao',
    destaque: true,
    recomendado: 'Distopia'
  },
  {
    id: 6,
    title: 'A Biblioteca dos Sonhos Esquecidos',
    author: 'Lucas P. Moreira',
    cover: '/img/livro-6.png',
    genre: ['Romance', 'Clássico'],
    age: 'adulto',
    pages: 286,
    year: 2021,
    publisher: 'Acervo Popular',
    sinopse: 'Uma biblioteca comunitária guarda livros que ninguém mais lembra. Seu novo zelador descobre que cada livro abandonado carrega um sonho de quem o doou, e ele precisa devolver esses sonhos aos seus donos.',
    link: '#',
    download: 'https://comunidade.livros/download/biblioteca-sonhos.pdf',
    category: 'romance',
    destaque: true,
    recomendado: 'Romance Contemporâneo'
  },
  {
    id: 7,
    title: 'O Eco do Nono Trovão',
    author: 'Mônica C. Rios',
    cover: '/img/livro-7.png',
    genre: ['Ficção', 'Infantil'],
    age: 'infantil',
    pages: 68,
    year: 2023,
    publisher: 'Ciranda de Histórias',
    sinopse: 'Numa aldeia onde os trovões têm nomes, o nono trovão nunca foi ouvido. Crianças da comunidade se unem para descobrir por que ele está em silêncio e, no caminho, aprendem sobre coragem e cooperação.',
    link: '#',
    download: 'https://comunidade.livros/download/nono-trovao.pdf',
    category: 'ficcao',
    destaque: false,
    recomendado: 'Infantil'
  },
  {
    id: 8,
    title: 'O Alfaiate de Estrelas',
    author: 'Rafaela A. Souza',
    cover: '/img/livro-8.png',
    genre: ['Ficção', 'Fantasia'],
    age: 'infantil',
    pages: 112,
    year: 2024,
    publisher: 'Lunetas Editora',
    sinopse: 'Um alfaiate que mora no topo da montanha mais alta costura estrelas que caem do céu. Cada estrela tem uma história, e ele as transforma em tecidos que curam a tristeza das pessoas da vila.',
    link: '#',
    download: null,
    category: 'ficcao',
    destaque: false,
    recomendado: 'Fantasia Infantil'
  },
  {
    id: 9,
    title: 'A Estrada sem Nome',
    author: 'Sergio M. Lins',
    cover: '/img/livro-9.png',
    genre: ['Autoajuda', 'Filosofia'],
    age: 'adulto',
    pages: 224,
    year: 2023,
    publisher: 'Caminhos Coletivos',
    sinopse: 'Moradores de uma comunidade rural escreveram coletivamente este livro sobre os desafios de viver sem endereço formal. É um manifesto sobre pertencimento, identidade e a força dos laços comunitários.',
    link: '#',
    download: null,
    category: 'autoajuda',
    destaque: false,
    recomendado: 'Autoajuda Social'
  },
  {
    id: 10,
    title: 'Memórias do Fogo e da Névoa',
    author: 'Fernanda T. Barros',
    cover: '/img/livro-10.png',
    genre: ['Romance', 'Clássico'],
    age: 'jovem',
    pages: 304,
    year: 2022,
    publisher: 'Fogaréu Edições',
    sinopse: 'Duas famílias rivais em um vale coberto por névoa constante. Uma jovem de cada lado se apaixona e, juntas, resgatam a história esquecida de uma antiga amizade entre seus avós, que poderia ter evitado a rivalidade.',
    link: '#',
    download: null,
    category: 'romance',
    destaque: false,
    recomendado: 'Romance Juvenil'
  },
  {
    id: 11,
    title: 'O Relógio de Areia Vermelha',
    author: 'André C. Melo',
    cover: '/img/livro-11.png',
    genre: ['Romance', 'Drama'],
    age: 'jovem',
    pages: 256,
    year: 2025,
    publisher: 'Areia & Tempo',
    sinopse: 'Um relógio de areia com grãos vermelhos é encontrado em uma garagem comunitária. Cada vez que alguém o vira, uma memória perdida retorna. Um grupo de jovens decide usar o objeto para curar feridas do passado do bairro.',
    link: '#',
    download: null,
    category: 'romance',
    destaque: false,
    recomendado: 'Drama Juvenil'
  },
  {
    id: 12,
    title: 'Cartas para um Lugar Inexistente',
    author: 'Beatriz L. Castro',
    cover: '/img/livro-12.png',
    genre: ['Romance', 'Clássico'],
    age: 'adulto',
    pages: 196,
    year: 2020,
    publisher: 'Correio Invisível',
    sinopse: 'Uma coletânea de cartas trocadas entre moradores de uma comunidade que foi demolida para dar lugar a um empreendimento. As cartas criam um "lugar" imaginário onde todos ainda podem se encontrar.',
    link: '#',
    download: null,
    category: 'romance',
    destaque: false,
    recomendado: 'Clássicos Modernos'
  },
  // 🔽 8 NOVOS LIVROS (EXTRAS) 🔽
  {
    id: 13,
    title: 'O Canto da Sereia de Pedra',
    author: 'Helena R. Pires',
    cover: '/img/livro-13.png',
    genre: ['Fantasia', 'Mito'],
    age: 'adulto',
    pages: 340,
    year: 2023,
    publisher: 'Pedra & Mar',
    sinopse: 'Uma estátua de sereia no centro da praça começa a cantar todas as noites. A comunidade se reúne para decifrar a mensagem, que parece um aviso sobre a seca que se aproxima.',
    link: '#',
    download: null,
    category: 'ficcao',
    destaque: false,
    recomendado: 'Fantasia'
  },
  {
    id: 14,
    title: 'A Queda do Último Gigante',
    author: 'Felipe O. Nogueira',
    cover: '/img/livro-14.png',
    genre: ['Ficção', 'Aventura'],
    age: 'jovem',
    pages: 288,
    year: 2024,
    publisher: 'Gigantes Editora',
    sinopse: 'Em uma floresta ameaçada por madeireiros, os jovens da comunidade local descobrem que o último gigante (uma árvore milenar) é a chave para salvar o ecossistema. Uma aventura colaborativa para protegê-lo.',
    link: '#',
    download: null,
    category: 'ficcao',
    destaque: false,
    recomendado: 'Aventura'
  },
  {
    id: 15,
    title: 'O Pintor de Nuvens',
    author: 'Isabela M. Tavares',
    cover: '/img/livro-15.png',
    genre: ['Arte', 'Filosofia'],
    age: 'adulto',
    pages: 176,
    year: 2022,
    publisher: 'Céu Aberto',
    sinopse: 'Um pintor anônimo transforma as nuvens em telas, usando tintas naturais feitas pela comunidade. O livro reúne os relatos de quem viu suas obras e as histórias que cada nuvem contava.',
    link: '#',
    download: null,
    category: 'autoajuda',
    destaque: false,
    recomendado: 'Arte e Reflexão'
  },
  {
    id: 16,
    title: 'Os Segredos do Corredor Proibido',
    author: 'Gustavo H. Lemos',
    cover: '/img/livro-16.png',
    genre: ['Mistério', 'Suspense'],
    age: 'jovem',
    pages: 312,
    year: 2025,
    publisher: 'Porta Fechada',
    sinopse: 'Em uma escola comunitária, um corredor é mantido trancado há décadas. Um grupo de estudantes decide investigar e descobre que ele guarda documentos e objetos de ex-alunos que mudaram a história do bairro.',
    link: '#',
    download: null,
    category: 'ficcao',
    destaque: false,
    recomendado: 'Mistério'
  },
  {
    id: 17,
    title: 'Diário de um Caçador de Eclipse',
    author: 'Camila S. Viana',
    cover: '/img/livro-17.png',
    genre: ['Aventura', 'Ciência'],
    age: 'infantil',
    pages: 84,
    year: 2024,
    publisher: 'Sol & Lua',
    sinopse: 'Um diário escrito por crianças de uma aldeia que viajam para diferentes pontos da região para observar eclipses. Cada anotação traz desenhos, lendas e curiosidades compartilhadas pelos mais velhos.',
    link: '#',
    download: null,
    category: 'ficcao',
    destaque: false,
    recomendado: 'Infantil'
  },
  {
    id: 18,
    title: 'A Noite em que as Estrelas Caíram no Rio',
    author: 'Renato D. Campos',
    cover: '/img/livro-18.png',
    genre: ['Romance', 'Realismo Mágico'],
    age: 'adulto',
    pages: 264,
    year: 2023,
    publisher: 'Rio Encantado',
    sinopse: 'Uma noite, as estrelas caem no rio que corta a comunidade. Os moradores precisam pescá-las antes que o amanhecer chegue, e cada estrela concederá um desejo. Mas os desejos têm consequências inesperadas.',
    link: '#',
    download: null,
    category: 'romance',
    destaque: false,
    recomendado: 'Realismo Mágico'
  },
  {
    id: 19,
    title: 'O Livro sem Fim',
    author: 'Coletivo Escritores da Periferia',
    cover: '/img/livro-19.png',
    genre: ['Ficção', 'Experimental'],
    age: 'adulto',
    pages: 420,
    year: 2025,
    publisher: 'Páginas Abertas',
    sinopse: 'Um livro que nunca termina: cada leitor é convidado a escrever o próximo capítulo e passar adiante. Esta edição reúne os 20 primeiros capítulos escritos por moradores de diferentes comunidades do país.',
    link: '#',
    download: null,
    category: 'ficcao',
    destaque: false,
    recomendado: 'Literatura Colaborativa'
  },
  {
    id: 20,
    title: 'Onde os Ventos Dormem',
    author: 'Natália E. Gama',
    cover: '/img/livro-20.png',
    genre: ['Poesia', 'Natureza'],
    age: 'jovem',
    pages: 144,
    year: 2024,
    publisher: 'Brisa Editora',
    sinopse: 'Uma coletânea de haicais e poemas escritos por jovens da comunidade durante oficinas de escrita criativa. Cada poema captura um momento em que o vento parece parar, como se dormisse.',
    link: '#',
    download: null,
    category: 'autoajuda',
    destaque: false,
    recomendado: 'Poesia'
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