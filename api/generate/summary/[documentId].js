const Document = require('../../../../backend/models/Document');
const { generateSummary } = require('../../../../backend/utils/geminiService');
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
    // URL format: /api/generate/summary/[documentId]
    const urlParts = req.url.split('/');
    const documentId = urlParts[urlParts.length - 1];

    if (!documentId || documentId === 'summary') {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.summary) {
      return res.json({ summary: document.summary });
    }

    const isTextOnlyDocument = document.originalName === 'Text Document' || 
                               document.filename?.startsWith('text-') ||
                               document.useGeminiFileUpload === false;
    
    const isDirectPrompt = isTextOnlyDocument;
    let shouldUseFileUploadFlag = false;
    let fileBuffer = null;
    
    if (!isTextOnlyDocument) {
      const extractedText = document.extractedText || '';
      shouldUseFileUploadFlag = shouldUseFileUpload(extractedText, false, document.useGeminiFileUpload);
      
      fileBuffer = convertToBuffer(document.fileBuffer);
      
      if (shouldUseFileUploadFlag && !fileBuffer) {
        return res.status(400).json({ 
          error: 'This document appears to be a scanned PDF, but the original file was not saved. Please re-upload the file.' 
        });
      }
    }
    
    const summary = await generateSummary(
      document.extractedText,
      fileBuffer,
      document.fileType,
      document.originalName,
      shouldUseFileUploadFlag,
      isDirectPrompt
    );
    document.summary = summary;
    await document.save();

    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: error.message || 'Failed to generate summary' });
  }
};

