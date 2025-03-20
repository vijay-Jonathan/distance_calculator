const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  source: String,
  destination: String,
  distance: Number,
  createdAt: { type: Date, default: Date.now }
});

const Query = mongoose.model('Query', querySchema);

module.exports = Query;