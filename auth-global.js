/**
 * AUTH-GLOBAL.JS — Amor NeuroDivergente
 * Sistema global de autenticação (funciona em qualquer página)
 *
 * Uso:
 *   <script src="/auth-global.js" defer></script>
 *
 * Regras:
 *   - Visitante: vê "Entrar / Criar Conta", links restritos bloqueados
 *   - Logado:    vê perfil + "Sair", links restritos liberados
 */

(function () {
    'use strict';

    /* =============================================================
       CONFIGURAÇÃO — Rotas que exigem login
       ============================================================= */
    const PROTECTED_ROUTES = [
        '/configurações/',
        '/configuracoes/',
        '/perfil/',
        '/conta/',
        '/minha-conta/',
        '/admin/'
    ];

    /* =============================================================
       HELPERS
       ============================================================= */
    const $  = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    function isLoggedIn() {
        return localStorage.getItem('userLoggedIn') === 'true';
    }

    function getUserData() {
        return {
            name:   localStorage.getItem('userName')   || 'Usuário',
            email:  localStorage.getItem('userEmail')  || 'email@exemplo.com',
            avatar: localStorage.getItem('userAvatar') || '/img/foto-padrão.jpg'
        };
    }

    function isProtectedRoute(href) {
        if (!href) return false;
        const lower = href.toLowerCase();
        return PROTECTED_ROUTES.some(route => lower.includes(route.toLowerCase()));
    }

    /* =============================================================
       1. BLOQUEIO DE LINKS RESTRITOS (visitantes)
       ============================================================= */
    function applyProtectedLinksState() {
        const logged = isLoggedIn();

        $$('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (!isProtectedRoute(href)) return;

            if (logged) {
                // Libera
                link.classList.remove('is-locked');
                link.removeAttribute('aria-disabled');
                link.removeAttribute('tabindex');
                if (link.dataset.originalHref) {
                    link.setAttribute('href', link.dataset.originalHref);
                    delete link.dataset.originalHref;
                }
                // Remove cadeado se existir
                const lock = link.querySelector('.lock-icon');
                if (lock) lock.remove();
            } else {
                // Bloqueia
                if (!link.dataset.originalHref) {
                    link.dataset.originalHref = href;
                }
                link.classList.add('is-locked');
                link.setAttribute('aria-disabled', 'true');
                link.setAttribute('tabindex', '-1');

                // Adiciona cadeado visual (uma vez só)
                if (!link.querySelector('.lock-icon')) {
                    const lock = document.createElement('i');
                    lock.className = 'fa-solid fa-lock lock-icon';
                    lock.setAttribute('aria-hidden', 'true');
                    link.appendChild(lock);
                }
            }
        });
    }

    /* =============================================================
       2. INTERCEPTA CLIQUE EM LINKS BLOQUEADOS
       ============================================================= */
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a.is-locked');
        if (!link) return;

        e.preventDefault();
        e.stopPropagation();

        // Feedback amigável
        if (confirm('🔒 Você precisa estar logado para acessar esta área.\n\nDeseja entrar ou criar uma conta agora?')) {
            window.location.href = '/login/login.html';
        }
    }, true);

    /* =============================================================
       3. PROTEÇÃO DE ROTA DIRETA (se cair na URL)
       ============================================================= */
    function guardCurrentRoute() {
        const path = window.location.pathname.toLowerCase();
        const blocked = PROTECTED_ROUTES.some(r => path.includes(r.toLowerCase()));

        if (blocked && !isLoggedIn()) {
            // Salva destino para redirecionar depois do login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.replace('/login/login.html?redirect=' + encodeURIComponent(window.location.pathname));
        }
    }

    /* =============================================================
       4. TROCA DE BOTÕES NO HEADER (Entrar/Criar Conta ↔ Perfil)
       ============================================================= */
    function applyHeaderAuthState() {
        const logged = isLoggedIn();

        // --- Modo NOVO: se existir navGuest / navUser ---
        const navGuest = $('#navGuest');
        const navUser  = $('#navUser');
        if (navGuest && navUser) {
            navGuest.hidden = logged;
            navUser.hidden  = !logged;
        }

        // --- Modo COMPATÍVEL: esconde botões antigos no .nav-actions ---
        const navActions = $('.nav-actions');
        if (navActions) {
            const oldLogin  = navActions.querySelector('a.btn-text');
            const oldSignup = navActions.querySelector('a.btn-primary');
            if (oldLogin)  oldLogin.style.display  = logged ? 'none' : '';
            if (oldSignup) oldSignup.style.display = logged ? 'none' : '';
        }

        // --- Atualiza dados do usuário (se existirem no HTML) ---
        if (logged) {
            const { name, email, avatar } = getUserData();

            const map = {
                headerAvatar:      avatar,
                dropdownAvatar:    avatar,
                sidebarAvatar:     avatar
            };
            Object.entries(map).forEach(([id, src]) => {
                const el = document.getElementById(id);
                if (el) {
                    el.src = src;
                    el.onerror = () => { el.src = '/img/foto-padrão.jpg'; };
                }
            });

            const firstName = name.split(' ')[0];
            const nameTargets = {
                headerUserName:     firstName,
                dropdownUserName:   name,
                sidebarUserName:    name
            };
            Object.entries(nameTargets).forEach(([id, txt]) => {
                const el = document.getElementById(id);
                if (el) el.textContent = txt;
            });

            const emailTargets = ['dropdownUserEmail', 'sidebarUserEmail'];
            emailTargets.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = email;
            });
        }

        // --- Atualiza botão "Sair/Entrar" da sidebar ---
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            if (logged) {
                logoutBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> Sair';
                logoutBtn.setAttribute('href', '#');
                logoutBtn.dataset.logged = 'true';
            } else {
                logoutBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Entrar';
                logoutBtn.setAttribute('href', '/login/login.html');
                logoutBtn.dataset.logged = 'false';
            }
        }

        // --- Esconde dropdown do usuário quando deslogado ---
        if (!logged) {
            const dropdown = $('#userDropdown');
            const toggle   = $('#userMenuToggle');
            if (dropdown) dropdown.hidden = true;
            if (toggle)   toggle.setAttribute('aria-expanded', 'false');
        }
    }

    /* =============================================================
       5. LOGOUT GLOBAL (botão "Sair" da sidebar)
       ============================================================= */
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#logoutBtn');
        if (!btn) return;
        if (btn.dataset.logged !== 'true') return; // se não estiver logado, deixa navegar normal

        e.preventDefault();
        if (confirm('Tem certeza que deseja sair da sua conta?')) {
            localStorage.removeItem('userLoggedIn');
            applyHeaderAuthState();
            applyProtectedLinksState();
            window.location.href = '/login/login.html';
        }
    });

    /* =============================================================
       6. DROPDOWN DO USUÁRIO (header)
       ============================================================= */
    function initUserDropdown() {
        const toggle   = $('#userMenuToggle');
        const dropdown = $('#userDropdown');
        if (!toggle || !dropdown) return;

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !dropdown.hidden;
            dropdown.hidden = isOpen;
            toggle.setAttribute('aria-expanded', String(!isOpen));
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.hidden &&
                !dropdown.contains(e.target) &&
                !toggle.contains(e.target)) {
                dropdown.hidden = true;
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !dropdown.hidden) {
                dropdown.hidden = true;
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* =============================================================
       7. SINCRONIZAÇÃO ENTRE ABAS
       ============================================================= */
    window.addEventListener('storage', (e) => {
        if ([
            'userLoggedIn',
            'userName',
            'userEmail',
            'userAvatar'
        ].includes(e.key)) {
            applyHeaderAuthState();
            applyProtectedLinksState();
        }
    });

    /* =============================================================
       8. INICIALIZAÇÃO
       ============================================================= */
    function init() {
        guardCurrentRoute();       // protege rota
        applyHeaderAuthState();    // troca botões do header
        applyProtectedLinksState(); // bloqueia links restritos
        initUserDropdown();        // ativa dropdown
    }

    // Espera o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* =============================================================
       9. API PÚBLICA (para uso em outras páginas)
       ============================================================= */
    window.AuthGlobal = {
        isLoggedIn,
        getUserData,
        refresh: () => {
            applyHeaderAuthState();
            applyProtectedLinksState();
        }
    };

})();