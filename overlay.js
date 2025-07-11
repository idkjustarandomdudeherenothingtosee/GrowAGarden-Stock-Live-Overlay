// == GrowAGarden Stock Live Overlay (RAW JSON) ==

const API_URL = "https://api.joshlei.com/v2/growagarden/stock";
const WS_URL = "wss://websocket.joshlei.com/growagarden/";

const root = document.getElementById("gag-overlay-root");

// Make sure body is plain white background with black text for visibility
document.body.style.background = "#000";
document.body.style.color = "#0f0";
document.body.style.fontFamily = "monospace";
document.body.style.margin = "0";
document.body.style.padding = "10px";
document.body.style.overflow = "auto";

// Create pre element to hold JSON
const pre = document.createElement("pre");
pre.style.whiteSpace = "pre-wrap";
pre.style.wordBreak = "break-all";
root.appendChild(pre);

let cachedData = {};

// Function to update JSON output
function renderJSON(data) {
  pre.textContent = JSON.stringify(data, null, 2);
}

// Fetch initial stocks
function fetchAndRenderStocks() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      cachedData = data;
      renderJSON(cachedData);
    })
    .catch(err => {
      console.error("Failed to load stocks:", err);
      pre.textContent = "Failed to load stocks. " + err;
    });
}

fetchAndRenderStocks();

// Listen for live updates
const ws = new window.WebSocket(WS_URL);
ws.onmessage = (event) => {
  try {
    const updateData = JSON.parse(event.data);
    Object.assign(cachedData, updateData);
    renderJSON(cachedData);
  } catch (err) {
    console.error("WebSocket parse error:", err);
  }
};
ws.onerror = (err) => {
  console.error("WebSocket error:", err);
  // fallback: refetch after error
  setTimeout(fetchAndRenderStocks, 10000);
};
ws.onclose = () => {
  console.warn("WebSocket closed");
  setTimeout(fetchAndRenderStocks, 10000);
};
