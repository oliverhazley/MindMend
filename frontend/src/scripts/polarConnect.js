// src/scripts/polarConnect.js
import { API_BASE_URL } from "./config.js";

/**
 * artifact correction logic , window=5, threshold=150
 */
function correctRRIntervalsThreshold(rrArray, windowSize = 5, thresholdMs = 150) {
  if (rrArray.length < 2) return rrArray.slice();
  const corrected = rrArray.slice(); // don't mutate original

  for (let i = 0; i < corrected.length; i++) {
    const start = Math.max(0, i - windowSize);
    const end = Math.min(corrected.length - 1, i + windowSize);

    const localSeg = corrected.slice(start, end + 1).sort((a, b) => a - b);
    const mid = Math.floor(localSeg.length / 2);

    const localMedian =
      localSeg.length % 2
        ? localSeg[mid]
        : (localSeg[mid - 1] + localSeg[mid]) / 2;

    const diff = Math.abs(corrected[i] - localMedian);
    if (diff > thresholdMs) {
      corrected[i] = localMedian;
    }
  }
  return corrected;
}

/**
 * standard RMSSD formula:
 *   RMSSD = sqrt( sum( (diff^2) ) / (N-1) )
 */
function calculateRMSSD(rrArray) {
  if (rrArray.length < 2) return null;

  let sumOfSquares = 0;
  for (let i = 1; i < rrArray.length; i++) {
    const diff = rrArray[i] - rrArray[i - 1];
    sumOfSquares += diff * diff;
  }
  const meanSq = sumOfSquares / (rrArray.length - 1);
  return Math.sqrt(meanSq);
}

// We'll keep these data in memory
let polarDevice = null;
let pulse = null;                 // live BPM, not stored in DB
let rrBuffer = [];               // raw intervals for 5-min chunk
let rrLive = [];                 // live RR intervals for chart display
let latestRMSSD = null;          // for dashboard live view
let uploadTimer = null;          // for 5-minute uploads

/**
 * Called from settings.js "Connect" button
 */
export async function connectPolarH10() {
  try {
    console.log("Requesting Polar H10 over BLE...");
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "Polar" }],
      optionalServices: ["heart_rate"],
    });

    polarDevice = await device.gatt.connect();
    const service = await polarDevice.getPrimaryService("heart_rate");
    const char = await service.getCharacteristic("00002a37-0000-1000-8000-00805f9b34fb");

    console.log("Subscribing to Heart Rate notifications...");
    await char.startNotifications();
    char.addEventListener("characteristicvaluechanged", handleHRNotification);

    if (!uploadTimer) {
      uploadTimer = setInterval(() => {
        uploadRMSSD();
      }, 5 * 60 * 1000);
    }
  } catch (error) {
    console.error("Error connecting to Polar H10:", error);
    alert("Could not connect to Polar H10. Check Bluetooth & device power.");
  }
}

/**
 * BLE Notification Handler
 */
function handleHRNotification(event) {
  const value = event.target.value;

  // parse BPM
  let is16bit = (value.getUint8(0) & 0x01) !== 0;
  let offset = 1;
  pulse = is16bit ? value.getUint16(offset, true) : value.getUint8(offset);
  console.log("Pulse (BPM):", pulse);

  // parse RR intervals
  const newRRs = [];
  offset = 2;
  while (offset < value.byteLength) {
    const rrValue = value.getUint16(offset, true) * (1000 / 1024);
    newRRs.push(rrValue);
    offset += 2;
  }
  console.log("Raw RR intervals:", newRRs);

  // push to buffers
  rrBuffer.push(...newRRs);
  rrBuffer = rrBuffer.slice(-600);   // for DB use

  rrLive.push(...newRRs);
  rrLive = rrLive.slice(-60);        // for chart display

  // Live RMSSD calculation
  const corrected = correctRRIntervalsThreshold(rrLive);
  latestRMSSD = calculateRMSSD(corrected);
}

/**
 * 5-minute chunk => calculate RMSSD => store in DB (hrv_readings)
 */
async function uploadRMSSD() {
  console.log("Uploading RMSSD (5-minute interval)");
  if (rrBuffer.length < 10) {
    console.log("Not enough data to calculate RMSSD.");
    rrBuffer = [];
    return;
  }

  const corrected = correctRRIntervalsThreshold(rrBuffer);
  const rmssd = calculateRMSSD(corrected);
  rrBuffer = [];

  if (!rmssd || !isFinite(rmssd)) {
    console.log("Invalid RMSSD. Skipping DB upload.");
    return;
  }

  const user_id = localStorage.getItem("user_id") || 1;
  const token = localStorage.getItem("token") || "";

  try {
    const resp = await fetch(`${API_BASE_URL}/hrv`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        user_id,
        hrv_value: parseFloat(rmssd.toFixed(2)),
      }),
    });

    if (!resp.ok) {
      throw new Error(`Upload RMSSD failed: ${resp.statusText}`);
    }

    console.log(`Successfully posted RMSSD = ${rmssd.toFixed(2)} ms`);
  } catch (err) {
    console.error("Error uploading RMSSD to server:", err);
  }
}

/**
 * function to get current pulse
 * so Dashboard can read `pulse` from here
 */
export function getCurrentPulse() {
  return pulse || 0;
}

/**
 * get latest live-calculated RMSSD
 */
export function getCurrentRMSSD() {
  return latestRMSSD;
}

/**
 * return recent RR intervals for dashboard chart
 */
export function getRRData() {
  return rrLive;
}

/**
 * simulate saveRMSSDtoDB for dashboard interval (points to internal logic)
 */
export function saveRMSSDtoDB() {
  return uploadRMSSD();
}
