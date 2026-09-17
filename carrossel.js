/**
 * DESTAQUE + FEED — Script único
 */

// =====================================================
// DADOS DOS 6 CARDS
// =====================================================
const cardData = [
    {
        id: 1,
        badge: "Destaque",
        badgeColor: "linear-gradient(135deg, #7c3aed, #a855f7)",
        title: "Leitura prática para o dia a dia",
        description: "Aprenda a lidar com procrastinação, organizar a rotina e reduzir a ansiedade.",
        link: "/blog/blog.html",
        btnText: "Explorar",
        icon: "fa-solid fa-lightbulb",
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=500&fit=crop",
        date: "há 3 dias"
    },
    {
        id: 2,
        badge: "Seguro",
        badgeColor: "linear-gradient(135deg, #db2777, #ec4899)",
        title: "Comunidade segura para compartilhar",
        description: "Compartilhe experiências em um espaço seguro e sem julgamentos.",
        link: "/comunidade/comunidade.html",
        btnText: "Participar",
        icon: "fa-regular fa-heart",
        image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=500&fit=crop",
        date: "há 2 dias"
    },
    {
        id: 3,
        badge: "Novo",
        badgeColor: "linear-gradient(135deg, #10b981, #34d399)",
        title: "Conteúdos sobre TDAH, Autismo e mais",
        description: "Conteúdos claros sobre TDAH, autismo adulto, autoestima e regulação emocional.",
        link: "/trilhas/trilha.html",
        btnText: "Explorar",
        icon: "fa-solid fa-road",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=500&fit=crop",
        date: "há 1 dia"
    },
    {
        id: 4,
        badge: "Direitos",
        badgeColor: "linear-gradient(135deg, #f59e0b, #fbbf24)",
        title: "Leis e benefícios traduzidos",
        description: "Informação prática sobre leis e benefícios. Sem juridiquês — a gente traduz.",
        link: "/direitos/direitos.html",
        btnText: "Consultar",
        icon: "fa-solid fa-scale-balanced",
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=500&fit=crop",
        date: "há 4 dias"
    },
    {
        id: 5,
        badge: "Ao Vivo",
        badgeColor: "linear-gradient(135deg, #8b5cf6, #c084fc)",
        title: "Eventos e grupos de apoio",
        description: "Aulas, rodas de acolhimento e grupos de partilha com especialistas.",
        link: "/Recursos/eventos.html",
        btnText: "Ver agenda",
        icon: "fa-regular fa-calendar-days",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=500&fit=crop",
        date: "há 5 dias"
    },
    {
        id: 6,
        badge: "Desafio",
        badgeColor: "linear-gradient(135deg, #f43f5e, #fb7185)",
        title: "Ferramentas que transformam o seu dia",
        description: "Pequenos passos mensais para transformar sua vida de forma leve.",
        link: "/ferramentas/ferramentas.html",
        btnText: "Começar",
        icon: "fa-solid fa-flag-checkered",
        image: "/img/blog-post-1-DvwhQAY4 - Copia.jpg",
        date: "há 1 semana"
    }
];

// =====================================================
// ESTADO
// =====================================================
let heroIndex = 0;
let autoplayTimer = null;
let isAutoplayActive = false;

// =====================================================
// RENDER DO DESTAQUE
// =====================================================
function renderHero(index) {
    heroIndex = index;
    const item = cardData[index];

    document.getElementById('heroImage').src = item.image;
    document.getElementById('heroTitle').textContent = item.title;
    document.getElementById('heroDesc').textContent = item.description;
    document.getElementById('heroBadgeTop').textContent = item.badge;
    document.getElementById('heroBadgeTop').style.background = item.badgeColor;
    document.getElementById('heroBadge').innerHTML = `<i class="fa-regular fa-clock"></i> ${item.date}`;
    document.getElementById('heroIcon').innerHTML = `<i class="${item.icon}"></i>`;
    document.getElementById('heroBtn').href = item.link;
    document.getElementById('heroBtnText').textContent = item.btnText;

    renderSidePlaylist(index);
}

