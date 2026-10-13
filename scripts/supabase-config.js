/* ==========================================================================
   SUPABASE-CONFIG.JS — gera /js/supabase-config.js a partir do .env
   --------------------------------------------------------------------------
   É este script que tira a URL e a chave do código das páginas: os 21
   <script> inline com supabase.createClient(...) viraram um único arquivo,
   /js/supabase.js, que lê a configuração de /js/supabase-config.js.

   Ele roda sozinho antes do `npm run dev` e do `npm run build`
   (ver os hooks predev/prebuild no package.json). Não precisa chamar na mão.

   Uso:
       node scripts/supabase-config.js          gera em ./js
       writeSupabaseConfig(destino)             usado pelo build.js no dist/

   De onde vem a configuração, em ordem de prioridade:
       1. variáveis de ambiente (é assim que a Vercel entrega)
       2. arquivo .env na raiz do projeto
   ========================================================================== */

const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

/* Lê do ambiente e do .env. Ambiente ganha porque é o que a Vercel monta. */
function loadSettings() {
    const fromFile = readDotEnv();

    return {
        url: pick('VITE_SUPABASE_URL', fromFile),
        anonKey: pick('VITE_SUPABASE_ANON_KEY', fromFile)
    };
}

function pick(name, fromFile) {
    const fromEnv = process.env[name];
    return (fromEnv || fromFile[name] || '').trim();
}

function readDotEnv() {
    const envPath = path.join(root, '.env');
    if (!fs.existsSync(envPath)) return {};

    const values = {};

    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const separator = trimmed.indexOf('=');
        if (separator === -1) continue;

        const key = trimmed.slice(0, separator).trim();
        values[key] = trimmed.slice(separator + 1).trim();
    }

    return values;
}

/* Escreve o arquivo de configuração dentro de `targetDir`. */
function writeSupabaseConfig(targetDir) {
    const config = loadSettings();

    if (!config.url || !config.anonKey) {
        console.error('\n[supabase-config] Faltam as variáveis do Supabase.\n');
        console.error('  Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
        console.error('  (copie o .env.example) ou no painel da Vercel, e rode o comando de novo.\n');
        process.exit(1);
    }

    // resolve (e não join) para aceitar tanto "js" quanto um caminho absoluto,
    // que é o que o build.js passa ao escrever direto no dist.
    const targetDirPath = path.resolve(root, targetDir);
    fs.mkdirSync(targetDirPath, { recursive: true });
    fs.writeFileSync(
        path.join(targetDirPath, 'supabase-config.js'),
        '/* Arquivo gerado automaticamente. Não edite à mão e não versione. */\n' +
        '/* Fonte: .env ou variáveis de ambiente. Regerado por npm run dev / npm run build. */\n' +
        `window.SUPABASE_CONFIG = ${JSON.stringify(config, null, 4)};\n`,
        'utf8'
    );

    return config;
}

/* Executado direto (`node scripts/supabase-config.js`) gera em ./js. */
if (require.main === module) {
    writeSupabaseConfig('js');
    console.log('[supabase-config] js/supabase-config.js gerado a partir do .env.');
}

module.exports = { writeSupabaseConfig };