const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'suspect-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

/**
 * GET /
 * Retrieve all suspects for the authenticated user's station
 */
router.get('/', authenticateToken, async (req, res) => {
    const stationId = req.user.station_id || 1; // Use authenticated user's station_id, fallback to 1 for DPO
    
    try {
        console.log(`🔍 Fetching suspects for station_id: ${stationId}, user role: ${req.user.role}`);
        
        // Check if case columns exist before trying to use them
        try {
            console.log('🔍 Checking if case columns exist...');
            
            // Try to select the case columns to see if they exist
            await pool.query('SELECT has_case, case_id FROM suspects LIMIT 1');
            console.log('✅ Case columns already exist');
            
            // Columns exist, use the enhanced query with pagination
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;
            
            const [rows] = await pool.query(
                `SELECT s.*, 
                        CASE WHEN s.has_case = TRUE THEN 
                            (SELECT title FROM cases WHERE case_id = s.case_id) 
                        ELSE NULL END as case_name
                 FROM suspects s 
                 WHERE s.station_id = ? 
                 ORDER BY s.created_at DESC
                 LIMIT ? OFFSET ?`,
                [stationId, limit, offset]
            );
            
            // Get total count for pagination
            const [countRows] = await pool.query(
                'SELECT COUNT(*) as total FROM suspects WHERE station_id = ?',
                [stationId]
            );
            
            const total = countRows[0].total;
            const hasMore = (page * limit) < total;
            
            res.status(200).json({
                suspects: rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total,
                    hasMore: hasMore,
                    totalPages: Math.ceil(total / limit)
                }
            });
            
        } catch (columnError) {
            if (columnError.code === 'ER_BAD_FIELD_ERROR') {
                console.log('🔧 Case columns missing, adding them...');
                
                try {
                    // Add the missing case columns
                    await pool.query('ALTER TABLE suspects ADD COLUMN has_case BOOLEAN DEFAULT FALSE');
                    console.log('✅ Added has_case column');
                    
                    await pool.query('ALTER TABLE suspects ADD COLUMN case_id INT NULL');
                    console.log('✅ Added case_id column');
                    
                    console.log('✅ Case columns added successfully');
                    
                    // Now use enhanced query
                    const [rows] = await pool.query(
                        `SELECT s.*, 
                                CASE WHEN s.has_case = TRUE THEN 
                                    (SELECT title FROM cases WHERE case_id = s.case_id) 
                                ELSE NULL END as case_name
                         FROM suspects s 
                         WHERE s.station_id = ? 
                         ORDER BY s.created_at DESC`,
                        [stationId]
                    );
                    
                    res.status(200).json({
                        suspects: rows,
                        pagination: {
                            page: 1,
                            limit: 20,
                            total: rows.length,
                            hasMore: false,
                            totalPages: Math.ceil(rows.length / 20)
                        }
                    });
                    
                } catch (alterError) {
                    console.error('❌ Error adding case columns:', alterError);
                    // Fall back to basic query without case columns
                    const [rows] = await pool.query(
                        'SELECT * FROM suspects WHERE station_id = ? ORDER BY created_at DESC',
                        [stationId]
                    );
                    res.status(200).json({
                        suspects: rows,
                        pagination: {
                            page: 1,
                            limit: 20,
                            total: rows.length,
                            hasMore: false,
                            totalPages: Math.ceil(rows.length / 20)
                        }
                    });
                }
            } else {
                console.error('❌ Unexpected error checking columns:', columnError);
                // Fall back to basic query
                const [rows] = await pool.query(
                    'SELECT * FROM suspects WHERE station_id = ? ORDER BY created_at DESC',
                    [stationId]
                );
                res.status(200).json({
                    suspects: rows,
                    pagination: {
                        page: 1,
                        limit: 20,
                        total: rows.length,
                        hasMore: false,
                        totalPages: Math.ceil(rows.length / 20)
                    }
                });
            }
        }
    } catch (error) {
        console.error('❌ Error fetching suspects:', error);
        res.status(500).json({ error: 'Failed to fetch suspects' });
    }
});

