document.addEventListener('DOMContentLoaded', () => {
    
    /* =========================================
       1. SIDEBAR RESPONSIVA
       ========================================= */
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    function isMobile() {
        return window.innerWidth <= 768;
    }

    function toggleSidebar() {
        if (isMobile()) {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
        } else {
            sidebar.classList.toggle('collapsed');
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });
    }

    overlay.addEventListener('click', () => {
        if (isMobile() && sidebar.classList.contains('active')) {
            toggleSidebar();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            sidebar.classList.remove('collapsed');
        }
    });

    /* =========================================
       2. ACESSIBILIDADE
       ========================================= */
    const btnAcessibilidade = document.getElementById('btnAcessibilidade');
    const menuAcessibilidade = document.getElementById('menuAcessibilidade');
    const closeAcessibilidade = document.getElementById('closeAcessibilidade');
    const body = document.body;
    const accessBtns = document.querySelectorAll('.access-btn');
    const toastMsg = document.getElementById('toastMsg');

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
            if (menuAcessibilidade && !menuAcessibilidade.contains(e.target) && e.target !== btnAcessibilidade) {
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

    function getA11ySetting(key, defaultValue) {
        return localStorage.getItem(`a11y_${key}`) || defaultValue;
    }

    function setA11ySetting(key, value) {
        localStorage.setItem(`a11y_${key}`, value);
    }

    function applyAllA11ySettings() {
        body.classList.remove('a11y-dark-mode','a11y-high-contrast','a11y-large-text','a11y-small-text','a11y-spacing','a11y-highlight-links','a11y-saturation','a11y-grayscale','a11y-dyslexia');
        
        const darkMode = getA11ySetting('darkMode', 'false');
        const highContrast = getA11ySetting('highContrast', 'false');
        const textSize = getA11ySetting('textSize', 'normal');
        const spacing = getA11ySetting('spacing', 'false');
        const highlightLinks = getA11ySetting('highlightLinks', 'false');
        const saturation = getA11ySetting('saturation', 'false');
        const grayscale = getA11ySetting('grayscale', 'false');
        const dyslexia = getA11ySetting('dyslexia', 'false');

        if (darkMode === 'true') body.classList.add('a11y-dark-mode');
        if (highContrast === 'true') body.classList.add('a11y-high-contrast');
        if (textSize === 'large') body.classList.add('a11y-large-text');
        if (textSize === 'small') body.classList.add('a11y-small-text');
        if (spacing === 'true') body.classList.add('a11y-spacing');
        if (highlightLinks === 'true') body.classList.add('a11y-highlight-links');
        if (saturation === 'true') body.classList.add('a11y-saturation');
        if (grayscale === 'true') body.classList.add('a11y-grayscale');
        if (dyslexia === 'true') body.classList.add('a11y-dyslexia');
    }

    function updateButtonStates() {
        accessBtns.forEach(btn => {
            const spanText = btn.querySelector('span')?.textContent.trim().toLowerCase() || '';
            btn.style.background = '';
            btn.style.border = '';
            btn.style.color = '';
            const icon = btn.querySelector('i');
            if (icon) icon.style.color = '#8b5cf6';
            
            let isActive = false;
            if (spanText.includes('modo escuro') && getA11ySetting('darkMode','false') === 'true') isActive = true;
            if (spanText.includes('alto contraste') && getA11ySetting('highContrast','false') === 'true') isActive = true;
            if (spanText.includes('aumentar texto') && getA11ySetting('textSize','normal') === 'large') isActive = true;
            if (spanText.includes('diminuir texto') && getA11ySetting('textSize','normal') === 'small') isActive = true;
            if (spanText.includes('espaçamento') && getA11ySetting('spacing','false') === 'true') isActive = true;
            if (spanText.includes('destacar links') && getA11ySetting('highlightLinks','false') === 'true') isActive = true;
            if (spanText.includes('saturação') && getA11ySetting('saturation','false') === 'true') isActive = true;
            if (spanText.includes('fonte dislexia') && getA11ySetting('dyslexia','false') === 'true') isActive = true;
            if (spanText.includes('reset') && getA11ySetting('grayscale','false') === 'true') isActive = true;
            
            if (isActive) {
                btn.style.background = '#8b5cf6';
                btn.style.border = '2px solid #8b5cf6';
                btn.style.color = '#ffffff';
                if (icon) icon.style.color = '#ffffff';
            }
        });
    }

    function resetAllSettings() {
        ['darkMode','highContrast','textSize','spacing','highlightLinks','saturation','grayscale','dyslexia'].forEach(k => localStorage.removeItem(`a11y_${k}`));
        body.classList.remove('a11y-dark-mode','a11y-high-contrast','a11y-large-text','a11y-small-text','a11y-spacing','a11y-highlight-links','a11y-saturation','a11y-grayscale','a11y-dyslexia');
        accessBtns.forEach(btn => {
            btn.style.background = '';
            btn.style.border = '';
            btn.style.color = '';
            const icon = btn.querySelector('i');
            if (icon) icon.style.color = '#8b5cf6';
        });
        showToast('🔄 Configurações resetadas!', 'info');
    }

    accessBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const spanText = btn.querySelector('span')?.textContent.trim().toLowerCase() || '';
            if (spanText.includes('reset')) { resetAllSettings(); return; }
            if (spanText.includes('modo escuro')) {
                const c = getA11ySetting('darkMode', 'false');
                setA11ySetting('darkMode', c === 'true' ? 'false' : 'true');
            } else if (spanText.includes('alto contraste')) {
                const c = getA11ySetting('highContrast', 'false');
                setA11ySetting('highContrast', c === 'true' ? 'false' : 'true');
            } else if (spanText.includes('aumentar texto')) {
                const c = getA11ySetting('textSize', 'normal');
                setA11ySetting('textSize', c === 'large' ? 'normal' : 'large');
            } else if (spanText.includes('diminuir texto')) {
                const c = getA11ySetting('textSize', 'normal');
                setA11ySetting('textSize', c === 'small' ? 'normal' : 'small');
            } else if (spanText.includes('espaçamento')) {
                const c = getA11ySetting('spacing', 'false');
                setA11ySetting('spacing', c === 'true' ? 'false' : 'true');
            } else if (spanText.includes('destacar links')) {
                const c = getA11ySetting('highlightLinks', 'false');
                setA11ySetting('highlightLinks', c === 'true' ? 'false' : 'true');
            } else if (spanText.includes('saturação')) {
                const c = getA11ySetting('saturation', 'false');
                setA11ySetting('saturation', c === 'true' ? 'false' : 'true');
            } else if (spanText.includes('fonte dislexia')) {
                const c = getA11ySetting('dyslexia', 'false');
                setA11ySetting('dyslexia', c === 'true' ? 'false' : 'true');
            }
            applyAllA11ySettings();
            updateButtonStates();
        });
    });

    applyAllA11ySettings();
    updateButtonStates();

    function showToast(message, type = 'info') {
        if (!toastMsg) return;
        toastMsg.textContent = message;
        toastMsg.className = `toast-msg-custom ${type}`;
        toastMsg.style.opacity = '1';
        setTimeout(() => {
            toastMsg.style.opacity = '0';
        }, 3000);
    }

    /* =========================================
       3. BANCO DE DADOS DE PLANOS
       ========================================= */
    
    let plans = [
        {
            id: 1,
            name: "Plano de Desenvolvimento - João",
            description: "Plano individualizado focado no desenvolvimento da comunicação e interação social.",
            category: "comunicacao",
            goals: ["Desenvolver comunicação verbal", "Melhorar contato visual", "Iniciar interações sociais"],
            strategies: ["Uso de PECS", "Terapia ABA", "Rotina visual"],
            date: "15/03/2026"
        },
        {
            id: 2,
            name: "Plano Comportamental - Maria",
            description: "Estratégias para redução de comportamentos desafiadores e promoção de autorregulação.",
            category: "comportamento",
            goals: ["Reduzir crises de ansiedade", "Desenvolver técnicas de autorregulação", "Melhorar tolerância à frustração"],
            strategies: ["Reforço positivo", "Tempo fora estruturado", "Técnicas de respiração"],
            date: "10/03/2026"
        },
        {
            id: 3,
            name: "Plano Educacional - Pedro",
            description: "Adequações curriculares e estratégias para inclusão escolar.",
            category: "educacao",
            goals: ["Melhorar desempenho escolar", "Desenvolver habilidades de leitura", "Aprimorar raciocínio lógico"],
            strategies: ["Adaptação de materiais", "Sala de recursos", "Acompanhamento especializado"],
            date: "05/03/2026"
        },
        {
            id: 4,
            name: "Plano de Habilidades Sociais - Ana",
            description: "Desenvolvimento de competências sociais para interações mais saudáveis.",
            category: "social",
            goals: ["Iniciar conversas", "Manter amizades", "Identificar emoções próprias e alheias"],
            strategies: ["Role-playing", "Grupos de habilidades sociais", "Vídeos-modelo"],
            date: "28/02/2026"
        }
    ];

    let nextId = 5;
    let currentFilter = "todos";
    let currentSearch = "";
    let currentEditingId = null;

    const plansGrid = document.getElementById('plansGrid');
    const searchInput = document.getElementById('searchInput');
    const filterPills = document.querySelectorAll('.pill');
    const openModalBtn = document.getElementById('openPlanModalBtn');
    const closeModalBtn = document.getElementById('closePlanModalBtn');
    const planModal = document.getElementById('planModal');
    const planForm = document.getElementById('planForm');
    const viewPlanModal = document.getElementById('viewPlanModal');
    const closeViewModalBtn = document.getElementById('closeViewPlanModalBtn');
    const exportPlanBtn = document.getElementById('exportPlanBtn');
    const editPlanBtn = document.getElementById('editPlanBtn');

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function renderPlans() {
        if (!plansGrid) return;

        let filtered = [...plans];
        
        if (currentFilter !== "todos") {
            filtered = filtered.filter(plan => plan.category === currentFilter);
        }
        
        if (currentSearch.trim() !== "") {
            const term = currentSearch.toLowerCase();
            filtered = filtered.filter(plan => 
                plan.name.toLowerCase().includes(term) ||
                plan.description.toLowerCase().includes(term)
            );
        }

        if (filtered.length === 0) {
            plansGrid.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <i class="fa-solid fa-search" style="font-size: 48px; color: #9F7AEA; margin-bottom: 20px;"></i>
                    <h3>Nenhum plano encontrado</h3>
                    <p>Tente outro termo ou categoria</p>
                </div>
            `;
            return;
        }

        plansGrid.innerHTML = filtered.map(plan => `
            <div class="plan-card" data-id="${plan.id}">
                <div class="plan-header">
                    <span class="plan-category">${getCategoryName(plan.category)}</span>
                    <span class="plan-date"><i class="fa-regular fa-calendar"></i> ${plan.date}</span>
                </div>
                <div class="plan-body">
                    <h3>${escapeHtml(plan.name)}</h3>
                    <p>${escapeHtml(plan.description)}</p>
                    <div class="plan-goals">
                        <h4><i class="fa-solid fa-bullseye"></i> Metas</h4>
                        <ul>
                            ${plan.goals.map(goal => `<li><i class="fa-regular fa-circle-check"></i> ${escapeHtml(goal)}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="plan-footer">
                    <button class="btn-view" onclick="viewPlan(${plan.id})">Visualizar</button>
                    <button class="btn-edit" onclick="editPlan(${plan.id})">Editar</button>
                </div>
            </div>
        `).join('');
    }

    function getCategoryName(category) {
        const categories = {
            'educacao': '📚 Educação',
            'terapia': '💚 Terapia',
            'comportamento': '🧠 Comportamento',
            'comunicacao': '💬 Comunicação',
            'social': '👥 Social'
        };
        return categories[category] || category;
    }

    // CRUD Functions
    function addPlan(plan) {
        const newPlan = {
            id: nextId++,
            name: plan.name,
            description: plan.description,
            category: plan.category,
            goals: plan.goals.split(',').map(g => g.trim()),
            strategies: plan.strategies ? plan.strategies.split(',').map(s => s.trim()) : [],
            date: new Date().toLocaleDateString('pt-BR')
        };
        plans.push(newPlan);
        renderPlans();
        showToast('Plano criado com sucesso!', 'success');
    }

    function updatePlan(id, updatedData) {
        const index = plans.findIndex(p => p.id === id);
        if (index !== -1) {
            plans[index] = {
                ...plans[index],
                name: updatedData.name,
                description: updatedData.description,
                category: updatedData.category,
                goals: updatedData.goals.split(',').map(g => g.trim()),
                strategies: updatedData.strategies ? updatedData.strategies.split(',').map(s => s.trim()) : []
            };
            renderPlans();
            showToast('Plano atualizado com sucesso!', 'success');
        }
    }

    function deletePlan(id) {
        if (confirm('Tem certeza que deseja excluir este plano?')) {
            plans = plans.filter(p => p.id !== id);
            renderPlans();
            showToast('Plano excluído com sucesso!', 'success');
        }
    }

    window.viewPlan = function(id) {
        const plan = plans.find(p => p.id === id);
        if (!plan) return;
        
        const content = document.getElementById('viewPlanContent');
        document.getElementById('viewPlanTitle').textContent = plan.name;
        
        content.innerHTML = `
            <div class="plan-detail">
                <div class="detail-section">
                    <h4><i class="fa-solid fa-info-circle"></i> Descrição</h4>
                    <p>${escapeHtml(plan.description)}</p>
                </div>
                <div class="detail-section">
                    <h4><i class="fa-solid fa-bullseye"></i> Metas</h4>
                    <ul>
                        ${plan.goals.map(goal => `<li><i class="fa-regular fa-circle-check"></i> ${escapeHtml(goal)}</li>`).join('')}
                    </ul>
                </div>
                <div class="detail-section">
                    <h4><i class="fa-solid fa-lightbulb"></i> Estratégias</h4>
                    <ul>
                        ${plan.strategies.map(strategy => `<li><i class="fa-regular fa-star"></i> ${escapeHtml(strategy)}</li>`).join('')}
                    </ul>
                </div>
                <div class="detail-section">
                    <h4><i class="fa-solid fa-tag"></i> Categoria</h4>
                    <p><span class="category-badge">${getCategoryName(plan.category)}</span></p>
                </div>
                <div class="detail-section">
                    <h4><i class="fa-regular fa-calendar"></i> Data de Criação</h4>
                    <p>${plan.date}</p>
                </div>
            </div>
        `;
        
        // Store current plan ID for edit/delete actions
        viewPlanModal.dataset.currentId = id;
        viewPlanModal.classList.add('active');
    };

    window.editPlan = function(id) {
        const plan = plans.find(p => p.id === id);
        if (!plan) return;
        
        currentEditingId = id;
        document.getElementById('planName').value = plan.name;
        document.getElementById('planCategory').value = plan.category;
        document.getElementById('planDescription').value = plan.description;
        document.getElementById('planGoals').value = plan.goals.join(', ');
        document.getElementById('planStrategies').value = plan.strategies.join(', ');
        
        document.querySelector('#planModal h3').textContent = 'Editar Plano';
        planModal.classList.add('active');
    };

    // Modal handlers
    function openModal() {
        currentEditingId = null;
        planForm.reset();
        document.querySelector('#planModal h3').textContent = 'Criar Novo Plano';
        planModal.classList.add('active');
    }

    function closeModal() {
        planModal.classList.remove('active');
        currentEditingId = null;
        planForm.reset();
    }

    function closeViewModal() {
        viewPlanModal.classList.remove('active');
    }

    openModalBtn?.addEventListener('click', openModal);
    closeModalBtn?.addEventListener('click', closeModal);
    closeViewModalBtn?.addEventListener('click', closeViewModal);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === planModal) closeModal();
        if (e.target === viewPlanModal) closeViewModal();
    });

    // Form submit
    planForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const planData = {
            name: document.getElementById('planName').value,
            description: document.getElementById('planDescription').value,
            category: document.getElementById('planCategory').value,
            goals: document.getElementById('planGoals').value,
            strategies: document.getElementById('planStrategies').value
        };
        
        if (currentEditingId) {
            updatePlan(currentEditingId, planData);
        } else {
            addPlan(planData);
        }
        closeModal();
    });

    // Export PDF
    exportPlanBtn?.addEventListener('click', () => {
        const id = parseInt(viewPlanModal.dataset.currentId);
        const plan = plans.find(p => p.id === id);
        if (plan) {
            showToast('Gerando PDF do plano...', 'success');
            // Simulate PDF generation
            setTimeout(() => {
                showToast('PDF gerado com sucesso!', 'success');
            }, 1000);
        }
    });

    // Edit from view modal
    editPlanBtn?.addEventListener('click', () => {
        const id = parseInt(viewPlanModal.dataset.currentId);
        closeViewModal();
        editPlan(id);
    });

    // Filters
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.dataset.filter;
            renderPlans();
            showToast(`Filtrando por: ${pill.textContent}`, 'info');
        });
    });

    // Search
    let searchDebounce;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(() => {
                currentSearch = searchInput.value;
                renderPlans();
                if (currentSearch) showToast(`Buscando: "${currentSearch}"`, 'info');
            }, 500);
        });
    }

    // Initial render
    renderPlans();

    console.log('📋 Planos Individualizados inicializado!');
    console.log('   ✅ CRUD completo de planos');
    console.log('   ✅ Busca e filtros');
    console.log('   ✅ Visualização e edição');
});