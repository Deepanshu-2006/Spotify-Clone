<<<<<<< HEAD
console.log("Let's get started");

let currentSongIndex = -1;
let songs = [];
let audio = new Audio();

async function getsongs() {
    let a = await fetch("./Songs/", { mode: "cors" });
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    let songsList = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songsList.push(element.href);
        }
    }

    return songsList;
}

function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function playSong(index) {
    currentSongIndex = index;
    audio.src = songs[currentSongIndex];
    audio.play();
    document.querySelector(".play-btn").src = "pause.svg";
    let songName = songs[index]
        .split("/")
        .pop()
        .replaceAll("%20", " ")
        .replace(".mp3", "");

    let parts = songName.split(" - ");
    let title = parts.length > 1 ? parts[0] : songName;
    let artist = parts.length > 1 ? parts[1] : "Unknown Artist";

    document.querySelector(".songinfo").innerHTML = `
            <div class="song-title">${title}</div>
            <div class="song-artist">${artist}</div>
        `;

    //Re-trigger animation on song change
    const titleEl = document.querySelector(".song-title");
    const artistEl = document.querySelector(".song-artist");

    // Reset animation
    titleEl.style.animation = "none";
    artistEl.style.animation = "none";

    // Force reflow then re-apply
    titleEl.offsetHeight;
    artistEl.offsetHeight;

    titleEl.style.animation = "";
    artistEl.style.animation = "";

    document.querySelectorAll(".song-play-btn").forEach(btn => {
        btn.src = "play.svg";
    });

    document.querySelectorAll(".song-play-btn")[index].src = "pause.svg";

    // 🔥 Reset all text
    document.querySelectorAll(".play-text").forEach(span => {
        span.textContent = "Play Now";
    });

    // 🔥 Set current song text
    document.querySelectorAll(".play-text")[index].textContent = "Playing Now";

    // Active class
    document.querySelectorAll(".songsList li").forEach(li => {
        li.classList.remove("active-song");
    });

    document.querySelectorAll(".songsList li")[index].classList.add("active-song");
}

