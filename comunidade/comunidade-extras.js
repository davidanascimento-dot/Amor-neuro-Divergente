/* ==========================================================================
   COMUNIDADE-EXTRAS.JS — Sidebar 2 puxa a nav original para dentro dela
   ========================================================================== */

(function() {
    'use strict';

    const CONFIG = {
        supabase: window.supabaseClient,
        avatarPadrao: '/img/foto-padrão.jpg',
        rightSidebarWidth: 340,
        innerSidebarExpanded: 240,
        innerSidebarCollapsed: 68,
        headerOffsetTop: 75
    };

    const STORAGE_KEY = 'communityInnerSidebarCollapsed';
    let currentUser = null;

    // =============================================
    // 1. MOVER A NAV ORIGINAL PARA DENTRO DA SIDEBAR 2
    // =============================================

    function buildCommunityInnerSidebar() {
        if (document.getElementById('communityInnerSidebar')) return;

        const mainContent = document.getElementById('mainContent') || document.querySelector('.main-content');
        if (!mainContent) {
            console.warn('⚠️ mainContent não encontrado');
            return;
        }

        // 🔥 PEGAR A NAV ORIGINAL ANTES QUE ELA SEJA REMOVIDA
        const originalNav = document.getElementById('mainTabs') || document.querySelector('.main-tabs');
        const originalNavHTML = originalNav ? originalNav.outerHTML : '';
        const originalNavParent = originalNav ? originalNav.parentNode : null;

        // Clonar os listeners: precisamos reatribuir após mover para sidebar
        // Vamos capturar os botões originais e cloná-los com seus dados
        let originalButtons = [];
        if (originalNav) {
            originalButtons = Array.from(originalNav.querySelectorAll('.main-tab')).map(btn => ({
                tab: btn.dataset.tab,
                html: btn.innerHTML,
                active: btn.classList.contains('active'),
                ariaControls: btn.getAttribute('aria-controls')
            }));
        }

        const savedCollapsed = localStorage.getItem(STORAGE_KEY) === 'true';

        // 🔥 SIDEBAR 2 COM OS BOTÕES DA NAV DENTRO
        const navButtonsHtml = originalButtons.map(btn => `
            <a href="#" class="community-inner-nav-item ${btn.active ? 'active' : ''}" 
               data-tab="${btn.tab}" title="${btn.tab}">
                ${btn.html}
            </a>
        `).join('');

        const sidebarHtml = `
            <aside class="community-inner-sidebar ${savedCollapsed ? 'collapsed' : ''}" id="communityInnerSidebar">
                <!-- Header da sidebar -->
                <div class="community-inner-header">
                    <button class="community-inner-toggle" id="communityInnerToggle" title="Recolher/Expandir menu">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                    <span class="community-inner-brand">Amor Neuro</span>
                </div>

                <!-- 🔥 NAVEGAÇÃO — puxada da nav original -->
                <nav class="community-inner-nav" id="communityInnerNav">
                    ${navButtonsHtml || `
                        <a href="#" class="community-inner-nav-item active" data-tab="forum" title="Fórum">
                            <i class="fa-regular fa-message"></i><span>Fórum</span>
                        </a>
                        <a href="#" class="community-inner-nav-item" data-tab="grupos" title="Grupos">
                            <i class="fa-solid fa-users"></i><span>Grupos</span>
                        </a>
                        <a href="#" class="community-inner-nav-item" data-tab="eventos" title="Eventos">
                            <i class="fa-regular fa-calendar"></i><span>Eventos</span>
                        </a>
                        <a href="#" class="community-inner-nav-item" data-tab="conversa" title="Conversas">
                            <i class="fa-regular fa-comment-dots"></i><span>Conversas</span>
                        </a>
                    `}
                    <!-- Itens extras fixos -->
                    <a href="#" class="community-inner-nav-item" id="communityCalendarBtn" title="Calendário">
                        <i class="fa-regular fa-calendar-check"></i><span>Calendário</span>
                    </a>
                    <a href="#" class="community-inner-nav-item" id="communityMembersBtn" title="Membros">
                        <i class="fa-regular fa-user"></i><span>Membros</span>
                    </a>
                    <a href="#" class="community-inner-nav-item" id="communityRankingBtn" title="Classificação">
                        <i class="fa-solid fa-trophy"></i><span>Classificação</span>
                    </a>
                    <a href="#" class="community-inner-nav-item" id="communityAboutBtn" title="Sobre">
                        <i class="fa-regular fa-circle-question"></i><span>Sobre</span>
                    </a>
                </nav>

                <!-- Seção GRUPOS -->
                <div class="community-inner-section">
                    <div class="community-inner-section-header">
                        <span>GRUPOS</span>
                        <button class="community-inner-section-btn" id="communityCreateGroupBtn" title="Criar grupo">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                    <div class="community-inner-group-list" id="communityInnerGroupList">
                        <div class="community-inner-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>
                    </div>
                </div>

                <!-- Seção MEMBROS -->
                <div class="community-inner-section">
                    <div class="community-inner-section-header">
                        <span>MEMBROS</span>
                    </div>
                    <div class="community-inner-member-list" id="communityInnerMemberList">
                        <div class="community-inner-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>
                    </div>
                </div>
            </aside>
        `;

        // Inserir no mainContent
        mainContent.insertAdjacentHTML('afterbegin', sidebarHtml);

        // 🔥 AGORA REMOVER A NAV ORIGINAL (já copiamos os botões)
        if (originalNav && originalNavParent) {
            originalNav.remove();
            console.log('🗑️ Nav de tabs original removida (botões copiados para sidebar 2)');
        }

        document.body.classList.toggle('community-inner-collapsed', savedCollapsed);
        document.body.classList.add('has-community-inner-sidebar');

        const innerSidebar = document.getElementById('communityInnerSidebar');
        const toggleBtn = document.getElementById('communityInnerToggle');

        // Toggle retrátil
        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const isCollapsed = innerSidebar.classList.toggle('collapsed');
            document.body.classList.toggle('community-inner-collapsed', isCollapsed);
            localStorage.setItem(STORAGE_KEY, isCollapsed.toString());
            console.log(`📂 Sidebar interna ${isCollapsed ? 'recolhida' : 'expandida'}`);
        });

        // 🔥 REATRIBUIR OS LISTENERS NOS BOTÕES DA SIDEBAR 2
        // Como estamos criando novos elementos HTML, precisamos re-adicionar os eventos
        document.querySelectorAll('.community-inner-nav-item[data-tab]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.dataset.tab;

                // Atualizar visualmente
                document.querySelectorAll('.community-inner-nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Sincronizar com os botões originais (se ainda existirem em algum lugar)
                const originalBtn = document.querySelector(`.main-tab[data-tab="${tab}"]`);
                if (originalBtn) {
                    originalBtn.classList.add('active');
                    originalBtn.click();
                } else if (typeof window.switchTab === 'function') {
                    // 🔥 Chamar diretamente o switchTab do comunidade.js
                    window.switchTab(tab);
                } else {
                    // Fallback: ativar apenas a tela
                    document.querySelectorAll('.tab-screen').forEach(s => s.classList.remove('active'));
                    const screen = document.getElementById(`screen-${tab}`);
                    if (screen) screen.classList.add('active');
                }

                console.log(`📂 Sidebar 2 → tab: ${tab}`);
            });
        });

        // Botão criar grupo
        document.getElementById('communityCreateGroupBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof window.openCreateGroupModal === 'function') window.openCreateGroupModal();
        });

        // Botões simples (placeholder)
        const simpleBtns = {
            communityCalendarBtn: '📅 Calendário em breve!',
            communityMembersBtn: '👥 Membros em breve!',
            communityRankingBtn: '🏆 Classificação em breve!',
            communityAboutBtn: 'ℹ️ Sobre em breve!'
        };
        Object.keys(simpleBtns).forEach(id => {
            document.getElementById(id)?.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof window.showToast === 'function') window.showToast(simpleBtns[id], 'info');
            });
        });

        console.log('✅ Sidebar 2 construída com botões da nav original');
    }

    // =============================================
    // 2. SIDEBAR DIREITA
    // =============================================

    function buildRightSidebar() {
        const existing = document.getElementById('communityRightSidebar');
        if (existing) existing.remove();

        const rightSidebar = document.createElement('aside');
        rightSidebar.id = 'communityRightSidebar';
        rightSidebar.className = 'community-right-sidebar';

        rightSidebar.innerHTML = `
            <div class="community-right-card">
                <div class="community-right-header">
                    <h3><i class="fa-regular fa-calendar"></i> Eventos</h3>
                    <a href="#" class="community-see-all" id="rightSeeAllEvents">Ver todos</a>
                </div>
                <div class="community-events-list" id="communityEventsList">
                    <div class="community-inner-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>
                </div>
            </div>

            <div class="community-right-card">
                <div class="community-right-header">
                    <h3><i class="fa-regular fa-comment-dots"></i> Conversas</h3>
                    <button class="community-btn-nova" id="rightNewConversation">Nova</button>
                </div>
                <div class="community-conversations-list" id="communityConversationsList">
                    <div class="community-inner-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>
                </div>
                <button class="community-btn-enter-chats" id="rightEnterChats">
                    <i class="fa-regular fa-comments"></i> Entrar nas Conversas
                </button>
            </div>
        `;

        document.body.appendChild(rightSidebar);

        // Listeners para os botões da sidebar direita
        const goToTab = (tab) => {
            const innerNavItem = document.querySelector(`.community-inner-nav-item[data-tab="${tab}"]`);
            if (innerNavItem) {
                innerNavItem.click();
            } else if (typeof window.switchTab === 'function') {
                window.switchTab(tab);
            }
        };

        document.getElementById('rightSeeAllEvents')?.addEventListener('click', (e) => {
            e.preventDefault();
            goToTab('eventos');
        });
        document.getElementById('rightNewConversation')?.addEventListener('click', () => goToTab('conversa'));
        document.getElementById('rightEnterChats')?.addEventListener('click', () => goToTab('conversa'));

        console.log('✅ Sidebar direita criada');
    }

    // =============================================
    // 3. CARREGAR GRUPOS REAIS
    // =============================================

    async function loadCommunityInnerGroups() {
        const list = document.getElementById('communityInnerGroupList');
        if (!list) return;

        try {
            const supabase = CONFIG.supabase;
            if (!supabase) throw new Error('Supabase indisponível');

            let { data: groups, error } = await supabase.rpc('get_user_groups');
            if (error || !groups) {
                const r = await supabase.from('groups')
                    .select('id, name, image_url, members')
                    .order('members', { ascending: false })
                    .limit(8);
                groups = r.data;
                error = r.error;
            }

            if (error) throw error;
            if (!groups || !groups.length) {
                list.innerHTML = `<div class="community-inner-empty"><i class="fa-regular fa-folder-open"></i><p>Nenhum grupo</p></div>`;
                return;
            }

            list.innerHTML = groups.slice(0, 8).map(g => {
                const bgColor = stringToColor(g.id || g.name);
                const initial = (g.name || 'G').charAt(0).toUpperCase();
                const hasImg = g.image_url && g.image_url !== '/img/grupo-padrao.png' && g.image_url !== 'null';

                return `
                    <div class="community-inner-group-item" data-group-id="${g.id}" title="${escapeHtml(g.name)}">
                        <div class="community-inner-group-avatar" style="background:${bgColor};">
                            ${hasImg
                                ? `<img src="${g.image_url}" alt="" onerror="this.outerHTML='<span style=\\'color:#fff;font-weight:700;font-size:13px;\\'>${initial}</span>'">`
                                : `<span style="color:#fff;font-weight:700;font-size:13px;">${initial}</span>`}
                        </div>
                        <div class="community-inner-group-info">
                            <span class="community-inner-group-name">${escapeHtml(g.name || 'Grupo')}</span>
                            <span class="community-inner-group-meta">${g.members || 0} membros</span>
                        </div>
                    </div>
                `;
            }).join('');

            list.querySelectorAll('.community-inner-group-item').forEach(item => {
                item.addEventListener('click', () => {
                    const groupId = item.dataset.groupId;
                    if (groupId) openGroupDetailsModal(groupId);
                });
            });
        } catch (err) {
            console.error('❌ Erro grupos:', err);
            list.innerHTML = `<div class="community-inner-empty"><i class="fa-solid fa-triangle-exclamation"></i></div>`;
        }
    }

    // =============================================
    // 4. CARREGAR MEMBROS REAIS
    // =============================================

    async function loadCommunityInnerMembers() {
        const list = document.getElementById('communityInnerMemberList');
        if (!list) return;

        try {
            const supabase = CONFIG.supabase;
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .order('created_at', { ascending: false })
                .limit(6);

            if (error) throw error;
            if (!profiles || !profiles.length) {
                list.innerHTML = `<div class="community-inner-empty"><i class="fa-regular fa-user"></i></div>`;
                return;
            }

                       list.innerHTML = profiles.map(p => {
                const bgColor = stringToColor(p.id);
                const hasImg = p.avatar_url && p.avatar_url !== CONFIG.avatarPadrao;

                return `
                    <div class="community-inner-member-item" data-user-id="${p.id}" title="${escapeHtml(p.username)}">
                        <div class="community-inner-member-avatar" style="background:${bgColor};">
                            <img src="${hasImg ? p.avatar_url : CONFIG.avatarPadrao}" 
                                 alt="${escapeHtml(p.username || 'Membro')}" 
                                 onerror="this.onerror=null; this.src='${CONFIG.avatarPadrao}'">
                        </div>
                        <div class="community-inner-member-info">
                            <span class="community-inner-member-name">${escapeHtml(p.username || 'Membro')}</span>
                            <span class="community-inner-member-role">Membro</span>
                        </div>
                    </div>
                `;
            }).join('');

            list.querySelectorAll('.community-inner-member-item').forEach(item => {
                item.addEventListener('click', () => {
                    const userId = item.dataset.userId;
                    if (userId) openUserProfileModal(userId);
                });
            });
        } catch (err) {
            console.error('❌ Erro membros:', err);
            list.innerHTML = `<div class="community-inner-empty"><i class="fa-solid fa-triangle-exclamation"></i></div>`;
        }
    }

    // =============================================
    // 5. CARREGAR EVENTOS REAIS
    // =============================================

    async function loadRealEvents() {
        const list = document.getElementById('communityEventsList');
        if (!list) return;

        try {
            const supabase = CONFIG.supabase;
            const { data: events, error } = await supabase
                .from('events')
                .select('*')
                .eq('is_active', true)
                .gte('date', new Date().toISOString())
                .order('date', { ascending: true })
                .limit(4);

            if (error) throw error;
            if (!events || !events.length) {
                list.innerHTML = `<div class="community-inner-empty"><i class="fa-regular fa-calendar"></i><p>Nenhum evento</p></div>`;
                return;
            }

            list.innerHTML = events.map((ev, index) => {
                const date = new Date(ev.date);
                const day = date.getDate().toString().padStart(2, '0');
                const month = date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
                const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const participants = ev.participants || 0;

                if (index === 0) {
                    const cover = ev.image_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=200&fit=crop';
                    return `
                        <div class="community-event-featured" data-event-id="${ev.id}">
                            <div class="community-event-cover">
                                <img src="${cover}" alt="" onerror="this.style.display='none';">
                                ${ev.is_live ? '<div class="community-event-live"><span class="community-live-dot"></span> Ao vivo</div>' : ''}
                            </div>
                            <div class="community-event-featured-body">
                                <h4>${escapeHtml(ev.title || 'Evento')}</h4>
                                <div class="community-event-meta">
                                    <span><i class="fa-regular fa-clock"></i> ${day}/${month} · ${time}</span>
                                </div>
                                <div class="community-event-attendees">
                                    <div class="community-attendees-avatars">
                                        <img src="${CONFIG.avatarPadrao}" alt="">
                                        <img src="${CONFIG.avatarPadrao}" alt="">
                                        <img src="${CONFIG.avatarPadrao}" alt="">
                                    </div>
                                    <span class="community-attendees-count">+${Math.max(0, participants - 3)}</span>
                                </div>
                                <button class="community-event-join-btn">
                                    <i class="fa-solid fa-video"></i> ${ev.link ? 'Entrar' : 'Ver detalhes'}
                                </button>
                            </div>
                        </div>
                    `;
                } else {
                    const mini = ev.image_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&h=100&fit=crop';
                    return `
                        <div class="community-event-mini" data-event-id="${ev.id}">
                            <div class="community-event-mini-cover">
                                <img src="${mini}" alt="" onerror="this.style.display='none';">
                            </div>
                            <div class="community-event-mini-info">
                                <h5>${escapeHtml(ev.title || 'Evento')}</h5>
                                <div class="community-event-mini-meta">
                                    <span><i class="fa-regular fa-calendar"></i> ${day}/${month} · ${time}</span>
                                    <span><i class="fa-regular fa-user"></i> ${participants}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }
            }).join('');

            list.querySelectorAll('[data-event-id]').forEach(item => {
                item.addEventListener('click', () => {
                    const eventId = item.dataset.eventId;
                    if (eventId) openEventDetailsModal(eventId);
                });
            });
        } catch (err) {
            console.error('❌ Erro eventos:', err);
            list.innerHTML = `<div class="community-inner-empty"><i class="fa-solid fa-triangle-exclamation"></i></div>`;
        }
    }

    // =============================================
    // 6. CARREGAR CONVERSAS REAIS
    // =============================================

    async function loadRealConversations() {
        const list = document.getElementById('communityConversationsList');
        if (!list) return;

        try {
            const supabase = CONFIG.supabase;
            let channels = [];
            try {
                const { data, error } = await supabase.rpc('get_user_chat_channels');
                if (!error && data) channels = data;
            } catch (e) {
                const { data } = await supabase.from('groups').select('id, name, members, image_url').limit(4);
                channels = data || [];
            }

            if (!channels || !channels.length) {
                list.innerHTML = `<div class="community-inner-empty"><i class="fa-regular fa-comment"></i><p>Nenhuma conversa</p></div>`;
                return;
            }

            list.innerHTML = channels.slice(0, 4).map(c => {
                const bgColor = stringToColor(c.id || c.name);
                const initial = (c.name || 'C').charAt(0).toUpperCase();
                const hasImg = c.image_url && c.image_url !== CONFIG.avatarPadrao;

                return `
                    <div class="community-conversation-item" data-conv-id="${c.id}">
                        <div class="community-conv-avatar-wrapper">
                            <div class="community-conv-avatar" style="background:${bgColor};">
                                ${hasImg
                                    ? `<img src="${c.image_url}" alt="" onerror="this.style.display='none';">`
                                    : `<span style="color:#fff;font-weight:700;font-size:12px;">${initial}</span>`}
                            </div>
                            <span class="community-conv-online"></span>
                        </div>
                        <div class="community-conv-info">
                            <span class="community-conv-name">${escapeHtml(c.name || 'Canal')}</span>
                            <span class="community-conv-preview">${c.members || 0} membros</span>
                        </div>
                        <span class="community-conv-time">Agora</span>
                    </div>
                `;
            }).join('');

            list.querySelectorAll('.community-conversation-item').forEach(item => {
                item.addEventListener('click', () => {
                    const convId = item.dataset.convId;
                    if (convId && typeof window.openGroupChat === 'function') {
                        window.openGroupChat(convId);
                    }
                });
            });
        } catch (err) {
            console.error('❌ Erro conversas:', err);
            list.innerHTML = `<div class="community-inner-empty"><i class="fa-solid fa-triangle-exclamation"></i></div>`;
        }
    }

    // =============================================
    // 7. MODAIS (Grupo, Usuário, Evento) — mesmo do anterior
    // =============================================

    function createGroupDetailsModal() {
        if (document.getElementById('groupDetailsModal')) return;

        document.body.insertAdjacentHTML('beforeend', `
            <div class="modal-overlay" id="groupDetailsModal" hidden>
                <div class="details-modal-container">
                    <div class="details-modal-banner" id="groupDetailsBanner">
                        <button class="details-modal-close" id="closeGroupDetailsModal">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div class="details-modal-header">
                        <div class="details-modal-avatar-wrapper">
                            <div class="details-modal-avatar" id="groupDetailsAvatar"><span>G</span></div>
                            <button class="details-modal-join-btn" id="groupDetailsJoinBtn">
                                <i class="fa-solid fa-plus"></i> Participar
                            </button>
                        </div>
                        <h2 class="details-modal-name" id="groupDetailsName">Grupo</h2>
                        <p class="details-modal-description" id="groupDetailsDescription">Descrição...</p>
                        <div class="details-modal-meta">
                            <span><i class="fa-solid fa-users"></i> <span id="groupDetailsMembers">0</span> membros</span>
                            <span class="details-modal-badge" id="groupDetailsPrivacy">
                                <i class="fa-solid fa-globe"></i> Público
                            </span>
                            <span class="details-modal-status">
                                <span class="details-live-dot"></span> Ativo agora
                            </span>
                        </div>
                    </div>
                    <div class="details-modal-tabs">
                        <button class="details-modal-tab active" data-tab="publicacoes">Publicações</button>
                        <button class="details-modal-tab" data-tab="membros">Membros</button>
                        <button class="details-modal-tab" data-tab="sobre">Sobre</button>
                    </div>
                    <div class="details-modal-content">
                        <div class="details-modal-tab-content active" id="groupTabPublicacoes">
                            <div class="community-inner-loading"><i class="fa-solid fa-spinner fa-spin"></i> Carregando...</div>
                        </div>
                        <div class="details-modal-tab-content" id="groupTabMembros">
                            <div class="community-inner-loading"><i class="fa-solid fa-spinner fa-spin"></i> Carregando...</div>
                        </div>
                        <div class="details-modal-tab-content" id="groupTabSobre">
                            <div class="community-inner-loading"><i class="fa-solid fa-spinner fa-spin"></i> Carregando...</div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        const modal = document.getElementById('groupDetailsModal');
        document.getElementById('closeGroupDetailsModal')?.addEventListener('click', () => modal?.setAttribute('hidden', ''));
        modal?.addEventListener('click', (e) => { if (e.target === modal) modal.setAttribute('hidden', ''); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal?.hasAttribute('hidden')) modal.setAttribute('hidden', '');
        });

        document.querySelectorAll('.details-modal-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.details-modal-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.details-modal-tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                const name = tab.dataset.tab;
                document.getElementById(`groupTab${name.charAt(0).toUpperCase() + name.slice(1)}`)?.classList.add('active');
            });
        });
    }

    async function openGroupDetailsModal(groupId) {
        if (!groupId) return;
        if (!document.getElementById('groupDetailsModal')) createGroupDetailsModal();

        const modal = document.getElementById('groupDetailsModal');
        const banner = document.getElementById('groupDetailsBanner');
        const avatarEl = document.getElementById('groupDetailsAvatar');
        const nameEl = document.getElementById('groupDetailsName');
        const descEl = document.getElementById('groupDetailsDescription');
        const membersEl = document.getElementById('groupDetailsMembers');
        const privacyEl = document.getElementById('groupDetailsPrivacy');
        const joinBtn = document.getElementById('groupDetailsJoinBtn');

        if (nameEl) nameEl.textContent = 'Carregando...';
        modal?.removeAttribute('hidden');

        try {
            const supabase = CONFIG.supabase;
            const { data: group, error } = await supabase.from('groups').select('*').eq('id', groupId).single();
            if (error || !group) throw new Error('Grupo não encontrado');

            const bgColor = stringToColor(group.id || group.name);
            if (banner) {
    if (group.image_url && group.image_url.trim() !== '' && group.image_url !== 'null') {
        banner.style.background = 'transparent';
        banner.style.backgroundImage = `url('${group.image_url}')`;
        banner.style.backgroundSize = 'cover';
        banner.style.backgroundPosition = 'center';
        banner.classList.add('visual-banner');
    } else {
        banner.style.background = 'var(--cx-bg-soft, #faf9f6)';
        banner.style.backgroundImage = 'none';
        banner.classList.remove('visual-banner');
    }
}
                              if (avatarEl) {
                // 🔥 Usar group.image_url (não profile!)
                avatarEl.style.background = 'transparent';
                
                const groupAvatarUrl = group.image_url && 
                                       group.image_url !== '/img/grupo-padrao.png' &&
                                       group.image_url.trim() !== '' &&
                                       group.image_url !== 'null';
                
                const avatarSrc = groupAvatarUrl ? group.image_url : CONFIG.avatarPadrao;
                const groupName = group.name || 'Grupo';
                
                avatarEl.innerHTML = `<img src="${avatarSrc}" 
                    alt="${escapeHtml(groupName)}" 
                    style="width:100%;height:100%;object-fit:cover;display:block;border-radius:50%;"
                    onerror="this.onerror=null; this.src='${CONFIG.avatarPadrao}'">`;
            }

            if (nameEl) nameEl.textContent = group.name || 'Grupo';
            if (descEl) descEl.textContent = group.description || 'Sem descrição';
            if (membersEl) membersEl.textContent = group.members || 0;

            if (privacyEl) {
                privacyEl.innerHTML = group.is_private
                    ? '<i class="fa-solid fa-lock"></i> Privado'
                    : '<i class="fa-solid fa-globe"></i> Público';
            }

            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;

            let isMember = false;
            if (userId) {
                const { data: m } = await supabase.from('group_members').select('id').eq('group_id', groupId).eq('user_id', userId).maybeSingle();
                isMember = !!m;
            }

            if (joinBtn) {
                if (isMember) {
                    joinBtn.innerHTML = '<i class="fa-solid fa-check"></i> Membro';
                    joinBtn.style.background = '#10b981';
                    joinBtn.onclick = () => {
                        if (typeof window.openGroupChat === 'function') {
                            window.openGroupChat(groupId);
                            modal?.setAttribute('hidden', '');
                        }
                    };
                } else if (group.is_private) {
                    joinBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Privado';
                    joinBtn.style.background = '#94a3b8';
                    joinBtn.disabled = true;
                } else {
                    joinBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Participar';
                    joinBtn.style.background = '';
                    joinBtn.disabled = false;
                    joinBtn.onclick = async () => {
                        if (typeof window.joinGroup === 'function') {
                            await window.joinGroup(groupId);
                            openGroupDetailsModal(groupId);
                        }
                    };
                }
            }

            loadGroupPosts(groupId);
            loadGroupMembers(groupId, group);
        } catch (err) {
            console.error('❌ Erro:', err);
            if (nameEl) nameEl.textContent = 'Erro';
        }
    }

    async function loadGroupPosts(groupId) {
        const container = document.getElementById('groupTabPublicacoes');
        if (!container) return;

        try {
            const supabase = CONFIG.supabase;
            const { data: posts, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(5);
            if (error) throw error;

            if (!posts || !posts.length) {
                container.innerHTML = `<div class="details-empty"><i class="fa-regular fa-file-lines"></i><p>Nenhuma publicação ainda</p></div>`;
                return;
            }

            container.innerHTML = posts.map(p => {
                const initial = (p.author_name || 'U').charAt(0).toUpperCase();
                const avatarColor = stringToColor(p.author_id || p.id);
                const authorAvatar = p.author_avatar || CONFIG.avatarPadrao;

                return `
                    <div class="details-post-item">
                        <div class="details-post-header">
                            <div class="details-post-avatar" style="background:${avatarColor};">
                                <img src="${authorAvatar}" alt="" onerror="this.outerHTML='<span style=\\'color:#fff;font-weight:700;\\'>${initial}</span>'">
                            </div>
                            <div class="details-post-author">
                                <span>${escapeHtml(p.author_name || 'Usuário')}</span>
                                <small>Há ${formatTimeAgo(p.created_at)}</small>
                            </div>
                        </div>
                        <h4 class="details-post-title">${escapeHtml((p.content || '').substring(0, 80))}</h4>
                        <p class="details-post-text">${escapeHtml((p.content || '').substring(0, 200))}</p>
                        <div class="details-post-meta">
                            <span><i class="fa-regular fa-heart"></i> ${p.likes || 0}</span>
                            <span><i class="fa-regular fa-comment"></i> ${p.comment_count || 0}</span>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            container.innerHTML = `<div class="details-empty"><i class="fa-solid fa-triangle-exclamation"></i><p>Erro</p></div>`;
        }
    }

    async function loadGroupMembers(groupId, group) {
        const container = document.getElementById('groupTabMembros');
        const aboutContainer = document.getElementById('groupTabSobre');
        if (!container) return;

        try {
            const supabase = CONFIG.supabase;
            const { data: members, error } = await supabase
                .from('group_members')
                .select('user_id, joined_at, profiles:user_id(id, username, avatar_url)')
                .eq('group_id', groupId)
                .limit(20);

            if (error) throw error;

            if (aboutContainer) {
                aboutContainer.innerHTML = `
                    <div class="details-about">
                        <h4>Sobre este grupo</h4>
                        <p>${escapeHtml(group.description || 'Sem descrição')}</p>
                        <div class="details-about-meta">
                            <div><strong>Categoria:</strong> ${escapeHtml(group.category || 'Geral')}</div>
                            <div><strong>Criado em:</strong> ${group.created_at ? new Date(group.created_at).toLocaleDateString('pt-BR') : '-'}</div>
                            <div><strong>Membros:</strong> ${group.members || 0}</div>
                            <div><strong>Privacidade:</strong> ${group.is_private ? 'Privado' : 'Público'}</div>
                        </div>
                    </div>
                `;
            }

            if (!members || !members.length) {
                container.innerHTML = `<div class="details-empty"><i class="fa-regular fa-user"></i><p>Nenhum membro ainda</p></div>`;
                return;
            }

                    container.innerHTML = members.map(m => {
                const profile = m.profiles || {};
                const bgColor = stringToColor(m.user_id);
                const hasImg = profile.avatar_url && profile.avatar_url !== CONFIG.avatarPadrao;

                return `
                    <div class="details-member-item" data-user-id="${m.user_id}">
                        <div class="details-member-avatar" style="background:${bgColor};">
                            <img src="${hasImg ? profile.avatar_url : CONFIG.avatarPadrao}" 
                                 alt="${escapeHtml(profile.username || 'Membro')}" 
                                 onerror="this.onerror=null; this.src='${CONFIG.avatarPadrao}'">
                        </div>
                        <div class="details-member-info">
                            <span class="details-member-name">${escapeHtml(profile.username || 'Membro')}</span>
                            <span class="details-member-role">Membro</span>
                        </div>
                    </div>
                `;
            }).join('');

            container.querySelectorAll('.details-member-item').forEach(item => {
                item.addEventListener('click', () => {
                    const uid = item.dataset.userId;
                    if (uid) openUserProfileModal(uid);
                });
            });
        } catch (err) {
            container.innerHTML = `<div class="details-empty"><i class="fa-solid fa-triangle-exclamation"></i><p>Erro</p></div>`;
        }
    }

    // MODAL DE PERFIL DE USUÁRIO
    function createUserProfileModal() {
        if (document.getElementById('userProfileDetailsModal')) return;

        document.body.insertAdjacentHTML('beforeend', `
            <div class="modal-overlay" id="userProfileDetailsModal" hidden>
                <div class="details-modal-container" style="max-width:520px;">
                    <div class="details-modal-banner" id="userProfileBanner">
                        <button class="details-modal-close" id="closeUserProfileModal">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div class="details-modal-header" style="text-align:center;">
                        <div class="details-modal-avatar-wrapper" style="justify-content:center;">
                            <div class="details-modal-avatar" id="userProfileAvatar"><span>U</span></div>
                        </div>
                        <h2 class="details-modal-name" id="userProfileName">Nome</h2>
                        <p class="details-modal-description" id="userProfileHandle">@usuario</p>
                        <p class="details-modal-description" id="userProfileBio" style="margin-top:-6px;">
                            Membro da comunidade Amor NeuroDivergente.
                        </p>
                        <div class="user-profile-stats">
                            <div class="user-profile-stat">
                                <strong id="userProfilePostsCount">0</strong>
                                <span>Posts</span>
                            </div>
                            <div class="user-profile-stat">
                                <strong id="userProfileCommentsCount">0</strong>
                                <span>Comentários</span>
                            </div>
                            <div class="user-profile-stat">
                                <strong id="userProfileFriendsCount">0</strong>
                                <span>Amigos</span>
                            </div>
                        </div>
                    </div>
                    <div class="details-modal-content" style="padding-top:12px;">
                        <div class="user-profile-actions">
                            <button class="user-profile-btn user-profile-btn-chat" id="userProfileChatBtn">
                                <i class="fa-regular fa-comment-dots"></i> Conversar
                            </button>
                            <button class="user-profile-btn user-profile-btn-add" id="userProfileAddFriendBtn">
                                <i class="fa-solid fa-user-plus"></i> Adicionar amigo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);

        const modal = document.getElementById('userProfileDetailsModal');
        document.getElementById('closeUserProfileModal')?.addEventListener('click', () => modal?.setAttribute('hidden', ''));
        modal?.addEventListener('click', (e) => { if (e.target === modal) modal.setAttribute('hidden', ''); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal?.hasAttribute('hidden')) modal.setAttribute('hidden', '');
        });
    }

    async function openUserProfileModal(userId) {
        if (!userId) return;
        if (!document.getElementById('userProfileDetailsModal')) createUserProfileModal();

        const modal = document.getElementById('userProfileDetailsModal');
        const banner = document.getElementById('userProfileBanner');
        const avatarEl = document.getElementById('userProfileAvatar');
        const nameEl = document.getElementById('userProfileName');
        const handleEl = document.getElementById('userProfileHandle');
        const postsEl = document.getElementById('userProfilePostsCount');
        const commentsEl = document.getElementById('userProfileCommentsCount');
        const friendsEl = document.getElementById('userProfileFriendsCount');
        const chatBtn = document.getElementById('userProfileChatBtn');
        const addBtn = document.getElementById('userProfileAddFriendBtn');

        if (nameEl) nameEl.textContent = 'Carregando...';
        modal?.removeAttribute('hidden');

        try {
            const supabase = CONFIG.supabase;
            const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (error || !profile) throw new Error('Perfil não encontrado');

            const username = profile.username || 'Usuário';
            const bgColor = stringToColor(userId);

          if (banner) {
    banner.style.background = 'var(--cx-bg-soft, #faf9f6)';
    banner.style.backgroundImage = 'none';
}

            if (avatarEl) {
                avatarEl.style.background = bgColor;
                if (profile.avatar_url && profile.avatar_url !== CONFIG.avatarPadrao) {
                    avatarEl.innerHTML = `<img src="${profile.avatar_url}" alt="">`;
                } else {
                    avatarEl.innerHTML = `<span>${username.charAt(0).toUpperCase()}</span>`;
                }
            }

            if (nameEl) nameEl.textContent = username;
            if (handleEl) handleEl.textContent = '@' + username.toLowerCase().replace(/\s+/g, '');

            const [postsRes, commentsRes, friendsRes] = await Promise.all([
                supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', userId),
                supabase.from('comments').select('*', { count: 'exact', head: true }).eq('author_id', userId),
                supabase.from('friendships').select('*', { count: 'exact', head: true }).eq('status', 'accepted').or(`user_id1.eq.${userId},user_id2.eq.${userId}`)
            ]);

            if (postsEl) postsEl.textContent = postsRes.count || 0;
            if (commentsEl) commentsEl.textContent = commentsRes.count || 0;
            if (friendsEl) friendsEl.textContent = friendsRes.count || 0;

            const { data: { session } } = await supabase.auth.getSession();
            const myId = session?.user?.id;

            if (myId === userId) {
                if (addBtn) addBtn.style.display = 'none';
                if (chatBtn) chatBtn.style.display = 'none';
            } else {
                if (chatBtn) {
                    chatBtn.style.display = 'flex';
                    chatBtn.onclick = () => {
                        modal?.setAttribute('hidden', '');
                        if (typeof window.openFriendChat === 'function') {
                            window.openFriendChat(null, username, userId);
                        }
                    };
                }
                if (addBtn) {
                    addBtn.style.display = 'flex';
                    addBtn.onclick = async () => {
                        if (typeof window.sendFriendRequest === 'function') {
                            await window.sendFriendRequest(userId);
                            addBtn.innerHTML = '<i class="fa-solid fa-clock"></i> Pendente';
                            addBtn.style.opacity = '0.6';
                            addBtn.disabled = true;
                        }
                    };
                }
            }
        } catch (err) {
            if (nameEl) nameEl.textContent = 'Erro';
        }
    }

    // MODAL DE EVENTO
    function createEventDetailsModal() {
        if (document.getElementById('eventDetailsModal')) return;

        document.body.insertAdjacentHTML('beforeend', `
            <div class="modal-overlay" id="eventDetailsModal" hidden>
                <div class="details-modal-container" style="max-width:560px;">
                    <div class="details-modal-banner" id="eventDetailsBanner">
                        <button class="details-modal-close" id="closeEventDetailsModal">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div class="details-modal-header" style="margin-top:-30px;">
                        <h2 class="details-modal-name" id="eventDetailsTitle">Evento</h2>
                        <p class="details-modal-description" id="eventDetailsDescription">Descrição...</p>
                        <div class="details-modal-meta">
                            <span><i class="fa-regular fa-calendar"></i> <span id="eventDetailsDate">-</span></span>
                            <span><i class="fa-regular fa-clock"></i> <span id="eventDetailsTime">-</span></span>
                            <span><i class="fa-regular fa-user"></i> <span id="eventDetailsParticipants">0</span> participantes</span>
                        </div>
                    </div>
                    <div class="details-modal-content" style="padding-top:12px;">
                        <div class="user-profile-actions">
                            <button class="user-profile-btn user-profile-btn-chat" id="eventJoinBtn">
                                <i class="fa-solid fa-calendar-check"></i> Participar
                            </button>
                            <button class="user-profile-btn user-profile-btn-add" id="eventCloseBtn">
                                <i class="fa-solid fa-xmark"></i> Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);

        const modal = document.getElementById('eventDetailsModal');
        document.getElementById('closeEventDetailsModal')?.addEventListener('click', () => modal?.setAttribute('hidden', ''));
        document.getElementById('eventCloseBtn')?.addEventListener('click', () => modal?.setAttribute('hidden', ''));
        modal?.addEventListener('click', (e) => { if (e.target === modal) modal.setAttribute('hidden', ''); });
    }

      async function openEventDetailsModal(eventId) {
        if (!eventId) return;
        if (!document.getElementById('eventDetailsModal')) createEventDetailsModal();

        const modal = document.getElementById('eventDetailsModal');
        const banner = document.getElementById('eventDetailsBanner');
        const titleEl = document.getElementById('eventDetailsTitle');
        const descEl = document.getElementById('eventDetailsDescription');
        const dateEl = document.getElementById('eventDetailsDate');
        const timeEl = document.getElementById('eventDetailsTime');
        const partEl = document.getElementById('eventDetailsParticipants');
        const joinBtn = document.getElementById('eventJoinBtn');

        if (titleEl) titleEl.textContent = 'Carregando...';
        modal?.removeAttribute('hidden');

        try {
            const supabase = CONFIG.supabase;
            const { data: ev, error } = await supabase
                .from('events')
                .select('*')
                .eq('id', eventId)
                .single();

            if (error || !ev) throw new Error('Evento não encontrado');

            const date = new Date(ev.date);
            const bgColor = stringToColor(ev.id);
if (banner) {
    if (ev.image_url && ev.image_url.trim() !== '' && ev.image_url !== 'null') {
        banner.style.background = 'transparent';
        banner.style.backgroundImage = `url('${ev.image_url}')`;
        banner.style.backgroundSize = 'cover';
        banner.style.backgroundPosition = 'center';
        banner.classList.add('visual-banner');
    } else {
        banner.style.background = 'var(--cx-bg-soft, #faf9f6)';
        banner.style.backgroundImage = 'none';
        banner.classList.remove('visual-banner');
    }
}

            if (titleEl) titleEl.textContent = ev.title || 'Evento';
            if (descEl) descEl.textContent = ev.description || 'Sem descrição';
            if (dateEl) dateEl.textContent = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
            if (timeEl) timeEl.textContent = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            if (partEl) partEl.textContent = ev.participants || 0;

            // ============================================
            // 🔥 ADICIONAR BOTÃO "ENTRAR NO MEET"
            // ============================================
            const meetLink = ev.link &&
                ev.link.trim() !== '' &&
                ev.link !== 'null' &&
                ev.link !== 'undefined' &&
                ev.link.startsWith('http');

            console.log('🎥 Link do evento:', ev.link, '| Válido?', meetLink);

            const actionsArea = modal?.querySelector('.user-profile-actions');

            // Remover botão antigo se existir
            actionsArea?.querySelector('.meet-join-btn')?.remove();

            if (meetLink && actionsArea) {
                const meetBtn = document.createElement('button');
                meetBtn.className = 'user-profile-btn meet-join-btn';
                meetBtn.style.cssText = `
                    flex: 1;
                    min-width: 140px;
                    padding: 12px 20px;
                    border-radius: 30px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s;
                    font-family: 'Inter', sans-serif;
                    border: none;
                    background: linear-gradient(135deg, #10b981, #34d399);
                    color: #fff;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                `;
                meetBtn.innerHTML = '<i class="fa-solid fa-video"></i> Entrar no Meet';

                meetBtn.addEventListener('click', () => {
                    console.log('🎥 Abrindo Meet pelo modal:', ev.link);
                    const w = window.open(ev.link, '_blank', 'noopener,noreferrer');
                    if (!w || w.closed) {
                        if (typeof window.showToast === 'function') {
                            window.showToast('⚠️ Popup bloqueado! Link: ' + ev.link, 'warning', 6000);
                        }
                    } else {
                        if (typeof window.showToast === 'function') {
                            window.showToast('🎥 Abrindo videoconferência...', 'success', 2000);
                        }
                    }
                });

                meetBtn.addEventListener('mouseenter', () => {
                    meetBtn.style.transform = 'scale(1.02)';
                });
                meetBtn.addEventListener('mouseleave', () => {
                    meetBtn.style.transform = 'scale(1)';
                });

                actionsArea.insertBefore(meetBtn, actionsArea.firstChild);
            } else if (actionsArea) {
                // Se não tem link, mostra um aviso discreto
                const existingNotice = actionsArea.querySelector('.no-meet-notice');
                if (!existingNotice) {
                    const notice = document.createElement('div');
                    notice.className = 'no-meet-notice';
                    notice.style.cssText = `
                        width: 100%;
                        padding: 10px 14px;
                        margin-bottom: 10px;
                        background: rgba(251, 191, 36, 0.1);
                        border-radius: 10px;
                        border-left: 4px solid #f59e0b;
                        font-size: 12px;
                        color: #92400e;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    `;
                    notice.innerHTML = '<i class="fa-solid fa-info-circle"></i> Este evento não tem link de videoconferência cadastrado.';
                    actionsArea.insertBefore(notice, actionsArea.firstChild);
                }
            }

            // ============================================
            // BOTÃO "PARTICIPAR" (confirma presença)
            // ============================================
            if (joinBtn) {
                // Verificar estado inicial
                if (currentUser?.id) {
                    (async () => {
                        try {
                            const { data: existing } = await supabase
                                .from('event_participants')
                                .select('id')
                                .eq('event_id', eventId)
                                .eq('user_id', currentUser.id)
                                .maybeSingle();

                            if (existing) {
                                joinBtn.innerHTML = '<i class="fa-solid fa-check"></i> Confirmado';
                                joinBtn.style.background = '#10b981';
                            } else {
                                joinBtn.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Participar';
                                joinBtn.style.background = '';
                            }
                        } catch (e) {
                            console.warn('Erro ao verificar presença:', e);
                        }
                    })();
                }

                joinBtn.onclick = async () => {
                    if (!currentUser) {
                        if (typeof window.showToast === 'function') window.showToast('Faça login para participar', 'error');
                        return;
                    }

                    const userId = currentUser.id;
                    joinBtn.disabled = true;
                    const originalHTML = joinBtn.innerHTML;
                    joinBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

                    try {
                        const { data: existing } = await supabase
                            .from('event_participants')
                            .select('id')
                            .eq('event_id', eventId)
                            .eq('user_id', userId)
                            .maybeSingle();

                        if (existing) {
                            // Cancelar
                            await supabase
                                .from('event_participants')
                                .delete()
                                .eq('event_id', eventId)
                                .eq('user_id', userId);

                            if (typeof window.showToast === 'function') window.showToast('Presença cancelada', 'info');
                            joinBtn.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Participar';
                            joinBtn.style.background = '';
                        } else {
                            // Confirmar
                            const { error } = await supabase
                                .from('event_participants')
                                .insert({ event_id: eventId, user_id: userId });

                            if (error && error.code !== '23505' && error.status !== 409) {
                                throw error;
                            }

                            if (typeof window.showToast === 'function') window.showToast('Presença confirmada! 🎉', 'success');
                            joinBtn.innerHTML = '<i class="fa-solid fa-check"></i> Confirmado';
                            joinBtn.style.background = '#10b981';
                        }
                    } catch (err) {
                        console.error('Erro:', err);
                        if (err.code === '23505' || err.status === 409) {
                            if (typeof window.showToast === 'function') window.showToast('Você já confirmou presença! ✅', 'info');
                            joinBtn.innerHTML = '<i class="fa-solid fa-check"></i> Confirmado';
                            joinBtn.style.background = '#10b981';
                        } else {
                            if (typeof window.showToast === 'function') window.showToast('Erro: ' + (err.message || 'Tente novamente'), 'error');
                            joinBtn.innerHTML = originalHTML;
                        }
                    } finally {
                        joinBtn.disabled = false;
                    }
                };
            }

            console.log('✅ Modal do evento aberto:', ev.title);

        } catch (err) {
            console.error('❌ Erro ao abrir modal do evento:', err);
            if (titleEl) titleEl.textContent = 'Erro ao carregar evento';
        }
    }
    // =============================================
    // AUXILIARES
    // =============================================

    function escapeHtml(text) {
        if (!text) return '';
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    function stringToColor(str) {
        if (!str) return '#8b5cf6';
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#14b8a6'];
        return colors[Math.abs(hash) % colors.length];
    }

    function formatTimeAgo(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const diff = Math.floor((new Date() - date) / 1000);
        if (diff < 60) return 'Agora';
        if (diff < 3600) return Math.floor(diff / 60) + ' min';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h';
        if (diff < 604800) return Math.floor(diff / 86400) + 'd';
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }

    // =============================================
    // ESTILOS
    // =============================================

function injectStyles() {
    if (document.getElementById('communityExtrasStyles')) return;

    const styles = document.createElement('style');
    styles.id = 'communityExtrasStyles';
    styles.textContent = `
        /* ============================================================
           PALETA — clean, dourada, editorial
           ============================================================ */
        :root {
            --cx-bg: #ffffff;
            --cx-bg-soft: #faf9f6;
            --cx-bg-hover: #f5f3ee;
            --cx-border: #e8e3dd;
            --cx-border-soft: #f0ece6;
            --cx-text: #1a1a2e;
            --cx-text-soft: #5c5652;
            --cx-muted: #8a827c;
            --cx-gold: #b8935a;
            --cx-gold-soft: #d4b483;
            --cx-gold-bg: #faf6ef;
            --cx-radius: 6px;
            --cx-radius-sm: 4px;
        }

        /* ============================================================
           BASE
           ============================================================ */
        body.has-community-inner-sidebar .main-content,
        body.has-community-inner-sidebar #mainContent {
            padding-left: ${CONFIG.innerSidebarExpanded}px !important;
            transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        body.has-community-inner-sidebar.community-inner-collapsed .main-content,
        body.has-community-inner-sidebar.community-inner-collapsed #mainContent {
            padding-left: ${CONFIG.innerSidebarCollapsed}px !important;
        }
        @media (min-width: 1201px) {
            body.has-community-inner-sidebar .main-content,
            body.has-community-inner-sidebar #mainContent {
                padding-right: ${CONFIG.rightSidebarWidth}px !important;
            }
        }

        /* ============================================================
           SIDEBAR ESQUERDA
           ============================================================ */
        .community-inner-sidebar {
            position: fixed;
            top: ${CONFIG.headerOffsetTop}px;
            left: 0;
            width: ${CONFIG.innerSidebarExpanded}px;
            height: calc(100vh - ${CONFIG.headerOffsetTop}px);
            background: var(--cx-bg);
            border-right: 1px solid var(--cx-border);
            z-index: 95;
            overflow-y: auto;
            overflow-x: hidden;
            display: flex;
            flex-direction: column;
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: 'Inter', sans-serif;
        }
        .community-inner-sidebar.collapsed { width: ${CONFIG.innerSidebarCollapsed}px; }
        .community-inner-sidebar::-webkit-scrollbar { width: 5px; }
        .community-inner-sidebar::-webkit-scrollbar-thumb {
            background: var(--cx-border); border-radius: 10px;
        }

        .community-inner-header {
            display: flex; align-items: center; gap: 12px;
            padding: 16px 14px;
            border-bottom: 1px solid var(--cx-border);
            position: sticky; top: 0; background: var(--cx-bg); z-index: 5;
            min-height: 60px; flex-shrink: 0;
        }
        .community-inner-toggle {
            width: 34px; height: 34px; border-radius: var(--cx-radius-sm);
            border: 1px solid var(--cx-border);
            background: var(--cx-bg); color: var(--cx-text-soft);
            font-size: 15px; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: background 0.15s, color 0.15s, border-color 0.15s;
            flex-shrink: 0;
        }
        .community-inner-toggle:hover {
            background: var(--cx-gold-bg);
            color: var(--cx-gold);
            border-color: var(--cx-gold-soft);
        }

        .community-inner-brand {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 15px; font-weight: 700;
            color: var(--cx-text);
            white-space: nowrap; overflow: hidden;
            opacity: 1; transition: opacity 0.2s;
            letter-spacing: -0.01em;
        }
        .community-inner-sidebar.collapsed .community-inner-brand {
            opacity: 0; width: 0; pointer-events: none;
        }

        .community-inner-nav {
            display: flex; flex-direction: column;
            padding: 12px 10px 8px; gap: 2px; flex-shrink: 0;
        }
        .community-inner-nav-item {
            display: flex; align-items: center; gap: 14px;
            padding: 10px 14px; border-radius: var(--cx-radius);
            color: var(--cx-text-soft); text-decoration: none;
            font-size: 14px; font-weight: 500;
            transition: background 0.15s, color 0.15s;
            cursor: pointer; overflow: hidden;
        }
        .community-inner-nav-item i {
            font-size: 16px; width: 20px; text-align: center;
            color: var(--cx-muted); flex-shrink: 0;
        }
        .community-inner-nav-item span,
        .community-inner-nav-item .tab-badge {
            white-space: nowrap; opacity: 1; transition: opacity 0.2s;
        }
        .community-inner-sidebar.collapsed .community-inner-nav-item span,
        .community-inner-sidebar.collapsed .community-inner-nav-item .tab-badge {
            opacity: 0; width: 0; pointer-events: none;
        }
        .community-inner-sidebar.collapsed .community-inner-nav-item {
            justify-content: center; padding: 10px 0;
        }
        .community-inner-nav-item:hover {
            background: var(--cx-bg-hover); color: var(--cx-text);
        }
        .community-inner-nav-item:hover i { color: var(--cx-gold); }
        .community-inner-nav-item.active {
            background: var(--cx-gold-bg);
            color: var(--cx-text);
            font-weight: 700;
        }
        .community-inner-nav-item.active i { color: var(--cx-gold); }

        .community-inner-nav-item .tab-badge {
            background: var(--cx-bg-hover);
            color: var(--cx-text-soft);
            padding: 2px 8px; border-radius: 12px;
            font-size: 11px; font-weight: 700;
            margin-left: auto;
        }
        .community-inner-nav-item.active .tab-badge {
            background: rgba(184, 147, 90, 0.15);
            color: var(--cx-gold);
        }

        .community-inner-section {
            padding: 12px 10px;
            border-top: 1px solid var(--cx-border-soft);
            flex-shrink: 0;
        }
        .community-inner-section-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 6px 8px; margin-bottom: 6px;
            font-size: 11px; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.08em; color: var(--cx-muted); min-height: 20px;
        }
        .community-inner-section-header span {
            white-space: nowrap; opacity: 1; transition: opacity 0.2s;
        }
        .community-inner-sidebar.collapsed .community-inner-section-header span {
            opacity: 0; width: 0; pointer-events: none;
        }
        .community-inner-sidebar.collapsed .community-inner-section-header {
            justify-content: center;
        }
        .community-inner-section-btn {
            display: flex; align-items: center; justify-content: center;
            width: 22px; height: 22px; padding: 0;
            border: 1px solid var(--cx-border);
            border-radius: 50%;
            background: transparent;
            color: var(--cx-gold); font-size: 10px; cursor: pointer;
            transition: background 0.15s, border-color 0.15s;
            flex-shrink: 0;
        }
        .community-inner-section-btn:hover {
            background: var(--cx-gold-bg);
            border-color: var(--cx-gold-soft);
        }

        .community-inner-group-list,
        .community-inner-member-list {
            display: flex; flex-direction: column; gap: 2px;
        }
        .community-inner-group-item,
        .community-inner-member-item {
            display: flex; align-items: center; gap: 10px;
            padding: 8px 10px; border-radius: var(--cx-radius);
            transition: background 0.15s; cursor: pointer; overflow: hidden;
        }
        .community-inner-group-item:hover,
        .community-inner-member-item:hover { background: var(--cx-bg-hover); }
        .community-inner-sidebar.collapsed .community-inner-group-item,
        .community-inner-sidebar.collapsed .community-inner-member-item {
            justify-content: center; padding: 8px 0;
        }
        .community-inner-group-avatar,
        .community-inner-member-avatar {
            width: 32px; height: 32px; border-radius: var(--cx-radius-sm);
            overflow: hidden;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        .community-inner-member-avatar { border-radius: 50%; }
        .community-inner-group-avatar img,
        .community-inner-member-avatar img {
            width: 100%; height: 100%; object-fit: cover;
        }
        .community-inner-group-info,
        .community-inner-member-info {
            display: flex; flex-direction: column; min-width: 0; flex: 1;
            opacity: 1; transition: opacity 0.2s;
        }
        .community-inner-sidebar.collapsed .community-inner-group-info,
        .community-inner-sidebar.collapsed .community-inner-member-info {
            opacity: 0; width: 0; pointer-events: none; display: none;
        }
        .community-inner-group-name,
        .community-inner-member-name {
            font-size: 13px; font-weight: 600; color: var(--cx-text);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .community-inner-group-meta,
        .community-inner-member-role { font-size: 11px; color: var(--cx-muted); }

        .community-inner-loading,
        .community-inner-empty {
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            padding: 16px 10px; color: var(--cx-muted);
            font-size: 12px; gap: 6px; text-align: center;
        }
        .community-inner-loading i,
        .community-inner-empty i { font-size: 16px; opacity: 0.5; }

        /* ============================================================
           SIDEBAR DIREITA — cards empilhados como na imagem
           ============================================================ */
        .community-right-sidebar {
            position: fixed; top: ${CONFIG.headerOffsetTop}px; right: 16px;
            width: 320px;
            max-height: calc(100vh - ${CONFIG.headerOffsetTop + 20}px);
            overflow-y: auto; padding: 0; z-index: 90;
            display: flex; flex-direction: column; gap: 14px;
        }
        .community-right-sidebar::-webkit-scrollbar { width: 5px; }
        .community-right-sidebar::-webkit-scrollbar-thumb {
            background: var(--cx-border); border-radius: 10px;
        }

        .community-right-card {
            background: var(--cx-bg);
            border: 1px solid var(--cx-border);
            border-radius: var(--cx-radius);
            padding: 0;
            overflow: hidden;
        }

        .community-right-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 16px 18px;
            border-bottom: 1px solid var(--cx-border-soft);
        }
        .community-right-header h3 {
            font-family: 'Inter', sans-serif;
            font-size: 13px; font-weight: 700;
            color: var(--cx-text);
            margin: 0;
            display: flex; align-items: center; gap: 8px;
            letter-spacing: 0.02em;
            text-transform: uppercase;
        }
        .community-right-header h3 i {
            color: var(--cx-gold); font-size: 13px;
        }
        .community-see-all {
            font-size: 12px; color: var(--cx-muted);
            text-decoration: none; font-weight: 500;
            cursor: pointer;
            transition: color 0.15s;
        }
        .community-see-all:hover {
            color: var(--cx-gold);
        }
        .community-btn-nova {
            padding: 4px 12px;
            border: 1px solid var(--cx-border);
            border-radius: 20px;
            background: transparent;
            color: var(--cx-text-soft);
            font-size: 11px; font-weight: 600;
            cursor: pointer;
            transition: all 0.15s;
        }
        .community-btn-nova:hover {
            border-color: var(--cx-gold-soft);
            color: var(--cx-gold);
            background: var(--cx-gold-bg);
        }

        /* ============================================================
           EVENTOS — estilo card limpo
           ============================================================ */
        .community-event-featured {
            border-bottom: 1px solid var(--cx-border-soft);
            background: var(--cx-bg);
            cursor: pointer;
            transition: background 0.15s;
        }
        .community-event-featured:hover { background: var(--cx-bg-soft); }
        .community-event-featured:last-child { border-bottom: none; }

        .community-event-cover {
            height: 100px; position: relative; overflow: hidden;
            background: var(--cx-bg-hover);
        }
        .community-event-cover img {
            width: 100%; height: 100%; object-fit: cover;
        }
        .community-event-live {
            position: absolute; bottom: 8px; left: 8px;
            background: rgba(255,255,255,0.95);
            color: #c0392b;
            font-size: 10px; font-weight: 700;
            padding: 4px 10px;
            border-radius: 20px;
            display: flex; align-items: center; gap: 5px;
            border: 1px solid rgba(192,57,43,0.15);
        }
        .community-live-dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: #c0392b; display: inline-block;
        }
        .community-event-featured-body { padding: 14px 18px 16px; }
        .community-event-featured-body h4 {
            font-size: 14px; font-weight: 700; color: var(--cx-text);
            margin: 0 0 6px 0; line-height: 1.35;
        }
        .community-event-meta {
            font-size: 12px; color: var(--cx-muted);
            margin-bottom: 10px;
            display: flex; align-items: center; gap: 6px;
        }
        .community-event-meta i { color: var(--cx-gold); }
        .community-event-attendees {
            display: flex; align-items: center; gap: 6px; margin-bottom: 12px;
        }
        .community-attendees-avatars { display: flex; }
        .community-attendees-avatars img {
            width: 22px; height: 22px; border-radius: 50%;
            border: 2px solid var(--cx-bg);
            margin-left: -6px; object-fit: cover;
        }
        .community-attendees-avatars img:first-child { margin-left: 0; }
        .community-attendees-count {
            font-size: 11px; color: var(--cx-muted); font-weight: 500;
        }
        .community-event-join-btn {
            width: 100%; padding: 9px;
            border: 1px solid var(--cx-border);
            border-radius: var(--cx-radius);
            background: transparent;
            color: var(--cx-text);
            font-size: 12px; font-weight: 600;
            cursor: pointer;
            display: flex; align-items: center;
            justify-content: center; gap: 6px;
            transition: all 0.15s;
        }
        .community-event-join-btn:hover {
            background: var(--cx-gold-bg);
            border-color: var(--cx-gold-soft);
            color: var(--cx-gold);
        }

        .community-event-mini {
            display: flex; gap: 12px;
            padding: 12px 18px;
            border-top: 1px solid var(--cx-border-soft);
            align-items: center;
            cursor: pointer;
            transition: background 0.15s;
        }
        .community-event-mini:hover { background: var(--cx-bg-soft); }
        .community-event-mini:first-of-type { border-top: none; }
        .community-event-mini-cover {
            width: 54px; height: 54px;
            border-radius: var(--cx-radius-sm);
            overflow: hidden;
            background: var(--cx-bg-hover);
            flex-shrink: 0;
        }
        .community-event-mini-cover img {
            width: 100%; height: 100%; object-fit: cover;
        }
        .community-event-mini-info { flex: 1; min-width: 0; }
        .community-event-mini-info h5 {
            font-size: 13.5px; font-weight: 700;
            color: var(--cx-text);
            margin: 0 0 6px 0;
            line-height: 1.35;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .community-event-mini-meta {
            display: flex; gap: 10px; font-size: 11.5px;
            color: var(--cx-muted); flex-wrap: wrap;
        }
        .community-event-mini-meta i {
            color: var(--cx-gold); margin-right: 3px;
        }

        /* Conversas */
        .community-conversations-list {
            display: flex; flex-direction: column;
        }
        .community-conversation-item {
            display: flex; align-items: center; gap: 12px;
            padding: 12px 18px;
            border-top: 1px solid var(--cx-border-soft);
            transition: background 0.15s;
            cursor: pointer;
        }
        .community-conversation-item:first-child { border-top: none; }
        .community-conversation-item:hover { background: var(--cx-bg-soft); }
        .community-conv-avatar-wrapper { position: relative; flex-shrink: 0; }
        .community-conv-avatar {
            width: 38px; height: 38px; border-radius: 50%;
            overflow: hidden;
            display: flex; align-items: center; justify-content: center;
        }
        .community-conv-online {
            position: absolute; bottom: 0; right: 0;
            width: 10px; height: 10px; border-radius: 50%;
            background: #10b981;
            border: 2px solid var(--cx-bg);
        }
        .community-conv-info {
            flex: 1; min-width: 0;
            display: flex; flex-direction: column;
        }
        .community-conv-name {
            font-size: 13.5px; font-weight: 700; color: var(--cx-text);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .community-conv-preview {
            font-size: 12px; color: var(--cx-muted);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            margin-top: 2px;
        }
        .community-conv-time {
            font-size: 11px; color: var(--cx-muted); flex-shrink: 0;
        }
        .community-btn-enter-chats {
            width: calc(100% - 36px);
            margin: 8px 18px 18px;
            padding: 10px;
            border: 1px solid var(--cx-border);
            border-radius: var(--cx-radius);
            background: transparent;
            color: var(--cx-text);
            font-size: 12.5px; font-weight: 600;
            cursor: pointer;
            display: flex; align-items: center;
            justify-content: center; gap: 8px;
            transition: all 0.15s;
        }
        .community-btn-enter-chats:hover {
            background: var(--cx-gold-bg);
            border-color: var(--cx-gold-soft);
            color: var(--cx-gold);
        }

        /* ============================================================
           MODAIS — BASE CLEAN DOURADA
           ============================================================ */
        .modal-overlay {
            position: fixed; inset: 0;
            background: rgba(26, 26, 46, 0.35);
            display: flex; align-items: center; justify-content: center;
            padding: 24px; z-index: 9999;
            animation: modalFadeIn 0.15s ease;
        }
        .modal-overlay[hidden] { display: none !important; }
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .details-modal-container {
            background: var(--cx-bg);
            border-radius: var(--cx-radius);
            max-width: 620px;
            width: 100%;
            max-height: 88vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.10);
            animation: modalSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: 'Inter', system-ui, sans-serif;
            color: var(--cx-text);
            border: 1px solid var(--cx-border);
        }
        @keyframes modalSlideIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .details-modal-container::-webkit-scrollbar { width: 6px; }
        .details-modal-container::-webkit-scrollbar-thumb {
            background: var(--cx-border); border-radius: 10px;
        }

        /* BANNER — sem overlay pesado, imagem limpa */
        .details-modal-banner {
            height: 120px;
            background: var(--cx-bg-soft);
            border-bottom: 1px solid var(--cx-border);
            position: relative;
            overflow: hidden;
            background-size: cover;
            background-position: center;
        }
        .details-modal-banner.visual-banner::before {
            content: '';
            position: absolute; inset: 0;
            background: linear-gradient(
                180deg,
                rgba(26, 26, 46, 0.05) 0%,
                rgba(26, 26, 46, 0.25) 100%
            );
            z-index: 1;
        }
        .details-modal-banner > * {
            position: relative;
            z-index: 2;
        }

        .banner-decorative-icon { display: none; }

        .banner-floating-badge {
            position: absolute;
            top: 14px; left: 18px;
            background: rgba(255, 255, 255, 0.95);
            color: var(--cx-text);
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            z-index: 3;
            border: 1px solid var(--cx-border);
        }
        .banner-floating-badge i {
            font-size: 10px;
            color: var(--cx-gold);
        }

        .details-modal-close {
            position: absolute;
            top: 12px; right: 12px;
            width: 32px; height: 32px;
            border-radius: 50%;
            border: 1px solid var(--cx-border);
            background: rgba(255, 255, 255, 0.95);
            color: var(--cx-text);
            font-size: 13px;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            z-index: 4;
            transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .details-modal-close:hover {
            background: var(--cx-text);
            color: #fff;
            border-color: var(--cx-text);
        }

        /* HEADER — limpo */
        .details-modal-header {
            padding: 22px 24px 8px;
            margin-top: 0;
            position: relative;
        }
        .details-modal-header.with-overlap { margin-top: -50px; }

        .details-modal-avatar-wrapper {
            display: flex; align-items: flex-end;
            justify-content: space-between;
            margin-bottom: 14px;
            flex-wrap: wrap; gap: 12px;
        }
        .details-modal-avatar {
            width: 76px; height: 76px;
            border-radius: 50%;
            background: var(--cx-gold-bg);
            color: var(--cx-gold);
            display: flex; align-items: center; justify-content: center;
            border: 3px solid var(--cx-bg);
            overflow: hidden; flex-shrink: 0;
            font-size: 26px; font-weight: 700;
        }
        .details-modal-avatar img {
            width: 100%; height: 100%; object-fit: cover;
        }
        .details-modal-join-btn {
            padding: 8px 18px;
            border: 1px solid var(--cx-border);
            border-radius: var(--cx-radius);
            background: transparent;
            color: var(--cx-text);
            font-size: 12.5px; font-weight: 600;
            cursor: pointer;
            display: inline-flex; align-items: center;
            gap: 6px;
            transition: all 0.15s;
            margin-top: 48px;
            font-family: 'Inter', sans-serif;
        }
        .details-modal-join-btn:hover:not(:disabled) {
            background: var(--cx-gold-bg);
            border-color: var(--cx-gold-soft);
            color: var(--cx-gold);
        }
        .details-modal-join-btn:disabled {
            cursor: not-allowed; opacity: 0.6;
        }

        .details-modal-name {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 22px;
            font-weight: 700;
            color: var(--cx-text);
            margin: 0 0 8px;
            letter-spacing: -0.01em;
            line-height: 1.25;
        }
        .details-modal-description {
            font-size: 14px;
            color: var(--cx-muted);
            line-height: 1.6;
            margin: 0 0 12px;
        }

        .details-modal-meta {
            display: flex; gap: 16px; flex-wrap: wrap;
            font-size: 12.5px;
            color: var(--cx-muted);
            align-items: center;
            padding-top: 12px;
            border-top: 1px solid var(--cx-border-soft);
        }
        .details-modal-meta i {
            color: var(--cx-gold); margin-right: 4px;
        }
        .details-modal-badge {
            padding: 3px 10px;
            border-radius: 20px;
            background: var(--cx-bg-hover);
            color: var(--cx-text-soft);
            font-size: 10.5px; font-weight: 700;
            display: inline-flex; align-items: center; gap: 4px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }
        .details-modal-status {
            display: inline-flex; align-items: center;
            gap: 6px; font-size: 12px;
            color: #10b981; font-weight: 600;
        }
        .details-live-dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: #10b981; display: inline-block;
        }

        /* TABS */
        .details-modal-tabs {
            display: flex; gap: 0; padding: 0 24px;
            border-bottom: 1px solid var(--cx-border);
            margin-top: 12px;
        }
        .details-modal-tab {
            padding: 12px 16px;
            border: none; background: transparent;
            color: var(--cx-muted);
            font-size: 13.5px; font-weight: 600;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            margin-bottom: -1px;
            transition: color 0.15s, border-color 0.15s;
            font-family: 'Inter', sans-serif;
        }
        .details-modal-tab:hover { color: var(--cx-text); }
        .details-modal-tab.active {
            color: var(--cx-text);
            border-bottom-color: var(--cx-gold);
        }

        /* CONTENT */
        .details-modal-content {
            padding: 20px 24px 24px;
            max-height: 420px; overflow-y: auto;
        }
        .details-modal-content::-webkit-scrollbar { width: 6px; }
        .details-modal-content::-webkit-scrollbar-thumb {
            background: var(--cx-border); border-radius: 10px;
        }
        .details-modal-tab-content { display: none; }
        .details-modal-tab-content.active {
            display: block;
            animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        /* POSTS — estilo lista editorial */
        .details-post-item {
            padding: 16px 0;
            border-bottom: 1px solid var(--cx-border-soft);
        }
        .details-post-item:last-child { border-bottom: none; padding-bottom: 0; }
        .details-post-item:first-child { padding-top: 4px; }
        .details-post-header {
            display: flex; align-items: center; gap: 10px;
            margin-bottom: 10px;
        }
        .details-post-avatar {
            width: 34px; height: 34px; border-radius: 50%;
            overflow: hidden;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        .details-post-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .details-post-author { display: flex; flex-direction: column; }
        .details-post-author span {
            font-size: 13px; font-weight: 700; color: var(--cx-text);
        }
        .details-post-author small {
            font-size: 11px; color: var(--cx-muted); margin-top: 1px;
        }
        .details-post-title {
            font-size: 15px; font-weight: 700; color: var(--cx-text);
            margin: 0 0 6px 0;
            line-height: 1.35;
        }
        .details-post-text {
            font-size: 13px; color: var(--cx-muted);
            line-height: 1.6; margin: 0 0 10px 0;
        }
        .details-post-meta {
            display: flex; gap: 16px; font-size: 12px; color: var(--cx-muted);
        }
        .details-post-meta i {
            color: var(--cx-gold); margin-right: 4px;
        }

        /* EMPTY */
        .details-empty,
        .visual-empty-state {
            padding: 48px 20px; text-align: center;
            color: var(--cx-muted);
            display: flex; flex-direction: column;
            align-items: center; gap: 10px;
        }
        .details-empty i {
            font-size: 28px; opacity: 0.4;
            color: var(--cx-gold);
        }
        .visual-empty-illustration {
            width: 52px; height: 52px;
            border-radius: 50%;
            background: var(--cx-gold-bg);
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 4px;
        }
        .visual-empty-illustration::after { display: none; }
        .visual-empty-illustration i {
            font-size: 20px; color: var(--cx-gold);
        }
        .visual-empty-state h4 {
            font-size: 14px; font-weight: 700;
            color: var(--cx-text); margin: 0;
        }
        .visual-empty-state p,
        .details-empty p {
            font-size: 13px; color: var(--cx-muted);
            margin: 0; max-width: 280px; line-height: 1.5;
        }

        /* MEMBERS */
        .details-member-item {
            display: flex; align-items: center; gap: 12px;
            padding: 10px 0;
            cursor: pointer;
            transition: background 0.15s;
            border-bottom: 1px solid var(--cx-border-soft);
        }
        .details-member-item:last-child { border-bottom: none; }
        .details-member-item:hover { background: var(--cx-bg-soft); }
        .details-member-avatar {
            width: 40px; height: 40px; border-radius: 50%;
            overflow: hidden;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        .details-member-avatar img {
            width: 100%; height: 100%; object-fit: cover;
        }
        .details-member-info { display: flex; flex-direction: column; }
        .details-member-name {
            font-size: 14px; font-weight: 700; color: var(--cx-text);
        }
        .details-member-role {
            font-size: 12px; color: var(--cx-muted); margin-top: 2px;
        }

        /* ABOUT (grupo) */
        .details-about h4 {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 16px; font-weight: 700;
            color: var(--cx-text);
            margin: 0 0 8px 0;
        }
        .details-about p {
            font-size: 14px; color: var(--cx-muted);
            line-height: 1.7; margin: 0 0 16px 0;
        }
        .details-about-meta {
            display: flex; flex-direction: column;
            gap: 10px; font-size: 13px; color: var(--cx-text-soft);
        }
        .details-about-meta strong { color: var(--cx-text); }

        /* USER PROFILE */
        .user-profile-stats {
            display: flex; gap: 20px; padding: 16px 0;
            border-top: 1px solid var(--cx-border-soft);
            border-bottom: 1px solid var(--cx-border-soft);
            justify-content: space-around; margin-top: 16px;
        }
        .user-profile-stat {
            display: flex; flex-direction: column; align-items: center;
        }
        .user-profile-stat strong {
            font-size: 18px; font-weight: 800; color: var(--cx-text);
        }
        .user-profile-stat span {
            font-size: 11px; color: var(--cx-muted);
            text-transform: uppercase; letter-spacing: 0.08em;
            margin-top: 2px;
        }
        .user-profile-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .user-profile-btn {
            flex: 1; min-width: 140px;
            padding: 11px 20px;
            border-radius: var(--cx-radius);
            font-size: 13.5px; font-weight: 600;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            gap: 8px;
            transition: all 0.15s;
            font-family: 'Inter', sans-serif;
        }
        .user-profile-btn-chat {
            border: 1px solid var(--cx-text);
            background: var(--cx-text);
            color: #fff;
        }
        .user-profile-btn-chat:hover { opacity: 0.9; }
        .user-profile-btn-add {
            border: 1px solid var(--cx-border);
            background: transparent;
            color: var(--cx-text);
        }
        .user-profile-btn-add:hover {
            border-color: var(--cx-gold-soft);
            background: var(--cx-gold-bg);
            color: var(--cx-gold);
        }

        /* ============================================================
           CALENDÁRIO — clean
           ============================================================ */
        #communityCalendarModal .details-modal-container { max-width: 660px; }

        .calendar-controls {
            display: flex; justify-content: space-between; align-items: center;
            padding: 16px 24px;
            border-bottom: 1px solid var(--cx-border-soft);
        }
        #calendarMonthYear {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 17px; font-weight: 700;
            color: var(--cx-text); margin: 0; letter-spacing: -0.01em;
        }
        #calendarPrevMonth,
        #calendarNextMonth {
            background: transparent;
            border: 1px solid var(--cx-border);
            border-radius: var(--cx-radius-sm);
            padding: 8px 12px;
            cursor: pointer;
            color: var(--cx-text-soft);
            font-size: 11px;
            transition: all 0.15s;
        }
        #calendarPrevMonth:hover,
        #calendarNextMonth:hover {
            background: var(--cx-gold-bg);
            border-color: var(--cx-gold-soft);
            color: var(--cx-gold);
        }

        .calendar-grid { padding: 20px 24px; }
        .calendar-grid > div:first-child {
            display: grid; grid-template-columns: repeat(7, 1fr);
            gap: 4px; margin-bottom: 12px;
        }
        .calendar-grid > div:first-child span {
            text-align: center;
            font-size: 10.5px;
            font-weight: 700;
            color: var(--cx-muted);
            letter-spacing: 0.08em;
        }

        .calendar-day-btn {
            aspect-ratio: 1;
            border: none;
            border-radius: var(--cx-radius-sm);
            background: transparent;
            color: var(--cx-text-soft);
            font-size: 13.5px;
            font-weight: 500;
            cursor: pointer;
            position: relative;
            transition: all 0.15s;
            font-family: 'Inter', sans-serif;
        }
        .calendar-day-btn:hover { background: var(--cx-bg-hover); }
        .calendar-day-btn.has-event {
            color: var(--cx-gold);
            font-weight: 700;
            background: var(--cx-gold-bg);
        }
        .calendar-day-btn.has-event:hover { background: #f5ede0; }
        .calendar-day-btn.is-today {
            background: var(--cx-text) !important;
            color: #fff !important;
            font-weight: 700;
        }
        .calendar-day-btn.has-event::after {
            content: '';
            position: absolute;
            bottom: 5px; left: 50%;
            transform: translateX(-50%);
            width: 4px; height: 4px;
            border-radius: 50%;
            background: var(--cx-gold);
        }
        .calendar-day-btn.is-today::after { background: #fff; }

        .calendar-day-events { padding: 0 24px 24px; }
        .calendar-day-events > p {
            color: var(--cx-muted); font-size: 13px; text-align: center;
            padding: 16px 0; margin: 0;
        }
        .calendar-day-events > h4 {
            font-size: 13px; font-weight: 700; color: var(--cx-text);
            margin: 0 0 12px;
            display: flex; align-items: center; gap: 8px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }
        .calendar-day-events > h4 i { color: var(--cx-gold); }

        .calendar-event-item {
            padding: 12px 14px;
            border: 1px solid var(--cx-border-soft);
            border-radius: var(--cx-radius);
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.15s;
            display: flex;
            align-items: center;
            gap: 12px;
            background: var(--cx-bg);
        }
        .calendar-event-item:hover {
            border-color: var(--cx-gold-soft);
            background: var(--cx-bg-soft);
        }

        /* ============================================================
           MEMBERS DIRECTORY
           ============================================================ */
        .member-directory-item { transition: background 0.15s; }
        .member-directory-item:hover { background: var(--cx-bg-soft); }

        .member-action-btn {
            padding: 6px 14px;
            border: 1px solid var(--cx-border);
            border-radius: var(--cx-radius-sm);
            background: transparent;
            color: var(--cx-text-soft);
            font-size: 12px; font-weight: 600;
            cursor: pointer;
            transition: all 0.15s;
            font-family: 'Inter', sans-serif;
        }
        .member-action-btn:hover {
            background: var(--cx-gold-bg);
            color: var(--cx-gold);
            border-color: var(--cx-gold-soft);
        }

        #membersDirectorySearch {
            width: 100%;
            padding: 10px 14px 10px 40px;
            border: 1px solid var(--cx-border);
            border-radius: var(--cx-radius);
            font-size: 13px;
            outline: none;
            font-family: 'Inter', sans-serif;
            background: var(--cx-bg);
            color: var(--cx-text);
            transition: border-color 0.15s;
        }
        #membersDirectorySearch:focus {
            border-color: var(--cx-gold-soft);
        }
        #membersDirectorySearch::placeholder { color: var(--cx-muted); }

        .member-filter-btn {
            padding: 6px 14px;
            border: 1px solid var(--cx-border);
            border-radius: 20px;
            background: transparent;
            color: var(--cx-text-soft);
            font-size: 12px; font-weight: 600;
            cursor: pointer;
            transition: all 0.15s;
            font-family: 'Inter', sans-serif;
        }
        .member-filter-btn:hover {
            border-color: var(--cx-gold-soft);
            color: var(--cx-gold);
        }
        .member-filter-btn.active {
            border-color: var(--cx-gold);
            background: var(--cx-gold-bg);
            color: var(--cx-gold);
        }

        /* ============================================================
           ACHIEVEMENTS — cards quadrados e limpos
           ============================================================ */
        .achievement-card {
            text-align: center;
            padding: 18px 14px;
            border-radius: var(--cx-radius);
            border: 1px solid var(--cx-border);
            background: var(--cx-bg);
            transition: border-color 0.15s;
        }
        .achievement-card:hover { border-color: var(--cx-gold-soft); }
        .achievement-card.unlocked {
            background: var(--cx-gold-bg);
            border-color: rgba(184, 147, 90, 0.25);
        }
        .achievement-card.unlocked::before { display: none; }

        /* ============================================================
           STAT CARDS (Sobre)
           ============================================================ */
        .visual-stat-card {
            background: var(--cx-bg-soft);
            border: 1px solid var(--cx-border);
            border-radius: var(--cx-radius);
            padding: 20px 14px;
            text-align: center;
            transition: border-color 0.15s;
        }
        .visual-stat-card:hover { border-color: var(--cx-gold-soft); }
        .visual-stat-card::before { display: none; }
        .visual-stat-icon {
            width: 40px; height: 40px;
            border-radius: var(--cx-radius-sm);
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 10px;
            font-size: 16px;
            background: var(--cx-gold-bg);
            color: var(--cx-gold);
        }
        .visual-stat-icon.purple,
        .visual-stat-icon.pink,
        .visual-stat-icon.green,
        .visual-stat-icon.amber {
            background: var(--cx-gold-bg);
            color: var(--cx-gold);
        }

        /* ============================================================
           RESPONSIVO
           ============================================================ */
        @media (max-width: 1200px) {
            .community-right-sidebar { display: none; }
            body.has-community-inner-sidebar .main-content,
            body.has-community-inner-sidebar #mainContent {
                padding-right: 0 !important;
            }
        }
        @media (max-width: 900px) {
            .community-inner-sidebar {
                transform: translateX(-100%);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s;
                width: ${CONFIG.innerSidebarExpanded}px !important;
            }
            .community-inner-sidebar.open { transform: translateX(0); }
            .community-inner-sidebar.collapsed {
                width: ${CONFIG.innerSidebarExpanded}px !important;
            }
            .community-inner-sidebar.collapsed .community-inner-nav-item span,
            .community-inner-sidebar.collapsed .community-inner-nav-item .tab-badge,
            .community-inner-sidebar.collapsed .community-inner-brand,
            .community-inner-sidebar.collapsed .community-inner-section-header span,
            .community-inner-sidebar.collapsed .community-inner-group-info,
            .community-inner-sidebar.collapsed .community-inner-member-info {
                opacity: 1 !important; width: auto !important;
                pointer-events: auto !important; display: flex !important;
            }
            body.has-community-inner-sidebar .main-content,
            body.has-community-inner-sidebar #mainContent {
                padding-left: 0 !important;
            }
            .details-modal-container {
                max-width: 95vw; margin: 10px;
            }
        }

        /* ============================================================
           DARK MODE
           ============================================================ */
        body.a11y-dark-mode {
            --cx-bg: #1a1a2e;
            --cx-bg-soft: #16162a;
            --cx-bg-hover: #2a2a40;
            --cx-border: #2d2d44;
            --cx-border-soft: #252540;
            --cx-text: #e8e3dd;
            --cx-text-soft: #b8b0a8;
            --cx-muted: #94a3b8;
            --cx-gold: #d4b483;
            --cx-gold-soft: #b8935a;
            --cx-gold-bg: rgba(212, 180, 131, 0.08);
        }
        body.a11y-dark-mode .details-modal-close {
            background: rgba(42, 42, 64, 0.95);
            color: var(--cx-text);
            border-color: var(--cx-border);
        }
        body.a11y-dark-mode .details-modal-close:hover {
            background: var(--cx-text);
            color: var(--cx-bg);
        }
        body.a11y-dark-mode .banner-floating-badge {
            background: rgba(42, 42, 64, 0.95);
            color: var(--cx-text);
        }
        body.a11y-dark-mode .user-profile-btn-chat {
            background: var(--cx-text);
            color: var(--cx-bg);
            border-color: var(--cx-text);
        }
        body.a11y-dark-mode .calendar-day-btn.is-today {
            background: var(--cx-text) !important;
            color: var(--cx-bg) !important;
        }
            /* ============================================================
   CALENDÁRIO — layout completo
   ============================================================ */
.calendar-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid var(--cx-border-soft);
}
#calendarMonthYear {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 17px;
    font-weight: 700;
    color: var(--cx-text);
    margin: 0;
    letter-spacing: -0.01em;
}
#calendarPrevMonth,
#calendarNextMonth {
    width: 34px;
    height: 34px;
    background: transparent;
    border: 1px solid var(--cx-border);
    border-radius: var(--cx-radius-sm);
    padding: 0;
    cursor: pointer;
    color: var(--cx-text-soft);
    font-size: 11px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
}
#calendarPrevMonth:hover,
#calendarNextMonth:hover {
    background: var(--cx-gold-bg);
    border-color: var(--cx-gold-soft);
    color: var(--cx-gold);
}

.calendar-grid {
    padding: 20px 24px;
}
.calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 10px;
}
.calendar-weekdays span {
    text-align: center;
    font-size: 10.5px;
    font-weight: 700;
    color: var(--cx-muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
}

.calendar-day-spacer {
    aspect-ratio: 1;
}

.calendar-day-btn {
    aspect-ratio: 1;
    border: none;
    border-radius: var(--cx-radius-sm);
    background: transparent;
    color: var(--cx-text-soft);
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    position: relative;
    font-family: 'Inter', sans-serif;
    transition: background 0.15s, color 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
}
.calendar-day-btn:hover {
    background: var(--cx-bg-hover);
}
.calendar-day-btn.has-event {
    color: var(--cx-gold);
    font-weight: 700;
    background: var(--cx-gold-bg);
}
.calendar-day-btn.has-event:hover {
    background: #f5ede0;
}
.calendar-day-btn.has-event::after {
    content: '';
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--cx-gold);
}
.calendar-day-btn.is-today {
    background: var(--cx-text) !important;
    color: var(--cx-bg) !important;
    font-weight: 700;
}
.calendar-day-btn.is-today::after {
    background: var(--cx-bg);
}

.calendar-day-events {
    padding: 0 24px 24px;
}
.calendar-day-events > p {
    color: var(--cx-muted);
    font-size: 13px;
    text-align: center;
    padding: 16px 0;
    margin: 0;
}
.calendar-empty-day {
    text-align: center;
    color: var(--cx-muted);
    font-size: 13px;
    padding: 20px 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}
.calendar-empty-day i {
    font-size: 22px;
    opacity: 0.5;
    color: var(--cx-gold);
}
.calendar-day-events > h4 {
    font-size: 12px;
    font-weight: 700;
    color: var(--cx-text);
    margin: 0 0 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}
.calendar-day-events > h4 i {
    color: var(--cx-gold);
    font-size: 12px;
}

.calendar-event-item {
    padding: 12px 14px;
    border: 1px solid var(--cx-border-soft);
    border-radius: var(--cx-radius);
    margin-bottom: 8px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--cx-bg);
}
.calendar-event-item:hover {
    border-color: var(--cx-gold-soft);
    background: var(--cx-bg-soft);
}
.calendar-event-date {
    width: 40px;
    height: 40px;
    border-radius: var(--cx-radius-sm);
    background: var(--cx-gold-bg);
    color: var(--cx-gold);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
}
.calendar-event-info {
    flex: 1;
    min-width: 0;
}
.calendar-event-info h5 {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--cx-text);
    margin: 0 0 4px;
    line-height: 1.3;
}
.calendar-event-info span {
    font-size: 11.5px;
    color: var(--cx-muted);
}
.calendar-event-info span i {
    color: var(--cx-gold);
    margin-right: 3px;
}
.calendar-event-arrow {
    color: var(--cx-border);
    font-size: 11px;
    flex-shrink: 0;
}
    /* ============================================================
   MEMBROS — toolbar + lista
   ============================================================ */
.members-toolbar {
    padding: 0 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.members-search {
    position: relative;
}
.members-search i {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--cx-muted);
    font-size: 13px;
    pointer-events: none;
}
.members-search input {
    width: 100%;
    padding: 10px 14px 10px 40px;
    border: 1px solid var(--cx-border);
    border-radius: var(--cx-radius);
    font-size: 13px;
    outline: none;
    font-family: 'Inter', sans-serif;
    background: var(--cx-bg);
    color: var(--cx-text);
    transition: border-color 0.15s;
    box-sizing: border-box;
}
.members-search input::placeholder { color: var(--cx-muted); }
.members-search input:focus {
    border-color: var(--cx-gold-soft);
}

.members-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}
.member-filter-btn {
    padding: 6px 14px;
    border: 1px solid var(--cx-border);
    border-radius: 20px;
    background: transparent;
    color: var(--cx-text-soft);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.member-filter-btn:hover {
    border-color: var(--cx-gold-soft);
    color: var(--cx-gold);
}
.member-filter-btn.active {
    border-color: var(--cx-gold);
    background: var(--cx-gold-bg);
    color: var(--cx-gold);
}

/* Lista de membros */
#membersDirectoryList {
    max-height: 420px;
    overflow-y: auto;
}

.member-directory-item {
    padding: 12px 0;
    border-bottom: 1px solid var(--cx-border-soft);
    transition: background 0.15s;
}
.member-directory-item:last-child { border-bottom: none; }
.member-directory-item:hover { background: var(--cx-bg-soft); }

.details-member-avatar {
    position: relative;
    background: var(--cx-bg-hover);
    overflow: visible;
}
.details-member-avatar img {
    border-radius: 50%;
    overflow: hidden;
}
.member-online-dot {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #10b981;
    border: 2px solid var(--cx-bg);
    display: block;
}

.member-action-btn {
    padding: 6px 14px;
    border: 1px solid var(--cx-border);
    border-radius: var(--cx-radius);
    background: transparent;
    color: var(--cx-text-soft);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    flex-shrink: 0;
}
.member-action-btn:hover {
    background: var(--cx-gold-bg);
    border-color: var(--cx-gold-soft);
    color: var(--cx-gold);
}
.member-action-btn i { font-size: 12px; }
    `;
    document.head.appendChild(styles);
}

    // =============================================
    // INICIALIZAÇÃO
    // =============================================

    async function init() {
        console.log('🚀 comunidade-extras.js (Sidebar 2 puxa nav original)');

        const supabase = CONFIG.supabase;
        if (supabase) {
            const { data: { session } } = await supabase.auth.getSession();
            currentUser = session?.user || null;
        }

        injectStyles();

        await new Promise(resolve => setTimeout(resolve, 400));

        buildCommunityInnerSidebar();   // 🔥 Isso já remove a nav original e puxa os botões
        buildRightSidebar();
        createGroupDetailsModal();
        createUserProfileModal();
        createEventDetailsModal();

        setTimeout(async () => {
            await loadCommunityInnerGroups();
            await loadCommunityInnerMembers();
            await loadRealEvents();
            await loadRealConversations();
        }, 800);

        console.log('✅ Pronto!');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 500);
    }
/* ==========================================================================
   ATUALIZAÇÃO — CENTRAL DA COMUNIDADE (Fase 1)
   Correções críticas + funcionalidades reais
   ========================================================================== */

// =============================================
// CORREÇÃO 1: loadGroupPosts — FILTRAR POR GROUP_ID
// =============================================
// BUG: atualmente busca TODOS os posts, não apenas do grupo

async function loadGroupPostsFixed(groupId) {
    const container = document.getElementById('groupTabPublicacoes');
    if (!container) return;

    try {
        const supabase = CONFIG.supabase;
        
        // 🔥 CORREÇÃO: Filtrar por group_id se a coluna existir
        let query = supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        // Tentar filtrar por group_id (se a coluna existir na tabela)
        const { data: posts, error } = await query.eq('group_id', groupId);

        // Se der erro porque a coluna não existe, buscar sem filtro
        let finalPosts = posts;
        if (error && error.message && error.message.includes('group_id')) {
            console.warn('⚠️ Coluna group_id não existe em posts, buscando sem filtro');
            const fallback = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
            finalPosts = fallback.data;
        } else if (error) {
            throw error;
        }

        if (!finalPosts || !finalPosts.length) {
            container.innerHTML = `
                <div class="details-empty">
                    <i class="fa-regular fa-file-lines"></i>
                    <p>Nenhuma publicação ainda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = finalPosts.map(p => {
            const initial = (p.author_name || 'U').charAt(0).toUpperCase();
            const avatarColor = stringToColor(p.author_id || p.id);
            const authorAvatar = p.author_avatar || CONFIG.avatarPadrao;

            return `
                <div class="details-post-item">
                    <div class="details-post-header">
                        <div class="details-post-avatar" style="background:${avatarColor};">
                            <img src="${authorAvatar}" alt="" 
                                 onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'color:#fff;font-weight:700;\\'>${initial}</span>';">
                        </div>
                        <div class="details-post-author">
                            <span>${escapeHtml(p.author_name || 'Usuário')}</span>
                            <small>Há ${formatTimeAgo(p.created_at)}</small>
                        </div>
                    </div>
                    <h4 class="details-post-title">${escapeHtml((p.content || '').substring(0, 80))}</h4>
                    <p class="details-post-text">${escapeHtml((p.content || '').substring(0, 200))}</p>
                    <div class="details-post-meta">
                        <span><i class="fa-regular fa-heart"></i> ${p.likes || 0}</span>
                        <span><i class="fa-regular fa-comment"></i> ${p.comment_count || 0}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('❌ Erro ao carregar posts do grupo:', err);
        container.innerHTML = `
            <div class="details-empty">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>Erro ao carregar publicações</p>
            </div>
        `;
    }
}

// Substituir a função original
if (typeof window.loadGroupPosts === 'function') {
    window.loadGroupPosts = loadGroupPostsFixed;
}

// =============================================
// CORREÇÃO 2: HORÁRIO REAL DAS CONVERSAS
// =============================================
// BUG: atualmente mostra "Agora" fixo para todas as conversas

async function loadRealConversationsFixed() {
    const list = document.getElementById('communityConversationsList');
    if (!list) return;

    try {
        const supabase = CONFIG.supabase;
        let channels = [];

        // Tentar RPC primeiro
        try {
            const { data, error } = await supabase.rpc('get_user_chat_channels');
            if (!error && data) channels = data;
        } catch (e) {
            console.warn('⚠️ RPC get_user_chat_channels falhou, usando fallback');
        }

        // Fallback: buscar grupos
        if (!channels || !channels.length) {
            const { data } = await supabase
                .from('groups')
                .select('id, name, members, image_url')
                .order('members', { ascending: false })
                .limit(4);
            channels = data || [];
        }

        if (!channels || !channels.length) {
            list.innerHTML = `
                <div class="community-inner-empty">
                    <i class="fa-regular fa-comment"></i>
                    <p>Nenhuma conversa</p>
                </div>
            `;
            return;
        }

        // 🔥 Buscar última mensagem de cada canal para mostrar horário real
        const channelsWithLastMsg = await Promise.all(
            channels.slice(0, 4).map(async (c) => {
                try {
                    const { data: lastMsg } = await supabase
                        .from('messages')
                        .select('content, created_at, sender_name')
                        .eq('conversation_id', c.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    return {
                        ...c,
                        last_message: lastMsg?.content || null,
                        last_message_time: lastMsg?.created_at || null,
                        last_sender: lastMsg?.sender_name || null
                    };
                } catch (e) {
                    return { ...c, last_message: null, last_message_time: null };
                }
            })
        );

        list.innerHTML = channelsWithLastMsg.map(c => {
            const bgColor = stringToColor(c.id || c.name);
            const initial = (c.name || 'C').charAt(0).toUpperCase();
            const hasImg = c.image_url && c.image_url !== CONFIG.avatarPadrao;

            // 🔥 Formatar horário real
            let timeDisplay = '';
            if (c.last_message_time) {
                timeDisplay = formatTimeAgo(c.last_message_time);
            } else {
                timeDisplay = 'Sem mensagens';
            }

            // Preview da mensagem
            let previewText = `${c.members || 0} membros`;
            if (c.last_message) {
                const sender = c.last_sender ? `${c.last_sender}: ` : '';
                previewText = `${sender}${c.last_message.substring(0, 40)}`;
            }

            return `
                <div class="community-conversation-item" data-conv-id="${c.id}">
                    <div class="community-conv-avatar-wrapper">
                        <div class="community-conv-avatar" style="background:${bgColor};">
                            ${hasImg
                                ? `<img src="${c.image_url}" alt="" onerror="this.style.display='none';">`
                                : `<span style="color:#fff;font-weight:700;font-size:12px;">${initial}</span>`}
                        </div>
                        <span class="community-conv-online"></span>
                    </div>
                    <div class="community-conv-info">
                        <span class="community-conv-name">${escapeHtml(c.name || 'Canal')}</span>
                        <span class="community-conv-preview">${escapeHtml(previewText)}</span>
                    </div>
                    <span class="community-conv-time">${timeDisplay}</span>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.community-conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const convId = item.dataset.convId;
                if (convId && typeof window.openGroupChat === 'function') {
                    window.openGroupChat(convId);
                }
            });
        });
    } catch (err) {
        console.error('❌ Erro conversas:', err);
        list.innerHTML = `
            <div class="community-inner-empty">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
        `;
    }
}

// =============================================
// CORREÇÃO 3: PARTICIPANTES REAIS DOS EVENTOS
// =============================================

async function loadRealEventsFixed() {
    const list = document.getElementById('communityEventsList');
    if (!list) return;

    try {
        const supabase = CONFIG.supabase;
        const { data: events, error } = await supabase
            .from('events')
            .select('*')
            .eq('is_active', true)
            .gte('date', new Date().toISOString())
            .order('date', { ascending: true })
            .limit(4);

        if (error) throw error;
        if (!events || !events.length) {
            list.innerHTML = `
                <div class="community-inner-empty">
                    <i class="fa-regular fa-calendar"></i>
                    <p>Nenhum evento</p>
                </div>
            `;
            return;
        }

        // 🔥 Buscar participantes reais de cada evento
        const eventsWithParticipants = await Promise.all(
            events.map(async (ev) => {
                try {
                    const { data: participants } = await supabase
                        .from('event_participants')
                        .select('user_id, profiles:user_id(username, avatar_url)')
                        .eq('event_id', ev.id)
                        .limit(5);

                    return {
                        ...ev,
                        real_participants: participants || []
                    };
                } catch (e) {
                    return { ...ev, real_participants: [] };
                }
            })
        );

        list.innerHTML = eventsWithParticipants.map((ev, index) => {
            const date = new Date(ev.date);
            const day = date.getDate().toString().padStart(2, '0');
            const month = date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
            const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const participants = ev.participants || ev.real_participants.length || 0;

            // 🔥 Gerar avatares reais
            const participantsHtml = ev.real_participants.length > 0
                ? ev.real_participants.slice(0, 3).map(p => {
                    const profile = p.profiles || {};
                    const avatar = profile.avatar_url || CONFIG.avatarPadrao;
                    const initial = (profile.username || 'U').charAt(0).toUpperCase();
                    const bgColor = stringToColor(p.user_id);
                    return `
                        <div style="width:22px;height:22px;border-radius:50%;border:2px solid #fff;margin-left:-6px;overflow:hidden;background:${bgColor};display:flex;align-items:center;justify-content:center;">
                            <img src="${avatar}" style="width:100%;height:100%;object-fit:cover;" 
                                 onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'color:#fff;font-size:10px;font-weight:700;\\'>${initial}</span>';">
                        </div>
                    `;
                }).join('')
                : `<img src="${CONFIG.avatarPadrao}" style="width:22px;height:22px;border-radius:50%;border:2px solid #fff;">
                   <img src="${CONFIG.avatarPadrao}" style="width:22px;height:22px;border-radius:50%;border:2px solid #fff;margin-left:-6px;">
                   <img src="${CONFIG.avatarPadrao}" style="width:22px;height:22px;border-radius:50%;border:2px solid #fff;margin-left:-6px;">`;

            if (index === 0) {
                const cover = ev.image_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=200&fit=crop';
                return `
                    <div class="community-event-featured" data-event-id="${ev.id}">
                        <div class="community-event-cover">
                            <img src="${cover}" alt="" onerror="this.style.display='none';">
                            ${ev.is_live ? '<div class="community-event-live"><span class="community-live-dot"></span> Ao vivo</div>' : ''}
                        </div>
                        <div class="community-event-featured-body">
                            <h4>${escapeHtml(ev.title || 'Evento')}</h4>
                            <div class="community-event-meta">
                                <span><i class="fa-regular fa-clock"></i> ${day}/${month} · ${time}</span>
                            </div>
                            <div class="community-event-attendees">
                                <div class="community-attendees-avatars" style="display:flex;">
                                    ${participantsHtml}
                                </div>
                                <span class="community-attendees-count">+${Math.max(0, participants - 3)}</span>
                            </div>
                            <button class="community-event-join-btn">
                                <i class="fa-solid fa-video"></i> ${ev.link ? 'Entrar' : 'Ver detalhes'}
                            </button>
                        </div>
                    </div>
                `;
            } else {
                const mini = ev.image_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&h=100&fit=crop';
                return `
                    <div class="community-event-mini" data-event-id="${ev.id}">
                        <div class="community-event-mini-cover">
                            <img src="${mini}" alt="" onerror="this.style.display='none';">
                        </div>
                        <div class="community-event-mini-info">
                            <h5>${escapeHtml(ev.title || 'Evento')}</h5>
                            <div class="community-event-mini-meta">
                                <span><i class="fa-regular fa-calendar"></i> ${day}/${month} · ${time}</span>
                                <span><i class="fa-regular fa-user"></i> ${participants}</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        }).join('');

        list.querySelectorAll('[data-event-id]').forEach(item => {
            item.addEventListener('click', () => {
                const eventId = item.dataset.eventId;
                if (eventId) openEventDetailsModal(eventId);
            });
        });
    } catch (err) {
        console.error('❌ Erro eventos:', err);
        list.innerHTML = `
            <div class="community-inner-empty">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
        `;
    }
}

// =============================================
// FUNCIONALIDADE 1: CALENDÁRIO REAL
// =============================================

function createCalendarModal() {
    if (document.getElementById('communityCalendarModal')) return;

    document.body.insertAdjacentHTML('beforeend', `
        <div class="modal-overlay" id="communityCalendarModal" hidden>
            <div class="details-modal-container" style="max-width:680px;">

                <div class="details-modal-banner" id="calendarBanner">
                    <button class="details-modal-close" id="closeCalendarModal" aria-label="Fechar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <div class="banner-floating-badge">
                        <i class="fa-solid fa-calendar-days"></i>
                        <span>Agenda</span>
                    </div>
                </div>

                <div class="details-modal-header">
                    <h2 class="details-modal-name">Calendário</h2>
                    <p class="details-modal-description">Acompanhe todos os eventos e atividades da comunidade.</p>
                </div>

                <div class="calendar-controls">
                    <button id="calendarPrevMonth" aria-label="Mês anterior">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    <h3 id="calendarMonthYear">Setembro 2026</h3>
                    <button id="calendarNextMonth" aria-label="Próximo mês">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>

                <div class="calendar-grid">
                    <div class="calendar-weekdays">
                        <span>DOM</span>
                        <span>SEG</span>
                        <span>TER</span>
                        <span>QUA</span>
                        <span>QUI</span>
                        <span>SEX</span>
                        <span>SÁB</span>
                    </div>
                    <div id="calendarDays" class="calendar-days"></div>
                </div>

                <div class="calendar-day-events" id="calendarDayEvents">
                    <p>Clique em um dia para ver os eventos</p>
                </div>

            </div>
        </div>
    `);

    const modal = document.getElementById('communityCalendarModal');
    document.getElementById('closeCalendarModal')?.addEventListener('click', () => modal?.setAttribute('hidden', ''));
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.setAttribute('hidden', ''); });
}

let calendarCurrentDate = new Date();
let calendarEvents = [];

async function openCalendarModal() {
    if (!document.getElementById('communityCalendarModal')) createCalendarModal();
    
    const modal = document.getElementById('communityCalendarModal');
    modal?.removeAttribute('hidden');

    // Buscar eventos
    try {
        const supabase = CONFIG.supabase;
        const { data } = await supabase
            .from('events')
            .select('*')
            .eq('is_active', true)
            .order('date', { ascending: true });
        
        calendarEvents = data || [];
    } catch (e) {
        calendarEvents = [];
    }

    renderCalendar();
}

function renderCalendar() {
    const monthYearEl = document.getElementById('calendarMonthYear');
    const daysEl = document.getElementById('calendarDays');
    if (!monthYearEl || !daysEl) return;

    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();

    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    monthYearEl.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    let html = '';

    // Espaços vazios antes do primeiro dia
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day-spacer"></div>';
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

        const dayEvents = calendarEvents.filter(ev => {
            const evDate = new Date(ev.date);
            return (
                evDate.getDate() === day &&
                evDate.getMonth() === month &&
                evDate.getFullYear() === year
            );
        });

        const hasEvents = dayEvents.length > 0;

        const classes = [
            'calendar-day-btn',
            isToday ? 'is-today' : '',
            (!isToday && hasEvents) ? 'has-event' : ''
        ].filter(Boolean).join(' ');

        html += `
            <button class="${classes}" data-day="${day}" type="button">
                ${day}
            </button>
        `;
    }

    daysEl.innerHTML = html;

    daysEl.querySelectorAll('.calendar-day-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const day = parseInt(btn.dataset.day, 10);
            showCalendarDayEvents(day);
        });
    });
}

