// ============================================
// sac.js — Painel SAC (admin)
// Usa window.supabaseClient (definido no HTML)
// Com aprovação de atendimentos
// ============================================
document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;
    const sb   = window.supabaseClient;

    if (!sb) {
        console.error(
            '❌ window.supabaseClient não encontrado.\n' +
            'Verifique se o <script> com createClient está ANTES do sac.js no HTML.'
        );
    }

    // ============================================
    // CACHE LOCAL DOS TICKETS
    // ============================================
    let tickets = [];
    let currentTicketId = null;

    // ============================================
    // FORMATAR DATA
    // ============================================
    function formatarData(iso) {
        const d  = new Date(iso);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        return `${dd}/${mm}, ${hh}:${mi}`;
    }

    // ============================================
    // CARREGAR DO SUPABASE
    // ============================================
    async function carregarTickets() {
        if (!sb) return;
        try {
            const { data, error } = await sb
                .from('atendimentos')
                .select(`
                    id, protocolo, nome, email, telefone, cidade,
                    departamento, assunto, status, aprovado, criado_em,
                    mensagens ( id, autor, texto, tipo, criado_em )
                `)
                .order('criado_em', { ascending: false });

            if (error) throw error;

            tickets = (data || []).map(t => ({
                id:           t.id,
                protocolo:    t.protocolo,
                cliente:      t.nome,
                email:        t.email    || '—',
                telefone:     t.telefone || '—',
                local:        t.cidade   || '—',
                departamento: t.departamento,
                status:       t.status,
                aprovado:     t.aprovado === true,
                data:         formatarData(t.criado_em),
                assunto:      t.assunto,
                mensagens:    (t.mensagens || [])
                    .sort((a, b) => new Date(a.criado_em) - new Date(b.criado_em))
                    .map(m => ({
                        autor: m.autor,
                        texto: m.texto,
                        tipo:  m.tipo
                    }))
            }));
        } catch (err) {
            console.error('Erro ao carregar tickets:', err);
            tickets = [];
        }
    }

    // ============================================
    // RENDERIZAÇÃO DA TABELA
    // ============================================
    async function renderTabela(filtroStatus = 'todos', filtroDept = 'todos', busca = '') {
        await carregarTickets();

        const tbody = document.getElementById('ticketTableBody');
        if (!tbody) return;

        const statusLabels = {
            'aguardando': { classe: 'badge-pink',  texto: 'Aguardando' },
            'finalizado': { classe: 'badge-gray',  texto: 'Finalizado' },
            'pendente':   { classe: 'badge-pink',  texto: 'Pendente' },
            'ativo':      { classe: 'badge-green', texto: 'Ativo' }
        };

        let html = '';
        let countAtivos = 0, countPendentes = 0, countFinalizados = 0;

        tickets.forEach(ticket => {
            if (filtroStatus !== 'todos' && ticket.status !== filtroStatus) return;
            if (filtroDept   !== 'todos' && ticket.departamento !== filtroDept) return;
            if (busca) {
                const termo = busca.toLowerCase();
                if (!ticket.cliente.toLowerCase().includes(termo) &&
                    !ticket.protocolo.toLowerCase().includes(termo)) return;
            }

            if (ticket.status === 'ativo')      countAtivos++;
            if (ticket.status === 'pendente')   countPendentes++;
            if (ticket.status === 'aguardando') countPendentes++;
            if (ticket.status === 'finalizado') countFinalizados++;

            const statusInfo = statusLabels[ticket.status] || { classe: 'badge-gray', texto: ticket.status };
            const contato = ticket.email !== '—'
                ? `${ticket.email} • ${ticket.telefone} • ${ticket.local}`
                : '—';

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

        document.getElementById('countAtivos').textContent       = countAtivos;
        document.getElementById('countFinalizados').textContent  = countFinalizados;
        document.getElementById('countTodos').textContent        = tickets.length;
        document.getElementById('countAtivo').textContent        = countAtivos;
        document.getElementById('countPendente').textContent     = countPendentes;
        document.getElementById('countFinalizado').textContent   = countFinalizados;
        document.getElementById('tempoMedio').textContent        = tickets.length > 0 ? '~24h' : '—';
        document.getElementById('avaliacaoMedia').textContent    = '—';

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
        document.getElementById('modalTicketStatus').textContent =
            ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
        document.getElementById('modalTicketStatus').className = 'badge badge-status ' + (
            ticket.status === 'aguardando' ? 'badge-pink'  :
            ticket.status === 'ativo'      ? 'badge-green' :
            ticket.status === 'pendente'   ? 'badge-pink'  : 'badge-gray'
        );
        document.getElementById('modalClientName').textContent = ticket.cliente;
        document.getElementById('modalClientContact').textContent =
            `${ticket.email} • ${ticket.telefone} • ${ticket.local}`;
        document.getElementById('ticketDeptSelect').value = ticket.departamento;
        document.getElementById('modalSubject').textContent = ticket.assunto;

        // Chat history
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

        // Mostra botões Aceitar/Recusar conforme o estado
        const btnAceitar = document.getElementById('btnAceitar');
        const btnRecusar = document.getElementById('btnRecusar');

        if (btnAceitar && btnRecusar) {
            const mostrar = (ticket.status === 'aguardando' && !ticket.aprovado);
            btnAceitar.hidden = !mostrar;
            btnRecusar.hidden = !mostrar;
        }

        atualizarBotaoStatus(ticket.status);

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
            btn.className   = 'secondary-btn';
        } else {
            txt.textContent = 'Finalizar';
            btn.className   = 'primary-purple-btn';
        }
    }

    // ============================================
    // ACEITAR ATENDIMENTO
    // ============================================
    async function aceitarAtendimento() {
        if (!currentTicketId || !sb) return;

        const { error } = await sb
            .from('atendimentos')
            .update({
                aprovado:     true,
                aprovado_em:  new Date().toISOString(),
                aprovado_por: 'TonyEsterco',
                status:       'ativo'
            })
            .eq('id', currentTicketId);

        if (error) {
            console.error(error);
            alert('❌ Não foi possível aceitar. Tente novamente.');
            return;
        }

        const ticket = tickets.find(t => t.id === currentTicketId);
        if (ticket) {
            ticket.aprovado = true;
            ticket.status   = 'ativo';
        }

        document.getElementById('modalTicketStatus').textContent = 'Ativo';
        document.getElementById('modalTicketStatus').className   = 'badge badge-status badge-green';

        const btnAceitar = document.getElementById('btnAceitar');
        const btnRecusar = document.getElementById('btnRecusar');
        if (btnAceitar) btnAceitar.hidden = true;
        if (btnRecusar) btnRecusar.hidden = true;

        atualizarBotaoStatus('ativo');

        const filtro = document.querySelector('.status-btn.active')?.getAttribute('data-filter') || 'todos';
        const dept   = document.getElementById('deptFilter').value;
        const busca  = document.getElementById('searchInput').value;
        renderTabela(filtro, dept, busca);
    }

    // ============================================
    // RECUSAR ATENDIMENTO
    // ============================================
    async function recusarAtendimento() {
        if (!currentTicketId || !sb) return;
        if (!confirm('Recusar este atendimento? Ele será finalizado sem resposta.')) return;

        const { error } = await sb
            .from('atendimentos')
            .update({
                aprovado: false,
                status:   'finalizado'
            })
            .eq('id', currentTicketId);

        if (error) {
            console.error(error);
            alert('❌ Não foi possível recusar. Tente novamente.');
            return;
        }

        fecharModal();

        const filtro = document.querySelector('.status-btn.active')?.getAttribute('data-filter') || 'todos';
        const dept   = document.getElementById('deptFilter').value;
        const busca  = document.getElementById('searchInput').value;
        renderTabela(filtro, dept, busca);
    }

    // ============================================
    // ENVIAR MENSAGEM NO CHAT
    // ============================================
    async function enviarMensagem() {
        const textarea = document.getElementById('replyTextarea');
        const texto    = textarea.value.trim();
        if (!texto || !currentTicketId || !sb) return;

        const ticket = tickets.find(t => t.id === currentTicketId);
        if (!ticket) return;

        try {
            // 1) Salva mensagem
            const { error: errMsg } = await sb
                .from('mensagens')
                .insert({
                    atendimento_id: currentTicketId,
                    autor:          'TonyEsterco',
                    texto,
                    tipo:           'atendente'
                });

            if (errMsg) throw errMsg;

            // 2) Se ainda não aprovado, aprova automaticamente ao responder
            const patch = {};
            if (ticket.status !== 'finalizado') {
                patch.status = 'ativo';
                ticket.status = 'ativo';
            }
            if (!ticket.aprovado) {
                patch.aprovado    = true;
                patch.aprovado_em = new Date().toISOString();
                patch.aprovado_por = 'TonyEsterco';
                ticket.aprovado   = true;
            }

            if (Object.keys(patch).length) {
                const { error: errSt } = await sb
                    .from('atendimentos')
                    .update(patch)
                    .eq('id', currentTicketId);
                if (errSt) throw errSt;
            }

            // 3) Atualiza UI do chat
            const chatContainer = document.getElementById('chatHistoryContainer');
            const wrapper = document.createElement('div');
            wrapper.classList.add('chat-bubble-wrapper', 'bubble-right');
            wrapper.innerHTML = `
                <span class="bubble-author">TonyEsterco</span>
                <div class="chat-bubble">${texto}</div>
            `;
            chatContainer.appendChild(wrapper);
            chatContainer.scrollTop = chatContainer.scrollHeight;

            textarea.value = '';

            document.getElementById('modalTicketStatus').textContent =
                ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
            document.getElementById('modalTicketStatus').className = 'badge badge-status ' + (
                ticket.status === 'ativo'    ? 'badge-green' :
                ticket.status === 'pendente' ? 'badge-pink'  : 'badge-gray'
            );

            // Esconde botões Aceitar/Recusar (já foi aceito implicitamente)
            const btnAceitar = document.getElementById('btnAceitar');
            const btnRecusar = document.getElementById('btnRecusar');
            if (btnAceitar) btnAceitar.hidden = true;
            if (btnRecusar) btnRecusar.hidden = true;

            atualizarBotaoStatus(ticket.status);

            const filtroAtivo = document.querySelector('.status-btn.active')?.getAttribute('data-filter') || 'todos';
            const deptAtivo   = document.getElementById('deptFilter').value;
            const busca       = document.getElementById('searchInput').value;
            renderTabela(filtroAtivo, deptAtivo, busca);

        } catch (err) {
            console.error('Erro ao enviar mensagem:', err);
            alert('❌ Não foi possível enviar a mensagem. Tente novamente.');
        }
    }

    // ============================================
    // TOGGLE STATUS (Reabrir / Finalizar)
    // ============================================
    async function toggleStatus() {
        if (!currentTicketId || !sb) return;
        const ticket = tickets.find(t => t.id === currentTicketId);
        if (!ticket) return;

        const novoStatus = ticket.status === 'finalizado' ? 'ativo' : 'finalizado';

        try {
            const { error } = await sb
                .from('atendimentos')
                .update({ status: novoStatus })
                .eq('id', currentTicketId);

            if (error) throw error;

            ticket.status = novoStatus;

            document.getElementById('modalTicketStatus').textContent =
                ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
            document.getElementById('modalTicketStatus').className = 'badge badge-status ' + (
                ticket.status === 'ativo'    ? 'badge-green' :
                ticket.status === 'pendente' ? 'badge-pink'  : 'badge-gray'
            );

            atualizarBotaoStatus(ticket.status);

            const filtroAtivo = document.querySelector('.status-btn.active')?.getAttribute('data-filter') || 'todos';
            const deptAtivo   = document.getElementById('deptFilter').value;
            const busca       = document.getElementById('searchInput').value;
            renderTabela(filtroAtivo, deptAtivo, busca);

        } catch (err) {
            console.error('Erro ao mudar status:', err);
            alert('❌ Não foi possível alterar o status. Tente novamente.');
        }
    }

    // ============================================
    // CRIAR NOVO TICKET
    // ============================================
    async function criarNovoTicket() {
        if (!sb) return;

        const nome = prompt('Nome do cliente:');
        if (!nome) return;

        const email        = prompt('E-mail:')        || '';
        const telefone     = prompt('Telefone:')      || '';
        const assunto      = prompt('Assunto:')       || 'Novo atendimento';
        const dept         = prompt('Departamento (suporte/comercial/neurodiversidade):') || 'suporte';
        const mensagem     = prompt('Mensagem inicial:') || '—';

        try {
            const { error } = await sb.rpc('criar_atendimento', {
                p_nome:         nome,
                p_email:        email || `sem-email-${Date.now()}@amn.local`,
                p_telefone:     telefone || null,
                p_cidade:       null,
                p_canal:        'site',
                p_departamento: dept,
                p_assunto:      assunto,
                p_mensagem:     mensagem,
                p_ip:           null,
                p_user_agent:   navigator.userAgent.slice(0, 500)
            });

            if (error) throw error;

            await renderTabela();
        } catch (err) {
            console.error('Erro ao criar ticket:', err);
            alert('❌ Não foi possível criar o ticket. Tente novamente.');
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    document.getElementById('btnNewTicket')?.addEventListener('click', criarNovoTicket);
    document.getElementById('closeModalBtn')?.addEventListener('click', fecharModal);
    document.getElementById('ticketModal')?.addEventListener('click', function(e) {
        if (e.target === this) fecharModal();
    });
    document.getElementById('sendReplyBtn')?.addEventListener('click', enviarMensagem);
    document.getElementById('toggleStatusBtn')?.addEventListener('click', toggleStatus);
    document.getElementById('btnAceitar')?.addEventListener('click', aceitarAtendimento);
    document.getElementById('btnRecusar')?.addEventListener('click', recusarAtendimento);
    document.getElementById('replyTextarea')?.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensagem();
        }
    });

    // Filtros
    document.getElementById('searchInput')?.addEventListener('input', function() {
        const filtroAtivo = document.querySelector('.status-btn.active')?.getAttribute('data-filter') || 'todos';
        const deptAtivo   = document.getElementById('deptFilter').value;
        renderTabela(filtroAtivo, deptAtivo, this.value);
    });

    document.getElementById('deptFilter')?.addEventListener('change', function() {
        const filtroAtivo = document.querySelector('.status-btn.active')?.getAttribute('data-filter') || 'todos';
        const busca = document.getElementById('searchInput').value;
        renderTabela(filtroAtivo, this.value, busca);
    });

    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filtro     = this.getAttribute('data-filter');
            const deptAtivo  = document.getElementById('deptFilter').value;
            const busca      = document.getElementById('searchInput').value;
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
    const btnAcessibilidade   = document.getElementById('btnAcessibilidade');
    const menuAcessibilidade  = document.getElementById('menuAcessibilidade');
    const closeAcessibilidade = document.getElementById('closeAcessibilidade');
    const accessBtns          = document.querySelectorAll('.access-btn');

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
        body.classList.remove(
            'a11y-dark-mode','a11y-high-contrast','a11y-large-text','a11y-small-text',
            'a11y-spacing','a11y-highlight-links','a11y-saturation','a11y-grayscale','a11y-dyslexia'
        );
        if (getA11ySetting('darkMode','false')==='true')       body.classList.add('a11y-dark-mode');
        if (getA11ySetting('highContrast','false')==='true')   body.classList.add('a11y-high-contrast');
        if (getA11ySetting('textSize','normal')==='large')     body.classList.add('a11y-large-text');
        if (getA11ySetting('textSize','normal')==='small')     body.classList.add('a11y-small-text');
        if (getA11ySetting('spacing','false')==='true')        body.classList.add('a11y-spacing');
        if (getA11ySetting('highlightLinks','false')==='true') body.classList.add('a11y-highlight-links');
        if (getA11ySetting('saturation','false')==='true')     body.classList.add('a11y-saturation');
        if (getA11ySetting('grayscale','false')==='true')      body.classList.add('a11y-grayscale');
        if (getA11ySetting('dyslexia','false')==='true')       body.classList.add('a11y-dyslexia');
    }

    function updateButtonStates() {
        accessBtns.forEach(btn => {
            const spanText = btn.querySelector('span').textContent.trim().toLowerCase();
            btn.style.background = ''; btn.style.border = ''; btn.style.color = '';
            const icon = btn.querySelector('i'); if (icon) icon.style.color = '#8b5cf6';
            let isActive = false;
            if (spanText.includes('escurecer')    && getA11ySetting('darkMode','false')==='true')       isActive = true;
            if (spanText.includes('alto')         && getA11ySetting('highContrast','false')==='true')   isActive = true;
            if (spanText.includes('maior')        && getA11ySetting('textSize','normal')==='large')     isActive = true;
            if (spanText.includes('menor')        && getA11ySetting('textSize','normal')==='small')     isActive = true;
            if (spanText.includes('espaçamento')  && getA11ySetting('spacing','false')==='true')        isActive = true;
            if (spanText.includes('links')        && getA11ySetting('highlightLinks','false')==='true') isActive = true;
            if (spanText.includes('saturação')    && getA11ySetting('saturation','false')==='true')     isActive = true;
            if (spanText.includes('dislexia')     && getA11ySetting('dyslexia','false')==='true')       isActive = true;
            if (spanText.includes('reset')        && getA11ySetting('grayscale','false')==='true')      isActive = true;
            if (isActive) {
                btn.style.background = '#8b5cf6';
                btn.style.border     = '2px solid #8b5cf6';
                btn.style.color      = '#ffffff';
                if (icon) icon.style.color = '#ffffff';
            }
        });
    }

    function resetAllSettings() {
        ['darkMode','highContrast','textSize','spacing','highlightLinks','saturation','grayscale','dyslexia']
            .forEach(k => localStorage.removeItem(`a11y_${k}`));
        body.classList.remove(
            'a11y-dark-mode','a11y-high-contrast','a11y-large-text','a11y-small-text',
            'a11y-spacing','a11y-highlight-links','a11y-saturation','a11y-grayscale','a11y-dyslexia'
        );
        accessBtns.forEach(btn => {
            btn.style.background = ''; btn.style.border = ''; btn.style.color = '';
            const icon = btn.querySelector('i'); if (icon) icon.style.color = '#8b5cf6';
        });
    }

    accessBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const spanText = btn.querySelector('span').textContent.trim().toLowerCase();
            if (spanText.includes('reset')) { resetAllSettings(); return; }
            if (spanText.includes('escurecer'))       { const c=getA11ySetting('darkMode','false');       setA11ySetting('darkMode',       c==='true'?'false':'true'); }
            else if (spanText.includes('alto'))       { const c=getA11ySetting('highContrast','false');   setA11ySetting('highContrast',   c==='true'?'false':'true'); }
            else if (spanText.includes('maior'))      { const c=getA11ySetting('textSize','normal');      setA11ySetting('textSize',       c==='large'?'normal':'large'); }
            else if (spanText.includes('menor'))      { const c=getA11ySetting('textSize','normal');      setA11ySetting('textSize',       c==='small'?'normal':'small'); }
            else if (spanText.includes('espaçamento')){ const c=getA11ySetting('spacing','false');        setA11ySetting('spacing',        c==='true'?'false':'true'); }
            else if (spanText.includes('links'))      { const c=getA11ySetting('highlightLinks','false'); setA11ySetting('highlightLinks', c==='true'?'false':'true'); }
            else if (spanText.includes('saturação'))  { const c=getA11ySetting('saturation','false');     setA11ySetting('saturation',     c==='true'?'false':'true'); }
            else if (spanText.includes('dislexia'))   { const c=getA11ySetting('dyslexia','false');       setA11ySetting('dyslexia',       c==='true'?'false':'true'); }
            applyAllA11ySettings(); updateButtonStates();
        });
    });

    applyAllA11ySettings();
    updateButtonStates();

    // ============================================
    // REALTIME — atualiza sozinho
    // ============================================
    if (sb) {
        sb.channel('sac-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'atendimentos' },
                () => {
                    const filtroAtivo = document.querySelector('.status-btn.active')?.getAttribute('data-filter') || 'todos';
                    const deptAtivo   = document.getElementById('deptFilter').value;
                    const busca       = document.getElementById('searchInput').value;
                    renderTabela(filtroAtivo, deptAtivo, busca);
                }
            )
            .subscribe();

        sb.channel('sac-realtime-msgs')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'mensagens' },
                () => {
                    const filtroAtivo = document.querySelector('.status-btn.active')?.getAttribute('data-filter') || 'todos';
                    const deptAtivo   = document.getElementById('deptFilter').value;
                    const busca       = document.getElementById('searchInput').value;
                    renderTabela(filtroAtivo, deptAtivo, busca);
                }
            )
            .subscribe();
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    renderTabela();
    console.log('🚀 SAC + Supabase inicializado (com aprovação)!');
});