// =========================================================================
// 🧠 AMOR NEURODIVERGENTE - QUEM SOMOS
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {

    const body = document.body;

    // =========================================================================
    // SIDEBAR RESPONSIVA
    // =========================================================================
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    function isMobile() { return window.innerWidth <= 768; }

    function toggleSidebar() {
        if (!sidebar) return;
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
        if (isMobile() && sidebar && sidebar.classList.contains('active')) {
            toggleSidebar();
        }
    });

    document.addEventListener('click', (e) => {
        if (isMobile() && sidebar && sidebar.classList.contains('active')) {
            if (!sidebar.contains(e.target) && e.target !== toggleBtn && !toggleBtn?.contains(e.target)) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    window.addEventListener('resize', () => {
        if (!sidebar) return;
        if (!isMobile()) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            sidebar.classList.remove('collapsed');
        }
    });

    // =========================================================================
    // ACESSIBILIDADE (PADRÃO DO PROJETO)
    // =========================================================================
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

    function getA11ySetting(key, defaultValue) {
        return localStorage.getItem(`a11y_${key}`) || defaultValue;
    }

    function setA11ySetting(key, value) {
        localStorage.setItem(`a11y_${key}`, value);
    }

    function applyAllA11ySettings() {
        body.classList.remove(
            'a11y-dark-mode',
            'a11y-high-contrast',
            'a11y-large-text',
            'a11y-small-text',
            'a11y-spacing',
            'a11y-highlight-links',
            'a11y-saturation',
            'a11y-grayscale',
            'a11y-dyslexia'
        );

        if (getA11ySetting('darkMode', 'false') === 'true') body.classList.add('a11y-dark-mode');
        if (getA11ySetting('highContrast', 'false') === 'true') body.classList.add('a11y-high-contrast');
        if (getA11ySetting('textSize', 'normal') === 'large') body.classList.add('a11y-large-text');
        if (getA11ySetting('textSize', 'normal') === 'small') body.classList.add('a11y-small-text');
        if (getA11ySetting('spacing', 'false') === 'true') body.classList.add('a11y-spacing');
        if (getA11ySetting('highlightLinks', 'false') === 'true') body.classList.add('a11y-highlight-links');
        if (getA11ySetting('saturation', 'false') === 'true') body.classList.add('a11y-saturation');
        if (getA11ySetting('grayscale', 'false') === 'true') body.classList.add('a11y-grayscale');
        if (getA11ySetting('dyslexia', 'false') === 'true') body.classList.add('a11y-dyslexia');
    }

    function updateButtonStates() {
        accessBtns.forEach(btn => {
            const spanText = btn.querySelector('span')?.textContent.trim().toLowerCase() || '';
            
            // Reset
            btn.style.background = '';
            btn.style.border = '';
            btn.style.color = '';
            
            const icon = btn.querySelector('i');
            if (icon) icon.style.color = '#8b5cf6';
            
            let isActive = false;
            
            if (spanText.includes('escurecer') && getA11ySetting('darkMode', 'false') === 'true') isActive = true;
            if (spanText.includes('alto') && getA11ySetting('highContrast', 'false') === 'true') isActive = true;
            if (spanText.includes('maior') && getA11ySetting('textSize', 'normal') === 'large') isActive = true;
            if (spanText.includes('menor') && getA11ySetting('textSize', 'normal') === 'small') isActive = true;
            if (spanText.includes('espaçamento') && getA11ySetting('spacing', 'false') === 'true') isActive = true;
            if (spanText.includes('links') && getA11ySetting('highlightLinks', 'false') === 'true') isActive = true;
            if (spanText.includes('saturação') && getA11ySetting('saturation', 'false') === 'true') isActive = true;
            if (spanText.includes('dislexia') && getA11ySetting('dyslexia', 'false') === 'true') isActive = true;
            if (spanText.includes('reset') && getA11ySetting('grayscale', 'false') === 'true') isActive = true;
            
            if (isActive) {
                btn.style.background = '#8b5cf6';
                btn.style.border = '2px solid #8b5cf6';
                btn.style.color = '#ffffff';
                if (icon) icon.style.color = '#ffffff';
            }
        });
    }

    function resetAllSettings() {
        ['darkMode', 'highContrast', 'textSize', 'spacing', 'highlightLinks', 'saturation', 'grayscale', 'dyslexia'].forEach(k => 
            localStorage.removeItem(`a11y_${k}`)
        );
        
        body.classList.remove(
            'a11y-dark-mode',
            'a11y-high-contrast',
            'a11y-large-text',
            'a11y-small-text',
            'a11y-spacing',
            'a11y-highlight-links',
            'a11y-saturation',
            'a11y-grayscale',
            'a11y-dyslexia'
        );
        
        accessBtns.forEach(btn => {
            btn.style.background = '';
            btn.style.border = '';
            btn.style.color = '';
            const icon = btn.querySelector('i');
            if (icon) icon.style.color = '#8b5cf6';
        });
    }

    accessBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const spanText = btn.querySelector('span')?.textContent.trim().toLowerCase() || '';
            
            if (spanText.includes('reset')) {
                resetAllSettings();
                return;
            }
            
            if (spanText.includes('escurecer')) {
                const current = getA11ySetting('darkMode', 'false');
                setA11ySetting('darkMode', current === 'true' ? 'false' : 'true');
            } else if (spanText.includes('alto')) {
                const current = getA11ySetting('highContrast', 'false');
                setA11ySetting('highContrast', current === 'true' ? 'false' : 'true');
            } else if (spanText.includes('maior')) {
                const current = getA11ySetting('textSize', 'normal');
                setA11ySetting('textSize', current === 'large' ? 'normal' : 'large');
            } else if (spanText.includes('menor')) {
                const current = getA11ySetting('textSize', 'normal');
                setA11ySetting('textSize', current === 'small' ? 'normal' : 'small');
            } else if (spanText.includes('espaçamento')) {
                const current = getA11ySetting('spacing', 'false');
                setA11ySetting('spacing', current === 'true' ? 'false' : 'true');
            } else if (spanText.includes('links')) {
                const current = getA11ySetting('highlightLinks', 'false');
                setA11ySetting('highlightLinks', current === 'true' ? 'false' : 'true');
            } else if (spanText.includes('saturação')) {
                const current = getA11ySetting('saturation', 'false');
                setA11ySetting('saturation', current === 'true' ? 'false' : 'true');
            } else if (spanText.includes('dislexia')) {
                const current = getA11ySetting('dyslexia', 'false');
                setA11ySetting('dyslexia', current === 'true' ? 'false' : 'true');
            }
            
            applyAllA11ySettings();
            updateButtonStates();
        });
    });

    // Inicializa
    applyAllA11ySettings();
    updateButtonStates();

    // =========================================================================
    // FILTROS DE PILLS (Blog / Rede de Apoio / Troca que transforma)
    // =========================================================================
    const pillButtons = document.querySelectorAll('.pill');
    pillButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.style.pointerEvents === 'none') return; // Não clicável
            const parent = this.parentElement;
            parent.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    console.log('👥 Quem Somos inicializado!');
    console.log('   ✅ Sidebar responsiva');
    console.log('   ✅ Acessibilidade completa (9 modos)');
    console.log('   ✅ Filtros de pills');
});