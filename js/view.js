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
    document.getElementById('profileBadge').innerText = profile.name;
}

lucide.createIcons();

function switchToProfileSelect() {
    localStorage.removeItem('activeProfile');
    window.location.href = "watching.html";
}

let currentCategory = 'movies';

const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        currentCategory = item.getAttribute('data-category');
        document.getElementById('categoryTitle').innerText = item.innerText.trim();
        document.getElementById('searchInput').placeholder = `Search ${currentCategory}...`;
        
        fetchCategoryData(currentCategory);
    });
});

const BACKEND_URL = "https://revolt-flix-backend.vercel.app/api";
let currentMediaData = [];
let activeMediaId = null;

async function fetchCategoryData(category, query = '') {
    const grid = document.getElementById('contentGrid');
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
        } else {
            grid.innerHTML = `<p class="loading-text">Loaded ${data.length || 0} items for ${category}.</p>`;
        }
    } catch (error) {
        grid.innerHTML = `<p class="loading-text" style="color: var(--brand-red);">Error connecting to Vercel API function.</p>`;
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
    const iframe = document.getElementById('videoPlayer');
    iframe.src = `https://vidsrc.sbs/embed/movie/${activeMediaId}`;
    modal.style.display = 'flex';
}

function playSeriesEpisode(season, episode) {
    if (!activeMediaId) return;
    const modal = document.getElementById('playerModal');
    const iframe = document.getElementById('videoPlayer');
    iframe.src = `https://vidsrc.sbs/embed/tv/${activeMediaId}/${season}/${episode}`;
    modal.style.display = 'flex';
}

function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

function closePlayer() {
    const modal = document.getElementById('playerModal');
    const iframe = document.getElementById('videoPlayer');
    iframe.src = '';
    modal.style.display = 'none';
}

const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value;
        fetchCategoryData(currentCategory, query);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value;
            fetchCategoryData(currentCategory, query);
        }
    });
}

fetchCategoryData('movies');
