const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  phoneNumber: String,
  normalizedNumber: { type: String, unique: true, index: true },
  country: String,
  countryName: String,
  countryCode: String,
  carrier: String,
  lineType: String,
  location: {
    city: String,
    description: String,
    source: String
  },
  fakeName: String,
  spamScore: Number,
  riskLevel: {
    type: String,
    enum: ['Safe', 'Suspicious', 'Spam', 'High Risk'],
    default: 'Safe'
  },
  aiInsight: String,
  spamReports: { type: Number, default: 0 },
  searchCount: { type: Number, default: 1 },
  lastSearched: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Search', searchSchema);