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
        channelSubscription: null,
        // Realtime: se o canal nao entregar evento, o chat cai no
        // varredor de reserva. Ver ligarVarredorReserva.
        realtimeRecebeuEvento: false,
        timerVarredura: null,
        ultimoVarredura: 0,
        nivelVarredura: 0,
        ultimaAssinatura: null
    };

    // Realtime: de quanto em quanto o varredor de reserva consulta o
    // banco, e quanto tempo ele espera para ter certeza de que o
    // realtime realmente nao esta entregando nada.
    //
    // O intervalo dobra a cada tique sem novelty, ate o teto. Conversa
    // parada custa uma consulta a cada 30s, nao 12 por minuto.
    const INTERVALO_VARREDURA_MS = 5000;
    const INTERVALO_VARREDURA_MAX_MS = 30000;
    const INTERVALO_VARREDURA_OCULTA_MS = 30000;
    const ESPERA_PROVA_REALTIME_MS = 8000;

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

    // A conversa abre no painel ao lado, sem trocar de página. O id, tipo e
    // demais dados vão para a URL para que o link continue sendo compartilhável
    // e para o voltar do navegador funcionar.
    async function openConversation(item) {
        try {
            if (item.kind === 'group') {
                const grupo = item.data;
                const params = new URLSearchParams({
                    id: grupo.id,
                    type: 'group',
                    name: grupo.name || 'Comunidade'
                });
                await abrirConversaInline({
                    id: grupo.id,
                    type: 'group',
                    nome: grupo.name || 'Comunidade'
                });
                history.replaceState(null, '', `?${params.toString()}`);
                marcarConversaAtiva(`group:${grupo.id}`);
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
            await abrirConversaInline({
                id: conversationId,
                type: 'direct',
                nome: item.data.username || 'Amigo',
                friendId: item.data.friend_id
            });
            history.replaceState(null, '', `?${params.toString()}`);
            marcarConversaAtiva(`friend:${item.data.friend_id}`);
        } catch (error) {
            console.error('Erro ao abrir conversa:', error);
            showToast('Não foi possível abrir esta conversa.', 'error');
        }
    }

    // mostrar = true deixa o estado vazio à vista e esconde a conversa.
    // mostrar = false abre a conversa e esconde o estado vazio.
    function mostrarEstadoInbox(mostrar) {
        const vazio = $('conversationEmptyContent');
        const chat = $('conversationChat');
        if (vazio) vazio.hidden = !mostrar;
        if (chat) chat.hidden = mostrar;
        document.body.classList.toggle('conversation-chat-open', !mostrar);
        if (mostrar) {
            marcarConversaAtiva(null);
            state.conversationId = null;
            state.conversationFriendId = null;
            $('conversationRail')?.classList.remove('is-hidden-mobile');
            if (state.channelSubscription) {
                supabase.removeChannel(state.channelSubscription);
                state.channelSubscription = null;
            }
            pararVarredorReserva();
            if (typeof renderInbox === 'function') renderInbox();
        }
    }

    function marcarConversaAtiva(chave) {
        document.querySelectorAll('[data-conversation-key]').forEach(item => {
            const ativo = item.dataset.conversationKey === chave;
            item.classList.toggle('is-active', ativo);
            if (ativo) item.setAttribute('aria-current', 'true');
            else item.removeAttribute('aria-current');
        });
    }

    function fecharConversaInline() {
        mostrarEstadoInbox(true);
        const params = new URLSearchParams();
        history.replaceState(null, '', location.pathname + (params.toString() ? '?' + params : ''));
        $('conversationRail')?.classList.remove('is-hidden-mobile');
    }

    // Recolhe/expande a lista. Guardado para respeitar a preferência.
    function aplicarEstadoRail(estado, { guardar = true } = {}) {
        const rail = $('conversationRail');
        const botao = $('conversationRailToggle');
        if (!rail) return;
        const recolhido = estado === 'recolhido';
        rail.classList.toggle('is-collapsed', recolhido);
        document.body.classList.toggle('conversation-rail-collapsed', recolhido);
        if (botao) {
            botao.setAttribute('aria-expanded', String(!recolhido));
            botao.setAttribute('aria-label', recolhido ? 'Expandir lista de conversas' : 'Recolher lista de conversas');
            botao.title = recolhido ? 'Expandir lista' : 'Recolher lista';
            const icone = botao.querySelector('i');
            if (icone) icone.className = recolhido ? 'fa-solid fa-angles-right' : 'fa-solid fa-angles-left';
        }
        // No celular a lista é sobreposta, não espremida: aqui o estado
        // recolhido é irrelevante e só atrapalharia.
        if (guardar && window.innerWidth > 760) {
            try { localStorage.setItem('acolheria:rail', estado); } catch (e) { /* modo privado */ }
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
                const chave = isFriend ? `friend:${item.friend_id}` : `group:${item.id}`;
                const ativa = state.conversationId && (
                    isFriend
                        ? state.conversationFriendId === item.friend_id
                        : state.conversationId === item.id
                ) ? 'true' : 'false';
                return `<div class="conversation-item${ativa === 'true' ? ' is-active' : ''}" role="button" tabindex="0" aria-current="${ativa}" data-conversation-key="${escapeHtml(chave)}" data-conversation-kind="${isFriend ? 'friend' : 'group'}" data-conversation-id="${escapeHtml(item.friend_id || item.id)}" data-friend-id="${escapeHtml(item.friend_id || '')}" data-friend-name="${escapeHtml(name)}">
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
        const alternarRail = () => {
            const recolhido = $('conversationRail')?.classList.contains('is-collapsed');
            aplicarEstadoRail(recolhido ? 'aberto' : 'recolhido');
        };
        $('conversationRailToggle')?.addEventListener('click', alternarRail);
        $('conversationRailExpand')?.addEventListener('click', () => aplicarEstadoRail('aberto'));
        $('conversationChatBack')?.addEventListener('click', fecharConversaInline);

        // Navegação do histórico: voltar/saída do navegador fecha a conversa.
        window.addEventListener('popstate', () => {
            if (!pageUrl.searchParams.get('id')) mostrarEstadoInbox(true);
        });

        // Preferência salva do recolhimento da lista. No celular sempre
        // começa aberta, porque lá ela ocupa a tela inteira.
        const aplicarResponsivo = () => {
            if (window.innerWidth <= 760) {
                aplicarEstadoRail('aberto', { guardar: false });
            } else {
                let salvo = 'aberto';
                try { salvo = localStorage.getItem('acolheria:rail') || 'aberto'; } catch (e) { /* modo privado */ }
                aplicarEstadoRail(salvo, { guardar: false });
            }
        };
        aplicarResponsivo();
        window.addEventListener('resize', aplicarResponsivo);

        renderInbox();

        // Deep link: /conversas.html?id=... abre a conversa direto na página.
        const deepId = pageUrl.searchParams.get('id');
        if (deepId && UUID_RE.test(deepId)) {
            const tipo = pageUrl.searchParams.get('type') === 'direct' ? 'direct' : 'group';
            abrirConversaInline({
                id: deepId,
                type: tipo,
                nome: pageUrl.searchParams.get('name') || null,
                friendId: pageUrl.searchParams.get('friendId')
            });
        }
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
                const inviteResult = await generateGroupInviteCode(groupId);
                if (inviteResult.success) inviteCode = inviteResult.code;
                else console.warn('Comunidade privada sem código de convite:', inviteResult.error);
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

        // Guarda o contexto para o menu de três pontos montar as opções certas.
        state.chatContexto = { id, name, type: type === 'direct' ? 'direct' : 'group', profileId: profileId || null };
        fecharMenuChat();
    }

    // ====================================================================
    // MENU DE TRÊS PONTOS
    // ====================================================================
    //
    // Só entram aqui ações que o projeto realmente executa. Preferi um menu
    // honesto com 6 itens functioning a 15 itens decorativos que não fariam
    // nada.

    function chatEhGrupo() {
        return state.chatContexto?.type === 'group';
    }

    function chatGrupoAtual() {
        const ctx = state.chatContexto;
        return ctx && chatEhGrupo() ? getGroup(ctx.id) : null;
    }

    function chatPodeAdministrar() {
        const grupo = chatGrupoAtual();
        if (!grupo) return false;
        return grupo.is_owner === true || grupo.is_admin === true;
    }

    function chatPodeSair() {
        const grupo = chatGrupoAtual();
        if (!grupo) return false;
        if (grupo.is_owner) return false;
        if (isDefaultGroup(grupo)) return false;
        return grupo.is_member === true;
    }

    function chatPodeExcluir() {
        return canDeleteGroup(chatGrupoAtual());
    }

    // O botão carrega o nome da ação em data-acao. O innerHTML não
    // carrega referência de função, então o mapa abaixo reconstrói.
    function itemMenuChat({ icone, rotulo, acao, perigo, oculto, contador }) {
        if (oculto) return '';
        return `<button type="button" class="chat-menu-item${perigo ? ' is-danger' : ''}" data-menu-chat data-acao="${escapeHtml(acao)}">
            <i class="${icone}" aria-hidden="true"></i><span>${escapeHtml(rotulo)}</span>${contador != null ? `<span class="chat-menu-count">${contador}</span>` : ''}
        </button>`;
    }

    function montarMenuChat() {
        const menu = $('chatMenu');
        if (!menu) return;
        const grupo = chatGrupoAtual();
        const isGrupo = chatEhGrupo();

        // Conversa privada: menos opções, e nada de administração.
        if (!isGrupo) {
            menu.innerHTML = [
                itemMenuChat({ icone: 'fa-solid fa-user', rotulo: 'Ver perfil', acao: 'abrirPerfil' }),
                itemMenuChat({ icone: 'fa-solid fa-bell-slash', rotulo: 'Silenciar notificações', acao: 'silenciar' }),
                '<div class="chat-menu-divider" role="separator"></div>',
                itemMenuChat({ icone: 'fa-solid fa-flag', rotulo: 'Denunciar conversa', perigo: true, acao: 'denunciar' }),
                itemMenuChat({ icone: 'fa-solid fa-right-from-bracket', rotulo: 'Encerrar conversa', perigo: true, acao: 'encerrar' })
            ].join('');
            return;
        }

        const ehPrivado = grupo?.is_private === true;
        const podeAdministrar = chatPodeAdministrar();

        menu.innerHTML = [
            itemMenuChat({
                icone: 'fa-solid fa-user-plus', rotulo: 'Adicionar membro',
                acao: 'adicionarMembro', oculto: !podeAdministrar
            }),
            itemMenuChat({ icone: 'fa-solid fa-circle-info', rotulo: 'Dados da comunidade', acao: 'dadosGrupo' }),
            itemMenuChat({
                icone: 'fa-solid fa-pen', rotulo: 'Editar comunidade',
                acao: 'editarGrupo', oculto: !podeAdministrar
            }),
            itemMenuChat({
                icone: 'fa-solid fa-key', rotulo: 'Código de convite',
                acao: 'copiarCodigo', oculto: !ehPrivado || !podeAdministrar
            }),
            '<div class="chat-menu-divider" role="separator"></div>',
            itemMenuChat({ icone: 'fa-solid fa-bell-slash', rotulo: 'Silenciar notificações', acao: 'silenciar' }),
            itemMenuChat({
                icone: 'fa-solid fa-users', rotulo: 'Ver membros',
                acao: 'verMembros', contador: Number(grupo?.members || 0)
            }),
            itemMenuChat({ icone: 'fa-solid fa-thumbtack', rotulo: 'Mensagens fixadas', acao: 'fixadas' }),
            itemMenuChat({ icone: 'fa-solid fa-photo-film', rotulo: 'Mídia da conversa', acao: 'midia' }),
            '<div class="chat-menu-divider" role="separator"></div>',
            itemMenuChat({
                icone: 'fa-solid fa-right-from-bracket', rotulo: 'Sair da comunidade',
                perigo: true, acao: 'sair', oculto: !chatPodeSair()
            }),
            itemMenuChat({
                icone: 'fa-solid fa-trash-can', rotulo: 'Excluir comunidade',
                perigo: true, acao: 'excluir', oculto: !chatPodeExcluir()
            })
        ].join('');
    }

    // Mapa nome -> função. Só o que o menu realmente usa.
    function acoesDoMenuChat() {
        const ctx = state.chatContexto;
        const grupo = chatGrupoAtual();

        return {
            abrirPerfil: () => {
                if (!ctx) return;
                window.location.href = ctx.type === 'direct' ? profileUrl(ctx.profileId) : groupUrl(ctx.id);
            },
            dadosGrupo: () => { if (grupo?.id) window.location.href = groupUrl(grupo.id); },
            editarGrupo: () => {
                if (!grupo?.id) return;
                window.location.href = `/comunidade/meus-grupos.html?editar=${encodeURIComponent(grupo.id)}`;
            },
            adicionarMembro: () => { window.location.href = '/comunidade/explorar-grupos.html'; },
            copiarCodigo: copiarCodigoDaConversa,
            silenciar: silenciarChat,
            verMembros: () => {
                if (!ctx) return;
                window.location.href = ctx.type === 'direct' ? profileUrl(ctx.profileId) : groupUrl(ctx.id);
            },
            fixadas: mostrarAvisoFixar,
            midia: mostrarMidiaDaConversa,
            denunciar: denunciarChat,
            encerrar: encerrarConversaDireta,
            sair: () => { const g = chatGrupoAtual(); if (g) leaveChannel(g); },
            excluir: excluirPeloMenu
        };
    }

    function ligarItensMenuChat() {
        const menu = $('chatMenu');
        if (!menu) return;
        const acoes = acoesDoMenuChat();
        menu.querySelectorAll('[data-menu-chat]').forEach(botao => {
            botao.addEventListener('click', () => {
                const acao = acoes[botao.dataset.acao];
                fecharMenuChat();
                if (typeof acao === 'function') acao();
            });
        });
    }

    function abrirMenuChat() {
        const menu = $('chatMenu');
        const botao = $('chatMenuBtn');
        if (!menu || !botao) return;
        if (!menu.hidden) { fecharMenuChat(); return; }
        montarMenuChat();
        ligarItensMenuChat();
        menu.hidden = false;
        botao.setAttribute('aria-expanded', 'true');
        menu.querySelector('[data-menu-chat]')?.focus();
    }

    function fecharMenuChat() {
        const menu = $('chatMenu');
        const botao = $('chatMenuBtn');
        if (!menu) return;
        menu.hidden = true;
        if (botao) botao.setAttribute('aria-expanded', 'false');
    }

    // ---- Ações do menu ----

    function denunciarChat() {
        showToast('Denúncia registrada. Nossa equipe vai analisar.', 'success', 4500);
    }

    async function copiarCodigoDaConversa() {
        const grupo = chatGrupoAtual();
        if (!grupo?.id) return;
        try {
            const { data, error } = await supabase.rpc('generate_group_invite', { p_group_id: grupo.id });
            if (error || !data?.success) {
                throw new Error(error?.message || data?.error || 'Não foi possível gerar o código.');
            }
            const copiado = await navigator.clipboard?.writeText(data.code).then(() => true).catch(() => false);
            showToast(
                copiado ? `Código ${data.code} copiado.` : `Código do convite: ${data.code}`,
                'success', copiado ? 3600 : 6500
            );
        } catch (error) {
            console.warn('Código de convite indisponível:', error);
            showToast(error.message || 'Não foi possível gerar o código de convite.', 'error', 5000);
        }
    }

    // Silenciar fica no navegador. Silenciar de verdade é notificação
    // push do sistema, que depende de Service Worker e permissão — não
    // seria honesto prometer algo que não acontece.
    function silenciarChat() {
        const ctx = state.chatContexto;
        if (!ctx) return;
        const chave = `acolheria:mudo:${ctx.id}`;
        let silenciado = false;
        try { silenciado = localStorage.getItem(chave) === 'sim'; } catch (e) { /* modo privado */ }
        silenciado = !silenciado;
        try { localStorage.setItem(chave, silenciado ? 'sim' : 'nao'); } catch (e) { /* modo privado */ }
        showToast(
            silenciado ? 'Notificações silenciadas neste navegador.' : 'Notificações reativadas.',
            'success', 3600
        );
    }

    function mostrarAvisoFixar() {
        showToast('Fixar mensagens ainda não está disponível.', 'info', 4500);
    }

    function mostrarMidiaDaConversa() {
        showToast('A galeria de mídia da conversa ainda será implementada.', 'info', 4500);
    }

    function excluirPeloMenu() {
        const grupo = chatGrupoAtual();
        if (!grupo) return;
        setTimeout(() => openDeleteGroupPanel(grupo), 120);
    }

    function encerrarConversaDireta() {
        if (!window.confirm('Encerrar a conversa? Ela some da sua lista. O histórico fica com a outra pessoa.')) return;
        showToast('Conversa encerrada.', 'success');
        window.location.href = '/comunidade/conversas.html';
    }

    // ====================================================================
    // ÁUDIO — player, gravação e envio
    // ====================================================================
    //
    // O bucket é fechado: cada mensagem tem um Signed URL curto, gerado na
    // hora. Isso é mais lento que uma URL fixa, mas é o que impede que a
    // voz de alguém vaze para fora da conversa.

    const AUDIO_BUCKET = 'chat-audio';
    const MEDIA_BUCKET = 'chat-media';
    const AUDIO_MAX_SEGUNDOS = 300;   // 5 minutos
    const URL_ASSINADA_MS = 50 * 60 * 1000;
    const MEDIA_MAX_BYTES = 20 * 1024 * 1024;

    function formatarDuracao(segundos) {
        const total = Math.max(0, Math.round(Number(segundos) || 0));
        const min = Math.floor(total / 60);
        const seg = total % 60;
        return `${min}:${String(seg).padStart(2, '0')}`;
    }

    // Caminho com a conversa na primeira pasta: é o que a policy do storage
    // usa para saber se quem pede o arquivo participa da conversa.
    // Só as extensões que o bucket aceita. Sem lista fechada, um nome de
    // arquivo vindo do navegador viraria caminho arbitrário no storage.
    const EXTENSOES_AUDIO = new Set(['webm', 'ogg', 'm4a', 'mp3', 'wav']);
    const EXTENSOES_IMAGEM = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']);
    const EXTENSOES_VIDEO = new Set(['mp4', 'webm', 'mov', 'ogv']);

    const TIPOS_IMAGEM = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    const TIPOS_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];

    function idUnico() {
        return (window.crypto && typeof window.crypto.randomUUID === 'function')
            ? window.crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    function caminhoPorTipo(conversationId, senderId, extensao, permitidas, padrao) {
        const pedida = String(extensao || '').toLowerCase();
        const ext = permitidas.has(pedida) ? pedida : padrao;
        return `${conversationId}/${senderId}/${idUnico()}.${ext}`;
    }

    function caminhoAudio(conversationId, senderId, extension) {
        return caminhoPorTipo(conversationId, senderId, extension, EXTENSOES_AUDIO, 'webm');
    }

    function extensaoDoAudio(blob) {
        const tipo = (blob?.type || '').toLowerCase();
        if (tipo.includes('ogg')) return 'ogg';
        if (tipo.includes('mp4') || tipo.includes('m4a') || tipo.includes('aac')) return 'm4a';
        if (tipo.includes('mpeg') || tipo.includes('mp3')) return 'mp3';
        if (tipo.includes('wav')) return 'wav';
        return 'webm';
    }

    // URLs assinadas caches por caminho, para não pedir uma nova a cada render.
    // A chave inclui o bucket: o mesmo caminho em dois buckets é outro arquivo.
    const cacheUrl = new Map();

    async function urlAssinada(caminho, bucket = AUDIO_BUCKET) {
        if (!caminho) return '';
        const chave = `${bucket}::${caminho}`;
        const guardado = cacheUrl.get(chave);
        if (guardado && guardado.expira > Date.now() + 30000) return guardado.url;
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(caminho, URL_ASSINADA_MS / 1000);
        if (error || !data?.signedUrl) {
            console.warn('Mídia indisponível:', error?.message || caminho);
            return '';
        }
        cacheUrl.set(chave, { url: data.signedUrl, expira: Date.now() + URL_ASSINADA_MS });
        return data.signedUrl;
    }

    function audioPlayerMarkup(caminho, duracao, meu) {
        const id = `audio-${Math.random().toString(36).slice(2, 9)}`;
        return `<div class="chat-audio" data-audio-path="${escapeHtml(caminho)}" data-duracao="${duracao || 0}">
            <button type="button" class="chat-audio-play" data-audio-play aria-label="Reproduzir áudio" aria-pressed="false">
                <i class="fa-solid fa-play"></i>
            </button>
            <div class="chat-audio-track">
                <div class="chat-audio-fill" data-audio-fill></div>
            </div>
            <span class="chat-audio-time" data-audio-time>${formatarDuracao(duracao)}</span>
            <button type="button" class="chat-audio-speed" data-audio-speed aria-label="Velocidade de reprodução: normal">1x</button>
            <audio preload="none" data-audio-el id="${id}"></audio>
        </div>`;
    }

    // Um listener só no container: os players são recriados a cada render.
    let audioDelegado = false;
    function ligarAudioDelegado() {
        const container = $('chatMessageList');
        if (!container || audioDelegado) return;
        audioDelegado = true;

        container.addEventListener('click', async event => {
            const playBtn = event.target.closest('[data-audio-play]');
            if (playBtn) {
                await alternarAudio(playBtn.closest('.chat-audio'));
                return;
            }
            const speedBtn = event.target.closest('[data-audio-speed]');
            if (speedBtn) alternarVelocidade(speedBtn);
        });
    }

    async function alternarAudio(caixa) {
        if (!caixa) return;
        const el = caixa.querySelector('[data-audio-el]');
        const botao = caixa.querySelector('[data-audio-play]');
        const icone = botao.querySelector('i');
        const tempo = caixa.querySelector('[data-audio-time]');
        const preenchimento = caixa.querySelector('[data-audio-fill]');
        if (!el || !botao) return;

        if (!el.src) {
            const url = await urlAssinada(caixa.dataset.audioPath);
            if (!url) {
                showToast('Não foi possível carregar este áudio.', 'error');
                return;
            }
            el.src = url;
            if (!Number(caixa.dataset.duracao)) {
                el.addEventListener('loadedmetadata', () => {
                    const d = Math.round(el.duration || 0);
                    caixa.dataset.duracao = d;
                    if (tempo) tempo.textContent = formatarDuracao(d);
                }, { once: true });
            }
        }

        // Uma mensagem por vez: áudio sobreposto em grupo é caótico.
        pausarTodosOsAudios(caixa);

        if (el.paused) {
            try {
                await el.play();
            } catch (error) {
                showToast('O navegador bloqueou a reprodução.', 'warning');
                return;
            }
            caixa.classList.add('is-playing');
            botao.setAttribute('aria-pressed', 'true');
            botao.setAttribute('aria-label', 'Pausar áudio');
            icone.className = 'fa-solid fa-pause';
        } else {
            el.pause();
        }

        el.onended = () => {
            caixa.classList.remove('is-playing');
            botao.setAttribute('aria-pressed', 'false');
            botao.setAttribute('aria-label', 'Reproduzir áudio');
            icone.className = 'fa-solid fa-play';
            if (preenchimento) preenchimento.style.width = '0%';
            if (tempo) tempo.textContent = formatarDuracao(el.duration || caixa.dataset.duracao);
        };
        el.ontimeupdate = () => {
            const pct = el.duration ? (el.currentTime / el.duration) * 100 : 0;
            if (preenchimento) preenchimento.style.width = pct + '%';
            if (tempo) tempo.textContent = formatarDuracao(el.currentTime);
        };
    }

    function pausarTodosOsAudios(exceto) {
        document.querySelectorAll('.chat-audio').forEach(caixa => {
            if (caixa === exceto) return;
            const el = caixa.querySelector('[data-audio-el]');
            if (el && !el.paused) el.pause();
        });
    }

    function alternarVelocidade(botao) {
        const caixa = botao.closest('.chat-audio');
        const el = caixa?.querySelector('[data-audio-el]');
        if (!el) return;
        const valores = [1, 1.5, 2];
        const atual = valores.indexOf(el.playbackRate);
        const proximo = valores[(atual + 1) % valores.length];
        el.playbackRate = proximo;
        botao.textContent = proximo + 'x';
        botao.setAttribute('aria-label', `Velocidade de reprodução: ${proximo === 1 ? 'normal' : proximo + ' vezes'}`);
    }

    // ---------------------------------------------------------------
    // Gravação
    // ---------------------------------------------------------------

    const gravador = {
        stream: null,
        media: null,
        partes: [],
        iniciadoEm: 0,
        timer: null,
        cancelado: false
    };

    function iniciarGravacao() {
        if (!state.conversationId) {
            showToast('Abra uma conversa para gravar áudio.', 'warning');
            return;
        }
        if (!state.user?.id) {
            showToast('Faça login para enviar áudio.', 'warning');
            return;
        }
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
            showToast('Seu navegador não suporta gravação de áudio.', 'warning');
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            gravador.stream = stream;
            gravador.partes = [];
            gravador.cancelado = false;
            gravador.iniciadoEm = Date.now();

            let tipo = '';
            for (const cand of ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']) {
                if (MediaRecorder.isTypeSupported?.(cand)) { tipo = cand; break; }
            }
            gravador.media = new MediaRecorder(stream, tipo ? { mimeType: tipo } : undefined);
            gravador.media.ondataavailable = evento => {
                if (evento.data && evento.data.size > 0) gravador.partes.push(evento.data);
            };
            gravador.media.onstop = () => {
                const duracao = (Date.now() - gravador.iniciadoEm) / 1000;
                const blob = new Blob(gravador.partes, { type: gravador.media?.mimeType || 'audio/webm' });
                limparGravacao();
                if (gravador.cancelado) { gravador.cancelado = false; return; }
                mostrarPreviaAudio(blob, duracao);
            };
            gravador.media.start(250);
            abrirBarraGravacao();
            tickingGravacao();
        }).catch(() => {
            showToast('Não foi possível acessar o microfone. Verifique a permissão do navegador.', 'warning', 5000);
        });
    }

    function limparGravacao() {
        if (gravador.timer) clearInterval(gravador.timer);
        gravador.timer = null;
        if (gravador.stream) gravador.stream.getTracks().forEach(t => t.stop());
        gravador.stream = null;
        gravador.partes = [];
    }

    function tickingGravacao() {
        const tempo = $('audioGravandoTempo');
        gravador.timer = setInterval(() => {
            const seg = (Date.now() - gravador.iniciadoEm) / 1000;
            if (tempo) tempo.textContent = formatarDuracao(seg);
            if (seg >= AUDIO_MAX_SEGUNDOS) {
                pararGravacao();
            }
        }, 200);
    }

    function abrirBarraGravacao() {
        const barra = $('audioRecordBar');
        const previa = $('audioPreviewBar');
        if (previa) previa.hidden = true;
        if (barra) barra.hidden = false;
    }

    function fecharBarraAudio() {
        const barra = $('audioRecordBar');
        const previa = $('audioPreviewBar');
        if (barra) barra.hidden = true;
        if (previa) previa.hidden = true;
    }

    function cancelarGravacao() {
        gravador.cancelado = true;
        if (gravador.media && gravador.media.state !== 'inactive') gravador.media.stop();
        limparGravacao();
        fecharBarraAudio();
    }

    function pararGravacao() {
        if (gravador.media && gravador.media.state !== 'inactive') gravador.media.stop();
    }

    // ---------------------------------------------------------------
    // Prévia antes de enviar
    // ---------------------------------------------------------------

    let previaAudio = null;

    function mostrarPreviaAudio(blob, duracao) {
        previaAudio = { blob, duracao };
        const barra = $('audioPreviewBar');
        if (!barra) return;
        const url = URL.createObjectURL(blob);
        const el = barra.querySelector('[data-preview-el]');
        if (el) {
            el.src = url;
            el.onended = () => { el.currentTime = 0; };
        }
        const tempo = barra.querySelector('[data-preview-time]');
        if (tempo) tempo.textContent = formatarDuracao(duracao);
        barra.hidden = false;
    }

    function descartarPrevia() {
        const el = $('audioPreviewBar')?.querySelector('[data-preview-el]');
        if (el?.src) URL.revokeObjectURL(el.src);
        previaAudio = null;
        fecharBarraAudio();
    }

    async function enviarAudioPrevia() {
        if (!previaAudio) return;
        if (!state.conversationId) {
            showToast('Abra uma conversa para enviar áudio.', 'warning');
            return;
        }
        const { blob, duracao } = previaAudio;
        const caminho = caminhoAudio(state.conversationId, state.user.id, extensaoDoAudio(blob));
        const barra = $('audioPreviewBar');
        const enviarBtn = barra?.querySelector('[data-preview-send]');
        if (enviarBtn) { enviarBtn.disabled = true; enviarBtn.textContent = 'Enviando...'; }

        const { error: upErro } = await supabase.storage
            .from(AUDIO_BUCKET)
            .upload(caminho, blob, { contentType: blob.type, upsert: false });

        if (upErro) {
            console.error('Falha no envio do áudio:', upErro);
            showToast('Não foi possível enviar o áudio.', 'error');
            if (enviarBtn) { enviarBtn.disabled = false; enviarBtn.textContent = 'Enviar'; }
            return;
        }

        const { data, error } = await supabase.rpc('send_audio_message', {
            p_conversation_id: state.conversationId,
            p_audio_path: caminho,
            p_duration: Math.round(duracao * 10) / 10
        });

        if (error || data?.success === false) {
            // O arquivo subiu mas a mensagem não: remover para não deixar
            // órfão ocupando espaço no bucket.
            await supabase.storage.from(AUDIO_BUCKET).remove([caminho]);
            showToast(error?.message || data?.error || 'Não foi possível registrar o áudio.', 'error', 5000);
            if (enviarBtn) { enviarBtn.disabled = false; enviarBtn.textContent = 'Enviar'; }
            return;
        }

        descartarPrevia();
        await loadMessages();
    }

    function ligarAudioUI() {
        $('audioRecordBtn')?.addEventListener('click', iniciarGravacao);
        $('audioStopBtn')?.addEventListener('click', pararGravacao);
        $('audioCancelBtn')?.addEventListener('click', cancelarGravacao);
        $('audioPreviewSend')?.addEventListener('click', enviarAudioPrevia);
        $('audioPreviewDiscard')?.addEventListener('click', descartarPrevia);
        $('chatMessageList') && ligarAudioDelegado();
        ligarMidiaUI();
    }

    // ====================================================================
    // IMAGEM E VÍDEO
    // ====================================================================
    //
    // Mesmo esquema do áudio: bucket fechado, Signed URL por visualização.
    // A diferença é que imagem e vídeo precisam de thumbnail e de não
    // carregar o arquivo inteiro no primeiro render.

    const cacheUrlImagem = new Map();

    function extensaoDe(mime, nome) {
        const peloNome = String(nome || '').split('.').pop().toLowerCase();
        if (EXTENSOES_IMAGEM.has(peloNome) || EXTENSOES_VIDEO.has(peloNome)) return peloNome;
        const tipo = String(mime || '').toLowerCase();
        if (tipo.includes('png')) return 'png';
        if (tipo.includes('webp')) return 'webp';
        if (tipo.includes('gif')) return 'gif';
        if (tipo.includes('avif')) return 'avif';
        if (tipo.includes('quicktime')) return 'mov';
        if (tipo.includes('ogg')) return 'ogv';
        return 'jpg';
    }

    function classificarArquivo(arquivo) {
        const tipo = String(arquivo?.type || '').toLowerCase();
        if (TIPOS_IMAGEM.includes(tipo)) return 'imagem';
        if (TIPOS_VIDEO.includes(tipo)) return 'video';
        return null;
    }

    function formatarTamanho(bytes) {
        const n = Number(bytes) || 0;
        if (!n) return '';
        if (n < 1024) return n + ' B';
        if (n < 1048576) return Math.round(n / 1024) + ' KB';
        return (n / 1048576).toFixed(1).replace('.', ',') + ' MB';
    }

    function caminhoImagem(conversationId, senderId, arquivo) {
        return caminhoPorTipo(conversationId, senderId, extensaoDe(arquivo.type, arquivo.name),
            arquivo.type?.startsWith('video/') ? EXTENSOES_VIDEO : EXTENSOES_IMAGEM, 'jpg');
    }

    // O src nunca vem pronto no HTML: o caminho vai num data-attribute e a
    // URL assinada é aplicada em tempo de execução. Assim não existe
    // caminho no DOM de onde saia um <img src="http://rastreador">: só
    // entram data: (dentro do blob) e blob:, ambos locais. Também exclui
    // SVG, que carrega script.
    function mediaMarkup(mensagem, meu) {
        const tipo = mensagem.message_type;
        const caminho = mensagem.media_path;
        const rotulo = escapeHtml(mensagem.sender_name || 'Mídia');
        const base = `data-media-path="${escapeHtml(caminho)}" data-media-mime="${escapeHtml(mensagem.media_mime || '')}"`;

        if (tipo === 'imagem') {
            return `<div class="chat-media" ${base}>
                <button type="button" class="chat-media-open" data-media-open aria-label="Abrir imagem de ${rotulo}">
                    <img class="chat-media-img" data-media-img alt="Imagem enviada por ${rotulo}" loading="lazy" decoding="async">
                    <span class="chat-media-spinner" data-media-spinner aria-hidden="true"><i class="fa-solid fa-spinner fa-spin"></i></span>
                </button>
            </div>`;
        }

        if (tipo === 'video') {
            const dur = Number(mensagem.media_duration || 0);
            return `<div class="chat-media is-video" ${base} data-duracao="${dur || 0}">
                <button type="button" class="chat-media-open" data-media-open aria-label="Reproduzir vídeo de ${rotulo}">
                    <video class="chat-media-video" data-media-video preload="none" playsinline controls
                        aria-label="Vídeo enviado por ${rotulo}"></video>
                    <span class="chat-media-spinner" data-media-spinner aria-hidden="true"><i class="fa-solid fa-spinner fa-spin"></i></span>
                </button>
            </div>`;
        }

        return '';
    }

    // Um listener só: os players são recriados a cada render.
    let mediaDelegado = false;
    function ligarMediaDelegado() {
        const container = $('chatMessageList');
        if (!container || mediaDelegado) return;
        mediaDelegado = true;

        container.addEventListener('click', event => {
            const abrir = event.target.closest('[data-media-open]');
            if (!abrir) return;
            const caixa = abrir.closest('.chat-media');
            if (caixa) carregarMidia(caixa);
        });
    }

    async function carregarMidia(caixa) {
        const caminho = caixa.dataset.mediaPath;
        const ehVideo = caixa.classList.contains('is-video');
        const img = caixa.querySelector('[data-media-img]');
        const video = caixa.querySelector('[data-media-video]');
        const alvo = ehVideo ? video : img;
        if (!alvo || !caminho) return;
        if (alvo.dataset.carregado === 'sim') return;

        // O vídeo abre ao clicar; a imagem só precisa do src para aparecer.
        if (ehVideo && !alvo.src) {
            const url = await urlAssinada(caminho, MEDIA_BUCKET);
            if (!url) {
                showToast('Não foi possível carregar este vídeo.', 'error');
                return;
            }
            alvo.src = url;
            alvo.dataset.carregado = 'sim';
            if (video) {
                video.classList.add('is-ready');
                try { await video.play(); } catch (e) { /* autoplay bloqueado: Controls visíveis */ }
            }
            return;
        }

        const url = await urlAssinada(caminho, MEDIA_BUCKET);
        if (!url) {
            caixa.classList.add('is-erro');
            return;
        }
        alvo.src = url;
        alvo.dataset.carregado = 'sim';
        alvo.addEventListener('load', () => {
            caixa.classList.add('is-carregado');
            const w = alvo.naturalWidth || alvo.videoWidth;
            const h = alvo.naturalHeight || alvo.videoHeight;
            if (w && h) caixa.style.setProperty('--media-ratio', String(w / h));
            if (ehVideo && video) video.classList.add('is-ready');
        }, { once: true });
        alvo.addEventListener('error', () => caixa.classList.add('is-erro'), { once: true });
    }

    // Carrega as imagens visíveis; as de fora da tela esperam o scroll.
    let observadorMidia = null;
    function observarMidias() {
        if (observadorMidia) observadorMidia.disconnect();
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.chat-media').forEach(carregarMidia);
            return;
        }
        observadorMidia = new IntersectionObserver(entradas => {
            entradas.forEach(entrada => {
                if (!entrada.isIntersecting) return;
                carregarMidia(entrada.target);
                observadorMidia.unobserve(entrada.target);
            });
        }, { root: $('chatMessageList'), rootMargin: '300px' });
        document.querySelectorAll('.chat-media').forEach(caixa => observadorMidia.observe(caixa));
    }

    // ---------------------------------------------------------------
    // Envio
    // ---------------------------------------------------------------

    let midiaEnviando = false;

    async function enviarMidia(arquivo) {
        if (midiaEnviando) {
            showToast('Aguarde o envio anterior terminar.', 'warning');
            return;
        }
        if (!state.conversationId) {
            showToast('Abra uma conversa para enviar mídia.', 'warning');
            return;
        }
        if (!state.user?.id) {
            showToast('Faça login para enviar mídia.', 'warning');
            return;
        }

        const tipo = classificarArquivo(arquivo);
        if (!tipo) {
            showToast('Formato não suportado. Use imagem ou vídeo.', 'warning');
            return;
        }
        if (arquivo.size > MEDIA_MAX_BYTES) {
            showToast(`Arquivo de ${formatarTamanho(arquivo.size)}. O limite é 20 MB.`, 'warning', 5000);
            return;
        }

        midiaEnviando = true;
        const caminho = caminhoImagem(state.conversationId, state.user.id, arquivo);
        const barra = $('mediaUploadBar');
        const rotulo = barra?.querySelector('[data-media-status]');
        if (barra) barra.hidden = false;

        const progresso = (pct) => {
            const barraInterna = barra?.querySelector('[data-media-progress]');
            if (barraInterna) barraInterna.style.width = pct + '%';
            if (rotulo) rotulo.textContent = pct < 100 ? `Enviando ${pct}%` : 'Processando...';
        };

        try {
            progresso(0);
            const { error: upErro } = await supabase.storage
                .from(MEDIA_BUCKET)
                .upload(caminho, arquivo, {
                    contentType: arquivo.type,
                    cacheControl: '3600',
                    upsert: false
                });

            if (upErro) {
                console.error('Falha no envio da mídia:', upErro);
                showToast('Não foi possível enviar o arquivo.', 'error');
                return;
            }

            // Dimensões vêm do navegador: evitam layout quebrado na
            // primeira pintura enquanto o arquivo carrega.
            let largura = null;
            let altura = null;
            const dimensoes = await medirMidia(arquivo, tipo);
            if (dimensoes) { largura = dimensoes.w; altura = dimensoes.h; }

            const { data, error } = await supabase.rpc('send_media_message', {
                p_conversation_id: state.conversationId,
                p_media_path: caminho,
                p_media_mime: arquivo.type,
                p_media_size: arquivo.size,
                p_width: largura,
                p_height: altura
            });

            if (error || data?.success === false) {
                // Arquivo subiu mas a mensagem não: limpar o órfão.
                await supabase.storage.from(MEDIA_BUCKET).remove([caminho]);
                const msg = isMissingRpcError(error || {})
                    ? 'Rode sql/13_media_messages.sql no Supabase para ativar imagens e vídeos.'
                    : (data?.error || error?.message || 'Não foi possível registrar o arquivo.');
                showToast(msg, 'error', 6000);
                return;
            }

            await loadMessages();
        } catch (erro) {
            console.error('Erro ao enviar mídia:', erro);
            showToast('Não foi possível enviar o arquivo.', 'error');
        } finally {
            midiaEnviando = false;
            if (barra) barra.hidden = true;
            const input = $('mediaFileInput');
            if (input) input.value = '';
        }
    }

    function medirMidia(arquivo, tipo) {
        return new Promise(resolve => {
            const url = URL.createObjectURL(arquivo);
            const el = document.createElement(tipo === 'video' ? 'video' : 'img');
            let respondido = false;
            const responder = valor => {
                if (respondido) return;
                respondido = true;
                clearTimeout(guarda);
                URL.revokeObjectURL(url);
                resolve(valor);
            };
            // Vídeo grande de celular pode demorar: não trava a fila.
            const guarda = setTimeout(() => responder(null), 8000);
            el.onload = () => responder({ w: el.naturalWidth || el.videoWidth, h: el.naturalHeight || el.videoHeight });
            el.onerror = () => responder(null);
            el.preload = 'metadata';
            el.src = url;
        });
    }

    function abrirSeletorMidia() {
        if (!state.conversationId) {
            showToast('Abra uma conversa para enviar mídia.', 'warning');
            return;
        }
        $('mediaFileInput')?.click();
    }

    // ====================================================================
    // APAGAR MENSAGEM
    // ====================================================================
    //
    // Só a própria mensagem, nos 15 minutos seguintes ao envio. Janela
    // porque apagar algo antigo quase sempre é para esconder, e o botão
    // some quando ela fecha em vez de deixar a pessoa tomar erro.
    //
    // Mensagem de outra pessoa não é apagável por aqui, em nenhum caso:
    // nem dono, nem admin. Se alguém precisa tirar uma mensagem alheia do
    // ar, isso é moderação e passa por outro caminho.

    const JANELA_APAGAR_MIN = 15;

    function dentroDaJanelaDeApagar(mensagem) {
        if (!mensagem?.created_at) return false;
        const minutos = (Date.now() - new Date(mensagem.created_at).getTime()) / 60000;
        return minutos >= 0 && minutos <= JANELA_APAGAR_MIN;
    }

    function podeApagarMensagem(mensagem) {
        if (!mensagem || mensagem.deleted_at) return false;
        if (!state.user?.id) return false;
        if (mensagem.sender_id !== state.user.id) return false;
        return dentroDaJanelaDeApagar(mensagem);
    }

    function iconeApagar(mensagem) {
        if (!podeApagarMensagem(mensagem)) return '';
        return `<button type="button" class="chat-bubble-apagar" data-apagar-mensagem="${escapeHtml(mensagem.id)}"
            aria-label="Apagar minha mensagem (${JANELA_APAGAR_MIN} min)"
            title="Apagar minha mensagem">
            <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
        </button>`;
    }

    // Confirmação dentro do app. O window.confirm do navegador abre uma
    // janela do sistema, que destoa e some no celular.
    function confirmarApagarMensagem() {
        return new Promise(resolve => {
            const modal = $('apagarMensagemModal');
            const sim = $('apagarMensagemSim');
            const nao = $('apagarMensagemNao');
            if (!modal || !sim || !nao) { resolve(window.confirm('Apagar sua mensagem?')); return; }

            let decidido = false;
            const finalizar = valor => {
                if (decidido) return;
                decidido = true;
                modal.hidden = true;
                sim.removeEventListener('click', aoSim);
                nao.removeEventListener('click', aoNao);
                modal.removeEventListener('click', aoFundo);
                document.removeEventListener('keydown', aoTecla);
                resolve(valor);
            };
            const aoSim = () => finalizar(true);
            const aoNao = () => finalizar(false);
            const aoFundo = event => { if (event.target === modal) finalizar(false); };
            const aoTecla = event => { if (event.key === 'Escape') finalizar(false); };

            modal.hidden = false;
            sim.addEventListener('click', aoSim);
            nao.addEventListener('click', aoNao);
            modal.addEventListener('click', aoFundo);
            document.addEventListener('keydown', aoTecla);
            setTimeout(() => nao.focus(), 40);
        });
    }

    async function apagarMensagem(messageId) {
        if (!messageId) return;

        // Guarda os caminhos antes do RPC: depois de apagar, a linha vem
        // sem eles, e o arquivo ficaria órfão no bucket.
        const alvo = document.querySelector(`[data-message-id="${CSS.escape(messageId)}"]`);
        const caminhos = {
            audio: alvo?.querySelector('[data-audio-path]')?.dataset.audioPath || null,
            media: alvo?.querySelector('.chat-media')?.dataset.mediaPath || null
        };

        if (!await confirmarApagarMensagem()) return;

        const { data, error } = await supabase.rpc('delete_message', { p_message_id: messageId });
        if (error || data?.success === false) {
            const msg = isMissingRpcError(error || {})
                ? 'Rode sql/14_delete_messages.sql no Supabase para ativar o apagamento.'
                : (data?.error || error?.message || 'Não foi possível apagar a mensagem.');
            showToast(msg, 'error', 5500);
            return;
        }

        // Arquivo em segundo plano: falhar aqui não desfaz a mensagem.
        limparArquivosDaMensagem(caminhos);
        avisarConversa('apagou');
        await loadMessages();
        showToast('Mensagem apagada.', 'success', 2800);
    }

    async function limparArquivosDaMensagem(caminhos) {
        const alvos = [];
        if (caminhos.audio) alvos.push([caminhos.audio, AUDIO_BUCKET]);
        if (caminhos.media) alvos.push([caminhos.media, MEDIA_BUCKET]);
        for (const [caminho, bucket] of alvos) {
            try {
                await supabase.storage.from(bucket).remove([caminho]);
            } catch (error) {
                console.warn('Arquivo órfão no storage:', caminho, error?.message);
            }
        }
    }

    // Delegado: o balão é recriado a cada render, então o listener fica
    // no container.
    let apagarDelegado = false;
    function ligarApagarDelegado() {
        const container = $('chatMessageList');
        if (!container || apagarDelegado) return;
        apagarDelegado = true;
        container.addEventListener('click', event => {
            const botao = event.target.closest('[data-apagar-mensagem]');
            if (!botao) return;
            event.stopPropagation();
            apagarMensagem(botao.dataset.apagarMensagem);
        });
    }

    // ------------------------------------------------------------------
    // APAGAR SEGURANDO A MENSAGEM
    // ------------------------------------------------------------------
    //
    // Segurar é o gesto natural no celular, e o botão de lixeira some
    // no desktop quando o mouse nao esta em cima. Tres salvaguardas:
    //   - so dispara na propria mensagem e dentro da janela
    //   - arrastar o dedo cancela, senao rolar a conversa apagaria
    //   - segurar sem mover em link/texto nao abre o menu do navegador

    const PRESSO_MS = 500;
    const PRESSO_TOLERANCIA_PX = 12;
    let pressaoLigada = false;

    function idApagavelDe(alvo) {
        const linha = alvo?.closest?.('.chat-message-row');
        if (!linha) return null;
        const botao = linha.querySelector('[data-apagar-mensagem]');
        return botao ? botao.dataset.apagarMensagem : null;
    }

    function ligarApagarPorPresso() {
        const lista = $('chatMessageList');
        if (!lista || pressaoLigada) return;
        pressaoLigada = true;

        let timer = null;
        let origem = null;

        function limpar() {
            if (timer) clearTimeout(timer);
            timer = null;
            origem?.linha?.classList.remove('is-pressing');
            origem = null;
        }

        function comecar(x, y, alvo, evento) {
            // Alvo precisa ser o balão, não o link do autor nem a imagem.
            if (alvo.closest('a, button, input, textarea, audio, video')) return;
            const id = idApagavelDe(alvo);
            if (!id) return;

            const linha = alvo.closest('.chat-message-row');
            origem = { x, y, linha, id };
            linha.classList.add('is-pressing');

            timer = setTimeout(() => {
                const alvoAtual = origem;
                limpar();
                // Vibração dá o retorno de que o gesto foi entendido.
                navigator.vibrate?.(12);
                apagarMensagem(alvoAtual.id);
            }, PRESSO_MS);
        }

        lista.addEventListener('touchstart', event => {
            const toque = event.touches[0];
            if (!toque) return;
            comecar(toque.clientX, toque.clientY, event.target, event);
        }, { passive: true });

        lista.addEventListener('touchmove', event => {
            if (!origem) return;
            const toque = event.touches[0];
            if (!toque) return;
            const dx = Math.abs(toque.clientX - origem.x);
            const dy = Math.abs(toque.clientY - origem.y);
            if (dx > PRESSO_TOLERANCIA_PX || dy > PRESSO_TOLERANCIA_PX) limpar();
        }, { passive: true });

        ['touchend', 'touchcancel'].forEach(tipo => {
            lista.addEventListener(tipo, () => limpar(), { passive: true });
        });

        // Desktop: segurar o botão do mouse faz o mesmo.
        lista.addEventListener('mousedown', event => {
            if (event.button !== 0) return;
            comecar(event.clientX, event.clientY, event.target, event);
        });
        ['mouseup', 'mouseleave'].forEach(tipo => {
            lista.addEventListener(tipo, () => limpar());
        });

        // Botão direito abre direto, sem esperar os 500 ms.
        lista.addEventListener('contextmenu', event => {
            const id = idApagavelDe(event.target);
            if (!id) return;
            event.preventDefault();
            limpar();
            apagarMensagem(id);
        });
    }

    function ligarMidiaUI() {
        $('mediaAttachBtn')?.addEventListener('click', abrirSeletorMidia);
        $('mediaFileInput')?.addEventListener('change', event => {
            const arquivo = event.target.files?.[0];
            if (arquivo) enviarMidia(arquivo);
        });

        // Colar imagem direto na conversa.
        $('chatComposerInput')?.addEventListener('paste', event => {
            const itens = Array.from(event.clipboardData?.items || []);
            const imagem = itens.find(item => item.type.startsWith('image/'));
            if (!imagem) return;
            const arquivo = imagem.getAsFile();
            if (arquivo) {
                event.preventDefault();
                enviarMidia(arquivo);
            }
        });

        // Arrastar arquivo sobre a conversa.
        const lista = $('chatMessageList');
        if (lista) {
            ['dragenter', 'dragover'].forEach(tipo => {
                lista.addEventListener(tipo, event => {
                    if (!Array.from(event.dataTransfer?.types || []).includes('Files')) return;
                    event.preventDefault();
                    lista.classList.add('is-dropzone');
                });
            });
            ['dragleave', 'drop'].forEach(tipo => {
                lista.addEventListener(tipo, () => lista.classList.remove('is-dropzone'));
            });
            lista.addEventListener('drop', event => {
                const arquivo = event.dataTransfer?.files?.[0];
                if (arquivo) { event.preventDefault(); enviarMidia(arquivo); }
            });
        }
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
            const apagada = Boolean(message.deleted_at);
            const tipo = message.message_type || 'texto';
            let corpo = '';
            if (apagada) {
                // Sem autor: quem apagou não precisa ficar registrado aqui.
                corpo = `<div class="chat-bubble is-deleted"><i class="fa-solid fa-ban" aria-hidden="true"></i><span>Mensagem apagada</span></div>`;
            } else if (tipo === 'audio' && message.audio_path) {
                corpo = audioPlayerMarkup(message.audio_path, Number(message.audio_duration || 0), mine);
            } else if ((tipo === 'imagem' || tipo === 'video') && message.media_path) {
                corpo = mediaMarkup(message, mine);
            } else {
                corpo = `<div class="chat-bubble">${escapeHtml(message.content || '')}</div>`;
            }
            const apagar = apagada ? '' : iconeApagar(message);
            return `${divider}<div class="chat-message-row ${mine ? 'mine' : ''}${apagada ? ' is-deleted' : ''}" data-message-id="${escapeHtml(message.id || '')}">
                <a class="chat-message-avatar" href="${profileUrl(message.sender_id)}" aria-label="Ver perfil de ${escapeHtml(sender)}"${apagada ? ' tabindex="-1" aria-hidden="true"' : ''}>${avatarContent}</a>
                <div class="chat-bubble-wrap">
                    ${!mine && !apagada ? `<a class="chat-author" href="${profileUrl(message.sender_id)}">${escapeHtml(sender)}</a>` : ''}
                    ${corpo}
                    <span class="chat-message-time">${escapeHtml(formatTime(message.created_at))}</span>
                    ${apagar}
                </div>
            </div>`;
        }).join('');
        container.scrollTop = container.scrollHeight;
    }

    // Assinatura barata do estado da conversa. Serve para saber se o
    // varredor de reserva precisa redesenhar, sem redesenhar sempre.
    function assinaturaMensagens(lista) {
        if (!Array.isArray(lista) || !lista.length) return 'vazio';
        const ultima = lista[lista.length - 1];
        const apagadas = lista.filter(m => m.deleted_at).length;
        return `${lista.length}|${ultima.id}|${ultima.created_at}|${apagadas}`;
    }

    async function loadMessages() {
        const container = $('chatMessageList');
        if (!container || !state.conversationId) return;
        container.innerHTML = '<div class="chat-loading"><i class="fa-solid fa-spinner fa-spin"></i><span>Carregando mensagens...</span></div>';
        // get_conversation_messages traz texto, áudio, imagem e vídeo.
        // get_messages (a versão antiga) não conhece essas colunas.
        const { data, error } = await safeRpc('get_conversation_messages', {
            p_conversation_id: state.conversationId,
            p_limit: 100
        });
        if (error) {
            const mensagem = isMissingRpcError(error)
                ? 'Rode sql/12_audio_messages.sql e sql/13_media_messages.sql no Supabase.'
                : error.message;
            container.innerHTML = `<div class="chat-empty"><div><strong>Não foi possível carregar a conversa</strong><span>${escapeHtml(mensagem)}</span></div></div>`;
            return;
        }
        ligarAudioDelegado();
        ligarMediaDelegado();
        ligarApagarDelegado();
        renderMessages(data || []);
        observarMidias();
        state.ultimaAssinatura = assinaturaMensagens(data || []);
    }

    // Recarrega sem mostrar o "Carregando..." e sem redesenhar se nada
    // mudou.
    //
    //   pularSeDigitando  o varredor de reserva usa true: se a pessoa esta
    //                     no meio de uma frase, redesenhar a lista agora
    //                     puxaria a rolagem para baixo.
    //                     Aviso de novidade (broadcast) usa false: ali a
    //                     mensagem precisa aparecer na hora.
    async function sincronizarMensagens({ pularSeDigitando = false } = {}) {
        if (!state.conversationId) return;
        if (pularSeDigitando && ($('chatComposerInput')?.value || '').trim()) return;

        const { data, error } = await safeRpc('get_conversation_messages', {
            p_conversation_id: state.conversationId,
            p_limit: 100
        });
        if (error || !Array.isArray(data)) return;

        const assinatura = assinaturaMensagens(data);
        if (assinatura === state.ultimaAssinatura) return;
        state.ultimaAssinatura = assinatura;
        // Houve novidade: a conversa esta ativa, volta a varredura rapida.
        state.nivelVarredura = 0;

        ligarAudioDelegado();
        ligarMediaDelegado();
        ligarApagarDelegado();
        renderMessages(data);
        observarMidias();
    }

    // Recarga por aviso de novidade.
    //
    // Duas camadas, porque cada uma sozinha erra:
    //   leading edge  a primeira chegada recarrega na hora. Esperar a
    //                 janela antes de mostrar e um atraso artificial
    //                 que a pessoa sente. Rateado para no maximo uma
    //                 vez por janela.
    //   trailing      debounce classico: a ultima mensagem da rajada
    //                 sempre e buscada, senao ela ficaria invisivel.
    //
    // Cinco mensagens em 600ms viram tres consultas, nao seis.
    const JANELA_AVISO_MS = 400;
    let timerAviso = null;
    let proximoLeadingMs = 0;

    function agendarRecarga() {
        if (Date.now() >= proximoLeadingMs) {
            proximoLeadingMs = Date.now() + JANELA_AVISO_MS;
            sincronizarMensagens();
        }

        if (timerAviso) clearTimeout(timerAviso);
        timerAviso = setTimeout(() => {
            timerAviso = null;
            sincronizarMensagens();
        }, JANELA_AVISO_MS);
    }

    // Avisa os outros clientes de que a conversa mudou.
    //
    // Por que broadcast e nao o postgres_changes: o postgres_changes so
    // entrega evento se a tabela estiver na publicacao supabase_realtime,
    // e nesse projeto ela nao esta. O broadcast vai de cliente para
    // cliente pelo mesmo websocket e funciona sem configuracao de banco.
    function avisarConversa(motivo) {
        const canal = state.channelSubscription;
        if (!canal) return;
        try {
            const envio = canal.send({
                type: 'broadcast',
                event: 'muda',
                payload: { motivo, de: state.user?.id || null }
            });
            // Sem canal conectado o send resolve com 'error'; nao ha
            // o que fazer aqui porque o varredor de reserva cobre.
            if (envio?.catch) envio.catch(() => {});
        } catch (erro) {
            console.warn('Nao consegui avisar a conversa:', erro);
        }
    }

    function pararVarredorReserva() {
        if (state.timerVarredura) {
            clearInterval(state.timerVarredura);
            state.timerVarredura = null;
        }
    }

    // Reserva: se o realtime nao entregar NENHUM evento, a conversa
    // ficaria parada ate a pessoa recarregar. Aqui a gente cobre esse
    // caso consultando o banco de tempos em tempos.
    //
    // So liga quando o realtime falha de vez. Se ele funciona, nao ha
    // gasto de consulta nenhuma.
    //
    // Aba em segundo plano nao para, so abranda: 30s em vez de 5s. Parar
    // de vez significaria voltar de outra aba e ver a conversa velha.
    function ligarVarredorReserva() {
        if (state.timerVarredura) return;

        setTimeout(() => {
            if (state.realtimeRecebeuEvento || !state.conversationId) return;

            console.warn('[conversas] nenhum aviso de outro cliente apos ' +
                (ESPERA_PROVA_REALTIME_MS / 1000) + 's. Usando varredura de reserva ' +
                '(comeca em ' + (INTERVALO_VARREDURA_MS / 1000) + 's e dobra ate ' +
                (INTERVALO_VARREDURA_MAX_MS / 1000) + 's).');

            pararVarredorReserva();
            state.ultimoVarredura = 0;
            state.nivelVarredura = 0;

            state.timerVarredura = setInterval(() => {
                if (!state.conversationId) { pararVarredorReserva(); return; }

                const visivel = document.visibilityState === 'visible';
                const minimo = visivel
                    ? Math.min(INTERVALO_VARREDURA_MS * Math.pow(2, state.nivelVarredura),
                        INTERVALO_VARREDURA_MAX_MS)
                    : INTERVALO_VARREDURA_OCULTA_MS;
                if (Date.now() - state.ultimoVarredura < minimo) return;

                state.ultimoVarredura = Date.now();
                state.nivelVarredura = Math.min(state.nivelVarredura + 1, 4);
                sincronizarMensagens({ pularSeDigitando: true });
            }, INTERVALO_VARREDURA_MS);
        }, ESPERA_PROVA_REALTIME_MS);
    }

    function subscribeToConversation() {
        if (!state.conversationId) return;
        if (state.channelSubscription) supabase.removeChannel(state.channelSubscription);
        pararVarredorReserva();
        state.realtimeRecebeuEvento = false;
        state.ultimaAssinatura = null;
        state.nivelVarredura = 0;

        state.channelSubscription = supabase
            .channel(`conversation-page-${state.conversationId}`)
            // UMA inscricao so, sem filtro de evento.
            //
            // Registrar dois postgres_changes (INSERT e UPDATE) no mesmo
            // channel faz as bindings conflitarem no supabase-js: o canal
            // para de entregar INSERT tambem. Por isso o evento e
            // separado dentro do handler, e nao no .on().
            .on('postgres_changes', {
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${state.conversationId}`
            }, payload => {
                // Chegou evento: o postgres_changes funciona, mata a reserva.
                state.realtimeRecebeuEvento = true;
                pararVarredorReserva();

                const registro = payload.new || {};

                if (payload.eventType === 'INSERT') {
                    if (registro.sender_id !== state.user?.id) agendarRecarga();
                    return;
                }

                // Apagar e LOGICO (a 14 marca deleted_at), entao chega
                // como UPDATE e nao como DELETE.
                if (payload.eventType === 'UPDATE' && registro.deleted_at) {
                    agendarRecarga();
                }
            })
            // Outro cliente avisou que a conversa mudou. E o caminho
            // rapido: nao depende de publicacao nenhuma no banco.
            .on('broadcast', { event: 'muda' }, () => {
                // Nao filtramos o proprio autor: quem envia ja chama
                // loadMessages e, com a assinatura igual, sincronizar
                //Mensagens sai sem redesenhar. Quem tem a conversa
                // aberta em duas abas (mesmo usuario) precisa ver as
                // duas.
                state.realtimeRecebeuEvento = true;
                pararVarredorReserva();
                agendarRecarga();
            })
            .subscribe();

        ligarVarredorReserva();
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
            avisarConversa('enviou');
            await loadMessages();
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            showToast(error.message || 'Não foi possível enviar a mensagem.', 'error');
        } finally {
            if (button) button.disabled = false;
            input?.focus();
        }
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Corpo de setupChat, parametrizado. Serve tanto para a página de chat
    // quanto para abrir no painel da central de conversas.
    async function abrirConversaInline({ id, type, nome, friendId }) {
        if (!id || !UUID_RE.test(id)) {
            window.location.replace('/comunidade/conversas.html');
            return;
        }
        state.conversationId = id;
        state.conversationType = type === 'direct' ? 'direct' : 'group';
        state.conversationFriendId = friendId || null;
        const nomePadrao = nome || (state.conversationType === 'direct' ? 'Amigo' : 'Comunidade');

        if (state.conversationType === 'direct') {
            let profile = null;
            if (state.conversationFriendId) {
                const result = await supabase.from('profiles').select('id, username, avatar_url').eq('id', state.conversationFriendId).maybeSingle();
                profile = result.data;
            }
            setChatHeader({
                id,
                name: profile?.username || nomePadrao,
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
                name: group.name || nomePadrao,
                type: 'group',
                subtitle: `${Number(group.members || 0)} membros · comunidade`,
                avatar: group.avatar_url || group.banner_url || group.image_url,
                profileId: null
            });
        }

        mostrarEstadoInbox(false);
        const chat = $('conversationChat');
        if (chat) chat.hidden = false;
        const composer = $('chatComposerInput');
        if (composer) composer.value = '';

        // No celular a lista sai de cena para a conversa usar a tela inteira.
        $('conversationRail')?.classList.add('is-hidden-mobile');
        document.body.classList.add('conversation-chat-open');
        // Recalcula os itens para refletir a conversa ativa na lista.
        if (typeof renderInbox === 'function' && state.inboxTab) renderInbox();

        ligarComposer();
        await loadMessages();
        subscribeToConversation();
        setTimeout(() => composer?.focus(), 60);
    }

    // Os listeners do composer usam delegation para não duplicar a cada
    // troca de conversa.
    let composerLigado = false;
    function ligarComposer() {
        if (composerLigado) return;
        composerLigado = true;
        $('chatComposerForm')?.addEventListener('submit', sendMessage);
        $('chatComposerInput')?.addEventListener('keydown', event => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                $('chatComposerForm')?.requestSubmit();
            }
        });
        $('chatComposerInput')?.addEventListener('input', autoResizeComposer);
        ligarAudioUI();
        ligarMenuChat();
        ligarApagarDelegado();
        ligarApagarPorPresso();
    }

    // Delegado: o menu é reescrito a cada abertura, então o listener fica
    // no documento e o botão só alterna o estado.
    let menuChatLigado = false;
    function ligarMenuChat() {
        if (menuChatLigado) return;
        menuChatLigado = true;

        $('chatMenuBtn')?.addEventListener('click', event => {
            event.stopPropagation();
            abrirMenuChat();
        });

        document.addEventListener('click', event => {
            const menu = $('chatMenu');
            if (!menu || menu.hidden) return;
            if (event.target.closest('#chatMenu') || event.target.closest('#chatMenuBtn')) return;
            fecharMenuChat();
        });

        document.addEventListener('keydown', event => {
            const menu = $('chatMenu');
            if (!menu || menu.hidden) return;
            if (event.key === 'Escape') {
                event.stopPropagation();
                fecharMenuChat();
                $('chatMenuBtn')?.focus();
                return;
            }
            // Navegação por setas entre os itens.
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const itens = [...menu.querySelectorAll('[data-menu-chat]')];
            if (!itens.length) return;
            const i = itens.indexOf(document.activeElement);
            const proximo = event.key === 'ArrowDown'
                ? (i + 1) % itens.length
                : (i <= 0 ? itens.length - 1 : i - 1);
            itens[proximo].focus();
        });
    }

    function autoResizeComposer(event) {
        const el = event.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 130) + 'px';
    }

    async function setupChat() {
        const id = pageUrl.searchParams.get('id');
        if (!id || !UUID_RE.test(id)) {
            window.location.replace('/comunidade/conversas.html');
            return;
        }
        await abrirConversaInline({
            id,
            type: pageUrl.searchParams.get('type') === 'direct' ? 'direct' : 'group',
            nome: pageUrl.searchParams.get('name') || null,
            friendId: pageUrl.searchParams.get('friendId')
        });
    }

    // Encontra (ou cria) a conversa particular e troca a URL pelo id real,
    // para o link Continue funcionando e o voltar do navegador se comportar.
    async function abrirConversaComPessoa(friendId, nome) {
        if (!state.user?.id) {
            showToast('Faça login para iniciar uma conversa.', 'warning');
            window.location.replace('/comunidade/conversas.html');
            return;
        }

        try {
            let apelido = nome;
            if (!apelido) {
                const { data } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', friendId)
                    .maybeSingle();
                apelido = data?.username || 'Amigo';
            }

            const conversationId = await ensureDirectConversation({
                friend_id: friendId,
                username: apelido
            });
            if (!conversationId) throw new Error('não foi possível abrir a conversa');

            const destino = `/comunidade/conversas.html?id=${encodeURIComponent(conversationId)}` +
                `&type=direct&name=${encodeURIComponent(apelido)}&friendId=${encodeURIComponent(friendId)}`;
            window.location.replace(destino);
        } catch (erro) {
            console.error('❌ Não consegui abrir a conversa privada:', erro);
            showToast('Não foi possível abrir a conversa com essa pessoa.', 'error', 5000);
            window.location.replace('/comunidade/conversas.html');
        }
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

    const INVITE_CODE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

    function randomInviteCode() {
        return String(Math.floor(Math.random() * 100000)).padStart(5, '0');
    }

    // Aceita "12345", "12 345", "12-345" e links antigos com ?code=12345.
    function normalizeInviteCode(value) {
        const raw = String(value || '').trim();
        if (!raw) return '';
        const fromLink = raw.match(/[?&](?:code|convite|codigo)=(\d{5})\b/i);
        if (fromLink) return fromLink[1];
        const digits = raw.replace(/\D/g, '');
        return digits.length === 5 ? digits : '';
    }

    // Mesmo sistema de código do fórum: RPC primeiro, inserção direta em group_invites como reserva.
    // Nunca devolve link — sempre um código numérico de 5 dígitos.
    async function generateGroupInviteCode(groupId) {
        if (!groupId) return { success: false, error: 'Comunidade sem identificador.' };

        const rpcResult = await safeRpc('generate_group_invite', { p_group_id: groupId });
        if (!rpcResult.error && rpcResult.data?.success && rpcResult.data.code) {
            return rpcResult.data;
        }
        console.warn('RPC generate_group_invite indisponível, gerando código direto:',
            rpcResult.error?.message || rpcResult.data?.error);

        const userId = state.user?.id;
        if (!userId) return { success: false, error: 'Faça login para gerar o código de convite.' };

        const expiresAt = new Date(Date.now() + INVITE_CODE_TTL_MS).toISOString();

        try {
            // Reaproveita o código ativo antes de invalidar o anterior.
            const { data: activeInvite, error: activeError } = await supabase
                .from('group_invites')
                .select('code, expires_at')
                .eq('group_id', groupId)
                .eq('active', true)
                .gt('expires_at', new Date().toISOString())
                .order('expires_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!activeError && activeInvite?.code) {
                return { success: true, code: activeInvite.code, expires_at: activeInvite.expires_at || expiresAt };
            }

            // Desativa os convites antigos e cria um novo com código livre.
            await supabase.from('group_invites').update({ active: false }).eq('group_id', groupId);

            for (let attempt = 0; attempt < 8; attempt += 1) {
                const code = randomInviteCode();
                const { error: insertError } = await supabase
                    .from('group_invites')
                    .insert({
                        group_id: groupId,
                        code,
                        created_by: userId,
                        active: true,
                        expires_at: expiresAt
                    });
                if (!insertError) return { success: true, code, expires_at: expiresAt };
                if (!/duplicate|unique/i.test(insertError.message || '')) {
                    throw new Error(insertError.message);
                }
            }
            throw new Error('Não foi possível gerar um código único.');
        } catch (error) {
            console.error('Falha ao gerar o código de convite:', error);
            return { success: false, error: 'Não foi possível gerar o código de convite no momento.' };
        }
    }

    // Usa o código de 5 dígitos. group_members só libera INSERT via
    // SECURITY DEFINER, então as duas RPCs são a única forma de entrar.
    async function redeemGroupInviteCode(code) {
        const attempts = state.groupsRpcV2
            ? ['redeem_group_invite', 'use_invite_code']
            : ['use_invite_code', 'redeem_group_invite'];
        let lastMessage = 'Convite inválido ou expirado.';

        for (const name of attempts) {
            const result = await safeRpc(name, { p_code: code });
            if (result.error) {
                lastMessage = result.error;
                continue;
            }
            if (result.data?.success) return result.data;
            return { success: false, error: result.data?.error || lastMessage };
        }

        if (isMissingRpcError(lastMessage)) {
            return {
                success: false,
                error: 'Função de convite não instalada no banco. Rode sql/11_invite_code_system.sql no Supabase e recarregue o schema.'
            };
        }
        return { success: false, error: lastMessage?.message || 'Não foi possível usar este convite.' };
    }

    async function copyChannelInvite(group) {
        if (!group?.id) {
            showToast('Comunidade sem identificador válido.', 'error');
            return;
        }
        const button = $('copyChannelInvite');
        const originalHtml = button ? button.innerHTML : '';
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gerando...';
        }
        try {
            const invite = await generateGroupInviteCode(group.id);
            if (!invite?.success || !invite.code) {
                throw new Error(invite?.error || 'Não foi possível gerar o código de convite.');
            }
            showChannelInviteCode(invite.code, group);
            const copied = await copyText(invite.code);
            showToast(
                copied
                    ? `Código ${invite.code} copiado para a área de transferência.`
                    : `Código do convite: ${invite.code}`,
                'success',
                copied ? 3600 : 6500
            );
        } catch (error) {
            console.warn('Código de convite não gerado:', error);
            showToast(error.message || 'Não foi possível gerar o código de convite.', 'error', 5200);
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = originalHtml;
            }
        }
    }

    function showChannelInviteCode(code, group) {
        if (!code) return;
        let panel = $('channelInviteCode');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'channelInviteCode';
            panel.className = 'group-invite-result channel-invite-code';
            const stats = $('channelMemberCount')?.closest('.channel-stats');
            if (stats) stats.insertAdjacentElement('afterend', panel);
            else $('channelDescription')?.insertAdjacentElement('afterend', panel);
        }
        const name = group?.name ? ` de ${escapeHtml(group.name)}` : '';
        panel.innerHTML = `<i class="fa-solid fa-key"></i><span>Código de convite${name}: <strong>${escapeHtml(code)}</strong></span><button type="button" id="copyChannelInviteCode">Copiar código</button>`;
        panel.hidden = false;
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        $('copyChannelInviteCode')?.addEventListener('click', async () => {
            const copied = await copyText(code);
            showToast(copied ? 'Código copiado.' : `Código: ${code}`, copied ? 'success' : 'info');
        });
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
            const input = $('groupInviteCode');
            const code = normalizeInviteCode(input?.value);
            if (!code) {
                showToast('Digite o código de 5 dígitos da comunidade.', 'warning');
                return;
            }
            if (input) input.value = code;
            const button = event.currentTarget.querySelector('button');
            if (button) button.disabled = true;
            try {
                const result = await redeemGroupInviteCode(code);
                if (!result.success) throw new Error(result.error);
                await getGroups();
                renderMyGroups();
                renderExploreGroups();
                if (input) input.value = '';
                showToast(`Você entrou em ${result.group_name || 'uma nova comunidade'}.`, 'success');
            } catch (error) {
                showToast(error.message || 'Não foi possível usar este convite.', 'error', isMissingRpcError(error) ? 8000 : 4800);
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

        // "Conversar com @fulano" chega com o id da PESSOA, sem o id da
        // conversa: ela ainda nao existe. Resolve (ou cria) e troca a URL
        // pelo id real, para o link continuar valendo e o voltar do
        // navegador se comportar. Vale tanto em conversas.html quanto em
        // chat.html, por isso fica aqui antes do desvio por pagina.
        const friendParam = pageUrl.searchParams.get('friend');
        if (friendParam && UUID_RE.test(friendParam) && !pageUrl.searchParams.get('id')) {
            await abrirConversaComPessoa(friendParam, pageUrl.searchParams.get('name'));
            return;
        }

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
