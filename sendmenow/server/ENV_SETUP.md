# How to Set Up and Read .env File

## Quick Setup

1. **Copy the template file:**
   ```bash
   cd server
   cp env.template .env
   ```

2. **Edit the .env file** with your actual values:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=sendmenow_db
   DB_PORT=3306
   
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   
 EMAIL_HOST=smtp.gmail.com
 EMAIL_PORT=587
 EMAIL_SECURE=false
 EMAIL_USER=your-email@gmail.com
 EMAIL_PASSWORD=your-app-password
 EMAIL_FROM=your-email@gmail.com
   ```

## How It Works

The `.env` file is automatically loaded by `dotenv` when the server starts:

```javascript
require('dotenv').config(); // This line in server.js loads the .env file
```

After this line, all environment variables are available via `process.env.VARIABLE_NAME`.

## Accessing Environment Variables

In your code, access variables like this:

```javascript
// Example from server.js
const PORT = process.env.PORT || 5000; // Uses .env value or defaults to 5000
const dbHost = process.env.DB_HOST || 'localhost';
const emailUser = process.env.EMAIL_USER;
```

## Verify .env File is Being Read

### Method 1: Check Server Startup
When the server starts, it should use values from `.env`. Check the console output.

### Method 2: Use the API Endpoint
```bash
# Check environment variables (development only)
curl http://localhost:5000/api/env-check

# Check email configuration
curl http://localhost:5000/api/email-config
```

### Method 3: Add Temporary Logging
Add this temporarily to `server.js` after `require('dotenv').config();`:

```javascript
console.log('Environment check:');
console.log('DB_HOST:', process.env.DB_HOST ? 'Set' : 'Missing');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
```

## Important Notes

1. **Never commit .env to git** - It contains sensitive information
2. **The .env file must be in the `server` directory** (same folder as server.js)
3. **No spaces around the `=` sign** in .env file:
   ```env
   ✅ Correct: EMAIL_USER=user@example.com
   ❌ Wrong: EMAIL_USER = user@example.com
   ```
4. **No quotes needed** (unless the value contains spaces):
   ```env
   ✅ Correct: EMAIL_USER=user@example.com
   ✅ Also OK: EMAIL_USER="user@example.com"
   ```
5. **Restart the server** after changing .env file

## Troubleshooting

### .env file not being read?

1. **Check file location**: The `.env` file must be in the `server` directory
2. **Check file name**: It must be exactly `.env` (not `env.txt` or `.env.example`)
3. **Check dotenv is installed**: 
   ```bash
   cd server
   npm list dotenv
   ```
4. **Verify dotenv is required**: Make sure `require('dotenv').config();` is at the top of server.js
5. **Check for syntax errors**: Make sure there are no typos in variable names

### Test if dotenv is working:

Add this to the top of server.js (temporarily):
```javascript
require('dotenv').config();
console.log('Testing .env:', {
  PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST,
  EMAIL_USER: process.env.EMAIL_USER ? 'Set (hidden)' : 'Missing'
});
```

## Example .env File Structure

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=sendmenow_db
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@sendmenow.com
```

## Gmail Setup

If using Gmail:
1. Enable 2-Factor Authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password (not your regular password) in `EMAIL_PASSWORD`

