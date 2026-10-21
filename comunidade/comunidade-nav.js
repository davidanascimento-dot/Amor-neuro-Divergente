/* ==========================================================================
   COMUNIDADE-NAV.JS — a casca compartilhada do cabeçalho e da subnav

   O QUE ELE FAZ

     1. Insere a etiqueta "Comunidade" no cabeçalho das páginas da área.
        É uma etiqueta nova, e as nove páginas já têm o cabeçalho
        escrito — não vale reescrever nove cabeçalhos para caber uma
        linha.

     2. Decide para onde o "voltar" leva.

     3. Garante que exista exatamente uma aba ativa na subnav.

     4. Mede a altura real do cabeçalho e publica em --cm-header-h.

   A subnav NÃO é criada aqui. Ela já está no HTML das nove páginas —
   criar por JS seria uma segunda navegação, que é o que a proposta
   proíbe.

   ========================================================================== */

(function () {
    'use strict';

    /* ------------------------------------------------------------------
       PARA ONDE VOLTAR

       - tela de topo    -> o site principal (/inicio.html)
       - tela de detalhe -> a lista da área dela

       grupo.html volta para a lista de grupos; post.html volta para o
       fórum; perfil.html volta para o fórum, porque o perfil é detalhe
       de quem está dentro da comunidade.

       O HTML já traz o href certo em cada página. Esta tabela é a rede
       de segurança: se uma página nova entrar sem o atributo, o
       destino ainda sai certo em vez de ficar apontando para o
       lugar errado.
       ------------------------------------------------------------------ */
    var VOLTA = {
        'comunidade.html':      { tipo: 'topo' },
        'artigos.html':         { tipo: 'detalhe', href: '/comunidade/artigos.html' },
        'artigo.html':          { tipo: 'detalhe', href: '/comunidade/artigos.html' },
        'escrever-artigo.html': { tipo: 'detalhe', href: '/comunidade/artigos.html' },
        'explorar-grupos.html': { tipo: 'topo' },
        'conversas.html':       { tipo: 'topo' },
        'meus-grupos.html':     { tipo: 'detalhe', href: '/comunidade/explorar-grupos.html' },
        'grupo.html':           { tipo: 'detalhe', href: '/comunidade/explorar-grupos.html' },
        'detalhes-canal.html':  { tipo: 'detalhe', href: '/comunidade/conversas.html' },
        'chat.html':            { tipo: 'detalhe', href: '/comunidade/conversas.html' },
        'perfil.html':          { tipo: 'detalhe', href: '/comunidade/comunidade.html' },
        'post.html':            { tipo: 'detalhe', href: '/comunidade/comunidade.html' }
    };

    function paginaAtual() {
        var caminho = window.location.pathname.split('/').pop();
        return caminho || 'comunidade.html';
    }

    function destinoDoVoltar() {
        var body = document.body;

        // A página declara o próprio destino e ganha prioridade sobre a
        // tabela.
        var declarado = body && body.getAttribute('data-cm-back');
        if (declarado) return declarado;

        var regra = VOLTA[paginaAtual()];
        if (!regra) return '/inicio.html';
        return regra.tipo === 'topo' ? '/inicio.html' : (regra.href || '/inicio.html');
    }

    /* ------------------------------------------------------------------
       A ETIQUETA "COMUNIDADE"

       Entra logo depois da marca. Se a página já tiver uma (nenhuma tem
       hoje), não duplica.
       ------------------------------------------------------------------ */
    function inserirIdentidade() {
        var header = document.querySelector('.header-glass');
        if (!header) return null;
        if (header.querySelector('.community-identity')) {
            return header.querySelector('.community-identity');
        }

        var marca = header.querySelector('.logo');
        if (!marca) return null;

        var tag = document.createElement('span');
        tag.className = 'community-identity';
        tag.innerHTML = '<i class="fa-solid fa-people-group" aria-hidden="true"></i><span>Comunidade</span>';
        marca.insertAdjacentElement('afterend', tag);
        return tag;
    }

    /* ------------------------------------------------------------------
       O VOLTAR

       Confere o destino e o rótulo. O texto também existe no HTML, mas
       a tabela acima é a fonte de verdade quando os dois divergem.
       ------------------------------------------------------------------ */
    function ajustarVoltar() {
        var destino = destinoDoVoltar();
        var saida = destino === '/inicio.html';
        var rotulo = saida ? 'Voltar ao site' : 'Voltar';
        var titulo = saida
            ? 'Voltar ao site principal'
            : 'Voltar para ' + rotulo.toLowerCase();

        document.querySelectorAll('.btn-voltar-site').forEach(function (botao) {
            botao.setAttribute('href', destino);
            botao.setAttribute('aria-label', titulo);
            botao.setAttribute('title', titulo);

            var texto = botao.querySelector('span');
            if (texto) texto.textContent = rotulo;
        });
    }

    /* ------------------------------------------------------------------
       A ABA ATIVA

       Garante que exista exatamente uma marca. Duas marcas juntas é o
       que acontece quando a página traz `.active` numa aba e
       `aria-current` noutra.
       ------------------------------------------------------------------ */
    function marcarAbaAtiva() {
        var nav = document.getElementById('communitySubnav') || document.querySelector('.community-subnav');
        if (!nav) return;

        var abas = nav.querySelectorAll('.subnav-tab');
        if (!abas.length) return;

        var ativas = Array.prototype.filter.call(abas, function (a) {
            return a.classList.contains('active') || a.getAttribute('aria-current') === 'page';
        });

        // Sem marca nenhuma: a página não é uma das quatro áreas. Não se
        // marca aba nenhuma de propósito — forçar uma seria mentir sobre
        // onde a pessoa está.
        if (!ativas.length) return;

        abas.forEach(function (aba) {
            aba.classList.remove('active');
            aba.removeAttribute('aria-current');
        });

        ativas[0].classList.add('active');
        ativas[0].setAttribute('aria-current', 'page');
        if (ativas[0].tagName === 'BUTTON') {
            ativas[0].setAttribute('aria-selected', 'true');
        }
    }

    /* ------------------------------------------------------------------
       A ALTURA REAL DO CABEÇALHO

       A subnav é sticky e precisa saber onde o cabeçalho termina.
       Antes isso vinha de um `--header-height: 64px` chutado no
       comunidade.css, que só batia por acaso — e no celular o
       cabeçalho encolhe para 58px ou 52px, então a subnav ficava
       desalinhada.
       ------------------------------------------------------------------ */
    function medirCabecalho() {
        var header = document.querySelector('.header-glass');
        if (!header) return;

        var altura = Math.round(header.getBoundingClientRect().height);
        if (!altura) return;

        document.documentElement.style.setProperty('--cm-header-h', altura + 'px');

        var subnav = document.querySelector('.community-subnav');
        var alturaSubnav = subnav ? Math.round(subnav.getBoundingClientRect().height) : 0;
        document.documentElement.style.setProperty('--cm-subnav-h', alturaSubnav + 'px');
    }

    function iniciar() {
        inserirIdentidade();
        ajustarVoltar();
        marcarAbaAtiva();
        medirCabecalho();
    }

    window.comunidadeNav = {
        iniciar: iniciar,
        destinoDoVoltar: destinoDoVoltar
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }

    window.addEventListener('load', iniciar);

    // A altura do cabeçalho muda com a fonte ampliada e com a quebra de
    // linha. Re-medir é barato e evita a subnav desalinhada.
    if (window.ResizeObserver) {
        var observador = new ResizeObserver(medirCabecalho);
        document.addEventListener('DOMContentLoaded', function () {
            var header = document.querySelector('.header-glass');
            if (header) observador.observe(header);
        });
    } else {
        window.addEventListener('resize', medirCabecalho);
    }
})();