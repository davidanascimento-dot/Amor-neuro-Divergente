const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const SYSTEM_PROMPT = `Você é a AcolherIA, uma assistente virtual acolhedora e especializada em neurodivergência do projeto Amor NeuroDivergente.

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
            response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            response.end('Arquivo não encontrado.');
            return;
        }

        response.writeHead(200, { 'Content-Type': contentType(filePath) });
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
        '.svg': 'image/svg+xml'
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