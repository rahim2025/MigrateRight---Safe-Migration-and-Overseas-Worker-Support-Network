/**
 * Database Utilities
 * Helper functions for database operations
 */

const { mongoose, getConnectionState, isConnected } = require('../config/database');

/**
 * Ping database to check if it's responsive
 * @returns {Promise<Object>} - Ping result with latency
 */
const pingDatabase = async () => {
  try {
    const startTime = Date.now();
    await mongoose.connection.db.admin().ping();
    const latency = Date.now() - startTime;
    
    return {
      success: true,
      latency: `${latency}ms`,
      message: 'Database is responsive',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Database ping failed',
    };
  }
};

/**
 * Get database statistics
 * @returns {Promise<Object>} - Database stats
 */
const getDatabaseStats = async () => {
  try {
    if (!isConnected()) {
      throw new Error('Database is not connected');
    }

    const stats = await mongoose.connection.db.stats();
    
    return {
      success: true,
      data: {
        database: stats.db,
        collections: stats.collections,
        documents: stats.objects,
        dataSize: formatBytes(stats.dataSize),
        storageSize: formatBytes(stats.storageSize),
        indexes: stats.indexes,
        indexSize: formatBytes(stats.indexSize),
        avgObjSize: formatBytes(stats.avgObjSize),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * List all collections in the database
 * @returns {Promise<Array>} - Array of collection names
 */
const listCollections = async () => {
  try {
    if (!isConnected()) {
      throw new Error('Database is not connected');
    }

    const collections = await mongoose.connection.db.listCollections().toArray();
    return collections.map(col => col.name);
  } catch (error) {
    console.error('Error listing collections:', error.message);
    return [];
  }
};

/**
 * Drop a collection (use with caution!)
 * @param {string} collectionName - Name of collection to drop
 * @returns {Promise<Object>} - Result
 */
const dropCollection = async (collectionName) => {
  try {
    if (!isConnected()) {
      throw new Error('Database is not connected');
    }

    // Safety check - don't allow in production
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot drop collections in production');
    }

    await mongoose.connection.db.dropCollection(collectionName);
    
    return {
      success: true,
      message: `Collection "${collectionName}" dropped successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Clear all data from a collection (use with caution!)
 * @param {string} collectionName - Name of collection to clear
 * @returns {Promise<Object>} - Result
 */
const clearCollection = async (collectionName) => {
  try {
    if (!isConnected()) {
      throw new Error('Database is not connected');
    }

    // Safety check
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clear collections in production');
    }

    const result = await mongoose.connection.db
      .collection(collectionName)
      .deleteMany({});
    
    return {
      success: true,
      deletedCount: result.deletedCount,
      message: `Cleared ${result.deletedCount} documents from "${collectionName}"`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Test database connection
 * Useful for health checks and diagnostics
 * @returns {Promise<Object>} - Connection test result
 */
const testConnection = async () => {
  try {
    const state = getConnectionState();
    
    if (!state.isConnected) {
      return {
        success: false,
        message: 'Database is not connected',
        state,
      };
    }

    // Ping the database
    const ping = await pingDatabase();
    
    return {
      success: true,
      message: 'Database connection is healthy',
      state,
      ping: ping.latency,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Database connection test failed',
      error: error.message,
    };
  }
};

/**
 * Create indexes for a model
 * Call this during app initialization for better performance
 * @param {Model} Model - Mongoose model
 * @returns {Promise<void>}
 */
const ensureIndexes = async (Model) => {
  try {
    await Model.syncIndexes();
    console.log(`✅ Indexes synced for ${Model.modelName}`);
  } catch (error) {
    console.error(`❌ Error syncing indexes for ${Model.modelName}:`, error.message);
  }
};

/**
 * Backup database to JSON files (development only)
 * @returns {Promise<Object>} - Backup result
 */
const createBackup = async () => {
  try {
    if (!isConnected()) {
      throw new Error('Database is not connected');
    }

    const collections = await listCollections();
    const backup = {};
    
    for (const collectionName of collections) {
      const data = await mongoose.connection.db
        .collection(collectionName)
        .find({})
        .toArray();
      
      backup[collectionName] = data;
    }
    
    return {
      success: true,
      backup,
      timestamp: new Date().toISOString(),
      collections: collections.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Format bytes to human-readable format
 * @param {number} bytes - Number of bytes
 * @returns {string} - Formatted string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

module.exports = {
  pingDatabase,
  getDatabaseStats,
  listCollections,
  dropCollection,
  clearCollection,
  testConnection,
  ensureIndexes,
  createBackup,
};
