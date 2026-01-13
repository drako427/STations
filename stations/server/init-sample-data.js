/**
 * Initialize Sample Data for STATIONS Database
 * 
 * This script creates default stations, users, and sample data
 * for testing the application without authentication.
 */

require('dotenv').config();
const { pool } = require('./config/database');

async function initializeSampleData() {
    try {
        console.log('🔧 Initializing sample data...');

        // 1. Create Default Station
        const [stations] = await pool.query('SELECT * FROM stations WHERE station_id = 1');
        if (stations.length === 0) {
            console.log('📋 Creating default station...');
            await pool.query(
                'INSERT INTO stations (station_name, station_code, location, sector, jurisdiction_type, contact_phone, contact_email) VALUES (?, ?, ?, ?, ?, ?, ?)',
                ['Central Police Station', 'STN-001', '123 Main Street, Downtown', 'Central District', 'local', '+1-555-0101', 'central@stations.gov']
            );
            console.log('✅ Default station created');
        }

        // 2. Create Default User
        const [users] = await pool.query('SELECT * FROM users WHERE user_id = 1');
        if (users.length === 0) {
            console.log('👮 Creating default user...');
            await pool.query(
                'INSERT INTO users (station_id, username, email, password_hash, full_name, badge_number, rank, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [1, 'admin', 'admin@stations.gov', 'temporary_hash', 'System Administrator', 'ADMIN-001', 'Chief', 'admin']
            );
            console.log('✅ Default user created');
        }

        // 3. Create Sample Cases
        const [cases] = await pool.query('SELECT * FROM cases LIMIT 1');
        if (cases.length === 0) {
            console.log('📁 Creating sample cases...');
            await pool.query(
                `INSERT INTO cases (station_id, case_number, title, description, case_type, priority, status, lead_investigator_id) VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?),
                (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    1, 'CAS-001', 'Downtown Jewelry Heist', 'Multiple suspects involved in coordinated jewelry store robbery', 'theft', 'high', 'active', 1,
                    1, 'CAS-002', 'Cyber Fraud Investigation', 'Online phishing scheme targeting local businesses', 'fraud', 'medium', 'in_progress', 1
                ]
            );
            console.log('✅ Sample cases created');
        }

        // 4. Create Sample Suspects
        const [suspects] = await pool.query('SELECT * FROM suspects LIMIT 1');
        if (suspects.length === 0) {
            console.log('🔍 Creating sample suspects...');
            await pool.query(
                `INSERT INTO suspects (station_id, registered_by, suspect_code, full_name, aliases, date_of_birth, gender, nationality, physical_description, risk_level, crime_committed, is_national) VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    1, 1, 'SUS-001', 'John Smith', 'Johnny', '1985-03-15', 'male', 'Local', 'Height: 6\'1", Weight: 180lbs, Brown hair, Blue eyes', 'high', 'Armed robbery, assault', false,
                    1, 1, 'SUS-002', 'Maria Garcia', 'MG', '1992-08-22', 'female', 'Local', 'Height: 5\'6", Weight: 140lbs, Black hair, Brown eyes', 'medium', 'Cyber fraud, identity theft', false
                ]
            );
            console.log('✅ Sample suspects created');
        }

        console.log('🎉 Sample data initialization complete!');
        console.log('');
        console.log('📊 Summary:');
        const [stationCount] = await pool.query('SELECT COUNT(*) as count FROM stations');
        const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [caseCount] = await pool.query('SELECT COUNT(*) as count FROM cases');
        const [suspectCount] = await pool.query('SELECT COUNT(*) as count FROM suspects');
        
        console.log(`   Stations: ${stationCount[0].count}`);
        console.log(`   Users: ${userCount[0].count}`);
        console.log(`   Cases: ${caseCount[0].count}`);
        console.log(`   Suspects: ${suspectCount[0].count}`);

    } catch (error) {
        console.error('❌ Error initializing sample data:', error.message);
    } finally {
        process.exit(0);
    }
}

initializeSampleData();
