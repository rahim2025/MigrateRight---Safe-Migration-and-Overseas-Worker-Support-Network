/**
 * Migration Cost Calculator Routes
 * API endpoints for fee calculation and comparison
 */

const express = require('express');
const router = express.Router();
const {
  getAvailableCountries,
  getJobTypesByCountry,
  getFeeRule,
  calculateMigrationCost,
  getAllFeeRules,
  createFeeRule,
  updateFeeRule,
  deleteFeeRule,
  getLegalFees,
  compareFees
} = require('../controllers/calculator.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/calculator/countries
 * @desc    Get list of all available destination countries
 * @access  Public
 */
router.get('/countries', getAvailableCountries);

/**
 * @route   GET /api/calculator/countries/:country/jobs
 * @desc    Get available job types for a specific country
 * @access  Public
 * @param   country - Destination country name
 */
router.get('/countries/:country/jobs', getJobTypesByCountry);

/**
 * @route   GET /api/calculator/fee-rules
 * @desc    Get fee rule for specific country and job type
 * @access  Public
 * @query   country - Destination country
 * @query   jobType - Job type
 */
router.get('/fee-rules', getFeeRule);

/**
 * @route   POST /api/calculator/calculate
 * @desc    Calculate migration cost and compare with legal fees
 * @access  Public
 * @body    {
 *            destinationCountry: String,
 *            jobType: String,
 *            agencyFee: Number,
 *            additionalCosts: {
 *              airfare: Number (optional),
 *              documentation: Number (optional),
 *              insurance: Number (optional),
 *              other: Number (optional)
 *            }
 *          }
 */
router.post('/calculate', calculateMigrationCost);

/**
 * @route   POST /api/calculator/fees
 * @desc    Get legal fees for destination, service type, and worker category
 * @access  Public
 * @body    {
 *            destinationCountry: String,
 *            serviceType: String (visa, work_permit, full_package),
 *            workerCategory: String (domestic, construction, healthcare, etc.)
 *          }
 */
router.post('/fees', getLegalFees);

/**
 * @route   POST /api/calculator/fees/compare
 * @desc    Compare actual fees with legal fees
 * @access  Public
 * @body    {
 *            destinationCountry: String,
 *            serviceType: String,
 *            workerCategory: String,
 *            actualFees: {
 *              visaApplicationFee: Number,
 *              medicalTestsFee: Number,
 *              documentProcessingFee: Number,
 *              trainingFee: Number,
 *              hiddenCharges: Number (optional)
 *            },
 *            paymentTerms: {
 *              upfrontPercentage: Number (optional),
 *              requiresDebtBondage: Boolean (optional)
 *            }
 *          }
 */
router.post('/fees/compare', compareFees);

// ==================== ADMIN ROUTES ====================
// All routes below require authentication and platform_admin role

/**
 * @route   GET /api/calculator/fee-rules/all
 * @desc    Get all fee rules with pagination (Admin only)
 * @access  Private (platform_admin)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 20)
 * @query   country - Filter by country (optional)
 * @query   jobType - Filter by job type (optional)
 * @query   isActive - Filter by active status (optional)
 */
router.get('/fee-rules/all', 
  authenticate, 
  authorize('platform_admin'), 
  getAllFeeRules
);

/**
 * @route   POST /api/calculator/fee-rules
 * @desc    Create new fee rule (Admin only)
 * @access  Private (platform_admin)
 */
router.post('/fee-rules', 
  authenticate, 
  authorize('platform_admin'), 
  createFeeRule
);

/**
 * @route   PUT /api/calculator/fee-rules/:id
 * @desc    Update fee rule (Admin only)
 * @access  Private (platform_admin)
 * @param   id - Fee rule ID
 */
router.put('/fee-rules/:id', 
  authenticate, 
  authorize('platform_admin'), 
  updateFeeRule
);

/**
 * @route   DELETE /api/calculator/fee-rules/:id
 * @desc    Delete fee rule (Admin only)
 * @access  Private (platform_admin)
 * @param   id - Fee rule ID
 */
router.delete('/fee-rules/:id', 
  authenticate, 
  authorize('platform_admin'), 
  deleteFeeRule
);

module.exports = router;
