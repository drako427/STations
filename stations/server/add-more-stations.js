const mysql = require('mysql2/promise');

async function addMoreStations() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '@Aboogie213',
            database: 'stations_db'
        });
        
        console.log('🔍 Adding more sample stations...');
        
        const stations = [
            ['North District Police', 'NDP-002', 'North District', 'North', 'local'],
            ['East Sector Station', 'ESS-003', 'East Sector', 'East', 'local'],
            ['West Precinct', 'WPP-004', 'West Area', 'West', 'local'],
            ['South Command', 'SCC-005', 'South District', 'South', 'local'],
            ['Federal HQ', 'FHQ-006', 'Federal Headquarters', 'Federal', 'federal']
        ];
        
        for (const station of stations) {
            try {
                await connection.execute(`
                    INSERT IGNORE INTO stations (station_name, station_code, location, sector, jurisdiction_type)
                    VALUES (?, ?, ?, ?, ?)
                `, station);
                console.log(`✅ Added station: ${station[1]} - ${station[0]}`);
            } catch (err) {
                console.log(`⚠️ Station ${station[1]} might already exist`);
            }
        }
        
        // Show all stations
        const [allStations] = await connection.execute('SELECT * FROM stations');
        console.log('\n📋 All available stations:');
        allStations.forEach(station => {
            console.log(`🔹 ${station.station_code} - ${station.station_name} (${station.location})`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

addMoreStations();
