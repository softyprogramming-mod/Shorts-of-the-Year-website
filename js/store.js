// Store page lightbox
(function () {
  const lightbox = document.getElementById('storeLightbox');
  const backdrop = document.getElementById('storeLightboxBackdrop');
  const closeBtn = document.getElementById('storeLightboxClose');
  const nextBtn = document.getElementById('storeLightboxNext');
  const img = document.getElementById('storeLightboxImg');
  const nameEl = document.getElementById('storeLightboxName');
  const priceEl = document.getElementById('storeLightboxPrice');
  const statusEl = document.getElementById('storeLightboxStatus');
  const triggers = document.querySelectorAll('.product-image-wrap[data-lightbox-image]');

  if (!lightbox || !backdrop || !closeBtn || !nextBtn || !img || !nameEl || !priceEl || !statusEl) return;

  let lastTrigger = null;
  let currentIndex = -1;

  function renderFromTrigger(trigger) {
    img.src = trigger.dataset.lightboxImage || '';
    img.alt = trigger.dataset.lightboxName || '';
    nameEl.textContent = trigger.dataset.lightboxName || '';
    priceEl.textContent = trigger.dataset.lightboxPrice || '';
    statusEl.textContent = trigger.dataset.lightboxStatus || '';
  }

  function openLightbox(trigger) {
    currentIndex = Array.prototype.indexOf.call(triggers, trigger);
    renderFromTrigger(trigger);

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

  function showNext() {
    if (!triggers.length) return;
    if (currentIndex < 0) currentIndex = 0;
    currentIndex = (currentIndex + 1) % triggers.length;
    renderFromTrigger(triggers[currentIndex]);
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
  nextBtn.addEventListener('click', showNext);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
    if ((e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') && lightbox.classList.contains('open')) {
      e.preventDefault();
      showNext();
    }
  });
})();
