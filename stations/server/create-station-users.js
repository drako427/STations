const { pool } = require('./config/database');
const bcrypt = require('bcryptjs');

async function createStationUsers() {
    try {
        console.log('🔧 Creating station users...');
        
        // Get all stations
        const [stations] = await pool.query('SELECT * FROM stations');
        
        for (const station of stations) {
            // Check if station user already exists
            const [existingUser] = await pool.query(
                'SELECT * FROM users WHERE station_id = ? AND username LIKE ?',
                [station.station_id, `station_%`]
            );
            
            if (existingUser.length === 0) {
                // Create station user with access code as password
                const hashedPassword = await bcrypt.hash(station.access_code, 10);
                
                await pool.query(`
                    INSERT INTO users (
                        station_id, 
                        username, 
                        email, 
                        password_hash, 
                        full_name, 
                        badge_number, 
                        user_rank, 
                        role
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    station.station_id,
                    `station_${station.station_code.toLowerCase()}`,
                    `${station.station_code.toLowerCase()}@stations.gov`,
                    hashedPassword,
                    `${station.station_name} User`,
                    station.station_code,
                    'Station Officer',
                    'officer'
                ]);
                
                console.log(`✅ Created station user for ${station.station_name} (${station.access_code})`);
            } else {
                console.log(`ℹ️ Station user already exists for ${station.station_name}`);
            }
        }
        
        console.log('\n🎉 Station users creation complete!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createStationUsers();
