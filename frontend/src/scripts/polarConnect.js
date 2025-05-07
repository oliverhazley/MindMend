// polarConnect.js
// This file handles the connection to the Polar H10 heart rate monitor.
// It manages Bluetooth connectivity, data gathering, and RMSSD calculations.
//
// MAIN FUNCTIONALITIES:
// 1. Connecting to Polar H10 device using Web Bluetooth API
// 2. Processing heart rate and RR interval data in real-time
// 3. Calculating RMSSD (Root Mean Square of Successive Differences) for heart rate variability analysis
// 4. Managing connection states (connecting, connected, disconnecting, disconnected)
// 5. Automatic saving of RMSSD data every 3 minutes
// 6. Providing buffered data to avoid initial noisy measurements
// 7. Handling translations for UI elements related to connectivity
//
// COMPATIBILITY NOTE:
// Web Bluetooth API is not supported by iOS devices as the webkit engine
// used by Safari does not implement it. Even Chrome on iOS uses the webkit engine,
// so this connection process will not work on iOS devices.
// The connection will work on most modern browsers and Android devices.

import {API_BASE_URL} from './config.js';
import {getText, initI18n} from './i18n.js'; // Import i18n functions for translations

// Internal state
let polarDevice = null;
let pulse = null;

// RR interval buffers
let rrBuffer = [];           // For uploading to the server (accumulates for 3 minutes)
let rrLive = [];             // For live display (recent samples only)
let rmssdBuffer = [];        // For stable RMSSD calculation - large buffer of 3 minutes data

let latestRMSSD = null;
let autoSaveInterval = null;
let isPolarConnected = false;
let connectionStartTime = null; // Track when the connection was established for buffering
let rmssdReady = false; // Flag to track if RMSSD data is ready to display
let pendingConnectionPromise = null; // Track if there's an active connection attempt

// Track connection state to handle language changes properly
// Possible states: 'disconnected', 'connecting', 'connected', 'disconnecting'
let connectionState = 'disconnected';

// Configuration for RMSSD calculation
const RR_SAMPLES_FOR_LIVE = 60;     // Number of RR intervals to show on chart
const RMSSD_READY_TIME = 3 * 60 * 1000; // 3 minutes in milliseconds

/**
 * Updates all UI elements related to the Polar connection status
 *
 * This includes:
 * - Connect/disconnect buttons (both in dashboard and profile)
 * - Connection status text
 * - Battery level indicators
 * - Dashboard data visibility based on connection state
 *
 * @param {Object} params - Parameters for updating the UI
 * @param {string} params.text - Text to display on buttons
 * @param {boolean} params.isConnected - Whether device is connected
 * @param {number|null} params.batteryLevel - Battery level percentage if available
 */
