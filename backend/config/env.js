/**
 * Environment Variables Configuration
 * Centralized access to environment variables with validation
 */

require('dotenv').config();

/**
 * Environment configuration object
 * Access all environment variables through this object
 */
const config = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  appName: process.env.APP_NAME || 'MigrateRight',
  apiVersion: process.env.API_VERSION || 'v1',

  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',

  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/migrateright',

  // JWT Authentication
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // Security
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
};

/**
 * Validate required environment variables
 */
const validateConfig = () => {
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];

  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0 && config.nodeEnv === 'production') {
    console.error('❌ Missing required environment variables:', missingVars);
    process.exit(1);
  }
};

// Run validation
validateConfig();

module.exports = config;
