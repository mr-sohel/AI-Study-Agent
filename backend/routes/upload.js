const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { parseFile } = require('../utils/fileParser');
const Document = require('../models/Document');

const router = express.Router();

// Storage configuration based on environment
// For production/hosting: Use memory storage (works on all platforms)
// For local development: Use disk storage (optional, for debugging)
// Default: Use disk storage unless explicitly set to production
const USE_DISK_STORAGE = process.env.USE_DISK_STORAGE === 'true' || 
                         (process.env.USE_DISK_STORAGE !== 'false' && process.env.NODE_ENV !== 'production');

// Determine upload directory path
const uploadDir = path.join(__dirname, '../uploads');

let storage;
if (USE_DISK_STORAGE) {
  // Local development: Save to disk
  if (!fsSync.existsSync(uploadDir)) {
    fsSync.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ Created uploads directory:', uploadDir);
  } else {
    console.log('✅ Uploads directory exists:', uploadDir);
  }
  
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  });
  console.log('📁 Using DISK storage - Files will be saved to:', uploadDir);
  console.log('   Set DELETE_UPLOADED_FILES=true in .env to delete files after processing');
} else {
  // Production/hosting: Use memory storage (works on all platforms)
  storage = multer.memoryStorage();
  console.log('💾 Using MEMORY storage (production/hosting mode)');
  console.log('   Files are processed in memory and not saved to disk');
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, TXT, and image files (JPEG, PNG, GIF, WEBP) are allowed.'));
    }
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📁 File uploaded:', {
      originalName: req.file.originalname,
      filename: req.file.filename || 'memory-buffer',
      size: req.file.size,
      mimetype: req.file.mimetype,
      storage: USE_DISK_STORAGE ? 'disk' : 'memory'
    });

    // Handle file based on storage type
    let fileInput; // Can be file path (string) or buffer (Buffer)
    
    if (USE_DISK_STORAGE && req.file.path) {
      // Disk storage: file is already saved to disk, use path
      fileInput = req.file.path;
      try {
        const stats = await fs.stat(fileInput);
        console.log('✅ File saved to disk:', fileInput, `(${stats.size} bytes)`);
      } catch (statError) {
        console.error('❌ File not found on disk:', fileInput);
        return res.status(500).json({ error: 'File was not saved correctly' });
      }
    } else {
      // Memory storage: use buffer directly (no disk write needed!)
      fileInput = req.file.buffer;
      console.log('✅ Using file buffer directly (memory storage):', `(${req.file.size} bytes)`);
    }

    // Parse the file (can handle both path or buffer)
    // Images don't need text extraction - they'll use Gemini vision directly
    let extractedText = '';
    const isImage = req.file.mimetype.startsWith('image/');
    
    if (isImage) {
      console.log('🖼️  Image file detected - will use Gemini vision processing directly');
      extractedText = ''; // Images always use file upload
    } else {
      console.log('📄 Parsing file to extract text...');
      try {
        extractedText = await parseFile(fileInput, req.file.mimetype);
      } catch (parseError) {
        console.error('❌ Error parsing file:', parseError.message);
        // For PDFs, we'll still allow upload and use Gemini file upload
        if (req.file.mimetype === 'application/pdf') {
          console.log('   PDF parsing failed, but will proceed with Gemini file upload processing.');
          extractedText = ''; // Set empty text - will trigger file upload
        } else {
          return res.status(400).json({ error: `Failed to parse file: ${parseError.message}` });
        }
      }
    }

    // If text extraction returned empty (scanned PDF), that's okay - we'll use file upload
    if (!extractedText || extractedText.trim().length === 0) {
      console.log('⚠️  No text extracted from file. This is normal for scanned PDFs.');
      console.log('   The file will be processed using Gemini file upload with vision capabilities.');
      extractedText = ''; // Ensure it's empty string
    }

    // Check if extracted text is empty or just watermark/noise (e.g., "CamScanner" repeated)
    const trimmedText = extractedText.trim();
    const words = trimmedText.split(/\s+/).filter(w => w.length > 0);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    
    // If text is empty, definitely use file upload
    const isEmpty = trimmedText.length === 0;
    
    // More aggressive detection: if mostly one word, or very few unique words, it's likely scanned
    const isLowQualityText = !isEmpty && (
                             words.length < 50 || 
                             uniqueWords.size < 5 || 
                             (uniqueWords.size === 1 && words.length > 10) || // Only one unique word repeated
                             (uniqueWords.size <= 3 && words.length > 20) // Very few unique words
                             );
    
    // Also check for common watermark patterns
    const lowerText = trimmedText.toLowerCase();
    const hasWatermark = !isEmpty && (
                        lowerText.includes('camscanner') || 
                        lowerText.includes('scanner') ||
                        (uniqueWords.size === 1 && words.length > 5)
                        );
    
    // Images always use file upload, or if text extraction failed/poor quality
    const useFileUpload = isImage || isEmpty || isLowQualityText || hasWatermark;
    
    // Log extracted text info (if any)
    if (trimmedText.length > 0) {
      console.log('✅ Text extracted:', {
        textLength: trimmedText.length,
        wordCount: words.length,
        uniqueWords: uniqueWords.size,
        preview: trimmedText.substring(0, 200).replace(/\n/g, ' ') + '...'
      });
    } else {
      console.log('📄 No text extracted (scanned PDF - will use Gemini file upload)');
    }
    
    // Save to database with file buffer if text extraction is poor (for Gemini file upload)
    // ALWAYS store file buffer for PDFs when we need file upload (scanned PDFs)
    const documentData = {
      filename: req.file.filename || `memory-${Date.now()}-${req.file.originalname}`,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      extractedText: trimmedText || 'No text extracted (scanned PDF)', // Store placeholder if empty
      useGeminiFileUpload: useFileUpload // Flag to use direct file upload
    };
    
    // Store buffer if we need file upload (support both memory and disk storage)
    if (useFileUpload) {
      try {
        let buf = null;
        if (req.file.buffer && req.file.buffer.length) {
          buf = req.file.buffer; // memory storage
        } else if (USE_DISK_STORAGE && req.file.path) {
          // disk storage - read file from disk into buffer
          buf = await fs.readFile(req.file.path);
        }

        if (buf && buf.length) {
          documentData.fileBuffer = buf;
          console.log('💾 Storing file buffer for Gemini file upload:', {
            bufferSize: buf.length,
            sizeKB: (buf.length / 1024).toFixed(2)
          });
        } else {
          console.error('❌ Could not obtain file buffer for Gemini upload (storage mode:', USE_DISK_STORAGE ? 'disk' : 'memory', ')');
        }
      } catch (bufErr) {
        console.error('❌ Failed to read file into buffer for Gemini upload:', bufErr.message);
      }
    }
    
    const document = new Document(documentData);

    if (useFileUpload) {
      console.log('⚠️  Detected low-quality text extraction (likely scanned PDF).');
      console.log('   Text stats:', { words: words.length, uniqueWords: uniqueWords.size, hasWatermark });
      console.log('   Will use Gemini file upload for processing instead of extracted text.');
      console.log('   Storage mode:', USE_DISK_STORAGE ? 'disk' : 'memory');
    } else {
      console.log('✅ Text extraction looks good. Will use extracted text for processing.');
    }

    await document.save();
    
    // Verify what was actually saved
    const savedDoc = await Document.findById(document._id);
    console.log('✅ Document saved to MongoDB:', {
      id: document._id,
      hasFileBuffer: !!savedDoc.fileBuffer,
      fileBufferSize: savedDoc.fileBuffer ? savedDoc.fileBuffer.length : 0,
      useGeminiFileUpload: savedDoc.useGeminiFileUpload
    });

    // Clean up temporary files (optional - controlled by environment variable)
    // By default, KEEP files in local development (DELETE_UPLOADED_FILES not set or false)
    // Set DELETE_UPLOADED_FILES=true in .env to delete files after processing
    const shouldDeleteFiles = process.env.DELETE_UPLOADED_FILES === 'true';
    
    if (USE_DISK_STORAGE && req.file.path) {
      if (shouldDeleteFiles) {
        try {
          await fs.unlink(req.file.path);
          console.log('🗑️  Temporary file deleted:', req.file.path);
        } catch (unlinkError) {
          console.warn('⚠️  Could not delete temporary file:', req.file.path, unlinkError.message);
          // Don't fail the request if file deletion fails
        }
      } else {
        console.log('💾 File saved and kept in uploads folder:', req.file.path);
      }
    }
    // Note: Memory storage doesn't need cleanup - buffer is automatically garbage collected

    res.json({
      message: 'File uploaded and processed successfully',
      documentId: document._id,
      extractedText: extractedText.substring(0, 500) + '...',
      textLength: extractedText.length
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route for direct text input
router.post('/text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const trimmedText = text.trim();
    if (trimmedText.length < 20) {
      return res.status(400).json({ error: 'Text must be at least 20 characters long' });
    }

    console.log('📝 Text input received:', {
      textLength: trimmedText.length,
      preview: trimmedText.substring(0, 200).replace(/\n/g, ' ') + '...'
    });

    // Create document with text input (no file upload needed)
    const documentData = {
      filename: `text-${Date.now()}.txt`,
      originalName: 'Text Document',
      fileType: 'text/plain',
      extractedText: trimmedText,
      useGeminiFileUpload: false // Text input doesn't need file upload
    };

    const document = new Document(documentData);
    await document.save();

    console.log('✅ Text document saved to MongoDB:', {
      id: document._id,
      textLength: trimmedText.length
    });

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
});

module.exports = router;


