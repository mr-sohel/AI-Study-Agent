const multer = require('multer');
const { parseFile } = require('../../backend/utils/fileParser');
const Document = require('../../backend/models/Document');
const { connectDB } = require('../utils/db');
const { setCORSHeaders, handleOptions } = require('../utils/cors');
const { shouldUseFileUpload } = require('../../backend/utils/textQuality');
const { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } = require('../../backend/utils/constants');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, TXT, and image files are allowed.'));
    }
  }
});

// Handler function
const handleRequest = async (req, res) => {
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
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📁 File uploaded:', {
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    let extractedText = '';
    const isImage = req.file.mimetype.startsWith('image/');
    
    if (!isImage) {
      try {
        extractedText = await parseFile(req.file.buffer, req.file.mimetype);
      } catch (parseError) {
        console.error('❌ Error parsing file:', parseError.message);
        if (req.file.mimetype === 'application/pdf') {
          extractedText = '';
        } else {
          return res.status(400).json({ error: `Failed to parse file: ${parseError.message}` });
        }
      }
    }

    const trimmedText = extractedText.trim();
    const useFileUpload = shouldUseFileUpload(trimmedText, isImage);
    
    const documentData = {
      filename: `memory-${Date.now()}-${req.file.originalname}`,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      extractedText: trimmedText || 'No text extracted (scanned PDF)',
      useGeminiFileUpload: useFileUpload
    };
    
    if (useFileUpload && req.file.buffer) {
      documentData.fileBuffer = req.file.buffer;
    }
    
    const document = new Document(documentData);
    await document.save();

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
};

// Export with multer middleware
module.exports = (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    handleRequest(req, res);
  });
};
