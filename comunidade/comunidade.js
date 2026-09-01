

document.addEventListener("DOMContentLoaded", async () => {
    
  
    // 0. SUPABASE - CONEXÃO REAL
   
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


    // AUXILIARES

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

    
    // 1. SIDEBAR TOGGLE
  
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
    // Expor showToast globalmente (necessário para onclicks em HTML injetado)
    window.showToast = showToast;

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
    
   // =============================================
// apiCreatePost - VERSÃO CORRIGIDA
// =============================================
async function apiCreatePost(content, videoUrl) {
    try {
        // 🔥 TENTATIVA 1: Via RPC
        const { data, error } = await supabase.rpc('create_post', {
            p_content: content,
            p_video_url: videoUrl
        });
        
        if (!error && data) {
            return data.post_id;
        }
        
        console.warn('⚠️ RPC create_post falhou, usando INSERT direto:', error);
        
        // 🔥 TENTATIVA 2: INSERT direto
        const { data: post, error: insertError } = await supabase
            .from('posts')
            .insert({
                content: content,
                video_url: videoUrl,
                author_id: currentUser.id,
                is_active: true,
                likes: 0,
                comment_count: 0,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (insertError) throw insertError;
        
        return post.id;
        
    } catch (error) {
        console.error('❌ Erro ao criar post:', error);
        showToast('Erro ao criar post: ' + error.message, 'error');
        return null;
    }
}

    // ================================================================
// API: CRIAR CONVERSA PRIVADA (COM FALLBACK)
// ================================================================

async function apiCreatePrivateConversation(friendId) {
    if (!currentUser) {
        return { success: false, message: 'Usuário não autenticado' };
    }

    try {
        // TENTATIVA 1: Via RPC
        const { data, error } = await supabase.rpc('create_private_conversation', {
            p_friend_id: friendId
        });
        
        if (!error && data) {
            console.log('✅ Conversa criada via RPC:', data);
            return data;
        }
        
        console.warn('⚠️ RPC falhou, usando fallback direto:', error?.message);

        // =============================================
        // FALLBACK: Inserção direta no banco
        // =============================================
        const myId = currentUser.id;
        
        // Buscar nome do amigo
        const { data: friendProfile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', friendId)
            .single();

        const friendName = friendProfile?.username || 'Amigo';

        // Criar ID único
        const newConvId = crypto.randomUUID ? crypto.randomUUID() : 
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });

        // Inserir conversa
        const { error: convErr } = await supabase
            .from('conversations')
            .insert({
                id: newConvId,
                name: friendName,
                type: 'private',
                created_by: myId,
                created_at: new Date().toISOString()
            });

        if (convErr) {
            console.error('❌ Erro ao criar conversa:', convErr);
            return { success: false, message: convErr.message };
        }

        // Adicionar participantes
        await supabase
            .from('conversation_participants')
            .insert([
                { conversation_id: newConvId, user_id: myId, joined_at: new Date().toISOString() },
                { conversation_id: newConvId, user_id: friendId, joined_at: new Date().toISOString() }
            ]);

        console.log('✅ Conversa privada criada via fallback! ID:', newConvId);

        return {
            success: true,
            conversation_id: newConvId,
            existing: false,
            message: 'Conversa criada com sucesso'
        };

    } catch (error) {
        console.error('❌ Erro inesperado:', error);
        return { success: false, message: error.message };
    }
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
        return data !== null && data !== undefined ? data : { success: true };
    }

    // =============================================
    // 6.5. API AMIZADES E CONVITES
    // =============================================
    async function apiSearchUsers(query) {
        // Tentar via RPC primeiro
        const { data, error } = await supabase.rpc('search_users', { p_query: query });
        if (!error && data) {
            return data;
        }
        
        console.warn('⚠️ RPC search_users falhou, tentando fallback direto:', error?.message);
        
        // FALLBACK: Consultar a tabela profiles diretamente
        try {
            // Não expor emails! Buscar apenas por username
            const { data: profiles, error: searchErr } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .ilike('username', `%${query}%`)
                .limit(20);

            if (searchErr) throw searchErr;
            return profiles || [];
        } catch (fallbackErr) {
            console.error('❌ Exceção no fallback de buscar usuários:', fallbackErr);
            return [];
        }
    }

    async function apiSendFriendRequest(receiverId) {
        // Tentar via RPC primeiro
        const { data, error } = await supabase.rpc('send_friend_request', { p_receiver_id: receiverId });
        if (!error && data) {
            return data;
        }
        
        console.warn('⚠️ RPC send_friend_request falhou, tentando fallback direto:', error?.message);

        // FALLBACK: Inserir amizade diretamente
        try {
            const myId = currentUser?.id || (await supabase.auth.getUser()).data.user?.id;
            if (!myId) return { success: false, error: 'Usuário não autenticado.' };
            if (myId === receiverId) return { success: false, error: 'Você não pode adicionar a si mesmo.' };

            // 1. Verificar se já existe relacionamento entre ambos
            const { data: existing, error: existErr } = await supabase
                .from('friendships')
                .select('*')
                .or(`and(requester_id.eq.${myId},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${myId})`)
                .maybeSingle();

            if (existing) {
                if (existing.status === 'accepted') {
                    return { success: false, error: 'Vocês já são amigos.' };
                }
                return { success: false, error: 'Já existe uma solicitação pendente entre vocês.' };
            }

            // 2. Inserir a nova solicitação
            const { error: insertErr } = await supabase
                .from('friendships')
                .insert({
                    requester_id: myId,
                    receiver_id: receiverId,
                    status: 'pending'
                });

            if (insertErr) throw insertErr;
            return { success: true };
        } catch (fallbackErr) {
            console.error('❌ Exceção no fallback de enviar solicitação:', fallbackErr);
            return { success: false, error: fallbackErr.message };
        }
    }

    async function apiRespondFriendRequest(friendshipId, action) {
        // Tentar via RPC primeiro
        const { data, error } = await supabase.rpc('respond_friend_request', {
            p_friendship_id: friendshipId,
            p_action: action
        });
        if (!error && data) {
            return data;
        }
        
        console.warn('⚠️ RPC respond_friend_request falhou, tentando fallback direto:', error?.message);

        // FALLBACK: Atualizar ou deletar diretamente na tabela
        try {
            if (action === 'accept') {
                const { error: updateErr } = await supabase
                    .from('friendships')
                    .update({ status: 'accepted' })
                    .eq('id', friendshipId);

                if (updateErr) throw updateErr;
                return { success: true };
            } else {
                // rejeitar ou cancelar
                const { error: deleteErr } = await supabase
                    .from('friendships')
                    .delete()
                    .eq('id', friendshipId);

                if (deleteErr) throw deleteErr;
                return { success: true };
            }
        } catch (fallbackErr) {
            console.error('❌ Exceção no fallback de responder solicitação:', fallbackErr);
            return { success: false, error: fallbackErr.message };
        }
    }

    async function apiGetFriends() {
        // Tentar via RPC primeiro
        const { data, error } = await supabase.rpc('get_friends');
        if (!error && data) {
            return data;
        }
        
        console.warn('⚠️ RPC get_friends falhou, tentando fallback direto:', error?.message);

        // FALLBACK: Consultar tabelas directamente
        try {
            const myId = currentUser?.id || (await supabase.auth.getUser()).data.user?.id;
            if (!myId) return [];

            // 1. Buscar relacionamentos aceitos onde o usuário participa
            const { data: friendships, error: friendErr } = await supabase
                .from('friendships')
                .select('*')
                .eq('status', 'accepted')
                .or(`user_id1.eq.${myId},user_id2.eq.${myId}`);

            if (friendErr || !friendships || friendships.length === 0) {
                return [];
            }

            // 2. Coletar IDs dos amigos
            const friendIds = friendships.map(f => f.user_id1 === myId ? f.user_id2 : f.user_id1);

            // 3. Buscar perfis dos amigos
            const { data: profiles, error: profileErr } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .in('id', friendIds);

            if (profileErr) throw profileErr;

            // 4. Mapear resultados no formato esperado pela view
            return friendships.map(f => {
                const friendId = f.user_id1 === myId ? f.user_id2 : f.user_id1;
                const profile = profiles?.find(p => p.id === friendId) || {};
                return {
                    friendship_id: f.id,
                    friend_id: friendId,
                    username: profile.username || 'Membro',
                    avatar_url: profile.avatar_url || null
                };
            });
        } catch (fallbackErr) {
            console.error('❌ Exceção no fallback de carregar amigos:', fallbackErr);
            return [];
        }
    }

    async function apiGetPendingRequests() {
        // Tentar via RPC primeiro
        const { data, error } = await supabase.rpc('get_pending_requests');
        if (!error && data) {
            return data;
        }
        
        console.warn('⚠️ RPC get_pending_requests falhou, tentando fallback direto:', error?.message);

        // FALLBACK: Consultar tabelas directamente
        try {
            const myId = currentUser?.id || (await supabase.auth.getUser()).data.user?.id;
            if (!myId) return [];

            // 1. Buscar relacionamentos pendentes enviados para mim (user_id2 é o destinatário)
            const { data: requests, error: reqErr } = await supabase
                .from('friendships')
                .select('*')
                .eq('status', 'pending')
                .eq('user_id2', myId);

            if (reqErr || !requests || requests.length === 0) {
                return [];
            }

            // 2. Coletar IDs dos remetentes
            const senderIds = requests.map(f => f.user_id1);

            // 3. Buscar perfis dos remetentes
            const { data: profiles, error: profileErr } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .in('id', senderIds);

            if (profileErr) throw profileErr;

            // 4. Mapear resultados no formato esperado pela view
            return requests.map(f => {
                const profile = profiles?.find(p => p.id === f.user_id1) || {};
                return {
                    friendship_id: f.id,
                    sender_id: f.user_id1,
                    username: profile.username || 'Membro',
                    avatar_url: profile.avatar_url || null
                };
            });
        } catch (fallbackErr) {
            console.error('❌ Exceção no fallback de carregar pendentes:', fallbackErr);
            return [];
        }
    }


    async function apiAddFriendToGroup(friendId, groupId) {
        // Tentar via RPC primeiro
        const { data, error } = await supabase.rpc('add_friend_to_group', {
            p_friend_id: friendId,
            p_group_id: groupId
        });
        if (!error && data) {
            return data;
        }
        if (error) {
            console.warn('⚠️ RPC add_friend_to_group falhou, tentando fallback direto:', error.message);
        }

        // FALLBACK: Inserir diretamente
        try {
            // 1. Verificar se o grupo existe e obter detalhes
            const { data: group, error: groupErr } = await supabase
                .from('groups')
                .select('*')
                .eq('id', groupId)
                .single();

            if (groupErr || !group) {
                return { success: false, error: 'Grupo não encontrado.' };
            }

            // 2. Verificar se o usuário logado é o criador
            if (group.created_by !== currentUser?.id) {
                return { success: false, error: 'Apenas o criador do grupo pode adicionar membros.' };
            }

            // 3. Verificar se já é membro
            const { data: alreadyMember, error: memberErr } = await supabase
                .from('group_members')
                .select('id')
                .eq('group_id', groupId)
                .eq('user_id', friendId)
                .maybeSingle();

            if (alreadyMember) {
                return { success: false, error: 'Esta pessoa já é membro do grupo.' };
            }

            // 4. Adicionar à tabela group_members
            const { error: insertMemberErr } = await supabase
                .from('group_members')
                .insert({
                    group_id: groupId,
                    user_id: friendId,
                    joined_at: new Date().toISOString()
                });

            if (insertMemberErr) {
                return { success: false, error: insertMemberErr.message };
            }

            // 5. Adicionar à conversa do grupo
            await supabase
                .from('conversation_participants')
                .insert({
                    conversation_id: groupId,
                    user_id: friendId,
                    joined_at: new Date().toISOString()
                });

            // 6. Incrementar contador de membros no grupo
            await supabase
                .from('groups')
                .update({ members: (group.members || 0) + 1 })
                .eq('id', groupId);

            return { success: true, group_name: group.name };
        } catch (fallbackErr) {
            console.error('❌ Exceção no fallback de adicionar amigo:', fallbackErr);
            return { success: false, error: fallbackErr.message };
        }
    }

    async function apiGenerateGroupInvite(groupId) {
        // Tentar via RPC primeiro
        const { data, error } = await supabase.rpc('generate_group_invite', { p_group_id: groupId });
        if (!error && data && data.success) {
            return data;
        }
        
        let rpcErrorMsg = error ? error.message : (data ? data.error : 'Erro desconhecido');
        console.warn('⚠️ RPC generate_group_invite falhou, tentando fallback direto:', rpcErrorMsg);

        // FALLBACK: Inserir diretamente na tabela group_invites
        try {
            // Gerar código de 5 dígitos
            const code = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            // Desativar convites antigos
            await supabase.from('group_invites')
                .update({ active: false })
                .eq('group_id', groupId);

            const userId = currentUser?.id || (await supabase.auth.getUser()).data.user?.id;

            // Inserir novo convite (tentar com o campo 'active', se falhar tentar sem ele)
            let inviteData = null;
            let insertError = null;

            const insertResult = await supabase
                .from('group_invites')
                .insert({
                    group_id: groupId,
                    code: code,
                    created_by: userId,
                    active: true,
                    expires_at: expiresAt
                })
                .select()
                .single();

            inviteData = insertResult.data;
            insertError = insertResult.error;

            // Se falhou por causa da coluna "active", tentar sem ela
            if (insertError && insertError.message && insertError.message.includes('active')) {
                console.warn('⚠️ Coluna "active" ausente, tentando inserir sem ela...');
                const retryResult = await supabase
                    .from('group_invites')
                    .insert({
                        group_id: groupId,
                        code: code,
                        created_by: userId,
                        expires_at: expiresAt
                    })
                    .select()
                    .single();

                inviteData = retryResult.data;
                insertError = retryResult.error;
            }

            if (insertError) {
                console.error('❌ Fallback direto também falhou:', insertError.message);
                showToast(`⚠️ Modo Local: Código gerado fora do banco (Outros não conseguirão entrar). Erro: ${insertError.message}`, 'warning', 7000);
                // ÚLTIMO RECURSO: gerar código local sem persistir no banco
                return { success: true, code: code, expires_at: expiresAt, local_only: true };
            }

            console.log('✅ Convite criado via fallback direto:', code);
            return { success: true, code: inviteData.code, expires_at: inviteData.expires_at || expiresAt };
        } catch (fallbackErr) {
            console.error('❌ Exceção no fallback:', fallbackErr);
            showToast(`⚠️ Modo Local: Falha ao persistir código. Erro: ${fallbackErr.message}`, 'warning', 7000);
            // ÚLTIMO RECURSO: retornar código gerado localmente
            const code = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            return { success: true, code: code, expires_at: expiresAt, local_only: true };
        }
    }

   // =============================================
// API USE INVITE CODE - CORRIGIDO
// =============================================
async function apiUseInviteCode(code) {
    // Tentar via RPC primeiro
    const { data, error } = await supabase.rpc('use_invite_code', { p_code: code });
    if (!error && data) {
        return data;
    }
    
    console.warn('⚠️ RPC use_invite_code falhou, tentando fallback direto:', error?.message);

    // FALLBACK: Utilizar convite diretamente via tabelas
    try {
        // 1. Buscar convite pelo código
        const { data: invite, error: inviteErr } = await supabase
            .from('group_invites')
            .select('*, group_invites_uses(count)')
            .eq('code', code)
            .maybeSingle();

        if (inviteErr) {
            console.error('❌ Erro ao buscar convite:', inviteErr.message);
            return { success: false, error: `Erro ao verificar código: ${inviteErr.message}` };
        }

        if (!invite) {
            return { success: false, error: 'Código de convite não encontrado.' };
        }

        // ✅ Verificar se está ativo
        if (invite.active === false) {
            return { success: false, error: 'Este código de convite foi desativado.' };
        }

        // ✅ Verificar expiração
        if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
            return { success: false, error: 'Este código de convite já expirou.' };
        }

        // ✅ Verificar se já usou
        const { data: existingUse, error: useErr } = await supabase
            .from('group_invites_uses')
            .select('id')
            .eq('invite_id', invite.id)
            .eq('user_id', currentUser?.id)
            .maybeSingle();

        if (existingUse) {
            return { success: false, error: 'Você já usou este código de convite.' };
        }

        // ✅ Verificar limite de uso
        const { data: uses, error: countErr } = await supabase
            .from('group_invites_uses')
            .select('id', { count: 'exact' })
            .eq('invite_id', invite.id);

        const useCount = uses?.length || 0;
        const MAX_USES = 10;

        if (useCount >= MAX_USES) {
            // Desativar convite
            await supabase
                .from('group_invites')
                .update({ active: false })
                .eq('id', invite.id);
            
            return { success: false, error: 'Este código de convite atingiu o limite de uso.' };
        }

        // 2. Buscar detalhes do grupo
        const { data: group, error: groupErr } = await supabase
            .from('groups')
            .select('*')
            .eq('id', invite.group_id)
            .single();

        if (groupErr || !group) {
            return { success: false, error: 'Grupo não encontrado.' };
        }

        // 3. Verificar se já é membro
        const { data: alreadyMember, error: memberErr } = await supabase
            .from('group_members')
            .select('id')
            .eq('group_id', invite.group_id)
            .eq('user_id', currentUser?.id)
            .maybeSingle();

        if (alreadyMember) {
            return { success: false, error: 'Você já é membro deste grupo.' };
        }

        // 4. Adicionar ao grupo
        const { error: insertMemberErr } = await supabase
            .from('group_members')
            .insert({
                group_id: invite.group_id,
                user_id: currentUser?.id,
                joined_at: new Date().toISOString()
            });

        if (insertMemberErr) {
            return { success: false, error: insertMemberErr.message };
        }

        // 5. Adicionar à conversa
        await supabase
            .from('conversation_participants')
            .insert({
                conversation_id: invite.group_id,
                user_id: currentUser?.id,
                joined_at: new Date().toISOString()
            });

        // 6. ✅ Registrar uso do convite
        await supabase
            .from('group_invites_uses')
            .insert({
                invite_id: invite.id,
                user_id: currentUser?.id,
                used_at: new Date().toISOString()
            });

        // 7. Incrementar contador de membros
        await supabase
            .from('groups')
            .update({ members: (group.members || 0) + 1 })
            .eq('id', invite.group_id);

        // 8. Verificar se atingiu o limite
        const { data: updatedUses, error: updatedErr } = await supabase
            .from('group_invites_uses')
            .select('id', { count: 'exact' })
            .eq('invite_id', invite.id);

        const updatedCount = updatedUses?.length || 0;

        if (updatedCount >= MAX_USES) {
            await supabase
                .from('group_invites')
                .update({ active: false })
                .eq('id', invite.id);
        }

        // 9. Mensagem de sistema
        await supabase.from('messages').insert({
            conversation_id: invite.group_id,
            sender_id: currentUser?.id,
            sender_name: '🔔 Sistema',
            content: `📢 Novo membro entrou no grupo: ${group.name}! Seja bem-vindo(a)! 🎉`,
            created_at: new Date().toISOString()
        });

        return {
            success: true,
            group_id: invite.group_id,
            group_name: group.name,
            message: 'Você entrou no grupo com sucesso!'
        };
    } catch (fallbackErr) {
        console.error('❌ Exceção no fallback:', fallbackErr);
        return { success: false, error: fallbackErr.message };
    }
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
// loadAndShowComments - VERSÃO DEFINITIVA
// =============================================
window.loadAndShowComments = async function(postId) {
    console.log(`🔍 Carregando comentários para post: ${postId}`);

    if (!postId) {
        console.error('❌ postId é inválido!');
        return;
    }

    // 🔥 BUSCAR OU CRIAR A SEÇÃO
    let section = document.getElementById(`comments-${postId}`);
    const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
    
    if (!postCard) {
        console.error(`❌ Post card não encontrado: ${postId}`);
        return;
    }

    // Se a seção não existe, criar
    if (!section) {
        console.log(`📝 Criando seção de comentários para post ${postId}`);
        
        section = document.createElement('div');
        section.className = 'comments-section';
        section.id = `comments-${postId}`;
        section.style.display = 'block';
        section.innerHTML = `
            <div class="comments-list" id="comments-list-${postId}">
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
        
        // Configurar botão de enviar
        const submitBtn = section.querySelector('.submit-comment-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', window.handleCommentSubmit);
        }
    }

    // 🔥 BUSCAR A LISTA - TENTAR POR ID OU POR CLASSE
    let list = document.getElementById(`comments-list-${postId}`);
    
    // Se não encontrar pelo ID, procurar dentro da seção
    if (!list && section) {
        list = section.querySelector('.comments-list');
    }
    
    // Se ainda não encontrou, criar a lista
    if (!list) {
        console.warn(`⚠️ Lista não encontrada, recriando...`);
        const newList = document.createElement('div');
        newList.className = 'comments-list';
        newList.id = `comments-list-${postId}`;
        newList.innerHTML = '<p style="color:#888;font-size:13px;padding:8px;">⏳ Carregando comentários...</p>';
        
        // Inserir no início da seção
        if (section) {
            section.insertBefore(newList, section.firstChild);
            list = newList;
        } else {
            console.error(`❌ Seção também não encontrada!`);
            return;
        }
    }

    // Mostrar loading
    list.innerHTML = '<p style="color:#888;font-size:13px;padding:8px;">⏳ Carregando comentários...</p>';

    try {
        // 🔥 BUSCAR COMENTÁRIOS DIRETO DO BANCO
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

        const commentsList = comments || [];
        console.log(`📨 ${commentsList.length} comentários encontrados`);

        if (commentsList.length === 0) {
            list.innerHTML = '<p style="color:#888;font-size:13px;padding:8px;">💬 Nenhum comentário ainda. Seja o primeiro!</p>';
        } else {
            list.innerHTML = commentsList.map(c => `
                <div class="comment-item" style="padding:10px 0;border-bottom:1px solid #eee;">
                    <strong style="color:#7c3aed;">${escapeHtml(c.author_name || 'Usuário')}</strong>
                    <p style="margin:4px 0 2px 0;font-size:14px;color:#333;">${escapeHtml(c.content)}</p>
                    <small style="color:#999;font-size:11px;">${formatDate(c.created_at)}</small>
                </div>
            `).join('');
        }

        // 🔥 ATUALIZAR CONTADOR NA UI
        const countBtn = document.querySelector(`.comment-toggle-btn[data-post-id="${postId}"] .count`);
        if (countBtn) {
            countBtn.textContent = commentsList.length;
        }

        // Garantir que a seção está visível
        if (section) {
            section.style.display = 'block';
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
    // =============================================
// handleLike - VERSÃO CORRIGIDA
// =============================================
async function handleLike(e) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const postId = btn.dataset.postId;
    if (!currentUser) return showToast('Faça login', 'error');
    
    try {
        // 🔥 TENTATIVA 1: Via RPC
        let result = await supabase.rpc('toggle_like', { p_post_id: postId });
        
        // 🔥 TENTATIVA 2: Se falhar, usar lógica manual
        if (result.error) {
            console.warn('⚠️ RPC toggle_like falhou, usando lógica manual:', result.error);
            
            // Verificar se já curtiu
            const { data: existingLike } = await supabase
                .from('likes')
                .select('id')
                .eq('post_id', postId)
                .eq('user_id', currentUser.id)
                .maybeSingle();

            if (existingLike) {
                // Remover like
                await supabase
                    .from('likes')
                    .delete()
                    .eq('id', existingLike.id);
                
                await supabase
                    .from('posts')
                    .update({ likes: supabase.rpc('decrement', { row_id: postId }) })
                    .eq('id', postId);
                
                result = { data: { liked: false, likes: 0 } };
            } else {
                // Adicionar like
                await supabase
                    .from('likes')
                    .insert({
                        post_id: postId,
                        user_id: currentUser.id,
                        created_at: new Date().toISOString()
                    });
                
                await supabase
                    .from('posts')
                    .update({ likes: supabase.rpc('increment', { row_id: postId }) })
                    .eq('id', postId);
                
                result = { data: { liked: true, likes: 0 } };
            }
            
            // Buscar contagem atualizada
            const { data: postData } = await supabase
                .from('posts')
                .select('likes')
                .eq('id', postId)
                .single();
            
            result.data.likes = postData?.likes || 0;
        }
        
        // Atualizar UI
        if (result.data) {
            const countSpan = btn.querySelector('.count');
            const icon = btn.querySelector('i');
            if (countSpan) countSpan.textContent = result.data.likes;
            btn.classList.toggle('liked', result.data.liked);
            if (icon) {
                icon.className = result.data.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            }
        }
        
    } catch (error) {
        console.error('❌ Erro ao curtir:', error);
        showToast('Erro ao curtir', 'error');
    }
}
    // =============================================
// handleCommentToggle - VERSÃO CORRIGIDA
// =============================================
// =============================================
// handleCommentToggle - VERSÃO DEFINITIVA
// =============================================
async function handleCommentToggle(e) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const postId = btn.dataset.postId;
    
    if (!postId) {
        console.error('❌ postId não encontrado');
        return;
    }

    console.log(`🔄 Toggle comentários para post: ${postId}`);

    // 🔥 BUSCAR A SEÇÃO
    let section = document.getElementById(`comments-${postId}`);
    
    // Se não existe, criar chamando loadAndShowComments
    if (!section) {
        console.log(`📝 Criando seção para post ${postId}`);
        await window.loadAndShowComments(postId);
        return;
    }

    // 🔥 VERIFICAR SE ESTÁ VISÍVEL
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
// handleCommentSubmit - VERSÃO CORRIGIDA E OTIMIZADA
// =============================================
// =============================================
// handleCommentSubmit - VERSÃO DEFINITIVA
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

        // 🔥 TENTAR RPC PRIMEIRO
        const { data, error } = await supabase.rpc('create_comment_direct', {
            p_post_id: postId,
            p_content: text
        });

        if (error) {
            console.error('❌ Erro na RPC:', error);
            
            // 🔥 FALLBACK: INSERT DIRETO
            const { data: profile } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', currentUser.id)
                .single();

            const commentData = {
                post_id: postId,
                author_id: currentUser.id,
                author_name: profile?.username || 'Usuário',
                author_avatar: profile?.avatar_url || '/img/avatar-padrao.png',
                content: text,
                is_active: true,
                created_at: new Date().toISOString()
            };

            const { error: insertError } = await supabase
                .from('comments')
                .insert(commentData);

            if (insertError) {
                console.error('❌ Fallback falhou:', insertError);
                showToast('Erro ao enviar comentário: ' + insertError.message, 'error');
                btn.disabled = false;
                btn.textContent = 'Enviar';
                return;
            }
        } else {
            console.log('✅ Comentário enviado via RPC!', data);
        }
        
        // Limpar input
        input.value = '';
        showToast('💬 Comentário adicionado!', 'success');
        
        // 🔥 RECARREGAR COMENTÁRIOS (FORÇADO)
        await window.loadAndShowComments(postId);

    } catch (error) {
        console.error('❌ Erro inesperado:', error);
        showToast('Erro ao enviar comentário: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Enviar';
    }
};

// =============================================
// FUNÇÃO AUXILIAR PARA ATUALIZAR CONTADOR
// =============================================
async function updateCommentCount(postId) {
    try {
        const { data, error } = await supabase.rpc('update_comment_count', {
            p_post_id: postId
        });
        if (error) console.error('Erro ao atualizar contador:', error);
        return data;
    } catch (e) {
        console.error('Erro:', e);
    }
}

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
// UPLOAD DE IMAGEM PARA GRUPOS
// =============================================

// Elementos do upload
const groupImageUploadArea = document.getElementById('groupImageUploadArea');
const groupImageInput = document.getElementById('groupImage');
const groupImagePreviewContainer = document.getElementById('groupImagePreviewContainer');
let uploadedImageUrl = null;

// Função para criar preview
function createImagePreview(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.readAsDataURL(file);
    });
}

// 1. Clique na área de upload para abrir seletor de arquivos
if (groupImageUploadArea) {
    groupImageUploadArea.addEventListener('click', () => {
        // Criar input de arquivo temporário
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        fileInput.click();
        
        fileInput.addEventListener('change', async function(e) {
            const file = this.files[0];
            if (!file) {
                this.remove();
                return;
            }
            
            // Validar arquivo
            const MAX_SIZE = 10 * 1024 * 1024; // 10MB
            const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
            
            if (file.size > MAX_SIZE) {
                showToast('❌ Imagem muito grande! Máx 10MB', 'error', 3000);
                this.remove();
                return;
            }
            
            if (!ALLOWED_TYPES.includes(file.type)) {
                showToast('❌ Formato não suportado. Use JPG, PNG, WEBP, GIF ou SVG', 'error', 3000);
                this.remove();
                return;
            }
            
            // Mostrar preview
            const previewUrl = await createImagePreview(file);
            
            // Criar preview
            groupImagePreviewContainer.innerHTML = `
                <div class="image-preview-wrapper">
                    <img src="${previewUrl}" alt="Preview da imagem do grupo" class="group-image-preview">
                    <button type="button" class="remove-image-btn" id="removeGroupImageBtn">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `;
            
            // Esconder área de upload
            groupImageUploadArea.style.display = 'none';
            
            // Botão para remover imagem
            document.getElementById('removeGroupImageBtn')?.addEventListener('click', () => {
                groupImagePreviewContainer.innerHTML = '';
                groupImageUploadArea.style.display = 'flex';
                groupImageInput.value = '';
                uploadedImageUrl = null;
                showToast('🖼️ Imagem removida', 'info', 1500);
            });
            
            // Enviar para o Supabase Storage
            showToast('📤 Enviando imagem...', 'info', 3000);
            
            try {
                // Criar bucket se não existir (via Supabase)
                const { data: buckets } = await supabase.storage.listBuckets();
                const groupBucket = buckets?.find(b => b.name === 'group-images');
                
                if (!groupBucket) {
                    // Criar bucket (pode ser feito manualmente no dashboard também)
                    // Nota: criar bucket via API precisa de permissões de service_role
                    console.warn('⚠️ Bucket "group-images" não encontrado. Criando...');
                    // Como alternativa, vamos usar o bucket 'avatars' que já existe
                }
                
                // Gerar nome único para a imagem
                const fileExt = file.name.split('.').pop();
                const fileName = `groups/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                
                // Tentar upload no bucket 'group-images', se falhar, usar 'avatars'
                let publicUrl = null;
                let uploadError = null;
                
                // Tentativa 1: Bucket 'group-images'
                const { data: uploadData, error: uploadErr } = await supabase.storage
                    .from('group-images')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: true
                    });
                
                if (uploadErr) {
                    console.warn('⚠️ Upload no bucket group-images falhou:', uploadErr.message);
                    uploadError = uploadErr;
                    
                    // Tentativa 2: Bucket 'avatars'
                    try {
                        const { data: uploadData2, error: uploadErr2 } = await supabase.storage
                            .from('avatars')
                            .upload(fileName, file, {
                                cacheControl: '3600',
                                upsert: true
                            });
                        
                        if (uploadErr2) {
                            throw uploadErr2;
                        }
                        
                        // Obter URL pública do bucket 'avatars'
                        const { data: { publicUrl: url2 } } = supabase.storage
                            .from('avatars')
                            .getPublicUrl(fileName);
                        publicUrl = url2;
                    } catch (err2) {
                        console.error('❌ Upload no bucket avatars também falhou:', err2.message);
                        showToast('❌ Erro ao enviar imagem: ' + err2.message, 'error', 4000);
                        return;
                    }
                } else {
                    // Obter URL pública do bucket 'group-images'
                    const { data: { publicUrl: url1 } } = supabase.storage
                        .from('group-images')
                        .getPublicUrl(fileName);
                    publicUrl = url1;
                }
                
                if (publicUrl) {
                    // Preencher o campo de URL
                    groupImageInput.value = publicUrl;
                    uploadedImageUrl = publicUrl;
                    
                    showToast('✅ Imagem enviada com sucesso! 🎉', 'success', 3000);
                    console.log('📸 Imagem enviada:', publicUrl);
                }
                
            } catch (error) {
                console.error('❌ Erro no upload:', error);
                showToast('❌ Erro ao enviar imagem: ' + error.message, 'error', 4000);
            }
            
            this.remove();
        });
    });
}

