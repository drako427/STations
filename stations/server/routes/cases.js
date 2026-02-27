const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/cases
 * Retrieve all cases for the authenticated user's station with suspect information
 */
router.get('/', authenticateToken, async (req, res) => {
    const stationId = req.user.station_id || 1;

    try {
        console.log(`🔍 Fetching cases for station_id: ${stationId}`);
        
        // First, check if case_suspects table exists
        try {
            console.log('🔍 Checking if case_suspects table exists...');
            await pool.query('SELECT 1 FROM case_suspects LIMIT 1');
            console.log('✅ case_suspects table exists');
            
            // Get cases with linked suspect information
            const [rows] = await pool.query(
                `SELECT c.*, 
                        s.suspect_id, s.full_name as suspect_name, s.suspect_code,
                        s.physical_description, s.image as suspect_image,
                        s.risk_level, s.crime_committed,
                        COUNT(cs.case_id) as suspect_count
                 FROM cases c
                 LEFT JOIN case_suspects cs ON c.case_id = cs.case_id
                 LEFT JOIN suspects s ON cs.suspect_id = s.suspect_id
                 WHERE c.station_id = ?
                 GROUP BY c.case_id
                 ORDER BY c.created_at DESC`,
                [stationId]
            );
            
            // Filter to only include cases that have suspects
            const casesWithSuspects = rows.filter(row => row.suspect_count > 0);
            
            console.log(`📊 Found ${casesWithSuspects.length} cases with suspects out of ${rows.length} total cases`);
            
            res.status(200).json(casesWithSuspects);
            
        } catch (tableError) {
            if (tableError.code === 'ER_NO_SUCH_TABLE') {
                console.log('🔧 case_suspects table missing, creating it...');
                
                // Create the case_suspects table
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
                console.log('✅ case_suspects table created');
                
                // Try the query again
                const [rows] = await pool.query(
                    `SELECT c.*, 
                            s.suspect_id, s.full_name as suspect_name, s.suspect_code,
                            s.physical_description, s.image as suspect_image,
                            s.risk_level, s.crime_committed,
                            COUNT(cs.case_id) as suspect_count
                     FROM cases c
                     LEFT JOIN case_suspects cs ON c.case_id = cs.case_id
                     LEFT JOIN suspects s ON cs.suspect_id = s.suspect_id
                     WHERE c.station_id = ?
                     GROUP BY c.case_id
                     ORDER BY c.created_at DESC`,
                    [stationId]
                );
                
                const casesWithSuspects = rows.filter(row => row.suspect_count > 0);
                console.log(`📊 Found ${casesWithSuspects.length} cases with suspects out of ${rows.length} total cases`);
                
                res.status(200).json(casesWithSuspects);
                
            } else {
                console.error('❌ Error checking case_suspects table:', tableError);
                // Fall back to basic cases query
                const [rows] = await pool.query(
                    'SELECT * FROM cases WHERE station_id = ? ORDER BY created_at DESC',
                    [stationId]
                );
                console.log(`📊 Fallback: Found ${rows.length} total cases`);
                res.status(200).json(rows);
            }
        }
        
    } catch (error) {
        console.error('❌ Error fetching cases:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        res.status(500).json({ 
            error: 'Failed to fetch cases',
            details: error.message,
            sqlMessage: error.sqlMessage
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
        description, 
        witness_name, 
        crime_location, 
        crime_type, 
        past_crimes, 
        suspect_id 
    } = req.body;

    if (!case_name && !title) {
        return res.status(400).json({ error: 'Case name is required' });
    }

    try {
        console.log('📋 Creating case with data:', {
            case_name, description, witness_name, crime_location, crime_type, suspect_id, stationId
        });

        const caseNumber = `CAS-${Date.now()}`;
        const finalTitle = case_name || title; // Use either field name
        
        // Create the case
        const [caseResult] = await pool.query(
            `INSERT INTO cases (station_id, case_number, title, description, case_type, priority, lead_investigator_id, date_opened) 
             VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
            [stationId, caseNumber, finalTitle, description, crime_type || 'other', 'medium', leadAgentId]
        );

        const caseId = caseResult.insertId;
        console.log('✅ Case created with ID:', caseId);

        // If suspect_id is provided, link the case to the suspect
        if (suspect_id) {
            try {
                // Check if suspect exists and belongs to this station
                const [suspectCheck] = await pool.query(
                    'SELECT * FROM suspects WHERE suspect_id = ? AND station_id = ?',
                    [suspect_id, stationId]
                );

                if (suspectCheck.length > 0) {
                    // Add case-suspect relationship
                    await pool.query(
                        'INSERT INTO case_suspects (case_id, suspect_id) VALUES (?, ?)',
                        [caseId, suspect_id]
                    );
                    console.log('✅ Case linked to suspect:', suspect_id);

                    // Update suspect to indicate they have a case
                    await pool.query(
                        'UPDATE suspects SET has_case = TRUE, case_id = ? WHERE suspect_id = ?',
                        [caseId, suspect_id]
                    );
                    console.log('✅ Suspect updated with case information');
                } else {
                    console.warn('⚠️ Suspect not found or access denied:', suspect_id);
                }
            } catch (linkError) {
                console.error('❌ Error linking case to suspect:', linkError);
                // Don't fail the whole operation if linking fails
            }
        }

        res.status(201).json({
            message: 'Case created successfully',
            case_id: caseId,
            case_number: caseNumber,
            suspect_id: suspect_id || null
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
