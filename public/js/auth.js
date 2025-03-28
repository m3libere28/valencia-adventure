// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAzA0ldOdmvjXFrXYtQtt1q49VC41STcqY",
    authDomain: "valencia-adventure.firebaseapp.com",
    projectId: "valencia-adventure",
    storageBucket: "valencia-adventure.appspot.com",
    messagingSenderId: "778644270783",
    appId: "1:778644270783:web:83a34b7c80f176d4c8600a",
    measurementId: "G-4V1L50EECY"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// Initialize auth state
let isAuthenticated = false;
let currentUser = null;

// Function to handle login
async function login() {
    try {
        const result = await auth.signInWithPopup(provider);
        console.log('Login successful');
    } catch (error) {
        console.error('Login error:', error);
        alert('Failed to log in. Please try again.');
    }
}

// Function to handle logout
async function logout() {
    try {
        await auth.signOut();
        console.log('Logout successful');
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to log out. Please try again.');
    }
}

// Listen for auth state changes
auth.onAuthStateChanged((user) => {
    isAuthenticated = !!user;
    currentUser = user;
    
    // Update UI elements
    const protectedElements = document.querySelectorAll('.protected-feature');
    const loginPrompt = document.getElementById('login-prompt');
    const userInfo = document.getElementById('user-info');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');

    if (isAuthenticated) {
        // Show protected elements
        protectedElements.forEach(el => el.classList.remove('hidden'));
        if (loginPrompt) loginPrompt.classList.add('hidden');
        
        // Update user info
        if (userInfo) {
            userInfo.innerHTML = `
                <img src="${user.photoURL}" alt="Profile" class="w-8 h-8 rounded-full mr-2">
                <span class="text-gray-700">${user.displayName}</span>
            `;
            userInfo.classList.remove('hidden');
        }
        
        // Update buttons
        if (loginButton) loginButton.classList.add('hidden');
        if (logoutButton) logoutButton.classList.remove('hidden');

        console.log('User authenticated:', user.displayName);
    } else {
        // Hide protected elements
        protectedElements.forEach(el => el.classList.add('hidden'));
        if (loginPrompt) loginPrompt.classList.remove('hidden');
        
        // Hide user info
        if (userInfo) userInfo.classList.add('hidden');
        
        // Update buttons
        if (loginButton) loginButton.classList.remove('hidden');
        if (logoutButton) logoutButton.classList.add('hidden');

        console.log('User signed out');
    }

    // Dispatch event for other modules
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { isAuthenticated, user } 
    }));
});

// Export functions and state
window.login = login;
window.logout = logout;
window.isAuthenticated = isAuthenticated;
window.currentUser = currentUser;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Auth module loaded');
    
    // Set up event listeners for login/logout buttons
    const loginBtn = document.getElementById('login-button');
    const logoutBtn = document.getElementById('logout-button');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', login);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
