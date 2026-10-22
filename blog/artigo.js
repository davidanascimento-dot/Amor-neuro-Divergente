/* =========================================================================
   ARTIGO.JS — Exibição do Artigo Inteiro no Blog & Compartilhamento
   -------------------------------------------------------------------------
   Atende tanto a página dinâmica /blog/artigo.html?id=... quanto
   os posts estáticos legados do blog.
   ========================================================================= */

(function () {
    'use strict';

    const D = window.artigosDados;

    /* ---------------------------------------------------------------------
       Aviso curto na tela
       --------------------------------------------------------------------- */
    let caixaAviso = null;
    let timerAviso = null;

    function mostrarAviso(texto) {
        if (!caixaAviso) {
            caixaAviso = document.createElement('div');
            caixaAviso.setAttribute('role', 'status');
            caixaAviso.setAttribute('aria-live', 'polite');
            caixaAviso.style.cssText = [
                'position:fixed', 'left:50%', 'bottom:24px', 'z-index:99999',
                'transform:translateX(-50%) translateY(8px)',
                'padding:11px 20px', 'border-radius:9999px',
                'background:#1e1b2e', 'color:#fff',
                'font:600 0.875rem/1.3 Inter, system-ui, sans-serif',
                'box-shadow:0 8px 28px rgba(0,0,0,.35)',
                'border:1px solid rgba(255,255,255,0.15)',
                'opacity:0', 'pointer-events:none',
                'transition:opacity .18s ease, transform .18s ease',
                'max-width:min(90vw,420px)', 'text-align:center'
            ].join(';');
            document.body.appendChild(caixaAviso);
        }
        caixaAviso.textContent = texto;
        void caixaAviso.offsetWidth;
        caixaAviso.style.opacity = '1';
        caixaAviso.style.transform = 'translateX(-50%) translateY(0)';

        clearTimeout(timerAviso);
        timerAviso = setTimeout(function () {
            caixaAviso.style.opacity = '0';
            caixaAviso.style.transform = 'translateX(-50%) translateY(8px)';
        }, 2800);
    }

    /* ---------------------------------------------------------------------
       Barra de progresso de leitura
       --------------------------------------------------------------------- */
    function iniciarBarraProgresso() {
        const barra = document.getElementById('readingProgress');
        if (!barra) return;

        window.addEventListener('scroll', () => {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            if (total <= 0) return;
            const atual = window.scrollY;
            const pct = Math.min(100, Math.max(0, (atual / total) * 100));
            barra.style.width = pct + '%';
        }, { passive: true });
    }

    /* ---------------------------------------------------------------------
       Compartilhamento
       --------------------------------------------------------------------- */
    function tituloDoPost() {
        const h1 = document.querySelector('.article-hero__title, h1');
        return (h1 ? h1.textContent : document.title).replace(/\s+/g, ' ').trim();
    }

    function urlDoPost() {
        const u = new URL(window.location.href);
        u.hash = '';
        return u.toString();
    }

    function copiarLink(url) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(
                () => mostrarAviso('Link copiado para a área de transferência!'),
                () => mostrarAviso('Endereço: ' + url)
            );
        } else {
            const area = document.createElement('textarea');
            area.value = url;
            area.style.position = 'fixed';
            area.style.top = '-1000px';
            document.body.appendChild(area);
            area.select();
            try {
                document.execCommand('copy');
                mostrarAviso('Link copiado!');
            } catch (e) {
                mostrarAviso('Endereço: ' + url);
            }
            document.body.removeChild(area);
        }
    }

    function montarCompartilhamento() {
        const botoes = document.querySelectorAll('.article-share__btn');
        if (!botoes.length) return;

        const url = encodeURIComponent(urlDoPost());
        const texto = encodeURIComponent(tituloDoPost());

        botoes.forEach(function (botao) {
            const rotulo = (botao.getAttribute('aria-label') || botao.textContent || '').toLowerCase();

            if (rotulo.includes('whatsapp')) {
                botao.href = 'https://wa.me/?text=' + texto + '%20' + url;
                botao.target = '_blank';
                botao.rel = 'noopener noreferrer';
                return;
            }

            if (rotulo.includes(' x') || rotulo.includes('twitter')) {
                botao.href = 'https://twitter.com/intent/tweet?text=' + texto + '&url=' + url;
                botao.target = '_blank';
                botao.rel = 'noopener noreferrer';
                return;
            }

            if (rotulo.includes('copiar') || botao.id === 'btnCopiarLink') {
                botao.removeAttribute('href');
                botao.setAttribute('role', 'button');
                botao.style.cursor = 'pointer';
                botao.addEventListener('click', function (e) {
                    e.preventDefault();
                    copiarLink(urlDoPost());
                });
            }
        });
    }

    /* ---------------------------------------------------------------------
       LEITURA DINÂMICA DO ARTIGO COMPLETO (Página /blog/artigo.html)
       --------------------------------------------------------------------- */
    const EL_BLOG = {
        carregando: document.getElementById('artigoCarregando'),
        erro: document.getElementById('artigoErro'),
        erroTitulo: document.getElementById('artigoErroTitulo'),
        erroMensagem: document.getElementById('artigoErroMensagem'),
        conteudoCompleto: document.getElementById('artigoConteudoCompleto'),

        breadcrumbTitulo: document.getElementById('breadcrumbTitulo'),
        heroImg: document.getElementById('artigoHeroImg'),
        heroPlaceholder: document.getElementById('artigoHeroPlaceholder'),
        eyebrow: document.getElementById('artigoEyebrow'),
        titulo: document.getElementById('artigoTitulo'),
        subtitulo: document.getElementById('artigoSubtitulo'),

        autorAvatar: document.getElementById('artigoAutorAvatar'),
        autorNome: document.getElementById('artigoAutorNome'),
        autorTag: document.getElementById('artigoAutorTag'),
        data: document.getElementById('artigoData'),
        tempo: document.getElementById('artigoTempo'),

        avisoCard: document.getElementById('artigoAvisoCard'),
        avisoTexto: document.getElementById('artigoAvisoTexto'),
        corpo: document.getElementById('artigoCorpo'),

        btnCurtir: document.getElementById('btnCurtirArtigo'),
        contagemCurtidas: document.getElementById('contagemCurtidas'),
        btnOuvir: document.getElementById('btnOuvirArtigo'),
        btnVerComunidade: document.getElementById('btnVerNaComunidade'),

        // Ações do autor (só aparecem para quem escreveu o artigo)
        acoesAutor: document.getElementById('artigoAcoesAutor'),
        btnEditar: document.getElementById('btnEditarArtigo'),
        btnExcluir: document.getElementById('btnExcluirArtigo')
    };

    let artigoCarregado = null;
    let usuarioAtual = null;
    let jaCurtiu = false;

    async function carregarArtigoDinamico(id) {
        if (!EL_BLOG.carregando) return;

        const sb = window.supabaseClient;
        if (!sb) {
            mostrarErroArtigo('Sem conexão com o banco', 'Não foi possível carregar o banco de dados.');
            return;
        }

        // Sessão do usuário
        try {
            if (sb.auth) {
                const { data } = await sb.auth.getSession();
                usuarioAtual = data?.session?.user || null;
            }
        } catch (e) { /* visitante */ }

        try {
            const { data: artigo, error } = await sb
                .from('articles')
                .select('*')
                .eq('id', id)
                .eq('is_active', true)
                .maybeSingle();

            if (error || !artigo) {
                mostrarErroArtigo('Artigo não encontrado', 'O artigo solicitado não existe, foi excluído ou ainda não foi publicado.');
                return;
            }

            artigoCarregado = artigo;

            // Busca perfil do autor se author_id existir
            let perfilAutor = null;
            if (artigo.author_id && D && D.lerAutores) {
                const perfis = await D.lerAutores([artigo.author_id]);
                perfilAutor = perfis.get(artigo.author_id) || null;
            }

            desenharArtigoBlog(artigo, perfilAutor);

            // Editar/Excluir: só para o autor, confirmado pela sessão.
            desenharAcoesDoAutor();

            // Incrementa contador de visualizações
            incrementarLeitura(artigo.id);

            // Verifica se usuário já curtiu
            verificarCurtida(artigo.id);

        } catch (err) {
            console.error('[blog-artigo] Erro ao carregar artigo:', err);
            mostrarErroArtigo('Erro ao carregar', 'Ocorreu uma instabilidade na conexão. Tente novamente mais tarde.');
        }
    }

    function mostrarErroArtigo(titulo, mensagem) {
        if (EL_BLOG.carregando) EL_BLOG.carregando.hidden = true;
        if (EL_BLOG.conteudoCompleto) EL_BLOG.conteudoCompleto.hidden = true;
        if (EL_BLOG.erro) {
            EL_BLOG.erro.hidden = false;
            if (EL_BLOG.erroTitulo) EL_BLOG.erroTitulo.textContent = titulo;
            if (EL_BLOG.erroMensagem) EL_BLOG.erroMensagem.textContent = mensagem;
        }
    }

    function desenharArtigoBlog(artigo, perfil) {
        if (EL_BLOG.carregando) EL_BLOG.carregando.hidden = true;
        if (EL_BLOG.erro) EL_BLOG.erro.hidden = true;
        if (EL_BLOG.conteudoCompleto) EL_BLOG.conteudoCompleto.hidden = false;

        document.title = `${artigo.title} — Blog Amor NeuroDivergente`;

        if (EL_BLOG.breadcrumbTitulo) EL_BLOG.breadcrumbTitulo.textContent = artigo.title;
        if (EL_BLOG.titulo) EL_BLOG.titulo.textContent = artigo.title;

        if (artigo.subtitle && EL_BLOG.subtitulo) {
            EL_BLOG.subtitulo.textContent = artigo.subtitle;
            EL_BLOG.subtitulo.hidden = false;
        }

        const tipoTag = artigo.kind || 'Artigo';
        const secaoTag = artigo.category || 'Reflexão';
        if (EL_BLOG.eyebrow) {
            EL_BLOG.eyebrow.innerHTML = `<i class="fa-solid fa-pen-nib"></i> Blog • ${D ? D.escapeHtml(tipoTag) : tipoTag} • ${D ? D.escapeHtml(secaoTag) : secaoTag}`;
        }

        // Capa
        const capaUrl = D ? D.urlSegura(artigo.cover_url) : artigo.cover_url;
        if (capaUrl && EL_BLOG.heroImg && EL_BLOG.heroPlaceholder) {
            EL_BLOG.heroImg.src = capaUrl;
            EL_BLOG.heroImg.hidden = false;
            EL_BLOG.heroPlaceholder.hidden = true;
            EL_BLOG.heroImg.onerror = function () {
                EL_BLOG.heroImg.hidden = true;
                EL_BLOG.heroPlaceholder.hidden = false;
            };
        } else if (EL_BLOG.heroPlaceholder) {
            EL_BLOG.heroPlaceholder.hidden = false;
            if (EL_BLOG.heroImg) EL_BLOG.heroImg.hidden = true;
        }

        // Autor
        const nomeAutor = artigo.author_name || perfil?.username || 'Membro da Comunidade';
        const avatarAutor = (D ? D.urlSegura(artigo.author_avatar || perfil?.avatar_url) : null) || '/img/foto-padrão.jpg';

        if (EL_BLOG.autorNome) EL_BLOG.autorNome.textContent = nomeAutor;
        if (EL_BLOG.autorTag) EL_BLOG.autorTag.textContent = `· ${artigo.kind || 'Artigo da Comunidade'}`;
        if (EL_BLOG.autorAvatar) {
            EL_BLOG.autorAvatar.innerHTML = `<img src="${avatarAutor}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        }

        // Data e tempo
        if (EL_BLOG.data) {
            EL_BLOG.data.textContent = D ? (D.formatarData(artigo.created_at) || 'recente') : 'recente';
        }
        if (EL_BLOG.tempo) {
            const min = Number(artigo.read_minutes) || (D ? D.minutosLeitura(artigo.content) : 3);
            EL_BLOG.tempo.textContent = `${min} min de leitura`;
        }

        // Aviso sensível
        if (artigo.sensitive && EL_BLOG.avisoCard) {
            EL_BLOG.avisoCard.hidden = false;
            if (EL_BLOG.avisoTexto) {
                EL_BLOG.avisoTexto.textContent = artigo.warning || 'Este texto aborda temas sensíveis. Leia no seu ritmo.';
            }
        }

        // Conteúdo formatado integral
        if (EL_BLOG.corpo) {
            const renderizado = D ? D.renderizarConteudo(artigo.content) : `<p>${artigo.content}</p>`;
            EL_BLOG.corpo.innerHTML = renderizado;
        }

        // Curtidas
        if (EL_BLOG.contagemCurtidas) {
            EL_BLOG.contagemCurtidas.textContent = String(artigo.likes || 0);
        }

        // Botão Ouvir
        if (EL_BLOG.btnOuvir) {
            EL_BLOG.btnOuvir.addEventListener('click', () => {
                if (!D || !D.falar) {
                    mostrarAviso('Leitura em voz alta não suportada neste navegador.');
                    return;
                }
                const falando = D.falar(artigo);
                if (falando) {
                    EL_BLOG.btnOuvir.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> <span>Pausar voz</span>';
                    mostrarAviso('Iniciando leitura em voz alta…');
                } else {
                    EL_BLOG.btnOuvir.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>Ouvir artigo</span>';
                    mostrarAviso('Leitura de voz pausada.');
                }
            });
        }

        // Botão Curtir
        if (EL_BLOG.btnCurtir) {
            EL_BLOG.btnCurtir.addEventListener('click', alternarCurtida);
        }

        // Link para a Comunidade
        if (EL_BLOG.btnVerComunidade) {
            EL_BLOG.btnVerComunidade.href = `/comunidade/artigo.html?id=${encodeURIComponent(artigo.id)}`;
        }

        // Atualiza links de compartilhamento
        montarCompartilhamento();
    }

    /* ---------------------------------------------------------------------
       AÇÕES DO AUTOR — Editar e Excluir
       ---------------------------------------------------------------------
       O editor já entende /escrever-artigo.html?id=... (carregarParaEditar);
       aqui mora a porta de entrada: o grupo de botões fica escondido até a
       sessão confirmar que o artigo é da pessoa logada. É o mesmo espelho
       das ações do autor que existem em /comunidade/artigo.js.
       --------------------------------------------------------------------- */
    function desenharAcoesDoAutor() {
        if (!EL_BLOG.acoesAutor || !artigoCarregado || !usuarioAtual) return;
        if (usuarioAtual.id !== artigoCarregado.author_id) return;

        const destino = (D && D.caminhoEditor)
            ? D.caminhoEditor(artigoCarregado.id)
            : `/comunidade/escrever-artigo.html?id=${encodeURIComponent(artigoCarregado.id)}`;

        if (EL_BLOG.btnEditar) EL_BLOG.btnEditar.href = destino;
        EL_BLOG.acoesAutor.hidden = false;

        if (EL_BLOG.btnExcluir) EL_BLOG.btnExcluir.addEventListener('click', excluirArtigo);
    }

    async function excluirArtigo() {
        const sb = window.supabaseClient;
        if (!sb || !artigoCarregado || !usuarioAtual) return;

        if (!confirm('Excluir este artigo? Ele some da área Artigos e do Blog. Não dá para desfazer.')) return;

        try {
            // O filtro por author_id aqui é só reforço do lado do cliente;
            // no banco, a política articles_autor_remove (sql/28) já
            // impede que terceiros apaguem o que não é seu.
            const { error } = await sb
                .from('articles')
                .delete()
                .eq('id', artigoCarregado.id)
                .eq('author_id', usuarioAtual.id);

            if (error) throw error;

            mostrarAviso('Artigo excluído.');
            setTimeout(() => { window.location.href = '/comunidade/artigos.html'; }, 900);
        } catch (e) {
            console.error('[blog-artigo] Erro ao excluir:', e);
            mostrarAviso('Não foi possível excluir o artigo agora.');
        }
    }

    async function incrementarLeitura(artigoId) {
        const sb = window.supabaseClient;
        if (!sb) return;
        try {
            // Tenta RPC caso configurado no sql/28_artigos.sql
            await sb.rpc('increment_article_views', { article_id: artigoId });
        } catch (e) {
            // Se RPC não existir, faz fallback silencioso
        }
    }

    async function verificarCurtida(artigoId) {
        if (!usuarioAtual) return;
        const sb = window.supabaseClient;
        if (!sb) return;

        try {
            const { data } = await sb
                .from('article_likes')
                .select('id')
                .eq('article_id', artigoId)
                .eq('user_id', usuarioAtual.id)
                .maybeSingle();

            if (data && EL_BLOG.btnCurtir) {
                jaCurtiu = true;
                EL_BLOG.btnCurtir.classList.add('is-curtido');
                const icone = EL_BLOG.btnCurtir.querySelector('i');
                if (icone) icone.className = 'fa-solid fa-heart';
            }
        } catch (e) { /* silencioso */ }
    }

    async function alternarCurtida() {
        if (!artigoCarregado) return;
        const sb = window.supabaseClient;
        if (!sb) return;

        if (!usuarioAtual) {
            mostrarAviso('Entre na sua conta para curtir artigos.');
            return;
        }

        jaCurtiu = !jaCurtiu;
        let novoTotal = (Number(artigoCarregado.likes) || 0) + (jaCurtiu ? 1 : -1);
        if (novoTotal < 0) novoTotal = 0;
        artigoCarregado.likes = novoTotal;

        if (EL_BLOG.btnCurtir) {
            EL_BLOG.btnCurtir.classList.toggle('is-curtido', jaCurtiu);
            const icone = EL_BLOG.btnCurtir.querySelector('i');
            if (icone) icone.className = jaCurtiu ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        }
        if (EL_BLOG.contagemCurtidas) {
            EL_BLOG.contagemCurtidas.textContent = String(novoTotal);
        }

        try {
            if (jaCurtiu) {
                await sb.from('article_likes').insert({ article_id: artigoCarregado.id, user_id: usuarioAtual.id });
            } else {
                await sb.from('article_likes').delete().eq('article_id', artigoCarregado.id).eq('user_id', usuarioAtual.id);
            }
            await sb.from('articles').update({ likes: novoTotal }).eq('id', artigoCarregado.id);
            mostrarAviso(jaCurtiu ? 'Você curtiu esta publicação!' : 'Curtida removida.');
        } catch (e) {
            console.warn('[blog-artigo] Erro ao sincronizar curtida:', e);
        }
    }

    /* ---------------------------------------------------------------------
       INICIALIZAÇÃO
       --------------------------------------------------------------------- */
    function iniciar() {
        iniciarBarraProgresso();
        montarCompartilhamento();

        // Se houver parâmetro ID na URL, carrega dinamicamente
        const id = new URLSearchParams(window.location.search).get('id');
        if (id && EL_BLOG.carregando) {
            carregarArtigoDinamico(id);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
