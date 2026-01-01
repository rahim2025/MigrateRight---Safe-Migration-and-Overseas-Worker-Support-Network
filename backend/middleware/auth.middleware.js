/**
 * Authentication Middleware
 * JWT verification, user extraction, and role-based access control
 */

const { asyncHandler } = require('./error.middleware');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const { verifyAccessToken } = require('../utils/jwt.utils');
const User = require('../models/User');

/**
 * Authenticate User - Verify JWT and attach user to request
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    throw new UnauthorizedError('Authentication required');
  }
  
  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    
    if (user.accountStatus !== 'active' && user.accountStatus !== 'pending') {
      throw new UnauthorizedError(`Account is ${user.accountStatus}`);
    }
    
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      throw new UnauthorizedError('Password changed - Please login again');
    }
    
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expired - Please login again');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid token');
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
    if (user && user.accountStatus === 'active') {
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
