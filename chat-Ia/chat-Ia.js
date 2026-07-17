// =========================================================================
// 🧠 ACOLHER IA v7.0 — Chat + Início + Carrossel 3D + Acessibilidade + Perfil
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {

    const body = document.body;

    // =========================================================================
    // 🔑 CONFIGURAÇÃO DA API GROQ
    // =========================================================================
    const GROQ_API_KEY = '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';
    const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

    // =========================================================================
    // 👤 SINCRONIZAÇÃO DE PERFIL
    // =========================================================================
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

        console.log('👤 Perfil sincronizado:', savedName || 'Visitante');
    }

    syncProfile();

    window.addEventListener('storage', (e) => {
        if (e.key === 'userAvatar' || e.key === 'userName' || e.key === 'userEmail') {
            syncProfile();
        }
    });

    // =========================================================================
    // 📱 SIDEBAR RESPONSIVA
    // =========================================================================
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

    // =========================================================================
    // 👤 PERFIL COLAPSÁVEL
    // =========================================================================
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

    // =========================================================================
    // ♿ ACESSIBILIDADE COMPLETA
    // =========================================================================
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

    // Funções de acessibilidade
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
        // Modo escuro
        const isDarkMode = getA11y('darkMode') === 'true';
        body.classList.toggle('a11y-dark-mode', isDarkMode);
        updateStatus('darkModeStatus', isDarkMode);

        // Destacar links
        const isHighlightLinks = getA11y('highlightLinks') === 'true';
        body.classList.toggle('a11y-highlight-links', isHighlightLinks);
        updateStatus('linksStatus', isHighlightLinks);

        // Fonte para dislexia
        const isDyslexia = getA11y('dyslexiaFont') === 'true';
        body.classList.toggle('a11y-dyslexia', isDyslexia);
        updateStatus('dyslexiaStatus', isDyslexia);

        // Reduzir animações
        const isReducedMotion = getA11y('reduceMotion') === 'true';
        body.classList.toggle('a11y-reduce-motion', isReducedMotion);
        updateStatus('motionStatus', isReducedMotion);

        // Tamanho do texto
        const textSize = getA11y('textSize', 'normal');
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.classList.remove('a11y-large-text', 'a11y-small-text');
            if (textSize === 'large') {
                chatContainer.classList.add('a11y-large-text');
            } else if (textSize === 'small') {
                chatContainer.classList.add('a11y-small-text');
            }
        }
    }

    // Aplica configurações iniciais
    applyA11ySettings();

    // Eventos dos botões de acessibilidade
    document.querySelectorAll('.a11y-option, .a11y-reset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const action = btn.getAttribute('data-a11y');

            switch (action) {
                case 'darkMode': {
                    const current = getA11y('darkMode') === 'true';
                    setA11y('darkMode', current ? 'false' : 'true');
                    body.classList.toggle('a11y-dark-mode', !current);
                    updateStatus('darkModeStatus', !current);
                    break;
                }
                case 'increaseText': {
                    const current = getA11y('textSize', 'normal');
                    if (current === 'large') {
                        setA11y('textSize', 'normal');
                        document.getElementById('chatContainer')?.classList.remove('a11y-large-text');
                    } else {
                        setA11y('textSize', 'large');
                        const container = document.getElementById('chatContainer');
                        container?.classList.remove('a11y-small-text');
                        container?.classList.add('a11y-large-text');
                    }
                    break;
                }
                case 'decreaseText': {
                    const current = getA11y('textSize', 'normal');
                    if (current === 'small') {
                        setA11y('textSize', 'normal');
                        document.getElementById('chatContainer')?.classList.remove('a11y-small-text');
                    } else {
                        setA11y('textSize', 'small');
                        const container = document.getElementById('chatContainer');
                        container?.classList.remove('a11y-large-text');
                        container?.classList.add('a11y-small-text');
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
                    break;
                }
                case 'reduceMotion': {
                    const current = getA11y('reduceMotion') === 'true';
                    setA11y('reduceMotion', current ? 'false' : 'true');
                    body.classList.toggle('a11y-reduce-motion', !current);
                    updateStatus('motionStatus', !current);
                    break;
                }
                case 'reset': {
                    ['darkMode', 'highlightLinks', 'dyslexiaFont', 'reduceMotion', 'textSize'].forEach(key => {
                        localStorage.removeItem('a11y_' + key);
                    });
                    body.classList.remove('a11y-dark-mode', 'a11y-highlight-links', 'a11y-dyslexia', 'a11y-reduce-motion');
                    document.getElementById('chatContainer')?.classList.remove('a11y-large-text', 'a11y-small-text');
                    updateStatus('darkModeStatus', false);
                    updateStatus('linksStatus', false);
                    updateStatus('dyslexiaStatus', false);
                    updateStatus('motionStatus', false);
                    break;
                }
            }
        });
    });

    // =========================================================================
    // 🚪 LOGOUT
    // =========================================================================
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

    // =========================================================================
    // 🎠 CARROSSEL 3D COVERFLOW
    // =========================================================================
    const track = document.getElementById('carouselTripleTrack');
    const dotsContainer = document.getElementById('carouselTripleDots');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const carouselOuter = document.getElementById('carouselOuter');

    if (track && dotsContainer) {
        const cards = Array.from(track.querySelectorAll('.carousel-triple-card'));
        const totalCards = cards.length;
        let currentIndex = 1;
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

                card.classList.remove('active-card', 'prev-card', 'next-card', 'hidden-card', 'shadow-neon-glow');

                if (distance === 0) {
                    card.style.transform = `translateX(0px) scale(1.08) rotateY(0deg) translateZ(100px)`;
                    card.style.opacity = '1';
                    card.style.zIndex = '30';
                    card.style.filter = 'blur(0px)';
                    card.classList.add('active-card', 'shadow-neon-glow');
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
                } else {
                    card.style.transform = `translateX(${distance * translateOffset * 1.2}px) scale(0.6) translateZ(-150px)`;
                    card.style.opacity = '0';
                    card.style.zIndex = '10';
                    card.style.filter = 'blur(4px)';
                    card.classList.add('hidden-card');
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

        // Eventos do carrossel
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
            card.addEventListener('click', (e) => {
                if (index !== currentIndex) {
                    goToSlide(index);
                    resetAutoplayTimer();
                }
            });
        });

        // Drag com mouse
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

        // Pausar autoplay no hover
        if (carouselOuter) {
            carouselOuter.addEventListener('mouseenter', stopAutoplay);
            carouselOuter.addEventListener('mouseleave', startAutoplay);
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

    // =========================================================================
    // 🧩 SCROLL REVEAL
    // =========================================================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // =========================================================================
    // 📋 EXPLICAÇÃO DO PROJETO (mensagem inicial do chat)
    // =========================================================================
    function getProjectDescription() {
        return `💜 **Bem-vinde à AcolherIA!**

Eu sou a assistente virtual do projeto **Amor Neurodivergente** — uma comunidade dedicada a apoiar pessoas neurodivergentes (TDAH, autismo, dislexia, AHSD e outras variações neurológicas).

**Nossa missão:** Oferecer acolhimento, informação e suporte para que você possa navegar pelo mundo com mais confiança e autoconhecimento.

**O que você pode perguntar:**
🧠 TDAH e Autismo (TEA)
⚖️ Direitos e legislação
📋 Organização e produtividade
🆘 Crises sensoriais e regulação
🔍 Diagnóstico e avaliação
🧘 Terapias e tratamentos
🌈 Neurodiversidade em geral

**Como funciona:**
• Eu uso inteligência artificial para responder suas perguntas
• Sempre com base em evidências e com muito acolhimento
• Se precisar de ajuda profissional, vou recomendar buscar um especialista

**Vamos conversar?** Me faça qualquer pergunta sobre neurodiversidade! 💜

**Situação do Site**
Atualmente, o site ainda não está publicado na internet. No entanto, o protótipo completo foi desenvolvido e finalizado na plataforma Figma, contendo todas as telas e funcionalidades planejadas. O layout foi estruturado com foco em acessibilidade, organização visual e facilidade de navegação, garantindo uma experiência inclusiva ao usuário.

**Definição do Projeto**
O projeto é fixo e não há previsão de mudança de tema até o meio do ano. A proposta já está consolidada e definida pela equipe.

**Documento do TCC**
O documento do TCC já foi iniciado e está sendo desenvolvido conforme as orientações acadêmicas estabelecidas pela instituição.

**Dúvidas para o Orientador**
No momento, não possuímos dúvidas que necessitem exclusivamente da orientação direta do professor. Caso surjam questionamentos específicos, entraremos em contato.

**Documento Explicativo do Projeto**
Nome do Projeto: Amor Neurodivergente
O projeto Amor Neurodivergente tem como objetivo apoiar pessoas com TDAH, dislexia, dispraxia, discalculia e outras formas de neurodivergência. A proposta consiste na criação de um ambiente digital inclusivo, acessível, informativo e socialmente ativo, promovendo acolhimento, conhecimento, interação e conscientização sobre direitos.

O diferencial do projeto é que ele não será apenas um site informativo. Também atuará na ampliação e divulgação de leis, normas e direitos relacionados às pessoas neurodivergentes, contribuindo para que os usuários conheçam seus direitos em ambientes escolares, acadêmicos, profissionais e sociais.

A plataforma contará com uma área dedicada à explicação de legislações e políticas públicas que garantem acessibilidade, adaptações pedagógicas, inclusão e igualdade de oportunidades. O objetivo é empoderar os usuários por meio do conhecimento jurídico, tornando o site uma ferramenta de orientação e conscientização social.

O site foi planejado com foco em acessibilidade e facilidade de uso. Na página inicial, haverá uma guia de acessibilidade que permitirá ao usuário personalizar sua experiência, ajustando tamanho da fonte, iluminação do site, visibilidade, contraste e cores. Também serão apresentadas informações sobre o propósito do projeto e seu funcionamento.

**Recursos do Projeto:**

*   **Perguntas e Respostas:** Espaço interativo no qual os usuários poderão tirar dúvidas e compartilhar experiências, promovendo apoio mútuo.
*   **Quem Somos:** Seção dedicada à apresentação da equipe, explicação do funcionamento do projeto e disponibilização de formas de contato.
*   **Blog:** Área destinada à publicação de conteúdos informativos sobre neurodivergências, inclusão, acessibilidade e direitos.
*   **Comunidade:** Espaço interativo com postagens dos usuários, sistema de verificação, categorias organizadas, sugestões de conteúdo e notificações de novas publicações.
*   **Seção de Direitos e Leis:** Área dedicada à divulgação e explicação de leis, normas e políticas públicas relacionadas à inclusão e acessibilidade de pessoas neurodivergentes, utilizando linguagem clara e acessível.
*   **Biblioteca:** Uma área de testes feita pela comunidade, conectada com os grupos da área da comunidade. Um espaço feito para se juntar, onde as melhores ideias serão selecionadas para uso educacional e disponibilizadas ao público gratuitamente. Todas essas áreas têm por fim permitir que o usuário mostre suas habilidades e versatilidade no trabalho em equipe dentro da comunidade.

**Áreas Adicionadas:**
1.  **Explorar:** Área contendo todas as seções anteriores de forma mais compacta para o uso facilitado da pessoa neurodivergente.

**GRUPO 06**
*   Jonatas
*   João Miguel
*   Guilherme
*   Victor
*   David Araujo
*   David Costa`;
    }

    // =========================================================================
    // 💬 CHAT FUNCTIONS
    // =========================================================================
    const chatContainer = document.getElementById('chatContainer');
    const chatHistory = document.getElementById('chatHistory');
    const chatInput = document.getElementById('chatInput');
    const btnSend = document.getElementById('btnSend');
    const suggestionsGrid = document.getElementById('suggestionsGrid');

    // Lista negra
    const blockedTopics = [
        'porno', 'pornô', 'pornografia', 'sexo', 'sexual', 'nudez', 'nudes',
        'violência', 'armas', 'drogas', 'crime', 'hack', 'golpe', 'aposta',
        'cassino', 'bet', 'tigrinho', 'assassinato', 'suicídio', 'automutilação',
        'pedofilia', 'estupro', 'terrorismo', 'racismo', 'homofobia', 'misoginia'
    ];

    function isBlockedTopic(message) {
        const msg = message.toLowerCase();
        return blockedTopics.some(topic => msg.includes(topic.toLowerCase()));
    }

    // Supabase
    const supabase = window.supabaseClient;
    let currentUser = null;

    async function initUser() {
        if (supabase) {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    currentUser = session.user;
                    console.log('👤 Usuário logado:', currentUser.email);
                }
            } catch (error) {
                console.warn('⚠️ Erro ao carregar sessão Supabase:', error);
            }
        }
    }

    // API Groq
    async function generateResponse(message) {
        if (isBlockedTopic(message)) {
            return '💜 Prefiro manter nossa conversa em temas construtivos sobre neurodiversidade. 🌈 Como posso te ajudar de forma saudável hoje?';
        }

        const systemPrompt = `Você é a AcolherIA, assistente virtual do projeto Amor NeuroDivergente.

**Missão:** Oferecer informações precisas, acolhedoras e baseadas em evidências sobre neurodiversidade (TDAH, autismo, dislexia, AHSD, etc.).

**Diretrizes:**
- Responda com empatia e linguagem acessível
- Use emojis leves quando apropriado (💜, 🌈, 🧠, ✨)
- Dê exemplos práticos e aplicáveis
- Limite a resposta a 3-4 parágrafos
- Se a pergunta envolver saúde mental, recomende buscar um profissional
- Seja calorosa e não-julgadora
- Se não souber algo, diga claramente que não sabe

**Temas principais:** TDAH, Autismo (TEA), Neurodiversidade, Direitos, Diagnóstico, Terapia, Organização, Crises Sensoriais, Burnout.`;

        try {
            const response = await fetch(GROQ_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: message }
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                    top_p: 0.9
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Erro API Groq:', response.status, errorData);
                throw new Error(`HTTP ${response.status}: ${errorData.error?.message || 'Erro desconhecido'}`);
            }

            const data = await response.json();
            const resposta = data.choices?.[0]?.message?.content?.trim();

            if (!resposta) {
                throw new Error('Resposta vazia da API');
            }

            if (supabase && currentUser) {
                try {
                    await supabase.from('chat_history').insert({
                        user_id: currentUser.id,
                        message: message,
                        response: resposta,
                        created_at: new Date().toISOString()
                    });
                } catch (error) {
                    console.warn('⚠️ Erro ao salvar histórico:', error);
                }
            }

            return resposta;

        } catch (error) {
            console.error('❌ Falha na API Groq:', error.message);
            return '💜 Desculpe, estou com dificuldades técnicas no momento. Pode tentar novamente em alguns instantes? Se preferir, pode perguntar sobre TDAH, autismo, direitos ou organização que eu posso te ajudar! 🌈';
        }
    }

    // Chat UI
    function appendBubble(text, sender) {
        if (!chatHistory) return;

        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender}`;
        
        let formattedText = text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        bubble.innerHTML = formattedText;
        chatHistory.appendChild(bubble);
        
        setTimeout(() => {
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }, 50);
    }

    function appendTyping() {
        if (!chatHistory) return;
        
        removeTyping();
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble ai typing';
        bubble.id = 'typingIndicator';
        bubble.innerHTML = 'AcolherIA está pensando... 💭';
        chatHistory.appendChild(bubble);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function removeTyping() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    async function handleSend(message) {
        if (!message?.trim()) {
            if (chatInput) {
                chatInput.style.borderColor = '#ff6b6b';
                setTimeout(() => { chatInput.style.borderColor = ''; }, 2000);
            }
            return;
        }

        if (suggestionsGrid) {
            suggestionsGrid.style.display = 'none';
        }

        if (chatContainer) {
            chatContainer.classList.add('active-session');
        }

        appendBubble(message, 'user');
        
        if (chatInput) {
            chatInput.value = '';
            chatInput.focus();
        }

        appendTyping();

        try {
            const response = await generateResponse(message);
            
            setTimeout(() => {
                removeTyping();
                appendBubble(response, 'ai');
            }, 500 + Math.random() * 400);
            
        } catch (error) {
            console.error('❌ Erro ao gerar resposta:', error);
            removeTyping();
            appendBubble('💜 Desculpe, tive um pequeno problema. Pode repetir sua pergunta?', 'ai');
        }
    }

    // Event Listeners do Chat
    if (btnSend) {
        btnSend.addEventListener('click', () => {
            handleSend(chatInput?.value || '');
        });
    }

    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(chatInput.value);
            }
        });

        chatInput.addEventListener('input', () => {
            chatInput.style.height = 'auto';
            chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + 'px';
        });
    }

    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.getAttribute('data-prompt') || btn.textContent.trim();
            handleSend(prompt);
        });
    });

    // =========================================================================
    // 🚀 INICIALIZAÇÃO
    // =========================================================================
    async function init() {
        await initUser();
        
        // Mensagem inicial do chat (se existir o elemento)
        if (chatHistory) {
            setTimeout(() => {
                appendBubble(getProjectDescription(), 'ai');
            }, 500);
        }

        console.log('🧠 AcolherIA v7.0 — Chat + Início + Carrossel 3D');
        console.log('👤 Perfil:', localStorage.getItem('userName') || 'Visitante');
        console.log('✨ Scroll Reveal ativo');
    }

    init();
});