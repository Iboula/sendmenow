# Fix: "Unexpected token '<', "<!doctype "... is not valid JSON"

## What This Error Means

This error occurs when the frontend expects JSON from the API, but receives HTML instead. This typically happens when:

1. **Wrong API URL** - The URL points to a web page instead of the API endpoint
2. **404 Error Page** - The API endpoint doesn't exist and a web server returns an HTML 404 page
3. **Reverse Proxy Issue** - A web server (nginx, Apache) is intercepting requests and returning HTML

## Solution Applied

I've added a `safeJsonParse()` utility function that:
- Checks if the response is actually JSON before parsing
- Detects HTML responses and provides helpful error messages
- Gives specific guidance on what to check

## How to Fix

### 1. Check Your API URL

Verify your `.env.production` file has the correct API URL:

```env
REACT_APP_API_URL=https://sendmenow.ca
```

**Important:** 
- If your API is on a different port: `https://sendmenow.ca:5000`
- If your API is on a subdomain: `https://api.sendmenow.ca`
- Must include the full URL with protocol

### 2. Verify API Endpoint Exists

Test the API endpoint directly:

```bash
# Test health endpoint
curl https://sendmenow.ca/api/health

# Should return JSON:
# {"status":"Server is running"}
```

If you get HTML instead, the endpoint doesn't exist or the URL is wrong.

### 3. Check Server Configuration

**If using a reverse proxy (nginx/Apache):**

Make sure API routes (`/api/*`) are proxied to your Node.js server, not served as static files.

**Example nginx config:**
```nginx
location /api {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### 4. Rebuild Frontend

After fixing the API URL:

```bash
npm run build
```

### 5. Check Browser Console

The new error handler will now show:
- The exact URL that was requested
- Whether HTML was returned instead of JSON
- Specific guidance on what to check

## Common Scenarios

### Scenario 1: API on Same Domain, Different Port
```
Frontend: https://sendmenow.ca
Backend: https://sendmenow.ca:5000

.env.production:
REACT_APP_API_URL=https://sendmenow.ca:5000
```

### Scenario 2: API on Subdomain
```
Frontend: https://sendmenow.ca
Backend: https://api.sendmenow.ca

.env.production:
REACT_APP_API_URL=https://api.sendmenow.ca
```

### Scenario 3: API Behind Reverse Proxy
```
Frontend: https://sendmenow.ca
Backend: https://sendmenow.ca/api (via nginx)

.env.production:
REACT_APP_API_URL=https://sendmenow.ca
```

## Testing

1. Open browser DevTools (F12)
2. Go to Network tab
3. Make an API request
4. Check the response:
   - **If JSON**: Content-Type should be `application/json`
   - **If HTML**: You'll see the error message with guidance

## Next Steps

The error handler will now provide specific guidance. Follow the error message to:
1. Verify the API URL is correct
2. Check if the endpoint exists
3. Verify server/reverse proxy configuration
