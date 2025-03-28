// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAzA0ldOdmvjXFrXYtQtt1q49VC41STcqY",
    authDomain: "valencia-adventure.firebaseapp.com",
    projectId: "valencia-adventure",
    storageBucket: "valencia-adventure.firebasestorage.app",
    messagingSenderId: "778644270783",
    appId: "1:778644270783:web:83a34b7c80f176d4c8600a",
    measurementId: "G-4V1L50EECY"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Global auth state
window.isAuthenticated = false;
window.currentUser = null;

// Initialize authentication
function initAuth() {
    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
        window.isAuthenticated = !!user;
        window.currentUser = user;
        updateUI();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { 
                isAuthenticated: window.isAuthenticated,
                user: window.currentUser
            }
        }));

        if (user) {
            console.log('User logged in:', user.displayName);
        } else {
            console.log('User logged out');
        }
    });
}

// Login function
window.login = async function() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
    } catch (error) {
        console.error('Login error:', error);
        showError('Failed to login. Please try again.');
    }
};

// Logout function
window.logout = async function() {
    try {
        await auth.signOut();
    } catch (error) {
        console.error('Logout error:', error);
        showError('Failed to logout. Please try again.');
    }
};

// Get access token for API calls
window.getAccessToken = async function() {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('No user logged in');
        }
        return await user.getIdToken();
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
};

// Update UI based on authentication state
function updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userSection = document.getElementById('userSection');
    const userPicture = document.getElementById('userPicture');
    const userName = document.getElementById('userName');
    
    if (window.isAuthenticated && window.currentUser) {
        // Hide login button
        if (loginBtn) loginBtn.classList.add('hidden');
        
        // Show user section
        if (userSection) userSection.classList.remove('hidden');
        if (userSection) userSection.classList.add('flex');
        
        // Show logout button
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        
        // Update user info
        if (userPicture) {
            userPicture.src = window.currentUser.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(window.currentUser.displayName);
            userPicture.classList.remove('hidden');
        }
        if (userName) userName.textContent = window.currentUser.displayName;
        
        // Show protected features
        document.querySelectorAll('.protected-feature').forEach(el => {
            el.classList.remove('hidden');
        });
    } else {
        // Show login button
        if (loginBtn) loginBtn.classList.remove('hidden');
        
        // Hide user section
        if (userSection) userSection.classList.add('hidden');
        if (userSection) userSection.classList.remove('flex');
        
        // Hide logout button
        if (logoutBtn) logoutBtn.classList.add('hidden');
        
        // Clear user info
        if (userPicture) {
            userPicture.src = '';
            userPicture.classList.add('hidden');
        }
        if (userName) userName.textContent = '';
        
        // Hide protected features
        document.querySelectorAll('.protected-feature').forEach(el => {
            el.classList.add('hidden');
        });
    }
}

// Show error message
function showError(message) {
    const alertDiv = document.getElementById('auth-alert');
    if (alertDiv) {
        alertDiv.textContent = message;
        alertDiv.classList.remove('hidden');
        alertDiv.classList.add('bg-red-100', 'border', 'border-red-400', 'text-red-700', 'px-4', 'py-3', 'rounded');
        setTimeout(() => {
            alertDiv.classList.add('hidden');
        }, 5000);
    } else {
        console.error('Error:', message);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Firebase Auth...');
    initAuth();
    
    // Set up event listeners for login/logout buttons
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', window.login);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', window.logout);
    }
});
