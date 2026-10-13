/**
 * AUTH-GLOBAL.JS — Amor NeuroDivergente
 * Sistema único de visitante / membro. Carregado nas páginas que usam Supabase.
 *
 * Uso:
 *   <script src="/auth-global.js"></script>      (depois de /js/supabase.js)
 *
 * O que resolve:
 *   - Visitante x membro atualizado na hora, sem recarregar a página,
 *     em qualquer aba e em qualquer página do site.
 *   - A sessão do Supabase é a fonte da verdade; o localStorage é só o espelho
 *     que o resto do site já lê (userLoggedIn, userName, userEmail, userAvatar).
 *   - Botão "Sair" funciona igual em todas as páginas: encerra a sessão no
 *     Supabase, limpa o espelho e volta o visitante ao estado de visitante.
 *   - Quem não está logado não consegue editar o perfil em página nenhuma.
 */

(function () {
    'use strict';

    /* =============================================================
       1. CONFIGURAÇÃO
       ============================================================= */

    // Rotas que exigem sessão. Comparadas com o caminho já decodificado,
    // senão "/configurações/" nunca casaria com "/configurac%C3%A7%C3%B5es/".
    const PROTECTED_ROUTES = [
        '/configurações/',
        '/configuracoes/',
        '/conta/',
        '/minha-conta/',
        '/admin/',
        '/painel-admin/'
    ];

    const CHAVES = ['userLoggedIn', 'userName', 'userEmail', 'userAvatar', 'userRole', 'userBio'];

    // Tudo que mexe no perfil e precisa estar escondido para visitante.
    const GATED_PROFILE_SELECTORS = [
        '#openEditBtn',        // comunidade/perfil.html
        '#editProfileBtn',     // configurações
        '.profile-link',       // "Editar perfil" da sidebar
        '#sidebarEditarPerfil',
        '[data-target="perfilPane"]',
        '#perfilPane'          // o painel em si, não só a aba que abre ele
    ];

    const $  = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    /* =============================================================
       2. ESTADO — espelho entre o Supabase e o localStorage
       ============================================================= */

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

    function gravaEspelho(user) {
        const meta = (user && user.user_metadata) || {};
        const nome = meta.first_name
            || meta.full_name
            || meta.name
            || (user.email || '').split('@')[0]
            || 'Usuário';

        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userName', nome);
        localStorage.setItem('userEmail', user.email || '');
        if (meta.avatar_url) localStorage.setItem('userAvatar', meta.avatar_url);
    }

    function limpaEspelho() {
        CHAVES.forEach(k => localStorage.removeItem(k));
    }

    /* Lê a sessão no Supabase e atualiza o espelho.
       Devolve o usuário, ou null quando não há sessão / a página não tem Supabase. */
    async function sincronizaComSupabase() {
        const sb = window.supabaseClient;
        if (!sb || !sb.auth || typeof sb.auth.getSession !== 'function') return null;

        try {
            const { data, error } = await sb.auth.getSession();
            if (error) return null;

            const user = data?.session?.user || null;
            if (user) gravaEspelho(user);
            else      limpaEspelho();

            return user;
        } catch (e) {
            console.warn('[auth] não deu para ler a sessão:', e);
            return null;
        }
    }

    /* Fica de olho na sessão. É o que faz a troca visitante -> membro
       acontecer sozinha, sem recarregar a página. */
    function acompanhaSessao() {
        const sb = window.supabaseClient;
        if (!sb || !sb.auth || typeof sb.auth.onAuthStateChange !== 'function') return;

        sb.auth.onAuthStateChange((evento, session) => {
            if (evento === 'SIGNED_IN' && session?.user) {
                gravaEspelho(session.user);
            } else if (evento === 'SIGNED_OUT' || !session) {
                limpaEspelho();
            } else {
                return; // TOKEN_REFRESHED e afins não mudam a tela
            }
            aplicaEstado();
            console.log('[auth] sessão mudou para', evento, '- interface atualizada');
        });
    }

    /* =============================================================
       3. INTERFACE DE VISITANTE
       ============================================================= */

    function injetaEstilo() {
        if (document.getElementById('authGlobalStyle')) return;
        const s = document.createElement('style');
        s.id = 'authGlobalStyle';
        s.textContent = '.auth-hidden{display:none !important}';
        document.head.appendChild(s);
    }

    /* Esconde (ou mostra) tudo que mexe no perfil conforme a sessão. */
    function aplicaBloqueioPerfil() {
        const logado = isLoggedIn();

        GATED_PROFILE_SELECTORS.forEach(sel => {
            $$(sel).forEach(el => {
                el.classList.toggle('auth-hidden', !logado);
                if (logado) el.removeAttribute('aria-disabled');
                else el.setAttribute('aria-disabled', 'true');
            });
        });

        // Links para perfil em geral: deslogado não entra no editor.
        $$('a[href]').forEach(link => {
            const href = link.getAttribute('href') || '';
            if (!/perfil\.html/i.test(href)) return;
            if (/\?id=/i.test(href)) return; // ver perfil de outra pessoa continua público

            link.classList.toggle('auth-hidden', !logado);
            if (logado) link.removeAttribute('aria-disabled');
            else link.setAttribute('aria-disabled', 'true');
        });
    }

    /* Clique em algo que exige sessão: explica e oferece o login. */
    document.addEventListener('click', (e) => {
        if (isLoggedIn()) return;

        const alvo = e.target.closest(
            GATED_PROFILE_SELECTORS.join(',') + ', a[aria-disabled="true"].is-locked'
        );
        if (!alvo) return;

        // Link para o perfil de outra pessoa não é bloqueado aqui.
        if (alvo.tagName === 'A' && /\?id=/i.test(alvo.getAttribute('href') || '')) return;

        e.preventDefault();
        e.stopPropagation();

        const destino = encodeURIComponent(window.location.pathname + window.location.search);
        if (confirm('🔒 Você precisa estar logado para editar seu perfil.\n\nDeseja entrar ou criar uma conta agora?')) {
            window.location.href = '/login/login.html?redirect=' + destino;
        }
    }, true);

    /* Bloqueio de links restritos (cadeado + aviso). */
    function aplicaEstadoDosLinks() {
        const logado = isLoggedIn();

        $$('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (!rotaProtegida(href)) return;

            if (logado) {
                link.classList.remove('is-locked');
                link.removeAttribute('aria-disabled');
                link.removeAttribute('tabindex');
                if (link.dataset.originalHref) {
                    link.setAttribute('href', link.dataset.originalHref);
                    delete link.dataset.originalHref;
                }
                const lock = link.querySelector('.lock-icon');
                if (lock) lock.remove();
            } else {
                if (!link.dataset.originalHref) link.dataset.originalHref = href;
                link.classList.add('is-locked');
                link.setAttribute('aria-disabled', 'true');
                link.setAttribute('tabindex', '-1');

                if (!link.querySelector('.lock-icon')) {
                    const lock = document.createElement('i');
                    lock.className = 'fa-solid fa-lock lock-icon';
                    lock.setAttribute('aria-hidden', 'true');
                    link.appendChild(lock);
                }
            }
        });
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a.is-locked');
        if (!link) return;

        e.preventDefault();
        e.stopPropagation();

        const destino = encodeURIComponent(window.location.pathname + window.location.search);
        if (confirm('🔒 Você precisa estar logado para acessar esta área.\n\nDeseja entrar ou criar uma conta agora?')) {
            window.location.href = '/login/login.html?redirect=' + destino;
        }
    }, true);

    /* Header: avatar, nome, e-mail, botão Entrar/Sair. */
    function aplicaEstado() {
        const logado = isLoggedIn();

        const navGuest = $('#navGuest');
        const navUser  = $('#navUser');
        if (navGuest && navUser) {
            navGuest.hidden = logado;
            navUser.hidden  = !logado;
        }

        // Botões antigos do header (.nav-actions)
        const navActions = $('.nav-actions');
        if (navActions) {
            const oldLogin  = navActions.querySelector('a.btn-text');
            const oldSignup = navActions.querySelector('a.btn-primary');
            if (oldLogin)  oldLogin.style.display  = logado ? 'none' : '';
            if (oldSignup) oldSignup.style.display = logado ? 'none' : '';
        }

        if (logado) {
            const { name, email, avatar } = getUserData();

            const avatares = { headerAvatar: avatar, dropdownAvatar: avatar, sidebarAvatar: avatar };
            Object.entries(avatares).forEach(([id, src]) => {
                const el = document.getElementById(id);
                if (!el) return;
                el.src = src;
                el.onerror = () => { el.src = '/img/foto-padrão.jpg'; };
            });

            const primeiro = name.split(' ')[0];
            const nomes = { headerUserName: primeiro, dropdownUserName: name, sidebarUserName: name };
            Object.entries(nomes).forEach(([id, txt]) => {
                const el = document.getElementById(id);
                if (el) el.textContent = txt;
            });

            ['dropdownUserEmail', 'sidebarUserEmail'].forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                el.textContent = email;
                el.hidden = false;
            });

            const editar = document.getElementById('sidebarEditarPerfil');
            if (editar) editar.hidden = false;
        } else {
            ['dropdownUserEmail', 'sidebarUserEmail'].forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                el.textContent = '';
                el.hidden = true;
            });
            const editar = document.getElementById('sidebarEditarPerfil');
            if (editar) editar.hidden = true;
        }

        // Botão Entrar / Sair
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            if (logado) {
                logoutBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> Sair';
                logoutBtn.setAttribute('href', '#');
                logoutBtn.dataset.logged = 'true';
            } else {
                logoutBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Entrar';
                logoutBtn.setAttribute('href', '/login/login.html');
                logoutBtn.dataset.logged = 'false';
            }
        }

        if (!logado) {
            const dropdown = $('#userDropdown');
            const toggle   = $('#userMenuToggle');
            if (dropdown) dropdown.hidden = true;
            if (toggle)   toggle.setAttribute('aria-expanded', 'false');
        }

        aplicaBloqueioPerfil();
        aplicaEstadoDosLinks();

        // Qualquer página pode reagir a mudança olhando este atributo.
        document.body.setAttribute('data-auth', logado ? 'member' : 'visitor');
    }

    /* =============================================================
       4. PROTEÇÃO DE ROTA
       ============================================================= */

    function caminhoDecodificado(p) {
        try { return decodeURIComponent(p); } catch (e) { return p; }
    }

    function rotaProtegida(href) {
        if (!href) return false;
        const alvo = caminhoDecodificado(href).toLowerCase();
        return PROTECTED_ROUTES.some(rota => alvo.includes(rota.toLowerCase()));
    }

    function protegeRotaAtual() {
        const caminho = caminhoDecodificado(window.location.pathname).toLowerCase();
        const bloqueada = PROTECTED_ROUTES.some(rota => caminho.includes(rota.toLowerCase()));

        if (bloqueada && !isLoggedIn()) {
            const destino = window.location.pathname + window.location.search;
            sessionStorage.setItem('redirectAfterLogin', destino);
            window.location.replace('/login/login.html?redirect=' + encodeURIComponent(destino));
            return true;
        }
        return false;
    }

    /* =============================================================
       5. LOGOUT — igual em todas as páginas
       ============================================================= */

    async function sair() {
        const destino = encodeURIComponent(window.location.pathname);

        try {
            const sb = window.supabaseClient;
            if (sb && sb.auth && typeof sb.auth.signOut === 'function') {
                await sb.auth.signOut();
            }
        } catch (e) {
            console.warn('[auth] falha ao encerrar a sessão no Supabase:', e);
        }

        limpaEspelho();
        aplicaEstado();
        window.location.href = '/login/login.html?redirect=' + destino;
    }

    /* Captura antes dos scripts da página: assim o "Sair" abre UM confim só.
       Sem isso, inicio.js / blog.js / loja.js etc. abriam um segundo diálogo
       logo em seguida e limpavam o localStorage por conta própria. */
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#logoutBtn');
        if (!btn) return;
        if (btn.dataset.logged !== 'true') return; // visitante: deixa seguir para o login

        e.preventDefault();
        e.stopPropagation();

        if (confirm('Tem certeza que deseja sair da sua conta?')) sair();
    }, true);

    /* =============================================================
       6. ABAS / DROPDOWN
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

    // Outra aba entrou/saiu: o evento storage não dispara aqui, mas o espelho
    // já muda e nós reagimos.
    window.addEventListener('storage', (e) => {
        if (!e.key || CHAVES.includes(e.key)) aplicaEstado();
    });

    /* =============================================================
       7. INICIALIZAÇÃO
       ============================================================= */

    async function init() {
        injetaEstilo();

        // O espelho precisa bater com a sessão antes de qualquer decisão de UI.
        await sincronizaComSupabase();
        acompanhaSessao();

        if (protegeRotaAtual()) return;

        aplicaEstado();
        initUserDropdown();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* =============================================================
       8. API PÚBLICA
       ============================================================= */

    window.AuthGlobal = {
        isLoggedIn,
        getUserData,
        sair,
        refresh: aplicaEstado,
        // Usado pelas páginas para "pintar" a interface depois de um login.
        entrou: async (user) => {
            if (user) gravaEspelho(user);
            else await sincronizaComSupabase();
            aplicaEstado();
        }
    };

})();