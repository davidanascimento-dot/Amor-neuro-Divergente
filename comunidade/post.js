/* ==========================================================================
   POST.JS — Detalhe de uma publicação e comentários em cadeia
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    const supabase = window.supabaseClient;
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    const AVATAR_PADRAO = '/img/foto-padrão.jpg';
    const MAX_COMMENT_LENGTH = 2000;

    let currentUser = null;
    let currentProfile = null;
    let currentPost = null;
    let currentComments = [];
    let commentNodes = new Map();
    let activeReplyId = null;
    let isLiked = false;
    let realtimeChannel = null;
    let realtimeTimer = null;

    const elements = {
        state: document.getElementById('postPageState'),
        postCard: document.getElementById('postDetailCard'),
        conversation: document.getElementById('conversationSection'),
        authorLink: document.getElementById('detailAuthorLink'),
        authorLinkName: document.getElementById('detailAuthorLinkName'),
        authorName: document.getElementById('detailPostAuthor'),
        avatar: document.getElementById('detailPostAvatar'),
        avatarFallback: document.getElementById('detailAvatarFallback'),
        badge: document.getElementById('detailPostBadge'),
        handle: document.getElementById('detailPostHandle'),
        date: document.getElementById('detailPostDate'),
        content: document.getElementById('detailPostContent'),
        media: document.getElementById('detailPostMedia'),
        image: document.getElementById('detailPostImage'),
        video: document.getElementById('detailPostVideo'),
        externalLink: document.getElementById('detailExternalLink'),
        likeButton: document.getElementById('detailLikeBtn'),
        likeCount: document.getElementById('detailLikeCount'),
        commentLink: document.getElementById('detailCommentsLink'),
        commentCount: document.getElementById('detailCommentCount'),
        shareButton: document.getElementById('detailShareBtn'),
        conversationCount: document.getElementById('conversationCount'),
        commentForm: document.getElementById('commentForm'),
        composerAvatar: document.getElementById('commentComposerAvatar'),
        commentInput: document.getElementById('commentInput'),
        commentSubmit: document.getElementById('commentSubmitBtn'),
        commentCharCount: document.getElementById('commentCharCount'),
        loginPrompt: document.getElementById('commentLoginPrompt'),
        sort: document.getElementById('commentSort'),
        search: document.getElementById('commentSearch'),
        resultsInfo: document.getElementById('commentResultsInfo'),
        commentStatus: document.getElementById('commentStatus'),
        commentTree: document.getElementById('commentTree'),
        inlineReplyForm: document.getElementById('inlineReplyForm'),
        inlineReplyLabel: document.getElementById('inlineReplyLabel'),
        inlineReplyInput: document.getElementById('inlineReplyInput'),
        inlineReplySubmit: document.getElementById('inlineReplySubmitBtn'),
        inlineReplyCancel: document.getElementById('cancelInlineReplyBtn'),
        inlineReplyCharCount: document.getElementById('inlineReplyCharCount'),
        headerProfileLink: document.getElementById('headerProfileLink'),
        headerAvatar: document.getElementById('headerAvatar')
    };

    initialize();

    async function initialize() {
        bindEvents();

        if (!supabase) {
            showError('Não foi possível conectar ao banco de dados.', 'Conexão indisponível');
            return;
        }

        if (!isValidUuid(postId)) {
            showError('O endereço da publicação é inválido.', 'Publicação não encontrada');
            return;
        }

        showLoading();

        try {
            const { data: { session } } = await supabase.auth.getSession();
            currentUser = session?.user || null;
        } catch (error) {
            console.warn('Não foi possível recuperar a sessão:', error);
        }

        try {
            configureComposerAccess();
            await loadCurrentProfile();
            await loadPost();
            window.addEventListener('beforeunload', removeRealtimeSubscription);
        } catch (error) {
            console.error('Erro ao abrir a publicação:', error);
            showError('Não foi possível carregar esta publicação agora.', 'Erro ao carregar');
        }
    }

    function bindEvents() {
        elements.likeButton?.addEventListener('click', togglePostLike);
        elements.shareButton?.addEventListener('click', shareCurrentPost);

        elements.commentForm?.addEventListener('submit', event => {
            event.preventDefault();
            submitComment(null, elements.commentInput, elements.commentSubmit);
        });

        elements.inlineReplyForm?.addEventListener('submit', event => {
            event.preventDefault();
            submitComment(activeReplyId, elements.inlineReplyInput, elements.inlineReplySubmit);
        });

        elements.inlineReplyCancel?.addEventListener('click', cancelInlineReply);
        elements.commentInput?.addEventListener('input', updateCharacterCount);
        elements.inlineReplyInput?.addEventListener('input', updateCharacterCount);
        elements.sort?.addEventListener('change', renderComments);
        elements.search?.addEventListener('input', renderComments);

        elements.commentInput?.addEventListener('keydown', event => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                elements.commentForm.requestSubmit();
            }
        });

        window.addEventListener('hashchange', scrollToHashTarget);

        elements.inlineReplyInput?.addEventListener('keydown', event => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                elements.inlineReplyForm.requestSubmit();
            }
        });

        elements.commentTree?.addEventListener('click', event => {
            const target = event.target instanceof Element ? event.target : null;
            if (!target) return;

            const replyButton = target.closest('[data-reply-comment]');
            if (replyButton) {
                beginInlineReply(replyButton.dataset.replyComment);
                return;
            }

            const shareButton = target.closest('[data-share-comment]');
            if (shareButton) {
                shareComment(shareButton.dataset.shareComment);
            }
        });
    }

    function configureComposerAccess() {
        const loggedIn = Boolean(currentUser);
        const metadataAvatar = currentUser?.user_metadata?.avatar_url;

        elements.commentInput.disabled = !loggedIn;
        elements.commentSubmit.disabled = !loggedIn;
        elements.loginPrompt.hidden = loggedIn;

        if (metadataAvatar) {
            const safeAvatar = getSafeUrl(metadataAvatar);
            if (safeAvatar) elements.composerAvatar.src = safeAvatar;
        }

        if (loggedIn && isValidUuid(currentUser.id)) {
            elements.headerProfileLink.href = `/comunidade/perfil.html?id=${encodeURIComponent(currentUser.id)}`;
        } else {
            elements.headerProfileLink.href = '/login/login.html';
        }
    }

    async function loadCurrentProfile() {
        if (!currentUser || !isValidUuid(currentUser.id)) return;

        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, is_verified')
            .eq('id', currentUser.id)
            .maybeSingle();

        if (error) {
            console.warn('Não foi possível carregar o perfil atual:', error);
            return;
        }

        currentProfile = data || null;
        const avatarUrl = getSafeUrl(currentProfile?.avatar_url);
        if (avatarUrl) {
            elements.composerAvatar.src = avatarUrl;
            elements.headerAvatar.src = avatarUrl;
        }
    }

    async function loadPost() {
        const { data: post, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .eq('is_active', true)
            .maybeSingle();

        if (error) throw error;
        if (!post) {
            showError('Esta publicação foi removida ou não está mais disponível.', 'Publicação não encontrada');
            return;
        }

        let authorProfile = null;
        if (isValidUuid(post.author_id)) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('id, username, avatar_url, is_verified')
                .eq('id', post.author_id)
                .maybeSingle();
            authorProfile = profile || null;
        }

        currentPost = {
            ...post,
            author_name: post.author_name || authorProfile?.username || 'Membro da comunidade',
            author_avatar: post.author_avatar || authorProfile?.avatar_url || null,
            is_verified: post.is_verified ?? authorProfile?.is_verified ?? false
        };

        renderPost();
        await Promise.all([loadLikeState(), loadComments()]);
        scrollToHashTarget();
        subscribeToPostRealtime();
    }

    function renderPost() {
        if (!currentPost) return;

        const authorName = cleanName(currentPost.author_name);
        const handle = buildHandle(currentPost.author_name);
        const authorAvatar = getSafeUrl(currentPost.author_avatar) || AVATAR_PADRAO;
        const authorUrl = isValidUuid(currentPost.author_id)
            ? `/comunidade/perfil.html?id=${encodeURIComponent(currentPost.author_id)}`
            : null;

        elements.state.hidden = true;
        elements.postCard.hidden = false;
        elements.conversation.hidden = false;

        elements.authorName.textContent = authorName;
        elements.handle.textContent = handle;
        elements.date.textContent = formatRelativeTime(currentPost.created_at);
        elements.date.dateTime = currentPost.created_at || '';
        elements.date.title = formatFullDate(currentPost.created_at);
        elements.avatar.src = authorAvatar;
        elements.avatar.alt = `Foto de perfil de ${authorName}`;
        elements.avatarFallback.textContent = getInitial(authorName);
        elements.avatarFallback.style.background = colorFromString(currentPost.author_id || postId);
        elements.avatar.addEventListener('error', () => {
            elements.avatar.hidden = true;
            elements.avatarFallback.classList.add('is-visible');
        }, { once: true });

        [elements.authorLink, elements.authorLinkName].forEach(link => {
            if (authorUrl) link.href = authorUrl;
            else link.removeAttribute('href');
        });

        elements.badge.textContent = currentPost.is_verified ? 'Verificado' : 'Publicação';
        elements.content.textContent = currentPost.content || 'Publicação sem texto.';

        const imageUrl = getSafeUrl(currentPost.image_url);
        const videoUrl = getSafeUrl(currentPost.video_url);
        const externalUrl = getSafeUrl(currentPost.link_url);

        if (imageUrl) {
            elements.image.hidden = false;
            elements.video.hidden = true;
            elements.image.src = imageUrl;
            elements.image.alt = `Mídia publicada por ${authorName}`;
            elements.image.addEventListener('error', () => {
                elements.media.hidden = true;
            }, { once: true });
            elements.media.hidden = false;
        } else if (videoUrl) {
            elements.image.hidden = true;
            elements.video.hidden = false;
            elements.video.src = videoUrl;
            elements.media.hidden = false;
        } else {
            elements.media.hidden = true;
            elements.image.removeAttribute('src');
            elements.video.removeAttribute('src');
        }

        if (externalUrl) {
            elements.externalLink.href = externalUrl;
            elements.externalLink.hidden = false;
        } else {
            elements.externalLink.hidden = true;
            elements.externalLink.removeAttribute('href');
        }

        elements.likeCount.textContent = formatCount(currentPost.likes || 0);
        elements.commentCount.textContent = formatCount(currentPost.comment_count || 0);
        updateDetailCommentLink();
        updateLikeButton();
        document.title = `${authorName} — Publicação | Amor NeuroDivergente`;
    }

    async function loadLikeState() {
        if (!currentUser || !isValidUuid(currentUser.id)) {
            updateLikeButton();
            return;
        }

        const { data, error } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', currentUser.id)
            .maybeSingle();

        if (error) {
            console.warn('Não foi possível carregar o like atual:', error);
            return;
        }

        isLiked = Boolean(data);
        updateLikeButton();
    }

    async function togglePostLike() {
        if (!currentPost) return;
        if (!currentUser) {
            showToast('Entre na sua conta para curtir.', 'info');
            return;
        }

        elements.likeButton.disabled = true;

        try {
            const result = await supabase.rpc('toggle_like', { p_post_id: postId });
            if (result.error) throw result.error;

            const payload = result.data || {};
            isLiked = typeof payload.liked === 'boolean' ? payload.liked : !isLiked;
            currentPost.likes = Number.isFinite(Number(payload.likes))
                ? Number(payload.likes)
                : Math.max(0, (Number(currentPost.likes) || 0) + (isLiked ? 1 : -1));

            updateLikeButton();
        } catch (rpcError) {
            console.warn('RPC de like indisponível, tentando fallback:', rpcError);

            try {
                const { data: existing, error: lookupError } = await supabase
                    .from('likes')
                    .select('id')
                    .eq('post_id', postId)
                    .eq('user_id', currentUser.id)
                    .maybeSingle();

                if (lookupError) throw lookupError;

                if (existing) {
                    const { error: deleteError } = await supabase
                        .from('likes')
                        .delete()
                        .eq('id', existing.id);
                    if (deleteError) throw deleteError;
                    isLiked = false;
                } else {
                    const { error: insertError } = await supabase
                        .from('likes')
                        .insert({ post_id: postId, user_id: currentUser.id });
                    if (insertError) throw insertError;
                    isLiked = true;
                }

                currentPost.likes = Math.max(0, (Number(currentPost.likes) || 0) + (isLiked ? 1 : -1));
                const { error: postUpdateError } = await supabase
                    .from('posts')
                    .update({ likes: currentPost.likes })
                    .eq('id', postId);
                if (postUpdateError) throw postUpdateError;
                updateLikeButton();
            } catch (fallbackError) {
                console.error('Erro ao curtir publicação:', fallbackError);
                showToast('Não foi possível atualizar a curtida.', 'error');
            }
        } finally {
            elements.likeButton.disabled = false;
        }
    }

    function updateDetailCommentLink() {
        const count = Number(currentPost?.comment_count) || 0;
        const noun = count === 1 ? 'comentário' : 'comentários';
        elements.commentLink.setAttribute('aria-label', `Abrir comentários desta publicação, ${count} ${noun}`);
    }

    function updateLikeButton() {
        elements.likeButton.classList.toggle('is-liked', isLiked);
        elements.likeButton.setAttribute('aria-pressed', String(isLiked));
        const likeCount = Number(currentPost?.likes) || 0;
        const likeNoun = likeCount === 1 ? 'curtida' : 'curtidas';
        elements.likeButton.setAttribute(
            'aria-label',
            `${isLiked ? 'Remover curtida' : 'Curtir publicação'}, ${likeCount} ${likeNoun}`
        );
        const icon = elements.likeButton.querySelector('i');
        if (icon) icon.className = isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        elements.likeCount.textContent = formatCount(currentPost?.likes || 0);
    }

    async function shareCurrentPost() {
        const url = buildPostUrl(postId);
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Publicação da Comunidade', url });
            } catch (error) {
                if (error?.name !== 'AbortError') showToast('Não foi possível compartilhar.', 'error');
            }
            return;
        }

        try {
            await copyText(url);
            showToast('Link da publicação copiado!', 'success');
        } catch {
            showToast('Não foi possível copiar o link.', 'error');
        }
    }

    async function fetchAllComments() {
        const pageSize = 500;
        const comments = [];
        let offset = 0;

        while (true) {
            const { data, error } = await supabase
                .from('comments')
                .select('id, post_id, parent_id, author_id, author_name, author_avatar, content, likes, created_at')
                .eq('post_id', postId)
                .is('blog_slug', null)
                .eq('is_active', true)
                .eq('status', 'approved')
                .order('created_at', { ascending: true })
                .order('id', { ascending: true })
                .range(offset, offset + pageSize - 1);

            if (error) throw error;
            comments.push(...(data || []));
            if (!data || data.length < pageSize) break;
            offset += pageSize;
        }

        return comments;
    }

    async function loadComments() {
        elements.commentStatus.hidden = false;
        elements.commentStatus.textContent = 'Carregando comentários...';

        try {
            const data = await fetchAllComments();
            currentComments = await enrichCommentsWithProfiles(data);
            commentNodes = new Map(currentComments.map(comment => [comment.id, { ...comment, children: [] }]));
            buildCommentTree();

            currentPost.comment_count = currentComments.length;
            elements.commentCount.textContent = formatCount(currentComments.length);
            elements.conversationCount.textContent = formatCount(currentComments.length);
            updateDetailCommentLink();
            renderComments();
        } catch (error) {
            console.error('Erro ao carregar comentários:', error);
            elements.commentStatus.hidden = false;
            elements.commentStatus.textContent = 'Não foi possível carregar os comentários.';
        }
    }

    async function enrichCommentsWithProfiles(comments) {
        const authorIds = [...new Set(comments
            .map(comment => comment.author_id)
            .filter(isValidUuid))];

        if (!authorIds.length) return comments;

        const batches = [];
        for (let index = 0; index < authorIds.length; index += 100) {
            batches.push(authorIds.slice(index, index + 100));
        }

        const results = await Promise.all(batches.map(ids => supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', ids)));

        const failedBatch = results.find(result => result.error);
        if (failedBatch) {
            console.warn('Usando parte dos dados de autor já salvos nos comentários:', failedBatch.error);
        }

        const profiles = results.flatMap(result => result.data || []);
        const profileMap = new Map(profiles.map(profile => [profile.id, profile]));
        return comments.map(comment => {
            const profile = profileMap.get(comment.author_id);
            return {
                ...comment,
                author_name: profile?.username || comment.author_name || 'Membro',
                author_avatar: profile?.avatar_url || comment.author_avatar || null
            };
        });
    }

    function buildCommentTree() {
        const roots = [];

        commentNodes.forEach(node => {
            node.children = [];
        });

        commentNodes.forEach(node => {
            const parent = node.parent_id ? commentNodes.get(node.parent_id) : null;
            if (parent && !hasParentCycle(node)) {
                node.isRoot = false;
                parent.children.push(node);
            } else {
                node.isRoot = true;
                roots.push(node);
            }
        });

        commentNodes.forEach(node => {
            node.children.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        });

        sortRoots(roots);
    }

    function hasParentCycle(node) {
        const visited = new Set([node.id]);
        let parentId = node.parent_id;

        while (parentId) {
            if (visited.has(parentId)) return true;
            visited.add(parentId);
            parentId = commentNodes.get(parentId)?.parent_id || null;
        }

        return false;
    }

    function sortRoots(roots) {
        const mode = elements.sort?.value || 'best';
        roots.sort((a, b) => {
            if (mode === 'recent') return new Date(b.created_at) - new Date(a.created_at);
            if (mode === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
            return (Number(b.likes) || 0) - (Number(a.likes) || 0)
                || new Date(a.created_at) - new Date(b.created_at);
        });
    }

    function renderComments() {
        if (!elements.commentTree) return;

        const preserveReplyFocus = document.activeElement === elements.inlineReplyInput;
        const replySelectionStart = preserveReplyFocus ? elements.inlineReplyInput.selectionStart : null;
        const replySelectionEnd = preserveReplyFocus ? elements.inlineReplyInput.selectionEnd : null;
        const allRoots = [...commentNodes.values()].filter(node => node.isRoot);
        sortRoots(allRoots);
        const query = normalizeText(elements.search?.value || '');
        const visibleRoots = query
            ? allRoots.map(node => filterCommentNode(node, query)).filter(Boolean)
            : allRoots;

        const fragment = document.createDocumentFragment();
        visibleRoots.forEach(node => fragment.appendChild(renderCommentNode(node, 0, new Set())));
        elements.commentTree.replaceChildren(fragment);

        const visibleCount = countVisibleComments(visibleRoots);
        elements.commentStatus.hidden = visibleCount > 0;
        elements.commentStatus.textContent = query
            ? 'Nenhum comentário corresponde à sua busca.'
            : 'Nenhum comentário ainda. Seja a primeira pessoa a participar!';

        elements.resultsInfo.textContent = query
            ? `${visibleCount} comentário${visibleCount === 1 ? '' : 's'} encontrado${visibleCount === 1 ? '' : 's'}.`
            : `${currentComments.length} comentário${currentComments.length === 1 ? '' : 's'} na conversa.`;

        if (activeReplyId && commentNodes.has(activeReplyId)) {
            mountInlineReply(activeReplyId, false);
            if (preserveReplyFocus) {
                elements.inlineReplyInput.focus();
                elements.inlineReplyInput.setSelectionRange(replySelectionStart, replySelectionEnd);
            }
        }
    }

    function scrollToHashTarget() {
        const hash = window.location.hash.replace(/^#/, '');
        if (!hash) return;

        let targetId;
        try {
            targetId = decodeURIComponent(hash);
        } catch {
            targetId = hash;
        }

        requestAnimationFrame(() => {
            const target = document.getElementById(targetId);
            if (!target) return;
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (target.matches('article')) {
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }
        });
    }

    function filterCommentNode(node, query) {
        const children = node.children
            .map(child => filterCommentNode(child, query))
            .filter(Boolean);
        const selfMatches = normalizeText(`${node.author_name || ''} ${node.content || ''}`).includes(query);

        if (!selfMatches && !children.length) return null;
        return { ...node, children: selfMatches ? node.children : children };
    }

    function countVisibleComments(nodes) {
        return nodes.reduce((total, node) => total + 1 + countVisibleComments(node.children || []), 0);
    }

    function renderCommentNode(node, depth, ancestors) {
        const item = document.createElement('li');
        item.className = 'comment-thread-item';
        item.dataset.depth = String(Math.min(depth, 8));

        if (ancestors.has(node.id)) return item;
        const nextAncestors = new Set(ancestors);
        nextAncestors.add(node.id);

        const article = document.createElement('article');
        article.className = 'comment-node';
        article.id = `comment-${node.id}`;
        article.dataset.commentId = node.id;

        const authorName = cleanName(node.author_name);
        const avatarUrl = getSafeUrl(node.author_avatar) || AVATAR_PADRAO;
        const profileUrl = isValidUuid(node.author_id)
            ? `/comunidade/perfil.html?id=${encodeURIComponent(node.author_id)}`
            : null;

        const avatarContainer = document.createElement(profileUrl ? 'a' : 'div');
        avatarContainer.className = 'comment-avatar-link';
        if (profileUrl) {
            avatarContainer.href = profileUrl;
            avatarContainer.setAttribute('aria-label', `Ver perfil de ${authorName}`);
        }

        const avatar = document.createElement('img');
        avatar.className = 'comment-avatar';
        avatar.src = avatarUrl;
        avatar.alt = '';
        avatar.loading = 'lazy';
        avatar.addEventListener('error', () => {
            avatar.hidden = true;
            fallback.classList.add('is-visible');
        }, { once: true });

        const fallback = document.createElement('span');
        fallback.className = 'comment-avatar-fallback';
        fallback.textContent = getInitial(authorName);
        fallback.style.background = colorFromString(node.author_id || node.id);
        avatarContainer.append(avatar, fallback);

        const content = document.createElement('div');
        content.className = 'comment-content';

        const authorLine = document.createElement('div');
        authorLine.className = 'comment-author-line';

        const author = document.createElement(profileUrl ? 'a' : 'span');
        author.className = 'comment-author-link';
        if (profileUrl) author.href = profileUrl;
        author.textContent = authorName;

        const time = document.createElement('time');
        time.className = 'comment-time';
        time.dateTime = node.created_at || '';
        time.textContent = formatRelativeTime(node.created_at);
        time.title = formatFullDate(node.created_at);
        authorLine.append(author, time);

        const text = document.createElement('p');
        text.className = 'comment-content-text';
        text.textContent = node.content || '';

        const actions = document.createElement('div');
        actions.className = 'comment-actions';

        const replyButton = document.createElement('button');
        replyButton.type = 'button';
        replyButton.className = 'comment-action-btn';
        replyButton.dataset.replyComment = node.id;
        replyButton.innerHTML = '<i class="fa-regular fa-comment-dots" aria-hidden="true"></i> Responder';
        replyButton.setAttribute('aria-label', `Responder ${authorName}`);

        const shareButton = document.createElement('button');
        shareButton.type = 'button';
        shareButton.className = 'comment-action-btn';
        shareButton.dataset.shareComment = node.id;
        shareButton.innerHTML = '<i class="fa-solid fa-share-from-square" aria-hidden="true"></i> Compartilhar';
        shareButton.setAttribute('aria-label', `Copiar link do comentário de ${authorName}`);

        actions.append(replyButton, shareButton);
        content.append(authorLine, text, actions);
        article.append(avatarContainer, content);
        item.appendChild(article);

        if (node.children?.length) {
            const children = document.createElement('ol');
            children.className = 'comment-children';
            node.children.forEach(child => {
                children.appendChild(renderCommentNode(child, depth + 1, nextAncestors));
            });
            item.appendChild(children);
        }

        return item;
    }

    function beginInlineReply(commentId) {
        if (!currentUser) {
            showToast('Entre na sua conta para responder.', 'info');
            return;
        }

        const comment = commentNodes.get(commentId);
        if (!comment) return;

        activeReplyId = commentId;
        elements.inlineReplyLabel.textContent = `Respondendo a ${cleanName(comment.author_name)}`;
        mountInlineReply(commentId, true);
    }

    function mountInlineReply(commentId, shouldFocus) {
        const article = [...elements.commentTree.querySelectorAll('.comment-node')]
            .find(element => element.dataset.commentId === commentId);

        if (!article) return;

        elements.inlineReplyForm.hidden = false;
        article.insertAdjacentElement('afterend', elements.inlineReplyForm);
        if (shouldFocus) {
            elements.inlineReplyInput.focus();
            elements.inlineReplyForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function cancelInlineReply() {
        activeReplyId = null;
        elements.inlineReplyForm.hidden = true;
        elements.inlineReplyInput.value = '';
        updateCharacterCount();
    }

    async function getCommentAuthorProfile() {
        if (currentProfile && !Array.isArray(currentProfile)) return currentProfile;

        const { data, error } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', currentUser.id)
            .maybeSingle();

        if (error) throw error;
        currentProfile = data || null;
        return currentProfile;
    }

    async function insertCommentIntoComments(content, parentId = null) {
        const profile = await getCommentAuthorProfile();
        const { error } = await supabase
            .from('comments')
            .insert({
                post_id: postId,
                blog_slug: null,
                parent_id: parentId,
                author_id: currentUser.id,
                author_name: profile?.username || 'Membro da comunidade',
                author_avatar: profile?.avatar_url || AVATAR_PADRAO,
                content,
                status: 'approved',
                is_active: true,
                likes: 0
            });

        if (error) throw error;
    }

    async function submitComment(parentId, input, submitButton) {
        if (!currentUser) {
            showToast('Entre na sua conta para comentar.', 'info');
            return;
        }

        const content = input.value.trim();
        if (!content) {
            showToast('Escreva algo antes de enviar.', 'error');
            input.focus();
            return;
        }

        if (content.length > MAX_COMMENT_LENGTH) {
            showToast(`Use no máximo ${MAX_COMMENT_LENGTH} caracteres.`, 'error');
            return;
        }

        submitButton.disabled = true;
        const originalLabel = submitButton.textContent;
        submitButton.textContent = 'Enviando...';

        try {
            if (parentId) {
                // Respostas usam a mesma tabela comments e o parent_id para formar
                // a cadeia. Não existe uma tabela separada para respostas.
                await insertCommentIntoComments(content, parentId);
            } else {
                // Comentários principais continuam usando a RPC já existente no
                // projeto, evitando depender da migration opcional da RPC nova.
                const { error } = await supabase.rpc('create_comment_direct', {
                    p_post_id: postId,
                    p_content: content
                });
                if (error) {
                    console.warn('RPC legada indisponível; usando a tabela comments:', error);
                    await insertCommentIntoComments(content);
                }
            }

            input.value = '';
            updateCharacterCount();
            if (parentId) cancelInlineReply();
            await loadComments();
            showToast(parentId ? 'Resposta adicionada à conversa!' : 'Comentário publicado!', 'success');
        } catch (error) {
            console.error('Erro ao enviar comentário:', error);
            const message = error?.message
                ? `Não foi possível comentar: ${error.message}`
                : 'Não foi possível enviar o comentário. Tente novamente.';
            showToast(message, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalLabel;
        }
    }

    async function shareComment(commentId) {
        try {
            const url = new URL(window.location.href);
            url.hash = `comment-${commentId}`;
            await copyText(url.toString());
            showToast('Link do comentário copiado!', 'success');
        } catch {
            showToast('Não foi possível copiar o link.', 'error');
        }
    }

    function subscribeToPostRealtime() {
        removeRealtimeSubscription();

        realtimeChannel = supabase
            .channel(`post-detail:${postId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'comments',
                filter: `post_id=eq.${postId}`
            }, scheduleCommentsReload)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'posts',
                filter: `id=eq.${postId}`
            }, payload => {
                if (payload.eventType === 'DELETE' || payload.new?.is_active === false) {
                    removeRealtimeSubscription();
                    showError('Esta publicação foi removida.', 'Publicação indisponível');
                    return;
                }
                currentPost = { ...currentPost, ...payload.new };
                renderPost();
            })
            .subscribe(status => {
                if (status === 'SUBSCRIBED') console.info('✅ Atualizações em tempo real ativas para esta publicação.');
            });
    }

    function scheduleCommentsReload() {
        clearTimeout(realtimeTimer);
        realtimeTimer = setTimeout(() => {
            loadComments().catch(error => console.error('Falha no realtime de comentários:', error));
        }, 250);
    }

    function removeRealtimeSubscription() {
        clearTimeout(realtimeTimer);
        if (realtimeChannel && supabase) supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
    }

    function showLoading() {
        elements.state.className = 'post-page-state';
        elements.state.hidden = false;
        elements.state.replaceChildren();

        const spinner = document.createElement('span');
        spinner.className = 'post-state-spinner';
        spinner.setAttribute('aria-hidden', 'true');
        const title = document.createElement('strong');
        title.textContent = 'Carregando publicação...';
        const helper = document.createElement('span');
        helper.textContent = 'Só um instante.';

        elements.state.append(spinner, title, helper);
    }

    function showError(message, title = 'Não foi possível abrir a publicação') {
        elements.state.className = 'post-error-state';
        elements.state.hidden = false;
        elements.state.replaceChildren();
        elements.postCard.hidden = true;
        elements.conversation.hidden = true;

        const icon = document.createElement('span');
        icon.className = 'post-error-icon';
        icon.innerHTML = '<i class="fa-regular fa-face-frown" aria-hidden="true"></i>';

        const heading = document.createElement('h1');
        heading.textContent = title;
        const text = document.createElement('p');
        text.textContent = message;
        const actions = document.createElement('div');
        actions.className = 'post-error-actions';
        const back = document.createElement('a');
        back.href = '/comunidade/comunidade.html#forum';
        back.textContent = 'Voltar à comunidade';
        actions.appendChild(back);

        elements.state.append(icon, heading, text, actions);
        document.title = `${title} | Amor NeuroDivergente`;
    }

    function updateCharacterCount() {
        elements.commentCharCount.textContent = `${elements.commentInput.value.length}/${MAX_COMMENT_LENGTH}`;
        elements.inlineReplyCharCount.textContent = `${elements.inlineReplyInput.value.length}/${MAX_COMMENT_LENGTH}`;
    }

    function buildPostUrl(id) {
        return `${window.location.origin}/comunidade/post.html?id=${encodeURIComponent(id)}`;
    }

    function isValidUuid(value) {
        return typeof value === 'string'
            && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }

    function getSafeUrl(value) {
        if (!value || value === 'null' || typeof value !== 'string') return null;
        try {
            const url = new URL(value, window.location.origin);
            const localDevelopment = url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
            if (url.protocol === 'https:' || localDevelopment || url.origin === window.location.origin) {
                return url.href;
            }
        } catch {
            return null;
        }
        return null;
    }

    function cleanName(value) {
        const name = String(value || 'Membro da comunidade').trim().slice(0, 80);
        return name || 'Membro da comunidade';
    }

    function buildHandle(value) {
        return '@' + cleanName(value).replace(/^@+/, '').toLowerCase();
    }

    function normalizeText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function getInitial(value) {
        return cleanName(value).charAt(0).toUpperCase() || '?';
    }

    function colorFromString(value) {
        const colors = ['#7c3aed', '#db2777', '#0891b2', '#b7791f', '#059669', '#dc2626', '#4f46e5'];
        let hash = 0;
        const text = String(value || 'comunidade');
        for (let index = 0; index < text.length; index += 1) {
            hash = text.charCodeAt(index) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    function formatCount(value) {
        const count = Number(value) || 0;
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
        return String(count);
    }

    function formatRelativeTime(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'agora';
        const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
        if (seconds < 60) return 'agora';
        if (seconds < 3600) return `há ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `há ${Math.floor(seconds / 3600)} h`;
        if (seconds < 604800) return `há ${Math.floor(seconds / 86400)} d`;
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }

    function formatFullDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    async function copyText(value) {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(value);
            return;
        }
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
    }

    function showToast(message, type = 'info') {
        const colors = { success: '#059669', error: '#dc2626', info: '#1a1a2e' };
        const toast = document.createElement('div');
        toast.className = 'post-toast';
        Object.assign(toast.style, {
            position: 'fixed',
            left: '50%',
            bottom: '24px',
            transform: 'translateX(-50%) translateY(100px)',
            zIndex: '99999',
            maxWidth: 'min(90vw, 520px)',
            padding: '11px 20px',
            borderRadius: '999px',
            background: colors[type] || colors.info,
            color: '#ffffff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            font: '600 13px Inter, sans-serif',
            textAlign: 'center',
            transition: 'transform 0.25s, opacity 0.25s',
            opacity: '0'
        });
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
            toast.style.opacity = '1';
        });
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(12px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 260);
        }, 2400);
    }
});
