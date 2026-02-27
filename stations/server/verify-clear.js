require('dotenv').config();
const { pool } = require('./config/database');

async function verifyClear() {
    try {
        console.log('🔍 Verifying database state...\n');
        
        // Check stations
        const [stations] = await pool.query('SELECT COUNT(*) as count FROM stations');
        console.log(`📊 Stations: ${stations[0].count}`);
        
        // Check users
        const [users] = await pool.query('SELECT username, email, role FROM users');
        console.log(`👥 Users: ${users.length}`);
        users.forEach(user => {
            console.log(`   - ${user.username} (${user.email}) - Role: ${user.role}`);
        });
        
        // Check cases
        const [cases] = await pool.query('SELECT COUNT(*) as count FROM cases');
        console.log(`📁 Cases: ${cases[0].count}`);
        
        // Check suspects
        const [suspects] = await pool.query('SELECT COUNT(*) as count FROM suspects');
        console.log(`🔍 Suspects: ${suspects[0].count}`);
        
        // Check properties
        const [properties] = await pool.query('SELECT COUNT(*) as count FROM properties');
        console.log(`📦 Properties: ${properties[0].count}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit(0);
    }
}

verifyClear();
