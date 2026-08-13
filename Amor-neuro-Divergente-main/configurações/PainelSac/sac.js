document.addEventListener('DOMContentLoaded', () => {
    
    const body = document.body;

    // ============================================
    // BANCO DE DADOS DOS TICKETS
    // ============================================
    const tickets = [
        {
            id: 3,
            protocolo: '#3',
            cliente: 'David de araujo',
            email: 'davidbrendanascimento@gmail.com',
            telefone: '71991408679',
            local: 'bahia/Brasil',
            departamento: 'suporte',
            status: 'finalizado',
            data: '11/05, 08:38',
            assunto: 'estou com dúvida tal tal tal tal',
            mensagens: [
                { autor: 'David de araujo', texto: 'caso tal tal tal', tipo: 'cliente' },
                { autor: 'TonyEsterco', texto: 'beleza vamos resolver seu caso precisamos de mais informações', tipo: 'atendente' }
            ]
        },
        {
            id: 2,
            protocolo: '#2',
            cliente: 'SADA',
            email: '—',
            telefone: '—',
            local: '—',
            departamento: 'neurodiversidade',
            status: 'finalizado',
            data: '10/05, 18:00',
            assunto: 'Dúvida sobre neurodiversidade',
            mensagens: [
                { autor: 'SADA', texto: 'Gostaria de saber mais sobre os recursos disponíveis', tipo: 'cliente' },
                { autor: 'TonyEsterco', texto: 'Claro! Temos diversos materiais sobre neurodiversidade.', tipo: 'atendente' }
            ]
        },
        {
            id: 1,
            protocolo: '#1',
            cliente: 'David de Araújo Nascimento',
            email: '—',
            telefone: '—',
            local: '—',
            departamento: 'comercial',
            status: 'pendente',
            data: '08/05, 13:00',
            assunto: 'Informações sobre planos e preços',
            mensagens: [
                { autor: 'David de Araújo Nascimento', texto: 'Olá, gostaria de saber sobre os planos disponíveis', tipo: 'cliente' }
            ]
        }
    ];

    let currentTicketId = null;

    // ============================================
    // RENDERIZAÇÃO DA TABELA
    // ============================================
    function renderTabela(filtroStatus = 'todos', filtroDept = 'todos', busca = '') {
        const tbody = document.getElementById('ticketTableBody');
        if (!tbody) return;

        const statusLabels = {
            'finalizado': { classe: 'badge-gray', texto: 'Finalizado' },
            'pendente': { classe: 'badge-pink', texto: 'Pendente' },
            'ativo': { classe: 'badge-green', texto: 'Ativo' }
        };

        let html = '';
        let countAtivos = 0, countPendentes = 0, countFinalizados = 0;

        tickets.forEach(ticket => {
            // Filtros
            if (filtroStatus !== 'todos' && ticket.status !== filtroStatus) return;
            if (filtroDept !== 'todos' && ticket.departamento !== filtroDept) return;
            if (busca) {
                const termo = busca.toLowerCase();
                if (!ticket.cliente.toLowerCase().includes(termo) && !ticket.protocolo.toLowerCase().includes(termo)) return;
            }

            // Contadores
            if (ticket.status === 'ativo') countAtivos++;
            if (ticket.status === 'pendente') countPendentes++;
            if (ticket.status === 'finalizado') countFinalizados++;

            const statusInfo = statusLabels[ticket.status] || { classe: 'badge-gray', texto: ticket.status };
            const contato = ticket.email !== '—' ? `${ticket.email} • ${ticket.telefone} • ${ticket.local}` : '—';

            html += `
                <tr>
                    <td><span class="badge ${statusInfo.classe}">${statusInfo.texto}</span></td>
                    <td class="text-muted">${ticket.protocolo}</td>
                    <td class="font-medium">${ticket.cliente}</td>
                    <td class="text-muted truncate">${contato}</td>
                    <td>${ticket.departamento.charAt(0).toUpperCase() + ticket.departamento.slice(1)}</td>
                    <td class="text-muted">${ticket.data}</td>
                    <td>
                        <button class="btn-chat open-chat-btn" data-id="${ticket.id}" aria-label="Abrir conversa" title="Abrir conversa">
                            <i class="fa-regular fa-comment-dots"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html || '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted);">Nenhum ticket encontrado</td></tr>';

        // Atualiza contadores
        document.getElementById('countAtivos').textContent = countAtivos;
        document.getElementById('countFinalizados').textContent = countFinalizados;
        document.getElementById('countTodos').textContent = tickets.length;
        document.getElementById('countAtivo').textContent = countAtivos;
        document.getElementById('countPendente').textContent = countPendentes;
        document.getElementById('countFinalizado').textContent = countFinalizados;
        document.getElementById('tempoMedio').textContent = tickets.length > 0 ? '~24h' : '—';
        document.getElementById('avaliacaoMedia').textContent = '—';

        // Re-atribui eventos dos botões de chat
        document.querySelectorAll('.open-chat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                abrirModalTicket(id);
            });
        });
    }

    // ============================================
    // MODAL DE TICKET
    // ============================================
    function abrirModalTicket(id) {
        const ticket = tickets.find(t => t.id === id);
        if (!ticket) return;

        currentTicketId = id;

        document.getElementById('modalTicketTitle').textContent = `Ticket ${ticket.protocolo}`;
        document.getElementById('modalTicketStatus').textContent = ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
        document.getElementById('modalTicketStatus').className = 'badge badge-status ' + (
            ticket.status === 'ativo' ? 'badge-green' : 
            ticket.status === 'pendente' ? 'badge-pink' : 'badge-gray'
        );
        document.getElementById('modalClientName').textContent = ticket.cliente;
        document.getElementById('modalClientContact').textContent = 
            `${ticket.email} • ${ticket.telefone} • ${ticket.local}`;
        document.getElementById('ticketDeptSelect').value = ticket.departamento;
        document.getElementById('modalSubject').textContent = ticket.assunto;

        // Renderiza mensagens
        const chatContainer = document.getElementById('chatHistoryContainer');
        let chatHTML = '';
        ticket.mensagens.forEach(msg => {
            const isAtendente = msg.tipo === 'atendente';
            chatHTML += `
                <div class="chat-bubble-wrapper ${isAtendente ? 'bubble-right' : 'bubble-left'}">
                    <span class="bubble-author">${msg.autor}</span>
                    <div class="chat-bubble">${msg.texto}</div>
                </div>
            `;
        });
        chatContainer.innerHTML = chatHTML;
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Atualiza botão de status
        atualizarBotaoStatus(ticket.status);

        // Mostra modal
        document.getElementById('ticketModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function fecharModal() {
        document.getElementById('ticketModal').classList.remove('active');
        document.body.style.overflow = '';
        currentTicketId = null;
    }

    function atualizarBotaoStatus(status) {
        const btn = document.getElementById('toggleStatusBtn');
        const txt = document.getElementById('toggleStatusText');
        if (status === 'finalizado') {
            txt.textContent = 'Reabrir';
            btn.className = 'secondary-btn';
        } else {
            txt.textContent = 'Finalizar';
            btn.className = 'primary-purple-btn';
        }
    }

    // ============================================
    // ENVIAR MENSAGEM NO CHAT
    // ============================================
    function enviarMensagem() {
        const textarea = document.getElementById('replyTextarea');
        const texto = textarea.value.trim();
        if (!texto || !currentTicketId) return;

        const ticket = tickets.find(t => t.id === currentTicketId);
        if (!ticket) return;

        // Adiciona mensagem
        ticket.mensagens.push({ autor: 'TonyEsterco', texto: texto, tipo: 'atendente' });

        // Atualiza status para ativo se não for finalizado
        if (ticket.status !== 'finalizado') {
            ticket.status = 'ativo';
        }

        // Atualiza chat
        const chatContainer = document.getElementById('chatHistoryContainer');
        const wrapper = document.createElement('div');
        wrapper.classList.add('chat-bubble-wrapper', 'bubble-right');
        wrapper.innerHTML = `
            <span class="bubble-author">TonyEsterco</span>
            <div class="chat-bubble">${texto}</div>
        `;
        chatContainer.appendChild(wrapper);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Limpa textarea
        textarea.value = '';

        // Atualiza badge no modal
        document.getElementById('modalTicketStatus').textContent = ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
        document.getElementById('modalTicketStatus').className = 'badge badge-status ' + (
            ticket.status === 'ativo' ? 'badge-green' : 
            ticket.status === 'pendente' ? 'badge-pink' : 'badge-gray'
        );

        atualizarBotaoStatus(ticket.status);

        // Atualiza tabela
        const filtroAtivo = document.querySelector('.status-btn.active')?.getAttribute('data-filter') || 'todos';
        const deptAtivo = document.getElementById('deptFilter').value;
        const busca = document.getElementById('searchInput').value;
        renderTabela(filtroAtivo, deptAtivo, busca);
    }

    // ============================================
    // TOGGLE STATUS (Reabrir / Finalizar)
    // ============================================
    function toggleStatus() {
        if (!currentTicketId) return;
        const ticket = tickets.find(t => t.id === currentTicketId);
        if (!ticket) return;

        ticket.status = ticket.status === 'finalizado' ? 'ativo' : 'finalizado';

        document.getElementById('modalTicketStatus').textContent = ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
        document.getElementById('modalTicketStatus').className = 'badge badge-status ' + (
            ticket.status === 'ativo' ? 'badge-green' : 
            ticket.status === 'pendente' ? 'badge-pink' : 'badge-gray'
        );

        atualizarBotaoStatus(ticket.status);

        const filtroAtivo = document.querySelector('.status-btn.active')?.getAttribute('data-filter') || 'todos';
        const deptAtivo = document.getElementById('deptFilter').value;
        const busca = document.getElementById('searchInput').value;
        renderTabela(filtroAtivo, deptAtivo, busca);
    }

    // ============================================
    // CRIAR NOVO TICKET
    // ============================================
    function criarNovoTicket() {
        const nome = prompt('Nome do cliente:');
        if (!nome) return;
        const email = prompt('E-mail:') || '—';
        const telefone = prompt('Telefone:') || '—';
        const assunto = prompt('Assunto:') || 'Novo atendimento';
        const dept = prompt('Departamento (suporte/comercial/neurodiversidade):') || 'suporte';
        const mensagem = prompt('Mensagem inicial:') || '—';

        const novoId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1;
        const agora = new Date();
        const dataFormatada = `${String(agora.getDate()).padStart(2,'0')}/${String(agora.getMonth()+1).padStart(2,'0')}, ${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`;

        tickets.unshift({
            id: novoId,
            protocolo: `#${novoId}`,
            cliente: nome,
            email: email,
            telefone: telefone,
            local: '—',
            departamento: dept,
            status: 'ativo',
            data: dataFormatada,
            assunto: assunto,
            mensagens: [
                { autor: nome, texto: mensagem, tipo: 'cliente' }
            ]
        });

        renderTabela();
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    document.getElementById('btnNewTicket').addEventListener('click', criarNovoTicket);
    document.getElementById('closeModalBtn').addEventListener('click', fecharModal);
    document.getElementById('ticketModal').addEventListener('click', function(e) {
        if (e.target === this) fecharModal();
    });
    document.getElementById('sendReplyBtn').addEventListener('click', enviarMensagem);
    document.getElementById('toggleStatusBtn').addEventListener('click', toggleStatus);
    document.getElementById('replyTextarea').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensagem();
        }
    });

    // Filtros
    document.getElementById('searchInput').addEventListener('input', function() {
        const filtroAtivo = document.querySelector('.status-btn.active')?.getAttribute('data-filter') || 'todos';
        const deptAtivo = document.getElementById('deptFilter').value;
        renderTabela(filtroAtivo, deptAtivo, this.value);
    });

    document.getElementById('deptFilter').addEventListener('change', function() {
        const filtroAtivo = document.querySelector('.status-btn.active')?.getAttribute('data-filter') || 'todos';
        const busca = document.getElementById('searchInput').value;
        renderTabela(filtroAtivo, this.value, busca);
    });

    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filtro = this.getAttribute('data-filter');
            const deptAtivo = document.getElementById('deptFilter').value;
            const busca = document.getElementById('searchInput').value;
            renderTabela(filtro, deptAtivo, busca);
        });
    });

    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('ticketModal').classList.contains('active')) {
            fecharModal();
        }
    });

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
    renderTabela();
    console.log('🚀 SAC completo inicializado!');
});