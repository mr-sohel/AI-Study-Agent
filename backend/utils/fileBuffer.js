/**
 * Convert MongoDB fileBuffer to Node.js Buffer
 * Handles different formats that MongoDB might return
 * @param {any} fileBuffer - File buffer from MongoDB document
 * @returns {Buffer|null} - Converted buffer or null if invalid
 */
const convertToBuffer = (fileBuffer) => {
  if (!fileBuffer) {
    return null;
  }
  
  // Already a Buffer
  if (Buffer.isBuffer(fileBuffer)) {
    return fileBuffer;
  }
  
  // MongoDB might return { data: [...], type: 'Buffer' }
  if (fileBuffer.data && Array.isArray(fileBuffer.data)) {
    return Buffer.from(fileBuffer.data);
  }
  
  // Try to convert directly
  try {
    return Buffer.from(fileBuffer);
  } catch (error) {
    console.error('Error converting fileBuffer to Buffer:', error);
    return null;
  }
};

module.exports = {
  convertToBuffer
};

