const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the connection string from environment variables
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Get MongoDB URI from environment variable
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set. Please set it in your .env file.');
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

module.exports = { connectDB };

