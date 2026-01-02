const mongoose = require('mongoose');

/**
 * Migration Fee Rule Schema
 * Stores government-approved fee ranges for different countries and job types
 */
const migrationFeeRuleSchema = new mongoose.Schema({
  // ==================== Country & Job Information ====================
  destinationCountry: {
    type: String,
    required: [true, 'Destination country is required'],
    trim: true,
    index: true
  },
  
  jobType: {
    type: String,
    required: [true, 'Job type is required'],
    enum: {
      values: [
        'construction',
        'hospitality',
        'healthcare',
        'domestic_work',
        'manufacturing',
        'agriculture',
        'it_services',
        'driving',
        'security',
        'general_labor',
        'other'
      ],
      message: '{VALUE} is not a valid job type'
    },
    index: true
  },

  // ==================== Fee Structure ====================
  fees: {
    // Recruitment agency fee (legal range)
    recruitmentFee: {
      min: {
        type: Number,
        required: true,
        min: 0
      },
      max: {
        type: Number,
        required: true,
        validate: {
          validator: function(value) {
            return value >= this.fees.recruitmentFee.min;
          },
          message: 'Maximum fee must be greater than or equal to minimum fee'
        }
      },
      currency: {
        type: String,
        default: 'BDT',
        enum: ['BDT', 'USD', 'EUR', 'GBP', 'SAR', 'AED', 'MYR', 'SGD']
      }
    },

    // Government processing fees
    governmentFees: {
      visa: {
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'BDT' }
      },
      passport: {
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'BDT' }
      },
      medicalTest: {
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'BDT' }
      },
      trainingFee: {
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'BDT' }
      },
      emigrationClearance: {
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'BDT' }
      },
      other: {
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'BDT' }
      }
    },

    // Additional estimated costs
    estimatedCosts: {
      airfare: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        currency: { type: String, default: 'BDT' }
      },
      documentation: {
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'BDT' }
      },
      insurance: {
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'BDT' }
      }
    }
  },

  // ==================== Legal Information ====================
  legalReference: {
    governmentAgency: {
      type: String,
      default: 'Bureau of Manpower, Employment and Training (BMET)'
    },
    regulationNumber: String,
    effectiveDate: Date,
    sourceUrl: String,
    lastVerifiedDate: Date
  },

  // ==================== Warning Thresholds ====================
  warningThresholds: {
    // If fee is X% above max, show severe warning
    severeWarningPercent: {
      type: Number,
      default: 50 // 50% above max = severe warning
    },
    // If fee is X% above max, show moderate warning
    moderateWarningPercent: {
      type: Number,
      default: 20 // 20% above max = moderate warning
    }
  },

  // ==================== Additional Information ====================
  notes: {
    type: String,
    maxlength: 1000
  },

  commonScams: [{
    description: String,
    redFlags: [String]
  }],

  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  // ==================== Metadata ====================
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== Indexes ====================
migrationFeeRuleSchema.index({ destinationCountry: 1, jobType: 1 }, { unique: true });
migrationFeeRuleSchema.index({ isActive: 1 });

// ==================== Virtual Properties ====================
migrationFeeRuleSchema.virtual('totalGovernmentFees').get(function() {
  const govFees = this.fees.governmentFees;
  return (
    govFees.visa.amount +
    govFees.passport.amount +
    govFees.medicalTest.amount +
    govFees.trainingFee.amount +
    govFees.emigrationClearance.amount +
    govFees.other.amount
  );
});

migrationFeeRuleSchema.virtual('totalMinimumCost').get(function() {
  return (
    this.fees.recruitmentFee.min +
    this.totalGovernmentFees +
    this.fees.estimatedCosts.airfare.min +
    this.fees.estimatedCosts.documentation.amount +
    this.fees.estimatedCosts.insurance.amount
  );
});

migrationFeeRuleSchema.virtual('totalMaximumCost').get(function() {
  return (
    this.fees.recruitmentFee.max +
    this.totalGovernmentFees +
    this.fees.estimatedCosts.airfare.max +
    this.fees.estimatedCosts.documentation.amount +
    this.fees.estimatedCosts.insurance.amount
  );
});

// ==================== Instance Methods ====================
/**
 * Calculate fee comparison and warnings
 * @param {Number} userFee - Fee entered by user
 * @returns {Object} - Comparison results with warnings
 */
