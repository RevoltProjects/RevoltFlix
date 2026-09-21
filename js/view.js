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
        if (currentCategory === 'music') {
            switcherContainer.style.display = 'flex';
            fetchMusicData('jamendo');
        } else {
            switcherContainer.style.display = 'none';
            document.getElementById('searchInput').placeholder = `Search ${currentCategory}...`;
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

    if (provider === 'jamendo' && !query) {
        fetchCategoryData('jamendo', '');
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
                    <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${item.title || item.name}" class="card-img">
                    <p class="card-title">${item.title || item.name}</p>
                </div>
            `).join('');
        } else if (category === 'youtube') {
            grid.innerHTML = data.map(item => `
                <div class="movie-card" onclick="playYouTubeVideo('${item.id}')">
                    <img src="${item.poster_path}" alt="${item.title}" class="card-img">
                    <p class="card-title">${item.title}</p>
                </div>
            `).join('');
        } else if (category === 'jamendo') {
            grid.innerHTML = data.map(item => `
                <div class="movie-card" onclick="openMusicDetails('${item.id}')">
                    <img src="${item.poster_path}" alt="${item.title}" class="card-img">
                    <p class="card-title">${item.title} - ${item.artist}</p>
                </div>
            `).join('');
        } else {
            grid.innerHTML = `<p class="loading-text">Loaded ${data.length || 0} items for ${category}.</p>`;
        }
    } catch (error) {
        grid.innerHTML = `<p class="loading-text" style="color: var(--brand-red);">Error connecting to Vercel API function.</p>`;
    }
}

function openMusicDetails(trackId) {
    activeMediaId = trackId;
    const track = currentMediaData.find(m => m.id == trackId);
    if (!track) return;

    document.getElementById('detailTitle').innerText = track.title;
    document.getElementById('detailOverview').innerText = `Artist: ${track.artist}\nStreamable track via Jamendo Music. Click listen to start playback.`;
    document.getElementById('detailPoster').src = track.poster_path;
    
    const actionArea = document.getElementById('actionArea');
    actionArea.innerHTML = `<button class="watch-btn" onclick="playJamendoTrack('${track.audio_url}')">Listen</button>`;

    document.getElementById('detailsModal').style.display = 'flex';
}

function playJamendoTrack(audioUrl) {
    const modal = document.getElementById('playerModal');
    const container = modal.querySelector('.player-frame-container');
    container.innerHTML = `
        <button class="close-player-btn" onclick="closePlayer()">Close</button>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 20px;">
            <h2 style="color: #fff;">Now Playing Audio</h2>
            <audio controls autoplay style="width: 80%;">
                <source src="${audioUrl}" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
        </div>
    `;
    modal.style.display = 'flex';
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
        actionArea.innerHTML = `
            <div class="series-setup">
                <div class="season-selector-wrapper">
                    <label style="font-size: 0.85rem; color: #888; display: block; margin-bottom: 5px;">Season:</label>
                    <select id="seasonSelect" class="styled-select" onchange="updateEpisodesList()">
                        <option value="1">Season 1</option>
                        <option value="2">Season 2</option>
                        <option value="3">Season 3</option>
                        <option value="4">Season 4</option>
                        <option value="5">Season 5</option>
                    </select>
                </div>
                <div class="episodes-wrapper">
                    <label style="font-size: 0.85rem; color: #888; display: block; margin-bottom: 5px;">Episodes:</label>
                    <div id="episodesGrid" class="episodes-grid"></div>
                </div>
            </div>
        `;
        updateEpisodesList();
    }

    document.getElementById('detailsModal').style.display = 'flex';
}

function updateEpisodesList() {
    const seasonNum = document.getElementById('seasonSelect').value;
    const episodesGrid = document.getElementById('episodesGrid');
    
    let html = '';
    for (let ep = 1; ep <= 12; ep++) {
        html += `<button class="ep-box" onclick="playSeriesEpisode(${seasonNum}, ${ep})">${ep}</button>`;
    }
    episodesGrid.innerHTML = html;
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
    const sidebarVideos = currentMediaData.filter(m => m.id !== videoId);

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
            <div class="youtube-sidebar-column">
                <h3 class="up-next-header">Up Next on <span style="color:var(--brand-red);">Revolt</span>Tube</h3>
                <div class="youtube-sidebar-list">
                    ${sidebarVideos.map(item => `
                        <div class="youtube-mini-card" onclick="playYouTubeVideo('${item.id}')">
                            <img src="${item.poster_path}" alt="${item.title}" class="youtube-mini-thumb">
                            <div class="youtube-mini-info">
                                <p class="youtube-mini-title">${item.title}</p>
                                <p class="youtube-mini-channel">${item.channelTitle || ''}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

function closePlayer() {
    const modal = document.getElementById('playerModal');
    const container = modal.querySelector('.player-frame-container');
    container.innerHTML = `
        <button class="close-player-btn" onclick="closePlayer()">Close</button>
        <iframe id="videoPlayer" class="video-iframe" sandbox="allow-scripts allow-same-origin allow-presentation" allowfullscreen></iframe>
    `;
    modal.style.display = 'none';
}

const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value;
        if (currentCategory === 'music') {
            fetchMusicData(currentMusicProvider, query);
        } else {
            fetchCategoryData(currentCategory, query);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value;
            if (currentCategory === 'music') {
                fetchMusicData(currentMusicProvider, query);
            } else {
                fetchCategoryData(currentCategory, query);
            }
        }
    });
}

fetchCategoryData('movies');
