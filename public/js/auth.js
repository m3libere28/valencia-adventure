// Get Firebase Auth instance
const auth = firebase.auth();

// DOM Elements
const loginBtn = document.getElementById('login-button');
const logoutBtn = document.getElementById('logout-button');
const userSection = document.getElementById('user-info');
const userPicture = document.querySelector('#user-info img');
const userName = document.querySelector('#user-info span');
const protectedFeatures = document.querySelectorAll('.protected-feature');

// Debug logging
console.log('Auth script loaded');
console.log('Login button found:', !!loginBtn);
console.log('Logout button found:', !!logoutBtn);

// Login with Google
async function login() {
    console.log('Login function called');
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        console.log('Login successful:', result.user.email);
        showSuccess('Successfully logged in!');
    } catch (error) {
        console.error('Login error:', error);
        showError('Failed to login. Please try again.');
    }
}

// Logout
async function logout() {
    console.log('Logout function called');
    try {
        await auth.signOut();
        console.log('Logout successful');
        showSuccess('Successfully logged out!');
    } catch (error) {
        console.error('Logout error:', error);
        showError('Failed to logout. Please try again.');
    }
}

// Show error message
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded';
    alertDiv.innerHTML = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

// Show success message
function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded';
    alertDiv.innerHTML = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

// Update UI based on auth state
function updateUI(user) {
    console.log('Updating UI for user:', user ? user.email : 'logged out');
    
    const loginPrompt = document.getElementById('login-prompt');
    const budgetSection = document.getElementById('budget-section');
    const journalForm = document.getElementById('journal-form');
    const journalEntries = document.getElementById('journal-entries');
    const expenseForm = document.getElementById('expense-form');
    const budgetForm = document.getElementById('budget-form');

    if (user) {
        // User is signed in
        if (loginBtn) loginBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        if (userSection) userSection.classList.remove('hidden');
        if (loginPrompt) loginPrompt.classList.add('hidden');
        if (journalForm) journalForm.classList.remove('hidden');
        if (journalEntries) journalEntries.classList.remove('hidden');
        if (budgetSection) budgetSection.classList.remove('hidden');
        if (expenseForm) expenseForm.classList.remove('hidden');
        if (budgetForm) budgetForm.classList.remove('hidden');

        if (userPicture && user.photoURL) {
            userPicture.src = user.photoURL;
            userPicture.classList.remove('hidden');
        }
        if (userName && user.displayName) {
            userName.textContent = user.displayName;
        }
        protectedFeatures.forEach(el => el.classList.remove('hidden'));
    } else {
        // User is signed out
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
        if (userSection) userSection.classList.add('hidden');
        if (loginPrompt) loginPrompt.classList.remove('hidden');
        if (journalForm) journalForm.classList.add('hidden');
        if (journalEntries) journalEntries.classList.add('hidden');
        if (budgetSection) budgetSection.classList.add('hidden');
        if (expenseForm) expenseForm.classList.add('hidden');
        if (budgetForm) budgetForm.classList.add('hidden');

        if (userPicture) userPicture.classList.add('hidden');
        if (userName) userName.textContent = '';
        protectedFeatures.forEach(el => el.classList.add('hidden'));
    }

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: { 
            isAuthenticated: !!user,
            user: user ? {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            } : null
        }
    }));
}

// Listen for auth state changes
auth.onAuthStateChanged(user => {
    console.log('Auth state changed:', user ? user.email : 'logged out');
    updateUI(user);
});

// Add event listeners
if (loginBtn) loginBtn.addEventListener('click', login);
if (logoutBtn) logoutBtn.addEventListener('click', logout);
