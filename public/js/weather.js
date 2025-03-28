// Helper function to convert Celsius to Fahrenheit
function celsiusToFahrenheit(celsius) {
    return Math.round((celsius * 9/5) + 32);
}

// Weather API configuration
const WEATHER_API_KEY = '4f3c7a75d5msh45db6f537276fd4p1b03e8jsn82d056dab4a1';
const WEATHER_API_HOST = 'weatherapi-com.p.rapidapi.com';
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

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

async function getWeather() {
    const city = 'Valencia,Spain';
    
    try {
        const response = await fetch(`${CORS_PROXY}https://${WEATHER_API_HOST}/current.json?q=${encodeURIComponent(city)}`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': WEATHER_API_KEY,
                'X-RapidAPI-Host': WEATHER_API_HOST
            }
        });

        if (!response.ok) {
            throw new Error('Weather API request failed');
        }

        const data = await response.json();
        updateWeatherUI(data);
    } catch (error) {
        console.error('Error fetching weather:', error);
        const weatherContainer = document.getElementById('weather-container');
        if (weatherContainer) {
            weatherContainer.innerHTML = '<p class="text-gray-600">Weather data unavailable</p>';
        }
    }
}

function updateWeatherUI(data) {
    const weatherContainer = document.getElementById('weather-container');
    if (!weatherContainer) return;

    const current = data.current;
    weatherContainer.innerHTML = `
        <div class="flex items-center space-x-4">
            <img src="${current.condition.icon}" alt="${current.condition.text}" class="w-12 h-12">
            <div>
                <div class="text-2xl font-semibold">${current.temp_c}°C</div>
                <div class="text-gray-600">${current.condition.text}</div>
            </div>
        </div>
    `;
}

// Weather data management
async function updateWeatherDisplay() {
    const weatherContent = document.getElementById('weather-content');
    if (!weatherContent) {
        console.error('Weather content element not found');
        return;
    }

    try {
        const weatherData = await apiGet('weather');
        
        const tempC = Math.round(weatherData.temperature.current);
        const feelsLikeC = Math.round(weatherData.temperature.feels_like);
        const tempF = celsiusToFahrenheit(weatherData.temperature.current);
        const feelsLikeF = celsiusToFahrenheit(weatherData.temperature.feels_like);
        
        weatherContent.innerHTML = `
            <div class="flex items-center justify-center space-x-4">
                <div class="text-center">
                    <img src="https://openweathermap.org/img/wn/${weatherData.icon}@2x.png" 
                         alt="${weatherData.description}"
                         class="w-16 h-16">
                    <div class="text-3xl font-semibold text-gray-900 mb-1">
                        ${tempC}°C / ${tempF}°F
                    </div>
                    <div class="text-sm text-gray-600 mb-2">
                        Feels like ${feelsLikeC}°C / ${feelsLikeF}°F
                    </div>
                    <p class="text-sm capitalize text-gray-700">${weatherData.description}</p>
                </div>
                <div class="text-sm text-gray-600 border-l pl-4">
                    <p class="mb-1">Humidity: ${weatherData.humidity}%</p>
                    <p class="mb-1">Wind: ${weatherData.wind.speed} m/s</p>
                    <p class="text-xs mt-2">Last updated:<br>${new Date(weatherData.timestamp).toLocaleTimeString()}</p>
                </div>
            </div>
        `;

        // Emit event for clothing recommendations
        document.dispatchEvent(new CustomEvent('weatherUpdated', { detail: weatherData }));
    } catch (error) {
        console.error('Error updating weather:', error);
        weatherContent.innerHTML = `
            <div class="text-center p-4">
                <div class="text-red-500 mb-2">
                    <i class="fas fa-exclamation-circle text-2xl"></i>
                </div>
                <p class="text-gray-600 mb-2">Unable to load weather data</p>
                <button onclick="updateWeatherDisplay()" class="text-blue-500 hover:text-blue-600 text-sm">
                    <i class="fas fa-sync-alt mr-1"></i> Try Again
                </button>
            </div>
        `;
    }
}

// Update weather every 30 minutes
document.addEventListener('DOMContentLoaded', () => {
    getWeather();
    updateWeatherDisplay();
    setInterval(() => {
        getWeather();
        updateWeatherDisplay();
    }, 30 * 60 * 1000);
});
