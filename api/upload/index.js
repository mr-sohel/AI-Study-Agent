const multer = require('multer');
const { parseFile } = require('../../backend/utils/fileParser');
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

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
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
      cb(new Error('Invalid file type. Only PDF, DOCX, TXT, and image files are allowed.'));
    }
  }
});

// Handler function
const handleRequest = async (req, res) => {
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
    const words = trimmedText.split(/\s+/).filter(w => w.length > 0);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    
    const isEmpty = trimmedText.length === 0;
    const isLowQualityText = !isEmpty && (
      words.length < 50 || 
      uniqueWords.size < 5 || 
      (uniqueWords.size === 1 && words.length > 10) ||
      (uniqueWords.size <= 3 && words.length > 20)
    );
    
    const lowerText = trimmedText.toLowerCase();
    const hasWatermark = !isEmpty && (
      lowerText.includes('camscanner') || 
      lowerText.includes('scanner') ||
      (uniqueWords.size === 1 && words.length > 5)
    );
    
    const useFileUpload = isImage || isEmpty || isLowQualityText || hasWatermark;
    
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
