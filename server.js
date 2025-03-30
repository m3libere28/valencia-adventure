const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Debug middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: {
            NODE_ENV: process.env.NODE_ENV,
            firebaseConfigured: !!process.env.FIREBASE_API_KEY,
            weatherConfigured: !!process.env.WEATHER_API_KEY
        }
    });
});

// Firebase config endpoint
app.get('/api/firebase-config', (req, res) => {
    try {
        console.log('Firebase config request received');
        
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
        console.log('Weather data updated successfully');
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

// Handle all other routes
app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export the Express API
module.exports = app;
