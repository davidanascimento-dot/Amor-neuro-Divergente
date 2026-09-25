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

    menuToggle?.addEventListener('click', () => {
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

    document.addEventListener('click', event => {
        if (!nav?.classList.contains('is-scrolled') && !nav?.contains(event.target)) return;
        if (!navLinks?.classList.contains('is-open')) return;
        navLinks.classList.remove('is-open');
        menuToggle?.setAttribute('aria-expanded', 'false');
        if (menuToggle) menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
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
