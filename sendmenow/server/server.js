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
  database: process.env.DB_NAME || 'sendmenow_db',
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
  let messageId = null;
  let permanentPhotoPath = null;

  try {
    // Validate required fields
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Photo is required'
      });
    }

    const { recipientEmail, message, subject, senderName, senderId, senderEmail } = req.body;

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

    // Read image file as buffer for database storage
    const photoData = fs.readFileSync(req.file.path);
    const photoMimeType = req.file.mimetype || 'image/jpeg';
    
    // Optional: Keep a copy on filesystem for backup/reference
    const permanentDir = path.join(__dirname, 'uploads', 'messages');
    if (!fs.existsSync(permanentDir)) {
      fs.mkdirSync(permanentDir, { recursive: true });
    }
    
    const fileExtension = path.extname(req.file.originalname);
    const uniqueFilename = `msg-${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
    permanentPhotoPath = path.join(permanentDir, uniqueFilename);
    
    // Copy file to permanent location (optional backup)
    fs.copyFileSync(req.file.path, permanentPhotoPath);

    // Get sender info from database if senderId is provided
    let senderIdValue = senderId ? parseInt(senderId) : null;
    let senderEmailValue = senderEmail || null;
    let senderNameValue = senderName || 'Unknown';

    if (senderIdValue) {
      // Verify sender exists
      const senderQuery = 'SELECT id, user_name, user_mail FROM users WHERE id = ?';
      db.query(senderQuery, [senderIdValue], (err, results) => {
        if (!err && results.length > 0) {
          senderNameValue = results[0].user_name || senderNameValue;
          senderEmailValue = results[0].user_mail || senderEmailValue;
        }
      });
    }

    // Check if recipient is a registered user
    const recipientQuery = 'SELECT id FROM users WHERE user_mail = ?';
    db.query(recipientQuery, [recipientEmail], (err, recipientResults) => {
      const recipientIdValue = (!err && recipientResults.length > 0) ? recipientResults[0].id : null;

      // Save message to database with image as BLOB
      const insertMessageQuery = `INSERT INTO messages 
        (sender_id, sender_email, sender_name, recipient_email, recipient_id, subject, message, photo_filename, photo_path, photo_originalname, photo_data, photo_mimetype) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      db.query(insertMessageQuery, [
        senderIdValue,
        senderEmailValue,
        senderNameValue,
        recipientEmail,
        recipientIdValue,
        emailSubject,
        emailMessage,
        uniqueFilename,
        permanentPhotoPath,
        req.file.originalname,
        photoData,  // Store image as BLOB
        photoMimeType  // Store MIME type for proper serving
      ], async (insertErr, insertResult) => {
        if (insertErr) {
          console.error('Error saving message to database:', insertErr);
          // Continue with email sending even if DB save fails
        } else {
          messageId = insertResult.insertId;
        }

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
          
          // Clean up temporary uploaded file after sending (keep permanent copy)
          if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
          }

          console.log('Photo email sent successfully:', emailResult.messageId);

          res.status(200).json({
            success: true,
            message: 'Photo sent successfully!',
            messageId: emailResult.messageId,
            savedMessageId: messageId
          });

        } catch (emailError) {
          console.error('Error sending email:', emailError);
          
          // Clean up uploaded file on error
          if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
          }
          // Also clean up permanent copy if email failed
          if (permanentPhotoPath && fs.existsSync(permanentPhotoPath)) {
            fs.unlinkSync(permanentPhotoPath);
          }

          return res.status(500).json({
            success: false,
            message: emailError.message || 'Failed to send email. Please check your email configuration.',
            error: emailError.message
          });
        }
      });
    });

  } catch (error) {
    console.error('Error processing photo upload:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    // Clean up permanent copy on error
    if (permanentPhotoPath && fs.existsSync(permanentPhotoPath)) {
      fs.unlinkSync(permanentPhotoPath);
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
    const userQuery = 'SELECT * FROM users WHERE user_mail = ?';
    
    db.query(userQuery, [userEmail], async (err, results) => {
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

// API Route to get received messages for a user
app.get('/api/received-messages', (req, res) => {
  const { userEmail, userId } = req.query;

  if (!userEmail && !userId) {
    return res.status(400).json({
      success: false,
      message: 'userEmail or userId is required'
    });
  }

  // Build query to get messages for this user
  let query;
  let queryParams;

  if (userId) {
    query = `SELECT m.*, 
             u_sender.user_name as sender_user_name,
             u_sender.user_mail as sender_user_mail
             FROM messages m
             LEFT JOIN users u_sender ON m.sender_id = u_sender.id
             WHERE m.recipient_id = ? OR m.recipient_email = ?
             ORDER BY m.sent_at DESC`;
    queryParams = [userId, userEmail || ''];
  } else {
    query = `SELECT m.*, 
             u_sender.user_name as sender_user_name,
             u_sender.user_mail as sender_user_mail
             FROM messages m
             LEFT JOIN users u_sender ON m.sender_id = u_sender.id
             WHERE m.recipient_email = ?
             ORDER BY m.sent_at DESC`;
    queryParams = [userEmail];
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching messages:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching messages',
        error: err.message
      });
    }

    // Format results and create photo URLs
    const formattedMessages = results.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      senderName: msg.sender_name || msg.sender_user_name || 'Unknown',
      senderEmail: msg.sender_email || msg.sender_user_mail || 'Unknown',
      recipientEmail: msg.recipient_email,
      subject: msg.subject,
      message: msg.message,
      photoFilename: msg.photo_filename,
      photoPath: msg.photo_path,
      photoOriginalName: msg.photo_originalname,
      photoUrl: msg.photo_path ? `/api/message-photo/${msg.id}` : null,
      sentAt: msg.sent_at
    }));

    res.status(200).json({
      success: true,
      messages: formattedMessages,
      count: formattedMessages.length
    });
  });
});

