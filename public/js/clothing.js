// Clothing recommendations based on temperature and weather
const clothingRecommendations = {
    hot: {
        temp: 28,
        items: [
            { name: 'Light T-Shirt', icon: '👕', description: 'Breathable cotton' },
            { name: 'Shorts', icon: '🩳', description: 'Light colored' },
            { name: 'Sandals', icon: '👡', description: 'Open footwear' },
            { name: 'Sunhat', icon: '👒', description: 'Wide brim' }
        ]
    },
    warm: {
        temp: 23,
        items: [
            { name: 'T-Shirt', icon: '👕', description: 'Short sleeves' },
            { name: 'Light Pants', icon: '👖', description: 'Cotton or linen' },
            { name: 'Sneakers', icon: '👟', description: 'Comfortable walking shoes' }
        ]
    },
    mild: {
        temp: 18,
        items: [
            { name: 'Light Sweater', icon: '🧥', description: 'Long sleeves' },
            { name: 'Jeans', icon: '👖', description: 'Regular fit' },
            { name: 'Closed Shoes', icon: '👞', description: 'Casual footwear' }
        ]
    },
    cool: {
        temp: 13,
        items: [
            { name: 'Sweater', icon: '🧥', description: 'Warm layer' },
            { name: 'Jacket', icon: '🧥', description: 'Light jacket' },
            { name: 'Long Pants', icon: '👖', description: 'Warm material' },
            { name: 'Boots', icon: '👢', description: 'Comfortable boots' }
        ]
    },
    cold: {
        temp: 8,
        items: [
            { name: 'Winter Coat', icon: '🧥', description: 'Heavy jacket' },
            { name: 'Scarf', icon: '🧣', description: 'Neck protection' },
            { name: 'Warm Pants', icon: '👖', description: 'Insulated' },
            { name: 'Winter Boots', icon: '👢', description: 'Warm footwear' }
        ]
    }
};

// Get clothing recommendation based on temperature
function getClothingRecommendation(temp) {
    if (temp >= clothingRecommendations.hot.temp) return { category: 'hot', level: 'Very hot' };
    if (temp >= clothingRecommendations.warm.temp) return { category: 'warm', level: 'Warm' };
    if (temp >= clothingRecommendations.mild.temp) return { category: 'mild', level: 'Mild' };
    if (temp >= clothingRecommendations.cool.temp) return { category: 'cool', level: 'Cool' };
    return { category: 'cold', level: 'Cold' };
}

// Update clothing recommendations
function updateClothingRecommendations(weatherData) {
    const clothingContent = document.getElementById('clothing-content');
    if (!clothingContent || !weatherData) return;

    const temp = weatherData.temperature.current;
    const { category, level } = getClothingRecommendation(temp);
    const items = clothingRecommendations[category].items;

    clothingContent.innerHTML = `
        <div class="mb-4">
            <div class="text-lg font-semibold text-gray-900 mb-1">
                ${level} Day (${temp}°C)
            </div>
            <div class="text-sm text-gray-600">
                Here's what to wear in Valencia today
            </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
            ${items.map(item => `
                <div class="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div class="text-4xl mb-2">${item.icon}</div>
                    <div class="text-sm font-semibold text-gray-900">${item.name}</div>
                    <div class="text-xs text-gray-600">${item.description}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Listen for weather updates
document.addEventListener('weatherUpdated', function(e) {
    updateClothingRecommendations(e.detail);
});