function showCalendarDayEvents(day) {
    const container = document.getElementById('calendarDayEvents');
    if (!container) return;

    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();

    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const dayEvents = calendarEvents.filter(ev => {
        const evDate = new Date(ev.date);
        return (
            evDate.getDate() === day &&
            evDate.getMonth() === month &&
            evDate.getFullYear() === year
        );
    });

    if (dayEvents.length === 0) {
        container.innerHTML = `
            <p class="calendar-empty-day">
                <i class="fa-regular fa-calendar-xmark"></i>
                Nenhum evento neste dia
            </p>
        `;
        return;
    }

    container.innerHTML = `
        <h4>
            <i class="fa-regular fa-calendar"></i>
            ${day} de ${monthNames[month]}
        </h4>
        ${dayEvents.map(ev => {
            const date = new Date(ev.date);
            const time = date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            return `
                <div class="calendar-event-item" data-event-id="${ev.id}">
                    <div class="calendar-event-date">
                        ${date.getDate()}
                    </div>
                    <div class="calendar-event-info">
                        <h5>${escapeHtml(ev.title || 'Evento')}</h5>
                        <span>
                            <i class="fa-regular fa-clock"></i> ${time}
                            · <i class="fa-regular fa-user"></i> ${ev.participants || 0}
                        </span>
                    </div>
                    <i class="fa-solid fa-chevron-right calendar-event-arrow"></i>
                </div>
            `;
        }).join('')}
    `;

    container.querySelectorAll('.calendar-event-item').forEach(item => {
        item.addEventListener('click', () => {
            const eventId = item.dataset.eventId;
            if (eventId) {
                document.getElementById('communityCalendarModal')?.setAttribute('hidden', '');
                openEventDetailsModal(eventId);
            }
        });
    });
}

