// Initialize Firebase and export for other modules
window.firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyAzA0ldOdmvjXFrXYtQtt1q49VC41STcqY",
    authDomain: "valencia-adventure.firebaseapp.com",
    projectId: "valencia-adventure",
    storageBucket: "valencia-adventure.appspot.com",
    messagingSenderId: "778644270783",
    appId: "1:778644270783:web:83a34b7c80f176d4c8600a"
});

// Initialize Firestore and export for other modules
window.db = window.firebaseApp.firestore();
