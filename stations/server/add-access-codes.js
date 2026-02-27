require('dotenv').config();
const { pool } = require('./config/database');

async function addAccessCodes() {
    try {
        console.log('🔧 Adding access_code column to stations table...');
        
        // Add the column
        await pool.query('ALTER TABLE stations ADD COLUMN access_code VARCHAR(8) UNIQUE');
        console.log('✅ access_code column added successfully');
        
        // Set default access codes
        const [stations] = await pool.query('SELECT station_id, station_name FROM stations');
        for (const station of stations) {
            const accessCode = `ACC${station.station_id.toString().padStart(3, '0')}`;
            await pool.query('UPDATE stations SET access_code = ? WHERE station_id = ?', [accessCode, station.station_id]);
            console.log(`   ✅ Set access code for ${station.station_name}: ${accessCode}`);
        }
        
        console.log('\n🎉 Access codes setup complete!');
        
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️  access_code column already exists');
            
            // Just set access codes for stations that don't have them
            const [stations] = await pool.query('SELECT station_id, station_name, access_code FROM stations WHERE access_code IS NULL OR access_code = ""');
            for (const station of stations) {
                const accessCode = `ACC${station.station_id.toString().padStart(3, '0')}`;
                await pool.query('UPDATE stations SET access_code = ? WHERE station_id = ?', [accessCode, station.station_id]);
                console.log(`   ✅ Set access code for ${station.station_name}: ${accessCode}`);
            }
        } else {
            console.error('❌ Error:', error.message);
        }
    } finally {
        process.exit(0);
    }
}

addAccessCodes();
