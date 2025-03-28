// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBXF_Qv2YKJwsQVFpFJqLRt_QGLbxYXBWo",
    authDomain: "valencia-adventure.firebaseapp.com",
    projectId: "valencia-adventure",
    storageBucket: "valencia-adventure.appspot.com",
    messagingSenderId: "1098360410233",
    appId: "1:1098360410233:web:9a2f1a9b9f9b9f9b9f9b9f"
};

// Initialize Firebase before any other Firebase services
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// Global auth state
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
    } else {
        // Hide protected elements
        protectedElements.forEach(el => el.classList.add('hidden'));
        if (loginPrompt) loginPrompt.classList.remove('hidden');
        
        // Hide user info
        if (userInfo) userInfo.classList.add('hidden');
        
        // Update buttons
        if (loginButton) loginButton.classList.remove('hidden');
        if (logoutButton) logoutButton.classList.add('hidden');
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
    console.log('DOM loaded, initializing Firebase Auth...');
    
    // Set up event listeners for login/logout buttons
    const loginBtn = document.getElementById('login-button');
    const logoutBtn = document.getElementById('logout-button');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', window.login);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', window.logout);
    }
});
