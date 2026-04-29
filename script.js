// script.js
// Replace these paths with your real files inside /assets/images and /assets/music.
const CONFIG = {
  girlfriendName: "Miyya",
  musicFile: "assets/music/romantic.mp3",
  girlfriendImages: [
    "assets/images/photo-1.jpg",
    "assets/images/photo-2.jpg",
    "assets/images/photo-3.jpg",
    "assets/images/photo-4.jpg"
  ],
  birthdayTexts: ["HAPPY", "BIRTHDAY", "TO", "MIYYA", "BIG LOVE"],
  wishMessages: [
    "Happy Birthday Sayang",
    "As long as you're smiling, I'm happy.",
    "Stay happy, my love.",
    "I love you forever."
  ],
  heartMap: [
    { x: 50, y: 16 }, { x: 38, y: 20 }, { x: 62, y: 20 },
    { x: 30, y: 28 }, { x: 44, y: 28 }, { x: 56, y: 28 }, { x: 70, y: 28 },
    { x: 24, y: 40 }, { x: 36, y: 40 }, { x: 50, y: 40 }, { x: 64, y: 40 }, { x: 76, y: 40 },
    { x: 28, y: 54 }, { x: 40, y: 54 }, { x: 50, y: 54 }, { x: 60, y: 54 }, { x: 72, y: 54 },
    { x: 34, y: 68 }, { x: 44, y: 68 }, { x: 56, y: 68 }, { x: 66, y: 68 },
    { x: 40, y: 80 }, { x: 50, y: 80 }, { x: 60, y: 80 },
    { x: 50, y: 92 }
  ]
};

const state = {
  currentScene: "scene-intro",
  letterIndex: 0,
  letterLocked: false,
  heartStarted: false
};

const sceneIds = [
  "scene-intro",
  "scene-text",
  "scene-celebration",
  "scene-letter",
  "scene-heart"
];

const reversedImages = [...CONFIG.girlfriendImages].reverse();

const countdownEl = document.getElementById("countdown");
const birthdayWordEl = document.getElementById("birthday-word");
const heartRainEl = document.getElementById("heart-rain");
const audioEl = document.getElementById("bg-music");
const audioToggleEl = document.getElementById("audio-toggle");
const wishCardEl = document.getElementById("wish-card");
const wishMessageEl = document.getElementById("wish-message");
const paperStageEl = document.getElementById("paper-stage");
const letterImageEl = document.getElementById("letter-image");
const foldPanelsEl = document.getElementById("fold-panels");
const swipeHintEl = document.getElementById("swipe-hint");
const heartCollageEl = document.getElementById("heart-collage");

let pointerStartX = null;

document.addEventListener("DOMContentLoaded", () => {
  applyName();
  prepareAudio();
  createHeartRain();
  buildFoldPanels();
  buildHeartCollage();
  bindAudioFallback();
  bindSwipeControls();
  runExperience();
});

function applyName() {
  document.title = `Happy Birthday ${CONFIG.girlfriendName}`;
  const heroName = document.querySelector(".hero-name");
  const heartTitle = document.querySelector(".heart-title");

  heroName.textContent = CONFIG.girlfriendName;
  heartTitle.textContent = `Happy Birthday, ${CONFIG.girlfriendName} 💗`;
}

function prepareAudio() {
  audioEl.src = CONFIG.musicFile;
  audioEl.volume = 0.85;
}

async function tryPlayMusic(showButton = true) {
  try {
    await audioEl.play();
    audioToggleEl.hidden = true;
  } catch (error) {
    if (showButton) {
      audioToggleEl.hidden = false;
    }
  }
}

function bindAudioFallback() {
  const unlock = () => tryPlayMusic(false);

  document.addEventListener("pointerdown", unlock, { passive: true });
  document.addEventListener("keydown", unlock, { passive: true });

  audioToggleEl.addEventListener("click", async () => {
    await tryPlayMusic(false);
  });
}

