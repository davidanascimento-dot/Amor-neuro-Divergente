document.addEventListener('DOMContentLoaded', async () => {
    const body = document.body;
    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error('❌ Supabase não inicializado!');
        return;
    }

    let currentUser = null;
    try {
        const { data: { session } } = await supabase.auth.getSession();
        currentUser = session?.user || null;
        console.log('✅ Admin logado:', currentUser?.email || 'anônimo');
    } catch (e) {
        console.error('Erro ao verificar sessão:', e);
    }

    // ============================================
    // ELEMENTOS DO DOM
    // ============================================
    const eventListContainer = document.getElementById('eventList');
    const addEventBtn = document.getElementById('addEventBtn');

    // Modal
    const eventModalOverlay = document.getElementById('eventModalOverlay');
    const eventModalClose = document.getElementById('eventModalClose');
    const eventModalCancel = document.getElementById('eventModalCancel');
    const eventModalSave = document.getElementById('eventModalSave');
    const eventModalTitleText = document.getElementById('eventModalTitleText');
    const eventSaveLabel = document.getElementById('eventSaveLabel');

    // Campos do formulário
    const eventIdInput = document.getElementById('eventId');
    const eventTitleInput = document.getElementById('eventTitle');
    const eventDescriptionInput = document.getElementById('eventDescription');
    const eventDateInput = document.getElementById('eventDate');
    const eventPlatformInput = document.getElementById('eventPlatform');
    const eventLinkInput = document.getElementById('eventLink');
    const eventImageInput = document.getElementById('eventImage');
    const eventActiveInput = document.getElementById('eventActive');
    const eventForm = document.getElementById('eventForm');

    // ============================================
    // TOAST
    // ============================================
    function showToast(message, type = 'info', duration = 3000) {
        const existing = document.querySelector('.toast-admin-event');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-admin-event';
        toast.textContent = message;

        const colors = { success: '#10b981', error: '#ef4444', info: '#7c3aed', warning: '#f59e0b' };
        Object.assign(toast.style, {
            position: 'fixed', bottom: '28px', left: '50%',
            transform: 'translateX(-50%) translateY(100px)',
            background: colors[type] || colors.info, color: '#fff',
            padding: '14px 32px', borderRadius: '30px',
            fontSize: '14px', fontWeight: '500', zIndex: '9999',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            transition: 'all 0.4s ease', opacity: '0',
            pointerEvents: 'none', maxWidth: '90vw', textAlign: 'center'
        });

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
    window.showToast = showToast;

    // ============================================
    // HELPERS
    // ============================================
    function escapeHtml(t) {
        if (!t) return '';
        const d = document.createElement('div');
        d.textContent = t;
        return d.innerHTML;
    }

    function formatDateBR(iso) {
        const d = new Date(iso);
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    // Converte ISO → valor para input datetime-local
    function isoToLocalInput(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    // ============================================
    // ABRIR / FECHAR MODAL
    // ============================================
    function openEventModal(mode = 'create', eventData = null) {
        if (!eventModalOverlay) {
            console.error('❌ Modal #eventModalOverlay não encontrado!');
            return;
        }

        // Reset do formulário
        eventForm?.reset();
        if (eventIdInput) eventIdInput.value = '';

        if (mode === 'edit' && eventData) {
            // Modo edição
            if (eventModalTitleText) eventModalTitleText.textContent = 'Editar evento';
            if (eventSaveLabel) eventSaveLabel.textContent = 'Salvar alterações';

            if (eventIdInput) eventIdInput.value = eventData.id || '';
            if (eventTitleInput) eventTitleInput.value = eventData.title || '';
            if (eventDescriptionInput) eventDescriptionInput.value = eventData.description || '';
            if (eventDateInput) eventDateInput.value = isoToLocalInput(eventData.date);
            if (eventPlatformInput) eventPlatformInput.value = eventData.platform || 'Google Meet';
            if (eventLinkInput) eventLinkInput.value = eventData.link || '';
            if (eventImageInput) eventImageInput.value = eventData.image_url || '';
            if (eventActiveInput) eventActiveInput.checked = eventData.is_active !== false;
        } else {
            // Modo criação
            if (eventModalTitleText) eventModalTitleText.textContent = 'Novo evento';
            if (eventSaveLabel) eventSaveLabel.textContent = 'Criar evento';

            if (eventActiveInput) eventActiveInput.checked = true;

            // Preencher data padrão com 1 hora à frente
            if (eventDateInput) {
                const now = new Date();
                now.setHours(now.getHours() + 1);
                now.setMinutes(0);
                eventDateInput.value = isoToLocalInput(now.toISOString());
            }
        }

        eventModalOverlay.classList.add('active');
        eventModalOverlay.setAttribute('aria-hidden', 'false');

        // Focar no primeiro campo
        setTimeout(() => eventTitleInput?.focus(), 200);
    }

    function closeEventModal() {
        if (!eventModalOverlay) return;
        eventModalOverlay.classList.remove('active');
        eventModalOverlay.setAttribute('aria-hidden', 'true');
    }

    // Botão "Novo evento"
    addEventBtn?.addEventListener('click', () => {
        if (!currentUser) {
            showToast('Faça login para criar eventos', 'error');
            return;
        }
        openEventModal('create');
    });

    // Fechar modal
    eventModalClose?.addEventListener('click', closeEventModal);
    eventModalCancel?.addEventListener('click', closeEventModal);

    // Fechar ao clicar fora
    eventModalOverlay?.addEventListener('click', (e) => {
        if (e.target === eventModalOverlay) closeEventModal();
    });

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && eventModalOverlay?.classList.contains('active')) {
            closeEventModal();
        }
    });

    // ============================================
    // SALVAR (CRIAR / EDITAR)
    // ============================================
    eventModalSave?.addEventListener('click', async () => {
        if (!currentUser) {
            showToast('Faça login para salvar eventos', 'error');
            return;
        }

        // Validar campos obrigatórios
        const title = eventTitleInput?.value.trim();
        const dateValue = eventDateInput?.value;

        if (!title) {
            showToast('Preencha o título do evento', 'error');
            eventTitleInput?.focus();
            return;
        }

        if (!dateValue) {
            showToast('Preencha a data e hora do evento', 'error');
            eventDateInput?.focus();
            return;
        }

        // Coletar dados
        const id = eventIdInput?.value || null;
        const description = eventDescriptionInput?.value.trim() || '';
        const platform = eventPlatformInput?.value || 'Google Meet';
        const link = eventLinkInput?.value.trim() || null;
        const imageUrl = eventImageInput?.value.trim() || null;
        const isActive = eventActiveInput?.checked ?? true;
        const isoDate = new Date(dateValue).toISOString();

        // Desabilitar botão
        const originalLabel = eventSaveLabel?.textContent || 'Salvar';
        if (eventModalSave) eventModalSave.disabled = true;
        if (eventSaveLabel) eventSaveLabel.textContent = 'Salvando...';

        try {
            if (id) {
                // EDITAR
                const { error } = await supabase
                    .from('events')
                    .update({
                        title,
                        description,
                        date: isoDate,
                        platform,
                        link,
                        image_url: imageUrl,
                        is_active: isActive
                    })
                    .eq('id', id);

                if (error) throw error;
                showToast('✏️ Evento atualizado com sucesso!', 'success');
            } else {
                // CRIAR
                const { error } = await supabase
                    .from('events')
                    .insert({
                        title,
                        description,
                        date: isoDate,
                        platform,
                        link,
                        image_url: imageUrl,
                        is_active: isActive,
                        created_by: currentUser.id
                    });

                if (error) throw error;
                showToast('🎉 Evento criado! Já aparece na comunidade.', 'success');
            }

            closeEventModal();
            await loadEvents();
        } catch (error) {
            console.error('❌ Erro ao salvar evento:', error);
            showToast('Erro: ' + error.message, 'error');
        } finally {
            if (eventModalSave) eventModalSave.disabled = false;
            if (eventSaveLabel) eventSaveLabel.textContent = originalLabel;
        }
    });

    // ============================================
    // CARREGAR EVENTOS DO SUPABASE
    // ============================================
    async function loadEvents() {
        if (!eventListContainer) return;
        eventListContainer.innerHTML = `
            <div class="empty-state" style="padding:40px;text-align:center;color:#94a3b8;">
                <i class="fa-solid fa-spinner fa-spin" style="font-size:28px;"></i>
                <p>Carregando eventos...</p>
            </div>`;

        // Buscar TODOS os eventos (ativos e inativos)
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true });

        if (error) {
            console.error('❌ Erro ao carregar eventos:', error);
            eventListContainer.innerHTML = `
                <div class="empty-state" style="padding:40px;text-align:center;color:#ef4444;">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p>Erro: ${escapeHtml(error.message)}</p>
                </div>`;
            return;
        }

        renderEvents(data || []);
    }

    // ============================================
    // RENDERIZAR LISTA
    // ============================================
    function renderEvents(events) {
        eventListContainer.innerHTML = '';

        if (!events || events.length === 0) {
            eventListContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-calendar" style="font-size:32px;opacity:0.3;display:block;margin-bottom:12px;"></i>
                    Nenhum evento cadastrado ainda.
                </div>`;
            return;
        }

        const now = new Date();

        events.forEach(ev => {
            const isPast = new Date(ev.date) < now;
            const isActive = ev.is_active !== false;

            let statusBadge = '';
            if (!isActive) {
                statusBadge = `<span class="event-status-badge past" style="background:rgba(239,68,68,0.12);color:#ef4444;">Inativo</span>`;
            } else if (isPast) {
                statusBadge = `<span class="event-status-badge past">Passado</span>`;
            } else {
                statusBadge = `<span class="event-status-badge upcoming">Próximo</span>`;
            }

            const card = document.createElement('div');
            card.className = 'event-card';
            card.dataset.id = ev.id;
            card.style.opacity = isActive ? '1' : '0.6';

            card.innerHTML = `
                ${statusBadge}
                <div class="event-info">
                    <div class="event-title">${escapeHtml(ev.title)}</div>
                    <div class="event-details">
                        <i class="fa-regular fa-calendar" style="margin-right:4px;"></i>
                        ${formatDateBR(ev.date)}
                        <span style="margin:0 6px;">·</span>
                        <i class="fa-solid fa-video" style="margin-right:4px;"></i>
                        ${escapeHtml(ev.platform || 'Google Meet')}
                    </div>
                    ${ev.description ? `<div class="event-details" style="margin-top:2px;font-size:13px;">${escapeHtml(ev.description.substring(0, 100))}${ev.description.length > 100 ? '...' : ''}</div>` : ''}
                </div>
                <div class="event-card-actions">
                    <button class="action-btn edit-event-btn" data-id="${ev.id}" title="Editar evento">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="action-btn delete delete-event-btn" data-id="${ev.id}" title="${isActive ? 'Desativar' : 'Ativar'} evento">
                        <i class="fa-solid ${isActive ? 'fa-trash-can' : 'fa-rotate-left'}"></i>
                    </button>
                </div>
            `;
            eventListContainer.appendChild(card);
        });

        // Listeners
        document.querySelectorAll('.edit-event-btn').forEach(btn => {
            btn.addEventListener('click', () => editEvent(btn.dataset.id));
        });
        document.querySelectorAll('.delete-event-btn').forEach(btn => {
            btn.addEventListener('click', () => toggleEventActive(btn.dataset.id));
        });
    }

    // ============================================
    // EDITAR EVENTO — agora abre o modal preenchido
    // ============================================
    async function editEvent(id) {
        const { data: ev, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !ev) {
            showToast('Evento não encontrado', 'error');
            return;
        }

        openEventModal('edit', ev);
    }

    // ============================================
    // ATIVAR / DESATIVAR EVENTO
    // ============================================
    async function toggleEventActive(id) {
        // Buscar estado atual
        const { data: ev } = await supabase
            .from('events')
            .select('is_active, title')
            .eq('id', id)
            .single();

        if (!ev) return;

        const willDeactivate = ev.is_active !== false;
        const action = willDeactivate ? 'desativar' : 'reativar';

        if (!confirm(`Tem certeza que deseja ${action} o evento "${ev.title}"?`)) return;

        const { error } = await supabase
            .from('events')
            .update({ is_active: !willDeactivate })
            .eq('id', id);

        if (error) {
            showToast('Erro: ' + error.message, 'error');
            return;
        }

        showToast(willDeactivate ? '🗑️ Evento desativado!' : '✅ Evento reativado!', 'success');
        await loadEvents();
    }

    // ============================================
    // REALTIME — sincroniza com a Comunidade
    // ============================================
    function subscribeToEvents() {
        supabase
            .channel('admin-events-sync')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'events' },
                (payload) => {
                    console.log('🔄 Eventos alterados em tempo real:', payload);
                    loadEvents();
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Realtime de eventos conectado!');
                }
            });
    }

    // ============================================
    // ACESSIBILIDADE
    // ============================================
    const btnAcessibilidade = document.getElementById('btnAcessibilidade');
    const menuAcessibilidade = document.getElementById('menuAcessibilidade');
    const closeAcessibilidade = document.getElementById('closeAcessibilidade');
    const accessBtns = document.querySelectorAll('.access-btn');

    if (btnAcessibilidade && menuAcessibilidade) {
        btnAcessibilidade.addEventListener('click', (e) => {
            e.stopPropagation();
            menuAcessibilidade.classList.toggle('active');
            btnAcessibilidade.setAttribute('aria-expanded', menuAcessibilidade.classList.contains('active'));
        });
        closeAcessibilidade?.addEventListener('click', () => {
            menuAcessibilidade.classList.remove('active');
            btnAcessibilidade.setAttribute('aria-expanded', 'false');
        });
        document.addEventListener('click', (e) => {
            if (!menuAcessibilidade.contains(e.target) && e.target !== btnAcessibilidade) {
                menuAcessibilidade.classList.remove('active');
                btnAcessibilidade.setAttribute('aria-expanded', 'false');
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menuAcessibilidade.classList.contains('active')) {
                menuAcessibilidade.classList.remove('active');
                btnAcessibilidade.setAttribute('aria-expanded', 'false');
                btnAcessibilidade.focus();
            }
        });
    }

    function getA11ySetting(key, def) { return localStorage.getItem(`a11y_${key}`) || def; }
    function setA11ySetting(key, val) { localStorage.setItem(`a11y_${key}`, val); }

    function applyAllA11ySettings() {
        body.classList.remove('a11y-dark-mode','a11y-high-contrast','a11y-large-text','a11y-small-text','a11y-spacing','a11y-highlight-links','a11y-saturation','a11y-grayscale','a11y-dyslexia');
        if (getA11ySetting('darkMode','false')==='true') body.classList.add('a11y-dark-mode');
        if (getA11ySetting('highContrast','false')==='true') body.classList.add('a11y-high-contrast');
        if (getA11ySetting('textSize','normal')==='large') body.classList.add('a11y-large-text');
        if (getA11ySetting('textSize','normal')==='small') body.classList.add('a11y-small-text');
        if (getA11ySetting('spacing','false')==='true') body.classList.add('a11y-spacing');
        if (getA11ySetting('highlightLinks','false')==='true') body.classList.add('a11y-highlight-links');
        if (getA11ySetting('saturation','false')==='true') body.classList.add('a11y-saturation');
        if (getA11ySetting('grayscale','false')==='true') body.classList.add('a11y-grayscale');
        if (getA11ySetting('dyslexia','false')==='true') body.classList.add('a11y-dyslexia');
    }

    function updateButtonStates() {
        accessBtns.forEach(btn => {
            const spanText = btn.querySelector('span')?.textContent.trim().toLowerCase() || '';
            btn.style.background = ''; btn.style.border = ''; btn.style.color = '';
            const icon = btn.querySelector('i'); if (icon) icon.style.color = '#8b5cf6';
            let isActive = false;
            if (spanText.includes('escurecer') && getA11ySetting('darkMode','false')==='true') isActive=true;
            if (spanText.includes('alto') && getA11ySetting('highContrast','false')==='true') isActive=true;
            if (spanText.includes('maior') && getA11ySetting('textSize','normal')==='large') isActive=true;
            if (spanText.includes('menor') && getA11ySetting('textSize','normal')==='small') isActive=true;
            if (spanText.includes('espaçamento') && getA11ySetting('spacing','false')==='true') isActive=true;
            if (spanText.includes('links') && getA11ySetting('highlightLinks','false')==='true') isActive=true;
            if (spanText.includes('saturação') && getA11ySetting('saturation','false')==='true') isActive=true;
            if (spanText.includes('dislexia') && getA11ySetting('dyslexia','false')==='true') isActive=true;
            if (isActive) {
                btn.style.background='#8b5cf6'; btn.style.border='2px solid #8b5cf6';
                btn.style.color='#ffffff'; if(icon) icon.style.color='#ffffff';
            }
        });
    }

    function resetAllSettings() {
        ['darkMode','highContrast','textSize','spacing','highlightLinks','saturation','grayscale','dyslexia']
            .forEach(k => localStorage.removeItem(`a11y_${k}`));
        body.classList.remove('a11y-dark-mode','a11y-high-contrast','a11y-large-text','a11y-small-text','a11y-spacing','a11y-highlight-links','a11y-saturation','a11y-grayscale','a11y-dyslexia');
        accessBtns.forEach(btn => {
            btn.style.background=''; btn.style.border=''; btn.style.color='';
            const icon=btn.querySelector('i'); if(icon) icon.style.color='#8b5cf6';
        });
    }

    accessBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const spanText = btn.querySelector('span')?.textContent.trim().toLowerCase() || '';
            if (spanText.includes('reset')) { resetAllSettings(); return; }
            if (spanText.includes('escurecer')) { setA11ySetting('darkMode', getA11ySetting('darkMode','false')==='true'?'false':'true'); }
            else if (spanText.includes('alto')) { setA11ySetting('highContrast', getA11ySetting('highContrast','false')==='true'?'false':'true'); }
            else if (spanText.includes('maior')) { setA11ySetting('textSize', getA11ySetting('textSize','normal')==='large'?'normal':'large'); }
            else if (spanText.includes('menor')) { setA11ySetting('textSize', getA11ySetting('textSize','normal')==='small'?'normal':'small'); }
            else if (spanText.includes('espaçamento')) { setA11ySetting('spacing', getA11ySetting('spacing','false')==='true'?'false':'true'); }
            else if (spanText.includes('links')) { setA11ySetting('highlightLinks', getA11ySetting('highlightLinks','false')==='true'?'false':'true'); }
            else if (spanText.includes('saturação')) { setA11ySetting('saturation', getA11ySetting('saturation','false')==='true'?'false':'true'); }
            else if (spanText.includes('dislexia')) { setA11ySetting('dyslexia', getA11ySetting('dyslexia','false')==='true'?'false':'true'); }
            applyAllA11ySettings(); updateButtonStates();
        });
    });

    applyAllA11ySettings();
    updateButtonStates();

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    await loadEvents();
    subscribeToEvents();

    console.log('🚀 Admin de Eventos conectado ao Supabase!');
    
});