# Production API Troubleshooting Guide

## Common Issues and Solutions

### Issue: API calls not working in production

#### 1. Check API URL Configuration

**Frontend (.env.production):**
```env
REACT_APP_API_URL=https://sendmenow.ca
```

**Important:** 
- If your backend is on a different port, include it: `https://sendmenow.ca:5000`
- If your backend is on a subdomain: `https://api.sendmenow.ca`
- Must include the protocol (`https://` or `http://`)

#### 2. Check CORS Configuration

**Backend (server/.env):**
```env
FRONTEND_URL=https://sendmenow.ca
NODE_ENV=production
```

The CORS configuration now:
- Allows requests from the exact FRONTEND_URL
- Allows requests from www and non-www versions
- Allows requests from the same domain (handles subdomains)
- Logs blocked origins for debugging

#### 3. Verify Backend is Running

Check if the backend server is accessible:
```bash
curl https://sendmenow.ca/api/health
# Should return: {"status":"Server is running"}
```

#### 4. Check Browser Console

Open browser DevTools (F12) and check:
- **Console tab**: Look for CORS errors or network errors
- **Network tab**: Check if API requests are being made and what the response is

Common errors:
- `CORS policy: No 'Access-Control-Allow-Origin' header` → CORS issue
- `Failed to fetch` → Network/connection issue
- `404 Not Found` → API endpoint doesn't exist
- `500 Internal Server Error` → Server error

#### 5. Verify Environment Variables

**Frontend:**
- Check that `.env.production` exists and has `REACT_APP_API_URL` set
- Rebuild after changing: `npm run build`

**Backend:**
- Check that `server/.env` exists and has:
  - `NODE_ENV=production`
  - `FRONTEND_URL=https://sendmenow.ca` (or your frontend URL)
  - All database and email configuration

#### 6. Check Server Logs

Look at your server logs for:
- CORS warnings: `CORS blocked origin: ...`
- Database connection errors
- Other error messages

#### 7. Test API Endpoints Directly

Test if the API is accessible:
```bash
# Health check
curl https://sendmenow.ca/api/health

# Test with origin header (simulates browser request)
curl -H "Origin: https://sendmenow.ca" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://sendmenow.ca/api/health
```

## Configuration Examples

### Scenario 1: Backend on same domain, different port
```
Frontend: https://sendmenow.ca
Backend: https://sendmenow.ca:5000

.env.production:
REACT_APP_API_URL=https://sendmenow.ca:5000

server/.env:
FRONTEND_URL=https://sendmenow.ca
```

### Scenario 2: Backend on subdomain
```
Frontend: https://sendmenow.ca
Backend: https://api.sendmenow.ca

.env.production:
REACT_APP_API_URL=https://api.sendmenow.ca

server/.env:
FRONTEND_URL=https://sendmenow.ca
```

### Scenario 3: Backend on same domain, same port (reverse proxy)
```
Frontend: https://sendmenow.ca
Backend: https://sendmenow.ca/api (via reverse proxy)

.env.production:
REACT_APP_API_URL=https://sendmenow.ca

server/.env:
FRONTEND_URL=https://sendmenow.ca
```

## Debugging Steps

1. **Check API URL in browser console:**
   ```javascript
   // In browser console
   console.log('API URL:', process.env.REACT_APP_API_URL);
   ```

2. **Check CORS headers in response:**
   - Open Network tab in DevTools
   - Click on a failed API request
   - Check Response Headers for:
     - `Access-Control-Allow-Origin`
     - `Access-Control-Allow-Methods`
     - `Access-Control-Allow-Headers`

3. **Test API directly:**
   ```bash
   # Replace with your actual API endpoint
   curl -X POST https://sendmenow.ca/api/login \
     -H "Content-Type: application/json" \
     -H "Origin: https://sendmenow.ca" \
     -d '{"userName":"test","userPassword":"test"}'
   ```

4. **Check server logs for CORS warnings:**
   - Look for: `CORS blocked origin: ...`
   - This will show which origins are being blocked

## Quick Fixes

### Fix 1: Rebuild Frontend
After changing `.env.production`:
```bash
npm run build
```

### Fix 2: Restart Backend
After changing `server/.env`:
```bash
cd server
npm start
```

### Fix 3: Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

### Fix 4: Check HTTPS/HTTP Mismatch
- If frontend is HTTPS, backend must also be HTTPS (or use reverse proxy)
- Mixed content (HTTP API from HTTPS page) will be blocked by browsers

## Still Not Working?

1. Check server is actually running and accessible
2. Verify firewall/security groups allow connections
3. Check if reverse proxy (nginx, Apache) is configured correctly
4. Verify SSL certificates are valid
5. Check server logs for detailed error messages
