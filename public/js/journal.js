// Initialize map
let journalMap;
let journalMarkers = [];

// Initialize journal data
let journalEntries = [];

// Load journal entries from server
async function loadJournalEntries() {
    try {
        const token = await getAccessToken();
        const response = await fetch('/api/journal/entries', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
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
    
    try {
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

        console.log('Submitting entry:', entry);

        const token = await getAccessToken();
        const response = await fetch('/api/journal/entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(entry)
        });

        const data = await response.json();
        if (data.success) {
            journalEntries.push(entry);
            addMarkerToMap(entry);
            updateJournalEntries();
            form.reset();
            alert('Journal entry added successfully!');
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error adding journal entry:', error);
        alert('Error adding journal entry: ' + error.message);
    }
}

// Update journal entries display
function updateJournalEntries() {
    const entriesContainer = document.getElementById('journal-entries');
    if (!entriesContainer) return;

    entriesContainer.innerHTML = '';
    const sortedEntries = [...journalEntries].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedEntries.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.className = 'bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow';
        entryElement.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-semibold mb-2">${entry.title}</h3>
                    <p class="text-gray-600 text-sm mb-2">${new Date(entry.date).toLocaleDateString()}</p>
                    <p class="text-gray-600 text-sm mb-4">
                        <i class="fas fa-map-marker-alt text-red-500 mr-2"></i>${entry.locationName}
                    </p>
                </div>
                <div class="space-x-2">
                    <button onclick="showOnMap([${entry.location}])" class="text-blue-500 hover:text-blue-700">
                        <i class="fas fa-map"></i>
                    </button>
                    <button onclick="deleteEntry(${entry.id})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            ${entry.photos && entry.photos.length > 0 ? `
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    ${entry.photos.map(photo => `
                        <img src="${photo}" 
                             onclick="viewPhoto('${photo}')"
                             class="w-full h-32 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                             alt="Journal photo">
                    `).join('')}
                </div>
            ` : ''}
            
            <p class="text-gray-700 mb-4">${entry.notes}</p>
            
            <div class="flex items-center justify-between text-sm text-gray-600">
                <div>
                    <span class="mr-4">${getWeatherIcon(entry.weather)} ${entry.weather}</span>
                    <span>${getMoodIcon(entry.mood)} ${entry.mood}</span>
                </div>
                <div class="space-x-2">
                    ${entry.tags.map(tag => `
                        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs">
                            #${tag}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
        entriesContainer.appendChild(entryElement);
    });
}

// View photo in lightbox
function viewPhoto(photoUrl) {
    const lightbox = document.createElement('div');
    lightbox.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50';
    lightbox.onclick = () => lightbox.remove();
    
    const img = document.createElement('img');
    img.src = photoUrl;
    img.className = 'max-w-full max-h-full object-contain';
    
    lightbox.appendChild(img);
    document.body.appendChild(lightbox);
}

// Show entry on map
function showOnMap(location) {
    if (!location || !journalMap) return;
    journalMap.setView(location, 15);
    const marker = journalMarkers.find(m => 
        m.getLatLng().lat === location[0] && 
        m.getLatLng().lng === location[1]
    );
    if (marker) marker.openPopup();
}

// Delete entry
async function deleteEntry(id) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
        const token = await getAccessToken();
        const response = await fetch(`/api/journal/entries/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        if (data.success) {
            journalEntries = journalEntries.filter(entry => entry.id !== id);
            // Remove marker from map
            const markerIndex = journalMarkers.findIndex(m => {
                const entry = journalEntries.find(e => e.id === id);
                return entry && m.getLatLng().lat === entry.location[0] && m.getLatLng().lng === entry.location[1];
            });
            if (markerIndex !== -1) {
                journalMarkers[markerIndex].remove();
                journalMarkers.splice(markerIndex, 1);
            }
            updateJournalEntries();
            alert('Entry deleted successfully!');
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Error deleting entry: ' + error.message);
    }
}

// Utility functions
function getWeatherIcon(weather) {
    const icons = {
        'Sunny': '☀️',
        'Cloudy': '☁️',
        'Rainy': '🌧️',
        'Stormy': '⛈️',
        'Snowy': '🌨️',
        'Windy': '💨'
    };
    return icons[weather] || '🌤️';
}

function getMoodIcon(mood) {
    const icons = {
        'Happy': '😊',
        'Excited': '🤩',
        'Relaxed': '😌',
        'Tired': '😴',
        'Sad': '😢',
        'Anxious': '😰'
    };
    return icons[mood] || '😐';
}

// Export journal entries
function exportJournal() {
    const dataStr = JSON.stringify(journalEntries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportName = 'valencia_journal_' + new Date().toISOString().split('T')[0] + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
}

// Import journal entries
async function importJournal(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const text = await file.text();
        const importedEntries = JSON.parse(text);
        
        if (!Array.isArray(importedEntries)) {
            throw new Error('Invalid journal format');
        }
        
        // Validate each entry
        importedEntries.forEach(entry => {
            if (!entry.id || !entry.date || !entry.title || !entry.location) {
                throw new Error('Invalid entry format');
            }
        });
        
        // Clear existing entries and markers
        journalEntries = [];
        journalMarkers.forEach(marker => marker.remove());
        journalMarkers = [];
        
        // Add imported entries
        journalEntries = importedEntries;
        journalEntries.forEach(entry => {
            if (entry.location) {
                addMarkerToMap(entry);
            }
        });
        
        updateJournalEntries();
        alert('Journal imported successfully!');
    } catch (error) {
        console.error('Error importing journal:', error);
        alert('Error importing journal: ' + error.message);
    }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('journal-form');
    if (form) {
        form.addEventListener('submit', addJournalEntry);
    }
    
    const importInput = document.getElementById('import-journal');
    if (importInput) {
        importInput.addEventListener('change', importJournal);
    }
    
    loadJournalEntries();
    initJournalMap();
});
