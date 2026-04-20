const mongoose = require('mongoose');

class Database {
  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      process.exit(1);
    }
  }
}

module.exports = new Database();