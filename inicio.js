/**
 * INICIO.JS — Amor NeuroDivergente
 * Sidebar responsiva + Carrossel 3D Coverflow + Acessibilidade + Scroll reveal + Hub Flutuante
 */
const track = document.getElementById('track');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const currentSpan = document.getElementById('current');
        const progressBar = document.getElementById('progressBar');
        const carouselWrapper = document.getElementById('carouselWrapper');


        const totalSlides = 6;
        let currentIndex = 0;
        const slideDuration = 3000; // Tempo de troca automática: 5 segundos
        let autoPlayTimer = null;
        let progressAnimation = null;
        let startTime = null;

        function updateCarousel() {
            track.style.transform = `translateX(-${currentIndex * 100}vw)`;
            currentSpan.textContent = String(currentIndex + 1).padStart(2, '0');
            resetAutoPlay();
        }

        function startProgressBar() {
            progressBar.style.width = '0%';
            startTime = Date.now();

            clearInterval(progressAnimation);
            progressAnimation = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const percentage = Math.min((elapsed / slideDuration) * 100, 100);
                progressBar.style.width = percentage + '%';

                if (percentage >= 100) {
                    clearInterval(progressAnimation);
                }
            }, 50);
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateCarousel();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateCarousel();
        }

        function resetAutoPlay() {
            clearInterval(autoPlayTimer);
            startProgressBar();
            autoPlayTimer = setInterval(nextSlide, slideDuration);
        }

        // Eventos dos botões de navegação
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);

        // Suporte a teclas de seta do teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        });

        // Pausar auto-play ao passar o mouse por cima
        carouselWrapper.addEventListener('mouseenter', () => {
            clearInterval(autoPlayTimer);
            clearInterval(progressAnimation);
        });

        carouselWrapper.addEventListener('mouseleave', () => {
            resetAutoPlay();
        });

        // Iniciar carrossel
        resetAutoPlay();
