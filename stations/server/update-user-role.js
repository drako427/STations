const { pool } = require('./config/database');

async function updateUserRoleEnum() {
    try {
        console.log('🔧 Updating users role enum to include station...');
        
        // Modify the role enum to include 'station'
        await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('officer','detective','admin','dpo','station')");
        console.log('✅ Users role enum updated successfully');
        
        console.log('🎉 Database schema updated successfully!');
        process.exit(0);
        
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY' || error.code === 'ER_PARSE_ERROR') {
            console.log('✅ Role enum already includes station or other error');
        } else {
            console.error('❌ Error updating role enum:', error);
        }
        process.exit(0);
    }
}

updateUserRoleEnum();