// =====================================================
// RENDER DA PLAYLIST LATERAL
// =====================================================
function renderSidePlaylist(activeIdx) {
    const el = document.getElementById('sidePlaylist');
    el.innerHTML = '';

    cardData.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = `ct-playlist-item ${i === activeIdx ? 'is-active' : ''}`;
        div.onclick = () => {
            renderHero(i);
            resetAutoplay();
        };
        div.innerHTML = `
            <div class="ct-playlist-item__media">
                <img src="${item.image}" alt="">
                <span class="ct-playlist-item__badge" style="background:${item.badgeColor};">${item.badge}</span>
            </div>
            <div class="ct-playlist-item__text">
                <h4>${item.title}</h4>
                <span>${item.date}</span>
            </div>
        `;
        el.appendChild(div);
    });
}

// =====================================================
// NAVEGAÇÃO
// =====================================================
function prevHeroItem() {
    renderHero((heroIndex - 1 + cardData.length) % cardData.length);
    resetAutoplay();
}

function nextHeroItem() {
    renderHero((heroIndex + 1) % cardData.length);
    resetAutoplay();
}

// =====================================================
// AUTOPLAY
// =====================================================
function startAutoplay() {
    if (autoplayTimer) return;                    // já rodando
    autoplayTimer = setInterval(() => {
        renderHero((heroIndex + 1) % cardData.length);
    }, 2500);
}

function stopAutoplay() {
    if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
    }
    // NÃO mexe em isAutoplayActive — só o toggle faz isso
}

function resetAutoplay() {
    // Reinicia o timer APENAS se o autoplay estiver ligado
    if (isAutoplayActive) {
        stopAutoplay();
        startAutoplay();
    }
}

function toggleAutoplay() {
    const btn = document.getElementById('autoplayBtn');
    const icon = document.getElementById('autoplayIcon');
    const text = document.getElementById('autoplayText');

    if (isAutoplayActive) {
        // Desligar
        isAutoplayActive = false;
        stopAutoplay();
        icon.className = 'fa-solid fa-play';
        icon.style.color = '#7c3aed';
        text.textContent = 'Autoplay Off';
        btn.classList.remove('is-active');
        showToast('Autoplay pausado');
    } else {
        // Ligar
        isAutoplayActive = true;
        startAutoplay();
        icon.className = 'fa-solid fa-pause';
        icon.style.color = '#f59e0b';
        text.textContent = 'Autoplay On';
        btn.classList.add('is-active');
        showToast('Autoplay ativado');
    }
}

// =====================================================
// MODAL
// =====================================================
function openModal(id) {
    const item = cardData.find(c => c.id === id);
    if (!item) return;

    document.getElementById('modalImage').src = item.image;
    document.getElementById('modalTitle').textContent = item.title;
    document.getElementById('modalDescription').textContent = item.description;
    document.getElementById('modalCategory').textContent = item.badge;
    document.getElementById('modalDate').textContent = item.date;
    document.getElementById('modalIcon').innerHTML = `<i class="${item.icon}"></i>`;
    document.getElementById('modalLink').href = item.link;

    document.getElementById('contentModal').classList.add('is-open');
}

function closeModal() {
    document.getElementById('contentModal').classList.remove('is-open');
}

function copyShareLink() {
    navigator.clipboard.writeText(window.location.href);
    showToast("Link copiado!");
}

// =====================================================
// TOAST
// =====================================================
function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 2500);
}

// =====================================================
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    renderHero(0);

    // Pausar autoplay no hover
    const heroView = document.querySelector('.ct-hero-view');
    if (heroView) {
        heroView.addEventListener('mouseenter', () => {
            if (isAutoplayActive) stopAutoplay();
        });
        heroView.addEventListener('mouseleave', () => {
            if (isAutoplayActive) startAutoplay();
        });
    }

    // Teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowUp') { prevHeroItem(); }
        if (e.key === 'ArrowDown') { nextHeroItem(); }
    });

    // Fechar modal clicando fora
    document.getElementById('contentModal').addEventListener('click', (e) => {
        if (e.target.id === 'contentModal') closeModal();
    });
});