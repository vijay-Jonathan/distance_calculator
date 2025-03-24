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
const logger = require('./config/logger');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    query: req.query,
    body: req.method === 'POST' ? req.body : undefined
  });
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('MongoDB connected successfully'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/calculate'));
app.use('/api', require('./routes/history'));

// Import models
const Query = require('./models/query');

// Array of funny quotes for 404 errors
const funnyQuotes = [
  "Oops! Looks like this page took a wrong turn at Albuquerque!",
  "404: Page got lost in the Matrix. Take the blue pill and go back home.",
  "Houston, we have a problem... This page doesn't exist!",
  "This page is playing hide and seek... and it's winning!",
  "Looks like someone divided by zero. Page not found!",
  "Error 404: Page went on vacation without leaving a forwarding address.",
  "This is not the page you're looking for... *waves hand like a Jedi*",
  "Plot twist: This page exists in an alternate universe!",
  "This page has been abducted by aliens. We're working on negotiations.",
  "404: Page got stuck in traffic. Try another route!"
];

/**
 * Get a random funny quote for 404 errors
 * @returns {string} A random funny quote
 */
function getRandomQuote() {
  return funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)];
}

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
    logger.warn('Invalid address format', { source, destination });
    return res.status(400).json({ 
      error: 'Invalid address format. Addresses must be between 3 and 200 characters and contain only letters, numbers, spaces, and basic punctuation.' 
    });
  }

  try {
    logger.debug('Fetching coordinates for addresses', { source, destination });
    
    // Add delay between requests to respect rate limits
    const sourceData = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(source)}&format=json`, {
      headers: {
        'User-Agent': 'DistanceCalculator/1.0'
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const destinationData = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json`, {
      headers: {
        'User-Agent': 'DistanceCalculator/1.0'
      }
    });

    if (sourceData.data.length === 0 || destinationData.data.length === 0) {
      logger.warn('Address not found', { source, destination });
      return res.status(400).json({ error: 'Address not found' });
    }

    const sourceCoords = sourceData.data[0];
    const destinationCoords = destinationData.data[0];

    // Validate coordinates before calculation
    if (!validateCoordinates(parseFloat(sourceCoords.lat), parseFloat(sourceCoords.lon)) ||
        !validateCoordinates(parseFloat(destinationCoords.lat), parseFloat(destinationCoords.lon))) {
      logger.error('Invalid coordinates received', { sourceCoords, destinationCoords });
      return res.status(400).json({ error: 'Invalid coordinates received from geocoding service' });
    }

    const distance = calculateDistance(
      parseFloat(sourceCoords.lat), 
      parseFloat(sourceCoords.lon), 
      parseFloat(destinationCoords.lat), 
      parseFloat(destinationCoords.lon)
    );

    logger.info('Distance calculated successfully', {
      source,
      destination,
      distance,
      sourceCoords: { lat: sourceCoords.lat, lon: sourceCoords.lon },
      destinationCoords: { lat: destinationCoords.lat, lon: destinationCoords.lon }
    });

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
    logger.error('Calculate endpoint error:', { 
      error: error.message, 
      stack: error.stack,
      source,
      destination 
    });
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
    logger.warn('Invalid input format', { input });
    return res.status(400).json({ 
      error: 'Invalid input format. Search text must be between 3 and 200 characters and contain only letters, numbers, spaces, and basic punctuation.' 
    });
  }

  try {
    logger.debug('Fetching address suggestions', { input });
    
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
    
    logger.info('Address suggestions fetched successfully', { input, suggestions });
    
    res.json(suggestions);
  } catch (error) {
    logger.error('Autocomplete endpoint error:', { 
      error: error.message, 
      stack: error.stack,
      input 
    });
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
    logger.debug('Fetching calculation history');
    
    const queries = await Query.find().sort({ createdAt: -1 });
    
    logger.info('Calculation history fetched successfully', { queries });
    
    res.json(queries);
  } catch (error) {
    logger.error('History endpoint error:', { 
      error: error.message, 
      stack: error.stack
    });
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

// Custom 404 handler for any undefined routes
app.use('*', (req, res) => {
  logger.warn('404 Not Found', { 
    path: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  res.status(404).json({
    status: 404,
    message: getRandomQuote(),
    tip: "Try going back home or check if the URL is correct!",
    availableEndpoints: [
      "/calculate - Calculate distance between two locations",
      "/autocomplete - Get address suggestions",
      "/history - View calculation history"
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', { 
    error: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  });
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

// Export app and validation functions for testing
module.exports = {
  app,
  validateAddress,
  validateCoordinates
};