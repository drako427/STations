require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Database connection
const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '@Aboogie213',
    database: 'stations_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test route
app.get('/api', (req, res) => {
    res.json({ message: 'STATIONS API is running' });
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT 1 as test');
        res.status(200).json({
            status: 'success',
            message: 'STATIONS API is operational',
            timestamp: new Date().toISOString(),
            database: 'MySQL connected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Naked login endpoint - SIMPLE VERSION
app.post('/api/auth/naked-login', async (req, res) => {
    console.log('🔓 Naked login route hit!');
    const { username, password, role } = req.body;
    
    try {
        console.log(`🔓 Naked login attempt: ${username}`);
        
        // Create JWT token for any username
        const token = jwt.sign(
            {
                userId: 1,
                stationId: 1,
                username: username,
                role: role || 'station'
            },
            process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET',
            { expiresIn: '24h' }
        );

        console.log(`🎫 Token issued for: ${username}`);

        res.status(200).json({
            message: 'Authentication successful',
            token: token,
            user: {
                userId: 1,
                username: username,
                role: role || 'station',
                stationId: 1
            }
        });

    } catch (error) {
        console.error('❌ Naked login error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Station login endpoint
app.post('/api/station-login', async (req, res) => {
    const { access_code } = req.body;
    
    console.log(`🔑 Station login attempt: "${access_code}"`);
    
    try {
        const [stations] = await pool.execute(
            'SELECT * FROM stations WHERE station_code = ?',
            [access_code]
        );
        
        console.log(`📊 Found ${stations.length} stations with code "${access_code}"`);
        
        if (stations.length === 0) {
            console.log('❌ No station found with that code');
            
            // Show available stations for debugging
            const [allStations] = await pool.execute('SELECT station_code, station_name FROM stations');
            console.log('📋 Available station codes:');
            allStations.forEach(station => {
                console.log(`   🔹 ${station.station_code} - ${station.station_name}`);
            });
            
            return res.status(401).json({ error: 'Invalid station code' });
        }
        
        const station = stations[0];
        
        // Create JWT token
        const token = jwt.sign(
            {
                userId: 1,
                stationId: station.station_id,
                username: station.station_code,
                role: 'station'
            },
            process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET',
            { expiresIn: '24h' }
        );

        console.log(`🎫 Station token issued for: ${station.station_name}`);

        res.status(200).json({
            message: 'Station login successful',
            token: token,
            user: {
                userId: 1,
                username: station.station_code,
                role: 'station',
                stationId: station.station_id,
                stationName: station.station_name
            }
        });

    } catch (error) {
        console.error('❌ Station login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 STATIONS Backend running at http://localhost:${PORT}`);
    console.log('👨‍🚀 Welcome, Agent. System is live and monitoring.');
});

module.exports = app;
