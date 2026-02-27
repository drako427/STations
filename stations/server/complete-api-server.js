require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { loadData, saveData } = require('./data-persistence');

// =================================
// IN-MEMORY DATA STORAGE
// =================================

// Load persisted data on server start
const initialData = loadData();
let stations = initialData.stations;
let suspects = initialData.suspects;
let properties = initialData.properties;
let cases = initialData.cases;
let suspectIdCounter = initialData.suspectIdCounter || 1;
let caseIdCounter = initialData.caseIdCounter || 1;

// In-memory storage
if (!stations) {
    stations = [
        {
            station_id: 123456789,
            station_name: 'Test Station API',
            station_code: 'TSA-001',
            location: 'Test Location',
            sector: 'Test Sector',
            jurisdiction_type: 'local',
            phone: '123-456-7890',
            email: 'test@station.com',
            address: '123 Test Street',
            status: 'active',
            created_at: new Date().toISOString()
        }
    ];
}

if (!suspects) {
    suspects = [];
}

if (!cases) {
    cases = [];
}
        phone: '123-456-7890',
        email: 'test@station.com',
        address: '123 Test Street',
        status: 'active',
        created_at: new Date().toISOString()
    }
];
let suspects = [];
let cases = [];
let suspectIdCounter = 1;
let caseIdCounter = 1;

// Configure middleware in correct order
app.use(express.json()); // Parse JSON bodies FIRST
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Configure CORS to allow frontend
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://10.0.5.21:3000', 'http://10.0.5.21:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: true
}));

// Configure multer for file uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// =================================
// STATIONS ENDPOINTS
// =================================

// Get all stations
app.get('/api/stations', (req, res) => {
    console.log('📊 Fetching all stations');
    res.status(200).json(stations);
});

// Create station
app.post('/api/stations', (req, res) => {
    console.log('🏢 Creating new station');
    const { name, code, location, sector, jurisdiction_type, phone, email, address } = req.body;
    
    if (!name || !code) {
        return res.status(400).json({ error: 'Station name and code are required' });
    }
    
    const newStation = {
        station_id: Date.now(),
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
    
    stations.push(newStation);
    console.log(`✅ Station created: ${name} (${code})`);
    
    res.status(201).json({
        message: 'Station created successfully',
        station: newStation,
        access_code: code
    });
});

// =================================
// SUSPECTS ENDPOINTS
// =================================

// Get all suspects
app.get('/api/suspects', (req, res) => {
    console.log('🔍 Fetching all suspects');
    res.status(200).json(suspects);
});

// Get suspects by station_id
app.get('/api/suspects/station/:station_id', (req, res) => {
    const { station_id } = req.params;
    console.log(`🔍 Fetching suspects for station: ${station_id}`);
    
    const stationSuspects = suspects.filter(s => s.station_id == station_id);
    console.log(`✅ Found ${stationSuspects.length} suspects for station ${station_id}`);
    
    res.status(200).json(stationSuspects);
});

// Create suspect (station scoped)
app.post('/api/suspects', (req, res) => {
    console.log('➕ Creating new suspect');
    const { 
        full_name, 
        date_of_birth, 
        crime_committed, 
        location_of_crime, 
        place_of_arrest, 
        date_of_arrest, 
        nationality, 
        physical_description, 
        risk_level, 
        is_national,
        station_id 
    } = req.body;
    
    // Get station_id from token if not provided
    let finalStationId = station_id;
    if (!finalStationId) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET');
                if (decodedToken.role === 'station') {
                    finalStationId = decodedToken.stationId;
                }
            } catch (error) {
                console.error('❌ Invalid token for suspect creation:', error.message);
            }
        }
    }
    
    if (!full_name || !finalStationId) {
        return res.status(400).json({ error: 'Suspect name and station_id are required' });
    }
    
    const newSuspect = {
        suspect_id: suspectIdCounter++,
        name: full_name,
        alias: '',
        age: date_of_birth ? new Date().getFullYear() - new Date(date_of_birth).getFullYear() : null,
        gender: 'Unknown',
        nationality: nationality || 'Unknown',
        status: 'under_investigation',
        crime_type: crime_committed || 'Unknown',
        last_seen: date_of_arrest || new Date().toISOString().split('T')[0],
        location: place_of_arrest || location_of_crime || 'Unknown',
        station_id: parseInt(finalStationId),
        physical_description: physical_description || '',
        risk_level: risk_level || 'medium',
        is_national: is_national || false,
        created_at: new Date().toISOString()
    };
    
    suspects.push(newSuspect);
    console.log(`✅ Suspect created: ${full_name} for station ${finalStationId}`);
    
    res.status(201).json({
        message: 'Suspect created successfully',
        suspect: newSuspect,
        suspect_id: newSuspect.suspect_id
    });
});

