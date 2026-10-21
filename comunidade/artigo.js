/* ==========================================================================
   ARTIGO.JS — a página de leitura de um artigo
   --------------------------------------------------------------------------
   O que ela faz:
     - lê o artigo pelo id da URL e desenha;
     - conta a leitura;
     - deixa curtir, favoritar, ouvir e compartilhar;
     - abre a conversa em volta do texto.

   A leitura do banco e a montagem do texto usam /comunidade/artigos-dados.js,
   o mesmo módulo da listagem — é o que garante que a página de leitura e a
   pré-visualização do editor mostrem a mesma coisa.
   ========================================================================== */

(function () {
    'use strict';

    const D = window.artigosDados;
    if (!D) {
        console.error('[artigo] O módulo artigos-dados.js não carregou.');
        return;
    }

    const EL = {
        carregando:  document.getElementById('artigoCarregando'),
        estado:      document.getElementById('artigoEstado'),
        cartao:      document.getElementById('artigoCartao'),
        capa:        document.getElementById('artigoCapa'),
        secao:       document.getElementById('artigoSecao'),
        titulo:      document.getElementById('artigoTitulo'),
        subtitulo:   document.getElementById('artigoSubtitulo'),
        aviso:       document.getElementById('artigoAviso'),
        avisoTexto:  document.getElementById('artigoAvisoTexto'),
        autorLink:   document.getElementById('artigoAutorLink'),
        avatar:      document.getElementById('artigoAvatar'),
        autorNome:   document.getElementById('artigoAutorNome'),
        autorHandle: document.getElementById('artigoAutorHandle'),
        data:        document.getElementById('artigoData'),
        tempo:       document.getElementById('artigoTempo'),
        corpo:       document.getElementById('artigoCorpo'),
        lerNoBlogBtn: document.getElementById('artigoLerNoBlogBtn'),
        lerNoBlogTopoBtn: document.getElementById('artigoLerNoBlogTopoBtn'),
        topoAcoes:   document.getElementById('artigoTopoAcoes'),

        gostarBtn:   document.getElementById('artigoGostarBtn'),
        gostarCont:  document.getElementById('artigoGostarContagem'),
        favoritoBtn: document.getElementById('artigoFavoritoBtn'),
        ouvirBtn:     document.getElementById('artigoOuvirBtn'),
        compartilharBtn: document.getElementById('artigoCompartilharBtn'),
        visualizacoes: document.getElementById('artigoVisualizacoes'),

        conversa:    document.getElementById('artigoConversa'),
        conversaContagem: document.getElementById('artigoComentariosContagem'),
        comentarioForm: document.getElementById('artigoComentarioForm'),
        comentarioInput: document.getElementById('artigoComentarioInput'),
        comentarioLogin: document.getElementById('artigoComentarioLogin'),
        comentarioLoginLink: document.getElementById('artigoComentarioLoginLink'),
        comentarios: document.getElementById('artigoComentarios')
    };

    const ESTADO = {
        artigo: null,
        perfil: null,
        usuario: null,
        curtido: false
    };

    const idArtigo = new URLSearchParams(window.location.search).get('id');

    /* =====================================================================
       1. SESSÃO
       ===================================================================== */

    async function lerSessao() {
        const sb = window.supabaseClient;
        if (!sb || !sb.auth) return null;
        try {
            const { data, error } = await sb.auth.getSession();
            if (error) return null;
            return data?.session?.user || null;
        } catch (e) {
            return null;
        }
    }

    /* =====================================================================
       2. DESENHAR O ARTIGO
       ===================================================================== */

    function desenhar() {
        const a = ESTADO.artigo;
        if (!a) return;

        document.title = `${a.title} — Amor NeuroDivergente`;

        const { nome, avatar, perfil } = D.resolverAutor(a, ESTADO.perfil);
        ESTADO.perfil = perfil;

        EL.cartao.className = 'artigo-cartao' + (a.template ? ` artigo-cartao--${a.template}` : '');
        EL.cartao.hidden = false;

        // Capa
        const capa = D.urlSegura(a.cover_url);
        if (capa) {
            EL.capa.src = capa;
            EL.capa.alt = `Capa de "${a.title}"`;
            EL.capa.hidden = false;
        } else {
            EL.capa.hidden = true;
        }

        EL.secao.textContent = a.category || 'Relatos';
        EL.titulo.textContent = a.title || 'Sem título';

        if (a.subtitle) {
            EL.subtitulo.textContent = a.subtitle;
            EL.subtitulo.hidden = false;
        } else {
            EL.subtitulo.hidden = true;
        }

        if (a.sensitive) {
            EL.aviso.hidden = false;
            EL.avisoTexto.textContent = a.warning
                || 'Este texto aborda temas sensíveis. Leia no seu tempo.';
        } else {
            EL.aviso.hidden = true;
        }

        // Autor
        EL.autorNome.textContent = nome;
        EL.autorHandle.textContent = '@' + String(nome).toLowerCase().replace(/\s+/g, '');
        EL.avatar.innerHTML = `<img src="${D.escapeHtml(avatar)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'art-card__inicial',textContent:'${D.escapeHtml(nome.charAt(0).toUpperCase())}'}))">`;

        if (a.author_id) {
            EL.autorLink.href = `/comunidade/perfil.html?id=${encodeURIComponent(a.author_id)}`;
        } else {
            EL.autorLink.removeAttribute('href');
        }

        EL.data.textContent = D.formatarDataLonga(a.created_at) || '';
        EL.tempo.textContent = `${Number(a.read_minutes) || D.minutosLeitura(a.content)} MIN LEITURA`;

        // O corpo
        EL.corpo.className = 'artigo-corpo' + (a.style ? ` artigo-corpo--${a.style}` : '');
        EL.corpo.innerHTML = D.renderizarConteudo(a.content);

        // Contadores
        EL.gostarCont.textContent = D.formatarContagem(a.likes);
        EL.visualizacoes.querySelector('span').textContent = D.formatarContagem(a.views);

        // Favorito (local)
        const favorito = D.ehFavorito(a.id);
        EL.favoritoBtn.classList.toggle('is-ativo', favorito);
        EL.favoritoBtn.setAttribute('aria-pressed', favorito ? 'true' : 'false');
        const iconeFav = EL.favoritoBtn.querySelector('i');
        if (iconeFav) iconeFav.className = `fa-${favorito ? 'solid' : 'regular'} fa-bookmark`;

        // Ações do autor: só aparecem para quem escreveu.
        desenharAcoesDoAutor();
        // Conectar links para a área do Blog
        const urlBlog = D.caminhoBlogArtigo ? D.caminhoBlogArtigo(a.id) : ('/blog/artigo.html?id=' + encodeURIComponent(a.id));
        if (EL.lerNoBlogBtn) EL.lerNoBlogBtn.href = urlBlog;
        if (EL.lerNoBlogTopoBtn) EL.lerNoBlogTopoBtn.href = urlBlog;

        // A conversa aparece junto com o artigo.
        // Comentários desativados na comunidade
    }

    function desenharAcoesDoAutor() {
        if (!ESTADO.usuario || !ESTADO.artigo) { EL.topoAcoes.innerHTML = ''; return; }
        if (ESTADO.usuario.id !== ESTADO.artigo.author_id) { EL.topoAcoes.innerHTML = ''; return; }

        EL.topoAcoes.innerHTML = `
            <a class="artigo-acao" href="${D.caminhoEditor(ESTADO.artigo.id)}">
                <i class="fa-solid fa-pen" aria-hidden="true"></i> Editar
            </a>
            <button type="button" class="artigo-acao" id="artigoExcluirBtn">
                <i class="fa-regular fa-trash-can" aria-hidden="true"></i> Excluir
            </button>
        `;

        const excluir = document.getElementById('artigoExcluirBtn');
        if (excluir) excluir.addEventListener('click', excluirArtigo);
    }

    async function excluirArtigo() {
        if (!ESTADO.artigo) return;
        if (!confirm('Excluir este artigo? Ele some da área Artigos e do Blog. Não dá para desfazer.')) return;

        const sb = window.supabaseClient;
        const { error } = await sb.from('articles').delete().eq('id', ESTADO.artigo.id).eq('author_id', ESTADO.usuario.id);

        if (error) {
            avisar('Não foi possível excluir o artigo.');
            return;
        }

        window.location.href = '/comunidade/artigos.html';
    }

    /* =====================================================================
       3. A LEITURA
       ===================================================================== */

    async function carregar() {
        if (!idArtigo) {
            mostrarErro('Este endereço não aponta para um artigo. Abra a lista para escolher um.');
            return;
        }

        const sb = window.supabaseClient;
        if (!sb) {
            mostrarErro('Não foi possível conectar ao banco de dados.');
            return;
        }

        /* Busca direta pelo id. A listagem (lerArtigos) não serve aqui:
         * ela ordena por data e filtra só o que está publicado, e um
         * rascunho do próprio autor precisa abrir também. */
        // Timeout de segurança: se o banco não responder em 10s, esconde o
        // carregando para a pagina não ficar travada para sempre.
        const travou = setTimeout(() => {
            if (EL.carregando) EL.carregando.hidden = true;
            console.warn('[artigo] Consulta demorou demais; carregando forçado a sumir.');
        }, 10000);

        try {
            const { data, error } = await D.consultar(sb, () => sb
                .from('articles')
                .select('*')
                .eq('id', idArtigo)
                .eq('is_active', true)
                .maybeSingle());

            clearTimeout(travou);

            if (error) {
                if (D.ehTabelaAusente(error)) {
                    mostrarErro(D.AVISO_BANCO);
                    return;
                }
                mostrarErro(D.ehErroDeSessao(error)
                    ? 'Sua sessão expirou. Entre novamente para ler este artigo.'
                    : 'Não foi possível carregar este artigo agora.');
                return;
            }

            if (!data) {
                mostrarErro('Este artigo não existe mais, ou nunca foi publicado.');
                return;
            }

            ESTADO.artigo = data;

            // O perfil do autor, para o avatar e o @username.
            if (data.author_id) {
                const perfis = await D.lerAutores([data.author_id]);
                ESTADO.perfil = perfis.get(data.author_id) || null;
            }

            if (EL.carregando) EL.carregando.hidden = true;
            if (EL.estado) EL.estado.innerHTML = '';

            desenhar();

            contarLeitura();
            carregarCurtida();
            // Sem comentários
        } catch (e) {
            clearTimeout(travou);
            console.error('[artigo] Erro inesperado ao carregar:', e);
            mostrarErro('Não foi possível carregar este artigo agora. Verifique sua conexão e tente de novo.');
        }
    }

    async function contarLeitura() {
        const sb = window.supabaseClient;
        if (!sb) return;

        try {
            const { data, error } = await sb.rpc('increment_article_views', { p_article_id: idArtigo });
            if (!error && typeof data === 'number') {
                ESTADO.artigo.views = data;
                if (EL.visualizacoes) EL.visualizacoes.querySelector('span').textContent = D.formatarContagem(data);
            }
        } catch (e) {
            // O contador é acessório. Se a função não existir, o artigo
            // continua funcionando — só não conta a leitura.
            console.warn('[artigo] Não foi possível contar a leitura:', e);
        }
    }

    /* =====================================================================
       4. CURTIR
       ===================================================================== */

    async function carregarCurtida() {
        if (!ESTADO.usuario) return;
        const sb = window.supabaseClient;

        const { data } = await sb
            .from('article_likes')
            .select('id')
            .eq('article_id', idArtigo)
            .eq('user_id', ESTADO.usuario.id)
            .maybeSingle();

        ESTADO.curtido = !!data;
        atualizarBotaoGostar();
    }

    function atualizarBotaoGostar() {
        if (!EL.gostarBtn) return;
        const icone = EL.gostarBtn.querySelector('i');
        if (icone) icone.className = ESTADO.curtido ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        EL.gostarBtn.classList.toggle('is-ativo', ESTADO.curtido);
    }

    async function alternarCurtida() {
        if (!ESTADO.usuario) {
            avisar('Entre para curtir este artigo.');
            return;
        }

        const sb = window.supabaseClient;
        const artigo = ESTADO.artigo;

        try {
            if (ESTADO.curtido) {
                const { error } = await sb
                    .from('article_likes')
                    .delete()
                    .eq('article_id', artigo.id)
                    .eq('user_id', ESTADO.usuario.id);
                if (error) throw error;
            } else {
                const { error } = await sb
                    .from('article_likes')
                    .insert({ article_id: artigo.id, user_id: ESTADO.usuario.id });
                if (error) throw error;
            }
        } catch (e) {
            console.error('[artigo] Erro ao curtir:', e);
            avisar('Não foi possível registrar sua curtida.');
            return;
        }

        ESTADO.curtido = !ESTADO.curtido;

        // O contador é refeito a partir da tabela de curtidas: assim ele
        // bate com a verdade, mesmo se duas pessoas curtirem ao mesmo tempo.
        const { count } = await sb
            .from('article_likes')
            .select('id', { count: 'exact', head: true })
            .eq('article_id', artigo.id);

        const total = count || 0;
        await sb.from('articles').update({ likes: total }).eq('id', artigo.id);

        ESTADO.artigo.likes = total;
        EL.gostarCont.textContent = D.formatarContagem(total);
        atualizarBotaoGostar();
    }

    /* =====================================================================
       5. A CONVERSA
       ===================================================================== */

    async function carregarComentarios() {
        const sb = window.supabaseClient;
        if (!sb) return;

        const { data, error } = await D.consultar(sb, () => sb
            .from('article_comments')
            .select('id, author_id, author_name, author_avatar, content, created_at')
            .eq('article_id', idArtigo)
            .eq('is_active', true)
            .eq('status', 'approved')
            .order('created_at', { ascending: true }));

        if (error) {
            EL.comentarios.innerHTML = D.estadoErro('Não foi possível carregar a conversa.');
            return;
        }

        const comentarios = data || [];
        EL.conversaContagem.textContent = comentarios.length
            ? `(${comentarios.length})`
            : '';

        if (!comentarios.length) {
            EL.comentarios.innerHTML = D.estadoVazio(
                'Ninguém comentou ainda',
                'Se esse texto falou com você, conta o que ficou.'
            );
            return;
        }

        EL.comentarios.innerHTML = comentarios.map(comentario => {
            const nome = comentario.author_name || 'Membro da comunidade';
            const inicial = nome.charAt(0).toUpperCase();
            const avatar = D.urlSegura(comentario.author_avatar) || D.AVATAR_PADRAO;
            const data = D.formatarData(comentario.created_at);

            return `
                <div class="artigo-comentario">
                    <span class="artigo-comentario__avatar" aria-hidden="true">
                        <img src="${D.escapeHtml(avatar)}" alt="" loading="lazy"
                             onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'art-card__inicial',textContent:'${D.escapeHtml(inicial)}'}))">
                    </span>
                    <div>
                        <div class="artigo-comentario__cabecalho">
                            <span class="artigo-comentario__nome">${D.escapeHtml(nome)}</span>
                            ${data ? `<span class="artigo-comentario__data">${D.escapeHtml(data)}</span>` : ''}
                        </div>
                        <p class="artigo-comentario__texto">${D.escapeHtml(comentario.content)}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function publicarComentario(evento) {
        evento.preventDefault();

        if (!ESTADO.usuario) {
            avisar('Entre para comentar.');
            return;
        }

        const texto = (EL.comentarioInput.value || '').trim();
        if (!texto) return;

        const sb = window.supabaseClient;
        const nome = localStorage.getItem('userName') || ESTADO.usuario.user_metadata?.name || 'Membro da comunidade';
        const avatar = D.urlSegura(localStorage.getItem('userAvatar')) || D.AVATAR_PADRAO;

        const { data, error } = await sb
            .from('article_comments')
            .insert({
                article_id: idArtigo,
                author_id: ESTADO.usuario.id,
                author_name: nome,
                author_avatar: avatar,
                content: texto,
                status: 'approved',
                is_active: true
            })
            .select('id, author_id, author_name, author_avatar, content, created_at')
            .single();

        if (error) {
            console.error('[artigo] Erro ao comentar:', error);
            avisar('Não foi possível publicar o comentário.');
            return;
        }

        EL.comentarioInput.value = '';

        // O total é recontado a partir da tabela: bate com a verdade.
        const { count } = await sb
            .from('article_comments')
            .select('id', { count: 'exact', head: true })
            .eq('article_id', idArtigo)
            .eq('is_active', true)
            .eq('status', 'approved');

        await sb.from('articles').update({ comment_count: count || 0 }).eq('id', idArtigo);
        ESTADO.artigo.comment_count = count || 0;

        if (data) {
            const nome2 = data.author_name || 'Membro da comunidade';
            const avatar2 = D.urlSegura(data.author_avatar) || D.AVATAR_PADRAO;
            const div = document.createElement('div');
            div.className = 'artigo-comentario';
            div.innerHTML = `
                <span class="artigo-comentario__avatar" aria-hidden="true">
                    <img src="${D.escapeHtml(avatar2)}" alt="" loading="lazy"
                         onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'art-card__inicial',textContent:'${D.escapeHtml(nome2.charAt(0).toUpperCase())}'}))">
                </span>
                <div>
                    <div class="artigo-comentario__cabecalho">
                        <span class="artigo-comentario__nome">${D.escapeHtml(nome2)}</span>
                        <span class="artigo-comentario__data">agora</span>
                    </div>
                    <p class="artigo-comentario__texto">${D.escapeHtml(data.content)}</p>
                </div>
            `;
            const vazio = EL.comentarios.querySelector('.art-estado');
            if (vazio) vazio.remove();
            EL.comentarios.appendChild(div);
            EL.conversaContagem.textContent = `(${count || 1})`;
        }
    }

    /* =====================================================================
       6. COMPARTILHAR
       ===================================================================== */

    async function compartilhar() {
        const url = window.location.href;
        const titulo = ESTADO.artigo?.title || 'Artigo';

        if (navigator.share) {
            try {
                await navigator.share({ title: titulo, url });
                return;
            } catch (e) {
                // A pessoa cancelou. Não é erro.
                return;
            }
        }

        try {
            await navigator.clipboard.writeText(url);
            avisar('Link copiado.');
        } catch (e) {
            avisar('Copie o link da barra de endereços.');
        }
    }

    /* =====================================================================
       7. AVISOS E ESTADOS
       ===================================================================== */

    let avisoTimer = null;
    function avisar(texto) {
        let caixa = document.getElementById('artigoAvisoCaixa');

        if (!caixa) {
            caixa = document.createElement('div');
            caixa.id = 'artigoAvisoCaixa';
            caixa.setAttribute('role', 'status');
            caixa.style.cssText = [
                'position:fixed', 'left:50%', 'bottom:1.5rem', 'transform:translateX(-50%)',
                'z-index:90', 'padding:.7rem 1.1rem', 'border-radius:999px',
                'background:var(--cm-text)', 'color:var(--cm-bg)',
                'font-size:.88rem', 'font-weight:600', 'box-shadow:var(--cm-shadow-hover)'
            ].join(';');
            document.body.appendChild(caixa);
        }

        caixa.textContent = texto;
        caixa.hidden = false;

        clearTimeout(avisoTimer);
        avisoTimer = setTimeout(() => { caixa.hidden = true; }, 3200);
    }

    function mostrarErro(texto) {
        if (EL.carregando) EL.carregando.hidden = true;
        if (EL.cartao) EL.cartao.hidden = true;
        if (EL.conversa) EL.conversa.hidden = true;
        if (EL.estado) EL.estado.innerHTML = D.estadoErro(texto);
    }

    /* =====================================================================
       8. EVENTOS
       ===================================================================== */

    function ligarEventos() {
        if (EL.gostarBtn) EL.gostarBtn.addEventListener('click', alternarCurtida);

        if (EL.favoritoBtn) {
            EL.favoritoBtn.addEventListener('click', () => {
                if (!ESTADO.artigo) return;
                const agora = D.alternarFavorito(ESTADO.artigo.id);
                EL.favoritoBtn.classList.toggle('is-ativo', agora);
                EL.favoritoBtn.setAttribute('aria-pressed', agora ? 'true' : 'false');
                const icone = EL.favoritoBtn.querySelector('i');
                if (icone) icone.className = `fa-${agora ? 'solid' : 'regular'} fa-bookmark`;
            });
        }

        if (EL.ouvirBtn) {
            EL.ouvirBtn.addEventListener('click', () => {
                if (!D.podeFalar()) {
                    avisar('Este navegador não tem leitura em voz alta.');
                    return;
                }
                const começou = D.falar(ESTADO.artigo);
                EL.ouvirBtn.classList.toggle('is-ativo', começou);
            });
        }

        if (EL.compartilharBtn) EL.compartilharBtn.addEventListener('click', compartilhar);
        if (EL.comentarioForm) EL.comentarioForm.addEventListener('submit', publicarComentario);

        window.addEventListener('beforeunload', D.pararDeFalar);
    }

    /* =====================================================================
       9. INÍCIO
       ===================================================================== */

    async function iniciar() {
        ligarEventos();

        ESTADO.usuario = await lerSessao();

        const logado = !!ESTADO.usuario;
        if (EL.comentarioForm) EL.comentarioForm.hidden = !logado;
        if (EL.comentarioLogin) EL.comentarioLogin.hidden = logado;
        if (EL.comentarioLoginLink) {
            EL.comentarioLoginLink.href = `/login/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        }

        await carregar();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
