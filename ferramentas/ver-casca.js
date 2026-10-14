// Mostra o markup atual do header e da subnav de uma pagina, para
// conferir o que sera substituido.
const fs = require('fs');

for (const f of ['comunidade/explorar-grupos.html', 'comunidade/conversas.html']) {
  const c = fs.readFileSync(f, 'utf8');
  const h = c.match(/<header class="conversas-header">[\s\S]*?<\/header>/);
  const n = c.match(/<nav class="community-subnav"[\s\S]*?<\/nav>/);

  console.log('===== ' + f);
  console.log('--- header ---');
  console.log(h ? h[0] : '(nao tem)');
  console.log('--- subnav ---');
  console.log(n ? n[0] : '(nao tem)');
  console.log('');
}