// API Route to serve message photos from database
app.get('/api/message-photo/:messageId', (req, res) => {
  const messageId = req.params.messageId;

  // Get message from database with photo data
  const query = 'SELECT photo_data, photo_mimetype, photo_originalname, photo_path FROM messages WHERE id = ?';
  
  db.query(query, [messageId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message or photo not found'
      });
    }

    const message = results[0];
    
    // Try to serve from database BLOB first
    if (message.photo_data) {
      const contentType = message.photo_mimetype || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${message.photo_originalname || 'photo'}"`);
      res.send(message.photo_data);
      return;
    }
    
    // Fallback to filesystem if BLOB is not available (for backward compatibility)
    if (message.photo_path && fs.existsSync(message.photo_path)) {
      const ext = path.extname(message.photo_path).toLowerCase();
      const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      };
      const contentType = contentTypes[ext] || 'image/jpeg';
      
      res.setHeader('Content-Type', contentType);
      res.sendFile(path.resolve(message.photo_path));
      return;
    }

    // No photo data found
    return res.status(404).json({
      success: false,
      message: 'Photo not found in database or filesystem'
    });
  });
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

// Environment variables check endpoint (for debugging - only in development)
app.get('/api/env-check', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      message: 'This endpoint is not available in production' 
    });
  }

  // Check which environment variables are set (without showing values)
  const envVars = {
    // Database
    DB_HOST: process.env.DB_HOST ? '✓ Set' : '✗ Missing',
    DB_USER: process.env.DB_USER ? '✓ Set' : '✗ Missing',
    DB_PASSWORD: process.env.DB_PASSWORD ? '✓ Set' : '✗ Missing',
    DB_NAME: process.env.DB_NAME ? '✓ Set' : '✗ Missing',
    DB_PORT: process.env.DB_PORT ? '✓ Set' : '✗ Missing',
    
    // Server
    PORT: process.env.PORT ? '✓ Set' : '✗ Missing',
    NODE_ENV: process.env.NODE_ENV ? '✓ Set' : '✗ Missing',
    FRONTEND_URL: process.env.FRONTEND_URL ? '✓ Set' : '✗ Missing',
    
    // Email
    EMAIL_HOST: process.env.EMAIL_HOST ? '✓ Set' : '✗ Missing',
    EMAIL_PORT: process.env.EMAIL_PORT ? '✓ Set' : '✗ Missing',
    EMAIL_SECURE: process.env.EMAIL_SECURE ? '✓ Set' : '✗ Missing',
    EMAIL_USER: process.env.EMAIL_USER ? '✓ Set' : '✗ Missing',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ Missing',
    EMAIL_FROM: process.env.EMAIL_FROM ? '✓ Set' : '✗ Missing',
  };

  res.json({
    message: 'Environment variables check',
    dotenvLoaded: typeof process.env.DB_HOST !== 'undefined',
    variables: envVars,
    note: 'Values are hidden for security. This endpoint only shows if variables are set.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

