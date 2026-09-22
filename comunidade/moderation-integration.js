// ============================================================
// MODERATION-INTEGRATION.JS - VERSÃO COMPLETA
// Denúncias: posts, comentários, mensagens, usuários, grupos
// + Modal de login obrigatório para ações
// ============================================================

(function () {
    'use strict';

    const supabase = window.supabaseClient;
    if (!supabase) {
        console.error('❌ [Moderação] Supabase não encontrado');
        return;
    }

    let currentUser = null;
    let isAdmin = false;
    let isModerator = false;
    let moderationSubscription = null;

    // ============================================================
    // 1. INICIALIZAÇÃO
    // ============================================================
    async function initModeration() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                currentUser = session.user;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_admin, is_moderator')
                    .eq('id', currentUser.id)
                    .maybeSingle();

                isAdmin = profile?.is_admin === true;
                isModerator = profile?.is_moderator === true;

                console.log('🛡️ [Moderação] admin=' + isAdmin + ' mod=' + isModerator);
            }
        } catch (e) {
            console.warn('[Moderação] Erro ao verificar sessão:', e);
        }

        addModerationUI();
        observePostsForModeration();
        observeChatForModeration();
        observeGroupsForModeration();
        observeUsersForModeration();
        subscribeToModerationChanges();
        updateModerationBadge();
        installLoginGuard();

        console.log('🛡️ [Moderação] Integração pronta!');
    }

    // ============================================================
    // 2. UI DE MODERAÇÃO (Header + Sidebar)
    // ============================================================
    function addModerationUI() {
        if (isAdmin || isModerator) {
            addModerationButtonToHeader();
            addModerationLinkToSidebar();
        }
        addReportButtonsToPosts();
        addReportButtonsToComments();
    }

    function addModerationButtonToHeader() {
        if (document.getElementById('moderationHeaderBtn')) return;

        const header = document.querySelector('.header-glass');
        if (!header) return;

        const btn = document.createElement('button');
        btn.id = 'moderationHeaderBtn';
        btn.className = 'header-profile-btn';
        btn.style.cssText = 'position:relative;margin-left:8px;';
        btn.title = 'Painel de Moderação';
        btn.innerHTML = `
            <i class="fa-solid fa-shield-halved" style="font-size:18px;color:#7c3aed;"></i>
            <span id="moderationBadge" style="position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:50%;display:none;min-width:18px;text-align:center;">0</span>
        `;

        btn.addEventListener('click', () => {
            window.open('/configurações/moderação/moderação.html', '_blank');
        });

        const profileBtn = header.querySelector('.header-profile-btn');
        if (profileBtn) profileBtn.after(btn);
        else header.appendChild(btn);
    }

    function addModerationLinkToSidebar() {
        if (document.getElementById('moderationSidebarLink')) return;

        const nav = document.querySelector('.sidebar-nav');
        if (!nav) return;

        const link = document.createElement('a');
        link.id = 'moderationSidebarLink';
        link.href = '/configurações/moderação/moderação.html';
        link.className = 'sidebar-link';
        link.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Moderação';
        link.style.cssText = 'color:#7c3aed;font-weight:600;';
        nav.appendChild(link);
    }

    // ============================================================
    // 3. BOTÕES DE DENÚNCIA — POSTS
    // ============================================================
    function addReportButtonsToPosts() {
        document.querySelectorAll('.post-card').forEach(post => {
            const postId = post.dataset.postId;
            if (!postId || post.querySelector('.report-post-btn')) return;

            const actions = post.querySelector('.post-actions');
            if (!actions) return;

            const reportBtn = document.createElement('button');
            reportBtn.className = 'action-btn report-post-btn';
            reportBtn.dataset.postId = postId;
            reportBtn.title = 'Denunciar post';
            reportBtn.innerHTML = '<i class="fa-regular fa-flag"></i>';
            reportBtn.style.cssText = 'color:#ef4444;';

            reportBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!requireLogin()) return;
                openReportModal('post', postId);
            });

            actions.appendChild(reportBtn);
        });
    }

    // ============================================================
    // 4. BOTÕES DE DENÚNCIA — COMENTÁRIOS
    // ============================================================
    function addReportButtonsToComments() {
        document.querySelectorAll('.comment-item').forEach(comment => {
            if (comment.querySelector('.report-comment-btn')) return;

            const commentId = comment.dataset.commentId;
            if (!commentId) return;

            const btn = document.createElement('button');
            btn.className = 'report-comment-btn';
            btn.title = 'Denunciar comentário';
            btn.innerHTML = '<i class="fa-regular fa-flag"></i>';
            btn.style.cssText = 'background:none;border:none;color:#ef4444;cursor:pointer;font-size:11px;margin-left:8px;';

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!requireLogin()) return;
                openReportModal('comment', commentId);
            });

            comment.appendChild(btn);
        });
    }

    // ============================================================
    // 5. BOTÕES DE DENÚNCIA — MENSAGENS DO CHAT
    // ============================================================
    function addReportButtonsToMessages() {
        document.querySelectorAll('.chat-message').forEach(msg => {
            if (msg.querySelector('.report-msg-btn')) return;

            const messageId = msg.dataset.messageId;
            if (!messageId) return;

            // Não permitir denunciar a própria mensagem
            const senderId = msg.dataset.senderId;
            if (senderId === currentUser?.id) return;

            const content = msg.querySelector('.msg-content');
            if (!content) return;

            // Adicionar botão de denúncia (aparece no hover via CSS inline)
            let btn = msg.querySelector('.report-msg-btn');
            if (!btn) {
                btn = document.createElement('button');
                btn.className = 'report-msg-btn';
                btn.title = 'Denunciar mensagem';
                btn.innerHTML = '<i class="fa-regular fa-flag"></i>';
                btn.style.cssText = `
                    position:absolute;top:4px;right:4px;background:rgba(255,255,255,0.95);
                    border:none;color:#ef4444;cursor:pointer;font-size:11px;
                    width:24px;height:24px;border-radius:50%;display:flex;align-items:center;
                    justify-content:center;opacity:0;transition:opacity 0.2s;box-shadow:0 2px 6px rgba(0,0,0,0.1);
                `;
                msg.style.position = 'relative';

                msg.addEventListener('mouseenter', () => btn.style.opacity = '1');
                msg.addEventListener('mouseleave', () => btn.style.opacity = '0');

                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!requireLogin()) return;
                    openReportModal('message', messageId);
                });

                msg.appendChild(btn);
            }
        });
    }

    // ============================================================
    // 6. BOTÕES DE DENÚNCIA — GRUPOS
    // ============================================================
    function addReportButtonsToGroups() {
        document.querySelectorAll('.group-card').forEach(card => {
            if (card.querySelector('.report-group-btn')) return;

            const groupId = card.dataset.groupId;
            if (!groupId) return;

            const title = card.querySelector('.group-card-title');
            if (!title) return;

            const btn = document.createElement('button');
            btn.className = 'report-group-btn';
            btn.title = 'Denunciar grupo';
            btn.innerHTML = '<i class="fa-regular fa-flag"></i>';
            btn.style.cssText = 'background:none;border:none;color:#ef4444;cursor:pointer;font-size:13px;padding:2px 6px;margin-left:6px;';

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!requireLogin()) return;
                const groupName = title.textContent.trim().split('\n')[0];
                openReportModal('group', groupId, `Grupo: ${groupName}`);
            });

            title.appendChild(btn);
        });
    }

    // ============================================================
    // 7. BOTÕES DE DENÚNCIA — USUÁRIOS (perfil do amigo)
    // ============================================================
    function addReportButtonToUserProfile() {
        const modal = document.getElementById('friendProfileModal');
        if (!modal) return;

        // Observar quando o modal abre
        const observer = new MutationObserver(() => {
            if (!modal.hasAttribute('hidden')) {
                const actions = modal.querySelector('.friend-profile-actions');
                if (actions && !actions.querySelector('.report-user-btn')) {
                    const btn = document.createElement('button');
                    btn.className = 'report-user-btn btn-friend-action';
                    btn.innerHTML = '<i class="fa-regular fa-flag"></i> Denunciar';
                    btn.style.cssText = 'background:transparent;border:1px solid #ef4444;color:#ef4444;';

                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const friendId = document.getElementById('friendProfileAvatar')?.dataset.userId;
                        const friendName = document.getElementById('friendProfileName')?.textContent;

                        if (!friendId) {
                            // Tentar pegar do window
                            const idFromGlobal = window.__selectedFriendId;
                            if (idFromGlobal) {
                                openReportModal('user', idFromGlobal, `Usuário: ${friendName || ''}`);
                            } else {
                                if (window.showToast) window.showToast('Erro: usuário não identificado', 'error');
                            }
                            return;
                        }
                        openReportModal('user', friendId, `Usuário: ${friendName || ''}`);
                    });

                    actions.appendChild(btn);
                }
            }
        });

        observer.observe(modal, { attributes: true, attributeFilter: ['hidden'] });
    }

    // ============================================================
    // 8. OBSERVERS (MutationObserver)
    // ============================================================
    function observePostsForModeration() {
        const feed = document.getElementById('postsFeed');
        if (!feed) return;

        const observer = new MutationObserver(() => {
            addReportButtonsToPosts();
            addReportButtonsToComments();
        });

        observer.observe(feed, { childList: true, subtree: true });
    }

    function observeChatForModeration() {
        const chat = document.getElementById('chatMessages');
        if (!chat) return;

        const observer = new MutationObserver(() => {
            addReportButtonsToMessages();
        });

        observer.observe(chat, { childList: true, subtree: true });
        // Rodar uma vez imediatamente
        setTimeout(addReportButtonsToMessages, 1500);
    }

    function observeGroupsForModeration() {
        const grid = document.getElementById('groupsGrid');
        if (!grid) return;

        const observer = new MutationObserver(() => {
            addReportButtonsToGroups();
        });

        observer.observe(grid, { childList: true, subtree: true });
        setTimeout(addReportButtonsToGroups, 1500);
    }

    function observeUsersForModeration() {
        addReportButtonToUserProfile();
    }

    // ============================================================
    // 9. MODAL DE DENÚNCIA (com contexto)
    // ============================================================
    function openReportModal(targetType, targetId, contextLabel) {
        if (!requireLogin()) return;

        document.getElementById('reportModal')?.remove();

        const modal = document.createElement('div');
        modal.id = 'reportModal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';

        const reasonsByType = {
            post: ['Spam ou propaganda', 'Conteúdo impróprio', 'Assédio ou bullying', 'Discurso de ódio', 'Informação falsa', 'Violação de privacidade', 'Outro'],
            comment: ['Spam ou propaganda', 'Conteúdo impróprio', 'Assédio ou bullying', 'Discurso de ódio', 'Informação falsa', 'Violação de privacidade', 'Outro'],
            message: ['Spam ou propaganda', 'Assédio ou bullying', 'Discurso de ódio', 'Conteúdo impróprio', 'Ameaça', 'Outro'],
            user: ['Comportamento inadequado', 'Assédio ou bullying', 'Discurso de ódio', 'Perfil falso', 'Spam', 'Outro'],
            group: ['Spam ou propaganda', 'Conteúdo impróprio', 'Grupo perigoso', 'Discurso de ódio', 'Assédio', 'Outro']
        };

        const reasons = reasonsByType[targetType] || reasonsByType.post;

        const titlesByType = {
            post: 'Denunciar Post',
            comment: 'Denunciar Comentário',
            message: 'Denunciar Mensagem',
            user: 'Denunciar Usuário',
            group: 'Denunciar Grupo'
        };

        const title = titlesByType[targetType] || 'Denunciar';

        modal.innerHTML = `
            <div style="background:var(--bg-card,#fff);border-radius:20px;max-width:480px;width:100%;padding:24px 28px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h2 style="font-size:20px;font-weight:700;color:var(--text-primary,#1e293b);margin:0;">
                        <i class="fa-solid fa-flag" style="color:#ef4444;"></i> ${title}
                    </h2>
                    <button id="closeReportModal" style="background:none;border:none;font-size:22px;color:#94a3b8;cursor:pointer;padding:4px 8px;">✕</button>
                </div>
                ${contextLabel ? `<p style="font-size:12px;color:var(--text-muted,#64748b);margin:-8px 0 16px 0;padding:8px 12px;background:rgba(124,58,237,0.06);border-radius:8px;">${contextLabel}</p>` : ''}
                <div style="margin-bottom:16px;">
                    <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary,#64748b);margin-bottom:6px;">Motivo da denúncia *</label>
                    <select id="reportReason" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:10px;font-size:14px;font-family:Inter,sans-serif;background:#f7f7f9;color:#1e293b;outline:none;">
                        <option value="">Selecione um motivo...</option>
                        ${reasons.map(r => `<option value="${r}">${r}</option>`).join('')}
                    </select>
                </div>
                <div style="margin-bottom:20px;">
                    <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary,#64748b);margin-bottom:6px;">Descrição (opcional)</label>
                    <textarea id="reportDescription" rows="3" placeholder="Descreva o que aconteceu..." style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:10px;font-size:14px;font-family:Inter,sans-serif;background:#f7f7f9;color:#1e293b;outline:none;resize:vertical;"></textarea>
                </div>
                <div style="display:flex;gap:10px;">
                    <button id="cancelReportBtn" style="flex:1;padding:12px;border:2px solid #e2e8f0;border-radius:30px;background:transparent;color:#1e293b;font-weight:600;font-size:14px;cursor:pointer;font-family:Inter,sans-serif;">Cancelar</button>
                    <button id="submitReportBtn" style="flex:1;padding:12px;border:none;border-radius:30px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-weight:700;font-size:14px;cursor:pointer;font-family:Inter,sans-serif;">
                        <i class="fa-solid fa-flag"></i> Denunciar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => modal.remove();
        document.getElementById('closeReportModal').addEventListener('click', closeModal);
        document.getElementById('cancelReportBtn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

        document.getElementById('submitReportBtn').addEventListener('click', async () => {
            const reason = document.getElementById('reportReason').value;
            const description = document.getElementById('reportDescription').value.trim();

            if (!reason) {
                if (window.showToast) window.showToast('Selecione um motivo', 'error');
                return;
            }

            const btn = document.getElementById('submitReportBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

            try {
                // 1. Criar log de moderação
                const { data: modResult, error: modError } = await supabase.rpc('create_moderation_log', {
                    p_type: targetType,
                    p_reason: reason,
                    p_description: description || null,
                    p_target_id: targetId,
                    p_target_type: targetType
                });

                // Se a RPC falhar, fallback INSERT direto
                if (modError) {
                    console.warn('RPC falhou, usando INSERT direto:', modError.message);
                    const { error: insErr } = await supabase
                        .from('moderation_logs')
                        .insert({
                            type: targetType,
                            reason: reason,
                            description: description || null,
                            target_id: targetId,
                            target_type: targetType,
                            reported_by: currentUser.id,
                            status: 'pendente'
                        });
                    if (insErr) throw insErr;
                } else if (!modResult?.success) {
                    throw new Error(modResult?.error || 'Erro ao registrar denúncia');
                }

                // 2. Registrar na tabela reports
                await supabase
                    .from('reports')
                    .insert({
                        reporter_id: currentUser.id,
                        target_type: targetType,
                        target_id: targetId,
                        reason: reason,
                        description: description || null,
                        moderation_log_id: modResult?.log_id || null
                    });

                if (window.showToast) {
                    window.showToast('✅ Denúncia enviada! A equipe irá analisar.', 'success', 4000);
                }
                closeModal();
                updateModerationBadge();
            } catch (error) {
                console.error('❌ [Moderação] Erro ao denunciar:', error);
                if (window.showToast) window.showToast('Erro ao enviar denúncia: ' + error.message, 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-flag"></i> Denunciar';
            }
        });
    }

    // ============================================================
    // 10. BADGE DE MODERAÇÃO
    // ============================================================
    async function updateModerationBadge() {
        if (!isAdmin && !isModerator) return;

        try {
            const { count, error } = await supabase
                .from('moderation_logs')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'pendente');

            if (error) throw error;

            const badge = document.getElementById('moderationBadge');
            if (badge) {
                badge.textContent = count || 0;
                badge.style.display = (count > 0) ? 'block' : 'none';
            }
        } catch (e) {
            console.warn('[Moderação] Erro ao atualizar badge:', e);
        }
    }

    // ============================================================
    // 11. REALTIME
    // ============================================================
    function subscribeToModerationChanges() {
        if (moderationSubscription) {
            supabase.removeChannel(moderationSubscription);
        }

        moderationSubscription = supabase
            .channel('moderation-changes-community')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'moderation_logs'
            }, (payload) => {
                updateModerationBadge();

                if (payload.eventType === 'INSERT' && (isAdmin || isModerator)) {
                    if (window.showToast) {
                        window.showToast('🛡️ Nova denúncia registrada!', 'warning', 3000);
                    }
                }
            })
            .subscribe();
    }
    // ============================================================
    // 12. MODAL DE LOGIN OBRIGATÓRIO (formal, minimalista)
    // ============================================================
    function requireLogin(message) {
        if (currentUser) return true;
        showLoginRequiredModal(message);
        return false;
    }

    function showLoginRequiredModal(customMessage) {
        document.getElementById('loginRequiredModal')?.remove();
        injectLoginModalStyles();

        const modal = document.createElement('div');
        modal.id = 'loginRequiredModal';
        modal.className = 'lrm-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'lrmTitle');

        modal.innerHTML = `
            <div class="lrm-card" role="document">
                <button class="lrm-close" id="lrmCloseBtn" aria-label="Fechar">
                    <i class="fa-solid fa-xmark"></i>
                </button>

                <h2 class="lrm-title" id="lrmTitle">Autenticação necessária</h2>

                <p class="lrm-desc">
                    ${customMessage || 'É necessário estar autenticado para realizar esta ação.'}
                </p>

                <div class="lrm-actions">
                    <a href="/login/login.html" class="lrm-btn lrm-btn--primary">
                        Entrar
                    </a>
                    <a href="/cadastro/cadastro.html" class="lrm-btn lrm-btn--secondary">
                        Criar conta
                    </a>
                </div>

                <button class="lrm-link" id="lrmContinueBtn">
                    Continuar navegando
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => {
            modal.remove();
            document.removeEventListener('keydown', onEsc);
            document.body.style.overflow = '';
        };

        const onEsc = (e) => {
            if (e.key === 'Escape') closeModal();
        };

        document.getElementById('lrmCloseBtn').addEventListener('click', closeModal);
        document.getElementById('lrmContinueBtn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', onEsc);

        // Focus trap
        const focusables = modal.querySelectorAll(
            'a[href], button:not([disabled])'
        );
        const firstFocus = focusables[0];
        const lastFocus = focusables[focusables.length - 1];

        modal.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey && document.activeElement === firstFocus) {
                e.preventDefault();
                lastFocus.focus();
            } else if (!e.shiftKey && document.activeElement === lastFocus) {
                e.preventDefault();
                firstFocus.focus();
            }
        });

        setTimeout(() => firstFocus?.focus(), 60);
        document.body.style.overflow = 'hidden';
    }

    // ---------- CSS injetado (uma única vez) ----------
    function injectLoginModalStyles() {
        if (document.getElementById('lrmStyles')) return;

        const style = document.createElement('style');
        style.id = 'lrmStyles';
        style.textContent = `
            /* =========================================
               MODAL LOGIN — Formal / Minimalista
               ========================================= */
            .lrm-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 100000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .lrm-card {
                position: relative;
                width: 100%;
                max-width: 400px;
                background: #ffffff;
                padding: 44px 36px 32px;
                text-align: center;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            }

            /* ---------- Botão fechar ---------- */
            .lrm-close {
                position: absolute;
                top: 14px;
                right: 14px;
                width: 32px;
                height: 32px;
                background: transparent;
                border: none;
                color: #94a3b8;
                font-size: 15px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: color 0.15s ease;
            }
            .lrm-close:hover { color: #1a1a2e; }
            .lrm-close:focus-visible {
                outline: 2px solid #7c3aed;
                outline-offset: 2px;
            }

            /* ---------- Título ---------- */
            .lrm-title {
                font-family: 'Inter', system-ui, sans-serif;
                font-size: 1.25rem;
                font-weight: 700;
                line-height: 1.3;
                color: #1a1a2e;
                margin: 0 0 14px;
                letter-spacing: -0.01em;
            }

            /* ---------- Descrição ---------- */
            .lrm-desc {
                font-family: 'Inter', system-ui, sans-serif;
                font-size: 14px;
                line-height: 1.6;
                color: #64748b;
                margin: 0 0 28px;
            }

            /* ---------- Ações ---------- */
            .lrm-actions {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 20px;
            }

            .lrm-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 13px 22px;
                font-family: 'Inter', system-ui, sans-serif;
                font-size: 14.5px;
                font-weight: 600;
                border-radius: 6px;
                text-decoration: none;
                cursor: pointer;
                border: none;
                transition: background 0.18s ease, color 0.18s ease;
            }
            .lrm-btn:focus-visible {
                outline: 2px solid #7c3aed;
                outline-offset: 2px;
            }

            .lrm-btn--primary {
                background: #7c3aed;
                color: #ffffff;
            }
            .lrm-btn--primary:hover {
                background: #6d28d9;
            }

            .lrm-btn--secondary {
                background: #f1f5f9;
                color: #1a1a2e;
            }
            .lrm-btn--secondary:hover {
                background: #e2e8f0;
            }

            /* ---------- Link inferior ---------- */
            .lrm-link {
                background: none;
                border: none;
                color: #64748b;
                font-family: 'Inter', system-ui, sans-serif;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                padding: 6px 10px;
                transition: color 0.15s ease;
            }
            .lrm-link:hover {
                color: #7c3aed;
                text-decoration: underline;
            }

            /* =========================================
               DARK MODE
               ========================================= */
            body.a11y-dark-mode .lrm-card {
                background: #1a1a2e;
            }
            body.a11y-dark-mode .lrm-title {
                color: #e8e3dd;
            }
            body.a11y-dark-mode .lrm-desc {
                color: #94a3b8;
            }
            body.a11y-dark-mode .lrm-close {
                color: #64748b;
            }
            body.a11y-dark-mode .lrm-close:hover {
                color: #e8e3dd;
            }
            body.a11y-dark-mode .lrm-btn--primary {
                background: #7c3aed;
            }
            body.a11y-dark-mode .lrm-btn--primary:hover {
                background: #8b5cf6;
            }
            body.a11y-dark-mode .lrm-btn--secondary {
                background: #2d2d44;
                color: #e8e3dd;
            }
            body.a11y-dark-mode .lrm-btn--secondary:hover {
                background: #3d3d5c;
            }
            body.a11y-dark-mode .lrm-link {
                color: #94a3b8;
            }
            body.a11y-dark-mode .lrm-link:hover {
                color: #c4b5e8;
            }

            /* =========================================
               RESPONSIVO
               ========================================= */
            @media (max-width: 480px) {
                .lrm-card {
                    padding: 36px 24px 26px;
                }
                .lrm-title { font-size: 1.15rem; }
                .lrm-desc  { font-size: 13.5px; }
                .lrm-btn   { padding: 12px 18px; font-size: 14px; }
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================================
    // 13. INSTALAR GUARD DE LOGIN EM VÁRIAS AÇÕES
    // ============================================================
    function installLoginGuard() {
        // Se já está logado, não faz nada
        if (currentUser) return;

        // 1. Interceptar cliques em botões que exigem login
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, a, [role="button"]');
            if (!target) return;

            // Ignorar se for o próprio modal de login
            if (target.closest('#loginRequiredModal')) return;
            if (target.closest('#sidebar') && target.classList.contains('sidebar-link')) return;
            if (target.closest('.header-links')) return;

            const id = target.id || '';
            const cls = target.className || '';
            const text = (target.textContent || '').trim().toLowerCase();

            const loginRequiredActions = [
                'like-btn', 'comment-toggle-btn', 'submit-comment-btn',
                'quickpost', 'openpostmodal', 'btn-create-post', 'submitpostbtn',
                'sendchatbtn', 'btn-quick-post',
                'opencreategroup', 'btn-create-group', 'btn-join', 'btn-chat',
                'sendfriendrequest', 'btn-add-friend',
                'usecodigo', 'useinvitecode', 'submitinvitecodebtn',
                'report-post', 'report-comment', 'report-msg', 'report-group', 'report-user'
            ];

            const needsLogin = loginRequiredActions.some(a =>
                id.toLowerCase().includes(a) || cls.toLowerCase().includes(a)
            ) || text === 'postar' || text === 'enviar' || text === 'denunciar' || text === 'adicionar';

            if (needsLogin) {
                e.preventDefault();
                e.stopPropagation();
                showLoginRequiredModal('Para esta ação você precisa estar logado.');
                return false;
            }
        }, true); // captura na fase de captura

        // 2. Interceptar Enter em inputs sensíveis
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            const target = e.target;
            if (!target) return;

            const id = (target.id || '').toLowerCase();
            if (
                id === 'chatinput' ||
                id === 'quickpostinput' ||
                id.startsWith('comment-input-') ||
                id === 'postcontentinput'
            ) {
                e.preventDefault();
                e.stopPropagation();
                showLoginRequiredModal('Faça login para enviar mensagens.');
                return false;
            }
        }, true);

        console.log('🔒 [Moderação] Guard de login instalado');
    }

    // ============================================================
    // 14. EXPOR GLOBALMENTE
    // ============================================================
    window.openReportModal = openReportModal;
    window.updateModerationBadge = updateModerationBadge;
    window.isUserAdmin = () => isAdmin || isModerator;
    window.requireLogin = requireLogin;
    window.showLoginRequiredModal = showLoginRequiredModal;

    // ============================================================
    // 15. INICIAR
    // ============================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModeration);
    } else {
        setTimeout(initModeration, 1000);
    }

    console.log('🛡️ [Moderação] Módulo carregado!');
})();