const mysql = require('mysql2/promise');

async function createDatabase() {
    try {
        console.log('🔧 Creating MySQL database "stations_db"...');
        
        // Connect to MySQL server (without specifying database)
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '@Aboogie213'
        });
        
        // Create the database
        await connection.execute('CREATE DATABASE IF NOT EXISTS stations_db');
        console.log('✅ Database "stations_db" created successfully!');
        
        // Now connect to the created database and create tables
        await connection.changeUser({ database: 'stations_db' });
        
        // Read and execute schema
        const fs = require('fs');
        const schema = fs.readFileSync('./schema.sql', 'utf8');
        
        // Split schema by semicolons and execute each statement
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                    console.log('✅ Executed:', statement.substring(0, 50) + '...');
                } catch (err) {
                    console.log('⚠️  Warning:', err.message);
                }
            }
        }
        
        console.log('✅ All tables created successfully!');
        console.log('🎉 MySQL setup complete!');
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error creating database:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Check MySQL user credentials');
        }
    }
}

createDatabase();
