// Journal map instance
let journalMap = null;
let journalMarkers = [];

// Get the API base URL based on environment
const API_BASE_URL = window.location.hostname === 'm3libere28.github.io'
    ? 'https://personal-website-taupe-pi-67.vercel.app'
    : window.location.origin;

// Initialize the journal feature
async function initializeJournal() {
    console.log('Initializing journal feature...');
    
    // Check if user is authenticated
    if (!window.isAuthenticated) {
        console.log('User not authenticated, hiding journal section');
        document.getElementById('journal').style.display = 'none';
        return;
    }

    console.log('User is authenticated, showing journal section');
    document.getElementById('journal').style.display = 'block';

    // Initialize map
    journalMap = L.map('journal-map').setView([39.4699, -0.3763], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' OpenStreetMap contributors'
    }).addTo(journalMap);

    // Load existing entries
    await loadJournalEntries();

    // Set up form submission
    const form = document.getElementById('journal-form');
    form.addEventListener('submit', handleJournalSubmit);
}

// Load journal entries from the server
async function loadJournalEntries() {
    try {
        if (!window.isAuthenticated) {
            console.log('User not authenticated, skipping journal load');
            return;
        }

        const token = await window.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/journal/entries`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const entries = await response.json();
            displayJournalEntries(entries);
        } else {
            throw new Error('Failed to load journal entries');
        }
    } catch (error) {
        console.error('Error loading journal entries:', error);
    }
}

function displayJournalEntries(entries) {
    const entriesContainer = document.getElementById('journal-entries');
    if (!entriesContainer) return;

    entriesContainer.innerHTML = entries.length ? '' : '<p class="text-gray-600">No entries yet. Start writing!</p>';
    
    entries.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.className = 'journal-entry bg-white rounded-lg shadow-md p-6 mb-4';
        entryElement.innerHTML = `
            <h4 class="text-xl font-semibold mb-2">${entry.title}</h4>
            <div class="text-gray-600 mb-3">${new Date(entry.date).toLocaleDateString()}</div>
            <p class="text-gray-700">${entry.content}</p>
        `;
        entriesContainer.appendChild(entryElement);
    });
}

// Update the UI with journal entries
function updateJournalEntries() {
    // Clear existing markers
    journalMarkers.forEach(marker => marker.remove());
    journalMarkers = [];

    // Clear entries grid
    const entriesGrid = document.getElementById('journal-entries');
    entriesGrid.innerHTML = '';

    // Sort entries by date (newest first)
    journalEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Add entries to map and grid
    journalEntries.forEach(entry => {
        // Add marker to map
        if (entry.location && entry.location.lat && entry.location.lng) {
            const marker = L.marker([entry.location.lat, entry.location.lng])
                .bindPopup(`
                    <h3 class="font-semibold">${entry.title}</h3>
                    <p class="text-sm text-gray-600">${entry.date}</p>
                    <p>${entry.content}</p>
                `);
            marker.addTo(journalMap);
            journalMarkers.push(marker);
        }

        // Add entry to grid
        const entryElement = document.createElement('div');
        entryElement.className = 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow';
        entryElement.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-semibold">${entry.title}</h3>
                    <p class="text-sm text-gray-600">${new Date(entry.date).toLocaleDateString()}</p>
                </div>
                <button onclick="deleteJournalEntry('${entry._id}')" 
                        class="text-red-500 hover:text-red-700 transition-colors">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <p class="mb-4">${entry.content}</p>
            ${entry.mood ? `<p class="text-gray-600">Mood: ${entry.mood}</p>` : ''}
            ${entry.weather ? `<p class="text-gray-600">Weather: ${entry.weather}</p>` : ''}
        `;
        entriesGrid.appendChild(entryElement);
    });

    // Center map on markers if any exist
    if (journalMarkers.length > 0) {
        const group = L.featureGroup(journalMarkers);
        journalMap.fitBounds(group.getBounds().pad(0.1));
    }
}

