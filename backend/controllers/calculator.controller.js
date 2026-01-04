/**
 * Migration Cost Calculator Controller
 * Handles fee calculation, comparison, and warning generation
 */

const { asyncHandler } = require('../middleware/error.middleware');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const MigrationFeeRule = require('../models/MigrationFeeRule');
const logger = require('../utils/logger');

/**
 * Country information mapping
 * Maps country codes to full country objects with name, flag, and currency
 */
const COUNTRY_INFO = {
  'SA': { name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR' },
  'AE': { name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED' },
  'QA': { name: 'Qatar', flag: '🇶🇦', currency: 'QAR' },
  'KW': { name: 'Kuwait', flag: '🇰🇼', currency: 'KWD' },
  'OM': { name: 'Oman', flag: '🇴🇲', currency: 'OMR' },
  'BH': { name: 'Bahrain', flag: '🇧🇭', currency: 'BHD' },
  'MY': { name: 'Malaysia', flag: '🇲🇾', currency: 'MYR' },
  'SG': { name: 'Singapore', flag: '🇸🇬', currency: 'SGD' },
  'BN': { name: 'Brunei', flag: '🇧🇳', currency: 'BND' },
  'KR': { name: 'South Korea', flag: '🇰🇷', currency: 'KRW' },
  'JP': { name: 'Japan', flag: '🇯🇵', currency: 'JPY' },
  'GB': { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
  'US': { name: 'United States', flag: '🇺🇸', currency: 'USD' },
  'CA': { name: 'Canada', flag: '🇨🇦', currency: 'CAD' },
  'AU': { name: 'Australia', flag: '🇦🇺', currency: 'AUD' },
  'NZ': { name: 'New Zealand', flag: '🇳🇿', currency: 'NZD' },
  'IT': { name: 'Italy', flag: '🇮🇹', currency: 'EUR' },
  'GR': { name: 'Greece', flag: '🇬🇷', currency: 'EUR' },
  'IE': { name: 'Ireland', flag: '🇮🇪', currency: 'EUR' },
  'BD': { name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT' }
};

/**
 * Format country codes into full country objects
 * @param {Array<string>} countryCodes - Array of country codes
 * @returns {Array<Object>} Array of country objects
 */
const formatCountries = (countryCodes) => {
  return countryCodes
    .map(code => {
      const info = COUNTRY_INFO[code];
      if (info) {
        return {
          code,
          name: info.name,
          flag: info.flag,
          currency: info.currency
        };
      }
      // Fallback for unknown countries
      return {
        code,
        name: code,
        flag: '🌍',
        currency: 'USD'
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * @desc    Get all available destination countries
 * @route   GET /api/calculator/countries
 * @access  Public
 */
const getAvailableCountries = asyncHandler(async (req, res) => {
  const countryCodes = await MigrationFeeRule.distinct('destinationCountry', { isActive: true });
  const countries = formatCountries(countryCodes);
  
  res.status(200).json({
    success: true,
    data: {
      countries,
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

/**
 * @desc    Get legal fees for a specific destination, service type, and worker category
 * @route   POST /api/calculator/fees
 * @access  Public
 */
const getLegalFees = asyncHandler(async (req, res) => {
  const { destinationCountry, serviceType, workerCategory } = req.body;

  // Validation
  if (!destinationCountry) {
    throw new BadRequestError('Destination country is required');
  }

  // Find fee rule - try to match with available data
  // Since we're using serviceType and workerCategory, we need to map them
  const jobTypeMap = {
    'domestic': 'domestic_work',
    'construction': 'construction',
    'healthcare': 'healthcare',
    'hospitality': 'hospitality',
    'other': 'general_labor'
  };

  const jobType = jobTypeMap[workerCategory] || 'general_labor';

  const feeRule = await MigrationFeeRule.findOne({
    destinationCountry: destinationCountry.toUpperCase(),
    jobType,
    isActive: true
  });

  if (!feeRule) {
    // Return default/estimated fees if no rule found
    const defaultFees = {
      visaApplicationFee: 15000,
      medicalTestsFee: 8000,
      documentProcessingFee: 10000,
      trainingFee: 12000,
      totalLegalFee: 45000
    };

    logger.warn('Fee rule not found, returning default fees', {
      destinationCountry,
      serviceType,
      workerCategory
    });

    return res.status(200).json({
      success: true,
      data: {
        destinationCountry,
        serviceType,
        workerCategory,
        legalFees: defaultFees,
        currency: 'BDT',
        note: 'Estimated fees - no specific rule found for this combination'
      }
    });
  }

  // Extract legal fees from fee rule
  const legalFees = {
    visaApplicationFee: feeRule.fees?.estimatedCosts?.visa?.amount || 15000,
    medicalTestsFee: feeRule.fees?.estimatedCosts?.medical?.amount || 8000,
    documentProcessingFee: feeRule.fees?.estimatedCosts?.documentation?.amount || 10000,
    trainingFee: feeRule.fees?.estimatedCosts?.training?.amount || 12000,
    totalLegalFee: feeRule.fees?.recruitmentFee?.max || 45000
  };

  res.status(200).json({
    success: true,
    data: {
      destinationCountry,
      serviceType,
      workerCategory,
      legalFees,
      currency: feeRule.fees?.recruitmentFee?.currency || 'BDT',
      legalReference: feeRule.legalReference
    }
  });
});

/**
 * @desc    Compare actual fees with legal fees
 * @route   POST /api/calculator/fees/compare
 * @access  Public
 */
const compareFees = asyncHandler(async (req, res) => {
  const {
    destinationCountry,
    serviceType,
    workerCategory,
    actualFees = {},
    paymentTerms = {}
  } = req.body;

  // Validation
  if (!destinationCountry) {
    throw new BadRequestError('Destination country is required');
  }

  // Get legal fees first
  const jobTypeMap = {
    'domestic': 'domestic_work',
    'construction': 'construction',
    'healthcare': 'healthcare',
    'hospitality': 'hospitality',
    'other': 'general_labor'
  };

  const jobType = jobTypeMap[workerCategory] || 'general_labor';

  const feeRule = await MigrationFeeRule.findOne({
    destinationCountry: destinationCountry.toUpperCase(),
    jobType,
    isActive: true
  });

  // Default legal fees if rule not found
  const defaultLegalFees = {
    visaApplicationFee: 15000,
    medicalTestsFee: 8000,
    documentProcessingFee: 10000,
    trainingFee: 12000
  };

  const legalFees = feeRule ? {
    visaApplicationFee: feeRule.fees?.estimatedCosts?.visa?.amount || defaultLegalFees.visaApplicationFee,
    medicalTestsFee: feeRule.fees?.estimatedCosts?.medical?.amount || defaultLegalFees.medicalTestsFee,
    documentProcessingFee: feeRule.fees?.estimatedCosts?.documentation?.amount || defaultLegalFees.documentProcessingFee,
    trainingFee: feeRule.fees?.estimatedCosts?.training?.amount || defaultLegalFees.trainingFee
  } : defaultLegalFees;

  // Calculate totals
  const totalLegalFee = Object.values(legalFees).reduce((sum, fee) => sum + fee, 0);
  const totalActualFee = Object.values(actualFees).reduce((sum, fee) => sum + (parseFloat(fee) || 0), 0);

  // Compare fees
  const feeDifferences = Object.keys(legalFees).map(feeType => {
    const legal = legalFees[feeType] || 0;
    const actual = parseFloat(actualFees[feeType]) || 0;
    const difference = actual - legal;
    const differencePercent = legal > 0 ? ((difference / legal) * 100) : 0;

    return {
      feeType,
      legalFee: legal,
      actualFee: actual,
      difference,
      differencePercent: Math.round(differencePercent * 100) / 100,
      status: differencePercent > 15 ? 'overcharged' : differencePercent > 5 ? 'moderate' : 'fair'
    };
  });

  // Determine overall status
  const hasOvercharge = feeDifferences.some(f => f.status === 'overcharged');
  const hasModerate = feeDifferences.some(f => f.status === 'moderate');
  const overallStatus = hasOvercharge ? 'overcharged' : hasModerate ? 'moderate' : 'fair';

  // Generate warnings
  const warnings = [];
  feeDifferences.forEach(fee => {
    if (fee.differencePercent > 20) {
      warnings.push({
        type: 'high_overcharge',
        severity: 'high',
        message: `${fee.feeType} exceeds legal limit by ${fee.differencePercent.toFixed(1)}%`,
        recommendation: 'Report to BMET immediately'
      });
    } else if (fee.differencePercent > 15) {
      warnings.push({
        type: 'moderate_overcharge',
        severity: 'medium',
        message: `${fee.feeType} exceeds legal limit by ${fee.differencePercent.toFixed(1)}%`,
        recommendation: 'Request detailed breakdown from agency'
      });
    }
  });

  if (actualFees.hiddenCharges && parseFloat(actualFees.hiddenCharges) > 0) {
    warnings.push({
      type: 'hidden_charges',
      severity: 'high',
      message: 'Hidden charges detected',
      recommendation: 'Demand itemized invoice'
    });
  }

  if (paymentTerms.requiresDebtBondage) {
    warnings.push({
      type: 'debt_bondage',
      severity: 'critical',
      message: 'Debt bondage terms detected',
      recommendation: 'Do not sign and report immediately'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      destinationCountry,
      serviceType,
      workerCategory,
      totalLegalFee,
      totalActualFee,
      totalDifference: totalActualFee - totalLegalFee,
      status: overallStatus,
      feeBreakdown: feeDifferences,
      warnings,
      recommendations: {
        verifyAgency: true,
        getWrittenAgreement: true,
        checkBMETLicense: true,
        reportSuspiciousFees: hasOvercharge
      }
    }
  });
});

module.exports = {
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
};
