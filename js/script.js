const firebaseConfig = {
    apiKey: "AIzaSyDdhpsdVNY58rZCdlVoLF07850GUMyWjxI",
    authDomain: "revoltflix-6d205.firebaseapp.com",
    projectId: "revoltflix-6d205",
    storageBucket: "revoltflix-6d205.firebasestorage.app",
    messagingSenderId: "687163146166",
    appId: "1:687163146166:web:58c21ffcb48580f0778b17"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("RevoltFlix landing page initialized.");

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            window.location.href = "html/watching.html";
        }
    });
});
