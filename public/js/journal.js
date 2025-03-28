// Journal management
let journalEntries = [];

// Initialize when Firebase is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to be ready
    window.addEventListener('firebaseReady', () => {
        // Listen for auth state changes
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                await loadJournalEntries(user.uid);
            } else {
                resetJournalEntries();
            }
        });
    });

    // Add form submit handler
    const journalForm = document.getElementById('journal-form');
    if (journalForm) {
        journalForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const titleInput = document.getElementById('journal-title');
            const contentInput = document.getElementById('journal-content');
            const moodInput = document.getElementById('journal-mood');
            
            const title = titleInput ? titleInput.value : '';
            const content = contentInput ? contentInput.value : '';
            const mood = moodInput ? moodInput.value : '';
            
            if (!title || !content || !mood) {
                showError('Please fill in all fields');
                return;
            }
            
            await addJournalEntry(title, content, mood);
            
            // Reset form
            if (titleInput) titleInput.value = '';
            if (contentInput) contentInput.value = '';
            if (moodInput) moodInput.value = '';
        });
    }
});

// Helper functions
async function loadJournalEntries(userId) {
    try {
        const doc = await window.db.collection('journals').doc(userId).get();
        if (doc.exists) {
            journalEntries = doc.data().entries || [];
        } else {
            await window.db.collection('journals').doc(userId).set({ entries: [] });
            journalEntries = [];
        }
        updateJournalDisplay();
    } catch (error) {
        console.error('Error loading journal entries:', error);
        showError('Failed to load journal entries');
    }
}

async function addJournalEntry(title, content, mood) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            showError('Please login to add journal entries');
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

        // Update display
        updateJournalDisplay();
        showSuccess('Journal entry added successfully');
    } catch (error) {
        console.error('Error adding journal entry:', error);
        showError('Failed to add journal entry');
    }
}

function updateJournalDisplay() {
    const entriesDiv = document.getElementById('journal-entries');
    if (!entriesDiv) return;

    if (journalEntries.length === 0) {
        entriesDiv.innerHTML = '<p class="text-gray-500">No journal entries yet</p>';
        return;
    }

    // Sort entries by date, newest first
    const sortedEntries = [...journalEntries].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    entriesDiv.innerHTML = sortedEntries.map(entry => `
        <div class="bg-white shadow rounded-lg p-6 mb-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold">${entry.title}</h3>
                <button onclick="deleteJournalEntry('${entry.date}')" 
                        class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <p class="text-gray-600 mb-2">${entry.content}</p>
            <div class="flex justify-between items-center text-sm text-gray-500">
                <span>Mood: ${entry.mood}</span>
                <span>${new Date(entry.date).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

async function deleteJournalEntry(date) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            showError('Please login to delete journal entries');
            return;
        }

        const entry = journalEntries.find(e => e.date === date);
        if (!entry) return;

        // Remove from local array
        journalEntries = journalEntries.filter(e => e.date !== date);

        // Update Firestore
        await window.db.collection('journals').doc(user.uid).update({
            entries: firebase.firestore.FieldValue.arrayRemove(entry)
        });

        // Update display
        updateJournalDisplay();
        showSuccess('Journal entry deleted successfully');
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        showError('Failed to delete journal entry');
    }
}

function resetJournalEntries() {
    journalEntries = [];
    updateJournalDisplay();
}

// UI feedback functions
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded';
    alertDiv.innerHTML = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded';
    alertDiv.innerHTML = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}
