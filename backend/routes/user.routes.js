/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const {
  getCurrentUser,
  updateCurrentUser,
  getUserById,
} = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateUpdateProfile, validateObjectId } = require('../middleware/validation.middleware');

// Handle OPTIONS requests for CORS preflight
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept-Language');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// GET /api/users/me - Get current user profile
router.get('/me', authenticate, getCurrentUser);

// PATCH /api/users/me - Update current user profile
router.patch('/me', authenticate, validateUpdateProfile, updateCurrentUser);

// GET /api/users/:id - Get public user profile by ID
router.get('/:id', validateObjectId('id'), getUserById);

module.exports = router;










