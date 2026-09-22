const firebaseConfig = {
    apiKey: "AIzaSyDdhpsdVNY58rZCdlVoLF07850GUMyWjxI",
    authDomain: "revoltflix-6d205.firebaseapp.com",
    projectId: "revoltflix-6d205",
    storageBucket: "revoltflix-6d205.firebasestorage.app",
    messagingSenderId: "687163146166",
    appId: "1:687163146166:web:58c21ffcb48580f0778b17"
};

firebase.initializeApp(firebaseConfig);

const activeProfile = localStorage.getItem('activeProfile');
if (!activeProfile) {
    window.location.href = "watching.html";
} else {
    const profile = JSON.parse(activeProfile);
    const profileBadge = document.getElementById('profileBadge');
    if (profileBadge) profileBadge.innerText = profile.name;
}

lucide.createIcons();

function switchToProfileSelect() {
    localStorage.removeItem('activeProfile');
    window.location.href = "watching.html";
}

let currentCategory = 'movies';
const audioDock = document.getElementById('audioDock');

const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        currentCategory = item.getAttribute('data-category');
        
        const categoryTitleElement = document.getElementById('categoryTitle');
        if (categoryTitleElement) {
            if (currentCategory === 'youtube') {
                categoryTitleElement.innerHTML = '<span style="color:var(--brand-red);">Revolt</span>Tube';
            } else {
                categoryTitleElement.innerText = item.innerText.trim();
            }
        }

        const switcherContainer = document.getElementById('musicSwitcherContainer');
        const searchInput = document.getElementById('searchInput');
        const grid = document.getElementById('contentGrid');

        if (currentCategory === 'music') {
            if (audioDock) audioDock.style.display = 'flex';
            if (switcherContainer) switcherContainer.style.display = 'flex';
            if (searchInput) searchInput.placeholder = "Search music...";
            if (grid) {
                grid.style.display = 'flex';
                grid.style.flexDirection = 'column';
                grid.style.gap = '8px';
            }
            fetchMusicData('jamendo');
        } else {
            if (audioDock) audioDock.style.display = 'none';
            if (switcherContainer) switcherContainer.style.display = 'none';
            if (searchInput) searchInput.placeholder = `Search ${currentCategory}...`;
            if (grid) {
                grid.style.display = 'grid';
                grid.style.flexDirection = '';
                grid.style.gridTemplateColumns = '';
                grid.style.gap = '';
            }
            fetchCategoryData(currentCategory);
        }
    });
});

const BACKEND_URL = "https://revolt-flix-backend.vercel.app/api";
let currentMediaData = [];
let activeMediaId = null;
let currentMusicProvider = 'jamendo';

