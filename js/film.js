// Shorts of the Year - Film Page JavaScript

const urlParams = new URLSearchParams(window.location.search);
const filmId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', async () => {
    if (!filmId) {
        window.location.href = '/';
        return;
    }
    await loadFilmData();
});

async function loadFilmData() {
    try {
        const response = await fetch('https://softy-api-phi.vercel.app/api/films');
        const data = await response.json();
        const film = (data.films || []).find(f => f.slug === filmId);

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

function displayFilm(film) {
    document.getElementById('pageTitle').textContent = `${film.title} | Shorts of the Year`;

    document.getElementById('filmTitle').textContent = film.title;
    document.getElementById('filmDirector').textContent = film.director;
    document.getElementById('filmGenre').textContent = film.genre;
    document.getElementById('filmRuntime').textContent = film.runtime + ' min';
    document.getElementById('filmLogline').textContent = film.logline;

    embedVideo(film.filmLink);

    document.getElementById('filmReview').textContent = film.review;

    document.getElementById('infoDirector').textContent = film.director;
    document.getElementById('infoWriter').textContent = film.writer;
    document.getElementById('infoProducer').textContent = film.producer || 'N/A';
    document.getElementById('infoGenre').textContent = film.genre;
    document.getElementById('infoRuntime').textContent = film.runtime + ' min';
    document.getElementById('infoPremiere').textContent = film.onlinePremiere;

    if (!film.producer) {
        document.getElementById('producerSection').style.display = 'none';
    }

    // Cast
    if (film.cast) {
        document.getElementById('infoCast').textContent = film.cast;
    } else {
        document.getElementById('castSection').style.display = 'none';
    }

    // Language
    if (film.language) {
        document.getElementById('infoLanguage').textContent = film.language;
    } else {
        document.getElementById('languageSection').style.display = 'none';
    }
}

function embedVideo(url) {
    const container = document.getElementById('videoContainer');
    let embedUrl = '';

    if (url.includes('vimeo.com')) {
        const vimeo = extractVimeoData(url);
        if (vimeo.id) {
            embedUrl = `https://player.vimeo.com/video/${vimeo.id}`;
            // Use hash only from Vimeo URL formats (vimeo.com/{id}/{hash}) or ?h=
            const hash = vimeo.hash;
            if (hash) {
                embedUrl += `?h=${encodeURIComponent(hash)}`;
            }
        }
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
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

function extractVimeoData(url) {
    try {
        const parsed = new URL(url);
        const parts = parsed.pathname.split('/').filter(Boolean);
        const id = parts[0] && /^\d+$/.test(parts[0]) ? parts[0] : '';
        const hashFromPath = parts[1] || '';
        const hashFromQuery = parsed.searchParams.get('h') || '';
        return { id, hash: hashFromPath || hashFromQuery };
    } catch (_) {
        const match = String(url).match(/vimeo\.com\/(\d+)(?:\/([a-zA-Z0-9]+))?/);
        return {
            id: match ? match[1] : '',
            hash: match && match[2] ? match[2] : ''
        };
    }
}

function extractYouTubeId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : '';
}

const menuButton = document.getElementById('menuButton');
const navMenu = document.getElementById('navMenu');
if (menuButton) {
    menuButton.addEventListener('click', () => {
        navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
    });
}
