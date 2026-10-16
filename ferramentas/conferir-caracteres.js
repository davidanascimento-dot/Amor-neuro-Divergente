// Confere se um .md tem caractere fora do esperado (CJK, cirilico,
// etc). Escrevi "Já传说" num documento e o arquivo passou sem aviso.
const fs = require('fs');

const arquivo = process.argv[2];
const texto = fs.readFileSync(arquivo, 'utf8');

const linhas = texto.split('\n');
let achados = 0;

linhas.forEach((L, i) => {
    const chars = [...L];
    for (const c of chars) {
        const cp = c.codePointAt(0);
        const ehLatim = (
            (cp >= 0x41 && cp <= 0x5a) ||   // A-Z
            (cp >= 0x61 && cp <= 0x7a) ||   // a-z
            (cp >= 0xc0 && cp <= 0x24f) ||  // latin acentuado
            cp === 0x20 ||                   // espaco
            (cp >= 0x30 && cp <= 0x39)      // 0-9
        );
        const ehSimboloComum = '.,;:!?—–-_/\\()[]{}*#><=+|~`"\'…%$@&°§ºª…'.includes(c);

        if (!ehLatim && !ehSimboloComum) {
            console.log('  linha ' + (i + 1) + ': ' + c + '  (U+' + cp.toString(16).toUpperCase() + ')  ' + L.trim().slice(0, 70));
            achados++;
            break;
        }
    }
});

console.log(achados ? '\n*** ' + achados + ' caractere(s) suspeito(s) ***' : '\nlimpo: nada fora do latim');