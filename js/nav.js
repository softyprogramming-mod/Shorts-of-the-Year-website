// Nav: transparent over hero at top, solid after scroll + mobile hamburger
(function () {
  var navbar = document.getElementById('navbar');
  var menuButton = document.getElementById('menuButton');
  var navMenu = document.getElementById('navMenu');

  if (!navbar) return;

  function applyNavState() {
    // Only homepage uses overlay behavior
    if (navbar.dataset.overlay !== 'true') return;

    var scroller = document.scrollingElement || document.documentElement || document.body;
    var scrollY = scroller ? scroller.scrollTop : 0;
    var shouldBeSolid = scrollY > 140; // keep transparent longer at top on mobile/small viewports

    if (shouldBeSolid) {
      navbar.classList.add('navbar--solid');
      navbar.style.background = '';
      navbar.style.backgroundColor = '';
      navbar.style.boxShadow = '';
    } else {
      navbar.classList.remove('navbar--solid');
      navbar.style.background = 'none';
      navbar.style.backgroundColor = 'transparent';
      navbar.style.boxShadow = 'none';
    }
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
