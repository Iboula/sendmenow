# Production Environment Configuration

This guide explains how to set up environment variables for production deployment.

## React Frontend (.env.production)

Create a `.env.production` file in the root directory with the following:

```env
# Production API URL
REACT_APP_API_URL=https://your-production-api-url.com
```

**Note:** Create React App automatically uses `.env.production` when you run `npm run build`.

### Example:
```env
REACT_APP_API_URL=https://api.sendmenow.com
```

## Server Backend (server/.env)

Update your `server/.env` file with production settings:

```env
# Database Configuration
DB_HOST=your-production-db-host
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=sendmenow_db
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (for password reset links and other redirects)
FRONTEND_URL=https://your-production-frontend-url.com

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

## Environment Files Overview

### Frontend (React App)
- `.env.production` - Used automatically during `npm run build` (should be committed)
- `.env.local` - Local overrides (ignored by git)
- `.env.development.local` - Development overrides (ignored by git)

### Backend (Server)
- `server/.env` - Main environment file (ignored by git, contains secrets)
- `server/env.template` - Template file (committed, no secrets)

## Security Notes

1. **Never commit** `.env` files that contain secrets (passwords, API keys)
2. **Do commit** `.env.production` for React (it only contains public configuration)
3. **Do commit** `env.template` files (they serve as documentation)
4. Use secure passwords and API keys in production
5. Consider using environment variable management services (AWS Secrets Manager, etc.) for production

## Setting Environment Variables

### For React Build (Production)
```bash
# Option 1: Create .env.production file (recommended)
# Create .env.production with REACT_APP_API_URL=https://your-api.com

# Option 2: Set inline (one-time)
REACT_APP_API_URL=https://your-api.com npm run build

# Option 3: Export in shell (temporary)
export REACT_APP_API_URL=https://your-api.com
npm run build
```

### For Server (Production)
```bash
# Update server/.env file with production values
# The server will automatically load from .env file
```

## Deployment Checklist

- [ ] Create `.env.production` with production API URL
- [ ] Update `server/.env` with production database credentials
- [ ] Set `NODE_ENV=production` in server `.env`
- [ ] Update `FRONTEND_URL` in server `.env` to production URL
- [ ] Verify email configuration for production
- [ ] Test production build: `npm run build`
- [ ] Verify API connectivity from production frontend
- [ ] Test password reset flow in production
- [ ] Ensure CORS is properly configured for production domains
