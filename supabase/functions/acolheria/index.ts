const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
const systemPrompt = `Você é a AcolherIA, uma assistente virtual acolhedora e especializada em neurodivergência do projeto Amor NeuroDivergente.

Seu objetivo é ajudar pessoas neurodivergentes (TDAH, autismo, dislexia, AHSD, entre outros) com informações, acolhimento e suporte.

Diretrizes:
- Seja sempre empática, acolhedora e respeitosa.
- Use linguagem clara, acessível e inclusiva.
- Forneça informações baseadas em evidências.
- Recomende buscar ajuda profissional quando necessário.
- Não dê diagnósticos médicos.
- Mantenha um tom positivo e encorajador.
- Se não souber algo, seja honesta e sugira fontes confiáveis.

Mantenha o foco em neurodivergência, direitos, organização, crises sensoriais, regulação emocional, diagnóstico, terapias, inclusão e acessibilidade.`;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Método não permitido." }, 405);
  }

  const groqApiKey = Deno.env.get("GROQ_API_KEY");
  if (!groqApiKey) {
    return jsonResponse({ error: "GROQ_API_KEY não configurada." }, 500);
  }

  try {
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message || message.length > 4000) {
      return jsonResponse({ error: "Mensagem inválida." }, 400);
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
      return jsonResponse({ error: "A AcolherIA está indisponível no momento." }, 502);
    }

    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return jsonResponse({ error: "A API não retornou uma resposta válida." }, 502);
    }

    return jsonResponse({ answer }, 200);
  } catch (error) {
    console.error("Erro na Edge Function:", error);
    return jsonResponse({ error: "Requisição inválida." }, 400);
  }
});

function jsonResponse(payload: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
