/* =========================================================
   DATE INVITE — script.js
   Easy to customize: edit CONFIG below.
   ========================================================= */

const CONFIG = {
  recipientName: "You",
  senderName: "Me",
  title: "Will you go out with me?",
  yesText: "❤️ YES",
  noText: "💔 NO",

  activities: [
    { id: "coffee", emoji: "☕", label: "Coffee & Walk" },
    { id: "movie", emoji: "🎬", label: "Movie Night" },
    { id: "pizza", emoji: "🍕", label: "Pizza Date" },
    { id: "sunset", emoji: "🌅", label: "Sunset Walk" },
    { id: "game", emoji: "🎮", label: "Game Night" },
  ],

  days: ["Friday", "Saturday", "Sunday"],
  locations: [
    { id: "dhanmondi", emoji: "☕", label: "Dhanmondi Cafe" },
    { id: "baily", emoji: "🌃", label: "Baily Road" },
    { id: "campus", emoji: "🏛️", label: "Campus Walk" },
    { id: "surprise", emoji: "🎁", label: "Surprise Me!" }
  ],
  timesOfDay: [
    { id: "morning", emoji: "☀️", label: "Morning" },
    { id: "afternoon", emoji: "🌤️", label: "Afternoon" },
    { id: "evening", emoji: "🌙", label: "Evening" },
  ],

  clockTimes: ["5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"],

  finalMessage: "Can't wait to see you! 💗",

  // Optional: point this at an mp3 file placed next to index.html
  musicSrc: "cupid.mp3", // e.g. "assets/bg-music.mp3"
};

/* ---------------- state ---------------- */
const state = {
  activity: null,
  day: null,
  timeOfDay: null,
  clockTime: null,
  musicOn: false,
};

/* ---------------- element refs ---------------- */
const screenWindow = document.getElementById("screenWindow");
const bgHearts = document.getElementById("bgHearts");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const landingBtnRow = document.getElementById("landingBtnRow");
const activityGrid = document.getElementById("activityGrid");
const dayRow = document.getElementById("dayRow");
const dayPicker = document.getElementById("dayPicker");
const timeOfDayRow = document.getElementById("timeOfDayRow");
const timeGrid = document.getElementById("timeGrid");
const sumActivity = document.getElementById("sumActivity");
const sumDay = document.getElementById("sumDay");
const sumTime = document.getElementById("sumTime");
const confirmBtn = document.getElementById("confirmBtn");
const restartBtn = document.getElementById("restartBtn");
const musicBtn = document.getElementById("musicBtn");

let audioEl = null;

/* =========================================================
   SCREEN MANAGEMENT
   ========================================================= */
function showScreen(name) {
  const current = document.querySelector(".screen.active");
  const next = document.querySelector(`.screen[data-screen="${name}"]`);
  if (!next || next === current) return;

  if (current) {
    current.classList.add("leaving");
    current.classList.remove("active");
    setTimeout(() => current.classList.remove("leaving"), 300);
  }
  next.classList.add("active");
}

/* =========================================================
   AMBIENT BACKGROUND HEARTS
   ========================================================= */
function createHeart(opts = {}) {
  const heart = document.createElement("div");
  heart.className = "bg-heart";
  heart.textContent = opts.emoji || "💗";
  const left = opts.left ?? Math.random() * 100;
  const duration = opts.duration ?? 6 + Math.random() * 5;
  const drift = opts.drift ?? (Math.random() * 80 - 40) + "px";
  heart.style.left = left + "vw";
  heart.style.setProperty("--drift", drift);
  heart.style.animationDuration = duration + "s";
  heart.style.fontSize = (14 + Math.random() * 14) + "px";
  bgHearts.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000 + 200);
}

// gentle ambient hearts drifting up the whole time
setInterval(() => createHeart(), 1400);

/* =========================================================
   SPARKLE / CELEBRATION BURST
   ========================================================= */
function celebrationBurst(originEl, count = 18) {
  const rect = originEl
    ? originEl.getBoundingClientRect()
    : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
  const symbols = ["💗", "✨", "💖", "⭐", "💕"];

  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "sparkle";
    s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const x = rect.left + rect.width / 2 + (Math.random() * 240 - 120);
    const y = rect.top + rect.height / 2 + (Math.random() * 100 - 50);
    s.style.left = x + "px";
    s.style.top = y + "px";
    s.style.animationDelay = Math.random() * 200 + "ms";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1300);
  }
}

/* =========================================================
   LANDING SCREEN — YES / NO logic
   ========================================================= */
