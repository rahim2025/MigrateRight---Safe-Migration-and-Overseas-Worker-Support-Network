const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salary.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/salary
 * @desc    Create a new salary record
 * @access  Private (authenticated users)
 */
router.post('/', authenticate, salaryController.createSalaryRecord);

/**
 * @route   GET /api/salary
 * @desc    Get all salary records for logged-in user with filters
 * @access  Private
 * @query   status, startDate, endDate, hasDiscrepancy, employerName, limit
 */
router.get('/', authenticate, salaryController.getSalaryRecords);

/**
 * @route   GET /api/salary/stats
 * @desc    Get salary statistics for logged-in user
 * @access  Private
 */
router.get('/stats', authenticate, salaryController.getStatistics);

/**
 * @route   GET /api/salary/discrepancies
 * @desc    Get records with salary discrepancies
 * @access  Private
 * @query   minPercentage (optional, default 5)
 */
router.get('/discrepancies', authenticate, salaryController.getDiscrepancies);

/**
 * @route   GET /api/salary/reports/discrepancy
 * @desc    Get detailed discrepancy report
 * @access  Private
 */
router.get('/reports/discrepancy', authenticate, salaryController.getDiscrepancyReport);

/**
 * @route   GET /api/salary/recent
 * @desc    Get recent salary records
 * @access  Private
 * @query   limit (optional, default 10)
 */
router.get('/recent', authenticate, salaryController.getRecentRecords);

/**
 * @route   GET /api/salary/admin/disputed
 * @desc    Get all disputed records (Admin only)
 * @access  Admin
 */
router.get('/admin/disputed', authenticate, salaryController.getAllDisputed);

/**
 * @route   GET /api/salary/:id
 * @desc    Get a single salary record
 * @access  Private (owner or admin)
 */
router.get('/:id', authenticate, salaryController.getSalaryRecord);

/**
 * @route   PATCH /api/salary/:id
 * @desc    Update a salary record
 * @access  Private (owner or admin)
 */
router.patch('/:id', authenticate, salaryController.updateSalaryRecord);

/**
 * @route   DELETE /api/salary/:id
 * @desc    Delete a salary record
 * @access  Private (owner or admin)
 */
router.delete('/:id', authenticate, salaryController.deleteSalaryRecord);

/**
 * @route   POST /api/salary/:id/proof
 * @desc    Upload proof document for salary record
 * @access  Private (owner)
 */
router.post('/:id/proof', authenticate, salaryController.uploadProof);

/**
 * @route   DELETE /api/salary/:id/proof/:documentId
 * @desc    Remove proof document from salary record
 * @access  Private (owner)
 */
router.delete('/:id/proof/:documentId', authenticate, salaryController.removeProof);

/**
 * @route   POST /api/salary/:id/dispute
 * @desc    Mark salary record as disputed
 * @access  Private (owner)
 */
router.post('/:id/dispute', authenticate, salaryController.markAsDisputed);

/**
 * @route   POST /api/salary/:id/resolve
 * @desc    Resolve disputed salary record
 * @access  Admin
 */
router.post('/:id/resolve', authenticate, salaryController.resolveDispute);

module.exports = router;
