// src/scripts/dashboard.js

import {
  getCurrentPulse,
  getCurrentRMSSD,
  getRRData,
  connectPolarH10,
} from "./polarConnect.js";
import { requireAuth } from "./utils.js";

// Called when user navigates to #/dashboard
export function initDashboard() {
  console.log("📊 Initializing dashboard...");

  if (!requireAuth()) return;

  const currentHRVValueEl = document.getElementById("currentHRVValue");
  const currentHRVTextEl = document.getElementById("currentHRVText");
  const rrLineCtx = document.getElementById("rrLineChart");
  const barCtx = document.getElementById("hrvBarChart");
  const donutCtx = document.getElementById("hrvDonutChart");
  const rmssdValEl = document.getElementById("RMSSDval");
  const rmssdTextEl = document.getElementById("RMSSDvaltext");
  const polarBtn = document.getElementById("polarConnectBtn");

  // === Setup Chart.js Charts ===
  let barChart = null;
  if (barCtx) {
    barChart = new Chart(barCtx, {
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [{ label: "HRV Score", data: [60, 65, 75, 70, 80], backgroundColor: "#1E90FF" }],
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } },
    });
  }

  let donutChart = null;
  if (donutCtx) {
    donutChart = new Chart(donutCtx, {
      type: "doughnut",
      data: {
        labels: ["Low Stress", "Moderate Stress", "High Stress"],
        datasets: [{ data: [35, 40, 25], backgroundColor: ["#00FF7F", "#FFD700", "#FF4500"] }],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }

  let rrLineChart = null;
  if (rrLineCtx) {
    rrLineChart = new Chart(rrLineCtx, {
      type: "line",
      data: {
        labels: Array.from({ length: 30 }, (_, i) => `Sample ${i + 1}`),
        datasets: [{
          label: "RR Intervals (ms)",
          data: Array.from({ length: 30 }, () => 600 + Math.random() * 700),
          borderColor: "#1E90FF",
          backgroundColor: "rgba(30,144,255, 0.1)",
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: false } },
      },
    });
  }

  // === Live Data Updates ===
  setInterval(() => {
    const currentPulse = getCurrentPulse();
    if (currentPulse && currentHRVValueEl) {
      currentHRVValueEl.textContent = currentPulse.toString();
    }

    if (currentHRVTextEl && currentPulse) {
      if (currentPulse < 60) {
        currentHRVTextEl.textContent = "Your pulse is somewhat low";
      } else if (currentPulse < 100) {
        currentHRVTextEl.textContent = "Your pulse is in a healthy range.";
      } else {
        currentHRVTextEl.textContent = "Your pulse is somewhat high. Try to relax.";
      }
    }

    const rmssdVal = getCurrentRMSSD();
    if (rmssdVal && rmssdValEl) {
      rmssdValEl.textContent = rmssdVal.toFixed(2);
    }

    if (rmssdTextEl && rmssdVal) {
      if (rmssdVal < 40) {
        rmssdTextEl.textContent = "Your HRV is on the lower side. Consider a rest or mindful break.";
      } else if (rmssdVal < 80) {
        rmssdTextEl.textContent = "Your HRV is moderate, suggesting balanced recovery and stress levels.";
      } else {
        rmssdTextEl.textContent = "Great HRV! Keep up the good work with your self-care.";
      }
    }
  }, 1000);

  setInterval(() => {
    if (rrLineChart) {
      const rrData = getRRData();
      const labels = rrData.map((_, i) => `Sample ${i + 1}`);
      rrLineChart.data.labels = labels;
      rrLineChart.data.datasets[0].data = rrData;
      rrLineChart.update();
    }
  }, 2000);

  // === Polar H10 Connect Button ===
  if (polarBtn && !polarBtn.dataset.bound) {
    polarBtn.dataset.bound = "true"; // prevent duplicate listeners
    polarBtn.addEventListener("click", async () => {
      try {
        await connectPolarH10();
      } catch (err) {
        console.error("Error while connecting to Polar H10:", err);
        alert("Could not connect to the Polar H10 device.");
      }
    });
  }
}
