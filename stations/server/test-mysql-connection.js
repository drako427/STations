const mysql = require('mysql2/promise');

async function testMySQLConnection() {
    try {
        console.log('🔍 Testing MySQL connection with credentials:');
        console.log('📍 Host: localhost');
        console.log('🔌 Port: 3306');
        console.log('👤 User: root');
        console.log('🔑 Password: @Aboogie213');
        console.log('💾 Database: stations_db');
        
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '@Aboogie213',
            database: 'stations_db',
            connectTimeout: 10000,
            acquireTimeout: 10000
        });
        
        console.log('✅ MySQL connection successful!');
        
        // Test a simple query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('📊 Test query result:', rows);
        
        await connection.end();
        console.log('✅ Connection closed successfully');
        
    } catch (error) {
        console.error('❌ MySQL connection failed:');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        console.error('SQL State:', error.sqlState);
        console.error('SQL Message:', error.sqlMessage);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Solution: Check MySQL user credentials');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('💡 Solution: Create database "stations_db"');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 Solution: Start MySQL service');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('💡 Solution: Check MySQL service or firewall');
        }
    }
}

testMySQLConnection();
