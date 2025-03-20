const express = require('express');
const Distance = require('../models/Distance');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user-specific history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const history = await Distance.find({ user: userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;