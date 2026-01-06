# Environment Configuration Guide

This guide explains how to configure the application for both development and production environments.

## Quick Start

### Development Setup
1. **Frontend**: No action needed - uses defaults or `.env.development`
2. **Backend**: Copy `server/env.development.template` to `server/.env` and update values

### Production Setup
1. **Frontend**: Update `.env.production` with production API URL
2. **Backend**: Copy `server/env.production.template` to `server/.env` and update with production values

## Frontend Configuration (React App)

### Development Environment

**File**: `.env.development` (automatically used by `npm start`)

```env
REACT_APP_API_URL=http://localhost:5000
NODE_ENV=development
```

**Usage**: Automatically loaded when running `npm start`

### Production Environment

**File**: `.env.production` (automatically used by `npm run build`)

```env
REACT_APP_API_URL=https://sendmenow.ca
NODE_ENV=production
```

**Usage**: Automatically loaded when running `npm run build`

### Environment File Priority

Create React App loads environment variables in this order (higher priority overrides lower):
1. `.env.development.local` / `.env.production.local` (highest priority, ignored by git)
2. `.env.local` (ignored by git)
3. `.env.development` / `.env.production`
4. `.env` (lowest priority)

## Backend Configuration (Server)

### Development Environment

**Template**: `server/env.development.template`  
**Actual Config**: `server/.env` (create from template)

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234
DB_NAME=sendmenow_db
DB_PORT=3306

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### Production Environment

**Template**: `server/env.production.template`  
**Actual Config**: `server/.env` (update with production values)

```env
# Database (Production)
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-secure-production-password
DB_NAME=sendmenow_db
DB_PORT=3306

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://sendmenow.ca

# Email (Production)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASSWORD=your-production-app-password
EMAIL_FROM=your-production-email@gmail.com
```

## Setup Instructions

### For Development

1. **Frontend**: Already configured - `.env.development` is set up
2. **Backend**: 
   ```bash
   cd server
   cp env.development.template .env
   # Edit .env with your local database and email credentials
   ```

### For Production

1. **Frontend**: 
   - Edit `.env.production` and set `REACT_APP_API_URL` to your production API URL
   - Run `npm run build`

2. **Backend**:
   ```bash
   cd server
   cp env.production.template .env
   # Edit .env with your production database and email credentials
   # Set NODE_ENV=production
   # Set FRONTEND_URL to your production frontend URL
   ```

## Environment Variables Reference

### Frontend (React)

| Variable | Development | Production | Description |
|----------|------------|------------|-------------|
| `REACT_APP_API_URL` | `http://localhost:5000` | `https://sendmenow.ca` | Backend API base URL |
| `NODE_ENV` | `development` | `production` | Environment mode |

### Backend (Server)

| Variable | Development | Production | Description |
|----------|------------|------------|-------------|
| `DB_HOST` | `localhost` | Production DB host | Database hostname |
| `DB_USER` | `root` | Production DB user | Database username |
| `DB_PASSWORD` | Local password | Production password | Database password |
| `DB_NAME` | `sendmenow_db` | `sendmenow_db` | Database name |
| `DB_PORT` | `3306` | `3306` | Database port |
| `PORT` | `5000` | `5000` | Server port |
| `NODE_ENV` | `development` | `production` | Environment mode |
| `FRONTEND_URL` | `http://localhost:3000` | `https://sendmenow.ca` | Frontend URL for redirects |
| `EMAIL_HOST` | `smtp.gmail.com` | `smtp.gmail.com` | SMTP server |
| `EMAIL_PORT` | `587` | `587` | SMTP port |
| `EMAIL_SECURE` | `false` | `false` | Use TLS |
| `EMAIL_USER` | Your email | Production email | Email username |
| `EMAIL_PASSWORD` | App password | Production app password | Email password |
| `EMAIL_FROM` | Your email | Production email | From address |

## Security Best Practices

### Development
- ✅ Use local/test credentials
- ✅ `.env` files are gitignored
- ✅ Safe to use simple passwords for local DB

### Production
- ⚠️ Use strong, unique passwords
- ⚠️ Never commit `.env` files with real credentials
- ⚠️ Use environment variable management services (AWS Secrets Manager, etc.)
- ⚠️ Enable SSL/TLS for database connections
- ⚠️ Use HTTPS for all endpoints
- ⚠️ Rotate credentials regularly
- ⚠️ Use separate email accounts for production

## Troubleshooting

### Frontend not connecting to backend
- Check `REACT_APP_API_URL` matches your backend URL
- Verify CORS is configured on backend
- Check browser console for errors

### Backend not starting
- Verify `.env` file exists in `server/` directory
- Check all required variables are set
- Verify database credentials are correct
- Check port 5000 is not in use

### Email not sending
- Verify email credentials are correct
- For Gmail, use App Password (not regular password)
- Check firewall/network allows SMTP connections
- Verify `EMAIL_FROM` matches `EMAIL_USER`

## File Structure

```
sendmenow/
├── .env.development          # Frontend dev config (committed)
├── .env.production            # Frontend prod config (committed)
├── .env.example               # Frontend template (committed)
├── .env.local                 # Frontend local overrides (gitignored)
├── server/
│   ├── .env                   # Backend actual config (gitignored)
│   ├── env.template           # Backend general template (committed)
│   ├── env.development.template  # Backend dev template (committed)
│   └── env.production.template   # Backend prod template (committed)
```

## Switching Between Environments

### Development → Production

1. **Frontend**:
   ```bash
   # .env.production is already configured
   npm run build
   ```

2. **Backend**:
   ```bash
   cd server
   # Update .env with production values
   # Set NODE_ENV=production
   npm start
   ```

### Production → Development

1. **Frontend**:
   ```bash
   npm start  # Uses .env.development automatically
   ```

2. **Backend**:
   ```bash
   cd server
   # Update .env with development values
   # Set NODE_ENV=development
   npm run dev  # or npm start
   ```
