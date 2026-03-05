const express = require('express');
const bcrypt = require('bcrypt');
const { query } = require('../config/db');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Find user by email
        const users = await query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate token
        const token = generateToken(user);
        
        // Log the login
        await query(
            'INSERT INTO logs (user_id, event, details) VALUES (?, ?, ?)',
            [user.id, 'User Login', `User ${user.email} logged in`]
        );
        
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile_picture: user.profile_picture
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }
        
        // Check if user exists
        const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email]);
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);
        
        // Create user
        const result = await query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, password_hash, role || 'analyst']
        );
        
        // Log the signup
        await query(
            'INSERT INTO logs (user_id, event, details) VALUES (?, ?, ?)',
            [result.insertId, 'User Signup', `New user ${email} created`]
        );
        
        res.status(201).json({ 
            message: 'User created successfully',
            userId: result.insertId 
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed' });
    }
});

// GET /api/auth/me - Get current user info
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const users = await query('SELECT id, name, email, role, profile_picture, created_at FROM users WHERE id = ?', [decoded.id]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(users[0]);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// GET /api/auth/profile - Get current user profile
router.get('/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const users = await query('SELECT id, name, email, role, profile_picture, created_at FROM users WHERE id = ?', [decoded.id]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(users[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { name, email } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }
        
        // Check if email is taken by another user
        const existingUsers = await query('SELECT id FROM users WHERE email = ? AND id != ?', [email, decoded.id]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        
        await query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, decoded.id]);
        
        const users = await query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [decoded.id]);
        
        res.json({ message: 'Profile updated', user: users[0] });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// PUT /api/auth/change-password - Change user password
router.put('/change-password', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new passwords are required' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        // Verify current password
        const users = await query('SELECT * FROM users WHERE id = ?', [decoded.id]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        // Hash and update new password
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
        
        await query('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, decoded.id]);
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// DELETE /api/auth/delete-account - Delete user account
router.delete('/delete-account', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ error: 'Password is required to delete account' });
        }
        
        // Verify password
        const users = await query('SELECT * FROM users WHERE id = ?', [decoded.id]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const isMatch = await bcrypt.compare(password, users[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password' });
        }
        
        // Log the deletion
        await query(
            'INSERT INTO logs (user_id, event, details) VALUES (?, ?, ?)',
            [decoded.id, 'Account Deleted', `User ${users[0].email} deleted their account`]
        );
        
        // Delete user (cascading will handle related records)
        await query('DELETE FROM users WHERE id = ?', [decoded.id]);
        
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

// PUT /api/auth/profile-picture - Update profile picture
router.put('/profile-picture', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { profile_picture } = req.body;
        
        await query('UPDATE users SET profile_picture = ? WHERE id = ?', [profile_picture, decoded.id]);
        
        const users = await query('SELECT id, name, email, role, profile_picture, created_at FROM users WHERE id = ?', [decoded.id]);
        
        res.json({ message: 'Profile picture updated', user: users[0] });
    } catch (error) {
        console.error('Update profile picture error:', error);
        res.status(500).json({ error: 'Failed to update profile picture' });
    }
});

module.exports = router;
