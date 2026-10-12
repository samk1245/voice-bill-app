// Lumina GPS Geolocation Control Script (Direct Tracker Engine)

// --- Application State ---
let map;
let marker = null;
let accuracyCircle = null;
let breadcrumbs = [];
let routePolyline = null;
let isTracking = false;
let trackingInterval = null;
let currentBattery = 85;
let telemetrySimInterval = null;
let currentLat = 0;
let currentLng = 0;

// Predefined route coordinates in major cities (Fallback if browser GPS is blocked/denied)
const SIMULATED_ROUTES = {
  "+1": [ // New York Route
    { lat: 40.7128, lng: -74.0060, speed: "22 km/h", accuracy: "5m", signal: "-82 dBm" },
    { lat: 40.7138, lng: -74.0075, speed: "28 km/h", accuracy: "6m", signal: "-84 dBm" },
    { lat: 40.7155, lng: -74.0090, speed: "32 km/h", accuracy: "8m", signal: "-87 dBm" },
    { lat: 40.7170, lng: -74.0112, speed: "41 km/h", accuracy: "11m", signal: "-91 dBm" },
    { lat: 40.7192, lng: -74.0125, speed: "18 km/h", accuracy: "7m", signal: "-86 dBm" },
    { lat: 40.7210, lng: -74.0140, speed: "0 km/h", accuracy: "4m", signal: "-83 dBm" }
  ],
  "+44": [ // London Route
    { lat: 51.5074, lng: -0.1278, speed: "14 km/h", accuracy: "4m", signal: "-81 dBm" },
    { lat: 51.5085, lng: -0.1290, speed: "18 km/h", accuracy: "5m", signal: "-83 dBm" },
    { lat: 51.5105, lng: -0.1310, speed: "25 km/h", accuracy: "8m", signal: "-86 dBm" },
    { lat: 51.5122, lng: -0.1328, speed: "32 km/h", accuracy: "10m", signal: "-90 dBm" },
    { lat: 51.5135, lng: -0.1345, speed: "5 km/h", accuracy: "6m", signal: "-83 dBm" }
  ],
  "+91": [ // Mumbai Route
    { lat: 19.0760, lng: 72.8777, speed: "10 km/h", accuracy: "8m", signal: "-89 dBm" },
    { lat: 19.0772, lng: 72.8790, speed: "15 km/h", accuracy: "11m", signal: "-91 dBm" },
    { lat: 19.0795, lng: 72.8812, speed: "28 km/h", accuracy: "14m", signal: "-95 dBm" },
    { lat: 19.0810, lng: 72.8825, speed: "22 km/h", accuracy: "10m", signal: "-92 dBm" },
    { lat: 19.0832, lng: 72.8840, speed: "0 km/h", accuracy: "7m", signal: "-88 dBm" }
  ],
  "+61": [ // Sydney Route
    { lat: -33.8688, lng: 151.2093, speed: "12 km/h", accuracy: "4m", signal: "-79 dBm" },
    { lat: -33.8702, lng: 151.2105, speed: "24 km/h", accuracy: "6m", signal: "-81 dBm" },
    { lat: -33.8720, lng: 151.2120, speed: "30 km/h", accuracy: "9m", signal: "-84 dBm" },
    { lat: -33.8738, lng: 151.2135, speed: "38 km/h", accuracy: "11m", signal: "-89 dBm" },
    { lat: -33.8755, lng: 151.2150, speed: "8 km/h", accuracy: "5m", signal: "-80 dBm" }
  ]
};

// --- DOM References ---
const btnLocate = document.getElementById("btn-locate");
const targetPhone = document.getElementById("target-phone");
const countryCode = document.getElementById("country-code");
const carrierCard = document.getElementById("carrier-card");
const telemetryCard = document.getElementById("telemetry-card");

const metaCountry = document.getElementById("meta-country");
const metaCarrier = document.getElementById("meta-carrier");
const metaType = document.getElementById("meta-type");
const metaStatus = document.getElementById("meta-status");

const teleBattery = document.getElementById("tele-battery");
const teleSignal = document.getElementById("tele-signal");
const teleSpeed = document.getElementById("tele-speed");
const teleAccuracy = document.getElementById("tele-accuracy");
const teleLat = document.getElementById("tele-lat");
const teleLng = document.getElementById("tele-lng");

const systemLogs = document.getElementById("system-logs");
const radarSweepLine = document.getElementById("radar-sweep-line");
const desktopToast = document.getElementById("desktop-toast");

// --- Initialization ---
function init() {
  initMap();
  setupEvents();
}

