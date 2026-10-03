/* ==========================================================================
   IMAGENS.JS — um lugar só para trocar as imagens do site

   Antes, cada imagem estava escrita direto no HTML. Trocar a arte da Lia
   significava caçar a tag <img> em 8 arquivos e rezar para não errar o
   caminho. Aqui você muda uma linha e o site inteiro acompanha.

   COMO TROCAR A ARTE DA LIA
   --------------------------------------------------------------------
   Opção 1 (mais fácil): jogue o arquivo em /img/lia/ com o nome que está
                         escrito aqui. Nada mais a fazer.
   Opção 2:             edite o caminho abaixo. Serve para usar outro nome,
                         outra pasta, ou uma imagem hospedada fora.

   SLOT                 PARA ONDE VAI
   --------------------------------------------------------------------
   lia-retrato          Banner da AcolherIA na página inicial
   lia-banner           Faixa larga da home (bloco "converse com a Lia")
   lia-avatar           Cabeçalho e balão do chat da AcolherIA
   lia-boas-vindas      Tela de abertura do chat: personagem grande,
                        traco violeta sobre fundo transparente

   Os prefixos "banner-area-*" são as faixas largas da LANDING PAGE
   (uma por área: Explorar, Comunidade, Direitos, AcolherIA). Também
   entram por data-img-fundo, porque são fundo de bloco com texto por
   cima, não <img>.

   Se a imagem não carregar, cai num desenho de espera com o nome "Lia".
   Ou seja: dá para deixar o caminho apontando para o arquivo que você
   ainda vai criar, sem quebrar a página.
   ========================================================================== */

(function () {
    'use strict';

    window.IMAGENS = {
        // ---- Lia / AcolherIA -------------------------------------------
        // Fundo do card da AcolherIA na home: a arte horizontal.
        'acolheria-card-bg': '/img/lia/banner-lia.png',
        // Avatar circular do chat (cabeçalho e balões da assistente).
        'lia-avatar': '/img/lia/avatar-lia.png',
        // Abertura do mini chat: personagem em tamanho grande,
        // em traco violeta, sobre o fundo claro.
        'lia-boas-vindas': '/img/lia/lia-boas-vindas.png',
        // A Lia da introducao na PAGINA DE CONVERSA (/chat-Ia). O fundo
        // dela e escuro, entao usa a versao clara do traco: a violeta
        // sumiria no escuro.
        'lia-intro': '/img/lia/banner-lia.png',
        // AVATAR CIRCULAR da Lia. Substitui o icone de robo no cabecalho
        // do mini chat, nas mensagens e no botao do hub. 256px porque
        // o maior uso e o botao do hub, com 60px.
        'lia-avatar-novo': '/img/lia/lia-avatar-256.png',
        // Versao cheia do mesmo avatar, para quando-precision de mais.
        'lia-avatar-cheio': '/img/lia/lia-avatar-circular.png',
        // CORPO INTEIRO da Lia, para a tela de abertura. Nao e recortada:
        // da do topo do coque ao chao dos tenes.
        'lia-corpo': '/img/lia/lia-corpo.png',

        // ---- NeuroComunidade -------------------------------------------
        // Sem arte própria por enquanto: o banner da comunidade saiu da
        // home e o bloco definitivo (comunidade + AcolherIA no mesmo
        // banner) ainda vai ser montado. Quando ele entrar, o caminho da
        // arte entra aqui e a <section> usa data-img-fundo, como a da
        // AcolherIA — texto por cima da arte, sem foto ao lado.

        // ---- Landing page: uma faixa por área --------------------------
        // A arte entra como FUNDO do bloco (data-img-fundo), com o texto
        // por cima. Caminho com espaço e vírgula fica com %20: é o que
        // funciona ao mesmo tempo em `src` e em `url()` do CSS.
        'banner-area-explorar': '/img/recursos-hero-DaGrMSNl.jpg',
        'banner-area-comunidade': '/img/banner-comunidade.png',
        'banner-area-direitos': '/img/Documento%20com%20selo%20oficial%20e%20uma%20caneta%2C%20representando%20direitos%20legais.png',
        'banner-area-acolheria': '/img/lia/banner-lia.png'
    };

    var RESERVA = '/img/lia/placeholder-lia.svg';

    /* ------------------------------------------------------------------
       FUNDOS VIA data-img-fundo

       Banner de fundo não cabe em <img src>: é o plano de fundo do bloco
       inteiro, com o texto por cima. E CSS não lê arquivo de
       configuração, então quem aplica é o JS.

       O gradiente escuro fica no CSS, por baixo. A imagem entra por cima
       dele, e é ele que segura a legibilidade do texto branco.
       ------------------------------------------------------------------ */
    function aplicarFundos() {
        var mapa = window.IMAGENS || {};
        var nos = document.querySelectorAll('[data-img-fundo]');

        for (var i = 0; i < nos.length; i++) {
            var no = nos[i];
            var caminho = mapa[no.getAttribute('data-img-fundo')];
            if (!caminho) continue;

            no.style.setProperty('--img-fundo', 'url("' + caminho + '")');
            no.setAttribute('data-img-fundo-aplicado', caminho);
        }
    }

    /* ------------------------------------------------------------------
       Aplica os caminhos.

       O HTML continua com um src real de reserva em cada <img>. Este
       script sobrescreve. Se a imagem configurada não carregar, volta
       para o que estava no HTML — nunca fica o ícone de imagem quebrada.
       ------------------------------------------------------------------ */
    function aplicar() {
        var mapa = window.IMAGENS || {};
        var nos = document.querySelectorAll('[data-img-slot]');

        for (var i = 0; i < nos.length; i++) {
            var no = nos[i];
            var slot = no.getAttribute('data-img-slot');
            var caminho = mapa[slot];

            if (!caminho) continue;
            if (no.getAttribute('data-img-aplicado') === caminho) continue;
            if (!no.getAttribute('src')) no.setAttribute('data-img-html', '');

            // Guarda o que o HTML tinha, para o fallback.
            if (!no.getAttribute('data-img-html')) {
                no.setAttribute('data-img-html', no.getAttribute('src') || '');
            }

            no.setAttribute('src', caminho);
            no.setAttribute('data-img-aplicado', caminho);
            no.addEventListener('error', function () {
                var original = this.getAttribute('data-img-html');
                if (this.getAttribute('src') === original) return;   // ja esta no fallback
                this.setAttribute('src', original || RESERVA);
            });
        }

        aplicarFundos();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', aplicar);
    } else {
        aplicar();
    }

    // Conversas na comunidade entram depois. Se alguma imagem da Lia
    // aparecer ali, precisa ser aplicada quando o pedaço for inserido.
    window.aplicarImagens = aplicar;
})();
