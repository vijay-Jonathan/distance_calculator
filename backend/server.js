/**
 * Distance Calculator API Server
 * 
 * This Express server provides endpoints for calculating distances between locations,
 * managing user authentication, and storing calculation history.
 * 
 * Features:
 * - Distance calculation using Haversine formula
 * - Address autocomplete using OpenStreetMap Nominatim API
 * - MongoDB integration for storing calculation history
 * - User authentication
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));

// Import models
const Query = require('./models/query');

/**
 * Endpoint to calculate distance between two locations
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
app.post('/calculate', async (req, res) => {
  const { source, destination } = req.body;
  try {
    const sourceData = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(source)}&format=json`);
    const destinationData = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json`);

    if (sourceData.data.length === 0 || destinationData.data.length === 0) {
      return res.status(400).json({ error: 'Invalid address' });
    }

    const sourceCoords = sourceData.data[0];
    const destinationCoords = destinationData.data[0];

    const distance = calculateDistance(sourceCoords.lat, sourceCoords.lon, destinationCoords.lat, destinationCoords.lon);

    const query = new Query({ source, destination, distance });
    await query.save();

    res.json({ distance });
  } catch (error) {
    res.status(500).json({ error: 'API request failed' });
  }
});

/**
 * Endpoint for address autocomplete
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
app.get('/autocomplete', async (req, res) => {
  const { input } = req.query;
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&addressdetails=1&limit=5`, {
      headers: {
        'Accept-Language': 'en'
      }
    });
    const suggestions = response.data.map((result) => ({
      display_name: result.display_name,
      lat: result.lat,
      lon: result.lon,
    }));
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch address suggestions' });
  }
});

/**
 * Endpoint to get past queries
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
app.get('/history', async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.json(queries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});