/**
 * STATIONS Backend - Main Entry Point
 * 
 * This file initializes the Express server, mounts middleware,
 * and sets up the primary API routes with real MySQL persistence.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { testConnection } = require('./config/database');

// Route Imports
const stationRoutes = require('./routes/stations');
const suspectRoutes = require('./routes/suspects');
const caseRoutes = require('./routes/cases');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');
const nakedLoginRoutes = require('./routes/naked-login');
console.log('🔓 Naked login routes loaded:', typeof nakedLoginRoutes);
const stationLoginRoutes = require('./routes/station-login');
const propertyRoutes = require('./routes/properties');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://10.175.69.81:3000', 'http://10.0.2.183:3000'],
    credentials: true
}));

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
console.log('🔧 Mounting naked login routes first...');
app.use('/api/auth', nakedLoginRoutes);
console.log('🔧 Mounting auth routes...');
app.use('/api/auth', authRoutes);
app.use('/api/station-login', stationLoginRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/suspects', suspectRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Test route to verify API is working
app.get('/api', (req, res) => {
  res.json({ message: 'STATIONS API is running' });
});

// Test naked login route directly
app.post('/api/auth/naked-login', async (req, res) => {
    console.log('🔓 Direct naked login route hit!');
    const { username } = req.body;
    
    try {
        console.log(`🔓 Naked login attempt: ${username}`);
        
        // Create JWT token for any username
        const token = jwt.sign(
            {
                userId: 1,
                stationId: 1,
                username: username,
                role: 'station'
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
                role: 'station',
                stationId: 1
            }
        });

    } catch (error) {
        console.error('❌ Naked login error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

/**
 * Health Check Route
 * Verifies server and database status
 */
app.get('/api/health', async (req, res) => {
    try {
        await testConnection();
        res.status(200).json({
            status: 'success',
            message: 'STATIONS API is operational',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: 'STATIONS API is partially operational',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        });
    }
});

/**
 * Root Route
 */
app.get('/', (req, res) => {
    res.send('STATIONS Investigative Operations API - Active');
});

/**
 * Server Initialization
 */
async function startServer() {
    try {
        console.log('🔍 Initializing STATIONS Operations...');

        // 1. Verify Database Connection
        console.log('📡 Testing MySQL connection pool...');
        await testConnection();
        console.log('✅ Database link established.');

        // 2. Start Listening
        app.listen(PORT, () => {
            console.log(`🚀 STATIONS Backend running at http://localhost:${PORT}`);
            console.log(`👨‍🚀 Welcome, Agent. System is live and monitoring.`);
        });
    } catch (error) {
        console.error('❌ CRITICAL FAILURE: Database connection could not be established.');
        console.error('💡 Ensure MySQL is running via XAMPP and .env credentials are correct.');
        process.exit(1);
    }
}

startServer();
