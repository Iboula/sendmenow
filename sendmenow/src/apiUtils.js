// API Utility Functions for safe JSON parsing and error handling

/**
 * Safely parse JSON response, handling HTML error pages
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>} Parsed JSON data
 */
export async function safeJsonParse(response) {
  const contentType = response.headers.get('content-type');
  
  // Clone the response so we can read it multiple times if needed
  const responseClone = response.clone();
  const text = await response.text();
  
  // Check if response is actually JSON
  if (!contentType || !contentType.includes('application/json')) {
    // If it's HTML, provide a helpful error message
    if (text.trim().startsWith('<!doctype') || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      throw new Error(`Server returned HTML instead of JSON. This usually means:
1. The API endpoint doesn't exist (404 error)
2. The API URL is incorrect
3. A web server is intercepting the request
      
Requested URL: ${response.url}
Status: ${response.status} ${response.statusText}`);
    }
    
    // If it's not JSON and not HTML, return the text as an error
    throw new Error(`Server returned non-JSON response: ${contentType}
Response: ${text.substring(0, 200)}`);
  }
  
  try {
    // Parse the text as JSON
    return JSON.parse(text);
  } catch (error) {
    // If JSON parsing fails, provide the text for debugging
    throw new Error(`Failed to parse JSON response: ${error.message}
Response text: ${text.substring(0, 200)}`);
  }
}

/**
 * Make an API request with proper error handling
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
export async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await safeJsonParse(response);

    if (!response.ok) {
      // If the response has an error message, use it
      const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Re-throw with more context if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to ${url}. Please check:
1. The server is running
2. The API URL is correct
3. CORS is properly configured
4. Your internet connection`);
    }
    throw error;
  }
}
