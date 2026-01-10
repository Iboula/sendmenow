// API Configuration
// In production, set REACT_APP_API_URL environment variable
// For development, defaults to http://localhost:5000

// Get API URL from environment variable
let API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// If REACT_APP_API_URL is set but doesn't include protocol, add http (default) or https
// Only auto-add protocol if not explicitly set
if (API_BASE_URL && !API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
  // Default to https for production, http for development when not specified
  const isProduction = process.env.NODE_ENV === 'production';
  API_BASE_URL = isProduction ? `https://${API_BASE_URL}` : `http://${API_BASE_URL}`;
}

// Warn in console if using HTTP with HTTPS frontend (mixed content issue)
if (typeof window !== 'undefined' && window.location.protocol === 'https:' && API_BASE_URL.startsWith('http://')) {
  console.error('⚠️ Mixed Content Warning: Frontend is HTTPS but API is HTTP. Browsers will block these requests.');
  console.error('Please use HTTPS for the API or configure a reverse proxy with SSL.');
}

// Log API URL in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', API_BASE_URL);
}

export default API_BASE_URL;

