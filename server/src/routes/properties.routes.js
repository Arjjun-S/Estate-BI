const express = require('express');
const { query } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/properties - List all properties
router.get('/', async (req, res) => {
    try {
        const { city, type, status, region_id, limit = 50, offset = 0, search } = req.query;
        
        let sql = `
            SELECT 
                p.*,
                r.name as region_name,
                r.city as region_city
            FROM properties p
            LEFT JOIN regions r ON p.region_id = r.id
        `;
        
        const params = [];
        const conditions = [];
        
        if (city) {
            conditions.push('p.city = ?');
            params.push(city);
        }
        
        if (type) {
            conditions.push('p.type = ?');
            params.push(type);
        }
        
        if (status) {
            conditions.push('p.status = ?');
            params.push(status);
        }
        
        if (region_id) {
            conditions.push('p.region_id = ?');
            params.push(region_id);
        }
        
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        
        sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        const properties = await query(sql, params);
        
        res.json(properties);
    } catch (error) {
        console.error('List properties error:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

// GET /api/properties/:id - Get single property
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const properties = await query(`
            SELECT 
                p.*,
                r.name as region_name,
                r.city as region_city,
                r.pincode
            FROM properties p
            LEFT JOIN regions r ON p.region_id = r.id
            WHERE p.id = ?
        `, [id]);
        
        if (properties.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        // Get transactions for this property
        const transactions = await query(`
            SELECT * FROM transactions WHERE property_id = ? ORDER BY transaction_date DESC
        `, [id]);
        
        res.json({
            ...properties[0],
            transactions
        });
    } catch (error) {
        console.error('Get property error:', error);
        res.status(500).json({ error: 'Failed to fetch property' });
    }
});

// POST /api/properties - Create new property
router.post('/', async (req, res) => {
    try {
        const {
            property_code, address, city, region_id, type, status,
            price, sqft, bedrooms, bathrooms, year_built, description
        } = req.body;
        
        if (!city || !price) {
            return res.status(400).json({ error: 'City and price are required' });
        }
        
        const result = await query(`
            INSERT INTO properties 
            (property_code, address, city, region_id, type, status, price, sqft, bedrooms, bathrooms, year_built, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            property_code || `PROP${Date.now()}`,
            address,
            city,
            region_id,
            type || 'Residential',
            status || 'Active',
            price,
            sqft,
            bedrooms || 0,
            bathrooms || 0,
            year_built,
            description
        ]);
        
        res.status(201).json({
            message: 'Property created successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Create property error:', error);
        res.status(500).json({ error: 'Failed to create property' });
    }
});

// PUT /api/properties/:id - Update property
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Build dynamic update query
        const fields = ['address', 'city', 'region_id', 'type', 'status', 'price', 'sqft', 'bedrooms', 'bathrooms', 'year_built', 'description'];
        const setClauses = [];
        const params = [];
        
        for (const field of fields) {
            if (updates[field] !== undefined) {
                setClauses.push(`${field} = ?`);
                params.push(updates[field]);
            }
        }
        
        if (setClauses.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        
        params.push(id);
        
        await query(
            `UPDATE properties SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = ?`,
            params
        );
        
        res.json({ message: 'Property updated successfully' });
    } catch (error) {
        console.error('Update property error:', error);
        res.status(500).json({ error: 'Failed to update property' });
    }
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await query('DELETE FROM properties WHERE id = ?', [id]);
        
        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({ error: 'Failed to delete property' });
    }
});

// GET /api/properties/search/:term - Search properties
router.get('/search/:term', async (req, res) => {
    try {
        const { term } = req.params;
        
        const properties = await query(`
            SELECT p.*, r.name as region_name
            FROM properties p
            LEFT JOIN regions r ON p.region_id = r.id
            WHERE p.property_code LIKE ? 
               OR p.address LIKE ?
               OR p.city LIKE ?
               OR p.description LIKE ?
            LIMIT 20
        `, [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]);
        
        res.json(properties);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

module.exports = router;
