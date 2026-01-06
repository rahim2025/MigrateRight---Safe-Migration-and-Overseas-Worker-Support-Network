/**
 * Agency Routes
 * API endpoints for agency-related operations
 * Demonstrates JWT authentication and role-based access control
 */

const express = require('express');
const router = express.Router();
const {
  getAgencies,
  getAgencyById,
  getTopRatedAgencies,
  getAgenciesByCity,
  getAgencyStats,
  getNearbyAgencies,
} = require('../controllers/agency.controller');
const { authenticate, authorize, requireVerifiedEmail } = require('../middleware/auth.middleware');

// Import review routes
const reviewRoutes = require('./review.routes');

// Use review routes for /api/agencies/:agencyId/reviews
router.use('/:agencyId/reviews', reviewRoutes);

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
 * @route   GET /api/agencies/nearby
 * @desc    Get agencies nearby a location using geospatial search
 * @access  Public
 * @query   latitude - Latitude of the location
 * @query   longitude - Longitude of the location
 * @query   maxDistance - Maximum distance in kilometers (default: 50)
 * @query   limit - Maximum number of results (default: 20)
 */
router.get('/nearby', getNearbyAgencies);

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

// ==================== PROTECTED ROUTES ====================
// All routes below require authentication

/**
 * @route   POST /api/agencies
 * @desc    Create a new recruitment agency (Admin only)
 * @access  Private - platform_admin only
 */
// Example: router.post('/', authenticate, authorize('platform_admin'), createAgency);

/**
 * @route   PUT /api/agencies/:id
 * @desc    Update agency details (Agency admin or platform admin)
 * @access  Private - recruitment_admin, platform_admin
 */
// Example: router.put('/:id', authenticate, authorize('recruitment_admin', 'platform_admin'), updateAgency);

/**
 * @route   DELETE /api/agencies/:id
 * @desc    Delete/deactivate agency (Platform admin only)
 * @access  Private - platform_admin only
 */
// Example: router.delete('/:id', authenticate, authorize('platform_admin'), deleteAgency);

/**
 * @route   POST /api/agencies/:id/reviews
 * @desc    Add review to agency (Authenticated users, verified email required)
 * @access  Private - All authenticated users with verified email
 */
// Example: router.post('/:id/reviews', authenticate, requireVerifiedEmail, addAgencyReview);

/**
 * @route   POST /api/agencies/:id/favorite
 * @desc    Add agency to favorites (Authenticated users)
 * @access  Private - All authenticated users
 */
// Example: router.post('/:id/favorite', authenticate, addToFavorites);

/**
 * @route   GET /api/agencies/my/managed
 * @desc    Get agencies managed by current user
 * @access  Private - recruitment_admin
 */
// Example: router.get('/my/managed', authenticate, authorize('recruitment_admin'), getManagedAgencies);

module.exports = router;
