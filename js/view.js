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
    window.location.href = "html/watching.html";
} else {
    const profile = JSON.parse(activeProfile);
    document.getElementById('profileBadge').innerText = profile.name;
}

lucide.createIcons();

function switchToProfileSelect() {
    localStorage.removeItem('activeProfile');
    window.location.href = "html/watching.html";
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
        if (currentCategory === 'youtube') {
            categoryTitleElement.innerHTML = '<span style="color:var(--brand-red);">Revolt</span>Tube';
        } else {
            categoryTitleElement.innerText = item.innerText.trim();
        }

        const switcherContainer = document.getElementById('musicSwitcherContainer');
        const searchInput = document.getElementById('searchInput');
        const grid = document.getElementById('contentGrid');

        if (currentCategory === 'music') {
            audioDock.style.display = 'flex';
            switcherContainer.style.display = 'flex';
            searchInput.placeholder = "Search music...";
            grid.style.display = 'flex';
            grid.style.flexDirection = 'column';
            grid.style.gap = '8px';
            fetchMusicData('jamendo');
        } else {
            audioDock.style.display = 'none';
            switcherContainer.style.display = 'none';
            searchInput.placeholder = `Search ${currentCategory}...`;
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
            grid.style.gap = '20px';
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

    if (provider === 'deezer') {
        grid.innerHTML = `<p class="loading-text">No data available for Deezer yet.</p>`;
        return;
    }

    fetchCategoryData('jamendo', query);
}

async function fetchCategoryData(category, query = '') {
    const grid = document.getElementById('contentGrid');

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
        if (!response.ok) throw new Error("Failed to fetch data from backend.");
        
        const data = await response.json();
        currentMediaData = data;

        if (data.length === 0) {
            grid.innerHTML = `<p class="loading-text">No results found.</p>`;
            return;
        }

        if (category === 'movies' || category === 'series') {
            grid.innerHTML = data.map(item => `
                <div class="movie-card" onclick="openDetailsModal(${item.id})">
                    <div class="card-img-wrapper">
                        <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${(item.title || item.name || '').replace(/"/g, '&quot;')}" class="card-img">
                    </div>
                    <p class="card-title">${item.title || item.name}</p>
                </div>
            `).join('');
        } else if (category === 'youtube') {
            grid.innerHTML = data.map(item => `
                <div class="movie-card" onclick="playYouTubeVideo('${item.id}')">
                    <div class="card-img-wrapper">
                        <img src="${item.poster_path}" alt="${(item.title || '').replace(/"/g, '&quot;')}" class="card-img">
                    </div>
                    <p class="card-title">${item.title}</p>
                </div>
            `).join('');
        } else if (category === 'jamendo') {
            grid.innerHTML = data.map((item, index) => {
                const safeTitle = (item.title || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const safeArtist = (item.artist || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                return `
                    <div class="music-track-row" onclick="playJamendoTrack('${item.audio_url}', '${safeTitle}', '${safeArtist}', '${item.poster_path}')">
                        <span class="track-number">${index + 1}</span>
                        <img src="${item.poster_path}" alt="Cover" class="track-cover">
                        <div class="track-info">
                            <p class="track-title">${item.title}</p>
                            <p class="track-artist">${item.artist}</p>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            grid.innerHTML = `<p class="loading-text">Loaded ${data.length || 0} items for ${category}.</p>`;
        }
    } catch (error) {
        grid.innerHTML = `<p class="loading-text" style="color: var(--brand-red);">Error connecting to API.</p>`;
    }
}

function openDetailsModal(tmdbId) {
    activeMediaId = tmdbId;
    const media = currentMediaData.find(m => m.id == tmdbId);
    if (!media) return;

    document.getElementById('detailTitle').innerText = media.title || media.name;
    document.getElementById('detailOverview').innerText = media.overview || "No description available for this title.";
    document.getElementById('detailPoster').src = `https://image.tmdb.org/t/p/w500${media.poster_path}`;
    
    const actionArea = document.getElementById('actionArea');

    if (currentCategory === 'movies') {
        actionArea.innerHTML = `<button class="watch-btn" onclick="playMovie()">Watch</button>`;
    } else if (currentCategory === 'series') {
        actionArea.innerHTML = `<button class="watch-btn" onclick="playSeriesEpisode(1, 1)">Watch S1 E1</button>`;
    }

    document.getElementById('detailsModal').style.display = 'flex';
}

function playMovie() {
    if (!activeMediaId) return;
    const modal = document.getElementById('playerModal');
    const container = modal.querySelector('.player-frame-container');
    container.innerHTML = `
        <button class="close-player-btn" onclick="closePlayer()">Close</button>
        <iframe id="videoPlayer" class="video-iframe" src="https://vidsrc.sbs/embed/movie/${activeMediaId}" sandbox="allow-scripts allow-same-origin allow-presentation" allowfullscreen></iframe>
    `;
    modal.style.display = 'flex';
}

function playSeriesEpisode(season, episode) {
    if (!activeMediaId) return;
    const modal = document.getElementById('playerModal');
    const container = modal.querySelector('.player-frame-container');
    container.innerHTML = `
        <button class="close-player-btn" onclick="closePlayer()">Close</button>
        <iframe id="videoPlayer" class="video-iframe" src="https://vidsrc.sbs/embed/tv/${activeMediaId}/${season}/${episode}" sandbox="allow-scripts allow-same-origin allow-presentation" allowfullscreen></iframe>
    `;
    modal.style.display = 'flex';
}

function playYouTubeVideo(videoId) {
    const video = currentMediaData.find(m => m.id === videoId);
    const title = video ? video.title : "YouTube Video";
    
    const modal = document.getElementById('playerModal');
    const container = modal.querySelector('.player-frame-container');
    
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
    document.getElementById('detailsModal').style.display = 'none';
}

function closePlayer() {
    document.getElementById('playerModal').style.display = 'none';
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
