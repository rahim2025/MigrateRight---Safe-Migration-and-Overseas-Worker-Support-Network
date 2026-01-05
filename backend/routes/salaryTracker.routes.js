/**
 * Salary Tracker Routes
 * REST API endpoints for salary tracking and wage mismatch detection
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const salaryTrackerController = require('../controllers/salaryTracker.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validation.middleware');

// ==================== Multer Configuration ====================
// Use memory storage for multer - files will be processed directly
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`), false);
    }
  },
});

// ==================== Middleware ====================
// All routes require authentication
router.use(authenticate);

// ==================== CREATE OPERATIONS ====================

/**
 * POST /api/salary-tracker
 * Create a new salary record
 * Body: {
 *   employmentId: string (required),
 *   employerName: string (required),
 *   employerCountry: string (required),
 *   position: string (optional),
 *   promisedSalary: number (required),
 *   receivedSalary: number (required),
 *   currency: string (optional, default: USD),
 *   paymentPeriod: string (optional, default: monthly),
 *   paymentDate: date (required),
 *   deductions: object (optional),
 *   notes: string (optional)
 * }
 */
router.post('/', validateRequest, salaryTrackerController.createSalaryRecord);

// ==================== READ OPERATIONS ====================

/**
 * GET /api/salary-tracker
 * Get all salary records for the current user
 * Query: status, page, limit, sort
 */
router.get('/', salaryTrackerController.getSalaryRecords);

/**
 * GET /api/salary-tracker/summary
 * Get salary summary for a date range
 * Query: startDate (required), endDate (required)
 */
router.get('/summary', salaryTrackerController.getSalarySummary);

/**
 * GET /api/salary-tracker/mismatches
 * Get salary records with wage mismatches
 * Query: severity (all|high|critical), limit
 */
router.get('/mismatches', salaryTrackerController.getSalaryMismatches);

/**
 * GET /api/salary-tracker/:id
 * Get single salary record by ID
 */
router.get('/:id', salaryTrackerController.getSalaryRecordById);

// ==================== UPDATE OPERATIONS ====================

/**
 * PATCH /api/salary-tracker/:id
 * Update salary record
 * Body: {
 *   promisedSalary: number,
 *   receivedSalary: number,
 *   deductions: object,
 *   notes: string
 * }
 */
router.patch('/:id', validateRequest, salaryTrackerController.updateSalaryRecord);

// ==================== PROOF DOCUMENT OPERATIONS ====================

/**
 * POST /api/salary-tracker/:id/upload-proof
 * Upload proof document (image/pdf) for a salary record
 * Multipart form data:
 *   - file: binary file (required)
 *   - documentType: string (optional: payslip|bank_statement|contract|receipt|photo_evidence|other)
 *   - description: string (optional)
 */
router.post('/:id/upload-proof', upload.single('file'), salaryTrackerController.uploadProofDocument);

/**
 * GET /api/salary-tracker/:id/proofs
 * Get all proof documents for a salary record
 */
router.get('/:id/proofs', salaryTrackerController.getProofDocuments);

/**
 * DELETE /api/salary-tracker/:id/proof/:docId
 * Delete a proof document
 */
router.delete('/:id/proof/:docId', salaryTrackerController.deleteProofDocument);

// ==================== STATUS UPDATE OPERATIONS ====================

/**
 * PATCH /api/salary-tracker/:id/dispute
 * Mark salary record as disputed
 * Body: {
 *   reason: string (required)
 * }
 */
router.patch('/:id/dispute', validateRequest, salaryTrackerController.markAsDisputed);

/**
 * PATCH /api/salary-tracker/:id/archive
 * Archive a salary record
 */
router.patch('/:id/archive', salaryTrackerController.archiveRecord);

// ==================== ADMIN OPERATIONS ====================

/**
 * GET /api/salary-tracker/admin/flagged
 * Get flagged records for review (Admin only)
 * Query: limit
 */
router.get('/admin/flagged', salaryTrackerController.getFlaggedRecords);

/**
 * DELETE /api/salary-tracker/:id
 * Delete salary record
 * Users can delete their own records, admins can delete any record
 */
router.delete('/:id', salaryTrackerController.deleteSalaryRecord);

// ==================== Error Handling ====================
router.use((err, req, res, next) => {
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size exceeds maximum limit of 5MB',
    });
  }
  next(err);
});

module.exports = router;
