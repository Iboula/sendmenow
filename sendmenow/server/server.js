const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