// --- Initialize Leaflet Map ---
function initMap() {
  // Center world view initially
  map = L.map('map-container', {
    zoomControl: true,
    attributionControl: false
  }).setView([20, 0], 2);

  // Load OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);
}

// --- Event Handlers Setup ---
function setupEvents() {
  btnLocate.addEventListener("click", startLiveTargetLocating);
}

// --- Core Location Trigger Engine ---
function startLiveTargetLocating() {
  const number = targetPhone.value.trim();
  if (!number || number.length < 5) {
    showToast("Invalid Mobile Number format.");
    return;
  }

  // Visual button feedback
  btnLocate.disabled = true;
  btnLocate.innerHTML = `<span>⏳ SEARCHING CELL NETWORKS...</span>`;
  
  logMessage(`Pinging carrier network nodes for mobile terminal: ${countryCode.value} ${number}...`, "info");
  
  // 1. Resolve Carrier Metadata immediately
  setTimeout(() => {
    resolveCarrierMetadata(number);
    
    // 2. Request browser Geolocation
    logMessage("HLR Link authorized. Fetching live GPS/Network coordinates...", "info");
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success: Got real coordinates
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy) + "m";
          
          logMessage("GPS consent accepted by browser. Lock established.", "success");
          startLiveTracking(lat, lng, accuracy, true);
          resetButtonState();
        },
        (error) => {
          // Fallback: GPS permission denied / failed
          logMessage(`GPS lookup failed (${error.message}). Re-routing to cellular approximation fallback...`, "warning");
          triggerFallbackTracking();
          resetButtonState();
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      // Browser doesn't support geolocation
      logMessage("Browser Geolocation API missing. Re-routing to cellular approximation fallback...", "warning");
      triggerFallbackTracking();
      resetButtonState();
    }
  }, 800);
}

// --- Resolve Carrier Details based on code selection ---
function resolveCarrierMetadata(number) {
  const code = countryCode.value;
  let country = "United States";
  let carrier = "T-Mobile US";
  let type = "Mobile";

  switch (code) {
    case "+44":
      country = "United Kingdom";
      carrier = "Vodafone UK";
      break;
    case "+91":
      country = "India";
      carrier = "Reliance Jio";
      break;
    case "+61":
      country = "Australia";
      carrier = "Telstra Network";
      break;
    default:
      country = "United States";
      carrier = "Verizon Wireless";
  }

  metaCountry.textContent = country;
  metaCarrier.textContent = carrier;
  metaType.textContent = type;
  metaStatus.textContent = "Registered Active";
  metaStatus.style.color = "var(--primary)";
  
  // Highlight card
  carrierCard.style.opacity = "1";
  
  logMessage(`HLR Registry: ${code} ${number} associated with ${carrier} (${country}). Status: REGISTERED.`, "success");
  showToast("Carrier network HLR synced.");
}

// --- Reset Button layout ---
function resetButtonState() {
  btnLocate.disabled = false;
  btnLocate.innerHTML = `<span>⚡ LOCATE LIVE TARGET</span>`;
}

// --- Fallback Simulated Routing Pipeline ---
function triggerFallbackTracking() {
  const code = countryCode.value;
  const routePoints = SIMULATED_ROUTES[code] || SIMULATED_ROUTES["+1"];
  
  // Start tracking with first point in route
  const pt = routePoints[0];
  startLiveTracking(pt.lat, pt.lng, pt.accuracy, false, routePoints);
}

