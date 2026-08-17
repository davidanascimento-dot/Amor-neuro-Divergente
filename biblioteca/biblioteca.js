/**
 * BIBLIOTECA.JS — Versão com JSON Corrigida
 */

// =============================================
// 1. BANCO DE DADOS (Carregado do JSON)
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
// 2. CARREGAR LIVROS DO JSON
// =============================================
async function carregarLivrosDoJSON() {
    try {
        const response = await fetch('/data/livros.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        booksDatabase = data.livros || [];
        
        // 🔥 DEBUG: Verifica se o texto foi carregado
        console.log(`✅ ${booksDatabase.length} livros carregados do JSON!`);
        booksDatabase.forEach(book => {
            console.log(`📖 ${book.title}: isTexto=${book.isTexto}, textoCompleto=${book.textoCompleto ? '✅ Tem texto' : '❌ SEM TEXTO'}`);
        });
        
        // Renderiza após carregar
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
// 3. FALLBACK (caso o JSON não carregue)
// =============================================
function getLivrosFallback() {
    return [
        // 🔥 LIVRO 1
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
            textoCompleto: `### Prólogo — Quando o mar parou

Naquela noite, o mar ficou em silêncio...`,
            download: null
        },
        // 🔥 LIVRO 2 (COM VÍRGULA!)
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
            textoCompleto: `### Poema 1 — O mapa

No papel rasgado,
a cidade inteira cabe...`,
            download: null
        },
        // 🔥 LIVRO 3
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
            textoCompleto: `### Capítulo 1 — O jardim escondido

O vento carregava cheiro de terra molhada...`,
            download: null
        },
        // 🔥 LIVRO 4
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
            textoCompleto: `### Prólogo — A tinta vermelha

O velho mestre guardava o segredo...`,
            download: null
        },
        // 🔥 LIVRO 5
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
            textoCompleto: `### Prólogo — A primeira lua

O céu escureceu como nunca antes...`,
            download: null
        },
        // 🔥 LIVRO 6
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
            textoCompleto: `### Capítulo 1 — O livro esquecido

O cheiro de papel velho dominava o ambiente...`,
            download: null
        },
        // 🔥 LIVRO 7 (Infantil)
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
            textoCompleto: `### Era uma vez...

Em uma aldeia bem no meio da floresta...`,
            download: null
        },
        // 🔥 LIVRO 8
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
            textoCompleto: `### O primeiro fio

Lá no alto da montanha mais alta...`,
            download: null
        },
        // 🔥 LIVRO 9
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
            textoCompleto: `### O começo da estrada

Não tinha placa. Não tinha nome...`,
            download: null
        },
        // 🔥 LIVRO 10
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
            textoCompleto: `### O vale da névoa

O sol nunca alcançava o fundo do vale...`,
            download: null
        },
        // 🔥 LIVRO 11
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
            textoCompleto: `### O encontro

O relógio estava coberto de poeira...`,
            download: null
        },
        // 🔥 LIVRO 12
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
            textoCompleto: `### Carta I

Querido amigo...`,
            download: null
        }
    ];
}

// =============================================
// 4. FUNÇÕES DE RENDERIZAÇÃO
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

    // Filtro de categoria (se tiver)
    let filtered = [...booksDatabase];

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
                <p style="color:var(--text-muted);">Adicione livros ao banco de dados.</p>
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
// 5. FUNÇÃO PARA ADICIONAR LIVRO
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

// =============================================
// 6. BACKUP E JSON
// =============================================
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
// 7. MODAL DO LIVRO (openBookModal)
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

function closeBookModal() {
    const overlay = document.getElementById('bookModalOverlay');
    if (overlay) {
        overlay.hidden = true;
        document.body.style.overflow = '';
    }
}

// =============================================
// 8. LEITOR DE PDF E TEXTO
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
async function abrirLeitor(bookId) {
    const book = booksDatabase.find(b => b.id == bookId);
    if (!book) {
        console.error('❌ Livro não encontrado!');
        alert('Livro não encontrado.');
        return;
    }

    console.log('📖 Abrindo livro:', book.title);
    console.log('🔍 isTexto:', book.isTexto);
    console.log('🔍 textoCompleto:', book.textoCompleto ? '✅ Tem texto' : '❌ SEM TEXTO');

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
}

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
function fecharLeitor() {
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
}

// =============================================
// 9. EVENTOS DO LEITOR
// =============================================

leitorElements.prevBtn?.addEventListener('click', paginaAnterior);
leitorElements.nextBtn?.addEventListener('click', proximaPagina);
leitorElements.zoomIn?.addEventListener('click', aumentarZoom);
leitorElements.zoomOut?.addEventListener('click', diminuirZoom);
leitorElements.darkModeBtn?.addEventListener('click', alternarModoEscuro);
leitorElements.fullscreenBtn?.addEventListener('click', alternarTelaCheia);
leitorElements.fecharBtn?.addEventListener('click', fecharLeitor);
leitorElements.bg?.addEventListener('click', (e) => {
    if (e.target === leitorElements.bg) fecharLeitor();
});

// Teclas de atalho
document.addEventListener('keydown', (e) => {
    if (leitorElements.overlay?.hidden) return;

    switch (e.key) {
        case 'Escape': fecharLeitor(); break;
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
// 10. EXPOR FUNÇÕES GLOBAIS
// =============================================
window.adicionarLivro = adicionarLivro;
window.baixarJSON = baixarJSON;
window.importarJSON = importarJSON;
window.abrirLeitor = abrirLeitor;
window.fecharLeitor = fecharLeitor;
window.openBookModal = openBookModal;
window.closeBookModal = closeBookModal;

// =============================================
// 11. INICIALIZAÇÃO
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('📚 Inicializando biblioteca...');
    carregarLivrosDoJSON();
});

console.log('📚 Biblioteca com JSON carregada!');
console.log('💡 Comandos:');
console.log('  - adicionarLivro({ title, author, ... })');
console.log('  - baixarJSON()');
console.log('  - importarJSON(file)');
console.log('  - abrirLeitor(id)');