-- Add image column to suspects table
ALTER TABLE suspects ADD COLUMN image VARCHAR(255) NULL AFTER is_national;
