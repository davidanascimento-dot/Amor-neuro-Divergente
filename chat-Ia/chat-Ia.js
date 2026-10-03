/**
 * chat-Ia.js — página de conversa com a Lia
 *
 * Toda a lógica de estado, rede, histórico e crise está em
 * /Acolher-IA/conversa.js. Este arquivo é só a interface: desenha as
 * mensagens, liga os botões e cuida do que é próprio da página (voz,
 * ferramentas por resposta, lista de conversas, recursos do site).
 */
document.addEventListener('DOMContentLoaded', function () {

    const C = window.AcolheriaConversa;

    const $ = function (id) { return document.getElementById(id); };

    const rolagem   = $('ciaMensagens');
    const form      = $('ciaForm');
    const campo     = $('ciaInput');
    const btnEnviar = $('ciaBtnEnviar');
    const btnVoz    = $('ciaBtnVoz');
    const ferramentas = $('ciaFerramentas');
    const recursos  = $('ciaRecursos');
    const recursosLista = $('ciaRecursosLista');
    const sugestoes = $('ciaSugestoes');
    const lateral   = $('ciaLateral');
    const lista     = $('ciaListaConversas');
    const btnSalvar = $('ciaBtnSalvar');
    const status    = $('ciaStatus');

    // =========================================
    // Aviso temporário ("conversa salva")
    // =========================================
    let torradaTimer = null;

    function avisar(texto) {
        let el = document.querySelector('.cia-torrada');
        if (!el) {
            el = document.createElement('div');
            el.className = 'cia-torrada';
            el.setAttribute('role', 'status');
            document.body.appendChild(el);
        }
        el.textContent = texto;
        el.hidden = false;
        clearTimeout(torradaTimer);
        torradaTimer = setTimeout(function () { el.hidden = true; }, 3200);
    }

    // =========================================
    // Conteúdos do site, por assunto
    //
    // Aparecem quando a conversa é sobre um tema que o site cobre. O
    // objetivo é não obrigar a pessoa a sair do chat para ler: ela lê
    // a explicação, e o link fica ali se quiser ir mais fundo.
    // =========================================
    const RECURSOS = [
        {
            termos: ['direito', 'lei', 'beneficio', 'benefício', 'bpc', 'meia',
                     'isencao', 'isenção', 'transporte', 'passa livre', 'lei 14.129', 'plano de carreira'],
            itens: [
                { texto: 'Seus Direitos', href: '/Direitos/direitos.html' },
                { texto: 'Leis e Benefícios', href: '/Direitos/direitos.html#leis' }
            ]
        },
        {
            termos: ['tdah', 'atencao', 'atenção', 'foco', 'concentr', 'hiperativ', 'procrastina'],
            itens: [
                { texto: 'TDAH', href: '/Recursos/autismo/Tdah.html' },
                { texto: 'Organização', href: '/Recursos/recursos.html' }
            ]
        },
        {
            termos: ['autismo', 'autista', 'tea', 'espectro', 'sensory', 'sensorial', 'melhoria'],
            itens: [
                { texto: 'Autismo', href: '/Recursos/autismo/autismo.html' },
                { texto: 'Altas Habilidades', href: '/Recursos/autismo/altas-abilidades.html' }
            ]
        },
        {
            termos: ['dislexia', 'leitura', 'escrita', 'ortografia', 'grafia'],
            itens: [
                { texto: 'Dislexia', href: '/Recursos/autismo/dislexia.html' },
                { texto: 'Saúde mental', href: '/Recursos/autismo/saúde.html' }
            ]
        },
        {
            termos: ['diagnostico', 'diagnóstico', 'avaliacao', 'avaliação', 'terapia', 'terapeuta', 'medicacao', 'medicação'],
            itens: [
                { texto: 'Recursos de saúde', href: '/Recursos/autismo/saúde.html' },
                { texto: 'Comunidade', href: '/comunidade/comunidade.html' }
            ]
        },
        {
            termos: ['comunidade', 'pessoa', 'amigo', 'grupo', 'conversar com gente', 'isolad'],
            itens: [
                { texto: 'Entrar na comunidade', href: '/comunidade/comunidade.html' },
                { texto: 'Explorar', href: '/Explorar/Explorar.html' }
            ]
        }
    ];

    function mostrarRecursos(texto) {
        const t = String(texto || '').toLowerCase();
        const achados = [];

        RECURSOS.forEach(function (grupo) {
            if (grupo.termos.some(function (termo) { return t.indexOf(termo) !== -1; })) {
                grupo.itens.forEach(function (item) {
                    const jaTem = achados.some(function (a) { return a.href === item.href; });
                    if (!jaTem) achados.push(item);
                });
            }
        });

        // Limite: mais que quatro vira rolagem infinita de link.
        const listaFinal = achados.slice(0, 4);

        if (!listaFinal.length) {
            recursos.hidden = true;
            return;
        }

        recursosLista.textContent = '';
        listaFinal.forEach(function (item) {
            const a = document.createElement('a');
            a.className = 'cia-recurso';
            a.href = item.href;
            a.textContent = item.texto;
            const icone = document.createElement('i');
            icone.className = 'fa-solid fa-arrow-right';
            icone.setAttribute('aria-hidden', 'true');
            a.appendChild(icone);
            recursosLista.appendChild(a);
        });
        recursos.hidden = false;
    }

    // =========================================
    // Voz
    //
    // Reconhecimento de voz é do navegador (Chrome e Edge). Não é
    // garantido em todo lugar, então o botão some quando não existe em
    // vez de ficar ali falhando.
    // =========================================
    const Reconhecimento = window.SpeechRecognition || window.webkitSpeechRecognition;
    let reconhecendo = null;
    let vozAntesDeGravar = '';

    function temVoz() { return Boolean(Reconhecimento); }

    function alternarVoz() {
        if (!Reconhecimento) return;

        if (reconhecendo) {
            try { reconhecendo.stop(); } catch (e) { /* ja parado */ }
            return;
        }

        try {
            reconhecendo = new Reconhecimento();
        } catch (e) {
            avisar('Seu navegador não deixou usar o microfone.');
            return;
        }

        reconhecendo.lang = 'pt-BR';
        reconhecendo.continuous = false;
        reconhecendo.interimResults = false;

        // Se a pessoa já tinha escrito algo, o ditado continua a frase
        // em vez de apagar.
        vozAntesDeGravar = campo.value.trim() ? campo.value.trim() + ' ' : '';

        reconhecendo.onstart = function () {
            btnVoz.setAttribute('aria-pressed', 'true');
            btnVoz.setAttribute('aria-label', 'Parar de falar');
            if (status) status.lastChild.textContent = '  ouvindo você…';
        };

        reconhecendo.onresult = function (ev) {
            let dito = '';
            for (let i = ev.resultIndex; i < ev.results.length; i++) {
                if (ev.results[i].isFinal) dito += ev.results[i][0].transcript;
            }
            if (dito) {
                campo.value = (vozAntesDeGravar + dito).trim();
                ajustarAltura();
                campo.focus();
            }
        };

        reconhecendo.onerror = function (ev) {
            if (ev.error === 'not-allowed') {
                avisar('Preciso da sua permissão para usar o microfone.');
            } else if (ev.error !== 'aborted' && ev.error !== 'no-speech') {
                avisar('Não consegui ouvir. Tente escrever.');
            }
        };

        reconhecendo.onend = function () {
            reconhecendo = null;
            btnVoz.setAttribute('aria-pressed', 'false');
            btnVoz.setAttribute('aria-label', 'Falar em vez de digitar');
            if (status) status.lastChild.textContent = ' assistente virtual';
        };

        try {
            reconhecendo.start();
        } catch (e) {
            reconhecendo = null;
        }
    }

    function lerEmVoz(texto) {
        if (!('speechSynthesis' in window)) {
            avisar('Seu navegador não lê texto em voz alta.');
            return false;
        }
        window.speechSynthesis.cancel();
        const fala = new SpeechSynthesisUtterance(String(texto || '').replace(/[*#•]/g, ''));
        fala.lang = 'pt-BR';
        fala.rate = 1;
        window.speechSynthesis.speak(fala);
        return true;
    }

    // =========================================
    // Desenho
    // =========================================
    function avatarDaLia() {
        const caixa = document.createElement('div');
        caixa.className = 'cia-msg-avatar';
        const caminho = (window.IMAGENS || {})['lia-avatar-novo'];

        if (caminho) {
            const img = document.createElement('img');
            img.src = caminho;
            img.alt = '';
            img.setAttribute('data-img-slot', 'lia-avatar-novo');
            img.addEventListener('error', function () {
                caixa.textContent = '';
                const icone = document.createElement('i');
                icone.className = 'fa-solid fa-robot';
                icone.setAttribute('aria-hidden', 'true');
                caixa.appendChild(icone);
            }, { once: true });
            caixa.appendChild(img);
        } else {
            const icone = document.createElement('i');
            icone.className = 'fa-solid fa-robot';
            icone.setAttribute('aria-hidden', 'true');
            caixa.appendChild(icone);
        }
        return caixa;
    }

    function desenharMensagem(msg) {
        const eDaLia = msg.role === 'assistant';
        const linha = document.createElement('div');
        linha.className = 'cia-msg ' + (eDaLia ? 'cia-msg-lia' : 'cia-msg-eu');

        if (eDaLia) {
            linha.appendChild(avatarDaLia());
        } else {
            const av = document.createElement('div');
            av.className = 'cia-msg-avatar';
            av.innerHTML = '<i class="fa-solid fa-user" aria-hidden="true"></i>';
            linha.appendChild(av);
        }

        const bolha = document.createElement('div');
        bolha.className = 'cia-bolha';
        // C.formatarMensagem escapa o HTML antes de aplicar a formatação.
        bolha.innerHTML = C.formatarMensagem(msg.content);
        linha.appendChild(bolha);

        rolagem.appendChild(linha);
        return linha;
    }

    function desenharTudo() {
        rolagem.textContent = '';

        // O aviso "Lia é uma inteligência artificial" NAO entra aqui.
        // Ele fica uma vez so, em `.cia-rodape-nota`, no rodape em cima
        // do campo. Antes ele aparecia duas vezes: uma injetada no topo
        // da conversa e outra no rodape, com quase o mesmo texto. Duas
        // vezes a mesma frase teaches a pessoa a nao ler nenhuma das duas
        // — e a do topo rolava para fora da tela assim que a conversa
        // começava, que era justo o momento em que mais importava.
        //
        // No rodape ele e melhor porque fica sempre a vista: e a hora em
        // que a pessoa esta prestes a pedir algo.

        const mensagens = C.mensagens();
        if (!mensagens.length) {
            // Conversa vazia: é a Lia se apresentando, com a personagem
            // e as quatro escolhas já visíveis no rodapé.
            const tela = montarIntroducao();
            rolagem.appendChild(tela);
            apresentarLia(tela);
        } else {
            mensagens.forEach(desenharMensagem);
        }

        const ultima = mensagens[mensagens.length - 1];
        const podeReformatar = ultima && ultima.role === 'assistant';
        ferramentas.hidden = !podeReformatar;
        if (podeReformatar) btnOuvir.dataset.texto = ultima.content;

        irParaFim();
    }

    // =========================================
    // INTRODUÇÃO DA LIA
    //
    // É aqui que a Lia se apresenta. Na gaveta do mini chat não há
    // introdução: 420px de largura e uma frase pedida depressa não
    // comportam uma apresentação de quatro segundos e meio.
    //
    // A sequência:
    //   0,0s  a Lia entra, com opacidade e um deslocamento curto
    //   0,5s  o balão de fala aparece
    //   2,5s  a frase do balão troca
    //   4,5s  tudo sai e sobra a conversa
    //
    // Três garantias: o campo nunca é travado, quem tem movimento
    // reduzido no sistema não vê animação nenhuma, e basta a pessoa
    // digitar ou clicar que a intro é cancelada na hora — não faz
    // sentido apresentar uma abertura para quem já começou.
    // =========================================

    const CHAVE_INTRO = 'cia-intro-vista';
    const FRASE_1 = 'Oi! Eu sou a Lia. Que bom ter você aqui!';
    const FRASE_2 = 'Como posso te ajudar hoje?';

    function introDeveRodar() {
        try {
            if (localStorage.getItem('acolheria-abertura') === 'off') return false;
        } catch (e) { /* sem localStorage: segue */ }

        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return false;
        }

        // Uma vez por sessão.
        try {
            if (sessionStorage.getItem(CHAVE_INTRO)) return false;
            sessionStorage.setItem(CHAVE_INTRO, '1');
        } catch (e) { /* sem sessionStorage: anima sempre */ }

        return true;
    }

    /** Monta a tela de abertura com a personagem, o balão e o texto. */
    function montarIntroducao() {
        const tela = document.createElement('div');
        tela.className = 'cia-intro';

        const arte = document.createElement('div');
        arte.className = 'cia-intro-arte';

        // O balão vem ANTES da imagem no DOM: é assim que ele aparece
        // acima da cabeça dela, com a cauda apontando para baixo.
        const balao = document.createElement('p');
        balao.className = 'cia-intro-balao';
        balao.setAttribute('role', 'status');
        balao.textContent = FRASE_1;
        arte.appendChild(balao);

        // Na página escura a Lia entra na versão clara. A versão violeta
        // é do mini chat, e sumiria no fundo escuro.
        const caminho = (window.IMAGENS || {})['lia-corpo'];
        if (caminho) {
            const img = document.createElement('img');
            img.className = 'cia-intro-lia';
            img.alt = 'Lia, assistente virtual do Amor NeuroDivergente';
            img.src = caminho;
            img.addEventListener('error', function () { img.remove(); }, { once: true });
            arte.appendChild(img);
        }

        const titulo = document.createElement('h2');
        titulo.className = 'cia-intro-titulo';
        titulo.textContent = 'Olá! Eu sou a Lia.';

        const sub = document.createElement('p');
        sub.className = 'cia-intro-sub';
        sub.textContent = 'Como posso te ajudar hoje?';

        const nota = document.createElement('p');
        nota.className = 'cia-intro-nota';
        nota.textContent =
            'Converse no seu ritmo. Pode perguntar, explorar, ou simplesmente começar falando.';

        tela.appendChild(arte);
        tela.appendChild(titulo);
        tela.appendChild(sub);
        tela.appendChild(nota);
        return tela;
    }

    /** Dispara a sequência, ou mostra a tela pronta se ela não puder rodar. */
    function apresentarLia(tela) {
        if (!tela) return;

        if (!introDeveRodar()) {
            tela.setAttribute('data-intro', 'estatica');
            return;
        }

        tela.setAttribute('data-intro', 'rodando');

        let timers = [];

        const encerrar = function () {
            timers.forEach(function (t) { clearTimeout(t); });
            timers = [];
            tela.setAttribute('data-intro', 'saindo');
            setTimeout(function () { tela.remove(); }, 460);
        };

        // Cancelamento: a pessoa tem a palavra final.
        campo.addEventListener('input', encerrar, { once: true });
        btnEnviar.addEventListener('click', encerrar, { once: true });
        tela.addEventListener('click', encerrar, { once: true });
        document.querySelectorAll('.cia-sug').forEach(function (b) {
            b.addEventListener('click', encerrar, { once: true });
        });

        timers.push(setTimeout(function () {
            const balao = tela.querySelector('.cia-intro-balao');
            if (balao && balao.textContent === FRASE_1) balao.textContent = FRASE_2;
        }, 2500));

        timers.push(setTimeout(encerrar, 4500));
    }

    function irParaFim() {
        // Duas passadas, e não uma.
        //
        // Logo antes desta chamada as ferramentas e os recursos são
        // mostrados, e eles encolhem a área de rolagem. Um único
        // requestAnimationFrame mede o scrollHeight ANTES do navegador
        // aplicar essa mudança de layout, e a rolagem para um pouco
        // acima do fim — a última linha da Lia fica cortada embaixo,
        // que era exatamente o que aparecia na tela.
        //
        // O primeiro quadro aplica o layout novo; o segundo mede a
        // altura certa e rola de novo.
        requestAnimationFrame(function () {
            rolagem.scrollTop = rolagem.scrollHeight;
            requestAnimationFrame(function () {
                rolagem.scrollTop = rolagem.scrollHeight;
            });
        });
    }

    // =========================================
    // Digitando
    // =========================================
    function mostrarDigitando() {
        esconderDigitando();
        const linha = document.createElement('div');
        linha.className = 'cia-msg cia-msg-lia';
        linha.id = 'ciaDigitando';
        linha.appendChild(avatarDaLia());
        const b = document.createElement('div');
        b.className = 'cia-bolha';
        b.innerHTML = '<span class="cia-digitando" role="status" aria-label="Lia está escrevendo">' +
                      '<span></span><span></span><span></span></span>';
        linha.appendChild(b);
        rolagem.appendChild(linha);
        irParaFim();
    }

    function esconderDigitando() {
        const d = document.getElementById('ciaDigitando');
        if (d) d.remove();
    }

    // =========================================
    // Enviar
    // =========================================
    let enviando = false;

    function travar(ligado) {
        enviando = ligado;
        btnEnviar.disabled = ligado;
        campo.disabled = false;   // pode continuar digitando enquanto ela responde
        if (!ligado) campo.focus();
    }

    async function mandar(texto) {
        if (enviando) return;
        const limpo = String(texto || '').trim();
        if (!limpo) return;

        travar(true);
        if (sugestoes) sugestoes.hidden = true;

        // Desenha a mensagem da pessoa na hora, sem esperar a rede.
        desenharMensagem({ role: 'user', content: limpo });
        campo.value = '';
        ajustarAltura();
        ferramentas.hidden = true;
        mostrarDigitando();

        // A segurança lê o turno e a conversa inteira. Instante, sem rede.
        if (window.AcolheriaSeguranca) {
            window.AcolheriaSeguranca.registrarTurno(limpo);
        }

        const resposta = await C.enviar(limpo, 'normal');

        esconderDigitando();
        desenharMensagem({ role: 'assistant', content: resposta.texto });
        btnOuvir.dataset.texto = resposta.texto;
        ferramentas.hidden = false;
        mostrarRecursos(resposta.texto);
        irParaFim();
        travar(false);
        // O botão de salvar começa desabilitado (conversa vazia) e só
        // era reabilitado ao abrir a lista. Aí ele ficava morto depois
        // da primeira mensagem: botão desabilitado ignora o clique.
        atualizarBotaoSalvar();

        // O modelo sinalizou risco que as palavras-chave não pegaram.
        if (resposta.crise && window.AcolheriaSeguranca) {
            window.AcolheriaSeguranca.abrir('alto');
        }
    }

    // =========================================
    // Ferramentas por resposta
    // =========================================
    const btnOuvir = $('ciaBtnOuvir');
    const btnCopiar = $('ciaBtnCopiar');

    document.querySelectorAll('.cia-ferr[data-modo]').forEach(function (botao) {
        botao.addEventListener('click', async function () {
            if (enviando) return;
            const modo = botao.dataset.modo;

            travar(true);
            mostrarDigitando();
            const r = await C.reformatar(modo);
            esconderDigitando();

            desenharMensagem({ role: 'assistant', content: r.texto });
            btnOuvir.dataset.texto = r.texto;
            mostrarRecursos(r.texto);
            irParaFim();
            travar(false);
            atualizarBotaoSalvar();

            if (r.crise && window.AcolheriaSeguranca) {
                window.AcolheriaSeguranca.abrir('alto');
            }
        });
    });

    btnOuvir.addEventListener('click', function () {
        const lendo = btnOuvir.getAttribute('aria-pressed') === 'true';
        if (lendo) {
            window.speechSynthesis.cancel();
            btnOuvir.setAttribute('aria-pressed', 'false');
            return;
        }
        const ok = lerEmVoz(btnOuvir.dataset.texto || '');
        btnOuvir.setAttribute('aria-pressed', ok ? 'true' : 'false');
        if (ok) {
            btnOuvir.addEventListener('blur', function () { btnOuvir.setAttribute('aria-pressed', 'false'); }, { once: true });
        }
    });

    btnCopiar.addEventListener('click', async function () {
        const texto = btnCopiar.dataset.texto || btnOuvir.dataset.texto || '';
        if (!texto) return;
        try {
            await navigator.clipboard.writeText(texto);
            avisar('Resposta copiada.');
        } catch (e) {
            avisar('Não consegui copiar neste navegador.');
        }
    });

    // =========================================
    // Sugestões de entrada
    // =========================================
    document.querySelectorAll('.cia-sug[data-prompt]').forEach(function (botao) {
        botao.addEventListener('click', function () {
            mandar(botao.dataset.prompt);
        });
    });

    // =========================================
    // Lista de conversas
    // =========================================
    function dataCurta(ts) {
        const d = new Date(ts || Date.now());
        const hoje = new Date();
        const mesmoDia = d.toDateString() === hoje.toDateString();
        if (mesmoDia) {
            return 'hoje, ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }

    function desenharLista() {
        const salvas = C.listar();
        lista.textContent = '';

        if (!salvas.length) {
            const vazia = document.createElement('p');
            vazia.className = 'cia-lateral-vazio';
            vazia.textContent =
                'Nenhuma conversa salva ainda. As conversas ficam salvas só quando você ' +
                'apertar "Salvar esta conversa".';
            lista.appendChild(vazia);
        } else {
            salvas.forEach(function (c) {
                const item = document.createElement('div');
                item.style.display = 'flex';
                item.style.gap = '4px';
                item.style.alignItems = 'center';

                const abrir = document.createElement('button');
                abrir.type = 'button';
                abrir.className = 'cia-conversa-item';
                if (c.id === C.idAtual()) abrir.setAttribute('aria-current', 'true');
                abrir.style.flex = '1 1 auto';

                const texto = document.createElement('span');
                texto.className = 'cia-conversa-item-texto';
                const tit = document.createElement('span');
                tit.className = 'cia-conversa-item-titulo';
                tit.textContent = c.titulo;
                const data = document.createElement('span');
                data.className = 'cia-conversa-item-data';
                data.textContent = dataCurta(c.atualizadaEm);
                texto.appendChild(tit);
                texto.appendChild(data);

                // A Lia no lugar do ícone de balões. Sem a arte, volta
                // para o ícone: um item de lista sem imagem nenhuma fica
                // difícil de varrer com os olhos.
                const arteConversa = document.createElement('img');
                arteConversa.className = 'cia-conversa-item-arte';
                arteConversa.alt = '';
                arteConversa.setAttribute('aria-hidden', 'true');
                arteConversa.setAttribute('data-img-slot', 'lia-avatar-novo');
                const caminhoConversa = (window.IMAGENS || {})['lia-avatar-novo'];
                if (caminhoConversa) {
                    arteConversa.src = caminhoConversa;
                    arteConversa.addEventListener('error', function () {
                        const icone = document.createElement('i');
                        icone.className = 'fa-regular fa-comments';
                        icone.setAttribute('aria-hidden', 'true');
                        arteConversa.replaceWith(icone);
                    }, { once: true });
                    abrir.appendChild(arteConversa);
                } else {
                    const icone = document.createElement('i');
                    icone.className = 'fa-regular fa-comments';
                    icone.setAttribute('aria-hidden', 'true');
                    abrir.appendChild(icone);
                }

                abrir.appendChild(texto);
                abrir.addEventListener('click', function () {
                    C.iniciar(c.id);
                    desenharTudo();
                    atualizarBotaoSalvar();
                    lateral.hidden = true;
                    avisoSobreHistorico();
                });

                const apagar = document.createElement('button');
                apagar.type = 'button';
                apagar.className = 'cia-conversa-item-apagar';
                apagar.setAttribute('aria-label', 'Apagar conversa "' + c.titulo + '"');
                apagar.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
                apagar.addEventListener('click', function () {
                    C.apagarConversa(c.id);
                    desenharLista();
                    atualizarContador();
                    atualizarBotaoSalvar();
                });

                item.appendChild(abrir);
                item.appendChild(apagar);
                lista.appendChild(item);
            });
        }

        atualizarContador();
        atualizarBotaoSalvar();
    }

    function atualizarContador() {
        const badge = $('ciaContConversas');
        const n = C.listar().length;
        if (badge) {
            badge.textContent = n > 99 ? '99+' : String(n);
            badge.hidden = n === 0;
        }
    }

    function atualizarBotaoSalvar() {
        if (!btnSalvar) return;
        const temMensagem = C.mensagens().length > 0;
        btnSalvar.disabled = !temMensagem;
    }

    function avisoSobreHistorico() {
        if (C.temHistoricoSalvo()) {
            avisar('Conversa aberta. Ela está neste aparelho.');
        }
    }

    $('ciaBtnConversas').addEventListener('click', function () {
        desenharLista();
        lateral.hidden = false;
        const primeiro = lateral.querySelector('.cia-conversa-item');
        if (primeiro) primeiro.focus();
    });

    $('ciaBtnFecharLateral').addEventListener('click', function () {
        lateral.hidden = true;
        $('ciaBtnConversas').focus();
    });

    $('ciaBtnNova').addEventListener('click', function () {
        C.novaConversa();
        desenharTudo();
        lateral.hidden = true;
        if (sugestoes) sugestoes.hidden = false;
        // Conversa nova começa vazia: salvar precisa voltar a ficar
        // desligado.
        atualizarBotaoSalvar();
        avisar('Conversa nova.');
        campo.focus();
    });

    btnSalvar.addEventListener('click', function () {
        if (C.salvar()) {
            avisar('Conversa salva neste aparelho.');
            atualizarBotaoSalvar();
            atualizarContador();
        } else {
            avisar('Não consegui salvar. O navegador pode estar bloqueando.');
        }
    });

    $('ciaBtnApagarTudo').addEventListener('click', function () {
        const n = C.listar().length;
        const pergunta = n
            ? 'Apagar as ' + n + ' conversa' + (n > 1 ? 's' : '') + ' salva' + (n > 1 ? 's' : '') +
              ' e a que está aberta? Não dá para desfazer.'
            : 'Apagar a conversa que está aberta? Ela ainda não foi salva, então não há nada guardado.';

        if (!window.confirm(pergunta)) return;

        C.apagarTudo();
        desenharTudo();
        desenharLista();
        lateral.hidden = true;
        if (sugestoes) sugestoes.hidden = false;
        avisar('Tudo apagado deste aparelho.');
        campo.focus();
    });

    document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape' && !lateral.hidden) {
            lateral.hidden = true;
            $('ciaBtnConversas').focus();
        }
    });

    // =========================================
    // Campo de texto
    // =========================================
    function ajustarAltura() {
        campo.style.height = 'auto';
        campo.style.height = Math.min(campo.scrollHeight, 190) + 'px';
    }

    campo.addEventListener('input', function () {
        ajustarAltura();
        atualizarBotaoEnviar();
    });

    /**
     * O botão de enviar mostra se há algo para enviar.
     *
     * Antes isso só era recalculado no evento `input`. Ao abrir a
     * página o campo nascia vazio e o botão nascia habilitado: seem
     * haver o que enviar, e era preciso apertar para discovering
     * que nada acontecia. Mandar() já devolvia vazio sem fazer
     * nada, mas o botão mentindo sobre o estado é o tipo de coisa que
     * faz a pessoa achar que a Lia travou.
     */
    function atualizarBotaoEnviar() {
        btnEnviar.disabled = !campo.value.trim() && !enviando;
    }

    campo.addEventListener('keydown', function (ev) {
        // Enter envia, Shift+Enter quebra linha. É o esperado em chat.
        if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing) {
            ev.preventDefault();
            mandar(campo.value);
            atualizarBotaoEnviar();
        }
    });

    form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        mandar(campo.value);
        // O campo esvazia dentro de mandar(); o botão precisa voltar
        // para desabilitado junto, e nao esperar o próximo input.
        atualizarBotaoEnviar();
    });

    btnVoz.addEventListener('click', alternarVoz);

    // =========================================
    // Início
    // =========================================
    C.iniciar();
    desenharTudo();
    atualizarBotaoSalvar();
    atualizarContador();
    // Sem isso o botão de enviar nasce habilitado com o campo vazio:
    // atualizarBotaoEnviar só era chamado ao digitar.
    atualizarBotaoEnviar();

    if (!temVoz() && btnVoz) {
        // Sem reconhecimento de voz, o botão não seria nada.
        btnVoz.hidden = true;
    }

    if (window.AcolheriaSeguranca) {
        window.AcolheriaSeguranca.ligarUI();
    }

    campo.focus();
});