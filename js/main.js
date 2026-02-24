// Shorts of the Year - Main JavaScript

let allFilms = [];
let displayedFilms = 0;
const filmsPerLoad = 9;
let featuredTitleInteractiveTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Homepage mobile: allow native pull-to-refresh behavior.
    if (window.matchMedia('(max-width: 768px)').matches) {
        document.documentElement.style.overscrollBehaviorY = 'auto';
        document.body.style.overscrollBehaviorY = 'auto';
        document.body.style.webkitOverflowScrolling = 'touch';
    }

    // Keep homepage hero fallback pure black while the API/image loads.
    // Gray fallback reads like a broken frame with the new <img>-based hero.
    const masthead = document.getElementById('masthead');
    const featuredMeta = document.getElementById('featuredMeta');
    if (masthead) {
        masthead.classList.remove('masthead--ready');
        masthead.style.backgroundImage = 'none';
    }
    if (featuredMeta) featuredMeta.classList.remove('masthead-meta--ready');

    await loadFilms();
    displayFeaturedFilm();
    displayFilmGrid();
    setupLoadMore();
});

// Load films from MongoDB API
async function loadFilms() {
    try {
        const response = await fetch('https://softy-api-phi.vercel.app/api/films');
        const data = await response.json();
        // Respect API order (admin drag-reorder sets the homepage hero order).
        allFilms = (data.films || []).filter(film => film.live);
    } catch (error) {
        console.error('Error loading films:', error);
    }
}

// Display featured film (most recent)
function displayFeaturedFilm() {
    const featuredTitle = document.getElementById('featuredTitle');
    const featuredMeta = document.getElementById('featuredMeta');
    if (!featuredTitle) return;

    if (allFilms.length === 0) {
        if (featuredTitleInteractiveTimer) {
            clearTimeout(featuredTitleInteractiveTimer);
            featuredTitleInteractiveTimer = null;
        }
        featuredTitle.classList.remove('featured-title--ready', 'featured-title--interactive');
        if (featuredMeta) featuredMeta.classList.remove('masthead-meta--ready');
        featuredTitle.textContent = '';
        const masthead = document.getElementById('masthead');
        if (masthead) masthead.style.backgroundImage = 'none';
        return;
    }

    const featured = allFilms[0];
    const masthead = document.getElementById('masthead');

    if (featuredTitleInteractiveTimer) {
        clearTimeout(featuredTitleInteractiveTimer);
        featuredTitleInteractiveTimer = null;
    }
    featuredTitle.classList.remove('featured-title--ready', 'featured-title--interactive');
    featuredTitle.textContent = featured.title;
    requestAnimationFrame(() => {
        featuredTitle.classList.add('featured-title--ready');
        featuredTitleInteractiveTimer = setTimeout(() => {
            featuredTitle.classList.add('featured-title--interactive');
        }, 950);
    });
    document.getElementById('featuredDirector').textContent = featured.director;
    document.getElementById('featuredGenre').textContent = featured.genre;
    document.getElementById('featuredRuntime').textContent = featured.runtime + ' min';
    if (featuredMeta) featuredMeta.classList.add('masthead-meta--ready');

    document.getElementById('featuredFilmLink').href = `film.html?id=${featured.slug}`;

    const heroUrl = sanitizeUrl(featured.thumbnail);
    if (!masthead) return;
    if (!heroUrl) {
        masthead.style.backgroundImage = 'none';
        masthead.classList.add('masthead--ready');
        return;
    }

    const img = new Image();
    img.onload = () => {
        const safeCssUrl = heroUrl.replace(/"/g, '%22');
        masthead.style.backgroundImage = `url("${safeCssUrl}")`;
        requestAnimationFrame(() => masthead.classList.add('masthead--ready'));
    };
    img.onerror = () => {
        masthead.style.backgroundImage = 'none';
        masthead.classList.add('masthead--ready');
    };
    img.src = heroUrl;
}

// Display film grid
function displayFilmGrid() {
    const grid = document.getElementById('filmsGrid');

    const filmsToShow = allFilms.slice(1, displayedFilms + filmsPerLoad + 1);

    filmsToShow.forEach((film, index) => {
        if (index < displayedFilms) return;
        const filmItem = createFilmItem(film);
        grid.appendChild(filmItem);
    });

    displayedFilms = filmsToShow.length;

    if (displayedFilms >= allFilms.length - 1) {
        document.getElementById('loadMore').style.display = 'none';
    }
}

// Create film item using safe DOM methods (no innerHTML for user data)
function createFilmItem(film) {
    const item = document.createElement('a');
    item.href = `film.html?id=${film.slug}`;
    item.className = 'film-item';
    item.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%), url(${sanitizeUrl(film.thumbnail)})`;

    const content = document.createElement('div');
    content.className = 'film-content';

    const title = document.createElement('h2');
    title.textContent = film.title;

    const meta = document.createElement('div');
    meta.className = 'meta';

    const director = document.createTextNode(film.director);
    const sep1 = document.createElement('span');
    sep1.className = 'meta-separator';
    sep1.textContent = '|';
    const genre = document.createTextNode(film.genre);
    const sep2 = document.createElement('span');
    sep2.className = 'meta-separator';
    sep2.textContent = '|';
    const runtime = document.createTextNode(film.runtime + ' min');

    meta.appendChild(director);
    meta.appendChild(sep1);
    meta.appendChild(genre);
    meta.appendChild(sep2);
    meta.appendChild(runtime);

    content.appendChild(title);
    content.appendChild(meta);
    item.appendChild(content);

    return item;
}

function setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMore');
    loadMoreBtn.addEventListener('click', displayFilmGrid);
}

// Only allow http/https URLs
function sanitizeUrl(url) {
    if (!url) return '';
    try {
        const parsed = new URL(url);
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return url;
    } catch (_) {}
    return '';
}

const menuButton = document.getElementById('menuButton');
const navMenu = document.getElementById('navMenu');

if (menuButton) {
    menuButton.addEventListener('click', () => {
        navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
    });
}
