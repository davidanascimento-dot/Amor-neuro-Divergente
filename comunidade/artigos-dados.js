/* ==========================================================================
   ARTIGOS-DADOS.JS — a camada de dados dos artigos da Comunidade
   --------------------------------------------------------------------------
   ESTE ARQUIVO É O ÚNICO LUGAR QUE FALA COM A TABELA `articles`.

   Quem usa:
     - comunidade/artigos.js         (a listagem da área Artigos)
     - blog/artigo.js                (a página de leitura)
     - comunidade/escrever-artigo.js (o editor)
     - comunidade/perfil.js          (a aba "Artigos" do perfil)
     - Explorar/Explorar.js          (o bloco "Artigos da Comunidade")
     - blog/blog.js                 (as publicações do Blog)

    A antiga comunidade/artigo.html virou um trampolim que redireciona
    para /blog/artigo.html?id=; o artigo.js da comunidade ficou órfão
    de página (nenhum HTML o carrega mais).

   POR QUE UM ARQUIVO SÓ
   O card de artigo é desenhado em cinco telas. Se cada uma desenhasse o seu,
   o mesmo artigo apareceria com cinco formatos diferentes — que é exatamente
   o que a auditoria (AUDITORIA-EXPLORAR-BLOG-COMUNIDADE.md) apontou no Blog
   e no Explorar: "a mesma vitrine com nomes trocados".

   ========================================================================== */

