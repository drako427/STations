const mysql = require('mysql2/promise');

async function checkSuspectsTable() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '@Aboogie213',
            database: 'stations_db'
        });
        
        const [columns] = await connection.execute('DESCRIBE suspects');
        console.log('Suspects table structure:');
        columns.forEach(c => console.log(`- ${c.Field}: ${c.Type}`));
        
        await connection.end();
        
    } catch (error) {
        console.log('Error:', error.message);
    }
}

checkSuspectsTable();
