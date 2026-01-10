# Fix: Mixed Content Error (HTTPS page requesting HTTP resource)

## The Problem

Your frontend is served over **HTTPS** (`https://sendmenow.ca/`), but it's trying to make API calls to an **HTTP** endpoint (`http://160.153.182.85:3001`).

Modern browsers block **mixed content** (HTTPS pages requesting HTTP resources) for security reasons.

## The Solution

You have three options:

### Option 1: Use HTTPS for API (Recommended)

Update the API to use HTTPS. This requires:

1. **SSL Certificate** for the API server
2. **HTTPS configuration** on the API server

Then update `.env.production`:
```env
REACT_APP_API_URL=https://160.153.182.85:3001
```

### Option 2: Use a Reverse Proxy with HTTPS (Best Practice)

Use a reverse proxy (nginx or Apache) with SSL to proxy HTTPS requests to your HTTP backend:

**Example nginx configuration:**
```nginx
server {
    listen 443 ssl;
    server_name api.sendmenow.ca;  # or use your IP

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://160.153.182.85:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then update `.env.production`:
```env
REACT_APP_API_URL=https://api.sendmenow.ca
```

### Option 3: Use Same Domain/Subdomain (Also Good)

If your API is on the same domain or subdomain, you can use a relative URL:

```env
REACT_APP_API_URL=https://sendmenow.ca/api
```

And configure your web server to proxy `/api/*` requests to `http://160.153.182.85:3001`.

## Current Configuration

I've updated `.env.production` to use HTTPS:
```env
REACT_APP_API_URL=https://160.153.182.85:3001
```

**Important:** The API server at `160.153.182.85:3001` must support HTTPS, or you'll get connection errors.

## Setting Up HTTPS on Node.js Server

If you need to add HTTPS to your Node.js server:

1. **Get SSL Certificate** (Let's Encrypt, or your provider)

2. **Update server code:**
```javascript
const https = require('https');
const fs = require('fs');

const httpsOptions = {
  key: fs.readFileSync('/path/to/private-key.pem'),
  cert: fs.readFileSync('/path/to/certificate.pem')
};

https.createServer(httpsOptions, app).listen(3001, () => {
  console.log('HTTPS Server running on port 3001');
});
```

3. **Or use a reverse proxy** (easier and more flexible)

## Testing

After setting up HTTPS:

```bash
# Test HTTPS endpoint
curl https://160.153.182.85:3001/api/health

# Should return:
# {"status":"Server is running"}
```

## Rebuild Required

After updating `.env.production`:

```bash
npm run build
```

Then deploy the new build.

## Quick Fix (Development/Testing Only)

If you need a quick fix for testing (NOT recommended for production):

1. Use HTTP for frontend: `http://sendmenow.ca` (instead of HTTPS)
2. Or use a browser extension to allow mixed content (security risk)

**Warning:** These are temporary solutions. For production, always use HTTPS for both frontend and API.
