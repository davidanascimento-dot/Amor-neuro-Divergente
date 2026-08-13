document.addEventListener('DOMContentLoaded', () => {
    
    const body = document.body;

    // ============================================
    // BANCO DE DADOS DOS GRUPOS
    // ============================================
    let groups = [
        { id: 1, name: 'Grupo-Geral', desc: 'Grupo de conversas', status: 'ativo' }
    ];

    // ============================================
    // ELEMENTOS DO DOM
    // ============================================
    const groupsContainer = document.getElementById('groupsContainer');
    const modalOverlay = document.getElementById('modalOverlay');
    const groupForm = document.getElementById('groupForm');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalTitle = document.getElementById('modalTitle');
    
    const groupIdInput = document.getElementById('groupId');
    const groupNameInput = document.getElementById('groupNameInput');
    const groupDescInput = document.getElementById('groupDescInput');

    // ============================================
    // RENDERIZAR GRUPOS
    // ============================================
    function renderGroups() {
        groupsContainer.innerHTML = '';
        
        if (groups.length === 0) {
            groupsContainer.innerHTML = '<div class="empty-state">Nenhum grupo cadastrado.</div>';
            return;
        }

        groups.forEach(group => {
            const card = document.createElement('div');
            card.className = 'group-card';
            card.innerHTML = `
                <div class="group-info">
                    <div class="group-title">${group.name} <span class="group-status">(${group.status})</span></div>
                    <div class="group-desc">${group.desc}</div>
                </div>
                <div class="group-actions">
                    <button class="action-btn edit-group-btn" data-id="${group.id}" title="Editar grupo">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="action-btn delete delete-group-btn" data-id="${group.id}" title="Excluir grupo">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
            groupsContainer.appendChild(card);
        });

        // Atribuir eventos aos botões dinâmicos
        document.querySelectorAll('.edit-group-btn').forEach(btn => {
            btn.addEventListener('click', () => editGroup(parseInt(btn.getAttribute('data-id'))));
        });
        document.querySelectorAll('.delete-group-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteGroup(parseInt(btn.getAttribute('data-id'))));
        });
    }

    // ============================================
    // MODAL - ABRIR / FECHAR
    // ============================================
    openModalBtn.addEventListener('click', () => {
        modalTitle.innerText = 'Novo Grupo';
        groupForm.reset();
        groupIdInput.value = '';
        modalOverlay.classList.add('active');
        groupNameInput.focus();
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
    // SALVAR / ATUALIZAR GRUPO
    // ============================================
    groupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = groupIdInput.value;
        const name = groupNameInput.value.trim();
        const desc = groupDescInput.value.trim();

        if (!name || !desc) return;

        if (id) {
            // Modo Edição
            groups = groups.map(g => g.id === parseInt(id) ? { ...g, name, desc } : g);
        } else {
            // Modo Criação
            const newGroup = {
                id: Date.now(),
                name,
                desc,
                status: 'ativo'
            };
            groups.push(newGroup);
        }

        modalOverlay.classList.remove('active');
        renderGroups();
    });

    // ============================================
    // DELETAR GRUPO
    // ============================================
    function deleteGroup(id) {
        if (confirm('Tem certeza que deseja excluir este grupo?')) {
            groups = groups.filter(g => g.id !== id);
            renderGroups();
        }
    }

    // ============================================
    // EDITAR GRUPO
    // ============================================
    function editGroup(id) {
        const group = groups.find(g => g.id === id);
        if (group) {
            modalTitle.innerText = 'Editar Grupo';
            groupIdInput.value = group.id;
            groupNameInput.value = group.name;
            groupDescInput.value = group.desc;
            modalOverlay.classList.add('active');
            groupNameInput.focus();
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
    renderGroups();
    console.log('🚀 Grupos inicializado!');
});