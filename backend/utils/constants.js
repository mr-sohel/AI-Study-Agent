/**
 * Allowed file types for upload
 */
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

/**
 * Maximum file size in bytes (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Minimum text length for text input
 */
const MIN_TEXT_LENGTH = 20;

module.exports = {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  MIN_TEXT_LENGTH
};

