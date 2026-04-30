const CONFIG = {
  girlfriendName: "Miyya",
  musicFile: "assets/music/romantic.mp3",
  girlfriendImages: [
    "assets/images/photo-1.jpg",
    "assets/images/photo-2.jpg",
    "assets/images/photo-3.jpg",
    "assets/images/photo-4.jpg"
  ],
  birthdayTexts: ["HAPPY", "BIRTHDAY", "TO", "MIYYA", "CAYANGG!! 💖"],
  wishMessages: [
    "Happy Birthday Sayang",
    "As long as you're smiling, I'm happy.",
    "Stay happy, my love.",
    "I love you forever."
  ],
  heartMap: [
    { x: 50, y: 12 },
    { x: 38, y: 18 }, { x: 62, y: 18 },
    { x: 30, y: 26 }, { x: 42, y: 26 }, { x: 58, y: 26 }, { x: 70, y: 26 },
    { x: 24, y: 37 }, { x: 36, y: 37 }, { x: 50, y: 37 }, { x: 64, y: 37 }, { x: 76, y: 37 },
    { x: 22, y: 49 }, { x: 34, y: 49 }, { x: 46, y: 49 }, { x: 58, y: 49 }, { x: 70, y: 49 }, { x: 82, y: 49 },
    { x: 26, y: 62 }, { x: 38, y: 62 }, { x: 50, y: 62 }, { x: 62, y: 62 }, { x: 74, y: 62 },
    { x: 32, y: 75 }, { x: 44, y: 75 }, { x: 56, y: 75 }, { x: 68, y: 75 },
    { x: 38, y: 87 }, { x: 50, y: 87 }, { x: 62, y: 87 },
    { x: 50, y: 96 }
  ]
};

const FLOW = ["closed", "page1", "page2", "page3", "close", "heartAnimation"];
const PAGE_COUNT = 3;
const SWIPE_THRESHOLD = 46;

const state = {
  currentScene: "scene-intro",
  flowIndex: 0,
  currentPage: 0,
  locked: false,
  heartStarted: false,
  heartTimers: [],
  pointerStartX: 0,
  pointerStartY: 0,
  pointerActive: false,
  sequenceId: 0
};

const pages = Array.from({ length: PAGE_COUNT }, (_, index) => ({
  image:
    CONFIG.girlfriendImages[index] ??
    CONFIG.girlfriendImages[CONFIG.girlfriendImages.length - 1] ??
    "",
  message:
    CONFIG.wishMessages[index] ??
    CONFIG.wishMessages[CONFIG.wishMessages.length - 1] ??
    "Happy Birthday Sayang"
}));

const rotations = ["-8deg", "-5deg", "-2deg", "2deg", "5deg", "8deg"];

const sceneIds = ["scene-intro", "scene-text", "scene-letter", "scene-heart"];

const countdownEl = document.getElementById("countdown");
const birthdayWordEl = document.getElementById("birthday-word");
const heartRainEl = document.getElementById("heart-rain");

const sceneIntroEl = document.getElementById("scene-intro");
const sceneTextEl = document.getElementById("scene-text");
const sceneLetterEl = document.getElementById("scene-letter");
const sceneHeartEl = document.getElementById("scene-heart");

const bookStageEl = document.getElementById("book-stage");
const bookShellEl = document.getElementById("book-shell");
const turnSheetEl = document.getElementById("turn-sheet");

const pageCardEl = document.getElementById("page-card");
const pageImageEl = document.getElementById("page-image");
const pageMessageEl = document.getElementById("page-message");
const pageCountEl = document.getElementById("page-count");

const turnPhotoEl = document.getElementById("turn-photo");
const turnMessageEl = document.getElementById("turn-message");
const turnCountEl = document.getElementById("turn-count");

const insideTitleEl = document.getElementById("inside-title");
const insideSubtitleEl = document.getElementById("inside-subtitle");
const heartTitleEl = document.querySelector(".heart-title");

const nextBtnEl = document.getElementById("next-btn");
const restartBtnEl = document.getElementById("restart-btn");
const replayHeartBtnEl = document.getElementById("replay-heart-btn");
const swipeHintEl = document.getElementById("swipe-hint");

const heartCollageEl = document.getElementById("heart-collage");

const audioEl = document.getElementById("bg-music");
const audioToggleEl = document.getElementById("audio-toggle");

document.addEventListener("DOMContentLoaded", () => {
  applyName();
  prepareAudio();
  createHeartRain();
  buildHeartCollage();
  renderPage(0);
  syncTurnSheet(0);
  setBookState("closed");
  bindAudioFallback();
  bindControls();
  restartExperience();
});

