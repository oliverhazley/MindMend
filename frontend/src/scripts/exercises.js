// src/scripts/exercises.js

// -------------------------------------------------------
// This file powers the “Exercises” page.
// It handles two kinds of exercises:
//  1) Mindfulness audio tracks (nature sounds, rain, campfire, etc.)
//   2) Breathing exercises (guided by audio clips)
// It also:
//  - Shows your current heart rate (pulse) and HRV (RMSSD) in real time
//  - Manages play/pause/reset for each audio exercise
//  - Shows a progress bar so you can see how much time is left
//  - Supports translations for all text, including dynamic content
//  - Uses the Lucide icon library for all icons
// -------------------------------------------------------

// We need to protect our exercises behind a login check.
import {requireAuth} from './router.js';

// These two functions give us your latest heart data.
import {getCurrentPulse, getCurrentRMSSD} from './polarConnect.js';

// This lets us trigger text translations on-the-fly.
import {initI18n} from './i18n.js';

// We will keep track of every Audio object we create,
// so we can stop them all if the user leaves the page.
const audioPlayers = [];

/**
 * stopAllExerciseAudio
 * ---------------------
 * If the user switches away or wants to stop everything,
 * we pause and reset every audio clip we’ve created.
 */
export function stopAllExerciseAudio() {
  audioPlayers.forEach((audio) => {
    audio.pause(); // stop playback
    audio.currentTime = 0; // rewind to start
  });
}

/**
 * initExercises
 * -------------
 * This is the main function called when the Exercises page loads.
 * It builds all the UI, wires up buttons, and starts real-time updates.
 */
