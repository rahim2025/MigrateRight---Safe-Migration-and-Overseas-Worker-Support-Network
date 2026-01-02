const express = require('express');
const router = express.Router();
const {
  getAllGuides,
  getGuideByCountry,
  getRegions,
  getJobTypes,
  searchByJobType,
  getGuidesByRegion,
  compareSalaries,
  createGuide,
  updateGuide,
  deleteGuide,
  restoreGuide,
  updatePopularityRank,
} = require('../controllers/countryGuide.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * Public Routes
 */

// Get all country guides with optional filters
router.get('/', getAllGuides);

// Get metadata endpoints
router.get('/meta/regions', getRegions);
router.get('/meta/job-types', getJobTypes);

// Search and filter endpoints
router.get('/search/job/:jobType', searchByJobType);
router.get('/region/:region', getGuidesByRegion);
router.get('/compare/:jobType', compareSalaries);

// Get specific country guide (must be last to avoid conflicts)
router.get('/:country', getGuideByCountry);

/**
 * Admin Routes
 * Require authentication and admin role (platform_admin or recruitment_admin)
 */

// Create new country guide
router.post(
  '/',
  authenticate,
  authorize('platform_admin', 'recruitment_admin'),
  createGuide
);

// Update country guide
router.put(
  '/:id',
  authenticate,
  authorize('platform_admin', 'recruitment_admin'),
  updateGuide
);

// Delete country guide (soft delete)
router.delete(
  '/:id',
  authenticate,
  authorize('platform_admin'),
  deleteGuide
);

// Restore deleted guide
router.patch(
  '/:id/restore',
  authenticate,
  authorize('platform_admin'),
  restoreGuide
);

// Update popularity rank
router.patch(
  '/:id/rank',
  authenticate,
  authorize('platform_admin', 'recruitment_admin'),
  updatePopularityRank
);

module.exports = router;
