/**
 * Teste da detecção de crise da AcolherIA.
 * Rodar: node Acolher-IA/testes-seguranca.js
 *
 * O que importa não é distinguir "alto" de "moderado" (ambos abrem o painel),
 * e sim garantir que o painel ABRE em risco real e NÃO abre em conversa normal.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Carrega o módulo com o mínimo de DOM necessário.
const codigo = fs.readFileSync(path.join(__dirname, 'seguranca.js'), 'utf8');
const sandbox = {
    window: { matchMedia: () => ({ matches: false }) },
    document: {
        getElementById: () => null,
        createElement: () => ({ style: {}, setAttribute() {} }),
        body: { appendChild() {} },
        addEventListener() {}
    },
    navigator: {},
    console,
    setInterval: () => 0,
    clearInterval: () => {}
};
sandbox.window.document = sandbox.document;
vm.createContext(sandbox);
vm.runInContext(codigo, sandbox);
const avaliar = sandbox.window.AcolheriaSeguranca.avaliarRisco;

const CASOS = [
    // [mensagem, 'abre' | 'nao-abre']
    // --- deve ABRIR: sinal explícito ---
    ['quero me matar', 'abre'],
    ['eu me mato hoje', 'abre'],
    ['pensei em me matar ontem', 'abre'],
    ['vou me matar logo', 'abre'],
    ['eu me mataria se pudesse', 'abre'],
    ['se matarem e eu nao ver, tudo bem', 'abre'],
    ['quero morrer', 'abre'],
    ['não quero mais viver', 'abre'],
    ['nunca quis tanto me matar', 'abre'],
    ['tirar a minha vida', 'abre'],
    ['acabar com tudo', 'abre'],
    ['pensei em me automutilar e me cortar', 'abre'],
    ['me automutilo quando fico ansioso', 'abre'],
    ['eu me machuco pra sentir alguma coisa', 'abre'],
    ['quero sumir para sempre', 'abre'],
    ['quero desaparecer para sempre', 'abre'],
    ['acabei de me cortar de novo', 'abre'],
    ['estou morrendo por dentro', 'abre'],
    ['cansada de viver isso aqui', 'abre'],
    ['sem motivo para viver', 'abre'],
    ['eu me rasgo quando quero parar', 'abre'],
    ['me queimo pra sentir dor', 'abre'],

    // --- deve ABRIR: indiretos combinados ---
    ['todo mundo estaria melhor sem mim, não aguento mais', 'abre'],
    ['ninguém ia notar, não tenho força pra mais nada', 'abre'],
    ['cansei de viver, não aguento mais isso', 'abre'],
    ['ninguém ia sentir falta se eu sumisse', 'abre'],

    // --- deve ABRIR: um indireto + sofrimento ---
    ['estou sozinho e não aguento mais', 'abre'],
    ['não aguento mais, tô chorando o dia todo', 'abre'],
    ['quero sumir, tô numa fase muito sofrida', 'abre'],
    ['sem esperança, tô muito triste', 'abre'],
    ['nada importa mais, me sinto vazio', 'abre'],

    // --- NAO deve abrir: contexto inocuo ---
    ['matar o processo travou de novo', 'nao-abre'],
    ['preciso matar um bug no meu código', 'nao-abre'],
    ['tô morrendo de saudade de você', 'nao-abre'],
    ['morreu de susto ontem', 'nao-abre'],
    ['quero morrer de rir com esse grupo', 'nao-abre'],
    ['o chefe me matou de cansaço hoje', 'nao-abre'],
    ['quero sumir do trabalho', 'nao-abre'],
    ['me cortei o dedo cozinhando', 'nao-abre'],
    ['vou cortar o cabelo amanhã', 'nao-abre'],
    ['matar aula de matemática é meu sonho', 'nao-abre'],
    ['estou morto de cansaço com essa prova', 'nao-abre'],
    ['me feri queimando a pizza', 'nao-abre'],
    ['me machuquei batendo o dedo na mesa', 'nao-abre'],
    ['ninguém supera meu gamer tag', 'nao-abre'],

    // --- NAO deve abrir: conversa normal do site ---
    ['o que é TDAH?', 'nao-abre'],
    ['quais são meus direitos no trabalho?', 'nao-abre'],
    ['tenho dificuldade de organização, me ajuda', 'nao-abre'],
    ['como lidar com crise sensorial?', 'nao-abre'],
    ['estou triste com a prova que tirei', 'nao-abre'],
    ['me sinto exausta, quero descansar', 'nao-abre'],
    ['achei um texto sobre neurodiversidade', 'nao-abre'],
    ['quero conhecer outras pessoas com TDAH', 'nao-abre'],
    ['como funciona a terapia ocupacional?', 'nao-abre'],
    ['', 'nao-abre'],
    ['oi', 'nao-abre']
];

const ABRE = new Set(['alto', 'moderado']);
const falhas = [];
const abertos = [];

for (const [mensagem, esperado] of CASOS) {
    const nivel = avaliar(mensagem).nivel;
    const abriu = ABRE.has(nivel);
    const ok = esperado === 'abre' ? abriu : !abriu;
    if (ok) {
        if (abriu) abertos.push(`${nivel}`);
    } else {
        falhas.push(`  "${mensagem}"\n     esperado: ${esperado} | obtido: ${nivel}`);
    }
}

const total = CASOS.length;
const pct = ((total - falhas.length) / total * 100).toFixed(1);
const contaAlto = abertos.filter(n => n === 'alto').length;
const contaModerado = abertos.length - contaAlto;

console.log(`\nAcolherIA - deteccao de crise`);
console.log('='.repeat(48));
console.log(`Casos testados : ${total}`);
console.log(`Falhas         : ${falhas.length}`);
console.log(`Acerto         : ${pct}%`);
console.log(`Disparos       : ${contaAlto} alto / ${contaModerado} moderado`);
if (falhas.length) {
    console.log('\nDivergencias:');
    console.log(falhas.join('\n'));
}
console.log('='.repeat(48));
process.exit(falhas.length ? 1 : 0);
