/**
 * SHORTS OF THE YEAR - main.js
 * Uses safe DOM creation (no innerHTML for user-supplied data)
 * Now fetches from MongoDB via Vercel API instead of films.json
 */

const API_BASE = 'https://softy-api-phi.vercel.app/api';
const FILMS_PER_PAGE = 12;

let allFilms = [];
let displayedCount = 0;

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', () => {
  loadFilms();
  document.getElementById('loadMore').addEventListener('click', showMoreFilms);
});

// ==================== DATA FETCHING ====================

async function loadFilms() {
  try {
    const res = await fetch(`${API_BASE}/films`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    allFilms = data.films || [];

    if (allFilms.length === 0) return;

    renderFeatured(allFilms[0]);
    renderGrid(allFilms.slice(1, FILMS_PER_PAGE + 1));
    displayedCount = FILMS_PER_PAGE + 1;

    if (displayedCount >= allFilms.length) {
      document.querySelector('.load-more').style.display = 'none';
    }
  } catch (err) {
    console.error('Failed to load films:', err);
  }
}

// ==================== FEATURED FILM ====================

function renderFeatured(film) {
  // Set background image safely (URL only, not HTML)
  const masthead = document.getElementById('masthead');
  const safeThumb = sanitizeUrl(film.thumbnail);
  masthead.style.backgroundImage = `url('${safeThumb}')`;

  const link = document.getElementById('featuredFilmLink');
  link.href = `/film.html?id=${encodeURIComponent(film.id)}`;

  // Use textContent — never innerHTML — for user data
  document.getElementById('featuredTitle').textContent = film.title;
  document.getElementById('featuredDirector').textContent = film.director;
  document.getElementById('featuredGenre').textContent = film.genre;
  document.getElementById('featuredRuntime').textContent = film.runtime;
}

// ==================== FILM GRID ====================

function renderGrid(films) {
  const grid = document.getElementById('filmsGrid');
  films.forEach(film => {
    const card = createFilmCard(film);
    grid.appendChild(card);
  });
}

/**
 * Build a film card entirely with DOM methods.
 * Zero innerHTML — all user data goes through textContent or setAttribute.
 */
function createFilmCard(film) {
  const card = document.createElement('a');
  card.className = 'film-card';
  card.href = `/film.html?id=${encodeURIComponent(film.id)}`;

  // Thumbnail
  const thumbWrap = document.createElement('div');
  thumbWrap.className = 'film-card-thumb';

  const img = document.createElement('img');
  img.src = sanitizeUrl(film.thumbnail);
  img.alt = ''; // decorative — title is shown below
  img.loading = 'lazy';
  thumbWrap.appendChild(img);

  // Genre badge
  const badge = document.createElement('span');
  badge.className = 'film-card-genre';
  badge.textContent = film.genre; // textContent, safe
  thumbWrap.appendChild(badge);

  card.appendChild(thumbWrap);

  // Info
  const info = document.createElement('div');
  info.className = 'film-card-info';

  const title = document.createElement('h3');
  title.className = 'film-card-title';
  title.textContent = film.title; // textContent, safe

  const meta = document.createElement('p');
  meta.className = 'film-card-meta';
  meta.textContent = `${film.director} · ${film.runtime}`; // textContent, safe

  info.appendChild(title);
  info.appendChild(meta);
  card.appendChild(info);

  return card;
}

// ==================== LOAD MORE ====================

function showMoreFilms() {
  const next = allFilms.slice(displayedCount, displayedCount + FILMS_PER_PAGE);
  renderGrid(next);
  displayedCount += next.length;

  if (displayedCount >= allFilms.length) {
    document.querySelector('.load-more').style.display = 'none';
  }
}

// ==================== UTILS ====================

/**
 * Only allow http/https URLs to prevent javascript: injection in src/href
 */
function sanitizeUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return url;
    }
  } catch (_) {}
  return '';
}

// Expose for search.js
window.allFilms = allFilms;
window.createFilmCard = createFilmCard;
