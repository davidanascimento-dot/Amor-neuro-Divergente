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
     - blog/blog.js                  (as publicações do Blog)

   A antiga comunidade/artigo.html virou um trampolim que redireciona
   para /blog/artigo.html?id=; por isso o destino padrão da leitura é
   o Blog (ver `caminhoLeitura`).

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
       ---------------------------------------------------------------------
       As listas que aparecem nos seletores. `category` (seção) é livre: a
       pessoa pode escrever uma que não está aqui. `kind` (tipo) é fechado —
       são CINCO, e o banco só aceita esses cinco. (Correção: o comentário
       antigo dizia "quatro".)
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
        { valor: 'padrao',      nome: 'Padrão',      descricao: 'Bloco central, capa no topo' },
        { valor: 'revista',     nome: 'Revista',     descricao: 'Título grande, texto em duas colunas no desktop' },
        { valor: 'minimalista', nome: 'Minimalista', descricao: 'Sem capa, só tipografia' },
        { valor: 'capa',        nome: 'Capa',        descricao: 'Capa ocupando a tela inteira' }
    ];

    const ESTILOS = [
        { valor: 'serifada',   nome: 'Serifada',   descricao: 'Clássica, boa para texto longo' },
        { valor: 'sem-serifa', nome: 'Sem serifa', descricao: 'Direta, boa para opinião' },
        { valor: 'poetica',    nome: 'Poética',    descricao: 'Linhas largas e ritmo de leitura' }
    ];

    /* Correção: o "ã" na URL quebra em servidores estáticos que não
       normalizam Unicode. `encodeURI` mantém o nome legível e seguro. */
    const AVATAR_PADRAO = encodeURI('/img/foto-padrão.jpg');

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
     * e `data:` vindos de uma capa ou avatar gravado no banco.
     * Correção: também barra `vbscript:`, `file:` e variantes ofuscadas
     * com tabulação/quebra de linha entre as letras do esquema. */
    function urlSegura(url) {
        if (!url) return null;
        const t = String(url).replace(/[\u0000-\u001F\u007F\s]+/g, '').trim();
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

    /* Remove tags HTML antes de contar palavras, para o tempo de leitura
     * não inflar com tags. */
    function textoPuro(html) {
        return String(html ?? '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/&[a-z#0-9]+;/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /* Tempo de leitura. 200 palavras por minuto é a média de leitura em
     * português para texto de tela; nunca menos que 1 minuto. */
    function minutosLeitura(texto) {
        const palavras = textoPuro(texto).split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.round(palavras / 200));
    }

    /* Trecho: o texto pode ser curto ou longo. Não mexemos no conteúdo —
     * só cortamos com reticências quando passa do limite.
     * Correção: o corte antigo (`\s+\S*$`) comia a última palavra inteira
     * e podia deixar pontuação órfã. Agora corta no último espaço. */
    function trecho(texto, limite = 220) {
        const t = textoPuro(texto);
        if (t.length <= limite) return t;
        const cortado = t.slice(0, limite);
        const ultimoEspaco = cortado.lastIndexOf(' ');
        return (ultimoEspaco > limite * 0.6 ? cortado.slice(0, ultimoEspaco) : cortado) + '…';
    }

    /* Um parágrafo de resumo, para o subtítulo automático. */
    function resumoAutomatico(texto, limite = 180) {
        const limpo = String(texto ?? '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/^#+\s*/gm, '')
            .replace(/\s+/g, ' ')
            .trim();
        return trecho(limpo, limite);
    }

    /* =====================================================================
       3. A CONSULTA
       ===================================================================== */

    /* Só tratamos 401 ou o código específico de JWT inválido do PostgREST.
     * Correção: a versão antiga casava qualquer mensagem com "token" — o que
     * pegava erros de consulta que NÃO eram de sessão e deslogava à toa. */
    function ehErroDeSessao(error) {
        if (!error) return false;
        const status = error.status ?? error.statusCode;
        const codigo = String(error.code ?? '');
        return status === 401 || codigo === 'PGRST301';
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

    /* Correção: `comment_count` é o nome real da coluna (o card lia
       `comments_count` e `comments`, que nunca existiam → sempre 0).
       `restacks` e `reposts` também não estavam em CAMPOS → sempre 0.
       Aqui pedimos explicitamente as colunas que o card usa. */
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

    /**
     * Caminho da leitura.
     * Correção: o comentário do arquivo diz que /comunidade/artigo.html virou
     * trampolim para /blog/artigo.html. Então o padrão é o Blog, e o parâmetro
     * `destino` permite voltar à comunidade se algum dia ela voltar a ter página
     * própria.
     */
    function caminhoLeitura(id, destino) {
        const base = destino === 'comunidade'
            ? '/comunidade/artigo.html'
            : '/blog/artigo.html';
        return `${base}?id=${encodeURIComponent(id)}`;
    }

    /** Atalhos mantidos para quem já chama os nomes antigos. */
    function caminhoArtigo(id) { return caminhoLeitura(id, 'comunidade'); }
    function caminhoBlogArtigo(id) { return caminhoLeitura(id, 'blog'); }

    /** Caminho do editor, opcionalmente abrindo um artigo para editar. */
    function caminhoEditor(id) {
        return `/comunidade/escrever-artigo.html${id ? '?id=' + encodeURIComponent(id) : ''}`;
    }

    /* =====================================================================
       4. FAVORITOS
       ---------------------------------------------------------------------
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
       ---------------------------------------------------------------------
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
     * Correção: a versão antiga cancelava QUALQUER fala em andamento e
     * retornava false — clicar em "ouvir" de outro artigo não tocava o novo.
     * Agora cancela o anterior e começa o novo.
     * @returns {boolean} true se começou a falar.
     */
    function falar(artigo) {
        if (!podeFalar()) return false;

        // Sempre cancela o que estava tocando para tocar o artigo pedido.
        try { window.speechSynthesis.cancel(); } catch (e) { /* ignora */ }

        const partes = [artigo?.title, artigo?.subtitle, textoPuro(artigo?.content)]
            .filter(Boolean)
            .join('. ');

        if (!partes) return false;

        try {
            const fala = new SpeechSynthesisUtterance(partes);
            fala.lang = 'pt-BR';
            fala.rate = 0.95;
            fala.pitch = 1;

            const escolherVoz = () => {
                const vozes = window.speechSynthesis.getVoices() || [];
                return vozes.find(v => /^pt(-|_)?BR/i.test(v.lang))
                    || vozes.find(v => /^pt/i.test(v.lang))
                    || null;
            };

            const voz = escolherVoz();
            if (voz) fala.voice = voz;

            // No Chrome, getVoices() volta vazio na primeira chamada.
            // Se ainda não há voz pt-BR, espera o evento e tenta de novo.
            if (!voz && 'onvoiceschanged' in window.speechSynthesis) {
                const tentar = () => {
                    const v2 = escolherVoz();
                    if (v2) fala.voice = v2;
                };
                window.speechSynthesis.addEventListener('voiceschanged', tentar, { once: true });
            }

            window.speechSynthesis.speak(fala);
            return true;
        } catch (e) {
            console.warn('[artigos] Não foi possível iniciar a leitura em voz alta:', e);
            return false;
        }
    }

    /* =====================================================================
       6. O TEXTO DO ARTIGO
       ---------------------------------------------------------------------
       Um markdown-lite. Não é markdown completo de propósito: um interpretador
       completo permitiria HTML bruto, e o texto vem de usuário.

       O que ele entende:
           # Título         -> h2
           ## Subtítulo     -> h3
           > citação        -> blockquote
           - item           -> lista
           1. item          -> lista numerada
           linha em branco  -> parágrafo novo
           ```              -> bloco de código

       Tudo é escapado ANTES de virar tag. O que sobra de marcação vira
       texto, nunca HTML.
       ===================================================================== */

    function renderizarInline(escapado) {
        if (!escapado) return '';
        // code
        let s = escapado.replace(/`([^`]+)`/g, '<code>$1</code>');
        // bold
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        // italic
        s = s.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, '$1<em>$2</em>$3');
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

    /**
     * Sanitiza HTML vindo do editor visual.
     * Correção: a versão antiga só removia <script>, <style> e on*. Ficavam
     * abertos <iframe srcdoc>, <svg onload>, <a href="javascript:...">,
     * <object>, <embed>, <form>, <meta http-equiv="refresh">. Agora usamos
     * allowlist de tags e atributos — o que não está na lista sai.
     */
    const TAGS_PERMITIDAS = new Set([
        'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'mark',
        'blockquote', 'pre', 'code', 'ul', 'ol', 'li',
        'a', 'img', 'figure', 'figcaption',
        'audio', 'video', 'source', 'iframe',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span'
    ]);

    const ATRIBUTOS_PERMITIDOS = new Set([
        'class', 'href', 'src', 'alt', 'title', 'width', 'height',
        'loading', 'controls', 'preload', 'allowfullscreen', 'frameborder',
        'target', 'rel', 'colspan', 'rowspan', 'role', 'aria-label',
        'aria-hidden', 'aria-pressed', 'type', 'start', 'reversed'
    ]);

    function sanitizarHtml(html) {
        if (!html) return '';
        const doc = new DOMParser().parseFromString(
            '<body>' + String(html) + '</body>',
            'text/html'
        );
        const body = doc.body;

        const limpar = (node) => {
            for (const filho of Array.from(node.children)) {
                const tag = filho.tagName.toLowerCase();

                if (!TAGS_PERMITIDAS.has(tag)) {
                    // Remove a tag, mantém o texto dos filhos.
                    while (filho.firstChild) filho.parentNode.insertBefore(filho.firstChild, filho);
                    filho.remove();
                    continue;
                }

                // Remove todos os atributos fora da allowlist.
                for (const attr of Array.from(filho.attributes)) {
                    if (!ATRIBUTOS_PERMITIDOS.has(attr.name.toLowerCase())) {
                        filho.removeAttribute(attr.name);
                    }
                }

                // Atributos de URL: só http(s) e caminho local.
                for (const nome of ['href', 'src']) {
                    if (filho.hasAttribute(nome)) {
                        const v = filho.getAttribute(nome);
                        if (!urlSegura(v)) filho.removeAttribute(nome);
                    }
                }

                // iframe: só youtube-nocookie, para não virar player arbitrário.
                if (tag === 'iframe') {
                    const src = filho.getAttribute('src') || '';
                    if (!/^https:\/\/www\.youtube-nocookie\.com\//i.test(src)) {
                        filho.remove();
                        continue;
                    }
                }

                limpar(filho);
            }
        };

        limpar(body);
        return body.innerHTML;
    }

    function renderizarConteudo(texto) {
        if (!texto) return '';

        const bruto = String(texto).replace(/\r\n/g, '\n');

        // Detecta HTML do editor visual. Correção: `[\s>]` em vez de `[s>]`,
        // que não casava `<p class="...">` e caía no parser markdown.
        if (/<(p|figure|img|h2|h3|h4|blockquote|ul|ol|pre|iframe|video|audio)[\s>]/i.test(bruto)) {
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
       ---------------------------------------------------------------------
       Desenho (referência: cartão do Substack): selo com ícone do tipo +
       seção em maiúsculas e a data no canto direito; título em negrito,
       descrição e a assinatura "NOME • X MIN LEITURA" no meio; imagem da
       capa à direita (quando existe); rodapé com as ações.
       O card inteiro NÃO é um link: os botões (Favoritar, Compartilhar,
       Subir) precisam ser clicáveis sem disparar a navegação. O título é
       o alvo do link.
       ===================================================================== */

    function extrairPrimeiraImagem(conteudo) {
        if (!conteudo) return null;
        // Aceita só `![alt](url)` — o antigo `[Imagem: x]` era falso positivo:
        // capturava o texto do colchete como se fosse URL, mas esse formato
        // nem existe no parser.
        const m = String(conteudo).match(/!\[[^\]]*\]\(([^)\s]+)\)/);
        return m ? urlSegura(m[1]) : null;
    }

    function montarCard(artigo, perfil, opcoes = {}) {
        const { compacto = false, mostrarFavorito = true, comunidade = false } = opcoes;

        const { nome, avatar } = resolverAutor(artigo, perfil);

        // Correção: o destino padrão agora é o Blog, porque a página
        // /comunidade/artigo.html é só um trampolim. Quem quiser a URL
        // antiga passa `destino: 'comunidade'`.
        const url = caminhoLeitura(artigo.id, opcoes.destino === 'comunidade' ? 'comunidade' : 'blog');

        const data = formatarData(artigo.created_at);
        const secao = String(artigo.category || 'Relatos');
        const resumo = artigo.content ? resumoAutomatico(artigo.content, 160) : '';
        const minutos = Number(artigo.read_minutes) || minutosLeitura(artigo.content || '');
        const iconesTipo = {
            'Dica': 'fa-lightbulb',
            'Relato': 'fa-heart',
            'História': 'fa-book-open',
            'Guia': 'fa-compass',
            'Análise': 'fa-magnifying-glass'
        };
        const iconeTipo = iconesTipo[String(artigo.kind || '')] || 'fa-pen-nib';
        const descricao = artigo.subtitle || resumo;

        const card = document.createElement('article');
        const classBase = 'art-card'
            + (compacto ? ' art-card--compacto' : '')
            + (comunidade ? ' art-card--comunidade' : '');
        card.className = classBase;
        card.setAttribute('data-article-id', artigo.id);

        const favorito = ehFavorito(artigo.id);
        const likes = Number(artigo.likes) || 0;
        // Correção: `comment_count` é o nome real (não `comments_count`).
        const comments = Number(artigo.comment_count) || 0;
        // `restacks`/`reposts` não existem no schema atual; se um dia
        // existirem, o card já lê.
        const restacks = Number(artigo.restacks) || Number(artigo.reposts) || 0;

        // Capa: cover_url primeiro; senão, primeira imagem do conteúdo.
        const coverUrl = urlSegura(artigo.cover_url) || extrairPrimeiraImagem(artigo.content);

        const capaHtml = coverUrl
            ? `<div class="art-card__capa-wrap"><img class="art-card__capa" src="${escapeHtml(coverUrl)}" alt="" loading="lazy"></div>`
            : '';

        /* O rodapé de ações é o mesmo nos dois layouts — o CSS usa
           `.art-card__rodape` (definido em artigos.css). */
        const acoesHtml = `
            <footer class="art-card__rodape">
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
                    <i class="fa-solid fa-retweet" aria-hidden="true"></i>
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
        `;

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
                    <a class="art-card__link" href="${escapeHtml(url)}">
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
                    <a class="art-card__link" href="${escapeHtml(url)}">
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
                    ${acoesHtml}
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
                ${linkUrl ? `<a class="art-estado__link" href="${escapeHtml(urlSegura(linkUrl) || '#')}">${escapeHtml(linkTexto || 'Escrever o primeiro')}</a>` : ''}
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
       ---------------------------------------------------------------------
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
        textoPuro,

        ehErroDeSessao,
        ehTabelaAusente,
        consultar,
        lerArtigos,
        lerAutores,
        resolverAutor,
        caminhoLeitura,
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