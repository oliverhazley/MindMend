/*
  exercises.js
  - Loaded by "exercises.html", manages breathing animation and sound therapy.
*/
document.addEventListener("DOMContentLoaded", () => {
  console.log("exercises.js loaded: setting up breathing and sound therapy.");

  // GUIDED BREATHING
  const startBreathingBtn = document.getElementById("startBreathingBtn");
  const breathingAnimation = document.getElementById("breathingAnimation");
  if (startBreathingBtn && breathingAnimation) {
    startBreathingBtn.addEventListener("click", () => {
      // Simple example: display text
      // In a real app, you could do an expanding/contracting animation using CSS or JS intervals
      breathingAnimation.innerText = "Inhale... Exhale...";
    });
  }

  // SOUND THERAPY
  const therapySound = document.getElementById("therapySound");
  const playSoundBtn = document.getElementById("playSoundBtn");
  const pauseSoundBtn = document.getElementById("pauseSoundBtn");

  if (therapySound && playSoundBtn && pauseSoundBtn) {
    playSoundBtn.addEventListener("click", () => {
      therapySound.play();
    });
    pauseSoundBtn.addEventListener("click", () => {
      therapySound.pause();
    });
  }
});
