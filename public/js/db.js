// Initialize Firebase and export for other modules
const firebaseConfig = {
    apiKey: "AIzaSyAzA0ldOdmvjXFrXYtQtt1q49VC41STcqY",
    authDomain: "valencia-adventure.firebaseapp.com",
    projectId: "valencia-adventure",
    storageBucket: "valencia-adventure.appspot.com",
    messagingSenderId: "778644270783",
    appId: "1:778644270783:web:83a34b7c80f176d4c8600a"
};

// Initialize Firebase and wait for it to be ready
async function initializeFirebase() {
    try {
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
