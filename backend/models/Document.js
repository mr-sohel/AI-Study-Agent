const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    required: true
  },
  fileBuffer: {
    type: Buffer,
    required: false // Optional - only store if text extraction failed
  },
  useGeminiFileUpload: {
    type: Boolean,
    default: false // Flag to indicate if we should use direct file upload
  },
  summary: String,
  flashcards: [{
    question: String,
    answer: String
  }],
  quiz: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', documentSchema);