// Navegação do calendário
document.addEventListener('click', (e) => {
    if (e.target.closest('#calendarPrevMonth')) {
        calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() - 1);
        renderCalendar();
        document.getElementById('calendarDayEvents').innerHTML = '<p style="color:#9ca3af;font-size:13px;text-align:center;">Clique em um dia para ver os eventos</p>';
    }
    if (e.target.closest('#calendarNextMonth')) {
        calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + 1);
        renderCalendar();
        document.getElementById('calendarDayEvents').innerHTML = '<p style="color:#9ca3af;font-size:13px;text-align:center;">Clique em um dia para ver os eventos</p>';
    }
});

// =============================================
// FUNCIONALIDADE 2: DIRETÓRIO DE MEMBROS
// =============================================

function createMembersDirectoryModal() {
    if (document.getElementById('membersDirectoryModal')) return;

    document.body.insertAdjacentHTML('beforeend', `
        <div class="modal-overlay" id="membersDirectoryModal" hidden>
            <div class="details-modal-container" style="max-width:640px;">

                <div class="details-modal-banner" id="membersBanner">
                    <button class="details-modal-close" id="closeMembersDirectoryModal" aria-label="Fechar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <div class="banner-floating-badge">
                        <i class="fa-solid fa-users"></i>
                        <span>Comunidade</span>
                    </div>
                </div>

                <div class="details-modal-header">
                    <h2 class="details-modal-name">Membros</h2>
                    <p class="details-modal-description">Conheça quem faz parte do Amor NeuroDivergente.</p>
                </div>

                <div class="members-toolbar">
                    <div class="members-search">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input
                            type="text"
                            id="membersDirectorySearch"
                            placeholder="Pesquisar membro..."
                            autocomplete="off"
                        >
                    </div>
                    <div class="members-filters">
                        <button class="member-filter-btn active" data-filter="all" type="button">Todos</button>
                        <button class="member-filter-btn" data-filter="online" type="button">Online</button>
                        <button class="member-filter-btn" data-filter="friends" type="button">Amigos</button>
                    </div>
                </div>

                <div class="details-modal-content" id="membersDirectoryList">
                    <div class="community-inner-loading">
                        <i class="fa-solid fa-spinner fa-spin"></i> Carregando...
                    </div>
                </div>

            </div>
        </div>
    `);

    const modal = document.getElementById('membersDirectoryModal');
    document.getElementById('closeMembersDirectoryModal')?.addEventListener('click', () => modal?.setAttribute('hidden', ''));
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.setAttribute('hidden', ''); });

    // Filtros
    modal.querySelectorAll('.member-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.querySelectorAll('.member-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterMembersDirectory(btn.dataset.filter);
        });
    });

    // Busca
    document.getElementById('membersDirectorySearch')?.addEventListener('input', (e) => {
        filterMembersDirectory(null, e.target.value);
    });
}

