// Shorts of the Year — Search
(function () {
  var overlay  = document.getElementById('searchOverlay');
  var input    = document.getElementById('searchInput');
  var results  = document.getElementById('searchResults');
  var openBtn  = document.getElementById('searchBtn');
  var closeBtn = document.getElementById('searchClose');
  if (!overlay || !input || !results || !openBtn) return;
  var filmsCache = null;
  function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }
  function sanitizeUrl(url) {
    if (!url) return '';
    try {
      var parsed = new URL(url);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return url;
    } catch (_) {}
    return '';
  }
  function openSearch() {
    overlay.classList.add('search-open');
    input.value = '';
    clearNode(results);
    setTimeout(function () { input.focus(); }, 60);
  }
  function closeSearch() {
    overlay.classList.remove('search-open');
    input.value = '';
    clearNode(results);
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
  function addHighlightedText(container, text, query) {
    var source = String(text || '');
    if (!query) {
      container.appendChild(document.createTextNode(source));
      return;
    }

    var escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var re = new RegExp(escaped, 'gi');
    var lastIndex = 0;
    var match = null;

    while ((match = re.exec(source)) !== null) {
      if (match.index > lastIndex) {
        container.appendChild(document.createTextNode(source.slice(lastIndex, match.index)));
      }
      var mark = document.createElement('mark');
      mark.textContent = match[0];
      container.appendChild(mark);
      lastIndex = re.lastIndex;
    }

    if (lastIndex < source.length) {
      container.appendChild(document.createTextNode(source.slice(lastIndex)));
    }
  }
  function render(films, query) {
    clearNode(results);

    if (!films.length) {
      var noResults = document.createElement('p');
      noResults.className = 'search-no-results';
      noResults.textContent = 'No results for "' + query + '"';
      results.appendChild(noResults);
      return;
    }

    films.forEach(function (f) {
      var link = document.createElement('a');
      link.className = 'search-result';
      link.href = 'film.html?id=' + encodeURIComponent(f.slug || '');

      var thumbUrl = sanitizeUrl(f.thumbnail);
      if (thumbUrl) {
        var img = document.createElement('img');
        img.className = 'search-result-thumb';
        img.src = thumbUrl;
        img.alt = '';
        img.addEventListener('error', function () { img.style.visibility = 'hidden'; });
        link.appendChild(img);
      } else {
        var thumbFallback = document.createElement('div');
        thumbFallback.className = 'search-result-thumb';
        link.appendChild(thumbFallback);
      }

      var info = document.createElement('div');
      info.className = 'search-result-info';

      var title = document.createElement('div');
      title.className = 'search-result-title';
      addHighlightedText(title, f.title, query);
      info.appendChild(title);

      var meta = document.createElement('div');
      meta.className = 'search-result-meta';
      addHighlightedText(meta, f.director, query);
      meta.appendChild(document.createTextNode(' | '));
      addHighlightedText(meta, f.genre, query);
      info.appendChild(meta);

      link.appendChild(info);
      results.appendChild(link);
    });
  }
  var debounceTimer;
  input.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    var q = input.value.trim();
    if (!q) { clearNode(results); return; }
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
