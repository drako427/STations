const { pool } = require('./config/database');

async function checkStationCodes() {
    try {
        console.log('🔍 Checking station access codes...');
        
        const [stations] = await pool.query('SELECT station_id, station_name, access_code FROM stations');
        
        console.log('\n📋 Station Access Codes:');
        stations.forEach(station => {
            console.log(`  - ${station.station_name}: "${station.access_code}"`);
        });
        
        console.log('\n🎯 Done!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error checking stations:', error);
        process.exit(1);
    }
}

checkStationCodes();
