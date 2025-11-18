// API configuration utility
// Uses environment variable in production, localhost in development

const getApiUrl = () => {
  // In Vercel, use VITE_API_URL if set, otherwise use relative path
  // In development, use localhost
  if (import.meta.env.MODE === 'development') {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }
  
  // In production, use VITE_API_URL or default to relative path (same domain)
  return import.meta.env.VITE_API_URL || '';
};

export const API_BASE_URL = getApiUrl();

export default API_BASE_URL;

