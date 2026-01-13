const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * GET /api/stations
 * Retrieve all stations (DPO only - using naked login for now)
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM stations ORDER BY station_name');
        res.status(200).json(rows);
    } catch (error) {
        console.error('❌ Error fetching stations:', error);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

/**
 * POST /api/stations
 * Create a new police station (DPO only - using naked login for now)
 * Generates access code and creates user record
 */
router.post('/', async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Station name is required' });
    }

    // Generate secure random 6-8 character access code
    const generateAccessCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const length = Math.floor(Math.random() * 3) + 6; // 6-8 characters
        let code = '';
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    try {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // Generate unique access code
            let accessCode;
            let codeExists = true;
            let attempts = 0;
            
            while (codeExists && attempts < 10) {
                accessCode = generateAccessCode();
                const [existing] = await connection.query(
                    'SELECT access_code FROM stations WHERE access_code = ?',
                    [accessCode]
                );
                codeExists = existing.length > 0;
                attempts++;
            }

            if (codeExists) {
                throw new Error('Unable to generate unique access code');
            }

            // Insert station with access code
            const [stationResult] = await connection.query(
                `INSERT INTO stations (station_name, station_code, location, sector, jurisdiction_type, contact_phone, contact_email, address, access_code) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, `STN-${Date.now()}`, 'To be updated', 'To be updated', 'local', 'To be updated', 'To be updated', 'To be updated', accessCode]
            );

            const stationId = stationResult.insertId;

            // Create user record for the station
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(accessCode, 10);
            const [userResult] = await connection.query(
                `INSERT INTO users (username, email, password_hash, role, station_id) 
                 VALUES (?, ?, ?, ?, ?)`,
                [`station-${stationId}`, `station-${stationId}@stations.gov`, hashedPassword, 'station', stationId]
            );

            await connection.commit();

            res.status(201).json({
                message: 'Station created successfully',
                station_id: stationId,
                access_code: accessCode,
                user_id: userResult.insertId
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

module.exports = router;
