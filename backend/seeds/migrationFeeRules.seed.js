/**
 * Migration Fee Rules Seed Data
 * Matches the MigrationFeeRule.js schema structure
 * Fee rules for SA (Saudi Arabia), AE (UAE), QA (Qatar)
 */

const feeRulesData = [
  // ==================== SAUDI ARABIA (SA) ====================
  {
    destinationCountry: 'SA',
    jobType: 'domestic_work',
    fees: {
      recruitmentFee: {
        min: 1500,
        max: 2500,
        currency: 'SAR'
      },
      governmentFees: {
        visa: { amount: 600, currency: 'SAR' },
        passport: { amount: 0, currency: 'SAR' },
        medicalTest: { amount: 400, currency: 'SAR' },
        trainingFee: { amount: 300, currency: 'SAR' },
        emigrationClearance: { amount: 200, currency: 'SAR' },
        other: { amount: 0, currency: 'SAR' }
      },
      estimatedCosts: {
        airfare: {
          min: 400,
          max: 800,
          currency: 'SAR'
        },
        documentation: {
          amount: 200,
          currency: 'SAR'
        },
        insurance: {
          amount: 150,
          currency: 'SAR'
        }
      }
    },
    legalReference: {
      governmentAgency: 'Saudi Ministry of Human Resources',
      regulationNumber: 'Labor Law 2015',
      effectiveDate: new Date('2015-06-01'),
      sourceUrl: 'https://mlsd.gov.sa',
      lastVerifiedDate: new Date('2025-12-15')
    },
    warningThresholds: {
      severeWarningPercent: 50,
      moderateWarningPercent: 20
    },
    notes: 'Domestic workers in Saudi Arabia covered under Saudi Labor Law. Fees vary by agency.',
    commonScams: [
      {
        description: 'Overcharging for visa processing',
        redFlags: ['Visa fee > 1000 SAR', 'Unclear breakdown', 'Upfront payment demanded']
      },
      {
        description: 'Hidden charges for accommodation',
        redFlags: ['Separate housing fees', 'Deductions from salary', 'No written agreement']
      }
    ],
    isActive: true
  },
  {
    destinationCountry: 'SA',
    jobType: 'construction',
    fees: {
      recruitmentFee: {
        min: 1800,
        max: 4000,
        currency: 'SAR'
      },
      governmentFees: {
        visa: { amount: 800, currency: 'SAR' },
        passport: { amount: 0, currency: 'SAR' },
        medicalTest: { amount: 400, currency: 'SAR' },
        trainingFee: { amount: 500, currency: 'SAR' },
        emigrationClearance: { amount: 250, currency: 'SAR' },
        other: { amount: 0, currency: 'SAR' }
      },
      estimatedCosts: {
        airfare: {
          min: 500,
          max: 1000,
          currency: 'SAR'
        },
        documentation: {
          amount: 300,
          currency: 'SAR'
        },
        insurance: {
          amount: 200,
          currency: 'SAR'
        }
      }
    },
    legalReference: {
      governmentAgency: 'Saudi Ministry of Human Resources',
      regulationNumber: 'Kafala System Regulations',
      effectiveDate: new Date('2020-03-01'),
      sourceUrl: 'https://mlsd.gov.sa',
      lastVerifiedDate: new Date('2025-12-15')
    },
    warningThresholds: {
      severeWarningPercent: 50,
      moderateWarningPercent: 20
    },
    notes: 'Construction workers in Saudi Arabia require sponsorship. Fees for skilled workers higher.',
    commonScams: [
      {
        description: 'Excessive training fees',
        redFlags: ['Training > 800 SAR', 'Not ARAMCO certified', 'No training certificate provided']
      },
      {
        description: 'Debt bondage arrangements',
        redFlags: ['Multi-year salary deduction', 'Fee > 50% of monthly salary', 'Restricted movement']
      }
    ],
    isActive: true
  },
  {
    destinationCountry: 'SA',
    jobType: 'healthcare',
    fees: {
      recruitmentFee: {
        min: 2000,
        max: 3500,
        currency: 'SAR'
      },
      governmentFees: {
        visa: { amount: 800, currency: 'SAR' },
        passport: { amount: 0, currency: 'SAR' },
        medicalTest: { amount: 600, currency: 'SAR' },
        trainingFee: { amount: 400, currency: 'SAR' },
        emigrationClearance: { amount: 250, currency: 'SAR' },
        other: { amount: 0, currency: 'SAR' }
      },
      estimatedCosts: {
        airfare: {
          min: 600,
          max: 1200,
          currency: 'SAR'
        },
        documentation: {
          amount: 400,
          currency: 'SAR'
        },
        insurance: {
          amount: 300,
          currency: 'SAR'
        }
      }
    },
    legalReference: {
      governmentAgency: 'Saudi Ministry of Health & MOH',
      regulationNumber: 'Healthcare Professional License',
      effectiveDate: new Date('2018-01-01'),
      sourceUrl: 'https://www.moh.gov.sa',
      lastVerifiedDate: new Date('2025-12-15')
    },
    warningThresholds: {
      severeWarningPercent: 40,
      moderateWarningPercent: 15
    },
    notes: 'Healthcare workers require professional license verification. Higher fees due to qualification requirements.',
    commonScams: [
      {
        description: 'False license verification',
        redFlags: ['No SCFHS verification', 'Outdated credentials', 'Pressure to pay upfront']
      }
    ],
    isActive: true
  },
  {
    destinationCountry: 'SA',
    jobType: 'hospitality',
    fees: {
      recruitmentFee: {
        min: 1600,
        max: 3000,
        currency: 'SAR'
      },
      governmentFees: {
        visa: { amount: 600, currency: 'SAR' },
        passport: { amount: 0, currency: 'SAR' },
        medicalTest: { amount: 400, currency: 'SAR' },
        trainingFee: { amount: 350, currency: 'SAR' },
        emigrationClearance: { amount: 200, currency: 'SAR' },
        other: { amount: 0, currency: 'SAR' }
      },
      estimatedCosts: {
        airfare: {
          min: 400,
          max: 900,
          currency: 'SAR'
        },
        documentation: {
          amount: 250,
          currency: 'SAR'
        },
        insurance: {
          amount: 150,
          currency: 'SAR'
        }
      }
    },
    legalReference: {
      governmentAgency: 'Saudi Ministry of Commerce',
      regulationNumber: 'Tourism & Hospitality Regulations',
      effectiveDate: new Date('2019-01-01'),
      sourceUrl: 'https://www.commerce.gov.sa',
      lastVerifiedDate: new Date('2025-12-15')
    },
    warningThresholds: {
      severeWarningPercent: 50,
      moderateWarningPercent: 20
    },
    notes: 'Hospitality sector growing in Saudi Arabia with Vision 2030 initiatives.',
    commonScams: [
      {
        description: 'Unlicensed hotel agencies',
        redFlags: ['No hotel affiliation', 'No written contract', 'Changing terms after signing']
      }
    ],
    isActive: true
  },

  // ==================== UNITED ARAB EMIRATES (AE) ====================
  {
    destinationCountry: 'AE',
    jobType: 'construction',
    fees: {
      recruitmentFee: {
        min: 1500,
        max: 3500,
        currency: 'AED'
      },
      governmentFees: {
        visa: { amount: 500, currency: 'AED' },
        passport: { amount: 0, currency: 'AED' },
        medicalTest: { amount: 300, currency: 'AED' },
        trainingFee: { amount: 400, currency: 'AED' },
        emigrationClearance: { amount: 200, currency: 'AED' },
        other: { amount: 0, currency: 'AED' }
      },
      estimatedCosts: {
        airfare: {
          min: 300,
          max: 800,
          currency: 'AED'
        },
        documentation: {
          amount: 200,
          currency: 'AED'
        },
        insurance: {
          amount: 150,
          currency: 'AED'
        }
      }
    },
    legalReference: {
      governmentAgency: 'UAE Ministry of Human Resources',
      regulationNumber: 'UAE Labor Law 2015',
      effectiveDate: new Date('2015-11-01'),
      sourceUrl: 'https://www.moh.gov.ae',
      lastVerifiedDate: new Date('2025-12-15')
    },
    warningThresholds: {
      severeWarningPercent: 50,
      moderateWarningPercent: 20
    },
    notes: 'UAE has strong labor protections. Kafala system being reformed.',
    commonScams: [
      {
        description: 'Confiscation of documents',
        redFlags: ['Agency takes passport', 'No contract copy', 'No salary guarantee']
      }
    ],
    isActive: true
  },
  {
    destinationCountry: 'AE',
    jobType: 'hospitality',
    fees: {
      recruitmentFee: {
        min: 1300,
        max: 2800,
        currency: 'AED'
      },
      governmentFees: {
        visa: { amount: 400, currency: 'AED' },
        passport: { amount: 0, currency: 'AED' },
        medicalTest: { amount: 300, currency: 'AED' },
        trainingFee: { amount: 300, currency: 'AED' },
        emigrationClearance: { amount: 150, currency: 'AED' },
        other: { amount: 0, currency: 'AED' }
      },
      estimatedCosts: {
        airfare: {
          min: 300,
          max: 700,
          currency: 'AED'
        },
        documentation: {
          amount: 180,
          currency: 'AED'
        },
        insurance: {
          amount: 120,
          currency: 'AED'
        }
      }
    },
    legalReference: {
      governmentAgency: 'UAE Ministry of Human Resources',
      regulationNumber: 'Hospitality Employment Standards',
      effectiveDate: new Date('2016-01-01'),
      sourceUrl: 'https://www.moh.gov.ae',
      lastVerifiedDate: new Date('2025-12-15')
    },
    warningThresholds: {
      severeWarningPercent: 50,
      moderateWarningPercent: 20
    },
    notes: 'Hospitality sector well regulated in UAE with clear employment standards.',
    commonScams: [],
    isActive: true
  },
  {
    destinationCountry: 'AE',
    jobType: 'healthcare',
    fees: {
      recruitmentFee: {
        min: 1800,
        max: 3200,
        currency: 'AED'
      },
      governmentFees: {
        visa: { amount: 500, currency: 'AED' },
        passport: { amount: 0, currency: 'AED' },
        medicalTest: { amount: 400, currency: 'AED' },
        trainingFee: { amount: 350, currency: 'AED' },
        emigrationClearance: { amount: 200, currency: 'AED' },
        other: { amount: 0, currency: 'AED' }
      },
      estimatedCosts: {
        airfare: {
          min: 400,
          max: 900,
          currency: 'AED'
        },
        documentation: {
          amount: 250,
          currency: 'AED'
        },
        insurance: {
          amount: 200,
          currency: 'AED'
        }
      }
    },
    legalReference: {
      governmentAgency: 'UAE Ministry of Health & Prevention',
      regulationNumber: 'Healthcare Professional License',
      effectiveDate: new Date('2017-01-01'),
      sourceUrl: 'https://www.mohap.gov.ae',
      lastVerifiedDate: new Date('2025-12-15')
    },
    warningThresholds: {
      severeWarningPercent: 40,
      moderateWarningPercent: 15
    },
    notes: 'Healthcare workers must be registered with Dubai Health Authority or equivalent.',
    commonScams: [],
    isActive: true
  },
  {
    destinationCountry: 'AE',
    jobType: 'domestic_work',
    fees: {
      recruitmentFee: {
        min: 1200,
        max: 2200,
        currency: 'AED'
      },
      governmentFees: {
        visa: { amount: 400, currency: 'AED' },
        passport: { amount: 0, currency: 'AED' },
        medicalTest: { amount: 300, currency: 'AED' },
        trainingFee: { amount: 250, currency: 'AED' },
        emigrationClearance: { amount: 150, currency: 'AED' },
        other: { amount: 0, currency: 'AED' }
      },
      estimatedCosts: {
        airfare: {
          min: 250,
          max: 600,
          currency: 'AED'
        },
        documentation: {
          amount: 150,
          currency: 'AED'
        },
        insurance: {
          amount: 100,
          currency: 'AED'
        }
      }
    },
    legalReference: {
      governmentAgency: 'UAE Ministry of Human Resources',
      regulationNumber: 'Domestic Worker Protection Law',
      effectiveDate: new Date('2021-01-01'),
      sourceUrl: 'https://www.moh.gov.ae',
      lastVerifiedDate: new Date('2025-12-15')
    },
    warningThresholds: {
      severeWarningPercent: 50,
      moderateWarningPercent: 20
    },
    notes: 'UAE has landmark domestic worker protection law effective 2021.',
    commonScams: [],
    isActive: true
  },

  // ==================== QATAR (QA) ====================
  {
    destinationCountry: 'QA',
    jobType: 'construction',
    fees: {
      recruitmentFee: {
        min: 1600,
        max: 3800,
        currency: 'USD'
      },
      governmentFees: {
        visa: { amount: 600, currency: 'USD' },
        passport: { amount: 0, currency: 'USD' },
        medicalTest: { amount: 400, currency: 'USD' },
        trainingFee: { amount: 450, currency: 'USD' },
        emigrationClearance: { amount: 250, currency: 'USD' },
        other: { amount: 0, currency: 'USD' }
      },
      estimatedCosts: {
        airfare: {
          min: 400,
          max: 1000,
          currency: 'USD'
        },
        documentation: {
          amount: 250,
          currency: 'USD'
        },
        insurance: {
          amount: 200,
          currency: 'USD'
        }
      }
    },
    legalReference: {
      governmentAgency: 'Qatar Ministry of Administrative Development',
      regulationNumber: 'Qatar Labor Law 2004',
      effectiveDate: new Date('2004-08-13'),
      sourceUrl: 'https://www.moan.gov.qa',
      lastVerifiedDate: new Date('2025-12-15')
    },
    warningThresholds: {
      severeWarningPercent: 50,
      moderateWarningPercent: 20
    },
    notes: 'Qatar Kafala system reforms ongoing. World Cup 2022 improved labor standards.',
    commonScams: [
      {
        description: 'Wage theft and delay',
        redFlags: ['Salary not on time', 'No employment contract', 'Witheld documents']
      }
    ],
    isActive: true
  },
  {
    destinationCountry: 'QA',
    jobType: 'healthcare',
    fees: {
      recruitmentFee: {
        min: 1900,
        max: 3400,
        currency: 'USD'
      },
      governmentFees: {
        visa: { amount: 600, currency: 'USD' },
        passport: { amount: 0, currency: 'USD' },
        medicalTest: { amount: 500, currency: 'USD' },
        trainingFee: { amount: 400, currency: 'USD' },
        emigrationClearance: { amount: 300, currency: 'USD' },
        other: { amount: 0, currency: 'USD' }
      },
      estimatedCosts: {
        airfare: {
          min: 500,
          max: 1200,
          currency: 'USD'
        },
        documentation: {
          amount: 300,
          currency: 'USD'
        },
        insurance: {
          amount: 250,
          currency: 'USD'
        }
      }
    },
    legalReference: {
      governmentAgency: 'Qatar Ministry of Public Health',
      regulationNumber: 'Healthcare Professional Registration',
      effectiveDate: new Date('2018-01-01'),
      sourceUrl: 'https://www.moph.gov.qa',
      lastVerifiedDate: new Date('2025-12-15')
    },
    warningThresholds: {
      severeWarningPercent: 40,
      moderateWarningPercent: 15
    },
    notes: 'Healthcare workers must register with Qatar Medical Council.',
    commonScams: [],
    isActive: true
  },
  {
    destinationCountry: 'QA',
    jobType: 'hospitality',
    fees: {
      recruitmentFee: {
        min: 1400,
        max: 3000,
        currency: 'USD'
      },
      governmentFees: {
        visa: { amount: 500, currency: 'USD' },
        passport: { amount: 0, currency: 'USD' },
        medicalTest: { amount: 350, currency: 'USD' },
        trainingFee: { amount: 300, currency: 'USD' },
        emigrationClearance: { amount: 200, currency: 'USD' },
        other: { amount: 0, currency: 'USD' }
      },
      estimatedCosts: {
        airfare: {
          min: 300,
          max: 800,
          currency: 'USD'
        },
        documentation: {
          amount: 200,
          currency: 'USD'
        },
        insurance: {
          amount: 150,
          currency: 'USD'
        }
      }
    },
    legalReference: {
      governmentAgency: 'Qatar Tourism Authority',
      regulationNumber: 'Hospitality Sector Standards',
      effectiveDate: new Date('2019-01-01'),
      sourceUrl: 'https://www.experienceqatar.com',
      lastVerifiedDate: new Date('2025-12-15')
    },
    warningThresholds: {
      severeWarningPercent: 50,
      moderateWarningPercent: 20
    },
    notes: 'Qatar hospitality sector expanded for World Cup 2022 and ongoing tourism growth.',
    commonScams: [],
    isActive: true
  },
  {
    destinationCountry: 'QA',
    jobType: 'domestic_work',
    fees: {
      recruitmentFee: {
        min: 1300,
        max: 2400,
        currency: 'USD'
      },
      governmentFees: {
        visa: { amount: 400, currency: 'USD' },
        passport: { amount: 0, currency: 'USD' },
        medicalTest: { amount: 350, currency: 'USD' },
        trainingFee: { amount: 300, currency: 'USD' },
        emigrationClearance: { amount: 200, currency: 'USD' },
        other: { amount: 0, currency: 'USD' }
      },
      estimatedCosts: {
        airfare: {
          min: 300,
          max: 700,
          currency: 'USD'
        },
        documentation: {
          amount: 180,
          currency: 'USD'
        },
        insurance: {
          amount: 120,
          currency: 'USD'
        }
      }
    },
    legalReference: {
      governmentAgency: 'Qatar Ministry of Administrative Development',
      regulationNumber: 'Domestic Worker Rights Regulations',
      effectiveDate: new Date('2020-01-01'),
      sourceUrl: 'https://www.moan.gov.qa',
      lastVerifiedDate: new Date('2025-12-15')
    },
    warningThresholds: {
      severeWarningPercent: 50,
      moderateWarningPercent: 20
    },
    notes: 'Qatar improving domestic worker protections following international pressure.',
    commonScams: [],
    isActive: true
  }
];

module.exports = feeRulesData;
