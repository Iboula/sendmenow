const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { sendEmailNotification, emailTemplates } = require('./utils/emailService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development, or specify allowed origins in production
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      callback(null, true);
    } else {
      // In production, specify allowed origins
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.FRONTEND_URL
      ].filter(Boolean);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

// Enable CORS with options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'sendmenow',
  port: process.env.DB_PORT || 3306
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// API Route to handle form submission
app.post('/api/users', (req, res) => {
  const { userName, userEmail, userPassword } = req.body;

  // Validate input
  if (!userName || !userEmail || !userPassword) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }

  // Insert user into database
  const query = 'INSERT INTO users (user_name, user_mail, user_password) VALUES (?, ?, ?)';
  
  db.query(query, [userName, userEmail, userPassword], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error saving user to database',
        error: err.message 
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      userId: result.insertId 
    });
  });
});

// API Route for user login/authentication
app.post('/api/login', (req, res) => {
  const { userName, userPassword } = req.body;

  // Validate input
  if (!userName || !userPassword) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required' 
    });
  }

  // Query user from database
  // Note: In production, passwords should be hashed and compared securely
  const query = 'SELECT * FROM users WHERE user_name = ? AND user_password = ?';
  
  db.query(query, [userName, userPassword], (err, results) => {
    if (err) {
      console.error('Error querying user:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error during login',
        error: err.message 
      });
    }

    if (results.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    // Login successful
    const user = results[0];
    res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      user: {
        id: user.id,
        userName: user.user_name || user.userName,
        userEmail: user.user_mail || user.userEmail
      },
      token: `token_${user.id}_${Date.now()}` // Simple token for demo (use JWT in production)
    });
  });
});

// API Route to send photo with message via email
app.post('/api/send-photo', upload.single('photo'), async (req, res) => {
  try {
    // Validate required fields
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Photo is required'
      });
    }

    const { recipientEmail, message, subject, senderName } = req.body;

    if (!recipientEmail || !message) {
      // Clean up uploaded file if validation fails
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Recipient email and message are required'
      });
    }

    // Prepare email content
    const emailSubject = subject || 'Photo from SendMeNow';
    const emailMessage = message;
    const greeting = senderName ? `Hello from ${senderName}!` : 'Hello!';
    const details = `<p><strong>Message:</strong></p><p>${emailMessage}</p><p>Please see the attached photo.</p>`;

    // Send email with photo attachment using emailService
    try {
      const emailResult = await sendEmailNotification({
        to: recipientEmail,
        subject: emailSubject,
        greeting: greeting,
        message: emailMessage,
        details: details,
        additionalInfo: 'Thank you for using SendMeNow!',
        attachments: [
          {
            filename: req.file.originalname,
            path: req.file.path
          }
        ]
      });
      
      // Clean up uploaded file after sending
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }

      console.log('Photo email sent successfully:', emailResult.messageId);

      res.status(200).json({
        success: true,
        message: 'Photo sent successfully!',
        messageId: emailResult.messageId
      });

    } catch (emailError) {
      console.error('Error sending email:', emailError);
      
      // Clean up uploaded file on error
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(500).json({
        success: false,
        message: emailError.message || 'Failed to send email. Please check your email configuration.',
        error: emailError.message
      });
    }

  } catch (error) {
    console.error('Error processing photo upload:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error processing photo upload',
      error: error.message
    });
  }
});