// 2. Drag and drop (opcional)
if (groupImageUploadArea) {
    // Prevenir comportamento padrão
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        groupImageUploadArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });
    
    // Highlight ao arrastar
    groupImageUploadArea.addEventListener('dragenter', () => {
        groupImageUploadArea.classList.add('drag-over');
    });
    
    groupImageUploadArea.addEventListener('dragleave', () => {
        groupImageUploadArea.classList.remove('drag-over');
    });
    
    groupImageUploadArea.addEventListener('drop', async (e) => {
        groupImageUploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            // Simular clique no input de arquivo
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
            
            // Criar DataTransfer com o arquivo
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            
            // Disparar evento change
            const event = new Event('change');
            fileInput.dispatchEvent(event);
            
            fileInput.addEventListener('change', async function(e2) {
                // O código do evento change acima será executado
                // Mas precisamos garantir que o arquivo seja processado
                const selectedFile = this.files[0];
                if (!selectedFile) return;
                
                // Processar arquivo (similar ao código acima)
                const MAX_SIZE = 10 * 1024 * 1024;
                const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                
                if (selectedFile.size > MAX_SIZE) {
                    showToast('❌ Imagem muito grande! Máx 10MB', 'error');
                    this.remove();
                    return;
                }
                
                if (!ALLOWED_TYPES.includes(selectedFile.type)) {
                    showToast('❌ Formato não suportado', 'error');
                    this.remove();
                    return;
                }
                
                const previewUrl = await createImagePreview(selectedFile);
                groupImagePreviewContainer.innerHTML = `
                    <div class="image-preview-wrapper">
                        <img src="${previewUrl}" alt="Preview" class="group-image-preview">
                        <button type="button" class="remove-image-btn" id="removeGroupImageBtn">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                `;
                groupImageUploadArea.style.display = 'none';
                
                document.getElementById('removeGroupImageBtn')?.addEventListener('click', () => {
                    groupImagePreviewContainer.innerHTML = '';
                    groupImageUploadArea.style.display = 'flex';
                    groupImageInput.value = '';
                    uploadedImageUrl = null;
                });
                
                // Upload para o Storage
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `groups/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                
                try {
                    const { data, error } = await supabase.storage
                        .from('group-images')
                        .upload(fileName, selectedFile, {
                            cacheControl: '3600',
                            upsert: true
                        });
                    
                    if (error) throw error;
                    
                    const { data: { publicUrl } } = supabase.storage
                        .from('group-images')
                        .getPublicUrl(fileName);
                    
                    groupImageInput.value = publicUrl;
                    uploadedImageUrl = publicUrl;
                    showToast('✅ Imagem enviada!', 'success');
                } catch (error) {
                    console.error('❌ Erro:', error);
                    showToast('❌ Erro ao enviar imagem', 'error');
                }
                
                this.remove();
            });
        }
    });
}

// 3. Função para criar o bucket (se necessário) - execute no console ou SQL
// No SQL Editor do Supabase:
// INSERT INTO storage.buckets (id, name, public) 
// VALUES ('group-images', 'group-images', true) 
// ON CONFLICT (id) DO NOTHING;
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
                    ${isAdmin ? `
                    <div class="group-admin-actions">
                        <button class="btn-group-admin" onclick="window.openAddFriendToGroupModal('${g.id}')">
                            <i class="fa-solid fa-user-plus"></i> Adicionar amigo
                        </button>
                        <button class="btn-group-admin" onclick="window.openInviteCodeModal('${g.id}', '${escapeHtml(g.name)}')">
                            <i class="fa-solid fa-key"></i> Código
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>`;
        }).join('');

        await renderChatChannels();
        await renderFriendsList();
        await renderFriendRequests();
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
                        showToast(' Redirecionado para o chat Geral', 'info', 2000);
                    }
                }
            } else {
                showToast(data?.message || 'Erro ao sair do grupo', 'error');
            }
        } catch (error) {
            console.error(' Erro ao sair:', error);
            showToast('Erro ao sair: ' + error.message, 'error');
        }
    };


   
    // 15. ENTRAR NO GRUPO

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

            // Se grupo privado, gerar código de convite automaticamente
            if (isPrivate) {
                showToast('🔒 Grupo privado: Gerando código de convite...', 'info', 4000);
                console.log('🔒 Grupo privado detectado, gerando código de convite...');

                // PASSO 1: Gerar o código de convite
                let inviteCode = null;
                let expiresAt = null;
                try {
                    const inviteResult = await apiGenerateGroupInvite(group.id);
                    console.log('📋 Resultado do convite:', inviteResult);
                    if (inviteResult && inviteResult.success) {
                        inviteCode = inviteResult.code;
                        expiresAt = inviteResult.expires_at;
                        console.log('✅ Código de convite gerado:', inviteCode);
                        showToast(`🔑 Código de convite gerado com sucesso: ${inviteCode}`, 'success', 5000);
                    } else {
                        showToast('❌ Falha ao obter código de convite do banco.', 'error', 5000);
                        console.error('❌ Falha ao gerar convite:', inviteResult);
                    }
                } catch (inviteErr) {
                    showToast('❌ Erro de conexão ao tentar gerar código.', 'error', 5000);
                    console.error('❌ Erro ao chamar apiGenerateGroupInvite:', inviteErr);
                }

                // PASSO 2: Inserir mensagem no chat do grupo (independente do passo 1)
                if (inviteCode) {
                    try {
                        const systemMsg = `🔒 Grupo privado criado!\n\nEste é um grupo privado.\n\nPara convidar outras pessoas, compartilhe o código de convite:\n🔑 ${inviteCode}`;
                        
                        // Tentar via RPC insert_system_message primeiro
                        const { data: msgData, error: msgError } = await supabase.rpc('insert_system_message', {
                            p_conversation_id: group.id,
                            p_content: systemMsg
                        });

                        if (msgError) {
                            console.warn('⚠️ RPC insert_system_message falhou, tentando apiSendMessage...', msgError.message);
                            
                            // Tentar via apiSendMessage (RPC send_message)
                            const sendResult = await apiSendMessage(group.id, systemMsg);
                            if (sendResult) {
                                console.log('✅ Mensagem de boas-vindas enviada via apiSendMessage.');
                                showToast('💬 Mensagem inicial do grupo enviada no chat.', 'success', 4000);
                            } else {
                                console.warn('⚠️ apiSendMessage também falhou, tentando inserção direta...');
                                
                                // Tentar inserção direta no banco
                                const { error: directErr } = await supabase.from('messages').insert({
                                    conversation_id: group.id,
                                    sender_id: currentUser.id,
                                    sender_name: '🔒 Sistema',
                                    content: systemMsg,
                                    created_at: new Date().toISOString()
                                });
                                
                                if (directErr) {
                                    console.error('❌ Todos os métodos de envio de mensagem no chat falharam:', directErr.message);
                                    showToast('⚠️ Não foi possível colocar a mensagem no chat do grupo.', 'warning', 4000);
                                } else {
                                    console.log('✅ Mensagem enviada via inserção direta.');
                                    showToast('💬 Mensagem inicial enviada via inserção direta.', 'success', 4000);
                                }
                            }
                        } else {
                            console.log('✅ Mensagem de sistema inserida via RPC:', msgData);
                            showToast('💬 Mensagem do sistema enviada para o chat do grupo!', 'success', 4000);
                        }
                    } catch (msgErr) {
                        console.error('❌ Exceção ao inserir mensagem de sistema:', msgErr);
                        showToast('⚠️ Exceção ao postar mensagem de boas-vindas no chat.', 'warning', 4000);
                    }
                }

                // PASSO 3: Enviar notificação in-app ao criador
                if (inviteCode) {
                    try {
                        let expiryStr = '7 dias';
                        if (expiresAt) {
                            try {
                                expiryStr = new Date(expiresAt).toLocaleDateString('pt-BR');
                            } catch(e) {}
                        }
                        const copyBtnHtml = `<button onclick="navigator.clipboard.writeText('${inviteCode}').then(function(){window.showToast && window.showToast('Código copiado! 📋','success',2000)}).catch(function(){prompt('Copie o código:','${inviteCode}')})" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:Inter,sans-serif;margin-top:4px;"><i class='fa-regular fa-clipboard'></i> 📋 Copiar código</button>`;

                        addInAppNotification(
                            '🔒 Grupo privado criado!',
                            `Seu grupo "${name}" foi criado com sucesso.\n\n🔑 Código de convite: ${inviteCode}\n\nCompartilhe esse código com quem você deseja convidar.\n\n⏳ Expira em: ${expiryStr}`,
                            copyBtnHtml
                        );
                        console.log('✅ Notificação in-app disparada com código:', inviteCode);
                        showToast('🔔 Código enviado para sua área de notificações (sino no topo)!', 'success', 5000);
                    } catch (notifErr) {
                        console.error('❌ Erro ao disparar notificação:', notifErr);
                        showToast('❌ Erro ao registrar notificação na área de notificações.', 'error', 4000);
                    }
                }
            }

            await renderGroups();
            switchTab('grupos');

        } catch (error) {
            console.error('❌ Erro ao criar grupo:', error);
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

// =============================================
// RENDER MESSAGES - CORRIGIDO
// =============================================
function renderMessages(container, messages) {
    if (!container || !messages || messages.length === 0) {
        container.innerHTML = `
            <div class="chat-placeholder">
                <i class="fa-solid fa-comments"></i>
                <p>Nenhuma mensagem ainda</p>
                <p style="font-size:12px;color:#aaa;">Seja o primeiro a dizer oi! 👋</p>
            </div>
        `;
        return;
    }

    // ✅ Usar Set para evitar duplicação
    const renderedIds = new Set();
    
    // ✅ Ordenar por data (mais antigas primeiro)
    const sortedMessages = [...messages].sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
    );
    
    container.innerHTML = sortedMessages
        .filter(m => {
            if (renderedIds.has(m.id)) return false;
            renderedIds.add(m.id);
            return true;
        })
        .map(m => {
            const isSent = m.sender_id === currentUser?.id;
            const senderName = m.sender_name || 'Membro';
            const userColor = stringToColor(m.sender_id);
            const avatarUrl = m.sender_avatar || AVATAR_PADRAO;

            return `
            <div class="chat-message ${isSent ? 'sent' : 'received'}" data-message-id="${m.id}" data-sender-id="${m.sender_id}">
                ${!isSent ? `
                    <div class="msg-avatar">
                        <img src="${avatarUrl}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" 
                             onerror="this.style.display='none';this.parentElement.style.background='${userColor}';this.parentElement.textContent='${senderName.charAt(0).toUpperCase()}';this.parentElement.style.display='flex';this.parentElement.style.alignItems='center';this.parentElement.style.justifyContent='center';this.parentElement.style.color='#fff';this.parentElement.style.fontWeight='700';this.parentElement.style.borderRadius='50%';this.parentElement.style.width='32px';this.parentElement.style.height='32px';">
                    </div>
                ` : ''}
                <div class="msg-content" style="${isSent ? 'background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: #fff;' : 'background: var(--bg-secondary, #f1f5f9);'}">
                    ${!isSent ? `<div class="msg-author" style="color:${userColor};font-weight:600;font-size:12px;margin-bottom:2px;">${escapeHtml(senderName)}</div>` : ''}
                    <div class="msg-text" style="word-wrap:break-word;white-space:pre-wrap;">${escapeHtml(m.content)}</div>
                    <div class="msg-time" style="${isSent ? 'color: rgba(255,255,255,0.7);' : 'color: var(--text-muted, #94a3b8);'}font-size:10px;margin-top:4px;text-align:right;">
                        ${formatChatTime(m.created_at)}
                    </div>
                </div>
            </div>`;
        }).join('');
}// =============================================
// LOAD CHAT MESSAGES - CORRIGIDO
// =============================================
async function loadChatMessages(chatId = null) {
    const mc = document.getElementById('chatMessages');
    if (!mc) {
        console.error('❌ Elemento chatMessages não encontrado');
        return;
    }

    const targetChatId = chatId || currentChatId || '00000000-0000-0000-0000-000000000001';

    if (!targetChatId || targetChatId === 'undefined') {
        console.error('❌ chatId inválido:', targetChatId);
        mc.innerHTML = '<div class="chat-placeholder"><i class="fa-solid fa-triangle-exclamation"></i><p>ID da conversa inválido</p></div>';
        return;
    }

    try {
        console.log(`📤 Carregando mensagens para: ${targetChatId}`);
        
        // ✅ USAR RPC get_messages
        const { data: messages, error } = await supabase.rpc('get_messages', {
            p_conversation_id: targetChatId,
            p_limit: 50
        });

        if (error) {
            console.error('❌ Erro ao carregar mensagens (RPC):', error);
            mc.innerHTML = `<div class="chat-placeholder"><i class="fa-solid fa-triangle-exclamation"></i><p>Erro: ${error.message}</p></div>`;
            return;
        }

        console.log(`📊 Mensagens carregadas: ${messages?.length || 0}`);

        if (messages && messages.length > 0) {
            // ✅ A RPC já retorna ordenada, mas garantimos a ordem
            renderMessages(mc, messages);
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
// ADD MESSAGE TO CHAT - CORRIGIDO
// =============================================
function addMessageToChat(message) {
    const mc = document.getElementById('chatMessages');
    if (!mc) return;

    // Remover placeholder se existir
    const placeholder = mc.querySelector('.chat-placeholder');
    if (placeholder) placeholder.remove();

    // ✅ Verificar duplicação por ID
    const existingMessages = mc.querySelectorAll('.chat-message');
    for (let msg of existingMessages) {
        if (msg.dataset.messageId === message.id) {
            console.log('⏭️ Mensagem já existe, ignorando');
            return;
        }
    }

    // ✅ Determinar se a mensagem é do usuário atual
    const isSent = message.sender_id === currentUser?.id;
    
    // ✅ Usar os dados da mensagem, NÃO do usuário atual
    const senderName = message.sender_name || 'Membro';
    const userColor = stringToColor(message.sender_id);
    const avatarUrl = message.sender_avatar || AVATAR_PADRAO;

    const messageHtml = `
        <div class="chat-message ${isSent ? 'sent' : 'received'}" data-message-id="${message.id}" data-sender-id="${message.sender_id}" style="animation: fadeIn 0.3s ease;">
            ${!isSent ? `
                <div class="msg-avatar">
                    <img src="${avatarUrl}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" 
                         onerror="this.style.display='none';this.parentElement.style.background='${userColor}';this.parentElement.textContent='${senderName.charAt(0).toUpperCase()}';this.parentElement.style.display='flex';this.parentElement.style.alignItems='center';this.parentElement.style.justifyContent='center';this.parentElement.style.color='#fff';this.parentElement.style.fontWeight='700';this.parentElement.style.borderRadius='50%';this.parentElement.style.width='32px';this.parentElement.style.height='32px';">
                </div>
            ` : ''}
            <div class="msg-content" style="${isSent ? 'background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: #fff;' : 'background: var(--bg-secondary, #f1f5f9);'}">
                ${!isSent ? `<div class="msg-author" style="color:${userColor};font-weight:600;font-size:12px;margin-bottom:2px;">${escapeHtml(senderName)}</div>` : ''}
                <div class="msg-text" style="word-wrap:break-word;white-space:pre-wrap;">${escapeHtml(message.content)}</div>
                <div class="msg-time" style="${isSent ? 'color: rgba(255,255,255,0.7);' : 'color: var(--text-muted, #94a3b8);'}font-size:10px;margin-top:4px;text-align:right;">
                    ${formatChatTime(message.created_at)}
                </div>
            </div>
        </div>
    `;

    mc.insertAdjacentHTML('beforeend', messageHtml);
    scrollToBottom();
}
    // =============================================
// SUBSCRIBE TO MESSAGES - CORRIGIDO
// =============================================
function subscribeToMessages(chatId = null) {
    if (!chatId) return;

    // Verificar se é UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(chatId)) {
        console.error('❌ chatId não é UUID válido:', chatId);
        return;
    }

    // Remover subscription anterior
    if (chatSubscription) {
        try {
            supabase.removeChannel(chatSubscription);
        } catch (e) {
            console.warn('Erro ao remover canal:', e);
        }
        chatSubscription = null;
    }

    chatSubscription = supabase
        .channel(`messages:conversation_id=eq.${chatId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${chatId}`
            },
            (payload) => {
                const newMessage = payload.new;
                if (newMessage.sender_id === currentUser?.id) return;

                const existing = document.querySelector(`[data-message-id="${newMessage.id}"]`);
                if (existing) return;

                addMessageToChat(newMessage);
                scrollToBottom();
            }
        )
        .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Chat em tempo real conectado!');
            } else if (status === 'CHANNEL_ERROR' || err) {
                console.warn('⚠️ Erro no canal de Realtime:', status);
                // 🔥 REMOVER RECONEXÃO AUTOMÁTICA para evitar loop
            }
        });
}
   // =============================================
