const { pool } = require('./config/database');

async function checkSchema() {
    try {
        console.log('🔍 Checking database schema...');
        
        // Check stations table structure
        const [stations] = await pool.query('DESCRIBE stations');
        console.log('📋 Stations table columns:');
        stations.forEach(col => console.log(`  - ${col.Field}: ${col.Type}`));
        
        // Check users table structure
        const [users] = await pool.query('DESCRIBE users');
        console.log('\n📋 Users table columns:');
        users.forEach(col => console.log(`  - ${col.Field}: ${col.Type}`));
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
