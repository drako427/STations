const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
    try {
        console.log('Testing connection with:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD ? '****' : 'none',
            port: process.env.DB_PORT
        });
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT) || 3306
        });
        console.log('✅ Success!');
        await connection.end();
    } catch (e) {
        console.error('❌ Failed:', e);
    }
}
test();