async function fetchSuspectsByStationId(stationId) {
    const [rows] = await pool.query(
        'SELECT * FROM suspects WHERE station_id = ? ORDER BY created_at DESC',
        [stationId]
    );
    return rows;
}

/**
 * GET /api/suspects/station/:station_id
 * Retrieve all suspects for the authenticated user's own station only.
 */
router.get('/station/:station_id', authenticateToken, async (req, res) => {
    const requestedStationId = parseInt(req.params.station_id, 10);
    const userStationId = req.user.station_id || 1;

    if (requestedStationId !== userStationId) {
        return res.status(403).json({ error: 'Station access denied' });
    }
    
    try {
        console.log(`🔍 Fetching own-station suspects for station_id: ${requestedStationId}, requested by user: ${req.user.user_id}`);
        const rows = await fetchSuspectsByStationId(requestedStationId);
        res.status(200).json(rows);
    } catch (error) {
        console.error('❌ Error fetching station suspects:', error);
        res.status(500).json({ error: 'Failed to fetch station suspects' });
    }
});

/**
 * GET /api/suspects/network/station/:station_id
 * Read-only cross-station lookup for the national suspects page.
 */
router.get('/network/station/:station_id', authenticateToken, async (req, res) => {
    const requestedStationId = parseInt(req.params.station_id, 10);
    
    try {
        console.log(`🔍 Network suspect lookup for station_id: ${requestedStationId}, requested by user: ${req.user.user_id}, home station: ${req.user.station_id}`);
        const rows = await fetchSuspectsByStationId(requestedStationId);
        res.status(200).json(rows);
    } catch (error) {
        console.error('❌ Error fetching network station suspects:', error);
        res.status(500).json({ error: 'Failed to fetch network station suspects' });
    }
});

