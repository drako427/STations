const { pool } = require('./config/database');

async function checkUsers() {
    try {
        console.log('🔍 Checking users...');
        
        const [users] = await pool.query('SELECT * FROM users');
        console.log(`✅ Found ${users.length} users:`);
        
        users.forEach(user => {
            console.log(`👤 User: ${user.username} | Role: ${user.role} | Station ID: ${user.station_id} | ID: ${user.user_id}`);
        });
        
        // Check specifically for station users
        const [stationUsers] = await pool.query('SELECT u.*, s.station_name FROM users u JOIN stations s ON u.station_id = s.station_id WHERE u.role = ?', ['station']);
        console.log(`\n🏢 Station users (${stationUsers.length}):`);
        
        stationUsers.forEach(user => {
            console.log(`👤 ${user.username} at ${user.station_name} (Station ID: ${user.station_id})`);
        });
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkUsers();
