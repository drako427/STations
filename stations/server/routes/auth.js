const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'STATIONS_DEFAULT_SECRET';

/**
 * POST /api/auth/register
 * Register a new station user
 */
router.post('/register', async (req, res) => {
    const { station_id, username, email, password, full_name, badge_number, rank, role } = req.body;

    if (!username || !email || !password || !station_id) {
        return res.status(400).json({ error: 'Username, email, password, and station_id are required.' });
    }

    try {
        const password_hash = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            `INSERT INTO users (station_id, username, email, password_hash, full_name, badge_number, rank, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [station_id, username, email, password_hash, full_name, badge_number, rank, role || 'officer']
        );

        res.status(201).json({
            message: 'User registered successfully',
            user_id: result.insertId
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Username or email already exists.' });
        }
        res.status(500).json({ error: 'Failed to register user.' });
    }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = users[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const token = jwt.sign(
            {
                userId: user.user_id,
                stationId: user.station_id,
                role: user.role,
                username: user.username
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.user_id,
                username: user.username,
                role: user.role,
                full_name: user.full_name,
                station_id: user.station_id
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to process login.' });
    }
});

module.exports = router;
