const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

async function ensureCaseSuspectsTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS case_suspects (
            case_id INT NOT NULL,
            suspect_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (case_id, suspect_id),
            FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
            FOREIGN KEY (suspect_id) REFERENCES suspects(suspect_id) ON DELETE CASCADE
        )
    `);
}

async function fetchCasesWithSuspects(stationId) {
    await ensureCaseSuspectsTable();

    const [rows] = await pool.query(
        `SELECT c.*,
                s.suspect_id,
                s.full_name as suspect_name,
                s.suspect_code,
                s.physical_description,
                s.image as suspect_image,
                s.risk_level,
                s.crime_committed,
                COALESCE(cs_agg.suspect_count, 0) as suspect_count
         FROM cases c
         LEFT JOIN (
             SELECT case_id, COUNT(*) as suspect_count, MIN(suspect_id) as primary_suspect_id
             FROM case_suspects
             GROUP BY case_id
         ) cs_agg ON c.case_id = cs_agg.case_id
         LEFT JOIN suspects s ON cs_agg.primary_suspect_id = s.suspect_id
         WHERE c.station_id = ?
         ORDER BY c.created_at DESC`,
        [stationId]
    );

    const linkedCases = rows.filter((row) => row.suspect_count > 0);
    if (linkedCases.length > 0) {
        return linkedCases;
    }

    const [fallbackRows] = await pool.query(
        `SELECT c.*,
                s.suspect_id,
                s.full_name as suspect_name,
                s.suspect_code,
                s.physical_description,
                s.image as suspect_image,
                s.risk_level,
                s.crime_committed,
                CASE WHEN s.suspect_id IS NULL THEN 0 ELSE 1 END as suspect_count
         FROM cases c
         LEFT JOIN suspects s ON s.case_id = c.case_id
         WHERE c.station_id = ?
         ORDER BY c.created_at DESC`,
        [stationId]
    );

    return fallbackRows.filter((row) => row.suspect_count > 0);
}

async function caseSuspectsHasExtendedColumns() {
    const [columns] = await pool.query('SHOW COLUMNS FROM case_suspects');
    const columnNames = columns.map((column) => column.Field);
    return columnNames.includes('station_id') && columnNames.includes('involvement_type');
}

/**
 * GET /api/cases
 * Retrieve all cases for the authenticated user's station with suspect information
 */
router.get('/', authenticateToken, async (req, res) => {
    const stationId = req.user.station_id || 1;

    try {
        const casesWithSuspects = await fetchCasesWithSuspects(stationId);
        console.log(`Found ${casesWithSuspects.length} cases with suspects for station ${stationId}`);
        res.status(200).json(casesWithSuspects);
    } catch (error) {
        console.error('Error fetching cases:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage,
        });
        res.status(500).json({
            error: 'Failed to fetch cases',
            details: error.message,
            sqlMessage: error.sqlMessage,
        });
    }
});

/**
 * POST /api/cases
 * Create a new investigation case linked to a suspect
 */
router.post('/', authenticateToken, async (req, res) => {
    const stationId = req.user.station_id || 1;
    const leadAgentId = req.user.user_id || 1;
    const {
        case_name,
        title,
        description,
        witness_name,
        crime_location,
        crime_type,
        past_crimes,
        suspect_id,
    } = req.body;

    if (!case_name && !title) {
        return res.status(400).json({ error: 'Case name is required' });
    }

    try {
        console.log('Creating case with data:', {
            case_name,
            title,
            description,
            witness_name,
            crime_location,
            crime_type,
            past_crimes,
            suspect_id,
            stationId,
        });

        const caseNumber = `CAS-${Date.now()}`;
        const finalTitle = case_name || title;

        const [caseResult] = await pool.query(
            `INSERT INTO cases (station_id, case_number, title, description, case_type, priority, lead_investigator_id, date_opened)
             VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
            [stationId, caseNumber, finalTitle, description, crime_type || 'other', 'medium', leadAgentId]
        );

        const caseId = caseResult.insertId;
        console.log('Case created with ID:', caseId);

        if (suspect_id) {
            try {
                await ensureCaseSuspectsTable();

                const [suspectCheck] = await pool.query(
                    'SELECT * FROM suspects WHERE suspect_id = ? AND station_id = ?',
                    [suspect_id, stationId]
                );

                if (suspectCheck.length > 0) {
                    if (await caseSuspectsHasExtendedColumns()) {
                        await pool.query(
                            `INSERT INTO case_suspects (case_id, suspect_id, station_id, involvement_type)
                             VALUES (?, ?, ?, 'primary_suspect')`,
                            [caseId, suspect_id, stationId]
                        );
                    } else {
                        await pool.query(
                            'INSERT INTO case_suspects (case_id, suspect_id) VALUES (?, ?)',
                            [caseId, suspect_id]
                        );
                    }

                    console.log('Case linked to suspect:', suspect_id);

                    await pool.query(
                        'UPDATE suspects SET has_case = TRUE, case_id = ? WHERE suspect_id = ?',
                        [caseId, suspect_id]
                    );
                    console.log('Suspect updated with case information');
                } else {
                    console.warn('Suspect not found or access denied:', suspect_id);
                }
            } catch (linkError) {
                console.error('Error linking case to suspect:', {
                    message: linkError.message,
                    code: linkError.code,
                    sqlMessage: linkError.sqlMessage,
                    suspect_id,
                    stationId,
                    caseId,
                });
            }
        }

        res.status(201).json({
            message: 'Case created successfully',
            case_id: caseId,
            case_number: caseNumber,
            suspect_id: suspect_id || null,
        });
    } catch (error) {
        console.error('Error creating case:', error);
        res.status(500).json({ error: 'Failed to create case' });
    }
});

/**
 * POST /api/cases/from-suspect
 * Create an investigation case triggered by a suspect (no authentication required for testing)
 */
router.post('/cases/from-suspect', async (req, res) => {
    const stationId = 1;
    const lead_investigator_id = 1;
    const { suspect_id, title, description, case_type, priority } = req.body;

    if (!suspect_id || !title) {
        return res.status(400).json({ error: 'Suspect ID and case title are required' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [suspects] = await connection.query(
            'SELECT suspect_id FROM suspects WHERE suspect_id = ? AND station_id = ?',
            [suspect_id, stationId]
        );

        if (suspects.length === 0) {
            await connection.rollback();
            return res.status(403).json({ error: 'Access denied. Suspect does not belong to your station.' });
        }

        const caseNumber = `CAS-${Date.now()}`;

        const [caseResult] = await connection.query(
            `INSERT INTO cases (station_id, case_number, title, description, case_type, priority, lead_investigator_id, date_opened)
             VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
            [stationId, caseNumber, title, description, case_type || 'other', priority || 'medium', lead_investigator_id]
        );

        const caseId = caseResult.insertId;

        await connection.query(
            `INSERT INTO case_suspects (case_id, suspect_id, station_id, involvement_type)
             VALUES (?, ?, ?, 'primary_suspect')`,
            [caseId, suspect_id, stationId]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Case created and suspect linked successfully',
            case_id: caseId,
            case_number: caseNumber,
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating case from suspect:', error);
        res.status(500).json({ error: 'Failed to create case' });
    } finally {
        connection.release();
    }
});

module.exports = router;
