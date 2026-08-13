/**
 * ARTIGO.JS — Amor NeuroDivergente
 * Navbar some ao descer, aparece ao subir
 */

document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;
    const navbar = document.getElementById('navbar');
    const progressBar = document.getElementById('readingProgress');

    // =============================================
    // 1. NAVBAR — Some ao descer, aparece ao subir
    // =============================================
    let lastScrollY = window.scrollY;
    const scrollThreshold = 50; // distância mínima para ativar

    function handleScroll() {
        const currentScrollY = window.scrollY;

        // Barra de progresso
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (currentScrollY / docHeight) * 100 : 0;
        progressBar.style.width = Math.min(progress, 100) + '%';

        // Lógica de esconder/mostrar navbar
        if (currentScrollY < scrollThreshold) {
            // No topo da página: sempre mostrar
            navbar.classList.remove('hidden');
        } else if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
            // Descendo a página: esconder navbar
            navbar.classList.add('hidden');
            // Fecha dropdown de acessibilidade se estiver aberto
            const dropdown = document.getElementById('a11yDropdown');
            if (dropdown && !dropdown.hasAttribute('hidden')) {
                dropdown.setAttribute('hidden', '');
                document.getElementById('a11yToggle')?.setAttribute('aria-expanded', 'false');
            }
        } else if (currentScrollY < lastScrollY) {
            // Subindo a página: mostrar navbar
            navbar.classList.remove('hidden');
        }

        lastScrollY = currentScrollY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // =============================================
    // 2. ACESSIBILIDADE
    // =============================================
    const a11yToggle = document.getElementById('a11yToggle');
    const a11yDropdown = document.getElementById('a11yDropdown');

    if (a11yToggle && a11yDropdown) {
        a11yToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const hidden = a11yDropdown.hasAttribute('hidden');
            if (hidden) {
                a11yDropdown.removeAttribute('hidden');
                a11yToggle.setAttribute('aria-expanded', 'true');
            } else {
                a11yDropdown.setAttribute('hidden', '');
                a11yToggle.setAttribute('aria-expanded', 'false');
            }
        });
        document.addEventListener('click', (e) => {
            if (!a11yDropdown.contains(e.target) && e.target !== a11yToggle) {
                a11yDropdown.setAttribute('hidden', '');
                a11yToggle.setAttribute('aria-expanded', 'false');
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !a11yDropdown.hasAttribute('hidden')) {
                a11yDropdown.setAttribute('hidden', '');
                a11yToggle.setAttribute('aria-expanded', 'false');
                a11yToggle.focus();
            }
        });
    }

    function gs(k, fb) { return localStorage.getItem('a11y_' + k) || fb; }
    function ss(k, v) { localStorage.setItem('a11y_' + k, v); }
    function usl(id, active) { const el = document.getElementById(id); if (el) el.textContent = active ? 'Ligado' : 'Desligado'; }

    function applySettings() {
        const content = document.getElementById('articleContent');
        if (gs('darkMode') === 'true') body.classList.add('a11y-dark-mode');
        if (gs('highlightLinks') === 'true') body.classList.add('a11y-highlight-links');
        if (gs('dyslexiaFont') === 'true') body.classList.add('a11y-dyslexia');
        if (gs('reduceMotion') === 'true') body.classList.add('a11y-reduce-motion');
        const ts = gs('textSize', 'normal');
        if (content) {
            content.classList.remove('a11y-large-text', 'a11y-small-text');
            if (ts === 'large') content.classList.add('a11y-large-text');
            if (ts === 'small') content.classList.add('a11y-small-text');
        }
        usl('darkModeStatus', gs('darkMode') === 'true');
        usl('linksStatus', gs('highlightLinks') === 'true');
        usl('dyslexiaStatus', gs('dyslexiaFont') === 'true');
        usl('motionStatus', gs('reduceMotion') === 'true');
    }

    document.querySelectorAll('.a11y-option, .a11y-reset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.getAttribute('data-a11y');
            const content = document.getElementById('articleContent');

            switch (action) {
                case 'darkMode':
                    const dm = gs('darkMode') === 'true';
                    ss('darkMode', dm ? 'false' : 'true');
                    if (dm) body.classList.remove('a11y-dark-mode');
                    else body.classList.add('a11y-dark-mode');
                    usl('darkModeStatus', !dm);
                    break;
                case 'increaseText':
                    const cs = gs('textSize', 'normal');
                    if (cs === 'large') { ss('textSize', 'normal'); if (content) content.classList.remove('a11y-large-text'); }
                    else { ss('textSize', 'large'); if (content) { content.classList.remove('a11y-small-text'); content.classList.add('a11y-large-text'); } }
                    break;
                case 'decreaseText':
                    const cz = gs('textSize', 'normal');
                    if (cz === 'small') { ss('textSize', 'normal'); if (content) content.classList.remove('a11y-small-text'); }
                    else { ss('textSize', 'small'); if (content) { content.classList.remove('a11y-large-text'); content.classList.add('a11y-small-text'); } }
                    break;
                case 'highlightLinks':
                    const hl = gs('highlightLinks') === 'true';
                    ss('highlightLinks', hl ? 'false' : 'true');
                    if (hl) body.classList.remove('a11y-highlight-links');
                    else body.classList.add('a11y-highlight-links');
                    usl('linksStatus', !hl);
                    break;
                case 'dyslexiaFont':
                    const df = gs('dyslexiaFont') === 'true';
                    ss('dyslexiaFont', df ? 'false' : 'true');
                    if (df) body.classList.remove('a11y-dyslexia');
                    else body.classList.add('a11y-dyslexia');
                    usl('dyslexiaStatus', !df);
                    break;
                case 'reduceMotion':
                    const rm = gs('reduceMotion') === 'true';
                    ss('reduceMotion', rm ? 'false' : 'true');
                    if (rm) body.classList.remove('a11y-reduce-motion');
                    else body.classList.add('a11y-reduce-motion');
                    usl('motionStatus', !rm);
                    break;
                case 'reset':
                    ['darkMode','highlightLinks','dyslexiaFont','reduceMotion','textSize'].forEach(k => localStorage.removeItem('a11y_'+k));
                    body.classList.remove('a11y-dark-mode','a11y-highlight-links','a11y-dyslexia','a11y-reduce-motion');
                    if (content) content.classList.remove('a11y-large-text','a11y-small-text');
                    usl('darkModeStatus',false); usl('linksStatus',false);
                    usl('dyslexiaStatus',false); usl('motionStatus',false);
                    break;
            }
        });
    });

    applySettings();

    // =============================================
    // 3. SINCRONIZAÇÃO DO AVATAR
    // =============================================
    const avatar = document.getElementById('headerAvatar');
    if (avatar) {
        const saved = localStorage.getItem('userAvatar');
        if (saved) {
            avatar.src = saved;
            avatar.onerror = () => { avatar.src = '/img/avatar-padrao.png'; };
        }
        window.addEventListener('storage', (e) => {
            if (e.key === 'userAvatar' && e.newValue) avatar.src = e.newValue;
        });
    }
});