/**
 * Error Handling Middleware
 * Centralized error handling for the application
 * 
 * Benefits:
 * 1. Consistent error response format across all endpoints
 * 2. Proper HTTP status codes for different error types
 * 3. Detailed error logging for debugging
 * 4. Security: Hides sensitive error details in production
 * 5. Easier maintenance: All error logic in one place
 */

const logger = require('../utils/logger');
const {
  ApiError,
  ValidationError,
  NotFoundError,
} = require('../utils/errors');

/**
 * 404 Not Found Handler
 * Catches requests to undefined routes
 * 
 * This middleware runs BEFORE the global error handler
 * It creates a NotFoundError and passes it to the error handler
 */
const notFound = (req, res, next) => {
  // Skip OPTIONS requests (CORS preflight) - they should be handled by CORS middleware
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const error = new NotFoundError('Route', `Route ${req.originalUrl} not found`);
  
  // Log the 404 attempt
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  
  next(error);
};

/**
 * Mongoose Validation Error Handler
 * Converts Mongoose validation errors to our standard format
 */
const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map((error) => ({
    field: error.path,
    message: error.message,
    value: error.value,
  }));

  return new ValidationError('Validation failed', errors);
};

/**
 * Mongoose Duplicate Key Error Handler
 * Handles MongoDB duplicate key errors (E11000)
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyPattern)[0];
  const value = err.keyValue[field];
  
  return new ValidationError(
    `Duplicate value error`,
    [{
      field,
      message: `${field} '${value}' already exists`,
      value,
    }]
  );
};

/**
 * Mongoose Cast Error Handler
 * Handles invalid MongoDB ObjectId errors
 */
const handleCastError = (err) => {
  return new ValidationError(
    `Invalid ${err.path}`,
    [{
      field: err.path,
      message: `Invalid ${err.path} format`,
      value: err.value,
    }]
  );
};

/**
 * Global Error Handler
 * Handles all errors thrown in the application
 * 
 * This is the LAST middleware in the chain
 * All errors eventually end up here
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // ==================== MONGOOSE ERROR HANDLING ====================
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = handleMongooseValidationError(err);
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    error = handleCastError(err);
  }

  // ==================== JWT ERROR HANDLING ====================
  
  // JWT token expired
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired - Please login again');
  }
  
  // JWT malformed token
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token - Please login again');
  }

  // ==================== DETERMINE STATUS CODE ====================
  
  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational || false;

  // ==================== BUILD ERROR RESPONSE ====================
  
  const errorResponse = {
    success: false,
    message: error.message || 'Internal server error',
    statusCode,
    timestamp: error.timestamp || new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };

  // Add validation errors if present
  if (error.errors && error.errors.length > 0) {
    errorResponse.errors = error.errors;
  }

  // Add error type
  if (error.name) {
    errorResponse.type = error.name;
  }

  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  // ==================== LOGGING ====================
  
  // Log error details
  const logMessage = `${statusCode} - ${error.message} - ${req.method} ${req.originalUrl}`;
  
  if (statusCode >= 500) {
    // Server errors (5xx) - log as errors
    logger.error(logMessage, {
      statusCode,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      stack: error.stack,
      body: req.body,
      isOperational,
    });
  } else if (statusCode >= 400) {
    // Client errors (4xx) - log as warnings
    logger.warn(logMessage, {
      statusCode,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  }

  // ==================== SEND RESPONSE ====================
  
  res.status(statusCode).json(errorResponse);
};

/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 * 
 * Usage:
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 * 
 * Without this, you'd need try-catch in every async function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
};
