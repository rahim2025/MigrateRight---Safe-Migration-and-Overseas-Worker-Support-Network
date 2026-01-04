/**
 * Salary Controller
 * Handles salary tracking operations for overseas workers
 */

const SalaryRecord = require('../models/SalaryRecord.model');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Create a new salary record
 * @route POST /api/salary
 */
exports.createSalaryRecord = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const {
      employerName,
      employerCountry,
      contractSalary,
      receivedSalary,
      currency,
      paymentDate,
      paymentPeriod,
      workType,
      notes,
      deductions,
    } = req.body;

    // Validate required fields
    if (!employerName || !contractSalary || receivedSalary === undefined || !paymentDate) {
      throw new BadRequestError('Missing required fields');
    }

    // Create salary record
    const salaryRecord = await SalaryRecord.create({
      userId,
      employerName,
      employerCountry,
      contractSalary: parseFloat(contractSalary),
      receivedSalary: parseFloat(receivedSalary),
      currency: currency || 'USD',
      paymentDate,
      paymentPeriod: paymentPeriod || 'monthly',
      workType,
      notes,
      deductions: deductions || {},
      createdBy: userId,
    });

    logger.info(`Salary record created: ${salaryRecord._id} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Salary record created successfully',
      data: salaryRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all salary records for logged-in user
 * @route GET /api/salary
 */
exports.getSalaryRecords = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status, startDate, endDate, hasDiscrepancy, employerName, limit } = req.query;

    const filters = {
      status,
      startDate,
      endDate,
      hasDiscrepancy: hasDiscrepancy === 'true',
      employerName,
      limit: limit ? parseInt(limit) : 50,
    };

    const records = await SalaryRecord.getUserRecords(userId, filters);

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single salary record
 * @route GET /api/salary/:id
 */
exports.getSalaryRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const record = await SalaryRecord.findById(id);

    if (!record) {
      throw new NotFoundError('Salary record not found');
    }

    // Check ownership (or admin)
    if (record.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      throw new ForbiddenError('You do not have permission to view this record');
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a salary record
 * @route PATCH /api/salary/:id
 */
exports.updateSalaryRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const record = await SalaryRecord.findById(id);

    if (!record) {
      throw new NotFoundError('Salary record not found');
    }

    // Check ownership
    if (record.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      throw new ForbiddenError('You do not have permission to update this record');
    }

    const allowedUpdates = [
      'employerName',
      'employerCountry',
      'contractSalary',
      'receivedSalary',
      'currency',
      'paymentDate',
      'paymentPeriod',
      'workType',
      'notes',
      'deductions',
      'status',
    ];

    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Apply updates
    Object.assign(record, updates);
    record.updatedBy = userId;

    await record.save();

    logger.info(`Salary record updated: ${record._id} by user ${userId}`);

    res.json({
      success: true,
      message: 'Salary record updated successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a salary record
 * @route DELETE /api/salary/:id
 */
exports.deleteSalaryRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const record = await SalaryRecord.findById(id);

    if (!record) {
      throw new NotFoundError('Salary record not found');
    }

    // Check ownership
    if (record.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      throw new ForbiddenError('You do not have permission to delete this record');
    }

    await record.deleteOne();

    logger.info(`Salary record deleted: ${id} by user ${userId}`);

    res.json({
      success: true,
      message: 'Salary record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload proof document (placeholder - requires file upload middleware)
 * @route POST /api/salary/:id/proof
 */
exports.uploadProof = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const record = await SalaryRecord.findById(id);

    if (!record) {
      throw new NotFoundError('Salary record not found');
    }

    // Check ownership
    if (record.userId.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to upload proof for this record');
    }

    // In a real implementation, this would handle file upload
    // For now, we'll accept file data in request body
    const { fileName, fileUrl, fileType, fileSize } = req.body;

    if (!fileName || !fileUrl || !fileType) {
      throw new BadRequestError('Missing file information');
    }

    await record.addProofDocument({
      fileName,
      fileUrl,
      fileType,
      fileSize: fileSize || 0,
    });

    logger.info(`Proof document uploaded for salary record: ${id}`);

    res.json({
      success: true,
      message: 'Proof document uploaded successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove proof document
 * @route DELETE /api/salary/:id/proof/:documentId
 */
exports.removeProof = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;
    const userId = req.user._id;

    const record = await SalaryRecord.findById(id);

    if (!record) {
      throw new NotFoundError('Salary record not found');
    }

    // Check ownership
    if (record.userId.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to remove proof from this record');
    }

    await record.removeProofDocument(documentId);

    logger.info(`Proof document removed from salary record: ${id}, document: ${documentId}`);

    res.json({
      success: true,
      message: 'Proof document removed successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get salary statistics
 * @route GET /api/salary/stats
 */
exports.getStatistics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const stats = await SalaryRecord.getUserStatistics(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get records with discrepancies
 * @route GET /api/salary/discrepancies
 */
exports.getDiscrepancies = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { minPercentage } = req.query;

    const records = await SalaryRecord.getDiscrepancyRecords(
      userId,
      minPercentage ? parseFloat(minPercentage) : 5
    );

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark record as disputed
 * @route POST /api/salary/:id/dispute
 */
exports.markAsDisputed = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    if (!reason) {
      throw new BadRequestError('Dispute reason is required');
    }

    const record = await SalaryRecord.findById(id);

    if (!record) {
      throw new NotFoundError('Salary record not found');
    }

    // Check ownership
    if (record.userId.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to dispute this record');
    }

    await record.markAsDisputed(reason);

    logger.info(`Salary record disputed: ${id} by user ${userId}`);

    res.json({
      success: true,
      message: 'Record marked as disputed',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve dispute (Admin only)
 * @route POST /api/salary/:id/resolve
 */
exports.resolveDispute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;

    if (!resolution) {
      throw new BadRequestError('Resolution details are required');
    }

    const record = await SalaryRecord.findById(id);

    if (!record) {
      throw new NotFoundError('Salary record not found');
    }

    if (!record.isDisputed) {
      throw new BadRequestError('This record is not disputed');
    }

    await record.resolveDispute(resolution);

    logger.info(`Dispute resolved for salary record: ${id} by admin ${req.user._id}`);

    res.json({
      success: true,
      message: 'Dispute resolved successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all disputed records (Admin only)
 * @route GET /api/salary/admin/disputed
 */
exports.getAllDisputed = async (req, res, next) => {
  try {
    const records = await SalaryRecord.getDisputedRecords();

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get discrepancy report
 * @route GET /api/salary/reports/discrepancy
 */
exports.getDiscrepancyReport = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const records = await SalaryRecord.getUserRecords(userId, {
      hasDiscrepancy: true,
    });

    // Calculate summary
    const totalExpected = SalaryRecord.calculateTotalExpected(records);
    const totalReceived = SalaryRecord.calculateTotalReceived(records);
    const totalDiscrepancy = totalExpected - totalReceived;

    const bySeverity = {
      critical: records.filter((r) => r.discrepancySeverity === 'critical').length,
      high: records.filter((r) => r.discrepancySeverity === 'high').length,
      medium: records.filter((r) => r.discrepancySeverity === 'medium').length,
      low: records.filter((r) => r.discrepancySeverity === 'low').length,
    };

    res.json({
      success: true,
      data: {
        summary: {
          totalRecords: records.length,
          totalExpected,
          totalReceived,
          totalDiscrepancy,
          averageDiscrepancyPercentage:
            records.reduce((sum, r) => sum + Math.abs(r.discrepancyPercentage), 0) /
            (records.length || 1),
        },
        bySeverity,
        records,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent records
 * @route GET /api/salary/recent
 */
exports.getRecentRecords = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { limit } = req.query;

    const records = await SalaryRecord.getRecentRecords(userId, limit ? parseInt(limit) : 10);

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};
