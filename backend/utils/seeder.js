/**
 * Database Seeder
 * Seeds the database with sample data for development and testing
 * 
 * Usage:
 * - Seed data: node utils/seeder.js
 * - Delete data: node utils/seeder.js -d
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Agency = require('../models/Agency.model');

// Load environment variables
dotenv.config();

// ==================== SAMPLE DATA ====================

const sampleAgencies = [
  {
    name: 'Global Workforce Solutions',
    license: {
      number: 'BMT-2024-001',
      issueDate: new Date('2024-01-15'),
      expiryDate: new Date('2026-01-15'),
      isValid: true,
    },
    isVerified: true,
    location: {
      address: '123 Main Street, Gulshan',
      city: 'Dhaka',
      district: 'Dhaka',
      country: 'Bangladesh',
    },
    destinationCountries: ['Saudi Arabia', 'UAE', 'Qatar'],
    contact: {
      phone: '+880-1712-345678',
      email: 'info@globalworkforce.com',
      website: 'www.globalworkforce.com',
    },
    rating: {
      average: 4.5,
      count: 127,
    },
    specialization: ['Construction', 'Manufacturing'],
    description: 'Leading recruitment agency specializing in Middle East placements with over 15 years of experience.',
    establishedYear: 2009,
    totalPlacements: 5420,
    isActive: true,
  },
  {
    name: 'United Migration Services',
    license: {
      number: 'BMT-2024-002',
      issueDate: new Date('2024-02-01'),
      expiryDate: new Date('2026-02-01'),
      isValid: true,
    },
    isVerified: true,
    location: {
      address: '456 Commercial Road',
      city: 'Chittagong',
      district: 'Chittagong',
      country: 'Bangladesh',
    },
    destinationCountries: ['UAE', 'Oman', 'Kuwait'],
    contact: {
      phone: '+880-1812-456789',
      email: 'contact@unitedmigration.bd',
      website: 'www.unitedmigration.bd',
    },
    rating: {
      average: 4.8,
      count: 203,
    },
    specialization: ['Hospitality', 'Healthcare'],
    description: 'Trusted agency for healthcare and hospitality sector placements in the Gulf region.',
    establishedYear: 2012,
    totalPlacements: 3890,
    isActive: true,
  },
  {
    name: 'Eastern Manpower Agency',
    license: {
      number: 'BMT-2024-003',
      issueDate: new Date('2023-11-10'),
      expiryDate: new Date('2025-11-10'),
      isValid: true,
    },
    isVerified: true,
    location: {
      address: '789 Industrial Area',
      city: 'Sylhet',
      district: 'Sylhet',
      country: 'Bangladesh',
    },
    destinationCountries: ['Qatar', 'Bahrain'],
    contact: {
      phone: '+880-1912-567890',
      email: 'info@easternmanpower.com',
    },
    rating: {
      average: 4.2,
      count: 85,
    },
    specialization: ['Construction', 'Agriculture'],
    description: 'Specialized in construction and agricultural worker placements to Qatar and Bahrain.',
    establishedYear: 2015,
    totalPlacements: 2150,
    isActive: true,
  },
  {
    name: 'Pacific Employment Bureau',
    license: {
      number: 'BMT-2024-004',
      issueDate: new Date('2024-03-20'),
      expiryDate: new Date('2026-03-20'),
      isValid: true,
    },
    isVerified: false, // Not verified
    location: {
      address: '321 Business District',
      city: 'Dhaka',
      district: 'Dhaka',
      country: 'Bangladesh',
    },
    destinationCountries: ['Malaysia', 'Singapore'],
    contact: {
      phone: '+880-1612-678901',
      email: 'admin@pacificemployment.bd',
    },
    rating: {
      average: 4.0,
      count: 42,
    },
    specialization: ['Manufacturing', 'IT & Technology'],
    description: 'Growing agency focusing on Southeast Asian job markets.',
    establishedYear: 2020,
    totalPlacements: 890,
    isActive: true,
  },
  {
    name: 'Reliable Overseas Services',
    license: {
      number: 'BMT-2024-005',
      issueDate: new Date('2023-08-15'),
      expiryDate: new Date('2025-08-15'),
      isValid: true,
    },
    isVerified: true,
    location: {
      address: '555 Export Zone',
      city: 'Dhaka',
      district: 'Dhaka',
      country: 'Bangladesh',
    },
    destinationCountries: ['Oman', 'Jordan', 'Lebanon'],
    contact: {
      phone: '+880-1512-789012',
      email: 'support@reliableoverseas.com',
      website: 'www.reliableoverseas.com',
    },
    rating: {
      average: 4.6,
      count: 156,
    },
    specialization: ['Domestic Work', 'Hospitality'],
    description: 'Reputable agency with strong focus on worker rights and fair employment practices.',
    establishedYear: 2011,
    totalPlacements: 4200,
    isActive: true,
  },
  {
    name: 'Prime Recruitment International',
    license: {
      number: 'BMT-2024-006',
      issueDate: new Date('2024-01-01'),
      expiryDate: new Date('2026-01-01'),
      isValid: true,
    },
    isVerified: true,
    location: {
      address: '888 Central Plaza',
      city: 'Khulna',
      district: 'Khulna',
      country: 'Bangladesh',
    },
    destinationCountries: ['UAE', 'Saudi Arabia'],
    contact: {
      phone: '+880-1412-890123',
      email: 'info@primerecruitment.bd',
    },
    rating: {
      average: 4.3,
      count: 98,
    },
    specialization: ['Construction', 'Other'],
    description: 'Premier recruitment services for skilled and unskilled workers across the Middle East.',
    establishedYear: 2014,
    totalPlacements: 3100,
    isActive: true,
  },
];

// ==================== FUNCTIONS ====================

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

/**
 * Import sample data into database
 */
const importData = async () => {
  try {
    console.log('🌱 Seeding database...\n');

    // Delete existing data
    await Agency.deleteMany();
    console.log('✅ Existing agencies deleted');

    // Insert sample agencies
    const createdAgencies = await Agency.insertMany(sampleAgencies);
    console.log(`✅ ${createdAgencies.length} agencies created`);

    console.log('\n📊 Sample Data Summary:');
    console.log(`   Total Agencies: ${createdAgencies.length}`);
    console.log(`   Verified: ${createdAgencies.filter(a => a.isVerified).length}`);
    console.log(`   Unverified: ${createdAgencies.filter(a => !a.isVerified).length}`);
    
    console.log('\n✨ Database seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

/**
 * Delete all data from database
 */
const deleteData = async () => {
  try {
    console.log('🗑️  Deleting all data...\n');

    await Agency.deleteMany();
    console.log('✅ All agencies deleted');

    console.log('\n🧹 Database cleaned successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting data:', error);
    process.exit(1);
  }
};

// ==================== EXECUTION ====================

// Check command line arguments
if (process.argv[2] === '-d') {
  // Delete data
  connectDB().then(deleteData);
} else {
  // Import data
  connectDB().then(importData);
}
