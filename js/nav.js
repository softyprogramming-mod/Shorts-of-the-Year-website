// Nav: transparent overlay → solid on scroll + mobile hamburger
(function () {
  var navbar = document.getElementById('navbar');
  var menuButton = document.getElementById('menuButton');
  var navMenu = document.getElementById('navMenu');

  // Scroll: only on pages with data-overlay="true" (homepage)
  if (navbar && navbar.dataset.overlay === 'true') {
    function handleScroll() {
      if (window.scrollY > 60) {
        navbar.classList.add('navbar--solid');
      } else {
        navbar.classList.remove('navbar--solid');
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run on load, pageshow (back/forward cache), and resize
    window.addEventListener('pageshow', handleScroll);
    window.addEventListener('resize', handleScroll, { passive: true });
    // Run immediately AND after a short delay to catch mobile rendering lag
    handleScroll();
    setTimeout(handleScroll, 100);
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
