/**
 * CARROSSEL 3D COVERFLOW — Script exclusivo
 */
class Carrossel3D {
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
        this.isDragging = false;
        this.dragStartX = 0;
        this.touchStartX = 0;
        this.resizeTimeout = null;
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

        console.log(`🎠 Carrossel 3D inicializado com ${this.totalCards} cards`);
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
        const screenWidth = window.innerWidth;
        let translateOffset = screenWidth < 640 ? 120 : screenWidth < 1024 ? 220 : 310;
        const scaleActive = screenWidth < 640 ? 1.04 : 1.08;
        const scaleSide = screenWidth < 640 ? 0.8 : 0.85;
        const blurSide = screenWidth < 640 ? '0.5px' : '1px';
        const blurHidden = screenWidth < 640 ? '2px' : '4px';
        const opacitySide = screenWidth < 640 ? 0.6 : 0.55;

        this.cards.forEach((card, index) => {
            let distance = index - this.currentIndex;
            if (distance > this.totalCards / 2) distance -= this.totalCards;
            else if (distance < -this.totalCards / 2) distance += this.totalCards;

            card.classList.remove('active-card', 'prev-card', 'next-card', 'hidden-card', 'shadow-neon-glow');

            // Resetar estilos inline
            card.style.transform = '';
            card.style.opacity = '';
            card.style.zIndex = '';
            card.style.filter = '';
            card.style.pointerEvents = '';
            card.style.boxShadow = '';
            card.style.transition = '';

            if (distance === 0) {
                // Card ativo
                card.style.transform = `translateX(0px) scale(${scaleActive}) rotateY(0deg) translateZ(100px)`;
                card.style.opacity = '1';
                card.style.zIndex = '30';
                card.style.filter = 'blur(0px)';
                card.classList.add('active-card', 'shadow-neon-glow');
                card.style.pointerEvents = 'auto';
                card.style.boxShadow = '0 20px 50px rgba(124, 58, 237, 0.3)';
                card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            } else if (distance === -1 || (distance === this.totalCards - 1 && this.currentIndex === 0)) {
                // Card anterior
                card.style.transform = `translateX(-${translateOffset}px) scale(${scaleSide}) rotateY(28deg) translateZ(0px)`;
                card.style.opacity = opacitySide;
                card.style.zIndex = '20';
                card.style.filter = `blur(${blurSide})`;
                card.classList.add('prev-card');
                card.style.pointerEvents = 'auto';
                card.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.25)';
                card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            } else if (distance === 1 || (distance === -(this.totalCards - 1) && this.currentIndex === this.totalCards - 1)) {
                // Card próximo
                card.style.transform = `translateX(${translateOffset}px) scale(${scaleSide}) rotateY(-28deg) translateZ(0px)`;
                card.style.opacity = opacitySide;
                card.style.zIndex = '20';
                card.style.filter = `blur(${blurSide})`;
                card.classList.add('next-card');
                card.style.pointerEvents = 'auto';
                card.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.25)';
                card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            } else {
                // Cards ocultos
                const distanceMultiplier = Math.abs(distance) > 2 ? 1.4 : 1.2;
                card.style.transform = `translateX(${distance * translateOffset * distanceMultiplier}px) scale(0.6) translateZ(-150px)`;
                card.style.opacity = '0';
                card.style.zIndex = '10';
                card.style.filter = `blur(${blurHidden})`;
                card.classList.add('hidden-card');
                card.style.pointerEvents = 'none';
                card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
                card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
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
        }, 600);
    }

    prev() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.currentIndex = (this.currentIndex - 1 + this.totalCards) % this.totalCards;
        this.updateCarousel();
        setTimeout(() => {
            this.isAnimating = false;
        }, 600);
    }

    goTo(index) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.currentIndex = ((index % this.totalCards) + this.totalCards) % this.totalCards;
        this.updateCarousel();
        setTimeout(() => {
            this.isAnimating = false;
        }, 600);
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

        // Clique nos cards
        this.cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                if (index !== this.currentIndex) {
                    this.goTo(index);
                    this.resetAutoplay();
                }
            });
        });

        // Drag com mouse
        let isDragging = false;
        let startX = 0;
        let isSwiping = false;

        this.track.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX;
            isSwiping = false;
            this.stopAutoplay();
        });

        this.track.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const diffX = startX - e.pageX;
            if (Math.abs(diffX) > 30) {
                isSwiping = true;
            }
            if (Math.abs(diffX) > 60) {
                if (diffX > 0) {
                    this.next();
                } else {
                    this.prev();
                }
                isDragging = false;
                this.startAutoplay();
            }
        });

        window.addEventListener('mouseup', () => {
            if (isDragging && !isSwiping) {
                // Se não houve swipe, é um clique
            }
            isDragging = false;
            if (!this.autoplayTimer) {
                this.startAutoplay();
            }
        });

        // Touch events
        let touchStartX = 0;
        let touchEndX = 0;

        this.track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            this.stopAutoplay();
        }, { passive: true });

        this.track.addEventListener('touchmove', (e) => {
            const diffX = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.next();
                } else {
                    this.prev();
                }
                touchStartX = e.changedTouches[0].screenX;
                this.startAutoplay();
            }
        }, { passive: true });

        this.track.addEventListener('touchend', () => {
            if (!this.autoplayTimer) {
                this.startAutoplay();
            }
        }, { passive: true });

        // Pausar autoplay no hover
        const container = document.querySelector('.carousel-triple-container');
        if (container) {
            container.addEventListener('mouseenter', () => this.stopAutoplay());
            container.addEventListener('mouseleave', () => this.startAutoplay());
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

        // Resize com debounce
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.updateCarousel();
            }, 150);
        });

        // Visibilidade da página (pausa quando não está visível)
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
            card.style.transform = '';
            card.style.opacity = '';
            card.style.zIndex = '';
            card.style.filter = '';
            card.style.pointerEvents = '';
            card.style.boxShadow = '';
            card.style.transition = '';
            card.classList.remove('active-card', 'prev-card', 'next-card', 'hidden-card', 'shadow-neon-glow');
        });
        
        console.log('🛑 Carrossel 3D destruído');
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
        
        console.log(`🔄 Carrossel 3D recarregado com ${this.totalCards} cards`);
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
        const carrossel = new Carrossel3D('carrosselTripleTrack', {
            autoplaySpeed: 4500,
            startIndex: 0
        });
        
        window.carrossel3D = carrossel;
        
        document.addEventListener('carrossel:next', () => {
            if (window.carrossel3D) window.carrossel3D.next();
        });
        
        document.addEventListener('carrossel:prev', () => {
            if (window.carrossel3D) window.carrossel3D.prev();
        });
        
        document.addEventListener('carrossel:goTo', (e) => {
            if (window.carrossel3D && e.detail && typeof e.detail.index === 'number') {
                window.carrossel3D.goTo(e.detail.index);
            }
        });
        
        console.log('✅ Carrossel 3D Coverflow inicializado com sucesso!');
    } else {
        console.warn('⚠️ Elemento carrosselTripleTrack não encontrado no DOM');
    }
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Carrossel3D;
}