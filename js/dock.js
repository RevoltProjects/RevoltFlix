let isShuffle = false;

function playJamendoTrack(audioUrl, title, artist, poster) {
    const audioElement = document.getElementById('globalAudioElement');
    audioElement.src = audioUrl;
    audioElement.play();

    document.getElementById('dockThumb').src = poster;
    document.getElementById('dockTitle').innerText = title;
    document.getElementById('dockArtist').innerText = artist;

    const playIcon = document.getElementById('dockPlayIcon');
    playIcon.setAttribute('data-lucide', 'pause');
    if (typeof lucide !== 'undefined') lucide.createIcons();
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
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function toggleLoopState() {
    const audioElement = document.getElementById('globalAudioElement');
    const loopBtn = document.getElementById('dockLoopIcon').parentElement;

    audioElement.loop = !audioElement.loop;
    audioElement.loop ? loopBtn.classList.add('active-loop') : loopBtn.classList.remove('active-loop');
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    const shuffleBtn = document.getElementById('dockShuffleIcon').parentElement;
    isShuffle ? shuffleBtn.classList.add('active-shuffle') : shuffleBtn.classList.remove('active-shuffle');
}

function playNext() {}
function playPrevious() {}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const audioElement = document.getElementById('globalAudioElement');
    const progressBar = document.getElementById('progressBar');
    const currentTimeDisplay = document.getElementById('currentTime');
    const totalTimeDisplay = document.getElementById('totalTime');
    const volumeBar = document.getElementById('volumeBar');

    if (audioElement) {
        audioElement.addEventListener('timeupdate', () => {
            if (!isNaN(audioElement.duration)) {
                const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
                progressBar.value = progressPercent;
                currentTimeDisplay.textContent = formatTime(audioElement.currentTime);
            }
        });

        audioElement.addEventListener('loadedmetadata', () => {
            totalTimeDisplay.textContent = formatTime(audioElement.duration);
        });

        audioElement.addEventListener('ended', () => {
            const playIcon = document.getElementById('dockPlayIcon');
            if (playIcon && !audioElement.loop) {
                playIcon.setAttribute('data-lucide', 'play');
                if (typeof lucide !== 'undefined') lucide.createIcons();
                playNext();
            }
        });

        progressBar.addEventListener('input', (e) => {
            if (!isNaN(audioElement.duration)) {
                const seekTime = (e.target.value / 100) * audioElement.duration;
                audioElement.currentTime = seekTime;
            }
        });

        volumeBar.addEventListener('input', (e) => {
            audioElement.volume = e.target.value / 100;
        });
    }
});
