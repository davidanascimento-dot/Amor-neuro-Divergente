/* ==========================================================================
   NORMALIZAR-CASCA.JS — uma casca só em toda a Comunidade

   Copia o cabeçalho e a subnav de comunidade.html para as outras oito
   páginas da área, e passa a chamar as coisas pelo mesmo nome em todas.

   POR QUE MEXER NO CSS TAMBÉM

   A marcação nova usa os nomes de comunidade.css (`.header-glass`,
   `.logo`, `.btn-voltar-site`, `.header-profile-btn`,
   `.header-theme-toggle`). conversas.css estilizava as mesmas peças com
   outros nomes (`.conversas-header`, `.conversas-brand`, ...), e é ele
   que está carregado nessas páginas. Sem renomear, os controles
   ficariam sem estilo nenhum lá.

   A renomeação é feita do nome mais longo para o mais curto, senão
   `.conversas-header` comeria o começo de `.conversas-header-action`.

   AS DUAS DEPENDÊNCIAS DE ID

   conversas.js e post.js procuravam o link do perfil por
   `#headerProfileLink`, que só existia na casca do conversas.css. A
   casca nova usa `#headerProfileBtn`, como comunidade.html. Os dois
   arquivos passam a aceitar qualquer um dos dois.

   ========================================================================== */

const fs = require('fs');
const path = require('path');

const raiz = process.argv[2];

/* --------------------------------------------------------------------------
   O CABEÇALHO ÚNICO

   Igual byte a byte em todas as páginas. Só o destino do "voltar"
   muda, e esse campo fica no lugar certo em cada uma — com o JS
   mantendo a mesma regra como rede de segurança.
   -------------------------------------------------------------------------- */
function cabecalho(voltarHref, voltarRotulo, voltarTitulo) {
    return `<header class="header-glass" id="headerGlass">
        <a href="/inicio.html" class="logo">
            <img src="/img/logo-LHN9gCw1.png" alt="Amor NeuroDivergente" class="logo-img">
            <span class="logo-text">Amor NeuroDivergente</span>
        </a>

        <a href="${voltarHref}" class="btn-voltar-site" title="${voltarTitulo}" aria-label="${voltarTitulo}">
            <i class="fa-solid fa-arrow-left"></i>
            <span>${voltarRotulo}</span>
        </a>

        <a class="header-profile-btn" id="headerProfileBtn" href="/comunidade/perfil.html" aria-label="Abrir meu perfil">
            <img src="/img/foto-padrão.jpg" alt="Meu perfil" class="header-avatar" id="headerAvatar">
        </a>

        <button class="header-theme-toggle" type="button" data-a11y="darkMode" aria-pressed="false" aria-label="Ativar modo escuro" title="Ativar modo escuro">
            <i class="fa-regular fa-moon"></i>
        </button>
    </header>`;
}

/* --------------------------------------------------------------------------
   A SUBNAV ÚNICA

   Mesma estrutura nas nove páginas. O que muda é a TAG: em
   comunidade.html, Fórum e Eventos são abas da própria página, então
   são <button>. Nas outras, são <a>, porque a pessoa sai da página.

   `data-tab` é o mesmo nos dois casos: é ele que o
   comunidade-nav.js usa para marcar a aba certain.
   -------------------------------------------------------------------------- */
function subnav(ativa, dentroDoForum) {
    const tabForum = dentroDoForum
        ? `<button class="subnav-tab${ativa === 'forum' ? ' active' : ''}" type="button" data-tab="forum" role="tab" aria-selected="${ativa === 'forum'}">`
        : `<a class="subnav-tab${ativa === 'forum' ? ' active' : ''}" data-tab="forum" href="/comunidade/comunidade.html#screen-forum">`;
    const fechaForum = dentroDoForum ? '</button>' : '</a>';

    const tabEventos = dentroDoForum
        ? `<button class="subnav-tab${ativa === 'eventos' ? ' active' : ''}" type="button" data-tab="eventos" role="tab" aria-selected="${ativa === 'eventos'}">`
        : `<a class="subnav-tab${ativa === 'eventos' ? ' active' : ''}" data-tab="eventos" href="/comunidade/comunidade.html#screen-eventos">`;
    const fechaEventos = dentroDoForum ? '</button>' : '</a>';

    return `<nav class="community-subnav" id="communitySubnav" aria-label="Seções da comunidade">
        <div class="community-subnav-inner">
            ${tabForum}<i class="fa-regular fa-message"></i><span>Fórum</span>${fechaForum}

            <a class="subnav-tab${ativa === 'grupos' ? ' active' : ''}" data-tab="grupos" href="/comunidade/explorar-grupos.html"${ativa === 'grupos' ? ' aria-current="page"' : ''}>
                <i class="fa-solid fa-users"></i><span>Grupos</span>
            </a>

            ${tabEventos}<i class="fa-regular fa-calendar"></i><span>Eventos</span>${fechaEventos}

            <a class="subnav-tab${ativa === 'conversa' ? ' active' : ''}" data-tab="conversa" href="/comunidade/conversas.html"${ativa === 'conversa' ? ' aria-current="page"' : ''}>
                <i class="fa-regular fa-comment-dots"></i><span>Conversa</span>
                <span class="subnav-dot">●</span>
            </a>
        </div>
    </nav>`;
}