async function main() {

    songs = await getsongs();
    console.log(songs);

    let songUL = document.querySelector(".songsList ul");
    if (!songUL) {
        console.error("Error: .songsList ul element not found in the DOM.");
        return;
    }

    songs.forEach((song, index) => {

        let li = document.createElement("li");

        // Clean song name
        let songName = song
            .split("/")
            .pop()
            .replaceAll("%20", " ")
            .replace(".mp3", "");

        // Split artist and title
        let parts = songName.split(" - ");
        let title = parts.length > 1 ? parts[0] : songName;
        let artist = parts.length > 1 ? parts[1] : "Unknown Artist";

        li.innerHTML = `
            <img src="music.svg" alt="">
            <div class="info">
                <div>${title}</div>
                <div>${artist}</div>
            </div>
            <div class="playnow">
                <span class = "play-text">Play Now</span>
                <img src="play.svg" class="song-play-btn" alt="">
            </div>
        `;

        // Click whole item
        li.addEventListener("click", () => {

            if (currentSongIndex === index) {

                // 🔁 Toggle play/pause
                if (audio.paused) {
                    audio.play();
                    document.querySelectorAll(".song-play-btn")[index].src = "pause.svg";
                    document.querySelector(".play-btn").src = "pause.svg";
                    document.querySelectorAll(".play-text")[index].textContent = "Playing Now";
                } else {
                    audio.pause();
                    document.querySelectorAll(".song-play-btn")[index].src = "play.svg";
                    document.querySelector(".play-btn").src = "play.svg";
                    document.querySelectorAll(".play-text")[index].textContent = "Play Now";
                }

            } else {
                playSong(index);
            }
        });

        songUL.appendChild(li);
    });

    // 🔍 Search filter
    document.querySelector(".search input").addEventListener("input", (e) => {
        let query = e.target.value.toLowerCase();
        let allLi = document.querySelectorAll(".songsList ul li");

        allLi.forEach((li) => {
            let text = li.textContent.toLowerCase();
            if (text.includes(query)) {
                li.style.display = "flex";
            } else {
                li.style.display = "none";
            }
        });
    });

    const playButton = document.querySelector(".play-btn");
    const prevButton = document.querySelector(".btn.previous");
    const forwardButton = document.querySelector(".btn.forward");

    // Play / Pause
    playButton.onclick = () => {
        if (currentSongIndex === -1) return;
        let currentBtn = document.querySelectorAll(".song-play-btn")[currentSongIndex];
        let currentText = document.querySelectorAll(".play-text")[currentSongIndex];

        if (audio.paused) {
            audio.play();
            playButton.src = "pause.svg";
            if (currentBtn) currentBtn.src = "pause.svg";
            if (currentText) currentText.textContent = "Playing Now";
        } else {
            audio.pause();
            playButton.src = "play.svg";
            if (currentBtn) currentBtn.src = "play.svg";
            if (currentText) currentText.textContent = "Play Now";
        }
    };

    // Previous
    prevButton.onclick = () => {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        playSong(currentSongIndex);
    };

    // Next
    forwardButton.onclick = () => {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playSong(currentSongIndex);
    };

    // Auto play next
    audio.addEventListener("ended", () => {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playSong(currentSongIndex);
    });
    audio.addEventListener("timeupdate", () => {

        let current = audio.currentTime;
        let total = audio.duration;

        if (!isNaN(total)) {
            document.querySelector(".current-time").textContent = formatTime(current);
            document.querySelector(".total-time").textContent = formatTime(total);

            document.querySelector(".seek-slider").value = (current / total) * 100;
        }
    });

    // 🎚️ Seek
    document.querySelector(".seek-slider").addEventListener("input", (e) => {
        if (!isNaN(audio.duration)) {
            audio.currentTime = (e.target.value / 100) * audio.duration;
        }
    });

    // 🔊 Volume
    document.querySelector(".volume-slider").addEventListener("input", (e) => {
        audio.volume = e.target.value;
    });
    document.querySelectorAll(".card").forEach((card) => {
        card.addEventListener("click", () => {
            let artist = card.dataset.artist.toLowerCase();
            let allLi = document.querySelectorAll(".songsList ul li");
            let anyVisible = false;

            allLi.forEach((li) => {
                let text = li.textContent.toLowerCase();
                if (text.includes(artist)) {
                    li.style.display = "flex";
                    anyVisible = true;
                } else {
                    li.style.display = "none";
                }
            });
            document.querySelector(".library h3").textContent = card.dataset.artist;

            document.querySelectorAll(".card").forEach(c => c.classList.remove("active-card"));
            card.classList.add("active-card");
            
            // ▶️ Play button on card → auto play first song of that artist
            document.querySelectorAll(".card .play").forEach((playBtn) => {
                playBtn.addEventListener("click", (e) => {
                    e.stopPropagation(); // ✅ prevent card click from firing too

                    let artist = playBtn.closest(".card").dataset.artist.toLowerCase();

                    // Find first matching song index
                    let firstMatchIndex = songs.findIndex((song) => {
                        let songName = song.split("/").pop().replaceAll("%20", " ").replace(".mp3", "").toLowerCase();
                        return songName.includes(artist);
                    });

                    if (firstMatchIndex !== -1) {
                        playSong(firstMatchIndex); // ✅ plays first song of that artist
                    } else {
                        console.warn("No songs found for:", artist);
                    }
                });
            });
        });
    });
    document.querySelector(".library h3").addEventListener("click", () => {
        document.querySelectorAll(".songsList ul li").forEach(li => li.style.display = "flex");
        document.querySelector(".library h3").textContent = "Your Library";
        document.querySelectorAll(".card").forEach(c => c.classList.remove("active-card"));
    });
}

main();
=======
const $ = (sel) => document.querySelector(sel);
const audio = $('#audio');

const elSongs = $('#songs');
const elPlaylist = $('#playlist');
const elViewTitle = $('#viewTitle');
const elSearch = $('#searchInput');

const elNowTitle = $('#nowTitle');
const elNowArtist = $('#nowArtist');
const elCurTime = $('#curTime');
const elDurTime = $('#durTime');
const elSeek = $('#seek');
const elVolume = $('#volume');

const btnPlay = $('#btnPlay');
const btnPrev = $('#btnPrev');
const btnNext = $('#btnNext');
const btnLoadDemo = $('#btnLoadDemo');

