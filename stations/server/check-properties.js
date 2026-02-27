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
        
        const [columns] = await connection.execute('DESCRIBE properties');
        console.log('Properties table structure:');
        columns.forEach(c => console.log(`- ${c.Field}: ${c.Type}`));
        
        const [sample] = await connection.execute('SELECT * FROM properties LIMIT 3');
        console.log('\nSample data:');
        sample.forEach(p => console.log(JSON.stringify(p, null, 2)));
        
        await connection.end();
        
    } catch (error) {
        console.log('Error:', error.message);
    }
}

checkPropertiesTable();
