/**
 * Custom Logger Utility
 * Centralized logging system for the application
 * 
 * Features:
 * - Different log levels (info, warn, error, debug)
 * - Colored console output
 * - Timestamps
 * - Request/Response logging
 * - File logging support (optional)
 */

const fs = require('fs');
const path = require('path');

// ==================== CONFIGURATION ====================

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  HTTP: 'HTTP',
};

// Console colors
const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  GREEN: '\x1b[32m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  GRAY: '\x1b[90m',
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get current timestamp
 * @returns {string} Formatted timestamp
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString();
}

/**
 * Format log message with color and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {string} color - Console color
 * @returns {string} Formatted message
 */
function formatMessage(level, message, color) {
  const timestamp = getTimestamp();
  return `${COLORS.GRAY}[${timestamp}]${COLORS.RESET} ${color}[${level}]${COLORS.RESET} ${message}`;
}

/**
 * Write log to file (optional)
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function writeToFile(level, message, meta = {}) {
  // Only write to file in production
  if (process.env.NODE_ENV !== 'production') return;

  try {
    const logsDir = path.join(__dirname, '../logs');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Determine log file based on level
    const filename = level === LOG_LEVELS.ERROR ? 'error.log' : 'combined.log';
    const filepath = path.join(logsDir, filename);

    // Format log entry
    const logEntry = JSON.stringify({
      timestamp: getTimestamp(),
      level,
      message,
      ...meta,
    }) + '\n';

    // Append to file
    fs.appendFileSync(filepath, logEntry);
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}

// ==================== LOGGER METHODS ====================

/**
 * Log error message
 * @param {string} message - Error message
 * @param {Object} meta - Additional metadata
 */
function error(message, meta = {}) {
  const formatted = formatMessage(LOG_LEVELS.ERROR, message, COLORS.RED);
  console.error(formatted);
  
  if (meta.stack) {
    console.error(COLORS.GRAY + meta.stack + COLORS.RESET);
  }
  
  writeToFile(LOG_LEVELS.ERROR, message, meta);
}

/**
 * Log warning message
 * @param {string} message - Warning message
 * @param {Object} meta - Additional metadata
 */
function warn(message, meta = {}) {
  const formatted = formatMessage(LOG_LEVELS.WARN, message, COLORS.YELLOW);
  console.warn(formatted);
  writeToFile(LOG_LEVELS.WARN, message, meta);
}

/**
 * Log info message
 * @param {string} message - Info message
 * @param {Object} meta - Additional metadata
 */
function info(message, meta = {}) {
  const formatted = formatMessage(LOG_LEVELS.INFO, message, COLORS.GREEN);
  console.log(formatted);
  writeToFile(LOG_LEVELS.INFO, message, meta);
}

/**
 * Log debug message (only in development)
 * @param {string} message - Debug message
 * @param {Object} meta - Additional metadata
 */
function debug(message, meta = {}) {
  if (process.env.NODE_ENV === 'development') {
    const formatted = formatMessage(LOG_LEVELS.DEBUG, message, COLORS.CYAN);
    console.log(formatted);
  }
}

/**
 * Log HTTP request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} duration - Request duration in ms
 */
function http(req, res, duration) {
  const { method, originalUrl, ip } = req;
  const { statusCode } = res;
  
  // Color based on status code
  let color = COLORS.GREEN;
  if (statusCode >= 400 && statusCode < 500) color = COLORS.YELLOW;
  if (statusCode >= 500) color = COLORS.RED;

  const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms - ${ip}`;
  const formatted = formatMessage(LOG_LEVELS.HTTP, message, color);
  console.log(formatted);

  writeToFile(LOG_LEVELS.HTTP, message, {
    method,
    url: originalUrl,
    statusCode,
    duration,
    ip,
    userAgent: req.get('user-agent'),
  });
}

/**
 * Log database query
 * @param {string} operation - Database operation (find, create, update, delete)
 * @param {string} collection - Collection name
 * @param {number} duration - Query duration in ms
 */
function dbQuery(operation, collection, duration) {
  const message = `DB ${operation} on ${collection} - ${duration}ms`;
  debug(message);
}

/**
 * Log API request details
 * @param {Object} req - Express request object
 */
function apiRequest(req) {
  const { method, originalUrl, body, query, params } = req;
  
  debug(`API Request: ${method} ${originalUrl}`, {
    body: Object.keys(body).length ? body : undefined,
    query: Object.keys(query).length ? query : undefined,
    params: Object.keys(params).length ? params : undefined,
  });
}

/**
 * Log API response
 * @param {Object} res - Express response object
 * @param {any} data - Response data
 */
function apiResponse(res, data) {
  const { statusCode } = res;
  debug(`API Response: ${statusCode}`, { dataSize: JSON.stringify(data).length });
}

// ==================== EXPORTS ====================

module.exports = {
  error,
  warn,
  info,
  debug,
  http,
  dbQuery,
  apiRequest,
  apiResponse,
  LOG_LEVELS,
};
