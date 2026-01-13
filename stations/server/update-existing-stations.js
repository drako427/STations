const { pool } = require('./config/database');

async function updateExistingStations() {
    try {
        console.log('🔧 Updating existing stations with access codes...');
        
        // Get all stations without access codes
        const [stations] = await pool.query('SELECT station_id, station_name FROM stations WHERE access_code IS NULL OR access_code = ""');
        
        if (stations.length === 0) {
            console.log('✅ All stations already have access codes');
            process.exit(0);
        }
        
        // Generate access codes for existing stations
        const generateAccessCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const length = Math.floor(Math.random() * 3) + 6; // 6-8 characters
            let code = '';
            for (let i = 0; i < length; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        };
        
        for (const station of stations) {
            let accessCode;
            let codeExists = true;
            let attempts = 0;
            
            while (codeExists && attempts < 10) {
                accessCode = generateAccessCode();
                const [existing] = await pool.query(
                    'SELECT access_code FROM stations WHERE access_code = ?',
                    [accessCode]
                );
                codeExists = existing.length > 0;
                attempts++;
            }
            
            if (codeExists) {
                console.log(`❌ Could not generate unique code for station ${station.station_name}`);
                continue;
            }
            
            await pool.query(
                'UPDATE stations SET access_code = ? WHERE station_id = ?',
                [accessCode, station.station_id]
            );
            
            console.log(`✅ Updated ${station.station_name} with access code: ${accessCode}`);
        }
        
        console.log('🎉 All existing stations updated with access codes!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error updating stations:', error);
        process.exit(1);
    }
}

updateExistingStations();