// API Route for forgot password
app.post('/api/forgot-password', async (req, res) => {
  const { userEmail } = req.body;

  // Validate input
  if (!userEmail) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email is required' 
    });
  }

  try {
    // Check if user exists
    const userQuery = 'SELECT * FROM users WHERE user_mail = ? OR userEmail = ?';
    
    db.query(userQuery, [userEmail, userEmail], async (err, results) => {
      if (err) {
        console.error('Error querying user:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Error processing request',
          error: err.message 
        });
      }

      // Always return success message for security (don't reveal if email exists)
      if (results.length === 0) {
        return res.status(200).json({ 
          success: true, 
          message: 'If an account with that email exists, a password reset link has been sent.' 
        });
      }

      const user = results[0];
      const userName = user.user_name || user.userName;
      const userEmailValue = user.user_mail || user.userEmail;

      // Generate secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

      // Delete any existing tokens for this user
      const deleteQuery = 'DELETE FROM password_reset_tokens WHERE userEmail = ?';
      db.query(deleteQuery, [userEmailValue], (deleteErr) => {
        if (deleteErr) {
          console.error('Error deleting old tokens:', deleteErr);
        }

        // Insert new token
        const insertQuery = 'INSERT INTO password_reset_tokens (userEmail, token, expiresAt) VALUES (?, ?, ?)';
        db.query(insertQuery, [userEmailValue, resetToken, expiresAt], async (insertErr) => {
          if (insertErr) {
            console.error('Error inserting reset token:', insertErr);
            return res.status(500).json({ 
              success: false, 
              message: 'Error generating reset token',
              error: insertErr.message 
            });
          }

          // Generate reset link
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmailValue)}`;

          // Send password reset email
          try {
            const emailData = emailTemplates.passwordReset(userName, resetLink);
            emailData.to = userEmailValue;

            await sendEmailNotification(emailData);

            res.status(200).json({ 
              success: true, 
              message: 'Password reset link has been sent to your email.' 
            });
          } catch (emailError) {
            console.error('Error sending password reset email:', emailError);
            // Still return success to user, but log the error
            res.status(200).json({ 
              success: true, 
              message: 'If an account with that email exists, a password reset link has been sent.' 
            });
          }
        });
      });
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing request',
      error: error.message 
    });
  }
});

// API Route for reset password
app.post('/api/reset-password', (req, res) => {
  const { token, userEmail, newPassword } = req.body;

  // Validate input
  if (!token || !userEmail || !newPassword) {
    return res.status(400).json({ 
      success: false, 
      message: 'Token, email, and new password are required' 
    });
  }

  // Validate password length
  if (newPassword.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password must be at least 6 characters long' 
    });
  }

  // Verify token
  const tokenQuery = 'SELECT * FROM password_reset_tokens WHERE token = ? AND userEmail = ? AND expiresAt > NOW()';
  
  db.query(tokenQuery, [token, userEmail], (err, results) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error verifying reset token',
        error: err.message 
      });
    }

    if (results.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    // Update user password
    const updateQuery = 'UPDATE users SET user_password = ? WHERE (user_mail = ? OR userEmail = ?)';
    
    db.query(updateQuery, [newPassword, userEmail, userEmail], (updateErr, updateResults) => {
      if (updateErr) {
        console.error('Error updating password:', updateErr);
        return res.status(500).json({ 
          success: false, 
          message: 'Error updating password',
          error: updateErr.message 
        });
      }

      if (updateResults.affectedRows === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Delete used token
      const deleteQuery = 'DELETE FROM password_reset_tokens WHERE token = ?';
      db.query(deleteQuery, [token], (deleteErr) => {
        if (deleteErr) {
          console.error('Error deleting used token:', deleteErr);
          // Don't fail the request if token deletion fails
        }

        res.status(200).json({ 
          success: true, 
          message: 'Password has been reset successfully. You can now login with your new password.' 
        });
      });
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Email configuration check endpoint
app.get('/api/email-config', (req, res) => {
  const { verifyEmailConfig } = require('./utils/emailService');
  const config = verifyEmailConfig();
  
  // Don't expose sensitive info in production
  if (process.env.NODE_ENV === 'production') {
    res.json({
      configured: config.configured,
      message: config.configured 
        ? 'Email is configured' 
        : 'Email configuration is incomplete. Please check your .env file.'
    });
  } else {
    res.json({
      configured: config.configured,
      hasAuth: config.hasAuth,
      hasHost: config.hasHost,
      hasPort: config.hasPort,
      host: config.host,
      port: config.port,
      secure: config.secure,
      from: config.from,
      message: config.configured 
        ? 'Email is configured correctly' 
        : 'Email configuration is incomplete. Please set EMAIL_USER, EMAIL_PASSWORD, EMAIL_HOST, and EMAIL_PORT in your .env file.'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

