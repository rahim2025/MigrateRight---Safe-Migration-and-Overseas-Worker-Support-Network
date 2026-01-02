/**
 * Migration Cost Calculator Controller
 * Handles fee calculation, comparison, and warning generation
 */

const { asyncHandler } = require('../middleware/error.middleware');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const MigrationFeeRule = require('../models/MigrationFeeRule');
const logger = require('../utils/logger');

/**
 * @desc    Get all available destination countries
 * @route   GET /api/calculator/countries
 * @access  Public
 */
const getAvailableCountries = asyncHandler(async (req, res) => {
  const countries = await MigrationFeeRule.distinct('destinationCountry', { isActive: true });
  
  res.status(200).json({
    success: true,
    data: {
      countries: countries.sort(),
      count: countries.length
    }
  });
});

/**
 * @desc    Get available job types for a specific country
 * @route   GET /api/calculator/countries/:country/jobs
 * @access  Public
 */
const getJobTypesByCountry = asyncHandler(async (req, res) => {
  const { country } = req.params;

  const jobTypes = await MigrationFeeRule.distinct('jobType', {
    destinationCountry: country,
    isActive: true
  });

  if (jobTypes.length === 0) {
    throw new NotFoundError(`No fee rules found for ${country}`);
  }

  res.status(200).json({
    success: true,
    data: {
      country,
      jobTypes: jobTypes.sort(),
      count: jobTypes.length
    }
  });
});

/**
 * @desc    Get fee rule for specific country and job type
 * @route   GET /api/calculator/fee-rules
 * @query   country, jobType
 * @access  Public
 */
const getFeeRule = asyncHandler(async (req, res) => {
  const { country, jobType } = req.query;

  if (!country || !jobType) {
    throw new BadRequestError('Country and job type are required');
  }

  const feeRule = await MigrationFeeRule.findOne({
    destinationCountry: country,
    jobType: jobType,
    isActive: true
  });

  if (!feeRule) {
    throw new NotFoundError(`No fee rules found for ${jobType} jobs in ${country}`);
  }

  res.status(200).json({
    success: true,
    data: {
      feeRule: {
        destinationCountry: feeRule.destinationCountry,
        jobType: feeRule.jobType,
        fees: feeRule.fees,
        legalReference: feeRule.legalReference,
        costBreakdown: feeRule.getCostBreakdown(),
        commonScams: feeRule.commonScams,
        notes: feeRule.notes
      }
    }
  });
});

/**
 * @desc    Calculate migration cost and compare with user's fee
 * @route   POST /api/calculator/calculate
 * @access  Public
 */
const calculateMigrationCost = asyncHandler(async (req, res) => {
  const { destinationCountry, jobType, agencyFee, additionalCosts = {} } = req.body;

  // Validation
  if (!destinationCountry || !jobType || agencyFee === undefined) {
    throw new BadRequestError('Destination country, job type, and agency fee are required');
  }

  if (typeof agencyFee !== 'number' || agencyFee < 0) {
    throw new BadRequestError('Agency fee must be a positive number');
  }

  // Find fee rule
  const feeRule = await MigrationFeeRule.findOne({
    destinationCountry,
    jobType,
    isActive: true
  });

  if (!feeRule) {
    throw new NotFoundError(
      `No fee rules found for ${jobType} jobs in ${destinationCountry}. ` +
      `This may be a new destination or job type not yet regulated.`
    );
  }

  // Compare user's agency fee with legal range
  const feeComparison = feeRule.compareFee(agencyFee);

  // Calculate total estimated cost
  const userTotalCosts = {
    agencyFee,
    governmentFees: feeRule.totalGovernmentFees,
    airfare: additionalCosts.airfare || 0,
    documentation: additionalCosts.documentation || feeRule.fees.estimatedCosts.documentation.amount,
    insurance: additionalCosts.insurance || feeRule.fees.estimatedCosts.insurance.amount,
    other: additionalCosts.other || 0
  };

  const userTotalCost = Object.values(userTotalCosts).reduce((sum, cost) => sum + cost, 0);

  // Get legal cost breakdown
  const legalCostBreakdown = feeRule.getCostBreakdown();

  // Log calculation for monitoring
  logger.info('Migration cost calculated', {
    destinationCountry,
    jobType,
    agencyFee,
    userTotalCost,
    warningLevel: feeComparison.warnings[0]?.level
  });

  res.status(200).json({
    success: true,
    data: {
      calculation: {
        destinationCountry,
        jobType,
        userInputs: {
          agencyFee,
          additionalCosts: userTotalCosts
        },
        totalUserCost: userTotalCost
      },
      legalFeeRange: {
        agencyFee: {
          min: feeRule.fees.recruitmentFee.min,
          max: feeRule.fees.recruitmentFee.max,
          currency: feeRule.fees.recruitmentFee.currency
        },
        totalCost: {
          min: legalCostBreakdown.totalCost.minimum,
          max: legalCostBreakdown.totalCost.maximum,
          currency: 'BDT'
        }
      },
      comparison: feeComparison,
      breakdown: legalCostBreakdown,
      warnings: feeComparison.warnings,
      recommendations: {
        verifyAgency: true,
        getWrittenAgreement: true,
        checkBMETLicense: true,
        reportSuspiciousFees: feeComparison.warnings.some(w => w.level === 'severe'),
        additionalAdvice: generateAdvice(feeComparison, feeRule)
      },
      resources: {
        bmetWebsite: 'https://www.old.bmet.gov.bd',
        complaintPortal: 'https://www.old.bmet.gov.bd/BMET/complaintAction',
        verifyAgency: 'https://www.old.bmet.gov.bd/BMET/agencyList',
        helpline: '16106 (BMET Hotline)'
      }
    }
  });
});

