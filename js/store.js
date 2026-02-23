// Store page lightbox
(function () {
  const lightbox = document.getElementById('storeLightbox');
  const backdrop = document.getElementById('storeLightboxBackdrop');
  const closeBtn = document.getElementById('storeLightboxClose');
  const img = document.getElementById('storeLightboxImg');
  const nameEl = document.getElementById('storeLightboxName');
  const priceEl = document.getElementById('storeLightboxPrice');
  const statusEl = document.getElementById('storeLightboxStatus');
  const triggers = document.querySelectorAll('.product-image-wrap[data-lightbox-image]');

  if (!lightbox || !backdrop || !closeBtn || !img || !nameEl || !priceEl || !statusEl) return;

  let lastTrigger = null;

  function openLightbox(trigger) {
    img.src = trigger.dataset.lightboxImage || '';
    img.alt = trigger.dataset.lightboxName || '';
    nameEl.textContent = trigger.dataset.lightboxName || '';
    priceEl.textContent = trigger.dataset.lightboxPrice || '';
    statusEl.textContent = trigger.dataset.lightboxStatus || '';

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lastTrigger = trigger;
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => openLightbox(trigger));
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(trigger);
      }
    });
  });

  backdrop.addEventListener('click', closeLightbox);
  closeBtn.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });
})();
