// Shorts of the Year - Main JavaScript

// Load films data
let allFilms = [];
let displayedFilms = 0;
const filmsPerLoad = 9;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadFilms();
    displayFeaturedFilm();
    displayFilmGrid();
    setupLoadMore();
});

// Load films from JSON
async function loadFilms() {
    try {
        const response = await fetch('films.json');
        const data = await response.json();
        // Filter only live films and sort by timestamp (newest first)
        allFilms = data.films
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
    
    // Set background image
    masthead.style.backgroundImage = `url(${featured.thumbnail})`;
    
    // Set content
    document.getElementById('featuredTitle').textContent = featured.title;
    document.getElementById('featuredDirector').textContent = featured.director;
    document.getElementById('featuredGenre').textContent = featured.genre;
    document.getElementById('featuredRuntime').textContent = featured.runtime + ' min';
    
    // FIX: Target 'featuredFilmLink' instead of 'masthead'
    document.getElementById('featuredFilmLink').href = `film.html?id=${featured.slug}`;
}

// Display film grid (excluding featured film)
function displayFilmGrid() {
    const grid = document.getElementById('filmsGrid');
    
    // Start from index 1 to skip the featured film
    const filmsToShow = allFilms.slice(1, displayedFilms + filmsPerLoad + 1);
    
    filmsToShow.forEach((film, index) => {
        if (index < displayedFilms) return; // Skip already displayed films
        
        const filmItem = createFilmItem(film);
        grid.appendChild(filmItem);
    });
    
    displayedFilms = filmsToShow.length;
    
    // Hide "MORE" button if all films are displayed
    if (displayedFilms >= allFilms.length - 1) {
        document.getElementById('loadMore').style.display = 'none';
    }
}

// Create film item element
function createFilmItem(film) {
    const item = document.createElement('a');
    item.href = `film.html?id=${film.slug}`;
    item.className = 'film-item';
    item.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%), url(${film.thumbnail})`;
    
    item.innerHTML = `
        <div class="film-content">
            <h2>${film.title}</h2>
            <div class="meta">
                ${film.director}
                <span class="meta-separator">|</span>
                ${film.genre}
                <span class="meta-separator">|</span>
                ${film.runtime} min
            </div>
        </div>
    `;
    
    return item;
}

// Setup "Load More" button
function setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMore');
    loadMoreBtn.addEventListener('click', displayFilmGrid);
}

// Mobile menu toggle (if needed later)
const menuButton = document.getElementById('menuButton');
const navMenu = document.getElementById('navMenu');

if (menuButton) {
    menuButton.addEventListener('click', () => {
        navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
    });
}
