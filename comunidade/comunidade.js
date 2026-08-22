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
    // AUXILIARES
    // =============================================
    const body = document.body;
    const COMMUNITY_CHAT_ID = '00000000-0000-0000-0000-000000000001';

    // CONFIGURAÇÕES DE VÍDEO
    const VIDEO_BUCKET = 'videos';
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
    const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

    // CONFIGURAÇÕES DE IMAGEM PARA GRUPOS
    const IMAGE_BUCKET = 'group-images';
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

    function getUserAvatar() {
        return localStorage.getItem('userAvatar') || AVATAR_PADRAO;
    }

    function getUserName() {
        return localStorage.getItem('userName') || currentUser?.email?.split('@')[0] || 'Usuário';
    }

    function stringToColor(str) {
        if (!str) return '#8b5cf6';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#14b8a6'];
        return colors[Math.abs(hash) % colors.length];
    }

    // =============================================
    // 1. SIDEBAR TOGGLE (Mobile/Desktop)
    // =============================================
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');

    function toggleSidebar() {
        if (!sidebar) return;
        const isOpen = sidebar.classList.toggle('open');
        if (sidebarOverlay) {
            sidebarOverlay.classList.toggle('active', isOpen);
        }
        if (sidebarToggleBtn) {
            sidebarToggleBtn.setAttribute('aria-expanded', isOpen);
        }
    }

    function closeSidebar() {
        if (sidebar) {
            sidebar.classList.remove('open');
            if (sidebarOverlay) {
                sidebarOverlay.classList.remove('active');
            }
            if (sidebarToggleBtn) {
                sidebarToggleBtn.setAttribute('aria-expanded', 'false');
            }
        }
    }

    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });

    // =============================================
    // 2. SINCRONIZAÇÃO DE PERFIL
    // =============================================
    function syncProfileFromStorage() {
        const savedName = localStorage.getItem('userName');
        const savedEmail = localStorage.getItem('userEmail');
        const savedAvatar = getUserAvatar();
        
        const headerAvatar = document.getElementById('headerAvatar');
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        const sidebarUserName = document.getElementById('sidebarUserName');
        const sidebarUserEmail = document.getElementById('sidebarUserEmail');
        const quickPostAvatar = document.querySelector('.quick-post-avatar');
        const postModalAvatar = document.getElementById('postModalAvatar');
        
        const avatars = [headerAvatar, sidebarAvatar, quickPostAvatar, postModalAvatar];
        avatars.forEach(avatar => {
            if (avatar) {
                avatar.src = savedAvatar;
                avatar.onerror = () => { avatar.src = AVATAR_PADRAO; };
            }
        });
        
        if (savedName && sidebarUserName) sidebarUserName.textContent = savedName;
        if (savedEmail && sidebarUserEmail) sidebarUserEmail.textContent = savedEmail;
    }

    syncProfileFromStorage();

    window.addEventListener('storage', (e) => {
        if (e.key === 'userAvatar' || e.key === 'userName' || e.key === 'userEmail') {
            syncProfileFromStorage();
        }
    });

    // =============================================
    // 3. PERFIL COLAPSÁVEL (Sidebar)
    // =============================================
    const profileToggle = document.getElementById('profileToggle');
    const profileDetail = document.getElementById('profileDetail');
    if (profileToggle && profileDetail) {
        profileToggle.addEventListener('click', (e) => {
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
    }

    // =============================================
    // 4. TOAST
    // =============================================
    function showToast(message, type = 'info', duration = 3000) {
        const existing = document.querySelector('.toast-msg-custom');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'toast-msg-custom';
        toast.textContent = message;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#7c3aed',
            warning: '#f59e0b'
        };
        
        toast.style.backgroundColor = colors[type] || colors.info;
        toast.style.position = 'fixed';
        toast.style.bottom = '28px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        toast.style.color = '#fff';
        toast.style.padding = '14px 32px';
        toast.style.borderRadius = '30px';
        toast.style.fontSize = '14px';
        toast.style.fontWeight = '500';
        toast.style.zIndex = '9999';
        toast.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)';
        toast.style.transition = 'all 0.4s ease';
        toast.style.opacity = '0';
        toast.style.pointerEvents = 'none';
        toast.style.maxWidth = '90vw';
        toast.style.textAlign = 'center';
        
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }

    // =============================================
    // 5. LOGOUT
    // =============================================
    document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('Tem certeza que deseja sair?')) {
            await supabase.auth.signOut();
            localStorage.clear();
            showToast('Até logo! 💜', 'success');
            setTimeout(() => { window.location.href = '/login/login.html'; }, 800);
        }
    });

    // =============================================
    // 6. BANCO DE DADOS (Supabase)
    // =============================================
    async function loadPosts() {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(50);
        if (error) {
            console.error('Erro ao carregar posts:', error.message);
            return [];
        }
        return data || [];
    }

    async function loadComments(postId) {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true })
            .limit(20);
        if (error) {
            console.error('Erro ao carregar comentários:', error.message);
            return [];
        }
        return data || [];
    }

    async function loadGroups() {
        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        if (error) {
            console.error('Erro ao carregar grupos:', error.message);
            return [];
        }
        return data || [];
    }

    async function loadEvents() {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('is_active', true)
            .gte('date', new Date().toISOString())
            .order('date', { ascending: true })
            .limit(20);
        if (error) {
            console.error('Erro ao carregar eventos:', error.message);
            return [];
        }
        return data || [];
    }

    function escapeHtml(t) {
        const d = document.createElement('div');
        d.textContent = t;
        return d.innerHTML;
    }

    function formatDate(d) {
        return new Date(d).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatChatTime(d) {
        return new Date(d).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatEventDate(d) {
        return new Date(d).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // =============================================
    // 7. UPLOAD DE IMAGEM PARA GRUPOS
    // =============================================
    async function uploadGroupImage(file) {
        if (!currentUser) {
            showToast('Faça login para enviar imagens', 'error');
            return null;
        }
        
        if (file.size > MAX_IMAGE_SIZE) {
            showToast(`Imagem muito grande! Máx ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`, 'error');
            return null;
        }
        
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            showToast('Formato não suportado. Use JPG, PNG, GIF, WebP ou SVG', 'error');
            return null;
        }
        
        showToast('📤 Enviando imagem...', 'info', 5000);
        
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `groups/${currentUser.id}/${Date.now()}.${fileExt}`;
            
            const { data, error } = await supabase.storage
                .from(IMAGE_BUCKET)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });
                
            if (error) {
                showToast('Erro ao enviar imagem: ' + error.message, 'error');
                return null;
            }
            
            const { data: { publicUrl } } = supabase.storage
                .from(IMAGE_BUCKET)
                .getPublicUrl(fileName);
                
            showToast('✅ Imagem enviada com sucesso! 🖼️', 'success');
            return publicUrl;
            
        } catch (error) {
            console.error('❌ Erro inesperado:', error);
            showToast('Erro ao enviar imagem', 'error');
            return null;
        }
    }

    // =============================================
    // 8. UPLOAD DE VÍDEO
    // =============================================
    async function uploadVideo(file) {
        if (!currentUser) {
            showToast('Faça login para enviar vídeos', 'error');
            return null;
        }
        
        if (file.size > MAX_VIDEO_SIZE) {
            showToast(`Vídeo muito grande! Máx ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`, 'error');
            return null;
        }
        
        if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
            showToast('Formato não suportado. Use MP4, WebM ou OGG', 'error');
            return null;
        }
        
        showToast('📤 Enviando vídeo...', 'info', 5000);
        
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
            
            const { data, error } = await supabase.storage
                .from(VIDEO_BUCKET)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });
                
            if (error) {
                showToast('Erro ao enviar vídeo: ' + error.message, 'error');
                return null;
            }
            
            const { data: { publicUrl } } = supabase.storage
                .from(VIDEO_BUCKET)
                .getPublicUrl(fileName);
                
            showToast('✅ Vídeo enviado com sucesso! 🎬', 'success');
            return publicUrl;
            
        } catch (error) {
            console.error('❌ Erro inesperado:', error);
            showToast('Erro ao enviar vídeo', 'error');
            return null;
        }
    }

    function openFullscreenModal(videoUrl) {
        const modal = document.createElement('div');
        modal.className = 'video-fullscreen-modal';
        modal.innerHTML = `
            <div class="video-fullscreen-overlay" onclick="if(event.target === this) this.parentElement.remove()">
                <button class="video-fullscreen-close" onclick="this.closest('.video-fullscreen-modal').remove()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <video controls autoplay style="width:90%;max-width:900px;max-height:90vh;border-radius:12px;background:#000;">
                    <source src="${videoUrl}" type="video/mp4">
                    <source src="${videoUrl}" type="video/webm">
                    Seu navegador não suporta vídeos.
                </video>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') modal.remove();
        });
        modal.focus();
    }

    // =============================================
    // 9. TABS (Navegação Full-Screen)
    // =============================================
    const mainTabs = document.querySelectorAll('.main-tab');
    const tabScreens = document.querySelectorAll('.tab-screen');

    function switchTab(tabId) {
        mainTabs.forEach(tab => {
            const isActive = tab.dataset.tab === tabId;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
        });

        tabScreens.forEach(screen => {
            const isActive = screen.id === `screen-${tabId}`;
            screen.classList.toggle('active', isActive);
        });

        switch(tabId) {
            case 'forum':
                renderPosts();
                break;
            case 'grupos':
                renderGroups();
                break;
            case 'eventos':
                renderEvents();
                break;
            case 'conversa':
                loadChatMessages();
                break;
        }
    }

    mainTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            switchTab(tabId);
        });
    });

    // =============================================
    // 10. RENDER POSTS
    // =============================================
    let likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');

    async function handleLike(postId, likesCount) {
        if (!currentUser) {
            showToast('Faça login para curtir', 'error');
            return;
        }
        
        const isLiked = likedPosts[postId];
        const newLikes = isLiked ? Math.max(0, likesCount - 1) : likesCount + 1;
        
        likedPosts[postId] = !isLiked;
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
        
        const { error } = await supabase
            .from('posts')
            .update({ likes: newLikes })
            .eq('id', postId);
            
        if (error) {
            likedPosts[postId] = isLiked;
            localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
            showToast('Erro ao curtir', 'error');
        }
        
        await renderPosts();
    }

    async function loadAndShowComments(postId) {
        const comments = await loadComments(postId);
        const list = document.querySelector(`#comments-${postId} .comments-list`);
        if (!list) return;
        
        if (comments.length === 0) {
            list.innerHTML = '<p style="color:#888;font-size:13px;padding:8px;">Nenhum comentário ainda. Seja o primeiro! 💬</p>';
        } else {
            list.innerHTML = comments.map(c => `
                <div class="comment-item">
                    <strong>${escapeHtml(c.author_name || 'Usuário')}</strong>
                    <p>${escapeHtml(c.content)}</p>
                    <small>${formatDate(c.created_at)}</small>
                </div>
            `).join('');
        }
    }

    function setupPostEvents() {
        document.querySelectorAll('.like-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const postId = newBtn.dataset.postId;
                const likesText = newBtn.textContent.trim();
                const likes = parseInt(likesText.match(/\d+/)?.[0] || '0');
                handleLike(postId, likes);
            });
        });
        
        document.querySelectorAll('.comment-toggle-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const postId = newBtn.dataset.postId;
                const section = document.getElementById(`comments-${postId}`);
                if (section) {
                    const isHidden = section.style.display === 'none' || section.style.display === '';
                    if (isHidden) {
                        section.style.display = 'block';
                        await loadAndShowComments(postId);
                    } else {
                        section.style.display = 'none';
                    }
                }
            });
        });
        
        document.querySelectorAll('.submit-comment-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const postId = newBtn.dataset.postId;
                const input = document.getElementById(`comment-input-${postId}`);
                const text = input?.value.trim();
                if (!text) return showToast('Digite um comentário', 'error');
                if (!currentUser) return showToast('Faça login para comentar', 'error');
                
                const { error } = await supabase
                    .from('comments')
                    .insert({
                        post_id: postId,
                        author_id: currentUser.id,
                        author_name: getUserName(),
                        content: text,
                        is_active: true
                    });
                    
                if (error) {
                    showToast('Erro ao comentar: ' + error.message, 'error');
                } else {
                    input.value = '';
                    showToast('Comentário adicionado! 💬', 'success');
                    await loadAndShowComments(postId);
                }
            });
        });

        document.querySelectorAll('.video-fullscreen-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const container = this.closest('.post-video-container');
                const video = container?.querySelector('video');
                if (video) {
                    openFullscreenModal(video.src);
                }
            });
        });
    }

    async function renderPosts() {
        const feed = document.getElementById('postsFeed');
        if (!feed) return;
        
        const posts = await loadPosts();
        
        if (!posts || posts.length === 0) {
            feed.innerHTML = `
                <div class="no-content" style="text-align:center;padding:60px 20px;color:#888;">
                    <i class="fa-solid fa-feather" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></i>
                    <p style="font-size:16px;font-weight:500;">Nenhum post ainda</p>
                    <p style="font-size:14px;color:#aaa;">Seja o primeiro a compartilhar algo com a comunidade!</p>
                </div>
            `;
            return;
        }
        
        const userAvatar = getUserAvatar();
        
        feed.innerHTML = posts.map(p => {
            const isLiked = likedPosts[p.id];
            const postAvatar = p.author_avatar || userAvatar;
            const authorInitial = (p.author_name || 'U').charAt(0).toUpperCase();
            
            let videoHtml = '';
            if (p.video_url && p.video_url.trim() !== '' && p.video_url !== 'null') {
                videoHtml = `
                    <div class="post-video-container">
                        <video controls preload="metadata" playsinline>
                            <source src="${p.video_url}" type="video/mp4">
                            <source src="${p.video_url}" type="video/webm">
                            <p>Seu navegador não suporta vídeos.</p>
                        </video>
                        <button class="video-fullscreen-btn" title="Tela cheia">
                            <i class="fa-solid fa-expand"></i>
                        </button>
                    </div>
                `;
            }
            
            return `
            <div class="post-card" data-post-id="${p.id}">
                <div class="post-header">
                    <div class="post-author-avatar-wrapper">
                        <img src="${postAvatar}" class="post-author-avatar" 
                             onerror="this.style.display='none';this.parentElement.querySelector('.post-author-fallback').style.display='flex';" 
                             alt="${escapeHtml(p.author_name || 'U')}">
                        <div class="post-author-fallback" style="background:${stringToColor(p.author_id || p.id)};">${authorInitial}</div>
                    </div>
                    <div class="post-body">
                        <div class="post-author-info">
                            <span class="post-author-name">${escapeHtml(p.author_name || 'Usuário')}</span>
                            <span class="post-author-handle">@${escapeHtml((p.author_name || 'usuario').toLowerCase().replace(/\s/g, ''))}</span>
                            <span class="post-date">· ${formatDate(p.created_at)}</span>
                        </div>
                        <p class="post-text">${escapeHtml(p.content)}</p>
                        ${videoHtml}
                        <div class="post-actions">
                            <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${p.id}">
                                <i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>
                                <span class="count">${p.likes || 0}</span>
                            </button>
                            <button class="action-btn comment-toggle-btn" data-post-id="${p.id}">
                                <i class="fa-regular fa-comment"></i>
                                <span class="count">${p.comment_count || 0}</span>
                            </button>
                            <button class="action-btn" onclick="showToast('Compartilhar disponível em breve!', 'info')">
                                <i class="fa-regular fa-share-from-square"></i>
                            </button>
                        </div>
                        <div class="comments-section" id="comments-${p.id}" style="display:none;">
                            <div class="comments-list">
                                <p style="color:#888;font-size:13px;padding:8px;">Carregando...</p>
                            </div>
                            <div class="add-comment">
                                <input placeholder="Escreva um comentário..." id="comment-input-${p.id}">
                                <button class="submit-comment-btn" data-post-id="${p.id}">Enviar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');
        
        setupPostEvents();
    }

    // =============================================
    // 11. NOVO POST (Modal)
    // =============================================
    const postModal = document.getElementById('postModal');
    const postModalOverlay = document.getElementById('postModalOverlay');
    const closePostModalBtn = document.getElementById('closeModalBtn');
    const submitPostBtn = document.getElementById('submitPostBtn');
    const postContentInput = document.getElementById('postContentInput');

    const videoUploadInput = document.createElement('input');
    videoUploadInput.type = 'file';
    videoUploadInput.accept = 'video/*';
    videoUploadInput.id = 'videoUploadInput';
    videoUploadInput.style.display = 'none';
    document.body.appendChild(videoUploadInput);

    document.querySelectorAll('#openPostModalBtn, .btn-create-post').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!currentUser) {
                    showToast('Faça login para criar um post', 'error');
                    return;
                }
                if (postModalOverlay) {
                    postModalOverlay.removeAttribute('hidden');
                    if (postContentInput) {
                        postContentInput.value = '';
                        setTimeout(() => postContentInput.focus(), 100);
                    }
                }
            });
        }
    });

    document.getElementById('quickPostBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        const input = document.getElementById('quickPostInput');
        if (input && input.value.trim()) {
            if (!currentUser) {
                showToast('Faça login para postar', 'error');
                return;
            }
            if (postContentInput) {
                postContentInput.value = input.value;
            }
            if (postModalOverlay) {
                postModalOverlay.removeAttribute('hidden');
                setTimeout(() => postContentInput?.focus(), 100);
            }
        } else {
            showToast('Digite algo para postar', 'error');
        }
    });

    closePostModalBtn?.addEventListener('click', () => {
        if (postModalOverlay) postModalOverlay.setAttribute('hidden', '');
        const preview = document.querySelector('.video-preview-container');
        if (preview) preview.remove();
    });

    postModalOverlay?.addEventListener('click', (e) => {
        if (e.target === postModalOverlay) {
            postModalOverlay.setAttribute('hidden', '');
        }
    });

    document.getElementById('postMediaBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        videoUploadInput.click();
    });

    videoUploadInput.addEventListener('change', async function(e) {
        const file = this.files[0];
        if (!file) return;
        
        this.disabled = true;
        const videoUrl = await uploadVideo(file);
        this.disabled = false;
        this.value = '';
        
        if (videoUrl && postContentInput) {
            const currentText = postContentInput.value;
            postContentInput.value = currentText + `\n📹 Vídeo: ${videoUrl}\n`;
            showToast('✅ Vídeo pronto para postar! 🎬', 'success');
        }
    });

    submitPostBtn?.addEventListener('click', async () => {
        let txt = postContentInput?.value.trim();
        if (!txt) return showToast('Digite algo para postar', 'error');
        if (!currentUser) return showToast('Faça login', 'error');
        
        const videoMatch = txt.match(/📹 Vídeo: (https?:\/\/[^\s]+)/);
        const videoUrl = videoMatch ? videoMatch[1] : null;
        
        let cleanText = txt;
        if (videoUrl) {
            cleanText = txt.replace(/📹 Vídeo: https?:\/\/[^\s]+\s*/, '').trim();
        }
        
        if (!cleanText && videoUrl) {
            cleanText = '🎬 Vídeo compartilhado';
        }
        
        submitPostBtn.disabled = true;
        submitPostBtn.textContent = 'Publicando...';
        
        const { error } = await supabase
            .from('posts')
            .insert({
                author_id: currentUser.id,
                author_name: getUserName(),
                author_avatar: getUserAvatar(),
                content: cleanText,
                video_url: videoUrl,
                tag: '# Comunidade',
                is_active: true
            });
            
        submitPostBtn.disabled = false;
        submitPostBtn.textContent = 'Postar';
        
        if (error) {
            showToast('Erro ao publicar: ' + error.message, 'error');
        } else {
            if (postModalOverlay) postModalOverlay.setAttribute('hidden', '');
            showToast('Post publicado! 🎉', 'success');
            await renderPosts();
            const quickInput = document.getElementById('quickPostInput');
            if (quickInput) quickInput.value = '';
            switchTab('forum');
        }
    });

   // =============================================
// 12. GRUPOS - MOSTRAR GRUPOS PÚBLICOS E PRIVADOS QUE O USUÁRIO ENTROU
// =============================================
async function renderGroups() {
    const grid = document.getElementById('groupsGrid');
    if (!grid) return;
    
    // Carregar TODOS os grupos
    const allGroups = await loadGroups();
    
    // Buscar grupos que o usuário atual é membro
    const { data: memberships, error: membershipError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', currentUser?.id);

    if (membershipError) {
        console.warn('⚠️ Erro ao buscar membros:', membershipError);
    }

    const memberGroupIds = memberships?.map(m => m.group_id) || [];

    // FILTRO CORRIGIDO: Mostrar grupos públicos OU grupos que o usuário é membro
    const userGroups = allGroups.filter(g => {
        // SEMPRE mostrar o grupo Geral
        if (g.name === 'Geral' || g.id === COMMUNITY_CHAT_ID) return true;
        
        // Mostrar grupos PÚBLICOS (is_private = false)
        if (g.is_private === false) return true;
        
        // Mostrar grupos privados que o usuário é membro
        return memberGroupIds.includes(g.id);
    });

    if (!userGroups || userGroups.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-users fa-3x"></i>
                <h4>Nenhum grupo disponível</h4>
                <p>Crie um grupo ou entre em um existente!</p>
                <button class="btn-create-group" onclick="window.openCreateGroupModal()">
                    <i class="fa-solid fa-plus"></i> Criar Grupo
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = userGroups.map(g => {
        const isAdmin = g.is_admin === true;
        const isPrivate = g.is_private === true;
        const memberCount = g.members || 0;
        const categoryName = g.category || 'Geral';
        const imageUrl = g.image_url || '/img/grupo-padrao.png';
        const isMember = memberGroupIds.includes(g.id) || g.name === 'Geral';
        const initial = (g.name || 'G').charAt(0).toUpperCase();
        const colors = ['#7c3aed', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#14b8a6'];
        const bgColor = colors[Math.abs((g.id || '0').charCodeAt(0)) % colors.length];
        
        return `
        <div class="group-card" data-group-id="${g.id}">
            <div class="group-card-image" style="background:${bgColor}; display:flex; align-items:center; justify-content:center; min-height:120px;">
                ${imageUrl && imageUrl !== '/img/grupo-padrao.png' ? `<img src="${imageUrl}" alt="${g.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';">` : ''}
                <span style="color:white;font-size:44px;font-weight:700;text-shadow:0 2px 8px rgba(0,0,0,0.2);">${initial}</span>
            </div>
            <div class="group-card-body">
                <div class="group-card-title">
                    ${g.name}
                    ${isAdmin ? '<span class="admin-badge">Admin</span>' : ''}
                    ${isPrivate ? '<i class="fa-solid fa-lock" style="color: var(--text-muted); font-size: 14px;"></i>' : '<span style="font-size:10px;color:#10b981;background:rgba(16,185,129,0.1);padding:2px 10px;border-radius:20px;">Público</span>'}
                    ${isMember ? '<span style="font-size:10px;color:#10b981;background:rgba(16,185,129,0.1);padding:2px 10px;border-radius:20px;">Membro</span>' : ''}
                </div>
                <p class="group-card-description">${g.description || 'Sem descrição'}</p>
                <div class="group-card-meta">
                    <span><i class="fa-regular fa-user"></i> ${memberCount} membros</span>
                    <span><i class="fa-regular fa-tag"></i> ${categoryName}</span>
                </div>
                <div class="group-card-actions">
                    ${isMember ? `
                        <button class="btn-chat" onclick="window.openGroupChat('${g.id}')">
                            <i class="fa-regular fa-comments"></i> Conversar
                        </button>
                        ${g.name !== 'Geral' ? `
                        <button class="btn-leave" onclick="window.leaveGroup('${g.id}')" style="background:transparent;color:#ef4444;border-color:#ef4444;">
                            <i class="fa-solid fa-right-from-bracket"></i> Sair
                        </button>` : ''}
                    ` : `
                        ${!isPrivate ? `
                        <button class="btn-join" onclick="window.joinGroup('${g.id}')">
                            <i class="fa-solid fa-right-to-bracket"></i> Entrar
                        </button>
                        ` : `
                        <button class="btn-private" style="background:transparent;color:#888;border-color:#888;cursor:not-allowed;" disabled>
                            <i class="fa-solid fa-lock"></i> Privado
                        </button>
                        `}
                    `}
                </div>
            </div>
        </div>`;
    }).join('');
    
    renderChatChannels();
}

   // =============================================
// 13. CANAIS DO CHAT - MOSTRAR GRUPOS PÚBLICOS
// =============================================
async function renderChatChannels() {
    const container = document.getElementById('channelsList');
    if (!container) return;

    const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', currentUser?.id);

    const memberGroupIds = memberships?.map(m => m.group_id) || [];

    const allGroups = await loadGroups();

    // FILTRO CORRIGIDO: Mostrar grupos públicos OU grupos que o usuário é membro
    const userGroups = allGroups.filter(g => {
        if (g.name === 'Geral' || g.id === COMMUNITY_CHAT_ID) return true;
        if (g.is_private === false) return true; // GRUPOS PÚBLICOS
        return memberGroupIds.includes(g.id);
    });

    if (!userGroups || userGroups.length === 0) {
        container.innerHTML = `
            <div class="channel-item" style="color:var(--text-muted);padding:12px;text-align:center;font-size:13px;">
                <i class="fa-regular fa-comment"></i> Nenhum canal disponível
            </div>
        `;
        return;
    }

    container.innerHTML = userGroups.map((group, index) => {
        const isActive = index === 0 ? 'active' : '';
        const icon = group.name === 'Geral' ? 'fa-solid fa-globe' : 'fa-solid fa-users';
        const badge = group.name === 'Geral' ? '<span class="channel-badge">●</span>' : '';
        
        return `
        <div class="channel-item ${isActive}" data-channel="${group.id}" onclick="window.openGroupChat('${group.id}')">
            <div class="channel-icon"><i class="${icon}"></i></div>
            <div class="channel-info">
                <span class="channel-name">${group.name}</span>
                <span class="channel-meta">${group.members || 0} membros</span>
            </div>
            ${badge}
        </div>`;
    }).join('');
}

    // =============================================
    // 14. FUNÇÕES DOS GRUPOS
    // =============================================
    window.openCreateGroupModal = function() {
        if (!currentUser) {
            showToast('Faça login para criar um grupo', 'error');
            return;
        }
        const modal = document.getElementById('createGroupModal');
        if (modal) {
            modal.removeAttribute('hidden');
            setupGroupImageUpload();
        }
    };

    function setupGroupImageUpload() {
        const imageUploadInput = document.createElement('input');
        imageUploadInput.type = 'file';
        imageUploadInput.accept = 'image/*';
        imageUploadInput.id = 'groupImageUploadInput';
        imageUploadInput.style.display = 'none';
        document.body.appendChild(imageUploadInput);

        const uploadArea = document.getElementById('groupImageUploadArea');
        if (uploadArea) {
            const newUploadArea = uploadArea.cloneNode(true);
            uploadArea.parentNode.replaceChild(newUploadArea, uploadArea);
            newUploadArea.addEventListener('click', () => {
                imageUploadInput.click();
            });
        }

        imageUploadInput.addEventListener('change', async function(e) {
            const file = this.files[0];
            if (!file) return;
            const imageUrl = await uploadGroupImage(file);
            this.value = '';
            if (imageUrl) {
                const imageField = document.getElementById('groupImage');
                if (imageField) {
                    imageField.value = imageUrl;
                }
                showToast('✅ Imagem pronta para o grupo! 🖼️', 'success');
            }
        });
    }

    document.getElementById('openCreateGroupBtn')?.addEventListener('click', window.openCreateGroupModal);
    document.getElementById('openCreateGroupFromChatBtn')?.addEventListener('click', window.openCreateGroupModal);

    document.getElementById('closeCreateGroupModal')?.addEventListener('click', () => {
        const modal = document.getElementById('createGroupModal');
        if (modal) modal.setAttribute('hidden', '');
    });

    document.getElementById('createGroupForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('groupName')?.value.trim();
        const description = document.getElementById('groupDescription')?.value.trim();
        const category = document.getElementById('groupCategory')?.value || 'Geral';
        const imageUrl = document.getElementById('groupImage')?.value.trim() || '/img/grupo-padrao.png';
        const isPrivate = document.getElementById('groupPrivate')?.checked || false;

        if (!name) {
            showToast('Por favor, insira o nome do grupo.', 'error');
            return;
        }

        if (!currentUser) {
            showToast('Faça login para criar um grupo', 'error');
            return;
        }

        const { data: existing } = await supabase
            .from('groups')
            .select('id')
            .eq('name', name)
            .maybeSingle();

        if (existing) {
            showToast('Já existe um grupo com este nome!', 'error');
            return;
        }

        try {
            const groupData = {
                name: name,
                description: description || 'Sem descrição',
                category: category,
                members: 1,
                is_admin: false,
                is_private: isPrivate,
                image_url: imageUrl,
                created_by: currentUser.id,
            
            };

            const { data: group, error: groupError } = await supabase
                .from('groups')
                .insert(groupData)
                .select()
                .single();

            if (groupError) {
                showToast('Erro ao criar grupo: ' + groupError.message, 'error');
                return;
            }

            await supabase
                .from('conversations')
                .insert({
                    id: group.id,
                    name: name,
                    type: 'group',
                    created_by: currentUser.id,
                    created_at: new Date().toISOString()
                });

            await supabase
                .from('conversation_participants')
                .insert({
                    conversation_id: group.id,
                    user_id: currentUser.id,
                    joined_at: new Date().toISOString()
                });

            await supabase
                .from('group_members')
                .insert({
                    group_id: group.id,
                    user_id: currentUser.id,
                    joined_at: new Date().toISOString()
                });

            showToast(`Grupo "${name}" criado com sucesso! 🎉`, 'success');
            document.getElementById('createGroupModal')?.setAttribute('hidden', '');
            document.getElementById('createGroupForm')?.reset();
            
            await renderGroups();
            switchTab('grupos');

        } catch (error) {
            console.error('❌ Erro:', error);
            showToast('Erro ao criar grupo', 'error');
        }
    });

    window.joinGroup = async function(groupId) {
        if (!currentUser) {
            showToast('Faça login para entrar', 'error');
            return;
        }

        try {
            const { data: group, error: groupError } = await supabase
                .from('groups')
                .select('members, is_private')
                .eq('id', groupId)
                .single();

            if (groupError) throw groupError;

            if (group.is_private) {
                showToast('Grupo privado. Solicite entrada.', 'warning');
                return;
            }

            const { data: existing } = await supabase
                .from('group_members')
                .select('*')
                .eq('group_id', groupId)
                .eq('user_id', currentUser.id)
                .maybeSingle();

            if (existing) {
                showToast('Você já é membro!', 'info');
                return;
            }

            await supabase
                .from('group_members')
                .insert({
                    group_id: groupId,
                    user_id: currentUser.id,
                    joined_at: new Date().toISOString()
                });

            await supabase
                .from('conversation_participants')
                .insert({
                    conversation_id: groupId,
                    user_id: currentUser.id,
                    joined_at: new Date().toISOString()
                });

            await supabase
                .from('groups')
                .update({ members: (group.members || 0) + 1 })
                .eq('id', groupId);

            showToast('Entrou no grupo! 🎉', 'success');
            await renderGroups();
            await renderChatChannels();

        } catch (error) {
            showToast('Erro ao entrar: ' + error.message, 'error');
        }
    };

    window.leaveGroup = async function(groupId) {
        if (!currentUser) {
            showToast('Faça login', 'error');
            return;
        }

        if (groupId === COMMUNITY_CHAT_ID) {
            showToast('Você não pode sair do grupo Geral!', 'warning');
            return;
        }

        if (!confirm('Tem certeza que deseja sair deste grupo?')) return;

        try {
            const { data: group } = await supabase
                .from('groups')
                .select('members')
                .eq('id', groupId)
                .single();

            await supabase
                .from('group_members')
                .delete()
                .eq('group_id', groupId)
                .eq('user_id', currentUser.id);

            await supabase
                .from('conversation_participants')
                .delete()
                .eq('conversation_id', groupId)
                .eq('user_id', currentUser.id);

            await supabase
                .from('groups')
                .update({ members: Math.max(0, (group?.members || 1) - 1) })
                .eq('id', groupId);

            showToast('Você saiu do grupo', 'info');
            await renderGroups();
            await renderChatChannels();

        } catch (error) {
            showToast('Erro ao sair: ' + error.message, 'error');
        }
    };

    window.openGroupChat = async function(groupId) {
        try {
            const { data: group, error } = await supabase
                .from('groups')
                .select('name')
                .eq('id', groupId)
                .single();

            if (error) throw error;

            switchChat(groupId, group.name);
            switchTab('conversa');
            showToast(`Chat: ${group.name}`, 'success');

        } catch (error) {
            showToast('Erro ao abrir chat', 'error');
        }
    };
// =============================================
// 15. CHAT - VERSÃO CORRIGIDA E FUNCIONAL
// =============================================
let currentChatId = COMMUNITY_CHAT_ID;
let chatSubscription = null;
let isSending = false;

function switchChat(chatId, chatName) {
    currentChatId = chatId;
    
    const title = document.getElementById('chatCurrentChannel');
    if (title) {
        title.textContent = chatName || 'Geral';
    }
    
    // Atualiza os canais ativos
    document.querySelectorAll('.channel-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.channel === chatId) {
            item.classList.add('active');
        }
    });
    
    loadChatMessages(chatId);
    subscribeToMessages(chatId);
}

async function ensureCommunityChat() {
    const { data } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', COMMUNITY_CHAT_ID)
        .maybeSingle();
    if (!data) {
        await supabase
            .from('conversations')
            .insert({ id: COMMUNITY_CHAT_ID, name: 'Comunidade Geral' });
    }
}

async function addUserToChat() {
    if (!currentUser) return;
    await supabase
        .from('conversation_participants')
        .upsert({
            conversation_id: COMMUNITY_CHAT_ID,
            user_id: currentUser.id
        }, {
            onConflict: 'conversation_id,user_id'
        });
}

async function loadChatMessages(chatId = null) {
    const mc = document.getElementById('chatMessages');
    if (!mc) return;
    
    const targetChatId = chatId || currentChatId;
    
    try {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', targetChatId)
            .order('created_at', { ascending: false })
            .limit(50);
            
        if (error) {
            console.error('❌ Erro ao carregar mensagens:', error);
            mc.innerHTML = '<div class="chat-placeholder"><i class="fa-solid fa-triangle-exclamation"></i><p>Erro ao carregar mensagens</p></div>';
            return;
        }
        
        if (messages && messages.length > 0) {
            const sortedMessages = messages.reverse();
            mc.innerHTML = sortedMessages.map(m => {
                const isSent = m.sender_id === currentUser?.id;
                const senderName = isSent ? 'Você' : (m.sender_name || 'Membro');
                const userColor = stringToColor(m.sender_id);
                const avatarUrl = isSent ? getUserAvatar() : (m.sender_avatar || getUserAvatar());
                
                let videoHtml = '';
                if (m.video_url && m.video_url.trim() !== '') {
                    videoHtml = `
                        <div class="chat-video">
                            <video controls style="width:100%;display:block;max-width:200px;border-radius:8px;">
                                <source src="${m.video_url}" type="video/mp4">
                            </video>
                        </div>
                    `;
                }
                
                return `
                <div class="chat-message ${isSent ? 'sent' : 'received'}" data-message-id="${m.id}">
                    ${!isSent ? `
                        <div class="msg-avatar">
                            <img src="${avatarUrl}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" 
                                 onerror="this.style.display='none';this.parentElement.style.background='${userColor}';this.parentElement.textContent='${senderName.charAt(0).toUpperCase()}';this.parentElement.style.display='flex';this.parentElement.style.alignItems='center';this.parentElement.style.justifyContent='center';this.parentElement.style.color='#fff';this.parentElement.style.fontWeight='700';">
                        </div>
                    ` : ''}
                    <div class="msg-content">
                        <div class="msg-author" style="color:${userColor};font-weight:600;font-size:12px;">${senderName}</div>
                        <div class="msg-text">${escapeHtml(m.content)}</div>
                        ${videoHtml}
                        <div class="msg-time">${formatChatTime(m.created_at)}</div>
                    </div>
                </div>`;
            }).join('');
        } else {
            mc.innerHTML = `
                <div class="chat-placeholder">
                    <i class="fa-solid fa-comments"></i>
                    <p>Nenhuma mensagem ainda</p>
                    <p style="font-size:12px;color:#aaa;">Seja o primeiro a dizer oi! 👋</p>
                </div>
            `;
        }
        
        scrollToBottom();
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
        mc.innerHTML = '<div class="chat-placeholder"><i class="fa-solid fa-triangle-exclamation"></i><p>Erro ao carregar mensagens</p></div>';
    }
}

function scrollToBottom() {
    const container = document.querySelector('.chat-messages-container');
    if (container) {
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }
}

// =============================================
// ADICIONA MENSAGEM INSTANTANEAMENTE
// =============================================
function addMessageToChat(message) {
    const mc = document.getElementById('chatMessages');
    if (!mc) return;
    
    // Remove placeholder se existir
    const placeholder = mc.querySelector('.chat-placeholder');
    if (placeholder) placeholder.remove();
    
    // Verifica se a mensagem já existe (evita duplicatas)
    const existingMessages = mc.querySelectorAll('.chat-message');
    for (let msg of existingMessages) {
        if (msg.dataset.messageId === message.id) {
            return; // Já existe, não adiciona de novo
        }
    }
    
    const isSent = message.sender_id === currentUser?.id;
    const senderName = isSent ? 'Você' : (message.sender_name || 'Membro');
    const userColor = stringToColor(message.sender_id);
    const avatarUrl = isSent ? getUserAvatar() : (message.sender_avatar || getUserAvatar());
    
    let videoHtml = '';
    if (message.video_url && message.video_url.trim() !== '') {
        videoHtml = `
            <div class="chat-video">
                <video controls style="width:100%;display:block;max-width:200px;border-radius:8px;">
                    <source src="${message.video_url}" type="video/mp4">
                </video>
            </div>
        `;
    }
    
    const messageHtml = `
        <div class="chat-message ${isSent ? 'sent' : 'received'}" data-message-id="${message.id}" style="animation: fadeIn 0.2s ease;">
            ${!isSent ? `
                <div class="msg-avatar">
                    <img src="${avatarUrl}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" 
                         onerror="this.style.display='none';this.parentElement.style.background='${userColor}';this.parentElement.textContent='${senderName.charAt(0).toUpperCase()}';this.parentElement.style.display='flex';this.parentElement.style.alignItems='center';this.parentElement.style.justifyContent='center';this.parentElement.style.color='#fff';this.parentElement.style.fontWeight='700';">
                </div>
            ` : ''}
            <div class="msg-content">
                <div class="msg-author" style="color:${userColor};font-weight:600;font-size:12px;">${senderName}</div>
                <div class="msg-text">${escapeHtml(message.content)}</div>
                ${videoHtml}
                <div class="msg-time">${formatChatTime(message.created_at)}</div>
            </div>
        </div>
    `;
    
    // Adiciona a mensagem
    mc.insertAdjacentHTML('beforeend', messageHtml);
    
    // Rola para o final
    scrollToBottom();
}

// =============================================
// SUBSCRIÇÃO EM TEMPO REAL (OTIMIZADA)
// =============================================
function subscribeToMessages(chatId = null) {
    // Remove subscription antiga
    if (chatSubscription) {
        supabase.removeChannel(chatSubscription);
        chatSubscription = null;
    }
    
    const targetChatId = chatId || currentChatId;
    
    chatSubscription = supabase
        .channel(`chat-${targetChatId}`)
        .on('postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${targetChatId}`
            },
            (payload) => {
                // 🚀 ADICIONA APENAS A MENSAGEM NOVA
                const newMessage = payload.new;
                console.log('📩 Nova mensagem recebida:', newMessage);
                addMessageToChat(newMessage);
            }
        )
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Chat em tempo real conectado! 🚀');
            } else {
                console.log('📡 Status da conexão:', status);
            }
        });
}

