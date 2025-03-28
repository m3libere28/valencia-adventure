// Helper function to convert Celsius to Fahrenheit
function celsiusToFahrenheit(celsius) {
    return Math.round((celsius * 9/5) + 32);
}

// Weather API configuration
const WEATHER_API_KEY = 'YOUR_API_KEY';

// Helper function to make authenticated API calls
async function apiGet(endpoint) {
    try {
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/${endpoint}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Weather functionality
async function getWeather() {
    const weatherContainer = document.getElementById('weather-container');
    if (!weatherContainer) return;

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Valencia,ES&units=metric&appid=${WEATHER_API_KEY}`);
        if (!response.ok) {
            throw new Error('Weather API request failed');
        }

        const data = await response.json();
        updateWeatherUI(data);
    } catch (error) {
        console.error('Error fetching weather:', error);
        weatherContainer.innerHTML = `
            <div class="text-gray-600">
                <i class="fas fa-cloud"></i>
                <span>Weather data unavailable</span>
            </div>
        `;
    }
}

function updateWeatherUI(data) {
    const weatherContainer = document.getElementById('weather-container');
    if (!weatherContainer) return;

    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;

    weatherContainer.innerHTML = `
        <div class="flex items-center space-x-4">
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" 
                 alt="${description}" 
                 class="w-12 h-12">
            <div>
                <div class="text-2xl font-semibold">${temp}°C</div>
                <div class="text-gray-600">${description}</div>
            </div>
        </div>
    `;
}

// Update weather every 30 minutes
document.addEventListener('DOMContentLoaded', () => {
    getWeather();
    setInterval(getWeather, 30 * 60 * 1000);
});
