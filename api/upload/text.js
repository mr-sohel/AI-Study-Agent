const Document = require('../../backend/models/Document');
const { connectDB } = require('../utils/db');
const { setCORSHeaders, handleOptions } = require('../utils/cors');
const { MIN_TEXT_LENGTH } = require('../../backend/utils/constants');

module.exports = async (req, res) => {
  // Set CORS headers
  setCORSHeaders(res);

  // Handle OPTIONS preflight
  if (handleOptions(req, res)) {
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
    if (trimmedText.length < MIN_TEXT_LENGTH) {
      return res.status(400).json({ error: `Text must be at least ${MIN_TEXT_LENGTH} characters long` });
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

