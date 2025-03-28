// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAzA0ldOdmvjXFrXYtQtt1q49VC41STcqY",
    authDomain: "valencia-adventure.firebaseapp.com",
    projectId: "valencia-adventure",
    storageBucket: "valencia-adventure.appspot.com",
    messagingSenderId: "778644270783",
    appId: "1:778644270783:web:83a34b7c80f176d4c8600a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const loginBtn = document.getElementById('login-button');
const logoutBtn = document.getElementById('logout-button');
const userSection = document.getElementById('user-info');
const userPicture = document.querySelector('#user-info img');
const userName = document.querySelector('#user-info span');
const protectedFeatures = document.querySelectorAll('.protected-feature');

// Login with Google
async function login() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
    } catch (error) {
        console.error('Login error:', error);
        showAuthError('Failed to login. Please try again.');
    }
}

// Logout
async function logout() {
    try {
        await auth.signOut();
    } catch (error) {
        console.error('Logout error:', error);
        showAuthError('Failed to logout. Please try again.');
    }
}

// Show auth error
function showAuthError(message) {
    const alertDiv = document.getElementById('auth-alert');
    if (alertDiv) {
        alertDiv.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span class="block sm:inline">${message}</span>
                <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <svg onclick="this.parentElement.parentElement.remove()" 
                         class="fill-current h-6 w-6 text-red-500 cursor-pointer" 
                         role="button" 
                         xmlns="http://www.w3.org/2000/svg" 
                         viewBox="0 0 20 20">
                        <title>Close</title>
                        <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                    </svg>
                </span>
            </div>
        `;
        alertDiv.classList.remove('hidden');
        setTimeout(() => alertDiv.classList.add('hidden'), 5000);
    }
}

// Update UI based on auth state
function updateUI(user) {
    if (user) {
        // User is signed in
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        userSection.classList.remove('hidden');
        if (user.photoURL) {
            userPicture.src = user.photoURL;
            userPicture.classList.remove('hidden');
        }
        if (user.displayName) {
            userName.textContent = user.displayName;
        }
        protectedFeatures.forEach(el => el.classList.remove('hidden'));
    } else {
        // User is signed out
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        userSection.classList.add('hidden');
        userPicture.classList.add('hidden');
        userName.textContent = '';
        protectedFeatures.forEach(el => el.classList.add('hidden'));
    }
}

// Listen for auth state changes
auth.onAuthStateChanged(user => {
    console.log('Auth state changed:', user ? 'logged in' : 'logged out');
    updateUI(user);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: { 
            isAuthenticated: !!user,
            user 
        }
    }));
});

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    if (loginBtn) loginBtn.addEventListener('click', login);
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
});
