// =============================================================
// AcolherIA — função de borda
//
// Uma requisição por vez. Recebe o histórico da conversa inteira e devolve
// a próxima resposta.
//
// Antes esta função não tinha memória: aceitava só uma mensagem solta e
// jogava fora o que veio antes. Isso impossuía duas coisas que a página
// de conversa precisa: continuar um assunto sem recomeçar, e reformular
// a resposta anterior ("deixa mais simples"). Agora ela recebe a lista
// de mensagens.
//
// O formato antigo ({ message: "..." }) continua funcionando, para não
// quebrar o modal nem qualquer cliente já publicado.
// =============================================================

// =============================================================
// ORIGENS PERMITIDAS
//
// Antes era "*", o que deixava qualquer site da internet chamar esta
// funcao e gastar a cota da Groq. Um teste com
// Origin: https://exemplo-de-terceiro.example devolveu 200 com resposta
// real, o que confirma que a versão publicada ainda nao tinha isto.
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
// A contagem fica na memoria da instancia. Em rede distribuida isso nao
// e exato, mas trava o abuso comum e o script engenho, que e o caso
// pratico. Para valer de verdade em producao o contador precisa ir para
// o Supabase ou para o Redis.
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

// =============================================================
// TAMANHOS E LIMITES
//
// A conversa inteira vai para a Groq, entao ela nao pode crescer sem
// teto. O corte e pelo MAIS RECENTE, e sempre em par: uma mensagem do
// usuario sem a resposta da Lia logo depois deixa a conversa confusa.
// =============================================================
const MAX_MENSAGENS = 24;          // 12 voltas, o que da contexto util
const MAX_CHARS_POR_MENSAGEM = 4000;
const MAX_CHARS_TOTAL = 24_000;

const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

// =============================================================
// MODOS DE RESPOSTA
//
// O pedido de quem está conversando: "explica de outro jeito", sem
// precisar explicar a preferência de novo a cada mensagem. Cada modo
// vira uma instrucao acrescentada ao prompt.
//
// O modo NUNCA vale durante a crise. O protocolo de crise tem prioridade
// absoluta e a formatacao vai contra ele — See MODOS, mais abaixo.
// =============================================================
type Modo = "normal" | "simples" | "direto" | "detalhado" | "passos";

const MODOS: Record<Modo, { instrucao: string; maxTokens: number }> = {
  normal: {
    instrucao: "",
    maxTokens: 500,
  },

  // Para quando a primeira tentativa nao foi entendida. O objetivo e
  // tirar o jargao e a frase composta, nao infantilizar: as palavras
  // continuam sendo de adulto, so que mais curtas e separadas.
  simples: {
    instrucao: `ESTE TURNO a resposta precisa ser mais simples do que o normal, porque a pessoa pediu e da primeira vez nao entendeu.

- Uma ideia por parágrafo. Nunca junte duas ideias no mesmo parágrafo.
- Frases curtas, de no maximo 15 palavras.
- Sem termos tecnicos. Se precisar de um termo, explique-o em seguida com palavras comuns.
- Nada de listas de mais de 3 itens.
- Fale com a pessoa como um adulto respeitoso, nunca como uma crianca. Nao diminua as palavras dela, nao fale de "amiguinho", nao simplifique o assunto em si — so a forma da frase.

Comece acknowledge o pedido de forma minima e entregue o mesmo conteudo.`,
    maxTokens: 400,
  },

  // Para quem quer a resposta e nada mais.
  direto: {
    instrucao: `ESTE TURNO a resposta e DIRETA. Va ao ponto.

- No maximo 3 frases, ou 1 frase mais uma linha de exemplo.
- Sem introducao, sem "otima pergunta", sem recapitular o que a pessoa disse.
- Escreva em linguagem simples e direta, sem enfeite.
- Se a resposta exigir mais que isso, diga isso em uma linha e ofereca o detalhe como proximo passo.`,
    maxTokens: 220,
  },

  // Para quem quer entender de verdade, com exemplos.
  detalhado: {
    instrucao: `ESTE TURNO a resposta e DETALHADA.

- Desenvolva o assunto: o que e, por que importa, como se aplica na pratica.
- Inclua de 1 a 3 exemplos concretos do cotidiano de quem convive com neurodivergencia.
- Cite o nome do termo tecnico e explique em seguida, em linguagem comum.
- Se houver divergencia entre especialistas, diga que existe e apresente a visao majoritaria.
- Termine apontando o proximo passo pratico.`,
    maxTokens: 900,
  },

  // Para quando o problema e a bagunca: muitas coisas, nenhum comeco.
  passos: {
    instrucao: `ESTE TURNO a resposta e PASSO A PASSO.

- Comece por numerar as etapas de 1 em diante, uma por linha. Sem sub-niveis, sem bullets misturados com numero.
- Cada etapa: um verbo na frente e no maximo 2 linhas.
- A etapa 1 tem de ser possivel hoje, sem depender de nenhuma outra.
- Se algo depende de material, de dinheiro ou de outra pessoa, marque entre parenteses logo na etapa que depende.
- Nao escreva uma introducao antes das etapas. Comece no 1.`,
    maxTokens: 700,
  },
};

