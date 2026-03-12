require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// ── Connect to Database ────────────────────────────────
connectDB();

const app = express();

// ── Security Middleware ────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Rate limiting — 100 requests per 10 minutes per IP
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ── General Middleware ─────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ── Health Check ───────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '💓 Insightful Health Tracker API is running',
        version: '1.0.0',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// ── API Routes ─────────────────────────────────────────
app.use('/api/v1/auth', require('./src/routes/authRoutes'));
app.use('/api/v1/health-records', require('./src/routes/healthRoutes'));
app.use('/api/v1/activities', require('./src/routes/activityRoutes'));
app.use('/api/v1/meals', require('./src/routes/mealRoutes'));
app.use('/api/v1/sleep', require('./src/routes/sleepRoutes'));
app.use('/api/v1/medications', require('./src/routes/medicationRoutes'));
app.use('/api/v1/reports', require('./src/routes/reportRoutes'));
app.use('/api/v1/notifications', require('./src/routes/notificationRoutes'));

// ── 404 Handler ────────────────────────────────────────
app.all('/{*path}', (req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ───────────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost'; // Default to localhost for security
// For network access from phone, explicitly use the IP or use '0.0.0.0'
const actualHost = process.env.NODE_ENV === 'development' ? '0.0.0.0' : HOST;

const server = app.listen(PORT, actualHost, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📱 Phone should connect to: http://192.168.1.34:${PORT}`);
    console.log(`💻 Localhost access: http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});

// Handle SIGTERM (for graceful shutdown on deployment)
process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('💤 Server closed.');
        process.exit(0);
    });
});

module.exports = app;



