const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Invalid token format' });
        }
        
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ error: 'Token expired' });
                }
                return res.status(403).json({ error: 'Invalid token' });
            }
            
            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Authentication error' });
    }
};

// Optional: Admin only middleware
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email, 
            name: user.name,
            role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

module.exports = {
    authMiddleware,
    adminOnly,
    generateToken
};
