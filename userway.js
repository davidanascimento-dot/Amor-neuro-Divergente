/* ==========================================================================
   USERWAY.JS — carrega o widget de acessibilidade da UserWay

   Fica num arquivo só porque estava repetido como <script> inline em 13
   páginas, sempre idêntico. Cada página usa:

       <script src="/userway.js"></script>

   O widget e o mesmo que ja estava em uso (conta QQqIFghR0i), entao
   quem ja usava continua usando sem perder preferencia.

   Paraafastar o icone de um botao flutuante que fique embaixo:
       <script src="/userway.js" data-offset="70"></script>

   ATENCAO: a UserWay e um servico de terceiro. Se ela sair do ar ou o
   plano expirar, o script nao carrega e o site continua funcionando —
   por isso o botao de alto contraste / dislexia do painel admin
   continua existindo como alternativa propria.
   ========================================================================== */

(function () {
    'use strict';

    // Ja carregado nesta pagina? Nao carrega de novo.
    if (document.getElementById('userwayWidgetScript')) return;

    var ACCOUNT = 'QQqIFghR0i';
    var POSITION = '3';          // inferior direito
    var OFFSET_Y = 50;           // px que o icone sobe para nao cobrir o hub

    // Permite ajustar a altura sem editar este arquivo.
    var own = document.currentScript;
    if (own) {
        var custom = own.getAttribute('data-offset');
        if (custom) {
            var n = parseInt(custom, 10);
            if (!isNaN(n) && n >= 0) OFFSET_Y = n;
        }
    }

    var SELOR = '#userwayAccessibilityIcon, .userway_buttons_wrapper';

    function injetarWidget() {
        var script = document.createElement('script');
        script.id = 'userwayWidgetScript';
        script.src = 'https://cdn.userway.org/widget.js';
        script.async = true;
        script.setAttribute('data-account', ACCOUNT);
        script.setAttribute('data-position', POSITION);
        script.setAttribute('data-offset', '20, ' + OFFSET_Y);
        document.body.appendChild(script);
    }

    /* ------------------------------------------------------------------
       POSICAO

       O icone da UserWay nasce embaixo a direita, exatamente onde fica o
       botao flutuante de ajuda. Aqui ele e empurrado para cima.
       ------------------------------------------------------------------ */
    function positionar() {
        var alvos = document.querySelectorAll(SELOR);

        // A gaveta da Lia ocupa a direita inteira da tela. Com ela aberta,
        // o icone de acessibilidade ficaria embaixo da gaveta, e a pessoa
        // que precisa dele e nao consegue ve-lo e a pior combinacao
        // possivel. Entao ele sai da frente enquanto a conversa estiver
        // na tela.
        var recuo = 0;
        var overlay = document.getElementById('acolheriaOverlay');
        if (overlay && !overlay.hidden) {
            var gaveta = overlay.querySelector('.acolheria-modal');
            if (gaveta && gaveta.offsetWidth > 0) {
                // Na tela estreita a gaveta ocupa tudo; ai nao ha canto
                // livre, e ela sobe acima dela em vez de ir para o lado.
                recuo = (window.innerWidth - gaveta.offsetWidth) < 24
                    ? 0
                    : gaveta.offsetWidth;
            }
        }

        for (var i = 0; i < alvos.length; i++) {
            var el = alvos[i];
            el.style.setProperty('right', recuo + 'px', 'important');
            el.style.setProperty('bottom', OFFSET_Y + 'px', 'important');
            el.style.setProperty('top', 'auto', 'important');
            el.style.setProperty('left', 'auto', 'important');
        }
    }

    // O Acolher-IA.js chama isto ao abrir e ao fechar a conversa, porque
    // o MutationObserver de childList nao enxerga mudanca de atributo.
    window.reposicionarAcessibilidade = positionar;

    // O widget e injetado por codigo de terceiro e pode se reposicionar
    // sozinho. Acompanhar as mudancas e a unica forma de o icone nao
    // voltar para baixo do botao flutuante.
    function acompanhar() {
        new MutationObserver(positionar).observe(document.body, {
            childList: true,
            subtree: true
        });

        // Abrir e fechar a conversa da Lia mexe no atributo 'hidden' do
        // overlay, e isso nao gera childList. Sem esta observacao o icone
        // de acessibilidade ficaria preso embaixo da gaveta.
        var overlay = document.getElementById('acolheriaOverlay');
        if (overlay) {
            new MutationObserver(positionar).observe(overlay, {
                attributes: true,
                attributeFilter: ['hidden']
            });
        }
    }

    // Enquanto o widget nao aparecer, procura de tempos em tempos. Desiste
    // depois de ~20s para nao deixar timer rodando sem purpose.
    function esperarWidget() {
        var tentativas = 0;
        var timer = setInterval(function () {
            if (document.querySelector(SELOR)) {
                clearInterval(timer);
                acompanhar();
                positionar();
                return;
            }
            if (++tentativas > 40) clearInterval(timer);
        }, 300);
    }

    function iniciar() {
        injetarWidget();
        esperarWidget();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
