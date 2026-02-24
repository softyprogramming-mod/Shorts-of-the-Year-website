// Nav: transparent over hero at top, solid after scroll + mobile hamburger
(function () {
  var navbar = document.getElementById('navbar');
  var masthead = document.getElementById('masthead');
  var featuredTitle = document.getElementById('featuredTitle');
  var menuButton = document.getElementById('menuButton');
  var navMenu = document.getElementById('navMenu');
  var brandDrops = navbar.querySelectorAll('.brand-home .brand-drop');
  var progressTarget = 0;
  var progressCurrent = 0;
  var rafId = 0;
  var hasUserScrolled = false;

  if (!navbar) return;

  // First paint on homepage should always be transparent over the hero.
  // Some browsers report a transient non-zero offset before layout settles.
  if (navbar.dataset.overlay === 'true') {
    navbar.setAttribute('data-at-top', 'true');
    navbar.classList.remove('navbar--solid');
    navbar.style.background = 'none';
    navbar.style.setProperty('background-color', 'transparent', 'important');
    navbar.style.setProperty('box-shadow', 'none', 'important');
  }

  function renderProgress() {
    progressCurrent += (progressTarget - progressCurrent) * 0.12;

    if (Math.abs(progressTarget - progressCurrent) < 0.002) {
      progressCurrent = progressTarget;
    }

    // Logo curve: changes quickly at first, then eases into final size.
    var logoProgress = 1 - Math.pow(1 - progressCurrent, 2.2);
    navbar.style.setProperty('--logo-progress', String(logoProgress));

    // Fade nav bar in at the same rate as logo shrink
    var maxAlpha = 0.88; // keep homepage nav slightly translucent at full state
    var alpha = Math.max(0, Math.min(maxAlpha, progressCurrent * maxAlpha));
    if (alpha < 0.01) {
      navbar.classList.remove('navbar--solid');
      navbar.style.background = 'none';
      navbar.style.setProperty('background-color', 'transparent', 'important');
      navbar.style.setProperty('box-shadow', 'none', 'important');
    } else {
      navbar.classList.add('navbar--solid');
      navbar.style.setProperty('background', 'none', 'important');
      navbar.style.setProperty('background-color', 'rgba(0, 0, 0, ' + alpha.toFixed(3) + ')', 'important');
      navbar.style.setProperty('box-shadow', '0 1px 0 rgba(51, 51, 51, ' + alpha.toFixed(3) + ')', 'important');
    }

    if (progressCurrent !== progressTarget) {
      rafId = window.requestAnimationFrame(renderProgress);
    } else {
      rafId = 0;
    }
  }

  function applyNavState(fromScrollEvent) {
    // Only homepage uses overlay behavior
    if (navbar.dataset.overlay !== 'true') return;
    if (fromScrollEvent) hasUserScrolled = true;

    var scroller = document.scrollingElement || document.documentElement || document.body;
    var rawScrollY = scroller ? scroller.scrollTop : 0;
    // Nav state must follow real page scroll only.
    // Using masthead visual offsets here causes false "scrolled" states while resizing.
    var visualScrollY = rawScrollY;
    var isAtTop = rawScrollY <= 1;

    // Hard rule: homepage nav starts transparent until an actual user scroll happens.
    if (!hasUserScrolled) {
      isAtTop = true;
    }

    // Always be fully transparent at true top (no lag on return to top)
    if (isAtTop) {
      navbar.setAttribute('data-at-top', 'true');
      progressTarget = 0;
      progressCurrent = 0;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      navbar.style.setProperty('--logo-progress', '0');
      navbar.style.setProperty('--brand-progress', '0');
      navbar.style.setProperty('--brand-fade-progress', '0');
      navbar.style.setProperty('--brand-condense-progress', '0');
      navbar.classList.remove('navbar--solid');
      navbar.style.background = 'none';
      navbar.style.setProperty('background-color', 'transparent', 'important');
      navbar.style.setProperty('box-shadow', 'none', 'important');
      return;
    }

    navbar.setAttribute('data-at-top', 'false');

    // Full nav animation completes a bit deeper down the hero image.
    var effectDistance = 320;
    if (masthead) {
      effectDistance = Math.max(220, masthead.offsetHeight * 0.72);
    }

    progressTarget = Math.max(0, Math.min(1, rawScrollY / effectDistance));
    // Keep SoftY phases locked to the same overall timeline.
    var brandProgress = progressTarget;
    // Two-phase brand animation:
    // 1) non-SOFTY letters fade out first
    // 2) remaining letters condense together after fade is mostly complete
    // Keep full phrase briefly, then fade non-SOFTY letters.
    var fadeStart = 0.14;
    var brandFadeProgress = Math.max(
      0,
      Math.min(1, ((progressTarget - fadeStart) / (1 - fadeStart)) * 1.65)
    );
    var condenseStart = 0.72;
    var brandCondenseProgress = Math.max(
      0,
      Math.min(1, (brandFadeProgress - condenseStart) / (1 - condenseStart))
    );
    navbar.style.setProperty('--brand-progress', String(brandProgress));
    navbar.style.setProperty('--brand-fade-progress', String(brandFadeProgress));
    navbar.style.setProperty('--brand-condense-progress', String(brandCondenseProgress));
    if (!rafId) {
      rafId = window.requestAnimationFrame(renderProgress);
    }
    // Overlay homepage uses progress-based fade driven in renderProgress.
  }

  function measureBrandDropWidths() {
    if (navbar.dataset.overlay !== 'true' || !brandDrops.length) return;

    navbar.classList.add('navbar--measure-brand');
    brandDrops.forEach(function (drop) {
      var w = drop.getBoundingClientRect().width;
      drop.style.setProperty('--drop-w', w.toFixed(3) + 'px');
    });
    navbar.classList.remove('navbar--measure-brand');
  }

  // Run immediately and on page events
  measureBrandDropWidths();
  applyNavState(false);
  window.addEventListener('resize', function () {
    measureBrandDropWidths();
    applyNavState(false);
  });
  window.addEventListener('scroll', function () { applyNavState(true); }, { passive: true });
  window.addEventListener('pageshow', function () {
    measureBrandDropWidths();
    applyNavState(false);
  });

  // Mobile menu toggle
  if (menuButton && navMenu) {
    menuButton.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = navMenu.classList.toggle('nav-menu--open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? '✕' : '☰';
    });

    var links = navMenu.querySelectorAll('a');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('nav-menu--open');
        menuButton.textContent = '☰';
        menuButton.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function (e) {
      if (!navbar.contains(e.target)) {
        navMenu.classList.remove('nav-menu--open');
        menuButton.textContent = '☰';
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
