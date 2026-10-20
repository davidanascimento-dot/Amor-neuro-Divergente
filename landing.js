/* Landing page — navegação, menu e animações leves */
(() => {
    const nav = document.getElementById('landingNav');
    const menuToggle = document.getElementById('landingMenuToggle');
    const navLinks = document.getElementById('landingNavLinks');
    const year = document.getElementById('landingYear');

    if (year) year.textContent = new Date().getFullYear();

    const updateNav = () => {
        nav?.classList.toggle('is-scrolled', window.scrollY > 18);
    };
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });

    menuToggle?.addEventListener('click', (event) => {
        // Sem stopPropagation o handler de document fechava o menu no
        // mesmo clique em que o toggle abria — o menu nunca abria.
        event.stopPropagation();
        const isOpen = navLinks?.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
        menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
        menuToggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });

    navLinks?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('is-open');
            menuToggle?.setAttribute('aria-expanded', 'false');
            menuToggle?.setAttribute('aria-label', 'Abrir menu');
            if (menuToggle) menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        });
    });

    // Fecha o menu só quando o clique é FORA da navegação. Antes a
    // condição fazia o contrário: o clique no toggle abria e o handler
    // de document fechava no mesmo evento, e clique fora não fechava.
    document.addEventListener('click', event => {
        if (!navLinks?.classList.contains('is-open')) return;
        if (nav?.contains(event.target)) return;
        navLinks.classList.remove('is-open');
        menuToggle?.setAttribute('aria-expanded', 'false');
        menuToggle?.setAttribute('aria-label', 'Abrar menu');
        if (menuToggle) menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });

    // Escape fecha o menu aberto e devolve o foco ao botão (teclado).
    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || !navLinks?.classList.contains('is-open')) return;
        navLinks.classList.remove('is-open');
        menuToggle?.setAttribute('aria-expanded', 'false');
        menuToggle?.setAttribute('aria-label', 'Abrar menu');
        if (menuToggle) {
            menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            menuToggle.focus();
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', event => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
})();
