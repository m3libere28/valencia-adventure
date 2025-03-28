# Valencia Adventure Website

A personal website tracking our family's journey to Valencia, Spain. Features include weather updates, budget tracking, apartment hunting, school research, and more.

## Features

- Real-time weather updates for Valencia
- Budget tracking and expense management
- Apartment search and filtering
- School information and mapping
- Interactive timeline
- Authentication with Auth0
- MongoDB database integration

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_DOMAIN=your_auth0_domain
   AUTH0_SECRET=your_auth0_secret
   WEATHER_API_KEY=your_openweathermap_api_key
   BASE_URL=http://localhost:3001
   ```
4. Start the server:
   ```bash
   node server.js
   ```

## Technologies Used

- Node.js & Express
- MongoDB & Mongoose
- Auth0 Authentication
- OpenWeatherMap API
- Tailwind CSS
- Chart.js
- Leaflet.js
- GSAP Animations
