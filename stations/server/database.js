const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'data', 'stations.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
    } else {
        console.log('✅ SQLite database connected successfully');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    console.log('🔧 Initializing database tables...');
    
    // Stations table
    db.run(`
        CREATE TABLE IF NOT EXISTS stations (
            station_id INTEGER PRIMARY KEY AUTOINCREMENT,
            station_name TEXT NOT NULL,
            station_code TEXT UNIQUE NOT NULL,
            location TEXT,
            sector TEXT,
            jurisdiction_type TEXT DEFAULT 'local',
            phone TEXT,
            email TEXT,
            address TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('❌ Stations table error:', err);
        else console.log('✅ Stations table ready');
    });

    // Suspects table
    db.run(`
        CREATE TABLE IF NOT EXISTS suspects (
            suspect_id INTEGER PRIMARY KEY AUTOINCREMENT,
            suspect_code TEXT UNIQUE,
            full_name TEXT NOT NULL,
            date_of_birth DATE,
            crime_committed TEXT,
            location_of_crime TEXT,
            place_of_arrest TEXT,
            date_of_arrest DATE,
            nationality TEXT,
            physical_description TEXT,
            risk_level TEXT DEFAULT 'medium',
            is_national BOOLEAN DEFAULT 0,
            station_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (station_id) REFERENCES stations(station_id)
        )
    `, (err) => {
        if (err) console.error('❌ Suspects table error:', err);
        else console.log('✅ Suspects table ready');
    });

    // Cases table
    db.run(`
        CREATE TABLE IF NOT EXISTS cases (
            case_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            suspect_id INTEGER,
            station_id INTEGER,
            case_type TEXT DEFAULT 'investigation',
            status TEXT DEFAULT 'active',
            date_opened DATETIME DEFAULT CURRENT_TIMESTAMP,
            date_closed DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (suspect_id) REFERENCES suspects(suspect_id),
            FOREIGN KEY (station_id) REFERENCES stations(station_id)
        )
    `, (err) => {
        if (err) console.error('❌ Cases table error:', err);
        else console.log('✅ Cases table ready');
    });

    // Properties table
    db.run(`
        CREATE TABLE IF NOT EXISTS properties (
            property_id INTEGER PRIMARY KEY AUTOINCREMENT,
            property_name TEXT NOT NULL,
            property_type TEXT,
            description TEXT,
            location TEXT,
            value TEXT,
            status TEXT DEFAULT 'active',
            station_id INTEGER,
            reported_by TEXT,
            date_reported DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (station_id) REFERENCES stations(station_id)
        )
    `, (err) => {
        if (err) console.error('❌ Properties table error:', err);
        else console.log('✅ Properties table ready');
    });

    // Insert default test station if empty
    db.get("SELECT COUNT(*) as count FROM stations", (err, row) => {
        if (!err && row.count === 0) {
            db.run(`
                INSERT INTO stations (station_name, station_code, location, sector, phone, email, address)
                VALUES ('Test Station API', 'TSA-001', 'Test Location', 'Test Sector', '123-456-7890', 'test@station.com', '123 Test Street')
            `, (err) => {
                if (err) console.error('❌ Error inserting test station:', err);
                else console.log('✅ Test station inserted');
            });
        }
    });
}

// Database helper functions
const dbHelpers = {
    // Run query with no return
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    },

    // Get single row
    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    // Get multiple rows
    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

module.exports = { db, dbHelpers };
