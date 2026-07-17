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
    let communityJoined = JSON.parse(localStorage.getItem('communityJoined') || 'false');
    const COMMUNITY_CHAT_ID = '00000000-0000-0000-0000-000000000001';

    // CONFIGURAÇÕES DE VÍDEO
    const VIDEO_BUCKET = 'videos';
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

    function getUserAvatar() {
        return localStorage.getItem('userAvatar') || AVATAR_PADRAO;
    }

    function getUserName() {
        return localStorage.getItem('userName') || currentUser?.email?.split('@')[0] || 'Usuário';
    }

    function saveCommunityState() {
        localStorage.setItem('communityJoined', JSON.stringify(communityJoined));
    }

    function updateCommunityJoinButton() {
        const joinBtn = document.querySelector('.btn-join');
        if (!joinBtn) return;
        joinBtn.innerHTML = communityJoined 
            ? '<i class="fa-solid fa-check"></i> Unido' 
            : '<i class="fa-solid fa-users"></i> Unir-se';
        joinBtn.classList.toggle('joined', communityJoined);
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
    // 1. SINCRONIZAÇÃO DE PERFIL (Top Bar)
    // =============================================
    function syncProfileFromStorage() {
        const savedName = localStorage.getItem('userName');
        const savedEmail = localStorage.getItem('userEmail');
        const savedAvatar = getUserAvatar();
        
        const topBarAvatar = document.getElementById('topBarAvatar');
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        const sidebarUserName = document.getElementById('sidebarUserName');
        const sidebarUserEmail = document.getElementById('sidebarUserEmail');
        
        if (topBarAvatar) {
            topBarAvatar.src = savedAvatar;
            topBarAvatar.onerror = () => { topBarAvatar.src = AVATAR_PADRAO; };
        }
        if (sidebarAvatar) {
            sidebarAvatar.src = savedAvatar;
            sidebarAvatar.onerror = () => { sidebarAvatar.src = AVATAR_PADRAO; };
        }
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
    // 2. BOTÃO VOLTAR
    // =============================================
    document.getElementById('backBtn')?.addEventListener('click', () => {
        window.history.back();
    });

    // =============================================
    // 3. PERFIL COLAPSÁVEL (Sidebar)
    // =============================================
    const profileToggle = document.getElementById('profileToggle');
    const profileDetail = document.getElementById('profileDetail');
    if (profileToggle && profileDetail) {
        profileToggle.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
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
    // 4. ACESSIBILIDADE
    // =============================================
    function getSetting(key, fallback = 'false') { 
        return localStorage.getItem(`a11y_${key}`) || fallback; 
    }
    
    function setSetting(key, value) { 
        localStorage.setItem(`a11y_${key}`, value); 
    }
    
    function toggleBodyClass(className, settingKey) {
        const current = getSetting(settingKey);
        const newValue = current === 'true' ? 'false' : 'true';
        setSetting(settingKey, newValue);
        if (newValue === 'true') body.classList.add(className);
        else body.classList.remove(className);
        return newValue;
    }
    
    function updateStatusLabel(elementId, isActive) {
        const el = document.getElementById(elementId);
        if (el) el.textContent = isActive ? 'Ligado' : 'Desligado';
    }
    
    function applySavedSettings() {
        if (getSetting('darkMode') === 'true') body.classList.add('a11y-dark-mode');
        if (getSetting('highlightLinks') === 'true') body.classList.add('a11y-highlight-links');
        if (getSetting('dyslexiaFont') === 'true') body.classList.add('a11y-dyslexia');
        if (getSetting('reduceMotion') === 'true') body.classList.add('a11y-reduce-motion');
        updateStatusLabel('darkModeStatus', getSetting('darkMode') === 'true');
        updateStatusLabel('linksStatus', getSetting('highlightLinks') === 'true');
        updateStatusLabel('dyslexiaStatus', getSetting('dyslexiaFont') === 'true');
        updateStatusLabel('motionStatus', getSetting('reduceMotion') === 'true');
        
        const textSize = getSetting('textSize', 'normal');
        if (textSize === 'large') body.classList.add('a11y-large-text');
        else if (textSize === 'small') body.classList.add('a11y-small-text');
    }
    applySavedSettings();

    // =============================================
    // 5. HUB FLUTUANTE
    // =============================================
    const hubToggle = document.getElementById('floatingHubToggle');
    const hubMenu = document.getElementById('floatingHubMenu');
    const hubOverlay = document.getElementById('floatingOverlay');

    function toggleHub() {
        if (!hubMenu || !hubOverlay) {
            console.warn('⚠️ Hub elements not found!');
            return;
        }
        const isOpen = !hubMenu.hidden;
        hubMenu.hidden = isOpen;
        hubOverlay.hidden = isOpen;
        if (hubToggle) hubToggle.setAttribute('aria-expanded', !isOpen);
    }

    function closeHub() {
        if (!hubMenu || !hubOverlay) return;
        hubMenu.hidden = true;
        hubOverlay.hidden = true;
        if (hubToggle) hubToggle.setAttribute('aria-expanded', 'false');
    }

    if (hubToggle) {
        hubToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleHub();
        });
    }

    if (hubOverlay) {
        hubOverlay.addEventListener('click', closeHub);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeHub();
        }
    });

    // =============================================
    // 6. ATUALIZAR STATUS DO HUB
    // =============================================
    function updateHubStatus() {
        const darkLabel = document.querySelector('.hub-action[data-a11y="darkMode"] .hub-action-label');
        if (darkLabel) {
            darkLabel.textContent = body.classList.contains('a11y-dark-mode') ? 'Claro' : 'Escuro';
        }

        const dyslexiaLabel = document.querySelector('.hub-action[data-a11y="dyslexiaFont"] .hub-action-label');
        if (dyslexiaLabel) {
            dyslexiaLabel.textContent = body.classList.contains('a11y-dyslexia') ? 'Ativo' : 'Dislexia';
        }

        const motionLabel = document.querySelector('.hub-action[data-a11y="reduceMotion"] .hub-action-label');
        if (motionLabel) {
            motionLabel.textContent = body.classList.contains('a11y-reduce-motion') ? 'Ativo' : 'Movimento';
        }
    }

    updateHubStatus();

    // =============================================
    // 7. AÇÕES DO HUB
    // =============================================
    document.querySelectorAll('.hub-action[data-a11y]').forEach((item) => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = item.getAttribute('data-a11y');
            let message = '';

            switch (action) {
                case 'darkMode': {
                    const dm = toggleBodyClass('a11y-dark-mode', 'darkMode');
                    updateStatusLabel('darkModeStatus', dm === 'true');
                    updateHubStatus();
                    message = dm === 'true' ? '🌙 Modo escuro ativado' : '☀️ Modo claro ativado';
                    break;
                }
                case 'increaseText': {
                    const sz = getSetting('textSize', 'normal');
                    if (sz === 'large') { 
                        setSetting('textSize', 'normal'); 
                        body.classList.remove('a11y-large-text'); 
                        message = '📝 Texto normal'; 
                    } else { 
                        setSetting('textSize', 'large'); 
                        body.classList.add('a11y-large-text'); 
                        message = '🔍 Texto aumentado'; 
                    }
                    break;
                }
                case 'decreaseText': {
                    const cs = getSetting('textSize', 'normal');
                    if (cs === 'small') { 
                        setSetting('textSize', 'normal'); 
                        body.classList.remove('a11y-small-text'); 
                        message = '📝 Texto normal'; 
                    } else { 
                        setSetting('textSize', 'small'); 
                        body.classList.add('a11y-small-text'); 
                        message = '🔍 Texto diminuído'; 
                    }
                    break;
                }
                case 'dyslexiaFont': {
                    const df = toggleBodyClass('a11y-dyslexia', 'dyslexiaFont');
                    updateStatusLabel('dyslexiaStatus', df === 'true');
                    updateHubStatus();
                    message = df === 'true' ? '🔤 Fonte dislexia ativada' : '🔤 Fonte padrão';
                    break;
                }
                case 'reduceMotion': {
                    const rm = toggleBodyClass('a11y-reduce-motion', 'reduceMotion');
                    updateStatusLabel('motionStatus', rm === 'true');
                    updateHubStatus();
                    message = rm === 'true' ? '🧘 Animações reduzidas' : '🏃 Animações normais';
                    break;
                }
                case 'reset': {
                    ['darkMode','highlightLinks','dyslexiaFont','reduceMotion','textSize'].forEach(k => localStorage.removeItem(`a11y_${k}`));
                    body.classList.remove('a11y-dark-mode','a11y-highlight-links','a11y-dyslexia','a11y-reduce-motion','a11y-large-text','a11y-small-text');
                    updateStatusLabel('darkModeStatus', false);
                    updateStatusLabel('linksStatus', false);
                    updateStatusLabel('dyslexiaStatus', false);
                    updateStatusLabel('motionStatus', false);
                    updateHubStatus();
                    message = '🔄 Configurações restauradas';
                    break;
                }
            }
            if (message) showToast(message, 'info');
            closeHub();
        });
    });

    document.querySelectorAll('.hub-action[href]').forEach((link) => {
        link.addEventListener('click', closeHub);
    });

    // =============================================
    // 8. TOAST
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
    // 9. LOGOUT
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
    // 10. BANCO DE DADOS (Supabase)
    // =============================================
    async function loadPosts() {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
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
            .limit(20);
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
            day:'2-digit', 
            month:'2-digit', 
            year:'numeric', 
            hour:'2-digit', 
            minute:'2-digit' 
        }); 
    }
    
    function formatChatTime(d) { 
        return new Date(d).toLocaleTimeString('pt-BR', { 
            hour:'2-digit', 
            minute:'2-digit' 
        }); 
    }
    
    function formatEventDate(d) { 
        return new Date(d).toLocaleDateString('pt-BR', { 
            day:'2-digit', 
            month:'long', 
            year:'numeric', 
            hour:'2-digit', 
            minute:'2-digit' 
        }); 
    }

    // =============================================
    // 11. UPLOAD DE VÍDEO
    // =============================================
    async function uploadVideo(file) {
        console.log('📹 Iniciando upload do vídeo:', file.name);
        
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
            console.log('📹 Nome do arquivo no storage:', fileName);
            
            const { data, error } = await supabase.storage
                .from(VIDEO_BUCKET)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });
                
            if (error) {
                console.error('❌ Erro no upload:', error);
                showToast('Erro ao enviar vídeo: ' + error.message, 'error');
                return null;
            }
            
            console.log('✅ Upload concluído:', data);
            
            const { data: { publicUrl } } = supabase.storage
                .from(VIDEO_BUCKET)
                .getPublicUrl(fileName);
                
            console.log('✅ URL pública do vídeo:', publicUrl);
            showToast('✅ Vídeo enviado com sucesso! 🎬', 'success');
            return publicUrl;
            
        } catch (error) {
            console.error('❌ Erro inesperado:', error);
            showToast('Erro ao enviar vídeo', 'error');
            return null;
        }
    }

    // =============================================
    // 12. FUNÇÃO DE TELA CHEIA PARA VÍDEOS
    // =============================================
    function toggleFullscreen(video) {
        if (!video) return;
        
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
            video.msRequestFullscreen();
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
    // 13. INTEGRAÇÃO DO UPLOAD DE VÍDEO
    // =============================================
    
    const videoUploadInput = document.createElement('input');
    videoUploadInput.type = 'file';
    videoUploadInput.accept = 'video/*';
    videoUploadInput.id = 'videoUploadInput';
    videoUploadInput.style.display = 'none';
    document.body.appendChild(videoUploadInput);

    function showVideoPreview(videoUrl, containerSelector) {
        const oldPreview = document.querySelector('.video-preview-container');
        if (oldPreview) oldPreview.remove();
        
        const container = document.createElement('div');
        container.className = 'video-preview-container';
        container.innerHTML = `
            <div class="video-preview-wrapper" style="position:relative;margin:12px 0;border-radius:12px;overflow:hidden;background:#000;">
                <video controls style="width:100%;max-height:300px;display:block;">
                    <source src="${videoUrl}" type="video/mp4">
                    Seu navegador não suporta vídeos.
                </video>
                <button class="video-preview-remove" style="position:absolute;top:12px;right:12px;background:rgba(0,0,0,0.7);color:white;border:none;padding:8px 16px;border-radius:30px;cursor:pointer;font-size:13px;font-weight:600;transition:all 0.3s;z-index:10;display:flex;align-items:center;gap:6px;" 
                        onclick="removeVideoPreview(this)">
                    <i class="fa-solid fa-xmark"></i> Remover
                </button>
            </div>
        `;
        
        const target = document.querySelector(containerSelector || '.compose-workspace');
        if (target) {
            target.insertBefore(container, target.firstChild);
        }
    }

    window.removeVideoPreview = function(button) {
        const container = button.closest('.video-preview-container');
        if (container) container.remove();
        
        const postInput = document.getElementById('postContentInput');
        if (postInput) {
            postInput.value = postInput.value.replace(/📹 Vídeo: https?:\/\/[^\s]+\s*/, '');
        }
    };

    videoUploadInput.addEventListener('change', async function(e) {
        const file = this.files[0];
        if (!file) return;
        
        this.disabled = true;
        const videoUrl = await uploadVideo(file);
        this.disabled = false;
        this.value = '';
        
        if (videoUrl) {
            const postInput = document.getElementById('postContentInput');
            if (postInput) {
                const currentText = postInput.value;
                const videoMarkdown = `\n📹 Vídeo: ${videoUrl}\n`;
                postInput.value = currentText + videoMarkdown;
                showVideoPreview(videoUrl, '#postModal .compose-workspace');
                showToast('✅ Vídeo pronto para postar! 🎬', 'success');
            }
        }
    });

    // Botões de mídia
    document.querySelector('#postModal .compose-toolbar button[title="Mídia"]')?.addEventListener('click', (e) => {
        e.preventDefault();
        videoUploadInput.click();
    });

    document.querySelector('#replyModal .compose-toolbar button[title="Mídia"]')?.addEventListener('click', (e) => {
        e.preventDefault();
        videoUploadInput.click();
    });

    document.querySelector('#feedMediaBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        videoUploadInput.click();
    });

    document.getElementById('postMediaBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        videoUploadInput.click();
    });

    document.getElementById('replyMediaBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        videoUploadInput.click();
    });

    // =============================================
    // 14. RENDERIZAÇÕES
    // =============================================
    let likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
    let postsCache = [];
    let commentsCache = {};
    
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
        commentsCache[postId] = comments;
        
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
                        content: text 
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

        document.querySelectorAll('.post-video-container video').forEach(video => {
            video.addEventListener('dblclick', function() {
                toggleFullscreen(this);
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

    // =============================================
    // 15. RENDER POSTS COM VÍDEO + TELA CHEIA
    // =============================================
    async function renderPosts() {
        const grid = document.getElementById('postsGrid');
        if (!grid) return;
        
        const posts = await loadPosts();
        postsCache = posts;
        
        if (!posts || posts.length === 0) {
            grid.innerHTML = `
                <div class="no-content" style="text-align:center;padding:60px 20px;color:#888;">
                    <i class="fa-solid fa-feather" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></i>
                    <p style="font-size:16px;font-weight:500;">Nenhum post ainda</p>
                    <p style="font-size:14px;color:#aaa;">Seja o primeiro a compartilhar algo com a comunidade!</p>
                </div>
            `;
            return;
        }
        
        const userAvatar = getUserAvatar();
        
        const postsWithVideo = posts.filter(p => p.video_url && p.video_url.trim() !== '' && p.video_url !== 'null');
        console.log(`📹 Total de posts: ${posts.length}, com vídeo: ${postsWithVideo.length}`);
        
        grid.innerHTML = posts.map(p => {
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
            <article class="post-card" data-post-id="${p.id}">
                <div class="post-header">
                    <div class="post-author-avatar-wrapper">
                        <img src="${postAvatar}" class="post-author-avatar" 
                             onerror="this.style.display='none';this.parentElement.querySelector('.post-author-fallback').style.display='flex';" 
                             alt="${escapeHtml(p.author_name||'U')}">
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
                            <button class="action-btn repost-btn" data-post-id="${p.id}">
                                <i class="fa-solid fa-retweet"></i>
                            </button>
                            <button class="action-btn share-btn" data-post-id="${p.id}">
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
            </article>`;
        }).join('');
        
        setupPostEvents();
    }

    // =============================================
    // 16. STORIES - ESTILO INSTAGRAM
    // =============================================
    
    async function loadStories() {
        try {
            const { data: users, error } = await supabase
                .from('profiles')
                .select('*')
                .limit(20);

            if (error) throw error;

            const storiesList = document.getElementById('storiesList');
            if (!storiesList) return;

            const filteredUsers = users.filter(u => u.id !== currentUser?.id);

            if (filteredUsers.length === 0) {
                storiesList.innerHTML = `
                    <div class="story-empty">
                        <span style="color:var(--text-muted);font-size:12px;">
                            Convide amigos para a comunidade!
                        </span>
                    </div>
                `;
                return;
            }

            storiesList.innerHTML = filteredUsers.map(user => `
                <div class="story-item" data-user-id="${user.id}" onclick="openStory('${user.id}')">
                    <div class="story-avatar-wrapper">
                        <img src="${user.avatar_url || '/img/avatar-padrao.png'}" 
                             alt="${user.username}" 
                             class="story-avatar"
                             onerror="this.src='/img/avatar-padrao.png'">
                    </div>
                    <span class="story-username">${user.username || 'Usuário'}</span>
                </div>
            `).join('');

        } catch (error) {
            console.error('❌ Erro ao carregar stories:', error);
        }
    }

    // =============================================
    // 17. PERFIL DO USUÁRIO
    // =============================================
    
    async function loadProfile() {
        try {
            if (!currentUser) return;

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single();

            if (error) throw error;

            const profileAvatar = document.getElementById('profileAvatar');
            const profileUsername = document.getElementById('profileUsername');
            const profileBio = document.getElementById('profileBio');
            const myStoryAvatar = document.getElementById('myStoryAvatar');

            if (profileAvatar) {
                profileAvatar.src = profile.avatar_url || '/img/avatar-padrao.png';
                profileAvatar.onerror = () => { profileAvatar.src = '/img/avatar-padrao.png'; };
            }

            if (myStoryAvatar) {
                myStoryAvatar.src = profile.avatar_url || '/img/avatar-padrao.png';
                myStoryAvatar.onerror = () => { myStoryAvatar.src = '/img/avatar-padrao.png'; };
            }

            if (profileUsername) {
                profileUsername.textContent = profile.username || 'Usuário';
            }

            if (profileBio) {
                profileBio.textContent = profile.bio || '💜 Aqui para um bom momento';
            }

            const postCount = document.getElementById('postCount');
            const followersCount = document.getElementById('followersCount');
            const followingCount = document.getElementById('followingCount');

            if (postCount) postCount.textContent = profile.posts_count || 0;
            if (followersCount) followersCount.textContent = profile.followers_count || 0;
            if (followingCount) followingCount.textContent = profile.following_count || 0;

        } catch (error) {
            console.error('❌ Erro ao carregar perfil:', error);
        }
    }

    // =============================================
    // 18. ABRIR STORY
    // =============================================
    
    window.openStory = function(userId) {
        const overlay = document.createElement('div');
        overlay.className = 'story-modal-overlay';
        overlay.innerHTML = `
            <div class="story-modal">
                <div class="story-progress-bar">
                    <div class="story-progress-fill" id="storyProgress"></div>
                </div>
                <button class="story-modal-close" onclick="this.closest('.story-modal-overlay').remove()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="story-modal-user">
                    <img src="/img/avatar-padrao.png" alt="Usuário" id="storyModalAvatar">
                    <span id="storyModalUsername">Carregando...</span>
                </div>
                <div class="story-modal-content" id="storyModalContent">
                    <div style="color:white;text-align:center;padding:40px;">
                        <i class="fa-solid fa-spinner fa-spin" style="font-size:32px;"></i>
                        <p style="margin-top:16px;">Carregando story...</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        loadStoryData(userId, overlay);
    };

    async function loadStoryData(userId, overlay) {
        try {
            const { data: user, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            const avatar = overlay.querySelector('#storyModalAvatar');
            const username = overlay.querySelector('#storyModalUsername');
            
            if (avatar) {
                avatar.src = user.avatar_url || '/img/avatar-padrao.png';
                avatar.onerror = () => { avatar.src = '/img/avatar-padrao.png'; };
            }
            if (username) {
                username.textContent = user.username || 'Usuário';
            }

            const { data: story, error: storyError } = await supabase
                .from('stories')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (storyError && storyError.code !== 'PGRST116') throw storyError;

            const content = overlay.querySelector('#storyModalContent');
            
            if (story) {
                if (story.media_type === 'video') {
                    content.innerHTML = `
                        <video controls autoplay style="width:100%;max-height:70vh;border-radius:12px;">
                            <source src="${story.media_url}" type="video/mp4">
                            Seu navegador não suporta vídeos.
                        </video>
                    `;
                } else {
                    content.innerHTML = `
                        <img src="${story.media_url}" alt="Story" style="width:100%;max-height:70vh;border-radius:12px;object-fit:cover;">
                    `;
                }
            } else {
                content.innerHTML = `
                    <div style="color:white;text-align:center;padding:40px;">
                        <i class="fa-regular fa-face-smile" style="font-size:48px;opacity:0.3;"></i>
                        <p style="margin-top:16px;font-size:16px;">Nenhum story disponível</p>
                        <p style="font-size:13px;color:rgba(255,255,255,0.5);">Este usuário ainda não postou um story</p>
                    </div>
                `;
            }

            const progress = overlay.querySelector('#storyProgress');
            if (progress) {
                let width = 0;
                const interval = setInterval(() => {
                    width += 2;
                    progress.style.width = width + '%';
                    if (width >= 100) {
                        clearInterval(interval);
                        setTimeout(() => {
                            overlay.remove();
                        }, 500);
                    }
                }, 100);
            }

        } catch (error) {
            console.error('❌ Erro ao carregar story:', error);
            const content = overlay.querySelector('#storyModalContent');
            if (content) {
                content.innerHTML = `
                    <div style="color:white;text-align:center;padding:40px;">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size:32px;opacity:0.3;"></i>
                        <p style="margin-top:16px;">Erro ao carregar story</p>
                    </div>
                `;
            }
        }
    }

    // =============================================
    // 19. ADICIONAR STORY
    // =============================================
    
    document.getElementById('addStoryBtn')?.addEventListener('click', () => {
        if (!currentUser) {
            showToast('Faça login para postar um story', 'error');
            return;
        }
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.click();
        
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            showToast('📤 Publicando story...', 'info');
            
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `stories/${currentUser.id}/${Date.now()}.${fileExt}`;
                
                const { data, error } = await supabase.storage
                    .from('stories')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false
                    });
                    
                if (error) throw error;
                
                const { data: { publicUrl } } = supabase.storage
                    .from('stories')
                    .getPublicUrl(fileName);
                
                const { error: insertError } = await supabase
                    .from('stories')
                    .insert({
                        user_id: currentUser.id,
                        media_url: publicUrl,
                        media_type: file.type.startsWith('video') ? 'video' : 'image',
                        created_at: new Date().toISOString()
                    });
                    
                if (insertError) throw insertError;
                
                showToast('✅ Story publicado! 🎬', 'success');
                loadStories();
                
            } catch (error) {
                console.error('❌ Erro ao publicar story:', error);
                showToast('Erro ao publicar story', 'error');
            }
        });
    });

    // =============================================
    // 20. EDITAR PERFIL
    // =============================================
    
    document.getElementById('editProfileBtn')?.addEventListener('click', () => {
        if (!currentUser) {
            showToast('Faça login para editar', 'error');
            return;
        }
        window.location.href = '/configurações/configurações.html';
    });

    document.getElementById('editProfileActionBtn')?.addEventListener('click', () => {
        if (!currentUser) {
            showToast('Faça login para editar', 'error');
            return;
        }
        window.location.href = '/configurações/configurações.html';
    });

    // =============================================
    // 21. COMPARTILHAR PERFIL
    // =============================================
    
    document.getElementById('shareProfileBtn')?.addEventListener('click', () => {
        const username = document.getElementById('profileUsername')?.textContent || 'usuário';
        const url = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: `Perfil de ${username}`,
                text: `Conheça o perfil de ${username} na comunidade Amor NeuroDivergente! 💜`,
                url: url
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(url).then(() => {
                showToast('Link copiado! 📋', 'success');
            }).catch(() => {
                showToast('Compartilhe: ' + url, 'info');
            });
        }
    });

    // =============================================
    // 22. CHAT EM TEMPO REAL - CORRIGIDO
    // =============================================
    
    // VARIÁVEL PARA CONTROLAR O CHAT ATUAL
    let currentChatId = COMMUNITY_CHAT_ID;
    let chatSubscription = null;

    // FUNÇÃO PARA TROCAR DE CHAT
    function switchChat(chatId, chatName) {
        currentChatId = chatId;
        
        // Atualizar header do chat
        const header = document.getElementById('chatMainHeader');
        if (header) {
            const isGroup = chatId !== COMMUNITY_CHAT_ID;
            const icon = isGroup ? 'fa-solid fa-users' : 'fa-solid fa-globe';
            header.innerHTML = `
                <div class="chat-main-header-info">
                    <i class="${icon}"></i>
                    <span>${chatName || 'Chat da Comunidade'}</span>
                </div>
            `;
        }
        
        // Recarregar mensagens do novo chat
        loadChatMessages(chatId);
        
        // Reinscrever para o novo chat
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

    // CARREGAR MENSAGENS - ACEITA chatId como parâmetro
    async function loadChatMessages(chatId = null) {
        const mc = document.getElementById('chatMessages');
        if (!mc) return;
        
        const targetChatId = chatId || currentChatId;
        
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', targetChatId)
            .order('created_at', { ascending: false })
            .limit(50);
            
        if (error) {
            console.error('Erro ao carregar mensagens:', error);
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
                        <div class="chat-video" style="margin:8px 0;border-radius:8px;overflow:hidden;background:#000;max-width:200px;">
                            <video controls style="width:100%;display:block;">
                                <source src="${m.video_url}" type="video/mp4">
                            </video>
                        </div>
                    `;
                }
                
                return `
                <div class="chat-message ${isSent ? 'sent' : 'received'}">
                    ${!isSent ? `
                        <div class="message-avatar-wrapper">
                            <div style="width:36px;height:36px;border-radius:50%;overflow:hidden;flex-shrink:0;">
                                <img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;" 
                                     onerror="this.style.display='none';this.parentElement.querySelector('.fallback').style.display='flex';" 
                                     alt="${senderName}">
                                <div class="fallback" style="display:none;width:36px;height:36px;border-radius:50%;background:${userColor};align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;">${senderName.charAt(0).toUpperCase()}</div>
                            </div>
                        </div>
                    ` : ''}
                    <div class="message-content">
                        <div class="message-author" style="color:${userColor};font-weight:600;">${senderName}</div>
                        <div class="message-text">${escapeHtml(m.content)}</div>
                        ${videoHtml}
                        <div class="message-time">${formatChatTime(m.created_at)}</div>
                    </div>
                    ${isSent ? `
                        <div class="message-avatar-wrapper">
                            <div style="width:36px;height:36px;border-radius:50%;overflow:hidden;flex-shrink:0;">
                                <img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;" 
                                     onerror="this.style.display='none';this.parentElement.querySelector('.fallback').style.display='flex';" 
                                     alt="Você">
                                <div class="fallback" style="display:none;width:36px;height:36px;border-radius:50%;background:${stringToColor(currentUser?.id)};align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;">${getUserName().charAt(0).toUpperCase()}</div>
                            </div>
                        </div>
                    ` : ''}
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
        
        const container = document.querySelector('.chat-messages-area');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    // INSCREVER-SE PARA MENSAGENS DO CHAT ATUAL
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
                () => {
                    loadChatMessages(targetChatId);
                }
            )
            .subscribe((status) => {
                console.log(`📡 Status do chat ${targetChatId}:`, status);
            });
    }

    // ENVIAR MENSAGEM - USA currentChatId
    async function sendMessage() {
        const inp = document.getElementById('chatInput');
        if (!inp || !currentUser) {
            showToast('Faça login para enviar mensagens', 'error');
            return;
        }
        
        const msg = inp.value.trim();
        if (!msg) return showToast('Digite uma mensagem', 'error');
        
        const videoMatch = msg.match(/📹 Vídeo: (https?:\/\/[^\s]+)/);
        const videoUrl = videoMatch ? videoMatch[1] : null;
        const cleanMsg = msg.replace(/📹 Vídeo: https?:\/\/[^\s]+\s*/, '').trim();
        
        const { error } = await supabase
            .from('messages')
            .insert({ 
                conversation_id: currentChatId, 
                sender_id: currentUser.id, 
                sender_name: getUserName(), 
                sender_avatar: getUserAvatar(), 
                content: cleanMsg || msg,
                video_url: videoUrl
            });
            
        if (error) {
            showToast('Erro ao enviar mensagem', 'error');
            console.error('Erro ao enviar mensagem:', error);
        } else {
            inp.value = '';
            await loadChatMessages(currentChatId);
        }
    }

    async function initChat() {
        await ensureCommunityChat();
        await addUserToChat();
        await loadChatMessages(COMMUNITY_CHAT_ID);
        subscribeToMessages(COMMUNITY_CHAT_ID);
    }

    const sendBtn = document.getElementById('sendChatBtn');
    const chatInp = document.getElementById('chatInput');
    
    if (sendBtn) { 
        const nb = sendBtn.cloneNode(true); 
        sendBtn.parentNode.replaceChild(nb, sendBtn); 
        nb.addEventListener('click', sendMessage); 
    }
    
    if (chatInp) { 
        const ni = chatInp.cloneNode(true); 
        chatInp.parentNode.replaceChild(ni, chatInp); 
        ni.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                sendMessage(); 
            } 
        }); 
    }

    // =============================================
    // 23. TABS
    // =============================================
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.addEventListener('click', () => {
            const tab = b.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b2 => b2.classList.remove('active'));
            document.getElementById(`tab-${tab}`)?.classList.add('active');
            b.classList.add('active');
            
            switch(tab) {
                case 'forum': renderPosts(); break;
                case 'grupos': renderGroups(); break;
                case 'eventos': renderEvents(); break;
                case 'conversa': loadChatMessages(); break;
            }
        });
    });

    // =============================================
    // 24. MODAIS DE POST E RESPOSTA
    // =============================================
    const postModal = document.getElementById('postModal');
    const postModalOverlay = document.getElementById('postModalOverlay');
    const closePostModalBtn = document.getElementById('closeModalBtn');
    const submitPostBtn = document.getElementById('submitPostBtn');
    const postContentInput = document.getElementById('postContentInput');
    
    function openPostModal() {
        if (!currentUser) {
            showToast('Faça login para criar um post', 'error');
            return;
        }
        if (postModalOverlay) postModalOverlay.hidden = false;
        if (postContentInput) postContentInput.value = '';
        if (postContentInput) setTimeout(() => postContentInput.focus(), 100);
    }
    
    function closePostModal() {
        if (postModalOverlay) postModalOverlay.hidden = true;
        const preview = document.querySelector('.video-preview-container');
        if (preview) preview.remove();
    }
    
    document.querySelectorAll('#sidebarOpenPostModalBtn, #sidebarOpenPostModalBtn2, #feedSubmitPostBtn').forEach(btn => {
        if (btn) btn.addEventListener('click', openPostModal);
    });
    
    closePostModalBtn?.addEventListener('click', closePostModal);
    postModalOverlay?.addEventListener('click', (e) => {
        if (e.target === postModalOverlay) closePostModal();
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
                tag: '# Comunidade' 
            });
            
        submitPostBtn.disabled = false;
        submitPostBtn.textContent = 'Postar';
        
        if (error) { 
            console.error('Erro ao publicar:', error);
            showToast('Erro ao publicar: ' + error.message, 'error'); 
        } else {
            closePostModal();
            showToast('Post publicado! 🎉', 'success');
            await renderPosts();
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('tab-forum')?.classList.add('active');
            document.querySelector('.tab-btn[data-tab="forum"]')?.classList.add('active');
        }
    });

    // =============================================
    // 25. MODAL DE RESPOSTA
    // =============================================
    const replyModal = document.getElementById('replyModal');
    const replyModalOverlay = document.getElementById('replyModalOverlay');
    const closeReplyModalBtn = document.getElementById('closeReplyModalBtn');
    const submitReplyBtn = document.getElementById('submitReplyBtn');
    const replyContentInput = document.getElementById('replyContentInput');
    let currentReplyPostId = null;

    window.openReplyModal = function(postId, authorName, content) {
        if (!currentUser) {
            showToast('Faça login para responder', 'error');
            return;
        }
        
        currentReplyPostId = postId;
        
        document.getElementById('replyParentName').textContent = authorName || 'Usuário';
        document.getElementById('replyParentHandle').textContent = '@' + (authorName || 'usuario').toLowerCase().replace(/\s/g, '');
        document.getElementById('replyParentTime').textContent = '· agora';
        document.getElementById('replyParentContent').textContent = content || '';
        document.getElementById('replyParentMention').textContent = '@' + (authorName || 'usuario').toLowerCase().replace(/\s/g, '');
        
        if (replyModalOverlay) replyModalOverlay.hidden = false;
        if (replyContentInput) {
            replyContentInput.value = '';
            setTimeout(() => replyContentInput.focus(), 100);
        }
    };

    closeReplyModalBtn?.addEventListener('click', () => {
        if (replyModalOverlay) replyModalOverlay.hidden = true;
    });
    
    replyModalOverlay?.addEventListener('click', (e) => {
        if (e.target === replyModalOverlay) {
            replyModalOverlay.hidden = true;
        }
    });

    submitReplyBtn?.addEventListener('click', async () => {
        const txt = replyContentInput?.value.trim();
        if (!txt) return showToast('Digite sua resposta', 'error');
        if (!currentUser) return showToast('Faça login', 'error');
        if (!currentReplyPostId) return showToast('Erro: post não identificado', 'error');
        
        const videoMatch = txt.match(/📹 Vídeo: (https?:\/\/[^\s]+)/);
        const videoUrl = videoMatch ? videoMatch[1] : null;
        const cleanText = txt.replace(/📹 Vídeo: https?:\/\/[^\s]+\s*/, '').trim();
        
        submitReplyBtn.disabled = true;
        submitReplyBtn.textContent = 'Respondendo...';
        
        const { error } = await supabase
            .from('comments')
            .insert({ 
                post_id: currentReplyPostId, 
                author_id: currentUser.id, 
                author_name: getUserName(), 
                content: cleanText || txt,
                video_url: videoUrl
            });
            
        submitReplyBtn.disabled = false;
        submitReplyBtn.textContent = 'Responder';
        
        if (error) { 
            showToast('Erro ao responder: ' + error.message, 'error'); 
        } else {
            replyModalOverlay.hidden = true;
            showToast('Resposta enviada! 💬', 'success');
            await loadAndShowComments(currentReplyPostId);
            currentReplyPostId = null;
        }
    });

    // =============================================
    // 26. GRUPOS - VERSÃO CORRIGIDA E UNIFICADA
    // =============================================

    // FUNÇÃO PARA CARREGAR GRUPOS
    async function loadGroups() {
        try {
            const { data, error } = await supabase
                .from('groups')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
                
            if (error) {
                console.error('❌ Erro ao carregar grupos:', error.message);
                return [];
            }
            console.log('📋 Grupos carregados:', data?.length || 0);
            return data || [];
        } catch (e) {
            console.error('❌ Erro inesperado ao carregar grupos:', e);
            return [];
        }
    }

    // RENDER GRUPOS
    async function renderGroups() {
        const grid = document.getElementById('groupsGrid');
        if (!grid) {
            console.warn('⚠️ Elemento groupsGrid não encontrado');
            return;
        }
        
        const groups = await loadGroups();
        
        if (!groups || groups.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-users fa-3x"></i>
                    <h4>Nenhum grupo disponível</h4>
                    <p>Seja o primeiro a criar um grupo!</p>
                    <button class="btn-create-group-inline" onclick="openCreateGroupModal()">
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
            
            return `
            <div class="group-card" data-group-id="${g.id}">
                <img src="${imageUrl}" 
                     alt="${g.name}" 
                     class="group-card-image"
                     onerror="this.src='/img/grupo-padrao.png'">
                <div class="group-card-body">
                    <div class="group-card-title">
                        ${g.name}
                        ${isAdmin ? '<span class="admin-badge">Admin</span>' : ''}
                        ${isPrivate ? '<i class="fa-solid fa-lock" style="color: var(--text-muted); font-size: 14px;"></i>' : ''}
                    </div>
                    <p class="group-card-description">${g.description || 'Sem descrição'}</p>
                    <div class="group-card-meta">
                        <span><i class="fa-regular fa-user"></i> ${memberCount} membros</span>
                        <span><i class="fa-regular fa-tag"></i> ${categoryName}</span>
                        <span><i class="fa-regular fa-calendar"></i> ${g.created_at ? formatDate(g.created_at) : ''}</span>
                    </div>
                    <div class="group-card-actions">
                        <button class="btn-join" onclick="joinGroup('${g.id}')">
                            <i class="fa-solid fa-right-to-bracket"></i> Entrar
                        </button>
                        <button class="btn-chat" onclick="openGroupChat('${g.id}')">
                            <i class="fa-regular fa-comments"></i> Conversar
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');
        
        renderChatGroups();
    }

    // RENDER GRUPOS NO CHAT
    function renderChatGroups() {
        const container = document.getElementById('groupsListContainer');
        if (!container) return;

        const geralHtml = `
            <div class="group-chat-item active" data-group-id="community" onclick="switchToCommunityChat()">
                <div class="group-chat-avatar"><i class="fa-solid fa-globe"></i></div>
                <div class="group-chat-info">
                    <h4>Geral da Comunidade</h4>
                    <p>Conversa ativa</p>
                </div>
            </div>
        `;

        loadGroups().then(groups => {
            const userGroupsHtml = groups
                .filter(g => g.is_admin !== true)
                .map(group => `
                    <div class="group-chat-item" data-group-id="${group.id}" onclick="openGroupChat('${group.id}')">
                        <div class="group-chat-avatar">
                            <img src="${group.image_url || '/img/grupo-padrao.png'}" 
                                 alt="${group.name}"
                                 onerror="this.src='/img/grupo-padrao.png'"
                                 style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
                        </div>
                        <div class="group-chat-info">
                            <h4>${group.name}</h4>
                            <p>${group.members || 0} membros</p>
                        </div>
                    </div>
                `).join('');

            container.innerHTML = geralHtml + userGroupsHtml;
        });
    }

    // =============================================
    // 27. FUNÇÕES DOS GRUPOS - UNIFICADAS
    // =============================================

    // Abrir modal de criar grupo
    window.openCreateGroupModal = function() {
        if (!currentUser) {
            showToast('Faça login para criar um grupo', 'error');
            return;
        }
        const modal = document.getElementById('createGroupModal');
        if (modal) {
            modal.removeAttribute('hidden');
            console.log('📂 Modal de criar grupo aberto');
        } else {
            console.error('❌ Modal createGroupModal não encontrado');
            showToast('Erro: Modal não encontrado', 'error');
        }
    };

    // Fechar modal de criar grupo
    window.closeCreateGroupModal = function() {
        const modal = document.getElementById('createGroupModal');
        if (modal) {
            modal.setAttribute('hidden', '');
        }
        const form = document.getElementById('createGroupForm');
        if (form) form.reset();
    };

    // CRIAR GRUPO - ÚNICA VERSÃO
    window.createGroup = async function(event) {
        event.preventDefault();
        console.log('🔄 Criando grupo...');

        const name = document.getElementById('groupName')?.value.trim();
        const description = document.getElementById('groupDescription')?.value.trim();
        const category = document.getElementById('groupCategory')?.value || 'Geral';
        const image = document.getElementById('groupImage')?.value.trim();
        const isPrivate = document.getElementById('groupPrivate')?.checked || false;

        if (!name) {
            showToast('Por favor, insira o nome do grupo.', 'error');
            return;
        }

        if (!currentUser) {
            showToast('Faça login para criar um grupo', 'error');
            return;
        }

        // Verificar se o grupo já existe
        const { data: existing } = await supabase
            .from('groups')
            .select('id')
            .eq('name', name)
            .maybeSingle();

        if (existing) {
            showToast('Já existe um grupo com este nome!', 'error');
            return;
        }

        // Dados para sua tabela
        const groupData = {
            name: name,
            description: description || 'Sem descrição',
            category: category,
            members: 1,
            is_admin: false,
            is_private: isPrivate,
            image_url: image || '/img/grupo-padrao.png',
            created_by: currentUser.id
        };

        console.log('📦 Enviando:', groupData);

        try {
            const { data, error } = await supabase
                .from('groups')
                .insert(groupData)
                .select()
                .single();

            if (error) {
                console.error('❌ Erro:', error);
                if (error.code === '23505') {
                    showToast('Já existe um grupo com este nome!', 'error');
                } else if (error.message.includes('column')) {
                    showToast('Erro de coluna. Verifique os campos.', 'error');
                } else {
                    showToast('Erro: ' + error.message, 'error');
                }
                return;
            }

            console.log('✅ Grupo criado:', data);

            // Adicionar membro (se tabela existir)
            try {
                await supabase
                    .from('group_members')
                    .insert({
                        group_id: data.id,
                        user_id: currentUser.id,
                        joined_at: new Date().toISOString()
                    });
                console.log('✅ Membro adicionado');
            } catch (e) {
                console.warn('⚠️ group_members:', e.message);
            }

            showToast(`Grupo "${name}" criado! 🎉`, 'success');
            closeCreateGroupModal();
            await renderGroups();

        } catch (error) {
            console.error('❌ Erro:', error);
            showToast('Erro ao criar grupo', 'error');
        }
    };

    // ENTRAR NO GRUPO
    window.joinGroup = async function(groupId) {
        if (!currentUser) {
            showToast('Faça login para entrar', 'error');
            return;
        }

        try {
            const { data: group, error: groupError } = await supabase
                .from('groups')
                .select('is_private, members')
                .eq('id', groupId)
                .single();

            if (groupError) throw groupError;

            if (group.is_private) {
                showToast('Grupo privado. Solicite entrada.', 'warning');
                return;
            }

            // Verificar se já é membro
            try {
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
            } catch (e) {
                console.warn('⚠️ group_members:', e.message);
            }

            // Atualizar contador
            await supabase
                .from('groups')
                .update({ members: (group.members || 0) + 1 })
                .eq('id', groupId);

            showToast('Entrou no grupo! 🎉', 'success');
            await renderGroups();

        } catch (error) {
            console.error('❌ Erro:', error);
            showToast('Erro ao entrar: ' + error.message, 'error');
        }
    };

    // ABRIR CHAT DO GRUPO
    window.openGroupChat = async function(groupId) {
        try {
            const { data: group, error } = await supabase
                .from('groups')
                .select('*')
                .eq('id', groupId)
                .single();

            if (error) throw error;

            // Trocar para o chat do grupo
            switchChat(groupId, group.name);

            // Trocar para aba de conversa
            switchToChatTab();
            
            showToast(`Chat: ${group.name}`, 'success');

        } catch (error) {
            console.error('❌ Erro:', error);
            showToast('Erro ao abrir chat', 'error');
        }
    };

    // VOLTAR PARA CHAT GERAL
    window.switchToCommunityChat = function() {
        switchChat(COMMUNITY_CHAT_ID, 'Chat da Comunidade');
        switchToChatTab();
    };

    // TROCAR PARA ABA CONVERSA
    window.switchToChatTab = function() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === 'conversa') {
                btn.classList.add('active');
            }
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const conversa = document.getElementById('tab-conversa');
        if (conversa) conversa.classList.add('active');
    };

    // =============================================
    // 28. EVENTOS (mantido do original)
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
            <div class="event-card-custom">
                <div class="event-date-badge" style="background:${stringToColor(ev.id)};">
                    <span class="event-day">${date.getDate()}</span>
                    <span class="event-month">${date.toLocaleString('pt-BR', { month:'short' }).toUpperCase()}</span>
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
                    await renderEvents();
                } else {
                    showToast('Erro ao confirmar presença', 'error');
                }
            });
        });
    }

    // =============================================
    // 29. BOTÕES DE SEGUIR (Trending)
    // =============================================
    document.querySelectorAll('.follow-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const isFollowing = this.textContent === 'Seguir';
            this.textContent = isFollowing ? 'Seguindo' : 'Seguir';
            this.style.background = isFollowing ? '#10b981' : 'none';
            this.style.color = isFollowing ? '#fff' : 'var(--text-primary)';
            showToast(isFollowing ? 'Seguindo! 💜' : 'Deixou de seguir', 'info');
        });
    });

    // =============================================
    // 30. BOTÃO "MOSTRAR MAIS" (Trending)
    // =============================================
    document.querySelectorAll('.trending-more-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('Carregando mais conteúdos... 🔄', 'info');
        });
    });

    // =============================================
    // 31. BARRA DE PESQUISA
    // =============================================
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim().toLowerCase();
            searchTimeout = setTimeout(() => {
                if (query.length > 0) {
                    const posts = document.querySelectorAll('.post-card');
                    let found = 0;
                    posts.forEach(post => {
                        const text = post.querySelector('.post-text')?.textContent?.toLowerCase() || '';
                        const author = post.querySelector('.post-author-name')?.textContent?.toLowerCase() || '';
                        const match = text.includes(query) || author.includes(query);
                        post.style.display = match ? '' : 'none';
                        if (match) found++;
                    });
                    if (found === 0) {
                        showToast('Nenhum resultado encontrado para: "' + query + '"', 'info');
                    }
                } else {
                    document.querySelectorAll('.post-card').forEach(post => {
                        post.style.display = '';
                    });
                }
            }, 300);
        });
    }

    // =============================================
    // 32. BOTÃO DE PERFIL (Top Bar)
    // =============================================
    document.getElementById('profileMenuBtn')?.addEventListener('click', () => {
        window.location.href = '/configurações/configurações.html';
    });

    // =============================================
    // 33. EVENT LISTENERS DOS MODAIS DE GRUPO
    // =============================================
    
    // Abrir modal de criar grupo
    document.querySelectorAll('#openCreateGroupBtn, #openCreateGroupFromChatBtn').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', window.openCreateGroupModal);
        }
    });

    // Fechar modal de criar grupo
    document.getElementById('closeCreateGroupModal')?.addEventListener('click', window.closeCreateGroupModal);

    // Fechar modal ao clicar fora
    const createGroupModal = document.getElementById('createGroupModal');
    if (createGroupModal) {
        createGroupModal.addEventListener('click', (e) => {
            if (e.target === createGroupModal) {
                window.closeCreateGroupModal();
            }
        });
    }

    // Form de criar grupo
    document.getElementById('createGroupForm')?.addEventListener('submit', window.createGroup);

    // =============================================
    // 34. INICIALIZAÇÃO
    // =============================================
    await initChat();
    await renderPosts();
    await renderGroups();
    await renderEvents();
    await loadStories();
    await loadProfile();
    updateCommunityJoinButton();
    
    console.log('🚀 Comunidade pronta! 👍💬❤️');
    console.log('🎬 Upload de vídeos ativado!');
    console.log('📸 Stories e Perfil carregados!');
    console.log('📋 Sistema de Grupos integrado com Supabase!');
});