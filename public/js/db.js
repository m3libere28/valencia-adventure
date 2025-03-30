// Initialize Firebase and export for other modules
async function getFirebaseConfig() {
    try {
        console.log('Fetching Firebase config...');
        const response = await fetch('/api/firebase-config');
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Firebase config error:', errorData);
            throw new Error(`Failed to fetch Firebase config: ${errorData.error || response.statusText}`);
        }
        
        const config = await response.json();
        console.log('Firebase config received:', {
            ...config,
            apiKey: config.apiKey ? 'Set' : 'Not set'
        });
        return config;
    } catch (error) {
        console.error('Error fetching Firebase config:', error);
        throw error;
    }
}

// Initialize Firebase and wait for it to be ready
async function initializeFirebase() {
    try {
        console.log('Starting Firebase initialization...');
        
        // Check if Firebase is already initialized
        if (firebase.apps.length) {
            console.log('Firebase already initialized');
            return firebase.apps[0];
        }
        
        // Get Firebase config from server
        const firebaseConfig = await getFirebaseConfig();
        
        // Validate config
        const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
        const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Missing required Firebase config fields: ${missingFields.join(', ')}`);
        }
        
        // Initialize Firebase app
        console.log('Initializing Firebase app...');
        const app = firebase.initializeApp(firebaseConfig);
        
        // Initialize Firestore
        console.log('Initializing Firestore...');
        const db = firebase.firestore();
        
        // Enable offline persistence
        console.log('Enabling offline persistence...');
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
        console.log('Firebase initialization complete, dispatching ready event...');
        window.dispatchEvent(new CustomEvent('firebaseReady'));
        
        return app;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        // Show error to user
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #f44336; color: white; padding: 15px; border-radius: 4px; z-index: 9999;';
        errorDiv.textContent = `Firebase Error: ${error.message}`;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
        throw error;
    }
}

// Start initialization
console.log('Starting Firebase setup...');
initializeFirebase().catch(error => {
    console.error('Fatal Firebase initialization error:', error);
});
