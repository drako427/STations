const fs = require('fs');

// Update .env file with MySQL password
const envContent = `# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=@Aboogie213
DB_NAME=stations_db

# Connection Pool Settings
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0

# Environment
NODE_ENV=development
`;

fs.writeFileSync('.env', envContent);
console.log('✅ .env file updated with MySQL password');
console.log('🔑 Password: @Aboogie213');
console.log('🚀 You can now run: node index.js');
