// Helper function to make authenticated API calls
async function apiGet(endpoint) {
    try {
        const response = await fetch(`/api/${endpoint}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// Weather data management
async function updateWeatherDisplay() {
    try {
        const weatherData = await apiGet('weather');
        if (!weatherData) return;

        const weatherContent = document.getElementById('weather-content');
        if (!weatherContent) return;

        const temperature = Math.round(weatherData.temperature.current);
        const feelsLike = Math.round(weatherData.temperature.feels_like);
        
        weatherContent.innerHTML = `
            <div class="flex items-center justify-center space-x-4">
                <div class="text-center">
                    <img src="https://openweathermap.org/img/wn/${weatherData.icon}@2x.png" 
                         alt="${weatherData.description}"
                         class="w-16 h-16">
                    <p class="text-3xl font-semibold text-gray-900">${temperature}°C</p>
                    <p class="text-sm text-gray-600">Feels like ${feelsLike}°C</p>
                    <p class="text-sm capitalize text-gray-700">${weatherData.description}</p>
                </div>
                <div class="text-sm text-gray-600 border-l pl-4">
                    <p class="mb-1">Humidity: ${weatherData.humidity}%</p>
                    <p class="mb-1">Wind: ${weatherData.wind.speed} m/s</p>
                    <p class="text-xs mt-2">Last updated:<br>${new Date(weatherData.timestamp).toLocaleTimeString()}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error updating weather:', error);
    }
}

// Update weather every 30 minutes
setInterval(updateWeatherDisplay, 30 * 60 * 1000);

// Initial weather update
document.addEventListener('DOMContentLoaded', updateWeatherDisplay);
