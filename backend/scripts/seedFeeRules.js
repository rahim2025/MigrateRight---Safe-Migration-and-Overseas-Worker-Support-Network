/**
 * Seed Script for Migration Fee Rules
 * Populates MigrationFeeRule collection with fee rules for countries
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/migrateright');
    console.log('MongoDB connected for seeding...');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
};

const seedFeeRules = async () => {
  try {
    connectDB().then(async () => {
      const MigrationFeeRule = require('../models/MigrationFeeRule');
      const feeRulesData = require('../seeds/migrationFeeRules.seed');

      // Check if --force flag is provided
      const forceReset = process.argv.includes('--force');

      if (forceReset) {
        console.log('🔄 Clearing existing fee rules...');
        const result = await MigrationFeeRule.collection.drop().catch((err) => {
          if (err.code !== 26) { // 26 = namespace not found
            throw err;
          }
        });
        console.log('✓ Fee rules collection cleared');
      }

      // Check existing data
      const existingCount = await MigrationFeeRule.countDocuments();
      if (existingCount > 0 && !forceReset) {
        console.log(`⚠️  Found ${existingCount} existing fee rules. Use --force to replace.`);
        process.exit(0);
      }

      // Insert seed data
      console.log(`📝 Inserting ${feeRulesData.length} fee rules...`);
      const inserted = await MigrationFeeRule.insertMany(feeRulesData);
      
      // Display summary
      console.log('\n✅ Fee rules seeded successfully!\n');
      console.log('📊 Inserted Fee Rules Summary:');
      console.log('================================');

      const byCountry = {};
      inserted.forEach((rule) => {
        if (!byCountry[rule.destinationCountry]) {
          byCountry[rule.destinationCountry] = [];
        }
        byCountry[rule.destinationCountry].push(rule.jobType);
      });

      Object.entries(byCountry).forEach(([country, jobTypes]) => {
        console.log(`\n${country}:`);
        jobTypes.forEach((jobType) => {
          console.log(`  ✓ ${jobType}`);
        });
      });

      console.log(`\n================================`);
      console.log(`Total: ${inserted.length} fee rules inserted`);
      console.log('================================\n');

      process.exit(0);
    });
  } catch (err) {
    console.error('Error seeding fee rules:', err);
    process.exit(1);
  }
};

seedFeeRules();
