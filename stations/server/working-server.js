require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Test route
app.get('/api', (req, res) => {
    res.json({ message: 'STATIONS API is running' });
});

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'STATIONS API is operational',
        timestamp: new Date().toISOString()
    });
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

// Station login endpoint - HARDCODED VERSION
app.post('/api/station-login', async (req, res) => {
    const { access_code } = req.body;
    
    console.log(`🔑 Station login attempt: "${access_code}"`);
    
    try {
        // Hardcoded station codes for testing
        const validStations = {
            'CPS-001': { id: 1, name: 'Central Police Station', location: 'Downtown District' },
            'NDP-002': { id: 2, name: 'North District Police', location: 'North District' },
            'ESS-003': { id: 3, name: 'East Sector Station', location: 'East Sector' },
            'WPP-004': { id: 4, name: 'West Precinct', location: 'West Area' },
            'SCC-005': { id: 5, name: 'South Command', location: 'South District' },
            'FHQ-006': { id: 6, name: 'Federal HQ', location: 'Federal Headquarters' }
        };
        
        console.log(`📊 Checking station code: "${access_code}"`);
        
        if (!validStations[access_code]) {
            console.log('❌ No station found with that code');
            console.log('📋 Available station codes:');
            Object.keys(validStations).forEach(code => {
                console.log(`   🔹 ${code} - ${validStations[code].name}`);
            });
            
            return res.status(401).json({ error: 'Invalid station code' });
        }
        
        const station = validStations[access_code];
        
        // Create JWT token
        const token = jwt.sign(
            {
                userId: station.id,
                stationId: station.id,
                username: access_code,
                role: 'station'
            },
            process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET',
            { expiresIn: '24h' }
        );

        console.log(`🎫 Station token issued for: ${station.name}`);

        res.status(200).json({
            message: 'Station login successful',
            token: token,
            user: {
                userId: station.id,
                username: access_code,
                role: 'station',
                stationId: station.id,
                stationName: station.name
            }
        });

    } catch (error) {
        console.error('❌ Station login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get all stations endpoint for DPO
app.get('/api/stations', async (req, res) => {
    console.log('📊 Fetching all stations for DPO');
    
    try {
        // Hardcoded stations data
        const stations = [
            { station_id: 1, station_name: 'Central Police Station', station_code: 'CPS-001', location: 'Downtown District', sector: 'Central', jurisdiction_type: 'local', status: 'active' },
            { station_id: 2, station_name: 'North District Police', station_code: 'NDP-002', location: 'North District', sector: 'North', jurisdiction_type: 'local', status: 'active' },
            { station_id: 3, station_name: 'East Sector Station', station_code: 'ESS-003', location: 'East Sector', sector: 'East', jurisdiction_type: 'local', status: 'active' },
            { station_id: 4, station_name: 'West Precinct', station_code: 'WPP-004', location: 'West Area', sector: 'West', jurisdiction_type: 'local', status: 'active' },
            { station_id: 5, station_name: 'South Command', station_code: 'SCC-005', location: 'South District', sector: 'South', jurisdiction_type: 'local', status: 'active' },
            { station_id: 6, station_name: 'Federal HQ', station_code: 'FHQ-006', location: 'Federal Headquarters', sector: 'Federal', jurisdiction_type: 'federal', status: 'active' }
        ];
        
        console.log(`✅ Returning ${stations.length} stations`);
        
        res.status(200).json(stations);

    } catch (error) {
        console.error('❌ Error fetching stations:', error);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 STATIONS Backend running at http://localhost:${PORT}`);
    console.log('👨‍🚀 Welcome, Agent. System is live and monitoring.');
    console.log('📋 Available station codes: CPS-001, NDP-002, ESS-003, WPP-004, SCC-005, FHQ-006');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔐 Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

module.exports = app;
