require('dotenv').config();
const { pool } = require('./config/database');
const bcrypt = require('bcryptjs');

async function setupDPO() {
    try {
        console.log('🔧 Setting up DPO system...\n');
        
        // 1. Create a dummy station for DPO
        console.log('📋 Creating DPO station...');
        const [stationResult] = await pool.query(
            'INSERT INTO stations (station_name, station_code, location, sector, jurisdiction_type, contact_phone, contact_email) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['DPO Headquarters', 'DPO-HQ', 'System Administration', 'National', 'national', '+1-555-DPO', 'dpo@stations.gov']
        );
        const stationId = stationResult.insertId;
        console.log(`✅ DPO station created with ID: ${stationId}`);
        
        // 2. Create DPO user
        console.log('👮 Creating DPO user...');
        const passwordHash = await bcrypt.hash('admin', 10);
        const [userResult] = await pool.query(
            'INSERT INTO users (station_id, username, email, password_hash, full_name, badge_number, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [stationId, 'dpo', 'dpo@stations.gov', passwordHash, 'Data Protection Officer', 'DPO-001', 'dpo']
        );
        console.log(`✅ DPO user created with ID: ${userResult.insertId}`);
        
        // 3. Set access code for DPO station
        const accessCode = `DPO${stationId.toString().padStart(3, '0')}`;
        await pool.query('UPDATE stations SET access_code = ? WHERE station_id = ?', [accessCode, stationId]);
        console.log(`✅ DPO station access code set: ${accessCode}`);
        
        console.log('\n🎉 DPO system setup complete!');
        console.log('📋 Login credentials:');
        console.log(`   Username: dpo`);
        console.log(`   Password: admin`);
        console.log(`   Role: dpo`);
        console.log(`   Station Access Code: ${accessCode}`);
        
    } catch (error) {
        console.error('❌ Error setting up DPO:', error.message);
    } finally {
        process.exit(0);
    }
}

setupDPO();
