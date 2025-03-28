// Journal map instance
let journalMap = null;
let journalMarkers = [];

// Get the API base URL based on environment
const API_BASE_URL = window.location.hostname === 'm3libere28.github.io'
    ? 'https://personal-website-taupe-pi-67.vercel.app'
    : window.location.origin;

// Initialize Firestore
const db = firebase.firestore();

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

// Load journal entries from Firestore
async function loadJournalEntries() {
    if (!window.isAuthenticated || !window.currentUser) {
        console.log('User not authenticated, skipping journal load');
        return;
    }

    try {
        const snapshot = await db.collection('users')
            .doc(window.currentUser.uid)
            .collection('journal')
            .orderBy('createdAt', 'desc')
            .get();

        const entries = [];
        snapshot.forEach(doc => {
            entries.push({
                id: doc.id,
                ...doc.data()
            });
        });

        displayJournalEntries(entries);
    } catch (error) {
        console.error('Error loading journal entries:', error);
        alert('Failed to load journal entries. Please try again.');
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
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="text-xl font-semibold mb-2">${entry.title}</h4>
                    <div class="text-gray-600 mb-3">${new Date(entry.date).toLocaleDateString()}</div>
                    <p class="text-gray-700">${entry.content}</p>
                </div>
                <button onclick="deleteJournalEntry('${entry.id}')" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        entriesContainer.appendChild(entryElement);
    });
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

        // Add entry to Firestore
        await db.collection('users')
            .doc(window.currentUser.uid)
            .collection('journal')
            .add({
                title: formData.title,
                content: formData.content,
                date: formData.date,
                mood: formData.mood,
                weather: formData.weather,
                location: formData.location,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        // Clear form
        form.reset();

        // Show success message
        alert('Journal entry saved successfully!');

        // Refresh entries
        loadJournalEntries();
    } catch (error) {
        console.error('Error adding journal entry:', error);
        alert('Failed to add journal entry. Please try again.');
    }
}

// Delete journal entry
window.deleteJournalEntry = async function(entryId) {
    if (!window.isAuthenticated || !window.currentUser) {
        alert('Please log in to delete entries.');
        return;
    }

    if (!confirm('Are you sure you want to delete this entry?')) {
        return;
    }

    try {
        await db.collection('users')
            .doc(window.currentUser.uid)
            .collection('journal')
            .doc(entryId)
            .delete();

        // Refresh entries
        loadJournalEntries();
        alert('Entry deleted successfully!');
    } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry. Please try again.');
    }
};

// Export functionality
window.exportJournal = async function() {
    if (!window.isAuthenticated || !window.currentUser) {
        alert('Please log in to export entries.');
        return;
    }

    try {
        const snapshot = await db.collection('users')
            .doc(window.currentUser.uid)
            .collection('journal')
            .orderBy('createdAt', 'desc')
            .get();

        const entries = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            entries.push({
                id: doc.id,
                title: data.title,
                content: data.content,
                date: data.date
            });
        });

        if (entries.length === 0) {
            alert('No entries to export.');
            return;
        }

        const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `journal_entries_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting entries:', error);
        alert('Failed to export entries. Please try again.');
    }
};

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
            
            try {
                // Add entry to Firestore
                await db.collection('users')
                    .doc(window.currentUser.uid)
                    .collection('journal')
                    .add({
                        title,
                        content,
                        date: new Date().toISOString(),
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                
                // Clear form
                journalForm.reset();
                
                // Show success message
                alert('Journal entry saved successfully!');
                
                // Refresh entries
                loadJournalEntries();
            } catch (error) {
                console.error('Error saving journal entry:', error);
                alert('Failed to save journal entry. Please try again.');
            }
        });
    }

    // Listen for auth state changes
    window.addEventListener('authStateChanged', (e) => {
        if (e.detail.isAuthenticated) {
            loadJournalEntries();
        } else {
            // Clear entries when logged out
            displayJournalEntries([]);
        }
    });

    // Initial load if authenticated
    if (window.isAuthenticated) {
        loadJournalEntries();
    }
});
