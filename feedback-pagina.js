/* ============================================================================
   FEEDBACK-PAGINA.JS - "Esta pagina ajudou voce?", em modal lateral
   ============================================================================
   Um modulo. O mesmo arquivo serve todas as paginas: ele cria o botao discreto,
   o fundo escurecido e a gaveta que entra pela direita.

   O fluxo, na ordem:
     1. a gaveta abre e pergunta "Esta pagina ajudou voce?"
     2. SIM  -> abre a caixa "O que faltou, ou o que poderia ficar mais claro?"
     3. NAO  -> fecha a gaveta, sem abrir a caixa

   Duas regras que o modulo carrega dentro:

   1. UM ENVIO POR PAGINA POR SESSAO. Depois de responder, o botao some na
      sessao. Repetir vira ruido, e quem percebe que esta sendo vigiado desiste.

   2. NUNCA CONFIRMAR SEM DESTINO. Se a tabela feedback_pagina nao existir, ou
      o Supabase nao estiver configurado, a resposta NAO e confirmada: a gaveta
      diz que nao conseguiu registrar. O formulario de caso tinha o defeito
      oposto - confirmava sempre e nao gravava nada. Aqui o caminho esta
      invertido de proposito.

   O que e guardado: pagina, resposta (sim/nao), comentario opcional, data.
   O que nao e: id de usuario, IP, user-agent, sessao.
   ============================================================================ */
(function () {
    "use strict";

    const CHAVE = "fb:respondido";
    const PAGINA = window.location.pathname;

    // ---------- as telas ----------
    function construir() {
        const raiz = document.createElement("div");
        raiz.className = "fb-raiz";
        raiz.id = "fb-raiz";
        raiz.hidden = true;
        raiz.innerHTML =
            '<div class="fb-fundo" data-fb-fechar></div>' +
            '<aside class="fb-gaveta" role="dialog" aria-modal="true" aria-labelledby="fb-titulo">' +
                '<header class="fb-topo">' +
                    '<h2 class="fb-titulo" id="fb-titulo">Esta página ajudou você?</h2>' +
                    '<button class="fb-x" type="button" data-fb-fechar aria-label="Fechar">' +
                        '<i class="fa-solid fa-xmark" aria-hidden="true"></i>' +
                    "</button>" +
                "</header>" +
                '<p class="fb-nota">Responde só se quiser. Não guardamos seu nome nem seu e-mail, ' +
                    'e a resposta não fica ligada a você.</p>' +
                '<div class="fb-pergunta">' +
                    '<p class="fb-pergunta-txt" id="fb-pergunta">Esta página ajudou você?</p>' +
                    '<div class="fb-botoes">' +
                        '<button class="fb-btn" type="button" data-fb="sim">Sim</button>' +
                        '<button class="fb-btn" type="button" data-fb="nao">Não</button>' +
                    "</div>" +
                "</div>" +
                '<div class="fb-caixa" hidden>' +
                    '<label class="fb-rotulo" for="fbComentario">O que faltou, ou o que poderia ficar mais claro?</label>' +
                    '<textarea class="fb-campo" id="fbComentario" rows="4" maxlength="800" ' +
                        'placeholder="Opcional. Não precisa escrever nada."></textarea>' +
                    '<div class="fb-acoes">' +
                        '<button class="fb-enviar" type="button">Enviar</button>' +
                    "</div>" +
                "</div>" +
                '<p class="fb-estado" role="status" aria-live="polite" hidden></p>' +
            "</aside>" +
            '<button class="fb-gatilho" type="button" id="fbGatilho" aria-haspopup="dialog">' +
                '<i class="fa-regular fa-comment-dots" aria-hidden="true"></i>' +
                '<span>Esta página ajudou?</span>' +
            "</button>";
        document.body.appendChild(raiz);

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fb-abrir";
        btn.id = "fbAbrir";
        btn.setAttribute("aria-haspopup", "dialog");
        btn.innerHTML = '<i class="fa-regular fa-comment-dots" aria-hidden="true"></i>' +
            '<span>Esta página ajudou?</span>';
        document.body.appendChild(btn);
        return raiz;
    }

    function estado(gaveta, texto, tipo) {
        const e = gaveta.querySelector(".fb-estado");
        e.textContent = texto;
        e.hidden = !texto;
        e.removeAttribute("data-erro");
        e.removeAttribute("data-ok");
        if (tipo === "erro") e.setAttribute("data-erro", "true");
        if (tipo === "ok") e.setAttribute("data-ok", "true");
    }

    function abrir(raiz) {
        raiz.hidden = false;
        document.body.classList.add("fb-travado");
        const x = raiz.querySelector(".fb-x");
        if (x) x.focus();
    }
    function fechar(raiz) {
        raiz.hidden = true;
        document.body.classList.remove("fb-travado");
    }

    async function enviar(raiz, resposta, comentario) {
        const gaveta = raiz.querySelector(".fb-gaveta");
        const cliente = window.supabaseClient;

        // Sem destino nao ha confirmacao. E o ponto do modulo.
        if (!cliente) {
            estado(gaveta, "Não conseguimos registrar agora. Tente de novo mais tarde.", "erro");
            return;
        }

        const botao = gaveta.querySelector(".fb-enviar");
        if (botao) botao.disabled = true;
        estado(gaveta, "Enviando...", null);

        try {
            const r = await cliente.from("feedback_pagina").insert({
                pagina: PAGINA, resposta: resposta, comentario: comentario || null
            });
            if (r.error) throw r.error;
            gaveta.querySelector(".fb-pergunta").hidden = true;
            gaveta.querySelector(".fb-caixa").hidden = true;
            gaveta.querySelector(".fb-titulo").textContent = "Obrigado pela resposta.";
            estado(gaveta, "Sua resposta ficou registrada.", "ok");
            marcar();
        } catch (err) {
            console.error("[feedback] envio falhou:", err);
            estado(gaveta, "Não foi possível registrar agora. Nada foi perdido - tente de novo.", "erro");
        } finally {
            if (botao) botao.disabled = false;
        }
    }

    function marcar() {
        try { sessionStorage.setItem(CHAVE, "1"); } catch (e) { /* ignora */ }
        const abrir = document.getElementById("fbAbrir");
        if (abrir) abrir.hidden = true;
    }

    function iniciar() {
        let jaRespondeu = false;
        try { jaRespondeu = sessionStorage.getItem(CHAVE) === "1"; } catch (e) { /* ignora */ }
        if (jaRespondeu) return;

        const raiz = construir();
        const gaveta = raiz.querySelector(".fb-gaveta");

        document.getElementById("fbAbrir").addEventListener("click", function () { abrir(raiz); });

        raiz.addEventListener("click", function (ev) {
            if (ev.target.closest("[data-fb-fechar]")) fechar(raiz);
        });
        document.addEventListener("keydown", function (ev) {
            if (ev.key === "Escape") fechar(raiz);
        });

        gaveta.querySelectorAll("[data-fb]").forEach(function (b) {
            b.addEventListener("click", function () {
                const resposta = b.getAttribute("data-fb");
                if (resposta === "nao") {
                    // "Nao" encerra aqui: fecha e nao abre a caixa.
                    marcar();
                    fechar(raiz);
                    return;
                }
                // "Sim" abre a caixa de baixo.
                gaveta.querySelector(".fb-pergunta").hidden = true;
                gaveta.querySelector(".fb-caixa").hidden = false;
                gaveta.querySelector(".fb-campo").focus();
            });
        });

        gaveta.querySelector(".fb-enviar").addEventListener("click", function () {
            enviar(raiz, "sim", gaveta.querySelector(".fb-campo").value.trim());
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
