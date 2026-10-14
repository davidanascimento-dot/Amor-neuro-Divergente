/* ==========================================================================
   REPARAR-SCRIPTS.JS

   ligar-nav-comunidade.js estragou os <script> de oito páginas.

   O defeito foi meu: montei a inserção a partir de `re.source`, que é o
   CÓDIGO-FONTE da regex, e tentei limpar os parênteses com
   `.replace(/[()\\]/g, '')`. O que saiu não foi o tag original, foi lixo
   de regex:

       <script src="conversas.js"></script>          (o que devia estar)
   ->
       <script src="[^"]*conversas.js"></script>

   Como o src virou lixo, o script da área parou de carregar.

   A string quebrada CONTÉM aspas no meio (`[^"]*`), então uma regex
   com `[^"]*` não casa com ela. Por isso a reparação é feita por
   LINHA, não por padrão: a linha inteira é trocada.

   ========================================================================== */

const fs = require('fs');
const path = require('path');

const raiz = process.argv[2];

// caminho certo do script de cada pagina
const CORRETO = {
    'conversas.html':       'conversas.js',
    'chat.html':            'conversas.js',
    'explorar-grupos.html': 'conversas.js',
    'meus-grupos.html':     'conversas.js',
    'grupo.html':           'conversas.js',
    'detalhes-canal.html':  'conversas.js',
    'perfil.html':          'perfil.js',
    'post.html':            'post.js'
};

for (const [arq, destino] of Object.entries(CORRETO)) {
    const f = path.join(raiz, 'comunidade', arq);
    const linhas = fs.readFileSync(f, 'utf8').split('\n');

    const quebradas = linhas.filter((L) => L.indexOf('<script src="[') > -1);

    if (!quebradas.length) {
        console.log(arq + ' - ja estava certo');
        continue;
    }

    // troca a linha inteira pelo tag certo, preservando a indentacao
    let trocadas = 0;
    for (let i = 0; i < linhas.length; i++) {
        if (linhas[i].indexOf('<script src="[') > -1) {
            const recuo = (linhas[i].match(/^\s*/) || [''])[0];
            linhas[i] = recuo + '<script src="' + destino + '"></script>';
            trocadas++;
        }
    }

    fs.writeFileSync(f, linhas.join('\n'), 'utf8');
    console.log(arq + ' - ' + trocadas + ' tag(s) reparado(s) -> ' + destino);
}