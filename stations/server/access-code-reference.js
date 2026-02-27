require('dotenv').config();
const { pool } = require('./config/database');

async function showAccessCodes() {
    try {
        console.log('🔑 STATION LOGIN ACCESS CODES\n');
        console.log('=' .repeat(50));
        
        const [stations] = await pool.query('SELECT station_name, access_code FROM stations WHERE access_code IS NOT NULL');
        
        if (stations.length === 0) {
            console.log('❌ No stations with access codes found');
        } else {
            stations.forEach((station, index) => {
                console.log(`${index + 1}. ${station.station_name}`);
                console.log(`   Access Code: ${station.access_code}`);
                console.log('');
            });
        }
        
        console.log('=' .repeat(50));
        console.log('💡 Use any of these access codes for station login');
        console.log('🔗 Login URL: http://localhost:3000/login');
        console.log('📱 Select "Station" role and enter the access code');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit(0);
    }
}

showAccessCodes();
