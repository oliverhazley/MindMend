/* src/scripts/dashboard.js */

document.addEventListener("DOMContentLoaded", () => {
  console.log("dashboard.js: Setting up charts with constrained sizes.");

  // Current HRV
  const currentHRVValueEl = document.getElementById("currentHRVValue");
  const currentHRVTextEl = document.getElementById("currentHRVText");
  // (Fetch current HRV logic)...

  // Bar Chart: HRV Progress
  const barCtx = document.getElementById("hrvBarChart");
  if (barCtx) {
    new Chart(barCtx, {
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [{ label: "HRV Score", data: [60, 65, 75, 70, 80], backgroundColor: "#1E90FF" }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // So it fills the container's .h-64
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  // Donut Chart: HRV Distribution
  const donutCtx = document.getElementById("hrvDonutChart");
  if (donutCtx) {
    new Chart(donutCtx, {
      type: "doughnut",
      data: {
        labels: ["Low Stress", "Moderate Stress", "High Stress"],
        datasets: [
          {
            data: [35, 40, 25],
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

  // Line Chart: RR Intervals
  const rrLineCtx = document.getElementById("rrLineChart");
  if (rrLineCtx) {
    new Chart(rrLineCtx, {
      type: "line",
      data: {
        labels: Array.from({ length: 30 }, (_, i) => `Sample ${i + 1}`),
        datasets: [
          {
            label: "RR Intervals (ms)",
            data: Array.from({ length: 30 }, () => 600 + Math.random() * 700),
            borderColor: "#1E90FF",
            backgroundColor: "rgba(30, 144, 255, 0.1)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: false },
        },
      },
    });
  }
});
