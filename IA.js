// ============================================
// CONFIGURAÇÃO
// ============================================
const API_KEY = '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';
const MODEL = 'llama-3.1-8b-instant';


 const modalBlockedTopics = [
        'porno', 'pornô', 'pornografia', 'sexo', 'sexual', 'nudez', 'nudes',
        'violência', 'armas', 'drogas', 'crime', 'hack', 'golpe', 'aposta',
        'cassino', 'bet', 'tigrinho', 'assassinato', 'suicídio', 'automutilação',
        'pedofilia', 'estupro', 'terrorismo', 'racismo', 'homofobia', 'misoginia'
    ];

    

let isProcessing = false;
let history = [];

// ============================================
// ENVIA MENSAGEM
// ============================================
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message || isProcessing) return;

  input.value = '';
  input.disabled = true;
  
  addMessage(message, 'user');
  history.push({ role: 'user', content: message });
  showTyping();
  
  try {
    isProcessing = true;
    const response = await callGroq(message);
    removeTyping();
    addMessage(response, 'bot');
    history.push({ role: 'assistant', content: response });
  } catch (error) {
    removeTyping();
    console.error('Erro completo:', error);
    addMessage(`😅 Erro: ${error.message || 'Tente novamente.'}`, 'bot');
  } finally {
    isProcessing = false;
    input.disabled = false;
    input.focus();
  }
}

// ============================================
// CHAMA GROQ (COM TRATAMENTO DE ERRO DETALHADO)
// ============================================
async function callGroq(message) {
  try {
    console.log('📤 Enviando requisição para Groq...');
    console.log('Mensagem:', message);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'Você é o AcolherIA, especialista em TDAH, Autismo e saúde mental. Seja acolhedor e informativo.' 
          },
          ...history.slice(-5),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    console.log('📥 Status da resposta:', response.status);
    console.log('📥 Headers:', response.headers);

    // Se não for OK, pega o erro detalhado
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro da API:', errorData);
      
      // Mensagens de erro mais específicas
      if (response.status === 401) {
        throw new Error('Chave API inválida. Verifique sua chave da Groq.');
      } else if (response.status === 429) {
        throw new Error('Limite de requisições excedido. Aguarde um momento.');
      } else if (response.status === 403) {
        throw new Error('Acesso negado. Verifique suas permissões na Groq.');
      } else {
        throw new Error(errorData.error?.message || `Erro ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('✅ Resposta recebida com sucesso!');
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      throw new Error('Formato de resposta inesperado');
    }

  } catch (error) {
    console.error('❌ Erro na chamada:', error);
    throw error;
  }
}

const systemPrompt = `Você é a AcolherIA, uma assistente virtual acolhedora e especializada em neurodivergência do projeto Amor NeuroDivergente. 
        
Seu objetivo é ajudar pessoas neurodivergentes (TDAH, autismo, dislexia, AHSD, entre outros) com informações, acolhimento e suporte.

Diretrizes:
- não fale sobre assuntos que não estejam relacionados à neurodivergência
- Seja sempre empática, acolhedora e respeitosa
- Use linguagem clara, acessível e inclusiva
- Forneça informações baseadas em evidências
- Recomende buscar ajuda profissional quando necessário
- Não dê diagnósticos médicos
- Mantenha um tom positivo e encorajador
- Se não souber algo, seja honesta e sugira buscar fontes confiáveis

Áreas de conhecimento:
- TDAH, Autismo (TEA), Dislexia, AHSD e outras neurodivergências
- Direitos e legislação para pessoas neurodivergentes
- Organização e produtividade
- Crises sensoriais e regulação emocional
- Processo de diagnóstico e avaliação
- Terapias e tratamentos disponíveis
- Inclusão e acessibilidade

Responda sempre de forma acolhedora e informativa, mantendo o foco em apoiar a pessoa neurodivergente.`;




// ============================================
// AUXILIARES (mantidos iguais)
// ============================================
function addMessage(text, sender) {
  const chatBody = document.getElementById('chatMessages');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerHTML = sender === 'bot' ? text.replace(/\n/g, '<br>') : text;
  chatBody.appendChild(bubble);
  chatBody.scrollTop = chatBody.scrollHeight;
  const tags = document.getElementById('chatTags');
  if (tags && (sender === 'user' || sender === 'bot')) tags.style.display = 'none';
}

function showTyping() {
  const chatBody = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.id = 'typingIndicator';
  div.className = 'chat-bubble bot';
  div.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function sendQuickTag(tag) {
  document.getElementById('chatInput').value = `Quero saber sobre ${tag}`;
  sendMessage();
}

// ============================================
// TESTE DE CONEXÃO (opcional)
// ============================================
async function testGroqConnection() {
  try {
    console.log('🔍 Testando conexão com Groq...');
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexão OK! Modelos disponíveis:', data.data.map(m => m.id));
    } else {
      console.error('❌ Falha na conexão:', response.status);
    }
  } catch (error) {
    console.error('❌ Erro de conexão:', error);
  }
}

// Executa teste ao carregar
window.addEventListener('DOMContentLoaded', () => {
  testGroqConnection();
});