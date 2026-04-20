const mongoose = require('mongoose');

class Database {
  async connect() {
    try {
      // Check if MongoDB URI is configured
      if (!process.env.MONGODB_URI) {
        console.log('⚠️ No MongoDB URI found. Running without database.');
        return;
      }
      
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
      console.log('⚠️ MongoDB not available. Running without database storage.');
      // Don't exit process, just log warning
    }
  }
}

module.exports = new Database();