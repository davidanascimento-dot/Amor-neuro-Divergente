// =============================================================
// ORIGENS PERMITIDAS
//
// Antes era "*", o que deixava qualquer site da internet chamar esta
// funcao e gastar a cota da Groq. Agora so o proprio site (e o
// ambiente de teste local) passam.
//
// Para liberar outro dominio, acrescente o dominio completo aqui,
// sem barra no fim. Nao use "*": ele anula exatamente esta protecao.
// =============================================================
const ORIGENS_PERMITIDAS = [
  "https://amorneurodivergente.com",
  "https://www.amorneurodivergente.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5501",
  "http://127.0.0.1:5501",
];

const CORS_BASE = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

// Retorna null quando a origem nao esta na lista. O chamador decide
// o que fazer nesse caso.
function corsHeadersFor(request: Request) {
  const origem = request.headers.get("origin") || "";

  // Sem Origin costuma ser chamada de teste (curl, health check).
  // Nao vem de um navegador de outra pessoa, entao nao e abuso.
  if (!origem) return { ...CORS_BASE, "Access-Control-Allow-Origin": "" };

  if (!ORIGENS_PERMITIDAS.includes(origem)) return null;

  return { ...CORS_BASE, "Access-Control-Allow-Origin": origem };
}

// =============================================================
// LIMITE DE USO
//
// Sem isto, uma pessoa (ou um script) podia chamar a funcao em laco e
// estourar a cota da Groq, deixando a AcolherIA sem resposta para todo
// mundo.
//
// A contagem fica na memoria da instancia. Em rede distribuida isso
// nao e exato, mas trava o abuso comum e o script ingenho, que e o
// caso pratico. Para valer de verdade em producao o contador precisa
// ir para o Supabase ou para o Redis.
// =============================================================
const LIMITE_POR_MINUTO = 8;
const JANELA_MS = 60_000;
const acessos = new Map<string, number[]>();

function excedeuLimite(chave: string): boolean {
  const agora = Date.now();
  const recentes = (acessos.get(chave) || []).filter((t) => agora - t < JANELA_MS);

  if (recentes.length >= LIMITE_POR_MINUTO) {
    acessos.set(chave, recentes);
    return true;
  }

  recentes.push(agora);
  acessos.set(chave, recentes);
  return false;
}

// Impede que o mapa cresca sem parar com IPs descartados.
setInterval(() => {
  const agora = Date.now();
  acessos.forEach((tempos, chave) => {
    const vivos = tempos.filter((t) => agora - t < JANELA_MS);
    if (vivos.length === 0) acessos.delete(chave);
    else acessos.set(chave, vivos);
  });
}, JANELA_MS);

const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

const systemPrompt = `Você é a AcolherIA, uma assistente virtual acolhedora e especializada em neurodiversidade do projeto Amor NeuroDivergente.

Seu objetivo é ajudar pessoas neurodivergentes (TDAH, autismo, dislexia, AHSD e outras variações neurológicas) com informação, acolhimento e suporte.

Diretrizes gerais:
- Seja sempre empática, acolhedora e respeitosa.
- Use linguagem clara, acessível e inclusiva.
- Forneça informação baseada em evidências.
- Recomende buscar ajuda profissional quando necessário.
- Não faça diagnóstico médico.
- Se não souber algo, seja honesta e sugira fontes confiáveis.
- Mantenha o foco em neurodiversidade, direitos, organização, crises sensoriais, regulação emocional, diagnóstico, terapias, inclusão e acessibilidade.

## PROTOCOLO DE CRISE (prioridade máxima)

Acione este protocolo quando a pessoa falar em suicídio, querer morrer, se matar, se machucar, automutilação, desaparecer para sempre, ou mostrar desespero profundo.

Siga nesta ordem:

1. Comece a resposta exatamente com o marcador [[CRISE]] e nada antes dele.
2. Depois do marcador, escreva de 2 a 4 frases. Valide o que ela sente. Não julgue, não moralize, não tente animar, não pergunte o motivo, não liste consequências.
3. Diga que ela não precisa atravessar isso sozinha e que você fica ali.
4. Oriente a ligar agora para o CVV no 188 (gratuito, sigiloso, 24 horas) e, se o risco for imediato, para o SAMU no 192. Escreva os números de forma clara e visível.
5. Ofereça companhia: pergunte se ela quer continuar falando ou se prefere ficar em silêncio com você.

Proibido neste cenário: conselho clínico, sugerir método, analisar ou aprofundar a ideia, tom de robô ou burocrático, promessas vazias como "eu me importo" seguidas de encerramento, ou fingir que está tudo normal.

Você não é terapeuta e não substitui atendimento humano. Encaminhar para uma pessoa humana é sempre a resposta correta.

REGRA ABSOLUTA SOBRE NÚMEROS: só cite o CVV 188 e o SAMU 192, que são os únicos que você tem certeza. Nunca invente, chute ou tente lembrar de números de outros países. Se a pessoa não estiver no Brasil, diga que o número depende do país dela e que ela procure a linha de prevenção ao suicídio do seu lugar. Um número errado em momento de crise causa dano real.

## LIMITE DE ESCOPO

Recuse de forma breve e acolhedora apenas pedidos sobre: pornografia e conteúdo sexual explícito, conteúdo sexual de crianças, drogas ilegais, armas, hacking, golpes, apostas, terrorismo, ódio e discriminação.

Se pedirem orientação sobre como se machucar ou como morrer, não responda ao pedido: oriente procurar o CVV no 188.`;

Deno.serve(async (request) => {
  const cors = corsHeadersFor(request);

  // Origem de fora da lista: nao devolve nem o corpo da resposta.
  if (!cors) {
    return new Response(JSON.stringify({ error: "Origem não permitida." }), {
      status: 403,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Método não permitido." }, 405, cors);
  }

  // Limite por origem. O 429 vem sem CORS de proposito: se viesse com,
  // o navegador esconderia o status e a pagina oficial mostraria apenas
  // "falhou", sem explicar a espera.
  if (excedeuLimite(request.headers.get("origin") || "desconhecida")) {
    return new Response(
      JSON.stringify({
        error: "Você está enviando mensagens depressa demais. Respira um pouco e tenta de novo em instantes.",
      }),
      { status: 429, headers: { "Content-Type": "application/json; charset=utf-8" } },
    );
  }

  const groqApiKey = Deno.env.get("GROQ_API_KEY");
  if (!groqApiKey) {
    return jsonResponse({ error: "GROQ_API_KEY não configurada." }, 500, cors);
  }

  try {
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message || message.length > 4000) {
      return jsonResponse({ error: "Mensagem inválida." }, 400, cors);
    }

    const groqResponse = await fetch(groqUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9,
      }),
    });

    const data = await groqResponse.json();
    if (!groqResponse.ok) {
      console.error("Erro da API Groq:", groqResponse.status, data);
      return jsonResponse({ error: "A AcolherIA está indisponível no momento." }, 502, cors);
    }

    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return jsonResponse({ error: "A API não retornou uma resposta válida." }, 502, cors);
    }

    return jsonResponse({ answer }, 200, cors);
  } catch (error) {
    console.error("Erro na Edge Function:", error);
    return jsonResponse({ error: "Requisição inválida." }, 400, cors);
  }
});

function jsonResponse(
  payload: Record<string, string>,
  status = 200,
  cors: Record<string, string> = {},
) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
