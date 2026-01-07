// API Configuration
// In production, set REACT_APP_API_URL environment variable
// For development, defaults to http://localhost:5000

// Get API URL from environment variable
let API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// If REACT_APP_API_URL is set but doesn't include protocol, add https
if (API_BASE_URL && !API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
  API_BASE_URL = `https://${API_BASE_URL}`;
}

// Log API URL in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', API_BASE_URL);
}

export default API_BASE_URL;

