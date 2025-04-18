// API Key - Sign up at https://openweathermap.org/ to get yours
const API_KEY = "06a2b5ba574ac83b9bcbd1c23df52614"; // Replace with your actual API key

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const celsiusBtn = document.getElementById('celsiusBtn');
const fahrenheitBtn = document.getElementById('fahrenheitBtn');
const weatherCard = document.querySelector('.weather-card');
const errorMsg = document.getElementById('errorMsg');

// Weather elements
const cityName = document.getElementById('cityName');
const weatherIcon = document.getElementById('weatherIcon');
const weatherDesc = document.getElementById('weatherDesc');
const temperature = document.getElementById('temperature');
const tempUnit = document.getElementById('tempUnit');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');

// Unit state
let isCelsius = true;

// Event Listeners
searchBtn.addEventListener('click', fetchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchWeather();
});

celsiusBtn.addEventListener('click', () => {
    if (!isCelsius) {
        isCelsius = true;
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
        convertTemperature();
    }
});

fahrenheitBtn.addEventListener('click', () => {
    if (isCelsius) {
        isCelsius = false;
        fahrenheitBtn.classList.add('active');
        celsiusBtn.classList.remove('active');
        convertTemperature();
    }
});

// Fetch Weather Data
async function fetchWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError("Please enter a city name");
        return;
    }

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error("City not found");
        }
        
        const data = await response.json();
        displayWeather(data);
        errorMsg.textContent = "";
    } catch (error) {
        showError(error.message);
        weatherCard.style.display = "none";
    }
}

// Display Weather Data
function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    weatherDesc.textContent = data.weather[0].description;
    temperature.textContent = Math.round(data.main.temp);
    tempUnit.textContent = "°C";
    humidity.textContent = data.main.humidity;
    windSpeed.textContent = (data.wind.speed * 3.6).toFixed(1); // Convert m/s to km/h
    
    // Set weather icon
    const iconCode = data.weather[0].icon;
    weatherIcon.className = `wi wi-owm-${iconCode}`;
    
    weatherCard.style.display = "block";
}

// Convert Temperature Unit
function convertTemperature() {
    const currentTemp = parseFloat(temperature.textContent);
    
    if (isCelsius) {
        // Convert to Celsius
        temperature.textContent = Math.round((currentTemp - 32) * 5/9);
        tempUnit.textContent = "°C";
    } else {
        // Convert to Fahrenheit
        temperature.textContent = Math.round((currentTemp * 9/5) + 32);
        tempUnit.textContent = "°F";
    }
}

// Show Error Message
function showError(message) {
    errorMsg.textContent = message;
    setTimeout(() => {
        errorMsg.textContent = "";
    }, 3000);
}

// Initialize with a default city
window.addEventListener('load', () => {
    cityInput.value = "Lagos";
    fetchWeather();
});
// Fetch 5-day forecast data
async function fetchForecast(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error("Error fetching forecast:", error);
    }
}

// Display 5-day forecast
function displayForecast(data) {
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';
    
    // Get daily forecasts (API returns 3-hour intervals)
    const dailyForecasts = [];
    for (let i = 0; i < data.list.length; i += 8) {
        dailyForecasts.push(data.list[i]);
    }

    // Create forecast cards
    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en', { weekday: 'short' });
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-day';
        forecastCard.innerHTML = `
            <div class="day-name">${dayName}</div>
            <i class="wi wi-owm-${day.weather[0].id}"></i>
            <div class="forecast-temp">
                <span class="high">${Math.round(day.main.temp_max)}°</span>
                <span class="low">${Math.round(day.main.temp_min)}°</span>
            </div>
        `;
        
        forecastGrid.appendChild(forecastCard);
    });

    document.getElementById('forecastContainer').style.display = 'block';
}

// Update your existing fetchWeather function to call fetchForecast
async function fetchWeather() {
    const city = cityInput.value.trim();
    if (!city) return;
    
    try {
        // Existing current weather fetch
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        const currentData = await currentResponse.json();
        displayWeather(currentData);
        
        // New forecast fetch
        await fetchForecast(city);
        errorMsg.textContent = "";
    } catch (error) {
        showError(error.message);
        weatherCard.style.display = "none";
        document.getElementById('forecastContainer').style.display = 'none';
    }
}

// Initialize forecast container as hidden
document.getElementById('forecastContainer').style.display = 'none';
// In fetchWeather():
async function fetchWeather() {
    const city = cityInput.value.trim();
    if (!city) return;
    
    try {
        // Current weather
        const current = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        const currentData = await current.json();
        displayWeather(currentData);
        
        // Forecast - added await to ensure proper sequencing
        await fetchForecast(city);
        
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

// Forecast function
async function fetchForecast(city) {
    try {
        const forecast = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        const forecastData = await forecast.json();
        displayForecast(forecastData);
    } catch (error) {
        console.error("Forecast Error:", error);
    }
}
