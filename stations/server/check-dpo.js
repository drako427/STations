require('dotenv').config();
const { pool } = require('./config/database');

async function checkDPORole() {
    try {
        console.log('🔍 Checking DPO users in database...\n');
        
        // Query for DPO users
        const [dpoUsers] = await pool.query(
            'SELECT user_id, username, email, role, full_name, badge_number FROM users WHERE role = ?',
            ['dpo']
        );
        
        if (dpoUsers.length === 0) {
            console.log('❌ No DPO users found in the database');
            
            // Check all users to see what roles exist
            const [allUsers] = await pool.query(
                'SELECT username, email, role FROM users ORDER BY role'
            );
            
            console.log('\n📋 All users in database:');
            allUsers.forEach(user => {
                console.log(`   - ${user.username} (${user.email}) - Role: ${user.role}`);
            });
            
        } else {
            console.log(`✅ Found ${dpoUsers.length} DPO user(s):`);
            dpoUsers.forEach(user => {
                console.log(`   - Username: ${user.username}`);
                console.log(`   - Email: ${user.email}`);
                console.log(`   - Role: ${user.role}`);
                console.log(`   - Full Name: ${user.full_name}`);
                console.log(`   - Badge Number: ${user.badge_number}`);
                console.log('');
            });
        }
        
    } catch (error) {
        console.error('❌ Error checking DPO users:', error.message);
    } finally {
        process.exit(0);
    }
}

checkDPORole();
