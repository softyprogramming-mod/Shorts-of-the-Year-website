// Shorts of the Year — Search
(function () {
  var overlay  = document.getElementById('searchOverlay');
  var input    = document.getElementById('searchInput');
  var results  = document.getElementById('searchResults');
  var openBtn  = document.getElementById('searchBtn');
  var closeBtn = document.getElementById('searchClose');
  if (!overlay || !input || !results || !openBtn) return;
  var filmsCache = null;
  function openSearch() {
    overlay.classList.add('search-open');
    input.value = '';
    results.innerHTML = '';
    setTimeout(function () { input.focus(); }, 60);
  }
  function closeSearch() {
    overlay.classList.remove('search-open');
    input.value = '';
    results.innerHTML = '';
  }
  openBtn.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSearch();
  });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeSearch();
  });
  function getFilms(cb) {
    if (filmsCache) { cb(filmsCache); return; }
    fetch('https://softy-api-phi.vercel.app/api/films')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        filmsCache = (data.films || []).filter(function (f) { return f.live; });
        cb(filmsCache);
      })
      .catch(function () { cb([]); });
  }
  function highlight(text, query) {
    if (!query) return text;
    var re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return String(text || '').replace(re, '<mark>$1</mark>');
  }
  function render(films, query) {
    if (!films.length) {
      results.innerHTML = '<p class="search-no-results">No results for &ldquo;' + query + '&rdquo;</p>';
      return;
    }
    results.innerHTML = films.map(function (f) {
      var thumb = f.thumbnail
        ? '<img class="search-result-thumb" src="' + f.thumbnail + '" alt="" onerror="this.style.visibility=\'hidden\'">'
        : '<div class="search-result-thumb"></div>';
      return '<a href="film.html?id=' + f.slug + '" class="search-result">'
        + thumb
        + '<div class="search-result-info">'
        +   '<div class="search-result-title">' + highlight(f.title, query) + '</div>'
        +   '<div class="search-result-meta">' + highlight(f.director, query) + ' &nbsp;|&nbsp; ' + highlight(f.genre, query) + '</div>'
        + '</div>'
        + '</a>';
    }).join('');
  }
  var debounceTimer;
  input.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    var q = input.value.trim();
    if (!q) { results.innerHTML = ''; return; }
    debounceTimer = setTimeout(function () {
      getFilms(function (films) {
        var ql = q.toLowerCase();
        var matched = films.filter(function (f) {
          return (f.title    || '').toLowerCase().includes(ql)
              || (f.director || '').toLowerCase().includes(ql)
              || (f.genre    || '').toLowerCase().includes(ql);
        });
        render(matched, q);
      });
    }, 200);
  });
  results.addEventListener('click', function (e) {
    if (e.target.closest('.search-result')) closeSearch();
  });
})();
