require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Database connection (optional - can run without MongoDB)
let database = null;
try {
  database = require('./config/database');
} catch (error) {
  console.log('⚠️ Database module not found, running without database');
}

const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', apiRoutes);

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Try to connect to database if available
    if (database && database.connect) {
      try {
        await database.connect();
      } catch (dbError) {
        console.log('⚠️ Database connection failed, running without database');
      }
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 TorNumber Server running on http://localhost:${PORT}`);
      console.log(`📱 Enter any phone number to analyze`);
      console.log(`💡 Tip: You can use numbers without country code (e.g., 01712345678)`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // Still try to start without database
    app.listen(PORT, () => {
      console.log(`🚀 TorNumber Server running on http://localhost:${PORT} (without database)`);
    });
  }
}

startServer();