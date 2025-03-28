// Journal functionality
class JournalEntry {
    constructor(title, content, mood, date = new Date()) {
        this.id = Date.now().toString();
        this.title = title;
        this.content = content;
        this.mood = mood;
        this.date = date instanceof Date ? date : new Date(date);
        this.userId = null;
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

    static fromFirestore(doc) {
        const data = doc.data();
        const entry = new JournalEntry(
            data.title,
            data.content,
            data.mood,
            new Date(data.date)
        );
        entry.id = doc.id;
        entry.userId = data.userId;
        return entry;
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
        const user = firebase.auth().currentUser;
        if (!user) {
            showError('Please login to add journal entries');
            return null;
        }

        const entry = new JournalEntry(title, content, mood);
        entry.userId = user.uid;

        const docRef = await journalCollection.add(entry.toJSON());
        entry.id = docRef.id;
        journalEntries.push(entry);
        displayJournalEntries();
        showSuccess('Journal entry added successfully!');
        return entry;
    } catch (error) {
        console.error('Error adding journal entry:', error);
        showError('Failed to add journal entry. Please try again.');
        return null;
    }
}

async function loadJournalEntries() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            journalEntries = [];
            displayJournalEntries();
            return;
        }

        const snapshot = await journalCollection
            .where('userId', '==', user.uid)
            .orderBy('date', 'desc')
            .get();

        journalEntries = snapshot.docs.map(doc => JournalEntry.fromFirestore(doc));
        displayJournalEntries();
    } catch (error) {
        console.error('Error loading journal entries:', error);
        showError('Failed to load journal entries. Please try again.');
    }
}

async function deleteJournalEntry(entryId) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            showError('Please login to delete journal entries');
            return;
        }

        await journalCollection.doc(entryId).delete();
        journalEntries = journalEntries.filter(entry => entry.id !== entryId);
        displayJournalEntries();
        showSuccess('Journal entry deleted successfully!');
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        showError('Failed to delete journal entry. Please try again.');
    }
}

function displayJournalEntries() {
    const container = document.getElementById('journal-entries');
    if (!container) return;

    if (!firebase.auth().currentUser) {
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-600">Please login to view and add journal entries.</p>
            </div>
        `;
        return;
    }

    if (journalEntries.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-600">No journal entries yet. Start writing about your journey!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = journalEntries.map(entry => `
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6 transition-transform hover:scale-[1.02]">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-semibold">${entry.title}</h3>
                    <p class="text-gray-500 text-sm">${entry.date.toLocaleDateString()}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-2xl" title="${entry.mood}">${getMoodIcon(entry.mood)}</span>
                    <button onclick="deleteJournalEntry('${entry.id}')" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p class="text-gray-700 whitespace-pre-wrap">${entry.content}</p>
        </div>
    `).join('');
}

function getMoodIcon(mood) {
    const moodIcons = {
        'happy': '😊',
        'excited': '🎉',
        'neutral': '😐',
        'anxious': '😰',
        'sad': '😢'
    };
    return moodIcons[mood] || '😐';
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

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('journal-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = form.title.value;
            const content = form.content.value;
            const mood = form.mood.value;
            
            const entry = await addJournalEntry(title, content, mood);
            if (entry) {
                form.reset();
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