function updatePolarUI({text, isConnected, batteryLevel = null}) {
  // Find all connect and disconnect buttons (both in dashboard and profile)
  const connectBtns = [
    document.getElementById('polarConnectBtn'),
    document.getElementById('polarConnectBtn1'),
  ];

  const disconnectBtns = [
    document.getElementById('polarDisconnectBtn'),
    document.getElementById('polarDisconnectBtn1'),
  ];

  // Find status indicators and battery level displays
  const statuses = [
    document.getElementById('polarConnectionStatus'),
    document.getElementById('polarConnectionStatusSettings'),
  ];

  const batteryEls = [
    document.getElementById('batteryLevel'),
    document.getElementById('batteryLevelSettings'),
    document.getElementById('batteryLevel1'),
  ];

  // Update connect buttons visibility and text based on connection state
  connectBtns.forEach(btn => {
    if (!btn) return;

    if (connectionState === 'disconnected') {
      btn.style.display = 'block';
      btn.textContent = getText('dashboard.connectBtn', 'Connect');
      btn.disabled = false;
    } else if (connectionState === 'connecting') {
      btn.style.display = 'block';
      btn.textContent = getText('dashboard.connectingBtn', 'Connecting...');
      btn.disabled = true; // Disable during connection attempt
    } else {
      btn.style.display = 'none'; // Hide connect button when connected or disconnecting
    }
  });

  // Update disconnect buttons visibility and text based on connection state
  disconnectBtns.forEach(btn => {
    if (!btn) return;

    if (connectionState === 'connected') {
      btn.style.display = 'block';
      btn.textContent = getText('dashboard.disconnectBtn', 'Disconnect');
      btn.disabled = false;
    } else if (connectionState === 'disconnecting') {
      btn.style.display = 'block';
      btn.textContent = getText('dashboard.disconnectingBtn', 'Disconnecting...');
      btn.disabled = true; // Disable during disconnection
    } else {
      btn.style.display = 'none'; // Hide disconnect button when disconnected or connecting
    }
  });

  // Update status text with translation
  statuses.forEach((el) => {
    if (el) {
      if (isConnected) {
        el.textContent = getText('polar.connected', 'Connected to Polar H10');
      } else {
        el.textContent = getText('polar.disconnected', 'Not connected');
      }
    }
  });

  // Update battery display with translation
  batteryEls.forEach((el) => {
    if (!el) return;
    if (batteryLevel !== null) {
      el.textContent = getText('polar.battery', 'Battery: {level}%').replace('{level}', batteryLevel);
      el.classList.remove('hidden');
    } else {
      el.textContent = '';
      el.classList.add('hidden');
    }
  });

  // Update dashboard data visibility based on connection state
  updateDashboardDataVisibility(isConnected);
}

/**
 * Initiates connection to a Polar H10 heart rate monitor
 *
 * This function:
 * 1. Updates UI to show "Connecting..." state
 * 2. Prompts user to select a Polar device via Bluetooth
 * 3. Establishes connection to the device
 * 4. Sets up heart rate notifications
 * 5. Starts auto-saving RMSSD data every 3 minutes
 *
 * @returns {Promise<boolean>} Promise resolving to true if connection successful
 */
export async function connectPolarH10() {
  // If a connection is already in progress, return the existing promise
  // This prevents multiple connection attempts happening simultaneously
  if (pendingConnectionPromise) {
    return pendingConnectionPromise;
  }

  // If already connected, disconnect first
  if (isPolarConnected) {
    await disconnectPolarH10();
    return false;
  }

  // Create a new connection promise
  pendingConnectionPromise = (async () => {
    try {
      // Update state to connecting and refresh UI
      connectionState = 'connecting';
      updatePolarUI({text: 'Connecting…', isConnected: false});

      const device = await navigator.bluetooth.requestDevice({
        filters: [{namePrefix: 'Polar'}],
        optionalServices: ['heart_rate', 'battery_service'],
      });

      // Check if device is already connected
      if (polarDevice && polarDevice.gatt.connected) {
        console.log('Already connected to a device');
        pendingConnectionPromise = null;
        return true;
      }

      polarDevice = await device.gatt.connect();
      isPolarConnected = true;
      connectionState = 'connected';  // Update connection state
      connectionStartTime = Date.now(); // Record connection time for buffering
      rmssdReady = false; // Reset RMSSD ready flag

      // Clear all data arrays
      rrBuffer = [];
      rrLive = [];
      rmssdBuffer = []; // Clear the RMSSD buffer for stable calculations

      // Set timer to mark RMSSD as ready after 3 minutes
      setTimeout(() => {
        rmssdReady = true;
        // Update UI to reflect that RMSSD is now available
        updateDashboardDataVisibility(true);
      }, RMSSD_READY_TIME); // 3 minutes

      // Fetch battery level
      try {
        const batteryService =
          await polarDevice.getPrimaryService('battery_service');
        const batteryChar =
          await batteryService.getCharacteristic('battery_level');
        const batteryValue = await batteryChar.readValue();
        const batteryPercent = batteryValue.getUint8(0);
        updatePolarUI({
          text: 'Disconnect',
          isConnected: true,
          batteryLevel: batteryPercent,
        });
      } catch (err) {
        console.warn('Battery level unavailable:', err);
        updatePolarUI({text: 'Disconnect', isConnected: true});
      }

      // Add event listener for disconnection
      device.addEventListener('gattserverdisconnected', handleDisconnection);

      const service = await polarDevice.getPrimaryService('heart_rate');
      const heartRateChar = await service.getCharacteristic(
        '00002a37-0000-1000-8000-00805f9b34fb',
      );

      await heartRateChar.startNotifications();
      heartRateChar.addEventListener(
        'characteristicvaluechanged',
        handleHRNotification,
      );

      startAutoRMSSDSave();

      pendingConnectionPromise = null;
      return true;
    } catch (error) {
      // Connection failed, reset to disconnected state
      connectionState = 'disconnected';
      isPolarConnected = false;
      polarDevice = null;
      console.error('Bluetooth connection failed:', error);
      updatePolarUI({text: 'Connect', isConnected: false});

      pendingConnectionPromise = null;
      return false;
    }
  })();

  return pendingConnectionPromise;
}

