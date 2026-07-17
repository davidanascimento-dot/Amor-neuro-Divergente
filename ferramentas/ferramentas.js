document.addEventListener('DOMContentLoaded', function() {
    
    const body = document.body;

    // =============================================
    // 0. SINCRONIZAÇÃO DE PERFIL
    // =============================================
    function syncProfile() {
        const savedAvatar = localStorage.getItem('userAvatar');
        const savedName = localStorage.getItem('userName');
        
        const headerAvatar = document.getElementById('headerAvatar');
        if (headerAvatar && savedAvatar) {
            headerAvatar.src = savedAvatar;
            headerAvatar.onerror = () => { headerAvatar.src = '/img/avatar-padrao.png'; };
        }
        
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        if (sidebarAvatar && savedAvatar) {
            sidebarAvatar.src = savedAvatar;
            sidebarAvatar.onerror = () => { sidebarAvatar.src = '/img/avatar-padrao.png'; };
        }
        
        const sidebarUserName = document.getElementById('sidebarUserName');
        if (sidebarUserName && savedName) {
            sidebarUserName.textContent = savedName;
        }
        
        const sidebarUserEmail = document.getElementById('sidebarUserEmail');
        const savedEmail = localStorage.getItem('userEmail');
        if (sidebarUserEmail && savedEmail) {
            sidebarUserEmail.textContent = savedEmail;
        }
    }
    
    syncProfile();
    window.addEventListener('storage', (e) => {
        if (e.key === 'userAvatar' || e.key === 'userName' || e.key === 'userEmail') syncProfile();
    });

    // =============================================
    // 1. SIDEBAR TOGGLE
    // =============================================
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (sidebarToggleBtn && sidebar && sidebarOverlay) {
        function toggleSidebar(open) {
            const isOpen = typeof open === 'boolean' ? open : sidebar.classList.contains('open');
            if (typeof open === 'boolean') {
                if (open) {
                    sidebar.classList.add('open');
                    sidebarOverlay.classList.add('active');
                    sidebarToggleBtn.setAttribute('aria-expanded', 'true');
                    sidebarToggleBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                    document.body.style.overflow = 'hidden';
                } else {
                    sidebar.classList.remove('open');
                    sidebarOverlay.classList.remove('active');
                    sidebarToggleBtn.setAttribute('aria-expanded', 'false');
                    sidebarToggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
                    document.body.style.overflow = '';
                }
                return;
            }
            
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('active');
                sidebarToggleBtn.setAttribute('aria-expanded', 'false');
                sidebarToggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
                document.body.style.overflow = '';
            } else {
                sidebar.classList.add('open');
                sidebarOverlay.classList.add('active');
                sidebarToggleBtn.setAttribute('aria-expanded', 'true');
                sidebarToggleBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                document.body.style.overflow = 'hidden';
            }
        }

        sidebarToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });

        sidebarOverlay.addEventListener('click', () => {
            toggleSidebar(false);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                toggleSidebar(false);
            }
        });
    }

    // =============================================
    // 2. PROFILE TOGGLE NA SIDEBAR
    // =============================================
    const profileToggle = document.getElementById('profileToggle');
    const profileDetail = document.getElementById('profileDetail');

    if (profileToggle && profileDetail) {
        profileToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isExpanded = profileToggle.getAttribute('aria-expanded') === 'true';
            profileToggle.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
            if (isExpanded) {
                profileDetail.setAttribute('hidden', '');
            } else {
                profileDetail.removeAttribute('hidden');
            }
        });
    }

    // =============================================
    // 3. SIDEBAR A11Y TOGGLE
    // =============================================
    const sidebarA11yToggle = document.getElementById('a11yToggle');
    const sidebarA11yOptions = document.getElementById('a11yOptions');

    if (sidebarA11yToggle && sidebarA11yOptions) {
        sidebarA11yToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isExpanded = sidebarA11yToggle.getAttribute('aria-expanded') === 'true';
            sidebarA11yToggle.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
            if (isExpanded) {
                sidebarA11yOptions.setAttribute('hidden', '');
            } else {
                sidebarA11yOptions.removeAttribute('hidden');
            }
        });
    }

    // =============================================
    // 4. BOTÃO VOLTAR AO TOPO
    // =============================================
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // =============================================
    // 5. HEADER GLASS SCROLL EFFECT
    // =============================================
    const headerGlass = document.getElementById('headerGlass');
    if (headerGlass) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                headerGlass.classList.add('scrolled');
            } else {
                headerGlass.classList.remove('scrolled');
            }
        });
    }

    // =============================================
    // 6. ACESSIBILIDADE
    // =============================================
    function gs(k, fb) { return localStorage.getItem('a11y_' + k) || fb; }
    function ss(k, v) { localStorage.setItem('a11y_' + k, v); }
    function usl(id, active) { 
        const el = document.getElementById(id); 
        if (el) el.textContent = active ? 'Ligado' : 'Desligado'; 
    }

    function applySettings() {
        const content = document.querySelector('.content-container');
        if (gs('darkMode') === 'true') body.classList.add('a11y-dark-mode');
        if (gs('highlightLinks') === 'true') body.classList.add('a11y-highlight-links');
        if (gs('dyslexiaFont') === 'true') body.classList.add('a11y-dyslexia');
        if (gs('reduceMotion') === 'true') body.classList.add('a11y-reduce-motion');
        
        const ts = gs('textSize', 'normal');
        if (content) {
            content.classList.remove('a11y-large-text', 'a11y-small-text');
            if (ts === 'large') content.classList.add('a11y-large-text');
            if (ts === 'small') content.classList.add('a11y-small-text');
        }
        
        usl('darkModeStatus', gs('darkMode') === 'true');
        usl('linksStatus', gs('highlightLinks') === 'true');
        usl('dyslexiaStatus', gs('dyslexiaFont') === 'true');
        usl('motionStatus', gs('reduceMotion') === 'true');
    }

    // Acessibilidade na sidebar
    document.querySelectorAll('.sidebar .a11y-option, .sidebar .a11y-reset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const action = btn.getAttribute('data-a11y');
            const content = document.querySelector('.content-container');

            switch (action) {
                case 'darkMode':
                    const dm = gs('darkMode') === 'true';
                    ss('darkMode', dm ? 'false' : 'true');
                    if (dm) body.classList.remove('a11y-dark-mode');
                    else body.classList.add('a11y-dark-mode');
                    usl('darkModeStatus', !dm);
                    break;
                case 'increaseText':
                    const cs = gs('textSize', 'normal');
                    if (cs === 'large') { ss('textSize', 'normal'); if (content) content.classList.remove('a11y-large-text'); }
                    else { ss('textSize', 'large'); if (content) { content.classList.remove('a11y-small-text'); content.classList.add('a11y-large-text'); } }
                    break;
                case 'decreaseText':
                    const cz = gs('textSize', 'normal');
                    if (cz === 'small') { ss('textSize', 'normal'); if (content) content.classList.remove('a11y-small-text'); }
                    else { ss('textSize', 'small'); if (content) { content.classList.remove('a11y-large-text'); content.classList.add('a11y-small-text'); } }
                    break;
                case 'highlightLinks':
                    const hl = gs('highlightLinks') === 'true';
                    ss('highlightLinks', hl ? 'false' : 'true');
                    if (hl) body.classList.remove('a11y-highlight-links');
                    else body.classList.add('a11y-highlight-links');
                    usl('linksStatus', !hl);
                    break;
                case 'dyslexiaFont':
                    const df = gs('dyslexiaFont') === 'true';
                    ss('dyslexiaFont', df ? 'false' : 'true');
                    if (df) body.classList.remove('a11y-dyslexia');
                    else body.classList.add('a11y-dyslexia');
                    usl('dyslexiaStatus', !df);
                    break;
                case 'reduceMotion':
                    const rm = gs('reduceMotion') === 'true';
                    ss('reduceMotion', rm ? 'false' : 'true');
                    if (rm) body.classList.remove('a11y-reduce-motion');
                    else body.classList.add('a11y-reduce-motion');
                    usl('motionStatus', !rm);
                    break;
                case 'reset':
                    ['darkMode','highlightLinks','dyslexiaFont','reduceMotion','textSize'].forEach(k => localStorage.removeItem('a11y_'+k));
                    body.classList.remove('a11y-dark-mode','a11y-highlight-links','a11y-dyslexia','a11y-reduce-motion');
                    if (content) content.classList.remove('a11y-large-text','a11y-small-text');
                    usl('darkModeStatus',false); usl('linksStatus',false);
                    usl('dyslexiaStatus',false); usl('motionStatus',false);
                    break;
            }
        });
    });

    applySettings();

    // =============================================
    // 7. TAB SYSTEM
    // =============================================
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    const tabContents = document.querySelectorAll('.tab-content');

    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetTab = trigger.getAttribute('data-tab');
            tabTriggers.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            trigger.classList.add('active');
            const targetContent = document.getElementById(`tab-${targetTab}`);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // =============================================
    // 8. TIMER VISUAL
    // =============================================
    const timerDigits = document.getElementById('timerDigits');
    const btnTimerStart = document.getElementById('btnTimerStart');
    const btnTimerReset = document.getElementById('btnTimerReset');
    const presetButtons = document.querySelectorAll('.preset-btn');
    
    let timerInterval = null;
    let timeLeft = 25 * 60;
    let isRunning = false;
    let currentMinutes = 25;

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        if (timerDigits) {
            timerDigits.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }

    function setTimerPreset(minutes) {
        if (isRunning) pauseTimer();
        currentMinutes = minutes;
        timeLeft = minutes * 60;
        updateTimerDisplay();
        presetButtons.forEach(btn => {
            const btnMinutes = parseInt(btn.getAttribute('data-minutes'));
            btn.classList.toggle('active', btnMinutes === minutes);
        });
        if (btnTimerStart) {
            btnTimerStart.innerHTML = '<i class="fa-solid fa-play"></i> Iniciar';
        }
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        if (btnTimerStart) btnTimerStart.innerHTML = '<i class="fa-solid fa-pause"></i> Pausar';
        timerInterval = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                isRunning = false;
                if (btnTimerStart) btnTimerStart.innerHTML = '<i class="fa-solid fa-play"></i> Iniciar';
                if (timerDigits) timerDigits.textContent = '00:00';
                playTimerSound();
                if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
                showToast('⏰ Tempo finalizado!', 'info');
                setTimeout(() => { timeLeft = currentMinutes * 60; updateTimerDisplay(); }, 2000);
                return;
            }
            timeLeft--;
            updateTimerDisplay();
        }, 1000);
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        if (btnTimerStart) btnTimerStart.innerHTML = '<i class="fa-solid fa-play"></i> Continuar';
    }

    function resetTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        timeLeft = currentMinutes * 60;
        updateTimerDisplay();
        if (btnTimerStart) btnTimerStart.innerHTML = '<i class="fa-solid fa-play"></i> Iniciar';
    }

    function playTimerSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;
            oscillator.start();
            setTimeout(() => { oscillator.stop(); audioContext.close(); }, 300);
        } catch (e) {}
    }

    if (btnTimerStart) btnTimerStart.addEventListener('click', () => isRunning ? pauseTimer() : startTimer());
    if (btnTimerReset) btnTimerReset.addEventListener('click', resetTimer);
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => setTimerPreset(parseInt(btn.getAttribute('data-minutes'))));
    });
    updateTimerDisplay();

    // =============================================
    // 9. SAFE SPACE CHECKLIST
    // =============================================
    const checklistItems = [
        { id: 1, text: 'Chaves', icon: '🔑' },
        { id: 2, text: 'Celular', icon: '📱' },
        { id: 3, text: 'Carteira', icon: '👛' },
        { id: 4, text: 'Fones de ouvido', icon: '🎧' },
        { id: 5, text: 'Garrafa de água', icon: '💧' },
        { id: 6, text: 'Lanches/ snacks', icon: '🍎' },
        { id: 7, text: 'Medicamentos', icon: '💊' },
        { id: 8, text: 'Óculos de sol', icon: '🕶️' },
        { id: 9, text: 'Carregador portátil', icon: '🔋' },
        { id: 10, text: 'Objeto sensorial/ fidget', icon: '🧸' },
        { id: 11, text: 'Documento de identidade', icon: '🪪' },
        { id: 12, text: 'Máscara (se necessário)', icon: '😷' },
        { id: 13, text: 'Guarda-chuva', icon: '☂️' },
        { id: 14, text: 'Caderno/ planner', icon: '📓' },
        { id: 15, text: 'Capa de chuva', icon: '🧥' },
        { id: 16, text: 'Protetor solar', icon: '☀️' },
        { id: 17, text: 'Cartão de transporte', icon: '🚌' },
        { id: 18, text: 'Lenços de papel', icon: '🤧' }
    ];

    const checklistContainer = document.getElementById('checklistContainer');
    const progressBar = document.getElementById('progressBar');
    const progressCount = document.getElementById('progressCount');

    function createChecklistItemElement(itemData, isCustom = false) {
        const itemRow = document.createElement('div');
        itemRow.className = 'checklist-item';
        itemRow.setAttribute('data-id', itemData.id);
        const checked = isCustom ? itemData.checked : isChecked(itemData.id);
        if (checked) itemRow.classList.add('completed');
        itemRow.innerHTML = `
            <div class="item-left">
                <input type="checkbox" class="checklist-checkbox" ${checked ? 'checked' : ''}>
                <span class="checklist-icon">${itemData.icon || '📋'}</span>
                <span class="checklist-text">${itemData.text}</span>
            </div>
            <button class="delete-btn" aria-label="Remover item"><i class="fa-solid fa-trash-can"></i></button>
        `;
        
        const checkbox = itemRow.querySelector('.checklist-checkbox');
        checkbox.addEventListener('change', () => {
            itemRow.classList.toggle('completed', checkbox.checked);
            if (!isCustom) toggleChecklistItem(itemData.id, checkbox.checked);
            updateProgress();
            if (getCheckedCount() === checklistItems.length) celebrateCompletion();
        });
        
        const deleteBtn = itemRow.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            itemRow.remove();
            if (!isCustom) removeChecklistItem(itemData.id);
            updateProgress();
        });
        
        return itemRow;
    }

    function renderChecklist() {
        if (!checklistContainer) return;
        checklistContainer.innerHTML = '';
        checklistItems.forEach(item => {
            checklistContainer.appendChild(createChecklistItemElement(item, false));
        });
        updateProgress();
    }

    function isChecked(id) {
        try { return JSON.parse(localStorage.getItem('safeSpaceChecklist') || '[]').includes(id); } catch { return false; }
    }

    function toggleChecklistItem(id, checked) {
        try {
            let saved = JSON.parse(localStorage.getItem('safeSpaceChecklist') || '[]');
            if (checked) { if (!saved.includes(id)) saved.push(id); }
            else { saved = saved.filter(item => item !== id); }
            localStorage.setItem('safeSpaceChecklist', JSON.stringify(saved));
        } catch (e) {}
    }

    function removeChecklistItem(id) {
        try {
            let saved = JSON.parse(localStorage.getItem('safeSpaceChecklist') || '[]');
            saved = saved.filter(item => item !== id);
            localStorage.setItem('safeSpaceChecklist', JSON.stringify(saved));
        } catch (e) {}
    }

    function getCheckedCount() {
        return checklistContainer ? checklistContainer.querySelectorAll('.checklist-checkbox:checked').length : 0;
    }

    function updateProgress() {
        const checked = getCheckedCount();
        const total = checklistItems.length;
        if (progressBar) progressBar.style.width = ((checked / total) * 100) + '%';
        if (progressCount) progressCount.textContent = `${checked}/${total}`;
    }

    function celebrateCompletion() {
        const confetti = document.createElement('div');
        confetti.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;z-index:9999;pointer-events:none;background:rgba(0,0,0,0.1);padding:20px;border-radius:16px;';
        confetti.textContent = '🎉✨ Tudo pronto! ✨🎉';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 2500);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
        showToast('🎉 Checklist completo!', 'success');
    }

    const newItemInput = document.getElementById('newItemInput');
    const addItemBtn = document.getElementById('addItemBtn');
    let customItemCounter = 1000;

    if (addItemBtn && newItemInput) {
        addItemBtn.addEventListener('click', () => {
            const text = newItemInput.value.trim();
            if (text !== '') {
                const customItem = { id: customItemCounter++, text: text, icon: '📋', checked: false };
                checklistContainer.appendChild(createChecklistItemElement(customItem, true));
                newItemInput.value = '';
                updateProgress();
                showToast('✅ Item adicionado!', 'success');
            }
        });
        newItemInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addItemBtn.click(); });
    }

    function checkAndResetDaily() {
        const lastReset = localStorage.getItem('checklistLastReset');
        const today = new Date().toDateString();
        if (lastReset !== today) {
            localStorage.setItem('safeSpaceChecklist', '[]');
            localStorage.setItem('checklistLastReset', today);
            renderChecklist();
        }
    }

    checkAndResetDaily();
    renderChecklist();

    // =============================================
    // 10. DIÁRIO SENSORIAL
    // =============================================
    const moodButtons = document.querySelectorAll('.mood-btn');
    const energySlider = document.getElementById('energySlider');
    const energyDisplay = document.getElementById('energyDisplay');
    const stimuliButtons = document.querySelectorAll('.stimuli-btn');
    const sensoryNotes = document.getElementById('sensoryNotes');
    const btnSaveSensory = document.getElementById('btnSaveSensory');
    
    if (energySlider && energyDisplay) {
        energySlider.addEventListener('input', (e) => { energyDisplay.textContent = `${e.target.value}/5`; });
    }
    
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            moodButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    stimuliButtons.forEach(btn => {
        btn.addEventListener('click', () => { btn.classList.toggle('active'); });
    });
    
    if (btnSaveSensory) {
        btnSaveSensory.addEventListener('click', () => {
            const activeMood = document.querySelector('.mood-btn.active');
            const mood = activeMood ? activeMood.getAttribute('data-mood') : 'Neutro';
            const energy = energySlider ? energySlider.value : 3;
            const selectedStimuli = Array.from(document.querySelectorAll('.stimuli-btn.active')).map(btn => btn.getAttribute('data-stimulus'));
            const notes = sensoryNotes ? sensoryNotes.value : '';
            
            saveSensoryEntry({ 
                date: new Date().toISOString(), 
                mood, 
                energy, 
                stimuli: selectedStimuli, 
                notes 
            });
            
            showToast('📝 Entrada sensorial registrada!', 'success');
            if (sensoryNotes) sensoryNotes.value = '';
            
            // Resetar seleção de estímulos
            stimuliButtons.forEach(btn => btn.classList.remove('active'));
            
            // Resetar humor para Neutro
            moodButtons.forEach(b => b.classList.remove('active'));
            document.querySelector('.mood-btn[data-mood="Neutro"]')?.classList.add('active');
            
            // Resetar energia
            if (energySlider) energySlider.value = 3;
            if (energyDisplay) energyDisplay.textContent = '3/5';
        });
    }
    
    function saveSensoryEntry(data) {
        try {
            let entries = JSON.parse(localStorage.getItem('sensoryDiary') || '[]');
            entries.push(data);
            if (entries.length > 30) entries = entries.slice(-30);
            localStorage.setItem('sensoryDiary', JSON.stringify(entries));
        } catch (e) {}
    }

    // =============================================
    // 11. TOAST SYSTEM
    // =============================================
    const toastMsg = document.getElementById('toastMsg');
    let toastTimeout = null;

    function showToast(message, type = 'info') {
        if (!toastMsg) return;
        
        toastMsg.textContent = message;
        toastMsg.className = 'toast-msg-custom ' + type;
        
        clearTimeout(toastTimeout);
        toastMsg.classList.add('show');
        
        toastTimeout = setTimeout(() => {
            toastMsg.classList.remove('show');
        }, 3500);
    }

    // =============================================
    // 12. INICIALIZAÇÃO
    // =============================================
    console.log('✨ Central de Planejamento Visual - Amor NeuroDivergente');
    console.log('🚀 Todas as ferramentas carregadas!');
    console.log('📋 Timer Visual | Checklist Safe Space | Diário Sensorial');
    console.log('♿ Acessibilidade na sidebar');
    console.log('💾 Dados salvos localmente no seu navegador');

    // Mostrar toast de boas-vindas
    setTimeout(() => {
        showToast('👋 Bem-vindo à Central de Ferramentas!', 'info');
    }, 500);
});