let allMembersCache = [];

async function openMembersDirectoryModal() {
    if (!document.getElementById('membersDirectoryModal')) createMembersDirectoryModal();
    
    const modal = document.getElementById('membersDirectoryModal');
    modal?.removeAttribute('hidden');

    const list = document.getElementById('membersDirectoryList');
    if (!list) return;

    list.innerHTML = '<div class="community-inner-loading"><i class="fa-solid fa-spinner fa-spin"></i> Carregando...</div>';

    try {
        const supabase = CONFIG.supabase;
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, bio, created_at')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        allMembersCache = profiles || [];
        renderMembersDirectory(allMembersCache);
    } catch (err) {
        console.error('❌ Erro ao carregar membros:', err);
        list.innerHTML = `
            <div class="details-empty">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>Erro ao carregar membros</p>
            </div>
        `;
    }
}

function renderMembersDirectory(members) {
    const list = document.getElementById('membersDirectoryList');
    if (!list) return;

    if (!members || members.length === 0) {
        list.innerHTML = `
            <div class="details-empty">
                <i class="fa-regular fa-user"></i>
                <p>Nenhum membro encontrado</p>
            </div>
        `;
        return;
    }

    list.innerHTML = members.map(m => {
        const bgColor = stringToColor(m.id);
        const hasImg = m.avatar_url && m.avatar_url !== CONFIG.avatarPadrao;
        const username = m.username || 'Membro';

        return `
            <div class="details-member-item member-directory-item"
                 data-user-id="${m.id}"
                 data-username="${escapeHtml(username)}">

                <div class="details-member-avatar" style="background:${bgColor};">
                    <img src="${hasImg ? m.avatar_url : CONFIG.avatarPadrao}"
                         alt="${escapeHtml(username)}"
                         onerror="this.onerror=null;this.src='${CONFIG.avatarPadrao}'">
                    <span class="member-online-dot"></span>
                </div>

                <div class="details-member-info">
                    <span class="details-member-name">${escapeHtml(username)}</span>
                    <span class="details-member-role">@${escapeHtml(username.toLowerCase().replace(/\s+/g, ''))}</span>
                </div>

                <button class="member-action-btn" type="button">
                    <i class="fa-regular fa-comment-dots"></i> Conversar
                </button>
            </div>
        `;
    }).join('');

    list.querySelectorAll('.member-directory-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.member-action-btn')) return;
            const userId = item.dataset.userId;
            if (userId) {
                document.getElementById('membersDirectoryModal')?.setAttribute('hidden', '');
                openUserProfileModal(userId);
            }
        });
    });

    list.querySelectorAll('.member-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = btn.closest('.member-directory-item');
            const userId = item?.dataset.userId;
            const username = item?.dataset.username;
            if (userId && typeof window.openFriendChat === 'function') {
                document.getElementById('membersDirectoryModal')?.setAttribute('hidden', '');
                window.openFriendChat(null, username, userId);
            }
        });
    });
}

