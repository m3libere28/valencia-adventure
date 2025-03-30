const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();
const { auth } = require('express-openid-connect');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    };
    res.json(firebaseConfig);
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

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
