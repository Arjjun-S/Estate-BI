const express = require('express');
const { query } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings/user - Get user settings
router.get('/user', async (req, res) => {
    try {
        // Default user data if not authenticated
        const defaultUser = {
            name: 'Guest User',
            email: 'guest@estatebi.com',
            role: 'viewer',
            preferences: {
                theme: 'light',
                notifications: true,
                language: 'en'
            }
        };
        
        // If user is authenticated, get their data
        const authHeader = req.headers.authorization;
        if (authHeader) {
            try {
                const jwt = require('jsonwebtoken');
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                const users = await query(
                    'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
                    [decoded.id]
                );
                
                if (users.length > 0) {
                    return res.json({
                        ...users[0],
                        preferences: defaultUser.preferences
                    });
                }
            } catch (e) {
                // Token invalid, return default
            }
        }
        
        res.json(defaultUser);
    } catch (error) {
        console.error('Get user settings error:', error);
        res.status(500).json({ error: 'Failed to fetch user settings' });
    }
});

// PUT /api/settings/user - Update user settings
router.put('/user', authMiddleware, async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user.id;
        
        if (email) {
            // Check if email is already taken
            const existing = await query(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, userId]
            );
            
            if (existing.length > 0) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }
        
        await query(
            'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?',
            [name, email, userId]
        );
        
        // Log the update
        await query(
            'INSERT INTO logs (user_id, event, details) VALUES (?, ?, ?)',
            [userId, 'Settings Update', 'User updated profile settings']
        );
        
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// PUT /api/settings/password - Change password
router.put('/password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required' });
        }
        
        // Get current password hash
        const users = await query('SELECT password_hash FROM users WHERE id = ?', [userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Verify current password
        const bcrypt = require('bcrypt');
        const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        // Hash new password
        const newHash = await bcrypt.hash(newPassword, 10);
        
        await query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);
        
        // Log the change
        await query(
            'INSERT INTO logs (user_id, event, details) VALUES (?, ?, ?)',
            [userId, 'Password Changed', 'User changed their password']
        );
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// GET /api/settings/system - Get system settings (admin only)
router.get('/system', async (req, res) => {
    try {
        const stats = await query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM properties) as total_properties,
                (SELECT COUNT(*) FROM transactions) as total_transactions,
                (SELECT COUNT(*) FROM regions) as total_regions
        `);
        
        res.json({
            database: {
                ...stats[0],
                status: 'connected'
            },
            version: '2.0.0',
            lastBackup: new Date().toISOString()
        });
    } catch (error) {
        console.error('System settings error:', error);
        res.status(500).json({ error: 'Failed to fetch system settings' });
    }
});

module.exports = router;
