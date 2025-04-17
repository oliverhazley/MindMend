import { requireAuth } from "./utils.js";
import { getCurrentPulse, getCurrentRMSSD } from "./polarConnect.js";

const audioPlayers = []; // ✅ Track all manually created audio players

export function stopAllExerciseAudio() {
  audioPlayers.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
}

export function initExercises() {
  if (!requireAuth()) return;

  console.log("🧘‍♀️ Loading exercises page");
  lucide.createIcons();

  const mindfulnessList = document.getElementById("mindfulnessList");
  const breathingList = document.getElementById("breathingList");

  if (mindfulnessList) mindfulnessList.innerHTML = "";
  if (breathingList) breathingList.innerHTML = "";

  const pulseValueEl = document.getElementById("pulseValue");
  const rmssdValueEl = document.getElementById("rmssdValue");

  setInterval(() => {
    if (pulseValueEl) {
      const pulse = getCurrentPulse();
      pulseValueEl.textContent = pulse ? `${pulse} bpm` : "--";
    }
    if (rmssdValueEl) {
      const rmssd = getCurrentRMSSD();
      rmssdValueEl.textContent = rmssd ? `${rmssd.toFixed(2)} ms` : "--";
    }
  }, 1000);

  //  ACCORDION TOGGLE (prevent double-binding)
  document.querySelectorAll(".accordion-btn").forEach((btn) => {
    if (btn.dataset.bound === "true") return;
    btn.dataset.bound = "true";

    btn.addEventListener("click", () => {
      const panelId = btn.getAttribute("data-target");
      const panel = document.getElementById(panelId);
      if (!panel) return;

      const icon = btn.querySelector(".accordion-icon");

      const isOpen = !panel.classList.contains("closed");
      if (isOpen) {
        panel.classList.add("closed");
        icon.textContent = "▼";
      } else {
        panel.classList.remove("closed");
        icon.textContent = "▲";
      }
    });
  });


  // === MINDFULNESS AUDIO ITEMS ===
  const mindfulnessItems = [
    {
      id: "nature",
      title: "Forest Stream",
      description: "Relaxing sounds of water and birds chirping",
      icon: "tree-pine",
      audioUrl: "/sounds/stream.mp3",
    },
    {
      id: "waves",
      title: "Rainstorm",
      description: "Relaxing sounds of a rainstorm",
      icon: "cloud-rain",
      audioUrl: "/sounds/rain.mp3",
    },
    {
      id: "morning",
      title: "Campfire",
      description: "Gentle sounds of a campfire",
      icon: "flame-kindling",
      audioUrl: "/sounds/fire.mp3",
    },
  ];

  mindfulnessItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "flex items-center justify-between py-3 border-b border-gray-700 last:border-none";

    const leftDiv = document.createElement("div");
    leftDiv.className = "flex items-center space-x-3";
    leftDiv.innerHTML = `
      <i data-lucide="${item.icon}" class="w-6 h-6 text-gray-200"></i>
      <div>
        <p class="font-semibold">${item.title}</p>
        <p class="text-sm text-gray-400">${item.description}</p>
      </div>
    `;

    const rightDiv = document.createElement("div");
    rightDiv.className = "flex space-x-2";

    const playPauseBtn = document.createElement("button");
    playPauseBtn.className = "playPauseBtn flex items-center justify-center w-9 h-9 rounded-md bg-blue-600 hover:bg-blue-700";
    playPauseBtn.dataset.state = "play";
    playPauseBtn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i>`;

    const resetBtn = document.createElement("button");
    resetBtn.className = "resetBtn flex items-center justify-center w-9 h-9 rounded-md bg-gray-600 hover:bg-gray-700";
    resetBtn.innerHTML = `<i data-lucide="refresh-cw" class="w-4 h-4"></i>`;

    rightDiv.appendChild(playPauseBtn);
    rightDiv.appendChild(resetBtn);
    row.appendChild(leftDiv);
    row.appendChild(rightDiv);

    const progressWrapper = document.createElement("div");
    progressWrapper.className = "hidden bg-gray-700 rounded h-2 w-full mt-2";
    const progressBar = document.createElement("div");
    progressBar.className = "bg-blue-500 h-full w-0 transition-all";
    progressWrapper.appendChild(progressBar);

    const audio = new Audio(item.audioUrl);
    audioPlayers.push(audio);

    let isPlaying = false;
    let intervalId = null;

    function switchToPause() {
      playPauseBtn.dataset.state = "pause";
      playPauseBtn.classList.remove("bg-blue-600", "hover:bg-blue-700");
      playPauseBtn.classList.add("bg-red-600", "hover:bg-red-700");
      playPauseBtn.innerHTML = `<i data-lucide="pause" class="w-4 h-4"></i>`;
      lucide.createIcons();
    }

    function revertToPlay() {
      playPauseBtn.dataset.state = "play";
      playPauseBtn.classList.remove("bg-red-600", "hover:bg-red-700");
      playPauseBtn.classList.add("bg-blue-600", "hover:bg-blue-700");
      playPauseBtn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i>`;
      lucide.createIcons();
    }

    function updateProgress() {
      if (audio.duration && !isNaN(audio.duration)) {
        const pct = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = pct + "%";
        if (audio.currentTime >= audio.duration) {
          isPlaying = false;
          revertToPlay();
          progressWrapper.classList.add("hidden");
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    }

    function startInterval() {
      clearInterval(intervalId);
      intervalId = setInterval(updateProgress, 200);
    }

    playPauseBtn.addEventListener("click", async () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        switchToPause();
        progressWrapper.classList.remove("hidden");
        try {
          await audio.play();
        } catch (err) {
          console.error("Audio play error:", err);
        }
        startInterval();
      } else {
        revertToPlay();
        audio.pause();
        clearInterval(intervalId);
        intervalId = null;
      }
    });

    resetBtn.addEventListener("click", () => {
      if (isPlaying) {
        isPlaying = false;
        audio.pause();
        revertToPlay();
      }
      audio.currentTime = 0;
      progressWrapper.classList.add("hidden");
      progressBar.style.width = "0%";
      clearInterval(intervalId);
      intervalId = null;
    });

    mindfulnessList.appendChild(row);
    mindfulnessList.appendChild(progressWrapper);
  });

  // === BREATHING ===
  const breathingItems = [
    {
      id: "box",
      title: "Box Breathing",
      description: "4-4-4-4 breathing technique",
      icon: "wind",
    },
    {
      id: "478",
      title: "4-7-8 Breathing",
      description: "Relaxation breathing method",
      icon: "wind",
    },
  ];

  breathingItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "flex items-center justify-between py-3 border-b border-gray-700 last:border-none";

    const leftDiv = document.createElement("div");
    leftDiv.className = "flex items-center space-x-3";
    leftDiv.innerHTML = `
      <i data-lucide="${item.icon}" class="w-6 h-6 text-gray-200"></i>
      <div>
        <p class="font-semibold">${item.title}</p>
        <p class="text-sm text-gray-400">${item.description}</p>
      </div>
    `;

    const rightDiv = document.createElement("div");
    rightDiv.className = "flex space-x-2";

    const playPauseBtn = document.createElement("button");
    playPauseBtn.className = "playPauseBtn flex items-center justify-center w-9 h-9 rounded-md bg-blue-600 hover:bg-blue-700";
    playPauseBtn.dataset.state = "play";
    playPauseBtn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i>`;

    const resetBtn = document.createElement("button");
    resetBtn.className = "resetBtn flex items-center justify-center w-9 h-9 rounded-md bg-gray-600 hover:bg-gray-700";
    resetBtn.innerHTML = `<i data-lucide="refresh-cw" class="w-4 h-4"></i>`;

    rightDiv.appendChild(playPauseBtn);
    rightDiv.appendChild(resetBtn);
    row.appendChild(leftDiv);
    row.appendChild(rightDiv);

    const progressWrapper = document.createElement("div");
    progressWrapper.className = "hidden bg-gray-700 rounded h-2 w-full mt-2";
    const progressBar = document.createElement("div");
    progressBar.className = "bg-blue-500 h-full w-0 transition-all";
    progressWrapper.appendChild(progressBar);

    const audio = new Audio("/sounds/breath.mp3"); // optional file
    audioPlayers.push(audio);

    let isPlaying = false;
    let intervalId = null;
    let progress = 0;
    const totalTime = 10000;

    function switchToPause() {
      playPauseBtn.dataset.state = "pause";
      playPauseBtn.classList.remove("bg-blue-600", "hover:bg-blue-700");
      playPauseBtn.classList.add("bg-red-600", "hover:bg-red-700");
      playPauseBtn.innerHTML = `<i data-lucide="pause" class="w-4 h-4"></i>`;
      lucide.createIcons();
    }

    function revertToPlay() {
      playPauseBtn.dataset.state = "play";
      playPauseBtn.classList.remove("bg-red-600", "hover:bg-red-700");
      playPauseBtn.classList.add("bg-blue-600", "hover:bg-blue-700");
      playPauseBtn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i>`;
      lucide.createIcons();
    }

    function updateBar() {
      const pct = (progress / totalTime) * 100;
      progressBar.style.width = pct + "%";
    }

    function stopTimer() {
      if (intervalId) clearInterval(intervalId);
    }

    function startTimer() {
      stopTimer();
      intervalId = setInterval(() => {
        progress += 100;
        if (progress >= totalTime) {
          progress = totalTime;
          isPlaying = false;
          stopTimer();
          revertToPlay();
        }
        updateBar();
      }, 100);
    }

    playPauseBtn.addEventListener("click", () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        switchToPause();
        progressWrapper.classList.remove("hidden");
        startTimer();
      } else {
        revertToPlay();
        stopTimer();
      }
    });

    resetBtn.addEventListener("click", () => {
      if (isPlaying) {
        isPlaying = false;
        revertToPlay();
      }
      stopTimer();
      progress = 0;
      updateBar();
      progressWrapper.classList.add("hidden");
    });

    breathingList.appendChild(row);
    breathingList.appendChild(progressWrapper);
  });

  lucide.createIcons();
}
