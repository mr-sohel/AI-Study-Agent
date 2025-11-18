const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;

/**
 * Parse file from file path or buffer
 * @param {string|Buffer} filePathOrBuffer - File path (string) or buffer (Buffer)
 * @param {string} fileType - MIME type of the file
 * @returns {Promise<string>} Extracted text content
 */
async function parseFile(filePathOrBuffer, fileType) {
  try {
    if (fileType === 'application/pdf') {
      // PDF: Can work with both path and buffer
      let dataBuffer;
      if (Buffer.isBuffer(filePathOrBuffer)) {
        dataBuffer = filePathOrBuffer;
      } else {
        dataBuffer = await fs.readFile(filePathOrBuffer);
      }
      
      const data = await pdf(dataBuffer);
      const extractedText = data.text || '';
      
      // Check if text extraction was successful
      const trimmedText = extractedText.trim();
      // Don't throw error - return empty string and let the upload handler decide
      // We'll use Gemini file upload for scanned PDFs
      if (!trimmedText || trimmedText.length === 0) {
        console.warn('⚠️  PDF appears to be image-based (scanned PDF). Text extraction returned empty.');
        console.warn('   Will use Gemini file upload for processing instead.');
        return ''; // Return empty string instead of throwing error
      }
      
      // Validate that we have substantial content (not just metadata or single words)
      // Count words (split by whitespace and filter out empty strings)
      const words = trimmedText.split(/\s+/).filter(word => word.length > 0);
      if (words.length < 10) {
        console.warn('⚠️  WARNING: PDF text extraction returned very few words. This might be a scanned PDF or extraction failed.');
        console.warn('Extracted text:', trimmedText.substring(0, 500));
      }
      
      // Log extraction info
      console.log('📄 PDF parsed:', {
        pages: data.numpages,
        textLength: trimmedText.length,
        wordCount: words.length,
        preview: trimmedText.substring(0, 150).replace(/\n/g, ' ') + '...'
      });
      
      return trimmedText;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // DOCX: mammoth can work with buffer
      if (Buffer.isBuffer(filePathOrBuffer)) {
        const result = await mammoth.extractRawText({ buffer: filePathOrBuffer });
        return result.value;
      } else {
        const result = await mammoth.extractRawText({ path: filePathOrBuffer });
        return result.value;
      }
    } else if (fileType === 'text/plain') {
      // TXT: Can work with both path and buffer
      if (Buffer.isBuffer(filePathOrBuffer)) {
        return filePathOrBuffer.toString('utf8');
      } else {
        const text = await fs.readFile(filePathOrBuffer, 'utf8');
        return text;
      }
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error parsing file:', error);
    throw error;
  }
}

module.exports = { parseFile };