// =============================================
// ENVIA MENSAGEM (COM FEEDBACK VISUAL)
// =============================================
async function sendMessage() {
    // Previne envios duplicados
    if (isSending) return;
    
    const inp = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendChatBtn');
    
    if (!inp || !currentUser) {
        showToast('Faça login para enviar mensagens', 'error');
        return;
    }
    
    const msg = inp.value.trim();
    if (!msg) {
        showToast('Digite uma mensagem', 'error');
        return;
    }
    
    // Bloqueia o botão
    isSending = true;
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    }
    
    try {
        // Salva no banco
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: currentChatId,
                sender_id: currentUser.id,
                sender_name: getUserName(),
                sender_avatar: getUserAvatar(),
                content: msg
            })
            .select()
            .single();
            
        if (error) {
            console.error('❌ Erro ao enviar:', error);
            showToast('Erro ao enviar: ' + error.message, 'error');
            
            // Reativa o input
            inp.value = msg;
        } else {
            // Limpa o input
            inp.value = '';
            
            // Adiciona a mensagem localmente (resposta otimista)
            addMessageToChat(data);
            
            showToast('✅ Mensagem enviada!', 'success', 1000);
        }
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
        showToast('Erro ao enviar mensagem', 'error');
    } finally {
        // Restaura o botão
        isSending = false;
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fa-regular fa-paper-plane"></i>';
        }
        inp.focus();
    }
}

