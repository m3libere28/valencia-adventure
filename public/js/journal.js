// Journal functionality
class JournalEntry {
    constructor(title, content, mood, date = new Date()) {
        this.id = Date.now().toString();
        this.title = title;
        this.content = content;
        this.mood = mood;
        this.date = date instanceof Date ? date : new Date(date);
        this.userId = null; // Will be set when saving
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            mood: this.mood,
            date: this.date.toISOString(),
            userId: this.userId
        };
    }
}

// Initialize Firestore
const db = firebase.firestore();
const journalCollection = db.collection('journal_entries');

// Journal state
let journalEntries = [];

// CRUD operations
async function addJournalEntry(title, content, mood) {
    try {
        const entry = new JournalEntry(title, content, mood);
        entry.userId = firebase.auth().currentUser?.uid;

        if (!entry.userId) {
            throw new Error('User must be logged in to add entries');
        }

        const docRef = await journalCollection.add(entry.toJSON());
        entry.id = docRef.id;
        journalEntries.push(entry);
        displayJournalEntries();
        return entry;
    } catch (error) {
        console.error('Error adding journal entry:', error);
        throw error;
    }
}

async function deleteJournalEntry(entryId) {
    try {
        await journalCollection.doc(entryId).delete();
        journalEntries = journalEntries.filter(entry => entry.id !== entryId);
        displayJournalEntries();
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        throw error;
    }
}

async function loadJournalEntries() {
    try {
        const userId = firebase.auth().currentUser?.uid;
        if (!userId) return;

        const snapshot = await journalCollection.where('userId', '==', userId).get();
        journalEntries = snapshot.docs.map(doc => {
            const data = doc.data();
            const entry = new JournalEntry(data.title, data.content, data.mood, new Date(data.date));
            entry.id = doc.id;
            entry.userId = data.userId;
            return entry;
        });
        displayJournalEntries();
    } catch (error) {
        console.error('Error loading journal entries:', error);
        throw error;
    }
}

function displayJournalEntries() {
    const container = document.getElementById('journal-entries');
    if (!container) return;

    if (journalEntries.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No journal entries yet.</p>';
        return;
    }

    container.innerHTML = journalEntries
        .sort((a, b) => b.date - a.date)
        .map(entry => `
            <div class="bg-white rounded-lg shadow-md p-4 mb-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-lg font-semibold">${entry.title}</h3>
                    <button onclick="deleteJournalEntry('${entry.id}')" 
                            class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <p class="text-gray-600 mb-2">${entry.content}</p>
                <div class="flex justify-between items-center text-sm text-gray-500">
                    <span>${entry.date.toLocaleDateString()}</span>
                    <span class="flex items-center">
                        <i class="fas fa-${getMoodIcon(entry.mood)} mr-1"></i>
                        ${entry.mood}
                    </span>
                </div>
            </div>
        `).join('');
}

function getMoodIcon(mood) {
    const icons = {
        'Happy': 'smile',
        'Sad': 'frown',
        'Excited': 'star',
        'Tired': 'moon',
        'Neutral': 'meh'
    };
    return icons[mood] || 'comment';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('journal-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('entry-title').value;
            const content = document.getElementById('entry-content').value;
            const mood = document.getElementById('entry-mood').value;
            
            try {
                await addJournalEntry(title, content, mood);
                form.reset();
            } catch (error) {
                alert('Failed to add journal entry. Please try again.');
            }
        });
    }

    // Listen for auth state changes
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadJournalEntries();
        } else {
            journalEntries = [];
            displayJournalEntries();
        }
    });
});