// SEND MESSAGE - USANDO RPC
// =============================================
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
        console.log(`📤 Enviando mensagem para: ${currentChatId}`);
        
        // ✅ USAR RPC em vez de consulta direta
        const { data, error } = await supabase.rpc('send_message', {
            p_conversation_id: currentChatId,
            p_content: msg
        });

        if (error) {
            console.error('❌ Erro ao enviar:', error);
            showToast('Erro ao enviar mensagem: ' + error.message, 'error');
            return;
        }

        if (data && data.success) {
            console.log('✅ Mensagem enviada:', data);
            inp.value = '';
            
            // Adicionar a mensagem localmente
            const newMessage = {
                id: data.message_id,
                conversation_id: currentChatId,
                sender_id: currentUser.id,
                sender_name: 'Você',
                sender_avatar: getUserAvatar(),
                content: msg,
                created_at: data.created_at || new Date().toISOString()
            };
            
            addMessageToChat(newMessage);
            scrollToBottom();
            
            showToast('✅ Mensagem enviada!', 'success', 1000);
        } else {
            showToast(data?.error || 'Erro ao enviar mensagem', 'error');
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
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Inscrição de posts ativa! 🚀');
                } else if (status === 'CHANNEL_ERROR' || err) {
                    console.error('❌ Erro na inscrição de posts:', status, err);
                    showToast('⚠️ Erro de sincronização do fórum. Ative o Realtime para a tabela "posts" no Supabase.', 'warning', 6000);
                }
            });
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

