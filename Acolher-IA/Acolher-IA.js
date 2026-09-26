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
    function getModalWelcomeMessage() {
        return `💜 **Bem-vinde à AcolherIA!**

Eu sou a assistente virtual do projeto **Amor NeuroDivergente** — uma comunidade dedicada a apoiar pessoas neurodivergentes (TDAH, autismo, dislexia, AHSD e outras variações neurológicas).

**O que você pode perguntar:**
 TDAH e Autismo (TEA)
 Direitos e legislação
 Organização e produtividade
 Crises sensoriais e regulação
 Diagnóstico e avaliação
 Terapias e tratamentos
 Neurodiversidade em geral

**Vamos conversar?** Me faça qualquer pergunta sobre neurodiversidade! 💜`;
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
        messageDiv.className = `acolheria-msg ${isUser ? 'acolheria-msg-user' : ''}`;

        const avatar = document.createElement('div');
        avatar.className = 'acolheria-avatar';
        avatar.innerHTML = isUser ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';

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
            acolheriaSuggestions.style.display = 'none';
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

        // Limpa o chat anterior se estiver vazio, mas mantém a mensagem de boas-vindas
        if (acolheriaChatBody && acolheriaChatBody.children.length === 0) {
            addModalMessage(getModalWelcomeMessage(), false);
        }

        if (jaAberto) return;

        setTimeout(() => {
            if (acolheriaInput) acolheriaInput.focus();
        }, 320);
    }

    function closeAcolheriaPanel() {
        if (!acolheriaOverlay) return;
        acolheriaOverlay.hidden = true;
        if (acolheriaOverlayBg) acolheriaOverlayBg.hidden = true;
        removeModalTyping();
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

    // Sidebar
    document.querySelectorAll('.sidebar-link[href="/chat-Ia/chat-Ia.html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openAcolheriaPanel();
        });
    });

    // Header
    document.querySelectorAll('.header-links a[href="/chat-Ia/chat-Ia.html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openAcolheriaPanel();
        });
    });

    // Hub
    document.querySelectorAll('.hub-action[href="/chat-Ia/chat-Ia.html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openAcolheriaPanel();
        });
    });

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
    // SEGURANÇA — camada 1 e 2
    // =============================================

    if (window.AcolheriaSeguranca) {
        // Ajuda sempre acessível, mesmo fora de crise (prática recomendada).
        // Criado ANTES de ligarUI() para que o listener seja registrado.
        const nota = document.querySelector('.acolheria-footer-note');
        if (nota && !document.getElementById('acolheriaSemAjuda')) {
            const sos = document.createElement('button');
            sos.type = 'button';
            sos.id = 'acolheriaSemAjuda';
            sos.className = 'acolheria-sos';
            sos.innerHTML = '<i class="fa-solid fa-life-ring"></i> Preciso de ajuda agora';
            nota.insertAdjacentElement('afterend', sos);
        }

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