// Nav: transparent overlay → solid on scroll + mobile hamburger
(function () {
  var navbar = document.getElementById('navbar');
  var menuButton = document.getElementById('menuButton');
  var navMenu = document.getElementById('navMenu');
  var SOLID_SCROLL_THRESHOLD = 120;

  // Force background none immediately — fixes iOS Safari black flash on load
  if (navbar && navbar.dataset.overlay === 'true') {
    navbar.classList.remove('navbar--solid');
    navbar.classList.add('navbar--at-top');
    navbar.dataset.atTop = 'true';
    navbar.style.background = 'none';
    navbar.style.backgroundColor = 'transparent';
  }

  // Scroll → solid nav (homepage only)
  if (navbar && navbar.dataset.overlay === 'true') {
    function getScrollTop() {
      return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    function handleScroll() {
      // Use a larger threshold because mobile/small viewports can report
      // small non-zero scroll values even when the page looks at top.
      var shouldBeSolid = getScrollTop() > SOLID_SCROLL_THRESHOLD;

      if (shouldBeSolid) {
        navbar.dataset.atTop = 'false';
        navbar.classList.remove('navbar--at-top');
        navbar.classList.add('navbar--solid');
        navbar.style.background = '';
        navbar.style.backgroundColor = '';
      } else {
        navbar.dataset.atTop = 'true';
        navbar.classList.add('navbar--at-top');
        navbar.classList.remove('navbar--solid');
        navbar.style.background = 'none';
        navbar.style.backgroundColor = 'transparent';
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pageshow', handleScroll);
    handleScroll();
  }

  // Mobile hamburger
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
