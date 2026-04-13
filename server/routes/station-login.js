const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const jwt = require('jsonwebtoken');
const {
    compareAccessCode,
    ensureStationAccessCodeColumn,
    hashAccessCode,
    isHashedAccessCode,
} = require('../lib/stationAccessCode');

/**
 * POST /api/station-login
 * Station login using the DPO-issued access code.
 */
router.post('/', async (req, res) => {
    const { access_code } = req.body;

    if (!access_code) {
        return res.status(400).json({ error: 'Access code is required' });
    }

    try {
        await ensureStationAccessCodeColumn(pool);

        const [stations] = await pool.query(
            'SELECT station_id, station_name, station_code, access_code FROM stations'
        );

        let matchedStation = null;
        let matchedLegacyPlaintext = false;
        let usedLegacyCode = false;

        // First try to match with new access_code format
        for (const station of stations) {
            if (station.access_code && station.access_code.trim() !== '') {
                const isMatch = await compareAccessCode(access_code, station.access_code);
                if (isMatch) {
                    matchedStation = station;
                    matchedLegacyPlaintext = !isHashedAccessCode(station.access_code);
                    break;
                }
            }
        }

        // If no match found, try legacy station_code format (STN-XXX)
        if (!matchedStation) {
            for (const station of stations) {
                if (station.station_code === access_code.toUpperCase().trim()) {
                    matchedStation = station;
                    usedLegacyCode = true;
                    // Hash and store the station_code as access_code for future use
                    await pool.query(
                        'UPDATE stations SET access_code = ? WHERE station_id = ?',
                        [await hashAccessCode(access_code), station.station_id]
                    );
                    break;
                }
            }
        }

        if (!matchedStation) {
            return res.status(401).json({ error: 'Invalid station code' });
        }

        if (matchedLegacyPlaintext) {
            await pool.query(
                'UPDATE stations SET access_code = ? WHERE station_id = ?',
                [await hashAccessCode(access_code), matchedStation.station_id]
            );
        }

        let [userRows] = await pool.query(
            'SELECT * FROM users WHERE username = ? LIMIT 1',
            [`station_access_${matchedStation.station_id}`]
        );

        let user;
        if (userRows.length === 0) {
            const passwordHash = await hashAccessCode(access_code);
            const [result] = await pool.query(
                'INSERT INTO users (station_id, username, email, password_hash, full_name, badge_number, user_rank, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    matchedStation.station_id,
                    `station_access_${matchedStation.station_id}`,
                    `station-access-${matchedStation.station_id}@stations.gov`,
                    passwordHash,
                    `${matchedStation.station_name} Access Account`,
                    `STN-${matchedStation.station_id}`,
                    'Station Access',
                    'officer'
                ]
            );

            const [newUserRows] = await pool.query(
                'SELECT * FROM users WHERE user_id = ?',
                [result.insertId]
            );
            user = newUserRows[0];
        } else {
            user = userRows[0];
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                role: user.role,
                station_id: matchedStation.station_id
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
                station_id: matchedStation.station_id,
                station_name: matchedStation.station_name,
                access_code: usedLegacyCode ? matchedStation.station_code : access_code
            }
        });
    } catch (error) {
        console.error('Station login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
