# Backend Server Setup

## Prerequisites
- Node.js installed
- MySQL database server running

## Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. Create a `.env` file in the server directory with your configuration:
   - Copy `env.template` to `.env`: `cp env.template .env` (Linux/Mac) or copy the file manually (Windows)
   - Edit `.env` and fill in your actual values

   Required configuration:
   ```
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=sendmenow_db
   DB_PORT=3306
   PORT=5000
   
   # Email Configuration (Required for password reset and photo sending)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password-here
   EMAIL_FROM=your-email@gmail.com
   FRONTEND_URL=http://localhost:3000
   ```

   **Email Setup Instructions:**
   - For Gmail: You need to use an App Password (not your regular password)
     1. Go to https://myaccount.google.com/apppasswords
     2. Generate an app password for "Mail"
     3. Use that app password as `EMAIL_PASSWORD`
   - For other email providers, see `env.template` for configuration details

3. Create the database and table:
   - Open MySQL command line or MySQL Workbench
   - Run the SQL commands from `database.sql`:
   ```bash
   mysql -u root -p < database.sql
   ```
   Or copy and paste the contents of `database.sql` into your MySQL client

## Running the Server

Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

- `POST /api/users` - Register a new user
  - Body: `{ userName, userEmail, userPassword }`
  - Returns: `{ success: true, message: 'User registered successfully', userId: <id> }`

- `GET /api/health` - Health check endpoint

- `GET /api/email-config` - Check email configuration status
  - Returns: Email configuration details (in development mode) or status (in production)

- `POST /api/forgot-password` - Request password reset
  - Body: `{ userEmail }`
  - Returns: `{ success: true, message: 'Password reset link has been sent to your email.' }`

- `POST /api/reset-password` - Reset password with token
  - Body: `{ token, userEmail, newPassword }`
  - Returns: `{ success: true, message: 'Password has been reset successfully.' }`

- `POST /api/send-photo` - Send photo via email
  - Body: FormData with `photo` (file), `recipientEmail`, `message`, `subject` (optional), `senderName` (optional)
  - Returns: `{ success: true, message: 'Photo sent successfully!', messageId: <id> }`

