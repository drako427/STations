-- Add access_code column to stations table
ALTER TABLE stations ADD COLUMN access_code VARCHAR(8) UNIQUE;

-- Update existing stations to have access codes (for testing)
UPDATE stations SET access_code = 'DEMO001' WHERE station_id = 1;
