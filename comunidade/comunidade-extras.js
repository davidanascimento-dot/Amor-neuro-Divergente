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
                const initial = (p.username || 'U').charAt(0).toUpperCase();
                const bgColor = stringToColor(p.id);
                const hasImg = p.avatar_url && p.avatar_url !== CONFIG.avatarPadrao;

                return `
                    <div class="community-inner-member-item" data-user-id="${p.id}" title="${escapeHtml(p.username)}">
                        <div class="community-inner-member-avatar" style="background:${bgColor};">
                            ${hasImg
                                ? `<img src="${p.avatar_url}" alt="" onerror="this.outerHTML='<span style=\\'color:#fff;font-weight:700;font-size:12px;\\'>${initial}</span>'">`
                                : `<span style="color:#fff;font-weight:700;font-size:12px;">${initial}</span>`}
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
                banner.style.background = `linear-gradient(135deg, ${bgColor}, #ec4899)`;
                if (group.image_url) {
                    banner.style.backgroundImage = `linear-gradient(135deg, rgba(0,0,0,0.35), rgba(0,0,0,0.1)), url('${group.image_url}')`;
                    banner.style.backgroundSize = 'cover';
                    banner.style.backgroundPosition = 'center';
                }
            }

            if (avatarEl) {
                avatarEl.style.background = bgColor;
                if (group.image_url && group.image_url !== '/img/grupo-padrao.png') {
                    avatarEl.innerHTML = `<img src="${group.image_url}" alt="">`;
                } else {
                    avatarEl.innerHTML = `<span>${(group.name || 'G').charAt(0).toUpperCase()}</span>`;
                }
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
                const initial = (profile.username || 'U').charAt(0).toUpperCase();
                const bgColor = stringToColor(m.user_id);

                return `
                    <div class="details-member-item" data-user-id="${m.user_id}">
                        <div class="details-member-avatar" style="background:${bgColor};">
                            ${profile.avatar_url && profile.avatar_url !== CONFIG.avatarPadrao
                                ? `<img src="${profile.avatar_url}" alt="" onerror="this.outerHTML='<span style=\\'color:#fff;font-weight:700;\\'>${initial}</span>'">`
                                : `<span style="color:#fff;font-weight:700;">${initial}</span>`}
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

            if (banner) banner.style.background = `linear-gradient(135deg, ${bgColor}, #ec4899)`;

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
            const { data: ev, error } = await supabase.from('events').select('*').eq('id', eventId).single();
            if (error || !ev) throw new Error('Evento não encontrado');

            const date = new Date(ev.date);
            const bgColor = stringToColor(ev.id);

            if (banner) {
                banner.style.background = `linear-gradient(135deg, ${bgColor}, #ec4899)`;
                if (ev.image_url) {
                    banner.style.backgroundImage = `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.1)), url('${ev.image_url}')`;
                    banner.style.backgroundSize = 'cover';
                    banner.style.backgroundPosition = 'center';
                }
            }

            if (titleEl) titleEl.textContent = ev.title || 'Evento';
            if (descEl) descEl.textContent = ev.description || 'Sem descrição';
            if (dateEl) dateEl.textContent = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
            if (timeEl) timeEl.textContent = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            if (partEl) partEl.textContent = ev.participants || 0;

            if (joinBtn) {
                joinBtn.onclick = async () => {
                    if (!currentUser) {
                        if (typeof window.showToast === 'function') window.showToast('Faça login para participar', 'error');
                        return;
                    }
                    const { error } = await supabase.from('event_participants').insert({ event_id: eventId, user_id: currentUser.id });
                    if (!error) {
                        if (typeof window.showToast === 'function') window.showToast('Presença confirmada! 🎉', 'success');
                        joinBtn.innerHTML = '<i class="fa-solid fa-check"></i> Confirmado';
                        joinBtn.style.background = '#10b981';
                    } else {
                        if (typeof window.showToast === 'function') window.showToast('Erro ao confirmar', 'error');
                    }
                };
            }
        } catch (err) {
            if (titleEl) titleEl.textContent = 'Erro';
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

            .community-inner-sidebar {
                position: fixed;
                top: ${CONFIG.headerOffsetTop}px;
                left: 0;
                width: ${CONFIG.innerSidebarExpanded}px;
                height: calc(100vh - ${CONFIG.headerOffsetTop}px);
                background: #ffffff;
                border-right: 1px solid #e5e7eb;
                z-index: 95;
                overflow-y: auto;
                overflow-x: hidden;
                display: flex;
                flex-direction: column;
                transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                font-family: 'Inter', sans-serif;
                box-shadow: 2px 0 10px rgba(0,0,0,0.02);
            }
            .community-inner-sidebar.collapsed { width: ${CONFIG.innerSidebarCollapsed}px; }
            .community-inner-sidebar::-webkit-scrollbar { width: 5px; }
            .community-inner-sidebar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

            .community-inner-header {
                display: flex; align-items: center; gap: 12px;
                padding: 14px; border-bottom: 1px solid #f0f0f0;
                position: sticky; top: 0; background: #fff; z-index: 5;
                min-height: 60px; flex-shrink: 0;
            }
            .community-inner-toggle {
                width: 36px; height: 36px; border-radius: 8px; border: none;
                background: #f3f4f6; color: #4b5563; font-size: 16px;
                cursor: pointer; display: flex; align-items: center; justify-content: center;
                transition: all 0.2s; flex-shrink: 0;
            }
            .community-inner-toggle:hover { background: #e5e7eb; color: #7c3aed; }

            .community-inner-brand {
                font-size: 15px; font-weight: 800;
                background: linear-gradient(135deg, #9333ea, #ec4899);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                background-clip: text; white-space: nowrap; overflow: hidden;
                opacity: 1; transition: opacity 0.2s;
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
                padding: 10px 14px; border-radius: 10px;
                color: #4b5563; text-decoration: none;
                font-size: 14px; font-weight: 500;
                transition: all 0.15s; cursor: pointer; overflow: hidden;
            }
            .community-inner-nav-item i {
                font-size: 17px; width: 20px; text-align: center;
                color: #6b7280; flex-shrink: 0;
            }
            .community-inner-nav-item span,
            .community-inner-nav-item .tab-badge {
                white-space: nowrap;
                opacity: 1;
                transition: opacity 0.2s;
            }
            .community-inner-sidebar.collapsed .community-inner-nav-item span,
            .community-inner-sidebar.collapsed .community-inner-nav-item .tab-badge {
                opacity: 0; width: 0; pointer-events: none;
            }
            .community-inner-sidebar.collapsed .community-inner-nav-item {
                justify-content: center; padding: 10px 0;
            }
            .community-inner-nav-item:hover { background: #f3f4f6; color: #111827; }
            .community-inner-nav-item:hover i { color: #7c3aed; }
            .community-inner-nav-item.active {
                background: linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.08));
                color: #7c3aed; font-weight: 700;
            }
            .community-inner-nav-item.active i { color: #7c3aed; }

            /* Tab badge dentro da sidebar */
            .community-inner-nav-item .tab-badge {
                background: #f3f4f6;
                color: #6b7280;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 700;
                margin-left: auto;
            }
            .community-inner-nav-item.active .tab-badge {
                background: rgba(124,58,237,0.15);
                color: #7c3aed;
            }
            .community-inner-nav-item .tab-badge.active-dot {
                background: transparent; color: #10b981; font-size: 16px; padding: 0;
            }

            .community-inner-section {
                padding: 12px 10px; border-top: 1px solid #f0f0f0; flex-shrink: 0;
            }
            .community-inner-section-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 6px 8px; margin-bottom: 6px;
                font-size: 11px; font-weight: 700; text-transform: uppercase;
                letter-spacing: 0.5px; color: #9ca3af; min-height: 20px;
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
                width: 24px; height: 24px; padding: 0; border: none;
                border-radius: 50%;
                background: linear-gradient(135deg, #9333ea, #ec4899);
                color: #fff; font-size: 11px; cursor: pointer;
                transition: all 0.2s; flex-shrink: 0;
            }
            .community-inner-section-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 2px 8px rgba(124,58,237,0.3);
            }

            .community-inner-group-list,
            .community-inner-member-list {
                display: flex; flex-direction: column; gap: 2px;
            }
            .community-inner-group-item,
            .community-inner-member-item {
                display: flex; align-items: center; gap: 10px;
                padding: 8px 10px; border-radius: 10px;
                transition: all 0.15s; cursor: pointer; overflow: hidden;
            }
            .community-inner-group-item:hover,
            .community-inner-member-item:hover { background: #f3f4f6; }
            .community-inner-sidebar.collapsed .community-inner-group-item,
            .community-inner-sidebar.collapsed .community-inner-member-item {
                justify-content: center; padding: 8px 0;
            }
            .community-inner-group-avatar,
            .community-inner-member-avatar {
                width: 32px; height: 32px; border-radius: 10px; overflow: hidden;
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
                font-size: 13px; font-weight: 600; color: #1f2937;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .community-inner-group-meta,
            .community-inner-member-role { font-size: 11px; color: #9ca3af; }

            .community-inner-loading,
            .community-inner-empty {
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                padding: 16px 10px; color: #9ca3af;
                font-size: 12px; gap: 6px; text-align: center;
            }
            .community-inner-loading i,
            .community-inner-empty i { font-size: 16px; opacity: 0.5; }

            /* SIDEBAR DIREITA */
            .community-right-sidebar {
                position: fixed; top: ${CONFIG.headerOffsetTop}px; right: 16px;
                width: 320px;
                max-height: calc(100vh - ${CONFIG.headerOffsetTop + 20}px);
                overflow-y: auto; padding: 0; z-index: 90;
                display: flex; flex-direction: column; gap: 16px;
            }
            .community-right-sidebar::-webkit-scrollbar { width: 5px; }
            .community-right-sidebar::-webkit-scrollbar-thumb {
                background: #cbd5e1; border-radius: 10px;
            }
            .community-right-card {
                background: #ffffff; border-radius: 16px;
                border: 1px solid #e5e7eb; padding: 16px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.04);
            }
            .community-right-header {
                display: flex; align-items: center; justify-content: space-between;
                margin-bottom: 14px;
            }
            .community-right-header h3 {
                font-size: 15px; font-weight: 700; color: #1f2937;
                margin: 0; display: flex; align-items: center; gap: 8px;
            }
            .community-right-header h3 i { color: #7c3aed; }
            .community-see-all {
                font-size: 12px; color: #7c3aed; text-decoration: none; font-weight: 600;
                cursor: pointer;
            }
            .community-see-all:hover { text-decoration: underline; }
            .community-btn-nova {
                padding: 4px 14px; border: 1px solid #e5e7eb; border-radius: 20px;
                background: #f9fafb; color: #6b7280; font-size: 11px;
                font-weight: 700; cursor: pointer; transition: all 0.2s;
            }
            .community-btn-nova:hover {
                border-color: #7c3aed; color: #7c3aed;
                background: rgba(124,58,237,0.05);
            }

            .community-event-featured {
                border-radius: 12px; overflow: hidden;
                border: 1px solid #f0f0f0; margin-bottom: 12px;
                background: #fff; cursor: pointer;
            }
            .community-event-cover {
                height: 110px; position: relative; overflow: hidden;
                background: #1e293b;
            }
            .community-event-cover img {
                width: 100%; height: 100%; object-fit: cover;
            }
            .community-event-live {
                position: absolute; bottom: 8px; left: 8px;
                background: rgba(239,68,68,0.95); color: #fff;
                font-size: 10px; font-weight: 700; padding: 4px 10px;
                border-radius: 12px; display: flex; align-items: center; gap: 5px;
            }
            .community-live-dot {
                width: 6px; height: 6px; border-radius: 50%;
                background: #fff; animation: communityLivePulse 1.5s infinite;
                display: inline-block;
            }
            @keyframes communityLivePulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.3); }
            }
            .community-event-featured-body { padding: 12px; }
            .community-event-featured-body h4 {
                font-size: 14px; font-weight: 700; color: #1f2937; margin: 0 0 6px 0;
            }
            .community-event-meta {
                font-size: 12px; color: #6b7280; margin-bottom: 10px;
                display: flex; align-items: center; gap: 6px;
            }
            .community-event-meta i { color: #7c3aed; }
            .community-event-attendees {
                display: flex; align-items: center; gap: 6px; margin-bottom: 10px;
            }
            .community-attendees-avatars { display: flex; }
            .community-attendees-avatars img {
                width: 22px; height: 22px; border-radius: 50%;
                border: 2px solid #fff; margin-left: -6px; object-fit: cover;
            }
            .community-attendees-avatars img:first-child { margin-left: 0; }
            .community-attendees-count {
                font-size: 11px; color: #6b7280; font-weight: 600;
            }
            .community-event-join-btn {
                width: 100%; padding: 9px; border: none; border-radius: 30px;
                background: linear-gradient(135deg, #7c3aed, #ec4899);
                color: #fff; font-size: 12px; font-weight: 700;
                cursor: pointer; display: flex; align-items: center;
                justify-content: center; gap: 6px; transition: all 0.2s;
            }
            .community-event-join-btn:hover {
                transform: scale(1.02);
                box-shadow: 0 4px 12px rgba(124,58,237,0.3);
            }

            .community-event-mini {
                display: flex; gap: 10px; padding: 10px 0;
                border-top: 1px solid #f0f0f0; align-items: center;
                cursor: pointer; transition: background 0.15s; border-radius: 8px;
            }
            .community-event-mini:hover { background: #f9fafb; }
            .community-event-mini:first-of-type { border-top: none; }
            .community-event-mini-cover {
                width: 56px; height: 56px; border-radius: 10px;
                overflow: hidden; background: #f3f4f6; flex-shrink: 0;
            }
            .community-event-mini-cover img {
                width: 100%; height: 100%; object-fit: cover;
            }
            .community-event-mini-info { flex: 1; min-width: 0; }
            .community-event-mini-info h5 {
                font-size: 13px; font-weight: 700; color: #1f2937;
                margin: 0 0 4px 0; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis;
            }
            .community-event-mini-meta {
                display: flex; gap: 8px; font-size: 11px;
                color: #9ca3af; flex-wrap: wrap;
            }
            .community-event-mini-meta i { color: #7c3aed; margin-right: 2px; }

            .community-conversations-list {
                display: flex; flex-direction: column; gap: 2px; margin-bottom: 12px;
            }
            .community-conversation-item {
                display: flex; align-items: center; gap: 10px;
                padding: 8px 6px; border-radius: 10px;
                transition: background 0.15s; cursor: pointer;
            }
            .community-conversation-item:hover { background: #f9fafb; }
            .community-conv-avatar-wrapper { position: relative; flex-shrink: 0; }
            .community-conv-avatar {
                width: 36px; height: 36px; border-radius: 50%;
                overflow: hidden; display: flex;
                align-items: center; justify-content: center;
            }
            .community-conv-online {
                position: absolute; bottom: 0; right: 0;
                width: 10px; height: 10px; border-radius: 50%;
                background: #10b981; border: 2px solid #fff;
            }
            .community-conv-info {
                flex: 1; min-width: 0; display: flex; flex-direction: column;
            }
            .community-conv-name {
                font-size: 13px; font-weight: 700; color: #1f2937;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .community-conv-preview {
                font-size: 11px; color: #9ca3af;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .community-conv-time {
                font-size: 10px; color: #9ca3af; flex-shrink: 0;
            }
            .community-btn-enter-chats {
                width: 100%; padding: 11px; border: none; border-radius: 30px;
                background: linear-gradient(135deg, #7c3aed, #ec4899);
                color: #fff; font-size: 13px; font-weight: 700;
                cursor: pointer; display: flex; align-items: center;
                justify-content: center; gap: 8px; transition: all 0.2s;
            }
            .community-btn-enter-chats:hover {
                transform: scale(1.02);
                box-shadow: 0 4px 16px rgba(124,58,237,0.35);
            }

            /* MODAIS */
            .details-modal-container {
                background: #fff; border-radius: 20px; max-width: 640px;
                width: 100%; max-height: 88vh; overflow-y: auto;
                box-shadow: 0 24px 60px rgba(0,0,0,0.2);
                animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                font-family: 'Inter', sans-serif;
            }
            @keyframes modalIn {
                from { opacity: 0; transform: scale(0.95) translateY(20px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .details-modal-banner {
                height: 140px; background: linear-gradient(135deg, #9333ea, #ec4899);
                border-radius: 20px 20px 0 0; position: relative;
                background-size: cover; background-position: center;
            }
            .details-modal-close {
                position: absolute; top: 12px; right: 12px;
                width: 36px; height: 36px; border-radius: 50%; border: none;
                background: rgba(0,0,0,0.4); color: #fff; font-size: 16px;
                cursor: pointer; display: flex; align-items: center;
                justify-content: center; backdrop-filter: blur(4px);
                transition: all 0.2s;
            }
            .details-modal-close:hover {
                background: rgba(0,0,0,0.6); transform: scale(1.05);
            }
            .details-modal-header {
                padding: 0 24px 16px; margin-top: -50px; position: relative;
            }
            .details-modal-avatar-wrapper {
                display: flex; align-items: flex-end;
                justify-content: space-between; margin-bottom: 12px;
                flex-wrap: wrap; gap: 12px;
            }
            .details-modal-avatar {
                width: 96px; height: 96px; border-radius: 50%;
                background: #7c3aed; display: flex;
                align-items: center; justify-content: center;
                border: 5px solid #fff;
                box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                overflow: hidden; flex-shrink: 0;
                font-size: 32px; font-weight: 700; color: #fff;
            }
            .details-modal-avatar img {
                width: 100%; height: 100%; object-fit: cover;
            }
            .details-modal-join-btn {
                padding: 9px 22px; border: none; border-radius: 30px;
                background: linear-gradient(135deg, #9333ea, #ec4899);
                color: #fff; font-size: 13px; font-weight: 700;
                cursor: pointer; display: flex; align-items: center;
                gap: 6px; transition: all 0.2s; margin-top: 60px;
            }
            .details-modal-join-btn:hover:not(:disabled) {
                transform: scale(1.03);
                box-shadow: 0 4px 16px rgba(124,58,237,0.35);
            }
            .details-modal-join-btn:disabled {
                cursor: not-allowed; opacity: 0.7;
            }
            .details-modal-name {
                font-size: 24px; font-weight: 800; color: #1f2937;
                margin: 0 0 6px 0;
            }
            .details-modal-description {
                font-size: 14px; color: #6b7280;
                line-height: 1.6; margin: 0 0 12px 0;
            }
            .details-modal-meta {
                display: flex; gap: 14px; flex-wrap: wrap;
                font-size: 13px; color: #6b7280; align-items: center;
            }
            .details-modal-meta i { color: #7c3aed; margin-right: 4px; }
            .details-modal-badge {
                padding: 3px 12px; border-radius: 20px;
                background: rgba(16,185,129,0.1); color: #10b981;
                font-size: 11px; font-weight: 700;
                display: inline-flex; align-items: center; gap: 4px;
            }
            .details-modal-status {
                display: inline-flex; align-items: center;
                gap: 5px; font-size: 12px; color: #10b981; font-weight: 600;
            }
            .details-live-dot {
                width: 6px; height: 6px; border-radius: 50%;
                background: #10b981;
                animation: communityLivePulse 1.5s infinite;
                display: inline-block;
            }
            .details-modal-tabs {
                display: flex; gap: 4px; padding: 0 24px;
                border-bottom: 1px solid #e5e7eb; margin-top: 8px;
            }
            .details-modal-tab {
                padding: 12px 18px; border: none; background: transparent;
                color: #6b7280; font-size: 14px; font-weight: 600;
                cursor: pointer; border-bottom: 3px solid transparent;
                margin-bottom: -1px; transition: all 0.2s;
            }
            .details-modal-tab:hover { color: #1f2937; }
            .details-modal-tab.active {
                color: #7c3aed; border-bottom-color: #7c3aed;
            }
            .details-modal-content {
                padding: 20px 24px 24px; max-height: 400px; overflow-y: auto;
            }
            .details-modal-tab-content { display: none; }
            .details-modal-tab-content.active {
                display: block; animation: fadeIn 0.25s ease;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .details-post-item {
                padding: 14px 0; border-bottom: 1px solid #f0f0f0;
            }
            .details-post-item:last-child { border-bottom: none; }
            .details-post-header {
                display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
            }
            .details-post-avatar {
                width: 36px; height: 36px; border-radius: 50%;
                overflow: hidden; display: flex;
                align-items: center; justify-content: center; flex-shrink: 0;
            }
            .details-post-avatar img {
                width: 100%; height: 100%; object-fit: cover;
            }
            .details-post-author { display: flex; flex-direction: column; }
            .details-post-author span {
                font-size: 13px; font-weight: 700; color: #1f2937;
            }
            .details-post-author small {
                font-size: 11px; color: #9ca3af;
            }
            .details-post-title {
                font-size: 15px; font-weight: 700; color: #1f2937;
                margin: 0 0 6px 0;
            }
            .details-post-text {
                font-size: 13px; color: #6b7280;
                line-height: 1.6; margin: 0 0 10px 0;
            }
            .details-post-meta {
                display: flex; gap: 16px; font-size: 12px; color: #9ca3af;
            }
            .details-post-meta i { color: #7c3aed; margin-right: 4px; }
            .details-empty {
                padding: 40px 20px; text-align: center; color: #9ca3af;
                display: flex; flex-direction: column;
                align-items: center; gap: 10px;
            }
            .details-empty i { font-size: 32px; opacity: 0.4; }
            .details-member-item {
                display: flex; align-items: center; gap: 12px;
                padding: 10px 8px; border-radius: 10px;
                cursor: pointer; transition: background 0.15s;
            }
            .details-member-item:hover { background: #f9fafb; }
            .details-member-avatar {
                width: 40px; height: 40px; border-radius: 50%;
                overflow: hidden; display: flex;
                align-items: center; justify-content: center; flex-shrink: 0;
            }
            .details-member-avatar img {
                width: 100%; height: 100%; object-fit: cover;
            }
            .details-member-info { display: flex; flex-direction: column; }
            .details-member-name {
                font-size: 14px; font-weight: 700; color: #1f2937;
            }
            .details-member-role { font-size: 12px; color: #9ca3af; }
            .details-about h4 {
                font-size: 16px; font-weight: 700; color: #1f2937;
                margin: 0 0 8px 0;
            }
            .details-about p {
                font-size: 14px; color: #6b7280;
                line-height: 1.7; margin: 0 0 16px 0;
            }
            .details-about-meta {
                display: flex; flex-direction: column;
                gap: 8px; font-size: 13px; color: #4b5563;
            }
            .details-about-meta strong { color: #1f2937; }
            .user-profile-stats {
                display: flex; gap: 20px; padding: 16px 0;
                border-top: 1px solid #e5e7eb;
                border-bottom: 1px solid #e5e7eb;
                justify-content: space-around; margin-top: 16px;
            }
            .user-profile-stat {
                display: flex; flex-direction: column; align-items: center;
            }
            .user-profile-stat strong {
                font-size: 18px; font-weight: 800; color: #1f2937;
            }
            .user-profile-stat span {
                font-size: 11px; color: #9ca3af;
                text-transform: uppercase; letter-spacing: 0.5px;
            }
            .user-profile-actions { display: flex; gap: 10px; flex-wrap: wrap; }
            .user-profile-btn {
                flex: 1; min-width: 140px; padding: 12px 20px;
                border-radius: 30px; font-size: 14px; font-weight: 700;
                cursor: pointer; display: flex;
                align-items: center; justify-content: center;
                gap: 8px; transition: all 0.2s;
                font-family: 'Inter', sans-serif;
            }
            .user-profile-btn-chat {
                border: none;
                background: linear-gradient(135deg, #9333ea, #ec4899);
                color: #fff;
            }
            .user-profile-btn-chat:hover {
                transform: scale(1.02);
                box-shadow: 0 4px 16px rgba(124,58,237,0.35);
            }
            .user-profile-btn-add {
                border: 1px solid #e5e7eb; background: #f9fafb; color: #1f2937;
            }
            .user-profile-btn-add:hover {
                border-color: #7c3aed; color: #7c3aed;
            }

            /* RESPONSIVO */
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
                    box-shadow: 4px 0 20px rgba(0,0,0,0.1);
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

            /* DARK MODE */
            body.a11y-dark-mode .community-inner-sidebar,
            body.a11y-dark-mode .community-right-card,
            body.a11y-dark-mode .details-modal-container {
                background: #1a1a2e !important;
                border-color: #2d2d44 !important;
            }
            body.a11y-dark-mode .community-inner-header {
                background: #1a1a2e !important;
                border-color: #2d2d44 !important;
            }
            body.a11y-dark-mode .community-inner-toggle {
                background: #2a2a40 !important; color: #a8a8c0 !important;
            }
            body.a11y-dark-mode .community-inner-nav-item,
            body.a11y-dark-mode .community-inner-group-name,
            body.a11y-dark-mode .community-inner-member-name,
            body.a11y-dark-mode .community-right-header h3,
            body.a11y-dark-mode .community-event-featured-body h4,
            body.a11y-dark-mode .community-event-mini-info h5,
            body.a11y-dark-mode .community-conv-name,
            body.a11y-dark-mode .details-modal-name,
            body.a11y-dark-mode .details-modal-description,
            body.a11y-dark-mode .details-post-title,
            body.a11y-dark-mode .details-post-author span,
            body.a11y-dark-mode .details-member-name,
            body.a11y-dark-mode .user-profile-stat strong,
            body.a11y-dark-mode .details-about h4 {
                color: #e8e8f0 !important;
            }
            body.a11y-dark-mode .community-inner-nav-item:hover,
            body.a11y-dark-mode .community-inner-group-item:hover,
            body.a11y-dark-mode .community-inner-member-item:hover,
            body.a11y-dark-mode .community-conversation-item:hover,
            body.a11y-dark-mode .details-member-item:hover {
                background: #2a2a40 !important;
            }
            body.a11y-dark-mode .details-modal-tabs {
                border-bottom-color: #2d2d44 !important;
            }
            body.a11y-dark-mode .user-profile-stats {
                border-color: #2d2d44 !important;
            }
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

})();