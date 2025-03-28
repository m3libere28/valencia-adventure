// Journal management
let journalEntries = [];

// Initialize journal when auth state changes
document.addEventListener('DOMContentLoaded', () => {
    // Listen for auth state changes
    window.addEventListener('authStateChanged', async (event) => {
        const { isAuthenticated, user } = event.detail;
        console.log('Auth state changed in journal.js:', isAuthenticated, user);
        
        try {
            if (isAuthenticated && user) {
                await loadJournalEntries(user.uid);
            } else {
                resetJournalEntries();
            }
        } catch (error) {
            console.error('Error handling auth state change:', error);
        }
    });

    // Add form submit handler
    const journalForm = document.getElementById('journal-form');
    if (journalForm) {
        journalForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await addJournalEntry();
        });
    }
});

// Helper functions
async function loadJournalEntries(userId) {
    console.log('Loading journal entries for user:', userId);
    try {
        const doc = await window.db.collection('journals').doc(userId).get();
        if (doc.exists) {
            journalEntries = doc.data().entries || [];
        } else {
            // Create new journal document for user
            await window.db.collection('journals').doc(userId).set({ entries: [] });
            journalEntries = [];
        }
        updateJournalDisplay();
    } catch (error) {
        console.error('Error loading journal entries:', error);
        showError('Failed to load journal entries. Please try again.');
    }
}

function resetJournalEntries() {
    journalEntries = [];
    updateJournalDisplay();
}

async function addJournalEntry() {
    const user = firebase.auth().currentUser;
    if (!user) {
        showError('Please login to add journal entries');
        return;
    }

    try {
        const title = document.getElementById('journal-title').value.trim();
        const content = document.getElementById('journal-content').value.trim();
        const mood = document.getElementById('journal-mood').value;

        if (!title || !content) {
            showError('Please fill in all required fields');
            return;
        }

        const entry = {
            title,
            content,
            mood,
            date: new Date().toISOString(),
            userId: user.uid
        };

        // Add to local array
        journalEntries.push(entry);

        // Update Firestore
        await window.db.collection('journals').doc(user.uid).update({
            entries: firebase.firestore.FieldValue.arrayUnion(entry)
        });

        // Reset form and update display
        document.getElementById('journal-form').reset();
        updateJournalDisplay();
        showSuccess('Journal entry added successfully!');
    } catch (error) {
        console.error('Error adding journal entry:', error);
        showError('Failed to add journal entry. Please try again.');
    }
}

function updateJournalDisplay() {
    const entriesContainer = document.getElementById('journal-entries');
    if (!entriesContainer) return;

    if (!journalEntries.length) {
        entriesContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No journal entries yet</p>';
        return;
    }

    entriesContainer.innerHTML = journalEntries
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(entry => `
            <div class="bg-white rounded-lg shadow-md p-6 mb-4">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-semibold">${entry.title}</h3>
                        <p class="text-gray-500 text-sm">${new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                    <span class="text-2xl">${entry.mood}</span>
                </div>
                <p class="text-gray-700 whitespace-pre-wrap">${entry.content}</p>
                <button onclick="deleteJournalEntry('${entry.date}')" 
                        class="mt-4 text-red-600 hover:text-red-800">
                    Delete Entry
                </button>
            </div>
        `).join('');
}

async function deleteJournalEntry(date) {
    const user = firebase.auth().currentUser;
    if (!user) {
        showError('Please login to delete entries');
        return;
    }

    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
        const entry = journalEntries.find(e => e.date === date);
        if (!entry) return;

        // Remove from local array
        journalEntries = journalEntries.filter(e => e.date !== date);

        // Update Firestore
        await window.db.collection('journals').doc(user.uid).update({
            entries: firebase.firestore.FieldValue.arrayRemove(entry)
        });

        updateJournalDisplay();
        showSuccess('Journal entry deleted successfully!');
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        showError('Failed to delete journal entry. Please try again.');
    }
}

function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded shadow-lg z-50';
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50';
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

// Make deleteJournalEntry available globally
window.deleteJournalEntry = deleteJournalEntry;
