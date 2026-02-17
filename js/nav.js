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
    progressCurrent += (progressTarget - progressCurrent) * 0.18;

    if (Math.abs(progressTarget - progressCurrent) < 0.002) {
      progressCurrent = progressTarget;
    }

    navbar.style.setProperty('--logo-progress', String(progressCurrent));
    navbar.style.setProperty('--brand-progress', String(progressCurrent));

    // Fade nav bar in at the same rate as logo shrink
    var alpha = Math.max(0, Math.min(1, progressCurrent));
    if (alpha < 0.01) {
      navbar.style.background = 'none';
      navbar.style.backgroundColor = 'transparent';
      navbar.style.boxShadow = 'none';
    } else {
      navbar.style.background = 'none';
      navbar.style.backgroundColor = 'rgba(0, 0, 0, ' + alpha.toFixed(3) + ')';
      navbar.style.boxShadow = '0 1px 0 rgba(51, 51, 51, ' + alpha.toFixed(3) + ')';
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
    var shrinkDistance = 220;
    progressTarget = Math.max(0, Math.min(1, scrollY / shrinkDistance));
    if (!rafId) {
      rafId = window.requestAnimationFrame(renderProgress);
    }
    // Overlay homepage uses progress-based fade; avoid class jumps.
    navbar.classList.remove('navbar--solid');
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
