const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
    console.log('🚀 Starting Database Initialization...');

    // Initial connection without database select to ensure DB exists
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: parseInt(process.env.DB_PORT) || 3306,
        multipleStatements: true
    });

    try {
        console.log('📖 Reading schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (!fs.existsSync(schemaPath)) {
            throw new Error('schema.sql file not found in server directory');
        }
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('⚡ Executing schema commands...');
        await connection.query(schema);

        console.log('✅ STATIONS Database & Tables initialized successfully.');
    } catch (error) {
        console.error('❌ Database initialization failed:');
        console.error(error.message);
        process.exit(1);
    } finally {
        await connection.end();
        console.log('🔌 Connection closed.');
    }
}

initDB();