// =============================================
// EVENTOS DO CHAT
// =============================================
document.getElementById('sendChatBtn')?.addEventListener('click', sendMessage);

document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// =============================================
// FUNÇÃO PARA RECONECTAR (caso perca conexão)
// =============================================
function reconnectChat() {
    console.log('🔄 Reconectando ao chat...');
    if (chatSubscription) {
        supabase.removeChannel(chatSubscription);
        chatSubscription = null;
    }
    subscribeToMessages(currentChatId);
}

// Verifica a cada 30 segundos se está conectado
setInterval(() => {
    if (chatSubscription) {
        const status = chatSubscription.state;
        if (status !== 'SUBSCRIBED') {
            console.warn('⚠️ Conexão perdida, reconectando...');
            reconnectChat();
        }
    }
}, 30000);

    // =============================================
    // 16. EVENTOS
    // =============================================
    async function renderEvents() {
        const grid = document.getElementById('eventsGrid');
        if (!grid) return;
        
        const events = await loadEvents();
        if (!events || events.length === 0) {
            grid.innerHTML = `
                <div class="no-content" style="text-align:center;padding:40px 20px;color:#888;">
                    <i class="fa-solid fa-calendar" style="font-size:32px;display:block;margin-bottom:12px;opacity:0.3;"></i>
                    <p>Nenhum evento agendado</p>
                    <p style="font-size:13px;color:#aaa;">Fique de olho, em breve teremos novidades!</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = events.map(ev => {
            const date = new Date(ev.date);
            return `
            <div class="event-card">
                <div class="event-date" style="background:${stringToColor(ev.id)};">
                    <span class="event-day">${date.getDate()}</span>
                    <span class="event-month">${date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase()}</span>
                </div>
                <div class="event-info">
                    <h4>${escapeHtml(ev.title)}</h4>
                    <p>${escapeHtml(ev.description || '')}</p>
                    <div class="event-meta">
                        <span><i class="fa-regular fa-calendar"></i> ${formatEventDate(ev.date)}</span>
                        <span><i class="fa-regular fa-user"></i> ${ev.participants || 0} participantes</span>
                    </div>
                </div>
                <button class="event-join-btn" data-event-id="${ev.id}">
                    <i class="fa-solid fa-calendar-check"></i> Participar
                </button>
            </div>`;
        }).join('');
        
        document.querySelectorAll('.event-join-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!currentUser) {
                    showToast('Faça login para participar', 'error');
                    return;
                }
                const eventId = btn.dataset.eventId;
                const { error } = await supabase
                    .from('event_participants')
                    .insert({ event_id: eventId, user_id: currentUser.id });
                if (!error) {
                    showToast('Presença confirmada! 🎉', 'success');
                    btn.textContent = '✅ Confirmado';
                    btn.classList.add('confirmed');
                } else {
                    showToast('Erro ao confirmar presença', 'error');
                }
            });
        });
    }

    // =============================================
    // 17. SUBSCRIÇÕES REALTIME
    // =============================================
    let postsSubscription = null;

    function subscribeToPosts() {
        if (postsSubscription) {
            supabase.removeChannel(postsSubscription);
            postsSubscription = null;
        }

        postsSubscription = supabase
            .channel('posts-changes')
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'posts'
                },
                async (payload) => {
                    await renderPosts();
                    showToast('📢 Novo post na comunidade!', 'info', 2000);
                }
            )
            .on('postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'posts'
                },
                async () => {
                    await renderPosts();
                }
            )
            .on('postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'posts'
                },
                async () => {
                    await renderPosts();
                }
            )
            .subscribe();
    }

    // =============================================
    // 18. INICIALIZAÇÃO
    // =============================================
    await ensureCommunityChat();
    await addUserToChat();
    await loadChatMessages(COMMUNITY_CHAT_ID);
    subscribeToMessages(COMMUNITY_CHAT_ID);
    
    await renderPosts();
    await renderGroups();
    await renderEvents();
    await renderChatChannels();
    
    subscribeToPosts();
    
    console.log('🚀 Comunidade pronta! 👍💬❤️');
    console.log('🎬 Upload de vídeos ativado!');
    console.log('📋 Sistema de Grupos integrado com Supabase!');
    console.log('🔄 Atualização automática de posts ativada!');
});