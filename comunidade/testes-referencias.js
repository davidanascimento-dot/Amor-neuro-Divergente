/**
 * Caça referência a função que não existe dentro do IIFE.
 * node --check não pega isso: a sintaxe é válida, o erro só aparece
 * em runtime, e só no caminho que chama a função.
 *
 * Rodar: node comunidade/testes-referencias.js
 */
const fs = require('node:fs');
const path = require('node:path');

const ALVO = path.join(__dirname, 'conversas.js');
const bruto = fs.readFileSync(ALVO, 'utf8');

/**
 * Tira comentario e conteudo de string.
 *
 * Sem isso, qualquer palavra escrita numa explicacao conta como
 * "chamada de funcao" e o teste acusa erro onde nao tem nenhum.
 */
function semCommentsNemStrings(texto) {
    let saida = '';
    let estado = 'codigo';
    for (let i = 0; i < texto.length; i++) {
        const c = texto[i];
        const p = texto[i + 1];

        if (estado === 'codigo') {
            if (c === '/' && p === '/') { estado = 'linha'; i++; continue; }
            if (c === '/' && p === '*') { estado = 'bloco'; i++; continue; }
            if (c === "'" || c === '"') { estado = 'aspas'; continue; }
            if (c === '`') { estado = 'template'; continue; }
            saida += c;
            continue;
        }

        if (estado === 'linha') {
            if (c === '\n') { estado = 'codigo'; saida += '\n'; }
            continue;
        }

        if (estado === 'bloco') {
            if (c === '*' && p === '/') { estado = 'codigo'; i++; }
            continue;
        }

        // Dentro de string: escape come o proximo caractere.
        if (c === '\\') { i++; continue; }
        if (estado === 'aspas' && (c === "'" || c === '"')) estado = 'codigo';
        if (estado === 'template' && c === '`') estado = 'codigo';
    }
    return saida;
}

const codigo = semCommentsNemStrings(bruto);

// 1. Funções declaradas
const declaradas = new Set();
for (const m of codigo.matchAll(/^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm)) {
    declaradas.add(m[1]);
}

// 2. Consts de classe
for (const m of codigo.matchAll(/^\s*const\s+([A-Za-z_$][\w$]*)\s*=/gm)) {
    declaradas.add(m[1]);
}

// 3. Globais que o browser já tem (não precisam ser declaradas aqui)
const GLOBAIS = new Set([
    'window', 'document', 'console', 'supabase', 'state', 'pageUrl', 'page',
    'navigator', 'location', 'history', 'localStorage', 'setTimeout', 'clearTimeout',
    'setInterval', 'clearInterval', 'URL', 'Blob', 'File', 'FileReader', 'MediaRecorder',
    'IntersectionObserver', 'MutationObserver', 'requestAnimationFrame', 'cancelAnimationFrame',
    'fetch', 'crypto', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Math', 'JSON',
    'Date', 'Promise', 'Map', 'Set', 'WeakMap', 'WeakSet', 'RegExp', 'Error', 'parseInt',
    'parseFloat', 'isNaN', 'encodeURIComponent', 'decodeURIComponent', 'TextEncoder',
    'TextDecoder', 'Intl', 'performance', 'CustomEvent', 'Event', 'MouseEvent',
    'KeyboardEvent', 'HTMLElement', 'Node', 'DOMParser', 'FormData', 'Headers',
    'ResizeObserver', 'structuredClone', 'AbortController', 'URLSearchParams'
]);

// 4. Chamadas: nome( que parece função
// Palavras que aparecem como nome() mas não são chamada de função.
const PALAVRAS = /^(if|for|while|switch|catch|return|typeof|function|new|await|do|else|async|var|let|const|apply|call|bind|comunidade|comentario|undefined|null|true|false|resolve|reject|then|get_messages)$/;

const chamadas = new Map();
for (const m of codigo.matchAll(/(?:^|[^\w.$])([A-Za-z_$][\w$]*)\s*\(/g)) {
    const nome = m[1];
    if (GLOBAIS.has(nome) || PALAVRAS.test(nome)) continue;
    chamadas.set(nome, (chamadas.get(nome) || 0) + 1);
}

const suspeitas = [];
for (const [nome, total] of chamadas) {
    if (declaradas.has(nome)) continue;
    if (/^openAcolheria|^closeAcolheria/.test(nome)) continue;
    // String dentro de comentário ou template: nome de RPC, caminho, etc.
    if (new RegExp(`['"\`]${nome}\\s*\\(`).test(bruto)) continue;
    suspeitas.push({ nome, total });
}

console.log('\nREFERÊNCIAS EM conversations.JS');
console.log('='.repeat(56));
console.log(`Funções/consts declaradas : ${declaradas.size}`);
console.log(`Chamadas analisadas       : ${chamadas.size}`);

if (suspeitas.length) {
    console.log('\nCHAMADAS SEM DECLARAÇÃO LOCAL:');
    suspeitas.forEach(s => console.log(`  - ${s.nome}  (${s.total}x)`));
    console.log('\nDica: nomes parecidos (ex: ligarMidiaUI vs ligarMediaUI)');
    console.log('passam no node --check e só quebram em runtime.');
} else {
    console.log('\nOK: nenhuma chamada aponta para função inexistente.');
}
console.log('='.repeat(56));
process.exit(suspeitas.length ? 1 : 0);
