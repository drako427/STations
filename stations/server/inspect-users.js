const mysql = require('mysql2/promise');

async function main() {
  const config = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '@Aboogie213',
    database: 'stations_db'
  };

  console.log('🔍 Inspecting MySQL schema for stations_db.users ...');

  const conn = await mysql.createConnection(config);
  try {
    const [db] = await conn.execute('SELECT DATABASE() AS db');
    console.log('✅ Connected to DB:', db?.[0]?.db);

    const [desc] = await conn.execute('DESCRIBE users');
    console.log('\n📋 DESCRIBE users:');
    console.table(desc);

    const [rows] = await conn.execute(
      'SELECT user_id, station_id, username, email, role FROM users ORDER BY user_id ASC LIMIT 20'
    );
    console.log('\n👤 First users (up to 20):');
    console.table(rows);

    const [count] = await conn.execute('SELECT COUNT(*) AS count FROM users');
    console.log('\n🔢 Total users:', count?.[0]?.count);

    const [lookup] = await conn.execute(
      'SELECT user_id, station_id, username, email, role FROM users WHERE username = ? OR email = ? LIMIT 5',
      ['test@example.com', 'test@example.com']
    );
    console.log('\n🔎 Lookup test@example.com:');
    console.table(lookup);
  } finally {
    await conn.end();
    console.log('\n🔌 Connection closed');
  }
}

main().catch((err) => {
  console.error('❌ inspect-users failed:', err.code || '', err.message);
  process.exit(1);
});
