/* src/scripts/dashboard.js
   1) bar/donut chart code + placeholders
   2) Pulls live pulse & RMSSD from polarConnect
   3) Renders real RR intervals in the line chart
   4) Saves RMSSD to DB every 3 minutes
*/
import { connectPolarH10 } from "./polarConnect.js";
// Import polar logic &  a saveRMSSDtoDB() function
// import { getCurrentPulse, getCurrentRMSSD, getRRData } from "./polarConnect.js";
import {
  getCurrentPulse,
  getCurrentRMSSD,
  getRRData,
  saveRMSSDtoDB
} from "./polarConnect.js";


document.addEventListener("DOMContentLoaded", () => {
  console.log("dashboard.js: Setting up charts with constrained sizes.");

  // Grab existing DOM elements
  const currentHRVValueEl = document.getElementById("currentHRVValue");
  const currentHRVTextEl = document.getElementById("currentHRVText");
  const rrLineCtx = document.getElementById("rrLineChart");
  const barCtx = document.getElementById("hrvBarChart");
  const donutCtx = document.getElementById("hrvDonutChart");
  const rmssdValEl = document.getElementById("RMSSDval");
  const rmssdTextEl = document.getElementById("RMSSDvaltext");

  // ====== 1) Setup bar chart  ======
  let barChart = null;
  if (barCtx) {
    barChart = new Chart(barCtx, {
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],  // placeholders
        datasets: [
          {
            label: "HRV Score",
            data: [60, 65, 75, 70, 80], // placeholders
            backgroundColor: "#1E90FF",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  // ====== 2) Setup donut chart  ======
  let donutChart = null;
  if (donutCtx) {
    donutChart = new Chart(donutCtx, {
      type: "doughnut",
      data: {
        labels: ["Low Stress", "Moderate Stress", "High Stress"],
        datasets: [
          {
            data: [35, 40, 25], // placeholders
            backgroundColor: ["#00FF7F", "#FFD700", "#FF4500"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  // ====== 3) Setup RR line chart  ======
  let rrLineChart = null;
  if (rrLineCtx) {
    rrLineChart = new Chart(rrLineCtx, {
      type: "line",
      data: {
        labels: Array.from({ length: 30 }, (_, i) => `Sample ${i + 1}`),
        datasets: [
          {
            label: "RR Intervals (ms)",
            data: Array.from({ length: 30 }, () => 600 + Math.random() * 700), // placeholder
            borderColor: "#1E90FF",
            backgroundColor: "rgba(30,144,255, 0.1)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
          },
        },
      },
    });
  }

  // ====== 4) Live updates for pulse, RMSSD, RR chart ======

  // A) Update the pulse and RMSSD display every second
  setInterval(() => {
    // Get live pulse from polar
    const currentPulse = getCurrentPulse();  // e.g. 78
    if (currentPulse && currentHRVValueEl) {
      currentHRVValueEl.textContent = currentPulse.toString();
    }

    // interpret the pulse range & update currentHRVTextEl
    // e.g. "Your pulse is in a healthy range."
    if (currentHRVTextEl && currentPulse) {
      if (currentPulse < 60) {
        currentHRVTextEl.textContent = "Your pulse is somewhat low";
      } else if (currentPulse < 100) {
        currentHRVTextEl.textContent = "Your pulse is in a healthy range.";
      } else {
        currentHRVTextEl.textContent = "Your pulse is somewhat high. Try to relax.";
      }
    }

    // Get RMSSD from polar
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

  // B) Update RR line chart data every 2 seconds
  setInterval(() => {
    if (rrLineChart) {
      const rrData = getRRData(); // an array of intervals
      const labels = rrData.map((_, i) => `Sample ${i + 1}`);

      rrLineChart.data.labels = labels;
      rrLineChart.data.datasets[0].data = rrData;
      rrLineChart.update();
    }
  }, 2000);

  // C) Save RMSSD to DB every 3 minutes
  setInterval(() => {
    const rmssdVal = getCurrentRMSSD();
    if (rmssdVal && typeof saveRMSSDtoDB === "function") {
      saveRMSSDtoDB(rmssdVal).catch(err =>
        console.error("Failed to save RMSSD in DB:", err)
      );
    }
  }, 3 * 60_000);

  const polarBtn = document.getElementById("polarConnectBtn");
  if (polarBtn) {
    polarBtn.addEventListener("click", async () => {
      try {
        await connectPolarH10();
      } catch (err) {
        console.error("Error while connecting to Polar H10:", err);
        alert("Could not connect to the Polar H10 device.");
      }
    });
  }


  // D) If you want to periodically fetch daily stats for the bar chart or
  //    a distribution from the server for the donut chart, you can do something similar:
  //
  // setInterval(async () => {
  //   try {
  //     const dailyStats = await fetchDailyStats();
  //     // e.g. dailyStats => [ { date: "2025-09-01", max_hrv_value: 72 }, ... ]
  //     barChart.data.labels = dailyStats.map(item => item.date);
  //     barChart.data.datasets[0].data = dailyStats.map(item => item.max_hrv_value);
  //     barChart.update();
  //   } catch (err) {
  //     console.error("Fetching daily stats failed:", err);
  //   }
  // }, 120_000);
});
