const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const SYSTEM_PROMPT = `Você é a AcolherIA, uma assistente virtual acolhedora e especializada em neurodivergência do projeto Amor NeuroDivergente.

Seu objetivo é ajudar pessoas neurodivergentes (TDAH, autismo, dislexia, AHSD, entre outros) com informações, acolhimento e suporte.

Diretrizes gerais:
- Seja sempre empática, acolhedora e respeitosa.
- Use linguagem clara, acessível e inclusiva.
- Forneça informações baseadas em evidências.
- Recomende buscar ajuda profissional quando necessário.
- Não dê diagnósticos médicos.
- Se não souber algo, seja honesta e sugira fontes confiáveis.

Mantenha o foco em neurodivergência, direitos, organização, crises sensoriais, regulação emocional, diagnóstico, terapias, inclusão e acessibilidade.

## PROTOCOLO DE CRISE (prioridade máxima)

Acione este protocolo quando a pessoa falar em suicídio, querer morrer, se matar, se machucar, automutilação, desaparecer para sempre, ou mostrar desespero profundo.

Siga nesta ordem:

1. Comece a resposta exatamente com o marcador [[CRISE]] e nada antes dele.
2. Depois do marcador, escreva de 2 a 4 frases. Valide o que ela sente. Não julgue, não moralize, não tente animar, não pergunte o motivo, não liste consequências.
3. Diga que ela não precisa atravessar isso sozinha e que você fica ali.
4. Oriente a ligar agora para o CVV no 188 (gratuito, sigiloso, 24 horas) e, se o risco for imediato, para o SAMU no 192. Escreva os números de forma clara e visível.
5. Ofereça companhia: pergunte se ela quer continuar falando ou se prefere ficar em silêncio com você.

Proibido neste cenário: conselho clínico, sugerir método, analisar ou aprofundar a ideia, tom de robô ou burocrático, promessas vazias seguidas de encerramento, ou fingir que está tudo normal.

Você não é terapeuta e não substitui atendimento humano. Encaminhar para uma pessoa humana é sempre a resposta correta.

REGRA ABSOLUTA SOBRE NÚMEROS: só cite o CVV 188 e o SAMU 192, que são os únicos que você tem certeza. Nunca invente, chute ou tente lembrar de números de outros países. Se a pessoa não estiver no Brasil, diga que o número depende do país dela e que ela procure a linha de prevenção ao suicídio do seu lugar. Um número errado em momento de crise causa dano real.

## LIMITE DE ESCOPO

Recuse de forma breve e acolhedora apenas pedidos sobre: pornografia e conteúdo sexual explícito, conteúdo sexual de crianças, drogas ilegais, armas, hacking, apostas, terrorismo, ódio e discriminação.

Se pedirem orientação sobre como se machucar ou como morrer, não responda ao pedido: oriente procurar o CVV no 188.`;

loadEnvFile();

const server = http.createServer(async (request, response) => {
    try {
        if (request.method === 'POST' && request.url === '/api/acolheria') {
            await handleAcolheria(request, response);
            return;
        }

        serveStaticFile(request, response);
    } catch (error) {
        console.error('Erro no servidor:', error);
        sendJson(response, 500, { error: 'Erro interno do servidor.' });
    }
});

server.listen(PORT, () => {
    console.log(`Amor NeuroDivergente disponível em http://localhost:${PORT}`);
});

async function handleAcolheria(request, response) {
    if (!process.env.GROQ_API_KEY) {
        sendJson(response, 500, { error: 'GROQ_API_KEY não configurada no .env.' });
        return;
    }

    const body = await readJson(request);
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!message || message.length > 4000) {
        sendJson(response, 400, { error: 'Mensagem inválida.' });
        return;
    }

    const groqResponse = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 500,
            top_p: 0.9
        })
    });

    const data = await groqResponse.json();
    if (!groqResponse.ok) {
        console.error('Erro da API Groq:', groqResponse.status, data);
        sendJson(response, 502, { error: 'A AcolherIA está indisponível no momento.' });
        return;
    }

    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer) {
        sendJson(response, 502, { error: 'A API não retornou uma resposta válida.' });
        return;
    }

    sendJson(response, 200, { answer });
}

function serveStaticFile(request, response) {
    const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
    const relativePath = requestPath === '/' ? '/inicio.html' : requestPath;
    const filePath = path.resolve(ROOT, `.${relativePath}`);

    if (!filePath.startsWith(ROOT + path.sep)) {
        sendJson(response, 403, { error: 'Acesso negado.' });
        return;
    }

    fs.stat(filePath, (error, stats) => {
        if (error || !stats.isFile()) {
            response.writeHead(404, {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache'
            });
            response.end('Arquivo não encontrado.');
            return;
        }

        // =============================================================
        // CACHE
        //
        // Antes esta resposta saía sem nenhum cabeçalho de cache: sem
        // Cache-Control, sem ETag, sem Last-Modified. O Chrome aplica
        // cache heurístico nesse caso e passa a servir CSS e JavaScript
        // antigos SEM revalidar. Na prática, mudar uma regra no
        // inicio.css não aparecia até dar um Ctrl+Shift+R.
        //
        // no-store força a buscar de novo toda vez. É o comportamento
        // correto para desenvolvimento, e é o que evita publicar uma
        // correção e deixar metade dos visitantes na versão antiga.
        //
        // Quem público o site precisa do mesmo efeito no servidor de
        // produção: ou Cache-Control no-cache, ou nomes de arquivo com
        // a data de publicação (inicio.20261002.css).
        // =============================================================
        response.writeHead(200, {
            'Content-Type': contentType(filePath),
            'Cache-Control': 'no-store, must-revalidate',
            'Pragma': 'no-cache'
        });
        fs.createReadStream(filePath).pipe(response);
    });
}

function readJson(request) {
    return new Promise((resolve, reject) => {
        let data = '';
        request.setEncoding('utf8');
        request.on('data', chunk => {
            data += chunk;
            if (data.length > 10000) reject(new Error('Payload muito grande.'));
        });
        request.on('end', () => {
            try {
                resolve(JSON.parse(data || '{}'));
            } catch {
                reject(new Error('JSON inválido.'));
            }
        });
        request.on('error', reject);
    });
}

function sendJson(response, status, payload) {
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(payload));
}

function contentType(filePath) {
    const types = {
        '.css': 'text/css; charset=utf-8',
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
        // As imagens saiam como application/octet-stream porque nao
        // estavam neste mapa. O Chrome aceitava pela snifferizacao na
        // maioria dos casos, mas abrir a imagem direto na barra de
        // endereco falhava com ERR_FAILED. Em producao (Netlify, Vercel)
        // o Content-Type vem da extensao; aqui ele vem daqui.
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.avif': 'image/avif',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mp3': 'audio/mpeg',
        '.txt': 'text/plain; charset=utf-8'
    };
    return types[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function loadEnvFile() {
    const envPath = path.join(ROOT, '.env');
    if (!fs.existsSync(envPath)) return;

    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
        const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
        if (match && !process.env[match[1]]) {
            process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
        }
    }
}