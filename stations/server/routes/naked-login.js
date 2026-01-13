const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

/**
 * POST /api/auth/naked-login
 * Temporary development login system
 * - Any username works
 * - Passwords are ignored for now
 * - Auto-creates user if not exists
 * - Forces role = station
 */
router.post('/naked-login', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        console.log(`🔓 Naked login attempt: ${username}`);

        // Check if user exists
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        let user;
        if (users.length === 0) {
            console.log(`👤 Auto-creating user: ${username}`);
            
            // Auto-create user with station_id = 1
            const [result] = await pool.query(
                'INSERT INTO users (station_id, username, email, password_hash, full_name, badge_number, rank, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [1, username, `${username}@stations.temp`, 'temp_hash', username.toUpperCase(), `AUTO-${username}`, 'Auto-Created', 'station']
            );
            
            // Get the newly created user
            const [newUsers] = await pool.query(
                'SELECT * FROM users WHERE user_id = ?',
                [result.insertId]
            );
            user = newUsers[0];
        } else {
            user = users[0];
            console.log(`✅ Found existing user: ${user.username}`);
        }

        // Create JWT token
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

        console.log(`🎫 Token issued for: ${user.username}`);

        res.status(200).json({
            message: 'Authentication successful',
            token: token,
            user: {
                userId: user.user_id,
                username: user.username,
                role: user.role,
                stationId: user.station_id
            }
        });

    } catch (error) {
        console.error('❌ Naked login error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

module.exports = router;
