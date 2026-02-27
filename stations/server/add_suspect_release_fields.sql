-- Add release fields to suspects table
USE stations_db;

ALTER TABLE suspects 
ADD COLUMN released BOOLEAN DEFAULT FALSE,
ADD COLUMN released_at TIMESTAMP NULL,
ADD COLUMN bail_amount DECIMAL(10, 2) NULL,
ADD COLUMN timeout_hours INT NULL,
ADD COLUMN status ENUM('Active Investigation', 'Apprehended', 'Released') DEFAULT 'Active Investigation' AFTER crime_committed;

-- Update existing records to have default status
UPDATE suspects SET status = 'Active Investigation' WHERE status IS NULL;
