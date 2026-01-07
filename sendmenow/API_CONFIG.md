# API Configuration

## Current Production API Configuration

**API URL:** `http://160.153.182.85:3001`

This is configured in `.env.production` and will be used when you run `npm run build`.

## Configuration Files

### Frontend (React App)

**File:** `.env.production`
```env
REACT_APP_API_URL=http://160.153.182.85:3001
NODE_ENV=production
```

**File:** `.env.development` (for local development)
```env
REACT_APP_API_URL=http://localhost:5000
NODE_ENV=development
```

### Backend (Server)

**Important:** The backend server at `http://160.153.182.85:3001` needs to have CORS configured to allow requests from your frontend domain.

**File:** `server/.env`
```env
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

Or if your frontend is also on an IP address:
```env
FRONTEND_URL=http://your-frontend-ip:port
NODE_ENV=production
```

## Building for Production

After updating `.env.production`, rebuild the frontend:

```bash
npm run build
```

The build will use the API URL from `.env.production`.

## Testing the API

Test if the API is accessible:

```bash
# Health check
curl http://160.153.182.85:3001/api/health

# Should return:
# {"status":"Server is running"}
```

## CORS Configuration

The backend server at `160.153.182.85:3001` must allow CORS requests from your frontend. 

If you control the backend server, ensure:
1. The `FRONTEND_URL` environment variable is set to your frontend URL
2. CORS is properly configured in the server code
3. The server allows requests from your frontend origin

## Troubleshooting

### API calls not working?

1. **Check API is accessible:**
   ```bash
   curl http://160.153.182.85:3001/api/health
   ```

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for CORS errors or network errors
   - Check the Network tab to see the actual request/response

3. **Verify environment variable:**
   - After building, check that the API URL is correct
   - The build process embeds `REACT_APP_API_URL` at build time

4. **Check CORS:**
   - If you see CORS errors, the backend needs to allow your frontend origin
   - Update `server/.env` with the correct `FRONTEND_URL`

## Changing the API URL

To change the API URL:

1. Edit `.env.production`:
   ```env
   REACT_APP_API_URL=http://your-new-api-url:port
   ```

2. Rebuild:
   ```bash
   npm run build
   ```

3. Deploy the new build