/* --------------------------------------------------------------------------
   AS PÁGINAS

   `dentroDoForum` marca a única página onde as abas não saem dela.
   -------------------------------------------------------------------------- */
const PAGINAS = [
    { arq: 'comunidade.html',      ativa: 'forum',    dentroDoForum: true,  voltar: ['/inicio.html', 'Voltar ao site', 'Voltar ao site principal'] },
    { arq: 'explorar-grupos.html', ativa: 'grupos',   dentroDoForum: false, voltar: ['/inicio.html', 'Voltar ao site', 'Voltar ao site principal'] },
    { arq: 'meus-grupos.html',     ativa: 'grupos',   dentroDoForum: false, voltar: ['/comunidade/explorar-grupos.html', 'Voltar', 'Voltar para a lista de grupos'] },
    { arq: 'grupo.html',           ativa: 'grupos',   dentroDoForum: false, voltar: ['/comunidade/explorar-grupos.html', 'Voltar', 'Voltar para a lista de grupos'] },
    { arq: 'conversas.html',       ativa: 'conversa', dentroDoForum: false, voltar: ['/inicio.html', 'Voltar ao site', 'Voltar ao site principal'] },
    { arq: 'chat.html',            ativa: 'conversa', dentroDoForum: false, voltar: ['/comunidade/conversas.html', 'Voltar', 'Voltar para a lista de conversas'] },
    { arq: 'detalhes-canal.html',  ativa: 'conversa', dentroDoForum: false, voltar: ['/comunidade/conversas.html', 'Voltar', 'Voltar para a lista de conversas'] },
    { arq: 'perfil.html',          ativa: 'forum',    dentroDoForum: false, voltar: ['/comunidade/comunidade.html', 'Voltar', 'Voltar para o fórum'] },
    { arq: 'post.html',            ativa: 'forum',    dentroDoForum: false, voltar: ['/comunidade/comunidade.html', 'Voltar', 'Voltar para o fórum'] }
];

let mudouAlguma = false;

for (const p of PAGINAS) {
    const f = path.join(raiz, 'comunidade', p.arq);
    let c = fs.readFileSync(f, 'utf8');
    const antes = c;

    const novoHeader = cabecalho(p.voltar[0], p.voltar[1], p.voltar[2]);
    const novaSubnav = subnav(p.ativa, p.dentroDoForum);

    // --- cabecalho: substitui o <header> existente ---
    const reHeader = /<header class="(?:conversas-header|header-glass)"[\s\S]*?<\/header>/;
    if (reHeader.test(c)) {
        c = c.replace(reHeader, novoHeader);
    } else {
        console.log(p.arq + ' - *** nenhum <header> encontrado ***');
        continue;
    }

    // --- subnav: substitui se existir, insere logo apos o cabecalho ---
    const reNav = /<nav class="community-subnav"[\s\S]*?<\/nav>/;
    if (reNav.test(c)) {
        c = c.replace(reNav, novaSubnav);
    } else {
        c = c.replace('</header>', '</header>\n\n    ' + novaSubnav);
    }

    if (c !== antes) {
        fs.writeFileSync(f, c, 'utf8');
        console.log(p.arq + ' - ok (aba ' + p.ativa + ')');
        mudouAlguma = true;
    } else {
        console.log(p.arq + ' - sem mudanca');
    }
}

/* --------------------------------------------------------------------------
   A RENOMEAÇÃO NO CSS

   Do nome mais longo para o mais curto.
   -------------------------------------------------------------------------- */
const RENOMEIA = [
    ['.conversas-header-spacer', '.header-spacer-removido'],
    ['.conversas-header-profile', '.header-profile-btn'],
    ['.conversas-header-action', '.header-theme-toggle'],
    ['.conversas-header', '.header-glass'],
    ['.conversas-brand', '.logo'],
    ['.conversas-back', '.btn-voltar-site']
];

if (mudouAlguma) {
    // conversas.css mora dentro de comunidade/; comunidade-nav.css mora
    // na raiz. Por isso o caminho vem do objeto, e não da concatenação.
    const FOLHAS = [
        { nome: 'conversas.css', dir: 'comunidade' },
        { nome: 'comunidade-nav.css', dir: '' }
    ];

    for (const folha of FOLHAS) {
        const caminho = path.join(raiz, folha.dir, folha.nome);
        if (!fs.existsSync(caminho)) {
            console.log(folha.nome + ' - *** nao encontrado em ' + caminho + ' ***');
            continue;
        }
        let css = fs.readFileSync(caminho, 'utf8');
        let n = 0;
        for (const [de, para] of RENOMEIA) {
            const partes = css.split(de);
            n += partes.length - 1;
            css = partes.join(para);
        }
        fs.writeFileSync(caminho, css, 'utf8');
        console.log(folha.nome + ' - ' + n + ' seletores renomeados');
    }
}