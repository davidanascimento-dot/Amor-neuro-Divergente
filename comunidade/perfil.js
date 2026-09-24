/* ==========================================================================
   PERFIL.JS — Página de Perfil (layout Reddit + Destaques + Moldura)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    const supabase = window.supabaseClient;
    if (!supabase) {
        console.error('❌ Supabase não inicializado!');
        return;
    }

    const AVATAR_PADRAO = '/img/foto-padrão.jpg';

    let currentUser = null;
    let profileUser = null;
    let isOwnProfile = false;
    let currentTab = 'posts';
    let allPosts = [];        // cache dos posts do usuário
    let allSavedPosts = [];   // cache dos posts salvos

    // =============================================
    // 1. USUÁRIO LOGADO
    // =============================================
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            currentUser = session.user;
            console.log('✅ Usuário logado:', currentUser.email);
        } else {
            console.log('ℹ️ Nenhum usuário logado (modo visitante)');
        }
    } catch (e) {
        console.error('Erro ao verificar sessão:', e);
    }

    // =============================================
    // 2. ID DO PERFIL (via URL ou próprio)
    // =============================================
    const urlParams = new URLSearchParams(window.location.search);
    const profileIdFromUrl = urlParams.get('id');
    const targetUserId = profileIdFromUrl || currentUser?.id;

    if (!targetUserId) {
        showError('Nenhum usuário especificado e você não está logado.');
        return;
    }

    isOwnProfile = currentUser?.id === targetUserId;
    console.log(`👤 Visualizando perfil: ${targetUserId} (próprio: ${isOwnProfile})`);

    // =============================================
    // 3. CARREGAR PERFIL
    // =============================================
    async function loadProfile() {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', targetUserId)
                .maybeSingle();

            if (error) {
                console.error('❌ Erro ao buscar perfil:', error);
            }

            if (!profile) {
                profileUser = {
                    id: targetUserId,
                    username: 'Usuário',
                    avatar_url: null,
                    banner_url: null,
                    bio: 'Sem bio.',
                    location: null,
                    website: null,
                    is_admin: false,
                    is_verified: false,
                    frame: 'none',
                    followers_count: 0,
                    following_count: 0,
                    contribution_count: 0,
                    created_at: new Date().toISOString()
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
                    frame: profile.frame || 'none',
                    followers_count: profile.followers_count || 0,
                    following_count: profile.following_count || 0,
                    contribution_count: profile.contribution_count || 0,
                    created_at: profile.created_at || new Date().toISOString()
                };
            }

            renderProfile();
            await loadPosts();
            await loadStats();
            await loadSavedPosts();
            renderHighlights();

        } catch (err) {
            console.error('❌ Erro inesperado:', err);
            showError('Erro ao carregar perfil.');
        }
    }

    // =============================================
    // 4. RENDERIZAR PERFIL
    // =============================================
    function renderProfile() {
        const p = profileUser;

        // Título da página
        document.title = `${p.username} — Amor NeuroDivergente`;

        // Banner
        const bannerImg = document.getElementById('bannerImg');
        const bannerPlaceholder = document.getElementById('bannerPlaceholder');
        if (bannerImg && bannerPlaceholder) {
            if (p.banner_url && p.banner_url.trim() !== '') {
                bannerImg.src = p.banner_url;
                bannerImg.style.display = 'block';
                bannerPlaceholder.style.display = 'none';
                bannerImg.onerror = () => {
                    bannerImg.style.display = 'none';
                    bannerPlaceholder.style.display = 'flex';
                };
            } else {
                bannerImg.style.display = 'none';
                bannerPlaceholder.style.display = 'flex';
            }
        }

        // Avatar (com cache-buster para forçar atualização)
        const avatarImg = document.getElementById('profileAvatar');
        const avatarPlaceholder = document.getElementById('avatarPlaceholder');
        if (avatarImg && avatarPlaceholder) {
            if (p.avatar_url && p.avatar_url.trim() !== '') {
                const sep = p.avatar_url.includes('?') ? '&' : '?';
                avatarImg.src = p.avatar_url + sep + 'v=' + Date.now();
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
        }

        // ✅ Avatar da nav (header)
        const headerAvatar = document.getElementById('headerAvatar');
        if (headerAvatar) {
            if (p.avatar_url && p.avatar_url.trim() !== '') {
                const sep = p.avatar_url.includes('?') ? '&' : '?';
                headerAvatar.src = p.avatar_url + sep + 'v=' + Date.now();
                headerAvatar.onerror = () => { headerAvatar.src = AVATAR_PADRAO; };
            } else {
                headerAvatar.src = AVATAR_PADRAO;
            }
        }

        // Moldura do avatar
        const heroAvatar = document.getElementById('avatarWrapper');
        if (heroAvatar) {
            heroAvatar.dataset.frame = p.frame || 'none';
        }

        // Nome + handle
        const nameEl = document.getElementById('profileName');
        const handleEl = document.getElementById('profileHandle');
        if (nameEl) nameEl.textContent = p.username;
        if (handleEl) handleEl.textContent = '@' + (p.username || '').toLowerCase();

        // Badges
        const verifiedEl = document.getElementById('verifiedBadge');
        const adminEl = document.getElementById('adminBadge');
        if (verifiedEl) verifiedEl.style.display = p.is_verified ? 'inline-flex' : 'none';
        if (adminEl) adminEl.style.display = p.is_admin ? 'inline-flex' : 'none';

        // Bio
        const bioEl = document.getElementById('profileBio');
        if (bioEl) bioEl.textContent = p.bio || 'Sem bio.';

        // Localização
        const locEl = document.getElementById('profileLocation');
        if (locEl) {
            if (p.location && p.location.trim() !== '') {
                locEl.style.display = 'inline-flex';
                const span = locEl.querySelector('span');
                if (span) span.textContent = p.location;
            } else {
                locEl.style.display = 'none';
            }
        }

        // Link
        const linkEl = document.getElementById('profileLink');
        if (linkEl) {
            if (p.website && p.website.trim() !== '') {
                linkEl.style.display = 'inline-flex';
                const a = linkEl.querySelector('a');
                if (a) {
                    a.href = p.website.startsWith('http') ? p.website : 'https://' + p.website;
                    a.textContent = p.website.replace(/^https?:\/\//, '');
                }
            } else {
                linkEl.style.display = 'none';
            }
        }

        // Data de entrada
        const joinEl = document.getElementById('profileJoinDate');
        if (joinEl) {
            const joinDate = new Date(p.created_at);
            joinEl.innerHTML = `<i class="fa-regular fa-calendar"></i> Entrou em ${joinDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`;
        }

        // Estatísticas
        setText('statFollowers', formatNumber(p.followers_count));
        setText('statFollowing', formatNumber(p.following_count));
        setText('statContrib', formatNumber(p.contribution_count));

        // Botão de editar só no próprio perfil
        const editBtn = document.getElementById('openEditBtn');
        if (editBtn) {
            editBtn.style.display = isOwnProfile ? 'flex' : 'none';
        }
    }

    // =============================================
    // 5. CARREGAR POSTS DO USUÁRIO
    // =============================================
    async function loadPosts() {
        const container = document.getElementById('profileContent');
        if (!container) return;

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

            allPosts = posts || [];
            renderCurrentTab();

        } catch (err) {
            console.error('❌ Erro inesperado:', err);
            container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>Erro ao carregar posts</p></div>`;
        }
    }

  async function loadSavedPosts() {
    console.log('🔍 [loadSavedPosts] Buscando salvos de:', targetUserId);

    try {
        // 1. Buscar os IDs dos posts salvos
        const { data: saved, error: savedErr } = await supabase
            .from('saved_posts')
            .select('post_id, created_at')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (savedErr) {
            console.warn('⚠️ [loadSavedPosts] Erro em saved_posts:', savedErr);
            console.warn('   Código:', savedErr.code, '| Mensagem:', savedErr.message);
            console.warn('   → Se for "relation does not exist", crie a tabela saved_posts.');
            console.warn('   → Se for "permission denied", ajuste as políticas RLS.');
            allSavedPosts = [];
            return;
        }

        console.log('📦 [loadSavedPosts] Registros encontrados:', saved?.length || 0);

        if (!saved || saved.length === 0) {
            console.log('ℹ️ Nenhum post salvo por este usuário.');
            allSavedPosts = [];
            return;
        }

        const postIds = saved.map(s => s.post_id).filter(Boolean);
        console.log('🔑 [loadSavedPosts] IDs dos posts salvos:', postIds);

        // 2. Buscar os posts completos
        const { data: posts, error: postsErr } = await supabase
            .from('posts')
            .select('*')
            .in('id', postIds)
            .eq('is_active', true);

        if (postsErr) {
            console.warn('⚠️ [loadSavedPosts] Erro ao buscar posts:', postsErr);
            allSavedPosts = [];
            return;
        }

        console.log('📄 [loadSavedPosts] Posts carregados:', posts?.length || 0);

        // 3. Reordenar conforme a ordem dos saved
        const postsMap = new Map((posts || []).map(p => [p.id, p]));
        allSavedPosts = postIds
            .map(id => postsMap.get(id))
            .filter(Boolean);

        console.log(`⭐ [loadSavedPosts] ${allSavedPosts.length} posts salvos prontos`);
    } catch (e) {
        console.warn('❌ [loadSavedPosts] Exceção:', e);
        allSavedPosts = [];
    }
}
       // =============================================
    // 5.2. RENDERIZAR DESTAQUES DA COMUNIDADE
    // =============================================
    function renderHighlights() {
        const scroll = document.getElementById('highlightsScroll');
        if (!scroll) return;

        if (!allSavedPosts || allSavedPosts.length === 0) {
            scroll.innerHTML = `<div class="highlights-empty">Nenhum destaque ainda — salve posts no fórum para vê-los aqui.</div>`;
            return;
        }

        scroll.innerHTML = allSavedPosts.map(post => {
            const thumbUrl = post.image_url || null;
            const content = post.content || '';
            const title = content.substring(0, 80) + (content.length > 80 ? '…' : '');
            const avatar = post.author_avatar || profileUser.avatar_url || AVATAR_PADRAO;
            const authorName = post.author_name || profileUser.username;

            return `
                <div class="highlight-card" data-post-id="${post.id}" onclick="window.openHighlight('${post.id}')">
                    <div class="highlight-card-thumb">
                        ${thumbUrl
                            ? `<img src="${thumbUrl}" alt="" onerror="this.style.display='none';this.parentElement.innerHTML='<div class=&quot;highlight-card-thumb-placeholder&quot;><i class=&quot;fa-regular fa-image&quot;></i></div>';">`
                            : `<div class="highlight-card-thumb-placeholder"><i class="fa-regular fa-image"></i></div>`}
                    </div>
                    <div class="highlight-card-body">
                        <div class="highlight-card-title">${escapeHtml(title)}</div>
                        <div class="highlight-card-footer">
                            <img class="highlight-card-avatar" src="${avatar}" alt="" onerror="this.src='${AVATAR_PADRAO}'">
                            <span>@${escapeHtml((authorName || '').toLowerCase())}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Abrir o post clicado no fórum
    window.openHighlight = function(postId) {
        window.location.href = `/comunidade/comunidade.html#post-${postId}`;
    };

    // =============================================
    // 6. RENDERIZAR ABA ATUAL
    // =============================================
    function renderCurrentTab() {
        const container = document.getElementById('profileContent');
        if (!container) return;

        let filtered = allPosts;

        if (currentTab === 'midia') {
            filtered = allPosts.filter(p =>
                (p.image_url && p.image_url.trim()) ||
                (p.video_url && p.video_url.trim())
            );
        } else if (currentTab === 'salvos') {
            filtered = allSavedPosts;
        } else if (currentTab === 'respostas') {
            filtered = [];
        } else if (currentTab === 'curtidas') {
            filtered = [];
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-feather"></i>
                    <p>Nada por aqui ainda</p>
                    <small>${emptyMessageForTab(currentTab)}</small>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(post => renderPostCard(post)).join('');
    }

    function emptyMessageForTab(tab) {
        switch (tab) {
            case 'posts': return 'Quando este usuário postar, aparecerá aqui.';
            case 'respostas': return 'Nenhuma resposta ainda.';
            case 'midia': return 'Nenhuma mídia publicada ainda.';
            case 'curtidas': return 'Nenhuma curtida ainda.';
            case 'salvos': return 'Nenhum post salvo ainda — salve no fórum para vê-los aqui.';
            default: return '';
        }
    }

    // =============================================
    // 7. CARD DE POST
    // =============================================
    function renderPostCard(post) {
        const avatarUrl = post.author_avatar || profileUser.avatar_url || AVATAR_PADRAO;
        const authorName = post.author_name || profileUser.username;
        const authorHandle = (post.author_name || profileUser.username || '').toLowerCase();

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
                        <span class="user-post-handle">@${escapeHtml(authorHandle)}</span>
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
    // 8. ESTATÍSTICAS
    // =============================================
    async function loadStats() {
        try {
            const { count: postsCount } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('author_id', targetUserId)
                .eq('is_active', true);

            const { count: commentsCount } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('author_id', targetUserId)
                .eq('is_active', true);

            const total = (postsCount || 0) + (commentsCount || 0);
            setText('statContrib', formatNumber(total));
        } catch (e) {
            console.warn('Erro ao carregar stats:', e);
        }
    }

    // =============================================
    // 9. ABAS INTERNAS
    // =============================================
    document.querySelectorAll('.profile-inner-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.profile-inner-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.dataset.tab || 'posts';
            renderCurrentTab();
        });
    });

    // =============================================
    // 10. MODAL DE EDIÇÃO
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
        editOverlay?.removeAttribute('hidden');
    });

    closeEditBtn?.addEventListener('click', () => editOverlay?.setAttribute('hidden', ''));
    cancelEditBtn?.addEventListener('click', () => editOverlay?.setAttribute('hidden', ''));
    editOverlay?.addEventListener('click', (e) => {
        if (e.target === editOverlay) editOverlay.setAttribute('hidden', '');
    });

    function populateEditForm() {
        const p = profileUser;
        setValue('editName', p.username || '');
        setValue('editUsername', p.username || '');
        setValue('editBio', p.bio || '');
        setValue('editLocation', p.location || '');
        setValue('editLink', p.website || '');

        updateBioCounter();

        // Banner preview
        const bannerImg = document.getElementById('editBannerImg');
        const bannerPh = document.getElementById('editBannerPlaceholder');
        if (bannerImg && bannerPh) {
            if (p.banner_url) {
                bannerImg.src = p.banner_url;
                bannerImg.style.display = 'block';
                bannerPh.style.display = 'none';
            } else {
                bannerImg.style.display = 'none';
                bannerPh.style.display = 'flex';
            }
        }

        // Avatar preview
        const avatarImg = document.getElementById('editAvatarImg');
        const avatarPh = document.getElementById('editAvatarPlaceholder');
        if (avatarImg && avatarPh) {
            if (p.avatar_url) {
                avatarImg.src = p.avatar_url;
                avatarImg.style.display = 'block';
                avatarPh.style.display = 'none';
            } else {
                avatarImg.style.display = 'none';
                avatarPh.style.display = 'flex';
            }
        }

        // Frame preview
        const frame = p.frame || 'none';
        const frameInput = document.getElementById('editFrame');
        if (frameInput) frameInput.value = frame;
        document.querySelectorAll('.frame-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.frame === frame);
        });
        const avatarPreview = document.getElementById('editAvatarPreview');
        if (avatarPreview) avatarPreview.dataset.frame = frame;

        pendingBannerFile = null;
        pendingAvatarFile = null;
    }

    // Contador de bio
    document.getElementById('editBio')?.addEventListener('input', updateBioCounter);
    function updateBioCounter() {
        const bioInput = document.getElementById('editBio');
        const counter = document.getElementById('bioCounter');
        if (bioInput && counter) {
            counter.textContent = (bioInput.value || '').length;
        }
    }

    // Upload banner
    document.getElementById('editBannerPreview')?.addEventListener('click', () => {
        document.getElementById('editBannerInput')?.click();
    });

    document.getElementById('editBannerInput')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        pendingBannerFile = file;

        const url = URL.createObjectURL(file);
        const bannerImg = document.getElementById('editBannerImg');
        const bannerPh = document.getElementById('editBannerPlaceholder');
        if (bannerImg && bannerPh) {
            bannerImg.src = url;
            bannerImg.style.display = 'block';
            bannerPh.style.display = 'none';
        }
    });

    // Upload avatar
    document.getElementById('editAvatarPreview')?.addEventListener('click', () => {
        document.getElementById('editAvatarInput')?.click();
    });

    document.getElementById('editAvatarInput')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        pendingAvatarFile = file;

        const url = URL.createObjectURL(file);
        const avatarImg = document.getElementById('editAvatarImg');
        const avatarPh = document.getElementById('editAvatarPlaceholder');
        if (avatarImg && avatarPh) {
            avatarImg.src = url;
            avatarImg.style.display = 'block';
            avatarPh.style.display = 'none';
        }
    });

    // ✅ Picker de moldura
    document.querySelectorAll('.frame-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.frame-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            const frame = opt.dataset.frame;
            const frameInput = document.getElementById('editFrame');
            if (frameInput) frameInput.value = frame;
            const avatarPreview = document.getElementById('editAvatarPreview');
            if (avatarPreview) avatarPreview.dataset.frame = frame;
            const heroAvatar = document.getElementById('avatarWrapper');
            if (heroAvatar) heroAvatar.dataset.frame = frame;
        });
    });

    // =============================================
    // 11. SALVAR EDIÇÕES
    // =============================================
    saveEditBtn?.addEventListener('click', async () => {
        saveEditBtn.disabled = true;
        saveEditBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

        try {
            const name = document.getElementById('editName')?.value.trim() || '';
            const bio = document.getElementById('editBio')?.value.trim() || '';
            const location = document.getElementById('editLocation')?.value.trim() || '';
            const website = document.getElementById('editLink')?.value.trim() || '';
            const frame = document.getElementById('editFrame')?.value || 'none';

            if (!name) {
                showToast('O nome não pode ficar vazio.', 'error');
                saveEditBtn.disabled = false;
                saveEditBtn.innerHTML = '<i class="fa-solid fa-check"></i> Salvar';
                return;
            }

            // Upload banner
            let bannerUrl = profileUser.banner_url;
            if (pendingBannerFile) {
                const fileExt = pendingBannerFile.name.split('.').pop();
                const fileName = `${currentUser.id}/banner-${Date.now()}.${fileExt}`;
                const { error: upErr } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, pendingBannerFile, { upsert: true, cacheControl: '3600' });
                if (upErr) {
                    console.warn('Erro ao enviar banner:', upErr);
                    showToast('Erro ao enviar banner: ' + upErr.message, 'error');
                } else {
                    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
                    bannerUrl = publicUrl;
                }
            }

            // Upload avatar
            let avatarUrl = profileUser.avatar_url;
            if (pendingAvatarFile) {
                const fileExt = pendingAvatarFile.name.split('.').pop();
                const fileName = `${currentUser.id}/avatar-${Date.now()}.${fileExt}`;
                const { error: upErr } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, pendingAvatarFile, { upsert: true, cacheControl: '3600' });
                if (upErr) {
                    console.warn('Erro ao enviar avatar:', upErr);
                    showToast('Erro ao enviar avatar: ' + upErr.message, 'error');
                } else {
                    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
                    avatarUrl = publicUrl;
                }
            }

            // Atualizar perfil
            const updates = {
                username: name,
                bio: bio,
                location: location,
                website: website,
                banner_url: bannerUrl,
                avatar_url: avatarUrl,
                frame: frame,
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
            editOverlay?.setAttribute('hidden', '');
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
    // 12. BOTÃO COMPARTILHAR
    // =============================================
    document.getElementById('shareProfileBtn')?.addEventListener('click', () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({ title: `Perfil de ${profileUser.username}`, url }).catch(() => {});
        } else {
            navigator.clipboard.writeText(url)
                .then(() => showToast('🔗 Link copiado!', 'success'))
                .catch(() => showToast('Erro ao copiar link', 'error'));
        }
    });

    // =============================================
    // 13. TOAST
    // =============================================
    function showToast(message, type = 'info') {
        const colors = { success: '#10b981', error: '#ef4444', info: '#1d9bf0' };
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(100px);
            background: ${colors[type] || colors.info}; color: #fff; padding: 12px 24px; border-radius: 24px;
            font-size: 14px; font-weight: 500; z-index: 99999; transition: all 0.3s;
            box-shadow: 0 8px 30px rgba(0,0,0,0.3); font-family: Inter, sans-serif;
            max-width: 90vw; text-align: center;
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
    // 14. HELPERS
    // =============================================
    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function setValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value;
    }

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
        const c = document.getElementById('profileContent');
        if (c) {
            c.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p>${msg}</p>
                </div>
            `;
        }
    }

    // =============================================
    // 15. INICIALIZAR
    // =============================================
    await loadProfile();

    console.log('✅ Página de perfil carregada!');
});