const express = require('express');
const Distance = require('../models/Distance');
const auth = require('../middleware/auth');

const router = express.Router();

// Distance calculation
router.post('/calculate', auth, async (req, res) => {
  try {
    const { source, destination } = req.body;
    const userId = req.user.userId;

    // Assume calculateDistance is a function that calculates the distance
    const distance = calculateDistance(source, destination);

    const newDistance = new Distance({
      user: userId,
      source,
      destination,
      distance
    });

    await newDistance.save();

    res.json({ distance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;