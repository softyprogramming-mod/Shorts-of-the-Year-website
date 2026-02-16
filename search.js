// Search functionality for Shorts of the Year

document.addEventListener('DOMContentLoaded', () => {
    const searchIcon = document.querySelector('.search-icon');
    const body = document.body;
    
    // Create search overlay
    const searchOverlay = document.createElement('div');
    searchOverlay.className = 'search-overlay';
    searchOverlay.innerHTML = `
        <div class="search-container">
            <input type="text" class="search-input" placeholder="Search films by title, director, or genre..." autofocus>
            <button class="search-close">×</button>
        </div>
        <div class="search-results"></div>
    `;
    body.appendChild(searchOverlay);
    
    const searchInput = searchOverlay.querySelector('.search-input');
    const searchResults = searchOverlay.querySelector('.search-results');
    const searchClose = searchOverlay.querySelector('.search-close');
    
    // Open search
    searchIcon.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        searchInput.focus();
    });
    
    // Close search
    searchClose.addEventListener('click', closeSearch);
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            closeSearch();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            closeSearch();
        }
    });
    
    function closeSearch() {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
    }
    
    // Search functionality
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const query = searchInput.value.trim().toLowerCase();
        
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }
        
        searchTimeout = setTimeout(() => performSearch(query), 300);
    });
    
    async function performSearch(query) {
        try {
            const response = await fetch('films.json');
            const data = await response.json();
            const liveFilms = data.films.filter(film => film.live);
            
            const results = liveFilms.filter(film => {
                return film.title.toLowerCase().includes(query) ||
                       film.director.toLowerCase().includes(query) ||
                       film.genre.toLowerCase().includes(query);
            });
            
            displayResults(results, query);
        } catch (error) {
            console.error('Search error:', error);
            searchResults.innerHTML = '<div class="search-error">Unable to search at this time</div>';
        }
    }
    
    function displayResults(results, query) {
        if (results.length === 0) {
            searchResults.innerHTML = `<div class="no-results">No films found for "${query}"</div>`;
            return;
        }
        
        const resultsHTML = results.map(film => `
            <a href="film.html?id=${film.slug}" class="search-result-item">
                <div class="search-result-thumb" style="background-image: url('${film.thumbnail}')"></div>
                <div class="search-result-info">
                    <h3>${highlightMatch(film.title, query)}</h3>
                    <p>${highlightMatch(film.director, query)} • ${highlightMatch(film.genre, query)} • ${film.runtime} min</p>
                </div>
            </a>
        `).join('');
        
        searchResults.innerHTML = resultsHTML;
    }
    
    function highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
});
