function playJamendoTrack(audioUrl, title, artist, poster) {
    const audioElement = document.getElementById('globalAudioElement');
    audioElement.src = audioUrl;
    audioElement.play();

    document.getElementById('dockThumb').src = poster;
    document.getElementById('dockTitle').innerText = title;
    document.getElementById('dockArtist').innerText = artist;

    const playIcon = document.getElementById('dockPlayIcon');
    playIcon.setAttribute('data-lucide', 'pause');
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    if (typeof closeDetailsModal === 'function') {
        closeDetailsModal();
    }
}

function togglePlayState() {
    const audioElement = document.getElementById('globalAudioElement');
    const playIcon = document.getElementById('dockPlayIcon');

    if (audioElement.paused) {
        if (audioElement.src) {
            audioElement.play();
            playIcon.setAttribute('data-lucide', 'pause');
        }
    } else {
        audioElement.pause();
        playIcon.setAttribute('data-lucide', 'play');
    }
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function toggleLoopState() {
    const audioElement = document.getElementById('globalAudioElement');
    const loopBtn = document.getElementById('dockLoopIcon').parentElement;

    audioElement.loop = !audioElement.loop;
    if (audioElement.loop) {
        loopBtn.classList.add('active-loop');
    } else {
        loopBtn.classList.remove('active-loop');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const audioElement = document.getElementById('globalAudioElement');
    if (audioElement) {
        audioElement.addEventListener('ended', () => {
            const playIcon = document.getElementById('dockPlayIcon');
            if (playIcon) {
                playIcon.setAttribute('data-lucide', 'play');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        });
    }
});
