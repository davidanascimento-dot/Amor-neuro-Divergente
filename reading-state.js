document.addEventListener('DOMContentLoaded', () => {
    const FAVORITES_KEY = 'favoriteContents';
    const CURRENT_READING_KEY = 'currentReading';

    function readList(key) {
        try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
    }

    function getContentData(card, link) {
        const image = card.querySelector('img')?.src || card.querySelector('.card-image')?.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1] || '';
        const title = card.querySelector('h2, h3, .category-text h2, .card-title, .article-title')?.textContent.trim() || 'Conteúdo';
        const author = card.querySelector('.author, .card-author, .article-meta')?.textContent.trim() || 'Amor NeuroDivergente';
        return { id: link?.href || title, title, author, image, url: link?.href || '#', progress: 0 };
    }

    function isFavorite(content) {
        return readList(FAVORITES_KEY).some(item => item.id === content.id);
    }

    function updateFavoriteButton(button, content) {
        const active = isFavorite(content);
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
        button.innerHTML = `<i class="fa-${active ? 'solid' : 'regular'} fa-bookmark"></i> ${active ? 'Salvo' : 'Salvar'}`;
    }

    function toggleFavorite(content, button) {
        const favorites = readList(FAVORITES_KEY);
        const index = favorites.findIndex(item => item.id === content.id);
        if (index >= 0) favorites.splice(index, 1);
        else favorites.unshift(content);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.slice(0, 30)));
        updateFavoriteButton(button, content);
    }

    function setCurrentReading(content) {
        localStorage.setItem(CURRENT_READING_KEY, JSON.stringify({
            ...content,
            progress: Number(content.progress) || 0,
            chapter: content.progress ? `${content.progress}% concluído` : 'Leitura iniciada agora'
        }));
    }

    function addActions(card, link) {
        if (card.dataset.readingEnhanced === 'true') return;
        card.dataset.readingEnhanced = 'true';
        const content = getContentData(card, link);
        const actions = document.createElement('div');
        actions.className = 'reading-card-actions';

        const favoriteButton = document.createElement('button');
        favoriteButton.type = 'button';
        favoriteButton.className = 'reading-action reading-favorite';
        favoriteButton.addEventListener('click', () => toggleFavorite(content, favoriteButton));
        updateFavoriteButton(favoriteButton, content);

        const readButton = document.createElement('a');
        readButton.className = 'reading-action reading-start';
        readButton.href = link?.href || content.url;
        readButton.innerHTML = '<i class="fa-solid fa-book-open-reader"></i> Ler agora';
        readButton.addEventListener('click', () => setCurrentReading(content));

        actions.append(favoriteButton, readButton);
        const target = card.querySelector('.card-content, .category-text, .blog-card-content') || card;
        target.appendChild(actions);

        link?.addEventListener('click', () => setCurrentReading(content));
    }

    window.enhanceReadingCards = () => {
        document.querySelectorAll('.blog-card').forEach(card => {
            addActions(card, card.querySelector('a[href]:not([href="#"])'));
        });

        document.querySelectorAll('.category-section').forEach(section => {
            addActions(section, section.querySelector('a[href]'));
        });
    };

    window.enhanceReadingCards();
});
