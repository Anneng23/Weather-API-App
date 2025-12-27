const API_KEY = "fe15cf5656d7fd2b2df6e6f5d1f66860"; 
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const currentWeather = document.getElementById("currentWeather");
const forecastDiv = document.getElementById("forecast");
const forecastTitle = document.getElementById("forecastTitle");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");

// Unit toggle elements & state
const cBtn = document.getElementById("cBtn");
const fBtn = document.getElementById("fBtn");
let unit = "C";
let lastCurrentData = null;
let lastForecastList = null;

function formatTemp(tempC) {
  return unit === "C" ? `${Math.round(tempC)}°C` : `${Math.round(tempC * 9/5 + 32)}°F`;
}

function setUnit(newUnit) {
  if (unit === newUnit) return;
  unit = newUnit;
  if (cBtn) cBtn.classList.toggle("active", unit === "C");
  if (fBtn) fBtn.classList.toggle("active", unit === "F");
  if (lastCurrentData) displayCurrent(lastCurrentData);
  if (lastForecastList) displayForecast(lastForecastList);
}

if (cBtn) cBtn.addEventListener("click", () => setUnit("C"));
if (fBtn) fBtn.addEventListener("click", () => setUnit("F"));

// Get trimmed city name
function getCity() {
  return cityInput.value.trim();
}

// Fetch current weather
async function fetchWeather(city) {
  try {
    toggleLoading(true);
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);

    if (!res.ok) throw new Error("City not found");

    const data = await res.json();
    lastCurrentData = data;
    displayCurrent(data);
    fetchForecast(city);
  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    toggleLoading(false);
    searchBtn.disabled = false;
  }
} 

// Fetch 5-day forecast
async function fetchForecast(city) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`);
    const data = await res.json();
    lastForecastList = data.list;
    displayForecast(data.list);
  } catch {
    errorEl.textContent = "Failed API call";
  }
} 

// Display current weather
function displayCurrent(data) {
  currentWeather.innerHTML = `
    <h2>${data.name}</h2>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" />
    <div class="temp">${formatTemp(data.main.temp)}</div>
    <p>${data.weather[0].description}</p>
    <p>Humidity: ${data.main.humidity}%</p>
  `;
} 

// Display forecast cards
function displayForecast(list) {
  forecastDiv.innerHTML = "";
  if (!list || list.length === 0) {
    if (forecastTitle) forecastTitle.classList.add("hidden");
    return;
  }
  if (forecastTitle) forecastTitle.classList.remove("hidden");
  list.filter((_, i) => i % 8 === 0).forEach(item => {
    // format date as 'Mon Day' (e.g., "Dec 23")
    const date = new Date(item.dt_txt);
    const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <p>${dateStr}</p>
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" />
      <p><strong>${formatTemp(item.main.temp)}</strong></p>
      <small>${item.weather[0].description}</small>
    `;
    forecastDiv.appendChild(card);
  });
} 

// Loading state
function toggleLoading(show) {
  loadingEl.classList.toggle("hidden", !show);
}

// Input validation
searchBtn.addEventListener("click", () => {
  errorEl.textContent = "";
  currentWeather.innerHTML = "";
  forecastDiv.innerHTML = "";
  if (forecastTitle) forecastTitle.classList.add("hidden");

  const city = getCity();

  if (city === "") {
    errorEl.textContent = "Please enter a city name";
    return;
  }

  if (!/^[a-zA-Z\s]+$/.test(city)) {
    errorEl.textContent = "Invalid characters detected";
    return;
  }

  searchBtn.disabled = true;
  fetchWeather(city);
});

// Dark mode toggle
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
