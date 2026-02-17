// Nav: transparent overlay → solid on scroll + mobile hamburger
(function () {
  var navbar = document.getElementById('navbar');
  var menuButton = document.getElementById('menuButton');
  var navMenu = document.getElementById('navMenu');

  // ── Overscroll prevention ──────────────────────────────────────────────────
  // macOS Safari ignores overscroll-behavior CSS, so we block wheel/touch
  // events that would scroll above y=0 (elastic bounce showing black above hero)
  window.addEventListener('wheel', function (e) {
    if (window.scrollY === 0 && e.deltaY < 0) {
      e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener('touchmove', function (e) {
    if (window.scrollY === 0) {
      e.preventDefault();
    }
  }, { passive: false });

  // ── Scroll → solid nav ─────────────────────────────────────────────────────
  // Only on pages with data-overlay="true" (homepage)
  if (navbar && navbar.dataset.overlay === 'true') {
    // Explicitly clear any background on load before JS runs (belt + suspenders)
    navbar.style.background = 'none';

    function handleScroll() {
      if (window.scrollY > 60) {
        navbar.classList.add('navbar--solid');
        navbar.style.background = ''; // let CSS take over
      } else {
        navbar.classList.remove('navbar--solid');
        navbar.style.background = 'none'; // force clear inline
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pageshow', handleScroll);
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    setTimeout(handleScroll, 50);
    setTimeout(handleScroll, 200); // extra safety for slow mobile renders
  }

  // Mobile hamburger
  if (menuButton && navMenu) {
    menuButton.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = navMenu.classList.toggle('nav-menu--open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? '✕' : '☰';
    });

    // Close on link click
    var links = navMenu.querySelectorAll('a');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('nav-menu--open');
        menuButton.textContent = '☰';
        menuButton.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (navbar && !navbar.contains(e.target)) {
        navMenu.classList.remove('nav-menu--open');
        menuButton.textContent = '☰';
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
