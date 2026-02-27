const mysql = require('mysql2/promise');

async function createTables() {
    let connection;
    try {
        console.log('🔧 Creating database tables...');
        
        // Connect to MySQL
        connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '@Aboogie213',
            database: 'stations_db'
        });
        
        console.log('✅ Connected to MySQL database');
        
        // Create stations table
        await connection.execute(`
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
            )
        `);
        console.log('✅ Stations table created');
        
        // Create users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                station_id INT NOT NULL,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                badge_number VARCHAR(50),
                user_rank VARCHAR(50),
                role ENUM('officer', 'detective', 'admin', 'dpo') DEFAULT 'officer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (station_id) REFERENCES stations(station_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Users table created');
        
        // Create suspects table
        await connection.execute(`
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
            )
        `);
        console.log('✅ Suspects table created');
        
        // Create cases table
        await connection.execute(`
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
            )
        `);
        console.log('✅ Cases table created');
        
        // Create case_suspects table
        await connection.execute(`
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
            )
        `);
        console.log('✅ Case-suspects table created');
        
        // Create properties table
        await connection.execute(`
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
            )
        `);
        console.log('✅ Properties table created');
        
        // Insert sample data
        console.log('📝 Inserting sample data...');
        
        // Insert sample station
        const [stationResult] = await connection.execute(`
            INSERT IGNORE INTO stations (station_id, station_name, station_code, location, sector, jurisdiction_type)
            VALUES (1, 'Central Police Station', 'CPS-001', 'Downtown District', 'Central', 'local')
        `);
        
        // Insert sample user
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync('password123', 10);
        
        const [userResult] = await connection.execute(`
            INSERT IGNORE INTO users (user_id, station_id, username, email, password_hash, full_name, badge_number, user_rank, role)
            VALUES (1, 1, 'admin', 'admin@stations.com', ?, 'System Administrator', 'ADMIN-001', 'Chief', 'admin')
        `, [hashedPassword]);
        
        // Insert sample suspects
        await connection.execute(`
            INSERT IGNORE INTO suspects (station_id, registered_by, suspect_code, full_name, physical_description, risk_level, crime_committed)
            VALUES 
            (1, 1, 'SUS-001', 'John Doe', 'Male, 6ft, brown hair', 'high', 'Armed robbery'),
            (1, 1, 'SUS-002', 'Jane Smith', 'Female, 5ft6in, blonde hair', 'medium', 'Fraud'),
            (1, 1, 'SUS-003', 'Mike Johnson', 'Male, 5ft10in, black hair', 'low', 'Assault')
        `);
        
        // Insert sample properties
        await connection.execute(`
            INSERT IGNORE INTO properties (station_id, registered_by, property_code, item_name, description, category, estimated_value, status, location_found, owner_name, owner_contact)
            VALUES (1, 1, 'PROP-001', 'MacBook Pro 16"', 'Silver MacBook Pro with Touch ID', 'Personal Electronics', 2499.99, 'missing', 'Central Station', 'John Doe', '555-0123')
        `);
        
        console.log('✅ Sample data inserted successfully');
        console.log('🎉 Database setup complete!');
        
        // Verify tables were created
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📊 Tables created:', tables.map(t => Object.values(t)[0]));
        
    } catch (error) {
        console.error('❌ Error creating tables:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createTables();
