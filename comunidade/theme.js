/* ==========================================================================
   THEME.JS — modo claro/escuro da comunidade
   Compartilhado por toda a área /comunidade (fórum, grupos, conversas,
   perfil e publicação).

   Usa exatamente a mesma preferência do restante do site:
   localStorage "a11y_darkMode" ("true"/"false") e a classe
   "a11y-dark-mode" no <html> e no <body>. Alternar aqui também muda
   inicio.html, configurações e as demais áreas.
   ========================================================================== */

(function () {
    const STORAGE_KEY = 'a11y_darkMode';
    const THEME_CLASS = 'a11y-dark-mode';
    const BUTTON_SELECTOR = '[data-a11y="darkMode"]';

    function readStoredTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'true';
        } catch (error) {
            return false;
        }
    }

    function isDark() {
        return document.body.classList.contains(THEME_CLASS) ||
            document.documentElement.classList.contains(THEME_CLASS);
    }

    // A classe vai no <html> e no <body>: o <html> é quem pinta o fundo da
    // página, e o restante do site estiliza body.a11y-dark-mode.
    function setThemeClass(dark) {
        document.documentElement.classList.toggle(THEME_CLASS, dark);
        if (document.body) document.body.classList.toggle(THEME_CLASS, dark);
    }

    function syncButtons() {
        const dark = isDark();
        const label = dark ? 'Ativar modo claro' : 'Ativar modo escuro';
        document.querySelectorAll(BUTTON_SELECTOR).forEach(button => {
            button.setAttribute('aria-pressed', String(dark));
            button.setAttribute('aria-label', label);
            button.title = label;
            const icon = button.querySelector('i');
            if (icon) icon.className = dark ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
            const status = button.querySelector('.a11y-status');
            if (status) status.textContent = dark ? 'Ativo' : 'Desligado';
        });
    }

    function apply(dark, { persist = true } = {}) {
        setThemeClass(dark);
        if (persist) {
            try {
                localStorage.setItem(STORAGE_KEY, dark ? 'true' : 'false');
            } catch (error) {
                console.warn('Não foi possível salvar a preferência de tema:', error);
            }
        }
        syncButtons();
    }

    function toggle() {
        apply(!isDark());
    }

    let initialized = false;

    function init() {
        // O <head> já aplicou a classe no <html>; garante também no <body>.
        if (readStoredTheme()) setThemeClass(true);
        syncButtons();
        if (initialized) return;
        initialized = true;
        document.querySelectorAll(BUTTON_SELECTOR).forEach(button => {
            if (button.dataset.a11yThemeBound === 'true') return;
            button.dataset.a11yThemeBound = 'true';
            button.addEventListener('click', toggle);
        });
        // Mantém outras abas em sincronia quando o tema muda em uma delas.
        window.addEventListener('storage', event => {
            if (event.key !== STORAGE_KEY) return;
            setThemeClass(event.newValue === 'true');
            syncButtons();
        });
    }

    function bootstrap() {
        // Executado assim que o arquivo é lido: evita piscar o tema errado.
        if (readStoredTheme()) {
            document.documentElement.classList.add(THEME_CLASS);
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }

    window.ComunidadeTheme = { apply, init, isDark, toggle, STORAGE_KEY, THEME_CLASS };

    bootstrap();
})();
