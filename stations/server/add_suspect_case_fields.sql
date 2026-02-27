-- Add case-related fields to suspects table
USE stations_db;

ALTER TABLE suspects 
ADD COLUMN has_case BOOLEAN DEFAULT FALSE,
ADD COLUMN case_id INT NULL;

-- Add foreign key constraint for case_id
ALTER TABLE suspects 
ADD CONSTRAINT fk_suspect_case 
FOREIGN KEY (case_id) REFERENCES cases(case_id) 
ON DELETE SET NULL;
