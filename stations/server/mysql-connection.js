const mysql = require('mysql2/promise');
require('dotenv').config();

let connection = null;

async function connectToMySQL() {
    try {
        console.log('🔍 Connecting to MySQL database...');
        console.log(`📍 Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`🔌 Port: ${process.env.DB_PORT || 3306}`);
        console.log(`👤 User: ${process.env.DB_USER || 'root'}`);
        console.log(`💾 Database: ${process.env.DB_NAME || 'stations_db'}`);
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '@Aboogie213',
            database: process.env.DB_NAME || 'stations_db',
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true
        });
        
        console.log('✅ MySQL connection successful!');
        console.log('🗄️ Database ready for production use');
        
        // Test connection with a simple query
        const [rows] = await connection.execute('SELECT 1 as test');
        if (rows[0].test === 1) {
            console.log('✅ Database query test passed');
        }
        
        return connection;
        
    } catch (error) {
        console.error('❌ MySQL connection failed!');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('💡 SOLUTION: Start MySQL service on localhost:3306');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 SOLUTION: Check MySQL credentials in .env file');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('💡 SOLUTION: Create database "stations_db" first');
        }
        
        console.error('🚨 SERVER CANNOT START WITHOUT DATABASE!');
        process.exit(1);
    }
}

async function getConnection() {
    if (!connection) {
        await connectToMySQL();
    }
    return connection;
}

async function closeConnection() {
    if (connection) {
        await connection.end();
        console.log('🔌 MySQL connection closed');
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await closeConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Server terminated...');
    await closeConnection();
    process.exit(0);
});

module.exports = {
    connectToMySQL,
    getConnection,
    closeConnection
};