// 7. SISTEMA DE NOTIFICAÇÕES IN-APP
var inMemoryNotifications = [];

function addInAppNotification(title, body, extraHtml) {
    inMemoryNotifications.unshift({
        id: Date.now(),
        title: title,
        body: body,
        extraHtml: extraHtml || '',
        read: false,
        time: new Date()
    });

    // Atualizar badge de notificação
    var badge = document.getElementById('notifBadge');
    if (badge) {
        var unread = inMemoryNotifications.filter(function(n) { return !n.read; }).length;
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'block' : 'none';
    }

    // Se o painel estiver aberto, re-renderizar
    var panel = document.getElementById('notificationPanel');
    if (panel) {
        renderNotificationsInPanel();
    }
}

function renderNotificationsInPanel() {
    var list = document.getElementById('notificationsList');
    if (!list) return;

    if (inMemoryNotifications.length === 0) {
        list.innerHTML =
            '<div style="text-align:center;padding:30px 20px;color:var(--text-muted,#94a3b8);">' +
            '<i class="fa-regular fa-bell-slash" style="font-size:28px;display:block;margin-bottom:10px;opacity:0.3;"></i>' +
            '<p style="font-size:14px;">Nenhuma notificação</p></div>';
        return;
    }

    list.innerHTML = inMemoryNotifications.map(function(n) {
        var timeStr = n.time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return '<div style="padding:12px 16px;border-bottom:1px solid var(--border-color,#e2e8f0);' + (n.read ? 'opacity:0.6;' : '') + '">' +
            '<div style="font-size:13px;font-weight:700;color:var(--text-primary,#1e293b);margin-bottom:4px;">' + n.title + '</div>' +
            '<div style="font-size:12px;color:var(--text-secondary,#64748b);white-space:pre-line;line-height:1.5;">' + n.body + '</div>' +
            (n.extraHtml ? '<div style="margin-top:8px;">' + n.extraHtml + '</div>' : '') +
            '<div style="font-size:11px;color:var(--text-muted,#94a3b8);margin-top:4px;">' + timeStr + '</div>' +
            '</div>';
    }).join('');

    // Marcar todas como lidas
    inMemoryNotifications.forEach(function(n) { n.read = true; });
    var badge = document.getElementById('notifBadge');
    if (badge) badge.style.display = 'none';
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
        '<button onclick="this.closest(\'#notificationPanel\').remove()" style="background:none;border:none;font-size:18px;color:var(--text-muted,#94a3b8);cursor:pointer;">✕</button>' +
        '</div>' +
        '<div id="notificationsList" style="flex:1;overflow-y:auto;padding:8px 0;"></div>' +
        '<div style="padding:8px 16px;border-top:1px solid var(--border-color,#e2e8f0);text-align:center;">' +
        '<button onclick="markAllRead()" style="background:none;border:none;color:#7c3aed;font-size:12px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;">Marcar todas como lidas</button></div>';
    
    document.body.appendChild(panel);
    
    // Renderizar notificações em memória
    renderNotificationsInPanel();
    
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
// 9. ADICIONAR REAÇÕES AOS POSTS (VERSÃO CORRIGIDA COM toggle_reaction_direct)
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
            
            // CARREGAR CONTAGEM INICIAL
            carregarContagemInicial(post.dataset.postId, r.id, btn);
            
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (!currentUser) return showToast('Faça login', 'error');
                
                var postId = this.dataset.postId;
                var reactionType = this.dataset.reaction;
                var countSpan = this.querySelector('.reaction-count');
                
                // Desabilitar botão para evitar spam
                this.disabled = true;
                this.style.opacity = '0.6';
                
                // 🔥 OBTER ID DO USUÁRIO ATUAL
                supabase.auth.getUser().then(function(userResult) {
                    var userId = userResult.data.user?.id;
                    
                    if (!userId) {
                        showToast('Erro: usuário não identificado', 'error');
                        btn.disabled = false;
                        btn.style.opacity = '1';
                        return;
                    }
                    
                    // 🔥 CHAMAR toggle_reaction_direct COM user_id
                    supabase.rpc('toggle_reaction_direct', {
                        p_post_id: postId,
                        p_reaction_type: reactionType,
                        p_user_id: userId
                    }).then(function(result) {
                        console.log('📥 Resposta toggle_reaction_direct:', result);
                        
                        if (result.error) {
                            console.error('❌ Erro na RPC:', result.error);
                            showToast('Erro: ' + (result.error.message || 'Erro ao reagir'), 'error');
                            btn.disabled = false;
                            btn.style.opacity = '1';
                            return;
                        }
                        
                        // ATUALIZA O CONTADOR COM O VALOR RETORNADO
                        if (result.data && result.data.count !== undefined) {
                            if (countSpan) {
                                countSpan.textContent = result.data.count;
                            }
                            
                            if (result.data.action === 'added') {
                                btn.style.borderColor = '#7c3aed';
                                btn.style.background = 'rgba(124,58,237,0.08)';
                            } else if (result.data.action === 'removed') {
                                btn.style.borderColor = 'var(--border-color,#e2e8f0)';
                                btn.style.background = 'transparent';
                            }
                            
                            console.log('✅ Reação ' + result.data.action + '! Total: ' + result.data.count);
                        }
                        
                        btn.disabled = false;
                        btn.style.opacity = '1';
                        
                    }).catch(function(error) {
                        console.error('❌ Erro ao reagir:', error);
                        showToast('Erro ao reagir: ' + error.message, 'error');
                        btn.disabled = false;
                        btn.style.opacity = '1';
                    });
                }).catch(function(error) {
                    console.error('❌ Erro ao obter usuário:', error);
                    showToast('Erro ao obter usuário', 'error');
                    btn.disabled = false;
                    btn.style.opacity = '1';
                });
            });
            
            container.appendChild(btn);
        });
        
        actionsDiv.appendChild(container);
    });
}