function handleYes() {
  celebrationBurst(yesBtn, 24);
  playClick();
  setTimeout(() => {
    showScreen("celebration");
    celebrationBurst(null, 16);
  }, 250);

  setTimeout(() => {
    showScreen("activity");
  }, 1800);
}

function handleNo() {
  // "No" never actually submits — it just dodges. This handler exists
  // for completeness / accessibility fallback (e.g. keyboard Enter).
  dodgeNoButton();
}

function dodgeNoButton() {
  const rowRect = landingBtnRow.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  // switch to absolute positioning within the row on first dodge
  if (!noBtn.classList.contains("dodging")) {
    noBtn.classList.add("dodging");
    noBtn.style.width = btnRect.width + "px";
  }

  const maxLeft = Math.max(0, rowRect.width - noBtn.offsetWidth);
  const maxTop = Math.max(0, rowRect.height - noBtn.offsetHeight);
  const newLeft = Math.random() * maxLeft;
  const newTop = Math.random() * maxTop;

  noBtn.style.left = newLeft + "px";
  noBtn.style.top = newTop + "px";
}

// Desktop: dodge when the cursor gets close
function setupNoDodge() {
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  if (!isTouch) {
    landingBtnRow.addEventListener("mousemove", (e) => {
      const btnRect = noBtn.getBoundingClientRect();
      const cx = btnRect.left + btnRect.width / 2;
      const cy = btnRect.top + btnRect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist < 70) dodgeNoButton();
    });
    noBtn.addEventListener("mouseenter", dodgeNoButton);
  } else {
    // Mobile: simply reposition on tap, never actually "select" it
    noBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      dodgeNoButton();
    }, { passive: false });
  }

  noBtn.addEventListener("click", (e) => {
    // if somehow clicked (edge case), just dodge again instead of doing anything
    e.preventDefault();
    dodgeNoButton();
  });
}

/* =========================================================
   ACTIVITY SELECTION
   ========================================================= */
function buildActivityCards() {
  activityGrid.innerHTML = "";
  CONFIG.activities.forEach((a) => {
    const card = document.createElement("button");
    card.className = "pixel-card";
    card.type = "button";
    card.dataset.id = a.id;
    card.innerHTML = `<span class="check">✔</span><span class="emoji">${a.emoji}</span><span>${a.label}</span>`;
    card.addEventListener("click", () => selectActivity(a, card));
    activityGrid.appendChild(card);
  });
}
function buildLocationCards() {
  locationGrid.innerHTML = "";
  CONFIG.locations.forEach((loc) => {
    const card = document.createElement("button");
    card.className = "pixel-card";
    card.type = "button";
    card.innerHTML = `<span class="check">✔</span><span class="emoji">${loc.emoji}</span><span>${loc.label}</span>`;
    card.addEventListener("click", () => selectLocation(loc, card));
    locationGrid.appendChild(card);
  });
}

function selectLocation(loc, cardEl) {
  state.location = loc.label;
  [...locationGrid.children].forEach((c) => c.classList.remove("selected"));
  cardEl.classList.add("selected");
  playClick();
  setTimeout(() => showScreen("day"), 450);
}
function selectActivity(activity, cardEl) {
  state.activity = activity.label;
  [...activityGrid.children].forEach((c) => c.classList.remove("selected"));
  cardEl.classList.add("selected");
  playClick();
  setTimeout(() => showScreen("location"), 450);
}

/* =========================================================
   DAY SELECTION
   ========================================================= */
function buildDayCards() {
  dayRow.innerHTML = "";
  CONFIG.days.forEach((d) => {
    const card = document.createElement("button");
    card.className = "pixel-card";
    card.type = "button";
    card.textContent = d;
    card.addEventListener("click", () => selectDay(d, card));
    dayRow.appendChild(card);
  });
}

function selectDay(day, cardEl) {
  state.day = day;
  dayPicker.value = "";
  [...dayRow.children].forEach((c) => c.classList.remove("selected"));
  if (cardEl) cardEl.classList.add("selected");
  playClick();
  setTimeout(() => showScreen("time"), 400);
}

function setupDayPicker() {
  dayPicker.addEventListener("change", () => {
    if (!dayPicker.value) return;
    const dateObj = new Date(dayPicker.value + "T00:00:00");
    const formatted = dateObj.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    state.day = formatted;
    [...dayRow.children].forEach((c) => c.classList.remove("selected"));
    playClick();
    setTimeout(() => showScreen("time"), 400);
  });
}

/* =========================================================
   TIME SELECTION
   ========================================================= */