function switchMusicProvider(provider) {
    currentMusicProvider = provider;
    document.querySelectorAll('.rounded-switcher-btn').forEach(btn => {
        if (btn.getAttribute('data-provider') === provider) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    fetchMusicData(provider);
}

async function fetchMusicData(provider, query = '') {
    const grid = document.getElementById('contentGrid');
    if (!grid) return;

    if (provider === 'deezer') {
        grid.innerHTML = `<p class="loading-text">No data available for Deezer yet.</p>`;
        return;
    }

    fetchCategoryData('jamendo', query);
}

function resolveImageUrl(item) {
    if (!item) return 'https://via.placeholder.com/500x750/141414/ffffff?text=No+Image';

    const rawImage = item.poster_path || item.poster || item.thumbnail || item.image || item.album_image || item.backdrop_path;
    
    if (!rawImage || rawImage === 'null' || rawImage === 'undefined') {
        return 'https://via.placeholder.com/500x750/141414/ffffff?text=No+Poster';
    }
    
    if (typeof rawImage === 'string' && (rawImage.startsWith('http://') || rawImage.startsWith('https://'))) {
        return rawImage;
    }
    
    const cleanPath = String(rawImage).startsWith('/') ? rawImage : `/${rawImage}`;
    return `https://image.tmdb.org/t/p/w500${cleanPath}`;
}

async function fetchCategoryData(category, query = '') {
    const grid = document.getElementById('contentGrid');
    if (!grid) return;

    if (category === 'youtube' && !query) {
        grid.innerHTML = `
            <div class="youtube-placeholder" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 50vh; text-align: center; color: #888; gap: 15px;">
                <i data-lucide="search" style="width: 48px; height: 48px; color: var(--brand-red);"></i>
                <p style="font-size: 1.2rem; font-weight: 500; margin: 0; color: #fff;">Look for any youtube video Via RevoltFlix's SearchBar.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    if (category === 'music') {
        fetchMusicData(currentMusicProvider, query);
        return;
    }

    grid.innerHTML = `<p class="loading-text">Loading ${category}...</p>`;

    try {
        let endpoint = `${BACKEND_URL}/get-${category}`;
        if (query) {
            endpoint += `?q=${encodeURIComponent(query)}`;
        }

        const response = await fetch(endpoint);
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error("Backend returned an error or non-array object:", data);
            grid.innerHTML = `<p class="loading-text" style="color: var(--brand-red);">Backend Error: ${data.error || 'Invalid API Key or Route'}</p>`;
            return;
        }

        currentMediaData = data;

        if (data.length === 0) {
            grid.innerHTML = `<p class="loading-text">No results found.</p>`;
            return;
        }

        if (category === 'movies' || category === 'series') {
            grid.innerHTML = data.map(item => {
                const title = item.title || item.name || 'Untitled';
                const date = item.release_date || item.first_air_date || '';
                const year = date ? date.split('-')[0] : '';
                const posterUrl = resolveImageUrl(item);
                const tag = category === 'series' ? 'SERIES' : 'MOVIE';

                return `
                    <div class="movie-card" onclick="openDetailsModal(${item.id})">
                        <div class="card-img-wrapper">
                            <img src="${posterUrl}" alt="${title.replace(/"/g, '&quot;')}" class="card-img" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/500x750/141414/ffffff?text=Image+Unavailable';">
                            <span class="card-meta-badge">${tag}</span>
                            <div class="card-overlay">
                                <div class="play-icon-badge"></div>
                            </div>
                        </div>
                        <div class="card-details">
                            <p class="card-title">${title}</p>
                            ${year ? `<p class="card-subtitle"><span>${year}</span></p>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        } else if (category === 'youtube') {
            grid.innerHTML = data.map(item => {
                const title = item.title || 'YouTube Video';
                const posterUrl = resolveImageUrl(item);

                return `
                    <div class="movie-card" onclick="playYouTubeVideo('${item.id}')">
                        <div class="card-img-wrapper">
                            <img src="${posterUrl}" alt="${title.replace(/"/g, '&quot;')}" class="card-img" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/500x750/141414/ffffff?text=Video+Thumbnail';">
                            <span class="card-meta-badge">VIDEO</span>
                            <div class="card-overlay">
                                <div class="play-icon-badge"></div>
                            </div>
                        </div>
                        <div class="card-details">
                            <p class="card-title">${title}</p>
                        </div>
                    </div>
                `;
            }).join('');
        } else if (category === 'jamendo') {
            grid.innerHTML = data.map((item, index) => {
                const safeTitle = (item.title || 'Unknown Title').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const safeArtist = (item.artist || 'Unknown Artist').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const coverUrl = resolveImageUrl(item);

                return `
                    <div class="music-track-row" onclick="playJamendoTrack('${item.audio_url}', '${safeTitle}', '${safeArtist}', '${coverUrl}')">
                        <span class="track-number">${index + 1}</span>
                        <img src="${coverUrl}" alt="Cover" class="track-cover" onerror="this.onerror=null;this.src='https://via.placeholder.com/100x100/141414/ffffff?text=Music';">
                        <div class="track-info">
                            <p class="track-title">${item.title || 'Unknown Title'}</p>
                            <p class="track-artist">${item.artist || 'Unknown Artist'}</p>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            grid.innerHTML = `<p class="loading-text">Loaded ${data.length || 0} items for ${category}.</p>`;
        }
    } catch (error) {
        console.error("Fetch failed:", error);
        grid.innerHTML = `<p class="loading-text" style="color: var(--brand-red);">Error connecting to API.</p>`;
    }
}