// FUNÇÃO PARA CARREGAR CONTAGEM INICIAL
function carregarContagemInicial(postId, reactionType, btn) {
    var supabase = window.supabaseClient;
    supabase
        .from('reactions')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('reaction_type', reactionType)
        .then(function(res) {
            var countSpan = btn.querySelector('.reaction-count');
            if (countSpan && !res.error) {
                countSpan.textContent = res.count || 0;
            }
        })
        .catch(function(e) {
            console.warn('Erro ao carregar contagem:', e);
        });
}

    // =============================================
    // 20. SISTEMA DE AMIZADES E CONVITES DE GRUPO (LOGICA)
    // =============================================

    // --- PESQUISA DE USUÁRIOS ---
    let searchDebounceTimeout = null;
    const userSearchInput = document.getElementById('userSearchInput');
    const userSearchResults = document.getElementById('userSearchResults');

    if (userSearchInput) {
        userSearchInput.addEventListener('input', () => {
            clearTimeout(searchDebounceTimeout);
            const query = userSearchInput.value.trim();
            if (query.length < 2) {
                if (userSearchResults) {
                    userSearchResults.innerHTML = '';
                    userSearchResults.setAttribute('hidden', '');
                }
                return;
            }
            searchDebounceTimeout = setTimeout(() => handleUserSearch(query), 300); // 300ms debounce
        });
    }

    // Fechar resultados ao clicar fora
    document.addEventListener('click', (e) => {
        if (userSearchResults && !userSearchResults.contains(e.target) && e.target !== userSearchInput) {
            userSearchResults.setAttribute('hidden', '');
        }
    });

    async function handleUserSearch(query) {
        if (!currentUser) return;
        const results = await apiSearchUsers(query);
        if (!userSearchResults) return;

        userSearchResults.removeAttribute('hidden');
        if (results.length === 0) {
            userSearchResults.innerHTML = '<div class="user-search-empty">Nenhum usuário encontrado.</div>';
            return;
        }

        userSearchResults.innerHTML = results.map(u => {
            let actionBtn = '';
            if (!u.friendship_status) {
                actionBtn = `<button class="btn-add-friend add" onclick="window.sendFriendRequest('${u.id}')">Adicionar</button>`;
            } else if (u.friendship_status === 'pending') {
                if (u.is_requester) {
                    actionBtn = `<button class="btn-add-friend pending" disabled>⏳ Pendente</button>`;
                } else {
                    actionBtn = `<button class="btn-add-friend accept" onclick="window.acceptFriendRequest('${u.friendship_id}')">Aceitar</button>`;
                }
            } else if (u.friendship_status === 'accepted') {
                actionBtn = `<button class="btn-add-friend friends" disabled>✓ Amigos</button>`;
            }

            const initial = (u.username || 'U').charAt(0).toUpperCase();
            const avatarColor = stringToColor(u.id);

            const avatarHtml = u.avatar_url && u.avatar_url !== AVATAR_PADRAO
                ? `<img src="${u.avatar_url}" alt="${u.username}" class="user-search-avatar" onerror="this.outerHTML='<div class=&quot;user-search-avatar-fallback&quot; style=&quot;background:${avatarColor}&quot;>${initial}</div>';">`
                : `<div class="user-search-avatar-fallback" style="background:${avatarColor}">${initial}</div>`;

            return `
                <div class="user-search-result" onclick="window.openFriendProfile('${u.id}', '${escapeHtml(u.username)}', '${u.avatar_url || ''}')">
                    ${avatarHtml}
                    <div class="user-search-info">
                        <span class="user-search-name">${escapeHtml(u.username)}</span>
                        <span class="user-search-handle">@${escapeHtml(u.username.toLowerCase())}</span>
                    </div>
                    <div onclick="event.stopPropagation()">${actionBtn}</div>
                </div>
            `;
        }).join('');
    }

    // --- SISTEMA DE AMIZADES ---
    window.sendFriendRequest = async function(receiverId) {
        if (!currentUser) return showToast('Faça login primeiro.', 'warning');
        const res = await apiSendFriendRequest(receiverId);
        if (res && res.success) {
            showToast('Solicitação de amizade enviada! 🤝', 'success');
            const query = userSearchInput?.value.trim() || '';
            if (query) handleUserSearch(query);
            await renderFriendRequests();
        } else {
            showToast(res?.error || 'Erro ao enviar solicitação.', 'error');
        }
    };

    window.acceptFriendRequest = async function(friendshipId) {
        const res = await apiRespondFriendRequest(friendshipId, 'accepted');
        if (res && res.success) {
            showToast('Solicitação aceita! Agora vocês são amigos. 🎉', 'success');
            const query = userSearchInput?.value.trim() || '';
            if (query) handleUserSearch(query);
            await renderFriendsList();
            await renderFriendRequests();
            await renderChatChannels();
        } else {
            showToast(res?.error || 'Erro ao aceitar solicitação.', 'error');
        }
    };

    window.rejectFriendRequest = async function(friendshipId) {
        const res = await apiRespondFriendRequest(friendshipId, 'rejected');
        if (res && res.success) {
            showToast('Solicitação recusada.', 'info');
            await renderFriendRequests();
            const query = userSearchInput?.value.trim() || '';
            if (query) handleUserSearch(query);
        } else {
            showToast(res?.error || 'Erro ao recusar solicitação.', 'error');
        }
    };

    async function renderFriendRequests() {
        if (!currentUser) return;
        const requests = await apiGetPendingRequests();
        const countBadge = document.getElementById('friendRequestCount');
        const section = document.getElementById('friendRequestsSection');
        const list = document.getElementById('friendRequestsList');

        if (!list || !section) return;

        if (requests.length === 0) {
            section.setAttribute('hidden', '');
            if (countBadge) countBadge.textContent = '0';
            return;
        }

        section.removeAttribute('hidden');
        if (countBadge) countBadge.textContent = requests.length;

        list.innerHTML = requests.map(r => {
            const initial = (r.username || 'U').charAt(0).toUpperCase();
            const avatarColor = stringToColor(r.requester_id);
            const avatarHtml = r.avatar_url && r.avatar_url !== AVATAR_PADRAO
                ? `<img src="${r.avatar_url}" alt="${r.username}" class="user-search-avatar" onerror="this.outerHTML='<div class=&quot;user-search-avatar-fallback&quot; style=&quot;background:${avatarColor}&quot;>${initial}</div>';">`
                : `<div class="user-search-avatar-fallback" style="background:${avatarColor}">${initial}</div>`;

            return `
                <div class="friend-request-card">
                    ${avatarHtml}
                    <div class="user-search-info">
                        <span class="user-search-name">${escapeHtml(r.username)}</span>
                        <span class="user-search-handle">Quer ser seu amigo</span>
                    </div>
                    <div class="friend-request-actions">
                        <button class="btn-request-action btn-request-accept" onclick="window.acceptFriendRequest('${r.friendship_id}')" title="Aceitar"><i class="fa-solid fa-check"></i></button>
                        <button class="btn-request-action btn-request-reject" onclick="window.rejectFriendRequest('${r.friendship_id}')" title="Recusar"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function renderFriendsList() {
    if (!currentUser) return;
    const friends = await apiGetFriends();
    const list = document.getElementById('friendsList');
    if (!list) return;

    if (friends.length === 0) {
        list.innerHTML = '<div class="empty-friends">Pesquise usuários acima para adicionar amigos</div>';
        return;
    }

    list.innerHTML = friends.map(f => {
        const initial = (f.username || 'U').charAt(0).toUpperCase();
        const avatarColor = stringToColor(f.friend_id);
        const avatarHtml = f.avatar_url && f.avatar_url !== AVATAR_PADRAO
            ? `<img src="${f.avatar_url}" alt="${f.username}" class="friend-avatar" onerror="this.outerHTML='<div class=&quot;friend-avatar-fallback&quot; style=&quot;background:${avatarColor}&quot;>${initial}</div>';">`
            : `<div class="friend-avatar-fallback" style="background:${avatarColor}">${initial}</div>`;

        return `
            <div class="friend-item" onclick="window.openFriendProfile('${f.friend_id}', '${escapeHtml(f.username)}', '${f.avatar_url || ''}')">
                ${avatarHtml}
                <div class="friend-info">
                    <span class="friend-name">${escapeHtml(f.username)}</span>
                    <span class="friend-handle">@${escapeHtml(f.username.toLowerCase())}</span>
                </div>
                <!-- BOTÃO DE CONVERSA PRIVADA -->
                <button class="friend-chat-btn" onclick="event.stopPropagation(); window.openFriendChat('${f.conversation_id || ''}', '${escapeHtml(f.username)}', '${f.friend_id}')" title="Conversar">
                    <i class="fa-regular fa-comment-dots"></i>
                </button>
            </div>
        `;
    }).join('');
}
  
    // ================================================================
// CHAT — ABRIR CONVERSA PRIVADA COM AMIGO
// ================================================================

window.openFriendChat = async function(conversationId, friendUsername, friendId) {
    // Se já tem conversationId, usa direto
    if (conversationId) {
        switchChat(conversationId, '@' + friendUsername);
        switchTab('conversa');
        return;
    }
    
    // Se não tem, cria uma nova conversa privada
    if (friendId) {
        showToast('📨 Criando conversa com ' + friendUsername + '...', 'info', 2000);
        
        const result = await apiCreatePrivateConversation(friendId);
        if (result && result.success) {
            const chatId = result.conversation_id || result.id;
            const chatName = '@' + friendUsername;
            switchChat(chatId, chatName);
            switchTab('conversa');
            showToast('💬 Conversa com ' + friendUsername + ' iniciada!', 'success');
        } else {
            showToast(result?.message || 'Erro ao criar conversa.', 'error');
        }
    } else {
        showToast('ID do amigo não fornecido.', 'error');
    }
};

    // --- PERFIL DO AMIGO MODAL ---
    let selectedFriendId = null;
    let selectedFriendName = null;
    let selectedFriendAvatar = null;

    window.openFriendProfile = function(friendId, friendName, friendAvatar) {
    selectedFriendId = friendId;
    selectedFriendName = friendName;
    selectedFriendAvatar = friendAvatar;

    const modal = document.getElementById('friendProfileModal');
    const nameEl = document.getElementById('friendProfileName');
    const handleEl = document.getElementById('friendProfileHandle');
    const avatarEl = document.getElementById('friendProfileAvatar');

    if (nameEl) nameEl.textContent = friendName;
    if (handleEl) handleEl.textContent = '@' + friendName.toLowerCase();
    if (avatarEl) {
        avatarEl.src = friendAvatar && friendAvatar !== AVATAR_PADRAO ? friendAvatar : AVATAR_PADRAO;
    }

    // Botão "Conversar" - sempre disponível
    const chatBtn = document.getElementById('friendProfileChatBtn');
    if (chatBtn) {
        chatBtn.style.display = 'flex';
        chatBtn.onclick = () => {
            // Buscar conversation_id se existir
            apiGetFriends().then(friends => {
                const friend = friends.find(f => f.friend_id === friendId);
                window.openFriendChat(
                    friend?.conversation_id || null, 
                    friendName, 
                    friendId
                );
                modal?.setAttribute('hidden', '');
            });
        };
    }

    modal?.removeAttribute('hidden');
};
    document.getElementById('closeFriendProfileModal')?.addEventListener('click', () => {
        document.getElementById('friendProfileModal')?.setAttribute('hidden', '');
    });

    document.getElementById('friendProfileAddToGroupBtn')?.addEventListener('click', () => {
        document.getElementById('friendProfileModal')?.setAttribute('hidden', '');
        if (selectedFriendId) {
            window.openSelectGroupForFriendModal(selectedFriendId, selectedFriendName);
        }
    });

    // --- MODAL: SELECIONAR GRUPO PARA AMIGO ---
    window.openSelectGroupForFriendModal = async function(friendId, friendName) {
        const modal = document.getElementById('selectGroupForFriendModal');
        const subtitle = document.getElementById('selectGroupSubtitle');
        const list = document.getElementById('groupsForFriendList');

        if (subtitle) subtitle.textContent = `Adicionar ${friendName} a um de seus grupos`;
        if (!list) return;

        list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:12px;">Carregando seus grupos...</p>';
        modal?.removeAttribute('hidden');

        const groups = await apiGetGroups();
        const myGroups = groups.filter(g => g.is_admin === true || g.created_by === currentUser?.id);

        if (myGroups.length === 0) {
            list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:12px;">Você não administra nenhum grupo.</p>';
            return;
        }

        list.innerHTML = myGroups.map(g => {
            return `
                <div class="group-for-friend-item" onclick="window.addFriendToGroup('${friendId}', '${g.id}')">
                    <div class="group-for-friend-icon"><i class="fa-solid fa-users"></i></div>
                    <div class="group-for-friend-info">
                        <span class="group-for-friend-name">${escapeHtml(g.name)}</span>
                        <span class="group-for-friend-meta">${g.members || 0} membros</span>
                    </div>
                    <button class="btn-add-to-group">Adicionar</button>
                </div>
            `;
        }).join('');
    };

    document.getElementById('closeSelectGroupModal')?.addEventListener('click', () => {
        document.getElementById('selectGroupForFriendModal')?.setAttribute('hidden', '');
    });

    window.addFriendToGroup = async function(friendId, groupId) {
        const res = await apiAddFriendToGroup(friendId, groupId);
        if (res && res.success) {
            showToast(`Adicionado com sucesso ao grupo! 🎉`, 'success');
            document.getElementById('selectGroupForFriendModal')?.setAttribute('hidden', '');
            await renderGroups();
        } else {
            showToast(res?.error || 'Erro ao adicionar ao grupo.', 'error');
        }
    };

    // --- MODAL: ADICIONAR AMIGO A GRUPO ---
    let activeGroupIdForAddFriend = null;

    window.openAddFriendToGroupModal = async function(groupId) {
        activeGroupIdForAddFriend = groupId;
        const modal = document.getElementById('addFriendToGroupModal');
        const list = document.getElementById('friendsForGroupList');
        const input = document.getElementById('searchFriendForGroupInput');

        if (input) input.value = '';
        if (!list) return;

        list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:12px;">Carregando amigos...</p>';
        modal?.removeAttribute('hidden');

        const friends = await apiGetFriends();
        renderFriendsForGroupList(friends);

        if (input) {
            input.oninput = () => {
                const query = input.value.toLowerCase().trim();
                const filtered = friends.filter(f => f.username.toLowerCase().includes(query));
                renderFriendsForGroupList(filtered);
            };
        }
    };

    function renderFriendsForGroupList(friendsList) {
        const list = document.getElementById('friendsForGroupList');
        if (!list) return;

        if (friendsList.length === 0) {
            list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:12px;">Nenhum amigo encontrado.</p>';
            return;
        }

        list.innerHTML = friendsList.map(f => {
            const initial = (f.username || 'U').charAt(0).toUpperCase();
            const avatarColor = stringToColor(f.friend_id);
            const avatarHtml = f.avatar_url && f.avatar_url !== AVATAR_PADRAO
                ? `<img src="${f.avatar_url}" alt="${f.username}" class="friend-avatar" onerror="this.outerHTML='<div class=&quot;friend-avatar-fallback&quot; style=&quot;background:${avatarColor}&quot;>${initial}</div>';">`
                : `<div class="friend-avatar-fallback" style="background:${avatarColor}">${initial}</div>`;

            return `
                <div class="friend-for-group-item">
                    ${avatarHtml}
                    <div class="friend-info">
                        <span class="friend-name">${escapeHtml(f.username)}</span>
                        <span class="friend-handle">@${escapeHtml(f.username.toLowerCase())}</span>
                    </div>
                    <button class="btn-add-to-group" onclick="window.executeAddFriendToGroup('${f.friend_id}')">Adicionar</button>
                </div>
            `;
        }).join('');
    }

    window.executeAddFriendToGroup = async function(friendId) {
        if (!activeGroupIdForAddFriend) return;
        const res = await apiAddFriendToGroup(friendId, activeGroupIdForAddFriend);
        if (res && res.success) {
            showToast(`Adicionado ao grupo com sucesso! 🎉`, 'success');
            document.getElementById('addFriendToGroupModal')?.setAttribute('hidden', '');
            await renderGroups();
        } else {
            showToast(res?.error || 'Erro ao adicionar amigo.', 'error');
        }
    };

    document.getElementById('closeAddFriendToGroupModal')?.addEventListener('click', () => {
        document.getElementById('addFriendToGroupModal')?.setAttribute('hidden', '');
    });

    // --- MODAL: CODIGO DE CONVITE ---
    let activeGroupIdForInvite = null;

    window.openInviteCodeModal = async function(groupId, groupName) {
        activeGroupIdForInvite = groupId;
        const modal = document.getElementById('inviteCodeModal');
        const title = document.getElementById('inviteCodeGroupName');
        const codeVal = document.getElementById('inviteCodeValue');
        const expiry = document.getElementById('inviteCodeExpiry');

        if (title) title.textContent = `Grupo: ${groupName}`;
        if (codeVal) codeVal.textContent = '-----';
        if (expiry) expiry.textContent = 'Gerando código...';

        modal?.removeAttribute('hidden');

        const res = await apiGenerateGroupInvite(groupId);
        if (res && res.success) {
            if (codeVal) codeVal.textContent = res.code;
            if (expiry) {
                const expDate = new Date(res.expires_at);
                expiry.textContent = `Válido até ${expDate.toLocaleDateString('pt-BR')} às ${expDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
            }
        } else {
            showToast(res?.error || 'Erro ao obter código de convite.', 'error');
            modal?.setAttribute('hidden', '');
        }
    };

    document.getElementById('closeInviteCodeModal')?.addEventListener('click', () => {
        document.getElementById('inviteCodeModal')?.setAttribute('hidden', '');
    });

    document.getElementById('copyInviteCodeBtn')?.addEventListener('click', () => {
        const codeVal = document.getElementById('inviteCodeValue')?.textContent;
        if (codeVal && codeVal !== '-----') {
            navigator.clipboard.writeText(codeVal)
                .then(() => showToast('📋 Código copiado!', 'success'))
                .catch(() => showToast('Erro ao copiar código.', 'error'));
        }
    });

    document.getElementById('regenerateInviteCodeBtn')?.addEventListener('click', async () => {
        if (!activeGroupIdForInvite) return;
        const codeVal = document.getElementById('inviteCodeValue');
        const expiry = document.getElementById('inviteCodeExpiry');

        if (codeVal) codeVal.textContent = '-----';
        if (expiry) expiry.textContent = 'Gerando novo código...';

        await supabase.from('group_invites').update({ active: false }).eq('group_id', activeGroupIdForInvite);

        const res = await apiGenerateGroupInvite(activeGroupIdForInvite);
        if (res && res.success) {
            if (codeVal) codeVal.textContent = res.code;
            if (expiry) {
                const expDate = new Date(res.expires_at);
                expiry.textContent = `Novo código! Válido até ${expDate.toLocaleDateString('pt-BR')} às ${expDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
            }
            showToast('🔄 Novo código gerado!', 'success');
        } else {
            showToast(res?.error || 'Erro ao gerar novo código.', 'error');
        }
    });

    // --- MODAL: USAR CÓDIGO DE CONVITE ---
    window.openUseInviteCodeModal = function() {
        if (!currentUser) return showToast('Faça login primeiro.', 'warning');
        const modal = document.getElementById('useInviteCodeModal');
        const input = document.getElementById('inviteCodeInput');
        if (input) input.value = '';
        modal?.removeAttribute('hidden');
    };

    document.getElementById('useInviteCodeBtn')?.addEventListener('click', window.openUseInviteCodeModal);

    document.getElementById('closeUseInviteCodeModal')?.addEventListener('click', () => {
        document.getElementById('useInviteCodeModal')?.setAttribute('hidden', '');
    });

    document.getElementById('submitInviteCodeBtn')?.addEventListener('click', async () => {
        const input = document.getElementById('inviteCodeInput');
        const code = input?.value.trim();

        if (!code || code.length !== 5 || isNaN(code)) {
            showToast('Código de convite deve ter 5 dígitos numéricos.', 'warning');
            return;
        }

        const res = await apiUseInviteCode(code);
        if (res && res.success) {
            showToast(`Sucesso! Você entrou no grupo "${res.group_name}"! 🎉`, 'success');
            document.getElementById('useInviteCodeModal')?.setAttribute('hidden', '');
            await renderGroups();
            if (res.group_id) {
                switchChat(res.group_id, res.group_name);
                switchTab('conversa');
            }
        } else {
            showToast(res?.error || 'Código inválido ou expirado.', 'error');
        }
    });

    // --- REALTIME SUBSCRIPTION FOR FRIENDSHIPS ---
    let friendshipSubscription = null;
    function subscribeToFriendships() {
        if (!currentUser) return;

        if (friendshipSubscription) {
            supabase.removeChannel(friendshipSubscription);
        }

        friendshipSubscription = supabase
            .channel('public:friendships_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'friendships',
                filter: `or(requester_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id})`
            }, async (payload) => {
                console.log('🔄 Mudança em friendships realtime:', payload);
                await renderFriendsList();
                await renderFriendRequests();
                await renderChatChannels();
                const query = userSearchInput?.value.trim() || '';
                if (query) handleUserSearch(query);
            })
            .subscribe();
    }

    // 10. INICIALIZAR TUDO
    function initCommunityFeatures() {
        console.log('🚀 Inicializando funcionalidades da comunidade...');
        
        addCategorySelectorToModal();
        addHelpRequestLabel();
        addRulesBanner();
        addGroupSearch();
        addNotificationButton();
        
        // Inicializar Amizades e Convites
        renderFriendsList();
        renderFriendRequests();
        subscribeToFriendships();
        
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