/**
 * Handles unexpected disconnection events from the Polar device
 *
 * This is called automatically when the device disconnects without
 * going through our disconnectPolarH10 function. It updates the
 * UI state to reflect the disconnection.
 *
 * @param {Event} event - The disconnection event
 */
function handleDisconnection(event) {
  console.log('Device disconnected');
  isPolarConnected = false;
  connectionState = 'disconnected';
  polarDevice = null;
  stopAutoRMSSDSave();
  rmssdReady = false;

  // Update UI to reflect disconnection
  updatePolarUI({text: 'Connect', isConnected: false});
}

/**
 * Disconnects from the Polar H10 device
 *
 * This function:
 * 1. Updates UI to show "Disconnecting..." state
 * 2. Stops the auto-save interval
 * 3. Saves final RMSSD data
 * 4. Closes the Bluetooth connection
 * 5. Resets all connection-related states
 *
 * @returns {Promise<boolean>} Promise resolving to true if disconnection successful
 */
export async function disconnectPolarH10() {
  try {
    // Update state to disconnecting
    connectionState = 'disconnecting';
    updatePolarUI({text: 'Disconnecting…', isConnected: true});

    stopAutoRMSSDSave();
    await uploadRMSSD();

    // Only try to disconnect if device exists and is connected
    if (polarDevice && polarDevice.gatt && polarDevice.gatt.connected) {
      polarDevice.gatt.disconnect();
    } else {
      console.log('No active connection to disconnect');
    }

    // Reset state regardless of device connection status
    isPolarConnected = false;
    connectionState = 'disconnected';
    polarDevice = null;
    rmssdReady = false;
    rrBuffer = [];
    rrLive = [];
    rmssdBuffer = [];
    latestRMSSD = null;

    updatePolarUI({text: 'Connect', isConnected: false});

    // Trigger dashboard data refresh if available
    if (typeof window.refreshDashboardData === 'function') {
      window.refreshDashboardData();
    }

    return true;
  } catch (error) {
    console.error('Error during disconnection:', error);
    // Even on error, reset the state to prevent UI from being stuck
    connectionState = 'disconnected';
    isPolarConnected = false;
    polarDevice = null;
    rmssdReady = false;
    updatePolarUI({text: 'Connect', isConnected: false});
    return false;
  }
}

/**
 * Processes heart rate notifications from the Polar device
 *
 * This function:
 * 1. Extracts heart rate (pulse) from the notification data
 * 2. Extracts RR intervals (time between heartbeats)
 * 3. Updates the rrBuffer, rrLive, and rmssdBuffer arrays with new data
 * 4. Calculates latest RMSSD value if buffering period is complete
 *
 * @param {Event} event - The notification event containing heart rate data
 */
