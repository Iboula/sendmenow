-- Create database
CREATE DATABASE IF NOT EXISTS sendmenow_db;

-- Use the database
USE sendmenow_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL,
  user_mail VARCHAR(255) NOT NULL UNIQUE,
  user_password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_user_mail ON users(user_mail);

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userEmail VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token (token),
  INDEX idx_userEmail (userEmail)
);

-- Create messages table to store sent photos and messages
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT,
  sender_email VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_id INT,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  photo_filename VARCHAR(255),
  photo_path VARCHAR(500),
  photo_originalname VARCHAR(255),
  photo_data LONGBLOB,
  photo_mimetype VARCHAR(100),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_recipient_email (recipient_email),
  INDEX idx_recipient_id (recipient_id),
  INDEX idx_sender_id (sender_id),
  INDEX idx_sent_at (sent_at)
);

-- If table already exists, add the new columns (run this manually if needed)
-- ALTER TABLE messages ADD COLUMN photo_data LONGBLOB;
-- ALTER TABLE messages ADD COLUMN photo_mimetype VARCHAR(100);

