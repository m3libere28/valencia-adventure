// Initialize map
let journalMap;
let journalMarkers = [];

// Initialize journal data
let journalEntries = [];

// Load journal entries from server
async function loadJournalEntries() {
    try {
        const response = await fetch('/api/submit-form');
        const data = await response.json();
        if (data.success) {
            journalEntries = data.entries || [];
            updateJournalEntries();
        }
    } catch (error) {
        console.error('Error loading journal entries:', error);
    }
}

// Initialize map
function initJournalMap() {
    journalMap = L.map('journal-map').setView([39.4699, -0.3763], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' OpenStreetMap contributors'
    }).addTo(journalMap);

    // Add existing markers
    journalEntries.forEach(entry => {
        if (entry.location) {
            addMarkerToMap(entry);
        }
    });
}

// Add marker to map
function addMarkerToMap(entry) {
    if (!entry.location) return;
    
    const marker = L.marker(entry.location)
        .bindPopup(`
            <div class="p-4">
                <h3 class="font-bold text-lg mb-2">${entry.title}</h3>
                <p class="text-sm mb-2">${new Date(entry.date).toLocaleDateString()}</p>
                ${entry.photos && entry.photos.length > 0 ? 
                    `<img src="${entry.photos[0]}" class="w-full h-32 object-cover mb-2 rounded">` : ''}
                <p class="text-sm">${entry.notes.substring(0, 100)}${entry.notes.length > 100 ? '...' : ''}</p>
            </div>
        `)
        .addTo(journalMap);
    
    journalMarkers.push(marker);
}

// Handle image upload
function handleImageUpload(files) {
    const imagePromises = Array.from(files).map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    });

    return Promise.all(imagePromises);
}

// Add journal entry
async function addJournalEntry(e) {
    e.preventDefault();
    const form = e.target;
    
    // Get location from map click or input
    const location = form.querySelector('[name="location"]').value.split(',').map(Number);
    
    // Handle photo uploads
    const photoFiles = form.querySelector('[name="photos"]').files;
    const photos = await handleImageUpload(photoFiles);

    const entry = {
        id: Date.now(),
        date: form.querySelector('[name="date"]').value,
        title: form.querySelector('[name="title"]').value,
        location: location,
        locationName: form.querySelector('[name="location-name"]').value,
        notes: form.querySelector('[name="notes"]').value,
        photos: photos,
        weather: form.querySelector('[name="weather"]').value,
        mood: form.querySelector('[name="mood"]').value,
        tags: form.querySelector('[name="tags"]').value.split(',').map(tag => tag.trim())
    };

    try {
        const response = await fetch('/api/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(entry)
        });

        const data = await response.json();
        if (data.success) {
            journalEntries.push(entry);
            addMarkerToMap(entry);
            updateJournalEntries();
            form.reset();
        } else {
            console.error('Error saving entry:', data.message);
            alert('Failed to save entry. Please try again.');
        }
    } catch (error) {
        console.error('Error saving entry:', error);
        alert('Failed to save entry. Please try again.');
    }
}

// Update journal entries display
function updateJournalEntries() {
    const container = document.getElementById('journal-entries');
    container.innerHTML = '';

    journalEntries
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(entry => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-xl shadow-lg p-6 mb-6 transform hover:scale-105 transition-transform duration-300';
            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-semibold mb-2">${entry.title}</h3>
                        <p class="text-gray-600">
                            <i class="fas fa-calendar-alt mr-2"></i>${new Date(entry.date).toLocaleDateString()}
                        </p>
                        <p class="text-gray-600">
                            <i class="fas fa-map-marker-alt mr-2"></i>${entry.locationName}
                        </p>
                    </div>
                    <div class="flex space-x-2">
                        <span class="text-gray-600">
                            <i class="fas fa-${getWeatherIcon(entry.weather)} mr-1"></i>${entry.weather}
                        </span>
                        <span class="text-gray-600">
                            <i class="fas fa-${getMoodIcon(entry.mood)} mr-1"></i>${entry.mood}
                        </span>
                    </div>
                </div>
                ${entry.photos && entry.photos.length > 0 ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        ${entry.photos.map(photo => `
                            <div class="relative group">
                                <img src="${photo}" class="w-full h-48 object-cover rounded-lg" alt="Journal photo">
                                <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                    <button onclick="viewPhoto('${photo}')" class="text-white hover:text-blue-200">
                                        <i class="fas fa-expand-alt text-2xl"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                <p class="text-gray-700 mb-4 whitespace-pre-line">${entry.notes}</p>
                <div class="flex flex-wrap gap-2">
                    ${entry.tags.map(tag => `
                        <span class="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                            #${tag}
                        </span>
                    `).join('')}
                </div>
                <div class="mt-4 flex justify-end space-x-2">
                    <button onclick="showOnMap([${entry.location}])" class="text-blue-500 hover:text-blue-700">
                        <i class="fas fa-map-marker-alt mr-1"></i>View on Map
                    </button>
                    <button onclick="deleteEntry(${entry.id})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
}

// View photo in lightbox
function viewPhoto(photoUrl) {
    const lightbox = document.createElement('div');
    lightbox.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50';
    lightbox.onclick = () => lightbox.remove();
    lightbox.innerHTML = `
        <img src="${photoUrl}" class="max-h-[90vh] max-w-[90vw] object-contain">
    `;
    document.body.appendChild(lightbox);
}

// Show entry on map
function showOnMap(location) {
    journalMap.setView(location, 15);
    journalMarkers.forEach(marker => {
        if (marker.getLatLng().lat === location[0] && marker.getLatLng().lng === location[1]) {
            marker.openPopup();
        }
    });
}

// Delete entry
function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this journal entry?')) {
        journalEntries = journalEntries.filter(entry => entry.id !== id);
        updateJournalEntries();
    }
}

// Utility functions
function getWeatherIcon(weather) {
    const icons = {
        'Sunny': 'sun',
        'Cloudy': 'cloud',
        'Rainy': 'cloud-rain',
        'Stormy': 'bolt',
        'Snowy': 'snowflake'
    };
    return icons[weather] || 'sun';
}

function getMoodIcon(mood) {
    const icons = {
        'Happy': 'smile',
        'Excited': 'grin-stars',
        'Relaxed': 'smile-beam',
        'Tired': 'tired',
        'Sad': 'frown'
    };
    return icons[mood] || 'smile';
}

// Export journal entries
function exportJournal() {
    const dataStr = JSON.stringify(journalEntries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family-journal-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import journal entries
function importJournal(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                journalEntries = importedData;
                
                // Clear existing markers
                journalMarkers.forEach(marker => journalMap.removeLayer(marker));
                journalMarkers = [];
                
                // Add new markers
                journalEntries.forEach(entry => {
                    if (entry.location) {
                        addMarkerToMap(entry);
                    }
                });
                
                updateJournalEntries();
                alert('Journal entries imported successfully!');
            } catch (error) {
                alert('Error importing journal entries. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadJournalEntries();
    initJournalMap();
    document.getElementById('journal-form').addEventListener('submit', addJournalEntry);
    document.getElementById('import-journal').addEventListener('change', importJournal);
    
    // Handle map clicks for location selection
    journalMap.on('click', function(e) {
        const locationInput = document.querySelector('[name="location"]');
        locationInput.value = `${e.latlng.lat},${e.latlng.lng}`;
    });
});