function handleHRNotification(event) {
  const value = event.target.value;
  // Check if heart rate is in 16-bit format
  const is16bit = (value.getUint8(0) & 0x01) !== 0;
  let offset = 1;

  // Extract heart rate value
  pulse = is16bit ? value.getUint16(offset, true) : value.getUint8(offset);

  // Extract RR intervals if present
  const newRRs = [];
  offset = 2;
  while (offset < value.byteLength) {
    // RR values are in 1/1024 seconds, convert to milliseconds
    const rrValue = value.getUint16(offset, true) * (1000 / 1024);
    newRRs.push(rrValue);
    offset += 2;
  }

  // Process each new RR interval
  for (const rrValue of newRRs) {
    // Add to the buffer for server upload
    rrBuffer.push(rrValue);

    // Add to live display buffer (limited to RR_SAMPLES_FOR_LIVE samples)
    rrLive.push(rrValue);
    if (rrLive.length > RR_SAMPLES_FOR_LIVE) {
      rrLive.shift(); // Remove oldest value
    }

    // Add to the RMSSD buffer for stable calculations
    rmssdBuffer.push(rrValue);

    // If we're past the initial buffer period, maintain the buffer size
    // by removing the oldest sample when adding a new one
    // This implements the desired sliding window behavior
    if (rmssdReady && rmssdBuffer.length > 0) {
      // Only remove if we already have data
      rmssdBuffer.shift(); // Remove oldest sample
    }
  }

  // Only calculate RMSSD if we have enough data and the buffer period is over
  if (rmssdReady && rmssdBuffer.length >= 2) {
    // First apply median filter to remove artifacts
    const corrected = correctRRIntervalsThreshold(rmssdBuffer);

    // Then calculate RMSSD from corrected intervals
    latestRMSSD = calculateRMSSD(corrected);
  }
}

/**
 * Uploads RMSSD data to the backend
 *
 * This function:
 * 1. Checks if there's enough RR data to calculate a meaningful RMSSD
 * 2. Calculates RMSSD from the RR interval buffer
 * 3. Sends the calculated value to the server
 * 4. Clears the RR buffer for the next calculation
 *
 * @returns {Promise<void>}
 */
