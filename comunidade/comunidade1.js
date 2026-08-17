document.addEventListener("DOMContentLoaded", async () => {
    
    // =============================================
    // 0. SUPABASE - CONEXÃO REAL
    // =============================================
    const supabase = window.supabaseClient;
    
    if (!supabase) {
        console.error('❌ Supabase não inicializado!');
        return;
    }
    
    let currentUser = null;
    const AVATAR_PADRAO = '/img/avatar-padrao.png';
    
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            currentUser = session.user;
            console.log('✅ Usuário logado:', currentUser.email);
        }
    } catch(e) {
        console.error('Erro ao verificar sessão:', e);
    }

    // =============================================
    // SIDEBAR TOGGLE - FUNCIONALIDADE PRINCIPAL
    // =============================================
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const body = document.body;
    const overlay = document.getElementById('sidebarOverlay');

    function toggleSidebar() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Mobile: abre/fecha por cima
            body.classList.toggle('mobile-sidebar-open');
        } else {
            // Desktop: expande/colapsa com empurrão
            body.classList.toggle('sidebar-expanded');
        }
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Fechar sidebar no mobile ao clicar no overlay
    if (overlay) {
        overlay.addEventListener('click', function() {
            body.classList.remove('mobile-sidebar-open');
        });
    }

    // Fechar sidebar no mobile ao redimensionar para desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            body.classList.remove('mobile-sidebar-open');
        }
    });

    // Marcar link ativo
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // =============================================
    // FUNÇÃO PARA SINCRONIZAR O AVATAR NA SIDEBAR
    // =============================================
    function getUserAvatar() {
        return localStorage.getItem('userAvatar') || AVATAR_PADRAO;
    }

    function getUserName() {
        return localStorage.getItem('userName') || currentUser?.email?.split('@')[0] || 'Usuário';
    }

    function syncProfileFromStorage() {
        const savedName = getUserName();
        const savedAvatar = getUserAvatar();
        
        // Atualizar avatar na sidebar (todos os elementos com id sidebarAvatar)
        const sidebarAvatarElements = document.querySelectorAll('#sidebarAvatar');
        sidebarAvatarElements.forEach(el => {
            if (el) {
                el.src = savedAvatar;
                el.onerror = () => { el.src = AVATAR_PADRAO; };
            }
        });

        // Atualizar nome na sidebar (todos os elementos com id sidebarUserName)
        const sidebarUserNameElements = document.querySelectorAll('#sidebarUserName');
        sidebarUserNameElements.forEach(el => {
            if (el) {
                el.textContent = savedName;
            }
        });

        // Atualizar avatar e nome nos links da sidebar
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        sidebarLinks.forEach(link => {
            const nameSpan = link.querySelector('#sidebarUserName');
            const avatarImg = link.querySelector('#sidebarAvatar');
            if (nameSpan) nameSpan.textContent = savedName;
            if (avatarImg) {
                avatarImg.src = savedAvatar;
                avatarImg.onerror = () => { avatarImg.src = AVATAR_PADRAO; };
            }
        });
    }

    // Sincronizar perfil ao carregar a página
    syncProfileFromStorage();

    // Sincronizar quando houver mudanças no localStorage
    window.addEventListener('storage', (e) => {
        if (e.key === 'userAvatar' || e.key === 'userName' || e.key === 'userEmail') {
            syncProfileFromStorage();
        }
    });

    // Sincronizar também quando a página for atualizada
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            syncProfileFromStorage();
        }
    });

    // =============================================
    // DEMONSTRAÇÃO: Atualizar avatar quando clicar no botão
    // (opcional - apenas para teste)
    // =============================================
    // Exemplo de como atualizar o avatar:
    // localStorage.setItem('userAvatar', '/img/novo-avatar.jpg');
    // localStorage.setItem('userName', 'Novo Nome');
    // syncProfileFromStorage();

    console.log('✅ Sidebar com avatar sincronizado!');
});