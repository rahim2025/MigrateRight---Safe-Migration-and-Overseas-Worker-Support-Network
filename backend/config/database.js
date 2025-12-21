/**
 * Database Configuration
 * Production-ready MongoDB connection using Mongoose
 * 
 * Features:
 * - Connection pooling for optimal performance
 * - Automatic reconnection with retry logic
 * - Comprehensive error handling
 * - Connection state monitoring
 * - Graceful shutdown handling
 */

const mongoose = require('mongoose');

// ==================== CONFIGURATION ====================

/**
 * MongoDB Connection Options (Production-Ready)
 * 
 * These options optimize performance, reliability, and security:
 * - maxPoolSize: Maximum number of connections in the pool
 * - minPoolSize: Minimum number of connections to maintain
 * - serverSelectionTimeoutMS: How long to wait for server selection
 * - socketTimeoutMS: How long to wait before closing inactive sockets
 * - family: Use IPv4 (prevents IPv6 issues)
 */
const options = {
  // Connection Pool Settings
  maxPoolSize: 10,              // Maximum 10 connections (adjust based on your app needs)
  minPoolSize: 2,               // Keep at least 2 connections alive
  
  // Timeout Settings
  serverSelectionTimeoutMS: 5000,  // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000,          // Close sockets after 45s of inactivity
  
  // Network Settings
  family: 4,                    // Use IPv4, skip trying IPv6
  
  // Write Concern (for data safety)
  w: 'majority',                // Wait for majority of nodes to acknowledge writes
  
  // Read Preference
  retryWrites: true,            // Automatically retry failed writes
  retryReads: true,             // Automatically retry failed reads
};

// ==================== CONNECTION FUNCTION ====================

/**
 * Connect to MongoDB database with retry logic
 * Attempts to connect multiple times before giving up
 * 
 * @param {number} retries - Number of connection attempts (default: 5)
 * @returns {Promise<void>}
 */
const connectDB = async (retries = 5) => {
  try {
    // Validate MongoDB URI
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Attempt connection
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    // Success message
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║     ✅ MongoDB Connection Successful           ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    console.log(`🌍 Port: ${conn.connection.port}`);
    console.log(`🔄 Read State: ${getReadyState(conn.connection.readyState)}`);
    console.log('');

  } catch (error) {
    console.error('╔════════════════════════════════════════════════╗');
    console.error('║     ❌ MongoDB Connection Failed               ║');
    console.error('╚════════════════════════════════════════════════╝');
    console.error(`Error: ${error.message}`);
    
    // Retry logic
    if (retries > 0) {
      console.log(`\n🔄 Retrying connection... (${retries} attempts left)`);
      console.log('⏳ Waiting 5 seconds before retry...\n');
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    } else {
      console.error('\n💥 All retry attempts failed. Exiting...\n');
      process.exit(1);
    }
  }
};

// ==================== CONNECTION STATE HELPER ====================

/**
 * Get human-readable connection state
 * @param {number} state - Mongoose connection state code
 * @returns {string} - State description
 */
function getReadyState(state) {
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };
  return states[state] || 'Unknown';
}

// ==================== EVENT LISTENERS ====================

/**
 * Connection successful
 */
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose: Connection established');
});

/**
 * Connection error
 */
mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose: Connection error occurred');
  console.error(`   Error: ${err.message}`);
});

/**
 * Connection disconnected
 */
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Mongoose: Disconnected from MongoDB');
  
  // Attempt to reconnect in production
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Attempting to reconnect...');
    setTimeout(() => connectDB(3), 5000);
  }
});

/**
 * Connection reconnected
 */
mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose: Reconnected to MongoDB');
});

/**
 * Connection reconnect failed
 */
mongoose.connection.on('reconnectFailed', () => {
  console.error('❌ Mongoose: Reconnection attempts failed');
});

// ==================== GRACEFUL SHUTDOWN ====================

/**
 * Handle graceful shutdown on SIGINT (Ctrl+C)
 */
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('\n👋 Mongoose: Connection closed gracefully (SIGINT)');
    process.exit(0);
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
});

/**
 * Handle graceful shutdown on SIGTERM (Docker/K8s)
 */
process.on('SIGTERM', async () => {
  try {
    await mongoose.connection.close();
    console.log('\n👋 Mongoose: Connection closed gracefully (SIGTERM)');
    process.exit(0);
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
});

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if database is connected
 * @returns {boolean} - True if connected, false otherwise
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get current connection state
 * @returns {Object} - Connection state information
 */
const getConnectionState = () => {
  return {
    isConnected: isConnected(),
    readyState: getReadyState(mongoose.connection.readyState),
    host: mongoose.connection.host || 'N/A',
    port: mongoose.connection.port || 'N/A',
    name: mongoose.connection.name || 'N/A',
  };
};

/**
 * Disconnect from database
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB: Disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
    throw error;
  }
};

// ==================== EXPORTS ====================

module.exports = {
  connectDB,
  isConnected,
  getConnectionState,
  disconnectDB,
  mongoose, // Export mongoose instance for direct access
};
