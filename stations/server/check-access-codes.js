require('dotenv').config();
const { pool } = require('./config/database');

async function checkAccessCodes() {
    try {
        console.log('🔍 Checking station access codes...\n');
        
        const [stations] = await pool.query(
            'SELECT station_id, station_name, station_code, access_code FROM stations ORDER BY station_id'
        );
        
        if (stations.length === 0) {
            console.log('❌ No stations found in the database');
        } else {
            console.log(`✅ Found ${stations.length} station(s):`);
            stations.forEach(station => {
                console.log(`   - ID: ${station.station_id}`);
                console.log(`   - Name: ${station.station_name}`);
                console.log(`   - Code: ${station.station_code}`);
                console.log(`   - Access Code: ${station.access_code || 'NOT SET'}`);
                console.log('');
            });
            
            // Check if any stations have access codes
            const withAccessCodes = stations.filter(s => s.access_code);
            if (withAccessCodes.length === 0) {
                console.log('⚠️  No stations have access codes set!');
                console.log('🔧 Setting default access codes...');
                
                // Set default access codes for testing
                for (const station of stations) {
                    const accessCode = `ACC${station.station_id.toString().padStart(3, '0')}`;
                    await pool.query(
                        'UPDATE stations SET access_code = ? WHERE station_id = ?',
                        [accessCode, station.station_id]
                    );
                    console.log(`   ✅ Set access code for ${station.station_name}: ${accessCode}`);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking access codes:', error.message);
    } finally {
        process.exit(0);
    }
}

checkAccessCodes();
