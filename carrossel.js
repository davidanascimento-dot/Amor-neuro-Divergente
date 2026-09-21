/* =====================================================
   CARROSSEL EDITORIAL — Setas + barra de progresso
   ===================================================== */
(function () {
  const track    = document.getElementById('ctTrack');
  const progress = document.getElementById('ctProgressBar');
  if (!track) return;

  const cards   = track.querySelectorAll('.ct-card');
  const prevBtn = document.querySelector('.ct-arrow--prev');
  const nextBtn = document.querySelector('.ct-arrow--next');

  /* --- Atualiza a barra de progresso --- */
  function updateProgress() {
    const max = track.scrollWidth - track.clientWidth;
    const pct = max > 0 ? track.scrollLeft / max : 0;

    // Quantos cards cabem por vez
    const cardW   = cards[0].offsetWidth + 20; // +gap
    const visible = Math.max(1, Math.round(track.clientWidth / cardW));
    const barW    = 100 / (cards.length / visible);

    progress.style.width = barW + '%';
    progress.style.transform =
      `translateX(${(pct * (100 - barW) / barW) * 100}%)`;
  }

  /* --- Scroll por card --- */
  function scrollByCard(dir) {
    const step = cards[0].offsetWidth + 20;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  prevBtn?.addEventListener('click', () => scrollByCard(-1));
  nextBtn?.addEventListener('click', () => scrollByCard(1));

  /* --- Atualiza ao rolar / redimensionar --- */
  track.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  /* --- Habilita/desabilita setas nas extremidades --- */
  function updateArrows() {
    const max = track.scrollWidth - track.clientWidth;
    const atStart = track.scrollLeft <= 2;
    const atEnd   = track.scrollLeft >= max - 2;

    if (prevBtn) prevBtn.style.opacity = atStart ? '0.35' : '0.9';
    if (nextBtn) nextBtn.style.opacity = atEnd   ? '0.35' : '0.9';
    if (prevBtn) prevBtn.style.pointerEvents = atStart ? 'none' : 'auto';
    if (nextBtn) nextBtn.style.pointerEvents = atEnd   ? 'none' : 'auto';
  }

  track.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);

  /* --- Init --- */
  updateProgress();
  updateArrows();
})();