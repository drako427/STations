const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('🔧 Running migration to add image column...');
        
        // Create connection
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '@Aboogie213',
            database: 'stations_db'
        });

        console.log('✅ Connected to database');

        // Read and execute migration
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'add_image_column.sql'), 
            'utf8'
        );

        await connection.execute(migrationSQL);
        console.log('✅ Migration completed successfully - image column added to suspects table');

        await connection.end();
        console.log('✅ Database connection closed');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
