const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
