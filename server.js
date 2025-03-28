const express = require('express');
const mongoose = require('mongoose');
const { auth } = require('express-openid-connect');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

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
    secret: 'dK8xJ#mP9$vL2@nQ5*wR7&yT4^hB1!cF3gN6'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

// Models
const Apartment = require('./models/Apartment');
const Budget = require('./models/Budget');
const Weather = require('./models/Weather');

// Weather API update function
async function updateWeather() {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=Valencia,ES&units=metric&appid=${process.env.WEATHER_API_KEY}`
        );
        const data = await response.json();

        const weather = new Weather({
            city: 'Valencia',
            temperature: {
                current: data.main.temp,
                feels_like: data.main.feels_like,
                min: data.main.temp_min,
                max: data.main.temp_max
            },
            humidity: data.main.humidity,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            wind: {
                speed: data.wind.speed,
                direction: data.wind.deg
            }
        });

        await weather.save();
        console.log('Weather updated successfully');
    } catch (error) {
        console.error('Error updating weather:', error);
    }
}

// Update weather every hour
setInterval(updateWeather, 3600000);
updateWeather(); // Initial update

// Routes
app.get('/api/weather', async (req, res) => {
    try {
        const weather = await Weather.findOne().sort({ timestamp: -1 });
        res.json(weather);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching weather data' });
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
        const apartments = await Apartment.find({ createdBy: req.oidc.user.sub });
        res.json(apartments);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching apartments' });
    }
});

app.post('/api/apartments', requiresAuth, async (req, res) => {
    try {
        const apartment = new Apartment({
            ...req.body,
            createdBy: req.oidc.user.sub
        });
        await apartment.save();
        res.status(201).json(apartment);
    } catch (error) {
        res.status(500).json({ error: 'Error creating apartment' });
    }
});

// Budget routes
app.get('/api/budget', requiresAuth, async (req, res) => {
    try {
        let budget = await Budget.findOne({ userId: req.oidc.user.sub });
        if (!budget) {
            budget = new Budget({
                userId: req.oidc.user.sub,
                totalBudget: 0,
                expenses: [],
                categories: []
            });
            await budget.save();
        }
        res.json(budget);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching budget' });
    }
});

app.post('/api/budget/expenses', requiresAuth, async (req, res) => {
    try {
        const budget = await Budget.findOne({ userId: req.oidc.user.sub });
        budget.expenses.push(req.body);
        budget.updatedAt = new Date();
        await budget.save();
        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ error: 'Error adding expense' });
    }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
