const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  phoneNumber: String,
  normalizedNumber: { type: String, unique: true },
  country: String,
  countryCode: String,
  carrier: String,
  lineType: String,
  fakeName: String,
  spamScore: Number,
  riskLevel: String,
  aiInsight: String,
  spamReports: { type: Number, default: 0 },
  searchCount: { type: Number, default: 1 },
  lastSearched: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Search', searchSchema);