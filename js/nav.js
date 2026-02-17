// Nav: transparent over hero at top, solid after scroll + mobile hamburger
(function () {
  var navbar = document.getElementById('navbar');
  var menuButton = document.getElementById('menuButton');
  var navMenu = document.getElementById('navMenu');
  var progressTarget = 0;
  var progressCurrent = 0;
  var rafId = 0;

  if (!navbar) return;

  function renderProgress() {
    progressCurrent += (progressTarget - progressCurrent) * 0.12;

    if (Math.abs(progressTarget - progressCurrent) < 0.002) {
      progressCurrent = progressTarget;
    }

    navbar.style.setProperty('--logo-progress', String(progressCurrent));
    navbar.style.setProperty('--brand-progress', String(progressCurrent));

    // Fade nav bar in at the same rate as logo shrink
    var alpha = Math.max(0, Math.min(1, progressCurrent));
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

  function applyNavState() {
    // Only homepage uses overlay behavior
    if (navbar.dataset.overlay !== 'true') return;

    var scroller = document.scrollingElement || document.documentElement || document.body;
    var scrollY = scroller ? scroller.scrollTop : 0;

    // Always be fully transparent at true top (no lag on return to top)
    if (scrollY <= 1) {
      progressTarget = 0;
      progressCurrent = 0;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      navbar.style.setProperty('--logo-progress', '0');
      navbar.style.setProperty('--brand-progress', '0');
      navbar.classList.remove('navbar--solid');
      navbar.style.background = 'none';
      navbar.style.setProperty('background-color', 'transparent', 'important');
      navbar.style.setProperty('box-shadow', 'none', 'important');
      return;
    }

    var shrinkDistance = 220;
    progressTarget = Math.max(0, Math.min(1, scrollY / shrinkDistance));
    if (!rafId) {
      rafId = window.requestAnimationFrame(renderProgress);
    }
    // Overlay homepage uses progress-based fade driven in renderProgress.
  }

  // Run immediately and on page events
  applyNavState();
  window.addEventListener('scroll', applyNavState, { passive: true });
  window.addEventListener('pageshow', applyNavState);

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
