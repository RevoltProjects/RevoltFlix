const firebaseConfig = {
    apiKey: "AIzaSyDdhpsdVNY58rZCdlVoLF07850GUMyWjxI",
    authDomain: "revoltflix-6d205.firebaseapp.com",
    projectId: "revoltflix-6d205",
    storageBucket: "revoltflix-6d205.firebasestorage.app",
    messagingSenderId: "687163146166",
    appId: "1:687163146166:web:58c21ffcb48580f0778b17"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let activeProfileForPin = null;

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        loadMasterAccount();
    } else {
        window.location.href = "login.html";
    }
});

lucide.createIcons();

function openCreateModal() {

    if (!currentUser) {
        alert("Loading user session, please wait a second...");
        return;
    }

    db.collection('accounts').doc(currentUser.uid).get().then((doc) => {
        let profiles = doc.exists && doc.data().profiles ? doc.data().profiles : [];
        if (profiles.length >= 2) {
            alert("Maximum limit of 2 profiles reached.");
            return;
        }
        document.getElementById('createModal').style.display = 'flex';
    }).catch((error) => {
        console.error("Error checking profiles:", error);
        // Force open modal anyway if Firestore check fails temporarily
        document.getElementById('createModal').style.display = 'flex';
    });
}

function closeCreateModal() {
    document.getElementById('createModal').style.display = 'none';
    document.getElementById('profileForm').reset();
}

function openPinModal(profile) {
    activeProfileForPin = profile;
    document.getElementById('pinModalTitle').innerText = `Enter Pin for ${profile.name}`;
    document.getElementById('pinModal').style.display = 'flex';
}

function closePinModal() {
    document.getElementById('pinModal').style.display = 'none';
    document.getElementById('pinForm').reset();
    activeProfileForPin = null;
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('profileName').value;
    const pin = document.getElementById('profilePin').value;

    if (pin.length !== 4) {
        alert("Pin must be 4 digits.");
        return;
    }

    const newProfile = { name, pin };

    try {
        const docRef = db.collection('accounts').doc(currentUser.uid);
        const doc = await docRef.get();
        let profiles = [];
        if (doc.exists && doc.data().profiles) {
            profiles = doc.data().profiles;
        }

        if (profiles.length >= 2) {
            alert("Maximum limit of 2 profiles reached.");
            return;
        }

        profiles.push(newProfile);
        await docRef.set({ profiles: profiles }, { merge: true });

        closeCreateModal();
        loadMasterAccount();
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('pinForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const enteredPin = document.getElementById('enteredPin').value;

    if (activeProfileForPin && enteredPin === activeProfileForPin.pin) {
        localStorage.setItem('activeProfile', JSON.stringify(activeProfileForPin));
        window.location.href = "../index.html";
    } else {
        alert("Incorrect Pin.");
    }
});

async function loadMasterAccount() {
    try {
        const doc = await db.collection('accounts').doc(currentUser.uid).get();
        let profiles = [];
        if (doc.exists && doc.data().profiles) {
            profiles = doc.data().profiles;
        }
        renderProfiles(profiles);
    } catch (error) {
        console.error(error);
    }
}

function renderProfiles(profiles) {
    const grid = document.getElementById('profilesGrid');
    grid.innerHTML = '';

    for (let i = 0; i < 2; i++) {
        if (profiles[i]) {
            const profile = profiles[i];
            const slot = document.createElement('div');
            slot.className = 'profile-slot filled';
            slot.onclick = () => openPinModal(profile);
            slot.innerHTML = `
                <div class="plus-icon-box"><i data-lucide="user"></i></div>
                <span>${profile.name}</span>
            `;
            grid.appendChild(slot);
        } else {
            const slot = document.createElement('div');
            slot.className = 'profile-slot empty-slot';
            slot.onclick = openCreateModal;
            slot.innerHTML = `
                <div class="plus-icon-box"><i data-lucide="plus"></i></div>
                <span>Add Profile</span>
            `;
            grid.appendChild(slot);
        }
    }
    lucide.createIcons();
}
