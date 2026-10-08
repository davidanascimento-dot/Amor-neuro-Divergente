/* =========================================================================
   artigo.js — o que faltava nos posts de leitura.

   Os dois posts do blog referenciavam este arquivo e ele nao existia.
   Com a ausencia dele, tres botoes de compartilhamento ficavam visiveis
   e sem nenhuma acao: "Compartilhar no WhatsApp", "Compartilhar no X"
   e "Copiar link" — todos apontando para "#".

   Este arquivo so resolve compartilhamento. O sistema de progresso de
   leitura NAO e tratado aqui: a barra #readingProgress existe no markup
   mas sua movimentacao ficou fora de escopo de proposito.
   ========================================================================= */

(function () {
    'use strict';

    function tituloDoPost() {
        var h1 = document.querySelector('.article-hero__title, h1');
        if (!h1) return document.title;
        // o h1 tem duas linhas separadas por <br>; o texto bruto serve
        return (h1.textContent || '').replace(/\s+/g, ' ').trim();
    }

    function urlDoPost() {
        // sem parametros de campanha e sem a ancora do navegador
        var u = new URL(window.location.href);
        u.hash = '';
        return u.toString();
    }

    /* ---------------------------------------------------------------------
       Aviso curto apos uma acao. Nao e alert(): interrompe quem usa
       leitor de tela e some antes de ser lido.
       --------------------------------------------------------------------- */
    var aviso = null;
    var timerAviso = null;

    function mostrarAviso(texto) {
        if (!aviso) {
            aviso = document.createElement('div');
            aviso.setAttribute('role', 'status');
            aviso.setAttribute('aria-live', 'polite');
            aviso.style.cssText = [
                'position:fixed', 'left:50%', 'bottom:24px', 'z-index:99999',
                'transform:translateX(-50%) translateY(8px)',
                'padding:11px 20px', 'border-radius:9999px',
                'background:#1a1a2e', 'color:#fff',
                'font:600 0.875rem/1.3 var(--font-main, system-ui, sans-serif)',
                'box-shadow:0 8px 28px rgba(0,0,0,.28)',
                'opacity:0', 'pointer-events:none',
                'transition:opacity .18s ease, transform .18s ease',
                'max-width:min(90vw,420px)', 'text-align:center'
            ].join(';');
            document.body.appendChild(aviso);
        }
        aviso.textContent = texto;
        // forca reflow para a transicao rodar a cada vez
        void aviso.offsetWidth;
        aviso.style.opacity = '1';
        aviso.style.transform = 'translateX(-50%) translateY(0)';

        clearTimeout(timerAviso);
        timerAviso = setTimeout(function () {
            aviso.style.opacity = '0';
            aviso.style.transform = 'translateX(-50%) translateY(8px)';
        }, 2600);
    }

    function respectsMovimentoReduzido() {
        return window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /* ---------------------------------------------------------------------
       Compartilhar no WhatsApp e no X: abrem em aba nova. Os botoes sao
       <a>, entao o href e preenchido no carregamento — quem usa teclado
       ou leitor de tela tem o destino announcement sem depender de JS.
       --------------------------------------------------------------------- */
    function montarCompartilhamento() {
        var botoes = document.querySelectorAll('.article-share__btn');
        if (!botoes.length) return;

        var url = encodeURIComponent(urlDoPost());
        var texto = encodeURIComponent(tituloDoPost());

        botoes.forEach(function (botao) {
            var rotulo = (botao.getAttribute('aria-label') || '').toLowerCase();

            if (rotulo.indexOf('whatsapp') !== -1) {
                botao.href = 'https://wa.me/?text=' + texto + '%20' + url;
                botao.target = '_blank';
                botao.rel = 'noopener noreferrer';
                return;
            }

            if (rotulo.indexOf(' x') !== -1 || rotulo === 'compartilhar no x') {
                botao.href = 'https://twitter.com/intent/tweet?text=' +
                    texto + '&url=' + url;
                botao.target = '_blank';
                botao.rel = 'noopener noreferrer';
                return;
            }

            if (rotulo.indexOf('copiar') !== -1) {
                // nao vira link de rede social: vira um botao de verdade
                botao.removeAttribute('href');
                botao.setAttribute('role', 'button');
                botao.setAttribute('tabindex', '0');
                botao.style.cursor = 'pointer';
                botao.addEventListener('click', function () {
                    copiarLink(urlDoPost());
                });
                botao.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        copiarLink(urlDoPost());
                    }
                });
            }
        });
    }

    function copiarLink(url) {
        function sucesso() {
            mostrarAviso('Link copiado.');
        }
        function falha() {
            mostrarAviso('Não deu para copiar. O link é: ' + url);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(sucesso, function () {
                caminhoAntigo(url, sucesso, falha);
            });
        } else {
            caminhoAntigo(url, sucesso, falha);
        }
    }

    // navegadores antigos / contexto sem secure context
    function caminhoAntigo(url, sucesso, falha) {
        var area = document.createElement('textarea');
        area.value = url;
        area.setAttribute('readonly', '');
        area.style.cssText = 'position:fixed;top:-1000px;opacity:0';
        document.body.appendChild(area);
        area.select();
        var ok = false;
        try {
            ok = document.execCommand('copy');
        } catch (e) {
            ok = false;
        }
        document.body.removeChild(area);
        (ok ? sucesso : falha)();
    }

    /* --------------------------------------------------------------------- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', montarCompartilhamento);
    } else {
        montarCompartilhamento();
    }

    // o bloco do aviso respeita movimento reduzido
    if (respectsMovimentoReduzido() && document.documentElement) {
        document.documentElement.style.setProperty('--and-motion-ok', '0');
    }
})();