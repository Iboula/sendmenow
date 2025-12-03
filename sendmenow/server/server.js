const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendEmailNotification } = require('./utils/emailService');
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
    const details = `<p><strong>Message:</strong></p><p>${emailMessage}</p>`;

    // Send email with photo attachment
    try {
      const nodemailer = require('nodemailer');
      const emailConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD
        }
      };

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: emailConfig.auth.user ? emailConfig.auth : undefined
      });

      // Load email template
      const templatePath = path.join(__dirname, 'templates/emailTemplate.html');
      let htmlContent = '';
      
      if (fs.existsSync(templatePath)) {
        let template = fs.readFileSync(templatePath, 'utf8');
        htmlContent = template
          .replace(/{{subject}}/g, emailSubject)
          .replace(/{{greeting}}/g, greeting)
          .replace(/{{message}}/g, emailMessage)
          .replace(/{{details}}/g, details)
          .replace(/{{year}}/g, new Date().getFullYear());
      } else {
        // Fallback HTML if template doesn't exist
        htmlContent = `
          <html>
            <body>
              <h2>${greeting}</h2>
              <p>${emailMessage}</p>
              <p>Please see the attached photo.</p>
            </body>
          </html>
        `;
      }

      // Email options with attachment
      const mailOptions = {
        from: process.env.EMAIL_FROM || emailConfig.auth?.user || 'noreply@sendmenow.com',
        to: recipientEmail,
        subject: emailSubject,
        html: htmlContent,
        text: `${greeting}\n\n${emailMessage}\n\nPlease see the attached photo.`,
        attachments: [
          {
            filename: req.file.originalname,
            path: req.file.path
          }
        ]
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      
      // Clean up uploaded file after sending
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }

      console.log('Photo email sent successfully:', info.messageId);

      res.status(200).json({
        success: true,
        message: 'Photo sent successfully!',
        messageId: info.messageId
      });

    } catch (emailError) {
      console.error('Error sending email:', emailError);
      
      // Clean up uploaded file on error
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to send email. Please check your email configuration.',
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

