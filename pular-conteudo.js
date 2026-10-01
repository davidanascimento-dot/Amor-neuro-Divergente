/* ==========================================================================
   PULAR-CONTENTO.JS — link "pular para o conteúdo"

   Sem isso, quem navega só com Tab precisa percorrer todo o menu
   lateral, todo o cabeçalho e todos os ícones antes de chegar ao texto.
   Em cada página são dezenas de paradas. Para quem tem TDAH ou perda de
   visão, isso é cansaço puro antes de começar.

   O link nasce escondido e só aparece quando recebe o foco — é assim
   que se faz: fica fora da tela até o Tab encostar nele.

   Cada pagina usa uma linha:
       <script src="/pular-conteudo.js"></script>

   O script descobre o destino sozinho. A maioria das páginas tem
   id="mainContent", mas login e index não têm; nesses casos ele usa o
   primeiro <main> e cria o id que faltar. Assim não depende de uma
   lista de ids que alguém precisa lembrar de atualizar.
   ========================================================================== */

(function () {
    'use strict';

    if (document.getElementById('pularConteudoLink')) return;

    function acharDestino() {
        var porId = document.getElementById('mainContent');
        if (porId) return porId;

        var main = document.querySelector('main');
        if (main && !main.id) main.id = 'mainContent';
        return main || null;
    }

    function criar() {
        var destino = acharDestino();
        if (!destino) return;

        // O link precisa existir antes de saber o destino, senão ficaria
        // com href vazio no primeiro Tab.
        var link = document.createElement('a');
        link.id = 'pularConteudoLink';
        link.className = 'pular-conteudo';
        link.href = '#' + destino.id;
        link.textContent = 'Pular para o conteúdo';

        // Move o foco de verdade. Só usar hash não funciona: a página não
        // rola nem o leitor de tela muda de contexto.
        link.addEventListener('click', function () {
            destino.setAttribute('tabindex', '-1');
            destino.focus();
            destino.scrollIntoView();
        });

        document.body.insertBefore(link, document.body.firstChild);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', criar);
    } else {
        criar();
    }
})();
