const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/dashboard
 * Retrieve aggregated statistics and trends for the authenticated user's station
 */
router.get('/dashboard', authenticateToken, async (req, res) => {
    const stationId = req.user.station_id || 1; // Use authenticated user's station_id, fallback to 1 for DPO

    try {
        console.log(`📊 Fetching dashboard summary for station_id: ${stationId}, user role: ${req.user.role}`);

        // Get station information
        let stationInfo = null;
        if (req.user.role === 'station' && stationId) {
            const [stations] = await pool.query(
                'SELECT station_id, station_name, station_code, location FROM stations WHERE station_id = ?',
                [stationId]
            );
            stationInfo = stations[0] || null;
        }

        // 1. Get Total Suspects
        const [[{ totalSuspects }]] = await pool.query(
            'SELECT COUNT(*) as totalSuspects FROM suspects WHERE station_id = ?',
            [stationId]
        );

        // 2. Get Active Cases
        const [[{ activeCases }]] = await pool.query(
            "SELECT COUNT(*) as activeCases FROM cases WHERE station_id = ? AND status IN ('active', 'in_progress')",
            [stationId]
        );

        // 3. Get Closed Cases (Month to Date)
        const [[{ closedMTD }]] = await pool.query(
            "SELECT COUNT(*) as closedMTD FROM cases WHERE station_id = ? AND status = 'closed' AND MONTH(date_closed) = MONTH(CURDATE()) AND YEAR(date_closed) = YEAR(CURDATE())",
            [stationId]
        );

        // 4. Get Average Resolution Time
        const [[{ avgResolution }]] = await pool.query(
            "SELECT IFNULL(AVG(DATEDIFF(date_closed, date_opened)), 0) as avgResolution FROM cases WHERE station_id = ? AND status = 'closed'",
            [stationId]
        );

        // 5. Get Case Frequency Trends (Last 6 Months)
        const [trends] = await pool.query(
            `SELECT 
                DATE_FORMAT(date_opened, '%b') as name,
                COUNT(*) as cases
             FROM cases 
             WHERE station_id = ? AND date_opened >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
             GROUP BY YEAR(date_opened), MONTH(date_opened)
             ORDER BY YEAR(date_opened) ASC, MONTH(date_opened) ASC`,
            [stationId]
        );

        // 6. Get Case Distribution (By Type)
        const [distribution] = await pool.query(
            `SELECT 
                CASE 
                    WHEN case_type = 'theft' THEN 'Theft'
                    WHEN case_type = 'fraud' THEN 'Fraud'
                    WHEN case_type = 'violence' THEN 'Violence'
                    ELSE 'Other'
                END as name,
                COUNT(*) as value
             FROM cases 
             WHERE station_id = ?
             GROUP BY name`,
            [stationId]
        );

        res.status(200).json({
            station: stationInfo,
            stats: [
                { name: "Total Suspects", value: totalSuspects.toString(), change: "+0%", trend: "up" },
                { name: "Active Cases", value: activeCases.toString(), change: "0%", trend: "down" },
                { name: "Closed (MTD)", value: closedMTD.toString(), change: "0%", trend: "up" },
                { name: "Avg. Resolution", value: `${parseFloat(avgResolution).toFixed(1)}d`, change: "0d", trend: "up" }
            ],
            caseData: trends,
            categoryData: distribution.map(item => ({
                ...item,
                color: item.name === 'Theft' ? 'var(--color-primary)' :
                    item.name === 'Fraud' ? 'var(--color-secondary)' :
                        item.name === 'Violence' ? '#ef4444' : 'var(--color-accent)'
            }))
        });
    } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

module.exports = router;
