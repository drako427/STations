const { pool } = require('./config/database');

async function addAccessCodeColumn() {
    try {
        console.log('🔧 Adding access_code column to stations table...');
        
        // Add the access_code column
        await pool.query('ALTER TABLE stations ADD COLUMN access_code VARCHAR(8) UNIQUE');
        console.log('✅ access_code column added successfully');
        
        // Update existing station to have an access code for testing
        await pool.query("UPDATE stations SET access_code = 'DEMO001' WHERE station_id = 1");
        console.log('✅ Demo access code added to station 1');
        
        console.log('🎉 Database schema updated successfully!');
        process.exit(0);
        
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('✅ access_code column already exists');
            process.exit(0);
        }
        console.error('❌ Error adding column:', error);
        process.exit(1);
    }
}

addAccessCodeColumn();
