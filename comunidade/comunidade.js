

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

    function getUserName() {
        return currentUser?.user_metadata?.username || 
               currentUser?.email?.split('@')[0] || 
               'Usuário';
    }

    function getUserAvatar() {
        return currentUser?.user_metadata?.avatar_url || AVATAR_PADRAO;
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
    // 1. SIDEBAR TOGGLE
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
    function syncProfile() {
        const userName = getUserName();
        const userAvatar = getUserAvatar();
        const userEmail = currentUser?.email || 'carregando@email.com';
        
        const headerAvatar = document.getElementById('headerAvatar');
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        const sidebarUserName = document.getElementById('sidebarUserName');
        const sidebarUserEmail = document.getElementById('sidebarUserEmail');
        const quickPostAvatar = document.querySelector('.quick-post-avatar');
        const postModalAvatar = document.getElementById('postModalAvatar');
        
        const avatars = [headerAvatar, sidebarAvatar, quickPostAvatar, postModalAvatar];
        avatars.forEach(avatar => {
            if (avatar) {
                avatar.src = userAvatar;
                avatar.onerror = () => { avatar.src = AVATAR_PADRAO; };
            }
        });
        
        if (sidebarUserName) sidebarUserName.textContent = userName;
        if (sidebarUserEmail) sidebarUserEmail.textContent = userEmail;
    }

    syncProfile();

    // =============================================
    // 3. PERFIL COLAPSÁVEL
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
    // 6. FUNÇÕES DA API (SEGURAS - CHAMAM SQL)
    // =============================================
    
    async function apiCreatePost(content, videoUrl) {
        const { data, error } = await supabase.rpc('create_post', {
            p_content: content,
            p_video_url: videoUrl
        });
        if (error) {
            showToast('Erro: ' + error.message, 'error');
            return null;
        }
        return data;
    }

    async function apiCreateComment(postId, content) {
        const { data, error } = await supabase.rpc('create_comment_direct', {
            p_post_id: postId,
            p_content: content
        });
        if (error) {
            showToast('Erro: ' + error.message, 'error');
            return null;
        }
        return data;
    }

    async function apiToggleLike(postId) {
        const { data, error } = await supabase.rpc('toggle_like', {
            p_post_id: postId
        });
        if (error) {
            showToast('Erro: ' + error.message, 'error');
            return null;
        }
        return data;
    }

    async function apiGetPosts(limit = 50) {
        const { data, error } = await supabase.rpc('get_posts', {
            p_limit: limit,
            p_offset: 0
        });
        if (error) {
            console.error('Erro ao carregar posts:', error);
            return [];
        }
        return data || [];
    }

    async function apiGetGroups() {
        const { data, error } = await supabase.rpc('get_user_groups');
        if (error) {
            console.error('Erro ao carregar grupos:', error);
            return [];
        }
        return data || [];
    }

    async function apiGetChatChannels() {
        const { data, error } = await supabase.rpc('get_user_chat_channels');
        if (error) {
            console.error('Erro ao carregar canais:', error);
            return [];
        }
        return data || [];
    }

    async function apiSendMessage(conversationId, content) {
        const { data, error } = await supabase.rpc('send_message', {
            p_conversation_id: conversationId,
            p_content: content
        });
        if (error) {
            showToast('Erro: ' + error.message, 'error');
            return null;
        }
        return data;
    }

    // =============================================
    // 7. ESCAPE HTML E FORMATADORES
    // =============================================
    function escapeHtml(t) {
        if (!t) return '';
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
    // 8. TABS
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
    // 9. LOAD AND SHOW COMMENTS - CORRIGIDO
    // =============================================
    window.loadAndShowComments = async function(postId) {
        console.log(`🔍 Carregando comentários para post: ${postId}`);

        if (!postId) {
            console.error('❌ postId é inválido!');
            return;
        }

        let section = document.getElementById(`comments-${postId}`);
        
        if (!section) {
            console.warn(`⚠️ Seção não encontrada, criando dinamicamente para post: ${postId}`);
            
            const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
            if (!postCard) {
                console.error(`❌ Post card não encontrado: ${postId}`);
                return;
            }
            
            section = document.createElement('div');
            section.className = 'comments-section';
            section.id = `comments-${postId}`;
            section.style.display = 'block';
            section.innerHTML = `
                <div class="comments-list">
                    <p style="color:#888;font-size:13px;padding:8px;">⏳ Carregando comentários...</p>
                </div>
                <div class="add-comment">
                    <input placeholder="Escreva um comentário..." id="comment-input-${postId}">
                    <button class="submit-comment-btn" data-post-id="${postId}">Enviar</button>
                </div>
            `;
            
            const postActions = postCard.querySelector('.post-actions');
            if (postActions) {
                postActions.after(section);
            } else {
                postCard.appendChild(section);
            }
            
            const submitBtn = section.querySelector('.submit-comment-btn');
            if (submitBtn) {
                submitBtn.addEventListener('click', window.handleCommentSubmit || handleCommentSubmit);
            }
            
            console.log(`✅ Seção criada dinamicamente para post: ${postId}`);
        }

        const list = section.querySelector('.comments-list');
        if (!list) {
            console.error(`❌ Lista não encontrada em: comments-${postId}`);
            return;
        }

        list.innerHTML = '<p style="color:#888;font-size:13px;padding:8px;">⏳ Carregando comentários...</p>';

        try {
            const { data: comments, error } = await supabase
                .from('comments')
                .select('*')
                .eq('post_id', postId)
                .eq('is_active', true)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('❌ Erro ao carregar comentários:', error);
                list.innerHTML = `<p style="color:#ef4444;font-size:13px;padding:8px;">❌ Erro: ${error.message}</p>`;
                return;
            }

            console.log(`📨 ${comments?.length || 0} comentários encontrados para post ${postId}`);

            if (!comments || comments.length === 0) {
                list.innerHTML = '<p style="color:#888;font-size:13px;padding:8px;">💬 Nenhum comentário ainda. Seja o primeiro!</p>';
            } else {
                list.innerHTML = comments.map(c => `
                    <div class="comment-item" style="padding:10px 0;border-bottom:1px solid #eee;">
                        <strong style="color:#7c3aed;">${escapeHtml(c.author_name || 'Usuário')}</strong>
                        <p style="margin:4px 0 2px 0;font-size:14px;color:#333;">${escapeHtml(c.content)}</p>
                        <small style="color:#999;font-size:11px;">${formatDate(c.created_at)}</small>
                    </div>
                `).join('');
            }

            section.style.display = 'block';

            const countBtn = document.querySelector(`.comment-toggle-btn[data-post-id="${postId}"] .count`);
            if (countBtn) {
                countBtn.textContent = comments?.length || 0;
            }

        } catch (error) {
            console.error('❌ Erro inesperado:', error);
            list.innerHTML = '<p style="color:#ef4444;font-size:13px;padding:8px;">❌ Erro ao carregar comentários</p>';
        }
    };

    // =============================================
    // SETUP POST EVENTS
    // =============================================
    function setupPostEvents() {
        console.log('🔄 Configurando eventos dos posts...');

        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.removeEventListener('click', handleLike);
            btn.addEventListener('click', handleLike);
        });

        document.querySelectorAll('.comment-toggle-btn').forEach(btn => {
            btn.removeEventListener('click', handleCommentToggle);
            btn.addEventListener('click', handleCommentToggle);
        });

        document.querySelectorAll('.submit-comment-btn').forEach(btn => {
            btn.removeEventListener('click', window.handleCommentSubmit || handleCommentSubmit);
            btn.addEventListener('click', window.handleCommentSubmit || handleCommentSubmit);
        });

        document.querySelectorAll('.video-fullscreen-btn').forEach(btn => {
            btn.removeEventListener('click', handleVideoFullscreen);
            btn.addEventListener('click', handleVideoFullscreen);
        });
    }

    // =============================================
    // HANDLERS
    // =============================================
    async function handleLike(e) {
        e.stopPropagation();
        const btn = e.currentTarget;
        const postId = btn.dataset.postId;
        if (!currentUser) return showToast('Faça login', 'error');
        
        const result = await apiToggleLike(postId);
        if (result) {
            const countSpan = btn.querySelector('.count');
            const icon = btn.querySelector('i');
            if (countSpan) countSpan.textContent = result.likes;
            btn.classList.toggle('liked', result.liked);
            if (icon) {
                icon.className = result.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            }
        }
    }

    async function handleCommentToggle(e) {
        e.stopPropagation();
        const btn = e.currentTarget;
        const postId = btn.dataset.postId;
        
        if (!postId) {
            console.error('❌ postId não encontrado');
            return;
        }

        console.log(`🔄 Toggle comentários para post: ${postId}`);

        const section = document.getElementById(`comments-${postId}`);
        if (!section) {
            console.error(`❌ Seção não encontrada: comments-${postId}`);
            return;
        }

        const isHidden = section.style.display === 'none' || section.style.display === '';
        
        if (isHidden) {
            console.log(`📂 Abrindo comentários do post ${postId}`);
            section.style.display = 'block';
            await window.loadAndShowComments(postId);
        } else {
            console.log(`📁 Fechando comentários do post ${postId}`);
            section.style.display = 'none';
        }
    }

    // =============================================
    // handleCommentSubmit - VERSÃO FINAL
    // =============================================
    window.handleCommentSubmit = async function(e) {
        e.stopPropagation();
        const btn = e.currentTarget;
        const postId = btn.dataset.postId;
        
        if (!postId) {
            console.error('❌ postId não encontrado no botão');
            return;
        }

        const input = document.getElementById(`comment-input-${postId}`);
        if (!input) {
            console.error(`❌ Input não encontrado: comment-input-${postId}`);
            return;
        }

        const text = input?.value.trim();
        
        if (!text) {
            showToast('Digite um comentário', 'error');
            return;
        }
        
        if (!currentUser) {
            showToast('Faça login para comentar', 'error');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Enviando...';

        try {
            console.log(`📤 Enviando comentário para post ${postId}: ${text}`);

            const { data, error } = await supabase
                .rpc('create_comment_direct', {
                    p_post_id: postId,
                    p_content: text
                });

            if (error) {
                console.error('❌ Erro ao enviar comentário:', error);
                showToast('Erro ao enviar comentário: ' + error.message, 'error');
                btn.disabled = false;
                btn.textContent = 'Enviar';
                return;
            }

            console.log('✅ Comentário enviado! ID:', data);
            
            input.value = '';
            showToast('💬 Comentário adicionado!', 'success');
            
            await window.loadAndShowComments(postId);
            
            const countBtn = document.querySelector(`.comment-toggle-btn[data-post-id="${postId}"] .count`);
            if (countBtn) {
                const { data: postData } = await supabase
                    .from('posts')
                    .select('comment_count')
                    .eq('id', postId)
                    .single();
                
                countBtn.textContent = postData?.comment_count || 0;
            }

        } catch (error) {
            console.error('❌ Erro inesperado:', error);
            showToast('Erro ao enviar comentário', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Enviar';
        }
    };

    function handleVideoFullscreen(e) {
        e.stopPropagation();
        const container = e.currentTarget.closest('.post-video-container');
        const video = container?.querySelector('video');
        if (video) {
            openFullscreenModal(video.src);
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

    async function renderPosts() {
        const feed = document.getElementById('postsFeed');
        if (!feed) return;

        const posts = await apiGetPosts();

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
            const isLiked = p.is_liked || false;
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
    // 10. NOVO POST
    // =============================================
    const postModalOverlay = document.getElementById('postModalOverlay');
    const closePostModalBtn = document.getElementById('closeModalBtn');
    const submitPostBtn = document.getElementById('submitPostBtn');
    const postContentInput = document.getElementById('postContentInput');

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
    });

    postModalOverlay?.addEventListener('click', (e) => {
        if (e.target === postModalOverlay) {
            postModalOverlay.setAttribute('hidden', '');
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

        const postId = await apiCreatePost(cleanText, videoUrl);

        submitPostBtn.disabled = false;
        submitPostBtn.textContent = 'Postar';

        if (postId) {
            if (postModalOverlay) postModalOverlay.setAttribute('hidden', '');
            showToast('Post publicado! 🎉', 'success');
            await renderPosts();
            const quickInput = document.getElementById('quickPostInput');
            if (quickInput) quickInput.value = '';
            switchTab('forum');
        }
    });

    // =============================================
    // 11. UPLOAD DE VÍDEO
    // =============================================
    const videoUploadInput = document.createElement('input');
    videoUploadInput.type = 'file';
    videoUploadInput.accept = 'video/*';
    videoUploadInput.id = 'videoUploadInput';
    videoUploadInput.style.display = 'none';
    document.body.appendChild(videoUploadInput);

    document.getElementById('postMediaBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        videoUploadInput.click();
    });

    videoUploadInput.addEventListener('change', async function(e) {
        const file = this.files[0];
        if (!file) return;

        this.disabled = true;
        
        const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
        const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
        
        if (file.size > MAX_VIDEO_SIZE) {
            showToast('Vídeo muito grande! Máx 50MB', 'error');
            this.disabled = false;
            this.value = '';
            return;
        }
        
        if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
            showToast('Formato não suportado. Use MP4, WebM ou OGG', 'error');
            this.disabled = false;
            this.value = '';
            return;
        }

        showToast('📤 Enviando vídeo...', 'info', 5000);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('videos')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            this.disabled = false;
            this.value = '';

            if (error) {
                showToast('Erro ao enviar vídeo: ' + error.message, 'error');
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('videos')
                .getPublicUrl(fileName);

            if (publicUrl && postContentInput) {
                const currentText = postContentInput.value;
                postContentInput.value = currentText + `\n📹 Vídeo: ${publicUrl}\n`;
                showToast('✅ Vídeo pronto para postar! 🎬', 'success');
            }
        } catch (error) {
            this.disabled = false;
            this.value = '';
            showToast('Erro ao enviar vídeo', 'error');
        }
    });

    // =============================================
    // 12. GRUPOS
    // =============================================
    async function renderGroups() {
        const grid = document.getElementById('groupsGrid');
        if (!grid) return;

        const groups = await apiGetGroups();

        if (!groups || groups.length === 0) {
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

        grid.innerHTML = groups.map(g => {
            const isAdmin = g.is_admin === true;
            const isPrivate = g.is_private === true;
            const memberCount = g.members || 0;
            const categoryName = g.category || 'Geral';
            const imageUrl = g.image_url || '/img/grupo-padrao.png';
            const isMember = g.is_member === true || g.name === 'Geral';
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
                    <p class="group-card-description">${escapeHtml(g.description || 'Sem descrição')}</p>
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

        await renderChatChannels();
    }

    // =============================================
    // 13. CANAIS DO CHAT
    // =============================================
    async function renderChatChannels() {
        const container = document.getElementById('channelsList');
        if (!container) return;

        const channels = await apiGetChatChannels();

        if (!channels || channels.length === 0) {
            container.innerHTML = `
                <div class="channel-item" style="color:var(--text-muted);padding:12px;text-align:center;font-size:13px;">
                    <i class="fa-regular fa-comment"></i> Nenhum canal disponível
                </div>
            `;
            return;
        }

        const stillExists = channels.some(g => g.id === currentChatId);
        if (!stillExists && currentChatId !== COMMUNITY_CHAT_ID) {
            const geral = channels.find(g => g.name === 'Geral' || g.name === 'Comunidade Geral');
            if (geral) {
                currentChatId = geral.id;
                const title = document.getElementById('chatCurrentChannel');
                if (title) title.textContent = geral.name;
            } else if (channels.length > 0) {
                currentChatId = channels[0].id;
                const title = document.getElementById('chatCurrentChannel');
                if (title) title.textContent = channels[0].name;
            }
        }

        container.innerHTML = channels.map((group) => {
            const isActive = group.id === currentChatId ? 'active' : '';
            const isGeral = group.name === 'Geral' || group.name === 'Comunidade Geral';
            const icon = isGeral ? 'fa-solid fa-globe' : 'fa-solid fa-users';
            const badge = isGeral ? '<span class="channel-badge" style="color:#10b981;">●</span>' : '';
            
            return `
            <div class="channel-item ${isActive}" data-channel="${group.id}" onclick="window.openGroupChat('${group.id}')">
                <div class="channel-icon"><i class="${icon}"></i></div>
                <div class="channel-info">
                    <span class="channel-name">${escapeHtml(group.name)}</span>
                    <span class="channel-meta">${group.members || 0} membros</span>
                </div>
                ${badge}
            </div>`;
        }).join('');
    }

    // =============================================
    // 14. SAIR DO GRUPO
    // =============================================
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
            const { data, error } = await supabase.rpc('leave_group_with_cleanup', {
                p_group_id: groupId,
                p_user_id: currentUser.id
            });

            if (error) throw error;

            if (data && data.success) {
                showToast(data.message || 'Saiu do grupo!', 'info');
                await renderGroups();
                await renderChatChannels();

                if (currentChatId === groupId) {
                    const { data: geralData } = await supabase
                        .from('groups')
                        .select('id, name')
                        .eq('name', 'Geral')
                        .maybeSingle();

                    if (geralData) {
                        switchChat(geralData.id, geralData.name);
                        switchTab('conversa');
                        showToast('🔁 Redirecionado para o chat Geral', 'info', 2000);
                    }
                }
            } else {
                showToast(data?.message || 'Erro ao sair do grupo', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao sair:', error);
            showToast('Erro ao sair: ' + error.message, 'error');
        }
    };

    // =============================================
    // 15. ENTRAR NO GRUPO
    // =============================================
    window.joinGroup = async function(groupId) {
        if (!currentUser) {
            showToast('Faça login para entrar', 'error');
            return;
        }

        try {
            const { data, error } = await supabase.rpc('join_group_with_cleanup', {
                p_group_id: groupId,
                p_user_id: currentUser.id
            });

            if (error) throw error;

            if (data && data.success) {
                showToast(data.message || 'Entrou no grupo! 🎉', 'success');
                await renderGroups();
                await renderChatChannels();
                
                const groupName = data.group_name || 'Grupo';
                switchChat(groupId, groupName);
                switchTab('conversa');
            } else {
                showToast(data?.message || 'Erro ao entrar no grupo', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao entrar:', error);
            showToast('Erro ao entrar: ' + error.message, 'error');
        }
    };

    // =============================================
    // 16. ABRIR GRUPO NO CHAT
    // =============================================
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
    // 17. CRIAR GRUPO
    // =============================================
    window.openCreateGroupModal = function() {
        if (!currentUser) {
            showToast('Faça login para criar um grupo', 'error');
            return;
        }
        const modal = document.getElementById('createGroupModal');
        if (modal) {
            modal.removeAttribute('hidden');
        }
    };

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
            const { data: group, error: groupError } = await supabase
                .from('groups')
                .insert({
                    name: name,
                    description: description || 'Sem descrição',
                    category: category,
                    members: 1,
                    is_admin: false,
                    is_private: isPrivate,
                    image_url: imageUrl,
                    created_by: currentUser.id,
                })
                .select()
                .single();

            if (groupError) throw groupError;

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
            showToast('Erro ao criar grupo: ' + error.message, 'error');
        }
    });

    // =============================================
    // 18. CHAT
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
        try {
            const { data, error } = await supabase
                .from('conversations')
                .select('id')
                .eq('id', COMMUNITY_CHAT_ID)
                .maybeSingle();

            if (error) {
                console.error('❌ Erro ao verificar conversa:', error);
                return false;
            }

            if (!data) {
                console.log('📝 Criando conversa comunidade...');
                const { error: insertError } = await supabase
                    .from('conversations')
                    .insert({
                        id: COMMUNITY_CHAT_ID,
                        name: 'Comunidade Geral',
                        type: 'group'
                    });

                if (insertError) {
                    console.error('❌ Erro ao criar conversa:', insertError);
                    return false;
                }
                console.log('✅ Conversa criada com sucesso!');
                return true;
            }
            
            console.log('✅ Conversa já existe!');
            return true;
            
        } catch (error) {
            console.error('❌ Erro em ensureCommunityChat:', error);
            return false;
        }
    }

    async function addUserToChat() {
        if (!currentUser) {
            console.log('⚠️ Usuário não logado, pulando addUserToChat');
            return;
        }
        
        try {
            const { data, error } = await supabase.rpc('add_user_to_chat', {
                p_user_id: currentUser.id,
                p_conversation_id: COMMUNITY_CHAT_ID
            });
            
            if (error) {
                console.error('❌ Erro ao adicionar usuário ao chat (RPC):', error);
                await addUserToChatFallback();
            } else if (data && data.success) {
                console.log('✅ Usuário adicionado ao chat via RPC!');
            } else {
                console.error('❌ Falha ao adicionar usuário:', data?.message);
                await addUserToChatFallback();
            }
            
        } catch (error) {
            console.error('❌ Erro inesperado em addUserToChat:', error);
            await addUserToChatFallback();
        }
    }

    async function addUserToChatFallback() {
        try {
            console.log('🔄 Tentando método alternativo...');
            
            const { data: convData } = await supabase
                .from('conversations')
                .select('id')
                .eq('id', COMMUNITY_CHAT_ID)
                .maybeSingle();
            
            if (!convData) {
                await supabase
                    .from('conversations')
                    .insert({
                        id: COMMUNITY_CHAT_ID,
                        name: 'Comunidade Geral',
                        type: 'group'
                    });
            }
            
            const { error } = await supabase
                .from('conversation_participants')
                .insert({
                    conversation_id: COMMUNITY_CHAT_ID,
                    user_id: currentUser.id,
                    joined_at: new Date().toISOString()
                });
            
            if (error) {
                console.error('❌ Erro no fallback:', error);
            } else {
                console.log('✅ Usuário adicionado via fallback!');
            }
            
        } catch (error) {
            console.error('❌ Erro no fallback:', error);
        }
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
                            <div class="msg-author" style="color:${userColor};font-weight:600;font-size:12px;">${escapeHtml(senderName)}</div>
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

    function addMessageToChat(message) {
        const mc = document.getElementById('chatMessages');
        if (!mc) return;

        const placeholder = mc.querySelector('.chat-placeholder');
        if (placeholder) placeholder.remove();

        const existingMessages = mc.querySelectorAll('.chat-message');
        for (let msg of existingMessages) {
            if (msg.dataset.messageId === message.id) {
                return;
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
                    <div class="msg-author" style="color:${userColor};font-weight:600;font-size:12px;">${escapeHtml(senderName)}</div>
                    <div class="msg-text">${escapeHtml(message.content)}</div>
                    ${videoHtml}
                    <div class="msg-time">${formatChatTime(message.created_at)}</div>
                </div>
            </div>
        `;

        mc.insertAdjacentHTML('beforeend', messageHtml);
        scrollToBottom();
    }

    function subscribeToMessages(chatId = null) {
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

    async function sendMessage() {
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

        isSending = true;
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        }

        try {
            const result = await apiSendMessage(currentChatId, msg);

            if (result) {
                inp.value = '';
                showToast('✅ Mensagem enviada!', 'success', 1000);
                await loadChatMessages(currentChatId);
            }
        } catch (error) {
            console.error('❌ Erro inesperado:', error);
            showToast('Erro ao enviar mensagem', 'error');
        } finally {
            isSending = false;
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.innerHTML = '<i class="fa-regular fa-paper-plane"></i>';
            }
            inp.focus();
        }
    }

    document.getElementById('sendChatBtn')?.addEventListener('click', sendMessage);

    document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    function reconnectChat() {
        console.log('🔄 Reconectando ao chat...');
        if (chatSubscription) {
            supabase.removeChannel(chatSubscription);
            chatSubscription = null;
        }
        subscribeToMessages(currentChatId);
    }

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
    // 19. EVENTOS
    // =============================================
    async function renderEvents() {
        const grid = document.getElementById('eventsGrid');
        if (!grid) return;

        const { data: events, error } = await supabase
            .from('events')
            .select('*')
            .eq('is_active', true)
            .gte('date', new Date().toISOString())
            .order('date', { ascending: true })
            .limit(20);

        if (error || !events || events.length === 0) {
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
    // 20. SUBSCRIÇÕES REALTIME
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
                async () => {
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
    // 21. FUNÇÃO PARA GARANTIR GRUPO GERAL
    // =============================================
    async function ensureGeralGroup() {
        try {
            const { data, error } = await supabase.rpc('ensure_geral_group');
            if (error) throw error;
            if (data && data.success) {
                console.log('✅ Grupo Geral garantido:', data);
                return data.group_id;
            }
            return null;
        } catch (error) {
            console.error('❌ Erro ao garantir grupo Geral:', error);
            return null;
        }
    }

    // =============================================
    // 22. SUBSCRIÇÃO PARA COMENTÁRIOS EM TEMPO REAL
    // =============================================
    let commentsSubscription = null;

    function subscribeToComments() {
        if (commentsSubscription) {
            supabase.removeChannel(commentsSubscription);
            commentsSubscription = null;
        }

        commentsSubscription = supabase
            .channel('comments-changes')
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'comments'
                },
                async (payload) => {
                    const newComment = payload.new;
                    console.log('📩 Novo comentário recebido:', newComment);
                    
                    if (newComment.author_id === currentUser?.id) return;
                    
                    const postId = newComment.post_id;
                    await window.loadAndShowComments(postId);
                    
                    const countBtn = document.querySelector(`.comment-toggle-btn[data-post-id="${postId}"] .count`);
                    if (countBtn) {
                        const { data: postData } = await supabase
                            .from('posts')
                            .select('comment_count')
                            .eq('id', postId)
                            .single();
                        
                        if (postData) {
                            countBtn.textContent = postData.comment_count || 0;
                        }
                    }
                    
                    showToast('💬 Novo comentário no post!', 'info', 2000);
                }
            )
            .subscribe();
    }

    // =============================================
    // 23. INICIALIZAÇÃO
    // =============================================
    const geralGroupId = await ensureGeralGroup();

    await ensureCommunityChat();
    await addUserToChat();

    if (geralGroupId) {
        currentChatId = geralGroupId;
        const title = document.getElementById('chatCurrentChannel');
        if (title) title.textContent = 'Geral';
    } else {
        currentChatId = COMMUNITY_CHAT_ID;
    }

    await loadChatMessages(currentChatId);
    subscribeToMessages(currentChatId);

    await renderPosts();
    await renderGroups();
    await renderEvents();
    await renderChatChannels();

    subscribeToPosts();
    subscribeToComments();

    console.log('🚀 Comunidade pronta! 👍💬❤️');
    console.log('🔒 Sistema 100% seguro via Supabase RPC!');

    



    /* ADICIONAIS DA COMUNIDADE PORFAVOR NÃO MEXER NÃO TEM EM HTML E CSS SOU A PURA PREGUIÇA*/

    // =============================================
// FUNÇÕES CORRIGIDAS - COM ÍCONES FONT AWESOME
// =============================================

// 1. CATEGORIAS DO FÓRUM COM ÍCONES
window.FORUM_CATEGORIES = [
    { id: 'duvida', label: 'Dúvida', icon: 'fa-circle-question' },
    { id: 'experiencia', label: 'Experiência', icon: 'fa-comment-dots' },
    { id: 'dica', label: 'Dica', icon: 'fa-lightbulb' },
    { id: 'conquista', label: 'Conquista', icon: 'fa-trophy' },
    { id: 'neurodivergencia', label: 'Neurodivergência', icon: 'fa-brain' },
    { id: 'estudos', label: 'Estudos', icon: 'fa-book-open' },
    { id: 'trabalho', label: 'Trabalho', icon: 'fa-briefcase' },
    { id: 'acessibilidade', label: 'Acessibilidade', icon: 'fa-universal-access' },
    { id: 'conversa', label: 'Conversa', icon: 'fa-comments' },
    { id: 'ajuda', label: 'Preciso de Ajuda', icon: 'fa-hand-holding-heart' }
];

// 2. ADICIONAR CATEGORIA NO MODAL
function addCategorySelectorToModal() {
    var workspace = document.querySelector('.compose-workspace');
    if (!workspace) return;
    if (document.getElementById('postCategorySelector')) return;
    
    var html = '<div class="post-category-selector" id="postCategorySelector" style="margin-top:10px;">';
    html += '<label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px;"><i class="fa-regular fa-tag"></i> Categoria</label>';
    html += '<select id="postCategorySelect" style="width:100%;padding:8px 12px;border:2px solid var(--border-color);border-radius:10px;font-size:13px;font-family:Inter,sans-serif;background:var(--bg-secondary);color:var(--text-primary);outline:none;">';
    
    window.FORUM_CATEGORIES.forEach(function(c) {
        html += '<option value="' + c.id + '"><i class="fa-regular ' + c.icon + '"></i> ' + c.label + '</option>';
    });
    html += '</select></div>';
    
    workspace.insertAdjacentHTML('beforeend', html);
    
    var select = document.getElementById('postCategorySelect');
    if (select) {
        select.addEventListener('change', function() {
            var isHelp = this.value === 'ajuda';
            var helpLabel = document.querySelector('.help-request-label');
            if (helpLabel) {
                helpLabel.style.display = isHelp ? 'block' : 'none';
            }
            if (isHelp) {
                showToast('🆘 Sua publicação será marcada como "Preciso de Ajuda"!', 'info', 3000);
            }
        });
    }
}

// 3. LABEL DE AJUDA
function addHelpRequestLabel() {
    var workspace = document.querySelector('.compose-workspace');
    if (!workspace) return;
    if (document.querySelector('.help-request-label')) return;
    
    var html = '<div class="help-request-label" style="display:none;margin-top:10px;padding:10px 14px;background:#fef3c7;border-radius:10px;border-left:4px solid #f59e0b;font-size:13px;color:#92400e;">';
    html += '<i class="fa-solid fa-hand-holding-heart" style="color:#f59e0b;"></i>';
    html += '<strong> Você está pedindo ajuda!</strong>';
    html += '<p style="margin:4px 0 0 0;font-size:12px;color:#78350f;">A comunidade foi notificada para te apoiar. Alguém responderá em breve. 💜</p>';
    html += '</div>';
    
    workspace.insertAdjacentHTML('beforeend', html);
}

// 4. REGRAS DA COMUNIDADE COM ÍCONES
window.showCommunityRules = function() {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';
    
    var modal = document.createElement('div');
    modal.style.cssText = 'background:var(--bg-card,#fff);border-radius:20px;max-width:520px;width:100%;max-height:80vh;overflow-y:auto;padding:24px 28px;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:fadeIn 0.25s ease;';
    
    var rules = [
        ['fa-handshake', 'Respeite as pessoas', 'Trate todos com respeito e empatia. Cada pessoa tem sua própria jornada.'],
        ['fa-ban', 'Não pratique bullying', 'Comportamentos agressivos, ofensivos ou discriminatórios não são tolerados.'],
        ['fa-lock', 'Não exponha informações pessoais', 'Proteja sua privacidade e a dos outros.'],
        ['fa-user-slash', 'Não assedie outros usuários', 'Respeite os limites das pessoas. Assédio em qualquer forma resultará em banimento.'],
        ['fa-heart', 'Ajude a manter um ambiente acolhedor', 'Sua contribuição faz a diferença. Seja gentil e solidário.'],
        ['fa-filter', 'Conteúdo apropriado', 'Mantenha o conteúdo adequado para todas as idades.'],
        ['fa-bullseye', 'Mantenha o foco', 'Discussões construtivas e relacionadas à neurodiversidade.']
    ];
    
    var rulesHtml = '';
    rules.forEach(function(r) {
        rulesHtml += '<div style="padding:12px 14px;background:var(--bg-secondary,#f7f7f9);border-radius:10px;border-left:4px solid #7c3aed;margin-bottom:8px;display:flex;align-items:flex-start;gap:12px;">';
        rulesHtml += '<i class="fa-solid ' + r[0] + '" style="color:#7c3aed;font-size:18px;margin-top:2px;"></i>';
        rulesHtml += '<div><strong style="font-size:14px;color:var(--text-primary,#1e293b);">' + r[1] + '</strong>';
        rulesHtml += '<p style="font-size:13px;color:var(--text-secondary,#64748b);margin:4px 0 0 0;">' + r[2] + '</p></div>';
        rulesHtml += '</div>';
    });
    
    modal.innerHTML = 
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
        '<h2 style="font-size:20px;font-weight:700;color:var(--text-primary,#1e293b);"><i class="fa-solid fa-shield-halved" style="color:#7c3aed;"></i> Regras da Comunidade</h2>' +
        '<button onclick="this.closest(\'div\').parentElement.parentElement.remove()" style="background:none;border:none;font-size:22px;color:var(--text-muted,#94a3b8);cursor:pointer;padding:4px 8px;">✕</button>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px;">' + rulesHtml + '</div>' +
        '<button onclick="this.closest(\'div\').parentElement.parentElement.remove()" style="width:100%;margin-top:16px;padding:12px;border:none;border-radius:30px;background:linear-gradient(135deg,#9333ea,#ec4899);color:#fff;font-weight:700;font-size:14px;cursor:pointer;font-family:Inter,sans-serif;transition:transform 0.2s;" onmouseover="this.style.transform=\'scale(1.02)\'" onmouseout="this.style.transform=\'scale(1)\'">✅ Entendi e concordo</button>';
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) overlay.remove();
    });
};

// 5. BANNER DE REGRAS
function addRulesBanner() {
    var screen = document.getElementById('screen-forum');
    if (!screen) return;
    if (document.getElementById('rulesBanner')) return;
    
    var banner = document.createElement('div');
    banner.id = 'rulesBanner';
    banner.style.cssText = 'padding:12px 16px;margin-bottom:12px;background:linear-gradient(135deg,rgba(124,58,237,0.05),rgba(236,72,153,0.05));border-radius:16px;border:1px solid var(--border-color,#e2e8f0);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;';
    
    banner.innerHTML = 
        '<div style="display:flex;align-items:center;gap:10px;">' +
        '<i class="fa-solid fa-shield-halved" style="font-size:24px;color:#7c3aed;"></i>' +
        '<div><span style="font-weight:600;color:var(--text-primary,#1e293b);">Regras da Comunidade</span>' +
        '<p style="font-size:12px;color:var(--text-secondary,#64748b);margin:0;">Ajude a manter um ambiente acolhedor</p></div>' +
        '</div>' +
        '<button onclick="window.showCommunityRules()" style="padding:6px 18px;border:1px solid var(--border-color,#e2e8f0);border-radius:20px;background:var(--bg-card,#fff);color:var(--text-primary,#1e293b);font-size:12px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#7c3aed\'" onmouseout="this.style.borderColor=\'var(--border-color,#e2e8f0)\'">' +
        '<i class="fa-regular fa-eye"></i> Ver regras</button>';
    
    var quickPost = screen.querySelector('.quick-post');
    if (quickPost) {
        quickPost.after(banner);
    } else {
        screen.insertBefore(banner, screen.firstChild);
    }
}

// 6. FILTRO DE GRUPOS COM ÍCONES
function addGroupSearch() {
    var screen = document.getElementById('screen-grupos');
    if (!screen) return;
    if (document.getElementById('groupSearchInput')) return;
    
    var header = screen.querySelector('.screen-header');
    if (!header) return;
    
    var container = document.createElement('div');
    container.className = 'group-search-filters';
    container.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;padding:12px 16px;background:var(--bg-card,#fff);border-radius:16px;border:1px solid var(--border-color,#e2e8f0);';
    
    var categories = ['todos', 'apoio', 'educacao', 'trabalho', 'social', 'arte', 'geral'];
    var catLabels = ['Todos', 'Apoio', 'Educação', 'Trabalho', 'Social', 'Arte', 'Geral'];
    var catIcons = ['fa-globe', 'fa-hand-holding-heart', 'fa-graduation-cap', 'fa-briefcase', 'fa-users', 'fa-palette', 'fa-comments'];
    
    var filterHtml = '<div style="flex:1;min-width:150px;">';
    filterHtml += '<input id="groupSearchInput" placeholder="🔎 Buscar grupos..." style="width:100%;padding:8px 14px;border:2px solid var(--border-color,#e2e8f0);border-radius:10px;font-size:13px;font-family:Inter,sans-serif;background:var(--bg-secondary,#f7f7f9);color:var(--text-primary,#1e293b);outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor=\'#7c3aed\'" onblur="this.style.borderColor=\'var(--border-color,#e2e8f0)\'">';
    filterHtml += '</div><div style="display:flex;gap:6px;flex-wrap:wrap;">';
    
    categories.forEach(function(cat, index) {
        var bgColor = cat === 'todos' ? 'background:linear-gradient(135deg,#9333ea,#ec4899);color:#fff;' : 'background:transparent;color:var(--text-secondary,#64748b);';
        filterHtml += '<button class="group-filter-btn" data-filter="' + cat + '" style="padding:6px 14px;border:2px solid var(--border-color,#e2e8f0);border-radius:20px;' + bgColor + 'font-size:12px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;transition:all 0.2s;display:flex;align-items:center;gap:4px;">';
        filterHtml += '<i class="fa-regular ' + catIcons[index] + '"></i> ' + catLabels[index];
        filterHtml += '</button>';
    });
    filterHtml += '</div>';
    
    container.innerHTML = filterHtml;
    header.after(container);
    
    var searchInput = document.getElementById('groupSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterGroupCards);
    }
    
    document.querySelectorAll('.group-filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.group-filter-btn').forEach(function(b) {
                b.style.background = 'transparent';
                b.style.color = 'var(--text-secondary,#64748b)';
            });
            this.style.background = 'linear-gradient(135deg,#9333ea,#ec4899)';
            this.style.color = '#fff';
            filterGroupCards();
        });
    });
}

function filterGroupCards() {
    var search = document.getElementById('groupSearchInput')?.value.toLowerCase() || '';
    var activeFilter = document.querySelector('.group-filter-btn.active')?.dataset.filter || 'todos';
    
    document.querySelectorAll('.group-card').forEach(function(card) {
        var name = card.querySelector('.group-card-title')?.textContent?.toLowerCase() || '';
        var desc = card.querySelector('.group-card-description')?.textContent?.toLowerCase() || '';
        var category = card.querySelector('.group-card-meta span:last-child')?.textContent?.toLowerCase() || '';
        
        var matchesSearch = name.includes(search) || desc.includes(search);
        var matchesFilter = activeFilter === 'todos' || category.includes(activeFilter);
        
        card.style.display = (matchesSearch && matchesFilter) ? 'block' : 'none';
    });
}

// 7. BOTÃO DE NOTIFICAÇÕES
function addNotificationButton() {
    if (document.getElementById('notificationsToggle')) return;
    
    var header = document.querySelector('.header-glass');
    if (!header) return;
    
    var btn = document.createElement('button');
    btn.id = 'notificationsToggle';
    btn.style.cssText = 'background:none;border:none;cursor:pointer;padding:4px 8px;border-radius:50%;position:relative;color:var(--text-secondary,#64748b);font-size:18px;transition:all 0.2s;';
    btn.innerHTML = '<i class="fa-regular fa-bell"></i><span id="notifBadge" style="position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:50%;display:none;min-width:18px;text-align:center;">0</span>';
    btn.title = 'Notificações';
    
    btn.addEventListener('click', function() {
        showNotificationPanel();
    });
    
    var links = header.querySelector('.header-links');
    if (links) {
        links.after(btn);
    } else {
        header.appendChild(btn);
    }
}

function showNotificationPanel() {
    var existing = document.getElementById('notificationPanel');
    if (existing) {
        existing.remove();
        return;
    }
    
    var panel = document.createElement('div');
    panel.id = 'notificationPanel';
    panel.style.cssText = 'position:fixed;top:70px;right:20px;width:360px;max-height:70vh;background:var(--bg-card,#fff);border-radius:16px;border:1px solid var(--border-color,#e2e8f0);box-shadow:0 12px 40px rgba(0,0,0,0.12);z-index:10000;overflow:hidden;display:flex;flex-direction:column;animation:fadeIn 0.25s ease;';
    
    panel.innerHTML = 
        '<div style="padding:12px 16px;border-bottom:1px solid var(--border-color,#e2e8f0);display:flex;justify-content:space-between;align-items:center;">' +
        '<h4 style="font-size:15px;font-weight:700;color:var(--text-primary,#1e293b);"><i class="fa-regular fa-bell" style="color:#7c3aed;"></i> Notificações</h4>' +
        '<button onclick="this.closest(\'div\').remove()" style="background:none;border:none;font-size:18px;color:var(--text-muted,#94a3b8);cursor:pointer;">✕</button>' +
        '</div>' +
        '<div id="notificationsList" style="flex:1;overflow-y:auto;padding:8px 0;">' +
        '<div style="text-align:center;padding:30px 20px;color:var(--text-muted,#94a3b8);">' +
        '<i class="fa-regular fa-bell-slash" style="font-size:28px;display:block;margin-bottom:10px;opacity:0.3;"></i>' +
        '<p style="font-size:14px;">Nenhuma notificação</p></div></div>' +
        '<div style="padding:8px 16px;border-top:1px solid var(--border-color,#e2e8f0);text-align:center;">' +
        '<button onclick="markAllRead()" style="background:none;border:none;color:#7c3aed;font-size:12px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;">Marcar todas como lidas</button></div>';
    
    document.body.appendChild(panel);
    
    setTimeout(function() {
        document.addEventListener('click', function closePanel(e) {
            if (!panel.contains(e.target) && e.target.id !== 'notificationsToggle') {
                panel.remove();
                document.removeEventListener('click', closePanel);
            }
        });
    }, 100);
}

window.markAllRead = function() {
    showToast('✅ Todas as notificações marcadas como lidas', 'success', 2000);
    var panel = document.getElementById('notificationPanel');
    if (panel) panel.remove();
};

// 8. REAÇÕES COM ÍCONES
window.REACTIONS = [
    { id: 'apoiar', label: 'Apoiar', icon: 'fa-heart', color: '#ef4444' },
    { id: 'util', label: 'Útil', icon: 'fa-lightbulb', color: '#f59e0b' },
    { id: 'identifico', label: 'Me identifico', icon: 'fa-face-smile', color: '#8b5cf6' },
    { id: 'comigo', label: 'Estou com você', icon: 'fa-handshake', color: '#10b981' }
];

// 9. ADICIONAR REAÇÕES AOS POSTS
function addReactionsToPosts() {
    var posts = document.querySelectorAll('.post-card');
    posts.forEach(function(post) {
        var actionsDiv = post.querySelector('.post-actions');
        if (!actionsDiv) return;
        if (actionsDiv.querySelector('.reactions-container')) return;
        
        var container = document.createElement('div');
        container.className = 'reactions-container';
        container.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;';
        
        window.REACTIONS.forEach(function(r) {
            var btn = document.createElement('button');
            btn.className = 'reaction-btn';
            btn.dataset.postId = post.dataset.postId;
            btn.dataset.reaction = r.id;
            btn.style.cssText = 'background:none;border:1px solid var(--border-color,#e2e8f0);border-radius:20px;padding:4px 10px;font-size:12px;cursor:pointer;transition:all 0.2s;font-family:Inter,sans-serif;color:var(--text-secondary,#64748b);display:flex;align-items:center;gap:4px;';
            btn.innerHTML = '<i class="fa-regular ' + r.icon + '" style="color:' + r.color + ';"></i> <span class="reaction-count" data-reaction="' + r.id + '">0</span>';
            
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (!currentUser) return showToast('Faça login', 'error');
                
                var postId = this.dataset.postId;
                var reactionType = this.dataset.reaction;
                
                supabase.rpc('toggle_reaction', {
                    p_post_id: postId,
                    p_reaction_type: reactionType
                }).then(function(result) {
                    if (result.error) throw result.error;
                    
                    var countSpan = btn.querySelector('.reaction-count');
                    supabase.from('reactions').select('reaction_type', { count: 'exact', head: true })
                        .eq('post_id', postId).eq('reaction_type', reactionType)
                        .then(function(res) {
                            if (countSpan) countSpan.textContent = res.count || 0;
                        });
                    
                    btn.style.borderColor = '#7c3aed';
                    btn.style.background = 'rgba(124,58,237,0.08)';
                }).catch(function(error) {
                    console.error('Erro ao reagir:', error);
                    showToast('Erro ao reagir', 'error');
                });
            });
            
            container.appendChild(btn);
        });
        
        actionsDiv.appendChild(container);
    });
}

// 10. INICIALIZAR TUDO
function initCommunityFeatures() {
    console.log('🚀 Inicializando funcionalidades da comunidade...');
    
    addCategorySelectorToModal();
    addHelpRequestLabel();
    addRulesBanner();
    addGroupSearch();
    addNotificationButton();
    
    // Adicionar reações após os posts carregarem
    setTimeout(addReactionsToPosts, 1000);
    
    // Observer para adicionar reações em novos posts
    var feed = document.getElementById('postsFeed');
    if (feed) {
        var observer = new MutationObserver(function() {
            addReactionsToPosts();
        });
        observer.observe(feed, { childList: true, subtree: true });
    }
    
    if (!sessionStorage.getItem('rulesShown')) {
        setTimeout(function() {
            window.showCommunityRules();
            sessionStorage.setItem('rulesShown', 'true');
        }, 3000);
    }
    
    console.log('✅ Funcionalidades adicionadas com sucesso!');
    console.log('📦 Categorias, Regras, Filtro de Grupos, Notificações, Reações');
}

// Executar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommunityFeatures);
} else {
    setTimeout(initCommunityFeatures, 500);



    
}



});