const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * POST /api/station-login
 * Station login using access code
 */
router.post('/', async (req, res) => {
    const { access_code } = req.body;

    if (!access_code) {
        return res.status(400).json({ error: 'Access code is required' });
    }

    try {
        // Find station by access code
        const [stationRows] = await pool.query(
            'SELECT * FROM stations WHERE access_code = ?',
            [access_code]
        );

        if (stationRows.length === 0) {
            return res.status(401).json({ error: 'Invalid station code' });
        }

        const station = stationRows[0];

        // Find the associated user
        const [userRows] = await pool.query(
            'SELECT * FROM users WHERE station_id = ? AND role = ?',
            [station.station_id, 'station']
        );

        if (userRows.length === 0) {
            return res.status(401).json({ error: 'Station user not found' });
        }

        const user = userRows[0];

        // Verify password (access code)
        const isValidPassword = await bcrypt.compare(access_code, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid station code' });
        }

        // Generate JWT token with station_id
        const token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                role: user.role,
                station_id: station.station_id
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                role: user.role,
                station_id: station.station_id,
                station_name: station.station_name
            }
        });

    } catch (error) {
        console.error('Station login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
