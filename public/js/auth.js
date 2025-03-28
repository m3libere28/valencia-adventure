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
    'https://personal-website-taupe-pi-67.vercel.app'
];

// API base URL based on environment
const API_BASE_URL = window.location.origin;

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

console.log('Auth0 configuration loaded:', { 
    ...auth0Config, 
    clientId: '***',
    redirectUri: auth0Config.redirectUri 
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
            client_id: auth0Config.clientId,
            redirect_uri: auth0Config.redirectUri,
            audience: auth0Config.audience,
            scope: auth0Config.scope
        });

        console.log('Auth0 client initialized');

        // Check if user was redirected after login
        if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
            console.log('Processing login callback');
            try {
                await auth0Client.handleRedirectCallback();
                window.history.replaceState({}, document.title, window.location.pathname);
                console.log('Login callback processed successfully');
            } catch (callbackError) {
                console.error('Error handling redirect callback:', callbackError);
            }
        }

        window.isAuthenticated = await auth0Client.isAuthenticated();
        console.log('Is authenticated:', window.isAuthenticated);
        
        if (window.isAuthenticated) {
            userProfile = await auth0Client.getUser();
            console.log('User profile loaded:', { ...userProfile, sub: '***' });
            updateUI();
            
            // Initialize protected features
            if (typeof initializeBudget === 'function') {
                console.log('Initializing budget feature');
                initializeBudget();
            }
        } else {
            console.log('User is not authenticated');
            updateUI();
        }
    } catch (error) {
        console.error('Auth initialization error:', error);
        updateUI(); // Still update UI to show login button
    }
}

// Login function
async function login() {
    try {
        console.log('Starting login process...');
        if (!auth0Client) {
            console.error('Auth0 client not initialized');
            return;
        }
        await auth0Client.loginWithRedirect({
            redirect_uri: window.location.origin
        });
        console.log('Redirecting to Auth0 login page...');
    } catch (error) {
        console.error('Login error:', error);
    }
}

// Logout function
async function logout() {
    try {
        console.log('Starting logout process...');
        if (!auth0Client) {
            console.error('Auth0 client not initialized');
            return;
        }
        await auth0Client.logout({
            returnTo: window.location.origin
        });
        console.log('Logged out successfully');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Update UI based on authentication state
function updateUI() {
    console.log('Updating UI for auth state:', window.isAuthenticated);
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');
    const protectedFeatures = document.querySelectorAll('.protected-feature');

    if (!loginBtn || !logoutBtn || !userInfo) {
        console.error('Required UI elements not found:', {
            loginBtn: !!loginBtn,
            logoutBtn: !!logoutBtn,
            userInfo: !!userInfo
        });
        return;
    }

    if (window.isAuthenticated && userProfile) {
        console.log('Showing authenticated UI');
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        userInfo.innerHTML = `
            <div class="flex items-center">
                <img src="${userProfile.picture}" alt="Profile" class="w-8 h-8 rounded-full">
                <span class="ml-2">${userProfile.name}</span>
            </div>
        `;
        userInfo.style.display = 'flex';
        
        protectedFeatures.forEach(feature => {
            feature.style.display = 'block';
        });
    } else {
        console.log('Showing unauthenticated UI');
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        userInfo.style.display = 'none';
        userInfo.innerHTML = '';
        
        protectedFeatures.forEach(feature => {
            feature.style.display = 'none';
        });
    }
}

// Get access token for API calls
async function getAccessToken() {
    try {
        if (!auth0Client) {
            throw new Error('Auth0 client not initialized');
        }
        console.log('Getting access token...');
        const token = await auth0Client.getTokenSilently();
        console.log('Access token obtained');
        return token;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

// API helpers
async function apiGet(endpoint) {
    try {
        console.log(`Making GET request to ${endpoint}...`);
        const token = await getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        console.log(`GET ${endpoint} successful:`, data);
        return data;
    } catch (error) {
        console.error(`API GET error (${endpoint}):`, error);
        throw error;
    }
}

async function apiPost(endpoint, data) {
    try {
        console.log(`Making POST request to ${endpoint}...`, data);
        const token = await getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const responseData = await response.json();
        console.log(`POST ${endpoint} successful:`, responseData);
        return responseData;
    } catch (error) {
        console.error(`API POST error (${endpoint}):`, error);
        throw error;
    }
}

// Initialize authentication when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Auth0...');
    initAuth().catch(error => {
        console.error('Error during Auth0 initialization:', error);
    });
});

// Export functions for use in other modules
window.login = login;
window.logout = logout;
window.apiGet = apiGet;
window.apiPost = apiPost;
