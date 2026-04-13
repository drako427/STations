const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const {
    ensureStationAccessCodeColumn,
    generateStationAccessCode,
    hashAccessCode,
    isHashedAccessCode,
    compareAccessCode,
} = require('../lib/stationAccessCode');

/**
 * GET /api/stations
 * Retrieve stations for authenticated station and network search flows.
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Check if user is DPO to determine what to return
        const [userRows] = await pool.query(
            'SELECT role FROM users WHERE user_id = ?',
            [req.user.userId]
        );
        
        const isDPO = userRows.length > 0 && userRows[0].role === 'dpo';
        
        let query, fields;
        if (isDPO) {
            // DPO gets access codes (readable format), but exclude DPO Headquarters
            query = `SELECT station_id, station_name, station_code, location, sector, jurisdiction_type,
                     contact_phone, contact_email, address, created_at, updated_at,
                     access_code,
                     CASE WHEN access_code IS NULL OR access_code = '' THEN FALSE ELSE TRUE END AS has_access_code
                     FROM stations WHERE station_id != 1 ORDER BY station_name`;
        } else {
            // Regular users don't get access codes
            query = `SELECT station_id, station_name, station_code, location, sector, jurisdiction_type,
                     contact_phone, contact_email, address, created_at, updated_at,
                     CASE WHEN access_code IS NULL OR access_code = '' THEN FALSE ELSE TRUE END AS has_access_code
                     FROM stations ORDER BY station_name`;
        }
        
        const [rows] = await pool.query(query);

        // If DPO, process access codes for display
        if (isDPO) {
            const stationsWithReadableCodes = rows.map(station => {
                let readableCode;
                
                if (station.access_code) {
                    if (isHashedAccessCode(station.access_code)) {
                        // For DPO users, show the actual hashed code (they can copy it)
                        readableCode = station.access_code;
                    } else {
                        readableCode = station.access_code;
                    }
                } else {
                    readableCode = null;
                }
                
                return {
                    ...station,
                    readable_access_code: readableCode
                };
            });
            res.status(200).json(stationsWithReadableCodes);
        } else {
            res.status(200).json(rows);
        }
    } catch (error) {
        console.error('Error fetching stations:', error);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

/**
 * GET /api/stations/secure-access-status
 * Retrieve stations access status only (no codes exposed)
 */
router.get('/secure-access-status', authenticateToken, async (req, res) => {
    try {
        // Check if user is DPO
        const [userRows] = await pool.query(
            'SELECT role FROM users WHERE user_id = ?',
            [req.user.userId]
        );
        
        if (userRows.length === 0 || userRows[0].role !== 'dpo') {
            return res.status(403).json({ error: 'Access denied. DPO role required.' });
        }

        const [stations] = await pool.query(
            `SELECT station_id, station_name, station_code, location, sector,
                    CASE WHEN access_code IS NULL OR access_code = '' THEN FALSE ELSE TRUE END AS has_access_code
             FROM stations
             ORDER BY station_name`
        );

        res.status(200).json(stations);
    } catch (error) {
        console.error('Error in /secure-access-status endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch stations', details: error.message });
    }
});

/**
 * POST /api/stations/generate-access-code
 * Generate new access code for a station (DPO only)
 */
