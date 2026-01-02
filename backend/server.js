/**
 * Server Entry Point
 * Main Express server configuration and initialization
 */

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');
const healthRoutes = require('./routes/health.routes');
const agencyRoutes = require('./routes/agency.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const calculatorRoutes = require('./routes/calculator.routes');
const countryGuideRoutes = require('./routes/countryGuide.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const {
  requestLogger,
  performanceMonitor,
  requestId,
  requestSizeMonitor,
} = require('./middleware/logger.middleware');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ==================== MIDDLEWARE ====================

// CORS Configuration - Handle OPTIONS requests FIRST
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow for development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
};

// Handle OPTIONS requests FIRST - before any other middleware
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else if (allowedOrigins.length > 0) {
      res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept-Language');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  next();
});

// Apply CORS to all routes
app.use(cors(corsOptions));

// Request ID - Add unique ID to each request
app.use(requestId);

// Security Headers - Helmet configured for CORS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

// Body Parser - Parse incoming JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Request Logger - Log all requests with timing
app.use(requestLogger);

// Performance Monitor - Warn about slow requests
app.use(performanceMonitor);

// Request Size Monitor - Warn about large payloads
app.use(requestSizeMonitor);

// ==================== ROUTES ====================

// Health Check Route
app.use('/api/health', healthRoutes);

// Auth Routes
app.use('/api/auth', authRoutes);

// User Routes
app.use('/api/users', userRoutes);

// Agency Routes
app.use('/api/agencies', agencyRoutes);

// Calculator Routes
app.use('/api/calculator', calculatorRoutes);

// Country Guide Routes
app.use('/api/country-guides', countryGuideRoutes);

// Emergency SOS Routes
app.use('/api/emergency', emergencyRoutes);

// Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MigrateRight API',
    version: process.env.API_VERSION || 'v1',
    status: 'active',
    documentation: '/api/health',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      agencies: '/api/agencies',
      calculator: '/api/calculator',
      countryGuides: '/api/country-guides',
      emergency: '/api/emergency',
    },
  });
});

// ==================== ERROR HANDLING ====================

// 404 Not Found Handler - Catch all undefined routes
app.use(notFound);

// Global Error Handler - Handle all errors
app.use(errorHandler);

// ==================== SERVER START ====================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`MigrateRight API Server started`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Port: ${PORT}`);
  logger.info(`URL: http://localhost:${PORT}`);
  logger.info(`Health Check: http://localhost:${PORT}/api/health`);
  
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║  🚀 MigrateRight API Server                          ║
║                                                       ║
║  ✅ Server running in ${process.env.NODE_ENV || 'development'} mode                ║
║  ✅ Port: ${PORT}                                     ║
║  ✅ API URL: http://localhost:${PORT}                 ║
║  ✅ Health Check: http://localhost:${PORT}/api/health ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', {
    message: err.message,
    stack: err.stack,
  });
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    message: err.message,
    stack: err.stack,
  });
  // Exit process
  process.exit(1);
});