async function uploadRMSSD() {
  console.log('Uploading RMSSD...');
  if (rrBuffer.length < 10) {
    console.log('Not enough RR data. Skipping.');
    rrBuffer = [];
    return;
  }

  const corrected = correctRRIntervalsThreshold(rrBuffer);
  const rmssd = calculateRMSSD(corrected);
  rrBuffer = [];  // Clear buffer after calculation

  if (!rmssd || !isFinite(rmssd)) {
    console.log('Invalid RMSSD. Skipping.');
    return;
  }

  const token = localStorage.getItem('token');
  const user_id = localStorage.getItem('user_id');

  try {
    const response = await fetch(`${API_BASE_URL}/hrv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        user_id,
        hrv_value: parseFloat(rmssd.toFixed(2)),
      }),
    });

    if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
    console.log(`Uploaded RMSSD = ${rmssd.toFixed(2)} ms`);
  } catch (err) {
    console.error('Failed to upload RMSSD:', err);
  }
}

/**
 * Starts automatic RMSSD saving every 3 minutes
 *
 * This function sets up an interval that will:
 * 1. Check if there's a valid RMSSD value
 * 2. Upload it to the server if available
 * 3. Repeat every 3 minutes
 */
export function startAutoRMSSDSave() {
  if (autoSaveInterval !== null) return;
  console.log('Started auto-saving RMSSD every 3 mins');

  autoSaveInterval = setInterval(() => {
    const value = latestRMSSD;
    if (value) {
      uploadRMSSD();
    }
  }, 3 * 60 * 1000); // Exactly 3 minutes as requested
}

/**
 * Stops the automatic RMSSD saving interval
 *
 * This function clears the interval that was saving RMSSD data
 * and sets the interval reference to null.
 */
export function stopAutoRMSSDSave() {
  if (autoSaveInterval !== null) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
    console.log('Stopped auto-saving RMSSD');
  }
}

/**
 * Corrects RR intervals using a median filter to remove artifacts
 *
 * This function implements the threshold-based filtering and moving median filter mentioned in the plan.
 * It examines each RR interval and replaces it with the local median if it deviates too much.
 * This prevents outliers from affecting the RMSSD calculation.
 *
 * Algorithm steps:
 * 1. For each RR interval in the array:
 *    a. Examine a window of surrounding samples
 *    b. Calculate the median of this local window
 *    c. If the current interval deviates from median by more than the threshold, replace it
 *
 * @param {number[]} rrArray - Array of RR intervals in milliseconds
 * @param {number} windowSize - Size of the sliding window for median calculation (default: 5)
 * @param {number} thresholdMs - Maximum allowed deviation from median in milliseconds (default: 150)
 * @returns {number[]} Corrected array of RR intervals
 */
function correctRRIntervalsThreshold(
  rrArray,
  windowSize = 5,
  thresholdMs = 150,
) {
  // Return original array if there are too few elements
  if (rrArray.length < 2) return rrArray.slice();

  // Create a copy to avoid modifying the original array
  const corrected = rrArray.slice();

  // Process each interval in the array
  for (let i = 0; i < corrected.length; i++) {
    // Define window boundaries
    const start = Math.max(0, i - windowSize);
    const end = Math.min(corrected.length - 1, i + windowSize);

    // Extract and sort local segment to find median
    const localSeg = corrected.slice(start, end + 1).sort((a, b) => a - b);
    const mid = Math.floor(localSeg.length / 2);

    // Calculate median (different for odd vs even number of elements)
    const localMedian =
      localSeg.length % 2 !== 0
        ? localSeg[mid]
        : (localSeg[mid - 1] + localSeg[mid]) / 2;

    // Check if current interval deviates too much from local median
    const diff = Math.abs(corrected[i] - localMedian);
    if (diff > thresholdMs) {
      corrected[i] = localMedian; // Replace with median if beyond threshold
    }
  }

  return corrected;
}

/**
 * Calculates Root Mean Square of Successive Differences (RMSSD)
 *
 * RMSSD is calculated according to the formula:
 *
 * RMSSD = √[1/(N-1) * ∑(RRⱼ₊₁ - RRⱼ)²]
 *
 * Where:
 * - N is the number of RR intervals
 * - RRⱼ are successive RR intervals
 *
 * This implementation:
 * 1. Calculates differences between successive RR intervals
 * 2. Squares each difference
 * 3. Takes the average of squared differences
 * 4. Calculates the square root to get RMSSD
 *
 * @param {number[]} rrArray - Array of RR intervals in milliseconds
 * @returns {number|null} Calculated RMSSD or null if not enough data
 */
function calculateRMSSD(rrArray) {
  // Need at least 2 intervals to calculate a difference
  if (rrArray.length < 2) return null;

  let sumOfSquares = 0;
  let count = 0;

  // Calculate sum of squared differences between successive intervals
  for (let i = 1; i < rrArray.length; i++) {
    const diff = rrArray[i] - rrArray[i - 1];
    sumOfSquares += diff * diff;
    count++;
  }

  // Calculate RMSSD using the formula
  return Math.sqrt(sumOfSquares / count);
}

/**
 * Updates dashboard data visibility based on connection state
 *
 * This function:
 * 1. Updates the visibility of data elements
 * 2. Shows/hides placeholder messages based on connection state
 * 3. Displays appropriate messages during RMSSD calculation
 *
 * @param {boolean} isConnected - Whether the device is connected
 */
function updateDashboardDataVisibility(isConnected) {
  // Get elements for data display
  const hrv = document.getElementById('currentHRVValue');
  const rmssd = document.getElementById('RMSSDval');
  const hrvText = document.getElementById('currentHRVText');
  const rmssdText = document.getElementById('RMSSDvaltext');

  // Get RR chart message
  const rrChartMessage = document.getElementById('rrChartMessage');

  if (!isConnected) {
    // If not connected, show placeholder message and hide live data
    if (hrv) hrv.textContent = '--';
    if (rmssd) rmssd.textContent = '--';

    // Add "Please connect" messages where needed
    if (hrvText) {
      hrvText.textContent = getText('dashboard.livePlaceholder', 'Please connect to a device to view live data');
    }

    if (rmssdText) {
      rmssdText.textContent = getText('dashboard.livePlaceholder', 'Please connect to a device to view live data');
    }

    // Add message to RR chart
    if (rrChartMessage) {
      rrChartMessage.textContent = getText('dashboard.livePlaceholder', 'Please connect to a device to view live data');
      rrChartMessage.style.display = 'block';
    }
  } else if (isConnected && !rmssdReady && rmssdText) {
    // We're connected but RMSSD is not ready yet
    if (rmssdText) {
      rmssdText.textContent = getText('dashboard.rmssdCalculating', 'Calculating RMSSD, ready after 3 minutes');
    }

    // Update RR chart message if connected but data still loading
    if (rrChartMessage && getRRData().length < 10) {
      rrChartMessage.textContent = getText('dashboard.preparingData', 'Preparing RR interval data...');
      rrChartMessage.style.display = 'block';
    } else if (rrChartMessage) {
      rrChartMessage.style.display = 'none';
    }
  } else {
    // We're connected and RMSSD is ready
    // Hide the message on RR chart when connected with data
    if (rrChartMessage && getRRData().length >= 10) {
      rrChartMessage.style.display = 'none';
    } else if (rrChartMessage) {
      rrChartMessage.textContent = getText('dashboard.preparingData', 'Preparing RR interval data...');
      rrChartMessage.style.display = 'block';
    }
  }
}

// Public accessor functions with detailed explanations

/**
 * Gets the current connection state
 *
 * Possible states:
 * - 'disconnected': No active connection
 * - 'connecting': Connection in progress
 * - 'connected': Device connected and working
 * - 'disconnecting': Disconnection in progress
 *
 * @returns {string} Current connection state
 */
export function getConnectionState() {
  return connectionState;
}

/**
 * Checks if RMSSD calculation is ready to display
 *
 * RMSSD values need time to stabilize after connection.
 * This function returns true only after the 3-minute buffering period.
 *
 * @returns {boolean} Whether RMSSD data is ready to display
 */
export function isRMSSDReady() {
  return rmssdReady;
}

/**
 * Gets the current RR interval data for display
 *
 * Only returns data if:
 * 1. Device is connected
 * 2. We have collected enough samples (>10) for accurate display
 *
 * The returned data is already filtered using the median filter
 * to ensure smooth visualization.
 *
 * @returns {number[]} Array of recent RR intervals or empty array if not ready
 */
export function getRRData() {
  if (!isPolarConnected) return [];

  // Skip the first 10 samples as requested (buffering phase)
  if (rrLive.length < 10) return [];

  // Return corrected RR intervals for display
  return correctRRIntervalsThreshold(rrLive);
}

/**
 * Gets the current pulse (heart rate) value
 *
 * @returns {number} Current pulse or 0 if not connected
 */
export function getCurrentPulse() {
  return isPolarConnected ? pulse || 0 : 0;
}

/**
 * Gets the current RMSSD value
 *
 * Only returns a value if:
 * 1. Device is connected
 * 2. RMSSD calculation is ready (after 3-minute buffer period)
 *
 * The RMSSD is calculated using all the samples collected during
 * the 3-minute buffer period and then maintained using a sliding window.
 * This provides a much more stable RMSSD value.
 *
 * @returns {number|null} Current RMSSD or null if not ready/connected
 */
export function getCurrentRMSSD() {
  if (!isPolarConnected || !rmssdReady) return null;
  return latestRMSSD;
}

/**
 * Manually triggers an RMSSD upload to the database
 *
 * @returns {Promise<void>} Promise that resolves when upload completes
 */
export function saveRMSSDtoDB() {
  return uploadRMSSD();
}

/**
 * Updates UI elements after language change
 *
 * Called from i18n.js when language is switched to ensure
 * all dynamic text is properly translated.
 */
export function updateUIAfterLanguageChange() {
  // This uses the current connection state to ensure the correct translation is displayed
  updatePolarUI({
    text: connectionState === 'connected' ? 'Disconnect' : 'Connect',
    isConnected: isPolarConnected,
    batteryLevel: null // We don't know the battery level here, it will be hidden
  });
}

/**
 * Provides analytical interpretation of RMSSD value
 *
 * This function analyzes the RMSSD value and returns a detailed
 * interpretation with health insights and recommendations.
 *
 * @param {number} rmssd - The RMSSD value to interpret
 * @returns {string} Detailed analysis of the RMSSD value
 */
export function getAnalyticalTextForRMSSD(rmssd) {
  if (!rmssd || !isFinite(rmssd)) return '';

  // Return appropriate translated text based on RMSSD thresholds
  if (rmssd < 20) {
    return getText('dashboard.rmssdAnalyticalLow',
      'Your HRV is very low, suggesting high stress or fatigue. Consider taking a rest and reducing stressors.');
  } else if (rmssd < 40) {
    return getText('dashboard.rmssdAnalyticalModeratelow',
      'Your HRV is relatively low. This may indicate elevated stress levels or insufficient recovery. Taking time to relax could be beneficial.');
  } else if (rmssd < 60) {
    return getText('dashboard.rmssdAnalyticalModerate',
      'Your HRV is in a moderate range, suggesting a balanced state between stress and recovery. Continue with normal activities.');
  } else if (rmssd < 80) {
    return getText('dashboard.rmssdAnalyticalModeratehigh',
      'Your HRV is good, indicating healthy stress resilience and effective recovery. Your body is responding well to current conditions.');
  } else {
    return getText('dashboard.rmssdAnalyticalHigh',
      'Your HRV is excellent, suggesting optimal autonomic nervous system function and strong stress resilience. Your body is in an ideal recovery state.');
  }
}

/**
 * Provides analytical interpretation of pulse (heart rate) value
 *
 * This function analyzes the pulse value and returns a detailed
 * interpretation with health insights.
 *
 * @param {number} pulse - The pulse value to interpret
 * @returns {string} Detailed analysis of the pulse value
 */
export function getAnalyticalTextForPulse(pulse) {
  if (!pulse || !isFinite(pulse)) return '';

  // Return appropriate translated text based on pulse thresholds
  if (pulse < 50) {
    return getText('dashboard.pulseAnalyticalVeryLow',
      'Your pulse is quite low. This could be normal for athletes or those who are very fit, but if you feel dizzy or weak, consider consulting a healthcare provider.');
  } else if (pulse < 60) {
    return getText('dashboard.pulseAnalyticalLow',
      'Your pulse is on the lower end of normal. This often indicates good cardiovascular fitness.');
  } else if (pulse < 80) {
    return getText('dashboard.pulseAnalyticalNormal',
      'Your pulse is in a healthy normal range, indicating good cardiovascular function.');
  } else if (pulse < 100) {
    return getText('dashboard.pulseAnalyticalElevated',
      'Your pulse is slightly elevated. This could be due to recent activity, caffeine, or mild stress. Consider some relaxation techniques.');
  } else if (pulse < 120) {
    return getText('dashboard.pulseAnalyticalHigh',
      'Your pulse is high. This could be due to exercise, stress, anxiety, or certain medications. If you\'re at rest, consider calming activities.');
  } else {
    return getText('dashboard.pulseAnalyticalVeryHigh',
      'Your pulse is very high. If you\'re not exercising, this could indicate significant stress or potential health concerns. Consider relaxation and consult a healthcare provider if persistent.');
  }
}