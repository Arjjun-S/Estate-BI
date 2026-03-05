const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { testConnection, query } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const uploadRoutes = require('./routes/upload.routes');
const logsRoutes = require('./routes/logs.routes');
const settingsRoutes = require('./routes/settings.routes');
const propertiesRoutes = require('./routes/properties.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware - logs to console and database
app.use(async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.path}`);
    
    // Log important API events to database
    const importantPaths = ['/api/auth/login', '/api/auth/signup', '/api/upload', '/api/settings'];
    const shouldLog = importantPaths.some(p => req.path.startsWith(p)) || req.method !== 'GET';
    
    if (shouldLog && req.path !== '/api/logs') {
        try {
            // Get user from token if available
            let userId = null;
            if (req.headers.authorization) {
                try {
                    const jwt = require('jsonwebtoken');
                    const token = req.headers.authorization.split(' ')[1];
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    userId = decoded.id;
                } catch (e) { /* Token might be invalid */ }
            }
            
            const event = `${req.method} ${req.path}`;
            const details = req.method !== 'GET' && req.body ? JSON.stringify(req.body).substring(0, 500) : null;
            const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
            
            await query(
                'INSERT INTO logs (user_id, event, details, ip_address) VALUES (?, ?, ?, ?)',
                [userId, event, details, ip]
            );
        } catch (e) {
            // Don't fail if logging fails
            console.error('Failed to log request:', e.message);
        }
    }
    
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/properties', propertiesRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
const startServer = async () => {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
        console.warn('⚠️ Starting server without database connection');
    }
    
    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🏠 EstateBI Server Running                             ║
║   ─────────────────────────────────────────────────────  ║
║   🌐 URL: http://localhost:${PORT}                         ║
║   📊 API: http://localhost:${PORT}/api                     ║
║   🔒 Auth: http://localhost:${PORT}/api/auth               ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
        `);
    });
};

startServer();
