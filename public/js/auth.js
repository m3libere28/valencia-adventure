// Auth0 configuration
const auth0Config = {
    domain: 'dev-mjqed8dmtwvb4k7g.us.auth0.com',
    clientId: 'SxEHt2Va5RCRtoYiQo0rk4URxriq6QN6',
    redirectUri: window.location.origin,
    audience: 'https://dev-mjqed8dmtwvb4k7g.us.auth0.com/api/v2/',
    scope: 'openid profile email'
};

// List of allowed origins for Auth0
const allowedOrigins = [
    'http://localhost:8000',
    'https://personal-website-taupe-pi-67.vercel.app',
    'https://m3libere28.github.io'
];

// API base URL based on environment
const API_BASE_URL = window.location.hostname === 'm3libere28.github.io'
    ? 'https://personal-website-taupe-pi-67.vercel.app'
    : window.location.origin;

// Validate current origin
if (!allowedOrigins.includes(window.location.origin)) {
    console.error('Warning: Current origin not in allowed list:', window.location.origin);
}

// Log environment info to help with debugging
console.log('Environment:', {
    origin: window.location.origin,
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    isAllowedOrigin: allowedOrigins.includes(window.location.origin),
    apiBaseUrl: API_BASE_URL
});

let auth0Client = null;
window.isAuthenticated = false;
let userProfile = null;

// Initialize Auth0 client
async function initAuth() {
    try {
        console.log('Initializing Auth0 client...');
        auth0Client = await createAuth0Client({
            domain: auth0Config.domain,
            clientId: auth0Config.clientId,
            authorizationParams: {
                redirect_uri: auth0Config.redirectUri,
                audience: auth0Config.audience,
                scope: auth0Config.scope
            },
            cacheLocation: 'localstorage'
        });

        // Check for authentication state on page load
        if (window.location.search.includes("code=")) {
            console.log('Auth code detected, handling redirect...');
            try {
                await auth0Client.handleRedirectCallback();
                window.history.replaceState({}, document.title, window.location.pathname);
                console.log('Redirect handled successfully');
            } catch (err) {
                console.error('Error handling redirect:', err);
                showError('Failed to complete authentication. Please try again.');
            }
        }

        // Update authentication state
        window.isAuthenticated = await auth0Client.isAuthenticated();
        if (window.isAuthenticated) {
            userProfile = await auth0Client.getUser();
            console.log('User is authenticated:', userProfile);
        }

        // Update UI and dispatch event
        updateUI();
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { isAuthenticated: window.isAuthenticated }
        }));

    } catch (err) {
        console.error('Auth initialization error:', err);
        showError('Failed to initialize authentication. Please refresh the page.');
    }
}

// Login function
async function login() {
    try {
        console.log('Starting login process...');
        await auth0Client.loginWithRedirect({
            authorizationParams: {
                redirect_uri: window.location.origin
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        showError('Failed to start login process. Please try again.');
    }
}

// Logout function
async function logout() {
    try {
        console.log('Starting logout process...');
        await auth0Client.logout({
            logoutParams: {
                returnTo: window.location.origin
            }
        });
        window.isAuthenticated = false;
        userProfile = null;
        updateUI();
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { isAuthenticated: false }
        }));
    } catch (err) {
        console.error('Logout error:', err);
        showError('Failed to logout. Please try again.');
    }
}

// Update UI based on authentication state
async function updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userSection = document.getElementById('userSection');
    const userName = document.getElementById('userName');
    const userPicture = document.getElementById('userPicture');

    try {
        const isAuthenticated = await auth0Client.isAuthenticated();
        console.log('Updating UI, authenticated:', isAuthenticated);

        if (isAuthenticated) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            userSection.style.display = 'flex';

            if (!userProfile) {
                userProfile = await auth0Client.getUser();
            }

            if (userProfile) {
                userName.textContent = userProfile.name || userProfile.email;
                if (userProfile.picture) {
                    userPicture.src = userProfile.picture;
                    userPicture.style.display = 'block';
                }
            }

            // Show protected content
            document.querySelectorAll('.protected-content').forEach(element => {
                element.style.display = 'block';
            });
        } else {
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
            userSection.style.display = 'none';
            userName.textContent = '';
            userPicture.style.display = 'none';

            // Hide protected content
            document.querySelectorAll('.protected-content').forEach(element => {
                element.style.display = 'none';
            });
        }
    } catch (err) {
        console.error('Error updating UI:', err);
        showError('Failed to update the page. Please refresh.');
    }
}

// Get access token for API calls
async function getAccessToken() {
    try {
        if (!auth0Client) {
            throw new Error('Auth0 client not initialized');
        }
        return await auth0Client.getTokenSilently();
    } catch (err) {
        console.error('Error getting access token:', err);
        showError('Failed to get access token. Please try logging in again.');
        return null;
    }
}

// API helpers
async function apiGet(endpoint) {
    try {
        const token = await getAccessToken();
        if (!token) return null;

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (err) {
        console.error('API GET error:', err);
        showError('Failed to fetch data. Please try again.');
        return null;
    }
}

async function apiPost(endpoint, data) {
    try {
        const token = await getAccessToken();
        if (!token) return null;

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (err) {
        console.error('API POST error:', err);
        showError('Failed to save data. Please try again.');
        return null;
    }
}

// Show error message
function showError(message) {
    const alert = document.getElementById('auth-alert');
    if (alert) {
        alert.textContent = message;
        alert.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4';
        alert.style.display = 'block';
        setTimeout(() => alert.style.display = 'none', 5000);
    } else {
        console.error('Error:', message);
    }
}

// Initialize authentication when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Auth0...');
    initAuth().catch(error => {
        console.error('Auth initialization error:', error);
        showError('Failed to initialize authentication. Please refresh the page.');
    });
});

// Make functions globally available
window.login = login;
window.logout = logout;
window.getAccessToken = getAccessToken;
