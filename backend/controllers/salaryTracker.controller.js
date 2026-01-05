/**
 * Salary Tracker Controller
 * Handles salary tracking operations including wage mismatch detection
 */

const SalaryTracker = require('../models/SalaryTracker.model');
const User = require('../models/User');
const fileUploadService = require('../services/fileUpload.service');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');
const logger = require('../utils/logger');

// ==================== CREATE OPERATIONS ====================

/**
 * Create a new salary record
 * @route POST /api/salary-tracker
 */
exports.createSalaryRecord = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const {
      employmentId,
      employerName,
      employerCountry,
      position,
      promisedSalary,
      receivedSalary,
      currency,
      paymentPeriod,
      paymentDate,
      deductions,
      notes,
    } = req.body;

    // Validate required fields
    if (!employmentId || !employerName || !employerCountry || !promisedSalary || receivedSalary === undefined || !paymentDate) {
      throw new BadRequestError('Missing required fields: employmentId, employerName, employerCountry, promisedSalary, receivedSalary, paymentDate');
    }

    // Validate salary values
    if (isNaN(promisedSalary) || isNaN(receivedSalary)) {
      throw new BadRequestError('Salary values must be numbers');
    }

    if (promisedSalary < 0 || receivedSalary < 0) {
      throw new BadRequestError('Salary values must be positive');
    }

    // Create salary tracker record
    const salaryTracker = new SalaryTracker({
      userId,
      employmentId,
      employerName: employerName.trim(),
      employerCountry: employerCountry.trim(),
      position: position ? position.trim() : undefined,
      promisedSalary: parseFloat(promisedSalary),
      receivedSalary: parseFloat(receivedSalary),
      currency: (currency || 'USD').toUpperCase(),
      paymentPeriod: paymentPeriod || 'monthly',
      paymentDate: new Date(paymentDate),
      deductions: deductions || {},
      notes: notes ? notes.trim() : undefined,
    });

    // Save record (pre-save middleware will calculate discrepancy)
    await salaryTracker.save();

    logger.info(`Salary record created: ${salaryTracker._id}`);

    res.status(201).json({
      success: true,
      message: 'Salary record created successfully',
      data: salaryTracker,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== READ OPERATIONS ====================

/**
 * Get all salary records for the current user
 * @route GET /api/salary-tracker
 */
exports.getSalaryRecords = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10, sort = '-paymentDate' } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    let query = { userId };
    if (status) {
      query.status = status;
    }

    // Get records
    const records = await SalaryTracker.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await SalaryTracker.countDocuments(query);

    res.json({
      success: true,
      data: records,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        recordsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single salary record by ID
 * @route GET /api/salary-tracker/:id
 */
exports.getSalaryRecordById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const record = await SalaryTracker.findOne({
      _id: id,
      userId,
    }).populate('userId', 'fullName email phoneNumber');

    if (!record) {
      throw new NotFoundError('Salary record not found');
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
 * Get salary summary for user (date range)
 * @route GET /api/salary-tracker/summary
 */
exports.getSalarySummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new BadRequestError('startDate and endDate are required');
    }

    const records = await SalaryTracker.find({
      userId,
      paymentDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    });

    if (records.length === 0) {
      return res.json({
        success: true,
        message: 'No records found for the specified period',
        data: {
          totalPromised: 0,
          totalReceived: 0,
          totalShortfall: 0,
          recordCount: 0,
          mismatchCount: 0,
          averageDiscrepancyPercentage: 0,
          records: [],
        },
      });
    }

    // Calculate summary
    const summary = {
      totalPromised: 0,
      totalReceived: 0,
      totalShortfall: 0,
      totalDeductions: 0,
      recordCount: records.length,
      mismatchCount: 0,
      averageDiscrepancyPercentage: 0,
      statusBreakdown: {
        match: 0,
        minor_mismatch: 0,
        significant_mismatch: 0,
        critical_underpayment: 0,
      },
      records: [],
    };

    records.forEach(record => {
      summary.totalPromised += record.promisedSalary;
      summary.totalReceived += record.receivedSalary;

      const shortfall = Math.max(0, record.promisedSalary - record.receivedSalary);
      summary.totalShortfall += shortfall;

      summary.totalDeductions += record.discrepancy.totalDeductions;

      if (shortfall > 0) {
        summary.mismatchCount += 1;
      }

      summary.statusBreakdown[record.discrepancy.status] += 1;

      summary.records.push({
        _id: record._id,
        employerName: record.employerName,
        paymentDate: record.paymentDate,
        promisedSalary: record.promisedSalary,
        receivedSalary: record.receivedSalary,
        discrepancy: record.discrepancy,
      });
    });

    // Calculate average discrepancy
    if (summary.mismatchCount > 0) {
      const discrepancySum = records.reduce((sum, record) => sum + record.discrepancy.percentage, 0);
      summary.averageDiscrepancyPercentage = Math.round((discrepancySum / summary.mismatchCount) * 100) / 100;
    }

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get salary records with wage mismatches
 * @route GET /api/salary-tracker/mismatches
 */
exports.getSalaryMismatches = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { severity = 'all', limit = 50 } = req.query;

    let query = { userId };

    if (severity !== 'all') {
      if (severity === 'high') {
        query['discrepancy.status'] = { $in: ['significant_mismatch', 'critical_underpayment'] };
      } else if (severity === 'critical') {
        query['discrepancy.status'] = 'critical_underpayment';
      } else {
        query['discrepancy.status'] = severity;
      }
    }

    const records = await SalaryTracker.find(query)
      .sort({ 'discrepancy.percentage': -1, paymentDate: -1 })
      .limit(parseInt(limit))
      .lean();

    // Calculate statistics
    const stats = {
      totalRecords: records.length,
      criticalCount: records.filter(r => r.discrepancy.status === 'critical_underpayment').length,
      significantCount: records.filter(r => r.discrepancy.status === 'significant_mismatch').length,
      minorCount: records.filter(r => r.discrepancy.status === 'minor_mismatch').length,
      totalShortfall: records.reduce((sum, r) => sum + r.discrepancy.amount, 0),
    };

    res.json({
      success: true,
      stats,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE OPERATIONS ====================

/**
 * Update salary record
 * @route PATCH /api/salary-tracker/:id
 */
exports.updateSalaryRecord = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const updates = req.body;

    // Find record and ensure ownership
    const record = await SalaryTracker.findOne({
      _id: id,
      userId,
    });

    if (!record) {
      throw new NotFoundError('Salary record not found');
    }

    // Prevent updating certain fields
    const protectedFields = ['userId', 'createdAt', 'status', 'resolution'];
    protectedFields.forEach(field => delete updates[field]);

    // Validate salary values if being updated
    if (updates.promisedSalary !== undefined) {
      if (isNaN(updates.promisedSalary) || updates.promisedSalary < 0) {
        throw new BadRequestError('Invalid promised salary');
      }
      updates.promisedSalary = parseFloat(updates.promisedSalary);
    }

    if (updates.receivedSalary !== undefined) {
      if (isNaN(updates.receivedSalary) || updates.receivedSalary < 0) {
        throw new BadRequestError('Invalid received salary');
      }
      updates.receivedSalary = parseFloat(updates.receivedSalary);
    }

    // Update record
    Object.assign(record, updates);
    await record.save();

    logger.info(`Salary record updated: ${id}`);

    res.json({
      success: true,
      message: 'Salary record updated successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== PROOF DOCUMENT OPERATIONS ====================

/**
 * Upload proof document for salary record
 * @route POST /api/salary-tracker/:id/upload-proof
 */
exports.uploadProofDocument = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { description, documentType } = req.body;

    if (!req.file) {
      throw new BadRequestError('No file provided');
    }

    // Find record
    const record = await SalaryTracker.findOne({
      _id: id,
      userId,
    });

    if (!record) {
      throw new NotFoundError('Salary record not found');
    }

    // Check document limit
    if (record.proofDocuments.length >= 10) {
      throw new BadRequestError('Maximum 10 documents allowed per salary record');
    }

    // Save file
    const fileMetadata = await fileUploadService.saveFileToUploadDir(req.file);

    // Add document to record
    const document = {
      fileName: fileMetadata.fileName,
      fileType: fileMetadata.fileType,
      mimeType: fileMetadata.mimeType,
      filePath: fileMetadata.filePath,
      fileSize: fileMetadata.fileSize,
      uploadDate: new Date(),
      documentType: documentType || fileMetadata.documentType,
      description: description ? description.trim() : undefined,
    };

    record.addProofDocument(document);
    await record.save();

    logger.info(`Proof document uploaded for record ${id}: ${fileMetadata.fileName}`);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        salaryRecordId: record._id,
        document: record.proofDocuments[record.proofDocuments.length - 1],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete proof document
 * @route DELETE /api/salary-tracker/:id/proof/:docId
 */
exports.deleteProofDocument = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id, docId } = req.params;

    // Find record
    const record = await SalaryTracker.findOne({
      _id: id,
      userId,
    });

    if (!record) {
      throw new NotFoundError('Salary record not found');
    }

    // Find document
    const document = record.proofDocuments.find(doc => doc._id.toString() === docId);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    // Delete file from disk
    await fileUploadService.deleteFile(document.filePath);

    // Remove from record
    record.removeProofDocument(docId);
    await record.save();

    logger.info(`Proof document deleted: ${docId}`);

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get proof documents for a record
 * @route GET /api/salary-tracker/:id/proofs
 */
exports.getProofDocuments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const record = await SalaryTracker.findOne({
      _id: id,
      userId,
    }).select('proofDocuments');

    if (!record) {
      throw new NotFoundError('Salary record not found');
    }

    res.json({
      success: true,
      data: record.proofDocuments,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== STATUS UPDATE OPERATIONS ====================

/**
 * Mark salary record as disputed
 * @route PATCH /api/salary-tracker/:id/dispute
 */
exports.markAsDisputed = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      throw new BadRequestError('Dispute reason is required');
    }

    const record = await SalaryTracker.findOne({
      _id: id,
      userId,
    });

    if (!record) {
      throw new NotFoundError('Salary record not found');
    }

    record.markDisputed(reason);
    await record.save();

    logger.info(`Salary record marked as disputed: ${id}`);

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
 * Archive salary record
 * @route PATCH /api/salary-tracker/:id/archive
 */
exports.archiveRecord = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const record = await SalaryTracker.findOne({
      _id: id,
      userId,
    });

    if (!record) {
      throw new NotFoundError('Salary record not found');
    }

    record.isArchived = true;
    await record.save();

    logger.info(`Salary record archived: ${id}`);

    res.json({
      success: true,
      message: 'Record archived successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ADMIN OPERATIONS ====================

/**
 * Get flagged records for review (Admin only)
 * @route GET /api/salary-tracker/admin/flagged
 */
exports.getFlaggedRecords = async (req, res, next) => {
  try {
    // Check admin role
    if (req.user.role !== 'platform_admin') {
      throw new ForbiddenError('Only administrators can access this resource');
    }

    const { limit = 50 } = req.query;

    const records = await SalaryTracker.find({ flaggedForReview: true })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'fullName email');

    res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete salary record (Admin only - for data management)
 * @route DELETE /api/salary-tracker/:id
 */
exports.deleteSalaryRecord = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Users can only delete their own records (unless they're admin)
    let record;
    if (req.user.role === 'platform_admin') {
      record = await SalaryTracker.findByIdAndDelete(id);
    } else {
      record = await SalaryTracker.findOneAndDelete({
        _id: id,
        userId,
      });
    }

    if (!record) {
      throw new NotFoundError('Salary record not found');
    }

    // Clean up associated files
    for (const doc of record.proofDocuments) {
      try {
        await fileUploadService.deleteFile(doc.filePath);
      } catch (err) {
        logger.warn(`Failed to delete file: ${doc.filePath}`);
      }
    }

    logger.info(`Salary record deleted: ${id}`);

    res.json({
      success: true,
      message: 'Record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
