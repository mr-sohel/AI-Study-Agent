const express = require('express');
const Document = require('../models/Document');
const {
  generateSummary,
  generateFlashcards,
  generateQuiz
} = require('../utils/geminiService');

const router = express.Router();

router.post('/summary/:documentId', async (req, res) => {
  try {
    // Get document - MongoDB should retrieve all fields including Buffer by default
    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Debug logging
    console.log('Document found:', {
      id: document._id,
      filename: document.originalName,
      hasExtractedText: !!document.extractedText,
      extractedTextLength: document.extractedText ? document.extractedText.length : 0
    });

    if (!document.extractedText || document.extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Document has no extracted text. Please re-upload the file.' });
    }

    if (document.summary) {
      return res.json({ summary: document.summary });
    }

    console.log('Generating summary for document:', document._id);
    console.log('📝 Document info:', {
      filename: document.originalName,
      textLength: document.extractedText ? document.extractedText.length : 0,
      preview: document.extractedText ? document.extractedText.substring(0, 200).replace(/\n/g, ' ') + '...' : 'No text',
      useGeminiFileUpload: document.useGeminiFileUpload || false,
      hasFileBuffer: !!document.fileBuffer,
      fileBufferType: document.fileBuffer ? typeof document.fileBuffer : 'none',
      fileBufferLength: document.fileBuffer ? (Buffer.isBuffer(document.fileBuffer) ? document.fileBuffer.length : 'not a buffer') : 0
    });
    
    const extractedText = document.extractedText || '';
    
    // Check if this is a text-only document (created from text input, not file upload)
    const isTextOnlyDocument = document.originalName === 'Text Document' || 
                               document.filename?.startsWith('text-') ||
                               document.useGeminiFileUpload === false;
    
    let shouldUseFileUpload = false;
    let fileBuffer = null;
    const isDirectPrompt = isTextOnlyDocument; // Text input = direct prompt, not summary
    
    // For text-only documents, skip file upload check entirely
    if (isTextOnlyDocument) {
      console.log('💬 Text-only document detected - treating as direct prompt (not summary)');
      shouldUseFileUpload = false;
    } else {
      // For file uploads, check if text is poor quality (likely scanned PDF)
      const words = extractedText.trim().split(/\s+/).filter(w => w.length > 0);
      const uniqueWords = new Set(words.map(w => w.toLowerCase()));
      const lowerText = extractedText.toLowerCase();
      const hasWatermark = lowerText.includes('camscanner') || lowerText.includes('scanner');
      const isLowQualityText = words.length < 50 || uniqueWords.size < 5 || 
                               (uniqueWords.size === 1 && words.length > 10) ||
                               hasWatermark ||
                               extractedText.includes('No text extracted');
      
      // Determine if we should use file upload
      shouldUseFileUpload = document.useGeminiFileUpload || isLowQualityText;
      
      // Ensure fileBuffer is a Buffer if it exists (MongoDB might return it in different format)
      if (document.fileBuffer) {
        if (Buffer.isBuffer(document.fileBuffer)) {
          fileBuffer = document.fileBuffer;
        } else if (document.fileBuffer.data) {
          // Sometimes MongoDB returns { data: [...], type: 'Buffer' }
          fileBuffer = Buffer.from(document.fileBuffer.data);
        } else {
          // Try to convert to buffer
          fileBuffer = Buffer.from(document.fileBuffer);
        }
        console.log('✅ File buffer retrieved:', { 
          isBuffer: Buffer.isBuffer(fileBuffer), 
          size: fileBuffer.length 
        });
      }
      
      // If we need file upload but don't have the buffer, ask user to re-upload
      if (shouldUseFileUpload && !fileBuffer) {
        console.warn('⚠️  Document needs file upload but buffer is missing.');
        console.warn('   Document.useGeminiFileUpload:', document.useGeminiFileUpload);
        console.warn('   isLowQualityText:', isLowQualityText);
        console.warn('   document.fileBuffer exists:', !!document.fileBuffer);
        return res.status(400).json({ 
          error: 'This document appears to be a scanned PDF (image-based), but the original file was not saved. Please re-upload the file to enable direct Gemini processing. The system will automatically detect and process scanned PDFs.' 
        });
      }
    }
    
    // Use Gemini file upload if text extraction was poor (scanned PDF)
    const summary = await generateSummary(
      extractedText,
      fileBuffer,
      document.fileType,
      document.originalName,
      shouldUseFileUpload,
      isDirectPrompt
    );
    document.summary = summary;
    await document.save();

    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: error.message || 'Failed to generate summary' });
  }
});

router.post('/flashcards/:documentId', async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // If "more=true" query param, always generate new flashcards (don't return existing)
    const generateMore = req.query.more === 'true';
    if (!generateMore && document.flashcards && document.flashcards.length > 0) {
      return res.json({ flashcards: document.flashcards });
    }

    // Check if extracted text is poor quality (likely scanned PDF)
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
    
    // Get file buffer
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

    const flashcards = await generateFlashcards(
      extractedText,
      fileBuffer,
      document.fileType,
      document.originalName,
      shouldUseFileUpload
    );
    
    // If generating more, don't overwrite existing flashcards (frontend will append)
    // Otherwise, save to document
    if (!generateMore) {
      document.flashcards = flashcards;
      await document.save();
    }

    res.json({ flashcards });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/quiz/:documentId', async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // If "more=true" query param, always generate new questions (don't return existing)
    const generateMore = req.query.more === 'true';
    if (!generateMore && document.quiz && document.quiz.length > 0) {
      return res.json({ quiz: document.quiz });
    }

    // Check if extracted text is poor quality (likely scanned PDF)
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
    
    // Get file buffer
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
    
    // If generating more, don't overwrite existing quiz (frontend will append)
    // Otherwise, save to document
    if (!generateMore) {
      document.quiz = quiz;
      await document.save();
    }

    res.json({ quiz });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/all/:documentId', async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Generate all content types in parallel
    const [summary, flashcards, quiz] = await Promise.all([
      document.summary || generateSummary(document.extractedText),
      (document.flashcards && document.flashcards.length > 0) ? document.flashcards : generateFlashcards(document.extractedText),
      (document.quiz && document.quiz.length > 0) ? document.quiz : generateQuiz(document.extractedText)
    ]);

    document.summary = summary;
    document.flashcards = flashcards;
    document.quiz = quiz;
    await document.save();

    res.json({ summary, flashcards, quiz });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


