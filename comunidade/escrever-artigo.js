/* ==========================================================================
   ESCREVER-ARTIGO.JS — o editor de artigos da Comunidade
   --------------------------------------------------------------------------
   A tela do mockup: barra de ferramentas em cima, folha de escrita no
   centro, configurações no canto.

   O QUE O EDITOR FAZ
     - escreve título, subtítulo e texto;
     - escolhe estilo (tipografia) e modelo (layout da página);
     - mostra a pré-visualização, que é a página de leitura de verdade;
     - guarda rascunho no navegador, para a página não perder o texto;
     - publica na tabela `articles`.

   O QUE O EDITOR NÃO FAZ
     - Não guarda no banco a cada tecla. Escrever é local; o banco é
       chamado quando a pessoa pede para salvar ou publicar. A.Keyboard
       não deve custar uma requisição por letra.
   ========================================================================== */

(function () {
    'use strict';

    const D = window.artigosDados;
    if (!D) {
        console.error('[editor] O módulo artigos-dados.js não carregou.');
        return;
    }

    const EL = {
        loginAviso: document.getElementById('editorLoginAviso'),
        loginLink:  document.getElementById('editorLoginLink'),

        favoritoBtn: document.getElementById('editorFavoritoBtn'),
        previaBtn:   document.getElementById('editorPreviaBtn'),
        estiloBtn:   document.getElementById('editorEstiloBtn'),
        modeloBtn:   document.getElementById('editorModeloBtn'),
        maisBtn:     document.getElementById('editorMaisBtn'),
        popover:     document.getElementById('editorPopover'),
        continuarBtn: document.getElementById('editorContinuarBtn'),

        // Novos botões da barra de formatação.
        desfazerBtn: document.getElementById('editorDesfazerBtn'),
        refazerBtn:  document.getElementById('editorRefazerBtn'),
        negritoBtn:  document.getElementById('editorNegritoBtn'),
        italicoBtn:  document.getElementById('editorItalicoBtn'),
        riscadoBtn:  document.getElementById('editorRiscadoBtn'),
        codigoBtn:   document.getElementById('editorCodigoBtn'),
        tituloBtn:   document.getElementById('editorTituloBtn'),
        linhaBtn:    document.getElementById('editorLinhaBtn'),
        linkBtn:     document.getElementById('editorLinkBtn'),
        imagemBtn:   document.getElementById('editorImagemBtn'),
        audioBtn:    document.getElementById('editorAudioBtn'),
        videoBtn:    document.getElementById('editorVideoBtn'),
        cotacaoBtn:  document.getElementById('editorCotacaoBtn'),
        listaBulletBtn: document.getElementById('editorListaBulletBtn'),
        listaNumBtn:    document.getElementById('editorListaNumBtn'),
        alinharEsqBtn:  document.getElementById('editorAlinharEsqBtn'),
        alinharCentroBtn: document.getElementById('editorAlinharCentroBtn'),
        alinharDirBtn:  document.getElementById('editorAlinharDirBtn'),
        alinharJustBtn: document.getElementById('editorAlinharJustBtn'),
        botaoBtn:   document.getElementById('editorBotaoBtn'),

        // Autor (chip + adicionar).
        autorChip: document.getElementById('editorAutorChip'),
        autorRemoverBtn: document.getElementById('editorAutorRemoverBtn'),
        autorAdicionarBtn: document.getElementById('editorAutorAdicionarBtn'),

        folha:       document.getElementById('editorFolha'),
        secaoRotulo: document.getElementById('editorSecaoRotulo'),
        tipoRotulo:  document.getElementById('editorTipoRotulo'),
        titulo:      document.getElementById('editorTitulo'),
        subtitulo:   document.getElementById('editorSubtitulo'),
        corpo:       document.getElementById('editorCorpo'),

        contadorPalavras: document.getElementById('editorContadorPalavras'),
        contadorTempo:    document.getElementById('editorContadorTempo'),
        contadorSalvo:    document.getElementById('editorContadorSalvo'),

        previa:      document.getElementById('editorPrevia'),
        previaConteudo: document.getElementById('editorPreviaConteudo'),

        configAbrir: document.getElementById('editorConfigAbrir'),
        configPainel: document.getElementById('editorConfigPainel'),
        configFechar: document.getElementById('editorConfigFechar'),
        secao:       document.getElementById('editorSecao'),
        secaoLista:  document.getElementById('editorSecaoLista'),
        tipo:        document.getElementById('editorTipo'),
        capa:        document.getElementById('editorCapa'),
        sensivel:    document.getElementById('editorSensivel'),
        aviso:       document.getElementById('editorAviso'),
        prioridade:  document.getElementById('editorPrioridade'),
        prioridadeValor: document.getElementById('editorPrioridadeValor'),
        pago:        document.getElementById('editorPago'),
        rascunhoBtn: document.getElementById('editorRascunhoBtn'),
        publicarBtn: document.getElementById('editorPublicarBtn')
    };

    const CHAVE_RASCUNHO = 'artigoRascunho';
    const CHAVE_ID_LOCAL = 'artigoIdLocal';

    const ESTADO = {
        usuario: null,
        artigoId: null,      // id real, quando está editando
        idLocal: null,       // id do rascunho local
        editando: false,
        style: 'serifada',
        template: 'padrao',
        secao: 'Relatos',
        kind: 'Relato'
    };

    const idDaUrl = new URLSearchParams(window.location.search).get('id');

    /* =====================================================================
       1. UTILITÁRIOS
       ===================================================================== */

    function idLocal() {
        let id = localStorage.getItem(CHAVE_ID_LOCAL);
        if (!id) {
            id = 'rascunho-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
            localStorage.setItem(CHAVE_ID_LOCAL, id);
        }
        return id;
    }

    function chaveRascunho() {
        return CHAVE_RASCUNHO + ':' + (ESTADO.artigoId || ESTADO.idLocal);
    }

    function avisar(texto) {
        let caixa = document.getElementById('editorAvisoCaixa');

        if (!caixa) {
            caixa = document.createElement('div');
            caixa.id = 'editorAvisoCaixa';
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

        clearTimeout(avisar.timer);
        avisar.timer = setTimeout(() => { caixa.hidden = true; }, 3600);
    }

    /* =====================================================================
       2. O RASCUNHO LOCAL
       ===================================================================== */

    /* Guardar no navegador é o que impede a perda do texto: ninguém deveria
     * perder um parágrafo por causa de um F5. O banco só é chamado quando a
     * pessoa pede. */
    function guardarRascunho() {
        const dados = {
            titulo: EL.titulo.value,
            subtitulo: EL.subtitulo.value,
            corpo: EL.corpo.value,
            secao: EL.secao.value,
            kind: EL.tipo.value,
            style: ESTADO.style,
            template: ESTADO.template,
            cover_url: EL.capa.value,
            sensitive: EL.sensivel.checked,
            warning: EL.aviso.value,
            is_paid: EL.pago.checked,
            priority: EL.prioridade.value,
            salvoEm: new Date().toISOString()
        };

        try {
            localStorage.setItem(chaveRascunho(), JSON.stringify(dados));
            if (EL.contadorSalvo) {
                const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                EL.contadorSalvo.textContent = `Rascunho guardado às ${hora}`;
            }
        } catch (e) {
            console.warn('[editor] Não foi possível guardar o rascunho:', e);
        }
    }

    function lerRascunho() {
        try {
            const bruto = localStorage.getItem(chaveRascunho());
            return bruto ? JSON.parse(bruto) : null;
        } catch (e) {
            return null;
        }
    }

    /* =====================================================================
       3. O FORMULÁRIO
       ===================================================================== */

    function preencher(dados) {
        if (!dados) return;

        EL.titulo.value    = dados.titulo || '';
        EL.subtitulo.value = dados.subtitulo || '';
        EL.corpo.value     = dados.content || dados.corpo || '';
        EL.secao.value     = dados.category || dados.secao || 'Relatos';
        EL.tipo.value      = dados.kind || dados.tipo || 'Relato';
        EL.capa.value      = dados.cover_url || dados.capa || '';
        EL.sensivel.checked = !!dados.sensitive;
        EL.aviso.value     = dados.warning || dados.aviso || '';
        EL.pago.checked    = !!dados.is_paid;
        EL.prioridade.value = dados.priority ?? 5;

        ESTADO.style    = dados.style || 'serifada';
        ESTADO.template = dados.template || 'padrao';
        ESTADO.secao    = EL.secao.value;
        ESTADO.kind     = EL.tipo.value;

        atualizarRotulos();
        atualizarContadores();
    }

    function atualizarRotulos() {
        if (EL.secaoRotulo) EL.secaoRotulo.textContent = String(EL.secao.value || 'Relatos').toUpperCase();
        if (EL.tipoRotulo) EL.tipoRotulo.textContent = EL.tipo.value || 'Relato';
    }

    function atualizarContadores() {
        const texto = EL.corpo.value || '';
        const palavras = texto.trim() ? texto.trim().split(/\s+/).length : 0;
        const minutos = D.minutosLeitura(texto);

        if (EL.contadorPalavras) {
            EL.contadorPalavras.textContent = `${palavras} palavra${palavras === 1 ? '' : 's'}`;
        }
        if (EL.contadorTempo) {
            EL.contadorTempo.textContent = `${minutos} min de leitura`;
        }

        // O campo de título cresce com o texto: uma linha só, sem barra de rolagem.
        EL.titulo.style.height = 'auto';
        EL.titulo.style.height = EL.titulo.scrollHeight + 'px';
        EL.subtitulo.style.height = 'auto';
        EL.subtitulo.style.height = EL.subtitulo.scrollHeight + 'px';
    }

    /* =====================================================================
       4. A PRÉ-VISUALIZAÇÃO
       ===================================================================== */

    /* A prévia não é uma imitação: é a página de leitura, com o mesmo
     * renderizador e as mesmas classes. O que se vê aqui é o que vai
     * aparecer lá. */
    function montarPrevia() {
        const titulo = EL.titulo.value.trim();
        const subtitulo = EL.subtitulo.value.trim();
        const corpo = EL.corpo.value;

        const autor = ESTADO.usuario
            ? (localStorage.getItem('userName') || 'Você')
            : 'Você';

        const aviso = EL.sensivel.checked
            ? `<p class="artigo-aviso"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>${D.escapeHtml(EL.aviso.value.trim() || 'Este texto aborda temas sensíveis.')}</span></p>`
            : '';

        const capa = D.urlSegura(EL.capa.value.trim());

        EL.previaConteudo.innerHTML = `
            <article class="artigo-cartao artigo-cartao--${D.escapeHtml(ESTADO.template)}">
                ${capa ? `<img class="artigo-capa" src="${D.escapeHtml(capa)}" alt="">` : ''}
                <span class="artigo-secao">${D.escapeHtml(String(EL.secao.value || 'Relatos'))}</span>
                <h1 class="artigo-titulo">${D.escapeHtml(titulo || 'Comece a escrever…')}</h1>
                ${subtitulo ? `<p class="artigo-subtitulo">${D.escapeHtml(subtitulo)}</p>` : ''}
                ${aviso}
                <div class="artigo-byline">
                    <span class="artigo-byline__autor">
                        <span class="artigo-byline__avatar" aria-hidden="true"></span>
                        <span>
                            <span class="artigo-byline__nome">${D.escapeHtml(autor)}</span>
                            <span class="artigo-byline__handle">@voce</span>
                        </span>
                    </span>
                    <span class="artigo-byline__data">${D.formatarDataLonga(new Date().toISOString()) || ''}</span>
                    <span class="artigo-byline__data">${D.minutosLeitura(corpo)} MIN LEITURA</span>
                </div>
                <div class="artigo-corpo artigo-corpo--${D.escapeHtml(ESTADO.style)}">
                    ${corpo.trim() ? D.renderizarConteudo(corpo) : '<p style="opacity:.6">O texto do artigo aparece aqui.</p>'}
                </div>
            </article>
        `;
    }

    function alternarPrevia(ligar) {
        const mostrar = ligar === undefined ? EL.previa.classList.contains('is-visivel') === false : ligar;

        EL.previa.classList.toggle('is-visivel', mostrar);
        EL.folha.classList.toggle('is-previa', mostrar);
        EL.previaBtn.classList.toggle('is-ativo', mostrar);
        EL.previaBtn.setAttribute('aria-pressed', mostrar ? 'true' : 'false');

        if (mostrar) {
            montarPrevia();
            EL.previa.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /* =====================================================================
       5. O MENU (Estilo / Modelo / Mais)
       ===================================================================== */

    function abrirPopover(ancora, itens) {
        if (!EL.popover) return;

        EL.popover.innerHTML = '';
        EL.popover.hidden = false;

        for (const item of itens) {
            if (item.separador) {
                const sep = document.createElement('div');
                sep.className = 'editor-popover__separador';
                EL.popover.appendChild(sep);
                continue;
            }

            const botao = document.createElement('button');
            botao.type = 'button';
            botao.className = 'editor-popover__item' + (item.ativo ? ' is-ativo' : '');
            botao.setAttribute('role', 'menuitem');
            botao.innerHTML = `${D.escapeHtml(item.texto)}${item.descricao ? `<span class="editor-popover__descricao">${D.escapeHtml(item.descricao)}</span>` : ''}`;
            botao.addEventListener('click', () => {
                item.acao();
                fecharPopover();
            });
            EL.popover.appendChild(botao);
        }

        // A âncora fica marcada como aberta.
        [EL.estiloBtn, EL.modeloBtn, EL.maisBtn].forEach(b => b && b.setAttribute('aria-expanded', 'false'));
        if (ancora) ancora.setAttribute('aria-expanded', 'true');
    }

    function fecharPopover() {
        if (!EL.popover) return;
        EL.popover.hidden = true;
        [EL.estiloBtn, EL.modeloBtn, EL.maisBtn].forEach(b => b && b.setAttribute('aria-expanded', 'false'));
    }

    function menuEstilo() {
        abrirPopover(EL.estiloBtn, D.ESTILOS.map(estilo => ({
            texto: estilo.nome,
            descricao: estilo.descricao,
            ativo: ESTADO.style === estilo.valor,
            acao: () => {
                ESTADO.style = estilo.valor;
                atualizarRotulos();
                montarPrevia();
                guardarRascunho();
            }
        })));
    }

    function menuModelo() {
        abrirPopover(EL.modeloBtn, D.MODELOS.map(modelo => ({
            texto: modelo.nome,
            descricao: modelo.descricao,
            ativo: ESTADO.template === modelo.valor,
            acao: () => {
                ESTADO.template = modelo.valor;
                montarPrevia();
                guardarRascunho();
            }
        })));
    }

    function menuMais() {
        abrirPopover(EL.maisBtn, [
            {
                texto: 'Copiar o texto',
                descricao: 'Leva o que você escreveu para a área de transferência',
                acao: async () => {
                    const texto = [EL.titulo.value, EL.subtitulo.value, EL.corpo.value].filter(Boolean).join('\n\n');
                    try {
                        await navigator.clipboard.writeText(texto);
                        avisar('Texto copiado.');
                    } catch (e) {
                        avisar('Não foi possível copiar.');
                    }
                }
            },
            {
                texto: 'Limpar tudo',
                descricao: 'Apaga o texto deste navegador',
                acao: () => {
                    if (!confirm('Apagar o que está escrito? O rascunho guardado neste navegador será perdido.')) return;
                    EL.titulo.value = '';
                    EL.subtitulo.value = '';
                    EL.corpo.value = '';
                    atualizarContadores();
                    guardarRascunho();
                    montarPrevia();
                }
            },
            { separador: true },
            {
                texto: 'Sair do editor',
                descricao: 'Volta para a área de artigos',
                acao: () => { window.location.href = '/comunidade/artigos.html'; }
            }
        ]);
    }

    /* =====================================================================
       6. O FAVORITO
       ===================================================================== */

    /* O "Favorito" do editor é o mesmo do card: o texto que a pessoa
     * guardou para ler depois. Enquanto o artigo não tem id no banco, ele
     * usa a chave local do rascunho; ao publicar, a marca é transferida
     * para o id de verdade. */
    function chaveFavorito() {
        return ESTADO.artigoId || ('rascunho:' + ESTADO.idLocal);
    }

    function atualizarFavorito() {
        const favorito = D.ehFavorito(chaveFavorito());
        EL.favoritoBtn.classList.toggle('is-ativo', favorito);
        EL.favoritoBtn.setAttribute('aria-pressed', favorito ? 'true' : 'false');
        const icone = EL.favoritoBtn.querySelector('i');
        if (icone) icone.className = `fa-${favorito ? 'solid' : 'regular'} fa-bookmark`;
    }

    function alternarFavorito() {
        D.alternarFavorito(chaveFavorito());
        atualizarFavorito();
    }

    /* =====================================================================
       7. PUBLICAR
       ===================================================================== */

    function validar() {
        const titulo = EL.titulo.value.trim();
        const corpo = EL.corpo.value.trim();

        if (titulo.length < 3) {
            avisar('O título precisa de pelo menos 3 letras.');
            EL.titulo.focus();
            return false;
        }
        if (corpo.length < 50) {
            avisar('O texto precisa de pelo menos 50 caracteres para ser um artigo.');
            EL.corpo.focus();
            return false;
        }
        return true;
    }

    async function publicar() {
        if (!ESTADO.usuario) {
            avisar('Entre para publicar o artigo.');
            return;
        }
        if (!validar()) return;

        const sb = window.supabaseClient;
        if (!sb) {
            avisar('Não foi possível conectar ao banco de dados.');
            return;
        }

        const payload = {
            author_id: ESTADO.usuario.id,
            author_name: localStorage.getItem('userName') || 'Membro da comunidade',
            author_avatar: D.urlSegura(localStorage.getItem('userAvatar')) || D.AVATAR_PADRAO,
            title: EL.titulo.value.trim(),
            subtitle: EL.subtitulo.value.trim() || null,
            content: EL.corpo.value.trim(),
            category: (EL.secao.value || 'Relatos').trim(),
            kind: EL.tipo.value || 'Relato',
            style: ESTADO.style,
            template: ESTADO.template,
            cover_url: D.urlSegura(EL.capa.value.trim()),
            sensitive: EL.sensivel.checked,
            warning: EL.sensivel.checked ? (EL.aviso.value.trim() || 'Este texto aborda temas sensíveis.') : null,
            is_paid: EL.pago.checked,
            priority: EL.prioridade.value ? Number(EL.prioridade.value) : null,
            status: 'publicado',
            is_active: true,
            read_minutes: D.minutosLeitura(EL.corpo.value),
            updated_at: new Date().toISOString()
        };

        EL.publicarBtn.disabled = true;
        EL.publicarBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Publicando…';

        try {
            let idFinal;

            if (ESTADO.editando && ESTADO.artigoId) {
                const { error } = await sb.from('articles').update(payload).eq('id', ESTADO.artigoId).eq('author_id', ESTADO.usuario.id);
                if (error) throw error;
                idFinal = ESTADO.artigoId;
            } else {
                const { data, error } = await sb
                    .from('articles')
                    .insert({ ...payload, created_at: new Date().toISOString() })
                    .select('id')
                    .single();
                if (error) throw error;
                idFinal = data.id;
            }

            // O rascunho local sai de cena, e a marca de favorito vai
            // junto com o id de verdade.
            try {
                localStorage.removeItem(chaveRascunho());
                const chaveLocal = 'rascunho:' + ESTADO.idLocal;
                if (D.ehFavorito(chaveLocal)) {
                    D.alternarFavorito(chaveLocal);
                    D.alternarFavorito(idFinal);
                }
            } catch (e) { /* não é grave */ }

            avisar('Artigo publicado.');
            window.location.href = D.caminhoArtigo(idFinal);
            return;

        } catch (error) {
            console.error('[editor] Erro ao publicar:', error);

            const mensagem = D.ehTabelaAusente(error)
                ? D.AVISO_BANCO
                : (D.ehErroDeSessao(error)
                    ? 'Sua sessão expirou. Entre novamente para publicar.'
                    : 'Não foi possível publicar agora. Tente de novo.');

            avisar(mensagem);
        } finally {
            EL.publicarBtn.disabled = false;
            EL.publicarBtn.innerHTML = '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Publicar artigo';
        }
    }

    async function salvarRascunhoNoBanco() {
        if (!ESTADO.usuario) {
            avisar('Entre para salvar o rascunho.');
            return;
        }
        if (!EL.titulo.value.trim() && !EL.corpo.value.trim()) {
            avisar('Escreva alguma coisa antes de salvar o rascunho.');
            return;
        }

        const sb = window.supabaseClient;
        const payload = {
            author_id: ESTADO.usuario.id,
            author_name: localStorage.getItem('userName') || 'Membro da comunidade',
            author_avatar: D.urlSegura(localStorage.getItem('userAvatar')) || D.AVATAR_PADRAO,
            title: (EL.titulo.value.trim() || 'Sem título') + (ESTADO.editando ? '' : ' (rascunho)'),
            subtitle: EL.subtitulo.value.trim() || null,
            content: (EL.corpo.value.trim() + ' ').padEnd(50, '.'),
            category: (EL.secao.value || 'Relatos').trim(),
            kind: EL.tipo.value || 'Relato',
            style: ESTADO.style,
            template: ESTADO.template,
            cover_url: D.urlSegura(EL.capa.value.trim()),
            sensitive: EL.sensivel.checked,
            warning: EL.sensivel.checked ? (EL.aviso.value.trim() || 'Este texto aborda temas sensíveis.') : null,
            is_paid: EL.pago.checked,
            priority: EL.prioridade.value ? Number(EL.prioridade.value) : null,
            status: 'rascunho',
            is_active: true,
            read_minutes: D.minutosLeitura(EL.corpo.value),
            updated_at: new Date().toISOString()
        };

        try {
            if (ESTADO.editando && ESTADO.artigoId) {
                const { error } = await sb.from('articles').update(payload).eq('id', ESTADO.artigoId).eq('author_id', ESTADO.usuario.id);
                if (error) throw error;
            } else {
                const { data, error } = await sb
                    .from('articles')
                    .insert({ ...payload, created_at: new Date().toISOString() })
                    .select('id')
                    .single();
                if (error) throw error;
                ESTADO.artigoId = data.id;
                ESTADO.editando = true;
            }

            guardarRascunho();
            avisar('Rascunho salvo. Só você enxerga ele por enquanto.');
        } catch (error) {
            console.error('[editor] Erro ao salvar o rascunho:', error);
            avisar(D.ehTabelaAusente(error) ? D.AVISO_BANCO : 'Não foi possível salvar o rascunho agora.');
        }
    }

    /* =====================================================================
       8. CARREGAR UM ARTIGO PARA EDITAR
       ===================================================================== */

    async function carregarParaEditar(id) {
        const sb = window.supabaseClient;
        if (!sb) return;

        const { data, error } = await D.consultar(sb, () => sb
            .from('articles')
            .select('*')
            .eq('id', id)
            .maybeSingle());

        if (error || !data) {
            avisar('Não foi possível abrir este artigo para edição.');
            return;
        }

        if (ESTADO.usuario && data.author_id !== ESTADO.usuario.id) {
            avisar('Este artigo não é seu. Você não pode editá-lo.');
            return;
        }

        ESTADO.artigoId = data.id;
        ESTADO.editando = true;

        preencher(data);
        document.title = `Editar: ${data.title} — Amor NeuroDivergente`;
    }

    /* =====================================================================
       9. EVENTOS
       ===================================================================== */

    function ligarEventos() {
        EL.titulo.addEventListener('input', () => { atualizarContadores(); guardarRascunho(); });
        EL.subtitulo.addEventListener('input', () => { atualizarContadores(); guardarRascunho(); });
        EL.corpo.addEventListener('input', () => { atualizarContadores(); guardarRascunho(); });

        EL.secao.addEventListener('input', () => { atualizarRotulos(); guardarRascunho(); });
        EL.tipo.addEventListener('change', () => { atualizarRotulos(); guardarRascunho(); });
        EL.capa.addEventListener('input', guardarRascunho);
        EL.aviso.addEventListener('input', guardarRascunho);
        EL.sensivel.addEventListener('change', guardarRascunho);
        EL.pago.addEventListener('change', guardarRascunho);

        EL.prioridade.addEventListener('input', () => {
            EL.prioridadeValor.textContent = `${EL.prioridade.value}/10`;
            guardarRascunho();
        });

        EL.favoritoBtn.addEventListener('click', alternarFavorito);
        EL.previaBtn.addEventListener('click', () => alternarPrevia());

        EL.estiloBtn.addEventListener('click', () => {
            if (!EL.popover.hidden) { fecharPopover(); return; }
            menuEstilo();
        });
        EL.modeloBtn.addEventListener('click', () => {
            if (!EL.popover.hidden) { fecharPopover(); return; }
            menuModelo();
        });
        EL.maisBtn.addEventListener('click', () => {
            if (!EL.popover.hidden) { fecharPopover(); return; }
            menuMais();
        });

        EL.continuarBtn.addEventListener('click', () => {
            alternarConfig(true);
            guardarRascunho();
        });

        EL.autorAdicionarBtn.addEventListener('click', () => {
            alternarConfig(true);
            guardarRascunho();
        });

        EL.configAbrir.addEventListener('click', () => alternarConfig());
        EL.configFechar.addEventListener('click', () => alternarConfig(false));
        EL.rascunhoBtn.addEventListener('click', salvarRascunhoNoBanco);
        EL.publicarBtn.addEventListener('click', publicar);

        // Clique fora do menu fecha o menu.
        document.addEventListener('click', (evento) => {
            if (EL.popover.hidden) return;
            if (EL.popover.contains(evento.target)) return;
            if (evento.target.closest('.editor-ferramenta')) return;
            fecharPopover();
        });

        // Ctrl+S / Cmd+S salva o rascunho em vez de salvar a página.
        document.addEventListener('keydown', (evento) => {
            if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 's') {
                evento.preventDefault();
                guardarRascunho();
                avisar('Rascunho guardado neste navegador.');
            }
        });

        window.addEventListener('beforeunload', guardarRascunho);
    }

    function alternarConfig(ligar) {
        const mostrar = ligar === undefined ? EL.configPainel.hidden : ligar;
        EL.configPainel.hidden = !mostrar;
        EL.configAbrir.setAttribute('aria-expanded', mostrar ? 'true' : 'false');
    }

    /* =====================================================================
       10. INÍCIO
       ===================================================================== */

    async function iniciar() {
        ESTADO.idLocal = idLocal();

        // As listas dos seletores.
        EL.secaoLista.innerHTML = D.SECOES.map(s => `<option value="${D.escapeHtml(s)}"></option>`).join('');
        EL.tipo.innerHTML = D.TIPOS.map(t => `<option value="${D.escapeHtml(t)}">${D.escapeHtml(t)}</option>`).join('');

        // A sessão.
        const sb = window.supabaseClient;
        if (sb && sb.auth) {
            try {
                const { data } = await sb.auth.getSession();
                ESTADO.usuario = data?.session?.user || null;
            } catch (e) { /* visitante */ }
        }

        const logado = !!ESTADO.usuario;
        EL.loginAviso.hidden = logado;
        if (EL.loginLink) {
            EL.loginLink.href = `/login/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        }

        // O nome e o avatar do autor na barra.
        const nome = localStorage.getItem('userName') || 'Você';
        const avatar = D.urlSegura(localStorage.getItem('userAvatar')) || D.AVATAR_PADRAO;
        EL.autorNome.textContent = nome;
        EL.avatar.innerHTML = `<img src="${D.escapeHtml(avatar)}" alt="">`;

        ligarEventos();
        atualizarFavorito();

        if (idDaUrl) {
            await carregarParaEditar(idDaUrl);
        } else {
            // O rascunho do navegador entra no formulário, se houver.
            const rascunho = lerRascunho();
            if (rascunho) preencher(rascunho);
        }

        atualizarContadores();
        atualizarRotulos();
        EL.prioridadeValor.textContent = `${EL.prioridade.value}/10`;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
