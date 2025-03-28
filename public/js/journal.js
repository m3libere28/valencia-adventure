// Get Firestore instance
const db = firebase.firestore();

// Journal management
let journalEntries = [];

// Initialize journal when auth state changes
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        loadJournalEntries(user.uid);
    } else {
        resetJournalEntries();
    }
});

async function loadJournalEntries(userId) {
    try {
        const doc = await db.collection('journals').doc(userId).get();
        if (doc.exists) {
            journalEntries = doc.data().entries || [];
        } else {
            // Create new journal document for user
            await db.collection('journals').doc(userId).set({ entries: [] });
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

async function addJournalEntry(event) {
    const user = firebase.auth().currentUser;
    if (!user) {
        showError('Please login to add journal entries');
        return;
    }

    const form = event.target;
    const entry = {
        title: form.title.value,
        content: form.content.value,
        mood: form.mood.value,
        date: new Date().toISOString()
    };

    try {
        await db.collection('journals').doc(user.uid).update({
            entries: firebase.firestore.FieldValue.arrayUnion(entry)
        });
        journalEntries.push(entry);
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
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-semibold mb-1">${entry.title}</h3>
                        <p class="text-sm text-gray-500">${new Date(entry.date).toLocaleString()}</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-2xl" title="${entry.mood}">${getMoodEmoji(entry.mood)}</span>
                        <button onclick="deleteJournalEntry('${entry.date}')" class="text-red-500 hover:text-red-700">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="text-gray-700 whitespace-pre-wrap">${entry.content}</p>
            </div>
        `).join('');
}

function getMoodEmoji(mood) {
    const moodEmojis = {
        happy: '😊',
        excited: '🎉',
        neutral: '😐',
        anxious: '😰',
        sad: '😢'
    };
    return moodEmojis[mood] || '😐';
}

async function deleteJournalEntry(date) {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;

    const user = firebase.auth().currentUser;
    if (!user) {
        showError('Please login to delete journal entries');
        return;
    }

    try {
        const entry = journalEntries.find(e => e.date === date);
        if (!entry) return;

        await db.collection('journals').doc(user.uid).update({
            entries: firebase.firestore.FieldValue.arrayRemove(entry)
        });

        journalEntries = journalEntries.filter(e => e.date !== date);
        updateJournalDisplay();
        showSuccess('Journal entry deleted successfully!');
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        showError('Failed to delete journal entry. Please try again.');
    }
}

function exportJournal() {
    if (!journalEntries.length) {
        showError('No journal entries to export');
        return;
    }

    const exportData = journalEntries
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(entry => `
# ${entry.title}
Date: ${new Date(entry.date).toLocaleString()}
Mood: ${entry.mood}

${entry.content}
-------------------
        `.trim())
        .join('\n\n');

    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal_export_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

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

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    const journalForm = document.getElementById('journal-form');
    if (journalForm) {
        journalForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await addJournalEntry(event);
            journalForm.reset();
        });
    }
});
