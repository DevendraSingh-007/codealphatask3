const audio = document.getElementById("audio");

const cover = document.getElementById("cover");
const songTitle = document.getElementById("song-title");
const songArtist = document.getElementById("song-artist");

const playBtn = document.getElementById("play-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");

const volume = document.getElementById("volume");
const volumeValue = document.getElementById("volume-value");
const muteBtn = document.getElementById("mute-btn");

const shuffleBtn = document.getElementById("shuffle-btn");
const repeatBtn = document.getElementById("repeat-btn");
const likeBtn = document.getElementById("like-btn");

const playlistEl = document.getElementById("playlist");
const trackCount = document.getElementById("track-count");
const statusEl = document.getElementById("status");

// Demo songs: replace these URLs with your own audio files if needed.
const songs = [
  {
    title: "SoundHelix Song 1",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=85",
  },
  {
    title: "SoundHelix Song 2",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=85",
  },
  {
    title: "SoundHelix Song 3",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=600&q=85",
  },
  {
    title: "SoundHelix Song 4",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    cover:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=85",
  },
];

let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let autoplay = true;
let isSeeking = false;
let isFavorite = false;
let lastVolume = 0.7;

// Format seconds as mm:ss
function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Build the playlist
function renderPlaylist() {
  playlistEl.innerHTML = "";

  songs.forEach((song, index) => {
    const track = document.createElement("div");
    track.className = "track";
    track.tabIndex = 0;
    track.setAttribute("role", "button");
    track.setAttribute("aria-label", `Play ${song.title} by ${song.artist}`);

    const img = document.createElement("img");
    img.src = song.cover;
    img.alt = "";
    img.loading = "lazy";

    const info = document.createElement("div");
    info.className = "track-info";

    const title = document.createElement("h3");
    title.textContent = song.title;

    const artist = document.createElement("p");
    artist.textContent = song.artist;

    info.append(title, artist);

    const number = document.createElement("span");
    number.className = "track-number";
    number.textContent = String(index + 1).padStart(2, "0");

    track.append(img, info, number);

    track.addEventListener("click", () => {
      loadSong(index);
      playSong();
    });

    track.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        loadSong(index);
        playSong();
      }
    });

    playlistEl.appendChild(track);
  });

  trackCount.textContent = `(${songs.length})`;
  updatePlaylist();
}

// Highlight the current track
function updatePlaylist() {
  const tracks = playlistEl.querySelectorAll(".track");

  tracks.forEach((track, index) => {
    const active = index === currentIndex;

    track.classList.toggle("active", active);
    track.setAttribute("aria-current", active ? "true" : "false");

    const number = track.querySelector(".track-number");

    number.textContent =
      active && isPlaying ? "♫" : String(index + 1).padStart(2, "0");
  });
}

// Load a song
function loadSong(index) {
  currentIndex = index;

  const song = songs[currentIndex];

  audio.pause();
  audio.src = song.src;
  audio.load();

  cover.src = song.cover;
  cover.alt = `Album artwork for ${song.title}`;

  songTitle.textContent = song.title;
  songArtist.textContent = song.artist;

  progress.value = 0;
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";

  isPlaying = false;
  updatePlayButton();
  updatePlaylist();

  statusEl.textContent = "Song selected";
}

// Play music
async function playSong() {
  try {
    await audio.play();
    isPlaying = true;
    updatePlayButton();
    updatePlaylist();
    statusEl.textContent = "Now playing";
  } catch (error) {
    isPlaying = false;
    updatePlayButton();
    updatePlaylist();

    statusEl.textContent = "Unable to play. Check your internet or audio URL.";
  }
}

// Pause music
function pauseSong() {
  audio.pause();
  isPlaying = false;

  updatePlayButton();
  updatePlaylist();

  statusEl.textContent = "Playback paused";
}

// Toggle play/pause
function togglePlay() {
  if (audio.paused) {
    playSong();
  } else {
    pauseSong();
  }
}

// Update play button icon and accessibility label
function updatePlayButton() {
  playBtn.textContent = isPlaying ? "Ⅱ" : "▶";

  playBtn.setAttribute("aria-label", isPlaying ? "Pause music" : "Play music");

  playBtn.title = isPlaying ? "Pause" : "Play";
}

// Play next song
function nextSong() {
  let nextIndex;

  if (isShuffle && songs.length > 1) {
    do {
      nextIndex = Math.floor(Math.random() * songs.length);
    } while (nextIndex === currentIndex);
  } else {
    nextIndex = (currentIndex + 1) % songs.length;
  }

  loadSong(nextIndex);
  playSong();
}

