# Production Build Guide

## Building for Production

To create a production build of the SendMeNow application:

### 1. Install Dependencies (if not already installed)
```bash
npm install
```

### 2. Set Production API URL (Optional)
For production deployment, set the `REACT_APP_API_URL` environment variable:

**Windows (PowerShell):**
```powershell
$env:REACT_APP_API_URL="https://your-production-api.com"
npm run build
```

**Windows (CMD):**
```cmd
set REACT_APP_API_URL=https://your-production-api.com
npm run build
```

**Linux/Mac:**
```bash
REACT_APP_API_URL=https://your-production-api.com npm run build
```

If `REACT_APP_API_URL` is not set, it will default to `http://localhost:5000` (for development).

### 3. Run Production Build
```bash
npm run build
```

This will create an optimized production build in the `build/` folder.

### 4. Verify Build
After building, check that the `build/` folder contains:
- `index.html` - Main HTML file
- `static/` - Optimized JavaScript and CSS files
- Other assets (images, etc.)

### 5. Deploy
The contents of the `build/` folder can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages
- Any web server (nginx, Apache, etc.)

## Build Output
The production build includes:
- Minified JavaScript and CSS
- Optimized assets
- Code splitting for better performance
- Production-ready React bundle

## Configuration
All API endpoints are now configurable via the `REACT_APP_API_URL` environment variable. The application will automatically use the correct API URL based on the environment.

## Troubleshooting
If the build fails:
1. Ensure all dependencies are installed: `npm install`
2. Check for syntax errors in the code
3. Verify Node.js version is 14 or higher
4. Check the console for specific error messages