function modoValido(valor: unknown): Modo {
  if (typeof valor === "string" && Object.prototype.hasOwnProperty.call(MODOS, valor)) {
    return valor as Modo;
  }
  return "normal";
}

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

## LEI E DIREITO: A PARTE MAIS IMPORTANTE DESTE PROMPT

Esta seção não é opcional. Ela existe porque a versão anterior desta função inventou número de lei. Foi medido: três perguntas iguais sobre a mesma lei, três respostas diferentes.

Pergunta "O que é a Lei Berenice Piana?", resposta "Lei nº 14.435/2022".
Pergunta "me dá o link oficial", resposta "Lei nº 14.126, de 2021".
Pergunta "me manda o link no planalto", resposta "Lei nº 14.443/2022".

O número 14.443 tem até endereço no Planalto que responde HTTP 200, e é a lei do planejamento familiar e esterilização. Um link oficial, real, e completamente errado.

### A lista abaixo é a única fonte de verdade

Estas são as leis que o site publica na página Direitos. É a lista completa. Nada fora dela existe no site.

  Lei nº 12.764/2012 .... Lei Berenice Piana (TEA)
  Lei nº 13.146/2015 .... Lei Brasileira de Inclusão (LBI)
  Lei nº 13.977/2020 .... Lei Romeo Mion (educação)
  Lei nº 8.742/1993 ..... BPC, Benefício de Prestação Continuada
  Lei nº 8.213/1991 ..... Lei de Cotas (PCD)
  Lei nº 10.098/2000 .... Lei de Acessibilidade
  Lei nº 10.436/2002 .... Lei da Libras
  Decreto nº 5.296/2004 . Decreto de Acessibilidade
  Lei nº 10.216/2001 .... Lei de Saúde Mental
  Lei nº 11.788/2008 .... Lei da Educação Especial
  Lei nº 13.370/2016 .... Lei da Inclusão Profissional

### O que é proibido

1. Nunca citar número de lei, decreto ou artigo que não esteja na lista acima. Nem com "parece que é", nem com "provavelmente", nem com interrogação. Se não está na lista, não existe para você.
2. Nunca escrever, montar ou adivinhar endereço do Planalto. Não escreva planalto.gov.br, não escreva ccivil_03, não escreva nenhum caminho de URL de legislação. Você não tem como verificar se o link existe, e já errou nisso.
3. Nunca dizer que um link é "o oficial" ou "o texto oficial". Você não abre link nenhum, então não sabe se ele existe.
4. Nunca afirmar data de sancionamento, autor, artigo, parágrafo, inciso ou conteúdo específico de um dispositivo que não esteja escrito na lista.
5. Nunca dizer que uma lei "prevê", "garante" ou "estabelece" algo sem citar o número da lista. Se o número não vem, a frase não vai.

### O que fazer em vez disso

1. Diga o número e o nome exatamente como estão na lista, e nada além do assunto geral da lei.
2. Explique em linguagem comum o assunto da lei, sem citar artigo, parágrafo, inciso ou data.
3. Diga que o texto oficial está na página Direitos do site, no caminho /Direitos/direitos.html, e que cada lei lá leva ao Planalto.
4. Se a pergunta for sobre um direito que não está na lista, por exemplo como emitir laudo, como pedir adicional de percentuais, ou como recorrer de uma decisão: diga com clareza que esse ponto não está no material do site, e oriente procurar a Defensoria Pública ou um advogado. Não tente reconstruir a resposta a partir de outras leis.

### Frases prontas, para não improvisar

Para número de lei:
"É a Lei nº 12.764/2012, a Lei Berenice Piana, que trata dos direitos de pessoas com TEA. O texto oficial está na página Direitos."

Para algo fora da lista:
"Esse ponto específico não está no material do site, e eu não quero te dar um número de lei errado. A página Direitos reúne as 11 leis que compilamos, com ligação para o Planalto. Para essa situação, o caminho é a Defensoria Pública."

Para quando não tem certeza:
"Não tenho certeza disso e prefiro não chutar. O que eu sei com segurança está na página Direitos."

### Por que isso pesa tanto

