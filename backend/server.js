
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const uploadRoutes = require('./routes/upload');
const generateRoutes = require('./routes/generate');

// Load environment variables
const envResult = dotenv.config();
if (envResult.error) {
  console.error('❌ Error loading .env file:', envResult.error);
} else {
  console.log('✅ Environment variables loaded');
  // Verify API key is loaded (show first 10 chars only for security)
  if (process.env.GEMINI_API_KEY) {
    console.log(`✅ Gemini API Key detected: ${process.env.GEMINI_API_KEY.substring(0, 10)}...`);
  } else {
    console.warn('⚠️  GEMINI_API_KEY not found in .env file');
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection

//
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://faysalislamfd:NNhFFLEKMwxDb4mJ@cluster0.zj1pg.mongodb.net/?appName=Cluster0')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/generate', generateRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AI Study Agent API' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

