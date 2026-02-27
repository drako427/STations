require('dotenv').config();
const { pool } = require('./config/database');

async function clearStations() {
    try {
        console.log('🗑️  Clearing all stations from database...\n');
        
        // First, show current stations
        const [stations] = await pool.query('SELECT station_id, station_name, station_code FROM stations');
        
        if (stations.length === 0) {
            console.log('ℹ️  No stations found to remove');
            process.exit(0);
        }
        
        console.log(`📋 Found ${stations.length} station(s) to remove:`);
        stations.forEach(station => {
            console.log(`   - ID: ${station.station_id}, Name: ${station.station_name}, Code: ${station.station_code}`);
        });
        
        // Ask for confirmation
        console.log('\n⚠️  WARNING: This will permanently delete all stations and related data!');
        console.log('🔍 Related data to be deleted:');
        console.log('   - All stations');
        console.log('   - All users associated with stations');
        console.log('   - All cases from these stations');
        console.log('   - All suspects from these stations');
        console.log('   - All properties from these stations');
        
        // Delete stations (cascade will handle related records)
        const [result] = await pool.query('DELETE FROM stations');
        
        console.log(`\n✅ Successfully removed ${result.affectedRows} station(s) from database`);
        console.log('🧹 All related data (users, cases, suspects, properties) has been removed due to cascade delete');
        
        // Reset auto-increment
        await pool.query('ALTER TABLE stations AUTO_INCREMENT = 1');
        console.log('🔄 Station ID counter reset to 1');
        
    } catch (error) {
        console.error('❌ Error clearing stations:', error.message);
    } finally {
        process.exit(0);
    }
}

clearStations();
