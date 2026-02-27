require('dotenv').config();
const { pool } = require('./config/database');

async function checkCurrentStations() {
    try {
        console.log('🔍 Current stations in database:\n');
        
        const [stations] = await pool.query('SELECT station_id, station_name, station_code, access_code FROM stations');
        
        if (stations.length === 0) {
            console.log('❌ No stations found');
        } else {
            stations.forEach(station => {
                console.log(`   - ID: ${station.station_id}`);
                console.log(`     Name: ${station.station_name}`);
                console.log(`     Code: ${station.station_code}`);
                console.log(`     Access Code: ${station.access_code || 'NULL'}`);
                console.log('');
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit(0);
    }
}

checkCurrentStations();
