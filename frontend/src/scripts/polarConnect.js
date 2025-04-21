import { API_BASE_URL } from "./config.js";

// Internal state
let polarDevice = null;
let pulse = null;
let rrBuffer = [];
let rrLive = [];
let latestRMSSD = null;
let autoSaveInterval = null;
let isPolarConnected = false;

// === Utility: Sync buttons, status, and battery
function updatePolarUI({ text, isConnected, batteryLevel = null }) {
  const btns = [
    document.getElementById("polarConnectBtn"),
    document.getElementById("polarConnectBtn1"),
  ];
  const statuses = [
    document.getElementById("polarConnectionStatus"),
    document.getElementById("polarConnectionStatusSettings"),
  ];
  const batteryEls = [
    document.getElementById("batteryLevel"),
    document.getElementById("batteryLevelSettings"),
  ];

  btns.forEach((btn) => {
    if (!btn) return;
    btn.textContent = text;
    btn.classList.remove("btn-primary", "bg-red-600", "hover:bg-red-700", "text-white");
    if (isConnected) {
      btn.classList.add("bg-red-600", "hover:bg-red-700", "text-white");
    } else {
      btn.classList.add("btn-primary");
    }
  });

  statuses.forEach((el) => {
    if (el) el.textContent = isConnected ? "Connected to Polar H10" : "Connect to Polar H10";
  });

  batteryEls.forEach((el) => {
    if (!el) return;
    if (batteryLevel !== null) {
      el.textContent = `🔋 Battery: ${batteryLevel}%`;
      el.classList.remove("hidden");
    } else {
      el.textContent = "";
      el.classList.add("hidden");
    }
  });
}

// === Connect/Disconnect Toggle
export async function connectPolarH10() {
  if (isPolarConnected) {
    await disconnectPolarH10();
    return;
  }

  try {
    updatePolarUI({ text: "Connecting…", isConnected: false });

    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "Polar" }],
      optionalServices: ["heart_rate", "battery_service"],
    });

    polarDevice = await device.gatt.connect();
    isPolarConnected = true;

    // Fetch battery level
    try {
      const batteryService = await polarDevice.getPrimaryService("battery_service");
      const batteryChar = await batteryService.getCharacteristic("battery_level");
      const batteryValue = await batteryChar.readValue();
      const batteryPercent = batteryValue.getUint8(0);
      updatePolarUI({ text: "Disconnect", isConnected: true, batteryLevel: batteryPercent });
    } catch (err) {
      console.warn("Battery level unavailable:", err);
      updatePolarUI({ text: "Disconnect", isConnected: true });
    }

    const service = await polarDevice.getPrimaryService("heart_rate");
    const heartRateChar = await service.getCharacteristic("00002a37-0000-1000-8000-00805f9b34fb");

    await heartRateChar.startNotifications();
    heartRateChar.addEventListener("characteristicvaluechanged", handleHRNotification);

    startAutoRMSSDSave();
  } catch (error) {
    console.error("❌ Bluetooth connection failed:", error);
    updatePolarUI({ text: "Connect", isConnected: false });
  }
}

export async function disconnectPolarH10() {
  updatePolarUI({ text: "Disconnecting…", isConnected: true });

  stopAutoRMSSDSave();
  await uploadRMSSD();

  if (polarDevice && polarDevice.gatt.connected) {
    polarDevice.gatt.disconnect();
  }

  isPolarConnected = false;
  rrBuffer = [];
  rrLive = [];
  latestRMSSD = null;

  updatePolarUI({ text: "Connect", isConnected: false });
}

// === Handle Pulse + RR updates
function handleHRNotification(event) {
  const value = event.target.value;
  const is16bit = (value.getUint8(0) & 0x01) !== 0;
  let offset = 1;

  pulse = is16bit ? value.getUint16(offset, true) : value.getUint8(offset);

  const newRRs = [];
  offset = 2;
  while (offset < value.byteLength) {
    const rrValue = value.getUint16(offset, true) * (1000 / 1024);
    newRRs.push(rrValue);
    offset += 2;
  }

  rrBuffer.push(...newRRs);
  rrBuffer = rrBuffer.slice(-600);
  rrLive.push(...newRRs);
  rrLive = rrLive.slice(-60);

  const corrected = correctRRIntervalsThreshold(rrLive);
  latestRMSSD = calculateRMSSD(corrected);
}

// === RMSSD upload
async function uploadRMSSD() {
  console.log("⏱️ Uploading 5-minute RMSSD...");
  if (rrBuffer.length < 10) {
    console.log("⚠️ Not enough RR data. Skipping.");
    rrBuffer = [];
    return;
  }

  const corrected = correctRRIntervalsThreshold(rrBuffer);
  const rmssd = calculateRMSSD(corrected);
  rrBuffer = [];

  if (!rmssd || !isFinite(rmssd)) {
    console.log("⚠️ Invalid RMSSD. Skipping.");
    return;
  }

  const token = localStorage.getItem("token");
  const user_id = localStorage.getItem("user_id");

  try {
    const response = await fetch(`${API_BASE_URL}/hrv`, {
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

    if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
    console.log(`✅ Uploaded RMSSD = ${rmssd.toFixed(2)} ms`);
  } catch (err) {
    console.error("❌ Failed to upload RMSSD:", err);
  }
}

// === RMSSD Interval
export function startAutoRMSSDSave() {
  if (autoSaveInterval !== null) return;
  console.log("📡 Started auto-saving RMSSD every 3 mins");

  autoSaveInterval = setInterval(() => {
    const value = latestRMSSD;
    if (value) {
      uploadRMSSD();
    }
  }, 3 * 60_000);
}

export function stopAutoRMSSDSave() {
  if (autoSaveInterval !== null) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
    console.log("🛑 Stopped auto-saving RMSSD");
  }
}

// === Calculation Utilities
function correctRRIntervalsThreshold(rrArray, windowSize = 5, thresholdMs = 150) {
  if (rrArray.length < 2) return rrArray.slice();
  const corrected = rrArray.slice();
  for (let i = 0; i < corrected.length; i++) {
    const start = Math.max(0, i - windowSize);
    const end = Math.min(corrected.length - 1, i + windowSize);
    const localSeg = corrected.slice(start, end + 1).sort((a, b) => a - b);
    const mid = Math.floor(localSeg.length / 2);
    const localMedian = localSeg.length % 2 !== 0
      ? localSeg[mid]
      : (localSeg[mid - 1] + localSeg[mid]) / 2;
    const diff = Math.abs(corrected[i] - localMedian);
    if (diff > thresholdMs) corrected[i] = localMedian;
  }
  return corrected;
}

function calculateRMSSD(rrArray) {
  if (rrArray.length < 2) return null;
  let sumOfSquares = 0;
  for (let i = 1; i < rrArray.length; i++) {
    const diff = rrArray[i] - rrArray[i - 1];
    sumOfSquares += diff * diff;
  }
  return Math.sqrt(sumOfSquares / (rrArray.length - 1));
}

// === Public Accessors
export function getCurrentPulse() {
  return pulse || 0;
}
export function getCurrentRMSSD() {
  return latestRMSSD;
}
export function getRRData() {
  return rrLive;
}
export function saveRMSSDtoDB() {
  return uploadRMSSD();
}
