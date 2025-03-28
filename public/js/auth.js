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
            cacheLocation: 'localstorage',
            useRefreshTokens: true
        });

        console.log('Auth0 client initialized');

        // Check for authentication state on page load
        if (window.location.search.includes("code=") || window.location.search.includes("error=")) {
            console.log('Auth code or error detected, handling redirect...');
            try {
                await auth0Client.handleRedirectCallback();
                window.history.replaceState({}, document.title, window.location.pathname);
                console.log('Redirect handled successfully');
            } catch (err) {
                console.error('Error handling redirect:', err);
                showError('Failed to complete authentication. Please try again.');
                return;
            }
        }

        // Update authentication state
        window.isAuthenticated = await auth0Client.isAuthenticated();
        if (window.isAuthenticated) {
            userProfile = await auth0Client.getUser();
            console.log('User is authenticated:', userProfile);
        } else {
            console.log('User is not authenticated');
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
    if (!auth0Client) {
        console.error('Auth0 client not initialized');
        showError('Authentication system not ready. Please refresh the page.');
        return;
    }
    
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
    } catch (err) {
        console.error('Logout error:', err);
        showError('Failed to logout. Please try again.');
    }
}

// Update UI based on authentication state
function updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userSection = document.getElementById('userSection');
    const userPicture = document.getElementById('userPicture');
    const userName = document.getElementById('userName');
    
    if (window.isAuthenticated && userProfile) {
        // Hide login button
        if (loginBtn) loginBtn.classList.add('hidden');
        
        // Show user section
        if (userSection) userSection.classList.remove('hidden');
        if (userSection) userSection.classList.add('flex');
        
        // Show logout button
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        
        // Update user info
        if (userPicture) {
            userPicture.src = userProfile.picture;
            userPicture.classList.remove('hidden');
        }
        if (userName) userName.textContent = userProfile.name;
        
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

// Get access token for API calls
async function getAccessToken() {
    try {
        if (!auth0Client) {
            throw new Error('Auth0 client not initialized');
        }
        return await auth0Client.getTokenSilently();
    } catch (err) {
        console.error('Error getting access token:', err);
        throw err;
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

// Initialize authentication when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Auth0...');
    initAuth().catch(error => {
        console.error('Failed to initialize Auth0:', error);
        showError('Failed to initialize authentication system.');
    });
});

// Make functions globally available
window.login = login;
window.logout = logout;
window.getAccessToken = getAccessToken;
