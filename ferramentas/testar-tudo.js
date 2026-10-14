const http = require('http');

const paginas = [
  '/comunidade/comunidade.html',
  '/comunidade/explorar-grupos.html',
  '/comunidade/meus-grupos.html',
  '/comunidade/grupo.html',
  '/comunidade/conversas.html',
  '/comunidade/chat.html',
  '/comunidade/detalhes-canal.html',
  '/comunidade/perfil.html',
  '/comunidade/post.html',
  '/comunidade/perfil-amigo.html'
];

async function checkUrl(path) {
  return new Promise((resolve) => {
    http.get('http://localhost:5174' + path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasTokens = data.includes('comunidade-tokens.css');
        const hasNavCss = data.includes('comunidade-nav.css');
        const hasDataImg = data.includes('data-img-fundo="fundo-comunidade"');
        const hasCommunityApp = data.includes('community-app');
        resolve({
          path,
          status: res.statusCode,
          hasTokens,
          hasNavCss,
          hasDataImg,
          hasCommunityApp
        });
      });
    }).on('error', (err) => {
      resolve({ path, error: err.message });
    });
  });
}

async function run() {
  for (const p of paginas) {
    const res = await checkUrl(p);
    console.log(res);
  }
}
run();