// Demo library (public-domain sample URLs; replace with your own files)
const library = [
  {
    id: 'demo-1',
    title: 'Acoustic Breeze',
    artist: 'Benjamin Tissot',
    album: 'Demo',
    src: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
  },
  {
    id: 'demo-2',
    title: 'Creative Minds',
    artist: 'Benjamin Tissot',
    album: 'Demo',
    src: 'https://www.bensound.com/bensound-music/bensound-creativeminds.mp3',
  },
  {
    id: 'demo-3',
    title: 'Energy',
    artist: 'Benjamin Tissot',
    album: 'Demo',
    src: 'https://www.bensound.com/bensound-music/bensound-energy.mp3',
  },
];

let filtered = [...library];
let currentIndex = -1;

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function renderSongs(list) {
  elSongs.innerHTML = '';
  if (!list.length) {
    elSongs.innerHTML = `<div style="color:#b3b3b3;padding:10px;">No songs found.</div>`;
    return;
  }

  for (let i = 0; i < list.length; i++) {
    const song = list[i];
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = String(i);

    card.innerHTML = `
      <div class="cover" aria-hidden="true"></div>
      <div class="card__title">${escapeHtml(song.title)}</div>
      <div class="card__artist">${escapeHtml(song.artist)}</div>
      <div class="card__badge">${escapeHtml(song.album)}</div>
    `;

    card.addEventListener('click', () => {
      playIndex(i);
    });

    elSongs.appendChild(card);
  }
}

function renderPlaylists() {
  // Simple: one playlist = filtered view
  elPlaylist.innerHTML = '';
  const li = document.createElement('li');
  li.textContent = 'Liked Songs (demo)';
  li.className = 'active';
  elPlaylist.appendChild(li);
}

function setNowPlaying(song) {
  if (!song) {
    elNowTitle.textContent = 'Not playing';
    elNowArtist.textContent = '—';
    return;
  }
  elNowTitle.textContent = song.title;
  elNowArtist.textContent = song.artist;
}

function playIndex(i) {
  const song = filtered[i];
  if (!song) return;

  currentIndex = i;
  audio.src = song.src;
  audio.play().catch(() => {
    // Autoplay may be blocked until user interacts; ignore.
  });

  setNowPlaying(song);
  btnPlay.textContent = '⏸';
}

function togglePlay() {
  if (!audio.src) {
    // if nothing loaded, start first item
    if (filtered.length) playIndex(0);
    return;
  }

  if (audio.paused) {
    audio.play();
    btnPlay.textContent = '⏸';
  } else {
    audio.pause();
    btnPlay.textContent = '▶';
  }
}

function next() {
  if (!filtered.length) return;
  const n = (currentIndex + 1) % filtered.length;
  playIndex(n);
}

function prev() {
  if (!filtered.length) return;
  const p = (currentIndex - 1 + filtered.length) % filtered.length;
  playIndex(p);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Events
btnPlay.addEventListener('click', togglePlay);
btnNext.addEventListener('click', next);
btnPrev.addEventListener('click', prev);

btnLoadDemo.addEventListener('click', () => {
  // In a real app you would fetch / load from your backend.
  filtered = [...library];
  currentIndex = -1;
  elViewTitle.textContent = 'Songs';
  renderSongs(filtered);
  renderPlaylists();
});

elSearch.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  filtered = library.filter(
    (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.album.toLowerCase().includes(q)
  );
  renderSongs(filtered);
});

// Player progress
function updateTime() {
  const cur = audio.currentTime || 0;
  const dur = audio.duration || 0;
  elCurTime.textContent = formatTime(cur);
  elDurTime.textContent = formatTime(dur);

  if (Number.isFinite(dur) && dur > 0) {
    elSeek.value = String(Math.floor((cur / dur) * 100));
  } else {
    elSeek.value = '0';
  }
}

audio.addEventListener('timeupdate', updateTime);

audio.addEventListener('loadedmetadata', updateTime);

audio.addEventListener('ended', next);

elSeek.addEventListener('input', (e) => {
  const dur = audio.duration || 0;
  if (!Number.isFinite(dur) || dur <= 0) return;
  const pct = Number(e.target.value) / 100;
  audio.currentTime = dur * pct;
});

elVolume.addEventListener('input', (e) => {
  audio.volume = Number(e.target.value);
});

// Init view
renderSongs(filtered);
renderPlaylists();
>>>>>>> 104b4d651bfac7297e8fd0ff103ba75351309011