let currentMemberFilter = 'all';
let currentMemberSearch = '';

function filterMembersDirectory(filter, search) {
    if (filter !== null) currentMemberFilter = filter;
    if (search !== undefined) currentMemberSearch = search.toLowerCase();

    let filtered = allMembersCache;

    if (currentMemberSearch) {
        filtered = filtered.filter(m => 
            (m.username || '').toLowerCase().includes(currentMemberSearch)
        );
    }

    // Filtro "amigos" - podemos melhorar depois com dados reais
    if (currentMemberFilter === 'friends') {
        // Placeholder: mostrar apenas primeiros 10
        filtered = filtered.slice(0, 10);
    }

    renderMembersDirectory(filtered);
}

// =============================================
// FUNCIONALIDADE 3: PÁGINA SOBRE
// =============================================

function createAboutModal() {
    if (document.getElementById('communityAboutModal')) return;

    document.body.insertAdjacentHTML('beforeend', `
        <div class="modal-overlay" id="communityAboutModal" hidden>
            <div class="details-modal-container" style="max-width:640px;">
                <div class="details-modal-banner" style="background:linear-gradient(135deg,#7c3aed,#ec4899);height:140px;display:flex;align-items:center;justify-content:center;">
                    <button class="details-modal-close" id="closeAboutModal" style="position:absolute;top:12px;right:12px;">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <i class="fa-solid fa-heart" style="font-size:60px;color:#fff;opacity:0.9;"></i>
                </div>
                <div class="details-modal-header" style="text-align:center;margin-top:-40px;">
                    <h2 class="details-modal-name" style="font-size:26px;">Amor NeuroDivergente</h2>
                    <p class="details-modal-description" style="font-size:15px;">
                        Um espaço seguro para compartilhar experiências, fazer perguntas e encontrar apoio.
                    </p>
                </div>
                <div class="details-modal-content" style="padding:16px 24px 32px;">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px;">
                        <div style="text-align:center;padding:16px;background:rgba(124,58,237,0.05);border-radius:12px;">
                            <i class="fa-solid fa-users" style="font-size:24px;color:#7c3aed;margin-bottom:8px;"></i>
                            <div style="font-size:20px;font-weight:800;color:#1f2937;">1.2k+</div>
                            <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Membros</div>
                        </div>
                        <div style="text-align:center;padding:16px;background:rgba(236,72,153,0.05);border-radius:12px;">
                            <i class="fa-regular fa-message" style="font-size:24px;color:#ec4899;margin-bottom:8px;"></i>
                            <div style="font-size:20px;font-weight:800;color:#1f2937;">5.8k+</div>
                            <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Publicações</div>
                        </div>
                        <div style="text-align:center;padding:16px;background:rgba(16,185,129,0.05);border-radius:12px;">
                            <i class="fa-regular fa-calendar" style="font-size:24px;color:#10b981;margin-bottom:8px;"></i>
                            <div style="font-size:20px;font-weight:800;color:#1f2937;">120+</div>
                            <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Eventos</div>
                        </div>
                    </div>

                    <h3 style="font-size:16px;font-weight:700;color:#1f2937;margin-bottom:12px;">
                        <i class="fa-solid fa-bullseye" style="color:#7c3aed;"></i> Nossa Missão
                    </h3>
                    <p style="font-size:14px;color:#6b7280;line-height:1.7;margin-bottom:20px;">
                        Criar um ambiente acolhedor onde pessoas neurodivergentes possam compartilhar 
                        experiências, encontrar apoio mútuo e celebrar suas conquistas sem julgamentos.
                    </p>

                    <h3 style="font-size:16px;font-weight:700;color:#1f2937;margin-bottom:12px;">
                        <i class="fa-solid fa-heart" style="color:#ec4899;"></i> Nossos Valores
                    </h3>
                    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
                        <div style="display:flex;gap:12px;align-items:flex-start;">
                            <i class="fa-solid fa-check-circle" style="color:#10b981;margin-top:2px;"></i>
                            <div>
                                <strong style="font-size:13px;color:#1f2937;">Respeito</strong>
                                <p style="font-size:12px;color:#6b7280;margin:2px 0 0 0;">Cada pessoa é única e merece ser ouvida.</p>
                            </div>
                        </div>
                        <div style="display:flex;gap:12px;align-items:flex-start;">
                            <i class="fa-solid fa-check-circle" style="color:#10b981;margin-top:2px;"></i>
                            <div>
                                <strong style="font-size:13px;color:#1f2937;">Acolhimento</strong>
                                <p style="font-size:12px;color:#6b7280;margin:2px 0 0 0;">Um espaço seguro para ser quem você é.</p>
                            </div>
                        </div>
                        <div style="display:flex;gap:12px;align-items:flex-start;">
                            <i class="fa-solid fa-check-circle" style="color:#10b981;margin-top:2px;"></i>
                            <div>
                                <strong style="font-size:13px;color:#1f2937;">Privacidade</strong>
                                <p style="font-size:12px;color:#6b7280;margin:2px 0 0 0;">Suas histórias são protegidas aqui.</p>
                            </div>
                        </div>
                        <div style="display:flex;gap:12px;align-items:flex-start;">
                            <i class="fa-solid fa-check-circle" style="color:#10b981;margin-top:2px;"></i>
                            <div>
                                <strong style="font-size:13px;color:#1f2937;">Empatia</strong>
                                <p style="font-size:12px;color:#6b7280;margin:2px 0 0 0;">Compartilhamos vivências e nos apoiamos.</p>
                            </div>
                        </div>
                    </div>

                    <div style="padding:16px;background:linear-gradient(135deg,rgba(124,58,237,0.08),rgba(236,72,153,0.08));border-radius:12px;text-align:center;">
                        <p style="font-size:14px;color:#4b5563;font-style:italic;margin:0;">
                            "Juntos somos mais fortes. Juntos somos comunidade." 💜
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `);

    const modal = document.getElementById('communityAboutModal');
    document.getElementById('closeAboutModal')?.addEventListener('click', () => modal?.setAttribute('hidden', ''));
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.setAttribute('hidden', ''); });
}

