/**
 * Migration Fee Rules Seeder
 * Seeds sample fee rules for different countries and job types
 * Run: node utils/seedFeeRules.js
 */

const mongoose = require('mongoose');
const MigrationFeeRule = require('../models/MigrationFeeRule');
const config = require('../config/env');

const sampleFeeRules = [
  // Saudi Arabia
  {
    destinationCountry: 'Saudi Arabia',
    jobType: 'construction',
    fees: {
      recruitmentFee: {
        min: 95000,
        max: 165000,
        currency: 'BDT'
      },
      governmentFees: {
        visa: { amount: 8000, currency: 'BDT' },
        passport: { amount: 3550, currency: 'BDT' },
        medicalTest: { amount: 2500, currency: 'BDT' },
        trainingFee: { amount: 15000, currency: 'BDT' },
        emigrationClearance: { amount: 2000, currency: 'BDT' },
        other: { amount: 5000, currency: 'BDT' }
      },
      estimatedCosts: {
        airfare: { min: 25000, max: 45000, currency: 'BDT' },
        documentation: { amount: 5000, currency: 'BDT' },
        insurance: { amount: 3000, currency: 'BDT' }
      }
    },
    legalReference: {
      governmentAgency: 'Bureau of Manpower, Employment and Training (BMET)',
      regulationNumber: 'BMET/2023/SA/001',
      effectiveDate: new Date('2023-01-01'),
      sourceUrl: 'https://www.old.bmet.gov.bd',
      lastVerifiedDate: new Date()
    },
    notes: 'Fees are based on BMET-approved costs for Saudi Arabia. Workers must verify agency license before payment.',
    commonScams: [
      {
        description: 'Fake visa promises',
        redFlags: ['No proper documentation', 'Cash-only payments', 'Guaranteed job without interview']
      }
    ],
    isActive: true
  },
  {
    destinationCountry: 'Saudi Arabia',
    jobType: 'domestic_work',
    fees: {
      recruitmentFee: {
        min: 75000,
        max: 130000,
        currency: 'BDT'
      },
      governmentFees: {
        visa: { amount: 8000, currency: 'BDT' },
        passport: { amount: 3550, currency: 'BDT' },
        medicalTest: { amount: 2500, currency: 'BDT' },
        trainingFee: { amount: 20000, currency: 'BDT' },
        emigrationClearance: { amount: 2000, currency: 'BDT' },
        other: { amount: 4000, currency: 'BDT' }
      },
      estimatedCosts: {
        airfare: { min: 25000, max: 45000, currency: 'BDT' },
        documentation: { amount: 5000, currency: 'BDT' },
        insurance: { amount: 3000, currency: 'BDT' }
      }
    },
    legalReference: {
      governmentAgency: 'Bureau of Manpower, Employment and Training (BMET)',
      regulationNumber: 'BMET/2023/SA/002',
      effectiveDate: new Date('2023-01-01'),
      sourceUrl: 'https://www.old.bmet.gov.bd',
      lastVerifiedDate: new Date()
    },
    notes: 'Domestic workers require mandatory training certificate. Ensure proper employment contract.',
    isActive: true
  },

  // United Arab Emirates
  {
    destinationCountry: 'United Arab Emirates',
    jobType: 'construction',
    fees: {
      recruitmentFee: {
        min: 100000,
        max: 180000,
        currency: 'BDT'
      },
      governmentFees: {
        visa: { amount: 10000, currency: 'BDT' },
        passport: { amount: 3550, currency: 'BDT' },
        medicalTest: { amount: 3000, currency: 'BDT' },
        trainingFee: { amount: 15000, currency: 'BDT' },
        emigrationClearance: { amount: 2500, currency: 'BDT' },
        other: { amount: 6000, currency: 'BDT' }
      },
      estimatedCosts: {
        airfare: { min: 30000, max: 55000, currency: 'BDT' },
        documentation: { amount: 6000, currency: 'BDT' },
        insurance: { amount: 4000, currency: 'BDT' }
      }
    },
    legalReference: {
      governmentAgency: 'Bureau of Manpower, Employment and Training (BMET)',
      regulationNumber: 'BMET/2023/UAE/001',
      effectiveDate: new Date('2023-01-01'),
      sourceUrl: 'https://www.old.bmet.gov.bd',
      lastVerifiedDate: new Date()
    },
    isActive: true
  },

  // Malaysia
  {
    destinationCountry: 'Malaysia',
    jobType: 'manufacturing',
    fees: {
      recruitmentFee: {
        min: 60000,
        max: 120000,
        currency: 'BDT'
      },
      governmentFees: {
        visa: { amount: 7000, currency: 'BDT' },
        passport: { amount: 3550, currency: 'BDT' },
        medicalTest: { amount: 2000, currency: 'BDT' },
        trainingFee: { amount: 12000, currency: 'BDT' },
        emigrationClearance: { amount: 2000, currency: 'BDT' },
        other: { amount: 4000, currency: 'BDT' }
      },
      estimatedCosts: {
        airfare: { min: 20000, max: 35000, currency: 'BDT' },
        documentation: { amount: 4000, currency: 'BDT' },
        insurance: { amount: 3000, currency: 'BDT' }
      }
    },
    legalReference: {
      governmentAgency: 'Bureau of Manpower, Employment and Training (BMET)',
      regulationNumber: 'BMET/2023/MY/001',
      effectiveDate: new Date('2023-01-01'),
      sourceUrl: 'https://www.old.bmet.gov.bd',
      lastVerifiedDate: new Date()
    },
    isActive: true
  },

  // Singapore
  {
    destinationCountry: 'Singapore',
    jobType: 'construction',
    fees: {
      recruitmentFee: {
        min: 120000,
        max: 200000,
        currency: 'BDT'
      },
      governmentFees: {
        visa: { amount: 12000, currency: 'BDT' },
        passport: { amount: 3550, currency: 'BDT' },
        medicalTest: { amount: 4000, currency: 'BDT' },
        trainingFee: { amount: 18000, currency: 'BDT' },
        emigrationClearance: { amount: 2500, currency: 'BDT' },
        other: { amount: 7000, currency: 'BDT' }
      },
      estimatedCosts: {
        airfare: { min: 35000, max: 60000, currency: 'BDT' },
        documentation: { amount: 7000, currency: 'BDT' },
        insurance: { amount: 5000, currency: 'BDT' }
      }
    },
    legalReference: {
      governmentAgency: 'Bureau of Manpower, Employment and Training (BMET)',
      regulationNumber: 'BMET/2023/SG/001',
      effectiveDate: new Date('2023-01-01'),
      sourceUrl: 'https://www.old.bmet.gov.bd',
      lastVerifiedDate: new Date()
    },
    isActive: true
  },

  // Qatar
  {
    destinationCountry: 'Qatar',
    jobType: 'hospitality',
    fees: {
      recruitmentFee: {
        min: 90000,
        max: 160000,
        currency: 'BDT'
      },
      governmentFees: {
        visa: { amount: 9000, currency: 'BDT' },
        passport: { amount: 3550, currency: 'BDT' },
        medicalTest: { amount: 2500, currency: 'BDT' },
        trainingFee: { amount: 15000, currency: 'BDT' },
        emigrationClearance: { amount: 2000, currency: 'BDT' },
        other: { amount: 5000, currency: 'BDT' }
      },
      estimatedCosts: {
        airfare: { min: 28000, max: 50000, currency: 'BDT' },
        documentation: { amount: 5500, currency: 'BDT' },
        insurance: { amount: 3500, currency: 'BDT' }
      }
    },
    legalReference: {
      governmentAgency: 'Bureau of Manpower, Employment and Training (BMET)',
      regulationNumber: 'BMET/2023/QA/001',
      effectiveDate: new Date('2023-01-01'),
      sourceUrl: 'https://www.old.bmet.gov.bd',
      lastVerifiedDate: new Date()
    },
    isActive: true
  }
];

async function seedFeeRules() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing fee rules
    const deleteResult = await MigrationFeeRule.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing fee rules`);

    // Insert sample data
    const inserted = await MigrationFeeRule.insertMany(sampleFeeRules);
    console.log(`✅ Inserted ${inserted.length} fee rules`);

    // Display summary
    console.log('\n📊 Summary by Country:');
    const summary = await MigrationFeeRule.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$destinationCountry',
          count: { $sum: 1 },
          jobTypes: { $push: '$jobType' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    summary.forEach(item => {
      console.log(`  ${item._id}: ${item.count} job types (${item.jobTypes.join(', ')})`);
    });

    console.log('\n✅ Fee rules seeded successfully!');
    console.log('\nYou can now:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Test the calculator API: POST /api/calculator/calculate');
    console.log('3. View countries: GET /api/calculator/countries');

  } catch (error) {
    console.error('❌ Error seeding fee rules:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run seeder
seedFeeRules();
