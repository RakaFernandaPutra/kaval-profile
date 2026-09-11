document.addEventListener("DOMContentLoaded", () => {
  // Initialize Profile & Music Player
  initProfile();
  initMusicPlayer();

  // Initialize Rain Canvas Atmosphere System
  initRainAtmosphere();

  // Enter Screen & Animation Setup
  const enterScreen = document.getElementById("enter-screen");
  const profileCard = document.querySelector(".profile-card");

  if (config.settings.enterScreen) {
    enterScreen.addEventListener("click", () => {
      enterScreen.classList.add("hidden");
      profileCard.classList.add("animate-in");
      tryPlayAudio();
    });
  } else {
    enterScreen.style.display = "none";
    profileCard.classList.add("animate-in");
  }

  // CURSOR INTERACTION: Smooth Mouse Parallax Glow
  document.addEventListener("mousemove", (e) => {
    document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
    document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
  });
});

// ==================================================
// DISCORD PROFILE SYSTEM
// ==================================================
function initProfile() {
  document.getElementById("avatar-img").src = config.profile.avatar;
  document.getElementById("display-name").textContent = config.profile.displayName;
  document.getElementById("username").textContent = config.profile.username;
  document.getElementById("bio").textContent = config.profile.bio;

  const statusDot = document.getElementById("status-dot");
  statusDot.className = `status-dot ${config.discord.status}`;

  const badgesContainer = document.getElementById("badges-container");
  badgesContainer.innerHTML = "";
  if (config.badges && config.badges.length > 0) {
    config.badges.forEach((badge) => {
      const badgeEl = document.createElement("div");
      badgeEl.className = "badge-item";
      badgeEl.innerHTML = `<i class="${badge.icon}"></i> <span>${badge.label}</span>`;
      badgesContainer.appendChild(badgeEl);
    });
  }
}

// ==================================================
// MUSIC PLAYER & ATMOSPHERE REACTION
// ==================================================
let audio = document.getElementById("audio-player");
let isMusicPlaying = false;

function initMusicPlayer() {
  const trackCover = document.getElementById("track-cover");
  const trackTitle = document.getElementById("track-title");
  const trackArtist = document.getElementById("track-artist");
  const playBtn = document.getElementById("btn-play");
  const playIcon = document.getElementById("play-icon");
  const progressBar = document.getElementById("progress-bar");
  const volumeBar = document.getElementById("volume-bar");
  const currentTimeEl = document.getElementById("current-time");
  const durationEl = document.getElementById("duration");
  const playerCard = document.querySelector(".music-player");
  const profileCard = document.querySelector(".profile-card");

  audio.src = config.music.audio;
  trackCover.src = config.music.cover;
  trackTitle.textContent = config.music.title;
  trackArtist.textContent = config.music.artist;
  audio.volume = volumeBar.value / 100;

  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => {
    playIcon.className = "fa-solid fa-pause";
    playerCard.classList.add("playing");
    isMusicPlaying = true;
    profileCard.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.6), 0 0 50px rgba(3, 92, 101, 0.45)";
  });

  audio.addEventListener("pause", () => {
    playIcon.className = "fa-solid fa-play";
    playerCard.classList.remove("playing");
    isMusicPlaying = false;
    profileCard.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.6), 0 0 35px var(--glow-color)";
  });

  audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
      const progressPercent = (audio.currentTime / audio.duration) * 100;
      progressBar.value = progressPercent;
      currentTimeEl.textContent = formatTime(audio.currentTime);
      durationEl.textContent = formatTime(audio.duration);
    }
  });

  progressBar.addEventListener("input", () => {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  });

  volumeBar.addEventListener("input", () => {
    audio.volume = volumeBar.value / 100;
  });
}

