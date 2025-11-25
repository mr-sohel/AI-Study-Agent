/**
 * Check if text is low quality (likely scanned PDF or watermark)
 * @param {string} text - Text to analyze
 * @returns {Object} - Object with quality analysis results
 */
const analyzeTextQuality = (text) => {
  const trimmedText = (text || '').trim();
  const words = trimmedText.split(/\s+/).filter(w => w.length > 0);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const lowerText = trimmedText.toLowerCase();
  
  const isEmpty = trimmedText.length === 0;
  
  const hasWatermark = !isEmpty && (
    lowerText.includes('camscanner') || 
    lowerText.includes('scanner') ||
    (uniqueWords.size === 1 && words.length > 5)
  );
  
  const isLowQualityText = !isEmpty && (
    words.length < 50 || 
    uniqueWords.size < 5 || 
    (uniqueWords.size === 1 && words.length > 10) ||
    (uniqueWords.size <= 3 && words.length > 20) ||
    hasWatermark ||
    trimmedText.includes('No text extracted')
  );
  
  return {
    isEmpty,
    hasWatermark,
    isLowQualityText,
    wordCount: words.length,
    uniqueWordCount: uniqueWords.size,
    textLength: trimmedText.length
  };
};

/**
 * Determine if file upload should be used for Gemini processing
 * @param {string} text - Extracted text
 * @param {boolean} isImage - Whether the file is an image
 * @param {boolean} useGeminiFileUpload - Flag from document
 * @returns {boolean}
 */
const shouldUseFileUpload = (text, isImage = false, useGeminiFileUpload = false) => {
  if (isImage || useGeminiFileUpload) {
    return true;
  }
  
  const quality = analyzeTextQuality(text);
  return quality.isEmpty || quality.isLowQualityText;
};

module.exports = {
  analyzeTextQuality,
  shouldUseFileUpload
};