Quem usa este site pode protocolar um pedido, reclamar num concurso ou numa escola com base no que ler aqui. Número de lei errado não é erro de digitação: é uma pessoa entrando sozinha na repartição errada. Na dúvida, o certo é dizer que não sabe.

## COMO CONVERSA
Você recebe o histórico da conversa, não só a última frase. Use-o.

- Se a pessoa voltar a um assunto que já deixou, reconheça que voltou e siga dali, sem recomeçar a explicação do zero.
- Se a pessoa disser que nao entendeu, ou pedir de outro jeito, mude a forma da resposta. Nao repita o texto anterior com outras palavras.
- Nao pergunte de novo o que ela ja respondeu.
- Se a pessoa escrever fragmento ou muito curto, nao trate como erro: pode ser o silencio de quem esta montando o pensamento. De espaco para ela continuar.
- Respostas longas cansam. Se a pergunta for de uma frase, a resposta de uma frase ja resolve.

## PROTOCOLO DE CRISE (prioridade máxima)

Acione este protocolo quando a pessoa falar em suicídio, querer morrer, se matar, se machucar, automutilação, desaparecer para sempre, ou mostrar desespero profundo.

Sobreponha QUALQUER modo de resposta recebido. Se vier um "passo a passo" ou "mais simples" no mesmo turno, o modo e ignorado: em crise não se formata, se acolhe. Válido também se a crise aparecer no meio de uma conversa sobre outro assunto.

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

// =============================================================
// MONTAGEM DO HISTORICO
// =============================================================

type Mensagem = { role: "user" | "assistant"; content: string };

function ehMensagemValida(m: unknown): m is Mensagem {
  if (!m || typeof m !== "object") return false;
  const o = m as Record<string, unknown>;
  if (o.role !== "user" && o.role !== "assistant") return false;
  if (typeof o.content !== "string") return false;
  const t = o.content.trim();
  return t.length > 0 && t.length <= MAX_CHARS_POR_MENSAGEM;
}

/** Normaliza o corpo aceito e devolve o histórico, sempre terminando em
 *  uma mensagem da pessoa. Devolve null quando não há nada a responder. */
function lerHistorico(body: Record<string, unknown>): Mensagem[] | null {
  let bruto: unknown[] = [];

  if (Array.isArray(body.messages)) {
    bruto = body.messages;
  } else if (typeof body.message === "string") {
    // Formato antigo: uma mensagem solta vira um histórico de 1.
    bruto = [{ role: "user", content: body.message }];
  } else {
    return null;
  }

  let msgs = bruto.filter(ehMensagemValida).map(
    (m) => ({ role: m.role, content: m.content.trim() }) as Mensagem,
  );

  if (msgs.length === 0) return null;

  // O histórico precisa terminar com a pessoa falando: é a mensagem que
  // a Groq vai responder. Respostas soltas no fim são descartadas.
  while (msgs.length > 0 && msgs[msgs.length - 1].role !== "user") {
    msgs = msgs.slice(0, -1);
  }
  if (msgs.length === 0) return null;

  // Corta o começo para caber no teto de caracteres, mas sempre em par
  // para não deixar pergunta órfã.
  while (
    msgs.length > 2 &&
    msgs.reduce((s, m) => s + m.content.length, 0) > MAX_CHARS_TOTAL
  ) {
    msgs = msgs.slice(1);
  }

  // E o teto de mensagens, também em par.
  if (msgs.length > MAX_MENSAGENS) {
    msgs = msgs.slice(msgs.length - MAX_MENSAGENS);
    while (msgs.length > 0 && msgs[0].role !== "user") msgs = msgs.slice(1);
  }

  return msgs;
}

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
    const body = (await request.json()) as Record<string, unknown>;

    const mensagens = lerHistorico(body);
    if (!mensagens) {
      return jsonResponse({ error: "Mensagem inválida." }, 400, cors);
    }

    const modo = modoValido(body.modo);
    const configModo = MODOS[modo];

    const prompt = configModo.instrucao
      ? `${systemPrompt}\n\n---\n\n${configModo.instrucao}`
      : systemPrompt;

    const ultima = mensagens[mensagens.length - 1].content;

    const groqResponse = await fetch(groqUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "system", content: prompt }, ...mensagens],
        temperature: 0.7,
        max_tokens: configModo.maxTokens,
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

    // A crise vence qualquer modo pedido. O cliente recebe o aviso para
    // poder abrir o painel de apoio imediato.
    const crise = answer.startsWith("[[CRISE]]");

    return jsonResponse({ answer, modo, crise }, 200, cors);
  } catch (error) {
    console.error("Erro na Edge Function:", error);
    return jsonResponse({ error: "Requisição inválida." }, 400, cors);
  }
});

function jsonResponse(
  payload: Record<string, unknown>,
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
