const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();
const { auth } = require('express-openid-connect');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Debug middleware for Firebase config
app.use((req, res, next) => {
    if (req.path === '/api/firebase-config') {
        console.log('Firebase config request received');
        console.log('Environment variables:', {
            FIREBASE_API_KEY: process.env.FIREBASE_API_KEY ? 'Set' : 'Not set',
            FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN ? 'Set' : 'Not set',
            FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set',
            FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET ? 'Set' : 'Not set',
            FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Not set',
            FIREBASE_APP_ID: process.env.FIREBASE_APP_ID ? 'Set' : 'Not set'
        });
    }
    next();
});

// Auth0 configuration
const config = {
    authRequired: false,
    auth0Logout: true,
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    secret: process.env.AUTH0_SECRET
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// Firebase config endpoint
app.get('/api/firebase-config', (req, res) => {
    try {
        const firebaseConfig = {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID
        };

        // Check if any required config is missing
        const missingVars = Object.entries(firebaseConfig)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missingVars.length > 0) {
            console.error('Missing Firebase config variables:', missingVars);
            return res.status(500).json({
                error: 'Missing Firebase configuration',
                missingVars
            });
        }

        res.json(firebaseConfig);
    } catch (error) {
        console.error('Error in /api/firebase-config:', error);
        res.status(500).json({ error: error.message });
    }
});

// Weather API update function
async function updateWeather() {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=Valencia,ES&units=metric&appid=${process.env.WEATHER_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Weather API response was not ok');
        }
        const weatherData = await response.json();
        global.currentWeather = weatherData;
    } catch (error) {
        console.error('Error fetching weather:', error);
    }
}

// Update weather every hour
setInterval(updateWeather, 3600000);
updateWeather(); // Initial update

// Weather endpoint
app.get('/api/weather', (req, res) => {
    if (global.currentWeather) {
        res.json(global.currentWeather);
    } else {
        res.status(503).json({ error: 'Weather data not available' });
    }
});

// Protected routes middleware
const requiresAuth = (req, res, next) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

// Apartment routes
app.get('/api/apartments', requiresAuth, async (req, res) => {
    try {
        // Removed Apartment model and MongoDB connection
        res.status(404).json({ error: 'Apartments endpoint not available' });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching apartments' });
    }
});

app.post('/api/apartments', requiresAuth, async (req, res) => {
    try {
        // Removed Apartment model and MongoDB connection
        res.status(404).json({ error: 'Apartments endpoint not available' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating apartment' });
    }
});

// Budget routes
app.get('/api/budget', requiresAuth, async (req, res) => {
    try {
        // Removed Budget model and MongoDB connection
        res.status(404).json({ error: 'Budget endpoint not available' });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching budget' });
    }
});

app.post('/api/budget/expenses', requiresAuth, async (req, res) => {
    try {
        // Removed Budget model and MongoDB connection
        res.status(404).json({ error: 'Budget endpoint not available' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding expense' });
    }
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
