/**
 * CONTATE.JS — Amor NeuroDivergente
 * Navbar dinâmica, acessibilidade integrada, formulário
 */

document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;

    // =============================================
    // 1. NAVBAR — Some ao descer, aparece ao subir
    // =============================================
    const navbar = document.getElementById('navbar');
    const progressBar = document.getElementById('readingProgress');
    let lastScrollY = window.scrollY;
    const scrollThreshold = 50;

    function handleScroll() {
        const currentScrollY = window.scrollY;

        // Barra de progresso
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (currentScrollY / docHeight) * 100 : 0;
        if (progressBar) progressBar.style.width = Math.min(progress, 100) + '%';

        // Esconder/mostrar navbar
        if (currentScrollY < scrollThreshold) {
            navbar.classList.remove('hidden');
        } else if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
            navbar.classList.add('hidden');
            // Fecha dropdown de acessibilidade
            const dropdown = document.getElementById('a11yDropdown');
            if (dropdown && !dropdown.hasAttribute('hidden')) {
                dropdown.setAttribute('hidden', '');
                document.getElementById('a11yToggle')?.setAttribute('aria-expanded', 'false');
            }
        } else if (currentScrollY < lastScrollY) {
            navbar.classList.remove('hidden');
        }

        lastScrollY = currentScrollY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // =============================================
    // 2. ACESSIBILIDADE INTEGRADA NA NAVBAR
    // =============================================
    const a11yToggle = document.getElementById('a11yToggle');
    const a11yDropdown = document.getElementById('a11yDropdown');

    if (a11yToggle && a11yDropdown) {
        a11yToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const hidden = a11yDropdown.hasAttribute('hidden');
            if (hidden) {
                a11yDropdown.removeAttribute('hidden');
                a11yToggle.setAttribute('aria-expanded', 'true');
            } else {
                a11yDropdown.setAttribute('hidden', '');
                a11yToggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('click', (e) => {
            if (!a11yDropdown.contains(e.target) && e.target !== a11yToggle) {
                a11yDropdown.setAttribute('hidden', '');
                a11yToggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !a11yDropdown.hasAttribute('hidden')) {
                a11yDropdown.setAttribute('hidden', '');
                a11yToggle.setAttribute('aria-expanded', 'false');
                a11yToggle.focus();
            }
        });
    }

    function gs(k, fb) { return localStorage.getItem('a11y_' + k) || fb; }
    function ss(k, v) { localStorage.setItem('a11y_' + k, v); }
    function usl(id, active) { const el = document.getElementById(id); if (el) el.textContent = active ? 'Ligado' : 'Desligado'; }

    function applySettings() {
        const formCard = document.querySelector('.form-card');
        const sideCards = document.querySelector('.sidebar-container');

        if (gs('darkMode') === 'true') body.classList.add('a11y-dark-mode');
        if (gs('highlightLinks') === 'true') body.classList.add('a11y-highlight-links');
        if (gs('dyslexiaFont') === 'true') body.classList.add('a11y-dyslexia');
        if (gs('reduceMotion') === 'true') body.classList.add('a11y-reduce-motion');

        const ts = gs('textSize', 'normal');
        if (formCard) {
            formCard.classList.remove('a11y-large-text', 'a11y-small-text');
            if (ts === 'large') formCard.classList.add('a11y-large-text');
            if (ts === 'small') formCard.classList.add('a11y-small-text');
        }
        if (sideCards) {
            sideCards.classList.remove('a11y-large-text', 'a11y-small-text');
            if (ts === 'large') sideCards.classList.add('a11y-large-text');
            if (ts === 'small') sideCards.classList.add('a11y-small-text');
        }

        usl('darkModeStatus', gs('darkMode') === 'true');
        usl('linksStatus', gs('highlightLinks') === 'true');
        usl('dyslexiaStatus', gs('dyslexiaFont') === 'true');
        usl('motionStatus', gs('reduceMotion') === 'true');
    }

    // Configura botões de acessibilidade
    document.querySelectorAll('.a11y-option, .a11y-reset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const action = btn.getAttribute('data-a11y');
            const formCard = document.querySelector('.form-card');
            const sideCards = document.querySelector('.sidebar-container');

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
                    if (cs === 'large') {
                        ss('textSize', 'normal');
                        if (formCard) formCard.classList.remove('a11y-large-text');
                        if (sideCards) sideCards.classList.remove('a11y-large-text');
                    } else {
                        ss('textSize', 'large');
                        if (formCard) { formCard.classList.remove('a11y-small-text'); formCard.classList.add('a11y-large-text'); }
                        if (sideCards) { sideCards.classList.remove('a11y-small-text'); sideCards.classList.add('a11y-large-text'); }
                    }
                    break;
                case 'decreaseText':
                    const cz = gs('textSize', 'normal');
                    if (cz === 'small') {
                        ss('textSize', 'normal');
                        if (formCard) formCard.classList.remove('a11y-small-text');
                        if (sideCards) sideCards.classList.remove('a11y-small-text');
                    } else {
                        ss('textSize', 'small');
                        if (formCard) { formCard.classList.remove('a11y-large-text'); formCard.classList.add('a11y-small-text'); }
                        if (sideCards) { sideCards.classList.remove('a11y-large-text'); sideCards.classList.add('a11y-small-text'); }
                    }
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
                    ['darkMode', 'highlightLinks', 'dyslexiaFont', 'reduceMotion', 'textSize'].forEach(k => localStorage.removeItem('a11y_' + k));
                    body.classList.remove('a11y-dark-mode', 'a11y-highlight-links', 'a11y-dyslexia', 'a11y-reduce-motion');
                    if (formCard) formCard.classList.remove('a11y-large-text', 'a11y-small-text');
                    if (sideCards) sideCards.classList.remove('a11y-large-text', 'a11y-small-text');
                    usl('darkModeStatus', false); usl('linksStatus', false);
                    usl('dyslexiaStatus', false); usl('motionStatus', false);
                    break;
            }
        });
    });

    applySettings();

    // =============================================
    // 3. FORMULÁRIO DE ATENDIMENTO
    // =============================================
    const formCaso = document.getElementById('form-caso');
    const currentChars = document.getElementById('current-chars');
    const supportForm = document.getElementById('support-form');

    // Contador de caracteres
    if (formCaso && currentChars) {
        formCaso.addEventListener('input', (e) => {
            const length = e.target.value.length;
            currentChars.textContent = length;
            currentChars.style.color = length >= 3800 ? '#ef4444' : length >= 3000 ? '#f59e0b' : '#91919f';
        });
    }

    // Envio do formulário
    if (supportForm) {
        supportForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = {
                nome: document.getElementById('form-nome')?.value.trim() || '',
                email: document.getElementById('form-email')?.value.trim() || '',
                telefone: document.getElementById('form-phone')?.value.trim() || 'Não informado',
                cidade: document.getElementById('form-cidade')?.value.trim() || 'Não informado',
                canalPreferido: document.getElementById('form-canal')?.value || '',
                departamento: document.getElementById('form-depto')?.value || '',
                assunto: document.getElementById('form-assunto')?.value.trim() || '',
                caso: formCaso?.value.trim() || ''
            };

            // Validação básica
            if (!formData.nome || !formData.email || !formData.assunto || !formData.caso) {
                showNotification('Preencha todos os campos obrigatórios.', 'error');
                return;
            }

            // Gera protocolo
            const protocolo = 'AND-' + Date.now().toString(36).toUpperCase();
            
            console.log('📋 Solicitação de atendimento:', { protocolo, ...formData });
            
            // Feedback visual
            showNotification(`Atendimento #${protocolo} aberto! Verifique seu e-mail.`, 'success');
            
            // Reseta formulário
            supportForm.reset();
            if (currentChars) currentChars.textContent = '0';
            if (currentChars) currentChars.style.color = '#91919f';
            
            // Salva no localStorage para histórico
            try {
                let atendimentos = JSON.parse(localStorage.getItem('atendimentos') || '[]');
                atendimentos.push({ protocolo, data: new Date().toISOString(), ...formData });
                if (atendimentos.length > 20) atendimentos = atendimentos.slice(-20);
                localStorage.setItem('atendimentos', JSON.stringify(atendimentos));
            } catch (err) {}
        });
    }

    // =============================================
    // 4. NOTIFICAÇÃO TOAST
    // =============================================
    function showNotification(message, type = 'info') {
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2d2a28'};
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            z-index: 9999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            animation: toastIn 0.3s ease;
            max-width: 90vw;
            text-align: center;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // Animação do toast
    if (!document.getElementById('toastStyle')) {
        const style = document.createElement('style');
        style.id = 'toastStyle';
        style.textContent = `
            @keyframes toastIn {
                from { opacity: 0; transform: translateX(-50%) translateY(10px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    // =============================================
    // 5. INICIALIZAÇÃO
    // =============================================
    console.log('📞 Página de Contato pronta!');
    console.log('   🧭 Navbar dinâmica (some ao descer)');
    console.log('   ♿ Acessibilidade integrada');
    console.log('   📋 Formulário com protocolo');
});