function createHeartRain() {
  const totalHearts = window.innerWidth < 768 ? 24 : 34;

  for (let index = 0; index < totalHearts; index += 1) {
    const heart = document.createElement("span");
    const drift = `${randomBetween(-60, 60)}px`;
    heart.className = "heart-drop";
    heart.textContent = Math.random() > 0.35 ? "❤" : "♥";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${randomBetween(12, 28)}px`;
    heart.style.animationDuration = `${randomBetween(7, 14)}s`;
    heart.style.animationDelay = `${randomBetween(-12, 0)}s`;
    heart.style.setProperty("--drift", drift);
    heartRainEl.appendChild(heart);
  }
}

function buildFoldPanels() {
  foldPanelsEl.innerHTML = "";
  const panelCount = reversedImages.length;
  const width = 100 / panelCount;

  reversedImages.forEach((_, index) => {
    const panel = document.createElement("div");
    panel.className = "fold-panel";
    panel.style.width = `${width}%`;
    panel.style.right = `${index * width}%`;
    panel.style.zIndex = `${panelCount - index}`;
    foldPanelsEl.appendChild(panel);
  });

  wishMessageEl.textContent = CONFIG.wishMessages[0] ?? "Happy Birthday Sayang";
}

function buildHeartCollage() {
  heartCollageEl.innerHTML = "";

  CONFIG.heartMap.forEach((point, index) => {
    const tile = document.createElement("div");
    const image = CONFIG.girlfriendImages[index % CONFIG.girlfriendImages.length];
    tile.className = "heart-tile";
    tile.style.backgroundImage = `url("${image}")`;
    tile.style.setProperty("--x", `${point.x}%`);
    tile.style.setProperty("--y", `${point.y}%`);
    tile.style.setProperty("--rotation", `${randomBetween(-8, 8)}deg`);
    tile.style.transitionDelay = `${index * 90}ms`;
    heartCollageEl.appendChild(tile);
  });
}

async function runExperience() {
  await tryPlayMusic(true);
  await playCountdownScene();
  await playBirthdayWordsScene();
  await playCelebrationScene();
  showScene("scene-letter");
}

async function playCountdownScene() {
  showScene("scene-intro");

  for (const number of ["3", "2", "1"]) {
    countdownEl.textContent = number;
    restartAnimation(countdownEl, "pulse-pop");
    await sleep(1200);
  }
}

async function playBirthdayWordsScene() {
  showScene("scene-text");

  for (const word of CONFIG.birthdayTexts) {
    birthdayWordEl.textContent = word;
    birthdayWordEl.classList.remove("show");
    void birthdayWordEl.offsetWidth;
    birthdayWordEl.classList.add("show");
    await sleep(1100);
  }
}

async function playCelebrationScene() {
  showScene("scene-celebration");
  await sleep(3600);
}

function showScene(sceneId) {
  state.currentScene = sceneId;

  sceneIds.forEach((id) => {
    const scene = document.getElementById(id);
    scene.classList.toggle("active", id === sceneId);
  });
}

function bindSwipeControls() {
  paperStageEl.addEventListener("pointerdown", (event) => {
    if (state.currentScene !== "scene-letter") {
      return;
    }

    pointerStartX = event.clientX;
  });

  paperStageEl.addEventListener("pointerup", (event) => {
    if (pointerStartX === null || state.currentScene !== "scene-letter") {
      return;
    }

    const difference = event.clientX - pointerStartX;
    pointerStartX = null;

    if (difference < -45) {
      openNextLetterPanel();
    }
  });

  paperStageEl.addEventListener("pointerleave", () => {
    pointerStartX = null;
  });
}

function openNextLetterPanel() {
  if (state.letterLocked || state.letterIndex >= reversedImages.length) {
    return;
  }

  state.letterLocked = true;
  const step = state.letterIndex;
  const panel = foldPanelsEl.children[step];
  const currentImage = reversedImages[step];
  const currentMessage =
    CONFIG.wishMessages[Math.min(step, CONFIG.wishMessages.length - 1)];

  letterImageEl.style.backgroundImage = `url("${currentImage}")`;
  letterImageEl.classList.add("has-photo");
  letterImageEl.classList.remove("flash");
  document.querySelector(".paper-placeholder")?.remove();
  void letterImageEl.offsetWidth;
  letterImageEl.classList.add("flash");

  if (panel) {
    panel.classList.add("opened");
  }

  wishMessageEl.textContent = currentMessage;
  state.letterIndex += 1;

  if (state.letterIndex >= reversedImages.length) {
    swipeHintEl.classList.add("hide");
    window.setTimeout(() => {
      wishCardEl.classList.add("hide");
    }, 400);

    window.setTimeout(() => {
      showScene("scene-heart");
      startHeartCollage();
    }, 2200);
  }

  window.setTimeout(() => {
    state.letterLocked = false;
  }, 700);
}

function startHeartCollage() {
  if (state.heartStarted) {
    return;
  }

  state.heartStarted = true;
  const tiles = [...heartCollageEl.children];

  tiles.forEach((tile, index) => {
    window.setTimeout(() => {
      tile.classList.add("show");
    }, index * 110);
  });
}

function restartAnimation(element, keyframesName) {
  element.style.animation = "none";
  void element.offsetWidth;
  element.style.animation = `${keyframesName === "pulse-pop" ? "pulse-pop 1200ms ease both" : ""}`;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
