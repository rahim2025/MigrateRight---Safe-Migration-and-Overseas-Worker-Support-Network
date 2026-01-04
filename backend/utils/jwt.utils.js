/**
 * JWT Token Utilities
 * Handles JWT token generation, verification, and expiration
 * Production-ready with enhanced security features
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');

// In-memory token blacklist (Use Redis in production for scalability)
const tokenBlacklist = new Set();

/**
 * Generate access token with enhanced security
 * @param {Object} user - User object
 * @param {Object} options - Additional options (ip, userAgent)
 * @returns {string} - JWT access token
 */
const generateAccessToken = (user, options = {}) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    type: 'access',
    // Optional security fingerprints
    ...(options.ip && { ip: options.ip }),
    ...(options.userAgent && { ua: options.userAgent }),
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    algorithm: 'HS256', // Explicitly set algorithm
    issuer: config.appName,
    audience: config.appName,
  });
};

/**
 * Generate refresh token with enhanced security
 * @param {Object} user - User object
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user._id,
    type: 'refresh',
  };

  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
    algorithm: 'HS256',
    issuer: config.appName,
    audience: config.appName,
  });
};

/**
 * Generate token pair (access + refresh)
 * @param {Object} user - User object
 * @param {Object} options - Additional options (ip, userAgent)
 * @returns {Object} - Object containing accessToken and refreshToken
 */
const generateTokenPair = (user, options = {}) => {
  return {
    accessToken: generateAccessToken(user, options),
    refreshToken: generateRefreshToken(user),
  };
};

/**
 * Verify access token with enhanced security checks
 * @param {string} token - JWT access token
 * @param {Object} options - Verification options
 * @returns {Object} - Decoded token payload
 * @throws {Error} - Token verification errors
 */
const verifyAccessToken = (token, options = {}) => {
  try {
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      const error = new Error('Token has been revoked');
      error.name = 'TokenRevokedError';
      throw error;
    }

    const decoded = jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256'], // Prevent algorithm confusion attacks
      issuer: config.appName,
      audience: config.appName,
    });

    // Verify token type
    if (decoded.type !== 'access') {
      const error = new Error('Invalid token type');
      error.name = 'InvalidTokenTypeError';
      throw error;
    }

    return decoded;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify refresh token with enhanced security checks
 * @param {string} token - JWT refresh token
 * @returns {Object} - Decoded token payload
 * @throws {Error} - Token verification errors
 */
const verifyRefreshToken = (token) => {
  try {
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      const error = new Error('Token has been revoked');
      error.name = 'TokenRevokedError';
      throw error;
    }

    const decoded = jwt.verify(token, config.jwtRefreshSecret, {
      algorithms: ['HS256'], // Prevent algorithm confusion attacks
      issuer: config.appName,
      audience: config.appName,
    });

    // Verify token type
    if (decoded.type !== 'refresh') {
      const error = new Error('Invalid token type');
      error.name = 'InvalidTokenTypeError';
      throw error;
    }

    return decoded;
  } catch (error) {
    throw error;
  }
};

/**
 * Blacklist a token (logout/revoke)
 * In production, use Redis with TTL matching token expiry
 * @param {string} token - Token to blacklist
 * @returns {boolean} - Success status
 */
const blacklistToken = (token) => {
  try {
    tokenBlacklist.add(token);
    
    // Auto-cleanup after token would expire anyway (optional optimization)
    // In production with Redis, set TTL to token's remaining lifetime
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const expiryTime = (decoded.exp * 1000) - Date.now();
      if (expiryTime > 0) {
        setTimeout(() => {
          tokenBlacklist.delete(token);
        }, expiryTime);
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check if token is blacklisted
 * @param {string} token - Token to check
 * @returns {boolean} - True if blacklisted
 */
const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

/**
 * Decode token without verification (for debugging/inspection)
 * WARNING: Never use decoded data for authentication
 * @param {string} token - Token to decode
 * @returns {Object|null} - Decoded payload or null
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  blacklistToken,
  isTokenBlacklisted,
  decodeToken,
};
