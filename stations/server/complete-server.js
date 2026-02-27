require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory storage for registered stations
let registeredStations = [];

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

// Health check
app.get('/api/health', (req, res) => {
    console.log('✅ Health check endpoint hit');
    res.status(200).json({
        status: 'success',
        message: 'STATIONS API is operational',
        timestamp: new Date().toISOString()
    });
});

// Get all stations endpoint for DPO
app.get('/api/stations', (req, res) => {
    console.log('📊 Fetching all stations for DPO');
    console.log(`📋 Currently registered stations: ${registeredStations.length}`);
    
    try {
        console.log('✅ Returning registered stations:', registeredStations.map(s => s.station_name));
        res.status(200).json(registeredStations);

    } catch (error) {
        console.error('❌ Error fetching stations:', error);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

// Register new station endpoint for DPO
app.post('/api/stations', (req, res) => {
    console.log('🏢 Registering new station');
    
    try {
        const { name, code, location, sector, jurisdiction_type, phone, email, address } = req.body;
        
        console.log(`📝 Station registration data:`, { name, code, location, sector, jurisdiction_type, phone, email, address });
        
        // Validate required fields
        if (!name || !code) {
            return res.status(400).json({ error: 'Station name and code are required' });
        }
        
        // Create new station object
        const newStation = {
            station_id: Date.now(), // Use timestamp as ID
            station_name: name,
            station_code: code,
            location: location || 'To be updated',
            sector: sector || 'To be updated',
            jurisdiction_type: jurisdiction_type || 'local',
            phone: phone || 'To be updated',
            email: email || 'To be updated',
            address: address || 'To be updated',
            status: 'active',
            created_at: new Date().toISOString()
        };
        
        // Add to in-memory storage
        registeredStations.push(newStation);
        
        console.log(`✅ Station registered successfully: ${newStation.station_name} (${newStation.station_code})`);
        console.log(`📋 Total stations now: ${registeredStations.length}`);
        
        res.status(201).json({
            message: 'Station registered successfully',
            station: newStation,
            access_code: code // Return access code for new station
        });

    } catch (error) {
        console.error('❌ Error registering station:', error);
        res.status(500).json({ error: 'Failed to register station' });
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
        // For now, accept any station code that starts with "STN-" or the original hardcoded codes
        const hardcodedStations = {
            'CPS-001': { id: 1, name: 'Central Police Station', location: 'Downtown District' },
            'NDP-002': { id: 2, name: 'North District Police', location: 'North District' },
            'ESS-003': { id: 3, name: 'East Sector Station', location: 'East Sector' },
            'WPP-004': { id: 4, name: 'West Precinct', location: 'West Area' },
            'SCC-005': { id: 5, name: 'South Command', location: 'South District' },
            'FHQ-006': { id: 6, name: 'Federal HQ', location: 'Federal Headquarters' }
        };
        
        let station = null;
        
        // Check if it's a hardcoded station
        if (hardcodedStations[access_code]) {
            station = hardcodedStations[access_code];
        } 
        // Check if it's a dynamically registered station (starts with STN-)
        else if (access_code.startsWith('STN-')) {
            station = {
                id: parseInt(access_code.replace('STN-', '')) || Date.now(),
                name: `Dynamic Station ${access_code}`,
                location: 'Dynamic Location'
            };
        }
        
        console.log(`📊 Checking station code: "${access_code}"`);
        
        if (!station) {
            console.log('❌ No station found with that code');
            console.log('📋 Available station codes:');
            Object.keys(hardcodedStations).forEach(code => {
                console.log(`   🔹 ${code} - ${hardcodedStations[code].name}`);
            });
            console.log('   🔹 STN-XXXXX - Dynamic stations');
            
            return res.status(401).json({ error: 'Invalid station code' });
        }
        
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
            },
            {
                suspect_id: 3,
                name: 'Mike Johnson',
                alias: 'MJ',
                age: 42,
                gender: 'Male',
                nationality: 'Foreign',
                status: 'under_investigation',
                crime_type: 'Fraud',
                last_seen: '2026-01-08',
                location: 'East Sector',
                station_id: 1,
                created_at: '2026-01-15T12:00:00Z'
            }
        ];
        
        console.log(`✅ Returning ${suspects.length} suspects`);
        res.status(200).json(suspects);

    } catch (error) {
        console.error('❌ Error fetching suspects:', error);
        res.status(500).json({ error: 'Failed to fetch suspects' });
    }
});

// Add new suspect endpoint
app.post('/api/suspects', (req, res) => {
    console.log('➕ Adding new suspect');
    
    try {
        const { name, alias, age, gender, nationality, status, crime_type, last_seen, location } = req.body;
        
        console.log(`📝 New suspect data:`, { name, alias, age, gender, nationality, status, crime_type, last_seen, location });
        
        // Validate required fields
        if (!name) {
            return res.status(400).json({ error: 'Suspect name is required' });
        }
        
        // Create new suspect object
        const newSuspect = {
            suspect_id: Date.now(),
            name: name,
            alias: alias || '',
            age: age || null,
            gender: gender || 'Unknown',
            nationality: nationality || 'Unknown',
            status: status || 'under_investigation',
            crime_type: crime_type || 'Unknown',
            last_seen: last_seen || null,
            location: location || 'Unknown',
            station_id: 1,
            created_at: new Date().toISOString()
        };
        
        console.log(`✅ Suspect added successfully: ${newSuspect.name}`);
        
        res.status(201).json({
            message: 'Suspect added successfully',
            suspect: newSuspect
        });

    } catch (error) {
        console.error('❌ Error adding suspect:', error);
        res.status(500).json({ error: 'Failed to add suspect' });
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

// Keep process alive
setInterval(() => {}, 10000);

module.exports = app;