/**
 * @desc    Get all fee rules (Admin only)
 * @route   GET /api/calculator/fee-rules/all
 * @access  Private (Admin)
 */
const getAllFeeRules = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, country, jobType, isActive } = req.query;

  const query = {};
  if (country) query.destinationCountry = country;
  if (jobType) query.jobType = jobType;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const skip = (page - 1) * limit;

  const [feeRules, total] = await Promise.all([
    MigrationFeeRule.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ destinationCountry: 1, jobType: 1 }),
    MigrationFeeRule.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: {
      feeRules,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

/**
 * @desc    Create new fee rule (Admin only)
 * @route   POST /api/calculator/fee-rules
 * @access  Private (Admin)
 */
const createFeeRule = asyncHandler(async (req, res) => {
  const feeRuleData = {
    ...req.body,
    createdBy: req.user._id
  };

  const feeRule = await MigrationFeeRule.create(feeRuleData);

  logger.info('Fee rule created', {
    feeRuleId: feeRule._id,
    country: feeRule.destinationCountry,
    jobType: feeRule.jobType,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Fee rule created successfully',
    data: { feeRule }
  });
});

/**
 * @desc    Update fee rule (Admin only)
 * @route   PUT /api/calculator/fee-rules/:id
 * @access  Private (Admin)
 */
const updateFeeRule = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const feeRule = await MigrationFeeRule.findById(id);
  if (!feeRule) {
    throw new NotFoundError('Fee rule not found');
  }

  Object.assign(feeRule, req.body);
  feeRule.updatedBy = req.user._id;
  await feeRule.save();

  logger.info('Fee rule updated', {
    feeRuleId: feeRule._id,
    country: feeRule.destinationCountry,
    jobType: feeRule.jobType,
    updatedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'Fee rule updated successfully',
    data: { feeRule }
  });
});

/**
 * @desc    Delete fee rule (Admin only)
 * @route   DELETE /api/calculator/fee-rules/:id
 * @access  Private (Admin)
 */
const deleteFeeRule = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const feeRule = await MigrationFeeRule.findById(id);
  if (!feeRule) {
    throw new NotFoundError('Fee rule not found');
  }

  await feeRule.deleteOne();

  logger.info('Fee rule deleted', {
    feeRuleId: id,
    country: feeRule.destinationCountry,
    jobType: feeRule.jobType,
    deletedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'Fee rule deleted successfully'
  });
});

// ==================== Helper Functions ====================

/**
 * Generate additional advice based on comparison results
 * @param {Object} comparison - Fee comparison results
 * @param {Object} feeRule - Fee rule object
 * @returns {Array} - Array of advice strings
 */
function generateAdvice(comparison, feeRule) {
  const advice = [];

  if (comparison.isWithinLegalRange) {
    advice.push('The quoted fee is within legal limits, but always verify the agency is BMET-licensed.');
    advice.push('Request a detailed written breakdown of all costs before making any payment.');
  } else if (comparison.userFee > comparison.legalRange.max) {
    advice.push('DO NOT pay this amount without verification. Contact BMET immediately.');
    advice.push('Ask the agency to justify why their fee exceeds the legal maximum.');
    advice.push('Consider reporting this agency if they refuse to lower the fee.');
  } else if (comparison.userFee < comparison.legalRange.min) {
    advice.push('Be very cautious of fees significantly below the legal minimum.');
    advice.push('There may be hidden costs or this could be a scam.');
    advice.push('Ask for a complete written cost breakdown including all fees.');
  }

  if (feeRule.commonScams && feeRule.commonScams.length > 0) {
    advice.push(`Common scams for ${feeRule.destinationCountry}: Be aware of agencies promising guaranteed jobs or asking for extra "processing fees".`);
  }

  advice.push('Never pay cash without a proper receipt.');
  advice.push('Keep all documents and receipts safe.');
  advice.push('Verify the job offer letter is genuine before making any payments.');

  return advice;
}

module.exports = {
  getAvailableCountries,
  getJobTypesByCountry,
  getFeeRule,
  calculateMigrationCost,
  getAllFeeRules,
  createFeeRule,
  updateFeeRule,
  deleteFeeRule
};
