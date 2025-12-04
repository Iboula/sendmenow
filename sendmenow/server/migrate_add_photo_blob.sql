-- Migration script to add photo BLOB columns to existing messages table
-- Run this if you already have a messages table without photo_data column

USE sendmenow_db;

-- Check if columns exist before adding (MySQL doesn't support IF NOT EXISTS in ALTER TABLE)
-- You may need to run these manually if the columns don't exist

-- Add photo_data column
ALTER TABLE messages ADD COLUMN photo_data LONGBLOB;

-- Add photo_mimetype column  
ALTER TABLE messages ADD COLUMN photo_mimetype VARCHAR(100);

-- Note: If you get "Duplicate column name" error, the columns already exist and you can ignore it

