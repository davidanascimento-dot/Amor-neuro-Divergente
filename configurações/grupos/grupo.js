// ============================================================
// GRUPO.JS - PAINEL ADMIN DE GRUPOS (SUPABASE)
// Mesma lógica de sessão da moderação
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    const body = document.body;
    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error('❌ Supabase não inicializado!');
        alert('Erro: Supabase não inicializado. Recarregue a página.');
        return;
    }

    let currentUser = null;
    let isAdmin = false;
    let isModerator = false;
    let groups = [];
    let currentFilter = 'todos';
    let searchQuery = '';

    // ============================================================
    // 1. VERIFICAR AUTENTICAÇÃO (mesma lógica da moderação)
    // ============================================================
    try {
        // Tenta getUser primeiro (mais confiável que getSession)
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (user) {
            currentUser = user;
            console.log('✅ [Grupo] Usuário:', user.email);
        } else {
            // Fallback: tenta getSession
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                currentUser = session.user;
                console.log('✅ [Grupo] Sessão:', session.user.email);
            }
        }

        if (currentUser) {
            // Buscar perfil do usuário
            const { data: profile, error: profError } = await supabase
                .from('profiles')
                .select('is_admin, is_moderator, username, avatar_url')
                .eq('id', currentUser.id)
                .maybeSingle();

            if (profError) {
                console.error('❌ [Grupo] Erro ao buscar perfil:', profError);
            }

            isAdmin = profile?.is_admin === true;
            isModerator = profile?.is_moderator === true;

            const avatarImg = document.querySelector('.avatar-img');
            if (avatarImg && profile?.avatar_url) {
                avatarImg.src = profile.avatar_url;
            }

            console.log('🛡️ Admin:', isAdmin, '| Mod:', isModerator);
        }
    } catch (e) {
        console.warn('Erro ao verificar sessão:', e);
    }

    // ============================================================
    // BLOQUEIO DE ACESSO
    // ============================================================
    if (!currentUser) {
        // Salva URL para voltar após login
        sessionStorage.setItem('redirect_after_login', window.location.href);

        document.body.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:Inter,sans-serif;background:#0f0f1a;color:#fff;text-align:center;padding:20px;">
                <div>
                    <i class="fa-solid fa-user-lock" style="font-size:64px;color:#7c3aed;margin-bottom:20px;"></i>
                    <h1 style="font-size:22px;margin-bottom:10px;">Faça login para continuar</h1>
                    <p style="color:#94a3b8;margin-bottom:20px;">Redirecionando para a página de login...</p>
                    <a href="/login/login.html" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-decoration:none;border-radius:30px;font-weight:600;">
                        <i class="fa-solid fa-right-to-bracket"></i> Ir para login
                    </a>
                </div>
            </div>
        `;

        setTimeout(() => {
            window.location.href = '/login/login.html';
        }, 1800);

        return;
    }

    // Está logado mas não é admin → acesso negado
    if (!isAdmin && !isModerator) {
        document.body.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:Inter,sans-serif;background:#0f0f1a;color:#fff;text-align:center;padding:20px;">
                <div>
                    <i class="fa-solid fa-shield-halved" style="font-size:64px;color:#ef4444;margin-bottom:20px;"></i>
                    <h1 style="font-size:24px;margin-bottom:10px;">Acesso Restrito</h1>
                    <p style="color:#94a3b8;margin-bottom:20px;">Você não tem permissão para gerenciar grupos.</p>
                    <a href="/inicio.html" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-decoration:none;border-radius:30px;font-weight:600;">
                        <i class="fa-solid fa-arrow-left"></i> Voltar ao Início
                    </a>
                </div>
            </div>
        `;
        return;
    }

    // ============================================================
    // 2. ELEMENTOS DO DOM
    // ============================================================
    const groupsContainer = document.getElementById('groupsContainer');
    const modalOverlay = document.getElementById('modalOverlay');
    const groupForm = document.getElementById('groupForm');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalTitle = document.getElementById('modalTitle');

    const groupIdInput = document.getElementById('groupId');
    const groupNameInput = document.getElementById('groupNameInput');
    const groupDescInput = document.getElementById('groupDescInput');

    // ============================================================
    // 3. CARREGAR GRUPOS DO SUPABASE
    // ============================================================
    async function loadGroups() {
        if (!groupsContainer) return;

        groupsContainer.innerHTML = `
            <div style="text-align:center;padding:40px;color:#94a3b8;">
                <i class="fa-solid fa-spinner fa-spin" style="font-size:32px;margin-bottom:12px;"></i>
                <p>Carregando grupos...</p>
            </div>
        `;

        try {
            // Tentar via RPC
            const { data: rpcData, error: rpcError } = await supabase.rpc('admin_get_groups');

            if (!rpcError && rpcData) {
                groups = rpcData;
            } else {
                // Fallback: SELECT direto
                console.warn('⚠️ RPC falhou, usando SELECT direto:', rpcError?.message);

                const { data, error } = await supabase
                    .from('groups')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                groups = (data || []).map(g => ({
                    ...g,
                    creator_name: '—',
                    status: g.status || 'ativo'
                }));
            }

            renderGroups();
        } catch (error) {
            console.error('❌ Erro ao carregar grupos:', error);
            groupsContainer.innerHTML = `
                <div style="text-align:center;padding:40px;color:#ef4444;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:32px;margin-bottom:12px;"></i>
                    <p>Erro ao carregar grupos: ${error.message}</p>
                    <button onclick="location.reload()" style="margin-top:12px;padding:8px 20px;background:#7c3aed;color:#fff;border:none;border-radius:20px;cursor:pointer;">Tentar novamente</button>
                </div>
            `;
        }
    }

    // ============================================================
    // 4. RENDERIZAR GRUPOS
    // ============================================================
    function renderGroups() {
        if (!groupsContainer) return;
        groupsContainer.innerHTML = '';

        // Aplicar filtros
        let filtered = groups;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(g =>
                (g.name || '').toLowerCase().includes(q) ||
                (g.description || '').toLowerCase().includes(q)
            );
        }
        if (currentFilter !== 'todos') {
            filtered = filtered.filter(g => (g.status || 'ativo') === currentFilter);
        }

        if (filtered.length === 0) {
            groupsContainer.innerHTML = `
                <div class="empty-state" style="text-align:center;padding:40px;color:#94a3b8;">
                    <i class="fa-regular fa-folder-open" style="font-size:32px;margin-bottom:12px;opacity:0.4;"></i>
                    <p>Nenhum grupo encontrado.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(group => {
            const card = document.createElement('div');
            card.className = 'group-card';
            card.dataset.groupId = group.id;

            const status = group.status || 'ativo';
            const isBanned = group.banned === true || status === 'banido';
            const statusColor = isBanned ? '#ef4444' : (status === 'ativo' ? '#10b981' : '#f59e0b');
            const statusLabel = isBanned ? 'banido' : status;

            card.innerHTML = `
                <div class="group-info">
                    <div class="group-title">
                        ${escapeHtml(group.name)}
                        <span class="group-status" style="color:${statusColor};">(${statusLabel})</span>
                        ${group.is_private ? '<i class="fa-solid fa-lock" style="color:#94a3b8;font-size:12px;margin-left:6px;" title="Privado"></i>' : ''}
                    </div>
                    <div class="group-desc">${escapeHtml(group.description || 'Sem descrição')}</div>
                    <div style="font-size:11px;color:#94a3b8;margin-top:4px;">
                        <i class="fa-regular fa-user"></i> ${group.members || 0} membros
                        ${group.creator_name && group.creator_name !== '—' ? ` · <i class="fa-regular fa-circle-user"></i> ${escapeHtml(group.creator_name)}` : ''}
                    </div>
                    ${isBanned && group.banned_reason ? `
                        <div style="font-size:11px;color:#ef4444;margin-top:4px;">
                            <i class="fa-solid fa-ban"></i> Motivo: ${escapeHtml(group.banned_reason)}
                        </div>
                    ` : ''}
                </div>
                <div class="group-actions">
                    <button class="action-btn edit-group-btn" data-id="${group.id}" title="Editar grupo">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="action-btn delete delete-group-btn" data-id="${group.id}" title="Excluir grupo">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                    ${isAdmin ? `
                    <button class="action-btn ban-group-btn" data-id="${group.id}" data-banned="${isBanned}" title="${isBanned ? 'Desbanir' : 'Banir'} grupo">
                        <i class="fa-solid ${isBanned ? 'fa-unlock' : 'fa-ban'}"></i>
                    </button>
                    ` : ''}
                </div>
            `;
            groupsContainer.appendChild(card);
        });

        // Eventos
        document.querySelectorAll('.edit-group-btn').forEach(btn => {
            btn.addEventListener('click', () => editGroup(btn.getAttribute('data-id')));
        });
        document.querySelectorAll('.delete-group-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteGroup(btn.getAttribute('data-id')));
        });
        document.querySelectorAll('.ban-group-btn').forEach(btn => {
            btn.addEventListener('click', () => toggleBanGroup(
                btn.getAttribute('data-id'),
                btn.getAttribute('data-banned') === 'true'
            ));
        });
    }

    // ============================================================
    // 5. MODAL - ABRIR / FECHAR
    // ============================================================
    openModalBtn?.addEventListener('click', () => {
        if (modalTitle) modalTitle.innerText = 'Novo Grupo';
        groupForm?.reset();
        if (groupIdInput) groupIdInput.value = '';
        modalOverlay?.classList.add('active');
        groupNameInput?.focus();
    });

    closeModalBtn?.addEventListener('click', () => {
        modalOverlay?.classList.remove('active');
    });

    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });

    // ============================================================
    // 6. SALVAR (CRIAR / EDITAR)
    // ============================================================
    groupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = groupIdInput?.value;
        const name = groupNameInput?.value.trim();
        const desc = groupDescInput?.value.trim();

        if (!name) {
            showToast('Por favor, insira o nome do grupo.', 'error');
            return;
        }

        const submitBtn = groupForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Salvando...';
        }

        try {
            if (id) {
                // EDITAR
                const { data, error } = await supabase.rpc('admin_update_group', {
                    p_group_id: id,
                    p_name: name,
                    p_description: desc
                });

                if (error) throw error;

                if (!data?.success) {
                    throw new Error(data?.error || 'Erro ao atualizar');
                }
                showToast('✅ Grupo atualizado!', 'success');
            } else {
                // CRIAR
                const { data, error } = await supabase.rpc('admin_create_group', {
                    p_name: name,
                    p_description: desc,
                    p_category: 'Geral',
                    p_image_url: null,
                    p_is_private: false
                });

                if (error) throw error;

                if (!data?.success) {
                    throw new Error(data?.error || 'Erro ao criar grupo');
                }
                showToast('✅ Grupo criado!', 'success');
            }

            modalOverlay?.classList.remove('active');
            groupForm.reset();
            if (groupIdInput) groupIdInput.value = '';

            await loadGroups();
        } catch (error) {
            console.error('❌', error);
            showToast('Erro: ' + error.message, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Salvar';
            }
        }
    });

    // ============================================================
    // 7. EDITAR
    // ============================================================
    function editGroup(id) {
        const group = groups.find(g => g.id === id);
        if (!group) return;

        if (modalTitle) modalTitle.innerText = 'Editar Grupo';
        if (groupIdInput) groupIdInput.value = group.id;
        if (groupNameInput) groupNameInput.value = group.name || '';
        if (groupDescInput) groupDescInput.value = group.description || '';

        modalOverlay?.classList.add('active');
        groupNameInput?.focus();
    }

    // ============================================================
    // 8. DELETAR
    // ============================================================
    async function deleteGroup(id) {
        const group = groups.find(g => g.id === id);
        if (!group) return;

        if (!confirm(`Tem certeza que deseja excluir o grupo "${group.name}"? Esta ação é irreversível.`)) return;

        try {
            const { data, error } = await supabase.rpc('admin_delete_group', {
                p_group_id: id
            });

            if (error) throw error;

            if (!data?.success) {
                throw new Error(data?.error || 'Erro ao excluir');
            }

            showToast('🗑️ Grupo excluído!', 'info');
            await loadGroups();
        } catch (error) {
            console.error('❌', error);
            showToast('Erro ao excluir: ' + error.message, 'error');
        }
    }

    // ============================================================
    // 9. BANIR / DESBANIR
    // ============================================================
    async function toggleBanGroup(id, isBanned) {
        const group = groups.find(g => g.id === id);
        if (!group) return;

        let reason = null;
        if (!isBanned) {
            reason = prompt(`Motivo do banimento do grupo "${group.name}":`, 'Violação das regras da comunidade');
            if (reason === null) return; // cancelou
        } else {
            if (!confirm(`Desbanir o grupo "${group.name}"?`)) return;
        }

        try {
            const { data, error } = await supabase.rpc('admin_toggle_ban_group', {
                p_group_id: id,
                p_ban: !isBanned,
                p_reason: reason
            });

            if (error) throw error;

            if (!data?.success) {
                throw new Error(data?.error || 'Erro');
            }

            showToast(data.message || (isBanned ? 'Grupo desbanido' : 'Grupo banido'), 'success');
            await loadGroups();
        } catch (error) {
            console.error('❌', error);
            showToast('Erro: ' + error.message, 'error');
        }
    }

    // ============================================================
    // 10. HELPERS
    // ============================================================
    function escapeHtml(t) {
        if (!t) return '';
        const d = document.createElement('div');
        d.textContent = t;
        return d.innerHTML;
    }

    function showToast(msg, type = 'info', duration = 3000) {
        const existing = document.querySelector('.admin-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'admin-toast';
        toast.textContent = msg;

        const colors = { success: '#10b981', error: '#ef4444', info: '#7c3aed', warning: '#f59e0b' };
        toast.style.cssText = `
            position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(100px);
            background:${colors[type] || colors.info};color:#fff;padding:14px 32px;
            border-radius:30px;font-size:14px;font-weight:500;z-index:99999;
            box-shadow:0 8px 30px rgba(0,0,0,0.2);transition:all 0.4s ease;
            opacity:0;pointer-events:none;max-width:90vw;text-align:center;font-family:Inter,sans-serif;
        `;
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

    // ============================================================
    // 11. REALTIME
    // ============================================================
    function subscribeToGroups() {
        supabase
            .channel('groups-admin-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'groups'
            }, (payload) => {
                console.log('🔄 Grupos atualizados:', payload);
                loadGroups();
            })
            .subscribe();
    }

    // ============================================================
    // 12. ACESSIBILIDADE
    // ============================================================
    const btnAcessibilidade = document.getElementById('btnAcessibilidade');
    const menuAcessibilidade = document.getElementById('menuAcessibilidade');
    const closeAcessibilidade = document.getElementById('closeAcessibilidade');
    const accessBtns = document.querySelectorAll('.access-btn');

    if (btnAcessibilidade && menuAcessibilidade) {
        btnAcessibilidade.addEventListener('click', (e) => {
            e.stopPropagation();
            menuAcessibilidade.classList.toggle('active');
        });
        closeAcessibilidade?.addEventListener('click', () => menuAcessibilidade.classList.remove('active'));
        document.addEventListener('click', (e) => {
            if (!menuAcessibilidade.contains(e.target) && e.target !== btnAcessibilidade) {
                menuAcessibilidade.classList.remove('active');
            }
        });
    }

    function getA11ySetting(key, defaultValue) { return localStorage.getItem(`a11y_${key}`) || defaultValue; }
    function setA11ySetting(key, value) { localStorage.setItem(`a11y_${key}`, value); }

    function applyAllA11ySettings() {
        body.classList.remove('a11y-dark-mode','a11y-high-contrast','a11y-large-text','a11y-small-text','a11y-spacing','a11y-highlight-links','a11y-saturation','a11y-grayscale','a11y-dyslexia');
        if (getA11ySetting('darkMode','false')==='true') body.classList.add('a11y-dark-mode');
        if (getA11ySetting('highContrast','false')==='true') body.classList.add('a11y-high-contrast');
        if (getA11ySetting('textSize','normal')==='large') body.classList.add('a11y-large-text');
        if (getA11ySetting('textSize','normal')==='small') body.classList.add('a11y-small-text');
        if (getA11ySetting('spacing','false')==='true') body.classList.add('a11y-spacing');
        if (getA11ySetting('highlightLinks','false')==='true') body.classList.add('a11y-highlight-links');
        if (getA11ySetting('saturation','false')==='true') body.classList.add('a11y-saturation');
        if (getA11ySetting('dyslexia','false')==='true') body.classList.add('a11y-dyslexia');
    }

    accessBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const spanText = btn.querySelector('span')?.textContent.trim().toLowerCase() || '';
            if (spanText.includes('reset')) {
                ['darkMode','highContrast','textSize','spacing','highlightLinks','saturation','grayscale','dyslexia'].forEach(k => localStorage.removeItem(`a11y_${k}`));
                applyAllA11ySettings();
                return;
            }
            if (spanText.includes('escurecer')) setA11ySetting('darkMode', getA11ySetting('darkMode','false')==='true'?'false':'true');
            else if (spanText.includes('alto')) setA11ySetting('highContrast', getA11ySetting('highContrast','false')==='true'?'false':'true');
            else if (spanText.includes('maior')) setA11ySetting('textSize', getA11ySetting('textSize','normal')==='large'?'normal':'large');
            else if (spanText.includes('menor')) setA11ySetting('textSize', getA11ySetting('textSize','normal')==='small'?'normal':'small');
            else if (spanText.includes('espaçamento')) setA11ySetting('spacing', getA11ySetting('spacing','false')==='true'?'false':'true');
            else if (spanText.includes('links')) setA11ySetting('highlightLinks', getA11ySetting('highlightLinks','false')==='true'?'false':'true');
            else if (spanText.includes('saturação')) setA11ySetting('saturation', getA11ySetting('saturation','false')==='true'?'false':'true');
            else if (spanText.includes('dislexia')) setA11ySetting('dyslexia', getA11ySetting('dyslexia','false')==='true'?'false':'true');
            applyAllA11ySettings();
        });
    });

    applyAllA11ySettings();

    // ============================================================
    // 13. INICIALIZAÇÃO
    // ============================================================
    await loadGroups();
    subscribeToGroups();

    console.log('🚀 Painel de grupos pronto!');
});