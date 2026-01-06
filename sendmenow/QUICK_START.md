# Quick Start Guide

## Development Setup

### 1. Frontend (React)
```bash
# No configuration needed - uses .env.development automatically
npm start
```
- Runs on: `http://localhost:3000`
- API URL: `http://localhost:5000` (from `.env.development`)

### 2. Backend (Server)
```bash
cd server
# Copy development template
cp env.development.template .env
# Edit .env with your local database credentials
npm run dev
```
- Runs on: `http://localhost:5000`
- Database: Local MySQL instance

## Production Setup

### 1. Frontend Build
```bash
# .env.production is already configured with https://sendmenow.ca
npm run build
```
- Output: `build/` folder
- API URL: `https://sendmenow.ca` (from `.env.production`)

### 2. Backend
```bash
cd server
# Copy production template
cp env.production.template .env
# Edit .env with production credentials
# Set NODE_ENV=production
npm start
```

## Environment Files

### Frontend
- `.env.development` - Auto-loaded with `npm start` ✅
- `.env.production` - Auto-loaded with `npm run build` ✅
- `.env.local` - Local overrides (gitignored)

### Backend
- `server/.env` - Actual config (gitignored, create from template)
- `server/env.development.template` - Dev template ✅
- `server/env.production.template` - Prod template ✅

## Current Configuration

### Development
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Database: `localhost:3306`

### Production
- Frontend: Deployed to static hosting
- Backend: `https://sendmenow.ca`
- API: `https://sendmenow.ca`

For detailed configuration, see `ENV_CONFIG.md`
