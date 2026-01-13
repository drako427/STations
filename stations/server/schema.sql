CREATE DATABASE IF NOT EXISTS stations_db;
USE stations_db;

-- Set default storage engine to InnoDB
SET default_storage_engine=InnoDB;

-- 1. Stations Table
CREATE TABLE IF NOT EXISTS stations (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    station_name VARCHAR(100) NOT NULL,
    station_code VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(100),
    sector VARCHAR(50),
    jurisdiction_type ENUM('local', 'federal', 'national') DEFAULT 'local',
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    badge_number VARCHAR(50),
    rank VARCHAR(50),
    role ENUM('officer', 'detective', 'admin', 'dpo') DEFAULT 'officer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES stations(station_id) ON DELETE CASCADE
);

-- 3. Suspects Table
CREATE TABLE IF NOT EXISTS suspects (
    suspect_id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT NOT NULL,
    registered_by INT,
    suspect_code VARCHAR(50) UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    aliases TEXT,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other', 'unknown') DEFAULT 'unknown',
    nationality VARCHAR(100),
    physical_description TEXT,
    risk_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    crime_committed TEXT,
    is_national BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES stations(station_id) ON DELETE CASCADE,
    FOREIGN KEY (registered_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 4. Cases Table
CREATE TABLE IF NOT EXISTS cases (
    case_id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT NOT NULL,
    case_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    case_type VARCHAR(50) DEFAULT 'other',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('active', 'in_progress', 'closed', 'cold') DEFAULT 'active',
    lead_investigator_id INT,
    date_opened DATE DEFAULT (CURRENT_DATE),
    date_closed DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES stations(station_id) ON DELETE CASCADE,
    FOREIGN KEY (lead_investigator_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 5. Case-Suspect Relationship Table
-- Even this junction table includes station_id as requested
CREATE TABLE IF NOT EXISTS case_suspects (
    case_id INT NOT NULL,
    suspect_id INT NOT NULL,
    station_id INT NOT NULL,
    involvement_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (case_id, suspect_id),
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    FOREIGN KEY (suspect_id) REFERENCES suspects(suspect_id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(station_id) ON DELETE CASCADE
);