function applyName() {
  document.title = `Happy Birthday ${CONFIG.girlfriendName}`;

  const heroNameEl = document.querySelector(".hero-name");
  if (heroNameEl) {
    heroNameEl.textContent = CONFIG.girlfriendName;
  }

  if (insideTitleEl) {
    insideTitleEl.textContent = `Happy Birthday, ${CONFIG.girlfriendName} 💜`;
  }

  if (insideSubtitleEl) {
    insideSubtitleEl.textContent = "Swipe left to open this little love book.";
  }

  if (heartTitleEl) {
    heartTitleEl.textContent = `Happy Birthday, ${CONFIG.girlfriendName} 💗`;
  }
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
  const unlock = () => {
    tryPlayMusic(false);
  };

  document.addEventListener("pointerdown", unlock, { passive: true });
  document.addEventListener("keydown", unlock, { passive: true });

  audioToggleEl.addEventListener("click", async () => {
    await tryPlayMusic(false);
  });
}

function bindControls() {
  bookStageEl.addEventListener("pointerdown", onPointerDown);
  bookStageEl.addEventListener("pointerup", onPointerUp);
  bookStageEl.addEventListener("pointercancel", resetPointer);
  bookStageEl.addEventListener("pointerleave", resetPointer);

  nextBtnEl.addEventListener("click", advanceFlow);
  restartBtnEl.addEventListener("click", restartExperience);
  replayHeartBtnEl.addEventListener("click", restartExperience);

  document.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Enter", " "].includes(event.key)) {
      return;
    }

    event.preventDefault();

    if (sceneLetterEl.classList.contains("active")) {
      advanceFlow();
      return;
    }

    if (sceneHeartEl.classList.contains("active")) {
      restartExperience();
    }
  });
}

function onPointerDown(event) {
  if (!sceneLetterEl.classList.contains("active") || state.locked) {
    return;
  }

  state.pointerActive = true;
  state.pointerStartX = event.clientX;
  state.pointerStartY = event.clientY;
}

function onPointerUp(event) {
  if (!state.pointerActive || state.locked) {
    resetPointer();
    return;
  }

  const deltaX = event.clientX - state.pointerStartX;
  const deltaY = event.clientY - state.pointerStartY;

  resetPointer();

  if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
    advanceFlow();
    return;
  }

  if (deltaX < -SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
    advanceFlow();
  }
}

function resetPointer() {
  state.pointerActive = false;
  state.pointerStartX = 0;
  state.pointerStartY = 0;
}

async function restartExperience() {
  state.sequenceId += 1;
  const sequenceId = state.sequenceId;

  clearHeartTimers();
  state.currentScene = "scene-intro";
  state.flowIndex = 0;
  state.currentPage = 0;
  state.locked = false;
  state.heartStarted = false;

  [...heartCollageEl.children].forEach((tile) => {
    tile.classList.remove("show");
  });

  bookShellEl.classList.remove("is-vanishing");
  turnSheetEl.classList.remove("is-turning");

  renderPage(0);
  syncTurnSheet(0);
  setBookState("closed");
  updateBookUi();

  birthdayWordEl.textContent = "";
  birthdayWordEl.classList.remove("show");
  countdownEl.textContent = "3";

  showScene("scene-intro");

  await tryPlayMusic(true);
  await playCountdownScene(sequenceId);

  if (sequenceId !== state.sequenceId) {
    return;
  }

  await playBirthdayWordsScene(sequenceId);

  if (sequenceId !== state.sequenceId) {
    return;
  }

  showScene("scene-letter");
  updateBookUi();
}

async function playCountdownScene(sequenceId) {
  showScene("scene-intro");

  for (const number of ["3", "2", "1"]) {
    if (sequenceId !== state.sequenceId) {
      return;
    }

    countdownEl.textContent = number;
    restartAnimation(countdownEl, "pulse-pop 1200ms ease both");
    await sleep(1200);
  }
}

async function playBirthdayWordsScene(sequenceId) {
  showScene("scene-text");

  for (const word of CONFIG.birthdayTexts) {
    if (sequenceId !== state.sequenceId) {
      return;
    }

    birthdayWordEl.textContent = word;
    birthdayWordEl.classList.remove("show");
    void birthdayWordEl.offsetWidth;
    birthdayWordEl.classList.add("show");
    await sleep(1100);
  }
}

function showScene(sceneId) {
  state.currentScene = sceneId;

  sceneIds.forEach((id) => {
    const scene = document.getElementById(id);
    scene.classList.toggle("active", id === sceneId);
  });
}

function advanceFlow() {
  if (state.locked || !sceneLetterEl.classList.contains("active")) {
    return;
  }

  const currentFlow = FLOW[state.flowIndex];

  if (currentFlow === "closed") {
    openBook();
    return;
  }

  if (currentFlow === "page1") {
    flipToPage(1);
    return;
  }

  if (currentFlow === "page2") {
    flipToPage(2);
    return;
  }

  if (currentFlow === "page3") {
    closeBookAndShowHeart();
  }
}

function openBook() {
  state.locked = true;
  state.flowIndex = 1;
  state.currentPage = 0;

  renderPage(0);
  syncTurnSheet(0);
  setBookState("open");
  pulsePageCard();
  updateBookUi();

  window.setTimeout(() => {
    state.locked = false;
  }, 950);
}