router.post('/generate-access-code', authenticateToken, async (req, res) => {
    try {
        const { station_id } = req.body;
        
        if (!station_id) {
            return res.status(400).json({ error: 'Station ID is required' });
        }

        // Check if user is DPO
        const [userRows] = await pool.query(
            'SELECT role FROM users WHERE user_id = ?',
            [req.user.userId]
        );
        
        if (userRows.length === 0 || userRows[0].role !== 'dpo') {
            return res.status(403).json({ error: 'Access denied. DPO role required.' });
        }

        // Verify station exists
        const [stationRows] = await pool.query(
            'SELECT station_name FROM stations WHERE station_id = ?',
            [station_id]
        );
        
        if (stationRows.length === 0) {
            return res.status(404).json({ error: 'Station not found' });
        }

        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            await ensureStationAccessCodeColumn(connection);

            // Generate new access code
            const newAccessCode = generateStationAccessCode();
            const accessCodeHash = await hashAccessCode(newAccessCode);

            // Update station with new access code
            await connection.query(
                'UPDATE stations SET access_code = ?, updated_at = NOW() WHERE station_id = ?',
                [accessCodeHash, station_id]
            );

            // Log the generation (audit trail)
            await connection.query(
                `INSERT INTO station_access_logs (station_id, generated_by, action, access_code_hash, generated_at) 
                 VALUES (?, ?, 'GENERATE', ?, NOW())`,
                [station_id, req.user.userId, accessCodeHash]
            );

            await connection.commit();

            console.log(`Access code generated for station ${station_id} by DPO ${req.user.userId}`);

            res.status(200).json({
                message: 'Access code generated successfully',
                station_id: station_id,
                station_name: stationRows[0].station_name,
                access_code: newAccessCode,
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error generating access code:', error);
        res.status(500).json({ error: 'Failed to generate access code', details: error.message });
    }
});

/**
 * POST /api/stations/view-access-code
 * View existing access code for a station (DPO only, with security warning)
 */
router.post('/view-access-code', authenticateToken, async (req, res) => {
    try {
        const { station_id } = req.body;
        
        if (!station_id) {
            return res.status(400).json({ error: 'Station ID is required' });
        }

        // Check if user is DPO
        const [userRows] = await pool.query(
            'SELECT role FROM users WHERE user_id = ?',
            [req.user.userId]
        );
        
        if (userRows.length === 0 || userRows[0].role !== 'dpo') {
            return res.status(403).json({ error: 'Access denied. DPO role required.' });
        }

        // Verify station exists and get access code
        const [stationRows] = await pool.query(
            'SELECT station_name, access_code FROM stations WHERE station_id = ?',
            [station_id]
        );
        
        if (stationRows.length === 0) {
            return res.status(404).json({ error: 'Station not found' });
        }

        const station = stationRows[0];
        let accessCode = 'No access code set';

        if (station.access_code) {
            if (isHashedAccessCode(station.access_code)) {
                // For hashed codes, we cannot retrieve the original
                accessCode = 'HASHED_CODE - Generate new code to view';
            } else {
                // For plaintext codes, return as-is
                accessCode = station.access_code;
            }
        }

        // Log the view action (audit trail)
        await pool.query(
            `INSERT INTO station_access_logs (station_id, generated_by, action, access_code_hash, generated_at) 
             VALUES (?, ?, 'VIEW', ?, NOW())`,
            [station_id, req.user.userId, station.access_code || null]
        );

        console.log(`Access code viewed for station ${station_id} by DPO ${req.user.userId}`);

        res.status(200).json({
            message: 'Access code retrieved successfully',
            station_id: station_id,
            station_name: station.station_name,
            access_code: accessCode,
            is_hashed: isHashedAccessCode(station.access_code),
            viewed_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error viewing access code:', error);
        res.status(500).json({ error: 'Failed to retrieve access code', details: error.message });
    }
});

/**
 * GET /api/stations/test
 * Simple test endpoint for debugging
 */
router.get('/test', authenticateToken, async (req, res) => {
    try {
        console.log('Test endpoint hit - req.user:', req.user);
        res.status(200).json({ message: 'Test endpoint working', user: req.user });
    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({ error: 'Test endpoint failed', details: error.message });
    }
});

/**
 * POST /api/stations
 * Create a new police station and issue a stronger DPO-generated access code.
 */
router.post('/', authenticateToken, async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Station name is required' });
    }

    try {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();
            await ensureStationAccessCodeColumn(connection);

            const accessCode = generateStationAccessCode();
            const accessCodeHash = await hashAccessCode(accessCode);

            const [stationResult] = await connection.query(
                `INSERT INTO stations (station_name, station_code, location, sector, jurisdiction_type, contact_phone, contact_email, address, access_code) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, `STN-${Date.now()}`, 'To be updated', 'To be updated', 'local', 'To be updated', 'To be updated', 'To be updated', accessCodeHash]
            );

            const stationId = stationResult.insertId;
            const stationAccessPasswordHash = await hashAccessCode(accessCode);

            await connection.query(
                `INSERT INTO users (station_id, username, email, password_hash, full_name, badge_number, user_rank, role) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    stationId,
                    `station_access_${stationId}`,
                    `station-access-${stationId}@stations.gov`,
                    stationAccessPasswordHash,
                    `${name} Access Account`,
                    `STN-${stationId}`,
                    'Station Access',
                    'officer'
                ]
            );

            await connection.commit();

            res.status(201).json({
                message: 'Station created successfully',
                station_id: stationId,
                access_code: accessCode,
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error creating station:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Station already exists' });
        }
        res.status(500).json({ error: 'Failed to create station' });
    }
});

/**
 * DELETE /api/stations/:id
 * Delete a station and all related data (DPO only)
 */
router.delete('/:station_id', authenticateToken, async (req, res) => {
    const { station_id } = req.params;
    
    try {
        // Check if user is DPO
        const [userRows] = await pool.query(
            'SELECT role FROM users WHERE user_id = ?',
            [req.user.userId]
        );
        
        if (userRows.length === 0 || userRows[0].role !== 'dpo') {
            return res.status(403).json({ error: 'Access denied. DPO role required.' });
        }

        // Verify station exists
        const [stationRows] = await pool.query(
            'SELECT station_name FROM stations WHERE station_id = ?',
            [station_id]
        );
        
        if (stationRows.length === 0) {
            return res.status(404).json({ error: 'Station not found' });
        }

        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Delete related data in correct order
            // 1. Delete case_suspects for suspects from this station
            await connection.query(
                'DELETE cs FROM case_suspects cs JOIN suspects s ON cs.suspect_id = s.suspect_id WHERE s.station_id = ?', 
                [station_id]
            );
            
            // 2. Delete cases for this station
            await connection.query(
                'DELETE FROM cases WHERE station_id = ?',
                [station_id]
            );
            
            // 3. Delete suspects for this station
            await connection.query(
                'DELETE FROM suspects WHERE station_id = ?',
                [station_id]
            );
            
            // 4. Delete properties for this station
            await connection.query(
                'DELETE FROM properties WHERE station_id = ?',
                [station_id]
            );
            
            // 5. Delete access logs for this station
            await connection.query(
                'DELETE FROM station_access_logs WHERE station_id = ?',
                [station_id]
            );
            
            // 6. Delete the station
            await connection.query(
                'DELETE FROM stations WHERE station_id = ?',
                [station_id]
            );
            
            await connection.commit();
            
            res.status(200).json({ 
                message: 'Station deleted successfully',
                station_name: stationRows[0].station_name
            });
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error deleting station:', error);
        res.status(500).json({ error: 'Failed to delete station' });
    }
});

module.exports = router;