migrationFeeRuleSchema.methods.compareFee = function(userFee) {
  const legalMin = this.fees.recruitmentFee.min;
  const legalMax = this.fees.recruitmentFee.max;
  
  const comparison = {
    userFee,
    legalRange: {
      min: legalMin,
      max: legalMax,
      currency: this.fees.recruitmentFee.currency
    },
    difference: userFee - legalMax,
    percentAboveMax: legalMax > 0 ? ((userFee - legalMax) / legalMax * 100) : 0,
    percentBelowMin: legalMin > 0 ? ((legalMin - userFee) / legalMin * 100) : 0,
    isWithinLegalRange: userFee >= legalMin && userFee <= legalMax,
    warnings: []
  };

  // Generate warnings
  if (userFee < legalMin) {
    if (userFee < legalMin * 0.5) {
      comparison.warnings.push({
        level: 'severe',
        type: 'suspiciously_low',
        message: 'This fee is significantly below the legal minimum. This is highly suspicious and may indicate a scam or hidden fees.',
        recommendation: 'Do not proceed. Verify with BMET and request detailed cost breakdown.'
      });
    } else {
      comparison.warnings.push({
        level: 'moderate',
        type: 'below_minimum',
        message: 'This fee is below the government-approved minimum. Be cautious of hidden costs.',
        recommendation: 'Ask for a detailed written cost breakdown before proceeding.'
      });
    }
  } else if (userFee > legalMax) {
    const percentOver = ((userFee - legalMax) / legalMax * 100);
    
    if (percentOver >= this.warningThresholds.severeWarningPercent) {
      comparison.warnings.push({
        level: 'severe',
        type: 'illegal_overcharge',
        message: `This fee is ${percentOver.toFixed(1)}% above the legal maximum. This is ILLEGAL and constitutes exploitation.`,
        recommendation: 'Do NOT pay this amount. Report this agency to BMET immediately. Seek help from verified agencies.',
        reportUrl: 'https://www.old.bmet.gov.bd/BMET/complaintAction'
      });
    } else if (percentOver >= this.warningThresholds.moderateWarningPercent) {
      comparison.warnings.push({
        level: 'warning',
        type: 'above_maximum',
        message: `This fee is ${percentOver.toFixed(1)}% above the legal maximum. This may be illegal.`,
        recommendation: 'Question this fee with the agency and verify with BMET before proceeding.'
      });
    } else {
      comparison.warnings.push({
        level: 'caution',
        type: 'slightly_high',
        message: 'This fee is slightly above the legal maximum.',
        recommendation: 'Ask the agency to justify any fees above the legal limit.'
      });
    }
  } else {
    comparison.warnings.push({
      level: 'safe',
      type: 'within_range',
      message: 'This fee is within the government-approved legal range.',
      recommendation: 'Still verify the agency is licensed and get everything in writing.'
    });
  }

  return comparison;
};

/**
 * Get complete cost breakdown
 * @returns {Object} - Complete cost breakdown
 */
migrationFeeRuleSchema.methods.getCostBreakdown = function() {
  return {
    recruitmentFee: {
      min: this.fees.recruitmentFee.min,
      max: this.fees.recruitmentFee.max,
      currency: this.fees.recruitmentFee.currency,
      description: 'Agency recruitment fee (legal range)'
    },
    governmentFees: {
      visa: this.fees.governmentFees.visa.amount,
      passport: this.fees.governmentFees.passport.amount,
      medicalTest: this.fees.governmentFees.medicalTest.amount,
      trainingFee: this.fees.governmentFees.trainingFee.amount,
      emigrationClearance: this.fees.governmentFees.emigrationClearance.amount,
      other: this.fees.governmentFees.other.amount,
      total: this.totalGovernmentFees,
      currency: 'BDT',
      description: 'Mandatory government fees'
    },
    estimatedCosts: {
      airfare: {
        min: this.fees.estimatedCosts.airfare.min,
        max: this.fees.estimatedCosts.airfare.max,
        description: 'Flight ticket (estimated range)'
      },
      documentation: {
        amount: this.fees.estimatedCosts.documentation.amount,
        description: 'Document preparation and notarization'
      },
      insurance: {
        amount: this.fees.estimatedCosts.insurance.amount,
        description: 'Travel and health insurance'
      },
      currency: 'BDT'
    },
    totalCost: {
      minimum: this.totalMinimumCost,
      maximum: this.totalMaximumCost,
      currency: 'BDT',
      description: 'Total estimated migration cost range'
    }
  };
};

const MigrationFeeRule = mongoose.model('MigrationFeeRule', migrationFeeRuleSchema);

module.exports = MigrationFeeRule;
