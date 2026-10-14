// Liga comunidade-nav.css e comunidade-nav.js nas nove páginas da
// Comunidade.
//
// - o CSS entra logo depois da folha principal da área (comunidade.css
//   ou conversas.css), para ser a última folha da comunidade;
// - o JS entra depois de theme.js e antes do script da área.
//
// Idempotente: rodar de novo não duplica nada.
const fs = require('fs');
const path = require('path');

const raiz = process.argv[2];
const LINK_CSS = '<link rel="stylesheet" href="/comunidade/comunidade-nav.css">';
const SCRIPT_JS = '<script src="/comunidade/comunidade-nav.js"></script>';

const PAGINAS = [
  'chat.html', 'comunidade.html', 'conversas.html', 'detalhes-canal.html',
  'explorar-grupos.html', 'grupo.html', 'meus-grupos.html', 'perfil.html',
  'post.html'
];

// folha principal de cada pagina: a nav entra logo depois dela
const FOLHAS_ANTERIORES = [
  '<link rel="stylesheet" href="comunidade.css">',
  '<link rel="stylesheet" href="conversas.css">',
  '<link rel="stylesheet" href="perfil.css">',
  '<link rel="stylesheet" href="post.css">'
];

// o script da area: a nav entra antes dele
const SCRIPT_DA_AREA = [
  'comunidade.js', 'conversas.js', 'perfil.js', 'post.js'
];

for (const p of PAGINAS) {
  const f = path.join(raiz, 'comunidade', p);
  let c = fs.readFileSync(f, 'utf8');
  let mudou = false;

  if (!c.includes('comunidade-nav.css')) {
    const ancora = FOLHAS_ANTERIORES.find((a) => c.includes(a));
    if (!ancora) { console.log(p + ' - *** nenhuma folha principal encontrada ***'); continue; }
    c = c.replace(ancora, ancora + '\n    ' + LINK_CSS);
    mudou = true;
  }

  if (!c.includes('comunidade-nav.js')) {
    const alvo = SCRIPT_DA_AREA.find((a) =>
      c.includes('src="comunidade/' + a + '"') || c.includes('src="' + a + '"')
    );
    if (!alvo) { console.log(p + ' - *** nenhum script de area encontrado ***'); continue; }

    // Procura a LINHA inteira do script da área e insere antes dela.
    //
    // NÃO usar re.source aqui. A primeira versão deste arquivo montava a
    // inserção a partir do código-fonte da regex e tentava limpar os
    // parênteses; o que saiu foi lixo de regex no lugar do tag, e oito
    // páginas pararam de carregar o script da área.
    const linhas = c.split('\n');
    const i = linhas.findIndex((L) => L.indexOf('src="' + alvo + '"') > -1);
    if (i === -1) { console.log(p + ' - *** linha do script nao encontrada ***'); continue; }

    const recuo = (linhas[i].match(/^\s*/) || [''])[0];
    linhas.splice(i, 0, recuo + SCRIPT_JS);
    c = linhas.join('\n');
    mudou = true;
  }

  if (mudou) { fs.writeFileSync(f, c, 'utf8'); console.log(p + ' - ok'); }
  else { console.log(p + ' - ja ligado'); }
}