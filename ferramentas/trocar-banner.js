/* Troca o bloco 6.1 do banner de boas-vindas em comunidade.css pela
   versão clara e verde, escrita em ferramentas/banner-novo.css.

   Opera por LINHA, não por regex: o bloco tem comentários com
   caracteres que casariam com padrões, e o caminho já deu um problema
   quando esse mesmo arquivo tentou mexer por regex.

   Os limites são: do `.welcome-banner {` até a linha imediatamente
   anterior ao cabeçalho da seção 7.
*/
const fs = require('fs');
const path = require('path');

const raiz = process.argv[2];
const CSS = path.join(raiz, 'comunidade', 'comunidade.css');
const NOVO = path.join(raiz, 'ferramentas', 'banner-novo.css');

const linhas = fs.readFileSync(CSS, 'utf8').split('\n');

const inicio = linhas.findIndex((L) => /^\.welcome-banner\s*\{/.test(L));
if (inicio === -1) {
    console.log('*** nao achei o inicio do bloco .welcome-banner ***');
    process.exit(1);
}

// o bloco vai ate a linha antes do comentario da secao 7
let fim = -1;
for (let i = inicio; i < linhas.length; i++) {
    if (/^\s*7\. BOT/.test(linhas[i])) {
        // sobe ate o inicio do comentario /* que precede a secao 7
        let j = i - 1;
        while (j > inicio && linhas[j].trim() === '') j--;
        if (linhas[j].trim().startsWith('/*')) {
            while (j > inicio && !linhas[j].trim().startsWith('/*')) j--;
        }
        fim = j;
        break;
    }
}

if (fim === -1) {
    console.log('*** nao achei o fim do bloco (secao 7) ***');
    process.exit(1);
}

console.log('bloco atual: linhas ' + (inicio + 1) + '..' + fim);

const novoBloco = fs.readFileSync(NOVO, 'utf8').replace(/\s+$/, '').split('\n');

const saida = linhas.slice(0, inicio).concat(novoBloco, [''], linhas.slice(fim));
fs.writeFileSync(CSS, saida.join('\n'), 'utf8');

console.log('novo bloco: ' + novoBloco.length + ' linhas');
console.log('total agora: ' + saida.length + ' linhas');