/**
 * Health Check Controller
 * Handles health check endpoints for monitoring server status
 */

const os = require('os');
const { getConnectionState } = require('../config/database');

/**
 * @desc    Get basic health status
 * @route   GET /api/health
 * @access  Public
 */
const getHealthStatus = (req, res) => {
  const dbState = getConnectionState();
  
  res.status(200).json({
    success: true,
    message: 'Server is running',
    database: dbState.isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
};

/**
 * @desc    Get detailed health information
 * @route   GET /api/health/detailed
 * @access  Public
 */
const getDetailedHealth = (req, res) => {
  // Calculate uptime
  const uptime = process.uptime();
  const uptimeFormatted = formatUptime(uptime);

  // Get database connection state
  const dbState = getConnectionState();

  // Memory usage
  const memoryUsage = process.memoryUsage();
  const memoryUsageFormatted = {
    rss: formatBytes(memoryUsage.rss),
    heapTotal: formatBytes(memoryUsage.heapTotal),
    heapUsed: formatBytes(memoryUsage.heapUsed),
    external: formatBytes(memoryUsage.external),
  };

  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    data: {
      server: {
        status: 'online',
        environment: process.env.NODE_ENV || 'development',
        uptime: uptimeFormatted,
        timestamp: new Date().toISOString(),
      },
      database: {
        status: dbState.readyState,
        isConnected: dbState.isConnected,
        name: dbState.name,
        host: dbState.host,
        port: dbState.port,
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        memory: memoryUsageFormatted,
        cpus: os.cpus().length,
        totalMemory: formatBytes(os.totalmem()),
        freeMemory: formatBytes(os.freemem()),
      },
    },
  });
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

module.exports = {
  getHealthStatus,
  getDetailedHealth,
};
