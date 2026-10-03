/**
 * Acolher-IA.js — Painel lateral (drawer) da AcolherIA
 * Chat com API Groq + painel lateral à direita
 */
document.addEventListener('DOMContentLoaded', () => {

    const ACOLHERIA_URL = 'https://qyixzontuhrxrrjrmzvy.supabase.co/functions/v1/acolheria';

    // =============================================
    // ELEMENTOS DO MODAL
    // =============================================
    const acolheriaOverlay = document.getElementById('acolheriaOverlay');
    const acolheriaOverlayBg = document.getElementById('acolheriaOverlayBg');
    const acolheriaClose = document.getElementById('acolheriaClose');
    const acolheriaInput = document.getElementById('acolheriaInput');
    const acolheriaSend = document.getElementById('acolheriaSend');
    const acolheriaChatBody = document.getElementById('acolheriaChatBody');
    const acolheriaSuggestions = document.getElementById('acolheriaSuggestions');

    // =============================================
    // FUNÇÕES DO CHAT
    // =============================================

    // Lista negra de tópicos.
    // IMPORTANTE: crise (suicídio/automutilação) NÃO entra aqui. Bloquear
    // esses termos deixava quem estava em crise recebendo "desculpe, não
    // posso responder a isso" — exatamente o oposto do acolhimento. Crise
    // é tratada pelo módulo de segurança, que abre o painel de apoio.
    const modalBlockedTopics = [
        'porno', 'pornô', 'pornografia', 'sexo', 'sexual', 'nudez', 'nudes',
        'armas', 'drogas', 'crime', 'hack', 'golpe', 'aposta',
        'cassino', 'bet', 'tigrinho', 'assassinato',
        'pedofilia', 'estupro', 'terrorismo', 'racismo', 'homofobia', 'misoginia'
    ];

    function isBlockedModalTopic(message) {
        const msg = message.toLowerCase();
        return modalBlockedTopics.some(topic => msg.includes(topic.toLowerCase()));
    }

    // =====================================================================
    // SEGURANÇA — camada 1 (determinística, instantânea)
    // =====================================================================

    const MARCA_CRISE = '[[CRISE]]';

    // Em crise, a pessoa precisa ver o recurso antes de qualquer explicação.
    const MENSAGEM_CRISE = `Percebo que você está passando por um momento muito pesado, e quero ficar aqui com você.

Você não precisa atravessar isso sozinho(a), e não precisa ter a resposta agora. Abri ao lado o **Apoio Imediato** — tem o CVV (188), que atende de graça, 24 horas, e você pode ligar sem explicar nada.

Se você está em risco agora, ligue **188** ou **192**. Eu fico aqui. 💜`;

    // As duas camadas (palavras-chave e modelo) podem concordar no mesmo
    // turno. Sem esta trava, quem está em crise lia a mesma mensagem de
    // acolhimento duas vezes seguidas — e na crise isso parece defeito.
    let criseMostrada = false;

    function nivelMaisAlto(a, b) {
        const ordem = { nenhum: 0, moderado: 1, alto: 2 };
        return (ordem[b] || 0) > (ordem[a] || 0) ? b : a;
    }

    function escutarSeguranca(texto) {
        if (!window.AcolheriaSeguranca) return;
        criseMostrada = false;

        // Lê o turno e a conversa inteira: crise quase nunca cabe numa
        // mensagem só, então a soma do histórico também conta.
        const leitura = window.AcolheriaSeguranca.registrarTurno(texto);
        const nivel = nivelMaisAlto(leitura.nivel, leitura.conversa.nivel);
        if (nivel === 'nenhum') return;

        mostrarCrise(nivel, leitura.motivo || leitura.conversa.motivo);
    }

    function mostrarCrise(nivel, motivo) {
        if (!criseMostrada) {
            addModalMessage(MENSAGEM_CRISE, false);
            criseMostrada = true;
        }
        if (window.AcolheriaSeguranca) {
            window.AcolheriaSeguranca.abrir(nivel);
            console.warn('🛡️ Painel de apoio aberto:', nivel, motivo);
        }
    }

    // Camada 2: o modelo pode detectar risco que as palavras-chave não pegaram.
    // Ele sinaliza com um marcador no início da resposta.
    function verificarMarcaCrise(resposta) {
        if (!String(resposta || '').includes(MARCA_CRISE)) return resposta;
        const limpo = resposta.replace(new RegExp(`\\s*${MARCA_CRISE.replace(/[[\]]/g, '\\$&')}`, 'g'), '').trim();
        mostrarCrise('alto', 'sinalizado pelo modelo');
        return limpo;
    }

    // Função para obter descrição do projeto
    // =====================================================================
    // As quatro entradas. Cada uma vira uma mensagem que a Lia recebe de
    // verdade, e não um link para lugar nenhum.
    const ABERTURAS = [
        {
            rotulo: 'Quero conversar',
            prompt: 'Quero conversar sobre o que está acontecendo comigo.'
        },
        {
            rotulo: 'Tenho uma dúvida',
            prompt: 'Tenho uma dúvida sobre neurodivergência.'
        },
        {
            rotulo: 'Organizar ideias',
            prompt: 'Tenho muita coisa na cabeça e não sei por onde começar. Vamos organizar por partes?'
        },
        {
            rotulo: 'Preciso de ajuda',
            prompt: 'Preciso de ajuda com uma situação específica.'
        }
    ];

    function montarBoasVindas() {
        if (!acolheriaChatBody) return null;
        if (acolheriaChatBody.querySelector('.acolheria-boas-vindas')) return null;

        const tela = document.createElement('div');
        tela.className = 'acolheria-boas-vindas';

        // --- personagem + balão ---
        const arte = document.createElement('div');
        arte.className = 'acolheria-boas-vindas-arte';

        // O balão vem ANTES da imagem no DOM: é assim que ele aparece
        // acima da cabeça dela, com a cauda apontando para baixo.
        const balao = document.createElement('p');
        balao.className = 'acolheria-balao';
        balao.textContent = 'Oi! Eu sou a Lia. Que bom ter você aqui!';
        arte.appendChild(balao);

        // Avatar, não corpo inteiro. A gaveta tem 420px de largura e a
        // Lia de corpo inteiro ocupava a tela inteira, empurrando o campo
        // de mensagem. A arte é quadrada (1024x1024), então cabe sem corte.
        const arteLia = document.createElement('img');
        arteLia.className = 'acolheria-boas-vindas-lia';
        arteLia.alt = 'Lia, assistente virtual do Amor NeuroDivergente';
        arteLia.setAttribute('data-img-slot', 'lia-avatar');
        const caminho = (window.IMAGENS || {})['lia-avatar'];
        if (caminho) {
            arteLia.src = caminho;
            arteLia.addEventListener('error', function () {
                // Sem a arte ainda sobra a saudação. Melhor do que um
                // quadro vazio onde deveria estar a Lia.
                arteLia.remove();
            }, { once: true });
            arte.appendChild(arteLia);
        }

        // --- texto ---
        const titulo = document.createElement('h2');
        titulo.className = 'acolheria-boas-vindas-titulo';
        titulo.textContent = 'Olá! Eu sou a Lia.';

        const sub = document.createElement('p');
        sub.className = 'acolheria-boas-vindas-sub';
        sub.textContent = 'Como posso te ajudar hoje?';

        const nota = document.createElement('p');
        nota.className = 'acolheria-boas-vindas-nota';
        nota.textContent =
            'Converse no seu ritmo. Pode perguntar, explorar, ou simplesmente começar falando.';

        tela.appendChild(arte);
        tela.appendChild(titulo);
        tela.appendChild(sub);
        tela.appendChild(nota);

        acolheriaChatBody.insertBefore(tela, acolheriaChatBody.firstChild);
        return tela;
    }

    /**
     * Troca as seis sugestões de assunto do HTML pelas quatro aberturas.
     * Elas viram as duas coisas ao mesmo tempo: as escolhas da tela de
     * boas-vindas e o atalho para começar a conversar.
     */
    function montarSugestoesDeAbertura() {
        if (!acolheriaSuggestions) return;
        if (acolheriaSuggestions.getAttribute('data-abertura') === 'pronto') return;
        acolheriaSuggestions.setAttribute('data-abertura', 'pronto');

        acolheriaSuggestions.textContent = '';

        const rotulo = document.createElement('span');
        rotulo.className = 'acolheria-sugestoes-rotulo';
        rotulo.textContent = 'Escolha por onde começar';
        acolheriaSuggestions.appendChild(rotulo);

        const caixa = document.createElement('div');
        caixa.className = 'acolheria-sugestoes-caixa';

        ABERTURAS.forEach(function (abertura) {
            const botao = document.createElement('button');
            botao.type = 'button';
            botao.className = 'acolheria-suggestion';
            botao.textContent = abertura.rotulo;
            botao.addEventListener('click', function () {
                if (acolheriaInput) acolheriaInput.value = abertura.prompt;
                sendModalMessage();
            });
            caixa.appendChild(botao);
        });

        acolheriaSuggestions.appendChild(caixa);
    }

    /**
     * Mini chat: mostra a tela de boas-vindas e para por aí.
     *
     * A animação de abertura NÃO fica aqui. Ela é da página de conversa
     * inteira (/chat-Ia/chat-Ia.html), onde há espaço e tempo para uma
     * apresentação. Numa gaveta de 420px, uma intro de quatro segundos e
     * meio atrapalha: a pessoa pediu uma resposta rápida e fica olhando
     * uma animação.
     */
    function mostrarBoasVindas() {
        montarSugestoesDeAbertura();
        const tela = montarBoasVindas();
        if (acolheriaSuggestions) acolheriaSuggestions.hidden = false;
        if (tela) tela.setAttribute('data-abertura', 'estatico');
    }

    /** Some com a tela de abertura: a conversa começou. */
    function esconderBoasVindas() {
        if (!acolheriaChatBody) return;
        const tela = acolheriaChatBody.querySelector('.acolheria-boas-vindas');
        if (tela) tela.remove();
        if (acolheriaSuggestions) acolheriaSuggestions.hidden = true;
    }
    // Função para resposta de tópico bloqueado
    function getBlockedTopicResponse() {
        return `💜 **Desculpe, não posso responder a isso!**

Meu propósito é ajudar com informações sobre neurodivergência, TDAH, autismo, direitos, organização e bem-estar.

**Posso te ajudar com:**
 TDAH e Autismo (TEA)
 Direitos e legislação
Organização e produtividade
 Crises sensoriais e regulação
 Diagnóstico e avaliação
 Terapias e tratamentos
Neurodiversidade em geral

**Vamos conversar sobre algo que realmente importa?** 💜`;
    }

    // Função para resposta de erro
    function getErrorResponse() {
        return `❌ **Desculpe, ocorreu um erro!**

Não foi possível processar sua pergunta no momento. Por favor, tente novamente mais tarde.

**Enquanto isso, você pode:**
• Perguntar sobre TDAH e autismo
• Saber mais sobre direitos e legislação
• Dicas de organização e produtividade
• Informações sobre terapias e tratamentos

Se o problema persistir, entre em contato com nossa equipe de suporte. 💜`;
    }

    function escapeHtmlForBubble(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Adicionar mensagem ao chat
    function addModalMessage(text, isUser = false) {
        if (!acolheriaChatBody) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `acolheria-msg ${isUser ? 'acolheria-msg-user' : 'acolheria-msg-assistente'}`;

        const avatar = document.createElement('div');
        avatar.className = 'acolheria-avatar';
        if (isUser) {
            avatar.innerHTML = '<i class="fa-solid fa-user"></i>';
        } else {
            // Avatar da Lia. Sem o arquivo em /img/lia/, o onerror devolve
            // o robô genérico e a conversa continua normal.
            const caminho = (window.IMAGENS || {})['lia-avatar-novo'];
            if (caminho) {
                avatar.innerHTML = '';
                const img = document.createElement('img');
                img.src = caminho;
                img.alt = 'Lia';
                img.setAttribute('data-img-slot', 'lia-avatar');
                img.addEventListener('error', () => {
                    avatar.innerHTML = '<i class="fa-solid fa-robot"></i>';
                }, { once: true });
                avatar.appendChild(img);
            } else {
                avatar.innerHTML = '<i class="fa-solid fa-robot"></i>';
            }
        }

        const bubble = document.createElement('div');
        bubble.className = 'acolheria-bubble';
        
        // Formatação mínima de markdown. O modelo usa títulos (###) e listas
        // com frequência; sem isso o "###" aparecia literal na bolha.
        const esc = escapeHtmlForBubble(text);
        const formattedText = esc
            .replace(/^#{1,3}\s*(.+)$/gm, '<strong>$1</strong>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/^[ \t]*[-*]\s+/gm, '• ')
            .replace(/\n/g, '<br>')
            .replace(/(<br>)+•/g, '<br>•');

        bubble.innerHTML = formattedText;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
        acolheriaChatBody.appendChild(messageDiv);

        setTimeout(() => {
            acolheriaChatBody.scrollTop = acolheriaChatBody.scrollHeight;
        }, 50);
    }

    // Mostrar indicador de digitação
    function showModalTyping() {
        removeModalTyping();
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'acolheria-msg acolheria-typing';
        typingDiv.id = 'modalTypingIndicator';
        typingDiv.innerHTML = `
            <div class="acolheria-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="acolheria-bubble">
                <span style="display: flex; gap: 4px; align-items: center;">
                    <span style="animation: pulse 1.2s infinite; font-size: 14px;">●</span>
                    <span style="animation: pulse 1.2s infinite 0.2s; font-size: 14px;">●</span>
                    <span style="animation: pulse 1.2s infinite 0.4s; font-size: 14px;">●</span>
                </span>
            </div>
        `;
        acolheriaChatBody.appendChild(typingDiv);
        acolheriaChatBody.scrollTop = acolheriaChatBody.scrollHeight;
    }

    function removeModalTyping() {
        const indicator = document.getElementById('modalTypingIndicator');
        if (indicator) indicator.remove();
    }

    // Gerar resposta via API Groq
    async function generateModalResponse(message) {
        // Crise tem precedência absoluta: nunca cai no bloqueio de tópico.
        const risco = window.AcolheriaSeguranca
            ? window.AcolheriaSeguranca.avaliarRisco(message)
            : { nivel: 'nenhum' };

        if (risco.nivel === 'nenhum' && isBlockedModalTopic(message)) {
            return getBlockedTopicResponse();
        }

        try {
            const response = await fetch(ACOLHERIA_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Erro API Groq:', response.status, errorData);
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const resposta = data.answer?.trim();

            if (!resposta) {
                throw new Error('Resposta vazia');
            }

            return verificarMarcaCrise(resposta);

        } catch (error) {
            console.error('❌ Falha na API Groq:', error.message);
            return getErrorResponse();
        }
    }

    // Enviar mensagem
    async function sendModalMessage() {
        const text = acolheriaInput.value.trim();
        if (!text) return;

        // Esconde as sugestões após a primeira mensagem
        if (acolheriaSuggestions) {
        // A conversa comecou: a tela de boas-vindas e as escolhas
        // de abertura nao fazem mais sentido.
        esconderBoasVindas();
        }

        // Adiciona mensagem do usuário
        addModalMessage(text, true);
        acolheriaInput.value = '';
        acolheriaInput.style.height = 'auto';

        // Detecção instantânea: o painel abre sem esperar a rede.
        escutarSeguranca(text);

        // Mostra "digitando..."
        showModalTyping();

        try {
            const response = await generateModalResponse(text);
            
            setTimeout(() => {
                removeModalTyping();
                addModalMessage(response, false);
            }, 400 + Math.random() * 300);
            
        } catch (error) {
            console.error('❌ Erro:', error);
            removeModalTyping();
            addModalMessage('💜 Desculpe, tive um pequeno problema. Pode repetir sua pergunta?', false);
        }
    }

    // =============================================
    // ABRIR E FECHAR O PAINEL LATERAL
    // =============================================

    function openAcolheriaPanel() {
        if (!acolheriaOverlay) return;
        const jaAberto = !acolheriaOverlay.hidden;

        acolheriaOverlay.hidden = false;
        if (acolheriaOverlayBg) acolheriaOverlayBg.hidden = false;
        acolheriaOverlay.setAttribute('role', 'dialog');
        acolheriaOverlay.setAttribute('aria-modal', 'false');
        acolheriaOverlay.setAttribute('aria-label', 'Conversa com a AcolherIA');

        // Chat vazio: mostra a tela de boas-vindas (personagem,
        // saudação curta e as quatro escolhas) no lugar da saudação longa.
        if (acolheriaChatBody && acolheriaChatBody.children.length === 0) {
            mostrarBoasVindas();
        }

        if (jaAberto) return;

        // O ícone de acessibilidade sai da frente da gaveta enquanto a
        // conversa estiver na tela. Quem está em dificuldade para ler não
        // pode ficar sem o botão de acessibilidade justamente enquanto
        // conversa.
        if (typeof window.reposicionarAcessibilidade === 'function') {
            window.reposicionarAcessibilidade();
        }

        setTimeout(() => {
            if (acolheriaInput) acolheriaInput.focus();
        }, 320);
    }

    function closeAcolheriaPanel() {
        if (!acolheriaOverlay) return;
        acolheriaOverlay.hidden = true;
        if (acolheriaOverlayBg) acolheriaOverlayBg.hidden = true;
        removeModalTyping();

        // Volta para o canto inferior direito.
        if (typeof window.reposicionarAcessibilidade === 'function') {
            window.reposicionarAcessibilidade();
        }
    }

    function isAcolheriaOpen() {
        return Boolean(acolheriaOverlay && !acolheriaOverlay.hidden);
    }

    // Mantém os nomes antigos funcionando caso algum HTML use onclick inline.
    window.openAcolheriaPanel = openAcolheriaPanel;
    window.closeAcolheriaPanel = closeAcolheriaPanel;
    window.openAcolheriaModal = openAcolheriaPanel;
    window.closeAcolheriaModal = closeAcolheriaPanel;

    // =============================================
    // EVENTOS - ABRIR O PAINEL
    // =============================================

    // =============================================
    // ATALHO DA LIA NO HUB
    //
    // O botão da Lia dentro do hub flutuante abre ESTE painel, sobre a
    // página em que a pessoa está, em vez de levar para
    // /chat-Ia/chat-Ia.html.
    //
    // O gancho é o atributo data-ia-abrir, não o href. Assim o botão
    // continua sendo um <a> de verdade: se o JavaScript falhar, ele
    // navega para a página da Lia em vez de não fazer nada.
    //
    // Só o atalho do hub é interceptado. Os links do menu superior e do
    // rodapé levam para a página, que é o que se espera de um item de
    // menu.
    // =============================================
    document.querySelectorAll('[data-ia-abrir]').forEach((botao) => {
        botao.addEventListener('click', (e) => {
            e.preventDefault();
            openAcolheriaPanel();
        });
    });

    // =============================================
    // AVATAR DA LIA — cabeçalho do mini chat e botão do hub
    //
    // O ícone de robô que representava a assistente foi trocado pela
    // arte dela. Fica num lugar só em vez de repetido no HTML das 8
    // páginas: o cabeçalho e o botão do hub existem em todas elas, com a
    // mesma marcação.
    // =============================================
    function aplicarAvatarDaLia() {
        const mapa = window.IMAGENS || {};

        // 1) Cabeçalho do mini chat: <i class="fa-solid fa-robot">
        const titulo = document.querySelector('.acolheria-modal-title');
        if (titulo && mapa['lia-avatar']) {
            const robo = titulo.querySelector('i.fa-robot');
            if (robo && !titulo.querySelector('img.lia-avatar-cabecalho')) {
                const img = document.createElement('img');
                img.className = 'lia-avatar-cabecalho';
                img.alt = 'Lia';
                img.setAttribute('data-img-slot', 'lia-avatar');
                img.src = mapa['lia-avatar'];
                img.addEventListener('error', function () {
                    // Sem a arte, o robô é melhor do que um buraco.
                    img.replaceWith(robo);
                }, { once: true });
                robo.replaceWith(img);
            }
        }

        // 2) Botão da Lia no hub flutuante
        document.querySelectorAll('.hub-action-ia').forEach((botao) => {
            if (!mapa['lia-avatar']) return;
            if (botao.querySelector('img')) return;

            const icone = botao.querySelector('i');
            if (!icone) return;

            const img = document.createElement('img');
            img.className = 'hub-action-ia-arte';
            img.alt = '';
            img.setAttribute('aria-hidden', 'true');
            img.setAttribute('data-img-slot', 'lia-avatar');
            img.src = mapa['lia-avatar'];
            img.addEventListener('error', function () { img.remove(); }, { once: true });
            icone.replaceWith(img);
        });
    }

    // =============================================
    // BOTÃO DE EXPANDIR
    //
    // O painel é a conversa rápida. Quem quer histórico, lista de
    // conversas, voz e as ferramentas por resposta precisa da página.
    // Este botão é a ponte entre os dois, e é injetado aqui em vez de
    // repetido no cabeçalho de cada uma das 8 páginas com o modal.
    // =============================================
    const cabecalhoModal = document.querySelector('.acolheria-modal-header');
    const botaoFechar = document.getElementById('acolheriaClose');

    if (cabecalhoModal && botaoFechar && !document.getElementById('acolheriaExpandir')) {
        const expandir = document.createElement('a');
        expandir.className = 'acolheria-expandir';
        expandir.id = 'acolheriaExpandir';
        expandir.href = '/chat-Ia/chat-Ia.html';
        expandir.title = 'Abrir a conversa completa, com histórico e ferramentas';
        expandir.innerHTML =
            '<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>' +
            '<span>Conversa completa</span>';

        botaoFechar.parentElement.insertBefore(expandir, botaoFechar);
    }

    // Avatar da Lia no cabeçalho e no botão do hub. Aqui, porque é o
    // mesmo ponto da inicialização que já troca o ícone de robô.
    aplicarAvatarDaLia();

    // Deep link: a landing page e as configurações podem abrir direto.
    const ACOLHERIA_HASHES = ['#acolheria', '#acolheriaoverlay'];

    function hashTargetsAcolheria() {
        return ACOLHERIA_HASHES.includes(String(window.location.hash || '').toLowerCase());
    }

    if (hashTargetsAcolheria()) {
        setTimeout(openAcolheriaPanel, 450);
    }
    window.addEventListener('hashchange', () => {
        if (hashTargetsAcolheria()) openAcolheriaPanel();
    });

    // =============================================
    // EVENTOS - FECHAR O PAINEL
    // =============================================

    if (acolheriaClose) {
        acolheriaClose.addEventListener('click', closeAcolheriaPanel);
    }

    // =============================================
    // AVISO DE QUE É IA — recolhe e expande
    //
    // O aviso ocupa uma linha só quando fechado. O texto completo fica
    // escondido até a pessoa pedir, senão tomava a altura da tela antes
    // de aparecer a primeira mensagem.
    // =============================================
    const iaToggle = document.getElementById('acolheriaIaToggle');
    const iaDetalhe = document.getElementById('acolheriaIaDetalhe');

    if (iaToggle && iaDetalhe) {
        iaToggle.addEventListener('click', () => {
            const aberto = iaToggle.getAttribute('aria-expanded') === 'true';
            iaToggle.setAttribute('aria-expanded', String(!aberto));
            iaDetalhe.hidden = aberto;
        });
    }

    if (acolheriaOverlayBg) {
        acolheriaOverlayBg.addEventListener('click', closeAcolheriaPanel);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isAcolheriaOpen()) {
            closeAcolheriaPanel();
        }
    });

    // =============================================
    // EVENTOS - ENVIAR MENSAGEM
    // =============================================

    if (acolheriaSend) {
        acolheriaSend.addEventListener('click', sendModalMessage);
    }

    if (acolheriaInput) {
        acolheriaInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendModalMessage();
            }
        });

        // Auto-resize do textarea
        acolheriaInput.addEventListener('input', () => {
            acolheriaInput.style.height = 'auto';
            acolheriaInput.style.height = Math.min(acolheriaInput.scrollHeight, 100) + 'px';
        });
    }

    // Sugestões
    document.querySelectorAll('.acolheria-suggestion').forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.getAttribute('data-prompt') || btn.textContent.trim();
            if (acolheriaInput) {
                acolheriaInput.value = prompt;
                sendModalMessage();
            }
        });
    });

    // =============================================
    // AVISO DE QUE É IA — injetado em todas as páginas
    //
    // Fica aqui, e não replicado no HTML de cada página, por dois
    // motivos: o aviso é uma informação de segurança e não pode
    // divergir entre páginas; e o CSS dele também varies, então
    // injetar junto evita depender de cada stylesheet ter a regra.
    //
    // Ocupa UMA linha. O texto completo aparece só quando a pessoa
    // pede. A versão anterior ocupava quase a altura da tela antes da
    // primeira mensagem.
    //
    // Os contatos de crise NÃO ficam aqui de propósito. Quando a
    // conversa indica risco, quem aparece é o Painel de Apoio
    // Imediato (seguranca.js), que se abre sozinho. number na mão de
    // todo mundo, o tempo todo, é ruído.
    // =============================================
    function injetarAvisoIA() {
        const modal = document.querySelector('.acolheria-modal');
        const corpo = document.getElementById('acolheriaChatBody');
        if (!modal || !corpo || document.getElementById('acolheriaIaFaixa')) return;

        const faixa = document.createElement('div');
        faixa.className = 'acolheria-ia-faixa';
        faixa.id = 'acolheriaIaFaixa';

        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'acolheria-ia-toggle';
        botao.id = 'acolheriaIaToggle';
        botao.setAttribute('aria-expanded', 'false');
        botao.setAttribute('aria-controls', 'acolheriaIaDetalhe');

        const icone = document.createElement('i');
        icone.className = 'fa-solid fa-circle-info';
        icone.setAttribute('aria-hidden', 'true');

        const resumo = document.createElement('span');
        resumo.className = 'acolheria-ia-resumo';
        resumo.textContent = 'Assistente virtual por IA — não substitui atendimento humano';

        const mais = document.createElement('span');
        mais.className = 'acolheria-ia-mais';
        mais.textContent = 'Saiba mais';

        const seta = document.createElement('i');
        seta.className = 'fa-solid fa-chevron-down acolheria-ia-seta';
        seta.setAttribute('aria-hidden', 'true');

        botao.append(icone, resumo, mais, seta);

        const detalhe = document.createElement('div');
        detalhe.className = 'acolheria-ia-detalhe';
        detalhe.id = 'acolheriaIaDetalhe';
        detalhe.hidden = true;

        const p1 = document.createElement('p');
        p1.append(
            'Isto é uma ',
            forte('inteligência artificial'),
            '. Ela ajuda com informação e acolhimento, mas ',
            forte('não faz diagnóstico'),
            ' e não substitui profissional de saúde, psicólogo, advogado ou Defensoria Pública.'
        );

        const p2 = document.createElement('p');
        p2.append('Para orientação jurídica, veja a ');
        p2.append(link('/Direitos/direitos.html', 'página de Direitos'));
        p2.append(' e a ');
        p2.append(link('https://dpu.def.br', 'DPU', true));
        p2.append('.');

        const p3 = document.createElement('p');
        p3.append('Em situação de risco, ligue para o ');
        p3.append(link('tel:188', 'CVV (188)'));
        p3.append(', gratuito e sigiloso, ou ');
        p3.append(link('tel:192', 'SAMU (192)'));
        p3.append('.');

        detalhe.append(p1, p2, p3);
        faixa.append(botao, detalhe);
        modal.insertBefore(faixa, corpo);

        botao.addEventListener('click', () => {
            const aberto = botao.getAttribute('aria-expanded') === 'true';
            botao.setAttribute('aria-expanded', String(!aberto));
            detalhe.hidden = aberto;
        });
    }

    function forte(texto) {
        const el = document.createElement('strong');
        el.textContent = texto;
        return el;
    }

    function link(href, texto, externo) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = texto;
        if (externo) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
        }
        return a;
    }

    // O CSS vai junto. Cada página usa um stylesheet diferente
    // (inicio.css, blog.css, comunidade.css...), e nenhum deles pode
    // faltar a regra sem o aviso aparecer sem estilo.
    function injetarEstiloAvisoIA() {
        if (document.getElementById('acolheriaIaStyle')) return;
        const style = document.createElement('style');
        style.id = 'acolheriaIaStyle';
        style.textContent = `
            .acolheria-ia-faixa {
                background: var(--primary-light, #ede9fe);
                border-bottom: 1px solid var(--border-color, #e8e3dd);
                flex-shrink: 0;
            }
            .acolheria-ia-toggle {
                display: flex; align-items: center; gap: 8px;
                width: 100%; padding: 8px 16px;
                border: none; background: none; color: var(--text-dark, #1a1a2e);
                font-family: 'Inter', sans-serif; font-size: 12px;
                line-height: 1.4; text-align: left; cursor: pointer;
            }
            .acolheria-ia-toggle > i:first-child {
                color: var(--primary, #7c3aed); flex-shrink: 0; font-size: 13px;
            }
            .acolheria-ia-resumo { flex: 1; min-width: 0; font-weight: 600; }
            .acolheria-ia-mais {
                flex-shrink: 0; font-weight: 700;
                text-decoration: underline; text-underline-offset: 2px;
            }
            .acolheria-ia-toggle[aria-expanded="true"] .acolheria-ia-mais { display: none; }
            .acolheria-ia-seta { flex-shrink: 0; font-size: 10px; transition: transform .2s ease; }
            .acolheria-ia-toggle[aria-expanded="true"] .acolheria-ia-seta { transform: rotate(180deg); }
            .acolheria-ia-toggle:hover { background: rgba(124,58,237,.10); }
            .acolheria-ia-toggle:focus-visible { outline: 2px solid var(--primary, #7c3aed); outline-offset: -2px; }
            .acolheria-ia-detalhe {
                padding: 2px 16px 12px; color: var(--text-dark, #1a1a2e);
                font-size: 13px; line-height: 1.6;
            }
            .acolheria-ia-detalhe[hidden] { display: none; }
            .acolheria-ia-detalhe p { margin: 0 0 8px; }
            .acolheria-ia-detalhe p:last-child { margin-bottom: 0; }
            .acolheria-ia-detalhe a { color: var(--primary, #7c3aed); font-weight: 700; }
            .acolheria-ia-detalhe a:focus-visible { outline: 2px solid var(--primary, #7c3aed); outline-offset: 2px; }
            @media (max-width: 420px) {
                .acolheria-ia-toggle { padding: 8px 12px; font-size: 11.5px; }
                .acolheria-ia-resumo { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            }
        `;
        document.head.appendChild(style);
    }

    injetarEstiloAvisoIA();
    injetarAvisoIA();

    // =============================================
    // AVATAR DA LIA NO CHAT
    //
    // O cabeçalho e o balão da assistente usavam um ícone de robô genérico.
    // A Lia é a personagem do projeto: usar a imagem dela aqui é o que faz
    // "vou perguntar para a Lia" ter alguém do outro lado.
    //
    // O caminho vem do slot "lia-avatar" em /imagens.js. Sem o arquivo
    // lá, o robô continua sendo o reserva — a troca não quebra a página.
    // =============================================
    function aplicarAvatarLia() {
        var caminho = (window.IMAGENS || {})['lia-avatar'];

        // A arte da Lia é quadrada (1024x1024). O avatar precisa sair
        // redondo e do tamanho da caixa, senão a imagem crua estoura o
        // cabeçalho. O `i` que estava aqui tinha 36px e borda
        // arredondada; a <img> precisa da mesma caixa, não do tamanho
        // natural dela.
        const cab = document.querySelector('.acolheria-modal-title > i, .acolheria-modal-title > img.acolheria-lia-avatar');
        if (cab && caminho) {
            const img = document.createElement('img');
            img.src = caminho;
            img.alt = 'Lia, assistente virtual';
            img.className = 'acolheria-lia-avatar';
            img.setAttribute('data-img-slot', 'lia-avatar');
            img.addEventListener('error', () => {
                img.replaceWith(Object.assign(document.createElement('i'), { className: 'fa-solid fa-robot' }));
            }, { once: true });
            cab.replaceWith(img);
        }

        if (!document.getElementById('acolheriaLiaAvatarStyle')) {
            const style = document.createElement('style');
            style.id = 'acolheriaLiaAvatarStyle';
            style.textContent = `
                /* Cabeçalho: mesmo quadrado do ícone que ficava aqui antes. */
                .acolheria-lia-avatar {
                    width: 36px;
                    height: 36px;
                    flex-shrink: 0;
                    border-radius: 50%;
                    object-fit: cover;
                    object-position: center 22%;
                    display: block;
                    border: 1px solid var(--border-color, #e8e3dd);
                    background: var(--primary-light, #ede9fe);
                }

                /* Balões da assistente. O seletor tem que bater com a
                   classe que addModalMessage põe na div: ela é
                   acolheria-msg-assistente. A versão anterior procurava
                   .is-assistente e nunca casou, então o avatar ficava
                   sem estilo nenhum dentro do balão. */
                .acolheria-msg-assistente .acolheria-avatar {
                    overflow: hidden;
                    padding: 0;
                    border: 1px solid var(--border-color, #e8e3dd);
                }
                .acolheria-msg-assistente .acolheria-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    /* A Lia é desenhada de cabeça e ombros: o centro do
                       quadro é o peito, que não diz nada. O foco vai
                       para a cara. */
                    object-position: center 20%;
                    display: block;
                }
            `;
            document.head.appendChild(style);
        }
    }

    if (window.aplicarImagens) window.aplicarImagens();
    aplicarAvatarLia();

    // Botões da Lia na página inicial: o do card e o da faixa larga.
    // Só existem lá, então não há listener órfão nas outras páginas.
    // Botões que abrem o modal da Lia.
    //
    // Antes entrava aqui o 'btn-acolheria-banner', o CTA do card da
    // home. Ele virou link para /chat-Ia/chat-Ia.html: com a página de
    // conversa existindo, pedir a conversa completa e receber um modal
    // em cima da home era o caminho mais curto para frustração.
    //
    // O 'btn-acolheria-faixa' é injetado por este mesmo script, por isso
    // não aparece em nenhum HTML.
    ['btn-acolheria-faixa'].forEach(function (id) {
        document.getElementById(id)?.addEventListener('click', () => {
            openAcolheriaPanel();
        });
    });

    // =============================================
    // SEGURANÇA — camada 1 e 2
    // =============================================

    if (window.AcolheriaSeguranca) {
        // Sem botão "Preciso de ajuda agora" na tela. Ele ocupava espaço
        // em toda conversa, mesmo fora de crise, e repetia o que o aviso
        // de IA já diz. O Painel de Apoio Imediato continua existindo e
        // se abre sozinho quando a conversa indica risco.
        window.AcolheriaSeguranca.ligarUI();
    }

    // =============================================
    // ANIMAÇÃO PULSE PARA O DIGITANDO
    // =============================================
    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
        @keyframes pulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(pulseStyle);

    console.log('💬 AcolherIA painel lateral inicializada com API Groq!');
});