/**
 * POST /
 * Register a suspect for the authenticated user's station
 */
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
    console.log('📡 Received suspect registration request:', req.body);
    console.log('📡 File uploaded:', req.file);
    
    const {
        full_name,
        suspect_code,
        aliases,
        date_of_birth,
        gender,
        nationality,
        physical_description,
        risk_level,
        crime_committed,
        is_national
    } = req.body;

    // ✅ VALIDATE DATE FORMAT
    if (date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(date_of_birth)) {
        console.error('❌ Invalid date format received:', date_of_birth);
        return res.status(400).json({ 
            error: 'Invalid date format. Expected YYYY-MM-DD',
            received: date_of_birth
        });
    }

    if (!full_name) {
        return res.status(400).json({ error: 'Full name is required' });
    }

    const stationId = req.user.station_id || 1;
    const registeredBy = req.user.user_id || 1;

    try {
        console.log(`📝 Registering suspect for station_id: ${stationId}, registered by: ${registeredBy}`);

        const [result] = await pool.query(
            `INSERT INTO suspects 
            (station_id, registered_by, suspect_code, full_name, aliases, date_of_birth, gender, nationality, physical_description, risk_level, crime_committed, is_national, image) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                stationId,
                registeredBy,
                suspect_code || `SUS-${Date.now()}`,
                full_name,
                aliases || null,
                date_of_birth ? (typeof date_of_birth === 'string' ? 
                    (date_of_birth.length === 4 ? `${date_of_birth}-01-01` : date_of_birth) : 
                    date_of_birth.toISOString().slice(0, 10)) : null,
                gender || 'unknown',
                nationality || null,
                physical_description || null,
                risk_level || 'medium',
                crime_committed || null,
                is_national === '1' || is_national === true ? 1 : 0,
                req.file ? `/uploads/${req.file.filename}` : null
            ]
        );

        res.status(201).json({
            message: 'Suspect registered successfully',
            suspect_id: result.insertId,
            image: req.file ? `/uploads/${req.file.filename}` : null
        });
    } catch (error) {
        console.error('❌ Error registering suspect:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Suspect code already exists' });
        }
        res.status(500).json({ error: 'Failed to register suspect' });
    }
});

/**
 * PUT /api/suspects/release
 * Release a suspect with optional bail and timeout
 */
router.put('/release', authenticateToken, async (req, res) => {
    const { suspect_id, bail_amount, timeout_hours, released_at } = req.body;
    
    try {
        console.log(`🔓 Releasing suspect_id: ${suspect_id}, bail: ${bail_amount}, timeout: ${timeout_hours}`);
        console.log(`🔓 User station_id: ${req.user.station_id}`);
        
        // First check if suspect exists and belongs to user's station
        const [suspectCheck] = await pool.query(
            'SELECT * FROM suspects WHERE suspect_id = ? AND station_id = ?',
            [suspect_id, req.user.station_id || 1]
        );
        
        console.log(`🔓 Suspect check result:`, suspectCheck.length);
        
        if (suspectCheck.length === 0) {
            return res.status(404).json({ error: 'Suspect not found or access denied' });
        }
        
        // Check if columns exist before trying to update
        try {
            console.log('🔍 Checking if release columns exist...');
            
            // Try to select the 'released' column to see if it exists
            await pool.query('SELECT released FROM suspects LIMIT 1');
            console.log('✅ Release columns already exist');
            
        } catch (columnError) {
            if (columnError.code === 'ER_BAD_FIELD_ERROR') {
                console.log('🔧 Release columns missing, adding them...');
                
                try {
                    // Add the missing columns one by one to avoid conflicts
                    await pool.query('ALTER TABLE suspects ADD COLUMN released BOOLEAN DEFAULT FALSE');
                    console.log('✅ Added released column');
                    
                    await pool.query('ALTER TABLE suspects ADD COLUMN released_at TIMESTAMP NULL');
                    console.log('✅ Added released_at column');
                    
                    await pool.query('ALTER TABLE suspects ADD COLUMN bail_amount DECIMAL(10, 2) NULL');
                    console.log('✅ Added bail_amount column');
                    
                    await pool.query('ALTER TABLE suspects ADD COLUMN timeout_hours INT NULL');
                    console.log('✅ Added timeout_hours column');
                    
                    await pool.query("ALTER TABLE suspects ADD COLUMN status ENUM('Active Investigation', 'Apprehended', 'Released') DEFAULT 'Active Investigation' AFTER crime_committed");
                    console.log('✅ Added status column');

                    await pool.query('ALTER TABLE suspects ADD COLUMN has_case BOOLEAN DEFAULT FALSE');
                    console.log('✅ Added has_case column');
                    
                    await pool.query('ALTER TABLE suspects ADD COLUMN case_id INT NULL');
                    console.log('✅ Added case_id column');
                    
                    console.log('✅ All release and case columns added successfully');
                } catch (alterError) {
                    console.error('❌ Error adding columns:', alterError);
                    return res.status(500).json({ 
                        error: 'Failed to add release columns to database',
                        details: alterError.message
                    });
                }
            } else {
                console.error('❌ Unexpected error checking columns:', columnError);
                return res.status(500).json({ 
                    error: 'Database error during release',
                    details: columnError.message
                });
            }
        }
        
        // Update suspect with release information
        const [result] = await pool.query(
            `UPDATE suspects SET 
                released = true, 
                released_at = ?, 
                bail_amount = ?, 
                timeout_hours = ?,
                status = 'Released'
            WHERE suspect_id = ?`,
            [released_at, bail_amount, timeout_hours, suspect_id]
        );
        
        console.log(`🔓 Update result:`, result);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Failed to update suspect' });
        }
        
        console.log(`✅ Suspect ${suspect_id} released successfully`);
        
        res.status(200).json({
            message: 'Suspect released successfully',
            suspect_id,
            released_at,
            bail_amount,
            timeout_hours
        });
        
    } catch (error) {
        console.error('❌ Error releasing suspect:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        res.status(500).json({ 
            error: 'Failed to release suspect',
            details: error.message,
            sqlMessage: error.sqlMessage
        });
    }
});

module.exports = router;
