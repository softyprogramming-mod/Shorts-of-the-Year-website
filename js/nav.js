// Nav: transparent overlay → solid on scroll + mobile hamburger
(function () {
  var navbar = document.getElementById('navbar');
  var menuButton = document.getElementById('menuButton');
  var navMenu = document.getElementById('navMenu');

  // ── Overscroll prevention (desktop only - blocks bounce above page top) ───
  window.addEventListener('wheel', function (e) {
    if (window.scrollY === 0 && e.deltaY < 0) {
      e.preventDefault();
    }
  }, { passive: false });

  // ── Scroll → solid nav ────────────────────────────────────────────────────
  if (navbar && navbar.dataset.overlay === 'true') {

    // Set inline immediately so mobile doesn't flash black before JS runs
    navbar.style.background = 'none';

    function handleScroll() {
      if (window.scrollY > 60) {
        navbar.classList.add('navbar--solid');
        navbar.style.background = '';
      } else {
        navbar.classList.remove('navbar--solid');
        navbar.style.background = 'none';
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pageshow', handleScroll);
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    setTimeout(handleScroll, 50);
    setTimeout(handleScroll, 300);
  }

  // ── Mobile hamburger ──────────────────────────────────────────────────────
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
      if (navbar && !navbar.contains(e.target)) {
        navMenu.classList.remove('nav-menu--open');
        menuButton.textContent = '☰';
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
