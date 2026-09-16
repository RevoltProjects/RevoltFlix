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
    document.getElementById('profileBadge').innerText = `Profile: ${profile.name}`;
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

const BACKEND_URL = "https://your-backend-project.vercel.app/api";

async function fetchCategoryData(category) {
    const grid = document.getElementById('contentGrid');
    grid.innerHTML = `<p class="loading-text">Loading ${category}...</p>`;

    try {
        const response = await fetch(`${BACKEND_URL}/get-${category}`);
        if (!response.ok) throw new Error("Failed to fetch data from backend.");
        
        const data = await response.json();
        
        grid.innerHTML = `<p class="loading-text">Loaded ${data.length || 0} items for ${category}.</p>`;
    } catch (error) {
        grid.innerHTML = `<p class="loading-text" style="color: var(--brand-red);">Error connecting to Vercel API function.</p>`;
    }
}

fetchCategoryData('movies');