// =================================
// CASES ENDPOINTS
// =================================

// Get all cases
app.get('/api/cases', (req, res) => {
    console.log('📁 Fetching all cases');
    res.status(200).json(cases);
});

// Create case from suspect
app.post('/api/cases', (req, res) => {
    console.log('📁 Creating new case');
    const { title, description, suspect_id, station_id, case_type, status } = req.body;
    
    if (!title || !suspect_id || !station_id) {
        return res.status(400).json({ error: 'Title, suspect_id, and station_id are required' });
    }
    
    const newCase = {
        case_id: caseIdCounter++,
        title: title,
        description: description || '',
        suspect_id: parseInt(suspect_id),
        station_id: parseInt(station_id),
        case_type: case_type || 'investigation',
        status: status || 'active',
        date_opened: new Date().toISOString(),
        date_closed: null,
        created_at: new Date().toISOString()
    };
    
    cases.push(newCase);
    console.log(`✅ Case created: ${title} for suspect ${suspect_id}`);
    
    res.status(201).json({
        message: 'Case created successfully',
        case: newCase
    });
});

// =================================
// AUTH ENDPOINTS (No Authentication)
// =================================

// Simple naked login (no auth required)
app.options('/api/auth/naked-login', (req, res) => {
    console.log('🔓 OPTIONS preflight for naked login');
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).send();
});

app.post('/api/auth/naked-login', (req, res) => {
    console.log('🔓 Naked login route hit!');
    const { username, password, role } = req.body;
    
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
});

// Station login (no auth required)
app.post('/api/station-login', (req, res) => {
    const { access_code } = req.body;
    console.log(`🔑 Station login attempt: "${access_code}"`);
    
    const station = stations.find(s => s.station_code === access_code);
    
    if (!station) {
        return res.status(401).json({ error: 'Invalid station code' });
    }
    
    const token = jwt.sign(
        {
            userId: station.station_id,
            stationId: station.station_id,
            username: access_code,
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
            userId: station.station_id,
            username: access_code,
            role: 'station',
            stationId: station.station_id,
            stationName: station.station_name
        }
    });
});

// =================================
// PROPERTIES ENDPOINTS
// =================================

// Get all properties
app.get('/api/properties', (req, res) => {
    console.log('🏠 Fetching all properties');
    
    const properties = [
        {
            property_id: 1,
            name: 'Stolen Laptop',
            description: 'Dell XPS 15 laptop stolen from office',
            category: 'Electronics',
            value: 1500,
            status: 'missing',
            reported_date: '2026-01-10',
            location: 'Downtown Office',
            station_id: 1,
            suspect_id: 1,
            created_at: '2026-01-15T10:00:00Z'
        },
        {
            property_id: 2,
            name: 'Missing Wallet',
            description: 'Brown leather wallet with credit cards',
            category: 'Personal Items',
            value: 200,
            status: 'missing',
            reported_date: '2026-01-12',
            location: 'Shopping Mall',
            station_id: 1,
            suspect_id: 2,
            created_at: '2026-01-15T11:00:00Z'
        },
        {
            property_id: 3,
            name: 'Stolen Bicycle',
            description: 'Mountain bike stolen from parking lot',
            category: 'Vehicle',
            value: 800,
            status: 'recovered',
            reported_date: '2026-01-08',
            location: 'Apartment Complex',
            station_id: 1,
            suspect_id: 1,
            created_at: '2026-01-15T12:00:00Z'
        }
    ];
    
    console.log(`✅ Returning ${properties.length} properties`);
    res.status(200).json(properties);
});

// Create property
app.post('/api/properties', upload.single('image'), (req, res) => {
    console.log('➕ Creating new property');
    const { 
        name, 
        item_name, 
        description, 
        category, 
        estimated_value, 
        value,
        status, 
        reported_date, 
        location, 
        station_id, 
        suspect_id 
    } = req.body;
    
    // Get station_id from token if not provided
    let finalStationId = station_id;
    if (!finalStationId) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET');
                if (decodedToken.role === 'station') {
                    finalStationId = decodedToken.stationId;
                }
            } catch (error) {
                console.error('❌ Invalid token for property creation:', error.message);
            }
        }
    }
    
    const propertyName = name || item_name;
    const propertyValue = estimated_value || value;
    
    if (!propertyName || !finalStationId) {
        return res.status(400).json({ error: 'Property name and station_id are required' });
    }
    
    const newProperty = {
        property_id: Date.now(),
        name: propertyName,
        description: description || '',
        category: category || 'Unknown',
        value: propertyValue || 0,
        status: status || 'missing',
        reported_date: reported_date || new Date().toISOString().split('T')[0],
        location: location || 'Unknown',
        station_id: parseInt(finalStationId),
        suspect_id: suspect_id ? parseInt(suspect_id) : null,
        created_at: new Date().toISOString()
    };
    
    properties.push(newProperty);
    console.log(`✅ Property created: ${propertyName} for station ${finalStationId}`);
    
    res.status(201).json({
        message: 'Property created successfully',
        property: newProperty,
        property_id: newProperty.property_id
    });
});

