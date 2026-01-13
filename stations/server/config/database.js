/**
 * Database Connection Pool Configuration
 * 
 * This module creates and manages a MySQL connection pool for the STATIONS application.
 * It uses environment variables for secure credential management and implements
 * connection pooling for optimal performance.
 * 
 * @module config/database
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

/**
 * MySQL Connection Pool
 * 
 * Configuration:
 * - Uses environment variables for credentials
 * - Implements connection pooling for performance
 * - Handles automatic reconnection
 * - Provides promise-based API
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'stations_db',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

/**
 * Test database connection
 * 
 * Attempts to acquire a connection from the pool and execute a simple query
 * to verify database connectivity.
 * 
 * @returns {Promise<boolean>} True if connection successful
 * @throws {Error} If connection fails
 */
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connection established successfully');
        console.log(`📊 Connected to: ${process.env.DB_NAME} on ${process.env.DB_HOST}:${process.env.DB_PORT}`);

        // Test query
        const [rows] = await connection.query('SELECT 1 + 1 AS result');
        console.log('✅ Test query executed successfully:', rows[0]);

        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    }
}

/**
 * Gracefully close all connections in the pool
 * 
 * Should be called when shutting down the application to ensure
 * all database connections are properly closed.
 * 
 * @returns {Promise<void>}
 */
async function closePool() {
    try {
        await pool.end();
        console.log('✅ Database connection pool closed');
    } catch (error) {
        console.error('❌ Error closing database pool:', error.message);
        throw error;
    }
}

/**
 * Handle process termination signals
 * Ensures database connections are closed gracefully
 */
process.on('SIGINT', async () => {
    console.log('\n⚠️  Received SIGINT signal, closing database connections...');
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n⚠️  Received SIGTERM signal, closing database connections...');
    await closePool();
    process.exit(0);
});

// Export the pool and utility functions
module.exports = {
    pool,
    testConnection,
    closePool
};

/**
 * Self-test when run directly
 * Usage: node config/database.js
 */
if (require.main === module) {
    (async () => {
        try {
            await testConnection();
            await closePool();
            console.log('\n✅ Database configuration test completed successfully');
            process.exit(0);
        } catch (error) {
            console.error('\n❌ Database configuration test failed');
            process.exit(1);
        }
    })();
}
