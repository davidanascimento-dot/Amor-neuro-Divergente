document.addEventListener('DOMContentLoaded', () => {
    
    const body = document.body;

    // ============================================
    // BANCO DE DADOS DA MODERAÇÃO
    // ============================================
    let moderationLogs = [
        {
            id: 1,
            type: 'group',
            status: 'revisado',
            date: '11/05/2026, 08:20:03',
            reason: 'Spam ou propaganda',
            description: 'aconteceu que tal tal tal',
            targetId: '84ecfccd-633f-4b45-ab01-45c67c4f506b'
        },
        {
            id: 2,
            type: 'user',
            status: 'pendente',
            date: '12/06/2026, 10:15:42',
            reason: 'Comportamento inadequado',
            description: 'Linguagem ofensiva no chat principal durante o evento.',
            targetId: '3b9f01ad-122c-4a11-bc88-99e12c4f772a'
        }
    ];

    // ============================================
    // ELEMENTOS DO DOM
    // ============================================
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

    // ============================================
    // RENDERIZAR LOGS DE MODERAÇÃO
    // ============================================
    function renderLogs() {
        container.innerHTML = '';

        if (moderationLogs.length === 0) {
            container.innerHTML = '<div class="empty-state">Nenhum registro de moderação encontrado.</div>';
            return;
        }

        moderationLogs.forEach(log => {
            const card = document.createElement('div');
            card.className = 'mod-card';
            
            card.innerHTML = `
                <div class="mod-top-row">
                    <div class="badge-group">
                        <span class="badge type">${log.type}</span>
                        <span class="badge status ${log.status} toggle-status-btn" data-id="${log.id}" title="Clique para alternar o status">
                            ${log.status}
                        </span>
                    </div>
                    <div class="mod-date">${log.date}</div>
                </div>
                <div class="mod-body">
                    <div class="mod-reason"><strong>Motivo:</strong> ${log.reason}</div>
                    <div class="mod-desc">${log.description}</div>
                    <div class="mod-target-id">ID alvo: ${log.targetId}</div>
                </div>
                <div class="mod-actions">
                    <button class="action-btn edit-mod-btn" data-id="${log.id}" title="Editar registro">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="action-btn delete delete-mod-btn" data-id="${log.id}" title="Excluir registro">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(card);
        });

        // Atribuir eventos aos badges de status
        document.querySelectorAll('.toggle-status-btn').forEach(btn => {
            btn.addEventListener('click', () => toggleStatus(parseInt(btn.getAttribute('data-id'))));
        });

        // Atribuir eventos aos botões de editar
        document.querySelectorAll('.edit-mod-btn').forEach(btn => {
            btn.addEventListener('click', () => editModeration(parseInt(btn.getAttribute('data-id'))));
        });

        // Atribuir eventos aos botões de excluir
        document.querySelectorAll('.delete-mod-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteModeration(parseInt(btn.getAttribute('data-id'))));
        });
    }

    // ============================================
    // ALTERNAR STATUS (REVISADO / PENDENTE)
    // ============================================
    function toggleStatus(id) {
        moderationLogs = moderationLogs.map(log => {
            if (log.id === id) {
                return {
                    ...log,
                    status: log.status === 'revisado' ? 'pendente' : 'revisado'
                };
            }
            return log;
        });
        renderLogs();
    }

    // ============================================
    // MODAL - ABRIR / FECHAR
    // ============================================
    addModerationBtn.addEventListener('click', () => {
        modalTitle.innerText = 'Novo Registro de Moderação';
        moderationForm.reset();
        modIdInput.value = '';
        modalOverlay.classList.add('active');
        modReasonInput.focus();
    });

    closeModalBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    });

    // ============================================
    // SALVAR REGISTRO
    // ============================================
    moderationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = modIdInput.value;
        const type = modTypeInput.value;
        const reason = modReasonInput.value.trim();
        const description = modDescriptionInput.value.trim();
        const targetId = modTargetIdInput.value.trim() || '—';

        if (!reason) return;

        const now = new Date();
        const formattedDate = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

        if (id) {
            // Modo Edição
            moderationLogs = moderationLogs.map(log => 
                log.id === parseInt(id) ? { ...log, type, reason, description, targetId } : log
            );
        } else {
            // Modo Criação
            const newLog = {
                id: Date.now(),
                type,
                status: 'pendente',
                date: formattedDate,
                reason,
                description: description || '—',
                targetId
            };
            moderationLogs.unshift(newLog);
        }

        modalOverlay.classList.remove('active');
        renderLogs();
    });

    // ============================================
    // EDITAR REGISTRO
    // ============================================
    function editModeration(id) {
        const log = moderationLogs.find(l => l.id === id);
        if (log) {
            modalTitle.innerText = 'Editar Registro de Moderação';
            modIdInput.value = log.id;
            modTypeInput.value = log.type;
            modReasonInput.value = log.reason;
            modDescriptionInput.value = log.description;
            modTargetIdInput.value = log.targetId;
            modalOverlay.classList.add('active');
            modReasonInput.focus();
        }
    }

    // ============================================
    // DELETAR REGISTRO
    // ============================================
    function deleteModeration(id) {
        if (confirm('Tem certeza que deseja excluir este registro de moderação?')) {
            moderationLogs = moderationLogs.filter(log => log.id !== id);
            renderLogs();
        }
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

        if (closeAcessibilidade) {
            closeAcessibilidade.addEventListener('click', () => {
                menuAcessibilidade.classList.remove('active');
                btnAcessibilidade.setAttribute('aria-expanded', 'false');
            });
        }

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
        if (getA11ySetting('grayscale','false')==='true') body.classList.add('a11y-grayscale');
        if (getA11ySetting('dyslexia','false')==='true') body.classList.add('a11y-dyslexia');
    }

    function updateButtonStates() {
        accessBtns.forEach(btn => {
            const spanText = btn.querySelector('span').textContent.trim().toLowerCase();
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
            if (spanText.includes('reset') && getA11ySetting('grayscale','false')==='true') isActive=true;
            if (isActive) { btn.style.background='#8b5cf6'; btn.style.border='2px solid #8b5cf6'; btn.style.color='#ffffff'; if(icon) icon.style.color='#ffffff'; }
        });
    }

    function resetAllSettings() {
        ['darkMode','highContrast','textSize','spacing','highlightLinks','saturation','grayscale','dyslexia'].forEach(k => localStorage.removeItem(`a11y_${k}`));
        body.classList.remove('a11y-dark-mode','a11y-high-contrast','a11y-large-text','a11y-small-text','a11y-spacing','a11y-highlight-links','a11y-saturation','a11y-grayscale','a11y-dyslexia');
        accessBtns.forEach(btn => { btn.style.background=''; btn.style.border=''; btn.style.color=''; const icon=btn.querySelector('i'); if(icon) icon.style.color='#8b5cf6'; });
    }

    accessBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const spanText = btn.querySelector('span').textContent.trim().toLowerCase();
            if (spanText.includes('reset')) { resetAllSettings(); return; }
            if (spanText.includes('escurecer')) { const c=getA11ySetting('darkMode','false'); setA11ySetting('darkMode',c==='true'?'false':'true'); }
            else if (spanText.includes('alto')) { const c=getA11ySetting('highContrast','false'); setA11ySetting('highContrast',c==='true'?'false':'true'); }
            else if (spanText.includes('maior')) { const c=getA11ySetting('textSize','normal'); setA11ySetting('textSize',c==='large'?'normal':'large'); }
            else if (spanText.includes('menor')) { const c=getA11ySetting('textSize','normal'); setA11ySetting('textSize',c==='small'?'normal':'small'); }
            else if (spanText.includes('espaçamento')) { const c=getA11ySetting('spacing','false'); setA11ySetting('spacing',c==='true'?'false':'true'); }
            else if (spanText.includes('links')) { const c=getA11ySetting('highlightLinks','false'); setA11ySetting('highlightLinks',c==='true'?'false':'true'); }
            else if (spanText.includes('saturação')) { const c=getA11ySetting('saturation','false'); setA11ySetting('saturation',c==='true'?'false':'true'); }
            else if (spanText.includes('dislexia')) { const c=getA11ySetting('dyslexia','false'); setA11ySetting('dyslexia',c==='true'?'false':'true'); }
            applyAllA11ySettings(); updateButtonStates();
        });
    });

    applyAllA11ySettings();
    updateButtonStates();

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    renderLogs();
    console.log('🚀 Moderação inicializada!');
});