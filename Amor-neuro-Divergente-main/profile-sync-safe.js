document.addEventListener('DOMContentLoaded', () => {
    try {
        const read = (k, d) => localStorage.getItem(k) || d;
        let state = {
            name: read('userName', 'Convidado'),
            email: read('userEmail', 'convidado@amorneurodivergente.com'),
            avatar: read('userAvatar', '/img/avatar-1776703979307.png'),
            lang: read('userLang', 'pt'),
            logged: localStorage.getItem('userLoggedIn') === 'true'
        };

        const nameSelectors = ['#sidebarUserName', '#displayNameHeader', '#displayNameInfo', '.sidebar .user-profile .user-info h4', '.user-profile .user-info h4', '.username', '.profile-name', '.profileDisplayName', '.header-user-name'];
        const emailSelectors = ['#sidebarUserEmail', '.sidebar .user-profile .user-info p', '.user-profile .user-info p', '.email', '#userEmail', '#profileEmail'];

        const avatarSelectors = ['#sidebarAvatar', '#headerAvatar', '.header-avatar', '.profile-img', '.user-profile img', '.sidebar .user-profile img', '.avatar-img', '.user-avatar', '.nav-right img', '#globalAvatar', 'img.avatar', 'img.profile-img'];

        function applyState() {
            nameSelectors.forEach(sel => document.querySelectorAll(sel).forEach(el => { if (el) el.textContent = state.name; }));
            emailSelectors.forEach(sel => document.querySelectorAll(sel).forEach(el => { if (!el) return; if (el.textContent !== undefined) el.textContent = state.email; if (el.value !== undefined) el.value = state.email; }));
            avatarSelectors.forEach(sel => document.querySelectorAll(sel).forEach(el => { if (!el) return; if (el.tagName && el.tagName.toLowerCase() === 'img') { el.src = state.avatar; if (typeof el.alt === 'string') el.alt = state.name; } }));
            document.querySelectorAll('img[id*="Avatar"], img[class*="avatar"], img[class*="profile"]').forEach(el => { if (!el) return; if (el.tagName && el.tagName.toLowerCase() === 'img') { el.src = state.avatar; if (typeof el.alt === 'string') el.alt = state.name; } });

            // apply language attribute
            document.documentElement.lang = state.lang === 'en' ? 'en' : state.lang === 'es' ? 'es' : 'pt-BR';

            // hide pronouns badges safely (don't remove elements)
            document.querySelectorAll('#sidebarPronouns, .pronouns-badge').forEach(el => { try { if (el) el.style.display = 'none'; } catch (e) {} });
            document.querySelectorAll('#communityRecognitionBanner').forEach(el => { try { el.remove(); } catch (e) {} });
        }

        // initial apply
        applyState();

        // listen to storage changes from other tabs
        window.addEventListener('storage', (e) => {
            if (!e.key) return;
            if (['userName', 'userEmail', 'userAvatar', 'userLang', 'userLoggedIn'].includes(e.key)) {
                state.name = read('userName', 'Convidado');
                state.email = read('userEmail', 'convidado@amorneurodivergente.com');
                state.avatar = read('userAvatar', '/img/avatar-1776703979307.png');
                state.lang = read('userLang', 'pt');
                state.logged = localStorage.getItem('userLoggedIn') === 'true';
                applyState();
            }
        });

    } catch (err) {
        console.error('profile-sync-safe error', err);
    }
});