// =================================
// UTILITY ENDPOINTS
// =================================

// Dashboard endpoint
app.get('/api/dashboard', (req, res) => {
    console.log('📊 Fetching dashboard data');
    
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    let decodedToken;
    
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET');
        console.log(`🎫 Token verified for user: ${decodedToken.username}, role: ${decodedToken.role}`);
    } catch (error) {
        console.error('❌ Invalid token:', error.message);
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Role-based dashboard data
    let dashboardData;
    
    if (decodedToken.role === 'station') {
        // Station-specific dashboard
        const stationId = decodedToken.stationId;
        const station = stations.find(s => s.station_id === stationId);
        
        if (!station) {
            return res.status(404).json({ error: 'Station not found' });
        }
        
        // Station-specific statistics
        const stationSuspects = suspects.filter(s => s.station_id === stationId);
        const stationCases = cases.filter(c => c.station_id === stationId);
        const stationProperties = [
            {
                property_id: 1,
                name: 'Stolen Laptop',
                description: 'Dell XPS 15 laptop stolen from office',
                category: 'Electronics',
                value: 1500,
                status: 'missing',
                reported_date: '2026-01-10',
                location: 'Downtown Office',
                station_id: stationId,
                suspect_id: 1,
                created_at: '2026-01-15T10:00:00Z'
            },
            {
                property_id: 2,
                name: 'Missing Wallet',
                description: 'Brown leather wallet with credit cards',
                category: 'Personal Items',
                value: 200,
                status: 'missing',
                reported_date: '2026-01-12',
                location: 'Shopping Mall',
                station_id: stationId,
                suspect_id: 2,
                created_at: '2026-01-15T11:00:00Z'
            }
        ];
        
        dashboardData = {
            // Station information
            station: {
                station_id: station.station_id,
                station_name: station.station_name,
                station_code: station.station_code,
                location: station.location,
                sector: station.sector
            },
            
            // Station-specific statistics
            totalStations: 1, // Only this station
            totalSuspects: stationSuspects.length,
            totalCases: stationCases.length,
            activeCases: stationCases.filter(c => c.status === 'active').length,
            wantedSuspects: stationSuspects.filter(s => s.status === 'wanted').length,
            inCustodySuspects: stationSuspects.filter(s => s.status === 'in_custody').length,
            closedCases: stationCases.filter(c => c.status === 'closed').length,
            
            // Stats for dashboard cards
            stats: [
                {
                    name: "Total Suspects",
                    value: stationSuspects.length,
                    change: "+2",
                    trend: "up"
                },
                {
                    name: "Active Cases", 
                    value: stationCases.filter(c => c.status === 'active').length,
                    change: "+1",
                    trend: "up"
                },
                {
                    name: "Closed (MTD)",
                    value: stationCases.filter(c => c.status === 'closed' && new Date(c.date_closed).getMonth() === new Date().getMonth()).length,
                    change: "+1",
                    trend: "up"
                },
                {
                    name: "Properties",
                    value: stationProperties.length,
                    change: "+1",
                    trend: "up"
                }
            ],
            
            // Case data for line chart (station-specific)
            caseData: [
                { month: 'Jan', cases: 5 },
                { month: 'Feb', cases: 8 },
                { month: 'Mar', cases: 6 },
                { month: 'Apr', cases: 10 },
                { month: 'May', cases: 9 },
                { month: 'Jun', cases: 12 }
            ],
            
            // Category data for bar chart (station-specific)
            categoryData: [
                { name: 'Theft', value: stationSuspects.filter(s => s.crime_type === 'Theft').length, color: '#ef4444' },
                { name: 'Assault', value: stationSuspects.filter(s => s.crime_type === 'Assault').length, color: '#f59e0b' },
                { name: 'Fraud', value: stationSuspects.filter(s => s.crime_type === 'Fraud').length, color: '#10b981' },
                { name: 'Other', value: stationSuspects.filter(s => !['Theft', 'Assault', 'Fraud'].includes(s.crime_type)).length, color: '#6366f1' }
            ],
            
            recentActivity: {
                newStations: [station], // This station
                newSuspects: stationSuspects.slice(-3),
                newCases: stationCases.slice(-3)
            }
        };
        
        console.log(`✅ Station dashboard generated for: ${station.station_name}`);
        
    } else {
        // DPO/System-wide dashboard
        dashboardData = {
            // No station information for DPO
            station: null,
            
            // System-wide statistics
            totalStations: stations.length,
            totalSuspects: suspects.length,
            totalCases: cases.length,
            activeCases: cases.filter(c => c.status === 'active').length,
            wantedSuspects: suspects.filter(s => s.status === 'wanted').length,
            inCustodySuspects: suspects.filter(s => s.status === 'in_custody').length,
            closedCases: cases.filter(c => c.status === 'closed').length,
            
            // Stats for dashboard cards
            stats: [
                {
                    name: "Total Suspects",
                    value: suspects.length,
                    change: "+2",
                    trend: "up"
                },
                {
                    name: "Active Cases", 
                    value: cases.filter(c => c.status === 'active').length,
                    change: "+1",
                    trend: "up"
                },
                {
                    name: "Closed (MTD)",
                    value: cases.filter(c => c.status === 'closed' && new Date(c.date_closed).getMonth() === new Date().getMonth()).length,
                    change: "+1",
                    trend: "up"
                },
                {
                    name: "Total Stations",
                    value: stations.length,
                    change: "+1",
                    trend: "up"
                }
            ],
            
            // Case data for line chart
            caseData: [
                { month: 'Jan', cases: 12 },
                { month: 'Feb', cases: 19 },
                { month: 'Mar', cases: 15 },
                { month: 'Apr', cases: 25 },
                { month: 'May', cases: 22 },
                { month: 'Jun', cases: 30 }
            ],
            
            // Category data for bar chart
            categoryData: [
                { name: 'Theft', value: suspects.filter(s => s.crime_type === 'Theft').length, color: '#ef4444' },
                { name: 'Assault', value: suspects.filter(s => s.crime_type === 'Assault').length, color: '#f59e0b' },
                { name: 'Fraud', value: suspects.filter(s => s.crime_type === 'Fraud').length, color: '#10b981' },
                { name: 'Other', value: suspects.filter(s => !['Theft', 'Assault', 'Fraud'].includes(s.crime_type)).length, color: '#6366f1' }
            ],
            
            recentActivity: {
                newStations: stations.slice(-3),
                newSuspects: suspects.slice(-3),
                newCases: cases.slice(-3)
            }
        };
        
        console.log('✅ DPO dashboard generated (system-wide view)');
    }
    
    console.log('✅ Dashboard data generated');
    res.status(200).json(dashboardData);
});

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Complete API is operational',
        timestamp: new Date().toISOString(),
        endpoints: {
            stations: 'GET /api/stations, POST /api/stations',
            suspects: 'GET /api/suspects, GET /api/suspects/station/:station_id, POST /api/suspects',
            cases: 'GET /api/cases, POST /api/cases',
            properties: 'GET /api/properties, POST /api/properties',
            dashboard: 'GET /api/dashboard',
            auth: 'POST /api/auth/naked-login, POST /api/station-login'
        }
    });
});

