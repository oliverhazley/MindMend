// dashboard.js
// This file contains the logic for the dashboard page of the MindMend app.
// It includes functions to fetch and display HRV data, connect to the Polar H10 device,
// and render various charts to visualize the data.
// it is responsible for displaying the user's heart rate variability (HRV) data,
// including live updates from the Polar H10 device.
// It uses Chart.js to create visualizations and fetches data from the backend API.
// ----------------------------------------------------------------------

import {
  getCurrentPulse,
  getCurrentRMSSD,
  getRRData,
  connectPolarH10,
} from './polarConnect.js';
import {requireAuth} from './router.js';
import {API_BASE_URL} from './config.js';

const API_URL = `${API_BASE_URL}/hrv`;

let barChart, donutChart, rrLineChart;

export function initDashboard() {
  if (!requireAuth()) return;
  console.log('Initializing dashboard...');

  const userId = localStorage.getItem('user_id');
  if (!userId) return console.error('Missing user_id from localStorage.');

  const elements = {
    currentHRVValueEl: document.getElementById('currentHRVValue'),
    currentHRVTextEl: document.getElementById('currentHRVText'),
    rmssdValEl: document.getElementById('RMSSDval'),
    rmssdTextEl: document.getElementById('RMSSDvaltext'),
    rrLineCtx: document.getElementById('rrLineChart'),
    barCtx: document.getElementById('hrvBarChart'),
    donutCtx: document.getElementById('hrvDonutChart'),
    polarBtn: document.getElementById('polarConnectBtn'),
    msgEl: document.getElementById('hrvChartMsg'),
    msgDonutEl: document.getElementById('hrvDonutMsg'),
    filterSelect: document.getElementById('globalHRVFilter'),
  };

  const getISOWeek = (date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  // === Chart Renders ===
  function renderBarChart(labels, data) {
    if (barChart) barChart.destroy();
    barChart = new Chart(elements.barCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{label: 'Avg HRV', data, backgroundColor: '#1E90FF'}],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {beginAtZero: true},
          x: {ticks: {autoSkip: false}},
        },
      },
    });
  }

  function renderDonutChart(zones) {
    if (donutChart) donutChart.destroy();

    // Clear loading text before rendering
    if (elements.msgDonutEl) {
      elements.msgDonutEl.textContent = '';
    }

    donutChart = new Chart(elements.donutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Low', 'Moderate', 'High'],
        datasets: [
          {
            data: [zones.low, zones.moderate, zones.high],
            backgroundColor: ['#00FF7F', '#FFD700', '#FF4500'],
          },
        ],
      },
      options: {responsive: true, maintainAspectRatio: false},
    });
  }

  // === Group data dynamically (past only) ===
  function groupByInterval(data, range) {
    const now = new Date();
    const buckets = {};

    data.forEach(({reading_time, hrv_value}) => {
      const time = new Date(reading_time);
      if (time > now) return; // skip future

      let key = null;

      switch (range) {
        case 'day':
          if (now - time <= 86400000) {
            const hour = time.getHours();
            if (hour < now.getHours()) {
              key = hour.toString().padStart(2, '0') + ':00';
            }
          }
          break;
        case 'week':
          if (now - time <= 7 * 86400000) {
            key = time.toLocaleDateString('en-US', {weekday: 'short'});
          }
          break;
        case 'month':
          if (now - time <= 30 * 86400000) {
            const weekOfMonth = Math.ceil(time.getDate() / 7);
            key = `Week ${weekOfMonth}`;
          }
          break;
        case 'year':
          if (now - time <= 365 * 86400000) {
            const month = time.toLocaleDateString('en-US', {month: 'short'});
            key = month;
          }
          break;
      }

      if (key) {
        if (!buckets[key]) buckets[key] = [];
        buckets[key].push(hrv_value);
      }
    });

    const orderedLabels = {
      day: Array.from(
        {length: 24},
        (_, i) => i.toString().padStart(2, '0') + ':00',
      ),
      week: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      month: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
      year: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
    };

    const labels = orderedLabels[range].filter((label) => buckets[label]);
    const values = labels.map((label) => {
      const avg =
        buckets[label].reduce((a, b) => a + b, 0) / buckets[label].length;
      return Number(avg.toFixed(2));
    });

    return {labels, values};
  }

  function calculateDistribution(data, range) {
    const now = new Date();
    const filtered = data.filter((d) => {
      const time = new Date(d.reading_time);
      if (time > now) return false;
      const diff = now - time;
      if (range === 'day') return diff <= 86400000;
      if (range === 'week') return diff <= 7 * 86400000;
      if (range === 'month') return diff <= 30 * 86400000;
      if (range === 'year') return diff <= 365 * 86400000;
      return false;
    });

    const zones = {low: 0, moderate: 0, high: 0};
    filtered.forEach((d) => {
      if (d.hrv_value < 30) zones.low++;
      else if (d.hrv_value < 60) zones.moderate++;
      else zones.high++;
    });

    return {zones, count: filtered.length};
  }

  async function fetchHRVData() {
    try {
      const res = await fetch(`${API_URL}?user_id=${userId}`);
      const data = await res.json();
      localStorage.setItem('cachedHRVData', JSON.stringify(data));
      return data;
    } catch (err) {
      console.error('Failed to fetch HRV data', err);
      return [];
    }
  }

  function updateCharts(range = 'week') {
    const data = JSON.parse(localStorage.getItem('cachedHRVData')) || [];
    const {labels, values} = groupByInterval(data, range);
    const {zones, count} = calculateDistribution(data, range);

    if (!labels.length) {
      renderBarChart([], []);
      renderDonutChart({low: 0, moderate: 0, high: 0});
      elements.msgEl.textContent =
        'Not enough data, please keep tracking your progress.';
      elements.msgDonutEl.textContent = 'No HRV readings to analyze.';
      return;
    }

    renderBarChart(labels, values);
    renderDonutChart(zones);

    elements.msgEl.textContent = `Showing HRV averages for: ${range}`;

    // Intelligent donut chart summary
    const total = zones.low + zones.moderate + zones.high;
    let summary = '';

    if (total === 0) {
      summary = 'No HRV readings to analyze.';
    } else if (zones.high >= total * 0.5) {
      summary = `Excellent HRV! Most readings (${zones.high}) are high.`;
    } else if (zones.low >= total * 0.5) {
      summary = `Your HRV is low. ${zones.low} readings suggest rest and recovery.`;
    } else if (zones.moderate >= total * 0.5) {
      summary = `HRV appears balanced — ${zones.moderate} moderate readings.`;
    } else {
      summary = `Mixed HRV distribution from ${total} readings.`;
    }

    elements.msgDonutEl.textContent = summary;
  }

  // === Live pulse and RMSSD
  setInterval(() => {
    const pulse = getCurrentPulse();
    const rmssd = getCurrentRMSSD();

    if (elements.currentHRVValueEl && pulse) {
      elements.currentHRVValueEl.textContent = pulse;
      elements.currentHRVTextEl.textContent =
        pulse < 60
          ? 'Your pulse is somewhat low'
          : pulse < 100
            ? 'Your pulse is in a healthy range.'
            : 'Your pulse is elevated, try to relax.';
    }

    if (elements.rmssdValEl && rmssd) {
      elements.rmssdValEl.textContent = rmssd.toFixed(2);
      elements.rmssdTextEl.textContent =
        rmssd < 40
          ? 'Your HRV is low — consider resting.'
          : rmssd < 80
            ? 'Your HRV is moderate — balanced recovery.'
            : 'Excellent HRV — strong stress resilience!';
    }
  }, 1000);

  // === RR line chart
  if (elements.rrLineCtx) {
    if (rrLineChart) rrLineChart.destroy();
    rrLineChart = new Chart(elements.rrLineCtx, {
      type: 'line',
      data: {
        labels: Array.from({length: 30}, (_, i) => `Sample ${i + 1}`),
        datasets: [
          {
            label: 'RR Intervals (ms)',
            data: Array.from({length: 30}, () => 600 + Math.random() * 700),
            borderColor: '#1E90FF',
            backgroundColor: 'rgba(30,144,255, 0.1)',
          },
        ],
      },
      options: {responsive: true, maintainAspectRatio: false},
    });

    setInterval(() => {
      const rrData = getRRData();
      rrLineChart.data.labels = rrData.map((_, i) => `Sample ${i + 1}`);
      rrLineChart.data.datasets[0].data = rrData;
      rrLineChart.update();
    }, 2000);
  }

  if (elements.polarBtn && !elements.polarBtn.dataset.bound) {
    elements.polarBtn.dataset.bound = 'true';
    elements.polarBtn.addEventListener('click', async () => {
      try {
        await connectPolarH10();
      } catch (err) {
        console.error('Polar connection error', err);
        alert('Could not connect to Polar H10.');
      }
    });
  }

  // === Unified range filter
  elements.filterSelect?.addEventListener('change', (e) => {
    updateCharts(e.target.value);
  });

  fetchHRVData().then(() => updateCharts('week'));
}
