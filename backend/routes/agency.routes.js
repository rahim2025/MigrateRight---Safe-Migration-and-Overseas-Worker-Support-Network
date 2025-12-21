/**
 * Agency Routes
 * API endpoints for agency-related operations
 */

const express = require('express');
const router = express.Router();
const {
  getAgencies,
  getAgencyById,
  getTopRatedAgencies,
  getAgenciesByCity,
  getAgencyStats,
} = require('../controllers/agency.controller');

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/agencies
 * @desc    Get all verified agencies with filtering and pagination
 * @access  Public
 * @query   page - Page number (default: 1)
 * @query   limit - Results per page (default: 20)
 * @query   city - Filter by city
 * @query   country - Filter by country
 * @query   minRating - Minimum rating filter
 * @query   search - Text search in name and description
 * @query   sortBy - Field to sort by (default: createdAt)
 * @query   order - Sort order: asc or desc (default: desc)
 */
router.get('/', getAgencies);

/**
 * @route   GET /api/agencies/stats
 * @desc    Get agency statistics
 * @access  Public
 */
router.get('/stats', getAgencyStats);

/**
 * @route   GET /api/agencies/top-rated
 * @desc    Get top-rated agencies
 * @access  Public
 * @query   limit - Number of agencies to return (default: 10)
 */
router.get('/top-rated', getTopRatedAgencies);

/**
 * @route   GET /api/agencies/city/:city
 * @desc    Get agencies by city
 * @access  Public
 * @param   city - City name
 */
router.get('/city/:city', getAgenciesByCity);

/**
 * @route   GET /api/agencies/:id
 * @desc    Get single agency by ID
 * @access  Public
 * @param   id - Agency ID (MongoDB ObjectId)
 */
router.get('/:id', getAgencyById);

module.exports = router;
