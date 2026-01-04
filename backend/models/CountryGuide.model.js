const mongoose = require('mongoose');

/**
 * Country Guide Schema
 * Stores comprehensive information about destination countries for migrant workers
 * Supports multi-language content (English and Bengali)
 */
const countryGuideSchema = new mongoose.Schema(
  {
    // Basic Information
    country: {
      type: String,
      required: [true, 'Country name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    countryCode: {
      type: String, // ISO 3166-1 alpha-2 code (e.g., 'SA', 'AE', 'MY')
      required: true,
      uppercase: true,
      length: 2,
    },
    flagEmoji: {
      type: String,
      default: '🌍',
    },
    region: {
      type: String,
      enum: ['Middle East', 'Southeast Asia', 'East Asia', 'Europe', 'North America', 'Other'],
      required: true,
    },
    
    // Multi-language Overview
    overview: {
      en: {
        type: String,
        required: [true, 'English overview is required'],
      },
      bn: {
        type: String,
        required: [true, 'Bengali overview is required'],
      },
    },

    // Salary Information
    salaryRanges: [
      {
        jobType: {
          type: String,
          required: true,
          enum: [
            'construction',
            'domestic_work',
            'manufacturing',
            'hospitality',
            'healthcare',
            'agriculture',
            'transportation',
            'retail',
            'it_professional',
            'engineering',
            'other',
          ],
        },
        title: {
          en: String,
          bn: String,
        },
        minSalary: {
          type: Number,
          required: true,
        },
        maxSalary: {
          type: Number,
          required: true,
        },
        currency: {
          type: String,
          required: true,
          default: 'USD',
        },
        period: {
          type: String,
          enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
          default: 'monthly',
        },
        notes: {
          en: String,
          bn: String,
        },
      },
    ],

    // Cultural Information
    culture: {
      language: {
        official: {
          type: [String],
          required: true,
        },
        commonlySpoken: [String],
      },
      religion: {
        primary: String,
        important: {
          en: String,
          bn: String,
        },
      },
      customs: {
        dressCode: {
          en: String,
          bn: String,
        },
        workCulture: {
          en: String,
          bn: String,
        },
        publicBehavior: {
          en: String,
          bn: String,
        },
        holidays: [
          {
            name: {
              en: String,
              bn: String,
            },
            description: {
              en: String,
              bn: String,
            },
          },
        ],
      },
      doAndDonts: {
        dos: [
          {
            en: String,
            bn: String,
          },
        ],
        donts: [
          {
            en: String,
            bn: String,
          },
        ],
      },
    },

    // Legal Rights and Regulations
    legalRights: {
      laborLaws: {
        workingHours: {
          standard: Number,
          maximum: Number,
          notes: {
            en: String,
            bn: String,
          },
        },
        weeklyRest: {
          days: Number,
          notes: {
            en: String,
            bn: String,
          },
        },
        paidLeave: {
          annual: Number,
          sick: Number,
          notes: {
            en: String,
            bn: String,
          },
        },
        overtimePay: {
          rate: String,
          notes: {
            en: String,
            bn: String,
          },
        },
      },
      workerProtections: [
        {
          right: {
            en: String,
            bn: String,
          },
          description: {
            en: String,
            bn: String,
          },
        },
      ],
      contractRequirements: {
        mustHaveWrittenContract: {
          type: Boolean,
          default: true,
        },
        contractLanguage: String,
        minimumWage: {
          amount: Number,
          currency: String,
          notes: {
            en: String,
            bn: String,
          },
        },
      },
      visaAndResidency: {
        visaTypes: [String],
        renewalPeriod: String,
        sponsorshipRules: {
          en: String,
          bn: String,
        },
        exitPermitRequired: {
          type: Boolean,
          default: false,
        },
      },
    },

    // Emergency Contacts
    emergencyContacts: {
      bangladeshiEmbassy: {
        name: {
          en: String,
          bn: String,
        },
        address: {
          en: String,
          bn: String,
        },
        phone: [String],
        email: String,
        emergencyHotline: String,
        website: String,
        workingHours: {
          en: String,
          bn: String,
        },
      },
      localEmergencyServices: {
        police: String,
        ambulance: String,
        fire: String,
        generalEmergency: String,
      },
      workerSupportOrganizations: [
        {
          name: {
            en: String,
            bn: String,
          },
          description: {
            en: String,
            bn: String,
          },
          phone: [String],
          email: String,
          website: String,
          servicesOffered: {
            en: [String],
            bn: [String],
          },
        },
      ],
      helplines: [
        {
          name: {
            en: String,
            bn: String,
          },
          number: String,
          purpose: {
            en: String,
            bn: String,
          },
          availability: {
            en: String,
            bn: String,
          },
        },
      ],
    },

    // Living Costs
    livingCosts: {
      currency: String,
      accommodation: {
        providedByEmployer: {
          type: Boolean,
          default: false,
        },
        averageRent: {
          min: Number,
          max: Number,
          notes: {
            en: String,
            bn: String,
          },
        },
      },
      food: {
        monthlyEstimate: {
          min: Number,
          max: Number,
        },
        notes: {
          en: String,
          bn: String,
        },
      },
      transportation: {
        monthlyEstimate: {
          min: Number,
          max: Number,
        },
        notes: {
          en: String,
          bn: String,
        },
      },
      utilities: {
        monthlyEstimate: {
          min: Number,
          max: Number,
        },
        notes: {
          en: String,
          bn: String,
        },
      },
    },

    // Health and Safety
    healthAndSafety: {
      healthcare: {
        system: {
          en: String,
          bn: String,
        },
        coverage: {
          en: String,
          bn: String,
        },
        emergencyAccess: {
          en: String,
          bn: String,
        },
      },
      commonHealthRisks: [
        {
          risk: {
            en: String,
            bn: String,
          },
          prevention: {
            en: String,
            bn: String,
          },
        },
      ],
      vaccinationRequirements: [String],
    },

    // Useful Resources
    resources: {
      governmentWebsites: [
        {
          name: {
            en: String,
            bn: String,
          },
          url: String,
          purpose: {
            en: String,
            bn: String,
          },
        },
      ],
      mobileApps: [
        {
          name: String,
          purpose: {
            en: String,
            bn: String,
          },
          platform: [String], // ['iOS', 'Android']
        },
      ],
      usefulPhrasebook: [
        {
          english: String,
          local: String,
          bengali: String,
          context: String,
        },
      ],
    },

    // Meta Information
    popularityRank: {
      type: Number,
      default: 100,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastVerifiedDate: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
countryGuideSchema.index({ country: 1, isActive: 1 });
countryGuideSchema.index({ region: 1, popularityRank: 1 });
countryGuideSchema.index({ 'salaryRanges.jobType': 1 });

// Virtual: Average salary across all job types
countryGuideSchema.virtual('averageSalary').get(function () {
  if (!this.salaryRanges || this.salaryRanges.length === 0) return null;
  
  const total = this.salaryRanges.reduce((sum, range) => {
    return sum + (range.minSalary + range.maxSalary) / 2;
  }, 0);
  
  return {
    average: Math.round(total / this.salaryRanges.length),
    currency: this.salaryRanges[0]?.currency || 'USD',
  };
});

// Virtual: Total job types available
countryGuideSchema.virtual('jobTypesCount').get(function () {
  return this.salaryRanges ? this.salaryRanges.length : 0;
});

// Instance Methods

/**
 * Get salary range for a specific job type
 */
countryGuideSchema.methods.getSalaryForJob = function (jobType) {
  return this.salaryRanges.find((range) => range.jobType === jobType);
};

/**
 * Get content in specific language
 */
countryGuideSchema.methods.getLocalizedContent = function (language = 'en') {
  const lang = ['en', 'bn'].includes(language) ? language : 'en';
  
  return {
    overview: this.overview[lang],
    // Add more localized fields as needed
  };
};

/**
 * Increment view count
 */
countryGuideSchema.methods.incrementViewCount = async function () {
  this.viewCount += 1;
  return this.save();
};

/**
 * Check if information is up to date (verified within last 6 months)
 */
countryGuideSchema.methods.isUpToDate = function () {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return this.lastVerifiedDate >= sixMonthsAgo;
};

// Static Methods

/**
 * Get all active country guides
 */
countryGuideSchema.statics.getActiveGuides = function () {
  return this.find({ isActive: true }).sort({ popularityRank: 1 });
};

/**
 * Get guides by region
 */
countryGuideSchema.statics.getByRegion = function (region) {
  return this.find({ region, isActive: true }).sort({ popularityRank: 1 });
};

/**
 * Search guides by job type
 */
countryGuideSchema.statics.searchByJobType = function (jobType) {
  return this.find({
    'salaryRanges.jobType': jobType,
    isActive: true,
  }).sort({ popularityRank: 1 });
};

/**
 * Get popular destinations
 */
countryGuideSchema.statics.getPopular = function (limit = 5) {
  return this.find({ isActive: true })
    .sort({ popularityRank: 1, viewCount: -1 })
    .limit(limit);
};

// Pre-save middleware
countryGuideSchema.pre('save', function (next) {
  // Update lastVerifiedDate if content was modified
  if (this.isModified('salaryRanges') || this.isModified('legalRights')) {
    this.lastVerifiedDate = new Date();
  }
  next();
});

const CountryGuide = mongoose.model('CountryGuide', countryGuideSchema);

module.exports = CountryGuide;
