/**
 * Authentication Middleware
 * JWT verification, user extraction, and role-based access control
 * Production-ready with enhanced security features
 */

const { asyncHandler } = require('./error.middleware');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const { verifyAccessToken } = require('../utils/jwt.utils');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Authenticate User - Verify JWT and attach user to request
 * Enhanced with security logging and additional validations
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  
  // Extract token from Authorization header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    throw new UnauthorizedError('Authentication required');
  }
  
  try {
    // Verify and decode token
    const decoded = verifyAccessToken(token);
    
    // Fetch user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      logger.warn('Authentication failed - User not found', {
        userId: decoded.id,
        ip: req.ip,
      });
      throw new UnauthorizedError('User not found');
    }
    
    // Check if password changed after token issued
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      logger.warn('Authentication failed - Password changed', {
        userId: user._id,
        ip: req.ip,
      });
      throw new UnauthorizedError('Password changed - Please login again');
    }
    
    // Attach user and metadata to request
    req.user = user;
    req.userId = user._id;
    req.token = token; // Store token for potential blacklisting on logout
    
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      logger.info('Token expired', { ip: req.ip });
      throw new UnauthorizedError('Token expired - Please login again');
    }
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid token', { ip: req.ip });
      throw new UnauthorizedError('Invalid token');
    }
    if (error.name === 'TokenRevokedError') {
      logger.warn('Revoked token used', { ip: req.ip });
      throw new UnauthorizedError('Token has been revoked');
    }
    if (error.name === 'InvalidTokenTypeError') {
      logger.warn('Invalid token type', { ip: req.ip });
      throw new UnauthorizedError('Invalid token type');
    }
    throw error;
  }
});

/**
 * Optional Auth - Attach user if token present, continue otherwise
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return next();
  }
  
  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
      req.userId = user._id;
    }
  } catch (error) {
    // Silently continue without auth
  }
  
  next();
});

/**
 * Role-Based Access Control (RBAC)
 * @param {...String} allowedRoles - Roles allowed to access
 */
const authorize = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Authorization failed', {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        ip: req.ip,
        path: req.path,
      });
      throw new ForbiddenError(`Access denied - Required roles: ${allowedRoles.join(', ')}`);
    }
    
    next();
  });
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
};