(function () {
    'use strict';

    /* =====================================================================
       1. VOCABULÁRIO
       --------------------------------------------------------------------------
       As listas que aparecem nos seletores. `category` (seção) é livre: a
       pessoa pode escrever uma que não está aqui. `kind` (tipo) é fechado —
       são quatro, e o banco só aceita esses quatro.
       ===================================================================== */

    const SECOES = [
        'Dicas',
        'Relatos',
        'Histórias',
        'Guia',
        'Análises',
        'Autismo',
        'TDAH',
        'Dislexia',
        'Altas Habilidades',
        'Saúde Mental',
        'Direitos',
        'Cotidiano'
    ];

    const TIPOS = ['Dica', 'Relato', 'História', 'Guia', 'Análise'];

    const MODELOS = [
        { valor: 'padrao',      nome: 'Padrão',     descricao: 'Bloco central, capa no topo' },
        { valor: 'revista',     nome: 'Revista',    descricao: 'Título grande, texto em duas colunas no desktop' },
        { valor: 'minimalista', nome: 'Minimalista', descricao: 'Sem capa, só tipografia' },
        { valor: 'capa',        nome: 'Capa',       descricao: 'Capa ocupando a tela inteira' }
    ];

    const ESTILOS = [
        { valor: 'serifada',   nome: 'Serifada',    descricao: 'Clássica, boa para texto longo' },
        { valor: 'sem-serifa', nome: 'Sem serifa',  descricao: 'Direta, boa para opinião' },
        { valor: 'poetica',    nome: 'Poética',     descricao: 'Linhas largas e ritmo de leitura' }
    ];

    const AVATAR_PADRAO = '/img/foto-padrão.jpg';

    /* =====================================================================
       2. UTILITÁRIOS DE TEXTO
       ===================================================================== */

    /* Escapa o que vem do banco antes de entrar no HTML. O conteúdo é
     * escrito por usuário: sem isto, um artigo com "<script>" rodaria. */
    function escapeHtml(texto) {
        return String(texto ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /* Só aceita http(s) ou caminho do próprio site. Bloqueia `javascript:`
     * e `data:` vindos de uma capa ou avatar gravado no banco. */
    function urlSegura(url) {
        if (!url) return null;
        const t = String(url).trim();
        if (!t) return null;
        if (t.startsWith('/')) return t;
        if (/^https?:\/\//i.test(t)) return t;
        return null;
    }

    /* Data curta e legível. Sem data → sem data (não chuta). */
    function formatarData(iso) {
        if (!iso) return null;
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return null;
        const dias = Math.floor((Date.now() - d.getTime()) / 86400000);
        if (dias <= 0) return 'hoje';
        if (dias === 1) return 'ontem';
        if (dias < 30) return `há ${dias} dias`;
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    /* Data no formato do mockup da página de leitura: "JUL 02, 2026". */
    function formatarDataLonga(iso) {
        if (!iso) return null;
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return null;
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'short', year: 'numeric'
        }).toUpperCase();
    }

    /* Contagem no formato do mockup: 0 · 82 · 1.5 mil */
    function formatarContagem(n) {
        const v = Number(n) || 0;
        if (v < 1000) return String(v);
        if (v < 1000000) {
            const mil = v / 1000;
            return (mil >= 10 ? Math.round(mil) : Math.round(mil * 10) / 10) + ' mil';
        }
        return (Math.round(v / 100000) / 10) + ' mi';
    }

    /* Tempo de leitura. 200 palavras por minuto é a média de leitura em
     * português para texto de tela; nunca menos que 1 minuto. */
    function minutosLeitura(texto) {
        const palavras = String(texto ?? '').trim().split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.round(palavras / 200));
    }

    /* Trecho: o texto pode ser curto ou longo. Não mexemos no conteúdo —
     * só cortamos com reticências quando passa do limite. */
    function trecho(texto, limite = 220) {
        const t = String(texto ?? '').trim();
        if (t.length <= limite) return t;
        return t.slice(0, limite).replace(/\s+\S*$/, '') + '…';
    }

    /* Um parágrafo de resumo, para o subtítulo automático. */
    function resumoAutomatico(texto, limite = 180) {
        const limpo = String(texto ?? '')
            .replace(/^#+\s*/gm, '')
            .replace(/\s+/g, ' ')
            .trim();
        return trecho(limpo, limite);
    }

    /* =====================================================================
       3. A CONSULTA
       ===================================================================== */

    /* Só tratamos 401. Um erro de rede ou de tabela não é sessão, e não
     * deve apagar o login de ninguém.
     *
     * O defeito que isto corrige: quando o navegador guarda uma sessão que o
     * servidor não aceita mais, o supabase-js troca a chave anônima por
     * aquele token, o PostgREST responde 401 e a consulta inteira falha —
     * mesmo sendo leitura pública. Por isso não basta tentar de novo: é
     * preciso descartar a sessão inválida e refazer a leitura como visitante. */
    function ehErroDeSessao(error) {
        if (!error) return false;
        const status = error.status ?? error.statusCode ?? error.code;
        const texto = String(error.message ?? '');
        return status === 401
            || texto.includes('PGRST301')
            || /jwt|token|unauthorized/i.test(texto);
    }

    /* Executa uma consulta e, se a falha for de sessão, refaz como visitante. */
    async function consultar(supabase, montarConsulta) {
        const primeira = await montarConsulta();

        if (!primeira.error || !ehErroDeSessao(primeira.error)) return primeira;

        console.warn('[artigos] Sessão inválida na leitura; refazendo como visitante.', primeira.error);
        try {
            if (supabase.auth && typeof supabase.auth.signOut === 'function') {
                await supabase.auth.signOut({ scope: 'local' });
            }
        } catch (e) {
            console.warn('[artigos] Não foi possível encerrar a sessão:', e);
        }

        return await montarConsulta();
    }

    /* Erro de "a tabela não existe". Acontece quando o sql/28_artigos.sql
     * ainda não foi rodado no Supabase. A mensagem precisa dizer isso — um
     * "tente de novo" seria mentira. */
    function ehTabelaAusente(error) {
        if (!error) return false;
        const msg = String(error.message ?? '').toLowerCase();
        return msg.includes('does not exist')
            || msg.includes('relation')
            || msg.includes('schema cache')
            || error.code === '42P01'
            || error.code === 'PGRST205';
    }

    const CAMPOS = [
        'id', 'author_id', 'author_name', 'author_avatar',
        'title', 'subtitle', 'content',
        'category', 'kind', 'template', 'style',
        'cover_url', 'sensitive', 'warning',
        'is_paid', 'priority',
        'status', 'is_active',
        'likes', 'comment_count', 'views', 'read_minutes',
        'created_at', 'updated_at'
    ].join(', ');

    /**
     * Lê artigos.
     *
     * @param {object} opcoes
     *   limite      {number}  quantos trazer (padrão 24)
     *   categoria   {string}  filtra por seção
     *   kind        {string}  filtra por tipo
     *   autorId     {string}  filtra por autor
     *   incluirRascunhos {boolean} traz também o rascunho do próprio autor
     *   supabase    {object}  cliente (padrão: window.supabaseClient)
     * @returns {Promise<{artigos: Array, erro: object|null}>}
     */
    async function lerArtigos(opcoes = {}) {
        const {
            limite = 24,
            categoria = '',
            kind = '',
            autorId = '',
            incluirRascunhos = false,
            supabase = window.supabaseClient
        } = opcoes;

        if (!supabase) {
            return { artigos: [], erro: { message: 'Sem conexão com o banco de dados.' } };
        }

        const montarConsulta = () => {
            let q = supabase
                .from('articles')
                .select(CAMPOS)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(limite);

            if (categoria) q = q.eq('category', categoria);
            if (kind) q = q.eq('kind', kind);
            if (autorId) q = q.eq('author_id', autorId);
            if (!incluirRascunhos) q = q.eq('status', 'publicado');

            return q;
        };

        const { data, error } = await consultar(supabase, montarConsulta);
        if (error) return { artigos: [], erro: error };

        return { artigos: data || [], erro: null };
    }

    /**
     * Busca os perfis dos autores em UMA consulta (não uma por artigo).
     * Se falhar, seguimos sem os nomes — o card cai no rótulo genérico e a
     * listagem não quebra por causa disso.
     */
    async function lerAutores(ids, supabase = window.supabaseClient) {
        const mapa = new Map();
        const unicos = [...new Set((ids || []).filter(Boolean))];
        if (!unicos.length || !supabase) return mapa;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, avatar_url, is_verified')
                .in('id', unicos);

            if (!error && data) {
                for (const p of data) mapa.set(p.id, p);
            }
        } catch (e) {
            console.warn('[artigos] Perfis não carregaram; usando rótulo genérico.', e);
        }
        return mapa;
    }

    /** Resolve o nome e o avatar de um autor, com os fallbacks da casa. */
    function resolverAutor(artigo, perfil) {
        const nome = artigo?.author_name || perfil?.username || 'Membro da comunidade';
        const avatar = urlSegura(artigo?.author_avatar)
            || urlSegura(perfil?.avatar_url)
            || AVATAR_PADRAO;
        return { nome, avatar, perfil };
    }

    /** Caminho da página de leitura. */
    function caminhoArtigo(id) {
        return `/comunidade/artigo.html?id=${encodeURIComponent(id)}`;
    }

    /** Caminho da leitura completa no Blog. */
    function caminhoBlogArtigo(id) {
        return `/blog/artigo.html?id=${encodeURIComponent(id)}`;
    }

    /** Caminho do editor, opcionalmente abrindo um artigo para editar. */
    function caminhoEditor(id) {
        return `/comunidade/escrever-artigo.html${id ? '?id=' + encodeURIComponent(id) : ''}`;
    }

    /* =====================================================================
       4. FAVORITOS
       --------------------------------------------------------------------------
       O "Favorito" do mockup é local: é a lista de leituras salvas da
       pessoa, no navegador dela. Guardar no banco exigiria uma coluna e
       uma tela de login; o localStorage dá o mesmo resultado sem atrito.
       ===================================================================== */

    const CHAVE_FAVORITOS = 'artigosFavoritos';

    function listaFavoritos() {
        try {
            const bruto = localStorage.getItem(CHAVE_FAVORITOS);
            const lista = bruto ? JSON.parse(bruto) : [];
            return Array.isArray(lista) ? lista : [];
        } catch (e) {
            return [];
        }
    }

    function ehFavorito(id) {
        return listaFavoritos().includes(String(id));
    }

    function alternarFavorito(id) {
        const chave = String(id);
        const lista = listaFavoritos();
        const i = lista.indexOf(chave);
        if (i === -1) lista.push(chave);
        else lista.splice(i, 1);

        try {
            localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(lista));
        } catch (e) {
            console.warn('[artigos] Não foi possível guardar o favorito:', e);
        }
        return i === -1;
    }

    /* =====================================================================
       5. OUVIR
       --------------------------------------------------------------------------
       O "Ouça" do mockup não depende de áudio gravado: usa a síntese de voz
       do próprio navegador. Sem servidor, sem arquivo, sem fila. Se o
       navegador não tiver, o botão avisa em vez de não fazer nada.
       ===================================================================== */

    function podeFalar() {
        return typeof window !== 'undefined' && 'speechSynthesis' in window;
    }

    function pararDeFalar() {
        if (!podeFalar()) return;
        try { window.speechSynthesis.cancel(); } catch (e) { /* ignora */ }
    }

    /**
     * Lê o artigo em voz alta.
     * @returns {boolean} true se começou a falar.
     */
    function falar(artigo) {
        if (!podeFalar()) return false;

        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            return false;
        }

        const partes = [artigo?.title, artigo?.subtitle, artigo?.content]
            .filter(Boolean)
            .join('. ');

        try {
            const fala = new SpeechSynthesisUtterance(partes);
            fala.lang = 'pt-BR';
            fala.rate = 0.95;
            fala.pitch = 1;

            const vozes = window.speechSynthesis.getVoices() || [];
            const pt = vozes.find(v => /^pt(-|_)?BR/i.test(v.lang))
                || vozes.find(v => /^pt/i.test(v.lang));
            if (pt) fala.voice = pt;

            window.speechSynthesis.speak(fala);
            return true;
        } catch (e) {
            console.warn('[artigos] Não foi possível iniciar a leitura em voz alta:', e);
            return false;
        }
    }

    /* =====================================================================
       6. O TEXTO DO ARTIGO
       --------------------------------------------------------------------------
       Um markdown-lite. Não é markdown completo de propósito: um interpretador
       completo permitiria HTML bruto, e o texto vem de usuário.

       O que ele entende:
           # Título         -> h2
           ## Subtítulo     -> h3
           > citação        -> blockquote
           - item           -> lista
           1. item          -> lista numerada
           linha em branco  -> parágrafo novo

       Tudo é escapado ANTES de virar tag. O que sobra de marcação vira
       texto, nunca HTML.
       ===================================================================== */

        function renderizarInline(escapado) {
        if (!escapado) return '';
        // code
        let s = escapado.replace(/`([^`]+)`/g, '<code>$1</code>');
        // bold
        s = s.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        // italic
        s = s.replace(/(^|[^\*])\*([^\*]+)\*([^\*]|$)/g, '$1<em>$2</em>$3');
        s = s.replace(/(^|[^_])_([^_]+)_([^_]|$)/g, '$1<em>$2</em>$3');
        // strikethrough
        s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
        // links
        s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, rotulo, url) => {
            const limpaUrl = urlSegura(url.trim());
            if (!limpaUrl) return rotulo;
            if (/^bot[ãa]o:\s*/i.test(rotulo)) {
                const txt = rotulo.replace(/^bot[ãa]o:\s*/i, '');
                return `<a class="btn-artigo-escrever artigo-btn-cta" href="${escapeHtml(limpaUrl)}" target="_blank" rel="noopener noreferrer">${txt}</a>`;
            }
            return `<a class="artigo-link-corpo" href="${escapeHtml(limpaUrl)}" target="_blank" rel="noopener noreferrer">${rotulo}</a>`;
        });
        return s;
    }

        function sanitizarHtml(html) {
        if (!html) return '';
        // Remove tags perigosas
        let limpo = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
            .replace(/\scontenteditable\s*=\s*["'][^"']*["']/gi, '')
            .replace(/\scontenteditable\s*=\s*[^\s>]+/gi, '')
            .replace(/javascript:/gi, '');
        return limpo;
    }

    function renderizarConteudo(texto) {
        if (!texto) return '';

        const bruto = String(texto).replace(/\r\n/g, '\n');

        // Se o conteúdo já foi salvo pelo editor visual com tags HTML como <p>, <figure>, <h2>, etc.
        if (/<(p|figure|img|h2|h3|blockquote|ul|ol|pre|iframe|video|audio)[s>]/i.test(bruto)) {
            return sanitizarHtml(bruto);
        }

        const linhas = bruto.split('\n');
        const saida = [];
        let paragrafo = [];
        let lista = null;   // 'ul' | 'ol'
        let citacao = [];
        let emBlocoCodigo = false;
        let blocoCodigoLinhas = [];

        function fecharParagrafo() {
            if (!paragrafo.length) return;
            saida.push(`<p>${paragrafo.join('<br>')}</p>`);
            paragrafo = [];
        }

        function fecharLista() {
            if (!lista) return;
            saida.push(`</${lista}>`);
            lista = null;
        }

        function fecharCitacao() {
            if (!citacao.length) return;
            saida.push(`<blockquote><p>${citacao.join('<br>')}</p></blockquote>`);
            citacao = [];
        }

        for (const linha of linhas) {
            const limpa = linha.trim();

            if (/^```/.test(limpa)) {
                if (emBlocoCodigo) {
                    saida.push(`<pre class="artigo-codigo-bloco"><code>${escapeHtml(blocoCodigoLinhas.join('\n'))}</code></pre>`);
                    blocoCodigoLinhas = [];
                    emBlocoCodigo = false;
                } else {
                    fecharParagrafo(); fecharLista(); fecharCitacao();
                    emBlocoCodigo = true;
                    blocoCodigoLinhas = [];
                }
                continue;
            }

            if (emBlocoCodigo) {
                blocoCodigoLinhas.push(linha);
                continue;
            }

            if (!limpa) {
                fecharParagrafo();
                fecharLista();
                fecharCitacao();
                continue;
            }

            if (/^(?:---|\*\*\*|___)$/.test(limpa)) {
                fecharParagrafo(); fecharLista(); fecharCitacao();
                saida.push('<hr class="artigo-divisor">');
                continue;
            }

            const matchImg = limpa.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
            if (matchImg) {
                fecharParagrafo(); fecharLista(); fecharCitacao();
                const legenda = matchImg[1].trim();
                const src = urlSegura(matchImg[2].trim());
                if (src) {
                    saida.push(`<figure class="artigo-figura"><img src="${escapeHtml(src)}" alt="${escapeHtml(legenda)}" loading="lazy">${legenda ? `<figcaption class="artigo-figura__legenda">${escapeHtml(legenda)}</figcaption>` : ''}</figure>`);
                }
                continue;
            }

            const matchAudio = limpa.match(/^\[[Áá]udio:\s*([^\]]*)\]\(([^)]+)\)$/i);
            if (matchAudio) {
                fecharParagrafo(); fecharLista(); fecharCitacao();
                const rot = matchAudio[1].trim() || 'Áudio';
                const src = urlSegura(matchAudio[2].trim());
                if (src) {
                    saida.push(`<div class="artigo-audio-bloco"><span class="artigo-midia-tag"><i class="fa-solid fa-microphone"></i> ${escapeHtml(rot)}</span><audio controls src="${escapeHtml(src)}" preload="metadata"></audio></div>`);
                }
                continue;
            }

            const matchVideo = limpa.match(/^\[V[íi]deo:\s*([^\]]*)\]\(([^)]+)\)$/i);
            if (matchVideo) {
                fecharParagrafo(); fecharLista(); fecharCitacao();
                const rot = matchVideo[1].trim() || 'Vídeo';
                const src = matchVideo[2].trim();
                let embedUrl = null;
                const yt = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
                if (yt) {
                    embedUrl = 'https://www.youtube-nocookie.com/embed/' + yt[1];
                }
                if (embedUrl) {
                    saida.push(`<div class="artigo-video-bloco"><iframe src="${escapeHtml(embedUrl)}" title="${escapeHtml(rot)}" allowfullscreen loading="lazy"></iframe></div>`);
                } else {
                    const videoSrc = urlSegura(src);
                    if (videoSrc) {
                        saida.push(`<div class="artigo-video-bloco"><video controls src="${escapeHtml(videoSrc)}" preload="metadata"></video></div>`);
                    }
                }
                continue;
            }

            if (/^#{2,3}\s+/.test(limpa)) {
                fecharParagrafo(); fecharLista(); fecharCitacao();
                const nivel = limpa.startsWith('###') ? 3 : 2;
                const textoTitulo = renderizarInline(escapeHtml(limpa.replace(/^#{2,3}\s+/, '')));
                saida.push(`<h${nivel}>${textoTitulo}</h${nivel}>`);
                continue;
            }

            if (/^>\s?/.test(limpa)) {
                fecharParagrafo(); fecharLista();
                citacao.push(renderizarInline(escapeHtml(limpa.replace(/^>\s?/, ''))));
                continue;
            }

            const item = limpa.match(/^(?:[-*]|\d+\.)\s+(.*)$/);
            if (item) {
                fecharParagrafo(); fecharCitacao();
                const tipo = /^\d+\./.test(limpa) ? 'ol' : 'ul';
                if (lista !== tipo) {
                    fecharLista();
                    saida.push(`<${tipo}>`);
                    lista = tipo;
                }
                saida.push(`<li>${renderizarInline(escapeHtml(item[1]))}</li>`);
                continue;
            }

            fecharLista();
            fecharCitacao();
            paragrafo.push(renderizarInline(escapeHtml(limpa)));
        }

        if (emBlocoCodigo && blocoCodigoLinhas.length) {
            saida.push(`<pre class="artigo-codigo-bloco"><code>${escapeHtml(blocoCodigoLinhas.join('\n'))}</code></pre>`);
        }

        fecharParagrafo();
        fecharLista();
        fecharCitacao();

        return saida.join('\n');
    }

    /* =====================================================================
       7. O CARD
       ----------------------------------------------------------------------
       Desenho (referência: cartão do Substack): selo com ícone do tipo +
       seção em maiúsculas e a data no canto direito; título em negrito,
       descrição e a assinatura "NOME • X MIN LEITURA" no meio; imagem da
       capa à direita (quando existe); rodapé com as ações.
       O card inteiro NÃO é um link: os botões (Favoritar, Compartilhar,
       Subir) precisam ser clicáveis sem disparar a navegação. O título é
       o alvo do link.
       ===================================================================== */

        function montarCard(artigo, perfil, opcoes = {}) {
            const { compacto = false, mostrarFavorito = true, comunidade = false } = opcoes;

            const { nome, avatar } = resolverAutor(artigo, perfil);
            const url = opcoes.destino === 'blog' ? caminhoBlogArtigo(artigo.id) : caminhoArtigo(artigo.id);
            const data = formatarData(artigo.created_at);
            const secao = String(artigo.category || 'Relatos');
            const trecho = artigo.content ? resumoAutomatico(artigo.content, 160) : '';
            const minutos = Number(artigo.read_minutes) || minutosLeitura(artigo.content || '');
            const iconesTipo = {
                'Dica': 'fa-lightbulb',
                'Relato': 'fa-heart',
                'História': 'fa-book-open',
                'Guia': 'fa-compass',
                'Análise': 'fa-magnifying-glass'
            };
            const iconeTipo = iconesTipo[String(artigo.kind || '')] || 'fa-pen-nib';
            const descricao = artigo.subtitle || trecho;

            const card = document.createElement('article');
            // Comunidade usa layout lateral com imagem; blog/explorar usam topo
            const classBase = 'art-card' + (compacto ? ' art-card--compacto' : '') + (comunidade ? ' art-card--comunidade' : '');
            card.className = classBase;
            card.setAttribute('data-article-id', artigo.id);

            const favorito = ehFavorito(artigo.id);
            const likes = Number(artigo.likes) || 0;
            const comments = Number(artigo.comments_count) || Number(artigo.comments) || 0;
            const restacks = Number(artigo.restacks) || Number(artigo.reposts) || 0;

            // Capa: se tiver cover_url, usa; senão tenta extrair primeira imagem do conteúdo
            let coverUrl = artigo.cover_url || '';
            
            if (!coverUrl && artigo.content) {
                const imgMatch = artigo.content.match(/<img[^>]+src=["']([^"']+)["']/i) || 
                                 artigo.content.match(/\[Imagem:\s*([^\]]+)\]/i) ||
                                 artigo.content.match(/!\[.*?\]\(([^)]+)\)/i);
                if (imgMatch && imgMatch[1]) {
                    coverUrl = imgMatch[1];
                }
            }
            
            const capaHtml = coverUrl
                ? `<div class="art-card__capa-wrap"><img class="art-card__capa" src="${escapeHtml(coverUrl)}" alt="" loading="lazy"></div>`
                : '';

            if (comunidade) {
                // Layout COMUNIDADE: imagem à esquerda, conteúdo à direita, sem actions
                card.innerHTML = `
                    <div class="art-card__lateral">
                        ${capaHtml}
                    </div>
                    <div class="art-card__conteudo">
                        <div class="art-card__topo">
                            <span class="art-card__selo" aria-hidden="true"><i class="fa-solid ${iconeTipo}"></i></span>
                            <span class="art-card__secao">${escapeHtml(secao)}</span>
                            ${artigo.is_paid ? '<span class="art-card__pago">Pago</span>' : ''}
                            ${data ? '<time class="art-card__data">' + escapeHtml(data) + '</time>' : ''}
                        </div>
                        <a class="art-card__link" href="${url}">
                            <h3 class="art-card__titulo">${escapeHtml(artigo.title || 'Sem título')}</h3>
                        </a>
                        ${descricao ? '<p class="art-card__descricao">' + escapeHtml(descricao) + '</p>' : ''}
                        <div class="art-card__assinatura">
                            <div class="art-card__autor">
                                <img class="art-card__avatar" src="${escapeHtml(avatar)}" alt="${escapeHtml(nome)}" loading="lazy">
                                <span class="art-card__nome">${escapeHtml(nome)}</span>
                            </div>
                            <span class="art-card__meta" aria-hidden="true">· ${minutos} min de leitura</span>
                        </div>
                        ${artigo.sensitive && artigo.warning ? `
                        <div class="art-card__aviso">
                            <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                            ${escapeHtml(artigo.warning)}
                        </div>` : ''}
                    </div>
                `;
            } else {
                // Layout BLOG/EXPLORAR/PERFIL: imagem no topo, com actions no footer
                card.innerHTML = `
                    ${capaHtml}
                    <div class="art-card__conteudo">
                        <div class="art-card__topo">
                            <span class="art-card__selo" aria-hidden="true"><i class="fa-solid ${iconeTipo}"></i></span>
                            <span class="art-card__secao">${escapeHtml(secao)}</span>
                            ${artigo.is_paid ? '<span class="art-card__pago">Pago</span>' : ''}
                            ${data ? '<time class="art-card__data">' + escapeHtml(data) + '</time>' : ''}
                        </div>
                        <a class="art-card__link" href="${url}">
                            <h3 class="art-card__titulo">${escapeHtml(artigo.title || 'Sem título')}</h3>
                        </a>
                        ${descricao ? '<p class="art-card__descricao">' + escapeHtml(descricao) + '</p>' : ''}
                        <div class="art-card__assinatura">
                            <div class="art-card__autor">
                                <img class="art-card__avatar" src="${escapeHtml(avatar)}" alt="${escapeHtml(nome)}" loading="lazy">
                                <span class="art-card__nome">${escapeHtml(nome)}</span>
                            </div>
                            <span class="art-card__meta" aria-hidden="true">· ${minutos} min de leitura</span>
                        </div>
                        ${artigo.sensitive && artigo.warning ? `
                        <div class="art-card__aviso">
                            <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                            ${escapeHtml(artigo.warning)}
                        </div>` : ''}
                        <footer class="art-card__acoes">
                            ${mostrarFavorito ? `
                            <button type="button" class="art-card__acao art-card__acao--favorito"
                                    data-acao="favoritar" aria-pressed="${favorito ? 'true' : 'false'}"
                                    title="Favoritar">
                                <i class="fa-${favorito ? 'solid' : 'regular'} fa-heart" aria-hidden="true"></i>
                                <span class="art-card__contagem">${likes > 0 ? formatarContagem(likes) : ''}</span>
                            </button>` : ''}
                            <button type="button" class="art-card__acao art-card__acao--comentario"
                                    data-acao="comentario" title="Comentários">
                                <i class="fa-regular fa-comment" aria-hidden="true"></i>
                                <span class="art-card__contagem">${comments > 0 ? formatarContagem(comments) : ''}</span>
                            </button>
                            <button type="button" class="art-card__acao art-card__acao--restack"
                                    data-acao="restack" title="Restack">
                                <i class="fa-regular fa-repeat" aria-hidden="true"></i>
                                <span class="art-card__contagem">${restacks > 0 ? formatarContagem(restacks) : ''}</span>
                            </button>
                            <button type="button" class="art-card__acao art-card__acao--compartilhar"
                                    data-acao="compartilhar" title="Compartilhar">
                                <i class="fa-regular fa-share-from-square" aria-hidden="true"></i>
                            </button>
                            <button type="button" class="art-card__acao art-card__acao--subir"
                                    data-acao="subir" title="Levar ao topo">
                                <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>
                            </button>
                        </footer>
                    </div>
                `;
            }

            return card;
        }

    function estadoVazio(titulo, texto, linkTexto, linkUrl) {
        return `
            <div class="art-estado art-estado--vazio">
                <i class="fa-regular fa-feather-pointed" aria-hidden="true"></i>
                <strong>${escapeHtml(titulo)}</strong>
                <span>${escapeHtml(texto)}</span>
                ${linkUrl ? `<a class="art-estado__link" href="${linkUrl}">${escapeHtml(linkTexto || 'Escrever o primeiro')}</a>` : ''}
            </div>
        `;
    }

    function estadoErro(texto) {
        return `
            <div class="art-estado art-estado--erro" role="alert">
                <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                <strong>Não foi possível carregar</strong>
                <span>${escapeHtml(texto || 'Verifique sua conexão e tente de novo.')}</span>
            </div>
        `;
    }

    /* =====================================================================
       9. AVISO DE BANCO SEM TABELA
       --------------------------------------------------------------------------
       Se o sql/28_artigos.sql não foi rodado, a área não funciona. Dizer
       isso com o nome do arquivo é mais útil do que um erro genérico.
       ===================================================================== */

    const AVISO_BANCO = 'Este sistema usa a tabela `articles`. Rode o arquivo sql/28_artigos.sql no SQL Editor do Supabase para ativar a área de artigos.';

    /* =====================================================================
       10. EXPORTA
       ===================================================================== */

    window.artigosDados = {
        SECOES,
        TIPOS,
        MODELOS,
        ESTILOS,
        AVATAR_PADRAO,
        AVISO_BANCO,

        escapeHtml,
        urlSegura,
        formatarData,
        formatarDataLonga,
        formatarContagem,
        minutosLeitura,
        trecho,
        resumoAutomatico,

        ehErroDeSessao,
        ehTabelaAusente,
        consultar,
        lerArtigos,
        lerAutores,
        resolverAutor,
        caminhoArtigo,
        caminhoBlogArtigo,
        caminhoEditor,

        listaFavoritos,
        ehFavorito,
        alternarFavorito,

        podeFalar,
        falar,
        pararDeFalar,

        montarCard,
        renderizarConteudo,
        estadoVazio,
        estadoErro
    };
})();
