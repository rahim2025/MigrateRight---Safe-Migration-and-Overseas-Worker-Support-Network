/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const {
  register,
  registerAgency,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
} = require('../controllers/auth.controller');
const {
  validateRegister,
  validateAgencyRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require('../middleware/validation.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { passwordResetLimiter } = require('../middleware/rateLimiter.middleware');

// Handle OPTIONS requests for CORS preflight (must be before other routes)
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept-Language');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// POST /api/auth/register
router.post('/register', validateRegister, register);

// POST /api/auth/register-agency
router.post('/register-agency', validateAgencyRegister, registerAgency);

// POST /api/auth/login
router.post('/login', validateLogin, login);

// POST /api/auth/logout (Protected)
router.post('/logout', authenticate, logout);

// GET /api/auth/me (Protected)
router.get('/me', authenticate, getCurrentUser);

// POST /api/auth/forgot-password
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, forgotPassword);

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', validateResetPassword, resetPassword);

// GET /api/auth/verify-email/:token
router.get('/verify-email/:token', verifyEmail);

// POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

module.exports = router;










