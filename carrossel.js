/**
 * CARROSSEL SIMPLES — Sem efeitos 3D
 */
class CarrosselSimples {
    constructor(trackId, options = {}) {
        this.track = document.getElementById(trackId);
        if (!this.track) {
            console.warn('⚠️ Carrossel: Track não encontrado');
            return;
        }

        this.options = {
            autoplaySpeed: options.autoplaySpeed || 4500,
            startIndex: options.startIndex || 0,
            ...options
        };

        this.cards = Array.from(this.track.children);
        this.totalCards = this.cards.length;
        this.currentIndex = this.options.startIndex;
        this.dotsContainer = document.getElementById('carouselTripleDots');
        this.prevBtn = document.getElementById('carouselPrev');
        this.nextBtn = document.getElementById('carouselNext');
        
        this.autoplayTimer = null;
        this.isAnimating = false;

        this.init();
    }

    init() {
        if (this.totalCards === 0) {
            console.warn('⚠️ Carrossel: Nenhum card encontrado');
            return;
        }

        this.createDots();
        this.updateCarousel();
        this.startAutoplay();
        this.bindEvents();

        console.log(`🎠 Carrossel simples inicializado com ${this.totalCards} cards`);
    }

    createDots() {
        if (!this.dotsContainer) return;
        
        this.dotsContainer.innerHTML = '';
        this.cards.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${i === this.currentIndex ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Ir para o slide ${i + 1}`);
            dot.addEventListener('click', () => {
                this.goTo(i);
                this.resetAutoplay();
            });
            this.dotsContainer.appendChild(dot);
        });
    }

    updateCarousel() {
        this.cards.forEach((card, index) => {
            // Resetar todas as classes e estilos
            card.classList.remove('active-card', 'prev-card', 'next-card', 'hidden-card', 'shadow-neon-glow');
            card.style.transform = '';
            card.style.opacity = '';
            card.style.zIndex = '';
            card.style.filter = '';
            card.style.pointerEvents = '';
            card.style.boxShadow = '';
            card.style.transition = '';
            
            // Apenas mostrar/esconder com display
            if (index === this.currentIndex) {
                card.style.display = 'block';
                card.style.opacity = '1';
                card.style.visibility = 'visible';
                card.classList.add('active-card');
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.visibility = 'hidden';
            }
        });

        this.updateDots();
    }

    updateDots() {
        if (!this.dotsContainer) return;
        const dots = Array.from(this.dotsContainer.children);
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === this.currentIndex);
        });
    }

    next() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.currentIndex = (this.currentIndex + 1) % this.totalCards;
        this.updateCarousel();
        setTimeout(() => {
            this.isAnimating = false;
        }, 300);
    }

    prev() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.currentIndex = (this.currentIndex - 1 + this.totalCards) % this.totalCards;
        this.updateCarousel();
        setTimeout(() => {
            this.isAnimating = false;
        }, 300);
    }

    goTo(index) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.currentIndex = ((index % this.totalCards) + this.totalCards) % this.totalCards;
        this.updateCarousel();
        setTimeout(() => {
            this.isAnimating = false;
        }, 300);
    }

    startAutoplay() {
        if (this.autoplayTimer) return;
        this.autoplayTimer = setInterval(() => this.next(), this.options.autoplaySpeed);
    }

    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }

    resetAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }

    bindEvents() {
        // Botões de navegação
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.prev();
                this.resetAutoplay();
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.next();
                this.resetAutoplay();
            });
        }

        // Teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prev();
                this.resetAutoplay();
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                this.next();
                this.resetAutoplay();
                e.preventDefault();
            }
        });

        // Pausar autoplay no hover
        const container = document.querySelector('.carousel-triple-container');
        if (container) {
            container.addEventListener('mouseenter', () => this.stopAutoplay());
            container.addEventListener('mouseleave', () => this.startAutoplay());
        }

        // Visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoplay();
            } else {
                this.startAutoplay();
            }
        });
    }

    destroy() {
        this.stopAutoplay();
        
        if (this.prevBtn) {
            this.prevBtn.replaceWith(this.prevBtn.cloneNode(true));
        }
        if (this.nextBtn) {
            this.nextBtn.replaceWith(this.nextBtn.cloneNode(true));
        }
        
        if (this.dotsContainer) {
            this.dotsContainer.innerHTML = '';
        }
        
        this.cards.forEach((card) => {
            card.style.display = '';
            card.style.transform = '';
            card.style.opacity = '';
            card.style.zIndex = '';
            card.style.filter = '';
            card.style.pointerEvents = '';
            card.style.boxShadow = '';
            card.style.transition = '';
            card.style.visibility = '';
            card.classList.remove('active-card', 'prev-card', 'next-card', 'hidden-card', 'shadow-neon-glow');
        });
        
        console.log('🛑 Carrossel simples destruído');
    }

    reload() {
        this.cards = Array.from(this.track.children);
        this.totalCards = this.cards.length;
        this.currentIndex = Math.min(this.currentIndex, this.totalCards - 1);
        
        if (this.totalCards === 0) {
            console.warn('⚠️ Carrossel: Nenhum card encontrado no reload');
            return;
        }
        
        this.createDots();
        this.updateCarousel();
        this.resetAutoplay();
        
        console.log(`🔄 Carrossel simples recarregado com ${this.totalCards} cards`);
    }

    addCard(cardElement, position = 'end') {
        if (position === 'start') {
            this.track.prepend(cardElement);
        } else {
            this.track.appendChild(cardElement);
        }
        
        this.reload();
        
        if (position === 'start') {
            this.goTo(0);
        }
    }

    removeCard(index) {
        if (index < 0 || index >= this.totalCards) return;
        
        const cardToRemove = this.cards[index];
        if (cardToRemove) {
            cardToRemove.remove();
            this.reload();
        }
    }

    getCurrentIndex() {
        return this.currentIndex;
    }

    getTotalCards() {
        return this.totalCards;
    }

    isAutoplayActive() {
        return this.autoplayTimer !== null;
    }

    toggleAutoplay() {
        if (this.isAutoplayActive()) {
            this.stopAutoplay();
        } else {
            this.startAutoplay();
        }
        return this.isAutoplayActive();
    }

    setAutoplaySpeed(speed) {
        this.options.autoplaySpeed = speed;
        if (this.isAutoplayActive()) {
            this.stopAutoplay();
            this.startAutoplay();
        }
    }

    pauseAutoplay(ms = 3000) {
        this.stopAutoplay();
        setTimeout(() => {
            this.startAutoplay();
        }, ms);
    }

    updateOptions(newOptions) {
        this.options = {
            ...this.options,
            ...newOptions
        };
        
        if (newOptions.autoplaySpeed) {
            this.setAutoplaySpeed(newOptions.autoplaySpeed);
        }
        
        if (newOptions.startIndex !== undefined) {
            this.goTo(newOptions.startIndex);
        }
    }
}

// Inicialização automática
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('carrosselTripleTrack');
    if (track) {
        const carrossel = new CarrosselSimples('carrosselTripleTrack', {
            autoplaySpeed: 4500,
            startIndex: 0
        });
        
        window.carrosselSimples = carrossel;
        
        document.addEventListener('carrossel:next', () => {
            if (window.carrosselSimples) window.carrosselSimples.next();
        });
        
        document.addEventListener('carrossel:prev', () => {
            if (window.carrosselSimples) window.carrosselSimples.prev();
        });
        
        document.addEventListener('carrossel:goTo', (e) => {
            if (window.carrosselSimples && e.detail && typeof e.detail.index === 'number') {
                window.carrosselSimples.goTo(e.detail.index);
            }
        });
        
        console.log('✅ Carrossel simples inicializado com sucesso!');
    } else {
        console.warn('⚠️ Elemento carrosselTripleTrack não encontrado no DOM');
    }
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CarrosselSimples;
}