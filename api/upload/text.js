const Document = require('../../backend/models/Document');
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://faysalislamfd:NNhFFLEKMwxDb4mJ@cluster0.zj1pg.mongodb.net/?appName=Cluster0';
  
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const trimmedText = text.trim();
    if (trimmedText.length < 20) {
      return res.status(400).json({ error: 'Text must be at least 20 characters long' });
    }

    const documentData = {
      filename: `text-${Date.now()}.txt`,
      originalName: 'Text Document',
      fileType: 'text/plain',
      extractedText: trimmedText,
      useGeminiFileUpload: false
    };

    const document = new Document(documentData);
    await document.save();

    res.json({
      message: 'Text uploaded and processed successfully',
      documentId: document._id,
      extractedText: trimmedText.substring(0, 500) + '...',
      textLength: trimmedText.length
    });
  } catch (error) {
    console.error('❌ Text upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

