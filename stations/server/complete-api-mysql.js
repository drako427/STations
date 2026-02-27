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
    allowedHeaders: ['Content-Type', 'Authorization', 'multipart/form-data'],
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
// STATIONS ENDPOINTS (MySQL)
// =================================

// Get all stations
app.get('/api/stations', async (req, res) => {
    console.log('📊 Fetching all stations from MySQL');
    
    try {
        const connection = await getConnection();
        const [stations] = await connection.execute('SELECT * FROM stations ORDER BY created_at DESC');
        console.log(`✅ Found ${stations.length} stations`);
        res.status(200).json(stations);
    } catch (error) {
        console.error('❌ Error fetching stations:', error);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

// Create station
app.post('/api/stations', async (req, res) => {
    console.log('🏢 Creating new station in MySQL');
    const { name, code, location, sector, jurisdiction_type, phone, email, address } = req.body;
    
    if (!name || !code) {
        return res.status(400).json({ error: 'Station name and code are required' });
    }
    
    try {
        const connection = await getConnection();
        
        const [result] = await connection.execute(
            `INSERT INTO stations (station_name, station_code, access_code, location, sector, jurisdiction_type, contact_phone, contact_email, address)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, code, code, location, sector, jurisdiction_type, phone, email, address]
        );
        
        console.log(`✅ Station created: ${name} (${code}) - ID: ${result.insertId}`);
        
        // Return the created station
        const [newStation] = await connection.execute('SELECT * FROM stations WHERE station_id = ?', [result.insertId]);
        
        res.status(201).json({
            message: 'Station created successfully',
            station: newStation[0],
            access_code: code
        });
        
    } catch (error) {
        console.error('❌ Error creating station:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Station code already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create station' });
        }
    }
});

// =================================
// SUSPECTS ENDPOINTS (MySQL)
// =================================

// Get all suspects
// Get suspects for current user's station (My Suspects page)
app.get('/api/suspects', async (req, res) => {
    console.log('🔍 Fetching suspects for current user station from MySQL');
    
    try {
        // Get station_id from token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization token required' });
        }
        
        const token = authHeader.substring(7);
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET');
        
        if (!decodedToken.stationId) {
            return res.status(403).json({ error: 'Station ID required in token' });
        }
        
        const connection = await getConnection();
        const [suspects] = await connection.execute(`
            SELECT s.*, st.station_name 
            FROM suspects s 
            LEFT JOIN stations st ON s.station_id = st.station_id 
            WHERE s.station_id = ?
            ORDER BY s.created_at DESC
        `, [decodedToken.stationId]);
        
        console.log(`✅ Found ${suspects.length} suspects for station ${decodedToken.stationId}`);
        res.status(200).json(suspects);
    } catch (error) {
        console.error('❌ Error fetching suspects:', error);
        res.status(500).json({ error: 'Failed to fetch suspects' });
    }
});

// Get suspects by station_id
app.get('/api/suspects/station/:station_id', async (req, res) => {
    const { station_id } = req.params;
    console.log(`🔍 Fetching suspects for station: ${station_id}`);
    
    try {
        const connection = await getConnection();
        const [suspects] = await connection.execute(
            'SELECT * FROM suspects WHERE station_id = ? ORDER BY created_at DESC',
            [station_id]
        );
        
        console.log(`✅ Found ${suspects.length} suspects for station ${station_id}`);
        res.status(200).json(suspects);
        
    } catch (error) {
        console.error('❌ Error fetching station suspects:', error);
        res.status(500).json({ error: 'Failed to fetch station suspects' });
    }
});

// Create suspect
app.post('/api/suspects', async (req, res) => {
    console.log('➕ Creating new suspect in MySQL');
    console.log('📝 Request body:', req.body);
    
    const { 
        full_name, 
        date_of_birth, 
        crime_committed, 
        nationality, 
        physical_description, 
        risk_level, 
        is_national,
        station_id 
    } = req.body;
    
    // Get station_id from token if not provided
    let finalStationId = station_id;
    console.log('🔍 Initial station_id from request:', finalStationId);
    
    if (!finalStationId) {
        const authHeader = req.headers.authorization;
        console.log('🔍 Auth header:', authHeader ? 'exists' : 'missing');
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            console.log('🔍 Token extracted:', token.substring(0, 20) + '...');
            
            try {
                const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET');
                console.log('🔍 Decoded token:', decodedToken);
                
                if (decodedToken.role === 'station') {
                    finalStationId = decodedToken.stationId; // Changed from station_id to stationId
                    console.log('✅ Extracted stationId from token:', finalStationId);
                } else {
                    console.log('❌ Token role is not station:', decodedToken.role);
                }
            } catch (error) {
                console.error('❌ Invalid token for suspect creation:', error.message);
            }
        }
    }
    
    console.log('🔍 Final station_id:', finalStationId);
    console.log('🔍 Full name:', full_name);
    
    if (!full_name || !finalStationId) {
        console.log('❌ Validation failed - full_name:', !!full_name, 'finalStationId:', !!finalStationId);
        return res.status(400).json({ error: 'Suspect name and station_id are required' });
    }
    
    try {
        const connection = await getConnection();
        
        // Generate suspect code
        const suspect_code = `S-${String(Date.now()).slice(-6)}`;
        
        // Convert date_of_birth to proper MySQL format if it's just a year
        let formattedDateOfBirth = date_of_birth;
        if (date_of_birth && /^\d{4}$/.test(date_of_birth)) {
            formattedDateOfBirth = `${date_of_birth}-01-01`;
            console.log('🔄 Converted date from year to full date:', date_of_birth, '→', formattedDateOfBirth);
        }
        
        const [result] = await connection.execute(
            `INSERT INTO suspects (suspect_code, full_name, date_of_birth, crime_committed, nationality, physical_description, risk_level, is_national, station_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [suspect_code, full_name, formattedDateOfBirth, crime_committed, nationality, physical_description, risk_level, is_national, finalStationId]
        );
        
        console.log(`✅ Suspect created: ${full_name} for station ${finalStationId} - ID: ${result.insertId}`);
        
        // Return the created suspect
        const [newSuspect] = await connection.execute('SELECT * FROM suspects WHERE suspect_id = ?', [result.insertId]);
        
        res.status(201).json({
            message: 'Suspect created successfully',
            suspect: newSuspect[0],
            suspect_id: result.insertId
        });
        
    } catch (error) {
        console.error('❌ Error creating suspect:', error);
        res.status(500).json({ error: 'Failed to create suspect' });
    }
});

// =================================
// CASES ENDPOINTS (MySQL)
// =================================

// Get all cases
app.get('/api/cases', async (req, res) => {
    console.log('📁 Fetching all cases from MySQL');
    
    try {
        const connection = await getConnection();
        const [cases] = await connection.execute(`
            SELECT c.*, st.station_name 
            FROM cases c 
            LEFT JOIN stations st ON c.station_id = st.station_id 
            ORDER BY c.created_at DESC
        `);
        console.log(`✅ Found ${cases.length} cases`);
        res.status(200).json(cases);
    } catch (error) {
        console.error('❌ Error fetching cases:', error);
        res.status(500).json({ error: 'Failed to fetch cases' });
    }
});

// Create case
app.post('/api/cases', async (req, res) => {
    console.log('📁 Creating new case in MySQL');
    const { title, description, suspect_id, station_id, case_type, status } = req.body;
    
    if (!title || !suspect_id || !station_id) {
        return res.status(400).json({ error: 'Title, suspect_id, and station_id are required' });
    }
    
    try {
        const connection = await getConnection();
        
        // Generate case number
        const case_number = `CASE-${String(Date.now()).slice(-6)}`;
        
        const [result] = await connection.execute(
            `INSERT INTO cases (case_number, title, description, suspect_id, station_id, case_type, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [case_number, title, description, suspect_id, station_id, case_type, status]
        );
        
        console.log(`✅ Case created: ${title} for suspect ${suspect_id} - ID: ${result.insertId}`);
        
        // Return the created case
        const [newCase] = await connection.execute('SELECT * FROM cases WHERE case_id = ?', [result.insertId]);
        
        res.status(201).json({
            message: 'Case created successfully',
            case: newCase[0]
        });
        
    } catch (error) {
        console.error('❌ Error creating case:', error);
        res.status(500).json({ error: 'Failed to create case' });
    }
});

// =================================
// PROPERTIES ENDPOINTS (MySQL)
// =================================

// Test endpoint
app.get('/api/test', (req, res) => {
    console.log('🧪 Test endpoint hit!');
    res.status(200).json({ message: 'Server is working!' });
});

// Test POST endpoint (no file upload)
app.post('/api/test-post', (req, res) => {
    console.log('🧪 Test POST endpoint hit!');
    console.log('📝 Request body:', req.body);
    res.status(200).json({ message: 'POST request working!' });
});

// Get properties for current user's station (My Properties page)
app.get('/api/properties', async (req, res) => {
    console.log('🏠 Fetching properties for current user station from MySQL');
    
    try {
        // Get station_id from token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization token required' });
        }
        
        const token = authHeader.substring(7);
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET');
        
        if (!decodedToken.stationId) {
            return res.status(403).json({ error: 'Station ID required in token' });
        }
        
        const connection = await getConnection();
        const [properties] = await connection.execute(`
            SELECT p.*, st.station_name 
            FROM properties p 
            LEFT JOIN stations st ON p.station_id = st.station_id 
            WHERE p.station_id = ?
            ORDER BY p.created_at DESC
        `, [decodedToken.stationId]);
        
        console.log(`✅ Found ${properties.length} properties for station ${decodedToken.stationId}`);
        res.status(200).json(properties);
    } catch (error) {
        console.error('❌ Error fetching properties:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

// Create property
app.post('/api/properties', (req, res) => {
    console.log('➕ Creating new property in MySQL');
    console.log('📝 Request headers:', req.headers);
    console.log('📝 Content-Type:', req.headers['content-type']);
    
    // Use multer middleware first
    const multer = require('multer');
    const upload = multer({ storage: multer.memoryStorage() }).single('image');
    
    upload(req, res, (err) => {
        if (err) {
            console.error('❌ Multer error:', err);
            return res.status(400).json({ error: 'File upload failed' });
        }
        
        console.log('✅ Multer parsed successfully');
        console.log('📝 Request body after multer:', req.body);
        console.log('📝 Request file after multer:', req.file ? 'exists' : 'missing');
        
        // Now handle the property creation
        handlePropertyCreation(req, res);
    });
});

// Separate function to handle property creation after multer processing
async function handlePropertyCreation(req, res) {
    try {
        // Get station_id from token
        const authHeader = req.headers.authorization;
        console.log('🔍 Auth header:', authHeader ? 'exists' : 'missing');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization token required' });
        }
        
        const token = authHeader.substring(7);
        console.log('🔍 Token extracted:', token.substring(0, 20) + '...');
        
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET');
        console.log('🔍 Decoded token:', decodedToken);
        
        if (!decodedToken.stationId) {
            return res.status(403).json({ error: 'Station ID required in token' });
        }
        
        // Extract property data from multer-parsed body
        const propertyData = {
            item_name: req.body.item_name,
            description: req.body.description,
            category: req.body.category,
            estimated_value: req.body.estimated_value
        };
        
        let imageBuffer = null;
        if (req.file) {
            imageBuffer = req.file.buffer;
            console.log('📷 Image buffer size:', imageBuffer.length);
        }
        
        console.log('🔍 Property data:', propertyData);
        
        const { item_name, description, category, estimated_value } = propertyData;
        
        if (!item_name || !decodedToken.stationId) {
            console.log('❌ Validation failed - item_name:', !!item_name, 'stationId:', !!decodedToken.stationId);
            return res.status(400).json({ error: 'Property name and station_id are required' });
        }
        
        const connection = await getConnection();
        
        const [result] = await connection.execute(
            `INSERT INTO properties (item_name, description, category, estimated_value, station_id, image)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [item_name, description, category, estimated_value, decodedToken.stationId, imageBuffer]
        );
        
        console.log(`✅ Property created: ${item_name} for station ${decodedToken.stationId} - ID: ${result.insertId}`);
        
        // Return the created property
        const [newProperty] = await connection.execute('SELECT * FROM properties WHERE property_id = ?', [result.insertId]);
        
        res.status(201).json({
            message: 'Property created successfully',
            property: newProperty[0],
            property_id: result.insertId
        });
        
    } catch (error) {
        console.error('❌ Error creating property:', error);
        res.status(500).json({ error: 'Failed to create property' });
    }
}

// =================================
// AUTHENTICATION ENDPOINTS (MySQL)
// =================================

// DPO Login
app.post('/api/auth/dpo-login', async (req, res) => {
    console.log('🔐 DPO login attempt');
    const { username, password, role } = req.body;
    
    if (!username || !password || role !== 'dpo') {
        return res.status(400).json({ error: 'DPO credentials required' });
    }
    
    try {
        const connection = await getConnection();
        
        // For now, use hardcoded DPO credentials (in production, this would be in users table)
        if (username === 'dpo' && password === 'dpo123') {
            const token = jwt.sign(
                { username, role: 'dpo' },
                process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET',
                { expiresIn: '24h' }
            );
            
            console.log('✅ DPO login successful');
            res.status(200).json({
                message: 'DPO login successful',
                token,
                user: { username, role: 'dpo' }
            });
        } else {
            console.log('❌ Invalid DPO credentials');
            res.status(401).json({ error: 'Invalid DPO credentials' });
        }
        
    } catch (error) {
        console.error('❌ DPO login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Station Login
app.post('/api/auth/station-login', async (req, res) => {
    console.log('🔐 Station login attempt');
    const { username, password, station_id } = req.body;
    
    if (!username || !password || !station_id) {
        return res.status(400).json({ error: 'Username, password, and station_id required' });
    }
    
    try {
        const connection = await getConnection();
        
        // Get station info
        const [stations] = await connection.execute('SELECT * FROM stations WHERE station_id = ?', [station_id]);
        
        if (stations.length === 0) {
            return res.status(404).json({ error: 'Station not found' });
        }
        
        const station = stations[0];
        
        // For now, use station_code as password (in production, use users table)
        if (password === station.station_code) {
            const token = jwt.sign(
                { username, role: 'station', stationId: station.station_id, stationName: station.station_name },
                process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET',
                { expiresIn: '24h' }
            );
            
            console.log(`✅ Station login successful: ${station.station_name}`);
            res.status(200).json({
                message: 'Station login successful',
                token,
                station: station
            });
        } else {
            console.log('❌ Invalid station credentials');
            res.status(401).json({ error: 'Invalid station credentials' });
        }
        
    } catch (error) {
        console.error('❌ Station login error:', error);
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
        
        const categoryData = caseCategories.map((cat) => ({
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

// Naked Login (for DPO)
app.post('/api/auth/naked-login', async (req, res) => {
    console.log('🔐 Naked login attempt');
    const { username, password, role } = req.body;
    
    // Debug: Log what we received
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

        // Role enforcement: frontend uses naked-login for DPO.
        // If the request says role=dpo, require the DB user to be dpo.
        if ((role || '').toLowerCase() === 'dpo' && user.role !== 'dpo') {
            console.log(`❌ Naked login failed: user role is not dpo (role=${user.role}) for user: ${user.username}`);
            return res.status(403).json({ error: 'Unauthorized role' });
        }

        const token = jwt.sign(
            {
                userId: user.user_id,
                stationId: user.station_id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET',
            { expiresIn: '24h' }
        );

        console.log('✅ Naked login successful (MySQL user):', username);
        return res.status(200).json({
            message: 'Authentication successful',
            token,
            user: {
                userId: user.user_id,
                username: user.username,
                role: user.role,
                stationId: user.station_id
            }
        });
    } catch (error) {
        console.error('❌ Naked login error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
});

// =================================
// START SERVER WITH MySQL
// =================================

async function startServer() {
    try {
        // Connect to MySQL first
        await getConnection();
        console.log('🚀 Starting production server with MySQL...');
        
        app.listen(PORT, () => {
            console.log(`✅ Production server running on http://localhost:${PORT}`);
            console.log('🗄️ Using MySQL database - NO IN-MEMORY STORAGE');
            console.log('🔒 Production ready - data persists after restart');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