export function initExercises() {
  // 1) Make sure the user is logged in; otherwise, do nothing.
  if (!requireAuth()) return;

  console.log('Loading exercises page');

  // 2) Render all Lucide icons on the page.
  lucide.createIcons();

  // 3) Find the containers where we'll insert our exercise items.
  const mindfulnessList = document.getElementById('mindfulnessList');
  const breathingList = document.getElementById('breathingList');

  // Clear out anything that was there before, so we start fresh.
  if (mindfulnessList) mindfulnessList.innerHTML = '';
  if (breathingList) breathingList.innerHTML = '';

  // 4) Find the elements where we show pulse and HRV values.
  const pulseValueEl = document.getElementById('pulseValue');
  const rmssdValueEl = document.getElementById('rmssdValue');

  // 5) Every second, update the pulse & RMSSD display:
  setInterval(() => {
    if (pulseValueEl) {
      const pulse = getCurrentPulse();
      // If we have a number, show “XX bpm”; otherwise “--”.
      pulseValueEl.textContent = pulse ? `${pulse} bpm` : '--';
    }
    if (rmssdValueEl) {
      const rmssd = getCurrentRMSSD();
      // Show the RMSSD value with two decimal places, or “--”.
      rmssdValueEl.textContent = rmssd ? `${rmssd.toFixed(2)} ms` : '--';
    }
  }, 1000); // 1000 ms = 1 second

  // 6) Set up our accordion buttons so sections can open/close.
  //    We mark each button as “bound” so we don’t attach multiple listeners.
  document.querySelectorAll('.accordion-btn').forEach((btn) => {
    if (btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', () => {
      const panelId = btn.getAttribute('data-target');
      const panel = document.getElementById(panelId);
      if (!panel) return;

      const icon = btn.querySelector('.accordion-icon');
      const isOpen = !panel.classList.contains('closed');

      // Toggle the “closed” class to show/hide the panel,
      // and switch the arrow icon between ▲ and ▼.
      if (isOpen) {
        panel.classList.add('closed');
        icon.textContent = '▼';
      } else {
        panel.classList.remove('closed');
        icon.textContent = '▲';
      }
    });
  });

  // === MINDFULNESS AUDIO ITEMS ===
  // Define each mindfulness item with:
  //  - id: a unique name
  //  - titleKey & descriptionKey: translation keys for text
  //  - icon: which Lucide icon to show
  //  - audioUrl: which MP3 to play
  const mindfulnessItems = [
    {
      id: 'nature',
      titleKey: 'exercises.mindfulness.nature.title',
      descriptionKey: 'exercises.mindfulness.nature.description',
      icon: 'tree-pine',
      audioUrl: '/sounds/stream.mp3',
    },
    {
      id: 'waves',
      titleKey: 'exercises.mindfulness.waves.title',
      descriptionKey: 'exercises.mindfulness.waves.description',
      icon: 'cloud-rain',
      audioUrl: '/sounds/rain.mp3',
    },
    {
      id: 'morning',
      titleKey: 'exercises.mindfulness.morning.title',
      descriptionKey: 'exercises.mindfulness.morning.description',
      icon: 'flame-kindling',
      audioUrl: '/sounds/fire.mp3',
    },
  ];

  // For each mindfulness exercise:
  mindfulnessItems.forEach((item) => {
    // Create a row container
    const row = document.createElement('div');
    row.className =
      'flex items-center justify-between py-3 border-b border-gray-700 last:border-none';

    // LEFT SIDE: icon + title + description
    const leftDiv = document.createElement('div');
    leftDiv.className = 'flex items-center space-x-3';
    leftDiv.innerHTML = `
      <!-- icon -->
      <i data-lucide="${item.icon}" class="w-6 h-6 text-gray-200"></i>
      <div>
        <!-- The data-i18n-key attribute lets our translator swap in the right text -->
        <p class="font-semibold" data-i18n-key="${item.titleKey}"></p>
        <p class="text-sm text-gray-400" data-i18n-key="${item.descriptionKey}"></p>
      </div>
    `;

    // RIGHT SIDE: play/pause and reset buttons
    const rightDiv = document.createElement('div');
    rightDiv.className = 'flex space-x-2';

    // Play/Pause button
    const playPauseBtn = document.createElement('button');
    playPauseBtn.id = `playPauseBtn-${item.id}`;
    playPauseBtn.className =
      'playPauseBtn flex items-center justify-center w-9 h-9 rounded-md bg-blue-600 hover:bg-blue-700';
    playPauseBtn.dataset.state = 'play'; // start in “play” state
    playPauseBtn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i>`;

    // Reset button (rewind to start)
    const resetBtn = document.createElement('button');
    resetBtn.id = `resetBtn-${item.id}`;
    resetBtn.className =
      'resetBtn flex items-center justify-center w-9 h-9 rounded-md bg-gray-600 hover:bg-gray-700';
    resetBtn.innerHTML = `<i data-lucide="refresh-cw" class="w-4 h-4"></i>`;

    rightDiv.append(playPauseBtn, resetBtn);
    row.append(leftDiv, rightDiv);

    // PROGRESS BAR: hidden until playback starts
    const progressWrapper = document.createElement('div');
    progressWrapper.className = 'hidden bg-gray-700 rounded h-2 w-full mt-2';
    const progressBar = document.createElement('div');
    progressBar.className = 'bg-blue-500 h-full w-0 transition-all';
    progressWrapper.appendChild(progressBar);

    // Create the actual audio element
    const audio = new Audio(item.audioUrl);
    audioPlayers.push(audio); // remember it so we can stop all later

    // Keep track of whether this audio is currently playing
    let isPlaying = false;
    let intervalId = null; // will hold our timer ID

    // Helper: switch button from “play” to “pause” look
    function switchToPause() {
      playPauseBtn.dataset.state = 'pause';
      playPauseBtn.classList.replace('bg-blue-600', 'bg-red-600');
      playPauseBtn.classList.replace('hover:bg-blue-700', 'hover:bg-red-700');
      playPauseBtn.innerHTML = `<i data-lucide="pause" class="w-4 h-4"></i>`;
      lucide.createIcons(); // re-render icon
    }

    // Helper: switch button from “pause” back to “play”
    function revertToPlay() {
      playPauseBtn.dataset.state = 'play';
      playPauseBtn.classList.replace('bg-red-600', 'bg-blue-600');
      playPauseBtn.classList.replace('hover:bg-red-700', 'hover:bg-blue-700');
      playPauseBtn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i>`;
      lucide.createIcons();
    }

    // Called every fraction of a second to update the progress bar
    function updateProgress() {
      // Only if we know the audio duration
      if (!isNaN(audio.duration) && audio.duration > 0) {
        // Calculate percentage played
        const pct = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = pct + '%';

        // If the audio finished, reset everything
        if (audio.ended) {
          isPlaying = false;
          revertToPlay();
          progressWrapper.classList.add('hidden');
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    }

    // Starts the repeating timer to update progress
    function startInterval() {
      clearInterval(intervalId);
      intervalId = setInterval(updateProgress, 200); // update 5 times/sec
    }

    // When the play/pause button is clicked:
    playPauseBtn.addEventListener('click', async () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        // Start playing:
        switchToPause();
        progressWrapper.classList.remove('hidden');
        try {
          await audio.play();
        } catch (err) {
          console.error('Audio play error:', err);
        }
        startInterval();
      } else {
        // Pause playback:
        revertToPlay();
        audio.pause();
        clearInterval(intervalId);
        intervalId = null;
      }
    });

    // When the reset button is clicked:
    resetBtn.addEventListener('click', () => {
      if (isPlaying) {
        isPlaying = false;
        audio.pause();
        revertToPlay();
      }
      // Move playback back to the start
      audio.currentTime = 0;
      progressWrapper.classList.add('hidden');
      progressBar.style.width = '0%';
      clearInterval(intervalId);
      intervalId = null;
    });

    // Add this exercise’s row + progress bar into the page
    mindfulnessList.appendChild(row);
    mindfulnessList.appendChild(progressWrapper);
  });

  // === BREATHING EXERCISES ===
  // Very similar to mindfulness, but with different audio clips.
  const breathingItems = [
    {
      id: 'box',
      titleKey: 'exercises.breathing.box.title',
      descriptionKey: 'exercises.breathing.box.description',
      icon: 'wind',
      audioUrl: '/sounds/box.mp3',
    },
    {
      id: '478',
      titleKey: 'exercises.breathing.478.title',
      descriptionKey: 'exercises.breathing.478.description',
      icon: 'wind',
      audioUrl: '/sounds/478.mp3',
    },
  ];

  breathingItems.forEach((item) => {
    // We repeat the exact same steps:
    const row = document.createElement('div');
    row.className =
      'flex items-center justify-between py-3 border-b border-gray-700 last:border-none';

    const leftDiv = document.createElement('div');
    leftDiv.className = 'flex items-center space-x-3';
    leftDiv.innerHTML = `
      <i data-lucide="${item.icon}" class="w-6 h-6 text-gray-200"></i>
      <div>
        <p class="font-semibold" data-i18n-key="${item.titleKey}"></p>
        <p class="text-sm text-gray-400" data-i18n-key="${item.descriptionKey}"></p>
      </div>
    `;

    const rightDiv = document.createElement('div');
    rightDiv.className = 'flex space-x-2';

    const playPauseBtn = document.createElement('button');
    playPauseBtn.id = `playPauseBtn-${item.id}`;
    playPauseBtn.className =
      'playPauseBtn flex items-center justify-center w-9 h-9 rounded-md bg-blue-600 hover:bg-blue-700';
    playPauseBtn.dataset.state = 'play';
    playPauseBtn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i>`;

    const resetBtn = document.createElement('button');
    resetBtn.id = `resetBtn-${item.id}`;
    resetBtn.className =
      'resetBtn flex items-center justify-center w-9 h-9 rounded-md bg-gray-600 hover:bg-gray-700';
    resetBtn.innerHTML = `<i data-lucide="refresh-cw" class="w-4 h-4"></i>`;

    rightDiv.append(playPauseBtn, resetBtn);
    row.append(leftDiv, rightDiv);

    const progressWrapper = document.createElement('div');
    progressWrapper.className = 'hidden bg-gray-700 rounded h-2 w-full mt-2';
    const progressBar = document.createElement('div');
    progressBar.className = 'bg-blue-500 h-full w-0 transition-all';
    progressWrapper.appendChild(progressBar);

    const audio = new Audio(item.audioUrl);
    audioPlayers.push(audio);

    let isPlaying = false;
    let intervalId = null;

    function switchToPause() {
      playPauseBtn.dataset.state = 'pause';
      playPauseBtn.classList.replace('bg-blue-600', 'bg-red-600');
      playPauseBtn.classList.replace('hover:bg-blue-700', 'hover:bg-red-700');
      playPauseBtn.innerHTML = `<i data-lucide="pause" class="w-4 h-4"></i>`;
      lucide.createIcons();
    }

    function revertToPlay() {
      playPauseBtn.dataset.state = 'play';
      playPauseBtn.classList.replace('bg-red-600', 'bg-blue-600');
      playPauseBtn.classList.replace('hover:bg-red-700', 'hover:bg-blue-700');
      playPauseBtn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i>`;
      lucide.createIcons();
    }

    function updateProgress() {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        const pct = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = pct + '%';
        if (audio.ended) {
          isPlaying = false;
          revertToPlay();
          progressWrapper.classList.add('hidden');
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    }

    function startInterval() {
      clearInterval(intervalId);
      intervalId = setInterval(updateProgress, 200);
    }

    playPauseBtn.addEventListener('click', async () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        switchToPause();
        progressWrapper.classList.remove('hidden');
        try {
          await audio.play();
        } catch (err) {
          console.error('Audio play error:', err);
        }
        startInterval();
      } else {
        revertToPlay();
        audio.pause();
        clearInterval(intervalId);
        intervalId = null;
      }
    });

    resetBtn.addEventListener('click', () => {
      if (isPlaying) {
        isPlaying = false;
        audio.pause();
        revertToPlay();
      }
      audio.currentTime = 0;
      progressWrapper.classList.add('hidden');
      progressBar.style.width = '0%';
      clearInterval(intervalId);
      intervalId = null;
    });

    breathingList.appendChild(row);
    breathingList.appendChild(progressWrapper);
  });

  // 7) Finally, re-render icons and trigger translation
  lucide.createIcons();
  initI18n(); // This finds every element with data-i18n-key and swaps in the right text
}
