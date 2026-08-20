/**
 * SIDEBAR.JS — Controle da sidebar e perfil para todas as páginas
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // =============================================
    // ELEMENTOS DA SIDEBAR
    // =============================================
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    console.log('🔍 Debug Sidebar:');
    console.log('  - sidebar:', sidebar);
    console.log('  - toggleBtn:', sidebarToggleBtn);
    console.log('  - overlay:', sidebarOverlay);

    // =============================================
    // FUNÇÕES DE CONTROLE - USANDO 'active'
    // =============================================
    function openSidebar() {
        if (!sidebar) return;
        console.log('📂 Abrindo sidebar');
        sidebar.classList.add('active');  // ← MUDOU para 'active'
        if (sidebarOverlay) sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (sidebarToggleBtn) {
            sidebarToggleBtn.setAttribute('aria-expanded', 'true');
        }
    }

    function closeSidebar() {
        if (!sidebar) return;
        console.log('📂 Fechando sidebar');
        sidebar.classList.remove('active');  // ← MUDOU para 'active'
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
        if (sidebarToggleBtn) {
            sidebarToggleBtn.setAttribute('aria-expanded', 'false');
        }
    }

    function toggleSidebar() {
        if (sidebar.classList.contains('active')) {  // ← MUDOU para 'active'
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    // =============================================
    // EVENTO DO BOTÃO TOGGLE
    // =============================================
    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('🔄 Botão clicado!');
            toggleSidebar();
        });
    } else {
        console.warn('⚠️ Sidebar ou botão não encontrados!');
    }

    // =============================================
    // FECHAR AO CLICAR NO OVERLAY
    // =============================================
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            console.log('🔄 Overlay clicado, fechando');
            closeSidebar();
        });
    }

    // =============================================
    // FECHAR COM TECLA ESC
    // =============================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
            console.log('🔄 ESC pressionado, fechando');
            closeSidebar();
        }
    });

    // =============================================
    // PERFIL COLAPSÁVEL
    // =============================================
    const profileToggle = document.getElementById('profileToggle');
    const profileDetail = document.getElementById('profileDetail');

    if (profileToggle && profileDetail) {
        profileToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const isHidden = profileDetail.hasAttribute('hidden');
            if (isHidden) {
                profileDetail.removeAttribute('hidden');
                profileToggle.setAttribute('aria-expanded', 'true');
            } else {
                profileDetail.setAttribute('hidden', '');
                profileToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Fechar perfil ao clicar fora
        document.addEventListener('click', function(e) {
            const profileContainer = document.querySelector('.sidebar-profile');
            if (profileContainer && !profileContainer.contains(e.target)) {
                profileDetail.setAttribute('hidden', '');
                profileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // =============================================
    // SINCRONIZAR DADOS DO PERFIL
    // =============================================
    function syncProfile() {
        const savedName = localStorage.getItem('userName');
        const savedEmail = localStorage.getItem('userEmail');
        const savedAvatar = localStorage.getItem('userAvatar');
        
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        const sidebarUserName = document.getElementById('sidebarUserName');
        const sidebarUserEmail = document.getElementById('sidebarUserEmail');
        
        if (sidebarAvatar && savedAvatar) {
            sidebarAvatar.src = savedAvatar;
            sidebarAvatar.onerror = function() { 
                this.src = '/img/foto-padrão.jpg'; 
            };
        }
        if (sidebarUserName && savedName) {
            sidebarUserName.textContent = savedName;
        }
        if (sidebarUserEmail && savedEmail) {
            sidebarUserEmail.textContent = savedEmail;
        }
    }
    
    syncProfile();

    // Atualizar quando os dados mudarem em outra aba
    window.addEventListener('storage', function(e) {
        if (e.key === 'userAvatar' || e.key === 'userName' || e.key === 'userEmail') {
            syncProfile();
        }
    });

    console.log('✅ Sidebar inicializada com sucesso!');
});