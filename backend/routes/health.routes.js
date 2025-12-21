/**
 * Health Check Routes
 * API endpoints for server health monitoring
 */

const express = require('express');
const router = express.Router();
const {
  getHealthStatus,
  getDetailedHealth,
} = require('../controllers/health.controller');

/**
 * @route   GET /api/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', getHealthStatus);

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health information
 * @access  Public
 */
router.get('/detailed', getDetailedHealth);

module.exports = router;
