// Initialize Firebase and export for other modules
async function getFirebaseConfig() {
    try {
        const response = await fetch('/api/firebase-config');
        if (!response.ok) {
            throw new Error('Failed to fetch Firebase config');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching Firebase config:', error);
        throw error;
    }
}

// Initialize Firebase and wait for it to be ready
async function initializeFirebase() {
    try {
        // Get Firebase config from server
        const firebaseConfig = await getFirebaseConfig();
        
        // Initialize Firebase app
        const app = firebase.initializeApp(firebaseConfig);
        
        // Initialize Firestore
        const db = firebase.firestore();
        
        // Enable offline persistence
        await db.enablePersistence()
            .catch((err) => {
                if (err.code == 'failed-precondition') {
                    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
                } else if (err.code == 'unimplemented') {
                    console.warn('The current browser does not support offline persistence');
                }
            });

        // Export for other modules
        window.firebaseApp = app;
        window.db = db;

        // Dispatch event when Firebase is ready
        window.dispatchEvent(new CustomEvent('firebaseReady'));
        
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
}

// Start initialization
initializeFirebase();
