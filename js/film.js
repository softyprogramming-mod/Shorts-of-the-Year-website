// Shorts of the Year - Film Page JavaScript

// Get film ID from URL
const urlParams = new URLSearchParams(window.location.search);
const filmId = urlParams.get('id');

// Load film data on page load
document.addEventListener('DOMContentLoaded', async () => {
    if (!filmId) {
        window.location.href = '/';
        return;
    }
    
    await loadFilmData();
});

// Load and display film data
async function loadFilmData() {
    try {
        const response = await fetch('films.json');
        const data = await response.json();
        const film = data.films.find(f => f.slug === filmId);
        
        if (!film || !film.live) {
            window.location.href = '/';
            return;
        }
        
        displayFilm(film);
    } catch (error) {
        console.error('Error loading film:', error);
        window.location.href = '/';
    }
}

// Display film information
function displayFilm(film) {
    // Update page title
    document.getElementById('pageTitle').textContent = `${film.title} | Shorts of the Year`;
    
    // Header section
    document.getElementById('filmTitle').textContent = film.title;
    document.getElementById('filmDirector').textContent = film.director;
    document.getElementById('filmGenre').textContent = film.genre;
    document.getElementById('filmRuntime').textContent = film.runtime + ' min';
    document.getElementById('filmLogline').textContent = film.logline;
    
    // Embed video
    embedVideo(film.filmLink, film.password);
    
    // Review
    document.getElementById('filmReview').textContent = film.review;
    
    // Film info
    document.getElementById('infoDirector').textContent = film.director;
    document.getElementById('infoWriter').textContent = film.writer;
    document.getElementById('infoProducer').textContent = film.producer || 'N/A';
    document.getElementById('infoGenre').textContent = film.genre;
    document.getElementById('infoRuntime').textContent = film.runtime + ' min';
    document.getElementById('infoPremiere').textContent = film.onlinePremiere;
    
    // Hide producer section if no producer
    if (!film.producer) {
        document.getElementById('producerSection').style.display = 'none';
    }
}

// Embed video (Vimeo or YouTube)
function embedVideo(url, password) {
    const container = document.getElementById('videoContainer');
    let embedUrl = '';
    
    // Check if it's Vimeo
    if (url.includes('vimeo.com')) {
        const vimeoId = extractVimeoId(url);
        embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
        if (password) {
            embedUrl += `?h=${password}`;
        }
    }
    // Check if it's YouTube
    else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const youtubeId = extractYouTubeId(url);
        embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
    }
    
    if (embedUrl) {
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; fullscreen; picture-in-picture';
        iframe.allowFullscreen = true;
        container.appendChild(iframe);
    }
}

// Extract Vimeo video ID
function extractVimeoId(url) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : '';
}

// Extract YouTube video ID
function extractYouTubeId(url) {
    let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : '';
}

// Mobile menu toggle
const menuButton = document.getElementById('menuButton');
const navMenu = document.getElementById('navMenu');

if (menuButton) {
    menuButton.addEventListener('click', () => {
        navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
    });
}
