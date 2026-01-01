/**
 * JWT Token Utilities
 * Handles JWT token generation, verification, and expiration
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate access token
 * @param {Object} user - User object
 * @returns {string} - JWT access token
 */
const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * Generate refresh token
 * @param {Object} user - User object
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user._id,
  };

  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });
};

/**
 * Generate token pair (access + refresh)
 * @param {Object} user - User object
 * @returns {Object} - Object containing accessToken and refreshToken
 */
const generateTokenPair = (user) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

/**
 * Verify access token
 * @param {string} token - JWT access token
 * @returns {Object} - Decoded token payload
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw error;
  }
};

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object} - Decoded token payload
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwtRefreshSecret);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
};
