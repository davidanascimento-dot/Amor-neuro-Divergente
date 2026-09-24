/* ==========================================================================
   PERFIL.JS — Página de Perfil do Usuário
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    const supabase = window.supabaseClient;
    if (!supabase) {
        console.error('❌ Supabase não inicializado!');
        return;
    }

    let currentUser = null;
    let profileUser = null;   // Usuário dono do perfil sendo visualizado
    let isOwnProfile = false;
    let currentTab = 'posts';

    const AVATAR_PADRAO = '/img/foto-padrão.jpg';

    // =============================================
    // 1. OBTER USUÁRIO LOGADO
    // =============================================
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            currentUser = session.user;
            console.log('✅ Usuário logado:', currentUser.email);
        }
    } catch (e) {
        console.error('Erro ao verificar sessão:', e);
    }

    // =============================================
    // 2. OBTER ID DO PERFIL PELA URL
    // =============================================
    const urlParams = new URLSearchParams(window.location.search);
    const profileIdFromUrl = urlParams.get('id');

    // Se não veio ID na URL, usar o próprio usuário logado
    const targetUserId = profileIdFromUrl || currentUser?.id;

    if (!targetUserId) {
        showError('Nenhum usuário especificado e você não está logado.');
        return;
    }

    isOwnProfile = currentUser?.id === targetUserId;

    // =============================================
    // 3. CARREGAR PERFIL
    // =============================================
    async function loadProfile() {
        try {
            // Buscar dados do perfil no banco
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', targetUserId)
                .maybeSingle();

            if (error) {
                console.error('❌ Erro ao buscar perfil:', error);
            }

            // Se não encontrou, tentar buscar informações básicas do auth
            if (!profile) {
                const { data: { user } } = await supabase.auth.admin.getUserById(targetUserId);
                // fallback: usar dados mínimos
                profileUser = {
                    id: targetUserId,
                    username: user?.user_metadata?.username || user?.email?.split('@')[0] || 'Usuário',
                    avatar_url: user?.user_metadata?.avatar_url || null,
                    banner_url: null,
                    bio: 'Sem bio.',
                    location: null,
                    website: null,
                    is_admin: false,
                    is_verified: false,
                    followers_count: 0,
                    following_count: 0,
                    contribution_count: 0,
                    created_at: user?.created_at || new Date().toISOString()
                };
            } else {
                profileUser = {
                    id: profile.id,
                    username: profile.username || 'Usuário',
                    avatar_url: profile.avatar_url || null,
                    banner_url: profile.banner_url || null,
                    bio: profile.bio || 'Sem bio.',
                    location: profile.location || null,
                    website: profile.website || null,
                    is_admin: profile.is_admin || false,
                    is_verified: profile.is_verified || false,
                    followers_count: profile.followers_count || 0,
                    following_count: profile.following_count || 0,
                    contribution_count: profile.contribution_count || 0,
                    created_at: profile.created_at || new Date().toISOString()
                };
            }

            renderProfile();
            await loadPosts();
            await loadStats();

        } catch (err) {
            console.error('❌ Erro inesperado:', err);
            showError('Erro ao carregar perfil.');
        }
    }

    // =============================================
    // 4. RENDERIZAR PERFIL NA TELA
    // =============================================
    function renderProfile() {
        const p = profileUser;

        // Topbar
        document.getElementById('topbarName').textContent = p.username;
        document.title = `${p.username} — Amor NeuroDivergente`;

        // Banner
        const bannerImg = document.getElementById('bannerImg');
        const bannerPlaceholder = document.getElementById('bannerPlaceholder');
        if (p.banner_url && p.banner_url.trim() !== '') {
            bannerImg.src = p.banner_url;
            bannerImg.style.display = 'block';
            bannerPlaceholder.style.display = 'none';
        } else {
            bannerImg.style.display = 'none';
            bannerPlaceholder.style.display = 'flex';
        }

        // Avatar
        const avatarImg = document.getElementById('profileAvatar');
        const avatarPlaceholder = document.getElementById('avatarPlaceholder');
        if (p.avatar_url && p.avatar_url.trim() !== '') {
            avatarImg.src = p.avatar_url;
            avatarImg.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
            avatarImg.onerror = () => {
                avatarImg.style.display = 'none';
                avatarPlaceholder.style.display = 'flex';
            };
        } else {
            avatarImg.style.display = 'none';
            avatarPlaceholder.style.display = 'flex';
        }

        // Nome + badges
        document.getElementById('profileName').textContent = p.username;
        document.getElementById('profileHandle').textContent = '@' + p.username.toLowerCase();

        document.getElementById('verifiedBadge').style.display = p.is_verified ? 'inline-flex' : 'none';
        document.getElementById('adminBadge').style.display = p.is_admin ? 'inline-flex' : 'none';

        // Bio
        document.getElementById('profileBio').textContent = p.bio || 'Sem bio.';

        // Localização
        const locEl = document.getElementById('profileLocation');
        if (p.location && p.location.trim() !== '') {
            locEl.style.display = 'inline-flex';
            locEl.querySelector('span').textContent = p.location;
        } else {
            locEl.style.display = 'none';
        }

        // Link
        const linkEl = document.getElementById('profileLink');
        if (p.website && p.website.trim() !== '') {
            linkEl.style.display = 'inline-flex';
            const a = linkEl.querySelector('a');
            a.href = p.website.startsWith('http') ? p.website : 'https://' + p.website;
            a.textContent = p.website.replace(/^https?:\/\//, '');
        } else {
            linkEl.style.display = 'none';
        }

        // Data de entrada
        const joinDate = new Date(p.created_at);
        document.getElementById('profileJoinDate').innerHTML =
            `<i class="fa-regular fa-calendar"></i> Entrou em ${joinDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`;

        // Estatísticas
        document.getElementById('statFollowers').textContent = formatNumber(p.followers_count);
        document.getElementById('statFollowing').textContent = formatNumber(p.following_count);
        document.getElementById('statContrib').textContent = formatNumber(p.contribution_count);

        // Botão de editar só aparece no próprio perfil
        const editBtn = document.getElementById('openEditBtn');
        if (isOwnProfile) {
            editBtn.style.display = 'flex';
        } else {
            editBtn.style.display = 'none';
        }
    }

    // =============================================
    // 5. CARREGAR POSTS DO USUÁRIO
    // =============================================
    async function loadPosts() {
        const container = document.getElementById('profileContent');

        try {
            const { data: posts, error } = await supabase
                .from('posts')
                .select('*')
                .eq('author_id', targetUserId)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Erro ao buscar posts:', error);
                container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>Erro ao carregar posts</p></div>`;
                return;
            }

            // Atualizar contador no topbar
            document.getElementById('topbarPosts').textContent = `${posts.length} posts`;

            if (!posts || posts.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fa-regular fa-feather"></i>
                        <p>Nenhum post ainda</p>
                        <small>Quando este usuário postar, aparecerá aqui.</small>
                    </div>
                `;
                return;
            }

            container.innerHTML = posts.map(post => renderPostCard(post)).join('');

        } catch (err) {
            console.error('❌ Erro inesperado:', err);
        }
    }

    // =============================================
    // 6. RENDERIZAR CARD DE POST
    // =============================================
    function renderPostCard(post) {
        const avatarUrl = post.author_avatar || profileUser.avatar_url || AVATAR_PADRAO;
        const authorName = post.author_name || profileUser.username;

        let mediaHtml = '';
        if (post.image_url && post.image_url.trim() !== '') {
            mediaHtml = `<div class="user-post-image"><img src="${post.image_url}" alt="Imagem" onerror="this.style.display='none'"></div>`;
        } else if (post.video_url && post.video_url.trim() !== '') {
            mediaHtml = `<div class="user-post-image"><video controls preload="metadata" style="width:100%;display:block;"><source src="${post.video_url}" type="video/mp4"></video></div>`;
        }

        return `
            <article class="user-post" data-post-id="${post.id}">
                <div class="user-post-header">
                    <img class="user-post-avatar" src="${avatarUrl}" alt="${escapeHtml(authorName)}"
                         onerror="this.src='${AVATAR_PADRAO}'">
                    <div class="user-post-info">
                        <span class="user-post-name">${escapeHtml(authorName)}</span>
                        <span class="user-post-handle">@${escapeHtml(profileUser.username.toLowerCase())}</span>
                        <span class="user-post-date">· ${formatDate(post.created_at)}</span>
                    </div>
                </div>
                <p class="user-post-text">${escapeHtml(post.content || '')}</p>
                ${mediaHtml}
                <div class="user-post-actions">
                    <button><i class="fa-regular fa-heart"></i> ${post.likes || 0}</button>
                    <button><i class="fa-regular fa-comment"></i> ${post.comment_count || 0}</button>
                    <button><i class="fa-solid fa-retweet"></i> 0</button>
                    <button><i class="fa-regular fa-share-from-square"></i></button>
                </div>
            </article>
        `;
    }

    // =============================================
    // 7. CARREGAR ESTATÍSTICAS
    // =============================================
    async function loadStats() {
        try {
            // Contar posts
            const { count: postsCount } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('author_id', targetUserId)
                .eq('is_active', true);

            // Contar comentários
            const { count: commentsCount } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('author_id', targetUserId)
                .eq('is_active', true);

            const total = (postsCount || 0) + (commentsCount || 0);
            document.getElementById('statContrib').textContent = formatNumber(total);
        } catch (e) {
            console.warn('Erro ao carregar stats:', e);
        }
    }

    // =============================================
    // 8. ABAS
    // =============================================
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.dataset.tab;

            // Por enquanto todas as abas mostram posts
            // Depois você pode separar respostas/reposts/midia/curtidas
            loadPosts();
        });
    });

    // =============================================
    // 9. MODAL DE EDIÇÃO
    // =============================================
    const editOverlay = document.getElementById('editOverlay');
    const openEditBtn = document.getElementById('openEditBtn');
    const closeEditBtn = document.getElementById('closeEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveEditBtn = document.getElementById('saveEditBtn');

    let pendingBannerFile = null;
    let pendingAvatarFile = null;

    openEditBtn?.addEventListener('click', () => {
        if (!isOwnProfile) return;
        populateEditForm();
        editOverlay.removeAttribute('hidden');
    });

    closeEditBtn?.addEventListener('click', () => editOverlay.setAttribute('hidden', ''));
    cancelEditBtn?.addEventListener('click', () => editOverlay.setAttribute('hidden', ''));
    editOverlay?.addEventListener('click', (e) => {
        if (e.target === editOverlay) editOverlay.setAttribute('hidden', '');
    });

    function populateEditForm() {
        const p = profileUser;
        document.getElementById('editName').value = p.username || '';
        document.getElementById('editUsername').value = p.username || '';
        document.getElementById('editBio').value = p.bio || '';
        document.getElementById('editLocation').value = p.location || '';
        document.getElementById('editLink').value = p.website || '';

        // Contador de bio
        updateBioCounter();

        // Banner
        const bannerImg = document.getElementById('editBannerImg');
        const bannerPh = document.getElementById('editBannerPlaceholder');
        if (p.banner_url) {
            bannerImg.src = p.banner_url;
            bannerImg.style.display = 'block';
            bannerPh.style.display = 'none';
        } else {
            bannerImg.style.display = 'none';
            bannerPh.style.display = 'flex';
        }

        // Avatar
        const avatarImg = document.getElementById('editAvatarImg');
        const avatarPh = document.getElementById('editAvatarPlaceholder');
        if (p.avatar_url) {
            avatarImg.src = p.avatar_url;
            avatarImg.style.display = 'block';
            avatarPh.style.display = 'none';
        } else {
            avatarImg.style.display = 'none';
            avatarPh.style.display = 'flex';
        }

        pendingBannerFile = null;
        pendingAvatarFile = null;
    }

    // Contador de bio
    document.getElementById('editBio')?.addEventListener('input', updateBioCounter);
    function updateBioCounter() {
        const bio = document.getElementById('editBio').value || '';
        document.getElementById('bioCounter').textContent = bio.length;
    }

    // Upload de banner
    document.getElementById('editBannerPreview')?.addEventListener('click', () => {
        document.getElementById('editBannerInput').click();
    });

    document.getElementById('editBannerInput')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        pendingBannerFile = file;

        // Preview
        const url = URL.createObjectURL(file);
        const bannerImg = document.getElementById('editBannerImg');
        const bannerPh = document.getElementById('editBannerPlaceholder');
        bannerImg.src = url;
        bannerImg.style.display = 'block';
        bannerPh.style.display = 'none';
    });

    // Upload de avatar
    document.getElementById('editAvatarPreview')?.addEventListener('click', () => {
        document.getElementById('editAvatarInput').click();
    });

    document.getElementById('editAvatarInput')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        pendingAvatarFile = file;

        const url = URL.createObjectURL(file);
        const avatarImg = document.getElementById('editAvatarImg');
        const avatarPh = document.getElementById('editAvatarPlaceholder');
        avatarImg.src = url;
        avatarImg.style.display = 'block';
        avatarPh.style.display = 'none';
    });

    // =============================================
    // 10. SALVAR EDIÇÕES
    // =============================================
    saveEditBtn?.addEventListener('click', async () => {
        saveEditBtn.disabled = true;
        saveEditBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

        try {
            const name = document.getElementById('editName').value.trim();
            const bio = document.getElementById('editBio').value.trim();
            const location = document.getElementById('editLocation').value.trim();
            const website = document.getElementById('editLink').value.trim();

            if (!name) {
                showToast('O nome não pode ficar vazio.', 'error');
                saveEditBtn.disabled = false;
                saveEditBtn.innerHTML = '<i class="fa-solid fa-check"></i> Salvar';
                return;
            }

            // Upload banner se houver
            let bannerUrl = profileUser.banner_url;
            if (pendingBannerFile) {
                const fileExt = pendingBannerFile.name.split('.').pop();
                const fileName = `${currentUser.id}/banner-${Date.now()}.${fileExt}`;
                const { error: upErr } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, pendingBannerFile, { upsert: true });
                if (upErr) {
                    console.warn('Erro ao enviar banner:', upErr);
                } else {
                    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
                    bannerUrl = publicUrl;
                }
            }

            // Upload avatar se houver
            let avatarUrl = profileUser.avatar_url;
            if (pendingAvatarFile) {
                const fileExt = pendingAvatarFile.name.split('.').pop();
                const fileName = `${currentUser.id}/avatar-${Date.now()}.${fileExt}`;
                const { error: upErr } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, pendingAvatarFile, { upsert: true });
                if (upErr) {
                    console.warn('Erro ao enviar avatar:', upErr);
                } else {
                    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
                    avatarUrl = publicUrl;
                }
            }

            // Atualizar perfil no banco
            const updates = {
                username: name,
                bio: bio,
                location: location,
                website: website,
                banner_url: bannerUrl,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString()
            };

            const { error: updateErr } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', currentUser.id);

            if (updateErr) {
             console.error('Erro ao salvar:', JSON.stringify(updateErr, null, 2));
                showToast('Erro ao salvar perfil: ' + updateErr.message, 'error');
                saveEditBtn.disabled = false;
                saveEditBtn.innerHTML = '<i class="fa-solid fa-check"></i> Salvar';
                return;
            }

            // Atualizar estado local
            Object.assign(profileUser, updates);
            renderProfile();
            editOverlay.setAttribute('hidden', '');
            showToast('✅ Perfil atualizado!', 'success');

        } catch (err) {
            console.error('❌ Erro inesperado:', err);
            showToast('Erro inesperado ao salvar.', 'error');
        } finally {
            saveEditBtn.disabled = false;
            saveEditBtn.innerHTML = '<i class="fa-solid fa-check"></i> Salvar';
        }
    });

    // =============================================
    // 11. TOAST
    // =============================================
    function showToast(message, type = 'info') {
        const colors = { success: '#10b981', error: '#ef4444', info: '#1d9bf0' };
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(100px);
            background: ${colors[type]}; color: #fff; padding: 12px 24px; border-radius: 24px;
            font-size: 14px; font-weight: 500; z-index: 99999; transition: all 0.3s;
            box-shadow: 0 8px 30px rgba(0,0,0,0.3); font-family: Inter, sans-serif;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // =============================================
    // 12. HELPERS
    // =============================================
    function escapeHtml(t) {
        if (!t) return '';
        const d = document.createElement('div');
        d.textContent = t;
        return d.innerHTML;
    }

    function formatNumber(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
        return String(n);
    }

    function formatDate(d) {
        const date = new Date(d);
        const diff = (Date.now() - date.getTime()) / 1000;
        if (diff < 60) return 'agora';
        if (diff < 3600) return Math.floor(diff / 60) + 'min';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h';
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }

    function showError(msg) {
        document.getElementById('profileContent').innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>${msg}</p>
            </div>
        `;
    }

    // =============================================
    // 13. INICIALIZAR
    // =============================================
    await loadProfile();

    console.log('✅ Página de perfil carregada!');
});