// Play previous song
function previousSong() {
  // Restart current song if it has played for more than 3 seconds.
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  const previousIndex = (currentIndex - 1 + songs.length) % songs.length;

  loadSong(previousIndex);
  playSong();
}

// Update progress bar during playback
audio.addEventListener("timeupdate", () => {
  if (!isSeeking && Number.isFinite(audio.duration)) {
    progress.value = (audio.currentTime / audio.duration) * 100;
  }

  currentTimeEl.textContent = formatTime(audio.currentTime);
});

// Update duration when metadata loads
audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

// Allow seeking by dragging the progress bar
progress.addEventListener("input", () => {
  isSeeking = true;

  if (Number.isFinite(audio.duration)) {
    const previewTime = (Number(progress.value) / 100) * audio.duration;

    currentTimeEl.textContent = formatTime(previewTime);
  }
});

progress.addEventListener("change", () => {
  if (Number.isFinite(audio.duration)) {
    audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  }

  isSeeking = false;
});

// Volume control
function updateVolume() {
  audio.volume = Number(volume.value);

  volumeValue.textContent = `${Math.round(audio.volume * 100)}%`;

  muteBtn.textContent =
    audio.muted || audio.volume === 0 ? "🔇" : audio.volume < 0.5 ? "🔉" : "🔊";

  muteBtn.setAttribute(
    "aria-label",
    audio.muted ? "Unmute volume" : "Mute volume",
  );
}

volume.addEventListener("input", () => {
  audio.muted = false;
  audio.volume = Number(volume.value);

  if (audio.volume > 0) {
    lastVolume = audio.volume;
  }

  updateVolume();
});

// Mute and unmute
muteBtn.addEventListener("click", () => {
  if (audio.muted || audio.volume === 0) {
    audio.muted = false;

    if (audio.volume === 0) {
      audio.volume = lastVolume || 0.7;
      volume.value = audio.volume;
    }
  } else {
    lastVolume = audio.volume;
    audio.muted = true;
  }

  updateVolume();
});

// Shuffle
shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;

  shuffleBtn.classList.toggle("active", isShuffle);
  shuffleBtn.setAttribute("aria-pressed", String(isShuffle));

  statusEl.textContent = isShuffle ? "Shuffle enabled" : "Shuffle disabled";
});

// Autoplay next track
repeatBtn.addEventListener("click", () => {
  autoplay = !autoplay;

  repeatBtn.classList.toggle("active", autoplay);
  repeatBtn.setAttribute("aria-pressed", String(autoplay));

  statusEl.textContent = autoplay ? "Autoplay enabled" : "Autoplay disabled";
});

// Automatically move to the next song at the end
audio.addEventListener("ended", () => {
  isPlaying = false;
  updatePlayButton();
  updatePlaylist();

  if (autoplay) {
    nextSong();
  } else {
    statusEl.textContent = "Track finished";
  }
});

// Handle audio loading or playback errors
audio.addEventListener("error", () => {
  isPlaying = false;
  updatePlayButton();
  updatePlaylist();

  statusEl.textContent =
    "Audio unavailable. Check the URL or try another track.";
});

// Favorite button
likeBtn.addEventListener("click", () => {
  isFavorite = !isFavorite;

  likeBtn.textContent = isFavorite ? "♥" : "♡";
  likeBtn.classList.toggle("active", isFavorite);

  likeBtn.setAttribute("aria-pressed", String(isFavorite));
  likeBtn.setAttribute(
    "aria-label",
    isFavorite ? "Remove favorite" : "Add favorite",
  );
});

// Button events
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", previousSong);

// Keyboard shortcuts
document.addEventListener("keydown", (event) => {
  // Do not hijack typing or range slider controls.
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement ||
    event.target.isContentEditable
  ) {
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    togglePlay();
  } else if (event.key === "ArrowRight") {
    if (Number.isFinite(audio.duration)) {
      audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
    }
  } else if (event.key === "ArrowLeft") {
    audio.currentTime = Math.max(audio.currentTime - 5, 0);
  } else if (event.key.toLowerCase() === "n") {
    nextSong();
  } else if (event.key.toLowerCase() === "p") {
    previousSong();
  }
});

// Initialize player
audio.volume = 0.7;
volume.value = "0.7";

renderPlaylist();
loadSong(0);
updateVolume();

shuffleBtn.setAttribute("aria-pressed", "false");
repeatBtn.classList.add("active");
repeatBtn.setAttribute("aria-pressed", "true");
