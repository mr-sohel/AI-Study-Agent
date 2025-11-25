/**
 * Set CORS headers for API responses
 * @param {Object} res - Express response object
 */
const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
};

/**
 * Handle OPTIONS preflight request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {boolean} - Returns true if OPTIONS request was handled
 */
const handleOptions = (req, res) => {
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res);
    res.status(200).end();
    return true;
  }
  return false;
};

/**
 * Middleware to set CORS headers and handle OPTIONS
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const corsMiddleware = (req, res, next) => {
  setCORSHeaders(res);
  if (handleOptions(req, res)) {
    return;
  }
  next();
};

module.exports = {
  setCORSHeaders,
  handleOptions,
  corsMiddleware
};

