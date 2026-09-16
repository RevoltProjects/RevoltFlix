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
    document.getElementById('profileNameDisplay').innerText = profile.name;
    document.getElementById('profileBadge').innerText = profile.name;
}

lucide.createIcons();

const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        const category = item.getAttribute('data-category');
        document.getElementById('categoryTitle').innerText = item.innerText.trim();
        
        fetchCategoryData(category);
    });
});

const BACKEND_URL = "https://revolt-flix-backend.vercel.app/api";
let currentMoviesData = [];
let activeMovieId = null;

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
        
        if (category === 'movies') {
            currentMoviesData = data;
            if (data.length === 0) {
                grid.innerHTML = `<p class="loading-text">No movies found.</p>`;
                return;
            }

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
    activeMovieId = tmdbId;
    const movie = currentMoviesData.find(m => m.id == tmdbId);
    if (!movie) return;

    document.getElementById('detailTitle').innerText = movie.title || movie.name;
    document.getElementById('detailOverview').innerText = movie.overview || "No description available for this title.";
    document.getElementById('detailPoster').src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    
    document.getElementById('detailsModal').style.display = 'flex';
}

function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

function expandPlayerFromModal() {
    if (!activeMovieId) return;
    const modal = document.getElementById('playerModal');
    const iframe = document.getElementById('videoPlayer');
    iframe.src = `https://vidsrc.sbs/embed/movie/${activeMovieId}`;
    modal.style.display = 'flex';
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
        fetchCategoryData('movies', query);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value;
            fetchCategoryData('movies', query);
        }
    });
}

fetchCategoryData('movies');
