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
app.use('/api', require('./routes/calculate'));
app.use('/api', require('./routes/history'));

// Import models
const Query = require('./models/query');

/**
 * Validate address string to prevent injection attacks
 * @param {string} address - Address to validate
 * @returns {boolean} - True if address is valid
 */
function validateAddress(address) {
  // Check if address is provided and is a string
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Check length constraints
  if (address.length < 3 || address.length > 200) {
    return false;
  }

  // Only allow alphanumeric characters, spaces, commas, periods, and basic punctuation
  const validAddressRegex = /^[a-zA-Z0-9\s,.-]+$/;
  return validAddressRegex.test(address);
}

/**
 * Validate coordinates to prevent invalid calculations
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} - True if coordinates are valid
 */
function validateCoordinates(lat, lon) {
  // Check if coordinates are numbers
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return false;
  }

  // Check latitude range (-90 to 90)
  if (lat < -90 || lat > 90) {
    return false;
  }

  // Check longitude range (-180 to 180)
  if (lon < -180 || lon > 180) {
    return false;
  }

  return true;
}

/**
 * Endpoint to calculate distance between two locations
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
app.post('/calculate', async (req, res) => {
  const { source, destination } = req.body;

  // Validate input addresses
  if (!validateAddress(source) || !validateAddress(destination)) {
    return res.status(400).json({ 
      error: 'Invalid address format. Addresses must be between 3 and 200 characters and contain only letters, numbers, spaces, and basic punctuation.' 
    });
  }

  try {
    // Add delay between requests to respect rate limits
    const sourceData = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(source)}&format=json`, {
      headers: {
        'User-Agent': 'DistanceCalculator/1.0'
      }
    });
    
    // Wait 1 second between requests to respect Nominatim's usage policy
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const destinationData = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json`, {
      headers: {
        'User-Agent': 'DistanceCalculator/1.0'
      }
    });

    if (sourceData.data.length === 0 || destinationData.data.length === 0) {
      return res.status(400).json({ error: 'Address not found' });
    }

    const sourceCoords = sourceData.data[0];
    const destinationCoords = destinationData.data[0];

    // Validate coordinates before calculation
    if (!validateCoordinates(parseFloat(sourceCoords.lat), parseFloat(sourceCoords.lon)) ||
        !validateCoordinates(parseFloat(destinationCoords.lat), parseFloat(destinationCoords.lon))) {
      return res.status(400).json({ error: 'Invalid coordinates received from geocoding service' });
    }

    const distance = calculateDistance(
      parseFloat(sourceCoords.lat), 
      parseFloat(sourceCoords.lon), 
      parseFloat(destinationCoords.lat), 
      parseFloat(destinationCoords.lon)
    );

    const query = new Query({ 
      source, 
      destination, 
      distance,
      sourceCoords: { lat: sourceCoords.lat, lon: sourceCoords.lon },
      destinationCoords: { lat: destinationCoords.lat, lon: destinationCoords.lon }
    });
    await query.save();

    res.json({ 
      distance,
      source: {
        address: source,
        coordinates: { lat: sourceCoords.lat, lon: sourceCoords.lon }
      },
      destination: {
        address: destination,
        coordinates: { lat: destinationCoords.lat, lon: destinationCoords.lon }
      }
    });
  } catch (error) {
    console.error('Calculate endpoint error:', error);
    res.status(500).json({ error: 'Failed to calculate distance' });
  }
});

/**
 * Endpoint for address autocomplete
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
app.get('/autocomplete', async (req, res) => {
  const { input } = req.query;

  // Validate input
  if (!validateAddress(input)) {
    return res.status(400).json({ 
      error: 'Invalid input format. Search text must be between 3 and 200 characters and contain only letters, numbers, spaces, and basic punctuation.' 
    });
  }

  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&addressdetails=1&limit=5`, {
      headers: {
        'User-Agent': 'DistanceCalculator/1.0',
        'Accept-Language': 'en'
      }
    });
    
    const suggestions = response.data.map((result) => ({
      display_name: result.display_name,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
    }));
    
    res.json(suggestions);
  } catch (error) {
    console.error('Autocomplete endpoint error:', error);
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

// Export app and validation functions for testing
module.exports = {
  app,
  validateAddress,
  validateCoordinates
};