function buildTimeCards() {
  timeOfDayRow.innerHTML = "";
  CONFIG.timesOfDay.forEach((t) => {
    const card = document.createElement("button");
    card.className = "pixel-card";
    card.type = "button";
    card.innerHTML = `<span class="emoji">${t.emoji}</span><span>${t.label}</span>`;
    card.addEventListener("click", () => selectTime(t.label, card, timeOfDayRow));
    timeOfDayRow.appendChild(card);
  });

  timeGrid.innerHTML = "";
  CONFIG.clockTimes.forEach((t) => {
    const card = document.createElement("button");
    card.className = "pixel-card";
    card.type = "button";
    card.innerHTML = `<span class="check">✔</span><span>${t}</span>`;
    card.addEventListener("click", () => selectTime(t, card, timeGrid));
    timeGrid.appendChild(card);
  });
}

function selectTime(label, cardEl, group) {
  state.clockTime = label;
  [...timeOfDayRow.children, ...timeGrid.children].forEach((c) => c.classList.remove("selected"));
  cardEl.classList.add("selected");
  playClick();
  setTimeout(() => {
    populateSummary();
    showScreen("confirm");
  }, 450);
}

/* =========================================================
   CONFIRMATION
   ========================================================= */
function populateSummary() {
  sumLocation.textContent = state.location || "—";
  sumActivity.textContent = state.activity || "—";
  sumDay.textContent = state.day || "—";
  sumTime.textContent = state.clockTime || "—";
}

function confirmDate() {
  celebrationBurst(confirmBtn, 20);
  playClick();
  
  // Put your Formspree Endpoint URL here
  const formspreeURL = "https://formspree.io/f/xljrkowl";

  // Send the data silently in the background
  fetch(formspreeURL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      Message: "New Date Accepted! 💗",
      Plan: state.activity,
      Place: state.location, // <-- ADD THIS LINE
      Day: state.day,
      Time: state.clockTime
    })
  }).then(response => {
    console.log("Answers sent successfully!");
  }).catch(error => {
    console.log("Error sending answers.");
  });

  setTimeout(() => showScreen("final"), 500);
}
/* =========================================================
   RESET
   ========================================================= */
function resetExperience() {
  state.activity = null;
  state.day = null;
  state.timeOfDay = null;
  state.clockTime = null;

  [...activityGrid.children].forEach((c) => c.classList.remove("selected"));
  [...dayRow.children].forEach((c) => c.classList.remove("selected"));
  [...timeOfDayRow.children, ...timeGrid.children].forEach((c) => c.classList.remove("selected"));
  dayPicker.value = "";

  // reset dodging NO button back to its normal spot in flow
  noBtn.classList.remove("dodging");
  noBtn.style.left = "";
  noBtn.style.top = "";
  noBtn.style.width = "";

  showScreen("landing");
}

/* =========================================================
   SOUND (optional, safe if no file provided)
   ========================================================= */
function setupMusic() {
  if (!CONFIG.musicSrc) {
    musicBtn.addEventListener("click", () => {
      // No track configured — button still gives feedback, just no-ops.
      state.musicOn = !state.musicOn;
      musicBtn.textContent = state.musicOn ? "🔊" : "🔈";
    });
    return;
  }

  audioEl = new Audio(CONFIG.musicSrc);
  audioEl.loop = true;
  audioEl.volume = 0.4;

  musicBtn.addEventListener("click", () => {
    state.musicOn = !state.musicOn;
    musicBtn.textContent = state.musicOn ? "🔊" : "🔈";
    if (state.musicOn) {
      audioEl.play().catch(() => {
        // Autoplay-style rejection — just flip the icon back
        state.musicOn = false;
        musicBtn.textContent = "🔈";
      });
    } else {
      audioEl.pause();
    }
  });
}

// tiny UI click blip using WebAudio, no file needed
let audioCtx = null;
function playClick() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.value = 660;
    gain.gain.value = 0.03;
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
    osc.stop(audioCtx.currentTime + 0.13);
  } catch (e) {
    /* audio not available — silently ignore */
  }
}

/* =========================================================
   INIT
   ========================================================= */
function init() {
  buildLocationCards();
  buildActivityCards();
  buildDayCards();
  buildTimeCards();
  setupNoDodge();
  setupDayPicker();
  setupMusic();

  yesBtn.addEventListener("click", handleYes);
  confirmBtn.addEventListener("click", confirmDate);
  restartBtn.addEventListener("click", resetExperience);

  // seed a few hearts immediately so the background isn't empty on load
  for (let i = 0; i < 6; i++) {
    setTimeout(() => createHeart({ left: Math.random() * 100 }), i * 300);
  }
}

document.addEventListener("DOMContentLoaded", init);
