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

// Request logging
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
});

// Test route
app.get('/api', (req, res) => {
    console.log('✅ API test endpoint hit');
    res.json({ message: 'STATIONS API is running' });
});

// Get suspects endpoint
app.get('/api/suspects', (req, res) => {
    console.log('🔍 Fetching suspects');
    
    try {
        // Mock suspects data
        const suspects = [
            {
                suspect_id: 1,
                name: 'John Doe',
                alias: 'JD',
                age: 35,
                gender: 'Male',
                nationality: 'Local',
                status: 'wanted',
                crime_type: 'Theft',
                last_seen: '2026-01-10',
                location: 'Downtown Area',
                station_id: 1,
                created_at: '2026-01-15T10:00:00Z'
            },
            {
                suspect_id: 2,
                name: 'Jane Smith',
                alias: 'JS',
                age: 28,
                gender: 'Female',
                nationality: 'Local',
                status: 'in_custody',
                crime_type: 'Assault',
                last_seen: '2026-01-12',
                location: 'North District',
                station_id: 1,
                created_at: '2026-01-15T11:00:00Z'
            }
        ];
        
        console.log(`✅ Returning ${suspects.length} suspects`);
        res.status(200).json(suspects);

    } catch (error) {
        console.error('❌ Error fetching suspects:', error);
        res.status(500).json({ error: 'Failed to fetch suspects' });
    }
});

// Naked login endpoint
app.post('/api/auth/naked-login', (req, res) => {
    console.log('🔓 Naked login route hit!');
    const { username, password, role } = req.body;
    
    try {
        console.log(`🔓 Naked login attempt: ${username}`);
        
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
app.post('/api/station-login', (req, res) => {
    const { access_code } = req.body;
    
    console.log(`🔑 Station login attempt: "${access_code}"`);
    
    try {
        const validStations = {
            'CPS-001': { id: 1, name: 'Central Police Station', location: 'Downtown District' },
            'NDP-002': { id: 2, name: 'North District Police', location: 'North District' },
            'STN-12345': { id: 12345, name: 'Test Police Station', location: 'Test Location' }
        };
        
        if (!validStations[access_code]) {
            return res.status(401).json({ error: 'Invalid station code' });
        }
        
        const station = validStations[access_code];
        
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

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 STATIONS Backend running at http://localhost:${PORT}`);
    console.log('👨‍🚀 Welcome, Agent. System is live and monitoring.');
    console.log('🔗 Endpoints available:');
    console.log('   GET  /api - Test');
    console.log('   GET  /api/suspects - Get suspects');
    console.log('   POST /api/auth/naked-login - DPO login');
    console.log('   POST /api/station-login - Station login');
});

module.exports = app;
