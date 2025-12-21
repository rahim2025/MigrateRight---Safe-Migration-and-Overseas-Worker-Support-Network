/**
 * Request Logging Middleware
 * Logs all incoming HTTP requests with detailed information
 * 
 * Benefits:
 * 1. Track all API requests for debugging and monitoring
 * 2. Measure request/response times for performance analysis
 * 3. Identify slow endpoints that need optimization
 * 4. Audit trail for security and compliance
 * 5. Easy debugging by seeing request details
 */

const logger = require('../utils/logger');

/**
 * Request Logger Middleware
 * Logs each HTTP request with timing information
 * 
 * This middleware:
 * - Records request start time
 * - Logs request details (method, URL, IP)
 * - Captures response time when request completes
 * - Logs response status code
 */
const requestLogger = (req, res, next) => {
  // Record start time
  const startTime = Date.now();

  // Log incoming request
  logger.debug(`→ ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
  });

  // Capture response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log completed request with status and duration
    logger.http(req, res, duration);
  });

  next();
};

/**
 * Performance Monitor Middleware
 * Warns about slow requests (> 1000ms)
 */
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Warn about slow requests
    if (duration > 1000) {
      logger.warn(`Slow request detected: ${req.method} ${req.originalUrl} took ${duration}ms`, {
        method: req.method,
        url: req.originalUrl,
        duration,
        statusCode: res.statusCode,
      });
    }
  });

  next();
};

/**
 * Request ID Middleware
 * Adds a unique ID to each request for tracking
 */
const requestId = (req, res, next) => {
  // Generate unique request ID
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Add to request object
  req.id = id;
  
  // Add to response headers
  res.setHeader('X-Request-ID', id);
  
  next();
};

/**
 * Request Size Monitor
 * Logs warning for large request bodies
 */
const requestSizeMonitor = (req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    const size = JSON.stringify(req.body).length;
    
    // Warn about large request bodies (> 100KB)
    if (size > 100000) {
      logger.warn(`Large request body detected: ${size} bytes on ${req.method} ${req.originalUrl}`, {
        size,
        method: req.method,
        url: req.originalUrl,
      });
    }
  }
  
  next();
};

module.exports = {
  requestLogger,
  performanceMonitor,
  requestId,
  requestSizeMonitor,
};
