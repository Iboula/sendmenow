# Troubleshooting 404 Errors from API Calls

## Common Causes of 404 Errors

### 1. API Server Not Running or Wrong Port

The API server at `http://160.153.182.85:3001` may not be running or may be on a different port.

**Check:**
```bash
# Test if the server is accessible
curl http://160.153.182.85:3001/api/health

# Should return: {"status":"Server is running"}
# If you get connection refused, the server isn't running
# If you get 404, the route doesn't exist
```

### 2. Server Running on Different Port

Your server is configured to run on port **5000** by default, but you're calling port **3001**.

**Check `server/.env`:**
```env
PORT=3001
```

Or update `.env.production` to use port 5000:
```env
REACT_APP_API_URL=http://160.153.182.85:5000
```

### 3. Routes Don't Match

All API routes start with `/api/`. Make sure your requests are using the correct paths:

**Available API Routes:**
- `POST /api/users` - Register user
- `POST /api/login` - Login
- `POST /api/send-photo` - Send photo
- `POST /api/forgot-password` - Forgot password
- `POST /api/reset-password` - Reset password
- `GET /api/health` - Health check
- `GET /api/received-messages` - Get messages
- `GET /api/message-photo/:messageId` - Get photo
- `GET /api/user-profile-qrcode/:userId` - Get QR code
- `GET /api/qrcode` - Generate QR code
- `POST /api/qrcode` - Generate QR code (POST)
- `POST /api/cleanup-old-messages` - Cleanup

### 4. Server Route Handler Issue

The 404 handler should return JSON. Check if it's configured correctly.

### 5. Reverse Proxy or Load Balancer

If you're using nginx or another reverse proxy, it might be:
- Not forwarding requests correctly
- Stripping the `/api` prefix
- Routing to the wrong backend

## Quick Diagnostic Steps

### Step 1: Test API Health Endpoint

```bash
curl http://160.153.182.85:3001/api/health
```

**Expected response:**
```json
{"status":"Server is running"}
```

**If you get connection refused:**
- Server isn't running
- Wrong IP/port
- Firewall blocking

**If you get 404:**
- Route doesn't exist
- Server is running but routes aren't configured
- Wrong base path

### Step 2: Check Server Logs

Look at the server logs to see:
- If requests are reaching the server
- What routes are being requested
- Any error messages

### Step 3: Verify Server Configuration

Check `server/.env`:
```env
PORT=3001  # Must match the port in REACT_APP_API_URL
NODE_ENV=production
```

### Step 4: Check Browser Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Make an API request
4. Check:
   - Request URL (is it correct?)
   - Status code (404, 500, etc.)
   - Response (what's being returned?)

### Step 5: Test Different Endpoints

Try the health endpoint first (simplest):
```bash
curl http://160.153.182.85:3001/api/health
```

If that works, try a more complex endpoint.

## Solutions

### Solution 1: Update Port Configuration

If your server runs on port 5000, update `.env.production`:
```env
REACT_APP_API_URL=http://160.153.182.85:5000
```

Or if it runs on 3001, update `server/.env`:
```env
PORT=3001
```

### Solution 2: Verify Server is Running

On the server machine:
```bash
cd server
npm start
```

Or check if it's already running:
```bash
# Linux/Mac
ps aux | grep node

# Or check what's listening on port 3001
netstat -tulpn | grep 3001
# or
lsof -i :3001
```

### Solution 3: Check Server Route Order

Make sure routes are defined before the 404 handler. The 404 handler should be at the very end.

### Solution 4: Test API Directly

Test the API with curl or Postman to verify it's working:
```bash
# Health check
curl http://160.153.182.85:3001/api/health

# Login (example)
curl -X POST http://160.153.182.85:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"test","userPassword":"test"}'
```

## Common Scenarios

### Scenario 1: Server on Port 5000, Frontend Calls Port 3001

**Fix:** Update `.env.production`:
```env
REACT_APP_API_URL=http://160.153.182.85:5000
```

### Scenario 2: Server Not Running

**Fix:** Start the server:
```bash
cd server
npm start
```

### Scenario 3: Routes Not Configured

**Fix:** Make sure `server.js` is being used and routes are defined.

### Scenario 4: Reverse Proxy Issue

If using nginx, check configuration:
```nginx
location /api {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Next Steps

1. **Test the health endpoint first** - Simplest route
2. **Check server logs** - See what's happening
3. **Verify port configuration** - Make sure ports match
4. **Test with curl/Postman** - Verify API works independently
5. **Check browser console** - Look for specific error messages
