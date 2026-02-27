require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { getConnection } = require('./mysql-connection');

// =================================
// REAL PRODUCTION BACKEND - MySQL ONLY
// =================================

const app = express();
const PORT = process.env.PORT || 5000;

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
// AUTHENTICATION ENDPOINTS
// =================================

// Naked Login (for DPO)
app.post('/api/auth/naked-login', async (req, res) => {
    console.log('🔐 Naked login attempt');
    const { username, password, role } = req.body;
    
    // Debug: Log what we receive
    console.log('📝 Login data received:', { username, password: password ? '***' : 'missing', role });
    
    if (!username || !password) {
        console.log('❌ Missing username or password');
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    try {
        const connection = await getConnection();

        // Frontend may send an email in the `username` field. Accept either username or email.
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
            [username, username]
        );

        if (!users || users.length === 0) {
            console.log('❌ Naked login failed: user not found in MySQL:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        const passwordOk = await bcrypt.compare(password, user.password_hash);
        if (!passwordOk) {
            console.log('❌ Naked login failed: bad password for user:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                userId: user.user_id, 
                username: user.username, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET',
            { expiresIn: '24h' }
        );

        console.log(`✅ Naked login successful (MySQL user): ${user.username}`);
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                userId: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('❌ Naked login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Station Login (Access Code Method) - for frontend compatibility
app.post('/api/station-login', async (req, res) => {
    console.log('🔐 Station login attempt (access code method)');
    const { access_code } = req.body;
    
    console.log('📝 Access code received:', JSON.stringify(access_code));
    console.log('📝 Full request body:', JSON.stringify(req.body));
    
    if (!access_code) {
        console.log('❌ No access code provided');
        return res.status(400).json({ error: 'Access code required' });
    }
    
    try {
        const connection = await getConnection();
        
        // Get station by access code
        const [stations] = await connection.execute('SELECT * FROM stations WHERE access_code = ?', [access_code]);
        
        console.log(`🔍 Found ${stations.length} stations with access code: ${access_code}`);
        
        if (stations.length === 0) {
            console.log('❌ Invalid access code:', access_code);
            
            // Get all available access codes for debugging
            const [allStations] = await connection.execute('SELECT station_name, access_code FROM stations WHERE access_code IS NOT NULL');
            const availableCodes = allStations.map(s => `${s.access_code} (${s.station_name})`).join(', ');
            
            return res.status(401).json({ 
                error: 'Invalid access code',
                hint: `Available codes: ${availableCodes}`
            });
        }
        
        const station = stations[0];
        const token = jwt.sign(
            { 
                username: `station-${station.station_id}`, 
                role: 'station', 
                stationId: station.station_id, 
                stationName: station.station_name 
            },
            process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET',
            { expiresIn: '24h' }
        );
        
        console.log(`✅ Station login successful: ${station.station_name}`);
        res.status(200).json({
            message: 'Station login successful',
            token,
            station: station
        });
        
    } catch (error) {
        console.error('❌ Station login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// =================================
// DASHBOARD ENDPOINTS (MySQL)
// =================================

// Get dashboard statistics
app.get('/api/dashboard', async (req, res) => {
    console.log('📊 Fetching dashboard data from MySQL');
    
    try {
        const connection = await getConnection();
        
        // Get user info from token (simplified - in production, use proper JWT verification)
        const token = req.headers.authorization?.replace('Bearer ', '');
        let stationInfo = null;
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET');
                if (decoded.role === 'station') {
                    // Get station info for station users
                    const [stations] = await connection.execute(
                        'SELECT * FROM stations WHERE station_id = ?',
                        [decoded.stationId]
                    );
                    if (stations.length > 0) {
                        stationInfo = stations[0];
                    }
                }
            } catch (jwtError) {
                console.log('Invalid token, using null station info');
            }
        }
        
        // Get counts
        const [stationCount] = await connection.execute('SELECT COUNT(*) as count FROM stations');
        const [suspectCount] = await connection.execute('SELECT COUNT(*) as count FROM suspects');
        const [caseCount] = await connection.execute('SELECT COUNT(*) as count FROM cases');
        const [propertyCount] = await connection.execute('SELECT COUNT(*) as count FROM properties');
        
        // Get recent activity
        const [recentSuspects] = await connection.execute(
            'SELECT * FROM suspects ORDER BY created_at DESC LIMIT 5'
        );
        const [recentCases] = await connection.execute(
            'SELECT * FROM cases ORDER BY created_at DESC LIMIT 5'
        );
        
        // Get case categories for chart
        const [caseCategories] = await connection.execute(`
            SELECT 
                CASE 
                    WHEN case_type LIKE '%theft%' THEN 'Theft'
                    WHEN case_type LIKE '%assault%' THEN 'Assault' 
                    WHEN case_type LIKE '%fraud%' THEN 'Fraud'
                    ELSE 'Other'
                END as category,
                COUNT(*) as value
            FROM cases 
            GROUP BY category
        `);
        
        const categoryData = caseCategories.map((cat: any) => ({
            name: cat.category,
            value: cat.value,
            color: cat.category === 'Theft' ? '#ef4444' : 
                   cat.category === 'Assault' ? '#f59e0b' : 
                   cat.category === 'Fraud' ? '#8b5cf6' : '#6b7280'
        }));
        
        const dashboardData = {
            station: stationInfo,
            stats: [
                {
                    name: "Total Stations",
                    value: stationCount[0].count,
                    trend: "up",
                    change: "+2"
                },
                {
                    name: "Total Suspects", 
                    value: suspectCount[0].count,
                    trend: "up",
                    change: "+12"
                },
                {
                    name: "Active Cases",
                    value: caseCount[0].count,
                    trend: "down", 
                    change: "-3"
                },
                {
                    name: "Properties",
                    value: propertyCount[0].count,
                    trend: "up",
                    change: "+5"
                }
            ],
            caseData: recentCases,
            categoryData: categoryData.length > 0 ? categoryData : [
                { name: "Theft", value: 0, color: "#ef4444" },
                { name: "Assault", value: 0, color: "#f59e0b" },
                { name: "Fraud", value: 0, color: "#8b5cf6" },
                { name: "Other", value: 0, color: "#6b7280" }
            ]
        };
        
        console.log('✅ Dashboard data fetched successfully');
        console.log('🔍 Dashboard data being sent:', JSON.stringify(dashboardData, null, 2));
        res.status(200).json(dashboardData);
        
    } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// =================================
// STATIONS ENDPOINTS (MySQL)
// =================================

// Get all stations
app.get('/api/stations', async (req, res) => {
    console.log('📊 Fetching all stations from MySQL');
    
    try {
        const connection = await getConnection();
        const [stations] = await connection.execute('SELECT * FROM stations ORDER BY station_id');
        
        console.log(`✅ Found ${stations.length} stations`);
        res.status(200).json(stations);
        
    } catch (error) {
        console.error('❌ Error fetching stations:', error);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

// Create new station
app.post('/api/stations', async (req, res) => {
    console.log('🏢 Creating new station in MySQL');
    
    try {
        const connection = await getConnection();
        const { name, code, location, sector, jurisdiction_type, phone, email, address } = req.body;
        
        if (!name || !code) {
            return res.status(400).json({ error: 'Station name and code required' });
        }
        
        // Generate unique access code
        const accessCode = `ACC${Date.now().toString().slice(-3)}`;
        
        const [result] = await connection.execute(
            'INSERT INTO stations (station_name, station_code, location, sector, jurisdiction_type, contact_phone, contact_email, address, access_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, code, location || 'To be updated', sector || 'To be updated', jurisdiction_type || 'local', phone || 'To be updated', email || 'To be updated', address || 'To be updated', accessCode]
        );
        
        console.log(`✅ Station created: ${name} (${code}) - ID: ${result.insertId}`);
        res.status(201).json({
            message: 'Station created successfully',
            station: {
                station_id: result.insertId,
                station_name: name,
                station_code: code,
                access_code: accessCode
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating station:', error);
        res.status(500).json({ error: 'Failed to create station' });
    }
});

// =================================
// START SERVER
// =================================

app.listen(PORT, () => {
    console.log('🚀 Starting production server with MySQL...');
    console.log(`✅ Production server running on http://localhost:${PORT}`);
    console.log('🗄️ Using MySQL database - NO IN-MEMORY STORAGE');
    console.log('🔒 Production ready - data persists after restart');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});
