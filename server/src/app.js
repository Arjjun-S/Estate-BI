const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/db');

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

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
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
