// dashboard.js
// This file contains the logic for the dashboard page of the MindMend app.
//
// MAIN FUNCTIONALITIES:
// 1. Displaying heart rate variability (HRV) data in real-time from Polar H10
// 2. Visualizing historical HRV data through various charts
// 3. Providing analytical insights based on current and historical measurements
// 4. Managing connection to the Polar H10 device
// 5. Handling language translations for all UI elements
//
// The dashboard presents several key metrics:
// - Current pulse (heart rate)
// - RR intervals (time between heartbeats)
// - RMSSD (Root Mean Square of Successive Differences) - a key HRV metric
// - Historical HRV trends and distributions
//
// Each metric includes analytical text to help the user interpret their data.
// ----------------------------------------------------------------------

import {
  getCurrentPulse,
  getCurrentRMSSD,
  getRRData,
  connectPolarH10,
  disconnectPolarH10,
  getConnectionState,
  isRMSSDReady,
  getAnalyticalTextForRMSSD,
  getAnalyticalTextForPulse,
} from './polarConnect.js';
import {requireAuth} from './router.js';
import {API_BASE_URL} from './config.js';
import {getText, getCurrentLanguage} from './i18n.js';

const API_URL = `${API_BASE_URL}/hrv`;

let barChart, donutChart, rrLineChart;
let lastLanguage = ''; // Track language changes to update charts

/**
 * Initializes the dashboard page
 *
 * This function:
 * 1. Ensures the user is authenticated
 * 2. Sets up all chart displays
 * 3. Establishes real-time data updates
 * 4. Configures connect/disconnect button handlers
 * 5. Loads historical HRV data
 */
