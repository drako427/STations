const mysql = require('mysql2/promise');

async function testPropertiesTable() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'stations_db'
        });

        console.log('🔍 Testing properties table...');
        
        // Check if table exists
        const [tables] = await connection.execute("SHOW TABLES LIKE 'properties'");
        console.log('Tables found:', tables);
        
        if (tables.length === 0) {
            console.log('❌ Properties table does not exist. Creating...');
            
            // Create the table
            await connection.execute(`
                CREATE TABLE properties (
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
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            
            console.log('✅ Properties table created successfully!');
            
            // Add sample data
            await connection.execute(`
                INSERT INTO properties (station_id, registered_by, property_code, item_name, description, category, estimated_value, status, location_found, owner_name, owner_contact) VALUES
                (1, 1, 'PROP-1736755200000', 'MacBook Pro 16"', 'Silver MacBook Pro with Touch ID', 'Personal Electronics', 2499.99, 'missing', 'Central Station', 'John Doe', '555-0123'),
                (1, 1, 'PROP-1736755200001', 'Rolex Submariner', 'Black Rolex Submariner watch', 'Jewelry', 8500.00, 'recovered', 'East Sector', 'Jane Smith', '555-0456')
            `);
            
            console.log('✅ Sample data added successfully!');
        } else {
            console.log('✅ Properties table already exists!');
            
            // Show table structure
            const [structure] = await connection.execute("DESCRIBE properties");
            console.log('Table structure:', structure);
            
            // Show sample data
            const [data] = await connection.execute("SELECT * FROM properties LIMIT 3");
            console.log('Sample data:', data);
        }
        
        await connection.end();
        console.log('✅ Test completed successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testPropertiesTable();
