const mysql = require('mysql2/promise');

async function checkPropertiesTable() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '@Aboogie213',
            database: 'stations_db'
        });
        
        console.log('🔍 Checking properties table structure...');
        
        // Check if table exists
        const [tables] = await connection.execute('SHOW TABLES LIKE "properties"');
        console.log('✅ Properties table exists:', tables.length > 0);
        
        if (tables.length > 0) {
            // Get table structure
            const [columns] = await connection.execute('DESCRIBE properties');
            console.log('✅ Properties table columns:');
            columns.forEach(col => {
                console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''}`);
            });
            
            // Check if table has data
            const [rows] = await connection.execute('SELECT COUNT(*) as count FROM properties');
            console.log(`✅ Properties table has ${rows[0].count} records`);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkPropertiesTable();
