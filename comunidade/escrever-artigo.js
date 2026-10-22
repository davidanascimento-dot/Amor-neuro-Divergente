/* ==========================================================================
   ESCREVER-ARTIGO.JS — Editor Visual Rico de Artigos e Dicas (Modelo Substack)
   --------------------------------------------------------------------------
   Arquitetura com Flyouts & Dropdowns:
     - Dropdown de imagem (Image, Gallery, Stock photos, Link)
     - Flyout Add audio com Dropzone e Gravação Real de Voz (MediaRecorder)
     - Flyout Embed video com Dropzone e YouTube
     - Sem modais escuros de tela cheia — foco na escrita acolhedora e fluida
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

        previaBtn:   document.getElementById('editorPreviaBtn'),
        estiloBtn:   document.getElementById('editorEstiloBtn'),
        modeloBtn:   document.getElementById('editorModeloBtn'),
        maisBtn:     document.getElementById('editorMaisBtn'),
        popover:     document.getElementById('editorPopover'),
        continuarBtn: document.getElementById('editorContinuarBtn'),

        // Ferramentas da barra
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

        // Dropdown de imagem (Substack)
        imagemDropdown: document.getElementById('editorImagemDropdown'),
        optImgUpload:   document.getElementById('optImgUpload'),
        optImgGallery:  document.getElementById('optImgGallery'),
        optImgStock:    document.getElementById('optImgStock'),
        optImgLink:     document.getElementById('optImgLink'),

        // Flyout flutuante para Áudio / Vídeo
        flyout:       document.getElementById('editorFlyout'),
        flyoutTitle:  document.getElementById('editorFlyoutTitle'),
        flyoutClose:  document.getElementById('editorFlyoutClose'),
        flyoutBody:   document.getElementById('editorFlyoutBody'),
        flyoutCancel: document.getElementById('editorFlyoutCancel'),
        flyoutInsert: document.getElementById('editorFlyoutInsert'),
        hiddenFileInput: document.getElementById('editorHiddenFileInput'),

        // Autor
        autorChip: document.getElementById('editorAutorChip'),
        autorNome: document.getElementById('editorAutorNome'),
        autorAvatar: document.getElementById('editorAutorAvatar'),
        autorRemoverBtn: document.getElementById('editorAutorRemoverBtn'),
        autorAdicionarBtn: document.getElementById('editorAutorAdicionarBtn'),

        // Folha de escrita
        folha:       document.getElementById('editorFolha'),
        secaoRotulo: document.getElementById('editorSecaoRotulo'),
        tipoRotulo:  document.getElementById('editorTipoRotulo'),
        titulo:      document.getElementById('editorTitulo'),
        subtitulo:   document.getElementById('editorSubtitulo'),
        corpo:       document.getElementById('editorCorpo'),

        // Contadores
        contadorPalavras: document.getElementById('editorContadorPalavras'),
        contadorTempo:    document.getElementById('editorContadorTempo'),
        contadorSalvo:    document.getElementById('editorContadorSalvo'),

        // Pré-visualização
        previa:      document.getElementById('editorPrevia'),
        previaConteudo: document.getElementById('editorPreviaConteudo'),

        // Configurações
        configAbrir: document.getElementById('editorConfigAbrir'),
        configPainel: document.getElementById('editorConfigPainel'),
        configFechar: document.getElementById('editorConfigFechar'),
        secao:       document.getElementById('editorSecao'),
        secaoLista:  document.getElementById('editorSecaoLista'),
        tipo:        document.getElementById('editorTipo'),
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
        artigoId: null,
        idLocal: null,
        editando: false,
        style: 'serifada',
        template: 'padrao',
        secao: 'Dicas',
        kind: 'Dica',
        alinhamento: 'left',

        historico: [],
        indiceHistorico: -1,
        maxHistorico: 40,
        bloquearHistorico: false,

        // Estado do Flyout
        flyoutTipo: null,
        flyoutDadosProntos: null,
        mediaRecorder: null,
        audioChunks: [],
        gravandoAudio: false,
        timerGravacao: null,
        segundosGravacao: 0
    };

    const idDaUrl = new URLSearchParams(window.location.search).get('id');

    // Banco de fotos acolhedoras gratuitas para Stock Photos
    const FOTOS_STOCK = [
        { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1000&fit=crop', legenda: 'Momento de pausa e respiração' },
        { url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1000&fit=crop', legenda: 'Ambiente calmo para foco' },
        { url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=1000&fit=crop', legenda: 'Anotações e rotina visual' },
        { url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000&fit=crop', legenda: 'Natureza e regulação sensorial' },
        { url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1000&fit=crop', legenda: 'Leitura acolhedora e hiperfoco' },
        { url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1000&fit=crop', legenda: 'Conexão e acolhimento mútuo' }
    ];

    /* =====================================================================
       1. UTILITÁRIOS E RASCUNHOS
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

    function avisar(texto, tipo = 'info') {
        let caixa = document.getElementById('editorAvisoCaixa');

        if (!caixa) {
            caixa = document.createElement('div');
            caixa.id = 'editorAvisoCaixa';
            caixa.setAttribute('role', 'status');
            caixa.style.cssText = [
                'position:fixed', 'left:50%', 'bottom:2rem', 'transform:translateX(-50%)',
                'z-index:999999', 'padding:.8rem 1.4rem', 'border-radius:999px',
                'background:var(--cm-surface, #1e1b2e)', 'color:var(--cm-text, #fff)',
                'font-size:.9rem', 'font-weight:600', 'box-shadow:0 10px 30px rgba(0,0,0,0.4)',
                'border:1px solid var(--cm-border, rgba(255,255,255,0.18))',
                'display:flex', 'align-items:center', 'gap:.6rem',
                'transition:all .25s ease'
            ].join(';');
            document.body.appendChild(caixa);
        }

        const icone = tipo === 'sucesso'
            ? '<i class="fa-solid fa-circle-check" style="color:#22c55e;"></i>'
            : (tipo === 'alerta'
                ? '<i class="fa-solid fa-triangle-exclamation" style="color:#eab308;"></i>'
                : '<i class="fa-solid fa-circle-info" style="color:#a855f7;"></i>');

        caixa.innerHTML = `${icone} <span>${D.escapeHtml(texto)}</span>`;
        caixa.hidden = false;

        clearTimeout(avisar.timer);
        avisar.timer = setTimeout(() => { caixa.hidden = true; }, 4000);
    }

    function atualizarPerfilAutor() {
        const nome = localStorage.getItem('userName') || (ESTADO.usuario?.email ? ESTADO.usuario.email.split('@')[0] : 'Você');
        const avatar = D.urlSegura(localStorage.getItem('userAvatar')) || D.AVATAR_PADRAO;

        if (EL.autorNome) EL.autorNome.textContent = nome;
        if (EL.autorAvatar) {
            EL.autorAvatar.innerHTML = `<img src="${D.escapeHtml(avatar)}" alt="" style="width:22px;height:22px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:5px;">`;
        }
    }

    function obterConteudoHtml() {
        if (!EL.corpo) return '';
        const clone = EL.corpo.cloneNode(true);
        clone.querySelectorAll('.editor-remover-btn').forEach(btn => btn.remove());
        clone.querySelectorAll('[contenteditable="false"]').forEach(el => el.removeAttribute('contenteditable'));
        return clone.innerHTML.trim();
    }

    function obterConteudoTexto() {
        if (!EL.corpo) return '';
        return (EL.corpo.innerText || EL.corpo.textContent || '').trim();
    }

    function guardarRascunho() {
        const htmlCorpo = obterConteudoHtml();
        const dados = {
            titulo: EL.titulo ? EL.titulo.value : '',
            subtitulo: EL.subtitulo ? EL.subtitulo.value : '',
            corpo: htmlCorpo,
            secao: EL.secao ? EL.secao.value : ESTADO.secao,
            kind: EL.tipo ? EL.tipo.value : ESTADO.kind,
            style: ESTADO.style,
            template: ESTADO.template,
            cover_url: '', // Sem capa por enquanto
            sensitive: EL.sensivel ? EL.sensivel.checked : false,
            warning: EL.aviso ? EL.aviso.value : '',
            is_paid: EL.pago ? EL.pago.checked : false,
            priority: EL.prioridade ? EL.prioridade.value : 5,
            alinhamento: ESTADO.alinhamento,
            salvoEm: new Date().toISOString()
        };

        try {
            localStorage.setItem(chaveRascunho(), JSON.stringify(dados));
            if (EL.contadorSalvo) {
                const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                EL.contadorSalvo.textContent = `Rascunho guardado às ${hora}`;
            }
        } catch (e) {
            console.warn('[editor] Falha ao gravar rascunho:', e);
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

    function preencher(dados) {
        if (!dados) return;

        if (EL.titulo) EL.titulo.value    = dados.titulo || '';
        if (EL.subtitulo) EL.subtitulo.value = dados.subtitulo || '';
        
        const conteudoBruto = dados.content || dados.corpo || '';
        if (EL.corpo) {
            if (/<(p|figure|img|h2|h3|blockquote|ul|ol|pre|iframe|video|audio)[s>]/i.test(conteudoBruto)) {
                EL.corpo.innerHTML = conteudoBruto;
            } else if (conteudoBruto) {
                EL.corpo.innerHTML = D.renderizarConteudo(conteudoBruto);
            } else {
                EL.corpo.innerHTML = '';
            }
            anexarBotoesRemocaoMidias();
        }

        if (EL.secao) EL.secao.value     = dados.category || dados.secao || 'Dicas';
        if (EL.tipo) EL.tipo.value      = dados.kind || dados.tipo || 'Dica';
        // if (EL.capa) EL.capa.value      = dados.cover_url || dados.capa || '';
        if (EL.sensivel) EL.sensivel.checked = !!dados.sensitive;
        if (EL.aviso) EL.aviso.value     = dados.warning || dados.aviso || '';
        if (EL.pago) EL.pago.checked    = !!dados.is_paid;
        if (EL.prioridade) EL.prioridade.value = dados.priority ?? 5;

        ESTADO.style    = dados.style || 'serifada';
        ESTADO.template = dados.template || 'padrao';
        ESTADO.secao    = (EL.secao ? EL.secao.value : null) || 'Dicas';
        ESTADO.kind     = (EL.tipo ? EL.tipo.value : null) || 'Dica';
        ESTADO.alinhamento = dados.alinhamento || 'left';

        aplicarAlinhamento(ESTADO.alinhamento);
        atualizarRotulos();
        atualizarContadores();
        registrarNoHistorico();
    }

    function atualizarRotulos() {
        const sec = EL.secao ? EL.secao.value : ESTADO.secao;
        const tp = EL.tipo ? EL.tipo.value : ESTADO.kind;

        if (EL.secaoRotulo) EL.secaoRotulo.textContent = String(sec || 'DICAS').toUpperCase();
        if (EL.tipoRotulo) EL.tipoRotulo.textContent = tp || 'Dica';
    }

    function atualizarContadores() {
        const texto = obterConteudoTexto();
        const palavras = texto.trim() ? texto.trim().split(/\s+/).length : 0;
        const minutos = D.minutosLeitura(texto);

        if (EL.contadorPalavras) {
            EL.contadorPalavras.textContent = `${palavras} palavra${palavras === 1 ? '' : 's'}`;
        }
        if (EL.contadorTempo) {
            EL.contadorTempo.textContent = `${minutos} min de leitura`;
        }

        if (EL.titulo) {
            EL.titulo.style.height = 'auto';
            EL.titulo.style.height = EL.titulo.scrollHeight + 'px';
        }
        if (EL.subtitulo) {
            EL.subtitulo.style.height = 'auto';
            EL.subtitulo.style.height = EL.subtitulo.scrollHeight + 'px';
        }
    }

    /* =====================================================================
       2. HISTÓRICO DE UNDO / REDO
       ===================================================================== */

    function registrarNoHistorico() {
        if (ESTADO.bloquearHistorico || !EL.corpo) return;

        const htmlAtual = EL.corpo.innerHTML;
        if (ESTADO.indiceHistorico >= 0 && ESTADO.historico[ESTADO.indiceHistorico] === htmlAtual) {
            return;
        }

        ESTADO.historico = ESTADO.historico.slice(0, ESTADO.indiceHistorico + 1);
        ESTADO.historico.push(htmlAtual);

        if (ESTADO.historico.length > ESTADO.maxHistorico) {
            ESTADO.historico.shift();
        }

        ESTADO.indiceHistorico = ESTADO.historico.length - 1;
        atualizarBotoesHistorico();
    }

    function atualizarBotoesHistorico() {
        if (EL.desfazerBtn) EL.desfazerBtn.disabled = ESTADO.indiceHistorico <= 0;
        if (EL.refazerBtn) EL.refazerBtn.disabled = ESTADO.indiceHistorico >= ESTADO.historico.length - 1;
    }

    function desfazer() {
        if (ESTADO.indiceHistorico > 0) {
            ESTADO.bloquearHistorico = true;
            ESTADO.indiceHistorico--;
            EL.corpo.innerHTML = ESTADO.historico[ESTADO.indiceHistorico];
            anexarBotoesRemocaoMidias();
            ESTADO.bloquearHistorico = false;
            atualizarContadores();
            guardarRascunho();
            atualizarBotoesHistorico();
        }
    }

    function refazer() {
        if (ESTADO.indiceHistorico < ESTADO.historico.length - 1) {
            ESTADO.bloquearHistorico = true;
            ESTADO.indiceHistorico++;
            EL.corpo.innerHTML = ESTADO.historico[ESTADO.indiceHistorico];
            anexarBotoesRemocaoMidias();
            ESTADO.bloquearHistorico = false;
            atualizarContadores();
            guardarRascunho();
            atualizarBotoesHistorico();
        }
    }

    /* =====================================================================
       3. FORMATAÇÃO E INSERÇÃO NO EDITOR
       ===================================================================== */

    function executarComando(comando, valor = null) {
        if (!EL.corpo) return;
        EL.corpo.focus();
        document.execCommand(comando, false, valor);
        atualizarContadores();
        guardarRascunho();
        registrarNoHistorico();
    }

    function inserirElementoVisualNoCursor(elementoHtml) {
        if (!EL.corpo) return;
        EL.corpo.focus();

        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();

            const temp = document.createElement('div');
            temp.innerHTML = elementoHtml;
            const frag = document.createDocumentFragment();
            let node, ultimoNode;
            while ((node = temp.firstChild)) {
                ultimoNode = frag.appendChild(node);
            }
            range.insertNode(frag);

            if (ultimoNode) {
                range.setStartAfter(ultimoNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } else {
            EL.corpo.insertAdjacentHTML('beforeend', elementoHtml);
        }

        anexarBotoesRemocaoMidias();
        atualizarContadores();
        guardarRascunho();
        registrarNoHistorico();
    }

    function anexarBotoesRemocaoMidias() {
        if (!EL.corpo) return;
        const blocos = EL.corpo.querySelectorAll('.editor-midia-bloco');
        blocos.forEach(bloco => {
            if (!bloco.querySelector('.editor-remover-btn')) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'editor-remover-btn';
                btn.title = 'Remover mídia';
                btn.setAttribute('contenteditable', 'false');
                btn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    bloco.remove();
                    atualizarContadores();
                    guardarRascunho();
                    registrarNoHistorico();
                    avisar('Mídia removida.');
                });
                bloco.appendChild(btn);
            }
        });
    }

    function aplicarAlinhamento(modo) {
        ESTADO.alinhamento = modo;
        if (EL.corpo) EL.corpo.style.textAlign = modo;
        if (EL.previaConteudo) {
            const corpoPrevia = EL.previaConteudo.querySelector('.artigo-corpo');
            if (corpoPrevia) corpoPrevia.style.textAlign = modo;
        }

        [
            [EL.alinharEsqBtn, 'left'],
            [EL.alinharCentroBtn, 'center'],
            [EL.alinharDirBtn, 'right'],
            [EL.alinharJustBtn, 'justify']
        ].forEach(([btn, alinh]) => {
            if (btn) btn.classList.toggle('is-ativo', ESTADO.alinhamento === alinh);
        });
        guardarRascunho();
    }

    /* =====================================================================
       4. DROPDOWN DE IMAGEM (MODELO DA IMAGEM 1)
       ===================================================================== */

    function posicionarDropdown(ancora, menu) {
        if (!ancora || !menu) return;
        const rect = ancora.getBoundingClientRect();
        menu.style.top = (rect.bottom + window.scrollY + 6) + 'px';
        menu.style.left = Math.min(rect.left + window.scrollX, window.innerWidth - 220) + 'px';
        menu.hidden = false;
    }

    function alternarDropdownImagem() {
        if (!EL.imagemDropdown) return;
        if (!EL.imagemDropdown.hidden) {
            EL.imagemDropdown.hidden = true;
            return;
        }
        fecharTodosFlyouts();
        posicionarDropdown(EL.imagemBtn, EL.imagemDropdown);
    }

    function acionarUploadImagem(multiplo = false) {
        if (!EL.hiddenFileInput) return;
        EL.hiddenFileInput.accept = 'image/*';
        EL.hiddenFileInput.multiple = multiplo;
        EL.hiddenFileInput.onchange = () => {
            const files = Array.from(EL.hiddenFileInput.files);
            if (!files.length) return;

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const dataUrl = e.target.result;
                    const figuraHtml = `
                        <figure class="editor-midia-bloco" contenteditable="false">
                            <img src="${dataUrl}" alt="${D.escapeHtml(file.name)}" loading="lazy">
                            <figcaption class="editor-midia-legenda" contenteditable="true">Adicione uma legenda...</figcaption>
                        </figure>
                        <p><br></p>
                    `;
                    inserirElementoVisualNoCursor(figuraHtml);
                };
                reader.readAsDataURL(file);
            });

            avisar(`${files.length} foto${files.length > 1 ? 's' : ''} inserida${files.length > 1 ? 's' : ''} com sucesso!`, 'sucesso');
            EL.imagemDropdown.hidden = true;
        };
        EL.hiddenFileInput.click();
    }

    function abrirStockPhotos() {
        fecharTodosFlyouts();
        EL.flyoutTitle.innerHTML = '<i class="fa-solid fa-magnifying-glass" style="color:#9333ea;"></i> Stock photos (gratuitas)';
        
        let gridHtml = '<p style="font-size:.85rem;color:var(--cm-muted);margin:0 0 10px;">Clique em uma foto para adicionar instantaneamente ao artigo:</p><div class="stock-grid">';
        FOTOS_STOCK.forEach(foto => {
            gridHtml += `<img src="${foto.url}" class="stock-thumb" alt="${foto.legenda}" data-url="${foto.url}" data-legenda="${foto.legenda}">`;
        });
        gridHtml += '</div>';

        EL.flyoutBody.innerHTML = gridHtml;
        EL.flyoutInsert.classList.remove('is-active');
        EL.flyoutInsert.style.display = 'none'; // inserção é por clique na foto

        EL.flyoutBody.querySelectorAll('.stock-thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                const url = thumb.dataset.url;
                const legenda = thumb.dataset.legenda;
                const figuraHtml = `
                    <figure class="editor-midia-bloco" contenteditable="false">
                        <img src="${url}" alt="${D.escapeHtml(legenda)}" loading="lazy">
                        <figcaption class="editor-midia-legenda" contenteditable="true">${D.escapeHtml(legenda)}</figcaption>
                    </figure>
                    <p><br></p>
                `;
                inserirElementoVisualNoCursor(figuraHtml);
                fecharFlyout();
                avisar('Foto adicionada!', 'sucesso');
            });
        });

        EL.flyout.hidden = false;
    }

    function abrirModalLinkImagem() {
        fecharTodosFlyouts();
        const url = prompt('Cole o endereço (URL) da imagem:', 'https://');
        if (!url || url === 'https://') return;
        const legenda = prompt('Legenda da foto (opcional):', '') || '';

        const figuraHtml = `
            <figure class="editor-midia-bloco" contenteditable="false">
                <img src="${D.escapeHtml(url)}" alt="${D.escapeHtml(legenda)}" loading="lazy">
                <figcaption class="editor-midia-legenda" contenteditable="true">${D.escapeHtml(legenda || 'Adicione uma legenda...')}</figcaption>
            </figure>
            <p><br></p>
        `;
        inserirElementoVisualNoCursor(figuraHtml);
        avisar('Foto inserida!', 'sucesso');
    }

    /* =====================================================================
       5. FLYOUT DE ÁUDIO (MODELO DA IMAGEM 2)
       ===================================================================== */

    function abrirFlyoutAudio() {
        fecharTodosFlyouts();
        ESTADO.flyoutTipo = 'audio';
        ESTADO.flyoutDadosProntos = null;

        EL.flyoutTitle.innerHTML = 'Add audio';
        EL.flyoutInsert.style.display = 'block';
        EL.flyoutInsert.classList.remove('is-active');

        EL.flyoutBody.innerHTML = `
            <div class="flyout-dropzone" id="audioDropzone">
                <div class="flyout-dropzone__icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                <p class="flyout-dropzone__text">Drop your audio file here or click to browse</p>
                <p class="flyout-dropzone__sub">MP3, AAC, WAV, AIFF, etc.</p>
            </div>

            <div class="flyout-divisor">OR</div>

            <button type="button" class="flyout-btn-record" id="btnRecordAudio">
                <i class="fa-solid fa-circle-dot"></i> <span>Record audio</span>
            </button>

            <div class="flyout-opcoes-card">
                <div class="flyout-opcao-item">
                    <div class="flyout-opcao-info">
                        <strong>This is my narration of the post</strong>
                        <p>Subscribers will see an optional play button at the top of the post.</p>
                    </div>
                    <label class="flyout-switch">
                        <input type="checkbox" id="chkAudioNarration" checked>
                        <span class="flyout-switch__slider"></span>
                    </label>
                </div>

                <div class="flyout-opcao-item">
                    <div class="flyout-opcao-info">
                        <strong>Include download button on web</strong>
                        <p>This is only applicable for audio embeds.</p>
                    </div>
                    <label class="flyout-switch">
                        <input type="checkbox" id="chkAudioDownload">
                        <span class="flyout-switch__slider"></span>
                    </label>
                </div>
            </div>
        `;

        EL.flyout.hidden = false;

        // Dropzone de arquivo
        const dropzone = document.getElementById('audioDropzone');
        if (dropzone) {
            dropzone.addEventListener('click', () => {
                EL.hiddenFileInput.accept = 'audio/*';
                EL.hiddenFileInput.multiple = false;
                EL.hiddenFileInput.onchange = () => {
                    const file = EL.hiddenFileInput.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        ESTADO.flyoutDadosProntos = {
                            url: e.target.result,
                            nome: file.name
                        };
                        dropzone.innerHTML = `
                            <div class="flyout-dropzone__icon" style="color:#22c55e;"><i class="fa-solid fa-circle-check"></i></div>
                            <p class="flyout-dropzone__text">${D.escapeHtml(file.name)}</p>
                            <p class="flyout-dropzone__sub">Arquivo pronto para inserção</p>
                        `;
                        EL.flyoutInsert.classList.add('is-active');
                    };
                    reader.readAsDataURL(file);
                };
                EL.hiddenFileInput.click();
            });

            // Drag and drop
            dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('is-dragover'); });
            dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragover'));
            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('is-dragover');
                const file = e.dataTransfer?.files?.[0];
                if (file && file.type.includes('audio')) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        ESTADO.flyoutDadosProntos = { url: ev.target.result, nome: file.name };
                        dropzone.innerHTML = `
                            <div class="flyout-dropzone__icon" style="color:#22c55e;"><i class="fa-solid fa-circle-check"></i></div>
                            <p class="flyout-dropzone__text">${D.escapeHtml(file.name)}</p>
                            <p class="flyout-dropzone__sub">Arquivo carregado</p>
                        `;
                        EL.flyoutInsert.classList.add('is-active');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Gravação Real de Áudio por Microfone
        const btnRecord = document.getElementById('btnRecordAudio');
        if (btnRecord) {
            btnRecord.addEventListener('click', alternarGravacaoAudio);
        }
    }

    async function alternarGravacaoAudio() {
        const btnRecord = document.getElementById('btnRecordAudio');

        if (!ESTADO.gravandoAudio) {
            // Iniciar Gravação
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                ESTADO.mediaRecorder = new MediaRecorder(stream);
                ESTADO.audioChunks = [];

                ESTADO.mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) ESTADO.audioChunks.push(e.data);
                };

                ESTADO.mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(ESTADO.audioChunks, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        ESTADO.flyoutDadosProntos = {
                            url: e.target.result,
                            nome: 'Voz gravada ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                        };
                        EL.flyoutInsert.classList.add('is-active');
                        avisar('Áudio gravado com sucesso! Clique em Insert para adicionar.', 'sucesso');
                    };
                    reader.readAsDataURL(audioBlob);

                    // Desliga microfone
                    stream.getTracks().forEach(track => track.stop());
                };

                ESTADO.mediaRecorder.start();
                ESTADO.gravandoAudio = true;
                ESTADO.segundosGravacao = 0;

                btnRecord.classList.add('is-recording');
                btnRecord.innerHTML = '<i class="fa-solid fa-stop"></i> <span>Stop recording (00:00)</span>';

                clearInterval(ESTADO.timerGravacao);
                ESTADO.timerGravacao = setInterval(() => {
                    ESTADO.segundosGravacao++;
                    const m = String(Math.floor(ESTADO.segundosGravacao / 60)).padStart(2, '0');
                    const s = String(ESTADO.segundosGravacao % 60).padStart(2, '0');
                    btnRecord.querySelector('span').textContent = `Stop recording (${m}:${s})`;
                }, 1000);

            } catch (err) {
                console.error('[editor] Erro ao acessar microfone:', err);
                avisar('Não foi possível acessar o microfone. Verifique as permissões.', 'alerta');
            }
        } else {
            // Parar Gravação
            if (ESTADO.mediaRecorder && ESTADO.mediaRecorder.state !== 'inactive') {
                ESTADO.mediaRecorder.stop();
            }
            ESTADO.gravandoAudio = false;
            clearInterval(ESTADO.timerGravacao);

            btnRecord.classList.remove('is-recording');
            btnRecord.innerHTML = '<i class="fa-solid fa-check"></i> <span>Recording complete! Click to record again</span>';
        }
    }

    /* =====================================================================
       6. FLYOUT DE VÍDEO (MODELO DA IMAGEM 3)
       ===================================================================== */

    function abrirFlyoutVideo() {
        fecharTodosFlyouts();
        ESTADO.flyoutTipo = 'video';
        ESTADO.flyoutDadosProntos = null;

        EL.flyoutTitle.innerHTML = 'Embed video';
        EL.flyoutInsert.style.display = 'block';
        EL.flyoutInsert.classList.remove('is-active');

        EL.flyoutBody.innerHTML = `
            <div class="flyout-dropzone" id="videoDropzone">
                <div class="flyout-dropzone__icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                <p class="flyout-dropzone__text">Drop your video file here or click to browse</p>
                <p class="flyout-dropzone__sub">MP4, WebM, MOV, AVI, etc.</p>
            </div>

            <div class="flyout-divisor">OR LINK</div>

            <div style="margin-top:10px;">
                <input type="url" id="flyoutVideoUrlInput" placeholder="Paste YouTube or video link..." style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid var(--cm-border,#d1d5db);background:var(--cm-surface-soft,#f9fafb);font-size:.9rem;box-sizing:border-box;">
            </div>
        `;

        EL.flyout.hidden = false;

        const dropzone = document.getElementById('videoDropzone');
        const urlInput = document.getElementById('flyoutVideoUrlInput');

        if (urlInput) {
            urlInput.addEventListener('input', () => {
                const val = urlInput.value.trim();
                if (val.length > 5) {
                    ESTADO.flyoutDadosProntos = { url: val, isYoutube: true };
                    EL.flyoutInsert.classList.add('is-active');
                } else {
                    EL.flyoutInsert.classList.remove('is-active');
                }
            });
        }

        if (dropzone) {
            dropzone.addEventListener('click', () => {
                EL.hiddenFileInput.accept = 'video/*';
                EL.hiddenFileInput.multiple = false;
                EL.hiddenFileInput.onchange = () => {
                    const file = EL.hiddenFileInput.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        ESTADO.flyoutDadosProntos = { url: e.target.result, isYoutube: false, nome: file.name };
                        dropzone.innerHTML = `
                            <div class="flyout-dropzone__icon" style="color:#22c55e;"><i class="fa-solid fa-circle-check"></i></div>
                            <p class="flyout-dropzone__text">${D.escapeHtml(file.name)}</p>
                            <p class="flyout-dropzone__sub">Vídeo carregado</p>
                        `;
                        EL.flyoutInsert.classList.add('is-active');
                    };
                    reader.readAsDataURL(file);
                };
                EL.hiddenFileInput.click();
            });
        }
    }

    /* Inserção no clique do botão INSERT do Flyout */
    function executarInsertFlyout() {
        if (!ESTADO.flyoutDadosProntos) return;

        if (ESTADO.flyoutTipo === 'audio') {
            const nar = document.getElementById('chkAudioNarration')?.checked;
            const audioHtml = `
                <div class="editor-midia-bloco" contenteditable="false" style="max-width:540px;background:rgba(147,51,234,0.08);padding:1.4rem;border-radius:18px;border:1px solid rgba(147,51,234,0.25);">
                    <div style="font-weight:700;margin-bottom:.7rem;display:flex;align-items:center;gap:.6rem;color:var(--cm-text);"><i class="fa-solid fa-volume-high" style="color:#a855f7;"></i> <span>${D.escapeHtml(ESTADO.flyoutDadosProntos.nome || 'Áudio da publicação')}</span></div>
                    <audio controls src="${D.escapeHtml(ESTADO.flyoutDadosProntos.url)}" style="width:100%;"></audio>
                    ${nar ? '<small style="display:block;margin-top:.4rem;opacity:.7;font-size:.78rem;">Narração do autor</small>' : ''}
                </div>
                <p><br></p>
            `;
            inserirElementoVisualNoCursor(audioHtml);
            fecharFlyout();
            avisar('Áudio inserido com sucesso!', 'sucesso');
        }

        if (ESTADO.flyoutTipo === 'video') {
            const url = ESTADO.flyoutDadosProntos.url;
            let videoHtml = '';
            const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
            if (yt) {
                const embed = 'https://www.youtube-nocookie.com/embed/' + yt[1];
                videoHtml = `
                    <div class="editor-midia-bloco" contenteditable="false" style="max-width:680px;">
                        <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:16px;">
                            <iframe src="${D.escapeHtml(embed)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe>
                        </div>
                    </div>
                    <p><br></p>
                `;
            } else {
                videoHtml = `
                    <div class="editor-midia-bloco" contenteditable="false" style="max-width:680px;">
                        <video controls src="${D.escapeHtml(url)}" style="max-width:100%;border-radius:16px;"></video>
                    </div>
                    <p><br></p>
                `;
            }
            inserirElementoVisualNoCursor(videoHtml);
            fecharFlyout();
            avisar('Vídeo inserido com sucesso!', 'sucesso');
        }
    }

    function fecharFlyout() {
        if (EL.flyout) EL.flyout.hidden = true;
        if (ESTADO.gravandoAudio) {
            alternarGravacaoAudio();
        }
        ESTADO.flyoutTipo = null;
        ESTADO.flyoutDadosProntos = null;
    }

    function fecharTodosFlyouts() {
        if (EL.imagemDropdown) EL.imagemDropdown.hidden = true;
        if (EL.flyout) EL.flyout.hidden = true;
        if (EL.popover) EL.popover.hidden = true;
    }

    /* Popovers auxiliares (Link, Botão, Estilo, Modelo, Mais) */
    function promptInserirLinkRapido() {
        fecharTodosFlyouts();
        const sel = window.getSelection();
        const textoSel = sel ? sel.toString().trim() : '';
        const url = prompt('Cole o endereço do link (URL):', 'https://');
        if (!url || url === 'https://') return;
        const texto = textoSel || prompt('Texto do link:', 'Saiba mais') || 'Link';
        const linkHtml = `<a href="${D.escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="color:#9333ea;text-decoration:underline;font-weight:600;">${D.escapeHtml(texto)}</a>&nbsp;`;
        inserirElementoVisualNoCursor(linkHtml);
        avisar('Link adicionado!');
    }

    function promptInserirBotaoRapido() {
        fecharTodosFlyouts();
        const texto = prompt('Texto do botão:', 'Conhecer mais') || 'Acessar';
        const url = prompt('Endereço do botão (URL):', 'https://');
        if (!url || url === 'https://') return;
        const botaoHtml = `
            <div style="text-align:center;margin:1.8rem 0;" contenteditable="false">
                <a href="${D.escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="btn-artigo-escrever" style="display:inline-flex;padding:.75rem 1.6rem;font-weight:700;text-decoration:none;border-radius:999px;">
                    <span>${D.escapeHtml(texto)}</span> <i class="fa-solid fa-arrow-right" style="margin-left:6px;"></i>
                </a>
            </div>
            <p><br></p>
        `;
        inserirElementoVisualNoCursor(botaoHtml);
        avisar('Botão de ação inserido!');
    }

    function aplicarCitacao() {
        const sel = window.getSelection();
        const textoSel = sel ? sel.toString().trim() : '';
        const citacaoHtml = `
            <blockquote>${D.escapeHtml(textoSel || 'Sua citação acolhedora ou reflexão aqui.')}</blockquote>
            <p><br></p>
        `;
        inserirElementoVisualNoCursor(citacaoHtml);
        avisar('Citação formatada!');
    }

    function carregarModeloDica() {
        const atual = obterConteudoTexto();
        if (atual.length > 30) {
            if (!confirm('Deseja carregar a estrutura de Dica? O conteúdo atual será substituído pelo modelo.')) {
                return;
            }
        }

        EL.titulo.value = 'Dica rápida: ';
        EL.subtitulo.value = 'Uma estratégia simples para acolher e facilitar o dia a dia.';
        EL.corpo.innerHTML = `
            <h2>A Dica</h2>
            <p>Descreva aqui a dica prática de forma clara, direta e objetiva.</p>
            <h2>Por que isso ajuda?</h2>
            <p>Explique de que forma essa estratégia alivia a sobrecarga sensorial, o foco ou a rotina neurodivergente.</p>
            <h2>Como colocar em prática passo a passo:</h2>
            <ul>
                <li>Passo 1: Comece pequeno e sem pressão.</li>
                <li>Passo 2: Adapte ao seu ritmo e ao seu ambiente.</li>
                <li>Passo 3: Celebre o progresso.</li>
            </ul>
            <blockquote>Lembre-se: não existe regra única — o melhor método é aquele que respeita você.</blockquote>
            <p><br></p>
        `;

        if (EL.secao) EL.secao.value = 'Dicas';
        if (EL.tipo) EL.tipo.value = 'Dica';
        ESTADO.secao = 'Dicas';
        ESTADO.kind = 'Dica';

        atualizarRotulos();
        atualizarContadores();
        guardarRascunho();
        registrarNoHistorico();
        avisar('Estrutura de Dica carregada! Complete com as suas palavras.', 'sucesso');
    }

    /* Popovers da barra */
    function abrirPopover(ancora, itens) {
        if (!EL.popover) return;
        fecharTodosFlyouts();

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
                EL.popover.hidden = true;
            });
            EL.popover.appendChild(botao);
        }

        [EL.estiloBtn, EL.modeloBtn, EL.maisBtn].forEach(b => b && b.setAttribute('aria-expanded', 'false'));
        if (ancora) ancora.setAttribute('aria-expanded', 'true');
    }

    function menuEstilo() {
        abrirPopover(EL.estiloBtn, D.ESTILOS.map(estilo => ({
            texto: estilo.nome,
            descricao: estilo.descricao,
            ativo: ESTADO.style === estilo.valor,
            acao: () => {
                ESTADO.style = estilo.valor;
                if (EL.folha) {
                    EL.folha.classList.remove('estilo-serifada', 'estilo-sem-serifa', 'estilo-poetica');
                    EL.folha.classList.add('estilo-' + estilo.valor);
                }
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
                texto: '💡 Lançar uma Dica Rápida',
                descricao: 'Carrega o formato ideal para compartilhar uma dica acolhedora',
                acao: carregarModeloDica
            },
            { separador: true },
            {
                texto: '📋 Copiar o texto',
                descricao: 'Copia o conteúdo para a área de transferência',
                acao: async () => {
                    const texto = [EL.titulo.value, EL.subtitulo.value, obterConteudoTexto()].filter(Boolean).join('\n\n');
                    try {
                        await navigator.clipboard.writeText(texto);
                        avisar('Texto copiado com sucesso!', 'sucesso');
                    } catch (e) {
                        avisar('Não foi possível copiar automaticamente.');
                    }
                }
            },
            {
                texto: '🗑️ Limpar tudo',
                descricao: 'Reinicia a folha e descarta este rascunho local',
                acao: () => {
                    if (!confirm('Deseja mesmo limpar a folha? O rascunho salvo neste navegador será reiniciado.')) return;
                    EL.titulo.value = '';
                    EL.subtitulo.value = '';
                    EL.corpo.innerHTML = '';
                    atualizarContadores();
                    guardarRascunho();
                    montarPrevia();
                    avisar('Folha limpa.');
                }
            },
            { separador: true },
            {
                texto: 'Voltar aos artigos',
                descricao: 'Retorna para a listagem da comunidade',
                acao: () => { window.location.href = '/comunidade/artigos.html'; }
            }
        ]);
    }

    /* =====================================================================
       7. PRÉ-VISUALIZAÇÃO, CONFIGURAÇÕES E PUBLICAÇÃO
       ===================================================================== */

    function montarPrevia() {
        if (!EL.previaConteudo) return;

        const titulo = EL.titulo.value.trim();
        const subtitulo = EL.subtitulo.value.trim();
        const corpoHtml = obterConteudoHtml();

        const autor = localStorage.getItem('userName') || (ESTADO.usuario?.email ? ESTADO.usuario.email.split('@')[0] : 'Você');
        const avatar = D.urlSegura(localStorage.getItem('userAvatar')) || D.AVATAR_PADRAO;

        const aviso = EL.sensivel.checked
            ? `<p class="artigo-aviso"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>${D.escapeHtml(EL.aviso.value.trim() || 'Este texto aborda temas sensíveis.')}</span></p>`
            : '';

        const capa = ''; // Sem capa por enquanto
        const secaoEscolhida = EL.secao.value.trim() || 'Dicas';
        const tipoEscolhido = EL.tipo.value || 'Dica';

        EL.previaConteudo.innerHTML = `
            <article class="artigo-cartao artigo-cartao--${D.escapeHtml(ESTADO.template)}">
                ${capa ? `<img class="artigo-capa" src="${D.escapeHtml(capa)}" alt="">` : ''}
                <div style="display:flex; gap:.6rem; align-items:center; margin-bottom:.5rem;">
                    <span class="artigo-secao">${D.escapeHtml(secaoEscolhida)}</span>
                    <span class="art-chip art-chip--tipo" style="font-size:.75rem;">${D.escapeHtml(tipoEscolhido)}</span>
                </div>
                <h1 class="artigo-titulo">${D.escapeHtml(titulo || 'Comece a escrever…')}</h1>
                ${subtitulo ? `<p class="artigo-subtitulo">${D.escapeHtml(subtitulo)}</p>` : ''}
                ${aviso}
                <div class="artigo-byline">
                    <span class="artigo-byline__autor">
                        <span class="artigo-byline__avatar" aria-hidden="true"><img src="${D.escapeHtml(avatar)}" alt="" style="width:28px;height:28px;border-radius:50%;object-fit:cover;"></span>
                        <span>
                            <span class="artigo-byline__nome">${D.escapeHtml(autor)}</span>
                            <span class="artigo-byline__handle">@autor</span>
                        </span>
                    </span>
                    <span class="artigo-byline__data">${D.formatarDataLonga(new Date().toISOString()) || ''}</span>
                    <span class="artigo-byline__data">${D.minutosLeitura(corpoHtml)} MIN LEITURA</span>
                </div>
                <div class="artigo-corpo artigo-corpo--${D.escapeHtml(ESTADO.style)}" style="text-align: ${ESTADO.alinhamento};">
                    ${corpoHtml ? D.renderizarConteudo(corpoHtml) : '<p style="opacity:.6">O conteúdo da sua publicação aparece aqui formatado em tempo real.</p>'}
                </div>
            </article>
        `;
    }

    function alternarPrevia(ligar) {
        if (!EL.previa || !EL.folha) return;

        const mostrar = ligar === undefined ? !EL.previa.classList.contains('is-visivel') : ligar;

        EL.previa.classList.toggle('is-visivel', mostrar);
        EL.folha.classList.toggle('is-previa', mostrar);
        if (EL.previaBtn) {
            EL.previaBtn.classList.toggle('is-ativo', mostrar);
            EL.previaBtn.setAttribute('aria-pressed', mostrar ? 'true' : 'false');
        }

        if (mostrar) {
            montarPrevia();
            EL.previa.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function alternarConfig(ligar) {
        if (!EL.configPainel) return;
        const mostrar = ligar === undefined ? EL.configPainel.hidden : ligar;
        EL.configPainel.hidden = !mostrar;
        if (EL.configAbrir) EL.configAbrir.setAttribute('aria-expanded', mostrar ? 'true' : 'false');
        if (mostrar && EL.secao) {
            EL.secao.focus();
        }
    }

    function validar() {
        const titulo = EL.titulo.value.trim();
        const textoCorpo = obterConteudoTexto();

        if (titulo.length < 3) {
            avisar('O título precisa de pelo menos 3 caracteres.', 'alerta');
            EL.titulo.focus();
            return false;
        }
        if (textoCorpo.length < 20) {
            avisar('Escreva pelo menos 20 caracteres para que sua publicação tenha conteúdo.', 'alerta');
            EL.corpo.focus();
            return false;
        }
        return true;
    }

    async function publicar() {
        if (!ESTADO.usuario) {
            avisar('Entre na sua conta para publicar. O rascunho está seguro no seu navegador.', 'alerta');
            alternarConfig(false);
            if (EL.loginAviso) EL.loginAviso.hidden = false;
            return;
        }

        if (!validar()) return;

        const sb = window.supabaseClient;
        if (!sb) {
            avisar('Não foi possível conectar ao banco de dados no momento.', 'alerta');
            return;
        }

        const corpoHtml = obterConteudoHtml();

        const payload = {
            author_id: ESTADO.usuario.id,
            author_name: localStorage.getItem('userName') || (ESTADO.usuario.email ? ESTADO.usuario.email.split('@')[0] : 'Membro da comunidade'),
            author_avatar: D.urlSegura(localStorage.getItem('userAvatar')) || D.AVATAR_PADRAO,
            title: EL.titulo.value.trim(),
            subtitle: EL.subtitulo.value.trim() || null,
            content: corpoHtml,
            category: (EL.secao.value || 'Dicas').trim(),
            kind: EL.tipo.value || 'Dica',
            style: ESTADO.style,
            template: ESTADO.template,
            cover_url: null, // Sem capa por enquanto (elemento n�o existe no editor)
            sensitive: EL.sensivel.checked,
            warning: EL.sensivel.checked ? (EL.aviso.value.trim() || 'Este texto aborda temas sensíveis.') : null,
            is_paid: EL.pago.checked,
            priority: EL.prioridade.value ? Number(EL.prioridade.value) : null,
            status: 'publicado',
            is_active: true,
            read_minutes: D.minutosLeitura(obterConteudoTexto()),
            updated_at: new Date().toISOString()
        };

        EL.publicarBtn.disabled = true;
        EL.publicarBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Publicando…';

        try {
            let idFinal;

            async function executarInsertOuUpdate(dadosPayload) {
                if (ESTADO.editando && ESTADO.artigoId) {
                    const { error } = await sb.from('articles').update(dadosPayload).eq('id', ESTADO.artigoId).eq('author_id', ESTADO.usuario.id);
                    if (error) throw error;
                    return ESTADO.artigoId;
                } else {
                    const { data, error } = await sb
                        .from('articles')
                        .insert({ ...dadosPayload, created_at: new Date().toISOString() })
                        .select('id')
                        .single();
                    if (error) throw error;
                    return data.id;
                }
            }

            try {
                idFinal = await executarInsertOuUpdate(payload);
            } catch (errConstraint) {
                const msg = String(errConstraint?.message || '').toLowerCase();
                if (msg.includes('articles_kind_check') || msg.includes('constraint') || errConstraint.code === '23514') {
                    console.warn('[editor] Fallback seguro de constraint: salvando kind=Guia com category=Dicas.');
                    payload.kind = 'Guia';
                    if (!payload.category || payload.category === 'Relatos') payload.category = 'Dicas';
                    idFinal = await executarInsertOuUpdate(payload);
                } else {
                    throw errConstraint;
                }
            }

            try {
                localStorage.removeItem(chaveRascunho());
            } catch (e) { /* silencioso */ }

            avisar('Publicado com sucesso! Abrindo na área de Blogs…', 'sucesso');

            setTimeout(() => {
                window.location.href = D.caminhoBlogArtigo(idFinal);
            }, 1200);
            return;

        } catch (error) {
            console.error('[editor] Erro ao publicar:', error);
            const mensagem = D.ehTabelaAusente(error)
                ? D.AVISO_BANCO
                : (D.ehErroDeSessao(error)
                    ? 'Sua sessão expirou. Entre novamente para publicar.'
                    : 'Não foi possível publicar agora. Verifique a conexão e tente de novo.');

            avisar(mensagem, 'alerta');
        } finally {
            EL.publicarBtn.disabled = false;
            EL.publicarBtn.innerHTML = '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Publicar artigo';
        }
    }

    async function salvarRascunhoNoBanco() {
        if (!ESTADO.usuario) {
            avisar('Entre na sua conta para sincronizar o rascunho na nuvem. Ele já está seguro neste navegador.', 'alerta');
            return;
        }

        const corpoHtml = obterConteudoHtml();
        if (!EL.titulo.value.trim() && !corpoHtml) {
            avisar('Escreva pelo menos um título ou trecho antes de salvar na nuvem.', 'alerta');
            return;
        }

        const sb = window.supabaseClient;
        const payload = {
            author_id: ESTADO.usuario.id,
            author_name: localStorage.getItem('userName') || (ESTADO.usuario.email ? ESTADO.usuario.email.split('@')[0] : 'Membro da comunidade'),
            author_avatar: D.urlSegura(localStorage.getItem('userAvatar')) || D.AVATAR_PADRAO,
            title: (EL.titulo.value.trim() || 'Sem título') + (ESTADO.editando ? '' : ' (rascunho)'),
            subtitle: EL.subtitulo.value.trim() || null,
            content: corpoHtml,
            category: (EL.secao.value || 'Dicas').trim(),
            kind: EL.tipo.value === 'Dica' ? 'Guia' : (EL.tipo.value || 'Guia'),
            style: ESTADO.style,
            template: ESTADO.template,
            cover_url: null, // Sem capa por enquanto (elemento n�o existe no editor)
            sensitive: EL.sensivel.checked,
            warning: EL.sensivel.checked ? (EL.aviso.value.trim() || 'Este texto aborda temas sensíveis.') : null,
            is_paid: EL.pago.checked,
            priority: EL.prioridade.value ? Number(EL.prioridade.value) : null,
            status: 'rascunho',
            is_active: true,
            read_minutes: D.minutosLeitura(obterConteudoTexto()),
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
            avisar('Rascunho sincronizado com sua conta na nuvem!', 'sucesso');
        } catch (error) {
            console.error('[editor] Erro ao salvar o rascunho:', error);
            avisar('Não foi possível sincronizar na nuvem agora. O rascunho local permanece seguro.', 'alerta');
        }
    }

    async function carregarParaEditar(id) {
        const sb = window.supabaseClient;
        if (!sb) return;

        const { data, error } = await D.consultar(sb, () => sb
            .from('articles')
            .select('*')
            .eq('id', id)
            .maybeSingle());

        if (error || !data) {
            avisar('Não foi possível abrir este artigo para edição.', 'alerta');
            return;
        }

        if (ESTADO.usuario && data.author_id && data.author_id !== ESTADO.usuario.id) {
            avisar('Este artigo pertence a outro autor. Você está visualizando em modo de cópia.', 'alerta');
        } else {
            ESTADO.artigoId = data.id;
            ESTADO.editando = true;
        }

        preencher(data);
        document.title = `Editar: ${data.title} — Amor NeuroDivergente`;
    }

    /* =====================================================================
       7.b CAPA POR UPLOAD
       --------------------------------------------------------------------
       8. LIGAÇÃO DE EVENTOS
       ===================================================================== */

    function ligarEventos() {
        if (EL.titulo) {
            EL.titulo.addEventListener('input', () => { atualizarContadores(); guardarRascunho(); });
        }
        if (EL.subtitulo) {
            EL.subtitulo.addEventListener('input', () => { atualizarContadores(); guardarRascunho(); });
        }
        if (EL.corpo) {
            EL.corpo.addEventListener('input', () => {
                atualizarContadores();
                guardarRascunho();
                registrarNoHistorico();
            });

            // Colar imagem direto pelo clipboard (Ctrl+V)
            EL.corpo.addEventListener('paste', (e) => {
                const items = (e.clipboardData || e.originalEvent.clipboardData)?.items;
                if (!items) return;

                for (const item of items) {
                    if (item.type.indexOf('image') !== -1) {
                        e.preventDefault();
                        const blob = item.getAsFile();
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const dataUrl = event.target.result;
                            const figuraHtml = `
                                <figure class="editor-midia-bloco" contenteditable="false">
                                    <img src="${dataUrl}" alt="Imagem colada" loading="lazy">
                                    <figcaption class="editor-midia-legenda" contenteditable="true">Adicione uma legenda...</figcaption>
                                </figure>
                                <p><br></p>
                            `;
                            inserirElementoVisualNoCursor(figuraHtml);
                            avisar('Imagem colada com sucesso!', 'sucesso');
                        };
                        reader.readAsDataURL(blob);
                        return;
                    }
                }
            });
        }

        // Metadados
        if (EL.secao) EL.secao.addEventListener('input', () => { atualizarRotulos(); guardarRascunho(); });
        if (EL.tipo) EL.tipo.addEventListener('change', () => { atualizarRotulos(); guardarRascunho(); });
        if (EL.aviso) EL.aviso.addEventListener('input', guardarRascunho);
        if (EL.sensivel) EL.sensivel.addEventListener('change', guardarRascunho);
        if (EL.pago) EL.pago.addEventListener('change', guardarRascunho);

        if (EL.prioridade) {
            EL.prioridade.addEventListener('input', () => {
                if (EL.prioridadeValor) EL.prioridadeValor.textContent = `${EL.prioridade.value}/10`;
                guardarRascunho();
            });
        }

        // Undo e Redo
        if (EL.desfazerBtn) EL.desfazerBtn.addEventListener('click', desfazer);
        if (EL.refazerBtn) EL.refazerBtn.addEventListener('click', refazer);

        // Formatações visuais
        if (EL.negritoBtn) EL.negritoBtn.addEventListener('click', () => executarComando('bold'));
        if (EL.italicoBtn) EL.italicoBtn.addEventListener('click', () => executarComando('italic'));
        if (EL.riscadoBtn) EL.riscadoBtn.addEventListener('click', () => executarComando('strikeThrough'));
        if (EL.codigoBtn) EL.codigoBtn.addEventListener('click', () => {
            const sel = window.getSelection();
            const txt = sel ? sel.toString() : '';
            if (txt.includes('\n')) {
                inserirElementoVisualNoCursor(`<pre><code>${D.escapeHtml(txt || 'código')}</code></pre><p><br></p>`);
            } else {
                inserirElementoVisualNoCursor(`<code>${D.escapeHtml(txt || 'código')}</code>&nbsp;`);
            }
        });
        if (EL.tituloBtn) EL.tituloBtn.addEventListener('click', () => {
            const sel = window.getSelection();
            const txt = sel ? sel.toString().trim() : '';
            inserirElementoVisualNoCursor(`<h2>${D.escapeHtml(txt || 'Subtítulo')}</h2><p><br></p>`);
        });
        if (EL.linhaBtn) EL.linhaBtn.addEventListener('click', () => {
            inserirElementoVisualNoCursor('<hr><p><br></p>');
        });
        if (EL.cotacaoBtn) EL.cotacaoBtn.addEventListener('click', aplicarCitacao);

        // Listas
        if (EL.listaBulletBtn) EL.listaBulletBtn.addEventListener('click', () => executarComando('insertUnorderedList'));
        if (EL.listaNumBtn) EL.listaNumBtn.addEventListener('click', () => executarComando('insertOrderedList'));

        // Alinhamentos
        if (EL.alinharEsqBtn) EL.alinharEsqBtn.addEventListener('click', () => aplicarAlinhamento('left'));
        if (EL.alinharCentroBtn) EL.alinharCentroBtn.addEventListener('click', () => aplicarAlinhamento('center'));
        if (EL.alinharDirBtn) EL.alinharDirBtn.addEventListener('click', () => aplicarAlinhamento('right'));
        if (EL.alinharJustBtn) EL.alinharJustBtn.addEventListener('click', () => aplicarAlinhamento('justify'));

        // 1. DROPDOWN DE IMAGEM (Substack Imagem 1)
        if (EL.imagemBtn) EL.imagemBtn.addEventListener('click', alternarDropdownImagem);
        if (EL.optImgUpload) EL.optImgUpload.addEventListener('click', () => acionarUploadImagem(false));
        if (EL.optImgGallery) EL.optImgGallery.addEventListener('click', () => acionarUploadImagem(true));
        if (EL.optImgStock) EL.optImgStock.addEventListener('click', abrirStockPhotos);
        if (EL.optImgLink) EL.optImgLink.addEventListener('click', abrirModalLinkImagem);

        // 2. FLYOUT DE ÁUDIO (Substack Imagem 2)
        if (EL.audioBtn) EL.audioBtn.addEventListener('click', abrirFlyoutAudio);

        // 3. FLYOUT DE VÍDEO (Substack Imagem 3)
        if (EL.videoBtn) EL.videoBtn.addEventListener('click', abrirFlyoutVideo);

        // Flyout Footer Ações
        if (EL.flyoutClose) EL.flyoutClose.addEventListener('click', fecharFlyout);
        if (EL.flyoutCancel) EL.flyoutCancel.addEventListener('click', fecharFlyout);
        if (EL.flyoutInsert) EL.flyoutInsert.addEventListener('click', executarInsertFlyout);

        // Outros botões
        if (EL.linkBtn) EL.linkBtn.addEventListener('click', promptInserirLinkRapido);
        if (EL.botaoBtn) EL.botaoBtn.addEventListener('click', promptInserirBotaoRapido);

        // Ações de topo
        if (EL.previaBtn) EL.previaBtn.addEventListener('click', () => alternarPrevia());

        if (EL.estiloBtn) {
            EL.estiloBtn.addEventListener('click', () => {
                if (EL.popover && !EL.popover.hidden) { EL.popover.hidden = true; return; }
                menuEstilo();
            });
        }
        if (EL.modeloBtn) {
            EL.modeloBtn.addEventListener('click', () => {
                if (EL.popover && !EL.popover.hidden) { EL.popover.hidden = true; return; }
                menuModelo();
            });
        }
        if (EL.maisBtn) {
            EL.maisBtn.addEventListener('click', () => {
                if (EL.popover && !EL.popover.hidden) { EL.popover.hidden = true; return; }
                menuMais();
            });
        }

        if (EL.continuarBtn) {
            EL.continuarBtn.addEventListener('click', () => {
                alternarConfig(true);
                guardarRascunho();
            });
        }

        if (EL.autorAdicionarBtn) {
            EL.autorAdicionarBtn.addEventListener('click', () => {
                window.location.href = '/comunidade/perfil.html';
            });
        }

        if (EL.autorRemoverBtn) {
            EL.autorRemoverBtn.addEventListener('click', () => {
                const novoNome = prompt('Como prefere assinar esta publicação?', EL.autorNome ? EL.autorNome.textContent : 'Você');
                if (novoNome && novoNome.trim()) {
                    localStorage.setItem('userName', novoNome.trim());
                    atualizarPerfilAutor();
                }
            });
        }

        if (EL.configAbrir) EL.configAbrir.addEventListener('click', () => alternarConfig());
        if (EL.configFechar) EL.configFechar.addEventListener('click', () => alternarConfig(false));
        if (EL.rascunhoBtn) EL.rascunhoBtn.addEventListener('click', salvarRascunhoNoBanco);
        if (EL.publicarBtn) EL.publicarBtn.addEventListener('click', publicar);

        // Fechar flyouts e dropdowns ao clicar fora
        document.addEventListener('click', (evento) => {
            if (EL.imagemDropdown && !EL.imagemDropdown.hidden) {
                if (!EL.imagemDropdown.contains(evento.target) && !EL.imagemBtn.contains(evento.target)) {
                    EL.imagemDropdown.hidden = true;
                }
            }

            if (EL.popover && !EL.popover.hidden) {
                if (!EL.popover.contains(evento.target) && !evento.target.closest('.editor-ferramenta')) {
                    EL.popover.hidden = true;
                }
            }
        });

        // ESC fecha tudo
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                fecharTodosFlyouts();
            }
        });

        // Atalhos de teclado
        document.addEventListener('keydown', (evento) => {
            const ctrlOuCmd = evento.ctrlKey || evento.metaKey;

            if (ctrlOuCmd && evento.key.toLowerCase() === 's') {
                evento.preventDefault();
                guardarRascunho();
                avisar('Rascunho guardado neste navegador.', 'sucesso');
            }

            if (ctrlOuCmd && !evento.shiftKey && evento.key.toLowerCase() === 'z' && document.activeElement === EL.corpo) {
                evento.preventDefault();
                desfazer();
            }

            if (ctrlOuCmd && (evento.key.toLowerCase() === 'y' || (evento.shiftKey && evento.key.toLowerCase() === 'z')) && document.activeElement === EL.corpo) {
                evento.preventDefault();
                refazer();
            }
        });

        window.addEventListener('beforeunload', guardarRascunho);
    }

    /* =====================================================================
       INICIALIZAÇÃO
       ===================================================================== */

    async function iniciar() {
        ESTADO.idLocal = idLocal();

        if (EL.secaoLista && D.SECOES) {
            EL.secaoLista.innerHTML = D.SECOES.map(s => `<option value="${D.escapeHtml(s)}"></option>`).join('');
        }
        if (EL.tipo && D.TIPOS) {
            EL.tipo.innerHTML = D.TIPOS.map(t => `<option value="${D.escapeHtml(t)}"${t === 'Dica' ? ' selected' : ''}>${D.escapeHtml(t)}</option>`).join('');
        }

        const sb = window.supabaseClient;
        if (sb && sb.auth) {
            try {
                const { data } = await sb.auth.getSession();
                ESTADO.usuario = data?.session?.user || null;
            } catch (e) { /* visitante */ }
        }

        const logado = !!ESTADO.usuario;
        if (EL.loginAviso) EL.loginAviso.hidden = logado;
        if (EL.loginLink) {
            EL.loginLink.href = `/login/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        }

        atualizarPerfilAutor();
        ligarEventos();

        if (idDaUrl) {
            await carregarParaEditar(idDaUrl);
        } else {
            const rascunho = lerRascunho();
            if (rascunho) {
                preencher(rascunho);
            } else {
                if (EL.secao) EL.secao.value = 'Dicas';
                if (EL.tipo) EL.tipo.value = 'Dica';
                ESTADO.secao = 'Dicas';
                ESTADO.kind = 'Dica';
                atualizarRotulos();
                registrarNoHistorico();
            }
        }

        atualizarContadores();
        atualizarRotulos();
        if (EL.prioridadeValor && EL.prioridade) {
            EL.prioridadeValor.textContent = `${EL.prioridade.value}/10`;
        }

        console.log('✍️ Editor Substack-Style inicializado com sucesso!');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
