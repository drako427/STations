require('dotenv').config();
const { pool } = require('./config/database');
const bcrypt = require('bcryptjs');

async function createDPOUser() {
    try {
        console.log('🔧 Creating DPO user...\n');
        
        // Check if DPO user already exists
        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            ['dpo', 'dpo@stations.gov']
        );
        
        if (existingUsers.length > 0) {
            console.log('❌ DPO user already exists:');
            console.log(`   Username: ${existingUsers[0].username}`);
            console.log(`   Email: ${existingUsers[0].email}`);
            console.log(`   Role: ${existingUsers[0].role}`);
            process.exit(0);
        }
        
        // Hash the password
        const passwordHash = await bcrypt.hash('admin', 10);
        
        // Insert DPO user
        const [result] = await pool.query(
            `INSERT INTO users (station_id, username, email, password_hash, full_name, badge_number, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [1, 'dpo', 'dpo@stations.gov', passwordHash, 'Data Protection Officer', 'DPO-001', 'dpo']
        );
        
        console.log('✅ DPO user created successfully!');
        console.log(`   User ID: ${result.insertId}`);
        console.log(`   Username: dpo`);
        console.log(`   Email: dpo@stations.gov`);
        console.log(`   Password: admin`);
        console.log(`   Role: dpo`);
        
    } catch (error) {
        console.error('❌ Error creating DPO user:', error.message);
    } finally {
        process.exit(0);
    }
}

createDPOUser();
