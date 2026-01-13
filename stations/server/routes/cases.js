const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/cases
 * Retrieve all cases (no authentication required for testing)
 */
router.get('/cases', async (req, res) => {
    const stationId = 1; // Default station for testing

    try {
        const [rows] = await pool.query(
            'SELECT * FROM cases WHERE station_id = ? ORDER BY created_at DESC',
            [stationId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('❌ Error fetching cases:', error);
        res.status(500).json({ error: 'Failed to fetch cases' });
    }
});

/**
 * POST /api/cases
 * Create a new investigation case (no authentication required for testing)
 */
router.post('/cases', async (req, res) => {
    const stationId = 1; // Default station for testing
    const leadAgentId = 1; // Default agent for testing
    const { title, description, case_type, priority } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Case title is required' });
    }

    try {
        const caseNumber = `CAS-${Date.now()}`;
        const [result] = await pool.query(
            `INSERT INTO cases (station_id, case_number, title, description, case_type, priority, lead_investigator_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [stationId, caseNumber, title, description, case_type || 'other', priority || 'medium', leadAgentId]
        );

        res.status(201).json({
            message: 'Case created successfully',
            case_id: result.insertId,
            case_number: caseNumber
        });
    } catch (error) {
        console.error('❌ Error creating case:', error);
        res.status(500).json({ error: 'Failed to create case' });
    }
});

/**
 * POST /api/cases/from-suspect
 * Create an investigation case triggered by a suspect (no authentication required for testing)
 */
router.post('/cases/from-suspect', async (req, res) => {
    const stationId = 1; // Default station for testing
    const lead_investigator_id = 1; // Default agent for testing
    const { suspect_id, title, description, case_type, priority } = req.body;

    if (!suspect_id || !title) {
        return res.status(400).json({ error: 'Suspect ID and case title are required' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Verify the suspect belongs to the same station
        const [suspects] = await connection.query(
            'SELECT suspect_id FROM suspects WHERE suspect_id = ? AND station_id = ?',
            [suspect_id, stationId]
        );

        if (suspects.length === 0) {
            await connection.rollback();
            return res.status(403).json({ error: 'Access denied. Suspect does not belong to your station.' });
        }

        const caseNumber = `CAS-${Date.now()}`;

        // Create the case
        const [caseResult] = await connection.query(
            `INSERT INTO cases (station_id, case_number, title, description, case_type, priority, lead_investigator_id, date_opened) 
             VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
            [stationId, caseNumber, title, description, case_type || 'other', priority || 'medium', lead_investigator_id]
        );

        const caseId = caseResult.insertId;

        // Link the suspect to the case
        await connection.query(
            `INSERT INTO case_suspects (case_id, suspect_id, station_id, involvement_type) 
             VALUES (?, ?, ?, 'primary_suspect')`,
            [caseId, suspect_id, stationId]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Case created and suspect linked successfully',
            case_id: caseId,
            case_number: caseNumber
        });
    } catch (error) {
        await connection.rollback();
        console.error('❌ Error creating case from suspect:', error);
        res.status(500).json({ error: 'Failed to create case' });
    } finally {
        connection.release();
    }
});

module.exports = router;
