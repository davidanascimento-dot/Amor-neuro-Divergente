const fs = require('fs');
const path = require('path');

const paginas = [
  'comunidade.html',
  'explorar-grupos.html',
  'meus-grupos.html',
  'grupo.html',
  'conversas.html',
  'chat.html',
  'detalhes-canal.html',
  'perfil.html',
  'post.html',
  'perfil-amigo.html'
];

for (const p of paginas) {
  const f = path.join(__dirname, '..', 'comunidade', p);
  if (!fs.existsSync(f)) {
    console.log(p + ' NÃO EXISTE');
    continue;
  }
  const c = fs.readFileSync(f, 'utf8');
  const body = c.match(/<body[^>]*>/);
  const main = c.match(/<main[^>]*>/);
  const header = c.match(/<header[^>]*>/);
  const nav = c.match(/<nav[^>]*>/);
  const tokens = c.includes('comunidade-tokens.css');
  const navCss = c.includes('comunidade-nav.css');
  const imgJs = c.includes('imagens.js');
  const navJs = c.includes('comunidade-nav.js');
  console.log(`=== ${p} ===`);
  console.log(`body: ${body ? body[0] : 'NÃO'}`);
  console.log(`main: ${main ? main[0] : 'NÃO'}`);
  console.log(`tokens: ${tokens}, navCss: ${navCss}, imgJs: ${imgJs}, navJs: ${navJs}`);
}