function openDetailsModal(tmdbId) {
    activeMediaId = tmdbId;
    const media = currentMediaData.find(m => m.id == tmdbId);
    if (!media) return;

    const detailTitle = document.getElementById('detailTitle');
    const detailOverview = document.getElementById('detailOverview');
    const detailPoster = document.getElementById('detailPoster');
    const detailsModal = document.getElementById('detailsModal');
    const actionArea = document.getElementById('actionArea');

    if (detailTitle) detailTitle.innerText = media.title || media.name || 'Untitled';
    if (detailOverview) detailOverview.innerText = media.overview || "No description available for this title.";
    if (detailPoster) detailPoster.src = resolveImageUrl(media);
    
    if (actionArea) {
        if (currentCategory === 'movies') {
            actionArea.innerHTML = `<button class="watch-btn" onclick="playMovie()">Watch Movie</button>`;
        } else if (currentCategory === 'series') {
            actionArea.innerHTML = `<button class="watch-btn" onclick="playSeriesEpisode(1, 1)">Watch S1 E1</button>`;
        }
    }

    if (detailsModal) detailsModal.style.display = 'flex';
}

function playMovie() {
    if (!activeMediaId) return;
    const modal = document.getElementById('playerModal');
    if (!modal) return;
    const container = modal.querySelector('.player-frame-container');
    if (!container) return;
    container.innerHTML = `
        <button class="close-player-btn" onclick="closePlayer()">Close</button>
        <iframe id="videoPlayer" class="video-iframe" src="https://vidsrc.sbs/embed/movie/${activeMediaId}" sandbox="allow-scripts allow-same-origin allow-presentation" allowfullscreen></iframe>
    `;
    modal.style.display = 'flex';
}

function playSeriesEpisode(season, episode) {
    if (!activeMediaId) return;
    const modal = document.getElementById('playerModal');
    if (!modal) return;
    const container = modal.querySelector('.player-frame-container');
    if (!container) return;
    container.innerHTML = `
        <button class="close-player-btn" onclick="closePlayer()">Close</button>
        <iframe id="videoPlayer" class="video-iframe" src="https://vidsrc.sbs/embed/tv/${activeMediaId}/${season}/${episode}" sandbox="allow-scripts allow-same-origin allow-presentation" allowfullscreen></iframe>
    `;
    modal.style.display = 'flex';
}

function playYouTubeVideo(videoId) {
    const video = currentMediaData.find(m => m.id === videoId);
    const title = video ? (video.title || "YouTube Video") : "YouTube Video";
    
    const modal = document.getElementById('playerModal');
    if (!modal) return;
    const container = modal.querySelector('.player-frame-container');
    if (!container) return;
    
    container.innerHTML = `
        <button class="close-player-btn" onclick="closePlayer()">Close</button>
        <div class="youtube-watch-layout">
            <div class="youtube-primary-column">
                <div class="youtube-player-wrapper">
                    <iframe id="videoPlayer" class="video-iframe" src="https://www.youtube.com/embed/${videoId}?autoplay=1" sandbox="allow-scripts allow-same-origin allow-presentation" allowfullscreen></iframe>
                </div>
                <h2 class="youtube-video-title">${title}</h2>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function closeDetailsModal() {
    const detailsModal = document.getElementById('detailsModal');
    if (detailsModal) detailsModal.style.display = 'none';
}

function closePlayer() {
    const playerModal = document.getElementById('playerModal');
    if (playerModal) playerModal.style.display = 'none';
}

const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value;
        currentCategory === 'music' ? fetchMusicData(currentMusicProvider, query) : fetchCategoryData(currentCategory, query);
    });
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value;
            currentCategory === 'music' ? fetchMusicData(currentMusicProvider, query) : fetchCategoryData(currentCategory, query);
        }
    });
}

fetchCategoryData('movies');
