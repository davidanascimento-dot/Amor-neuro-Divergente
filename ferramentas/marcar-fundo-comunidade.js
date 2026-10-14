// Põe data-img-fundo="fundo-comunidade" no <body> das nove páginas.
//
// O atributo é o que o /imagens.js lê para aplicar a arte: ele escreve
// a variável --img-fundo no elemento, e o CSS consome. Nada de <img>,
// porque aqui a imagem é plano de fundo da página inteira.
//
// community-app continua na mesma tag; nenhuma classe existente é
// trocada, só acrescentada.
//
// Idempotente.
const fs = require('fs');
const path = require('path');

const raiz = process.argv[2];

const PAGINAS = [
  'chat.html', 'comunidade.html', 'conversas.html', 'detalhes-canal.html',
  'explorar-grupos.html', 'grupo.html', 'meus-grupos.html', 'perfil.html',
  'post.html'
];

for (const p of PAGINAS) {
    const f = path.join(raiz, 'comunidade', p);
    const linhas = fs.readFileSync(f, 'utf8').split('\n');

    const i = linhas.findIndex((L) => /^\s*<body[^>]*>/.test(L));
    if (i === -1) { console.log(p + ' - *** sem <body> ***'); continue; }

    if (linhas[i].indexOf('data-img-fundo') > -1) {
        console.log(p + ' - ja tem data-img-fundo');
        continue;
    }

    // Insere o atributo antes do '>' de fechamento.
    // O `\s*$` no fim é necessário porque o arquivo está em CRLF: sem
    // ele, a linha termina em \r e o `>$` nunca casa — o script rodava
    // sem erro e sem mudar nada.
    linhas[i] = linhas[i].replace(/>\s*$/, ' data-img-fundo="fundo-comunidade">');

    fs.writeFileSync(f, linhas.join('\n'), 'utf8');
    console.log(p + ' - ok  ' + linhas[i].trim());
}