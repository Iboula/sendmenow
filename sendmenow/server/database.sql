-- Create database
CREATE DATABASE IF NOT EXISTS sendmenow_db;

-- Use the database
USE sendmenow_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userName VARCHAR(255) NOT NULL,
  userEmail VARCHAR(255) NOT NULL UNIQUE,
  userPassword VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_userEmail ON users(userEmail);

