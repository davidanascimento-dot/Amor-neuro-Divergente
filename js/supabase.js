/* ==========================================================================
   SUPABASE.JS — criação única do cliente do Supabase para o site inteiro
   --------------------------------------------------------------------------
   Este arquivo substitui os <script> inline com supabase.createClient(...) que
   estavam duplicados em 21 páginas. Agora existe um lugar só.

   Como usar no HTML (a ordem importa: o SDK precisa vir antes):

       <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
       <script src="/js/supabase-config.js"></script>
       <script src="/js/supabase.js"></script>

   A URL e a chave NÃO ficam neste arquivo. Elas vêm do .env e chegam aqui
   pelo /js/supabase-config.js, gerado por scripts/supabase-config.js
   (roda sozinho antes do `npm run dev` e do `npm run build`).

   O resto do site continua usando a mesma API de sempre: window.supabaseClient
   ========================================================================== */

(function () {
    'use strict';

    const config = window.SUPABASE_CONFIG || {};

    if (!config.url || !config.anonKey) {
        console.error(
            '[supabase] Configuração ausente. Rode `npm run dev` ou `npm run build` ' +
            'para gerar /js/supabase-config.js a partir do seu .env.'
        );
        return;
    }

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        console.error(
            '[supabase] O SDK não carregou. A tag do jsdelivr precisa vir ' +
            'antes de /js/supabase.js.'
        );
        return;
    }

    // API pública usada pelas páginas: window.supabaseClient
    window.supabaseClient = window.supabase.createClient(config.url, config.anonKey);
})();