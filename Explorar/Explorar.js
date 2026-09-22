/**
 * EXPLORAR.JS — Amor NeuroDivergente
 * Sidebar + Acessibilidade + Perfil + Hub + FAQ + Carrossel + Atendimento 3 estados (com aprovação)
 */

document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;

    // =============================================
    // CLIENT SUPABASE (definido no HTML)
    // =============================================
    const sb = window.supabaseClient;

    if (!sb) {
        console.error(
            '❌ window.supabaseClient não encontrado.\n' +
            'Verifique se <script> com createClient está ANTES do Explorar.js no HTML.'
        );
    }

    // =============================================
    // 0. SINCRONIZAÇÃO DE PERFIL
    // =============================================
    function syncProfile() {
        const savedName   = localStorage.getItem('userName');
        const savedEmail  = localStorage.getItem('userEmail');
        const savedAvatar = localStorage.getItem('userAvatar');

        const sidebarAvatar    = document.getElementById('sidebarAvatar');
        const sidebarUserName  = document.getElementById('sidebarUserName');
        const sidebarUserEmail = document.getElementById('sidebarUserEmail');

        if (sidebarAvatar && savedAvatar) {
            sidebarAvatar.src = savedAvatar;
            sidebarAvatar.onerror = () => { sidebarAvatar.src = '/img/avatar-padrao.png'; };
        }
        if (sidebarUserName && savedName)   sidebarUserName.textContent  = savedName;
        if (sidebarUserEmail && savedEmail) sidebarUserEmail.textContent = savedEmail;
    }
    syncProfile();
    window.addEventListener('storage', (e) => {
        if (['userAvatar','userName','userEmail'].includes(e.key)) syncProfile();
    });

    // =============================================
    // 1. SIDEBAR RESPONSIVA
    // =============================================
    const sidebar          = document.getElementById('sidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebarOverlay   = document.getElementById('sidebarOverlay');

    function openSidebar() {
        if (!sidebar) return;
        sidebar.classList.add('open');
        sidebarOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove('open');
        sidebarOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    }
    function toggleSidebar() {
        if (sidebar?.classList.contains('open')) closeSidebar();
        else openSidebar();
    }

    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });
    }
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar?.classList.contains('open')) closeSidebar();
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
    const a11yToggle  = document.getElementById('a11yToggle');
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

    function gs(k, fb) { return localStorage.getItem('a11y_' + k) || fb; }
    function ss(k, v) { localStorage.setItem('a11y_' + k, v); }
    function usl(id, active) {
        const el = document.getElementById(id);
        if (el) el.textContent = active ? 'Ligado' : 'Desligado';
    }

    function applySettings() {
        body.classList.remove(
            'a11y-dark-mode','a11y-highlight-links','a11y-dyslexia','a11y-reduce-motion'
        );
        if (gs('darkMode') === 'true')       body.classList.add('a11y-dark-mode');
        if (gs('highlightLinks') === 'true') body.classList.add('a11y-highlight-links');
        if (gs('dyslexiaFont') === 'true')   body.classList.add('a11y-dyslexia');
        if (gs('reduceMotion') === 'true')   body.classList.add('a11y-reduce-motion');

        const ts   = gs('textSize', 'normal');
        const main = document.getElementById('mainContent');
        if (main) {
            main.classList.remove('a11y-large-text', 'a11y-small-text');
            if (ts === 'large') main.classList.add('a11y-large-text');
            if (ts === 'small') main.classList.add('a11y-small-text');
        }

        usl('darkModeStatus', gs('darkMode') === 'true');
        usl('linksStatus',    gs('highlightLinks') === 'true');
        usl('dyslexiaStatus', gs('dyslexiaFont') === 'true');
        usl('motionStatus',   gs('reduceMotion') === 'true');
    }

    function executarAcaoA11y(action) {
        const main = document.getElementById('mainContent');

        switch (action) {
            case 'darkMode': {
                const dm = gs('darkMode') === 'true';
                ss('darkMode', dm ? 'false' : 'true');
                body.classList.toggle('a11y-dark-mode', !dm);
                usl('darkModeStatus', !dm);
                updateHubStatus();
                break;
            }
            case 'increaseText': {
                const cs = gs('textSize', 'normal');
                if (cs === 'large') {
                    ss('textSize', 'normal');
                    main?.classList.remove('a11y-large-text');
                } else {
                    ss('textSize', 'large');
                    main?.classList.remove('a11y-small-text');
                    main?.classList.add('a11y-large-text');
                }
                break;
            }
            case 'decreaseText': {
                const cz = gs('textSize', 'normal');
                if (cz === 'small') {
                    ss('textSize', 'normal');
                    main?.classList.remove('a11y-small-text');
                } else {
                    ss('textSize', 'small');
                    main?.classList.remove('a11y-large-text');
                    main?.classList.add('a11y-small-text');
                }
                break;
            }
            case 'highlightLinks': {
                const hl = gs('highlightLinks') === 'true';
                ss('highlightLinks', hl ? 'false' : 'true');
                body.classList.toggle('a11y-highlight-links', !hl);
                usl('linksStatus', !hl);
                break;
            }
            case 'dyslexiaFont': {
                const df = gs('dyslexiaFont') === 'true';
                ss('dyslexiaFont', df ? 'false' : 'true');
                body.classList.toggle('a11y-dyslexia', !df);
                usl('dyslexiaStatus', !df);
                updateHubStatus();
                break;
            }
            case 'reduceMotion': {
                const rm = gs('reduceMotion') === 'true';
                ss('reduceMotion', rm ? 'false' : 'true');
                body.classList.toggle('a11y-reduce-motion', !rm);
                usl('motionStatus', !rm);
                updateHubStatus();
                break;
            }
            case 'reset': {
                ['darkMode','highlightLinks','dyslexiaFont','reduceMotion','textSize']
                    .forEach(k => localStorage.removeItem('a11y_' + k));
                body.classList.remove(
                    'a11y-dark-mode','a11y-highlight-links','a11y-dyslexia','a11y-reduce-motion'
                );
                main?.classList.remove('a11y-large-text','a11y-small-text');
                usl('darkModeStatus', false);
                usl('linksStatus', false);
                usl('dyslexiaStatus', false);
                usl('motionStatus', false);
                updateHubStatus();
                break;
            }
        }
    }

    document.querySelectorAll('.a11y-option, .a11y-reset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            executarAcaoA11y(btn.getAttribute('data-a11y'));
        });
    });

    applySettings();

    // =============================================
    // 4. HUB FLUTUANTE
    // =============================================
    const hubToggle  = document.getElementById('floatingHubToggle');
    const hubMenu    = document.getElementById('floatingHubMenu');
    const hubOverlay = document.getElementById('floatingOverlay');

    function toggleHub() {
        if (!hubMenu || !hubOverlay) return;
        const isOpen = !hubMenu.hidden;
        hubMenu.hidden    = isOpen;
        hubOverlay.hidden = isOpen;
        hubToggle?.setAttribute('aria-expanded', String(!isOpen));
    }
    function closeHub() {
        if (!hubMenu || !hubOverlay) return;
        hubMenu.hidden    = true;
        hubOverlay.hidden = true;
        hubToggle?.setAttribute('aria-expanded', 'false');
    }

    hubToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleHub();
    });
    hubOverlay?.addEventListener('click', closeHub);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeHub(); });

    // =============================================
    // 5. ATUALIZAR STATUS DO HUB
    // =============================================
    function updateHubStatus() {
        const darkLabel = document.querySelector('.hub-action[data-a11y="darkMode"] .hub-action-label');
        if (darkLabel) darkLabel.textContent =
            body.classList.contains('a11y-dark-mode') ? 'Claro' : 'Escuro';

        const dyslexiaLabel = document.querySelector('.hub-action[data-a11y="dyslexiaFont"] .hub-action-label');
        if (dyslexiaLabel) dyslexiaLabel.textContent =
            body.classList.contains('a11y-dyslexia') ? 'Ativo' : 'Dislexia';

        const motionLabel = document.querySelector('.hub-action[data-a11y="reduceMotion"] .hub-action-label');
        if (motionLabel) motionLabel.textContent =
            body.classList.contains('a11y-reduce-motion') ? 'Ativo' : 'Movimento';
    }
    updateHubStatus();

    // =============================================
    // 6. AÇÕES DO HUB
    // =============================================
    document.querySelectorAll('.hub-action[data-a11y]').forEach((item) => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            executarAcaoA11y(item.getAttribute('data-a11y'));
            closeHub();
        });
    });

    document.querySelectorAll('.hub-action[href]').forEach((link) => {
        link.addEventListener('click', closeHub);
    });

    // =============================================
    // 7. BOTÃO VOLTAR AO TOPO
    // =============================================
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 400) {
                scrollTopBtn.style.opacity       = '1';
                scrollTopBtn.style.transform     = 'translateY(0)';
                scrollTopBtn.style.pointerEvents = 'auto';
            } else {
                scrollTopBtn.style.opacity       = '0';
                scrollTopBtn.style.transform     = 'translateY(20px)';
                scrollTopBtn.style.pointerEvents = 'none';
            }
        });
        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // =============================================
    // 8. HEADER SCROLL EFFECT
    // =============================================
    const headerGlass = document.getElementById('headerGlass');
    if (headerGlass) {
        window.addEventListener('scroll', () => {
            headerGlass.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // =============================================
    // 9. FAQ — ABRIR UM FECHA OS OUTROS
    // =============================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                faqItems.forEach(other => {
                    if (other !== item && other.open) other.open = false;
                });
            }
        });
    });

    // =============================================
    // 10. FAQ — BUSCA
    // =============================================
    const faqSearchInput = document.getElementById('faqSearchInput');
    const faqNoResults   = document.getElementById('faqNoResults');
    const faqSearchTerm  = document.getElementById('faqSearchTerm');

    if (faqSearchInput) {
        faqSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            let found = false;

            faqItems.forEach((item) => {
                const keywords    = (item.getAttribute('data-keywords') || '').toLowerCase();
                const summaryText = item.querySelector('summary span')?.textContent?.toLowerCase() || '';
                const answerText  = item.querySelector('.faq-answer p')?.textContent?.toLowerCase() || '';

                const matches = searchTerm === '' ||
                    keywords.includes(searchTerm) ||
                    summaryText.includes(searchTerm) ||
                    answerText.includes(searchTerm);

                if (searchTerm === '' || matches) {
                    item.style.display = '';
                    found = true;
                } else {
                    item.style.display = 'none';
                }
            });

            if (faqNoResults && faqSearchTerm) {
                if (searchTerm !== '' && !found) {
                    faqNoResults.style.display = 'block';
                    faqSearchTerm.textContent  = searchTerm;
                } else {
                    faqNoResults.style.display = 'none';
                }
            }
        });
    }

    // =============================================
    // 11. LOGOUT
    // =============================================
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem('userLoggedIn');
            window.location.href = '/login/login.html';
        }
    });

    // =============================================
    // 12. SCROLL REVEAL
    // =============================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // =============================================
    // 13. CARROSSEL "PUBLICAÇÕES EM DESTAQUE"
    // =============================================
    const hlTrack      = document.getElementById('hlTrack');
    const hlPrev       = document.querySelector('.hl-arrow--prev');
    const hlNext       = document.querySelector('.hl-arrow--next');
    const hlPagination = document.getElementById('hlPagination');

    if (hlTrack && hlPrev && hlNext) {
        function getVisibleCards() {
            const cardWidth = hlTrack.querySelector('.hl-card')?.offsetWidth || 300;
            const gap = 20;
            return Math.max(1, Math.floor(hlTrack.clientWidth / (cardWidth + gap)));
        }

        hlPrev.addEventListener('click', () => {
            const card = hlTrack.querySelector('.hl-card');
            const step = card ? card.offsetWidth + 20 : 320;
            hlTrack.scrollBy({ left: -step, behavior: 'smooth' });
        });
        hlNext.addEventListener('click', () => {
            const card = hlTrack.querySelector('.hl-card');
            const step = card ? card.offsetWidth + 20 : 320;
            hlTrack.scrollBy({ left: step, behavior: 'smooth' });
        });

        const hlPages    = hlPagination ? hlPagination.querySelectorAll('.hl-page[data-page]') : [];
        const totalCards = hlTrack.querySelectorAll('.hl-card').length;

        function updatePaginationUI() {
            if (!hlPagination) return;
            const card = hlTrack.querySelector('.hl-card');
            if (!card) return;

            const step         = card.offsetWidth + 20;
            const currentIndex = Math.round(hlTrack.scrollLeft / step);
            const visible      = getVisibleCards();
            const totalPages   = Math.max(1, Math.ceil(totalCards / visible));
            const currentPage  = Math.min(totalPages, Math.floor(currentIndex / visible) + 1);

            hlPages.forEach(btn => {
                const page = parseInt(btn.getAttribute('data-page'), 10);
                btn.classList.toggle('is-active', page === currentPage);
            });
        }

        let scrollTimeout;
        hlTrack.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updatePaginationUI, 80);
        });

        hlPages.forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.getAttribute('data-page'), 10);
                const card = hlTrack.querySelector('.hl-card');
                if (!card) return;
                const step         = card.offsetWidth + 20;
                const visible      = getVisibleCards();
                const targetScroll = (page - 1) * visible * step;
                hlTrack.scrollTo({ left: targetScroll, behavior: 'smooth' });
            });
        });

        if (hlPagination) {
            const firstBtn    = hlPagination.querySelector('.hl-page[aria-label="Primeira página"]');
            const lastBtn     = hlPagination.querySelector('.hl-page[aria-label="Última página"]');
            const prevPageBtn = hlPagination.querySelector('.hl-page[aria-label="Anterior"]');
            const nextPageBtn = hlPagination.querySelector('.hl-page[aria-label="Próxima"]');

            firstBtn?.addEventListener('click', () => hlTrack.scrollTo({ left: 0, behavior: 'smooth' }));
            lastBtn?.addEventListener('click',  () => hlTrack.scrollTo({ left: hlTrack.scrollWidth, behavior: 'smooth' }));

            prevPageBtn?.addEventListener('click', () => {
                const card = hlTrack.querySelector('.hl-card');
                if (!card) return;
                const step = card.offsetWidth + 20;
                hlTrack.scrollBy({ left: -step * getVisibleCards(), behavior: 'smooth' });
            });
            nextPageBtn?.addEventListener('click', () => {
                const card = hlTrack.querySelector('.hl-card');
                if (!card) return;
                const step = card.offsetWidth + 20;
                hlTrack.scrollBy({ left: step * getVisibleCards(), behavior: 'smooth' });
            });
        }

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updatePaginationUI, 150);
        });

        updatePaginationUI();
    }

    // =============================================
    // 14. ATENDIMENTO — 3 ESTADOS (FORM → ESPERA → CHAT)
    //     Agora com aprovação: só libera chat se at.aprovado === true
    // =============================================
    const taCaso   = document.getElementById('form-caso');
    const contador = document.getElementById('current-chars');
    const form     = document.getElementById('support-form');

    const LS_KEY = 'amn_atendimento_ativo';
    let realtimeChannel = null;
    let atendimentoAtual = null;

    // ---------- Contador de caracteres ----------
    if (taCaso && contador) {
        contador.textContent = taCaso.value.length;

        taCaso.addEventListener('input', () => {
            const len = taCaso.value.length;
            contador.textContent = len;

            const wrap = contador.parentElement;
            wrap.classList.remove('is-warning', 'is-danger');
            if (len > 3800)      wrap.classList.add('is-danger');
            else if (len > 3200) wrap.classList.add('is-warning');
        });
    }

    // ---------- Troca de estado ----------
    function mostrarEstado(nome) {
        const f = document.getElementById('estado-formulario');
        const e = document.getElementById('estado-espera');
        const c = document.getElementById('estado-chat');
        if (f) f.hidden = (nome !== 'form');
        if (e) e.hidden = (nome !== 'espera');
        if (c) c.hidden = (nome !== 'chat');
    }

    // ---------- Atualiza o texto/visual do estado de espera ----------
    function atualizarEstadoEspera(at) {
        const statusEl = document.getElementById('statusEsperaTexto');
        const dotEl    = document.querySelector('.espera-status .status-dot');
        const wrap     = document.querySelector('.espera-status');

        if (!statusEl || !wrap) return;

        const aprovado = at?.aprovado === true;
        const status   = at?.status || 'aguardando';

        if (status === 'finalizado' && !aprovado) {
            statusEl.textContent = 'Este atendimento foi encerrado pela equipe.';
            wrap.classList.add('espera-status--finalizado');
            wrap.classList.remove('espera-status--aguardando');
            if (dotEl) dotEl.style.background = '#9ca3af';
        } else if (aprovado) {
            statusEl.textContent = 'Atendimento aceito! Carregando conversa…';
            wrap.classList.add('espera-status--aceito');
            wrap.classList.remove('espera-status--aguardando');
            if (dotEl) dotEl.style.background = '#16a34a';
        } else {
            statusEl.textContent = 'Aguardando a equipe aceitar seu atendimento…';
            wrap.classList.add('espera-status--aguardando');
            wrap.classList.remove('espera-status--aceito');
            if (dotEl) dotEl.style.background = '#f59e0b';
        }
    }

    // ---------- Renderiza o chat ----------
    function renderizarChat(mensagens) {
        const el = document.getElementById('chatMensagens');
        if (!el) return;

        el.innerHTML = mensagens.map(m => `
            <div class="chat-msg chat-msg--${m.tipo}">
                <span class="chat-msg-autor">${m.autor}</span>
                <div class="chat-msg-balao">${(m.texto || '').replace(/\n/g, '<br>')}</div>
            </div>
        `).join('');

        el.scrollTop = el.scrollHeight;
    }

    // ---------- Consulta no Supabase ----------
    async function carregarAtendimento(protocolo, email) {
        if (!sb) return null;
        const { data, error } = await sb.rpc('consultar_atendimento', {
            p_protocolo: protocolo,
            p_email:     email
        });
        if (error || !data?.length) return null;
        return data[0];
    }

    // ---------- Aplica estado conforme atendimento ----------
    function aplicarAtendimento(at) {
        atendimentoAtual = at;

        const chatProto   = document.getElementById('chatProtocolo');
        const chatAssunto = document.getElementById('chatAssunto');
        const chatStatus  = document.getElementById('chatStatus');
        const protoExib   = document.getElementById('protocoloExibido');

        if (chatProto)   chatProto.textContent   = `Protocolo ${at.protocolo}`;
        if (chatAssunto) chatAssunto.textContent = at.assunto;
        if (protoExib)   protoExib.textContent   = at.protocolo;

        if (chatStatus) {
            chatStatus.textContent = at.status.charAt(0).toUpperCase() + at.status.slice(1);
            chatStatus.className = 'badge badge-status ' + (
                at.status === 'aguardando' ? 'badge-pink'  :
                at.status === 'ativo'      ? 'badge-green' :
                at.status === 'finalizado' ? 'badge-gray'  : 'badge-pink'
            );
        }

        const mensagens = at.mensagens || [];

        // 🔒 Só libera o chat se estiver APROVADO
        if (!at.aprovado) {
            atualizarEstadoEspera(at);
            mostrarEstado('espera');
            return;
        }

        // Se aprovado, abre o chat
        renderizarChat(mensagens);
        mostrarEstado('chat');
    }

    // ---------- Realtime ----------
    function assinarRealtime(atendimentoId) {
        if (!sb) return;
        if (realtimeChannel) {
            try { sb.removeChannel(realtimeChannel); } catch (e) {}
        }

        // Escuta tanto INSERTs em mensagens quanto UPDATEs em atendimentos
        realtimeChannel = sb.channel(`atendimento-${atendimentoId}`)
            .on(
                'postgres_changes',
                {
                    event:  'INSERT',
                    schema: 'public',
                    table:  'mensagens',
                    filter: `atendimento_id=eq.${atendimentoId}`
                },
                () => {
                    if (atendimentoAtual) {
                        carregarAtendimento(atendimentoAtual.protocolo, atendimentoAtual.email)
                            .then(at => at && aplicarAtendimento(at));
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event:  'UPDATE',
                    schema: 'public',
                    table:  'atendimentos',
                    filter: `id=eq.${atendimentoId}`
                },
                () => {
                    if (atendimentoAtual) {
                        carregarAtendimento(atendimentoAtual.protocolo, atendimentoAtual.email)
                            .then(at => at && aplicarAtendimento(at));
                    }
                }
            )
            .subscribe();
    }

    // ---------- Submit do formulário ----------
    if (form && sb) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn      = form.querySelector('.submit-form-btn');
            const original = btn.textContent;

            const nome         = document.getElementById('form-nome').value.trim();
            const email        = document.getElementById('form-email').value.trim();
            const telefone     = document.getElementById('form-phone').value.trim();
            const cidade       = document.getElementById('form-cidade').value.trim();
            const canal        = document.getElementById('form-canal').value;
            const departamento = document.getElementById('form-depto').value;
            const assunto      = document.getElementById('form-assunto').value.trim();
            const mensagem     = taCaso.value.trim();

            if (!nome || !email || !assunto || !mensagem) {
                alert('⚠️ Preencha todos os campos obrigatórios.');
                return;
            }

            btn.disabled    = true;
            btn.textContent = 'Enviando...';

            try {
                const { data, error } = await sb.rpc('criar_atendimento', {
                    p_nome:         nome,
                    p_email:        email,
                    p_telefone:     telefone || null,
                    p_cidade:       cidade   || null,
                    p_canal:        canal,
                    p_departamento: departamento,
                    p_assunto:      assunto,
                    p_mensagem:     mensagem,
                    p_ip:           null,
                    p_user_agent:   navigator.userAgent.slice(0, 500)
                });

                if (error) throw error;

                const protocolo = data?.[0]?.protocolo || '—';

                // Salva no localStorage
                localStorage.setItem(LS_KEY, JSON.stringify({ protocolo, email }));

                // Reset visual
                form.reset();
                if (contador) {
                    contador.textContent = '0';
                    contador.parentElement.classList.remove('is-warning', 'is-danger');
                }

                // Troca direto para o estado de espera
                const protoExib = document.getElementById('protocoloExibido');
                if (protoExib) protoExib.textContent = protocolo;
                mostrarEstado('espera');

                // Carrega + assina realtime
                const at = await carregarAtendimento(protocolo, email);
                if (at) {
                    aplicarAtendimento(at);
                    assinarRealtime(at.id);
                }

                window.dispatchEvent(new CustomEvent('atendimento:criado', {
                    detail: { protocolo, nome, email, telefone, cidade, canal, departamento, assunto, mensagem }
                }));

            } catch (err) {
                console.error('Erro ao enviar formulário:', err);
                alert('❌ Não foi possível enviar. Verifique sua conexão e tente novamente.');
            } finally {
                btn.disabled    = false;
                btn.textContent = original;
            }
        });
    }

    // ---------- Botão: copiar protocolo ----------
    document.getElementById('btnCopiarProtocolo')?.addEventListener('click', () => {
        const p = document.getElementById('protocoloExibido')?.textContent || '';
        navigator.clipboard.writeText(p).then(() => {
            const btn = document.getElementById('btnCopiarProtocolo');
            if (!btn) return;
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i>';
            setTimeout(() => btn.innerHTML = original, 1500);
        });
    });

    // ---------- Botão: verificar agora ----------
    document.getElementById('btnVerificarAgora')?.addEventListener('click', async () => {
        const salvo = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
        if (!salvo) { mostrarEstado('form'); return; }

        const at = await carregarAtendimento(salvo.protocolo, salvo.email);
        if (at) {
            aplicarAtendimento(at);
            assinarRealtime(at.id);
        } else {
            alert('Atendimento não encontrado. Talvez tenha sido removido.');
            localStorage.removeItem(LS_KEY);
            mostrarEstado('form');
        }
    });

    // ---------- Botão: novo atendimento ----------
    document.getElementById('btnNovoAtendimento')?.addEventListener('click', () => {
        if (realtimeChannel && sb) {
            try { sb.removeChannel(realtimeChannel); } catch (e) {}
            realtimeChannel = null;
        }
        localStorage.removeItem(LS_KEY);
        atendimentoAtual = null;
        form?.reset();
        if (contador) contador.textContent = '0';
        mostrarEstado('form');
    });

    // ---------- Envio de mensagem pelo chat ----------
    document.getElementById('chatForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const texto = document.getElementById('chatTexto')?.value.trim();
        if (!texto || !atendimentoAtual || !sb) return;

        if (!atendimentoAtual.aprovado) {
            alert('⚠️ Aguarde a equipe aceitar seu atendimento antes de responder.');
            return;
        }

        const btn = document.querySelector('.chat-enviar');
        if (btn) btn.disabled = true;

        const { error } = await sb.rpc('responder_atendimento', {
            p_protocolo: atendimentoAtual.protocolo,
            p_email:     atendimentoAtual.email,
            p_texto:     texto
        });

        if (btn) btn.disabled = false;

        if (error) {
            console.error('Erro ao responder:', error);
            alert('❌ Não foi possível enviar sua mensagem.');
            return;
        }

        const ta = document.getElementById('chatTexto');
        if (ta) ta.value = '';

        const at = await carregarAtendimento(atendimentoAtual.protocolo, atendimentoAtual.email);
        if (at) aplicarAtendimento(at);
    });

    // ---------- Restaura estado ao abrir a página ----------
    (async () => {
        if (!sb) return;

        const salvo = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
        if (!salvo) {
            mostrarEstado('form');
            return;
        }

        const at = await carregarAtendimento(salvo.protocolo, salvo.email);
        if (!at) {
            localStorage.removeItem(LS_KEY);
            mostrarEstado('form');
            return;
        }

        aplicarAtendimento(at);
        assinarRealtime(at.id);
    })();

    console.log('🧭 Explorar pronto! (fluxo com aprovação: form → espera → chat)');
});