/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
} = require('../controllers/auth.controller');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require('../middleware/validation.middleware');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter.middleware');

// Handle OPTIONS requests for CORS preflight (must be before other routes)
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept-Language');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// POST /api/auth/register
router.post('/register', authLimiter, validateRegister, register);

// POST /api/auth/login
router.post('/login', authLimiter, validateLogin, login);

// POST /api/auth/forgot-password
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, forgotPassword);

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', validateResetPassword, resetPassword);

// GET /api/auth/verify-email/:token
router.get('/verify-email/:token', verifyEmail);

// POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

module.exports = router;