// =============================================
// FUNCIONALIDADE 4: CONQUISTAS (SUBSTITUI "CLASSIFICAÇÃO")
// =============================================

function createAchievementsModal() {
    if (document.getElementById('achievementsModal')) return;

    document.body.insertAdjacentHTML('beforeend', `
        <div class="modal-overlay" id="achievementsModal" hidden>
            <div class="details-modal-container" style="max-width:560px;">
                <div class="details-modal-banner" style="background:linear-gradient(135deg,#f59e0b,#ec4899);height:120px;display:flex;align-items:center;justify-content:center;">
                    <button class="details-modal-close" id="closeAchievementsModal" style="position:absolute;top:12px;right:12px;">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <i class="fa-solid fa-trophy" style="font-size:50px;color:#fff;opacity:0.9;"></i>
                </div>
                <div class="details-modal-header" style="text-align:center;margin-top:-30px;">
                    <h2 class="details-modal-name">Suas Conquistas</h2>
                    <p class="details-modal-description">Marcos da sua jornada na comunidade</p>
                </div>
                <div class="details-modal-content" id="achievementsList" style="padding:0 24px 24px;">
                    <div class="community-inner-loading"><i class="fa-solid fa-spinner fa-spin"></i> Carregando...</div>
                </div>
            </div>
        </div>
    `);

    const modal = document.getElementById('achievementsModal');
    document.getElementById('closeAchievementsModal')?.addEventListener('click', () => modal?.setAttribute('hidden', ''));
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.setAttribute('hidden', ''); });
}

