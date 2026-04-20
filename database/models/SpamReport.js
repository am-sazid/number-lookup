const mongoose = require('mongoose');

const spamReportSchema = new mongoose.Schema({
  phoneNumber: String,
  normalizedNumber: String,
  reportedBy: { type: String, default: 'anonymous' },
  reason: String,
  ipAddress: String
}, { timestamps: true });

module.exports = mongoose.model('SpamReport', spamReportSchema);