// Auth0 configuration
const auth0Config = {
    domain: 'dev-mjqed8dmtwvb4k7g.us.auth0.com',
    clientId: 'SxEHt2Va5RCRtoYiQo0rk4URxriq6QN6',
    redirectUri: window.location.origin,
    audience: 'https://dev-mjqed8dmtwvb4k7g.us.auth0.com/api/v2/',
    scope: 'openid profile email'
};

let auth0Client = null;
let isAuthenticated = false;
let userProfile = null;

// Initialize Auth0 client
async function initAuth() {
    auth0Client = await createAuth0Client({
        domain: auth0Config.domain,
        client_id: auth0Config.clientId,
        redirect_uri: auth0Config.redirectUri,
        audience: auth0Config.audience,
        scope: auth0Config.scope
    });

    // Check if user was redirected after login
    if (window.location.search.includes('code=')) {
        await auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    isAuthenticated = await auth0Client.isAuthenticated();
    if (isAuthenticated) {
        userProfile = await auth0Client.getUser();
        updateUI();
    }
}

// Login function
async function login() {
    await auth0Client.loginWithRedirect({
        redirect_uri: window.location.origin
    });
}

// Logout function
async function logout() {
    await auth0Client.logout({
        returnTo: window.location.origin
    });
}

// Update UI based on authentication state
function updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');
    
    if (isAuthenticated && userProfile) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        userInfo.innerHTML = `
            <div class="flex items-center space-x-2">
                <img src="${userProfile.picture}" alt="Profile" class="w-8 h-8 rounded-full">
                <span class="text-sm font-medium">${userProfile.name}</span>
            </div>
        `;
        userInfo.style.display = 'block';
        
        // Enable protected features
        document.querySelectorAll('.protected-feature').forEach(el => {
            el.classList.remove('opacity-50', 'pointer-events-none');
        });
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        userInfo.style.display = 'none';
        
        // Disable protected features
        document.querySelectorAll('.protected-feature').forEach(el => {
            el.classList.add('opacity-50', 'pointer-events-none');
        });
    }
}

// Get access token for API calls
async function getAccessToken() {
    if (!auth0Client) {
        console.error('Auth0 client not initialized');
        return null;
    }
    return await auth0Client.getTokenSilently();
}

// API helpers
async function apiGet(endpoint) {
    const token = await getAccessToken();
    const response = await fetch(`/api/${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return await response.json();
}

async function apiPost(endpoint, data) {
    const token = await getAccessToken();
    const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}

// Initialize authentication when the page loads
document.addEventListener('DOMContentLoaded', initAuth);
