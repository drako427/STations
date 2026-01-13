const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/suspects
 * Retrieve all suspects for the authenticated user's station
 */
router.get('/suspects', authenticateToken, async (req, res) => {
    const stationId = req.user.station_id || 1; // Use authenticated user's station_id, fallback to 1 for DPO
    
    try {
        console.log(`🔍 Fetching suspects for station_id: ${stationId}, user role: ${req.user.role}`);
        const [rows] = await pool.query(
            'SELECT * FROM suspects WHERE station_id = ? ORDER BY created_at DESC',
            [stationId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('❌ Error fetching suspects:', error);
        res.status(500).json({ error: 'Failed to fetch suspects' });
    }
});

/**
 * GET /api/suspects/station/:station_id
 * Retrieve all suspects for a specific station
 */
router.get('/station/:station_id', authenticateToken, async (req, res) => {
    const { station_id } = req.params;
    
    try {
        console.log(`🔍 Fetching suspects for station_id: ${station_id}, requested by user: ${req.user.user_id}`);
        const [rows] = await pool.query(
            'SELECT * FROM suspects WHERE station_id = ? ORDER BY created_at DESC',
            [station_id]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('❌ Error fetching station suspects:', error);
        res.status(500).json({ error: 'Failed to fetch station suspects' });
    }
});

/**
 * POST /api/suspects
 * Register a suspect for the authenticated user's station
 */
router.post('/suspects', authenticateToken, async (req, res) => {
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

    if (!full_name) {
        return res.status(400).json({ error: 'Full name is required' });
    }

    const stationId = req.user.station_id || 1;
    const registeredBy = req.user.user_id || 1;

    try {
        console.log(`📝 Registering suspect for station_id: ${stationId}, registered by: ${registeredBy}`);

        const [result] = await pool.query(
            `INSERT INTO suspects 
            (station_id, registered_by, suspect_code, full_name, aliases, date_of_birth, gender, nationality, physical_description, risk_level, crime_committed, is_national) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                stationId,
                registeredBy,
                suspect_code || `SUS-${Date.now()}`,
                full_name,
                aliases || null,
                date_of_birth || null,
                gender || 'unknown',
                nationality || null,
                physical_description || null,
                risk_level || 'medium',
                crime_committed || null,
                is_national || false
            ]
        );

        res.status(201).json({
            message: 'Suspect registered successfully',
            suspect_id: result.insertId
        });
    } catch (error) {
        console.error('❌ Error registering suspect:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Suspect code already exists' });
        }
        res.status(500).json({ error: 'Failed to register suspect' });
    }
});

module.exports = router;