function tryPlayAudio() {
  audio.play().catch(() => {
    document.querySelector(".music-player").classList.remove("playing");
    document.getElementById("play-icon").className = "fa-solid fa-play";
    isMusicPlaying = false;
  });
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// ==================================================
// ATMOSPHERE ENGINE: RAIN, WATER DROPLETS & RIPPLES
// ==================================================
function initRainAtmosphere() {
  const canvas = document.getElementById("rainCanvas");
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Responsive Count: Ringan di mobile, estetik di desktop
  const isMobile = width < 600;
  const rainCount = isMobile ? 35 : 75;
  const dropletCount = isMobile ? 10 : 20;

  // 1. RAIN SYSTEM (Slow, angled, soft drops)
  const rainDrops = [];
  for (let i = 0; i < rainCount; i++) {
    rainDrops.push({
      x: Math.random() * width * 1.2 - width * 0.1,
      y: Math.random() * height,
      length: Math.random() * 18 + 12,
      speed: Math.random() * 1.2 + 0.8, // Slow fall (2.5 - 6.5s traversal)
      opacity: Math.random() * 0.12 + 0.05,
      angle: 8 * (Math.PI / 180) // 8-degree slant
    });
  }

  // 2. WATER DROPLETS ON GLASS (Glass beads with trail)
  const glassDroplets = [];
  for (let i = 0; i < dropletCount; i++) {
    glassDroplets.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 1.5,
      speed: Math.random() * 0.15 + 0.05, // Movement down the glass
      opacity: Math.random() * 0.25 + 0.1,
      trail: []
    });
  }

  // 3. WATER RIPPLE SYSTEM (Occasional soft ripples at the bottom)
  const ripples = [];
  function createRipple() {
    if (ripples.length < (isMobile ? 2 : 4)) {
      ripples.push({
        x: Math.random() * width,
        y: height - Math.random() * (height * 0.25), // Bottom water area
        radius: 2,
        maxRadius: Math.random() * 25 + 15,
        opacity: 0.12,
        speed: Math.random() * 0.2 + 0.1
      });
    }
    // Interval acak antara 4 - 9 detik
    setTimeout(createRipple, Math.random() * 5000 + 4000);
  }
  createRipple();

  // RENDER LOOP (High Performance)
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Multiplier jika musik sedang dimainkan (Reaction System)
    const speedMultiplier = isMusicPlaying ? 1.25 : 1.0;

    // --- DRAW RAIN DROPS ---
    ctx.lineWidth = 1;
    for (let drop of rainDrops) {
      ctx.strokeStyle = `rgba(180, 230, 240, ${drop.opacity})`;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(
        drop.x + Math.sin(drop.angle) * drop.length,
        drop.y + Math.cos(drop.angle) * drop.length
      );
      ctx.stroke();

      // Update position
      drop.y += drop.speed * speedMultiplier;
      drop.x += Math.sin(drop.angle) * drop.speed * speedMultiplier;

      // Reset when off-screen
      if (drop.y > height) {
        drop.y = -drop.length;
        drop.x = Math.random() * width * 1.2 - width * 0.1;
      }
    }

    // --- DRAW WATER DROPLETS ON GLASS ---
    for (let drop of glassDroplets) {
      // Draw Trail
      if (drop.trail.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(180, 230, 240, ${drop.opacity * 0.3})`;
        ctx.lineWidth = drop.radius * 0.6;
        for (let i = 0; i < drop.trail.length; i++) {
          let p = drop.trail[i];
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Draw Glass Droplet Body
      ctx.fillStyle = `rgba(220, 245, 255, ${drop.opacity})`;
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
      ctx.fill();

      // Highlight kecil di dalam tetesan
      ctx.fillStyle = `rgba(255, 255, 255, ${drop.opacity * 1.5})`;
      ctx.beginPath();
      ctx.arc(drop.x - drop.radius * 0.3, drop.y - drop.radius * 0.3, drop.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Move slowly down
      drop.y += drop.speed * speedMultiplier;
      drop.trail.push({ x: drop.x, y: drop.y });
      if (drop.trail.length > 8) drop.trail.shift();

      if (drop.y > height) {
        drop.y = -10;
        drop.x = Math.random() * width;
        drop.trail = [];
      }
    }

    // --- DRAW WATER RIPPLES ---
    for (let i = ripples.length - 1; i >= 0; i--) {
      let r = ripples[i];
      ctx.strokeStyle = `rgba(3, 92, 101, ${r.opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();

      r.radius += r.speed * speedMultiplier;
      r.opacity -= 0.0008 * speedMultiplier;

      if (r.opacity <= 0 || r.radius >= r.maxRadius) {
        ripples.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}