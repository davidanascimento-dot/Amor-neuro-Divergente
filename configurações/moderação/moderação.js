// ============================================================
// MODERACAO.JS - VERSÃO SUPABASE
// Painel de moderação conectado à comunidade
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
    let moderationLogs = [];
    let currentFilter = 'todos';
    let searchQuery = '';

    // ============================================================
    // VERIFICAR AUTENTICAÇÃO
    // ============================================================
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            currentUser = session.user;

            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin, is_moderator, username, avatar_url')
                .eq('id', currentUser.id)
                .maybeSingle();

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

    // Bloqueio de acesso
    if (!currentUser || (!isAdmin && !isModerator)) {
        document.body.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:Inter,sans-serif;background:#0f0f1a;color:#fff;text-align:center;padding:20px;">
                <div>
                    <i class="fa-solid fa-shield-halved" style="font-size:64px;color:#ef4444;margin-bottom:20px;"></i>
                    <h1 style="font-size:24px;margin-bottom:10px;">Acesso Restrito</h1>
                    <p style="color:#94a3b8;margin-bottom:20px;">Você não tem permissão para acessar esta área.</p>
                    <a href="/inicio.html" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-decoration:none;border-radius:30px;font-weight:600;">
                        <i class="fa-solid fa-arrow-left"></i> Voltar ao Início
                    </a>
                </div>
            </div>
        `;
        return;
    }

    // ============================================================
    // ELEMENTOS DO DOM
    // ============================================================
    const container = document.getElementById('moderationContainer');
    const addModerationBtn = document.getElementById('addModerationBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const moderationForm = document.getElementById('moderationForm');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalTitle = document.getElementById('modalTitle');

    const modIdInput = document.getElementById('modId');
    const modTypeInput = document.getElementById('modType');
    const modReasonInput = document.getElementById('modReason');
    const modDescriptionInput = document.getElementById('modDescription');
    const modTargetIdInput = document.getElementById('modTargetId');

    // ============================================================
    // CARREGAR LOGS DO SUPABASE
    // ============================================================
    async function loadLogs() {
        if (!container) return;

        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:#94a3b8;">
                <i class="fa-solid fa-spinner fa-spin" style="font-size:32px;margin-bottom:12px;"></i>
                <p>Carregando registros...</p>
            </div>
        `;

        try {
            // Tentar via RPC
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_moderation_logs', {
                p_limit: 100,
                p_offset: 0,
                p_status: currentFilter === 'todos' ? null : currentFilter,
                p_type: null
            });

            if (!rpcError && rpcData) {
                moderationLogs = rpcData;
            } else {
                // Fallback: SELECT direto
                console.warn('⚠️ RPC falhou, usando SELECT direto:', rpcError?.message);

                let query = supabase
                    .from('moderation_logs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(100);

                if (currentFilter !== 'todos') {
                    query = query.eq('status', currentFilter);
                }

                const { data, error } = await query;
                if (error) throw error;

                moderationLogs = (data || []).map(log => ({
                    ...log,
                    reporter_name: '—',
                    reviewer_name: '—',
                    date: formatDate(log.created_at)
                }));
            }

            renderLogs();
        } catch (error) {
            console.error('❌ Erro ao carregar:', error);
            container.innerHTML = `
                <div style="text-align:center;padding:40px;color:#ef4444;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:32px;margin-bottom:12px;"></i>
                    <p>Erro ao carregar registros: ${error.message}</p>
                    <button onclick="location.reload()" style="margin-top:12px;padding:8px 20px;background:#7c3aed;color:#fff;border:none;border-radius:20px;cursor:pointer;">Tentar novamente</button>
                </div>
            `;
        }
    }

    // ============================================================
    // RENDERIZAR
    // ============================================================
    function renderLogs() {
        if (!container) return;
        container.innerHTML = '';

        // Aplicar filtro de busca
        let filtered = moderationLogs;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(log =>
                (log.reason || '').toLowerCase().includes(q) ||
                (log.description || '').toLowerCase().includes(q) ||
                (log.type || '').toLowerCase().includes(q)
            );
        }

        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state" style="text-align:center;padding:40px;color:#94a3b8;">Nenhum registro encontrado.</div>';
            return;
        }

        filtered.forEach(log => {
            const card = document.createElement('div');
            card.className = 'mod-card';

            const dateStr = log.date || formatDate(log.created_at);
            const targetIdStr = log.target_id || '—';

            card.innerHTML = `
                <div class="mod-top-row">
                    <div class="badge-group">
                        <span class="badge type">${escapeHtml(log.type)}</span>
                        <span class="badge status ${log.status} toggle-status-btn" data-id="${log.id}" title="Clique para alternar o status">
                            ${log.status}
                        </span>
                    </div>
                    <div class="mod-date">${dateStr}</div>
                </div>
                <div class="mod-body">
                    <div class="mod-reason"><strong>Motivo:</strong> ${escapeHtml(log.reason)}</div>
                    <div class="mod-desc">${escapeHtml(log.description || '—')}</div>
                    <div class="mod-target-id">ID alvo: ${targetIdStr}</div>
                    ${log.reporter_name && log.reporter_name !== '—' ? `<div class="mod-target-id" style="font-size:11px;opacity:0.7;">Denunciado por: ${escapeHtml(log.reporter_name)}</div>` : ''}
                    ${log.action_taken ? `<div class="mod-target-id" style="color:#10b981;font-size:11px;">Ação: ${escapeHtml(log.action_taken)}</div>` : ''}
                </div>
                <div class="mod-actions">
                    <button class="action-btn edit-mod-btn" data-id="${log.id}" title="Editar">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="action-btn delete delete-mod-btn" data-id="${log.id}" title="Excluir">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;

            container.appendChild(card);
        });

        // Eventos
        document.querySelectorAll('.toggle-status-btn').forEach(btn => {
            btn.addEventListener('click', () => toggleStatus(btn.getAttribute('data-id')));
        });
        document.querySelectorAll('.edit-mod-btn').forEach(btn => {
            btn.addEventListener('click', () => editModeration(btn.getAttribute('data-id')));
        });
        document.querySelectorAll('.delete-mod-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteModeration(btn.getAttribute('data-id')));
        });
    }

    // ============================================================
    // ALTERNAR STATUS
    // ============================================================
    async function toggleStatus(id) {
        const log = moderationLogs.find(l => l.id === id);
        if (!log) return;

        const statusCycle = { 'pendente': 'revisado', 'revisado': 'resolvido', 'resolvido': 'arquivado', 'arquivado': 'pendente' };
        const newStatus = statusCycle[log.status] || 'pendente';

        try {
            const { data, error } = await supabase.rpc('update_moderation_status', {
                p_log_id: id,
                p_status: newStatus,
                p_action_taken: null
            });

            if (error) throw error;

            if (data && data.success) {
                log.status = newStatus;
                renderLogs();
                showToast(`Status alterado para: ${newStatus}`, 'success');
            } else {
                showToast(data?.error || 'Erro ao atualizar', 'error');
            }
        } catch (error) {
            // Fallback: UPDATE direto
            const { error: updateError } = await supabase
                .from('moderation_logs')
                .update({ status: newStatus, reviewed_by: currentUser.id, reviewed_at: new Date().toISOString() })
                .eq('id', id);

            if (updateError) {
                showToast('Erro: ' + updateError.message, 'error');
            } else {
                log.status = newStatus;
                renderLogs();
                showToast(`Status: ${newStatus}`, 'success');
            }
        }
    }

    // ============================================================
    // MODAL
    // ============================================================
    addModerationBtn?.addEventListener('click', () => {
        if (modalTitle) modalTitle.innerText = 'Novo Registro de Moderação';
        moderationForm?.reset();
        if (modIdInput) modIdInput.value = '';
        modalOverlay?.classList.add('active');
        modReasonInput?.focus();
    });

    closeModalBtn?.addEventListener('click', () => {
        modalOverlay?.classList.remove('active');
    });

    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });

    // ============================================================
    // SALVAR (CRIAR / EDITAR)
    // ============================================================
    moderationForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = modIdInput?.value;
        const type = modTypeInput?.value;
        const reason = modReasonInput?.value.trim();
        const description = modDescriptionInput?.value.trim();
        const targetId = modTargetIdInput?.value.trim() || null;

        if (!reason) return;

        const submitBtn = moderationForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Salvando...';
        }

        try {
            if (id) {
                // EDITAR
                const { error } = await supabase
                    .from('moderation_logs')
                    .update({
                        type,
                        reason,
                        description,
                        target_id: targetId,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', id);

                if (error) throw error;
                showToast('✅ Registro atualizado!', 'success');
            } else {
                // CRIAR via RPC
                const { data, error } = await supabase.rpc('create_moderation_log', {
                    p_type: type,
                    p_reason: reason,
                    p_description: description || null,
                    p_target_id: targetId,
                    p_target_type: type
                });

                if (error) {
                    // Fallback: INSERT direto
                    const { error: insErr } = await supabase
                        .from('moderation_logs')
                        .insert({
                            type,
                            reason,
                            description: description || null,
                            target_id: targetId,
                            target_type: type,
                            reported_by: currentUser.id,
                            status: 'pendente'
                        });
                    if (insErr) throw insErr;
                } else if (!data?.success) {
                    throw new Error(data?.error || 'Erro ao criar');
                }

                showToast('✅ Registro criado!', 'success');
            }

            modalOverlay?.classList.remove('active');
            moderationForm.reset();
            if (modIdInput) modIdInput.value = '';

            await loadLogs();
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
    // EDITAR
    // ============================================================
    function editModeration(id) {
        const log = moderationLogs.find(l => l.id === id);
        if (!log) return;

        if (modalTitle) modalTitle.innerText = 'Editar Registro';
        if (modIdInput) modIdInput.value = log.id;
        if (modTypeInput) modTypeInput.value = log.type;
        if (modReasonInput) modReasonInput.value = log.reason;
        if (modDescriptionInput) modDescriptionInput.value = log.description || '';
        if (modTargetIdInput) modTargetIdInput.value = log.target_id || '';

        modalOverlay?.classList.add('active');
        modReasonInput?.focus();
    }

    // ============================================================
    // DELETAR
    // ============================================================
    async function deleteModeration(id) {
        if (!confirm('Tem certeza que deseja excluir este registro?')) return;

        try {
            const { error } = await supabase
                .from('moderation_logs')
                .delete()
                .eq('id', id);

            if (error) throw error;

            moderationLogs = moderationLogs.filter(l => l.id !== id);
            renderLogs();
            showToast('🗑️ Registro excluído!', 'info');
        } catch (error) {
            showToast('Erro ao excluir: ' + error.message, 'error');
        }
    }

    // ============================================================
    // HELPERS
    // ============================================================
    function formatDate(d) {
        if (!d) return '—';
        try {
            const date = new Date(d);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        } catch { return '—'; }
    }

    function escapeHtml(t) {
        if (!t) return '';
        const d = document.createElement('div');
        d.textContent = t;
        return d.innerHTML;
    }

    function showToast(msg, type = 'info', duration = 3000) {
        const existing = document.querySelector('.mod-toast-custom');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'mod-toast-custom';
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
    // REALTIME
    // ============================================================
    function subscribeToModerationRealtime() {
        supabase
            .channel('moderation-admin-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'moderation_logs'
            }, (payload) => {
                console.log('🔄 Moderação atualizada:', payload);
                loadLogs();
            })
            .subscribe();
    }

    // ============================================================
    // ACESSIBILIDADE (mantida igual ao original)
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
    // INICIALIZAÇÃO
    // ============================================================
    await loadLogs();
    subscribeToModerationRealtime();

    console.log('🚀 Painel de moderação pronto!');
});