function flipToPage(targetIndex) {
  if (targetIndex < 0 || targetIndex >= pages.length) {
    return;
  }

  state.locked = true;
  syncTurnSheet(state.currentPage);
  renderPage(targetIndex);
  setBookState("page-turn");

  turnSheetEl.classList.remove("is-turning");
  void turnSheetEl.offsetWidth;
  turnSheetEl.classList.add("is-turning");

  turnSheetEl.addEventListener(
    "animationend",
    () => {
      turnSheetEl.classList.remove("is-turning");
      state.currentPage = targetIndex;
      state.flowIndex = targetIndex + 1;
      setBookState("open");
      pulsePageCard();
      updateBookUi();
      state.locked = false;
    },
    { once: true }
  );
}

function closeBookAndShowHeart() {
  state.locked = true;
  state.flowIndex = 4;
  updateBookUi();
  setBookState("closing");

  bookShellEl.classList.remove("is-vanishing");
  void bookShellEl.offsetWidth;

  window.setTimeout(() => {
    bookShellEl.classList.add("is-vanishing");
  }, 700);

  window.setTimeout(() => {
    showScene("scene-heart");
    state.flowIndex = 5;
    startHeartCollage();
    state.locked = false;
  }, 1450);
}

function startHeartCollage() {
  if (state.heartStarted) {
    return;
  }

  state.heartStarted = true;
  const tiles = [...heartCollageEl.children];

  tiles.forEach((tile, index) => {
    const timerId = window.setTimeout(() => {
      tile.classList.add("show");
    }, index * 90);

    state.heartTimers.push(timerId);
  });
}

function buildHeartCollage() {
  heartCollageEl.innerHTML = "";

  CONFIG.heartMap.forEach((point, index) => {
    const tile = document.createElement("div");
    const image = document.createElement("img");
    const imagePath =
      CONFIG.girlfriendImages[index % CONFIG.girlfriendImages.length] || "";

    tile.className = "heart-tile";
    tile.style.setProperty("--x", String(point.x));
    tile.style.setProperty("--y", String(point.y));
    tile.style.setProperty("--r", rotations[index % rotations.length]);

    image.src = imagePath;
    image.alt = `${CONFIG.girlfriendName} photo ${index + 1}`;

    tile.appendChild(image);
    heartCollageEl.appendChild(tile);
  });
}

function renderPage(index) {
  const page = pages[index];

  pageImageEl.src = page.image;
  pageImageEl.alt = `${CONFIG.girlfriendName} memory ${index + 1}`;
  pageMessageEl.textContent = page.message;
  pageCountEl.textContent = `${index + 1} / ${pages.length}`;
}

function syncTurnSheet(index) {
  const page = pages[index];

  turnPhotoEl.style.backgroundImage = `url("${page.image}")`;
  turnMessageEl.textContent = page.message;
  turnCountEl.textContent = `${index + 1} / ${pages.length}`;
}

function pulsePageCard() {
  pageCardEl.classList.remove("is-live");
  void pageCardEl.offsetWidth;
  pageCardEl.classList.add("is-live");
}

function setBookState(value) {
  bookShellEl.dataset.state = value;
}

function updateBookUi() {
  const currentFlow = FLOW[state.flowIndex];

  if (currentFlow === "closed") {
    nextBtnEl.hidden = false;
    nextBtnEl.textContent = "Open 💌";
    swipeHintEl.textContent = "Swipe right → left, tap the book, or press the button";
    return;
  }

  if (currentFlow === "page1" || currentFlow === "page2") {
    nextBtnEl.hidden = false;
    nextBtnEl.textContent = "Next →";
    swipeHintEl.textContent = "Swipe again for the next page";
    return;
  }

  if (currentFlow === "page3") {
    nextBtnEl.hidden = false;
    nextBtnEl.textContent = "Close ✨";
    swipeHintEl.textContent = "One more swipe closes the book";
    return;
  }

  if (currentFlow === "close") {
    nextBtnEl.hidden = true;
    swipeHintEl.textContent = "Turning every memory into a heart...";
  }
}

function restartAnimation(element, animationValue) {
  element.style.animation = "none";
  void element.offsetWidth;
  element.style.animation = animationValue;
}

function clearHeartTimers() {
  state.heartTimers.forEach((timerId) => {
    window.clearTimeout(timerId);
  });

  state.heartTimers = [];
}

function createHeartRain() {
  heartRainEl.innerHTML = "";
  const totalHearts = window.innerWidth < 768 ? 24 : 34;

  for (let index = 0; index < totalHearts; index += 1) {
    const heart = document.createElement("span");
    heart.className = "heart-drop";
    heart.textContent = Math.random() > 0.35 ? "❤" : "♥";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${randomBetween(12, 28)}px`;
    heart.style.animationDuration = `${randomBetween(7, 14)}s`;
    heart.style.animationDelay = `${randomBetween(-12, 0)}s`;
    heart.style.setProperty("--drift", `${randomBetween(-60, 60)}px`);
    heartRainEl.appendChild(heart);
  }
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}