const mysql = require('mysql2/promise');

async function checkStations() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '@Aboogie213',
            database: 'stations_db'
        });
        
        console.log('🔍 Checking available stations...');
        
        const [stations] = await connection.execute('SELECT * FROM stations');
        console.log('✅ Available stations:');
        
        stations.forEach(station => {
            console.log(`📋 Station: ${station.station_name} | Station Code: ${station.station_code} | Access Code: ${station.access_code} | ID: ${station.station_id}`);
        });
        
        console.log('\n🔍 Checking users...');
        const [users] = await connection.execute('SELECT user_id, username, role, station_id, full_name FROM users');
        console.log('✅ Available users:');
        
        users.forEach(user => {
            console.log(`👤 User: ${user.username} | Role: ${user.role} | Station ID: ${user.station_id} | Name: ${user.full_name}`);
        });
        
        if (stations.length === 0) {
            console.log('❌ No stations found. Creating sample station...');
            
            await connection.execute(`
                INSERT INTO stations (station_name, station_code, location, sector, jurisdiction_type)
                VALUES ('Central Police Station', 'CPS-001', 'Downtown District', 'Central', 'local')
            `);
            
            console.log('✅ Sample station created: CPS-001');
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkStations();
