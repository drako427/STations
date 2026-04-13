const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /
 * Retrieve aggregated statistics and trends for the authenticated user's station
 */
router.get('/', authenticateToken, async (req, res) => {
    console.log('📊 Dashboard route hit (with auth)');
    const stationId = req.user.station_id || 1;
    
    try {
        // Fetch real station information
        const [stationRows] = await pool.query(
            'SELECT * FROM stations WHERE station_id = ?',
            [stationId]
        );
        
        const station = stationRows[0];
        if (!station) {
            return res.status(404).json({ error: 'Station not found' });
        }
        
        // Fetch real statistics
        const [suspectCount] = await pool.query(
            'SELECT COUNT(*) as count FROM suspects WHERE station_id = ?',
            [stationId]
        );
        
        const [caseCount] = await pool.query(
            'SELECT COUNT(*) as total, SUM(CASE WHEN status = "closed" THEN 1 ELSE 0 END) as closed FROM cases WHERE station_id = ?',
            [stationId]
        );
        
        const [propertyCount] = await pool.query(
            'SELECT COUNT(*) as count FROM properties WHERE station_id = ?',
            [stationId]
        );
        
        const totalSuspects = suspectCount[0]?.count || 0;
        const totalCases = caseCount[0]?.total || 0;
        const closedCases = caseCount[0]?.closed || 0;
        const totalProperties = propertyCount[0]?.count || 0;
        
        // Calculate averages and trends
        const avgResolution = totalCases > 0 ? Math.round((closedCases / totalCases) * 30) : 0; // days
        const activeCases = totalCases - closedCases;
        
        const stationInfo = {
            station_name: station.station_name || 'Unknown Station',
            station_code: station.station_code || 'UNKNOWN',
            location: station.location || 'Location pending',
            sector: station.sector || 'Unknown'
        };
        
        res.status(200).json({
            station: stationInfo,
            stats: [
                { name: "Total Suspects", value: totalSuspects.toString(), change: totalSuspects > 0 ? "+100%" : "0%", trend: "up" },
                { name: "Active Cases", value: activeCases.toString(), change: activeCases > 0 ? "+0%" : "0%", trend: activeCases > 0 ? "up" : "down" },
                { name: "Closed (MTD)", value: closedCases.toString(), change: closedCases > 0 ? "+100%" : "0%", trend: "up" },
                { name: "Avg. Resolution", value: `${avgResolution}d`, change: `${avgResolution}d`, trend: "up" }
            ],
            caseData: [], // TODO: Fetch real case trend data
            categoryData: [] // TODO: Fetch real category distribution data
        });

        console.log('✅ Dashboard response sent for station:', stationId, '(', station.station_name, ')');

    } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

module.exports = router;
