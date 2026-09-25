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
        myGroupFilter: 'all',
        myGroupQuery: '',
        visibleGroups: 12,
        editingGroupId: null,
        deletingGroupId: null,
        uploadedGroupMedia: { avatar: null, banner: null },
        removedGroupMedia: { avatar: false, banner: false },
        groupsRpcV2: false,
        channelSubscription: null
    };

    const AVATAR_DEFAULT = '/img/foto-padrão.jpg';
    const CHAT_DEFAULT = '00000000-0000-0000-0000-000000000001';
    const GROUP_IMAGE_BUCKETS = ['group-images', 'avatars'];
    const GROUP_MEDIA_MAX_SIZE = 5 * 1024 * 1024;

    const $ = id => document.getElementById(id);
    const pageUrl = new URL(window.location.href);

    // O tema é compartilhado por toda a comunidade (ver theme.js).
    if (window.ComunidadeTheme) {
        window.ComunidadeTheme.init();
    } else {
        console.warn('theme.js não carregou: o modo escuro ficará indisponível nesta página.');
    }

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

    function showToast(message, type = 'info', duration = 3600) {
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
        showToast.timer = setTimeout(() => toast.classList.remove('show'), duration);
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

    async function safeRpc(name, args = {}) {
        try {
            return await supabase.rpc(name, args);
        } catch (error) {
            return { data: null, error };
        }
    }

    function isActiveGroup(group) {
        if (!group || group.banned === true) return false;
        const status = String(group.status || 'ativo').toLowerCase();
        return !['inativo', 'inactive', 'banido', 'banned', 'suspenso'].includes(status);
    }

    function normalizeGroup(group, memberIds = new Set()) {
        const groupId = group?.id;
        const isOwner = Boolean(state.user?.id && group?.created_by === state.user.id);
        const isDefaultGroup = group?.name === 'Geral' || groupId === CHAT_DEFAULT;
        const isMember = Boolean(group?.is_member) || memberIds.has(groupId);
        const legacyImage = group?.image_url && !String(group.image_url).includes('grupo-padrao')
            ? group.image_url
            : null;
        const suppliedBanner = group?.banner_url && !String(group.banner_url).includes('grupo-padrao')
            ? group.banner_url
            : null;
        const banner = suppliedBanner || legacyImage;

        return {
            ...group,
            image_url: banner || null,
            banner_url: banner || null,
            avatar_url: group?.avatar_url || null,
            is_private: group?.is_private === true,
            is_member: isMember || isOwner || isDefaultGroup,
            is_owner: isOwner,
            is_admin: group?.is_admin === true || isOwner
        };
    }

    async function getGroups() {
        // O probe evita mostrar erros 404 enquanto a migração 09 ainda não foi aplicada.
        const directProbe = await supabase
            .from('groups')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);
        let probeRows = Array.isArray(directProbe.data) ? directProbe.data : [];
        if (!probeRows.length) {
            const retry = await supabase.from('groups').select('*').limit(200);
            probeRows = Array.isArray(retry.data) ? retry.data : [];
        }
        state.groupsRpcV2 = probeRows.some(group => Object.prototype.hasOwnProperty.call(group || {}, 'banner_url') || Object.prototype.hasOwnProperty.call(group || {}, 'avatar_url'));

        const [publicResult, myResult] = state.groupsRpcV2
            ? await Promise.all([
                safeRpc('get_public_groups'),
                state.user?.id ? safeRpc('get_my_groups') : Promise.resolve({ data: [], error: null })
            ])
            : [
                { data: probeRows, error: null },
                { data: [], error: { message: 'Grupo V2 ainda não ativado.' } }
            ];

        let publicGroups = (Array.isArray(publicResult.data) ? publicResult.data : [])
            .filter(group => group?.is_private !== true);
        let myGroups = Array.isArray(myResult.data) ? myResult.data : [];

        // Compatibilidade com o banco atual, que ainda usa get_user_groups.
        if (state.user?.id && myResult.error) {
            const legacyResult = await safeRpc('get_user_groups');
            if (!legacyResult.error && Array.isArray(legacyResult.data)) {
                myGroups = legacyResult.data;
                // A RPC legada foi usada apenas como fallback.
            }
        }

        // Fallback para instalações que ainda não possuem get_public_groups.
        if (publicResult.error) {
            const directResult = await supabase
                .from('groups')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(200);
            publicGroups = (directResult.data || []).filter(group => group?.is_private !== true);
        }

        // Garante que grupos privados criados pelo usuário apareçam mesmo antes da migração.
        let ownedGroups = [];
        if (state.user?.id) {
            const ownedResult = await supabase
                .from('groups')
                .select('*')
                .eq('created_by', state.user.id)
                .limit(100);
            ownedGroups = ownedResult.data || [];
        }

        const memberIds = new Set();
        if (state.user?.id) {
            const memberships = await supabase
                .from('group_members')
                .select('group_id')
                .eq('user_id', state.user.id);
            (memberships.data || []).forEach(membership => memberIds.add(membership.group_id));
        }

        // Compatibilidade para grupos privados já acessados quando a RPC nova ainda não existe.
        if (state.user?.id && memberIds.size) {
            const memberGroups = await supabase
                .from('groups')
                .select('*')
                .in('id', [...memberIds]);
            myGroups.push(...(memberGroups.data || []).filter(group => group?.is_private === true));
        }

        const merged = new Map();
        [...myGroups, ...ownedGroups, ...publicGroups]
            .filter(isActiveGroup)
            .forEach(group => {
                if (!group?.id) return;
                const normalized = normalizeGroup(group, memberIds);
                const previous = merged.get(group.id);
                if (previous) {
                    merged.set(group.id, normalizeGroup({
                        ...previous,
                        ...group,
                        is_member: Boolean(previous.is_member || normalized.is_member),
                        is_owner: Boolean(previous.is_owner || normalized.is_owner),
                        is_admin: Boolean(previous.is_admin || normalized.is_admin)
                    }, memberIds));
                } else {
                    merged.set(group.id, normalized);
                }
            });

        state.groups = [...merged.values()]
            .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        return state.groups;
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
            return channel.id === CHAT_DEFAULT || (type === 'group' && knownIds.has(channel.id));
        }).map(channel => {
            const group = state.groups.find(item => item.id === channel.id);
            return group ? {
                ...group,
                ...channel,
                type: 'group',
                image_url: channel.image_url || group.banner_url || group.image_url,
                banner_url: channel.banner_url || group.banner_url,
                avatar_url: channel.avatar_url || group.avatar_url,
                members: channel.members ?? group.members
            } : { ...channel, type: 'group' };
        });
        return state.channels;
    }

    function getGroup(groupId) {
        return state.groups.find(group => group.id === groupId) || null;
    }

    async function loadAccessibleGroup(groupId) {
        const cached = getGroup(groupId);
        if (cached) return cached;

        if (state.groupsRpcV2) {
            const rpcResult = await safeRpc('get_group_for_user', { p_group_id: groupId });
            if (!rpcResult.error && rpcResult.data) {
                const group = normalizeGroup(Array.isArray(rpcResult.data) ? rpcResult.data[0] : rpcResult.data);
                if (group) {
                    state.groups.push(group);
                    return group;
                }
            }
        }

        // Nunca abrir uma query ampla para um grupo privado não carregado.
        const result = await supabase
            .from('groups')
            .select('*')
            .eq('id', groupId)
            .eq('is_private', false)
            .maybeSingle();
        if (result.error || !result.data) return null;
        const group = normalizeGroup(result.data);
        state.groups.push(group);
        return group;
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
                const image = isFriend ? item.avatar_url : (item.avatar_url || item.image_url);
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
        $('openCreateConversationBtn')?.addEventListener('click', () => openCreateModal());
        $('openCreateConversationRailBtn')?.addEventListener('click', () => openCreateModal());
        $('createCommunityShortcut')?.addEventListener('click', () => {
            window.location.href = '/comunidade/explorar-grupos.html?criar=1';
        });
        renderInbox();
    }

    function isMissingRpcError(error) {
        return /does not exist|not found|schema cache|failed to parse|ainda não ativado/i.test(String(error?.message || ''));
    }

    function setGroupMediaPreview(kind, value) {
        const preview = $(`newCommunity${kind === 'avatar' ? 'Avatar' : 'Banner'}Preview`);
        const placeholder = $(`newCommunity${kind === 'avatar' ? 'Avatar' : 'Banner'}Placeholder`);
        const remove = $(`removeCommunity${kind === 'avatar' ? 'Avatar' : 'Banner'}`);
        const raw = String(value || '');
        const src = raw.startsWith('data:') ? raw : safeMediaUrl(raw);
        if (preview) {
            preview.src = src || '';
            preview.hidden = !src;
        }
        if (placeholder) placeholder.hidden = Boolean(src);
        if (remove) remove.hidden = !src;
    }

    function clearGroupMediaInput(kind) {
        const suffix = kind === 'avatar' ? 'Avatar' : 'Banner';
        const fileInput = $(`newCommunity${suffix}File`);
        const urlInput = $(`newCommunity${suffix}Url`);
        if (fileInput) fileInput.value = '';
        if (urlInput) urlInput.value = '';
        state.uploadedGroupMedia[kind] = null;
        state.removedGroupMedia[kind] = true;
        setGroupMediaPreview(kind, '');
    }

    function previewGroupFile(kind, file) {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast('Escolha uma imagem válida.', 'warning');
            return;
        }
        if (file.size > GROUP_MEDIA_MAX_SIZE) {
            showToast('A imagem deve ter no máximo 5 MB.', 'warning');
            return;
        }
        const reader = new FileReader();
        reader.onload = event => {
            state.uploadedGroupMedia[kind] = file;
            state.removedGroupMedia[kind] = false;
            const urlInput = $(`newCommunity${kind === 'avatar' ? 'Avatar' : 'Banner'}Url`);
            if (urlInput) urlInput.value = '';
            setGroupMediaPreview(kind, event.target?.result || '');
        };
        reader.readAsDataURL(file);
    }

    async function uploadGroupFile(file, kind) {
        if (!file) return null;
        const extension = String(file.name || 'imagem').split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const randomPart = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2);
        const path = `groups/${state.user.id}/${kind}/${Date.now()}-${randomPart}.${extension}`;
        let lastError = null;

        for (const bucket of GROUP_IMAGE_BUCKETS) {
            const result = await supabase.storage.from(bucket).upload(path, file, {
                cacheControl: '3600',
                upsert: false
            });
            if (!result.error) {
                return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
            }
            lastError = result.error;
        }
        throw new Error(lastError?.message || 'Não foi possível enviar a imagem para o armazenamento.');
    }

    async function resolveGroupMedia(kind, currentGroup) {
        if (state.removedGroupMedia[kind]) return null;
        if (state.uploadedGroupMedia[kind]) {
            try {
                return await uploadGroupFile(state.uploadedGroupMedia[kind], kind);
            } catch (error) {
                const url = $(`newCommunity${kind === 'avatar' ? 'Avatar' : 'Banner'}Url`)?.value.trim();
                if (url && safeMediaUrl(url)) return safeMediaUrl(url);
                throw error;
            }
        }
        const url = $(`newCommunity${kind === 'avatar' ? 'Avatar' : 'Banner'}Url`)?.value.trim();
        if (url) {
            const safeUrl = safeMediaUrl(url);
            if (!safeUrl) throw new Error('A URL da imagem não é válida.');
            return safeUrl;
        }
        if (!currentGroup) return null;
        return kind === 'avatar'
            ? (currentGroup.avatar_url || null)
            : (currentGroup.banner_url || currentGroup.image_url || null);
    }

    function resetGroupMediaForm(group = null) {
        state.uploadedGroupMedia = { avatar: null, banner: null };
        state.removedGroupMedia = { avatar: false, banner: false };
        const avatarFile = $('newCommunityAvatarFile');
        const bannerFile = $('newCommunityBannerFile');
        const avatarUrl = $('newCommunityAvatarUrl');
        const bannerUrl = $('newCommunityBannerUrl');
        if (avatarFile) avatarFile.value = '';
        if (bannerFile) bannerFile.value = '';
        if (avatarUrl) avatarUrl.value = group?.avatar_url || '';
        if (bannerUrl) bannerUrl.value = group?.banner_url || group?.image_url || '';
        setGroupMediaPreview('avatar', group?.avatar_url || '');
        setGroupMediaPreview('banner', group?.banner_url || group?.image_url || '');
    }

    function openCreateModal(groupId = null) {
        if (!state.user?.id) {
            showToast('Faça login para criar ou editar uma comunidade.', 'warning');
            return;
        }
        // A central de conversas não possui o formulário completo; leva para a vitrine.
        if (!$('exploreCreateForm') || !$('groupEditor')) {
            window.location.href = '/comunidade/explorar-grupos.html?criar=1';
            return;
        }

        const group = groupId ? getGroup(groupId) : null;
        if (groupId && !group) {
            showToast('Comunidade não encontrada para edição.', 'error');
            return;
        }
        if (group && !(group.is_owner || group.is_admin)) {
            showToast('Apenas o criador ou administradores podem editar esta comunidade.', 'warning');
            return;
        }

        state.editingGroupId = group?.id || null;
        $('groupInviteResult')?.remove();
        $('exploreCreateForm')?.reset();
        $('groupEditingId').value = group?.id || '';
        $('newCommunityName').value = group?.name || '';
        $('newCommunityDescription').value = group?.description || '';
        $('newCommunityCategory').value = group?.category || 'geral';
        $('newCommunityPrivate').checked = group?.is_private === true;
        $('exploreCreateTitle').textContent = group ? 'Editar comunidade' : 'Criar comunidade';
        $('exploreCreateKicker').textContent = group ? 'EDITAR COMUNIDADE' : 'NOVA COMUNIDADE';
        $('createCommunitySubmit').innerHTML = group
            ? '<i class="fa-solid fa-check"></i> Salvar alterações'
            : '<i class="fa-solid fa-plus"></i> Criar comunidade';
        resetGroupMediaForm(group);
        $('groupEditor')?.removeAttribute('hidden');
        const trigger = $('exploreCreateButton') || $('myGroupsCreateButton');
        trigger?.setAttribute('aria-expanded', 'true');
        $('groupEditor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        $('newCommunityName')?.focus();
    }

    function openEditModal(groupId) {
        openCreateModal(groupId);
    }

    function closeCreateModal() {
        $('groupEditor')?.setAttribute('hidden', '');
        const trigger = $('exploreCreateButton') || $('myGroupsCreateButton');
        trigger?.setAttribute('aria-expanded', 'false');
    }

    async function copyText(value) {
        if (!value) return false;
        try {
            await navigator.clipboard?.writeText(value);
            return true;
        } catch (error) {
            return false;
        }
    }

    function showGroupInviteResult(code) {
        if (!code) return;
        let result = $('groupInviteResult');
        if (!result) {
            result = document.createElement('div');
            result.id = 'groupInviteResult';
            result.className = 'group-invite-result';
            const host = document.querySelector('.groups-page-main');
            const layout = host?.querySelector('.group-library-layout');
            const anchor = host?.querySelector('.explore-discover-section');
            if (host && layout) host.insertBefore(result, layout);
            else if (host && anchor) host.insertBefore(result, anchor);
            else document.body.appendChild(result);
        }
        result.innerHTML = `<i class="fa-solid fa-key"></i><span>Convite da comunidade privada: <strong id="createdInviteCode">${escapeHtml(code)}</strong></span><button type="button" id="copyCreatedInvite">Copiar código</button>`;
        $('copyCreatedInvite')?.addEventListener('click', async () => {
            const copied = await copyText(code);
            showToast(copied ? 'Código copiado.' : `Código: ${code}`, copied ? 'success' : 'info');
        });
        result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    async function createGroupFromModal(event) {
        event.preventDefault();
        if (!state.user?.id) return;
        const name = $('newCommunityName')?.value.trim();
        const description = $('newCommunityDescription')?.value.trim() || 'Uma comunidade para trocar experiências e apoio.';
        const category = $('newCommunityCategory')?.value || 'geral';
        const isPrivate = $('newCommunityPrivate')?.checked === true;
        const editingGroup = state.editingGroupId ? getGroup(state.editingGroupId) : null;
        const wasEditing = Boolean(editingGroup);
        if (!name) {
            showToast('Informe um nome para a comunidade.', 'warning');
            return;
        }

        const button = $('createCommunitySubmit');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
        }

        try {
            const avatarUrl = await resolveGroupMedia('avatar', editingGroup);
            const bannerUrl = await resolveGroupMedia('banner', editingGroup);
            const commonPayload = {
                name,
                description,
                category,
                is_private: isPrivate,
                banner_url: bannerUrl,
                avatar_url: avatarUrl
            };

            let result;
            let groupId = editingGroup?.id || null;
            if (editingGroup) {
                result = state.groupsRpcV2
                    ? await safeRpc('update_group', {
                        p_group_id: editingGroup.id,
                        p_name: name,
                        p_description: description,
                        p_category: category,
                        p_is_private: isPrivate,
                        p_banner_url: bannerUrl,
                        p_avatar_url: avatarUrl
                    })
                    : { data: null, error: { message: 'Grupo V2 ainda não ativado.' } };

                if (result.error && !isMissingRpcError(result.error)) throw result.error;
                if (!result.error && result.data?.success === false) throw new Error(result.data.error || 'Não foi possível editar a comunidade.');

                // Compatibilidade com o schema anterior, que ainda não tem as RPCs/colunas novas.
                if (result.error) {
                    const fullUpdate = await supabase.from('groups').update({
                        ...commonPayload,
                        image_url: bannerUrl,
                        updated_at: new Date().toISOString()
                    }).eq('id', editingGroup.id);
                    if (fullUpdate.error) {
                        const legacyUpdate = await supabase.from('groups').update({
                            name,
                            description,
                            category,
                            is_private: isPrivate,
                            image_url: bannerUrl,
                            updated_at: new Date().toISOString()
                        }).eq('id', editingGroup.id);
                        if (legacyUpdate.error) throw legacyUpdate.error;
                    }
                }
            } else {
                result = state.groupsRpcV2
                    ? await safeRpc('create_group', {
                        p_name: name,
                        p_description: description,
                        p_category: category,
                        p_is_private: isPrivate,
                        p_banner_url: bannerUrl,
                        p_avatar_url: avatarUrl
                    })
                    : { data: null, error: { message: 'Grupo V2 ainda não ativado.' } };
                if (result.error && !isMissingRpcError(result.error)) throw result.error;
                if (!result.error && result.data?.success === false) throw new Error(result.data.error || 'Não foi possível criar a comunidade.');

                if (result.error) {
                    const now = new Date().toISOString();
                    let created = null;
                    const fullInsert = await supabase.from('groups').insert({
                        ...commonPayload,
                        image_url: bannerUrl,
                        members: 1,
                        is_admin: true,
                        created_by: state.user.id,
                        created_at: now,
                        updated_at: now,
                        status: 'ativo',
                        banned: false
                    }).select('*').single();
                    if (!fullInsert.error) created = fullInsert.data;

                    if (!created) {
                        const legacyInsert = await supabase.from('groups').insert({
                            name,
                            description,
                            category,
                            members: 1,
                            is_admin: true,
                            is_private: isPrivate,
                            image_url: bannerUrl,
                            created_by: state.user.id,
                            created_at: now,
                            updated_at: now
                        }).select('*').single();
                        if (legacyInsert.error) throw legacyInsert.error;
                        created = legacyInsert.data;
                    }
                    groupId = created.id;

                    const { error: conversationError } = await supabase.from('conversations').insert({
                        id: created.id,
                        name,
                        type: 'group',
                        created_by: state.user.id,
                        created_at: now
                    });
                    if (conversationError) throw conversationError;
                    const { error: membershipError } = await supabase.from('group_members').insert({
                        group_id: created.id,
                        user_id: state.user.id,
                        joined_at: now,
                        is_admin: true
                    });
                    if (membershipError) throw membershipError;
                    const { error: participantError } = await supabase.from('conversation_participants').insert({
                        conversation_id: created.id,
                        user_id: state.user.id,
                        joined_at: now
                    });
                    if (participantError) throw participantError;
                } else {
                    groupId = result.data?.group_id || result.data?.id;
                }
            }

            if (!groupId) throw new Error('A comunidade foi salva sem um identificador válido.');
            let inviteCode = result.data?.invite_code || null;
            if (isPrivate && !inviteCode) {
                const inviteResult = await safeRpc('generate_group_invite', { p_group_id: groupId });
                if (!inviteResult.error && inviteResult.data?.success) inviteCode = inviteResult.data.code;
            }

            closeCreateModal();
            state.editingGroupId = null;
            await getGroups();
            const createdGroup = getGroup(groupId);
            if (!createdGroup) {
                state.groups.unshift(normalizeGroup({
                    id: groupId,
                    name,
                    description,
                    category,
                    is_private: isPrivate,
                    banner_url: bannerUrl,
                    avatar_url: avatarUrl,
                    image_url: bannerUrl,
                    created_by: state.user.id,
                    created_at: new Date().toISOString(),
                    members: 1
                }));
            }
            renderMyGroups();
            renderExploreGroups();
            if (inviteCode) {
                showGroupInviteResult(inviteCode);
                const copied = await copyText(inviteCode);
                showToast(`Comunidade privada criada. Convite: ${inviteCode}${copied ? ' (copiado)' : ''}.`, 'success', 6500);
            } else {
                showToast(editingGroup ? 'Comunidade atualizada com sucesso.' : 'Comunidade criada com sucesso.', 'success');
            }
        } catch (error) {
            console.error('Erro ao salvar comunidade:', error);
            showToast(error.message || 'Não foi possível salvar a comunidade.', 'error', 5200);
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = wasEditing
                    ? '<i class="fa-solid fa-check"></i> Salvar alterações'
                    : '<i class="fa-solid fa-plus"></i> Criar comunidade';
            }
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
            const group = await loadAccessibleGroup(id);
            if (!group) {
                showToast('Você não tem acesso a esta conversa.', 'error');
                return;
            }
            setChatHeader({
                id,
                name: group.name || nameFromUrl,
                type: 'group',
                subtitle: `${Number(group.members || 0)} membros · comunidade`,
                avatar: group.avatar_url || group.banner_url || group.image_url,
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
        return loadAccessibleGroup(id);
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
            const copied = await copyText(data.code);
            showToast(copied ? `Código ${data.code} copiado para a área de transferência.` : `Código do convite: ${data.code}`, 'success', copied ? 3600 : 6500);
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

    async function joinGroup(group) {
        if (!state.user?.id) {
            showToast('Faça login para entrar na comunidade.', 'warning');
            return false;
        }
        if (!group || group.is_private === true) {
            showToast('Este grupo é privado. Use um código de convite.', 'warning');
            return false;
        }

        let result = state.groupsRpcV2
            ? await safeRpc('join_group', { p_group_id: group.id })
            : { data: null, error: { message: 'Grupo V2 ainda não ativado.' } };
        if (result.error && !isMissingRpcError(result.error)) throw result.error;
        if (!result.error && result.data?.success === false) throw new Error(result.data.error || 'Não foi possível entrar na comunidade.');

        if (result.error) {
            result = await safeRpc('join_group_with_cleanup', {
                p_group_id: group.id,
                p_user_id: state.user.id
            });
            if (result.error) {
                const now = new Date().toISOString();
                const membership = await supabase.from('group_members').insert({
                    group_id: group.id,
                    user_id: state.user.id,
                    joined_at: now
                });
                if (membership.error) throw membership.error;
                const participant = await supabase.from('conversation_participants').insert({
                    conversation_id: group.id,
                    user_id: state.user.id,
                    joined_at: now
                });
                if (participant.error) throw participant.error;
                await supabase.from('groups').update({ members: Number(group.members || 0) + 1 }).eq('id', group.id);
            }
            if (result.data?.success === false) throw new Error(result.data.message || result.data.error || 'Não foi possível entrar na comunidade.');
        }

        group.is_member = true;
        await getGroups();
        const refreshed = getGroup(group.id);
        if (refreshed) Object.assign(group, refreshed);
        return true;
    }

    async function leaveGroup(group) {
        if (!state.user?.id || !group) return false;
        if (group.is_owner) throw new Error('O criador não pode sair do próprio grupo.');
        let result = state.groupsRpcV2
            ? await safeRpc('leave_group', { p_group_id: group.id })
            : { data: null, error: { message: 'Grupo V2 ainda não ativado.' } };
        if (result.error && !isMissingRpcError(result.error)) throw result.error;
        if (!result.error && result.data?.success === false) throw new Error(result.data.error || 'Não foi possível sair da comunidade.');

        if (result.error) {
            result = await safeRpc('leave_group_with_cleanup', {
                p_group_id: group.id,
                p_user_id: state.user.id
            });
            if (result.error) {
                const membership = await supabase.from('group_members').delete().eq('group_id', group.id).eq('user_id', state.user.id);
                if (membership.error) throw membership.error;
                const participant = await supabase.from('conversation_participants').delete().eq('conversation_id', group.id).eq('user_id', state.user.id);
                if (participant.error) throw participant.error;
                return true;
            }
            if (result.data?.success === false) throw new Error(result.data.message || result.data.error || 'Não foi possível sair da comunidade.');
        }
        return true;
    }

    async function leaveChannel(group) {
        if (!state.user?.id) {
            showToast('Faça login para sair da comunidade.', 'warning');
            return;
        }
        if (group.is_owner) {
            showToast('O criador não pode sair do próprio grupo. Transfira a administração ou exclua o grupo.', 'warning');
            return;
        }
        if (!window.confirm(`Sair de “${group.name}”?`)) return;
        try {
            await leaveGroup(group);
            showToast('Você saiu da comunidade.', 'success');
            window.location.href = '/comunidade/conversas.html';
        } catch (error) {
            console.warn('Saída por RPC indisponível, usando fallback:', error);
            try {
                const { error: memberError } = await supabase.from('group_members').delete().eq('group_id', group.id).eq('user_id', state.user.id);
                if (memberError) throw memberError;
                showToast('Você saiu da comunidade.', 'success');
                window.location.href = '/comunidade/conversas.html';
            } catch (fallbackError) {
                showToast(fallbackError.message || 'Não foi possível sair da comunidade.', 'error');
            }
        }
    }

    function isDefaultGroup(group) {
        return group?.id === CHAT_DEFAULT || String(group?.name || '').trim().toLowerCase() === 'geral';
    }

    // Exclusão é irreversível: fica apenas com quem criou a comunidade.
    // No servidor a RPC também aceita administradores do grupo e a moderação.
    function canDeleteGroup(group) {
        return Boolean(group) && group.is_owner === true && !isDefaultGroup(group);
    }

    function storagePathFromUrl(url, userId) {
        if (!url || !userId) return null;
        const marker = '/storage/v1/object/public/';
        const index = String(url).indexOf(marker);
        if (index === -1) return null;
        const [filePath] = String(url).slice(index + marker.length).split('?');
        const parts = filePath.split('/').filter(Boolean);
        if (parts.length < 4 || parts[0] !== 'groups' || parts[1] !== userId) return null;
        return parts.join('/');
    }

    async function removeGroupMediaFiles(group) {
        const urls = [group?.banner_url, group?.image_url, group?.avatar_url].filter(Boolean);
        for (const url of urls) {
            const path = storagePathFromUrl(url, state.user?.id);
            if (!path) continue;
            for (const bucket of GROUP_IMAGE_BUCKETS) {
                try {
                    await supabase.storage.from(bucket).remove([path]);
                } catch (error) {
                    console.warn('Não foi possível remover a imagem do grupo:', error);
                }
            }
        }
    }

    async function deleteGroupWithCleanup(group) {
        // A linha do grupo vem primeiro: se a política de RLS negar, nada é apagado pela metade.
        const removed = await supabase.from('groups').delete().eq('id', group.id).select('id');
        if (removed.error) throw removed.error;
        if (!removed.data?.length) {
            throw new Error('A exclusão depende da migração 10_delete_group.sql. Execute-a no Supabase e tente de novo.');
        }
        // conversas, mensagens e memberships não têm FK para groups.
        const steps = [
            ['messages', query => query.delete().eq('conversation_id', group.id)],
            ['conversation_participants', query => query.delete().eq('conversation_id', group.id)],
            ['conversations', query => query.delete().eq('id', group.id)],
            ['group_members', query => query.delete().eq('group_id', group.id)],
            ['group_invites', query => query.delete().eq('group_id', group.id)]
        ];
        for (const [table, apply] of steps) {
            try {
                const { error } = await apply(supabase.from(table));
                if (error) console.warn(`Falha ao limpar ${table}:`, error.message);
            } catch (error) {
                console.warn(`Falha ao limpar ${table}:`, error);
            }
        }
    }

    async function deleteGroup(group) {
        if (!state.user?.id) {
            showToast('Faça login para excluir a comunidade.', 'warning');
            return false;
        }
        if (!canDeleteGroup(group)) {
            showToast('Apenas o criador da comunidade pode excluí-la.', 'warning');
            return false;
        }

        let result = await safeRpc('delete_group', { p_group_id: group.id });
        if (result.error && !isMissingRpcError(result.error)) throw result.error;
        if (!result.error && result.data?.success === false) throw new Error(result.data.error || 'Não foi possível excluir a comunidade.');

        if (result.error) {
            // Schema anterior à migração 10: tenta a rota da moderação e depois a limpeza direta.
            result = await safeRpc('admin_delete_group', { p_group_id: group.id });
            if (!result.error && result.data?.success === false) {
                result = { error: new Error(result.data?.error || 'A moderação não conseguiu excluir a comunidade.') };
            }
            if (result.error) await deleteGroupWithCleanup(group);
        }

        state.groups = state.groups.filter(item => item.id !== group.id);
        await removeGroupMediaFiles(group);
        return true;
    }

    function ensureDeleteGroupPanel() {
        let panel = $('groupDeletePanel');
        if (panel) return panel;
        panel = document.createElement('section');
        panel.id = 'groupDeletePanel';
        panel.className = 'group-delete-panel';
        panel.hidden = true;
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-labelledby', 'groupDeleteTitle');
        panel.innerHTML = `
            <div class="group-delete-header">
                <div>
                    <span class="groups-kicker">AÇÃO IRREVERSÍVEL</span>
                    <h2 id="groupDeleteTitle">Excluir comunidade</h2>
                </div>
                <button class="group-editor-close" id="closeGroupDeletePanel" type="button" aria-label="Fechar confirmação"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <p class="group-delete-warning"><i class="fa-solid fa-triangle-exclamation"></i><span id="groupDeleteMessage">Esta ação não pode ser desfeita.</span></p>
            <ul class="group-delete-list">
                <li>Publicações, conversas e mensagens da comunidade</li>
                <li>Convites por código e a lista de membros</li>
                <li>O banner e a foto da comunidade</li>
            </ul>
            <form class="group-delete-form" id="groupDeleteForm">
                <label class="group-delete-confirm-label" for="groupDeleteConfirmInput">
                    <span id="groupDeleteConfirmLabel">Digite o nome da comunidade para confirmar</span>
                    <input id="groupDeleteConfirmInput" type="text" autocomplete="off" placeholder="Nome da comunidade" maxlength="50">
                </label>
                <div class="group-delete-actions">
                    <button class="cv-secondary" id="cancelGroupDelete" type="button">Cancelar</button>
                    <button class="cv-danger" id="confirmGroupDelete" type="submit" disabled><i class="fa-solid fa-trash-can"></i> Excluir definitivamente</button>
                </div>
            </form>`;
        const host = document.querySelector('.groups-page-main, .channel-page-main, .community-page-main, main') || document.body;
        host.appendChild(panel);
        $('closeGroupDeletePanel')?.addEventListener('click', closeDeleteGroupPanel);
        $('cancelGroupDelete')?.addEventListener('click', closeDeleteGroupPanel);
        $('groupDeleteConfirmInput')?.addEventListener('input', syncDeleteGroupConfirm);
        $('groupDeleteForm')?.addEventListener('submit', confirmDeleteGroup);
        return panel;
    }

    function syncDeleteGroupConfirm() {
        const group = getGroup(state.deletingGroupId);
        const typed = ($('groupDeleteConfirmInput')?.value || '').trim();
        const matches = Boolean(group) && typed.toLowerCase() === String(group.name || '').trim().toLowerCase();
        const button = $('confirmGroupDelete');
        if (button) button.disabled = !matches;
    }

    function openDeleteGroupPanel(group) {
        if (!state.user?.id) {
            showToast('Faça login para excluir a comunidade.', 'warning');
            return;
        }
        if (!canDeleteGroup(group)) {
            showToast('Apenas o criador da comunidade pode excluí-la.', 'warning');
            return;
        }
        const panel = ensureDeleteGroupPanel();
        state.deletingGroupId = group.id;
        const memberCount = Number(group.members || 0);
        $('groupDeleteMessage').textContent = `“${group.name}” será excluída para sempre, junto com ${memberCount} ${memberCount === 1 ? 'membro' : 'membros'} e todo o conteúdo da comunidade.`;
        $('groupDeleteConfirmLabel').textContent = `Digite “${group.name}” para confirmar`;
        $('groupDeleteConfirmInput').value = '';
        $('confirmGroupDelete').disabled = true;
        panel.hidden = false;
        panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        $('groupDeleteConfirmInput')?.focus();
    }

    function closeDeleteGroupPanel() {
        state.deletingGroupId = null;
        const panel = $('groupDeletePanel');
        if (panel) panel.hidden = true;
    }

    async function confirmDeleteGroup(event) {
        event.preventDefault();
        const group = getGroup(state.deletingGroupId);
        if (!group) {
            closeDeleteGroupPanel();
            showToast('Comunidade não encontrada.', 'error');
            return;
        }
        const typed = ($('groupDeleteConfirmInput')?.value || '').trim();
        if (typed.toLowerCase() !== String(group.name || '').trim().toLowerCase()) {
            showToast('Digite exatamente o nome da comunidade para confirmar.', 'warning');
            return;
        }

        const button = $('confirmGroupDelete');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Excluindo...';
        }
        try {
            const name = group.name;
            await deleteGroup(group);
            closeDeleteGroupPanel();
            showToast(`A comunidade “${name}” foi excluída.`, 'success');
            if (page === 'channel' || page === 'community') {
                window.location.href = '/comunidade/meus-grupos.html';
                return;
            }
            renderMyGroups();
            renderExploreGroups();
        } catch (error) {
            console.error('Erro ao excluir a comunidade:', error);
            showToast(error.message || 'Não foi possível excluir a comunidade.', 'error');
            syncDeleteGroupConfirm();
            if (button) button.innerHTML = '<i class="fa-solid fa-trash-can"></i> Excluir definitivamente';
        }
    }

    async function joinChannelFromDetails(group) {
        if (!state.user?.id) {
            showToast('Faça login para entrar na comunidade.', 'warning');
            return;
        }
        try {
            await joinGroup(group);
            showToast(`Agora você participa de ${group.name}.`, 'success');
            $('joinChannelButton').hidden = true;
            $('openChannelChat').hidden = false;
            $('leaveChannelButton').hidden = false;
            await loadChannelMembers(group);
        } catch (error) {
            console.error('Erro ao entrar na comunidade:', error);
            showToast(error.message || 'Não foi possível entrar na comunidade.', 'error');
        }
    }

    async function setupChannelPage() {
        const group = await loadChannel();
        if (!group) {
            showToast('Comunidade não encontrada ou você não tem acesso.', 'error');
            return;
        }
        const banner = $('channelBanner');
        const avatar = $('channelAvatar');
        if (banner) {
            const image = safeMediaUrl(group.banner_url || group.image_url);
            banner.hidden = !image;
            if (image) banner.src = image;
        }
        if (avatar) avatar.innerHTML = group.avatar_url ? `<img src="${escapeHtml(avatarUrl(group.avatar_url))}" alt="Foto de ${escapeHtml(group.name || 'comunidade')}">` : escapeHtml(initial(group.name));
        $('channelName').textContent = group.name || 'Comunidade';
        $('channelBreadcrumbName').textContent = group.name || 'Comunidade';
        $('channelCategory').textContent = `${categoryLabel(group.category)} · ${group.is_private ? 'Privada' : 'Pública'}`;
        $('channelDescription').textContent = group.description || 'Uma comunidade para trocar experiências e encontrar apoio.';
        $('channelMemberCount').textContent = `${Number(group.members || 0)} membros`;
        $('channelCreatedAt').textContent = group.created_at ? `Criada em ${formatDate(group.created_at)}` : 'Comunidade da Amor Neurodivergente';
        $('openChannelChat').href = `/comunidade/chat.html?id=${encodeURIComponent(group.id)}&type=group&name=${encodeURIComponent(group.name || 'Comunidade')}`;
        $('openChannelFeed').href = internalGroupUrl(group.id);
        const isMember = group.is_member === true || group.name === 'Geral' || group.id === CHAT_DEFAULT;
        const canManage = group.is_owner === true || group.is_admin === true;
        $('joinChannelButton').hidden = isMember;
        $('openChannelChat').hidden = !isMember;
        $('leaveChannelButton').hidden = !isMember || canManage;
        $('copyChannelInvite').hidden = !canManage;
        $('editChannelButton').hidden = !canManage;
        $('editChannelButton').href = `/comunidade/meus-grupos.html?editar=${encodeURIComponent(group.id)}`;
        $('deleteChannelButton') && ($('deleteChannelButton').hidden = !canDeleteGroup(group));
        $('joinChannelButton')?.addEventListener('click', () => joinChannelFromDetails(group));
        $('copyChannelInvite')?.addEventListener('click', () => copyChannelInvite(group));
        $('leaveChannelButton')?.addEventListener('click', () => leaveChannel(group));
        $('deleteChannelButton')?.addEventListener('click', () => openDeleteGroupPanel(group));
        await loadChannelMembers(group);
    }

    function categoryLabel(category) {
        const labels = {
            geral: 'Geral', apoio: 'Apoio e acolhimento', tda: 'TDAH', tdh: 'TDAH', tdah: 'TDAH', autismo: 'Autismo', ansiedade: 'Ansiedade e depressão', educacao: 'Educação e carreira', carreira: 'Educação e carreira', relacionamentos: 'Relacionamentos', hobbies: 'Hobbies e interesses', arte: 'Arte e criatividade', ciencia: 'Ciência e pesquisa', direitos: 'Direitos e leis'
        };
        return labels[String(category || '').toLowerCase()] || category || 'Geral';
    }

    function renderGroupCard(group, { mine = false } = {}) {
        const name = group.name || 'Comunidade';
        const banner = safeMediaUrl(group.banner_url || group.image_url);
        const avatar = safeMediaUrl(group.avatar_url);
        const isMember = group.is_member === true || group.name === 'Geral' || group.id === CHAT_DEFAULT;
        const canManage = group.is_owner === true || group.is_admin === true;
        const category = categoryLabel(group.category);
        const privacyLabel = group.is_private ? 'Privada' : 'Pública';
        const memberCount = Number(group.members || 0);
        const manageBadge = canManage
            ? '<span class="explore-card-owner"><i class="fa-solid fa-star"></i> Criador</span>'
            : `<span class="explore-card-joiners"><i class="fa-regular fa-users"></i> ${memberCount} ${memberCount === 1 ? 'pessoa entrou' : 'pessoas entraram'}</span>`;
        const primaryAction = isMember
            ? `<a class="explore-card-action-main" href="${internalGroupUrl(group.id)}"><i class="fa-solid fa-arrow-right"></i> Visitar</a>`
            : group.is_private
                ? '<span class="explore-card-action-hint"><i class="fa-solid fa-lock"></i> Convite necessário</span>'
                : `<button class="explore-card-action-main is-join" type="button" data-join-group="${escapeHtml(group.id)}"><i class="fa-solid fa-right-to-bracket"></i> Unir-se</button>`;
        const chatAction = isMember
            ? `<a class="explore-card-action-icon" href="${channelUrl({ id: group.id, name })}" aria-label="Abrir conversa de ${escapeHtml(name)}"><i class="fa-regular fa-comments"></i></a>`
            : '';
        const inviteAction = canManage && group.is_private
            ? `<a class="explore-card-action-icon" href="${groupUrl(group.id)}" aria-label="Ver código de ${escapeHtml(name)}"><i class="fa-solid fa-key"></i></a>`
            : '';
        const editAction = canManage
            ? `<button class="explore-card-action-edit" type="button" data-edit-group="${escapeHtml(group.id)}" aria-label="Editar ${escapeHtml(name)}">editar</button>`
            : '';
        const deleteAction = canDeleteGroup(group)
            ? `<button class="explore-card-delete" type="button" data-delete-group="${escapeHtml(group.id)}" aria-label="Excluir ${escapeHtml(name)}" title="Excluir comunidade"><i class="fa-solid fa-trash-can"></i></button>`
            : '';

        return `<article class="explore-card${mine ? ' my-group-card' : ''}" data-group-id="${escapeHtml(group.id)}">
            <div class="explore-card-banner">
                ${banner ? `<img src="${escapeHtml(banner)}" alt="Banner de ${escapeHtml(name)}" loading="lazy">` : ''}
                <span class="explore-card-avatar">${avatar ? `<img src="${escapeHtml(avatar)}" alt="Foto de ${escapeHtml(name)}">` : escapeHtml(initial(name))}</span>
                <span class="explore-card-privacy ${group.is_private ? 'is-private' : 'is-public'}"><i class="fa-solid ${group.is_private ? 'fa-lock' : 'fa-globe'}"></i> ${privacyLabel}</span>
                ${deleteAction}
            </div>
            <div class="explore-card-body">
                <div class="explore-card-title-row">
                    <h3><a href="${internalGroupUrl(group.id)}">${escapeHtml(name)}</a></h3>
                    ${manageBadge}
                </div>
                <p class="explore-card-description">${escapeHtml(group.description || 'Um espaço para compartilhar experiências e encontrar apoio.')}</p>
                <div class="explore-card-meta">
                    <span class="explore-card-members"><i class="fa-regular fa-users"></i> ${memberCount} ${memberCount === 1 ? 'Membro' : 'Membros'}</span>
                    <span class="explore-card-category"># ${escapeHtml(category)}</span>
                </div>
                <div class="explore-card-actions">${primaryAction}${editAction}${chatAction}${inviteAction}</div>
            </div>
        </article>`;
    }

    function groupMatchesQuery(group, query) {
        if (!query) return true;
        return `${group.name || ''} ${group.description || ''} ${group.category || ''}`.toLowerCase().includes(query);
    }

    function renderExploreGroups() {
        const grid = $('exploreGroupsGrid');
        if (!grid) return;
        const query = state.groupQuery.trim().toLowerCase();
        let groups = state.groups.filter(group => group.is_private !== true);
        if (state.groupFilter === 'popular') {
            groups.sort((a, b) => Number(b.members || 0) - Number(a.members || 0));
        } else if (state.groupFilter !== 'all') {
            groups = groups.filter(group => String(group.category || 'geral').toLowerCase() === state.groupFilter);
        }
        groups = groups.filter(group => groupMatchesQuery(group, query));
        const visible = groups.slice(0, state.visibleGroups);
        const count = $('exploreResultCount');
        if (count) count.textContent = `${groups.length} ${groups.length === 1 ? 'comunidade' : 'comunidades'}`;

        grid.innerHTML = visible.length
            ? visible.map(group => renderGroupCard(group)).join('')
            : '<div class="groups-empty"><i class="fa-solid fa-compass" style="font-size:30px;color:var(--cv-gold);"></i><strong>Nenhuma comunidade encontrada</strong><span>Tente outro termo ou categoria.</span></div>';

        const more = $('exploreLoadMore');
        if (more) more.hidden = groups.length <= state.visibleGroups;
    }

    function renderMyGroups() {
        const grid = $('myGroupsGrid');
        const count = $('myGroupsCount') || $('exploreMyGroupsCount');
        const subtitle = $('myGroupsSubtitle');
        if (!state.user?.id) {
            if (count) count.textContent = '0';
            if (subtitle) subtitle.textContent = 'Entre para ver os grupos que você criou ou dos quais participa.';
            if (grid) grid.innerHTML = '<div class="groups-empty my-groups-login"><i class="fa-solid fa-lock"></i><strong>Entre para ver seus grupos</strong><span>Seus grupos privados ficam visíveis apenas para você.</span><a class="cv-secondary" href="/login/login.html">Entrar na conta</a></div>';
            return;
        }

        let groups = state.groups.filter(group => group.is_member || group.is_owner || group.is_admin);
        const myQuery = state.myGroupQuery.trim().toLowerCase();
        if (myQuery) groups = groups.filter(group => groupMatchesQuery(group, myQuery));
        if (state.myGroupFilter === 'created') groups = groups.filter(group => group.is_owner);
        if (state.myGroupFilter === 'private') groups = groups.filter(group => group.is_private);
        if (state.myGroupFilter === 'public') groups = groups.filter(group => !group.is_private);
        groups.sort((a, b) => Number(b.is_owner) - Number(a.is_owner) || new Date(b.created_at || 0) - new Date(a.created_at || 0));
        if (count) count.textContent = groups.length;
        if (subtitle) subtitle.textContent = groups.length ? 'Grupos criados por você e comunidades das quais você participa.' : 'Você ainda não participa de nenhuma comunidade.';
        if (!grid) return;

        grid.innerHTML = groups.length
            ? groups.map(group => renderGroupCard(group, { mine: true })).join('')
            : '<div class="groups-empty"><i class="fa-solid fa-layer-group"></i><strong>Nenhum grupo por aqui</strong><span>Crie uma comunidade ou entre em uma usando um convite.</span><button class="cv-primary" type="button" data-create-from-empty><i class="fa-solid fa-plus"></i> Criar primeira comunidade</button></div>';
    }

    async function joinGroupFromExplore(groupId) {
        const group = getGroup(groupId);
        if (!group) return;
        try {
            await joinGroup(group);
            showToast(`Você entrou em ${group.name}.`, 'success');
            renderMyGroups();
            renderExploreGroups();
        } catch (error) {
            console.error('Erro ao entrar na comunidade:', error);
            showToast(error.message || 'Não foi possível entrar na comunidade.', 'error');
        }
    }

    function renderCommunityFeed(posts, group) {
        const feed = $('communityGroupFeed');
        if (!feed) return;
        const visiblePosts = (posts || []).filter(post => post.group_id === group.id);
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
        const group = await loadAccessibleGroup(id);
        if (!group) {
            showToast('Comunidade não encontrada ou você não tem acesso.', 'error');
            return;
        }
        const banner = $('communityGroupBanner');
        const avatar = $('communityGroupAvatar');
        const image = safeMediaUrl(group.banner_url || group.image_url);
        if (banner) {
            banner.hidden = !image;
            if (image) banner.src = image;
        }
        if (avatar) avatar.innerHTML = group.avatar_url ? `<img src="${escapeHtml(avatarUrl(group.avatar_url))}" alt="Foto de ${escapeHtml(group.name || 'comunidade')}">` : escapeHtml(initial(group.name));
        $('communityBreadcrumbName').textContent = group.name || 'Comunidade';
        $('communityGroupName').textContent = group.name || 'Comunidade';
        $('communityGroupDescription').textContent = `${Number(group.members || 0)} membros · ${categoryLabel(group.category)} · ${group.is_private ? 'Privada' : 'Pública'}`;
        $('communityGroupAbout').textContent = group.description || 'Um espaço para compartilhar experiências e encontrar apoio.';
        const chatUrl = channelUrl(group);
        $('communityChatLink').href = chatUrl;
        $('communityChatLinkSide').href = chatUrl;
        $('communityDetailsLink').href = groupUrl(group.id);
        $('communityMembersLink').href = groupUrl(group.id);
        const editLink = $('communityEditLink');
        if (editLink) {
            editLink.hidden = !(group.is_owner || group.is_admin);
            editLink.href = `/comunidade/meus-grupos.html?editar=${encodeURIComponent(group.id)}`;
        }
        const groupPostsResult = state.groupsRpcV2
            ? await safeRpc('get_group_posts', {
                p_group_id: group.id,
                p_limit: 50,
                p_offset: 0
            })
            : { data: [], error: { message: 'Feed V2 ainda não ativado.' } };
        const posts = !groupPostsResult.error && Array.isArray(groupPostsResult.data)
            ? groupPostsResult.data
            : (await supabase.rpc('get_posts', { p_limit: 50, p_offset: 0 })).data || [];
        await Promise.all([
            Promise.resolve(renderCommunityFeed(posts, group)),
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
        document.querySelectorAll('[data-my-group-filter]').forEach(button => {
            button.addEventListener('click', () => {
                state.myGroupFilter = button.dataset.myGroupFilter || 'all';
                document.querySelectorAll('[data-my-group-filter]').forEach(item => item.classList.toggle('active', item === button));
                renderMyGroups();
            });
        });
        $('exploreLoadMore')?.addEventListener('click', () => {
            state.visibleGroups += 12;
            renderExploreGroups();
        });
        $('exploreCreateButton')?.addEventListener('click', () => openCreateModal());
        $('closeExploreCreateModal')?.addEventListener('click', closeCreateModal);
        $('exploreCreateForm')?.addEventListener('submit', createGroupFromModal);
        $('exploreGroupsGrid')?.addEventListener('click', event => {
            const joinButton = event.target.closest('[data-join-group]');
            if (joinButton) {
                joinGroupFromExplore(joinButton.dataset.joinGroup);
                return;
            }
            const deleteButton = event.target.closest('[data-delete-group]');
            if (deleteButton) {
                openDeleteGroupPanel(getGroup(deleteButton.dataset.deleteGroup));
                return;
            }
            const editButton = event.target.closest('[data-edit-group]');
            if (editButton) {
                window.location.href = `/comunidade/meus-grupos.html?editar=${encodeURIComponent(editButton.dataset.editGroup)}`;
                return;
            }
            const createButton = event.target.closest('[data-create-from-empty]');
            if (createButton) {
                openCreateModal();
                return;
            }
            const card = event.target.closest('[data-group-id]');
            if (!card || event.target.closest('a,button')) return;
            window.location.href = internalGroupUrl(card.dataset.groupId);
        });
        $('myGroupsGrid')?.addEventListener('click', event => {
            const joinButton = event.target.closest('[data-join-group]');
            if (joinButton) {
                joinGroupFromExplore(joinButton.dataset.joinGroup);
                return;
            }
            const deleteButton = event.target.closest('[data-delete-group]');
            if (deleteButton) {
                openDeleteGroupPanel(getGroup(deleteButton.dataset.deleteGroup));
                return;
            }
            const editButton = event.target.closest('[data-edit-group]');
            if (editButton) {
                openEditModal(editButton.dataset.editGroup);
                return;
            }
            const createButton = event.target.closest('[data-create-from-empty]');
            if (createButton) {
                openCreateModal();
                return;
            }
            const card = event.target.closest('[data-group-id]');
            if (!card || event.target.closest('a,button')) return;
            window.location.href = internalGroupUrl(card.dataset.groupId);
        });
        $('groupInviteForm')?.addEventListener('submit', async event => {
            event.preventDefault();
            if (!state.user?.id) {
                showToast('Faça login para usar um código de convite.', 'warning');
                return;
            }
            const code = $('groupInviteCode')?.value.trim();
            if (!code) return;
            const button = event.currentTarget.querySelector('button');
            if (button) button.disabled = true;
            try {
                let result = state.groupsRpcV2
                    ? await safeRpc('redeem_group_invite', { p_code: code })
                    : { data: null, error: { message: 'Grupo V2 ainda não ativado.' } };
                if (result.error && isMissingRpcError(result.error)) {
                    result = await safeRpc('use_invite_code', { p_code: code });
                }
                if (result.error) throw result.error;
                if (result.data?.success === false) throw new Error(result.data.error || 'Convite inválido ou expirado.');
                await getGroups();
                renderMyGroups();
                renderExploreGroups();
                $('groupInviteCode').value = '';
                showToast(`Você entrou em ${result.data?.group_name || 'uma nova comunidade'}.`, 'success');
            } catch (error) {
                showToast(error.message || 'Não foi possível usar este convite.', 'error');
            } finally {
                if (button) button.disabled = false;
            }
        });

        ['avatar', 'banner'].forEach(kind => {
            const suffix = kind === 'avatar' ? 'Avatar' : 'Banner';
            $(`newCommunity${suffix}File`)?.addEventListener('change', event => previewGroupFile(kind, event.target.files?.[0]));
            $(`newCommunity${suffix}Url`)?.addEventListener('input', event => {
                state.uploadedGroupMedia[kind] = null;
                state.removedGroupMedia[kind] = false;
                setGroupMediaPreview(kind, event.target.value.trim());
            });
            $(`removeCommunity${suffix}`)?.addEventListener('click', () => clearGroupMediaInput(kind));
        });

        renderMyGroups();
        renderExploreGroups();
        const editId = pageUrl.searchParams.get('editar');
        if (editId) {
            window.location.href = `/comunidade/meus-grupos.html?editar=${encodeURIComponent(editId)}`;
            return;
        }
        if (pageUrl.searchParams.get('criar') === '1') openCreateModal();
    }

    function setupMyGroups() {
        $('myGroupsCreateButton')?.addEventListener('click', () => openCreateModal());
        $('closeExploreCreateModal')?.addEventListener('click', closeCreateModal);
        $('exploreCreateForm')?.addEventListener('submit', createGroupFromModal);
        $('myGroupsSearch')?.addEventListener('input', event => {
            state.myGroupQuery = event.target.value || '';
            renderMyGroups();
        });
        ['avatar', 'banner'].forEach(kind => {
            const suffix = kind === 'avatar' ? 'Avatar' : 'Banner';
            $(`newCommunity${suffix}File`)?.addEventListener('change', event => previewGroupFile(kind, event.target.files?.[0]));
            $(`newCommunity${suffix}Url`)?.addEventListener('input', event => {
                state.uploadedGroupMedia[kind] = null;
                state.removedGroupMedia[kind] = false;
                setGroupMediaPreview(kind, event.target.value.trim());
            });
            $(`removeCommunity${suffix}`)?.addEventListener('click', () => clearGroupMediaInput(kind));
        });
        document.querySelectorAll('[data-my-group-filter]').forEach(button => {
            button.addEventListener('click', () => {
                state.myGroupFilter = button.dataset.myGroupFilter || 'all';
                document.querySelectorAll('[data-my-group-filter]').forEach(item => item.classList.toggle('active', item === button));
                renderMyGroups();
            });
        });
        $('myGroupsGrid')?.addEventListener('click', event => {
            const deleteButton = event.target.closest('[data-delete-group]');
            if (deleteButton) {
                openDeleteGroupPanel(getGroup(deleteButton.dataset.deleteGroup));
                return;
            }
            const editButton = event.target.closest('[data-edit-group]');
            if (editButton) {
                openEditModal(editButton.dataset.editGroup);
                return;
            }
            const joinButton = event.target.closest('[data-join-group]');
            if (joinButton) {
                joinGroupFromExplore(joinButton.dataset.joinGroup);
                return;
            }
            const createButton = event.target.closest('[data-create-from-empty]');
            if (createButton) {
                openCreateModal();
                return;
            }
            const card = event.target.closest('[data-group-id]');
            if (!card || event.target.closest('a,button')) return;
            window.location.href = internalGroupUrl(card.dataset.groupId);
        });
        renderMyGroups();
        const editId = pageUrl.searchParams.get('editar');
        if (editId) {
            window.setTimeout(async () => {
                if (!getGroup(editId)) await getGroups();
                renderMyGroups();
                openEditModal(editId);
            }, 250);
        } else if (pageUrl.searchParams.get('criar') === '1') {
            openCreateModal();
        }
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
        } else if (page === 'my-groups') {
            setupMyGroups();
        } else if (page === 'community') {
            await setupCommunityPage();
        }
    }

    init().catch(error => {
        console.error('Erro ao inicializar páginas de conversa:', error);
        showToast('Não foi possível carregar esta área.', 'error');
    });
});
