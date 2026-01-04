/**
 * Database Seeding Script
 * Initializes MongoDB with country guide data
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const CountryGuide = require('../models/CountryGuide.model');
const countriesData = require('../seeds/countries.seed');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if data already exists
    const existingCount = await CountryGuide.countDocuments();
    if (existingCount > 0) {
      console.log(`\n⚠️  Found ${existingCount} existing country guides`);
      const args = process.argv.slice(2);
      if (args.includes('--force')) {
        console.log('🔄 Clearing existing data (--force flag detected)...');
        await CountryGuide.collection.drop();
        console.log('✅ Cleared existing collection with all indexes');
      } else {
        console.log('ℹ️  Run with --force flag to overwrite: npm run seed:countries:force');
        console.log('📊 Current country guides in database:');
        const countries = await CountryGuide.find({}, 'country countryCode');
        countries.forEach(c => {
          console.log(`   - ${c.country} (${c.countryCode})`);
        });
        await mongoose.connection.close();
        return;
      }
    }

    // Insert seed data
    console.log('\n🌱 Inserting seed data...');
    const inserted = await CountryGuide.insertMany(countriesData);
    console.log(`✅ Successfully inserted ${inserted.length} country guides\n`);

    // Display summary
    console.log('📋 Country Guides Summary:');
    console.log('═'.repeat(60));
    inserted.forEach((country, index) => {
      const sectors = country.salaryRanges.map(s => s.jobType).join(', ');
      console.log(`\n${index + 1}. ${country.flagEmoji} ${country.country} (${country.countryCode})`);
      console.log(`   Region: ${country.region}`);
      console.log(`   Job Types: ${sectors}`);
      console.log(`   Salary Ranges: ${country.salaryRanges.length} sectors`);
      console.log(`   Languages: ${country.culture.language.official.join(', ')}`);
    });

    console.log('\n' + '═'.repeat(60));
    console.log('✅ Seeding completed successfully!');
    console.log('━'.repeat(60));
    console.log('📊 Data is ready for use');
    console.log('🌐 You can now fetch country guides via API:');
    console.log('   - GET /api/countries');
    console.log('   - GET /api/countries/:code (e.g., /api/countries/SA)');
    console.log('━'.repeat(60) + '\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
