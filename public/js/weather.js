// Weather data management
async function updateWeatherDisplay() {
    try {
        const weatherData = await apiGet('weather');
        if (!weatherData) return;

        const weatherSection = document.getElementById('weather');
        if (!weatherSection) return;

        const temperature = Math.round(weatherData.temperature.current);
        const feelsLike = Math.round(weatherData.temperature.feels_like);
        
        weatherSection.innerHTML = `
            <div class="flex items-center justify-center space-x-4">
                <div class="text-center">
                    <img src="https://openweathermap.org/img/wn/${weatherData.icon}@2x.png" 
                         alt="${weatherData.description}"
                         class="w-16 h-16">
                    <p class="text-xl font-semibold">${temperature}°C</p>
                    <p class="text-sm text-gray-600">Feels like ${feelsLike}°C</p>
                    <p class="text-sm capitalize">${weatherData.description}</p>
                </div>
                <div class="text-sm text-gray-600">
                    <p>Humidity: ${weatherData.humidity}%</p>
                    <p>Wind: ${weatherData.wind.speed} m/s</p>
                    <p class="text-xs">Last updated: ${new Date(weatherData.timestamp).toLocaleTimeString()}</p>
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
document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated) {
        updateWeatherDisplay();
    }
});