// Test endpoint
app.get('/api', (req, res) => {
    res.json({ 
        message: 'Complete STATIONS API is running',
        version: '2.0',
        endpoints: {
            stations: 'GET /api/stations, POST /api/stations',
            suspects: 'GET /api/suspects, GET /api/suspects/station/:station_id, POST /api/suspects',
            cases: 'GET /api/cases, POST /api/cases',
            auth: 'POST /api/auth/naked-login, POST /api/station-login'
        }
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Complete STATIONS API running at http://localhost:${PORT}`);
    console.log('👨‍🚀 Welcome, Agent. System is live and monitoring.');
    console.log('🔗 Available Endpoints:');
    console.log('   📋 Stations:');
    console.log('      GET  /api/stations - Get all stations');
    console.log('      POST /api/stations - Create station');
    console.log('   🔍 Suspects:');
    console.log('      GET  /api/suspects - Get all suspects');
    console.log('      GET  /api/suspects/station/:station_id - Get suspects by station');
    console.log('      POST /api/suspects - Create suspect');
    console.log('   📁 Cases:');
    console.log('      GET  /api/cases - Get all cases');
    console.log('      POST /api/cases - Create case from suspect');
    console.log('   🏠 Properties:');
    console.log('      GET  /api/properties - Get all properties');
    console.log('      POST /api/properties - Create property');
    console.log('   📊 Dashboard:');
    console.log('      GET  /api/dashboard - Get dashboard data');
    console.log('   🔐 Auth:');
    console.log('      POST /api/auth/naked-login - DPO login');
    console.log('      POST /api/station-login - Station login');
});

// Keep process alive
process.on('SIGINT', () => {
    console.log('\n🔐 Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

setInterval(() => {}, 10000);

module.exports = app;
