// Liga comunidade-tokens.css nas nove páginas da Comunidade e põe a
// classe community-app no <body>.
//
// community-tokens.css PRECISA vir antes de comunidade-nav.css: o
// arquivo da navegação usa var(--cm-*) e, sem os tokens, fica sem
// borda, sem fundo e sem cor.
//
// community-app entra DEPOIS da classe que a página já tem, para não
// trocar nenhuma regra existente: `.groups-page` continua valendo
// igual, só que agora tem mais uma classe junto.
//
// Idempotente: rodar de novo não duplica nada.
const fs = require('fs');
const path = require('path');

const raiz = process.argv[2];
const LINK_TOKENS = '<link rel="stylesheet" href="/comunidade/comunidade-tokens.css">';

const PAGINAS = [
  'chat.html', 'comunidade.html', 'conversas.html', 'detalhes-canal.html',
  'explorar-grupos.html', 'grupo.html', 'meus-grupos.html', 'perfil.html',
  'post.html'
];

// entra logo depois da folha principal da área
const FOLHAS_ANTERIORES = [
  '<link rel="stylesheet" href="comunidade.css">',
  '<link rel="stylesheet" href="conversas.css">',
  '<link rel="stylesheet" href="perfil.css">',
  '<link rel="stylesheet" href="post.css">'
];

for (const p of PAGINAS) {
  const f = path.join(raiz, 'comunidade', p);
  let c = fs.readFileSync(f, 'utf8');
  let mudou = false;
  let aviso = '';

  // --- tokens antes da nav ---
  if (!c.includes('comunidade-tokens.css')) {
    const ancora = FOLHAS_ANTERIORES.find((a) => c.includes(a));
    if (ancora) {
      c = c.replace(ancora, ancora + '\n    ' + LINK_TOKENS);
      mudou = true;
    } else {
      aviso = ' (sem folha principal!)';
    }
  }

  // --- community-app no body ---
  const m = c.match(/<body[^>]*>/);
  if (m && !m[0].includes('community-app')) {
    const tag = m[0];
    let novo;
    if (tag === '<body>') {
      novo = '<body class="community-app">';
    } else if (tag.includes('class="')) {
      novo = tag.replace('class="', 'class="community-app ');
    } else {
      novo = tag.replace('<body', '<body class="community-app"');
    }
    c = c.replace(tag, novo);
    mudou = true;
  }

  if (mudou) {
    fs.writeFileSync(f, c, 'utf8');
    console.log(p + ' - ok' + aviso);
  } else {
    console.log(p + ' - ja ligado');
  }
}