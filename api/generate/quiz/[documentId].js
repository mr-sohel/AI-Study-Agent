const Document = require('../../../../backend/models/Document');
const { generateQuiz } = require('../../../../backend/utils/geminiService');
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
    
    // Extract documentId from URL path
    const urlParts = req.url.split('/');
    const documentId = urlParts[urlParts.length - 1];

    if (!documentId || documentId === 'quiz') {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.quiz && document.quiz.length > 0) {
      return res.json({ quiz: document.quiz });
    }

    const extractedText = document.extractedText || '';
    const words = extractedText.trim().split(/\s+/).filter(w => w.length > 0);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const lowerText = extractedText.toLowerCase();
    const hasWatermark = lowerText.includes('camscanner') || lowerText.includes('scanner');
    const isLowQualityText = words.length < 50 || uniqueWords.size < 5 || 
                             (uniqueWords.size === 1 && words.length > 10) ||
                             hasWatermark ||
                             extractedText.includes('No text extracted');
    
    const shouldUseFileUpload = document.useGeminiFileUpload || isLowQualityText;
    
    let fileBuffer = null;
    if (document.fileBuffer) {
      if (Buffer.isBuffer(document.fileBuffer)) {
        fileBuffer = document.fileBuffer;
      } else if (document.fileBuffer.data) {
        fileBuffer = Buffer.from(document.fileBuffer.data);
      } else {
        fileBuffer = Buffer.from(document.fileBuffer);
      }
    }
    
    if (shouldUseFileUpload && !fileBuffer) {
      return res.status(400).json({ 
        error: 'This document appears to be a scanned PDF, but the original file was not saved. Please re-upload the file.' 
      });
    }

    const quiz = await generateQuiz(
      extractedText,
      fileBuffer,
      document.fileType,
      document.originalName,
      shouldUseFileUpload
    );
    document.quiz = quiz;
    await document.save();

    res.json({ quiz });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: error.message });
  }
};

