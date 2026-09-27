/* ==========================================================================
   PERFIL.JS — Página de Perfil (layout Reddit + Destaques + Moldura)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    const supabase = window.supabaseClient;
    if (!supabase) {
        console.error('❌ Supabase não inicializado!');
        return;
    }

    const AVATAR_PADRAO = '/img/foto-padrão.jpg';

    let currentUser = null;
    let profileUser = null;
    let isOwnProfile = false;
    let currentTab = 'posts';
    let allPosts = [];        // cache dos posts do usuário
    let allSavedPosts = [];   // cache dos posts salvos
    let suggestedProfiles = [];
    const followedUserIds = new Set();

    // =============================================
    // 1. USUÁRIO LOGADO
    // =============================================
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            currentUser = session.user;
            console.log('✅ Usuário logado:', currentUser.email);
        } else {
            console.log('ℹ️ Nenhum usuário logado (modo visitante)');
        }
    } catch (e) {
        console.error('Erro ao verificar sessão:', e);
    }

    // =============================================
    // 2. ID DO PERFIL (via URL ou próprio)
    // =============================================
    const urlParams = new URLSearchParams(window.location.search);
    const profileIdFromUrl = urlParams.get('id');
    const targetUserId = profileIdFromUrl || currentUser?.id;

    if (!targetUserId) {
        showError('Nenhum usuário especificado e você não está logado.');
        return;
    }

    isOwnProfile = currentUser?.id === targetUserId;
    console.log(`👤 Visualizando perfil: ${targetUserId} (próprio: ${isOwnProfile})`);

    // =============================================
    // 3. CARREGAR PERFIL
    // =============================================
    async function loadProfile() {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', targetUserId)
                .maybeSingle();

            if (error) {
                console.error('❌ Erro ao buscar perfil:', error);
            }

            if (!profile) {
                profileUser = {
                    id: targetUserId,
                    username: 'Usuário',
                    avatar_url: null,
                    banner_url: null,
                    bio: 'Sem bio.',
                    location: null,
                    website: null,
                    is_admin: false,
                    is_verified: false,
                    frame: 'none',
                    followers_count: 0,
                    following_count: 0,
                    contribution_count: 0,
                    created_at: new Date().toISOString()
                };
            } else {
                profileUser = {
                    id: profile.id,
                    username: profile.username || 'Usuário',
                    avatar_url: profile.avatar_url || null,
                    banner_url: profile.banner_url || null,
                    bio: profile.bio || 'Sem bio.',
                    location: profile.location || null,
                    website: profile.website || null,
                    is_admin: profile.is_admin || false,
                    is_verified: profile.is_verified || false,
                    frame: profile.frame || 'none',
                    followers_count: profile.followers_count || 0,
                    following_count: profile.following_count || 0,
                    contribution_count: profile.contribution_count || 0,
                    created_at: profile.created_at || new Date().toISOString()
                };
            }

            renderProfile();
            await loadPosts();
            await loadStats();
            await loadSavedPosts();
            renderHighlights();

        } catch (err) {
            console.error('❌ Erro inesperado:', err);
            showError('Erro ao carregar perfil.');
        }
    }

    // =============================================
    // 4. RENDERIZAR PERFIL
    // =============================================
    function renderProfile() {
        const p = profileUser;

        // Título da página
        document.title = `${p.username} — Amor NeuroDivergente`;

        // Banner
        const bannerImg = document.getElementById('bannerImg');
        const bannerPlaceholder = document.getElementById('bannerPlaceholder');
        if (bannerImg && bannerPlaceholder) {
            if (p.banner_url && p.banner_url.trim() !== '') {
                bannerImg.src = p.banner_url;
                bannerImg.style.display = 'block';
                bannerPlaceholder.style.display = 'none';
                bannerImg.onerror = () => {
                    bannerImg.style.display = 'none';
                    bannerPlaceholder.style.display = 'flex';
                };
            } else {
                bannerImg.style.display = 'none';
                bannerPlaceholder.style.display = 'flex';
            }
        }

        // Avatar (com cache-buster para forçar atualização)
        const avatarImg = document.getElementById('profileAvatar');
        const avatarPlaceholder = document.getElementById('avatarPlaceholder');
        if (avatarImg && avatarPlaceholder) {
            if (p.avatar_url && p.avatar_url.trim() !== '') {
                const sep = p.avatar_url.includes('?') ? '&' : '?';
                avatarImg.src = p.avatar_url + sep + 'v=' + Date.now();
                avatarImg.style.display = 'block';
                avatarPlaceholder.style.display = 'none';
                avatarImg.onerror = () => {
                    avatarImg.style.display = 'none';
                    avatarPlaceholder.style.display = 'flex';
                };
            } else {
                avatarImg.style.display = 'none';
                avatarPlaceholder.style.display = 'flex';
            }
        }

        // ✅ Avatar da nav (header)
        const headerAvatar = document.getElementById('headerAvatar');
        if (headerAvatar) {
            if (p.avatar_url && p.avatar_url.trim() !== '') {
                const sep = p.avatar_url.includes('?') ? '&' : '?';
                headerAvatar.src = p.avatar_url + sep + 'v=' + Date.now();
                headerAvatar.onerror = () => { headerAvatar.src = AVATAR_PADRAO; };
            } else {
                headerAvatar.src = AVATAR_PADRAO;
            }
        }

        // Moldura do avatar
        const heroAvatar = document.getElementById('avatarWrapper');
        if (heroAvatar) {
            heroAvatar.dataset.frame = p.frame || 'none';
        }

        // Nome + handle
        const nameEl = document.getElementById('profileName');
        const handleEl = document.getElementById('profileHandle');
        if (nameEl) nameEl.textContent = p.username;
        if (handleEl) handleEl.textContent = '@' + (p.username || '').toLowerCase();

        // Badges
        const verifiedEl = document.getElementById('verifiedBadge');
        const adminEl = document.getElementById('adminBadge');
        if (verifiedEl) verifiedEl.style.display = p.is_verified ? 'inline-flex' : 'none';
        if (adminEl) adminEl.style.display = p.is_admin ? 'inline-flex' : 'none';

        // Bio
        const bioEl = document.getElementById('profileBio');
        if (bioEl) bioEl.textContent = p.bio || 'Sem bio.';

        // Localização
        const locEl = document.getElementById('profileLocation');
        if (locEl) {
            if (p.location && p.location.trim() !== '') {
                locEl.style.display = 'inline-flex';
                const span = locEl.querySelector('span');
                if (span) span.textContent = p.location;
            } else {
                locEl.style.display = 'none';
            }
        }

        // Link
        const linkEl = document.getElementById('profileLink');
        if (linkEl) {
            if (p.website && p.website.trim() !== '') {
                linkEl.style.display = 'inline-flex';
                const a = linkEl.querySelector('a');
                if (a) {
                    a.href = p.website.startsWith('http') ? p.website : 'https://' + p.website;
                    a.textContent = p.website.replace(/^https?:\/\//, '');
                }
            } else {
                linkEl.style.display = 'none';
            }
        }

        // Data de entrada
        const joinEl = document.getElementById('profileJoinDate');
        if (joinEl) {
            const joinDate = new Date(p.created_at);
            joinEl.innerHTML = `<i class="fa-regular fa-calendar"></i> Entrou em ${joinDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`;
        }

        // Estatísticas
        setText('statFollowers', formatNumber(p.followers_count));
        setText('statFollowing', formatNumber(p.following_count));
        setText('statContrib', formatNumber(p.contribution_count));

        // Botão de editar só no próprio perfil
        const editBtn = document.getElementById('openEditBtn');
        if (editBtn) {
            editBtn.style.display = isOwnProfile ? 'flex' : 'none';
        }
    }

    // =============================================
    // 5. CARREGAR POSTS DO USUÁRIO
    // =============================================
    async function loadPosts() {
        const container = document.getElementById('profileContent');
        if (!container) return;

        try {
            const { data: posts, error } = await supabase
                .from('posts')
                .select('*')
                .eq('author_id', targetUserId)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Erro ao buscar posts:', error);
                container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>Erro ao carregar posts</p></div>`;
                return;
            }

            allPosts = posts || [];
            renderCurrentTab();

        } catch (err) {
            console.error('❌ Erro inesperado:', err);
            container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>Erro ao carregar posts</p></div>`;
        }
    }

  async function loadSavedPosts() {
    console.log('🔍 [loadSavedPosts] Buscando salvos de:', targetUserId);

    try {
        // 1. Buscar os IDs dos posts salvos
        const { data: saved, error: savedErr } = await supabase
            .from('saved_posts')
            .select('post_id, created_at')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (savedErr) {
            console.warn('⚠️ [loadSavedPosts] Erro em saved_posts:', savedErr);
            console.warn('   Código:', savedErr.code, '| Mensagem:', savedErr.message);
            console.warn('   → Se for "relation does not exist", crie a tabela saved_posts.');
            console.warn('   → Se for "permission denied", ajuste as políticas RLS.');
            allSavedPosts = [];
            return;
        }

        console.log('📦 [loadSavedPosts] Registros encontrados:', saved?.length || 0);

        if (!saved || saved.length === 0) {
            console.log('ℹ️ Nenhum post salvo por este usuário.');
            allSavedPosts = [];
            return;
        }

        const postIds = saved.map(s => s.post_id).filter(Boolean);
        console.log('🔑 [loadSavedPosts] IDs dos posts salvos:', postIds);

        // 2. Buscar os posts completos
        const { data: posts, error: postsErr } = await supabase
            .from('posts')
            .select('*')
            .in('id', postIds)
            .eq('is_active', true);

        if (postsErr) {
            console.warn('⚠️ [loadSavedPosts] Erro ao buscar posts:', postsErr);
            allSavedPosts = [];
            return;
        }

        console.log('📄 [loadSavedPosts] Posts carregados:', posts?.length || 0);

        // 3. Reordenar conforme a ordem dos saved
        const postsMap = new Map((posts || []).map(p => [p.id, p]));
        allSavedPosts = postIds
            .map(id => postsMap.get(id))
            .filter(Boolean);

        console.log(`⭐ [loadSavedPosts] ${allSavedPosts.length} posts salvos prontos`);
    } catch (e) {
        console.warn('❌ [loadSavedPosts] Exceção:', e);
        allSavedPosts = [];
    }
}
       // =============================================
    // 5.2. RENDERIZAR DESTAQUES DA COMUNIDADE
    // =============================================
    function renderHighlights() {
        const scroll = document.getElementById('highlightsScroll');
        if (!scroll) return;

        if (!allSavedPosts || allSavedPosts.length === 0) {
            scroll.innerHTML = `<div class="highlights-empty">Nenhum destaque ainda — salve posts no fórum para vê-los aqui.</div>`;
            return;
        }

        scroll.innerHTML = allSavedPosts.map(post => {
            const thumbUrl = post.image_url ? getSafeImageUrl(post.image_url) : null;
            const content = post.content || '';
            const title = content.substring(0, 80) + (content.length > 80 ? '…' : '');
            const avatar = getSafeImageUrl(post.author_avatar || profileUser.avatar_url);
            const authorName = post.author_name || profileUser.username;

            return `
                <a class="highlight-card" data-post-id="${escapeHtml(post.id)}" href="/comunidade/post.html?id=${encodeURIComponent(post.id)}">
                    <div class="highlight-card-thumb">
                        ${thumbUrl
                            ? `<img src="${escapeHtml(thumbUrl)}" alt="" onerror="this.style.display='none';this.parentElement.innerHTML='<div class=&quot;highlight-card-thumb-placeholder&quot;><i class=&quot;fa-regular fa-image&quot;></i></div>';">`
                            : `<div class="highlight-card-thumb-placeholder"><i class="fa-regular fa-image"></i></div>`}
                    </div>
                    <div class="highlight-card-body">
                        <div class="highlight-card-title">${escapeHtml(title)}</div>
                        <div class="highlight-card-footer">
                            <img class="highlight-card-avatar" src="${avatar}" alt="" onerror="this.src='${AVATAR_PADRAO}'">
                            <span>@${escapeHtml((authorName || '').toLowerCase())}</span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');
    }

    // Abrir o post clicado no fórum
    window.openHighlight = function(postId) {
        window.location.href = `/comunidade/post.html?id=${encodeURIComponent(postId)}`;
    };

    // =============================================
    // 6. RENDERIZAR ABA ATUAL
    // =============================================
    function renderCurrentTab() {
        const container = document.getElementById('profileContent');
        if (!container) return;

        let filtered = allPosts;

        if (currentTab === 'midia') {
            filtered = allPosts.filter(p =>
                (p.image_url && p.image_url.trim()) ||
                (p.video_url && p.video_url.trim())
            );
        } else if (currentTab === 'salvos') {
            filtered = allSavedPosts;
        } else if (currentTab === 'respostas') {
            filtered = [];
        } else if (currentTab === 'curtidas') {
            filtered = [];
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-feather"></i>
                    <p>Nada por aqui ainda</p>
                    <small>${emptyMessageForTab(currentTab)}</small>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(post => renderPostCard(post)).join('');
    }

    function emptyMessageForTab(tab) {
        switch (tab) {
            case 'posts': return 'Quando este usuário postar, aparecerá aqui.';
            case 'respostas': return 'Nenhuma resposta ainda.';
            case 'midia': return 'Nenhuma mídia publicada ainda.';
            case 'curtidas': return 'Nenhuma curtida ainda.';
            case 'salvos': return 'Nenhum post salvo ainda — salve no fórum para vê-los aqui.';
            default: return '';
        }
    }

    // =============================================
    // 7. CARD DE POST
    // =============================================
    function renderPostCard(post) {
        const avatarUrl = getSafeImageUrl(post.author_avatar || profileUser.avatar_url);
        const authorName = post.author_name || profileUser.username;
        const authorHandle = (post.author_name || profileUser.username || '').toLowerCase();
        const postUrl = `/comunidade/post.html?id=${encodeURIComponent(post.id)}`;

        const imageUrl = post.image_url ? getSafeImageUrl(post.image_url) : null;
        const videoUrl = post.video_url ? getSafeImageUrl(post.video_url) : null;
        let mediaHtml = '';
        if (imageUrl) {
            mediaHtml = `<div class="user-post-image"><img src="${escapeHtml(imageUrl)}" alt="Imagem" onerror="this.style.display='none'"></div>`;
        } else if (videoUrl) {
            mediaHtml = `<div class="user-post-image"><video controls preload="metadata" style="width:100%;display:block;"><source src="${escapeHtml(videoUrl)}" type="video/mp4"></video></div>`;
        }

        return `
            <article class="user-post" data-post-id="${escapeHtml(post.id)}">
                <div class="user-post-header">
                    <img class="user-post-avatar" src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(authorName)}"
                         onerror="this.src='${AVATAR_PADRAO}'">
                    <div class="user-post-info">
                        <span class="user-post-name">${escapeHtml(authorName)}</span>
                        <span class="user-post-handle">@${escapeHtml(authorHandle)}</span>
                        <span class="user-post-date">· ${formatDate(post.created_at)}</span>
                    </div>
                </div>
                <a class="user-post-text user-post-open-link" href="${postUrl}">${escapeHtml(post.content || 'Abrir publicação')}</a>
                ${mediaHtml}
                <div class="user-post-actions">
                    <span><i class="fa-regular fa-heart"></i> ${post.likes || 0}</span>
                    <a href="${postUrl}#conversationSection"><i class="fa-regular fa-comment"></i> ${post.comment_count || 0}</a>
                    <span aria-label="Repassar em breve, 0 repostagens"><i class="fa-solid fa-retweet"></i> 0</span>
                    <a href="${postUrl}" aria-label="Abrir publicação"><i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir</a>
                </div>
            </article>
        `;
    }

    // =============================================
    // 8. ESTATÍSTICAS
    // =============================================
    async function loadStats() {
        try {
            const { count: postsCount } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('author_id', targetUserId)
                .eq('is_active', true);

            const { count: commentsCount } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('author_id', targetUserId)
                .eq('is_active', true);

            const total = (postsCount || 0) + (commentsCount || 0);
            setText('statContrib', formatNumber(total));
        } catch (e) {
            console.warn('Erro ao carregar stats:', e);
        }
    }

    // =============================================
    // 8.1. QUEM SEGUIR / ENCONTRAR MAIS PESSOAS
    //
    // O card mostra 3 suggestions. O botao "Encontrar mais pessoas"
    // expande a lista completa, com busca, as tres acoes (seguir,
    // adicionar, conversar) e o estado de cada relacao.
    //
    // A lista vem de discover_people (sql/16), que ja ordena por
    // relevancia: grupos em comum, seguidores em comum, quem te segue.
    // Sem essa RPC o app continua funcionando no modo antigo, sem
    // o painel, e avisa o que falta rodar.
    // =============================================
    const PAGINA_PESSOAS = 12;
    const PREVIA_PESSOAS = 3;

    let pessoas = [];            // lista completa em memoria
    let totalPessoas = 0;
    let paginaPessoas = 0;       // quantas paginas ja vieram
    let painelAberto = false;
    let buscaPessoas = '';
    let timerBusca = null;
    let semDiscoverRpc = false;

    // O mesmo aviso de "Rode sql/XX" que o chat usa.
    function isMissingRpcError(error) {
        return /does not exist|not found|schema cache|failed to parse/i.test(String(error?.message || ''));
    }

    function normalizarPessoa(row) {
        return {
            id: row.id,
            username: cleanUsername(row.username) || 'Sem nome',
            full_name: row.full_name || '',
            pronouns: row.pronouns || '',
            bio: row.bio || '',
            location: row.location || '',
            avatar_url: getSafeImageUrl(row.avatar_url),
            is_verified: Boolean(row.is_verified),
            followers_count: Number(row.followers_count) || 0,
            following_count: Number(row.following_count) || 0,
            posts_count: Number(row.posts_count) || 0,
            is_following: Boolean(row.is_following),
            is_followed_by: Boolean(row.is_followed_by),
            friendship_status: row.friendship_status || null,
            is_requester: Boolean(row.is_requester),
            mutual_count: Number(row.mutual_count) || 0,
            shared_groups_count: Number(row.shared_groups_count) || 0
        };
    }

    // =============================================
    // 8.1.1 CARREGAR
    // =============================================
    // O botão "Carregar mais" volta ao estado normal em todo caminho de
    // saída. Sem isso, uma saída antecipada deixa ele preso em
    // "Carregando..." para sempre, sem nenhuma tecla para destravar.
    function resetarBotaoMais(texto = 'Carregar mais') {
        const mais = document.getElementById('suggestedProfilesLoadMore');
        if (!mais) return;
        mais.disabled = false;
        mais.textContent = texto;
    }

    async function buscarPessoas({ reiniciar = false } = {}) {
        if (!currentUser || semDiscoverRpc) {
            resetarBotaoMais();
            return;
        }

        if (reiniciar) {
            paginaPessoas = 0;
            pessoas = [];
        }

        const lista = document.getElementById('suggestedProfilesFullList');
        const mais = document.getElementById('suggestedProfilesLoadMore');
        if (mais) {
            mais.disabled = true;
            mais.textContent = 'Carregando...';
        }

        const { data, error } = await supabase.rpc('discover_people', {
            p_limit: PAGINA_PESSOAS,
            p_offset: paginaPessoas * PAGINA_PESSOAS,
            p_query: buscaPessoas || null
        });

        if (error) {
            if (isMissingRpcError(error)) {
                // Quem decide o que mostrar e quem chamou: o card inicial
                // cai na previa antiga, o painel so avisa.
                semDiscoverRpc = true;
                resetarBotaoMais();
                return;
            }
            console.warn('⚠️ Erro ao buscar pessoas:', error);
            resetarBotaoMais();
            showToast('Não foi possível buscar pessoas agora.', 'error');
            return;
        }

        const linhas = Array.isArray(data) ? data : [];
        paginaPessoas += 1;
        if (linhas.length) {
            totalPessoas = Number(linhas[0].total_count) || totalPessoas;
            const conhecidas = new Set(pessoas.map(p => p.id));
            linhas.forEach(row => {
                const pessoa = normalizarPessoa(row);
                if (conhecidas.has(pessoa.id)) return;
                conhecidas.add(pessoa.id);
                pessoas.push(pessoa);
            });
        }

        renderizarPessoas();
        if (lista) lista.setAttribute('aria-busy', 'false');
    }

    function mostrarAvisoDiscover() {
        const note = document.getElementById('suggestedProfilesNote');
        const painel = document.getElementById('suggestedProfilesPanel');
        if (painel) painel.hidden = true;
        if (!note) return;
        note.hidden = false;
        note.textContent = 'A lista completa precisa de sql/16_descobrir_pessoas.sql no Supabase.';
    }

    // =============================================
    // 8.1.2 RENDER
    // =============================================
    function renderSuggestedProfiles() {
        const list = document.getElementById('suggestedProfilesList');
        if (!list) return;

        // A previa mostra quem ainda dá para seguir ou adicionar. Se todo
        // mundo da previa ja esta conectado, completa com os proximos da
        // lista para o card nunca ficar vazio sem motivo.
        const conectaveis = pessoas.filter(p => !p.is_following && p.friendship_status !== 'accepted');
        const previa = (conectaveis.length ? conectaveis : pessoas).slice(0, PREVIA_PESSOAS);

        suggestedProfiles = previa;

        if (!previa.length) {
            const card = document.getElementById('suggestedProfilesCard');
            if (card) card.hidden = true;
            list.replaceChildren();
            return;
        }

        const fragment = document.createDocumentFragment();
        previa.forEach(pessoa => fragment.appendChild(criarItemPessoa(pessoa, { compacto: true })));
        list.replaceChildren(fragment);
    }

    function renderizarPessoas() {
        renderSuggestedProfiles();
        if (!painelAberto) return;

        const list = document.getElementById('suggestedProfilesFullList');
        const vazio = document.getElementById('suggestedProfilesEmpty');
        const resumo = document.getElementById('suggestedProfilesSummary');
        const mais = document.getElementById('suggestedProfilesLoadMore');

        if (resumo) {
            const total = pessoas.length;
            resumo.textContent = buscaPessoas
                ? `${total} resultado${total === 1 ? '' : 's'} para "${buscaPessoas}"`
                : (totalPessoas > total
                    ? `Mostrando ${total} de ${totalPessoas} pessoas`
                    : `${totalPessoas || total} pessoa${(totalPessoas || total) === 1 ? '' : 's'} na comunidade`);
        }

        if (vazio) vazio.hidden = pessoas.length > 0;

        if (list) {
            const fragment = document.createDocumentFragment();
            pessoas.forEach(pessoa => fragment.appendChild(criarItemPessoa(pessoa, { compacto: false })));
            list.replaceChildren(fragment);
        }

        if (mais) {
            const falta = pessoas.length < totalPessoas;
            mais.hidden = !falta;
            mais.disabled = false;
            mais.textContent = `Carregar mais (${Math.max(0, totalPessoas - pessoas.length)} restantes)`;
        }
    }

    // Uma linha da lista. No modo compacto (previa) some a segunda linha
    // de contexto e o botao de conversar, para o card nao virar uma parede.
    function criarItemPessoa(pessoa, { compacto }) {
        const item = document.createElement('li');
        item.className = compacto ? 'suggested-profile-item' : 'suggested-profile-item suggested-profile-item-full';
        item.dataset.userId = pessoa.id;

        const link = document.createElement('a');
        link.className = 'suggested-profile-link';
        link.href = `/comunidade/perfil.html?id=${encodeURIComponent(pessoa.id)}`;
        link.setAttribute('aria-label', `Ver perfil de ${pessoa.username}`);

        const avatar = document.createElement('img');
        avatar.className = 'suggested-profile-avatar';
        avatar.src = pessoa.avatar_url || AVATAR_PADRAO;
        avatar.alt = '';
        avatar.loading = 'lazy';
        avatar.decoding = 'async';
        avatar.addEventListener('error', () => { avatar.src = AVATAR_PADRAO; }, { once: true });

        const info = document.createElement('span');
        info.className = 'suggested-profile-info';

        const nome = document.createElement('span');
        nome.className = 'suggested-profile-name';
        nome.textContent = pessoa.full_name || pessoa.username;

        const handle = document.createElement('span');
        handle.className = 'suggested-profile-handle';
        handle.textContent = `@${pessoa.username.toLowerCase()}`;

        info.append(nome, handle);

        if (!compacto) {
            const motivo = motivoDeConexao(pessoa);
            if (motivo) {
                const dica = document.createElement('span');
                dica.className = 'suggested-profile-motivo';
                dica.textContent = motivo;
                info.append(dica);
            }

            if (pessoa.bio) {
                const bio = document.createElement('span');
                bio.className = 'suggested-profile-bio';
                bio.textContent = pessoa.bio;
                info.append(bio);
            }
        }

        link.append(avatar, info);

        const acoes = document.createElement('div');
        acoes.className = 'suggested-profile-actions';

        const seguir = document.createElement('button');
        seguir.type = 'button';
        seguir.className = 'suggestion-follow-button';
        seguir.dataset.acao = 'seguir';
        seguir.dataset.userId = pessoa.id;
        atualizarBotaoSeguir(seguir, pessoa);

        acoes.append(seguir);

        if (!compacto) {
            const adicionar = document.createElement('button');
            adicionar.type = 'button';
            adicionar.className = 'suggestion-friend-button';
            adicionar.dataset.acao = 'amizade';
            adicionar.dataset.userId = pessoa.id;
            atualizarBotaoAmizade(adicionar, pessoa);
            acoes.append(adicionar);

            const conversar = document.createElement('a');
            conversar.className = 'suggestion-chat-button';
            conversar.href = `/comunidade/conversas.html?friend=${encodeURIComponent(pessoa.id)}&name=${encodeURIComponent(pessoa.username)}`;
            conversar.setAttribute('aria-label', `Conversar com ${pessoa.username}`);
            conversar.title = 'Conversar';
            conversar.innerHTML = '<i class="fa-regular fa-comment-dots" aria-hidden="true"></i>';
            acoes.append(conversar);
        }

        item.append(link, acoes);
        return item;
    }

    // O que a pessoa tem em comum com voce. Serve para a lista fazer
    // sentido: "3 grupos em comum" explica por que ela apareceu.
    function motivoDeConexao(pessoa) {
        const partes = [];
        if (pessoa.shared_groups_count > 0) {
            const n = pessoa.shared_groups_count;
            partes.push(`${n} grupo${n === 1 ? '' : 's'} em comum`);
        }
        if (pessoa.mutual_count > 0) {
            const n = pessoa.mutual_count;
            // "conexão" no plural vira "conexões": o acento cai no o.
            partes.push(`${n} conex${n === 1 ? 'ão' : 'ões'} em comum`);
        }
        if (pessoa.is_followed_by) partes.push('segue você');
        if (!partes.length) {
            if (pessoa.posts_count > 0) partes.push(`${pessoa.posts_count} publicaç${pessoa.posts_count === 1 ? 'ão' : 'ões'}`);
            else partes.push('da comunidade');
        }
        return partes.join(' · ');
    }

    // =============================================
    // 8.1.3 AÇÕES
    // =============================================
    function atualizarBotaoSeguir(botao, pessoa, ocupado = false) {
        const seguindo = pessoa.is_following;
        botao.disabled = ocupado;
        botao.classList.toggle('is-following', seguindo);
        botao.setAttribute('aria-pressed', String(seguindo));
        botao.setAttribute('aria-label', `${seguindo ? 'Deixar de seguir' : 'Seguir'} ${pessoa.username}`);
        botao.title = seguindo ? 'Deixar de seguir' : 'Seguir';
        botao.textContent = ocupado ? '...' : (seguindo ? 'Seguindo' : 'Seguir');
    }

    function atualizarBotaoAmizade(botao, pessoa, ocupado = false) {
        const status = pessoa.friendship_status;
        // 'pending' sem is_requester significa que o PEDIDO VEIO DA OUTRA
        // PESSOA. Nao ha como responder daqui: o botao desliga e manda
        // para o perfil, onde a solicitacao aparece.
        const veioDeles = status === 'pending' && !pessoa.is_requester;
        botao.disabled = ocupado || status === 'accepted' || status === 'blocked' || veioDeles;
        botao.classList.toggle('is-pending', status === 'pending');
        botao.classList.toggle('is-friends', status === 'accepted');
        botao.classList.toggle('is-incoming', veioDeles);

        let rotulo = 'Adicionar';
        if (status === 'accepted') rotulo = 'Amigos';
        else if (status === 'pending') rotulo = veioDeles ? 'Te pediu' : 'Solicitado';
        else if (status === 'blocked') rotulo = 'Indisponível';

        botao.setAttribute('aria-label', `${rotulo}: ${pessoa.username}`);
        botao.title = veioDeles
            ? 'Esta pessoa enviou um pedido de amizade. Abra o perfil para aceitar ou recusar.'
            : rotulo;
        botao.textContent = ocupado ? '...' : rotulo;
    }

    function acharPessoa(userId) {
        return pessoas.find(p => p.id === userId)
            || suggestedProfiles.find(p => p.id === userId)
            || null;
    }

    // Redesenha so a linha de quem agiu: a lista inteira nao precisa
    // recarregar, e recarregar perderia o foco do botao.
    function atualizarLinha(userId) {
        const pessoa = acharPessoa(userId);
        if (!pessoa) return;
        document.querySelectorAll(`[data-user-id="${CSS.escape(userId)}"]`).forEach(node => {
            if (!node.dataset || !node.dataset.userId) return;
            const item = node.closest('.suggested-profile-item');
            if (!item) return;
            const seguir = item.querySelector('[data-acao="seguir"]');
            const amizade = item.querySelector('[data-acao="amizade"]');
            if (seguir) atualizarBotaoSeguir(seguir, pessoa);
            if (amizade) atualizarBotaoAmizade(amizade, pessoa);
        });
    }

    async function alternarSeguir(userId, botao) {
        if (!currentUser || !isValidUuid(userId) || userId === currentUser.id) return;
        const pessoa = acharPessoa(userId);
        if (!pessoa || botao.disabled) return;

        const estavaSeguindo = pessoa.is_following;
        const vaiSeguir = !estavaSeguindo;
        atualizarBotaoSeguir(botao, pessoa, true);

        const pedido = vaiSeguir
            ? supabase.from('follows').insert({ follower_id: currentUser.id, followed_id: userId })
            : supabase.from('follows').delete()
                .eq('follower_id', currentUser.id)
                .eq('followed_id', userId);

        const { error } = await pedido;
        if (error) {
            console.error('❌ Erro ao atualizar seguimento:', error);
            atualizarBotaoSeguir(botao, pessoa);
            showToast('Não foi possível atualizar o seguimento. Tente novamente.', 'error');
            return;
        }

        pessoa.is_following = vaiSeguir;
        if (vaiSeguir) followedUserIds.add(userId); else followedUserIds.delete(userId);

        atualizarBotaoSeguir(botao, pessoa);
        atualizarLinha(userId);
        atualizarEstatisticasPerfil(userId, vaiSeguir);
        showToast(
            vaiSeguir ? `Agora você segue @${pessoa.username}` : `Você deixou de seguir @${pessoa.username}`,
            'success'
        );
    }

    async function pedirAmizade(userId, botao) {
        if (!currentUser || !isValidUuid(userId) || userId === currentUser.id) return;
        const pessoa = acharPessoa(userId);
        if (!pessoa || botao.disabled) return;

        atualizarBotaoAmizade(botao, pessoa, true);

        const { data, error } = await supabase.rpc('send_friend_request', { p_receiver_id: userId });

        if (error || data?.success === false) {
            const msg = data?.error || error?.message || 'Não foi possível enviar o pedido de amizade.';
            console.warn('⚠️ Pedido de amizade não enviado:', msg);
            atualizarBotaoAmizade(botao, pessoa);
            showToast(msg, 'error', 5000);
            return;
        }

        pessoa.friendship_status = 'pending';
        pessoa.is_requester = true;
        atualizarBotaoAmizade(botao, pessoa);
        atualizarLinha(userId);
        showToast(`Pedido de amizade enviado para @${pessoa.username}.`, 'success');
    }

    function atualizarEstatisticasPerfil(userId, isFollowing) {
        if (!profileUser) return;

        const delta = isFollowing ? 1 : -1;
        if (isOwnProfile) {
            profileUser.following_count = Math.max(0, (Number(profileUser.following_count) || 0) + delta);
            setText('statFollowing', formatNumber(profileUser.following_count));
        } else if (profileUser.id === userId) {
            profileUser.followers_count = Math.max(0, (Number(profileUser.followers_count) || 0) + delta);
            setText('statFollowers', formatNumber(profileUser.followers_count));
        }
    }

    // =============================================
    // 8.1.4 EXPANDIR / RECOLHER
    // =============================================
    function aplicarEstadoPainel() {
        const painel = document.getElementById('suggestedProfilesPanel');
        const botao = document.getElementById('suggestedProfilesMore');
        const rotulo = document.getElementById('suggestedProfilesMoreLabel');
        const card = document.getElementById('suggestedProfilesCard');

        if (painel) painel.hidden = !painelAberto;
        if (botao) botao.setAttribute('aria-expanded', String(painelAberto));
        if (card) card.classList.toggle('is-expanded', painelAberto);

        if (rotulo) {
            const total = totalPessoas || pessoas.length;
            rotulo.textContent = painelAberto
                ? 'Mostrar menos'
                : (total > suggestedProfiles.length
                    ? `Encontrar mais pessoas (${Math.max(0, total - suggestedProfiles.length)})`
                    : 'Encontrar mais pessoas');
        }
    }

    async function alternarPainel() {
        if (semDiscoverRpc) {
            mostrarAvisoDiscover();
            return;
        }
        painelAberto = !painelAberto;
        aplicarEstadoPainel();
        if (!painelAberto) return;

        // A primeira pagina ja veio no carregamento do card, entao aqui
        // normalmente so falta desenhar. So busca de novo se estiver vazio.
        if (pessoas.length) {
            renderizarPessoas();
            return;
        }

        const list = document.getElementById('suggestedProfilesFullList');
        if (list) list.setAttribute('aria-busy', 'true');
        await buscarPessoas({ reiniciar: true });
    }

    function agendarBusca() {
        if (timerBusca) clearTimeout(timerBusca);
        timerBusca = setTimeout(async () => {
            await buscarPessoas({ reiniciar: true });
        }, 280);
    }

    // Um delegador so para as duas listas: os botoes nascem e morrem a
    // cada render, e listener em cada botao vazaria.
    function registrarAcoesPessoas(container) {
        if (!container) return;
        container.addEventListener('click', event => {
            const alvo = event.target instanceof Element ? event.target : null;
            if (!alvo) return;
            const botao = alvo.closest('[data-acao]');
            if (!botao || !container.contains(botao)) return;
            event.preventDefault();
            const userId = botao.dataset.userId;
            if (botao.dataset.acao === 'seguir') alternarSeguir(userId, botao);
            else if (botao.dataset.acao === 'amizade') pedirAmizade(userId, botao);
        });
    }

    // =============================================
    // 8.1.5 LISTAGEM ANTES (o card abre, a lista espera pelo clique)
    // =============================================
    async function loadFollowSuggestions() {
        const card = document.getElementById('suggestedProfilesCard');
        const list = document.getElementById('suggestedProfilesList');
        if (!currentUser || !card || !list) return;

        registrarAcoesPessoas(list);
        registrarAcoesPessoas(document.getElementById('suggestedProfilesFullList'));

        const botaoMais = document.getElementById('suggestedProfilesMore');
        if (botaoMais && !botaoMais.dataset.ligado) {
            botaoMais.dataset.ligado = '1';
            botaoMais.addEventListener('click', alternarPainel);
        }

        const busca = document.getElementById('suggestedProfilesSearch');
        if (busca && !busca.dataset.ligado) {
            busca.dataset.ligado = '1';
            busca.addEventListener('input', event => {
                buscaPessoas = String(event.target.value || '').trim();
                agendarBusca();
            });
        }

        const mais = document.getElementById('suggestedProfilesLoadMore');
        if (mais && !mais.dataset.ligado) {
            mais.dataset.ligado = '1';
            mais.addEventListener('click', () => buscarPessoas());
        }

        card.removeAttribute('hidden');
        card.setAttribute('aria-busy', 'true');

        try {
            await buscarPessoas({ reiniciar: true });

            if (semDiscoverRpc) {
                await carregarPreviaLegada();
                return;
            }

            if (!pessoas.length) {
                card.hidden = true;
                return;
            }
            aplicarEstadoPainel();
        } catch (err) {
            console.warn('⚠️ Erro ao carregar sugestões de perfis:', err);
            card.hidden = true;
            list.replaceChildren();
        } finally {
            card.setAttribute('aria-busy', 'false');
        }
    }

    // Sem a discover_people (ainda nao rodou o sql/16), mantem o
    // comportamento antigo: 3 perfis novos com so botao de Seguir.
    async function carregarPreviaLegada() {
        const list = document.getElementById('suggestedProfilesList');
        const aviso = document.getElementById('suggestedProfilesNote');
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .order('created_at', { ascending: false })
                .limit(24);
            if (error) throw error;

            pessoas = (data || [])
                .filter(p => p && isValidUuid(p.id) && p.id !== currentUser.id)
                .map(p => normalizarPessoa({ ...p, is_following: false }));

            if (aviso) {
                aviso.hidden = false;
                aviso.textContent = 'Rode sql/16_descobrir_pessoas.sql para ver todas as pessoas, com busca e pedido de amizade.';
            }
            const botaoMais = document.getElementById('suggestedProfilesMore');
            if (botaoMais) botaoMais.hidden = true;

            renderSuggestedProfiles();
        } catch (err) {
            console.warn('⚠️ Erro ao carregar Suggestions legadas:', err);
            const card = document.getElementById('suggestedProfilesCard');
            if (card) card.hidden = true;
            if (list) list.replaceChildren();
        }
    }

    // =============================================
    // 9. ABAS INTERNAS
    // =============================================
    document.querySelectorAll('.profile-inner-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.profile-inner-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.dataset.tab || 'posts';
            renderCurrentTab();
        });
    });

    // =============================================
    // 10. MODAL DE EDIÇÃO
    // =============================================
    const editOverlay = document.getElementById('editOverlay');
    const openEditBtn = document.getElementById('openEditBtn');
    const closeEditBtn = document.getElementById('closeEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveEditBtn = document.getElementById('saveEditBtn');

    let pendingBannerFile = null;
    let pendingAvatarFile = null;

    openEditBtn?.addEventListener('click', () => {
        if (!isOwnProfile) return;
        populateEditForm();
        editOverlay?.removeAttribute('hidden');
    });

    closeEditBtn?.addEventListener('click', () => editOverlay?.setAttribute('hidden', ''));
    cancelEditBtn?.addEventListener('click', () => editOverlay?.setAttribute('hidden', ''));
    editOverlay?.addEventListener('click', (e) => {
        if (e.target === editOverlay) editOverlay.setAttribute('hidden', '');
    });

    function populateEditForm() {
        const p = profileUser;
        setValue('editName', p.username || '');
        setValue('editUsername', p.username || '');
        setValue('editBio', p.bio || '');
        setValue('editLocation', p.location || '');
        setValue('editLink', p.website || '');

        updateBioCounter();

        // Banner preview
        const bannerImg = document.getElementById('editBannerImg');
        const bannerPh = document.getElementById('editBannerPlaceholder');
        if (bannerImg && bannerPh) {
            if (p.banner_url) {
                bannerImg.src = p.banner_url;
                bannerImg.style.display = 'block';
                bannerPh.style.display = 'none';
            } else {
                bannerImg.style.display = 'none';
                bannerPh.style.display = 'flex';
            }
        }

        // Avatar preview
        const avatarImg = document.getElementById('editAvatarImg');
        const avatarPh = document.getElementById('editAvatarPlaceholder');
        if (avatarImg && avatarPh) {
            if (p.avatar_url) {
                avatarImg.src = p.avatar_url;
                avatarImg.style.display = 'block';
                avatarPh.style.display = 'none';
            } else {
                avatarImg.style.display = 'none';
                avatarPh.style.display = 'flex';
            }
        }

        // Frame preview
        const frame = p.frame || 'none';
        const frameInput = document.getElementById('editFrame');
        if (frameInput) frameInput.value = frame;
        document.querySelectorAll('.frame-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.frame === frame);
        });
        const avatarPreview = document.getElementById('editAvatarPreview');
        if (avatarPreview) avatarPreview.dataset.frame = frame;

        pendingBannerFile = null;
        pendingAvatarFile = null;
    }

    // Contador de bio
    document.getElementById('editBio')?.addEventListener('input', updateBioCounter);
    function updateBioCounter() {
        const bioInput = document.getElementById('editBio');
        const counter = document.getElementById('bioCounter');
        if (bioInput && counter) {
            counter.textContent = (bioInput.value || '').length;
        }
    }

    // Upload banner
    document.getElementById('editBannerPreview')?.addEventListener('click', () => {
        document.getElementById('editBannerInput')?.click();
    });

    document.getElementById('editBannerInput')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        pendingBannerFile = file;

        const url = URL.createObjectURL(file);
        const bannerImg = document.getElementById('editBannerImg');
        const bannerPh = document.getElementById('editBannerPlaceholder');
        if (bannerImg && bannerPh) {
            bannerImg.src = url;
            bannerImg.style.display = 'block';
            bannerPh.style.display = 'none';
        }
    });

    // Upload avatar
    document.getElementById('editAvatarPreview')?.addEventListener('click', () => {
        document.getElementById('editAvatarInput')?.click();
    });

    document.getElementById('editAvatarInput')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        pendingAvatarFile = file;

        const url = URL.createObjectURL(file);
        const avatarImg = document.getElementById('editAvatarImg');
        const avatarPh = document.getElementById('editAvatarPlaceholder');
        if (avatarImg && avatarPh) {
            avatarImg.src = url;
            avatarImg.style.display = 'block';
            avatarPh.style.display = 'none';
        }
    });

    // ✅ Picker de moldura
    document.querySelectorAll('.frame-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.frame-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            const frame = opt.dataset.frame;
            const frameInput = document.getElementById('editFrame');
            if (frameInput) frameInput.value = frame;
            const avatarPreview = document.getElementById('editAvatarPreview');
            if (avatarPreview) avatarPreview.dataset.frame = frame;
            const heroAvatar = document.getElementById('avatarWrapper');
            if (heroAvatar) heroAvatar.dataset.frame = frame;
        });
    });

    // =============================================
    // 11. SALVAR EDIÇÕES
    // =============================================
    saveEditBtn?.addEventListener('click', async () => {
        saveEditBtn.disabled = true;
        saveEditBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

        try {
            const name = document.getElementById('editName')?.value.trim() || '';
            const bio = document.getElementById('editBio')?.value.trim() || '';
            const location = document.getElementById('editLocation')?.value.trim() || '';
            const website = document.getElementById('editLink')?.value.trim() || '';
            const frame = document.getElementById('editFrame')?.value || 'none';

            if (!name) {
                showToast('O nome não pode ficar vazio.', 'error');
                saveEditBtn.disabled = false;
                saveEditBtn.innerHTML = '<i class="fa-solid fa-check"></i> Salvar';
                return;
            }

            // Upload banner
            let bannerUrl = profileUser.banner_url;
            if (pendingBannerFile) {
                const fileExt = pendingBannerFile.name.split('.').pop();
                const fileName = `${currentUser.id}/banner-${Date.now()}.${fileExt}`;
                const { error: upErr } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, pendingBannerFile, { upsert: true, cacheControl: '3600' });
                if (upErr) {
                    console.warn('Erro ao enviar banner:', upErr);
                    showToast('Erro ao enviar banner: ' + upErr.message, 'error');
                } else {
                    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
                    bannerUrl = publicUrl;
                }
            }

            // Upload avatar
            let avatarUrl = profileUser.avatar_url;
            if (pendingAvatarFile) {
                const fileExt = pendingAvatarFile.name.split('.').pop();
                const fileName = `${currentUser.id}/avatar-${Date.now()}.${fileExt}`;
                const { error: upErr } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, pendingAvatarFile, { upsert: true, cacheControl: '3600' });
                if (upErr) {
                    console.warn('Erro ao enviar avatar:', upErr);
                    showToast('Erro ao enviar avatar: ' + upErr.message, 'error');
                } else {
                    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
                    avatarUrl = publicUrl;
                }
            }

            // Atualizar perfil
            const updates = {
                username: name,
                bio: bio,
                location: location,
                website: website,
                banner_url: bannerUrl,
                avatar_url: avatarUrl,
                frame: frame,
                updated_at: new Date().toISOString()
            };

            const { error: updateErr } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', currentUser.id);

            if (updateErr) {
                console.error('Erro ao salvar:', JSON.stringify(updateErr, null, 2));
                showToast('Erro ao salvar perfil: ' + updateErr.message, 'error');
                saveEditBtn.disabled = false;
                saveEditBtn.innerHTML = '<i class="fa-solid fa-check"></i> Salvar';
                return;
            }

            // Atualizar estado local
            Object.assign(profileUser, updates);
            renderProfile();
            editOverlay?.setAttribute('hidden', '');
            showToast('✅ Perfil atualizado!', 'success');

        } catch (err) {
            console.error('❌ Erro inesperado:', err);
            showToast('Erro inesperado ao salvar.', 'error');
        } finally {
            saveEditBtn.disabled = false;
            saveEditBtn.innerHTML = '<i class="fa-solid fa-check"></i> Salvar';
        }
    });

    // =============================================
    // 12. BOTÃO COMPARTILHAR
    // =============================================
    document.getElementById('shareProfileBtn')?.addEventListener('click', () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({ title: `Perfil de ${profileUser.username}`, url }).catch(() => {});
        } else {
            navigator.clipboard.writeText(url)
                .then(() => showToast('🔗 Link copiado!', 'success'))
                .catch(() => showToast('Erro ao copiar link', 'error'));
        }
    });

    // =============================================
    // 13. TOAST
    // =============================================
    function showToast(message, type = 'info') {
        const colors = { success: '#10b981', error: '#ef4444', info: '#1d9bf0' };
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(100px);
            background: ${colors[type] || colors.info}; color: #fff; padding: 12px 24px; border-radius: 24px;
            font-size: 14px; font-weight: 500; z-index: 99999; transition: all 0.3s;
            box-shadow: 0 8px 30px rgba(0,0,0,0.3); font-family: Inter, sans-serif;
            max-width: 90vw; text-align: center;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // =============================================
    // 14. HELPERS
    // =============================================
    function isValidUuid(value) {
        return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }

    function cleanUsername(value) {
        const username = String(value || 'Membro da comunidade')
            .trim()
            .replace(/^@+/, '')
            .replace(/\s+/g, ' ')
            .slice(0, 40);
        return username || 'Membro da comunidade';
    }

    function getSafeImageUrl(value) {
        if (!value || typeof value !== 'string') return AVATAR_PADRAO;

        try {
            const url = new URL(value, window.location.origin);
            if (url.protocol === 'https:' || url.origin === window.location.origin) {
                return url.href;
            }
        } catch (err) {
            console.warn('URL de avatar inválida:', value);
        }

        return AVATAR_PADRAO;
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function setValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value;
    }

    function escapeHtml(t) {
        if (!t) return '';
        const d = document.createElement('div');
        d.textContent = t;
        return d.innerHTML;
    }

    function formatNumber(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
        return String(n);
    }

    function formatDate(d) {
        const date = new Date(d);
        const diff = (Date.now() - date.getTime()) / 1000;
        if (diff < 60) return 'agora';
        if (diff < 3600) return Math.floor(diff / 60) + 'min';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h';
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }

    function showError(msg) {
        const c = document.getElementById('profileContent');
        if (c) {
            c.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p>${msg}</p>
                </div>
            `;
        }
    }

    // =============================================
    // 15. INICIALIZAR
    // =============================================
    const profileLoad = loadProfile();
    loadFollowSuggestions();
    await profileLoad;

    console.log('✅ Página de perfil carregada!');
});