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

// Request ID - Add unique ID to each request
app.use(requestId);

// Security Headers - Helmet protects against common web vulnerabilities
app.use(helmet());

// CORS - Allow cross-origin requests from frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
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

// Agency Routes
app.use('/api/agencies', agencyRoutes);

// Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MigrateRight API',
    version: process.env.API_VERSION || 'v1',
    status: 'active',
    documentation: '/api/health',
    endpoints: {
      health: '/api/health',
      agencies: '/api/agencies',
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
