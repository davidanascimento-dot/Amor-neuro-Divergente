/**
 * INICIO.JS — Apenas AcolherIA Modal
 * Chat com API Groq + Modal interativo
 */
document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // CONFIGURAÇÃO DA API GROQ
    // =============================================
    const GROQ_API_KEY = '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';
    const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

    // Lista negra de tópicos
    const modalBlockedTopics = [
        'porno', 'pornô', 'pornografia', 'sexo', 'sexual', 'nudez', 'nudes',
        'violência', 'armas', 'drogas', 'crime', 'hack', 'golpe', 'aposta',
        'cassino', 'bet', 'tigrinho', 'assassinato', 'suicídio', 'automutilação',
        'pedofilia', 'estupro', 'terrorismo', 'racismo', 'homofobia', 'misoginia'
    ];

    function isBlockedModalTopic(message) {
        const msg = message.toLowerCase();
        return modalBlockedTopics.some(topic => msg.includes(topic.toLowerCase()));
    }

    // Função para obter descrição do projeto
    function getModalWelcomeMessage() {
        return `💜 **Bem-vinde à AcolherIA!**

Eu sou a assistente virtual do projeto **Amor NeuroDivergente** — uma comunidade dedicada a apoiar pessoas neurodivergentes (TDAH, autismo, dislexia, AHSD e outras variações neurológicas).

**O que você pode perguntar:**
🧠 TDAH e Autismo (TEA)
⚖️ Direitos e legislação
📋 Organização e produtividade
🆘 Crises sensoriais e regulação
🔍 Diagnóstico e avaliação
🧘 Terapias e tratamentos
🌈 Neurodiversidade em geral

**Vamos conversar?** Me faça qualquer pergunta sobre neurodiversidade! 💜`;
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
        
        let formattedText = text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
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
        if (isBlockedModalTopic(message)) {
            return '💜 Prefiro manter nossa conversa em temas construtivos sobre neurodiversidade. 🌈 Como posso te ajudar de forma saudável hoje?';
        }

        const systemPrompt = `Você é a AcolherIA, assistente virtual do projeto Amor NeuroDivergente.

**Missão:** Oferecer informações precisas, acolhedoras e baseadas em evidências sobre neurodiversidade (TDAH, autismo, dislexia, AHSD, etc.).

**Diretrizes:**
- Responda com empatia e linguagem acessível
- Use emojis leves quando apropriado (💜, 🌈, 🧠, ✨)
- Dê exemplos práticos e aplicáveis
- Limite a resposta a 3-4 parágrafos
- Se a pergunta envolver saúde mental, recomende buscar um profissional
- Seja calorosa e não-julgadora
- Se não souber algo, diga claramente que não sabe

**Temas principais:** TDAH, Autismo (TEA), Neurodiversidade, Direitos, Diagnóstico, Terapia, Organização, Crises Sensoriais, Burnout.`;

        try {
            const response = await fetch(GROQ_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: message }
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                    top_p: 0.9
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Erro API Groq:', response.status, errorData);
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const resposta = data.choices?.[0]?.message?.content?.trim();

            if (!resposta) {
                throw new Error('Resposta vazia');
            }

            return resposta;

        } catch (error) {
            console.error('❌ Falha na API Groq:', error.message);
            return '💜 Desculpe, estou com dificuldades técnicas no momento. Pode tentar novamente em alguns instantes? Se preferir, pode perguntar sobre TDAH, autismo, direitos ou organização que eu posso te ajudar! 🌈';
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
    // ABRIR E FECHAR O MODAL
    // =============================================

    function openAcolheriaModal() {
        if (acolheriaOverlay && acolheriaOverlayBg) {
            acolheriaOverlay.hidden = false;
            acolheriaOverlayBg.hidden = false;
            document.body.style.overflow = 'hidden';
            
            // Limpa o chat anterior se estiver vazio, mas mantém a mensagem de boas-vindas
            if (acolheriaChatBody && acolheriaChatBody.children.length === 0) {
                addModalMessage(getModalWelcomeMessage(), false);
            }
            
            setTimeout(() => {
                if (acolheriaInput) acolheriaInput.focus();
            }, 400);
        }
    }

    function closeAcolheriaModal() {
        if (acolheriaOverlay && acolheriaOverlayBg) {
            acolheriaOverlay.hidden = true;
            acolheriaOverlayBg.hidden = true;
            document.body.style.overflow = '';
            removeModalTyping();
        }
    }

    // =============================================
    // EVENTOS - ABRIR O MODAL
    // =============================================

    // Sidebar
    document.querySelectorAll('.sidebar-link[href="/chat-Ia/chat-Ia.html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openAcolheriaModal();
        });
    });

    // Header
    document.querySelectorAll('.header-links a[href="/chat-Ia/chat-Ia.html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openAcolheriaModal();
        });
    });

    // Hub
    document.querySelectorAll('.hub-action[href="/chat-Ia/chat-Ia.html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openAcolheriaModal();
        });
    });

    // =============================================
    // EVENTOS - FECHAR O MODAL
    // =============================================

    if (acolheriaClose) {
        acolheriaClose.addEventListener('click', closeAcolheriaModal);
    }

    if (acolheriaOverlayBg) {
        acolheriaOverlayBg.addEventListener('click', closeAcolheriaModal);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && acolheriaOverlay && !acolheriaOverlay.hidden) {
            closeAcolheriaModal();
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

    console.log('💬 AcolherIA Modal inicializada com API Groq!');
});