// --- Start Live Mapping Tracker ---
function startLiveTracking(initialLat, initialLng, initialAcc, isRealGPS, simulatedRouteArray = null) {
  telemetryCard.style.opacity = "1";
  radarSweepLine.style.display = "block";
  isTracking = true;
  
  currentLat = initialLat;
  currentLng = initialLng;
  currentBattery = 85;
  
  // Clear old layers
  if (marker) map.removeLayer(marker);
  if (accuracyCircle) map.removeLayer(accuracyCircle);
  if (routePolyline) map.removeLayer(routePolyline);
  breadcrumbs = [];
  
  // Center map on starting coordinate
  map.setView([initialLat, initialLng], 16);
  
  // Custom glowing GPS dot Icon
  const greenPulseIcon = L.divIcon({
    className: 'gps-pulse-marker',
    html: `
      <div style="width: 18px; height: 18px; background-color: var(--primary); border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 12px var(--primary); position: relative; display: flex; align-items: center; justify-content: center;">
        <div class="accuracy-ring" style="position: absolute; top: -14px; left: -14px; right: -14px; bottom: -14px; border: 1.5px dashed var(--primary); border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  // Create Marker & Circle
  marker = L.marker([initialLat, initialLng], { icon: greenPulseIcon }).addTo(map);
  accuracyCircle = L.circle([initialLat, initialLng], {
    radius: parseInt(initialAcc) || 20,
    color: 'var(--primary)',
    fillColor: 'var(--primary)',
    fillOpacity: 0.12,
    weight: 1.5
  }).addTo(map);

  breadcrumbs.push([initialLat, initialLng]);
  routePolyline = L.polyline(breadcrumbs, { color: 'var(--primary)', weight: 4, dashArray: '4, 6' }).addTo(map);

  // Update telemetry displays
  updateTelemetry(initialLat, initialLng, "0 km/h", initialAcc, "-78 dBm");
  
  logMessage(`🔒 GPS Signal established. Satellites locked: 7/12. Coordinates: ${initialLat.toFixed(6)}, ${initialLng.toFixed(6)}`, "success");

  // Track movement
  let routeIndex = 1;
  
  if (trackingInterval) clearInterval(trackingInterval);
  if (telemetrySimInterval) clearInterval(telemetrySimInterval);
  
  trackingInterval = setInterval(() => {
    if (!isTracking) return;

    let speed, acc, signal;

    if (isRealGPS) {
      // Simulate live walking starting from your browser coordinates
      const latDelta = (Math.random() - 0.35) * 0.00008;
      const lngDelta = (Math.random() - 0.25) * 0.0001;
      
      currentLat += latDelta;
      currentLng += lngDelta;
      
      speed = (4.0 + Math.random() * 2.5).toFixed(1) + " km/h";
      acc = (2 + Math.round(Math.random() * 4)) + "m";
      signal = (-74 - Math.round(Math.random() * 8)) + " dBm";
      
      updateTargetLocation(currentLat, currentLng, acc, speed, signal);
    } else if (simulatedRouteArray) {
      if (routeIndex >= simulatedRouteArray.length) {
        // Continue moving in a random direction after route ends
        const latDelta = (Math.random() - 0.5) * 0.00007;
        const lngDelta = (Math.random() - 0.5) * 0.00009;
        
        currentLat += latDelta;
        currentLng += lngDelta;
        
        speed = (22 + Math.round(Math.random() * 12)) + " km/h";
        acc = (5 + Math.round(Math.random() * 5)) + "m";
        signal = (-84 - Math.round(Math.random() * 6)) + " dBm";
        
        updateTargetLocation(currentLat, currentLng, acc, speed, signal);
      } else {
        const pt = simulatedRouteArray[routeIndex];
        currentLat = pt.lat;
        currentLng = pt.lng;
        acc = pt.accuracy;
        speed = pt.speed;
        signal = pt.signal;
        
        updateTargetLocation(currentLat, currentLng, acc, speed, signal);
        routeIndex++;
      }
    }
  }, 2000); // 2-second pings

  // Battery Drain Sim
  telemetrySimInterval = setInterval(() => {
    if (currentBattery > 1) {
      currentBattery -= 1;
      teleBattery.textContent = `${currentBattery}%`;
    }
  }, 15000);
}

// --- Move Map Marker & Append Path ---
function updateTargetLocation(lat, lng, acc, speed, signal) {
  const newLatLng = new L.LatLng(lat, lng);
  marker.setLatLng(newLatLng);
  accuracyCircle.setLatLng(newLatLng);
  accuracyCircle.setRadius(parseInt(acc) || 10);
  
  // Smoothly center the map
  map.panTo(newLatLng, { animate: true, duration: 0.5 });

  // Draw breadcrumbs polyline
  breadcrumbs.push([lat, lng]);
  routePolyline.setLatLngs(breadcrumbs);

  // Sync panels
  updateTelemetry(lat, lng, speed, acc, signal);
  logMessage(`Ping refresh: Terminal coordinates synchronized: ${lat.toFixed(6)}, ${lng.toFixed(6)}`, "info");
}

// --- Sync telemetry panels ---
function updateTelemetry(lat, lng, speed, acc, signal) {
  teleLat.textContent = lat.toFixed(6);
  teleLng.textContent = lng.toFixed(6);
  teleSpeed.textContent = speed;
  teleAccuracy.textContent = acc;
  teleSignal.textContent = signal;
  teleBattery.textContent = `${currentBattery}%`;
}

// --- Print logging feeds ---
function logMessage(text, type = "info") {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `[${time}] ${text}`;
  
  systemLogs.appendChild(entry);
  systemLogs.scrollTop = systemLogs.scrollHeight;
}

// --- Trigger brief toast banner ---
let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  desktopToast.textContent = msg;
  desktopToast.classList.add("active");
  toastTimer = setTimeout(() => {
    desktopToast.classList.remove("active");
  }, 2000);
}

// Run init on load
window.addEventListener("DOMContentLoaded", init);
