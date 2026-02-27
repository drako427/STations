const mysql = require('mysql2/promise');

async function fixAccessCodes() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '@Aboogie213',
            database: 'stations_db'
        });
        
        console.log('🔧 Fixing access codes to match station codes...');
        
        // Update Wellingara station
        await connection.execute(
            'UPDATE stations SET access_code = ? WHERE station_id = ?',
            ['STN-002', 2]
        );
        
        // Update DPO Headquarters  
        await connection.execute(
            'UPDATE stations SET access_code = ? WHERE station_id = ?',
            ['DPO-HQ', 1]
        );
        
        console.log('✅ Access codes updated to match station codes');
        
        // Verify the changes
        const [stations] = await connection.execute('SELECT * FROM stations');
        console.log('📋 Updated stations:');
        stations.forEach(station => {
            console.log(`📋 Station: ${station.station_name} | Station Code: ${station.station_code} | Access Code: ${station.access_code} | ID: ${station.station_id}`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fixAccessCodes();
