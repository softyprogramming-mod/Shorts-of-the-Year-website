// Shorts of the Year - Main JavaScript

let allFilms = [];
let displayedFilms = 0;
const filmsPerLoad = 9;

document.addEventListener('DOMContentLoaded', async () => {
    // Force navbar transparent immediately while API loads
    var navbar = document.getElementById('navbar');
    if (navbar) {
        navbar.style.setProperty('background-color', 'transparent', 'important');
        navbar.style.setProperty('box-shadow', 'none', 'important');
    }
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
        allFilms = (data.films || [])
            .filter(film => film.live)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
        console.error('Error loading films:', error);
    }
}

// Display featured film (most recent)
function displayFeaturedFilm() {
    if (allFilms.length === 0) return;

    const featured = allFilms[0];
    const masthead = document.getElementById('masthead');

    masthead.style.backgroundImage = `url(${sanitizeUrl(featured.thumbnail)})`;

    // Tell nav.js to recalculate now that the hero image is set
    window.dispatchEvent(new Event("scroll"));

    document.getElementById('featuredTitle').textContent = featured.title;
    document.getElementById('featuredDirector').textContent = featured.director;
    document.getElementById('featuredGenre').textContent = featured.genre;
    document.getElementById('featuredRuntime').textContent = featured.runtime + ' min';

    document.getElementById('featuredFilmLink').href = `film.html?id=${encodeURIComponent(featured.slug)}`;
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
    item.href = `film.html?id=${encodeURIComponent(film.slug)}`;
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
