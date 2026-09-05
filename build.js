const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const output = path.join(root, 'dist');
const env = loadEnv();

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (shouldSkip(entry.name)) continue;
    copyEntry(path.join(root, entry.name), path.join(output, entry.name));
}

for (const filePath of findFiles(output)) {
    if (!filePath.endsWith('.html')) continue;

    let html = fs.readFileSync(filePath, 'utf8');
    html = html
        .replaceAll('%VITE_SUPABASE_URL%', env.VITE_SUPABASE_URL || '')
        .replaceAll('%VITE_SUPABASE_ANON_KEY%', env.VITE_SUPABASE_ANON_KEY || '');
    fs.writeFileSync(filePath, html);
}

console.log(`Site copiado para dist: ${findFiles(output).length} arquivos.`);

function copyEntry(source, destination) {
    const stats = fs.statSync(source);
    if (stats.isDirectory()) {
        fs.mkdirSync(destination, { recursive: true });
        for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
            copyEntry(path.join(source, entry.name), path.join(destination, entry.name));
        }
        return;
    }
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
}

function findFiles(directory) {
    const files = [];
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...findFiles(entryPath));
        else files.push(entryPath);
    }
    return files;
}

function shouldSkip(name) {
    return [
        '.git',
        '.env',
        'node_modules',
        'dist',
        'build.js',
        'vite.config.js',
        'server.js',
        'package.json',
        'package-lock.json',
        'netlify.toml',
        'vercel.json',
        'supabase',
        '.vscode'
    ].includes(name);
}

function loadEnv() {
    const envPath = path.join(root, '.env');
    if (!fs.existsSync(envPath)) return {};

    return Object.fromEntries(
        fs.readFileSync(envPath, 'utf8')
            .split(/\r?\n/)
            .filter(line => line && !line.startsWith('#'))
            .map(line => {
                const separator = line.indexOf('=');
                return [line.slice(0, separator), line.slice(separator + 1)];
            })
    );
}
