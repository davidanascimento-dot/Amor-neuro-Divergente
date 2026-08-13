// =========================================================================
// DOACOES.JS — Amor NeuroDivergente
// Sidebar responsiva + Carrossel 3D + Área PIX + Hub Flutuante + Scroll Top
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    const body = document.body;

    // ============================================
    // 0. SINCRONIZAÇÃO DE PERFIL
    // ============================================
    function syncProfile() {
        const savedName = localStorage.getItem('userName');
        const savedEmail = localStorage.getItem('userEmail');
        const savedAvatar = localStorage.getItem('userAvatar');
        
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        const sidebarUserName = document.getElementById('sidebarUserName');
        const sidebarUserEmail = document.getElementById('sidebarUserEmail');
        
        if (sidebarAvatar && savedAvatar) {
            sidebarAvatar.src = savedAvatar;
            sidebarAvatar.onerror = () => { sidebarAvatar.src = '/img/avatar-padrao.png'; };
        }
        if (sidebarUserName && savedName) sidebarUserName.textContent = savedName;
        if (sidebarUserEmail && savedEmail) sidebarUserEmail.textContent = savedEmail;
    }
    syncProfile();
    window.addEventListener('storage', (e) => {
        if (e.key === 'userAvatar' || e.key === 'userName' || e.key === 'userEmail') syncProfile();
    });

    // ============================================
    // 1. SIDEBAR RESPONSIVA (mesmo padrão do início)
    // ============================================
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
        if (!sidebar) return;
        sidebar.classList.add('open');
        if (sidebarOverlay) sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (sidebarToggleBtn) {
            sidebarToggleBtn.setAttribute('aria-label', 'Fechar menu lateral');
            sidebarToggleBtn.setAttribute('aria-expanded', 'true');
        }
    }

    function closeSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
        if (sidebarToggleBtn) {
            sidebarToggleBtn.setAttribute('aria-label', 'Abrir menu lateral');
            sidebarToggleBtn.setAttribute('aria-expanded', 'false');
        }
    }

    function toggleSidebar() {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });

    // ============================================
    // 2. PERFIL COLAPSÁVEL
    // ============================================
    const profileToggle = document.getElementById('profileToggle');
    const profileDetail = document.getElementById('profileDetail');
    
    if (profileToggle && profileDetail) {
        profileToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const hidden = profileDetail.hasAttribute('hidden');
            if (hidden) {
                profileDetail.removeAttribute('hidden');
                profileToggle.setAttribute('aria-expanded', 'true');
            } else {
                profileDetail.setAttribute('hidden', '');
                profileToggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('click', (e) => {
            if (!profileDetail.hasAttribute('hidden') && 
                !profileDetail.contains(e.target) && 
                e.target !== profileToggle && 
                !profileToggle.contains(e.target)) {
                profileDetail.setAttribute('hidden', '');
                profileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ============================================
    // 3. ACESSIBILIDADE NA SIDEBAR
    // ============================================
    const a11yToggle = document.getElementById('a11yToggle');
    const a11yOptions = document.getElementById('a11yOptions');

    if (a11yToggle && a11yOptions) {
        a11yToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const hidden = a11yOptions.hasAttribute('hidden');
            if (hidden) {
                a11yOptions.removeAttribute('hidden');
                a11yToggle.setAttribute('aria-expanded', 'true');
            } else {
                a11yOptions.setAttribute('hidden', '');
                a11yToggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('click', (e) => {
            if (!a11yOptions.hasAttribute('hidden') && 
                !a11yOptions.contains(e.target) && 
                e.target !== a11yToggle && 
                !a11yToggle.contains(e.target)) {
                a11yOptions.setAttribute('hidden', '');
                a11yToggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !a11yOptions.hasAttribute('hidden')) {
                a11yOptions.setAttribute('hidden', '');
                a11yToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function getA11y(key, defaultValue = 'false') {
        return localStorage.getItem('a11y_' + key) || defaultValue;
    }

    function setA11y(key, value) {
        localStorage.setItem('a11y_' + key, value);
    }

    function updateStatus(id, isActive) {
        const el = document.getElementById(id);
        if (el) el.textContent = isActive ? 'Ligado' : 'Desligado';
    }

    function applyA11ySettings() {
        const isDarkMode = getA11y('darkMode') === 'true';
        body.classList.toggle('a11y-dark-mode', isDarkMode);
        updateStatus('darkModeStatus', isDarkMode);

        const isHighlightLinks = getA11y('highlightLinks') === 'true';
        body.classList.toggle('a11y-highlight-links', isHighlightLinks);
        updateStatus('linksStatus', isHighlightLinks);

        const isDyslexia = getA11y('dyslexiaFont') === 'true';
        body.classList.toggle('a11y-dyslexia', isDyslexia);
        updateStatus('dyslexiaStatus', isDyslexia);

        const isReducedMotion = getA11y('reduceMotion') === 'true';
        body.classList.toggle('a11y-reduce-motion', isReducedMotion);
        updateStatus('motionStatus', isReducedMotion);

        const textSize = getA11y('textSize', 'normal');
        const impact = document.querySelector('.impact-section');
        const form = document.querySelector('.donation-form-section');
        const carousel = document.querySelector('.carousel-triple-section');
        
        [impact, form, carousel].forEach(el => {
            if (el) {
                el.classList.remove('a11y-large-text', 'a11y-small-text');
                if (textSize === 'large') el.classList.add('a11y-large-text');
                if (textSize === 'small') el.classList.add('a11y-small-text');
            }
        });
    }

    applyA11ySettings();

    document.querySelectorAll('.a11y-option, .a11y-reset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const action = btn.getAttribute('data-a11y');
            const impact = document.querySelector('.impact-section');
            const form = document.querySelector('.donation-form-section');
            const carousel = document.querySelector('.carousel-triple-section');

            const toggleTextSize = (size) => {
                [impact, form, carousel].forEach(el => {
                    if (el) {
                        el.classList.remove('a11y-large-text', 'a11y-small-text');
                        if (size === 'large') el.classList.add('a11y-large-text');
                        if (size === 'small') el.classList.add('a11y-small-text');
                    }
                });
            };

            switch (action) {
                case 'darkMode': {
                    const current = getA11y('darkMode') === 'true';
                    setA11y('darkMode', current ? 'false' : 'true');
                    body.classList.toggle('a11y-dark-mode', !current);
                    updateStatus('darkModeStatus', !current);
                    updateHubStatus();
                    break;
                }
                case 'increaseText': {
                    const current = getA11y('textSize', 'normal');
                    if (current === 'large') {
                        setA11y('textSize', 'normal');
                        toggleTextSize('normal');
                    } else {
                        setA11y('textSize', 'large');
                        toggleTextSize('large');
                    }
                    break;
                }
                case 'decreaseText': {
                    const current = getA11y('textSize', 'normal');
                    if (current === 'small') {
                        setA11y('textSize', 'normal');
                        toggleTextSize('normal');
                    } else {
                        setA11y('textSize', 'small');
                        toggleTextSize('small');
                    }
                    break;
                }
                case 'highlightLinks': {
                    const current = getA11y('highlightLinks') === 'true';
                    setA11y('highlightLinks', current ? 'false' : 'true');
                    body.classList.toggle('a11y-highlight-links', !current);
                    updateStatus('linksStatus', !current);
                    break;
                }
                case 'dyslexiaFont': {
                    const current = getA11y('dyslexiaFont') === 'true';
                    setA11y('dyslexiaFont', current ? 'false' : 'true');
                    body.classList.toggle('a11y-dyslexia', !current);
                    updateStatus('dyslexiaStatus', !current);
                    updateHubStatus();
                    break;
                }
                case 'reduceMotion': {
                    const current = getA11y('reduceMotion') === 'true';
                    setA11y('reduceMotion', current ? 'false' : 'true');
                    body.classList.toggle('a11y-reduce-motion', !current);
                    updateStatus('motionStatus', !current);
                    updateHubStatus();
                    break;
                }
                case 'reset': {
                    ['darkMode', 'highlightLinks', 'dyslexiaFont', 'reduceMotion', 'textSize'].forEach(key => {
                        localStorage.removeItem('a11y_' + key);
                    });
                    body.classList.remove('a11y-dark-mode', 'a11y-highlight-links', 'a11y-dyslexia', 'a11y-reduce-motion');
                    [impact, form, carousel].forEach(el => {
                        if (el) el.classList.remove('a11y-large-text', 'a11y-small-text');
                    });
                    updateStatus('darkModeStatus', false);
                    updateStatus('linksStatus', false);
                    updateStatus('dyslexiaStatus', false);
                    updateStatus('motionStatus', false);
                    updateHubStatus();
                    break;
                }
            }
        });
    });

    // ============================================
    // 4. HUB FLUTUANTE
    // ============================================
    const hubToggle = document.getElementById('floatingHubToggle');
    const hubMenu = document.getElementById('floatingHubMenu');
    const hubOverlay = document.getElementById('floatingOverlay');

    function toggleHub() {
        if (!hubMenu || !hubOverlay) {
            console.warn('⚠️ Hub elements not found!');
            return;
        }
        const isOpen = !hubMenu.hidden;
        hubMenu.hidden = isOpen;
        hubOverlay.hidden = isOpen;
        if (hubToggle) hubToggle.setAttribute('aria-expanded', !isOpen);
        console.log('🔄 Hub toggled:', isOpen ? 'closed' : 'open');
    }

    function closeHub() {
        if (!hubMenu || !hubOverlay) return;
        hubMenu.hidden = true;
        hubOverlay.hidden = true;
        if (hubToggle) hubToggle.setAttribute('aria-expanded', 'false');
    }

    if (hubToggle) {
        hubToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('🖱️ Hub button clicked!');
            toggleHub();
        });
    } else {
        console.warn('⚠️ floatingHubToggle not found!');
    }

    if (hubOverlay) {
        hubOverlay.addEventListener('click', closeHub);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeHub();
        }
    });

    // ============================================
    // 5. ATUALIZAR STATUS DO HUB
    // ============================================
    function updateHubStatus() {
        const darkLabel = document.querySelector('.hub-action[data-a11y="darkMode"] .hub-action-label');
        if (darkLabel) {
            darkLabel.textContent = body.classList.contains('a11y-dark-mode') ? 'Claro' : 'Escuro';
        }

        const dyslexiaLabel = document.querySelector('.hub-action[data-a11y="dyslexiaFont"] .hub-action-label');
        if (dyslexiaLabel) {
            dyslexiaLabel.textContent = body.classList.contains('a11y-dyslexia') ? 'Ativo' : 'Dislexia';
        }

        const motionLabel = document.querySelector('.hub-action[data-a11y="reduceMotion"] .hub-action-label');
        if (motionLabel) {
            motionLabel.textContent = body.classList.contains('a11y-reduce-motion') ? 'Ativo' : 'Movimento';
        }
    }

    updateHubStatus();

    // ============================================
    // 6. AÇÕES DO HUB
    // ============================================
    document.querySelectorAll('.hub-action[data-a11y]').forEach((item) => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = item.getAttribute('data-a11y');
            const impact = document.querySelector('.impact-section');
            const form = document.querySelector('.donation-form-section');
            const carousel = document.querySelector('.carousel-triple-section');

            const toggleTextSize = (size) => {
                [impact, form, carousel].forEach(el => {
                    if (el) {
                        el.classList.remove('a11y-large-text', 'a11y-small-text');
                        if (size === 'large') el.classList.add('a11y-large-text');
                        if (size === 'small') el.classList.add('a11y-small-text');
                    }
                });
            };

            switch (action) {
                case 'darkMode': {
                    const current = getA11y('darkMode') === 'true';
                    setA11y('darkMode', current ? 'false' : 'true');
                    body.classList.toggle('a11y-dark-mode', !current);
                    updateStatus('darkModeStatus', !current);
                    updateHubStatus();
                    break;
                }
                case 'increaseText': {
                    const current = getA11y('textSize', 'normal');
                    if (current === 'large') {
                        setA11y('textSize', 'normal');
                        toggleTextSize('normal');
                    } else {
                        setA11y('textSize', 'large');
                        toggleTextSize('large');
                    }
                    break;
                }
                case 'decreaseText': {
                    const current = getA11y('textSize', 'normal');
                    if (current === 'small') {
                        setA11y('textSize', 'normal');
                        toggleTextSize('normal');
                    } else {
                        setA11y('textSize', 'small');
                        toggleTextSize('small');
                    }
                    break;
                }
                case 'dyslexiaFont': {
                    const current = getA11y('dyslexiaFont') === 'true';
                    setA11y('dyslexiaFont', current ? 'false' : 'true');
                    body.classList.toggle('a11y-dyslexia', !current);
                    updateStatus('dyslexiaStatus', !current);
                    updateHubStatus();
                    break;
                }
                case 'reduceMotion': {
                    const current = getA11y('reduceMotion') === 'true';
                    setA11y('reduceMotion', current ? 'false' : 'true');
                    body.classList.toggle('a11y-reduce-motion', !current);
                    updateStatus('motionStatus', !current);
                    updateHubStatus();
                    break;
                }
                case 'reset': {
                    ['darkMode', 'highlightLinks', 'dyslexiaFont', 'reduceMotion', 'textSize'].forEach(key => {
                        localStorage.removeItem('a11y_' + key);
                    });
                    body.classList.remove('a11y-dark-mode', 'a11y-highlight-links', 'a11y-dyslexia', 'a11y-reduce-motion');
                    [impact, form, carousel].forEach(el => {
                        if (el) el.classList.remove('a11y-large-text', 'a11y-small-text');
                    });
                    updateStatus('darkModeStatus', false);
                    updateStatus('linksStatus', false);
                    updateStatus('dyslexiaStatus', false);
                    updateStatus('motionStatus', false);
                    updateHubStatus();
                    break;
                }
            }

            closeHub();
        });
    });

    document.querySelectorAll('.hub-action[href]').forEach((link) => {
        link.addEventListener('click', closeHub);
    });

    // ============================================
    // 7. BOTÃO VOLTAR AO TOPO
    // ============================================
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    if (scrollTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 400) {
                scrollTopBtn.style.opacity = '1';
                scrollTopBtn.style.transform = 'translateY(0)';
                scrollTopBtn.style.pointerEvents = 'auto';
            } else {
                scrollTopBtn.style.opacity = '0';
                scrollTopBtn.style.transform = 'translateY(20px)';
                scrollTopBtn.style.pointerEvents = 'none';
            }
        });

        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ============================================
    // 8. HEADER SCROLL EFFECT
    // ============================================
    const headerGlass = document.getElementById('headerGlass');
    if (headerGlass) {
        window.addEventListener('scroll', () => {
            headerGlass.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ============================================
    // 9. LOGOUT
    // ============================================
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem('userLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userAvatar');
            window.location.href = '/login/login.html';
        }
    });

    // ============================================
    // 10. DOAÇÃO - PRESETS E CHECKOUT
    // ============================================
    const presetBtns = document.querySelectorAll('.preset-btn');
    const customAmount = document.getElementById('customAmount');
    const btnDonate = document.getElementById('btnDonate');
    const donationForm = document.getElementById('donationForm');
    const checkoutBox = document.getElementById('checkoutBox');
    const checkoutValueText = document.getElementById('checkoutValueText');
    const btnBack = document.getElementById('btnBack');

    let selectedValue = 25;

    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    function parseCustomAmount(value) {
        let cleaned = value.replace(/[^0-9,]/g, '').replace(',', '.');
        let number = parseFloat(cleaned);
        return isNaN(number) ? 0 : number;
    }

    function updateCustomInput(value) {
        if (customAmount) customAmount.value = formatCurrency(value).replace('R$', '').trim();
    }

    if (presetBtns.length) {
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                presetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const value = parseFloat(btn.getAttribute('data-value'));
                if (!isNaN(value)) {
                    selectedValue = value;
                    updateCustomInput(selectedValue);
                }
            });
        });
    }

    if (customAmount) {
        customAmount.addEventListener('input', (e) => {
            let numericValue = parseCustomAmount(e.target.value);
            if (!isNaN(numericValue) && numericValue > 0) {
                selectedValue = numericValue;
                presetBtns.forEach(btn => {
                    const btnVal = parseFloat(btn.getAttribute('data-value'));
                    btn.classList.toggle('active', Math.abs(btnVal - selectedValue) < 0.01);
                });
            }
        });

        customAmount.addEventListener('blur', (e) => {
            if (selectedValue > 0) {
                e.target.value = formatCurrency(selectedValue).replace('R$', '').trim();
            } else {
                selectedValue = 25;
                e.target.value = '25,00';
                presetBtns.forEach(btn => {
                    btn.classList.toggle('active', parseFloat(btn.getAttribute('data-value')) === 25);
                });
            }
        });
    }

    if (btnDonate && donationForm && checkoutBox && checkoutValueText) {
        btnDonate.addEventListener('click', () => {
            if (selectedValue > 0) {
                checkoutValueText.innerHTML = `Sua doação de <strong>${formatCurrency(selectedValue)}</strong> vai ajudar muitas pessoas.`;
                donationForm.style.display = 'none';
                checkoutBox.style.display = 'block';
                checkoutBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    if (btnBack && donationForm && checkoutBox) {
        btnBack.addEventListener('click', () => {
            checkoutBox.style.display = 'none';
            donationForm.style.display = 'block';
        });
    }

    // ============================================
    // 11. CARROSSEL 3D COVERFLOW (do início)
    // ============================================
    const track = document.getElementById('carouselTripleTrack');
    const dotsContainer = document.getElementById('carouselTripleDots');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (track && dotsContainer) {
        const cards = Array.from(track.querySelectorAll('.carousel-triple-card'));
        const totalCards = cards.length;
        let currentIndex = 0;
        let autoplayInterval = null;
        const autoplaySpeed = 4500;
        let isAutoplayActive = true;
        let touchStartX = 0;
        let isDragging = false;
        let dragStartX = 0;

        function buildIndicators() {
            dotsContainer.innerHTML = '';
            cards.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = `carousel-dot ${i === currentIndex ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Ir para o slide ${i + 1}`);
                dot.addEventListener('click', () => {
                    goToSlide(i);
                    resetAutoplayTimer();
                });
                dotsContainer.appendChild(dot);
            });
        }

        function updateCarousel3D() {
            const screenWidth = window.innerWidth;
            let translateOffset = screenWidth < 640 ? 120 : screenWidth < 1024 ? 220 : 310;

            cards.forEach((card, index) => {
                let distance = index - currentIndex;
                if (distance > totalCards / 2) distance -= totalCards;
                else if (distance < -totalCards / 2) distance += totalCards;

                card.classList.remove('active-card', 'prev-card', 'next-card', 'hidden-card', 'hidden-card-left');

                if (distance === 0) {
                    card.style.transform = `translateX(0px) scale(1.08) rotateY(0deg) translateZ(100px)`;
                    card.style.opacity = '1';
                    card.style.zIndex = '30';
                    card.style.filter = 'blur(0px)';
                    card.classList.add('active-card');
                    card.style.pointerEvents = 'auto';
                    card.style.boxShadow = '0 20px 50px rgba(124, 58, 237, 0.3)';
                } else if (distance === -1 || (distance === totalCards - 1 && currentIndex === 0)) {
                    card.style.transform = `translateX(-${translateOffset}px) scale(0.85) rotateY(28deg) translateZ(0px)`;
                    card.style.opacity = '0.55';
                    card.style.zIndex = '20';
                    card.style.filter = 'blur(1px)';
                    card.classList.add('prev-card');
                    card.style.pointerEvents = 'auto';
                    card.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.25)';
                } else if (distance === 1 || (distance === -(totalCards - 1) && currentIndex === totalCards - 1)) {
                    card.style.transform = `translateX(${translateOffset}px) scale(0.85) rotateY(-28deg) translateZ(0px)`;
                    card.style.opacity = '0.55';
                    card.style.zIndex = '20';
                    card.style.filter = 'blur(1px)';
                    card.classList.add('next-card');
                    card.style.pointerEvents = 'auto';
                    card.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.25)';
                } else if (distance > 1) {
                    card.style.transform = `translateX(${distance * translateOffset * 1.2}px) scale(0.6) translateZ(-150px)`;
                    card.style.opacity = '0';
                    card.style.zIndex = '10';
                    card.style.filter = 'blur(4px)';
                    card.classList.add('hidden-card');
                    card.style.pointerEvents = 'none';
                    card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
                } else {
                    card.style.transform = `translateX(${distance * translateOffset * 1.2}px) scale(0.6) translateZ(-150px)`;
                    card.style.opacity = '0';
                    card.style.zIndex = '10';
                    card.style.filter = 'blur(4px)';
                    card.classList.add('hidden-card-left');
                    card.style.pointerEvents = 'none';
                    card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
                }
            });

            const dots = Array.from(dotsContainer.children);
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalCards;
            updateCarousel3D();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            updateCarousel3D();
        }

        function goToSlide(index) {
            currentIndex = ((index % totalCards) + totalCards) % totalCards;
            updateCarousel3D();
        }

        function startAutoplay() {
            if (isAutoplayActive && !autoplayInterval) {
                autoplayInterval = setInterval(nextSlide, autoplaySpeed);
            }
        }

        function stopAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
                autoplayInterval = null;
            }
        }

        function resetAutoplayTimer() {
            stopAutoplay();
            startAutoplay();
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetAutoplayTimer();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetAutoplayTimer();
            });
        }

        cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                if (index !== currentIndex) {
                    goToSlide(index);
                    resetAutoplayTimer();
                }
            });
        });

        // Drag com mouse
        if (track) {
            track.addEventListener('mousedown', (e) => {
                dragStartX = e.pageX;
                isDragging = true;
            });

            track.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const diffX = dragStartX - e.pageX;
                if (Math.abs(diffX) > 60) {
                    if (diffX > 0) nextSlide();
                    else prevSlide();
                    isDragging = false;
                    resetAutoplayTimer();
                }
            });

            window.addEventListener('mouseup', () => {
                isDragging = false;
            });

            // Touch events
            track.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                isDragging = true;
            }, { passive: true });

            track.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                const diffX = touchStartX - e.changedTouches[0].screenX;
                if (Math.abs(diffX) > 50) {
                    if (diffX > 0) nextSlide();
                    else prevSlide();
                    isDragging = false;
                    resetAutoplayTimer();
                }
            }, { passive: true });

            track.addEventListener('touchend', () => {
                isDragging = false;
            }, { passive: true });
        }

        // Teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
                resetAutoplayTimer();
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                resetAutoplayTimer();
                e.preventDefault();
            }
        });

        // Responsividade
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateCarousel3D, 100);
        });

        // Inicializa carrossel
        buildIndicators();
        updateCarousel3D();
        startAutoplay();

        console.log('🎠 Carrossel 3D Coverflow inicializado com ' + totalCards + ' cards');
    } else {
        console.warn('⚠️ Elementos do carrossel não encontrados');
    }

    // ============================================
    // 12. SCROLL REVEAL (opcional)
    // ============================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ============================================
    // 13. INICIALIZAÇÃO
    // ============================================
    if (customAmount && !customAmount.value) {
        customAmount.value = '25,00';
        selectedValue = 25;
    }

    console.log('💜 Página de Doações pronta!');
    console.log('👤 Perfil:', localStorage.getItem('userName') || 'Visitante');
    console.log('💰 Valor inicial: R$ 25,00');
});