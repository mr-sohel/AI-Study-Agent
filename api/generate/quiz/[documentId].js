const Document = require('../../../../backend/models/Document');
const { generateQuiz } = require('../../../../backend/utils/geminiService');
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
    const shouldUseFileUploadFlag = shouldUseFileUpload(extractedText, false, document.useGeminiFileUpload);
    
    const fileBuffer = convertToBuffer(document.fileBuffer);
    
    if (shouldUseFileUploadFlag && !fileBuffer) {
      return res.status(400).json({ 
        error: 'This document appears to be a scanned PDF, but the original file was not saved. Please re-upload the file.' 
      });
    }

    const quiz = await generateQuiz(
      extractedText,
      fileBuffer,
      document.fileType,
      document.originalName,
      shouldUseFileUploadFlag
    );
    document.quiz = quiz;
    await document.save();

    res.json({ quiz });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: error.message });
  }
};

