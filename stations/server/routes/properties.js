const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

/**
 * GET /api/properties
 * Retrieve all properties for the authenticated user's station
 * Optional: station_id query parameter for any user to view other stations
 */
router.get('/', authenticateToken, async (req, res) => {
    const { station_id } = req.query;
    const userStationId = req.user.station_id || 1;
    
    // Allow any authenticated user to view any station's properties when station_id is provided
    // This enables cross-station visibility in the national property page
    const targetStationId = station_id ? parseInt(station_id) : userStationId;
    
    try {
        console.log(`🔍 Fetching properties for station_id: ${targetStationId}, user role: ${req.user.role}, user station: ${userStationId}, requested station_id: ${station_id}`);
        const [rows] = await pool.query(
            'SELECT * FROM properties WHERE station_id = ? ORDER BY created_at DESC',
            [targetStationId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('❌ Error fetching properties:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

/**
 * POST /api/properties
 * Register a new property for the authenticated user's station
 */
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
    console.log('📝 Property registration request received');
    console.log('📝 Request body:', req.body);
    console.log('📝 Request file:', req.file ? 'File present' : 'No file');
    console.log('📝 User info:', { stationId: req.user?.station_id, userId: req.user?.user_id, role: req.user?.role });
    
    const {
        item_name,
        description,
        category,
        estimated_value,
        status,
        location_found,
        date_found,
        owner_name,
        owner_contact
    } = req.body;

    if (!item_name) {
        console.log('❌ Validation failed: item_name is required');
        return res.status(400).json({ error: 'Item name is required' });
    }

    const stationId = req.user.station_id || 1;
    const registeredBy = req.user.user_id || 1;

    try {
        console.log(`📝 Registering property for station_id: ${stationId}, registered by: ${registeredBy}`);

        // Handle image upload if present
        let imageUrl = null;
        if (req.file) {
            console.log('📝 Processing image upload:', req.file.originalname, 'Size:', req.file.size);
            
            try {
                // Store image as file path instead of base64 to avoid size limits
                const fs = require('fs');
                const path = require('path');
                
                // Create uploads directory if it doesn't exist
                const uploadsDir = path.join(__dirname, '../uploads/properties');
                if (!fs.existsSync(uploadsDir)) {
                    console.log('📝 Creating uploads directory:', uploadsDir);
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }
                
                // Generate unique filename
                const filename = `property-${Date.now()}-${req.file.originalname}`;
                const filepath = path.join(uploadsDir, filename);
                
                console.log('📝 Saving image to:', filepath);
                
                // Write file to disk
                fs.writeFileSync(filepath, req.file.buffer);
                
                // Store relative path in database
                imageUrl = `/uploads/properties/${filename}`;
                console.log('✅ Image saved successfully:', imageUrl);
                
            } catch (fileError) {
                console.error('❌ Error saving image file:', fileError);
                // Fallback to null (no image) instead of base64
                imageUrl = null;
            }
        }

        const [result] = await pool.query(
            `INSERT INTO properties 
            (station_id, registered_by, property_code, item_name, description, category, estimated_value, status, location_found, date_found, owner_name, owner_contact, image_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                stationId,
                registeredBy,
                `PROP-${Date.now()}`,
                item_name,
                description || null,
                category || 'General',
                estimated_value || 0,
                status || 'missing',
                location_found || null,
                date_found || null,
                owner_name || null,
                owner_contact || null,
                imageUrl
            ]
        );
        
        console.log('✅ Property inserted with imageUrl:', imageUrl, '(length:', imageUrl ? imageUrl.length : 0, ')');

        res.status(201).json({
            message: 'Property registered successfully',
            property_id: result.insertId,
            property_code: `PROP-${Date.now()}`
        });
    } catch (error) {
        console.error('❌ Error registering property:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Property code already exists' });
        }
        res.status(500).json({ error: 'Failed to register property' });
    }
});

/**
 * PUT /api/properties/:id
 * Update property status or details
 */
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status, owner_name, owner_contact, estimated_value } = req.body;
    
    const stationId = req.user.station_id || 1;
    
    try {
        const [result] = await pool.query(
            `UPDATE properties 
             SET status = ?, owner_name = ?, owner_contact = ?, estimated_value = ?, updated_at = CURRENT_TIMESTAMP
             WHERE property_id = ? AND station_id = ?`,
            [status, owner_name, owner_contact, estimated_value, id, stationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        res.status(200).json({ message: 'Property updated successfully' });
    } catch (error) {
        console.error('❌ Error updating property:', error);
        res.status(500).json({ error: 'Failed to update property' });
    }
});

/**
 * DELETE /api/properties/:id
 * Delete a property (admin, dpo, and officers)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const stationId = req.user.station_id || 1;
    
    // Allow admin, dpo, and officers to delete properties from their own station
    if (!['admin', 'dpo', 'officer'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    try {
        const [result] = await pool.query(
            'DELETE FROM properties WHERE property_id = ? AND station_id = ?',
            [id, stationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting property:', error);
        res.status(500).json({ error: 'Failed to delete property' });
    }
});

module.exports = router;
