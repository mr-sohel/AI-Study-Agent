const Document = require('../../../../backend/models/Document');
const { generateFlashcards } = require('../../../../backend/utils/geminiService');
const { connectDB } = require('../../../utils/db');
const { setCORSHeaders, handleOptions } = require('../../../utils/cors');
const { shouldUseFileUpload } = require('../../../../backend/utils/textQuality');
const { convertToBuffer } = require('../../../../backend/utils/fileBuffer');

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
    
    // Extract documentId from URL path
    const urlParts = req.url.split('/');
    const documentId = urlParts[urlParts.length - 1];

    if (!documentId || documentId === 'flashcards') {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.flashcards && document.flashcards.length > 0) {
      return res.json({ flashcards: document.flashcards });
    }

    const extractedText = document.extractedText || '';
    const shouldUseFileUploadFlag = shouldUseFileUpload(extractedText, false, document.useGeminiFileUpload);
    
    const fileBuffer = convertToBuffer(document.fileBuffer);
    
    if (shouldUseFileUploadFlag && !fileBuffer) {
      return res.status(400).json({ 
        error: 'This document appears to be a scanned PDF, but the original file was not saved. Please re-upload the file.' 
      });
    }

    const flashcards = await generateFlashcards(
      extractedText,
      fileBuffer,
      document.fileType,
      document.originalName,
      shouldUseFileUploadFlag
    );
    document.flashcards = flashcards;
    await document.save();

    res.json({ flashcards });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ error: error.message });
  }
};

