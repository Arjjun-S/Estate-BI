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
                role: user.role
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
        
        const users = await query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [decoded.id]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(users[0]);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

module.exports = router;
