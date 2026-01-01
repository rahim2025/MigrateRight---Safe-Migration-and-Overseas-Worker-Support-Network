/**
 * Rate Limiting Middleware
 * Protects against brute force attacks
 */

const rateLimit = require('express-rate-limit');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * General API Rate Limiter
 */
const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, path: req.originalUrl });
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  },
});

/**
 * Strict Auth Rate Limiter - For login/register
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true,
  skip: (req) => req.method === 'OPTIONS', // Skip CORS preflight requests
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', { ip: req.ip, email: req.body?.email });
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again after 15 minutes.',
    });
  },
});

/**
 * Password Reset Rate Limiter
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  skip: (req) => req.method === 'OPTIONS', // Skip CORS preflight requests
  message: {
    success: false,
    message: 'Too many password reset requests, please try again after 1 hour.',
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
};