export function initDashboard() {
  if (!requireAuth()) return;
  console.log('Initializing dashboard...');

  const userId = localStorage.getItem('user_id');
  if (!userId) return console.error('Missing user_id from localStorage.');

  // Store initial language
  lastLanguage = getCurrentLanguage();

  // Provide a global function to refresh dashboard data
  window.refreshDashboardData = async function () {
    console.log('Refreshing dashboard data...');
    await fetchAndUpdateHRVData();
  };

  // Cache all DOM elements to improve performance
  const elements = {
    currentHRVValueEl: document.getElementById('currentHRVValue'),
    currentHRVTextEl: document.getElementById('currentHRVText'),
    rmssdValEl: document.getElementById('RMSSDval'),
    rmssdTextEl: document.getElementById('RMSSDvaltext'),
    rrLineCtx: document.getElementById('rrLineChart'),
    rrChartMessage: document.getElementById('rrChartMessage'),
    barCtx: document.getElementById('hrvBarChart'),
    donutCtx: document.getElementById('hrvDonutChart'),
    connectBtn: document.getElementById('polarConnectBtn'),
    disconnectBtn: document.getElementById('polarDisconnectBtn'),
    // Also include the duplicate buttons from the profile section
    connectBtn1: document.getElementById('polarConnectBtn1'),
    disconnectBtn1: document.getElementById('polarDisconnectBtn1'),
    msgEl: document.getElementById('hrvChartMsg'),
    msgDonutEl: document.getElementById('hrvDonutMsg'),
    filterSelect: document.getElementById('globalHRVFilter'),
  };

  /**
   * Gets the ISO week number for a date
   * Used for grouping data by week in charts
   */
  const getISOWeek = (date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  /**
   * Renders the bar chart showing HRV trends over time
   *
   * @param {Array<string>} labels - Time period labels (days, weeks, etc.)
   * @param {Array<number>} data - HRV values corresponding to the labels
   */
  function renderBarChart(labels, data) {
    if (barChart) barChart.destroy();
    barChart = new Chart(elements.barCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: getText('dashboard.barLabel', 'Avg HRV'),
            data,
            backgroundColor: '#1E90FF',
          },
        ],
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

  // Renders the donut chart showing distribution of HRV readings
  // across different zones (low, moderate, high)
  function renderDonutChart(zones) {
    if (donutChart) donutChart.destroy();

    // Clear loading text before rendering
    if (elements.msgDonutEl) {
      elements.msgDonutEl.textContent = '';
    }

    // Calculate total and percentages
    const total = zones.low + zones.moderate + zones.high;
    let percentages = {low: 0, moderate: 0, high: 0};

    if (total > 0) {
      percentages = {
        low: Math.round((zones.low / total) * 100),
        moderate: Math.round((zones.moderate / total) * 100),
        high: Math.round((zones.high / total) * 100),
      };

      // Ensure percentages add up to 100% (rounding can cause off-by-one errors)
      const sum = percentages.low + percentages.moderate + percentages.high;
      if (sum !== 100 && total > 0) {
        // Adjust the largest percentage to make sum 100%
        const diff = 100 - sum;
        if (
          percentages.low >= percentages.moderate &&
          percentages.low >= percentages.high
        ) {
          percentages.low += diff;
        } else if (
          percentages.moderate >= percentages.low &&
          percentages.moderate >= percentages.high
        ) {
          percentages.moderate += diff;
        } else {
          percentages.high += diff;
        }
      }
    }

    // Create labels with percentages
    const labels = [
      `${getText('dashboard.zoneLow', 'Low')} (${percentages.low}%)`,
      `${getText('dashboard.zoneModerate', 'Moderate')} (${percentages.moderate}%)`,
      `${getText('dashboard.zoneHigh', 'High')} (${percentages.high}%)`,
    ];

    donutChart = new Chart(elements.donutCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: [zones.low, zones.moderate, zones.high],
            backgroundColor: [
              '#FF4500', // Red for low (stress/poor)
              '#FFD700', // Yellow for moderate (normal)
              '#00FF7F', // Green for high (good)
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const percentage =
                  total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: ${value} readings (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  // This function organizes HRV readings into time buckets based on the
  // selected range (day, week, month, year) to prepare data for charting.
  function groupByInterval(data, range) {
    const now = new Date();
    const buckets = {};

    // For day view, we need midnight of current day
    const midnightToday = new Date();
    midnightToday.setHours(0, 0, 0, 0);

    // For week view, we need beginning of week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Go back to Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    // For month view, start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // For year view, start of year
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    data.forEach(({reading_time, hrv_value}) => {
      const time = new Date(reading_time);
      if (time > now) return; // skip future readings

      let key = null;

      switch (range) {
        case 'day':
          // Filter to today only
          if (time >= midnightToday) {
            // Group by hour
            const hour = time.getHours();
            key = hour.toString().padStart(2, '0') + ':00';
          }
          break;
        case 'week':
          // Filter to current week
          if (time >= startOfWeek) {
            // Group by day of week
            const dayOfWeek = time.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            key = dayNames[dayOfWeek];
          }
          break;
        case 'month':
          // Filter to current month
          if (time >= startOfMonth) {
            // Group by week of month
            const dayOfMonth = time.getDate();
            const weekOfMonth = Math.ceil(dayOfMonth / 7);
            key = `Week ${weekOfMonth}`;
          }
          break;
        case 'year':
          // Filter to current year
          if (time >= startOfYear) {
            // Group by month
            const month = time.getMonth();
            const monthNames = [
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
            ];
            key = monthNames[month];
          }
          break;
      }

      if (key) {
        if (!buckets[key]) buckets[key] = [];
        buckets[key].push(hrv_value);
      }
    });

    // Define ordered labels for each range type
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

    // Get the appropriate labels based on range
    const allLabels = orderedLabels[range];

    // For all labels, calculate average if data exists, otherwise null
    const labels = [];
    const values = [];

    // Go through all possible labels in order
    allLabels.forEach((label) => {
      if (buckets[label] && buckets[label].length > 0) {
        labels.push(label);

        // Calculate average for this bucket
        const sum = buckets[label].reduce((a, b) => a + b, 0);
        const avg = sum / buckets[label].length;
        values.push(Number(avg.toFixed(2)));
      }
    });

    return {labels, values};
  }

  // This function counts how many readings fall into each HRV zone
  // (low, moderate, high) within the selected time range.
  function calculateDistribution(data, range) {
    const now = new Date();

    // For day view, we need midnight of current day
    const midnightToday = new Date();
    midnightToday.setHours(0, 0, 0, 0);

    // For week view, we need beginning of week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Go back to Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    // For month view, start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // For year view, start of year
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Filter readings based on selected time range
    const filtered = data.filter((d) => {
      const time = new Date(d.reading_time);
      if (time > now) return false; // Skip future readings

      // Apply appropriate time filter based on selected range
      switch (range) {
        case 'day':
          return time >= midnightToday;
        case 'week':
          return time >= startOfWeek;
        case 'month':
          return time >= startOfMonth;
        case 'year':
          return time >= startOfYear;
        default:
          return false;
      }
    });

    // Count readings in each zone
    const zones = {low: 0, moderate: 0, high: 0};
    filtered.forEach((d) => {
      if (d.hrv_value < 30) zones.low++;
      else if (d.hrv_value < 60) zones.moderate++;
      else zones.high++;
    });

    return {zones, count: filtered.length};
  }

  // Fetches HRV data from the backend API
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

  // Fetches fresh data and updates charts
  async function fetchAndUpdateHRVData() {
    try {
      // Fetch fresh data from API
      const res = await fetch(`${API_URL}?user_id=${userId}`);
      const data = await res.json();

      // Update local storage
      localStorage.setItem('cachedHRVData', JSON.stringify(data));

      // Update charts with new data
      const filterSelect = document.getElementById('globalHRVFilter');
      const selectedRange = filterSelect?.value || 'week';
      updateCharts(selectedRange);

      return data;
    } catch (err) {
      console.error('Failed to fetch and update HRV data:', err);
      return [];
    }
  }

  /**
   * Updates all HRV charts based on selected time range
   *
   * This function:
   * 1. Gets cached HRV data
   * 2. Groups and processes it according to selected range
   * 3. Updates bar and donut charts
   * 4. Generates analytical text about the data distribution
   */
  function updateCharts(range = 'week') {
    const data = JSON.parse(localStorage.getItem('cachedHRVData')) || [];
    const {labels, values} = groupByInterval(data, range);
    const {zones, count} = calculateDistribution(data, range);

    if (!labels.length) {
      renderBarChart([], []);
      renderDonutChart({low: 0, moderate: 0, high: 0});
      elements.msgEl.textContent = getText(
        'dashboard.notEnoughData',
        'Not enough data, please keep tracking your progress.',
      );
      elements.msgDonutEl.textContent = getText(
        'dashboard.noReadings',
        'No HRV readings to analyze.',
      );
      return;
    }

    renderBarChart(labels, values);
    renderDonutChart(zones);

    // Show time range in the chart message
    elements.msgEl.textContent = getText(
      'dashboard.showingAverages',
      'Showing HRV averages for: {range}',
    ).replace('{range}', getText(`filter.${range}`, range));

    // Generate intelligent analytical text based on the distribution
    const total = zones.low + zones.moderate + zones.high;
    let summary = '';

    if (total === 0) {
      summary = getText('dashboard.noReadings', 'No HRV readings to analyze.');
    } else {
      // Calculate the average HRV across all readings in this range
      const allValues =
        values.reduce((sum, value) => sum + value, 0) / values.length;

      // Provide trend analysis based on distribution pattern
      if (zones.high >= total * 0.5) {
        summary = getText(
          'dashboard.trendHigh',
          'Your HRV trend shows predominantly high values (avg: {avg}ms). This suggests excellent autonomic balance and stress resilience. Keep up your healthy habits!',
        ).replace('{avg}', allValues.toFixed(1));
      } else if (zones.low >= total * 0.5) {
        summary = getText(
          'dashboard.trendLow',
          'Your HRV trend shows mostly low values (avg: {avg}ms). This may indicate elevated stress or insufficient recovery. Consider incorporating more rest and stress-reduction activities.',
        ).replace('{avg}', allValues.toFixed(1));
      } else if (zones.moderate >= total * 0.5) {
        summary = getText(
          'dashboard.trendModerate',
          'Your HRV trend shows primarily moderate values (avg: {avg}ms). This suggests a balanced state between stress and recovery. Your body is functioning well, though there may be room for improvement.',
        ).replace('{avg}', allValues.toFixed(1));
      } else {
        summary = getText(
          'dashboard.trendMixed',
          'Your HRV shows a mixed pattern (avg: {avg}ms) across {total} readings. This variability could reflect changing stress levels or recovery patterns in your daily life.',
        )
          .replace('{avg}', allValues.toFixed(1))
          .replace('{total}', total);
      }
    }

    elements.msgDonutEl.textContent = summary;
  }

  // Updates charts when language changes
  // This function is called on language toggle
  function checkAndUpdateChartsOnLanguageChange() {
    const currentLanguage = getCurrentLanguage();

    // If language has changed, update the charts
    if (currentLanguage !== lastLanguage) {
      lastLanguage = currentLanguage;

      // Re-render charts with new language
      const selectedRange = elements.filterSelect?.value || 'week';
      updateCharts(selectedRange);

      // Update RR chart label
      if (rrLineChart) {
        rrLineChart.data.datasets[0].label = getText(
          'dashboard.rrTitle',
          'RR Intervals (ms)',
        );
        rrLineChart.update();
      }

      // Update RR chart message
      if (elements.rrChartMessage) {
        if (getConnectionState() === 'connected') {
          elements.rrChartMessage.textContent = getText(
            'dashboard.preparingData',
            'Preparing RR interval data...',
          );
        } else {
          elements.rrChartMessage.textContent = getText(
            'dashboard.livePlaceholder',
            'Please connect to a device to view live data',
          );
        }
      }
    }
  }

  // Live pulse and RMSSD updates every second
  setInterval(() => {
    const pulse = getCurrentPulse();
    const rmssd = getCurrentRMSSD();
    const isConnected = getConnectionState() === 'connected';
    const rmssdReady = isRMSSDReady();

    // Check if language has changed and update charts if needed
    checkAndUpdateChartsOnLanguageChange();

    // Update pulse display and analysis
    if (elements.currentHRVValueEl) {
      if (isConnected && pulse) {
        // If connected and we have data, show the pulse value
        elements.currentHRVValueEl.textContent = pulse;

        // Set appropriate translated analytical text based on pulse value
        elements.currentHRVTextEl.textContent =
          getAnalyticalTextForPulse(pulse);
      } else {
        // If not connected, show placeholder message
        elements.currentHRVValueEl.textContent = '--';
        elements.currentHRVTextEl.textContent = getText(
          'dashboard.livePlaceholder',
          'Please connect to a device to view live data',
        );
      }
    }

    // Update RMSSD display and analysis
    if (elements.rmssdValEl) {
      if (isConnected && rmssdReady && rmssd) {
        // If connected, RMSSD is ready, and we have data, show the RMSSD value
        elements.rmssdValEl.textContent = rmssd.toFixed(2);

        // Set appropriate translated analytical text based on RMSSD value
        elements.rmssdTextEl.textContent = getAnalyticalTextForRMSSD(rmssd);
      } else if (isConnected && !rmssdReady) {
        // Connected but RMSSD not ready yet
        elements.rmssdValEl.textContent = '--';
        elements.rmssdTextEl.textContent = getText(
          'dashboard.rmssdCalculating',
          'Calculating RMSSD, ready after 3 minutes',
        );
      } else {
        // Not connected
        elements.rmssdValEl.textContent = '--';
        elements.rmssdTextEl.textContent = getText(
          'dashboard.livePlaceholder',
          'Please connect to a device to view live data',
        );
      }
    }
  }, 1000);

  // RR line chart initialization and updates
  if (elements.rrLineCtx) {
    if (rrLineChart) rrLineChart.destroy();

    rrLineChart = new Chart(elements.rrLineCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: getText('dashboard.rrTitle', 'RR Intervals (ms)'),
            // Start with empty data
            data: [],
            borderColor: '#1E90FF',
            backgroundColor: 'rgba(30,144,255, 0.1)',
          },
        ],
      },
      options: {responsive: true, maintainAspectRatio: false},
    });

    // Update RR chart every 2 seconds
    setInterval(() => {
      const rrData = getRRData();

      // Update the chart only if we have actual data (after buffering phase)
      if (rrData && rrData.length > 0) {
        rrLineChart.data.labels = rrData.map((_, i) => `Sample ${i + 1}`);
        rrLineChart.data.datasets[0].data = rrData;
        rrLineChart.update();

        // Hide message when data is available
        if (elements.rrChartMessage) {
          elements.rrChartMessage.style.display = 'none';
        }
      } else {
        // Clear the chart if no data
        rrLineChart.data.datasets[0].data = [];
        rrLineChart.update();

        // Show message when no data is available
        if (elements.rrChartMessage) {
          elements.rrChartMessage.style.display = 'block';
          const isConnected = getConnectionState() === 'connected';

          if (isConnected) {
            elements.rrChartMessage.textContent = getText(
              'dashboard.preparingData',
              'Preparing RR interval data...',
            );
          } else {
            elements.rrChartMessage.textContent = getText(
              'dashboard.livePlaceholder',
              'Please connect to a device to view live data',
            );
          }
        }
      }
    }, 2000);
  }

  // Set up button event handlers in dashboard section
  if (elements.connectBtn && !elements.connectBtn.dataset.bound) {
    elements.connectBtn.dataset.bound = 'true';
    elements.connectBtn.addEventListener('click', async () => {
      try {
        console.log('Connect button clicked (polarConnectBtn)');
        await connectPolarH10();
      } catch (err) {
        console.error('Polar connection error', err);
        alert('Could not connect to Polar H10.');
      }
    });
  }

  if (elements.disconnectBtn && !elements.disconnectBtn.dataset.bound) {
    elements.disconnectBtn.dataset.bound = 'true';
    elements.disconnectBtn.addEventListener('click', async () => {
      try {
        console.log('Disconnect button clicked (polarDisconnectBtn)');
        await disconnectPolarH10();
        // Refresh data after disconnecting
        await fetchAndUpdateHRVData();
      } catch (err) {
        console.error('Polar disconnection error', err);
        alert('Error disconnecting from Polar H10.');
      }
    });
  }

  // Set up button event handlers in profile section
  if (elements.connectBtn1 && !elements.connectBtn1.dataset.bound) {
    elements.connectBtn1.dataset.bound = 'true';
    elements.connectBtn1.addEventListener('click', async () => {
      try {
        console.log('Connect button clicked (polarConnectBtn1)');
        await connectPolarH10();
      } catch (err) {
        console.error('Polar connection error', err);
        alert('Could not connect to Polar H10.');
      }
    });
  }

  if (elements.disconnectBtn1 && !elements.disconnectBtn1.dataset.bound) {
    elements.disconnectBtn1.dataset.bound = 'true';
    elements.disconnectBtn1.addEventListener('click', async () => {
      try {
        console.log('Disconnect button clicked (polarDisconnectBtn1)');
        await disconnectPolarH10();
        // Refresh data after disconnecting
        await fetchAndUpdateHRVData();
      } catch (err) {
        console.error('Polar disconnection error', err);
        alert('Error disconnecting from Polar H10.');
      }
    });
  }

  // Set up time range filter change handler
  elements.filterSelect?.addEventListener('change', (e) => {
    updateCharts(e.target.value);
  });

  // Initial data fetch and chart update
  fetchHRVData().then(() => updateCharts('week'));
}

// Updates charts and text when language changes
// This is called from i18n.js after language switch
export function onLanguageChanged() {
  const filterSelect = document.getElementById('globalHRVFilter');
  const selectedRange = filterSelect?.value || 'week';

  // Re-render charts with new language
  const data = JSON.parse(localStorage.getItem('cachedHRVData')) || [];
  if (data.length > 0) {
    updateCharts(selectedRange);
  }

  // Update RR chart label if it exists
  if (rrLineChart) {
    rrLineChart.data.datasets[0].label = getText(
      'dashboard.rrTitle',
      'RR Intervals (ms)',
    );
    rrLineChart.update();
  }

  // Also update RR chart message
  const rrChartMessage = document.getElementById('rrChartMessage');
  if (rrChartMessage) {
    if (getConnectionState() === 'connected') {
      rrChartMessage.textContent = getText(
        'dashboard.preparingData',
        'Preparing RR interval data...',
      );
    } else {
      rrChartMessage.textContent = getText(
        'dashboard.livePlaceholder',
        'Please connect to a device to view live data',
      );
    }
  }
}

// Updates all HRV charts based on selected time range
// This function is also exposed to be called from outside
export function updateCharts(range = 'week') {
  const data = JSON.parse(localStorage.getItem('cachedHRVData')) || [];
  const msgEl = document.getElementById('hrvChartMsg');
  const msgDonutEl = document.getElementById('hrvDonutMsg');
  const barCtx = document.getElementById('hrvBarChart');
  const donutCtx = document.getElementById('hrvDonutChart');

  if (!barCtx || !donutCtx) return;

  // Group data by selected time range using the improved groupByInterval function
  const now = new Date();
  const buckets = {};

  // For day view, we need midnight of current day
  const midnightToday = new Date();
  midnightToday.setHours(0, 0, 0, 0);

  // For week view, we need beginning of week (Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Go back to Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  // For month view, start of month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // For year view, start of year
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  data.forEach(({reading_time, hrv_value}) => {
    const time = new Date(reading_time);
    if (time > now) return; // skip future readings

    let key = null;

    switch (range) {
      case 'day':
        // Filter to today only
        if (time >= midnightToday) {
          // Group by hour
          const hour = time.getHours();
          key = hour.toString().padStart(2, '0') + ':00';
        }
        break;
      case 'week':
        // Filter to current week
        if (time >= startOfWeek) {
          // Group by day of week
          const dayOfWeek = time.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          key = dayNames[dayOfWeek];
        }
        break;
      case 'month':
        // Filter to current month
        if (time >= startOfMonth) {
          // Group by week of month
          const dayOfMonth = time.getDate();
          const weekOfMonth = Math.ceil(dayOfMonth / 7);
          key = `Week ${weekOfMonth}`;
        }
        break;
      case 'year':
        // Filter to current year
        if (time >= startOfYear) {
          // Group by month
          const month = time.getMonth();
          const monthNames = [
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
          ];
          key = monthNames[month];
        }
        break;
    }

    if (key) {
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(hrv_value);
    }
  });

  // Define ordered labels for each range type
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

  // Get the appropriate labels based on range
  const allLabels = orderedLabels[range];

  // For all labels, calculate average if data exists, otherwise null
  const labels = [];
  const values = [];

  // Go through all possible labels in order
  allLabels.forEach((label) => {
    if (buckets[label] && buckets[label].length > 0) {
      labels.push(label);

      // Calculate average for this bucket
      const sum = buckets[label].reduce((a, b) => a + b, 0);
      const avg = sum / buckets[label].length;
      values.push(Number(avg.toFixed(2)));
    }
  });

  // Calculate distribution across zones
  const zones = {low: 0, moderate: 0, high: 0};
  data.forEach((d) => {
    const time = new Date(d.reading_time);
    if (time > now) return;

    // Apply appropriate time filter based on selected range
    let includeInRange = false;
    switch (range) {
      case 'day':
        includeInRange = time >= midnightToday;
        break;
      case 'week':
        includeInRange = time >= startOfWeek;
        break;
      case 'month':
        includeInRange = time >= startOfMonth;
        break;
      case 'year':
        includeInRange = time >= startOfYear;
        break;
      default:
        includeInRange = false;
    }

    if (includeInRange) {
      if (d.hrv_value < 30) zones.low++;
      else if (d.hrv_value < 60) zones.moderate++;
      else zones.high++;
    }
  });

  // Render charts
  if (!labels.length) {
    if (barChart) barChart.destroy();
    barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: getText('dashboard.barLabel', 'Avg HRV'),
            data: [],
            backgroundColor: '#1E90FF',
          },
        ],
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

    if (donutChart) donutChart.destroy();

    // Calculate total and percentages
    const total = zones.low + zones.moderate + zones.high;
    let percentages = {low: 0, moderate: 0, high: 0};

    // Create labels with percentages
    const labels = [
      `${getText('dashboard.zoneLow', 'Low')} (0%)`,
      `${getText('dashboard.zoneModerate', 'Moderate')} (0%)`,
      `${getText('dashboard.zoneHigh', 'High')} (0%)`,
    ];

    donutChart = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: [0, 0, 0],
            backgroundColor: [
              '#FF4500', // Red for low (stress/poor)
              '#FFD700', // Yellow for moderate (normal)
              '#00FF7F', // Green for high (good)
            ],
          },
        ],
      },
      options: {responsive: true, maintainAspectRatio: false},
    });

    if (msgEl)
      msgEl.textContent = getText(
        'dashboard.notEnoughData',
        'Not enough data, please keep tracking your progress.',
      );

    if (msgDonutEl)
      msgDonutEl.textContent = getText(
        'dashboard.noReadings',
        'No HRV readings to analyze.',
      );
    return;
  }

  // Render charts with data
  if (barChart) barChart.destroy();
  barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: getText('dashboard.barLabel', 'Avg HRV'),
          data: values,
          backgroundColor: '#1E90FF',
        },
      ],
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

  if (donutChart) donutChart.destroy();

  // Calculate total and percentages
  const total = zones.low + zones.moderate + zones.high;
  let percentages = {low: 0, moderate: 0, high: 0};

  if (total > 0) {
    percentages = {
      low: Math.round((zones.low / total) * 100),
      moderate: Math.round((zones.moderate / total) * 100),
      high: Math.round((zones.high / total) * 100),
    };

    // Ensure percentages add up to 100% (rounding can cause off-by-one errors)
    const sum = percentages.low + percentages.moderate + percentages.high;
    if (sum !== 100 && total > 0) {
      // Adjust the largest percentage to make sum 100%
      const diff = 100 - sum;
      if (
        percentages.low >= percentages.moderate &&
        percentages.low >= percentages.high
      ) {
        percentages.low += diff;
      } else if (
        percentages.moderate >= percentages.low &&
        percentages.moderate >= percentages.high
      ) {
        percentages.moderate += diff;
      } else {
        percentages.high += diff;
      }
    }
  }

  // Create labels with percentages
  const donutLabels = [
    `${getText('dashboard.zoneLow', 'Low')} (${percentages.low}%)`,
    `${getText('dashboard.zoneModerate', 'Moderate')} (${percentages.moderate}%)`,
    `${getText('dashboard.zoneHigh', 'High')} (${percentages.high}%)`,
  ];

  donutChart = new Chart(donutCtx, {
    type: 'doughnut',
    data: {
      labels: donutLabels,
      datasets: [
        {
          data: [zones.low, zones.moderate, zones.high],
          backgroundColor: [
            '#FF4500', // Red for low (stress/poor)
            '#FFD700', // Yellow for moderate (normal)
            '#00FF7F', // Green for high (good)
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const percentage =
                total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${value} readings (${percentage}%)`;
            },
          },
        },
      },
    },
  });

  // Show time range in the chart message
  if (msgEl) {
    msgEl.textContent = getText(
      'dashboard.showingAverages',
      'Showing HRV averages for: {range}',
    ).replace('{range}', getText(`filter.${range}`, range));
  }

  // Generate intelligent analytical text based on the distribution
  if (msgDonutEl) {
    const total = zones.low + zones.moderate + zones.high;
    let summary = '';

    if (total === 0) {
      summary = getText('dashboard.noReadings', 'No HRV readings to analyze.');
    } else {
      // Calculate the average HRV across all readings in this range
      const allValues =
        values.reduce((sum, value) => sum + value, 0) / values.length;

      // Provide trend analysis based on distribution pattern
      if (zones.high >= total * 0.5) {
        summary = getText(
          'dashboard.trendHigh',
          'Your HRV trend shows predominantly high values (avg: {avg}ms). This suggests excellent autonomic balance and stress resilience. Keep up your healthy habits!',
        ).replace('{avg}', allValues.toFixed(1));
      } else if (zones.low >= total * 0.5) {
        summary = getText(
          'dashboard.trendLow',
          'Your HRV trend shows mostly low values (avg: {avg}ms). This may indicate elevated stress or insufficient recovery. Consider incorporating more rest and stress-reduction activities.',
        ).replace('{avg}', allValues.toFixed(1));
      } else if (zones.moderate >= total * 0.5) {
        summary = getText(
          'dashboard.trendModerate',
          'Your HRV trend shows primarily moderate values (avg: {avg}ms). This suggests a balanced state between stress and recovery. Your body is functioning well, though there may be room for improvement.',
        ).replace('{avg}', allValues.toFixed(1));
      } else {
        summary = getText(
          'dashboard.trendMixed',
          'Your HRV shows a mixed pattern (avg: {avg}ms) across {total} readings. This variability could reflect changing stress levels or recovery patterns in your daily life.',
        )
          .replace('{avg}', allValues.toFixed(1))
          .replace('{total}', total);
      }
    }

    msgDonutEl.textContent = summary;
  }
}