// Handle journal form submission
async function handleJournalSubmit(event) {
    event.preventDefault();
    
    try {
        const form = event.target;
        const token = await window.getAccessToken();
        
        if (!token) {
            throw new Error('No access token available');
        }

        const formData = {
            date: form.date.value,
            title: form.title.value,
            content: form.content.value,
            mood: form.mood.value,
            weather: form.weather.value,
            location: {
                lat: parseFloat(form.latitude.value),
                lng: parseFloat(form.longitude.value)
            }
        };

        const response = await fetch(`${API_BASE_URL}/api/journal/entries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            form.reset();
            await loadJournalEntries();
            showSuccess('Journal entry added successfully!');
        } else {
            throw new Error('Failed to add journal entry');
        }
    } catch (error) {
        console.error('Error adding journal entry:', error);
        showError('Failed to add journal entry. Please try again.');
    }
}

// Delete a journal entry
async function deleteJournalEntry(entryId) {
    if (!confirm('Are you sure you want to delete this entry?')) {
        return;
    }

    try {
        const token = await window.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const response = await fetch(`${API_BASE_URL}/api/journal/entries/${entryId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            await loadJournalEntries();
            showSuccess('Journal entry deleted successfully!');
        } else {
            throw new Error('Failed to delete journal entry');
        }
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        showError('Failed to delete journal entry. Please try again.');
    }
}

// Show success message
function showSuccess(message) {
    const alert = document.getElementById('journal-alert');
    alert.textContent = message;
    alert.className = 'bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4';
    alert.style.display = 'block';
    setTimeout(() => alert.style.display = 'none', 3000);
}

// Show error message
function showError(message) {
    const alert = document.getElementById('journal-alert');
    alert.textContent = message;
    alert.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4';
    alert.style.display = 'block';
    setTimeout(() => alert.style.display = 'none', 3000);
}

// Listen for auth state changes
window.addEventListener('authStateChanged', (event) => {
    console.log('Auth state changed:', event.detail);
    if (event.detail.isAuthenticated) {
        initializeJournal();
    } else {
        if (journalMap) {
            journalMap.remove();
            journalMap = null;
        }
        document.getElementById('journal').style.display = 'none';
    }
});

// Journal management
let journalEntries = [];

// Initialize journal functionality
document.addEventListener('DOMContentLoaded', () => {
    const journalForm = document.getElementById('journal-form');
    if (journalForm) {
        journalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!window.isAuthenticated) {
                console.error('User not authenticated');
                alert('Please log in to add journal entries.');
                return;
            }
            
            const title = document.getElementById('entry-title')?.value;
            const content = document.getElementById('entry-content')?.value;
            
            if (!title || !content) {
                alert('Please fill in both title and content.');
                return;
            }
            
            const entry = {
                title,
                content,
                date: new Date().toISOString()
            };
            
            journalEntries.push(entry);
            displayJournalEntries();
            journalForm.reset();
        });
    }
});

function displayJournalEntries() {
    const entriesContainer = document.getElementById('journal-entries');
    if (!entriesContainer) return;

    entriesContainer.innerHTML = journalEntries.length ? '' : '<p class="text-gray-600">No entries yet. Start writing!</p>';
    
    journalEntries.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.className = 'journal-entry bg-white rounded-lg shadow-md p-6 mb-4';
        entryElement.innerHTML = `
            <h4 class="text-xl font-semibold mb-2">${entry.title}</h4>
            <div class="text-gray-600 mb-3">${new Date(entry.date).toLocaleDateString()}</div>
            <p class="text-gray-700">${entry.content}</p>
        `;
        entriesContainer.appendChild(entryElement);
    });
}

// Export functionality
window.exportJournal = function() {
    if (journalEntries.length === 0) {
        alert('No entries to export.');
        return;
    }
    
    const blob = new Blob([JSON.stringify(journalEntries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'journal_entries.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
