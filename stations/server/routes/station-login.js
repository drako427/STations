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

        // Find or create the associated user (station users have officer role)
        let [userRows] = await pool.query(
            'SELECT * FROM users WHERE station_id = ? AND role = ?',
            [station.station_id, 'officer']
        );

        let user;
        if (userRows.length === 0) {
            // Create a station user if none exists
            console.log(`Creating station user for station ${station.station_id}`);
            const username = `station_${station.station_id}`;
            const hashedPassword = await bcrypt.hash(access_code, 10);
            
            const [result] = await pool.query(
                'INSERT INTO users (station_id, username, email, password_hash, full_name, badge_number, user_rank, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [station.station_id, username, `${username}@stations.temp`, hashedPassword, station.station_name, `STN-${station.station_id}`, 'Station Officer', 'officer']
            );
            
            // Get the newly created user
            const [newUserRows] = await pool.query(
                'SELECT * FROM users WHERE user_id = ?',
                [result.insertId]
            );
            user = newUserRows[0];
        } else {
            user = userRows[0];
            // Update password to match current access code for existing users
            const hashedPassword = await bcrypt.hash(access_code, 10);
            await pool.query(
                'UPDATE users SET password_hash = ? WHERE user_id = ?',
                [hashedPassword, user.user_id]
            );
        }

        // Generate JWT token with station_id
        const token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                role: user.role,
                station_id: station.station_id
            },
            process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET',
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