async function openAchievementsModal() {
    if (!document.getElementById('achievementsModal')) createAchievementsModal();
    
    const modal = document.getElementById('achievementsModal');
    modal?.removeAttribute('hidden');

    const list = document.getElementById('achievementsList');
    if (!list) return;

    if (!currentUser) {
        list.innerHTML = `
            <div class="details-empty">
                <i class="fa-regular fa-user"></i>
                <p>Faça login para ver suas conquistas</p>
            </div>
        `;
        return;
    }

    list.innerHTML = '<div class="community-inner-loading"><i class="fa-solid fa-spinner fa-spin"></i> Calculando...</div>';

    try {
        const supabase = CONFIG.supabase;

        // Buscar dados do usuário
        const [postsRes, commentsRes, friendsRes] = await Promise.all([
            supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', currentUser.id),
            supabase.from('comments').select('*', { count: 'exact', head: true }).eq('author_id', currentUser.id),
            supabase.from('friendships').select('*', { count: 'exact', head: true }).eq('status', 'accepted').or(`user_id1.eq.${currentUser.id},user_id2.eq.${currentUser.id}`)
        ]);

        const postCount = postsRes.count || 0;
        const commentCount = commentsRes.count || 0;
        const friendCount = friendsRes.count || 0;

        const achievements = [
            { id: 'first_post', icon: 'fa-pen-to-square', title: 'Primeira Publicação', desc: 'Você compartilhou algo com a comunidade', unlocked: postCount >= 1, progress: Math.min(postCount, 1), total: 1 },
            { id: 'ten_posts', icon: 'fa-feather', title: 'Escritor Ativo', desc: '10 publicações compartilhadas', unlocked: postCount >= 10, progress: Math.min(postCount, 10), total: 10 },
            { id: 'first_comment', icon: 'fa-comment', title: 'Primeiro Comentário', desc: 'Você interagiu com a comunidade', unlocked: commentCount >= 1, progress: Math.min(commentCount, 1), total: 1 },
            { id: 'fifty_comments', icon: 'fa-comments', title: 'Voz Ativa', desc: '50 comentários feitos', unlocked: commentCount >= 50, progress: Math.min(commentCount, 50), total: 50 },
            { id: 'first_friend', icon: 'fa-user-plus', title: 'Primeiro Amigo', desc: 'Você fez sua primeira conexão', unlocked: friendCount >= 1, progress: Math.min(friendCount, 1), total: 1 },
            { id: 'ten_friends', icon: 'fa-user-group', title: 'Conector', desc: '10 amigos na comunidade', unlocked: friendCount >= 10, progress: Math.min(friendCount, 10), total: 10 },
            { id: 'helper', icon: 'fa-hand-holding-heart', title: 'Apoiador', desc: 'Ajudou alguém na comunidade', unlocked: commentCount >= 5, progress: Math.min(commentCount, 5), total: 5 },
            { id: 'mentor', icon: 'fa-star', title: 'Mentor', desc: 'Referência na comunidade', unlocked: postCount >= 25 && commentCount >= 50, progress: Math.min(postCount + commentCount, 75), total: 75 }
        ];

        const unlockedCount = achievements.filter(a => a.unlocked).length;

        list.innerHTML = `
            <div style="text-align:center;padding:16px 0 24px;">
                <div style="font-size:32px;font-weight:800;color:#7c3aed;">${unlockedCount}/${achievements.length}</div>
                <div style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Conquistas Desbloqueadas</div>
                <div style="margin-top:12px;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;max-width:280px;margin-left:auto;margin-right:auto;">
                    <div style="height:100%;background:linear-gradient(90deg,#7c3aed,#ec4899);width:${(unlockedCount / achievements.length) * 100}%;border-radius:3px;transition:width 0.5s;"></div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;">
                ${achievements.map(a => `
                    <div style="text-align:center;padding:16px 12px;border-radius:12px;border:1px solid ${a.unlocked ? 'rgba(124,58,237,0.2)' : '#e5e7eb'};background:${a.unlocked ? 'rgba(124,58,237,0.03)' : '#fafafa'};opacity:${a.unlocked ? 1 : 0.5};transition:all 0.2s;">
                        <div style="width:48px;height:48px;border-radius:50%;background:${a.unlocked ? 'linear-gradient(135deg,#7c3aed,#ec4899)' : '#e5e7eb'};display:flex;align-items:center;justify-content:center;margin:0 auto 10px;">
                            <i class="fa-solid ${a.icon}" style="font-size:20px;color:${a.unlocked ? '#fff' : '#9ca3af'};"></i>
                        </div>
                        <div style="font-size:12px;font-weight:700;color:#1f2937;margin-bottom:4px;">${a.title}</div>
                        <div style="font-size:10px;color:#9ca3af;line-height:1.4;">${a.desc}</div>
                        ${!a.unlocked ? `
                            <div style="margin-top:8px;height:4px;background:#e5e7eb;border-radius:2px;overflow:hidden;">
                                <div style="height:100%;background:#7c3aed;width:${(a.progress / a.total) * 100}%;"></div>
                            </div>
                            <div style="font-size:9px;color:#9ca3af;margin-top:4px;">${a.progress}/${a.total}</div>
                        ` : `
                            <div style="margin-top:8px;font-size:10px;color:#10b981;font-weight:700;">
                                <i class="fa-solid fa-check-circle"></i> Concluído
                            </div>
                        `}
                    </div>
                `).join('')}
            </div>
        `;
    } catch (err) {
        console.error('❌ Erro ao carregar conquistas:', err);
        list.innerHTML = `
            <div class="details-empty">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>Erro ao carregar conquistas</p>
            </div>
        `;
    }
}

// =============================================
// SUBSTITUIR BOTÕES PLACEHOLDER POR FUNÇÕES REAIS
// =============================================

function patchSidebarButtons() {
    const buttonMap = {
        'communityCalendarBtn': openCalendarModal,
        'communityMembersBtn': openMembersDirectoryModal,
        'communityRankingBtn': openAchievementsModal,
        'communityAboutBtn': createAboutModal
    };

    Object.keys(buttonMap).forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            // Remover listeners antigos clonando o elemento
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                buttonMap[id]();
            });
        }
    });

    // Atualizar label de "Classificação" para "Conquistas"
    const rankingBtn = document.getElementById('communityRankingBtn');
    if (rankingBtn) {
        const span = rankingBtn.querySelector('span');
        if (span) span.textContent = 'Conquistas';
        const icon = rankingBtn.querySelector('i');
        if (icon) {
            icon.className = 'fa-solid fa-trophy';
        }
    }
}

// =============================================
// APLICAR CORREÇÕES E SUBSTITUIÇÕES
// =============================================

function applyFixes() {
    // Substituir funções de carregamento
    if (typeof window.loadRealConversations === 'function') {
        window.loadRealConversations = loadRealConversationsFixed;
    }
    if (typeof window.loadRealEvents === 'function') {
        window.loadRealEvents = loadRealEventsFixed;
    }

    // Patch dos botões da sidebar
    patchSidebarButtons();

    console.log('✅ Correções Fase 1 aplicadas');
}

// Executar após o DOM e o comunidade-extras original carregarem
setTimeout(applyFixes, 1500);

// Reaplicar quando a sidebar for reconstruída
const sidebarObserver = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
        if (m.type === 'childList') {
            const sidebar = document.getElementById('communityInnerSidebar');
            if (sidebar && document.getElementById('communityCalendarBtn')) {
                patchSidebarButtons();
            }
        }
    });
});

setTimeout(() => {
    const mainContent = document.getElementById('mainContent') || document.querySelector('.main-content');
    if (mainContent) {
        sidebarObserver.observe(mainContent, { childList: true, subtree: false });
    }
}, 2000);

// Expor funções globalmente
window.openCalendarModal = openCalendarModal;
window.openMembersDirectoryModal = openMembersDirectoryModal;
window.openAchievementsModal = openAchievementsModal;
window.createAboutModal = createAboutModal;
window.loadGroupPostsFixed = loadGroupPostsFixed;

console.log('📦 Módulo Central da Comunidade (Fase 1) carregado');
/* ==========================================================================
   ATUALIZAÇÃO VISUAL — DEIXANDO A COMUNIDADE MAIS LEVE E ACOLHEDORA
   Adiciona imagens nos banners, gradientes suaves e elementos visuais
   ========================================================================== */

// =============================================
// BANCO DE IMAGENS PARA BANNERS
// =============================================
// Imagens do Unsplash que combinam com cada tipo de modal

const VISUAL_IMAGES = {
    calendar: [
        'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop&q=80'
    ],
    members: [
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop&q=80'
    ],
    achievements: [
        'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=1200&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop&q=80'
    ],
    about: [
        'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=400&fit=crop&q=80'
    ],
    events: [
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=400&fit=crop&q=80'
    ],
    conversations: [
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&h=400&fit=crop&q=80'
    ]
};

// =============================================
// ESTILOS VISUAIS MELHORADOS
// =============================================

