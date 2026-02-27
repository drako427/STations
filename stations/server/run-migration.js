const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('🔄 Running suspect release fields migration...');
        
        // Read the SQL file
        const sqlFile = path.join(__dirname, 'add_suspect_release_fields.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');
        
        console.log('📄 SQL file loaded, executing...');
        
        // Split SQL by semicolons and execute each statement
        const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (const statement of statements) {
            const trimmedStatement = statement.trim();
            if (trimmedStatement) {
                console.log('🔧 Executing:', trimmedStatement.substring(0, 50) + '...');
                await pool.query(trimmedStatement);
            }
        }
        
        console.log('✅ Migration completed successfully!');
        
        // Verify the columns were added
        const [columns] = await pool.query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'stations_db' 
            AND TABLE_NAME = 'suspects' 
            AND COLUMN_NAME IN ('released', 'released_at', 'bail_amount', 'timeout_hours', 'status')
            ORDER BY COLUMN_NAME
        `);
        
        console.log('📊 Added columns:');
        columns.forEach(col => {
            console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
        });
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️  Columns may already exist, which is okay.');
        } else {
            throw error;
        }
    } finally {
        await pool.end();
    }
}

runMigration();
