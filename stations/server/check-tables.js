const mysql = require('mysql2/promise');

async function checkDatabaseTables() {
    let connection;
    
    try {
        console.log('🔍 Checking database tables...');
        
        connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '@Aboogie213',
            database: 'stations_db'
        });
        
        console.log('✅ Connected to stations_db');
        
        // Get all tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`📋 Found ${tables.length} tables:`);
        
        if (tables.length === 0) {
            console.log('⚠️ NO TABLES FOUND!');
            console.log('🔧 You need to run the schema.sql file first');
            console.log('💡 Command: mysql -u root -p stations_db < schema.sql');
        } else {
            tables.forEach(table => {
                const tableName = Object.values(table)[0];
                console.log(`  ✅ ${tableName}`);
            });
            
            // Check stations table specifically
            try {
                const [stationCount] = await connection.execute('SELECT COUNT(*) as count FROM stations');
                console.log(`🏢 Stations in database: ${stationCount[0].count}`);
                
                // Show sample data if exists
                if (stationCount[0].count > 0) {
                    const [sampleStations] = await connection.execute('SELECT station_id, station_name, station_code FROM stations LIMIT 3');
                    console.log('📝 Sample stations:');
                    sampleStations.forEach(station => {
                        console.log(`  - ${station.station_name} (${station.station_code})`);
                    });
                }
            } catch (err) {
                console.log('❌ Error checking stations table:', err.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking database:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkDatabaseTables();
