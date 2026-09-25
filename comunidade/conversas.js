/* ==========================================================================
   CONVERSAS.JS — páginas independentes de conversa, chat e canais
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    const supabase = window.supabaseClient;
    if (!supabase) {
        console.error('❌ Supabase não inicializado!');
        return;
    }

    const page = document.body.dataset.page || 'inbox';
    const state = {
        user: null,
        groups: [],
        channels: [],
        friends: [],
        conversationId: null,
        conversationType: 'group',
        conversationFriendId: null,
        inboxTab: 'channels',
        inboxQuery: '',
        groupFilter: 'all',
        groupQuery: '',
        visibleGroups: 12,
        channelSubscription: null
    };

    const AVATAR_DEFAULT = '/img/foto-padrão.jpg';
    const CHAT_DEFAULT = '00000000-0000-0000-0000-000000000001';

    const $ = id => document.getElementById(id);
    const pageUrl = new URL(window.location.href);

    function escapeHtml(value) {
        if (value === null || value === undefined) return '';
        const node = document.createElement('div');
        node.textContent = String(value);
        return node.innerHTML;
    }

    function safeMediaUrl(value) {
        if (!value || typeof value !== 'string' || value === 'null') return null;
        try {
            const url = new URL(value, window.location.origin);
            const local = url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
            if (url.protocol === 'https:' || local || url.origin === window.location.origin) return url.href;
        } catch (error) {
            console.warn('URL de mídia inválida:', value);
        }
        return null;
    }

    function avatarUrl(value) {
        return safeMediaUrl(value) || AVATAR_DEFAULT;
    }

    function initial(name) {
        return String(name || '?').trim().charAt(0).toUpperCase() || '?';
    }

    function formatTime(value) {
        if (!value) return '';
        try {
            return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } catch (error) {
            return '';
        }
    }

    function formatDate(value) {
        if (!value) return '';
        try {
            return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (error) {
            return '';
        }
    }

    function showToast(message, type = 'info') {
        let toast = $('cvToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cvToast';
            toast.className = 'cv-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.className = `cv-toast show ${type}`;
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => toast.classList.remove('show'), 3600);
    }

    function setHeaderProfile() {
        const avatar = $('headerAvatar');
        if (!avatar) return;
        avatar.src = avatarUrl(state.user?.user_metadata?.avatar_url);
        avatar.alt = state.user?.user_metadata?.username || 'Meu perfil';
        const profileLink = $('headerProfileLink');
        if (profileLink && state.user?.id) profileLink.href = `/comunidade/perfil.html?id=${encodeURIComponent(state.user.id)}`;
    }

    async function loadSession() {
        try {
            const { data } = await supabase.auth.getSession();
            state.user = data?.session?.user || null;
        } catch (error) {
            console.warn('Não foi possível carregar a sessão:', error);
        }
        setHeaderProfile();
    }

    async function getGroups() {
        const [rpcResult, directResult] = await Promise.all([
            supabase.rpc('get_user_groups'),
            supabase.from('groups').select('*').limit(100)
        ]);

        const rpcGroups = Array.isArray(rpcResult.data) ? rpcResult.data : [];
        const directGroups = (Array.isArray(directResult.data) ? directResult.data : [])
            .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        const rpcById = new Map(rpcGroups.map(group => [group.id, group]));
        const memberIds = new Set();

        if (state.user?.id && directGroups.length) {
            const { data: memberships } = await supabase
                .from('group_members')
                .select('group_id')
                .eq('user_id', state.user.id);
            (memberships || []).forEach(membership => memberIds.add(membership.group_id));
        }

        const merged = directGroups.map(group => {
            const rpcGroup = rpcById.get(group.id) || {};
            return {
                ...group,
                ...rpcGroup,
                image_url: rpcGroup.image_url || group.image_url,
                avatar_url: rpcGroup.avatar_url || group.avatar_url,
                members: rpcGroup.members ?? group.members,
                is_member: Boolean(rpcGroup.is_member) || memberIds.has(group.id) || group.name === 'Geral',
                is_admin: rpcGroup.is_admin ?? group.created_by === state.user?.id
            };
        });

        const ids = new Set(merged.map(group => group.id));
        rpcGroups.forEach(group => {
            if (!ids.has(group.id)) merged.push(group);
        });
        state.groups = merged;
        return merged;
    }

    async function getFriends() {
        const { data, error } = await supabase.rpc('get_friends');
        if (!error && Array.isArray(data)) {
            state.friends = data;
            return data;
        }

        console.warn('RPC get_friends indisponível:', error?.message);
        state.friends = [];
        return state.friends;
    }

    async function getChannels() {
        const { data, error } = await supabase.rpc('get_user_chat_channels');
        if (error || !Array.isArray(data)) {
            console.warn('RPC get_user_chat_channels indisponível:', error?.message);
            state.channels = [];
            return state.channels;
        }

        const knownIds = new Set(state.groups.map(group => group.id));
        state.channels = data.filter(channel => {
            const type = String(channel.type || '').toLowerCase();
            return knownIds.has(channel.id)
                || type === 'group'
                || channel.id === CHAT_DEFAULT;
        }).map(channel => {
            const group = state.groups.find(item => item.id === channel.id);
            return group ? {
                ...group,
                ...channel,
                type: 'group',
                image_url: channel.image_url || group.image_url,
                members: channel.members ?? group.members
            } : { ...channel, type: 'group' };
        });
        return state.channels;
    }

    function getGroup(groupId) {
        return state.groups.find(group => group.id === groupId) || null;
    }

    function avatarMarkup(url, name, className = 'conversation-avatar') {
        const image = safeMediaUrl(url);
        return image
            ? `<span class="${className}"><img src="${escapeHtml(image)}" alt="Foto de ${escapeHtml(name || 'perfil')}" loading="lazy"></span>`
            : `<span class="${className}">${escapeHtml(initial(name))}</span>`;
    }

    function profileUrl(userId) {
        return userId ? `/comunidade/perfil-amigo.html?id=${encodeURIComponent(userId)}` : '#';
    }

    function groupUrl(groupId) {
        return `/comunidade/detalhes-canal.html?id=${encodeURIComponent(groupId)}`;
    }

    function internalGroupUrl(groupId) {
        return `/comunidade/grupo.html?id=${encodeURIComponent(groupId)}`;
    }

    function channelUrl(channel) {
        return `/comunidade/chat.html?id=${encodeURIComponent(channel.id)}&type=group&name=${encodeURIComponent(channel.name || 'Comunidade')}`;
    }

    async function ensureDirectConversation(friend) {
        if (!friend) return null;
        if (friend.conversation_id) return friend.conversation_id;
        if (!state.user?.id) {
            showToast('Faça login para iniciar uma conversa.', 'warning');
            return null;
        }

        const myId = state.user.id;
        const { data: participantRows } = await supabase
            .from('conversation_participants')
            .select('conversation_id, user_id')
            .in('user_id', [myId, friend.friend_id]);

        const groupIds = new Set(state.groups.map(group => group.id));
        const byConversation = new Map();
        (participantRows || []).forEach(row => {
            if (!byConversation.has(row.conversation_id)) byConversation.set(row.conversation_id, new Set());
            byConversation.get(row.conversation_id).add(row.user_id);
        });
        const candidateIds = [...byConversation.entries()]
            .filter(([, users]) => users.has(myId) && users.has(friend.friend_id))
            .map(([id]) => id)
            .filter(id => !groupIds.has(id));

        if (candidateIds.length) {
            const { data: conversations } = await supabase
                .from('conversations')
                .select('id, type')
                .in('id', candidateIds);
            const existing = (conversations || [])
                .find(row => ['direct', 'private'].includes(String(row.type || '').toLowerCase()));
            if (existing) {
                friend.conversation_id = existing.id;
                return existing.id;
            }
        }

        const newId = crypto.randomUUID ? crypto.randomUUID() : `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, char => {
            const random = Math.random() * 16 | 0;
            const value = char === 'x' ? random : (random & 0x3 | 0x8);
            return value.toString(16);
        });
        const now = new Date().toISOString();
        const { error: conversationError } = await supabase
            .from('conversations')
            .insert({ id: newId, name: friend.username || 'Amigo', type: 'direct', created_by: myId, created_at: now });
        if (conversationError) throw conversationError;

        const { error: participantError } = await supabase
            .from('conversation_participants')
            .insert([
                { conversation_id: newId, user_id: myId, joined_at: now },
                { conversation_id: newId, user_id: friend.friend_id, joined_at: now }
            ]);
        if (participantError) throw participantError;

        friend.conversation_id = newId;
        return newId;
    }

    async function openConversation(item) {
        try {
            if (item.kind === 'group') {
                window.location.href = channelUrl(item.data);
                return;
            }
            const conversationId = await ensureDirectConversation(item.data);
            if (!conversationId) return;
            const params = new URLSearchParams({
                id: conversationId,
                type: 'direct',
                friendId: item.data.friend_id,
                name: item.data.username || 'Amigo'
            });
            window.location.href = `/comunidade/chat.html?${params.toString()}`;
        } catch (error) {
            console.error('Erro ao abrir conversa:', error);
            showToast('Não foi possível abrir esta conversa.', 'error');
        }
    }

    function renderInboxAside() {
        const channelsCount = $('asideChannelCount');
        const friendsCount = $('asideFriendCount');
        const totalCount = $('asideTotalCount');
        if (channelsCount) channelsCount.textContent = state.channels.length;
        if (friendsCount) friendsCount.textContent = state.friends.length;
        if (totalCount) totalCount.textContent = state.channels.length + state.friends.length;
    }

    function renderInbox() {
        const list = $('conversationList');
        if (!list) return;
        const query = state.inboxQuery.trim().toLowerCase();
        const source = state.inboxTab === 'friends' ? state.friends : state.channels;
        const items = source.filter(item => !query || `${item.name || item.username || ''}`.toLowerCase().includes(query));

        if (!items.length) {
            list.innerHTML = `<div class="conversation-empty"><i class="fa-regular fa-comments" style="font-size:28px;color:var(--cv-gold);"></i><strong>${query ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa por aqui'}</strong><span>${query ? 'Tente outro nome.' : 'Crie uma comunidade ou procure um amigo.'}</span></div>`;
        } else {
            list.innerHTML = items.map(item => {
                const isFriend = state.inboxTab === 'friends';
                const name = isFriend ? (item.username || 'Amigo') : (item.name || 'Comunidade');
                const image = isFriend ? item.avatar_url : (item.image_url || item.avatar_url);
                const meta = isFriend ? 'Conversa privada' : `${item.members || 0} membros`;
                const avatarLink = isFriend ? profileUrl(item.friend_id) : internalGroupUrl(item.id);
                return `<div class="conversation-item" role="button" tabindex="0" data-conversation-kind="${isFriend ? 'friend' : 'group'}" data-conversation-id="${escapeHtml(item.friend_id || item.id)}" data-friend-id="${escapeHtml(item.friend_id || '')}" data-friend-name="${escapeHtml(name)}">
                    <a href="${avatarLink}" onclick="event.stopPropagation()" aria-label="Abrir ${isFriend ? 'perfil' : 'comunidade'}">${avatarMarkup(image, name)}</a>
                    <span class="conversation-copy"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(meta)}</span></span>
                    <i class="fa-solid fa-chevron-right" style="color:var(--cv-muted-soft);font-size:10px;"></i>
                </div>`;
            }).join('');
        }

        const emptyTitle = $('inboxEmptyTitle');
        const emptyText = $('inboxEmptyText');
        if (emptyTitle && emptyText) {
            const hasAny = state.channels.length || state.friends.length;
            emptyTitle.textContent = hasAny ? 'Selecione uma conversa para começar' : 'Você ainda não começou nenhuma conversa';
            emptyText.textContent = hasAny ? 'Escolha um amigo ou canal na lista ao lado.' : 'Depois que você criar uma conversa, ela aparecerá aqui.';
        }
        renderInboxAside();
    }

    function setupInbox() {
        $('conversationSearch')?.addEventListener('input', event => {
            state.inboxQuery = event.target.value || '';
            renderInbox();
        });
        document.querySelectorAll('[data-inbox-tab]').forEach(button => {
            button.addEventListener('click', () => {
                state.inboxTab = button.dataset.inboxTab;
                document.querySelectorAll('[data-inbox-tab]').forEach(item => {
                    const active = item === button;
                    item.classList.toggle('active', active);
                    item.setAttribute('aria-selected', String(active));
                });
                renderInbox();
            });
        });
        $('conversationList')?.addEventListener('click', event => {
            const button = event.target.closest('[data-conversation-kind]');
            if (!button) return;
            const kind = button.dataset.conversationKind;
            if (kind === 'group') {
                const channel = state.channels.find(item => item.id === button.dataset.conversationId);
                if (channel) openConversation({ kind, data: channel });
            } else {
                const friend = state.friends.find(item => item.friend_id === button.dataset.friendId);
                if (friend) openConversation({ kind, data: friend });
            }
        });
        $('conversationList')?.addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            const item = event.target.closest('[data-conversation-kind]');
            if (item) item.click();
        });
        $('openCreateConversationBtn')?.addEventListener('click', openCreateModal);
        $('openCreateConversationRailBtn')?.addEventListener('click', openCreateModal);
        $('closeCreateModal')?.addEventListener('click', closeCreateModal);
        $('createConversationForm')?.addEventListener('submit', createGroupFromModal);
        $('createCommunityShortcut')?.addEventListener('click', () => {
            window.location.href = '/comunidade/explorar-grupos.html?criar=1';
        });
        renderInbox();
    }

    function openCreateModal() {
        if (!state.user?.id) {
            showToast('Faça login para criar uma comunidade.', 'warning');
            return;
        }
        $('createConversationModal')?.removeAttribute('hidden');
        $('newCommunityName')?.focus();
    }

    function closeCreateModal() {
        $('createConversationModal')?.setAttribute('hidden', '');
    }

    async function createGroupFromModal(event) {
        event.preventDefault();
        if (!state.user?.id) return;
        const name = $('newCommunityName')?.value.trim();
        const description = $('newCommunityDescription')?.value.trim() || 'Uma comunidade para trocar experiências e apoio.';
        const category = $('newCommunityCategory')?.value || 'geral';
        if (!name) {
            showToast('Informe um nome para a comunidade.', 'warning');
            return;
        }
        const button = $('createCommunitySubmit');
        if (button) button.disabled = true;
        try {
            const { data: group, error } = await supabase
                .from('groups')
                .insert({
                    name,
                    description,
                    category,
                    image_url: '/img/grupo-padrao.png',
                    members: 1,
                    is_private: false,
                    created_by: state.user.id,
                    created_at: new Date().toISOString()
                })
                .select('id')
                .single();
            if (error) throw error;
            const now = new Date().toISOString();
            const { error: memberError } = await supabase.from('group_members').insert({ group_id: group.id, user_id: state.user.id, joined_at: now });
            if (memberError) throw memberError;
            await supabase.from('conversation_participants').insert({ conversation_id: group.id, user_id: state.user.id, joined_at: now });
            closeCreateModal();
            window.location.href = channelUrl({ id: group.id, name });
        } catch (error) {
            console.error('Erro ao criar comunidade:', error);
            showToast(error.message || 'Não foi possível criar a comunidade.', 'error');
        } finally {
            if (button) button.disabled = false;
        }
    }

    function setChatHeader({ id, name, type, subtitle, avatar, profileId }) {
        const title = $('chatRoomTitle');
        const subtitleEl = $('chatRoomSubtitle');
        const avatarEl = $('chatHeaderAvatar');
        const titleLink = $('chatRoomTitleLink');
        const avatarLink = $('chatHeaderAvatarLink');
        const action = $('chatRoomAction');
        if (title) title.textContent = name;
        if (subtitleEl) subtitleEl.textContent = subtitle;
        if (avatarEl) {
            const image = safeMediaUrl(avatar);
            avatarEl.innerHTML = image
                ? `<img src="${escapeHtml(image)}" alt="Foto de ${escapeHtml(name)}">`
                : escapeHtml(initial(name));
        }
        if (titleLink) titleLink.href = type === 'direct' ? profileUrl(profileId) : groupUrl(id);
        if (avatarLink) avatarLink.href = type === 'direct' ? profileUrl(profileId) : groupUrl(id);
        if (action) action.href = type === 'direct' ? profileUrl(profileId) : groupUrl(id);
    }

    function renderMessages(messages) {
        const container = $('chatMessageList');
        if (!container) return;
        if (!messages?.length) {
            container.innerHTML = `<div class="chat-empty"><div><i class="fa-regular fa-comments" style="font-size:34px;color:var(--cv-gold);"></i><strong>Comece a conversa</strong><span>As mensagens enviadas aparecerão aqui.</span></div></div>`;
            return;
        }

        const sorted = [...messages].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
        let lastDate = '';
        container.innerHTML = sorted.map(message => {
            const mine = message.sender_id === state.user?.id;
            const sender = message.sender_name || 'Membro';
            const date = message.created_at ? new Date(message.created_at).toDateString() : '';
            const divider = date && date !== lastDate
                ? `<div class="chat-date-divider">${escapeHtml(formatDate(message.created_at))}</div>`
                : '';
            if (date) lastDate = date;
            const avatar = safeMediaUrl(message.sender_avatar);
            const avatarContent = avatar ? `<img src="${escapeHtml(avatar)}" alt="">` : escapeHtml(initial(sender));
            return `${divider}<div class="chat-message-row ${mine ? 'mine' : ''}">
                <a class="chat-message-avatar" href="${profileUrl(message.sender_id)}" aria-label="Ver perfil de ${escapeHtml(sender)}">${avatarContent}</a>
                <div class="chat-bubble-wrap">
                    ${!mine ? `<a class="chat-author" href="${profileUrl(message.sender_id)}">${escapeHtml(sender)}</a>` : ''}
                    <div class="chat-bubble">${escapeHtml(message.content || '')}</div>
                    <span class="chat-message-time">${escapeHtml(formatTime(message.created_at))}</span>
                </div>
            </div>`;
        }).join('');
        container.scrollTop = container.scrollHeight;
    }

    async function loadMessages() {
        const container = $('chatMessageList');
        if (!container || !state.conversationId) return;
        container.innerHTML = '<div class="chat-loading"><i class="fa-solid fa-spinner fa-spin"></i><span>Carregando mensagens...</span></div>';
        const { data, error } = await supabase.rpc('get_messages', {
            p_conversation_id: state.conversationId,
            p_limit: 100
        });
        if (error) {
            container.innerHTML = `<div class="chat-empty"><div><strong>Não foi possível carregar a conversa</strong><span>${escapeHtml(error.message)}</span></div></div>`;
            return;
        }
        renderMessages(data || []);
    }

    function subscribeToConversation() {
        if (!state.conversationId) return;
        if (state.channelSubscription) supabase.removeChannel(state.channelSubscription);
        state.channelSubscription = supabase
            .channel(`conversation-page-${state.conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${state.conversationId}`
            }, payload => {
                if (payload.new?.sender_id !== state.user?.id) {
                    loadMessages();
                }
            })
            .subscribe();
    }

    async function sendMessage(event) {
        event?.preventDefault();
        const input = $('chatComposerInput');
        const button = $('chatSendButton');
        const content = input?.value.trim();
        if (!content || !state.conversationId) return;
        if (!state.user?.id) {
            showToast('Faça login para enviar mensagens.', 'warning');
            return;
        }
        if (button) button.disabled = true;
        try {
            const { data, error } = await supabase.rpc('send_message', {
                p_conversation_id: state.conversationId,
                p_content: content
            });
            if (error) throw error;
            if (data?.success === false) throw new Error(data.error || 'Não foi possível enviar a mensagem.');
            input.value = '';
            await loadMessages();
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            showToast(error.message || 'Não foi possível enviar a mensagem.', 'error');
        } finally {
            if (button) button.disabled = false;
            input?.focus();
        }
    }

    async function setupChat() {
        const id = pageUrl.searchParams.get('id');
        if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            window.location.replace('/comunidade/conversas.html');
            return;
        }
        state.conversationId = id;
        state.conversationType = pageUrl.searchParams.get('type') === 'direct' ? 'direct' : 'group';
        state.conversationFriendId = pageUrl.searchParams.get('friendId');
        const nameFromUrl = pageUrl.searchParams.get('name') || (state.conversationType === 'direct' ? 'Amigo' : 'Comunidade');

        if (state.conversationType === 'direct') {
            let profile = null;
            if (state.conversationFriendId) {
                const result = await supabase.from('profiles').select('id, username, avatar_url').eq('id', state.conversationFriendId).maybeSingle();
                profile = result.data;
            }
            setChatHeader({
                id,
                name: profile?.username || nameFromUrl,
                type: 'direct',
                subtitle: 'Conversa privada',
                avatar: profile?.avatar_url,
                profileId: profile?.id || state.conversationFriendId
            });
        } else {
            let group = getGroup(id);
            if (!group) {
                const result = await supabase.from('groups').select('*').eq('id', id).maybeSingle();
                group = result.data;
                if (group) state.groups.push(group);
            }
            setChatHeader({
                id,
                name: group?.name || nameFromUrl,
                type: 'group',
                subtitle: `${Number(group?.members || 0)} membros · comunidade`,
                avatar: group?.image_url || group?.avatar_url,
                profileId: null
            });
        }

        $('chatComposerForm')?.addEventListener('submit', sendMessage);
        $('chatComposerInput')?.addEventListener('keydown', event => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                $('chatComposerForm')?.requestSubmit();
            }
        });
        await loadMessages();
        subscribeToConversation();
    }

    async function loadChannel() {
        const id = pageUrl.searchParams.get('id');
        if (!id) {
            window.location.replace('/comunidade/explorar-grupos.html');
            return null;
        }
        let group = getGroup(id);
        if (!group) {
            const result = await supabase.from('groups').select('*').eq('id', id).maybeSingle();
            group = result.data;
            if (group) state.groups.push(group);
        }
        return group;
    }

    function renderChannelMembers(members, group) {
        const container = $('channelMembersList');
        if (!container) return;
        if (!members.length) {
            container.innerHTML = '<p style="margin:0;color:var(--cv-muted);font-size:12px;">Nenhum membro encontrado.</p>';
            return;
        }
        const sorted = [...members].sort((a, b) => Number(b.is_admin) - Number(a.is_admin) || String(a.username).localeCompare(String(b.username)));
        container.innerHTML = sorted.map(member => `<a class="channel-member" href="${profileUrl(member.id)}">
            <span class="member-avatar">${member.avatar_url ? `<img src="${escapeHtml(avatarUrl(member.avatar_url))}" alt="">` : escapeHtml(initial(member.username))}</span>
            <span class="member-copy"><strong>${escapeHtml(member.username || 'Membro')}</strong><span>${member.id === group.created_by ? 'Administrador' : 'Membro'}</span></span>
        </a>`).join('');
    }

    async function loadChannelMembers(group) {
        const { data: memberships } = await supabase.from('group_members').select('user_id').eq('group_id', group.id);
        const ids = (memberships || []).map(item => item.user_id);
        if (!ids.length) {
            renderChannelMembers([], group);
            return;
        }
        const { data: profiles } = await supabase.from('profiles').select('id, username, avatar_url').in('id', ids);
        renderChannelMembers((profiles || []).map(profile => ({ ...profile, is_admin: profile.id === group.created_by })), group);
    }

    async function copyChannelInvite(group) {
        try {
            const { data, error } = await supabase.rpc('generate_group_invite', { p_group_id: group.id });
            if (error || !data?.success) throw new Error(error?.message || 'Não foi possível gerar o convite.');
            await navigator.clipboard?.writeText(data.code);
            showToast(`Código ${data.code} copiado para a área de transferência.`, 'success');
        } catch (error) {
            console.warn('Convite não gerado:', error);
            try {
                await navigator.clipboard?.writeText(window.location.href);
                showToast('Link do canal copiado.', 'success');
            } catch (clipboardError) {
                showToast('Não foi possível copiar o convite.', 'error');
            }
        }
    }

    async function leaveChannel(group) {
        if (!state.user?.id) {
            showToast('Faça login para sair da comunidade.', 'warning');
            return;
        }
        if (!window.confirm(`Sair de “${group.name}”?`)) return;
        try {
            const { error } = await supabase.rpc('leave_group_with_cleanup', { p_group_id: group.id, p_user_id: state.user.id });
            if (error) throw error;
            showToast('Você saiu da comunidade.', 'success');
            window.location.href = '/comunidade/conversas.html';
        } catch (error) {
            console.warn('Saída por RPC indisponível, usando fallback:', error);
            const { error: memberError } = await supabase.from('group_members').delete().eq('group_id', group.id).eq('user_id', state.user.id);
            if (memberError) {
                showToast(memberError.message, 'error');
                return;
            }
            window.location.href = '/comunidade/conversas.html';
        }
    }

    async function joinChannelFromDetails(group) {
        if (!state.user?.id) {
            showToast('Faça login para entrar na comunidade.', 'warning');
            return;
        }
        try {
            const { data, error } = await supabase.rpc('join_group_with_cleanup', {
                p_group_id: group.id,
                p_user_id: state.user.id
            });
            if (error) throw error;
            if (data && data.success === false) throw new Error(data.message || 'Não foi possível entrar.');
            group.is_member = true;
            group.members = Number(group.members || 0) + 1;
            showToast(`Agora você participa de ${group.name}.`, 'success');
            $('joinChannelButton').hidden = true;
            $('openChannelChat').hidden = false;
            await loadChannelMembers(group);
        } catch (error) {
            console.error('Erro ao entrar na comunidade:', error);
            showToast(error.message || 'Não foi possível entrar na comunidade.', 'error');
        }
    }

    async function setupChannelPage() {
        const group = await loadChannel();
        if (!group) {
            showToast('Comunidade não encontrada.', 'error');
            return;
        }
        const banner = $('channelBanner');
        const avatar = $('channelAvatar');
        if (banner) {
            const image = safeMediaUrl(group.image_url || group.banner_url);
            banner.hidden = !image;
            if (image) banner.src = image;
        }
        if (avatar) avatar.innerHTML = group.avatar_url ? `<img src="${escapeHtml(avatarUrl(group.avatar_url))}" alt="">` : escapeHtml(initial(group.name));
        $('channelName').textContent = group.name || 'Comunidade';
        $('channelBreadcrumbName').textContent = group.name || 'Comunidade';
        $('channelCategory').textContent = categoryLabel(group.category);
        $('channelDescription').textContent = group.description || 'Uma comunidade para trocar experiências e encontrar apoio.';
        $('channelMemberCount').textContent = `${Number(group.members || 0)} membros`;
        $('channelCreatedAt').textContent = group.created_at ? `Criada em ${formatDate(group.created_at)}` : 'Comunidade da Amor Neurodivergente';
        $('openChannelChat').href = `/comunidade/chat.html?id=${encodeURIComponent(group.id)}&type=group&name=${encodeURIComponent(group.name || 'Comunidade')}`;
        $('openChannelFeed').href = internalGroupUrl(group.id);
        const isMember = group.is_member === true || group.name === 'Geral' || group.id === CHAT_DEFAULT;
        $('joinChannelButton').hidden = isMember;
        $('openChannelChat').hidden = !isMember;
        $('leaveChannelButton').hidden = !isMember;
        $('joinChannelButton').addEventListener('click', () => joinChannelFromDetails(group));
        $('copyChannelInvite').addEventListener('click', () => copyChannelInvite(group));
        $('leaveChannelButton').addEventListener('click', () => leaveChannel(group));
        await loadChannelMembers(group);
    }

    function categoryLabel(category) {
        const labels = {
            geral: 'Geral', apoio: 'Apoio e acolhimento', tda: 'TDAH', tdh: 'TDAH', autismo: 'Autismo', ansiedade: 'Ansiedade e depressão', educacao: 'Educação e carreira', carreira: 'Educação e carreira', relacionamentos: 'Relacionamentos', hobbies: 'Hobbies e interesses', arte: 'Arte e criatividade', ciencia: 'Ciência e pesquisa', direitos: 'Direitos e leis'
        };
        return labels[String(category || '').toLowerCase()] || category || 'Geral';
    }

    function renderExploreGroups() {
        const grid = $('exploreGroupsGrid');
        if (!grid) return;
        const query = state.groupQuery.trim().toLowerCase();
        let groups = [...state.groups];
        if (state.groupFilter === 'popular') {
            groups.sort((a, b) => Number(b.members || 0) - Number(a.members || 0));
        } else if (state.groupFilter !== 'all') {
            groups = groups.filter(group => String(group.category || 'geral').toLowerCase() === state.groupFilter);
        }
        if (query) groups = groups.filter(group => `${group.name || ''} ${group.description || ''} ${group.category || ''}`.toLowerCase().includes(query));
        const visible = groups.slice(0, state.visibleGroups);
        const count = $('exploreResultCount');
        if (count) count.textContent = `${groups.length} ${groups.length === 1 ? 'comunidade' : 'comunidades'}`;

        if (!visible.length) {
            grid.innerHTML = '<div class="groups-empty"><i class="fa-solid fa-compass" style="font-size:30px;color:var(--cv-gold);"></i><strong>Nenhuma comunidade encontrada</strong><span>Tente outro termo ou categoria.</span></div>';
            return;
        }

        grid.innerHTML = visible.map(group => {
            const name = group.name || 'Comunidade';
            const image = safeMediaUrl(group.image_url || group.banner_url);
            const avatar = safeMediaUrl(group.avatar_url);
            const isMember = group.is_member === true || group.name === 'Geral' || group.id === CHAT_DEFAULT;
            const category = categoryLabel(group.category);
            return `<article class="explore-card" data-group-id="${escapeHtml(group.id)}">
                <div class="explore-card-banner">
                    ${image ? `<img src="${escapeHtml(image)}" alt="Banner de ${escapeHtml(name)}" loading="lazy">` : ''}
                    <span class="explore-card-avatar">${avatar ? `<img src="${escapeHtml(avatar)}" alt="">` : escapeHtml(initial(name))}</span>
                </div>
                <div class="explore-card-body">
                    <div class="explore-card-title-row"><h3><a href="${internalGroupUrl(group.id)}">${escapeHtml(name)}</a></h3><span class="explore-card-badge">${group.is_private ? 'Privada' : 'Pública'}</span></div>
                    <span class="explore-card-category"># ${escapeHtml(category)}</span>
                    <p class="explore-card-description">${escapeHtml(group.description || 'Um espaço para compartilhar experiências e encontrar apoio.')}</p>
                    <span class="explore-card-meta"><i class="fa-regular fa-users"></i> ${Number(group.members || 0)} membros</span>
                    <div class="explore-card-actions">
                        ${isMember ? `<a class="cv-secondary" href="${internalGroupUrl(group.id)}">Visitar</a>` : `<button class="cv-primary" type="button" data-join-group="${escapeHtml(group.id)}">Unir-se</button>`}
                        ${isMember ? `<a class="cv-secondary" href="/comunidade/chat.html?id=${encodeURIComponent(group.id)}&type=group&name=${encodeURIComponent(name)}" aria-label="Abrir conversa"><i class="fa-regular fa-comments"></i></a>` : ''}
                    </div>
                </div>
            </article>`;
        }).join('');

        const more = $('exploreLoadMore');
        if (more) more.hidden = groups.length <= state.visibleGroups;
    }

    async function joinGroupFromExplore(groupId) {
        if (!state.user?.id) {
            showToast('Faça login para entrar em uma comunidade.', 'warning');
            return;
        }
        const group = getGroup(groupId);
        if (!group) return;
        try {
            const { data, error } = await supabase.rpc('join_group_with_cleanup', {
                p_group_id: groupId,
                p_user_id: state.user.id
            });
            if (error) throw error;
            if (data && data.success === false) throw new Error(data.message || 'Não foi possível entrar.');
            group.is_member = true;
            group.members = Number(group.members || 0) + 1;
            showToast(`Você entrou em ${group.name}.`, 'success');
            renderExploreGroups();
        } catch (error) {
            console.error('Erro ao entrar na comunidade:', error);
            showToast(error.message || 'Não foi possível entrar na comunidade.', 'error');
        }
    }

    function renderCommunityFeed(posts, group) {
        const feed = $('communityGroupFeed');
        if (!feed) return;
        const groupPosts = (posts || []).filter(post => post.group_id === group.id);
        const visiblePosts = groupPosts.length ? groupPosts : (posts || []);
        const count = $('communityFeedCount');
        if (count) count.textContent = `${visiblePosts.length} publicações`;
        if (!visiblePosts.length) {
            feed.innerHTML = '<div class="community-feed-empty"><i class="fa-regular fa-comments" style="font-size:30px;color:var(--cv-gold);"></i><strong>Ainda não há publicações</strong><span>Seja a primeira pessoa a compartilhar algo.</span></div>';
            return;
        }
        feed.innerHTML = visiblePosts.map(post => {
            const author = post.author_name || 'Membro';
            const avatar = safeMediaUrl(post.author_avatar);
            const image = safeMediaUrl(post.image_url);
            const video = safeMediaUrl(post.video_url);
            const media = image
                ? `<div class="community-post-media"><img src="${escapeHtml(image)}" alt="Mídia da publicação" loading="lazy"></div>`
                : video
                    ? `<div class="community-post-media"><video src="${escapeHtml(video)}" controls preload="metadata"></video></div>`
                    : '';
            return `<article class="community-feed-card" data-post-id="${escapeHtml(post.id)}">
                <a class="community-post-author" href="${profileUrl(post.author_id)}">
                    <span class="community-post-avatar">${avatar ? `<img src="${escapeHtml(avatar)}" alt="">` : escapeHtml(initial(author))}</span>
                    <span class="community-post-author-copy"><strong>${escapeHtml(author)}</strong><span>${escapeHtml(formatDate(post.created_at))}</span></span>
                </a>
                <a class="community-post-content" href="/comunidade/post.html?id=${encodeURIComponent(post.id)}">${escapeHtml(post.content || 'Abrir publicação')}</a>
                ${media}
                <div class="community-post-footer"><span><i class="fa-regular fa-heart"></i> ${Number(post.likes || 0)}</span><span><i class="fa-regular fa-comment"></i> ${Number(post.comment_count || 0)}</span><a href="/comunidade/post.html?id=${encodeURIComponent(post.id)}"><i class="fa-solid fa-arrow-right"></i> Abrir publicação</a></div>
            </article>`;
        }).join('');
    }

    async function loadCommunityMemberPreview(group) {
        const container = $('communityMemberPreview');
        if (!container) return;
        const { data: memberships } = await supabase.from('group_members').select('user_id').eq('group_id', group.id).limit(5);
        const ids = (memberships || []).map(item => item.user_id);
        if (!ids.length) {
            container.innerHTML = '<p style="margin-top:10px;">Nenhum membro ainda.</p>';
            return;
        }
        const { data: profiles } = await supabase.from('profiles').select('id, username, avatar_url').in('id', ids);
        container.innerHTML = (profiles || []).map(profile => `<a class="community-member-mini" href="${profileUrl(profile.id)}"><span class="member-avatar">${profile.avatar_url ? `<img src="${escapeHtml(avatarUrl(profile.avatar_url))}" alt="">` : escapeHtml(initial(profile.username))}</span><span>${escapeHtml(profile.username || 'Membro')}</span></a>`).join('');
    }

    async function setupCommunityPage() {
        const id = pageUrl.searchParams.get('id');
        if (!id) {
            window.location.replace('/comunidade/explorar-grupos.html');
            return;
        }
        let group = getGroup(id);
        if (!group) {
            const result = await supabase.from('groups').select('*').eq('id', id).maybeSingle();
            group = result.data;
            if (group) state.groups.push(group);
        }
        if (!group) {
            showToast('Comunidade não encontrada.', 'error');
            return;
        }
        const banner = $('communityGroupBanner');
        const avatar = $('communityGroupAvatar');
        const image = safeMediaUrl(group.image_url || group.banner_url);
        if (banner) {
            banner.hidden = !image;
            if (image) banner.src = image;
        }
        if (avatar) avatar.innerHTML = group.avatar_url ? `<img src="${escapeHtml(avatarUrl(group.avatar_url))}" alt="">` : escapeHtml(initial(group.name));
        $('communityBreadcrumbName').textContent = group.name || 'Comunidade';
        $('communityGroupName').textContent = group.name || 'Comunidade';
        $('communityGroupDescription').textContent = `${Number(group.members || 0)} membros · ${categoryLabel(group.category)}`;
        $('communityGroupAbout').textContent = group.description || 'Um espaço para compartilhar experiências e encontrar apoio.';
        const chatUrl = `/comunidade/chat.html?id=${encodeURIComponent(group.id)}&type=group&name=${encodeURIComponent(group.name || 'Comunidade')}`;
        $('communityChatLink').href = chatUrl;
        $('communityChatLinkSide').href = chatUrl;
        $('communityDetailsLink').href = groupUrl(group.id);
        $('communityMembersLink').href = groupUrl(group.id);
        await Promise.all([
            supabase.rpc('get_posts', { p_limit: 50, p_offset: 0 }).then(result => renderCommunityFeed(result.data || [], group)),
            loadCommunityMemberPreview(group)
        ]);
    }

    function setupExploreGroups() {
        $('exploreSearch')?.addEventListener('input', event => {
            state.groupQuery = event.target.value || '';
            state.visibleGroups = 12;
            renderExploreGroups();
        });
        document.querySelectorAll('[data-explore-filter]').forEach(button => {
            button.addEventListener('click', () => {
                state.groupFilter = button.dataset.exploreFilter;
                state.visibleGroups = 12;
                document.querySelectorAll('[data-explore-filter]').forEach(item => {
                    const active = item === button;
                    item.classList.toggle('active', active);
                    item.setAttribute('aria-selected', String(active));
                });
                renderExploreGroups();
            });
        });
        $('exploreLoadMore')?.addEventListener('click', () => {
            state.visibleGroups += 12;
            renderExploreGroups();
        });
        $('exploreCreateButton')?.addEventListener('click', openCreateModal);
        $('closeExploreCreateModal')?.addEventListener('click', closeCreateModal);
        $('exploreCreateForm')?.addEventListener('submit', createGroupFromModal);
        $('exploreGroupsGrid')?.addEventListener('click', event => {
            const joinButton = event.target.closest('[data-join-group]');
            if (joinButton) {
                joinGroupFromExplore(joinButton.dataset.joinGroup);
                return;
            }
            const card = event.target.closest('[data-group-id]');
            if (!card || event.target.closest('a,button')) return;
            window.location.href = internalGroupUrl(card.dataset.groupId);
        });
        renderExploreGroups();
        if (pageUrl.searchParams.get('criar') === '1') openCreateModal();
    }

    async function init() {
        await loadSession();
        await getGroups();
        if (page === 'inbox') {
            await Promise.all([getFriends(), getChannels()]);
            setupInbox();
        } else if (page === 'chat') {
            await setupChat();
        } else if (page === 'channel') {
            await setupChannelPage();
        } else if (page === 'groups') {
            setupExploreGroups();
        } else if (page === 'community') {
            await setupCommunityPage();
        }
    }

    init().catch(error => {
        console.error('Erro ao inicializar páginas de conversa:', error);
        showToast('Não foi possível carregar esta área.', 'error');
    });
});
