// Aplica a renomeação de classes da casca, do nome mais longo para o
// mais curto. Roda separado porque o HTML já foi normalizado e o
// normalizar-casca.js pula a etapa de CSS quando nada mudou no HTML.
const fs = require('fs');
const path = require('path');

const raiz = process.argv[2];

// A ordem importa: `.conversas-header` é prefixo de
// `.conversas-header-action`, `.conversas-header-profile` e
// `.conversas-header-spacer`. Trocando o curto primeiro, o resto nunca
// seria alcançado.
const RENOMEIA = [
    ['.conversas-header-spacer', '.header-spacer-removido'],
    ['.conversas-header-profile', '.header-profile-btn'],
    ['.conversas-header-action', '.header-theme-toggle'],
    ['.conversas-header', '.header-glass'],
    ['.conversas-brand', '.logo'],
    ['.conversas-back', '.btn-voltar-site']
];

const FOLHAS = [
    { nome: 'conversas.css', dir: 'comunidade' },
    { nome: 'comunidade-nav.css', dir: '' }
];

for (const folha of FOLHAS) {
    const caminho = path.join(raiz, folha.dir, folha.nome);
    if (!fs.existsSync(caminho)) {
        console.log(folha.nome + ' - NAO ENCONTRADO');
        continue;
    }

    let css = fs.readFileSync(caminho, 'utf8');
    const relatorio = [];

    for (const [de, para] of RENOMEIA) {
        const partes = css.split(de);
        const n = partes.length - 1;
        if (n) {
            css = partes.join(para);
            relatorio.push(de + ' -> ' + para + ' (' + n + ')');
        }
    }

    fs.writeFileSync(caminho, css, 'utf8');
    console.log(folha.nome + ': ' + (relatorio.length ? relatorio.join('  ') : 'nada a renomear'));
}