document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;

    // =============================================
    // 0. SINCRONIZAÇÃO DE PERFIL
    // =============================================
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

    // =============================================
    // 1. SIDEBAR RESPONSIVA (YouTube-like)
    // =============================================
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
        if (!sidebar) return;
        sidebar.classList.add('open');
        if (sidebarOverlay) sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
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

    // =============================================
    // 2. PERFIL COLAPSÁVEL NA SIDEBAR
    // =============================================
    const profileToggle = document.getElementById('profileToggle');
    const profileDetail = document.getElementById('profileDetail');
    if (profileToggle && profileDetail) {
        profileToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isHidden = profileDetail.hasAttribute('hidden');
            if (isHidden) {
                profileDetail.removeAttribute('hidden');
                profileToggle.setAttribute('aria-expanded', 'true');
            } else {
                profileDetail.setAttribute('hidden', '');
                profileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // =============================================
    // 3. ACESSIBILIDADE INTEGRADA NA SIDEBAR
    // =============================================
    const a11yToggle = document.getElementById('a11yToggle');
    const a11yOptions = document.getElementById('a11yOptions');

    if (a11yToggle && a11yOptions) {
        a11yToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isHidden = a11yOptions.hasAttribute('hidden');
            if (isHidden) {
                a11yOptions.removeAttribute('hidden');
                a11yToggle.setAttribute('aria-expanded', 'true');
            } else {
                a11yOptions.setAttribute('hidden', '');
                a11yToggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('click', (e) => {
            if (!a11yOptions.contains(e.target) && e.target !== a11yToggle) {
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

    // =============================================
    // 4. FUNÇÕES DE ACESSIBILIDADE (Persistência)
    // =============================================
    function gs(k, fb) { return localStorage.getItem('a11y_' + k) || fb; }
    function ss(k, v) { localStorage.setItem('a11y_' + k, v); }
    function usl(id, active) { 
        const el = document.getElementById(id); 
        if (el) el.textContent = active ? 'Ligado' : 'Desligado'; 
    }

    function applySettings() {
        if (gs('darkMode') === 'true') body.classList.add('a11y-dark-mode');
        if (gs('highlightLinks') === 'true') body.classList.add('a11y-highlight-links');
        if (gs('dyslexiaFont') === 'true') body.classList.add('a11y-dyslexia');
        if (gs('reduceMotion') === 'true') body.classList.add('a11y-reduce-motion');
        
        const ts = gs('textSize', 'normal');
        if (ts === 'large') body.classList.add('a11y-large-text');
        if (ts === 'small') body.classList.add('a11y-small-text');
        
        usl('darkModeStatus', gs('darkMode') === 'true');
        usl('linksStatus', gs('highlightLinks') === 'true');
        usl('dyslexiaStatus', gs('dyslexiaFont') === 'true');
        usl('motionStatus', gs('reduceMotion') === 'true');
    }

    document.querySelectorAll('.a11y-option, .a11y-reset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const action = btn.getAttribute('data-a11y');

            switch (action) {
                case 'darkMode':
                    const dm = gs('darkMode') === 'true';
                    ss('darkMode', dm ? 'false' : 'true');
                    if (dm) body.classList.remove('a11y-dark-mode');
                    else body.classList.add('a11y-dark-mode');
                    usl('darkModeStatus', !dm);
                    // Sincroniza com o hub
                    updateHubStatus();
                    break;
                case 'increaseText':
                    const cs = gs('textSize', 'normal');
                    if (cs === 'large') { 
                        ss('textSize', 'normal'); 
                        body.classList.remove('a11y-large-text');
                    } else { 
                        ss('textSize', 'large'); 
                        body.classList.remove('a11y-small-text');
                        body.classList.add('a11y-large-text'); 
                    }
                    break;
                case 'decreaseText':
                    const cz = gs('textSize', 'normal');
                    if (cz === 'small') { 
                        ss('textSize', 'normal'); 
                        body.classList.remove('a11y-small-text');
                    } else { 
                        ss('textSize', 'small'); 
                        body.classList.remove('a11y-large-text');
                        body.classList.add('a11y-small-text'); 
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
                    // Sincroniza com o hub
                    updateHubStatus();
                    break;
                case 'reduceMotion':
                    const rm = gs('reduceMotion') === 'true';
                    ss('reduceMotion', rm ? 'false' : 'true');
                    if (rm) body.classList.remove('a11y-reduce-motion');
                    else body.classList.add('a11y-reduce-motion');
                    usl('motionStatus', !rm);
                    // Sincroniza com o hub
                    updateHubStatus();
                    break;
                case 'reset':
                    ['darkMode', 'highlightLinks', 'dyslexiaFont', 'reduceMotion', 'textSize'].forEach(k => localStorage.removeItem('a11y_' + k));
                    body.classList.remove('a11y-dark-mode', 'a11y-highlight-links', 'a11y-dyslexia', 'a11y-reduce-motion', 'a11y-large-text', 'a11y-small-text');
                    usl('darkModeStatus', false);
                    usl('linksStatus', false);
                    usl('dyslexiaStatus', false);
                    usl('motionStatus', false);
                    // Sincroniza com o hub
                    updateHubStatus();
                    break;
            }
        });
    });

    applySettings();

    // =============================================
    // 5. HUB FLUTUANTE - ACESSIBILIDADE + AJUDA
    // =============================================
    const hubToggle = document.getElementById('floatingHubToggle');
    const hubMenu = document.getElementById('floatingHubMenu');
    const overlay = document.getElementById('floatingOverlay');

    // Função para abrir/fechar o hub
    function toggleHub() {
        const isOpen = !hubMenu.hidden;
        hubMenu.hidden = isOpen;
        overlay.hidden = isOpen;
        hubToggle.setAttribute('aria-expanded', !isOpen);
    }

    function closeHub() {
        hubMenu.hidden = true;
        overlay.hidden = true;
        hubToggle.setAttribute('aria-expanded', 'false');
    }

    if (hubToggle && hubMenu && overlay) {
        hubToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleHub();
        });

        overlay.addEventListener('click', closeHub);

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeHub();
            }
        });
    }

    // =============================================
    // 6. FUNÇÕES DO HUB - ATUALIZAR STATUS
    // =============================================
    function updateHubStatus() {
        // Dark Mode
        const darkLabel = document.querySelector('.hub-action[data-a11y="darkMode"] .hub-action-label');
        if (darkLabel) {
            darkLabel.textContent = document.body.classList.contains('a11y-dark-mode') ? 'Claro' : 'Escuro';
        }

        // Dislexia
        const dyslexiaLabel = document.querySelector('.hub-action[data-a11y="dyslexiaFont"] .hub-action-label');
        if (dyslexiaLabel) {
            dyslexiaLabel.textContent = document.body.classList.contains('a11y-dyslexia') ? 'Ativo' : 'Dislexia';
        }

        // Reduzir Movimento
        const motionLabel = document.querySelector('.hub-action[data-a11y="reduceMotion"] .hub-action-label');
        if (motionLabel) {
            motionLabel.textContent = document.body.classList.contains('a11y-reduce-motion') ? 'Ativo' : 'Movimento';
        }
    }

    // Atualiza status ao carregar
    updateHubStatus();

    // =============================================
    // 7. AÇÕES DO HUB - ACESSIBILIDADE
    // =============================================
    document.querySelectorAll('.hub-action[data-a11y]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.getAttribute('data-a11y');

            switch (action) {
                case 'darkMode':
                    const dm = gs('darkMode') === 'true';
                    ss('darkMode', dm ? 'false' : 'true');
                    if (dm) body.classList.remove('a11y-dark-mode');
                    else body.classList.add('a11y-dark-mode');
                    usl('darkModeStatus', !dm);
                    updateHubStatus();
                    break;

                case 'increaseText':
                    const cs = gs('textSize', 'normal');
                    if (cs === 'large') { 
                        ss('textSize', 'normal'); 
                        body.classList.remove('a11y-large-text');
                    } else { 
                        ss('textSize', 'large'); 
                        body.classList.remove('a11y-small-text');
                        body.classList.add('a11y-large-text'); 
                    }
                    break;

                case 'decreaseText':
                    const cz = gs('textSize', 'normal');
                    if (cz === 'small') { 
                        ss('textSize', 'normal'); 
                        body.classList.remove('a11y-small-text');
                    } else { 
                        ss('textSize', 'small'); 
                        body.classList.remove('a11y-large-text');
                        body.classList.add('a11y-small-text'); 
                    }
                    break;

                case 'dyslexiaFont':
                    const df = gs('dyslexiaFont') === 'true';
                    ss('dyslexiaFont', df ? 'false' : 'true');
                    if (df) body.classList.remove('a11y-dyslexia');
                    else body.classList.add('a11y-dyslexia');
                    usl('dyslexiaStatus', !df);
                    updateHubStatus();
                    break;

                case 'reduceMotion':
                    const rm = gs('reduceMotion') === 'true';
                    ss('reduceMotion', rm ? 'false' : 'true');
                    if (rm) body.classList.remove('a11y-reduce-motion');
                    else body.classList.add('a11y-reduce-motion');
                    usl('motionStatus', !rm);
                    updateHubStatus();
                    break;

                case 'reset':
                    ['darkMode', 'highlightLinks', 'dyslexiaFont', 'reduceMotion', 'textSize'].forEach(k => localStorage.removeItem('a11y_' + k));
                    body.classList.remove('a11y-dark-mode', 'a11y-highlight-links', 'a11y-dyslexia', 'a11y-reduce-motion', 'a11y-large-text', 'a11y-small-text');
                    usl('darkModeStatus', false);
                    usl('linksStatus', false);
                    usl('dyslexiaStatus', false);
                    usl('motionStatus', false);
                    updateHubStatus();
                    break;
            }

            // Fecha o hub após a ação
            closeHub();
        });
    });

    // Clicar em links dentro do hub também fecha
    document.querySelectorAll('.hub-action[href]').forEach(link => {
        link.addEventListener('click', function() {
            closeHub();
        });
    });

    // =============================================
    // 8. LOGOUT
    // =============================================
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem('userLoggedIn');
            window.location.href = '/login/login.html';
        }
    });

    // =============================================
    // 9. HEADER SCROLL EFFECT
    // =============================================
    const headerGlass = document.getElementById('headerGlass');
    window.addEventListener('scroll', () => {
        if (headerGlass) {
            headerGlass.classList.toggle('scrolled', window.scrollY > 50);
        }
    });

    // =============================================
    // 10. CARROSSEL 3D COVERFLOW (UNIFICADO)
    // =============================================
    const track = document.getElementById('carouselTripleTrack');
    const dotsContainer = document.getElementById('carouselTripleDots');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const carouselOuter = document.getElementById('carouselOuter');

    if (track && dotsContainer) {
        const cards = Array.from(track.querySelectorAll('.carousel-triple-card'));
        const totalCards = cards.length;
        let currentIndex = 1; // Começa no segundo card (Comunidade)
        let autoplayInterval = null;
        const autoplaySpeed = 4500;
        let isAutoplayActive = true;
        let touchStartX = 0;
        let touchEndX = 0;
        let isDragging = false;

        // =============================================
        // CONSTRUIR INDICADORES (DOTS)
        // =============================================
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

        // =============================================
        // ATUALIZAR CARROSSEL 3D
        // =============================================
        function updateCarousel3D() {
            const screenWidth = window.innerWidth;
            let translateOffset = screenWidth < 640 ? 120 : screenWidth < 1024 ? 220 : 310;

            cards.forEach((card, index) => {
                // Calcula distância circular
                let distance = index - currentIndex;
                if (distance > totalCards / 2) distance -= totalCards;
                else if (distance < -totalCards / 2) distance += totalCards;

                // Remove classes antigas
                card.classList.remove('active-card', 'prev-card', 'next-card', 'hidden-card', 'shadow-neon-glow');

                // Aplica transformações baseadas na posição
                if (distance === 0) {
                    // Card ativo (central)
                    card.style.transform = `translateX(0px) scale(1.08) rotateY(0deg) translateZ(100px)`;
                    card.style.opacity = '1';
                    card.style.zIndex = '30';
                    card.style.filter = 'blur(0px)';
                    card.classList.add('active-card', 'shadow-neon-glow');
                    card.style.pointerEvents = 'auto';
                    card.style.boxShadow = '0 20px 50px rgba(124, 58, 237, 0.3)';
                } else if (distance === -1 || (distance === totalCards - 1 && currentIndex === 0)) {
                    // Card à esquerda
                    card.style.transform = `translateX(-${translateOffset}px) scale(0.85) rotateY(28deg) translateZ(0px)`;
                    card.style.opacity = '0.55';
                    card.style.zIndex = '20';
                    card.style.filter = 'blur(1px)';
                    card.classList.add('prev-card');
                    card.style.pointerEvents = 'auto';
                    card.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.25)';
                } else if (distance === 1 || (distance === -(totalCards - 1) && currentIndex === totalCards - 1)) {
                    // Card à direita
                    card.style.transform = `translateX(${translateOffset}px) scale(0.85) rotateY(-28deg) translateZ(0px)`;
                    card.style.opacity = '0.55';
                    card.style.zIndex = '20';
                    card.style.filter = 'blur(1px)';
                    card.classList.add('next-card');
                    card.style.pointerEvents = 'auto';
                    card.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.25)';
                } else {
                    // Cards ocultos ao fundo
                    card.style.transform = `translateX(${distance * translateOffset * 1.2}px) scale(0.6) translateZ(-150px)`;
                    card.style.opacity = '0';
                    card.style.zIndex = '10';
                    card.style.filter = 'blur(4px)';
                    card.classList.add('hidden-card');
                    card.style.pointerEvents = 'none';
                    card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
                }
            });

            // Atualizar dots
            const dots = Array.from(dotsContainer.children);
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });
        }

        // =============================================
        // CONTROLES DE NAVEGAÇÃO
        // =============================================
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

        // =============================================
        // AUTOPLAY
        // =============================================
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

        // =============================================
        // EVENTOS DOS CONTROLES
        // =============================================
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

        // Clique nos cards laterais para navegar
        cards.forEach((card, index) => {
            card.addEventListener('click', (e) => {
                if (index !== currentIndex) {
                    goToSlide(index);
                    resetAutoplayTimer();
                }
            });
        });

        // =============================================
        // DRAG/SWIPE (Mouse + Touch)
        // =============================================
        let dragStartX = 0;
        
        // Mouse events
        track.addEventListener('mousedown', (e) => {
            dragStartX = e.pageX;
            isDragging = true;
        });

        track.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const diffX = dragStartX - e.pageX;
            if (Math.abs(diffX) > 60) {
                if (diffX > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
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
                if (diffX > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
                isDragging = false;
                resetAutoplayTimer();
            }
        }, { passive: true });

        track.addEventListener('touchend', () => {
            isDragging = false;
        }, { passive: true });

        // Pausar autoplay no hover
        if (carouselOuter) {
            carouselOuter.addEventListener('mouseenter', stopAutoplay);
            carouselOuter.addEventListener('mouseleave', startAutoplay);
        }

        // =============================================
        // SUPORTE A TECLADO (Acessibilidade)
        // =============================================
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

        // =============================================
        // RESPONSIVIDADE
        // =============================================
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateCarousel3D, 100);
        });

        // =============================================
        // INICIALIZAÇÃO DO CARROSSEL
        // =============================================
        buildIndicators();
        updateCarousel3D();
        startAutoplay();

        console.log('🎠 Carrossel 3D Coverflow inicializado com ' + totalCards + ' cards');
    } else {
        console.warn('⚠️ Elementos do carrossel não encontrados');
    }

    // =============================================
    // 11. SCROLL REVEAL
    // =============================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});