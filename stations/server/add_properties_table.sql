USE stations_db;

-- Create Properties Table
CREATE TABLE IF NOT EXISTS properties (
    property_id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT NOT NULL,
    registered_by INT,
    property_code VARCHAR(50) UNIQUE,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    estimated_value DECIMAL(10,2),
    status ENUM('missing', 'recovered', 'claimed', 'disposed') DEFAULT 'missing',
    location_found VARCHAR(255),
    date_reported DATE DEFAULT (CURRENT_DATE),
    date_found DATE,
    owner_name VARCHAR(100),
    owner_contact VARCHAR(100),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES stations(station_id) ON DELETE CASCADE,
    FOREIGN KEY (registered_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Add some sample data for testing
INSERT INTO properties (station_id, registered_by, property_code, item_name, description, category, estimated_value, status, location_found, owner_name, owner_contact) VALUES
(1, 1, 'PROP-1736755200000', 'MacBook Pro 16"', 'Silver MacBook Pro with Touch ID, 16GB RAM, 512GB SSD', 'Personal Electronics', 2499.99, 'missing', 'Central Station', 'John Doe', '555-0123'),
(1, 1, 'PROP-1736755200001', 'Rolex Submariner', 'Black Rolex Submariner watch with serial number', 'Jewelry', 8500.00, 'recovered', 'East Sector', 'Jane Smith', '555-0456'),
(1, 1, 'PROP-1736755200002', 'iPhone 14 Pro', 'Deep Purple iPhone 14 Pro, 256GB', 'Personal Electronics', 1099.00, 'missing', 'North District', 'Mike Johnson', '555-0789');