function injectVisualImprovements() {
    if (document.getElementById('communityVisualImprovements')) return;

    const styles = document.createElement('style');
    styles.id = 'communityVisualImprovements';
    styles.textContent = `
        /* ==========================================
           BANNERS COM IMAGEM + OVERLAY SUAVE
           ========================================== */
        .details-modal-banner.visual-banner {
            position: relative;
            overflow: hidden;
            background-size: cover !important;
            background-position: center !important;
        }

        .details-modal-banner.visual-banner::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
                135deg,
                rgba(124, 58, 237, 0.65) 0%,
                rgba(236, 72, 153, 0.55) 50%,
                rgba(124, 58, 237, 0.7) 100%
            );
            z-index: 1;
        }

        .details-modal-banner.visual-banner::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
                to bottom,
                transparent 0%,
                rgba(0, 0, 0, 0.05) 60%,
                rgba(0, 0, 0, 0.25) 100%
            );
            z-index: 1;
        }

        .details-modal-banner.visual-banner > * {
            position: relative;
            z-index: 2;
        }

        /* Ícone decorativo grande no banner */
        .banner-decorative-icon {
            position: absolute;
            right: -20px;
            bottom: -30px;
            font-size: 180px;
            color: rgba(255, 255, 255, 0.08);
            z-index: 1;
            pointer-events: none;
            line-height: 1;
        }

        /* Badge flutuante no banner */
        .banner-floating-badge {
            position: absolute;
            top: 16px;
            left: 16px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            color: #7c3aed;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.3px;
            display: flex;
            align-items: center;
            gap: 6px;
            z-index: 3;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            animation: badgeFloat 3s ease-in-out infinite;
        }

        .banner-floating-badge i {
            font-size: 12px;
        }

        @keyframes badgeFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }

        /* ==========================================
           HEADER DO MODAL COM AVATAR SOBREPOSTO
           ========================================== */
        .details-modal-header.with-overlap {
            margin-top: -60px;
        }

        /* ==========================================
           CARDS DE STATS COM ÍCONES COLORIDOS
           ========================================== */
        .visual-stat-card {
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(124, 58, 237, 0.08);
        }

        .visual-stat-card::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.3s;
        }

        .visual-stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(124, 58, 237, 0.12);
        }

        .visual-stat-card:hover::before {
            opacity: 1;
        }

        .visual-stat-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px;
            font-size: 20px;
            color: #fff;
            position: relative;
            z-index: 1;
        }

        .visual-stat-icon.purple {
            background: linear-gradient(135deg, #8b5cf6, #a78bfa);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .visual-stat-icon.pink {
            background: linear-gradient(135deg, #ec4899, #f472b6);
            box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
        }

        .visual-stat-icon.green {
            background: linear-gradient(135deg, #10b981, #34d399);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .visual-stat-icon.amber {
            background: linear-gradient(135deg, #f59e0b, #fbbf24);
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        /* ==========================================
           ILUSTRAÇÕES E EMPTY STATES ACOLHEDORES
           ========================================== */
        .visual-empty-state {
            text-align: center;
            padding: 48px 24px;
            color: #9ca3af;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }

        .visual-empty-illustration {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(236, 72, 153, 0.08));
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            position: relative;
        }

        .visual-empty-illustration::after {
            content: '';
            position: absolute;
            inset: -8px;
            border-radius: 50%;
            border: 2px dashed rgba(124, 58, 237, 0.15);
            animation: emptyRotate 20s linear infinite;
        }

        @keyframes emptyRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .visual-empty-illustration i {
            font-size: 32px;
            color: #7c3aed;
            opacity: 0.7;
        }

        .visual-empty-state h4 {
            font-size: 15px;
            font-weight: 700;
            color: #4b5563;
            margin: 0;
        }

        .visual-empty-state p {
            font-size: 13px;
            color: #9ca3af;
            margin: 0;
            max-width: 280px;
            line-height: 1.5;
        }

        /* ==========================================
           SEÇÃO DE CALENDÁRIO COM DIAS ESPECIAIS
           ========================================== */
        .calendar-day-btn.has-event {
            position: relative;
            font-weight: 700;
        }

        .calendar-day-btn.has-event::after {
            content: '';
            position: absolute;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: linear-gradient(135deg, #7c3aed, #ec4899);
            box-shadow: 0 0 6px rgba(124, 58, 237, 0.5);
        }

        .calendar-day-btn.is-today {
            background: linear-gradient(135deg, #7c3aed, #ec4899) !important;
            color: #fff !important;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .calendar-day-btn.is-today::after {
            background: #fff;
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
        }

        /* ==========================================
           CARDS DE EVENTO DO CALENDÁRIO
           ========================================== */
        .calendar-event-item {
            position: relative;
            overflow: hidden;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .calendar-event-item::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: linear-gradient(180deg, #7c3aed, #ec4899);
            border-radius: 4px 0 0 4px;
        }

        .calendar-event-item:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 16px rgba(124, 58, 237, 0.1);
        }

        /* ==========================================
           MEMBER CARDS COM HOVER SUAVE
           ========================================== */
        .member-directory-item {
            position: relative;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 12px;
        }

        .member-directory-item:hover {
            background: linear-gradient(135deg, rgba(124, 58, 237, 0.04), rgba(236, 72, 153, 0.03));
            transform: translateX(4px);
        }

        .member-action-btn {
            transition: all 0.2s;
        }

        .member-action-btn:hover {
            background: linear-gradient(135deg, #7c3aed, #ec4899) !important;
            color: #fff !important;
            border-color: transparent !important;
            transform: scale(1.05);
        }

        /* ==========================================
           ACHIEVEMENT CARDS COM BRILHO
           ========================================== */
        .achievement-card {
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .achievement-card.unlocked {
            background: linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(236, 72, 153, 0.03));
        }

        .achievement-card.unlocked::before {
            content: '✨';
            position: absolute;
            top: 8px;
            right: 8px;
            font-size: 14px;
            opacity: 0.6;
            animation: sparkle 2s ease-in-out infinite;
        }

        @keyframes sparkle {
            0%, 100% { opacity: 0.6; transform: scale(1) rotate(0deg); }
            50% { opacity: 1; transform: scale(1.2) rotate(15deg); }
        }

        .achievement-card.unlocked:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 24px rgba(124, 58, 237, 0.15);
        }

        /* ==========================================
           BOTÕES COM GRADIENTE SUAVE
           ========================================== */
        .visual-btn-primary {
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            border: none;
            color: #fff;
            border-radius: 30px;
            padding: 12px 24px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .visual-btn-primary::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%);
            opacity: 0;
            transition: opacity 0.3s;
        }

        .visual-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(124, 58, 237, 0.35);
        }

        .visual-btn-primary:hover::before {
            opacity: 1;
        }

        .visual-btn-primary span,
        .visual-btn-primary i {
            position: relative;
            z-index: 1;
        }

        /* ==========================================
           SEPARADOR DECORATIVO
           ========================================== */
        .visual-divider {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 20px 0;
            color: #d1d5db;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .visual-divider::before,
        .visual-divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
        }

        /* ==========================================
           AVATARES COM ANEL DECORATIVO
           ========================================== */
        .avatar-ring {
            position: relative;
            display: inline-block;
        }

        .avatar-ring::before {
            content: '';
            position: absolute;
            inset: -3px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8b5cf6, #ec4899);
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s;
        }

        .avatar-ring:hover::before {
            opacity: 1;
        }

        /* ==========================================
           ONLINE INDICATOR ANIMADO
           ========================================== */
        .online-pulse {
            position: relative;
        }

        .online-pulse::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: #10b981;
            animation: onlinePulse 2s ease-out infinite;
            z-index: -1;
        }

        @keyframes onlinePulse {
            0% { transform: scale(1); opacity: 0.7; }
            100% { transform: scale(1.8); opacity: 0; }
        }

        /* ==========================================
           FUNDO SUAVE NOS MODAIS
           ========================================== */
        #communityCalendarModal .details-modal-container,
        #membersDirectoryModal .details-modal-container,
        #achievementsModal .details-modal-container,
        #communityAboutModal .details-modal-container {
            background: linear-gradient(180deg, #ffffff 0%, #fafafe 100%);
        }

        /* ==========================================
           SCROLLBAR SUAVE
           ========================================== */
        #communityCalendarModal .details-modal-content::-webkit-scrollbar,
        #membersDirectoryModal .details-modal-content::-webkit-scrollbar,
        #achievementsModal .details-modal-content::-webkit-scrollbar {
            width: 6px;
        }

        #communityCalendarModal .details-modal-content::-webkit-scrollbar-thumb,
        #membersDirectoryModal .details-modal-content::-webkit-scrollbar-thumb,
        #achievementsModal .details-modal-content::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #c4b5fd, #f9a8d4);
            border-radius: 10px;
        }

        /* ==========================================
           DARK MODE — AJUSTES VISUAIS
           ========================================== */
        body.a11y-dark-mode .banner-floating-badge {
            background: rgba(42, 42, 64, 0.95);
            color: #c4b5fd;
        }

        body.a11y-dark-mode .visual-empty-state h4 {
            color: #e8e8f0;
        }

        body.a11y-dark-mode .achievement-card.unlocked {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.1));
        }

        body.a11y-dark-mode .member-directory-item:hover {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(236, 72, 153, 0.08));
        }

        body.a11y-dark-mode #communityCalendarModal .details-modal-container,
        body.a11y-dark-mode #membersDirectoryModal .details-modal-container,
        body.a11y-dark-mode #achievementsModal .details-modal-container,
        body.a11y-dark-mode #communityAboutModal .details-modal-container {
            background: linear-gradient(180deg, #1a1a2e 0%, #16162a 100%);
        }
    `;

    document.head.appendChild(styles);
    console.log('🎨 Estilos visuais injetados');
}

// =============================================
// FUNÇÃO AUXILIAR — BANNER COM IMAGEM
// =============================================

function applyVisualBanner(bannerElement, category, iconName) {
    if (!bannerElement) return;

    const images = VISUAL_IMAGES[category] || VISUAL_IMAGES.events;
    const randomImage = images[Math.floor(Math.random() * images.length)];

    bannerElement.classList.add('visual-banner');
    bannerElement.style.backgroundImage = `url('${randomImage}')`;
    bannerElement.style.backgroundSize = 'cover';
    bannerElement.style.backgroundPosition = 'center';

    // Adicionar ícone decorativo grande
    const existingIcon = bannerElement.querySelector('.banner-decorative-icon');
    if (!existingIcon && iconName) {
        bannerElement.insertAdjacentHTML('beforeend', `
            <i class="fa-solid ${iconName} banner-decorative-icon"></i>
        `);
    }
}

// =============================================
// PATCH — CALENDÁRIO COM BANNER VISUAL
// =============================================

function enhanceCalendarModal() {
    // Banner limpo — sem imagem
    const banner = document.querySelector('#communityCalendarModal .details-modal-banner');
    if (banner) {
        banner.classList.remove('visual-banner');
        banner.style.background = 'var(--cx-bg-soft, #faf9f6)';
        banner.style.backgroundImage = 'none';
        banner.style.height = '80px';
        banner.querySelector('.banner-decorative-icon')?.remove();
    }
}

function enhanceMembersModal() {
    const banner = document.querySelector('#membersDirectoryModal .details-modal-banner');
    if (banner) {
        banner.classList.remove('visual-banner');
        banner.style.background = 'var(--cx-bg-soft, #faf9f6)';
        banner.style.backgroundImage = 'none';
        banner.style.height = '80px';
        banner.querySelector('.banner-decorative-icon')?.remove();
    }
}

function enhanceAchievementsModal() {
    const banner = document.querySelector('#achievementsModal .details-modal-banner');
    if (banner) {
        banner.classList.remove('visual-banner');
        banner.style.background = 'var(--cx-bg-soft, #faf9f6)';
        banner.style.backgroundImage = 'none';
        banner.style.height = '80px';
        banner.querySelector('.banner-decorative-icon')?.remove();
    }
}

function enhanceAboutModal() {
    const banner = document.querySelector('#communityAboutModal .details-modal-banner');
    if (banner) {
        banner.classList.remove('visual-banner');
        banner.style.background = 'var(--cx-bg-soft, #faf9f6)';
        banner.style.backgroundImage = 'none';
        banner.style.height = '80px';
        banner.style.display = 'block';
        banner.querySelector('.banner-decorative-icon')?.remove();
    }
}

// =============================================
// PATCH — MEMBROS COM BANNER VISUAL
// =============================================

function enhanceMembersModal() {
    const banner = document.querySelector('#membersDirectoryModal .details-modal-banner');
    if (banner && !banner.classList.contains('visual-banner')) {
        applyVisualBanner(banner, 'members', 'fa-users');

        if (!banner.querySelector('.banner-floating-badge')) {
            banner.insertAdjacentHTML('afterbegin', `
                <div class="banner-floating-badge">
                    <i class="fa-solid fa-heart"></i>
                    <span>Nossa Comunidade</span>
                </div>
            `);
        }
    }
}

// =============================================
// PATCH — CONQUISTAS COM BANNER VISUAL
// =============================================

function enhanceAchievementsModal() {
    const banner = document.querySelector('#achievementsModal .details-modal-banner');
    if (banner && !banner.classList.contains('visual-banner')) {
        applyVisualBanner(banner, 'achievements', 'fa-trophy');

        if (!banner.querySelector('.banner-floating-badge')) {
            banner.insertAdjacentHTML('afterbegin', `
                <div class="banner-floating-badge">
                    <i class="fa-solid fa-star"></i>
                    <span>Sua Jornada</span>
                </div>
            `);
        }
    }
}

// =============================================
// PATCH — SOBRE COM BANNER VISUAL
// =============================================

function enhanceAboutModal() {
    const banner = document.querySelector('#communityAboutModal .details-modal-banner');
    if (banner && !banner.classList.contains('visual-banner')) {
        // Para o Sobre, usar um banner mais especial
        banner.classList.add('visual-banner');
        banner.style.backgroundImage = `url('${VISUAL_IMAGES.about[0]}')`;
        banner.style.backgroundSize = 'cover';
        banner.style.backgroundPosition = 'center';
        banner.style.height = '180px';
        banner.style.display = 'flex';
        banner.style.alignItems = 'center';
        banner.style.justifyContent = 'center';

        // Remover ícone heart antigo se existir
        const oldIcon = banner.querySelector('i.fa-heart:not(.banner-decorative-icon)');
        if (oldIcon && !oldIcon.classList.contains('fa-xmark')) {
            oldIcon.style.position = 'relative';
            oldIcon.style.zIndex = '2';
            oldIcon.style.fontSize = '70px';
            oldIcon.style.color = '#fff';
            oldIcon.style.textShadow = '0 4px 20px rgba(0,0,0,0.3)';
            oldIcon.style.opacity = '0.95';
            oldIcon.style.animation = 'badgeFloat 3s ease-in-out infinite';
        }

        banner.insertAdjacentHTML('beforeend', `
            <i class="fa-solid fa-heart banner-decorative-icon"></i>
        `);

        if (!banner.querySelector('.banner-floating-badge')) {
            banner.insertAdjacentHTML('afterbegin', `
                <div class="banner-floating-badge">
                    <i class="fa-solid fa-hand-holding-heart"></i>
                    <span>Amor NeuroDivergente</span>
                </div>
            `);
        }
    }
}

// =============================================
// PATCH — EVENTOS COM BANNER VISUAL
// =============================================

function enhanceEventDetailsModal() {
    const banner = document.querySelector('#eventDetailsModal .details-modal-banner');
    if (banner && !banner.classList.contains('visual-banner') && !banner.style.backgroundImage.includes('url')) {
        // Só aplicar se não tiver imagem do evento
        applyVisualBanner(banner, 'events', 'fa-calendar-check');
    }
}

// =============================================
// PATCH — GRUPO COM BANNER VISUAL (quando sem imagem)
// =============================================

function enhanceGroupDetailsModal() {
    const banner = document.querySelector('#groupDetailsModal .details-modal-banner');
    if (banner && !banner.classList.contains('visual-banner') && !banner.style.backgroundImage.includes('url')) {
        applyVisualBanner(banner, 'conversations', 'fa-users');
    }
}

// =============================================
// MELHORAR EMPTY STATES COM ILUSTRAÇÕES
// =============================================

function enhanceEmptyStates() {
    // Substituir todos os .details-empty por versão ilustrada
    document.querySelectorAll('.details-empty').forEach(empty => {
        if (empty.classList.contains('visual-enhanced')) return;
        empty.classList.add('visual-enhanced');

        const icon = empty.querySelector('i');
        const text = empty.querySelector('p');

        if (icon && text) {
            const iconClass = icon.className;
            const textContent = text.textContent;

            empty.classList.add('visual-empty-state');
            empty.innerHTML = `
                <div class="visual-empty-illustration">
                    <i class="${iconClass}"></i>
                </div>
                <h4>${escapeHtml(textContent)}</h4>
                <p>Volte mais tarde ou explore outras áreas da comunidade 💜</p>
            `;
        }
    });
}

// =============================================
// MELHORAR CARDS DE STATS NO "SOBRE"
// =============================================

function enhanceAboutStats() {
    const aboutContent = document.querySelector('#communityAboutModal .details-modal-content');
    if (!aboutContent) return;

    // Aplicar classes visuais aos cards de stats
    const statCards = aboutContent.querySelectorAll('div[style*="text-align:center"]');
    statCards.forEach((card, index) => {
        if (card.querySelector('.visual-stat-icon')) return;

        const icon = card.querySelector('i');
        if (!icon) return;

        const colors = ['purple', 'pink', 'green', 'amber'];
        const color = colors[index % colors.length];

        // Substituir estrutura do ícone
        const iconClass = icon.className;
        icon.parentElement.innerHTML = `
            <div class="visual-stat-icon ${color}">
                <i class="${iconClass}"></i>
            </div>
            ${icon.parentElement.innerHTML.replace(/<i[^>]*>.*?<\/i>/, '')}
        `;

        card.classList.add('visual-stat-card');
    });
}

// =============================================
// MELHORAR ACHIEVEMENT CARDS
// =============================================

function enhanceAchievementCards() {
    const achievementsList = document.getElementById('achievementsList');
    if (!achievementsList) return;

    const cards = achievementsList.querySelectorAll('div[style*="text-align:center"][style*="border-radius:12px"]');
    cards.forEach(card => {
        if (card.classList.contains('achievement-card')) return;

        const isUnlocked = card.style.opacity === '1' ||
                          card.style.background.includes('124,58,237,0.03');

        card.classList.add('achievement-card');
        if (isUnlocked) {
            card.classList.add('unlocked');
        }
    });
}

// =============================================
// MELHORAR CALENDÁRIO VISUALMENTE
// =============================================

function enhanceCalendarVisuals() {
    // Melhorar botões de dias com eventos
    document.querySelectorAll('.calendar-day-btn').forEach(btn => {
        const hasDot = btn.querySelector('span[style*="border-radius:50%"]');
        if (hasDot) {
            btn.classList.add('has-event');
        }
    });
}

// =============================================
// MELHORAR MEMBER CARDS
// =============================================

function enhanceMemberCards() {
    document.querySelectorAll('.member-directory-item').forEach(item => {
        if (item.classList.contains('visual-enhanced')) return;
        item.classList.add('visual-enhanced');

        const avatar = item.querySelector('.details-member-avatar');
        if (avatar) {
            avatar.classList.add('avatar-ring');
        }

        const onlineDot = item.querySelector('span[style*="background:#10b981"]');
        if (onlineDot) {
            onlineDot.classList.add('online-pulse');
        }
    });
}

// =============================================
// APLICAR TODAS AS MELHORIAS VISUAIS
// =============================================

function applyAllVisualEnhancements() {
    enhanceCalendarModal();
    enhanceMembersModal();
    enhanceAchievementsModal();
    enhanceAboutModal();
    enhanceEventDetailsModal();
    enhanceGroupDetailsModal();

    // Aguardar renderização e aplicar nos conteúdos
    setTimeout(() => {
        enhanceEmptyStates();
        enhanceAboutStats();
        enhanceAchievementCards();
        enhanceCalendarVisuals();
        enhanceMemberCards();
    }, 300);
}

// =============================================
// OBSERVER — APLICAR QUANDO MODAIS ABRIREM
// =============================================

function setupVisualObserver() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'hidden') {
                const target = mutation.target;
                if (!target.hasAttribute('hidden')) {
                    // Modal foi aberto, aplicar melhorias
                    setTimeout(() => {
                        applyAllVisualEnhancements();
                    }, 100);
                }
            }
        });
    });

    // Observar todos os modais relevantes
    const modals = [
        'communityCalendarModal',
        'membersDirectoryModal',
        'achievementsModal',
        'communityAboutModal',
        'eventDetailsModal',
        'groupDetailsModal',
        'userProfileDetailsModal'
    ];

    modals.forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            observer.observe(modal, { attributes: true, attributeFilter: ['hidden'] });
        }
    });

    // Observer para quando os modais forem criados
    const bodyObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.id && modals.includes(node.id)) {
                    observer.observe(node, { attributes: true, attributeFilter: ['hidden'] });
                }
            });
        });
    });

    bodyObserver.observe(document.body, { childList: true });
}

// =============================================
// INICIALIZAÇÃO
// =============================================

function initVisualEnhancements() {
    console.log('🎨 Iniciando melhorias visuais...');

    // Injetar estilos
    injectVisualImprovements();

    // Aplicar melhorias iniciais
    setTimeout(applyAllVisualEnhancements, 1000);

    // Configurar observer para modais
    setupVisualObserver();

    // Reaplicar periodicamente para pegar elementos dinâmicos
    setInterval(() => {
        enhanceMemberCards();
        enhanceEmptyStates();
    }, 3000);

    console.log('✅ Melhorias visuais aplicadas');
}

// Executar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisualEnhancements);
} else {
    setTimeout(initVisualEnhancements, 1000);
}

// Expor funções globalmente
window.applyAllVisualEnhancements = applyAllVisualEnhancements;
window.enhanceEmptyStates = enhanceEmptyStates;

console.log('📦 Módulo de melhorias visuais carregado');

})();