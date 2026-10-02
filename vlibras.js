/* ==========================================================================
   VLIBRAS.JS — tradutor para Libras

   Mesmo motivo do userway.js: o bloco do VLibras estava copiado em 10
   paginas, sempre igual (script + div do widget + instancia). Agora e um
   arquivo so. Cada pagina usa:

       <script src="/vlibras.js"></script>

   Importante para quem cuida do site: o VLibras e um servico do governo
   federal. Se ele sair do ar, este script nao carrega e o texto da pagina
   continua normal — Libras e complemento, nunca o unico caminho de
   informacao.
   ========================================================================== */

(function () {
    'use strict';

    if (document.getElementById('vlibrasPluginScript')) return;

    var APP = 'https://vlibras.gov.br/app';

    function montar() {
        // A div do widget e obrigatoria: e onde o VLibras se apoia.
        // Sem ela o script carrega e nao aparece nada.
        if (!document.querySelector('div[vw]')) {
            var div = document.createElement('div');
            div.className = 'enabled';
            div.setAttribute('vw', '');
            div.innerHTML =
                '<div vw-access-button class="active"></div>' +
                '<div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
            document.body.appendChild(div);
        }

        var script = document.createElement('script');
        script.id = 'vlibrasPluginScript';
        script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
        script.async = true;
        document.body.appendChild(script);

        // O plugin so pode ser instanciado depois que ele carregou.
        // Sem o listener, instanciar cedo demais falha em silencio.
        script.addEventListener('load', function () {
            if (!window.VLibras) return;
            try {
                new window.VLibras.Widget(APP);
            } catch (erro) {
                console.warn('VLibras nao pôde ser iniciado:', erro);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', montar);
    } else {
        montar();
    }
})();
