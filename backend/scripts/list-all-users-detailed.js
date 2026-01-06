/**
 * List all users in the database with their roles
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function listAllUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/migrateright';
    console.log('Connecting to:', mongoUri.replace(/:\/\/([^:]+):([^@]+)@/, '://***:***@')); // Hide credentials
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get database name
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Database: ${dbName}\n`);

    // Count total users
    const totalUsers = await User.countDocuments();
    console.log(`Total users in database: ${totalUsers}\n`);

    // Get all users
    const users = await User.find({}).select('email phoneNumber role accountStatus fullName createdAt');
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('ALL USERS IN DATABASE');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName?.firstName || ''} ${user.fullName?.lastName || ''}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phoneNumber}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.accountStatus}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });

    // Find the user with the specific email
    const specificUser = await User.findOne({ email: 'mohammad.rahim.bhuiyan20@gmail.com' });
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('SEARCHING FOR: mohammad.rahim.bhuiyan20@gmail.com');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    if (specificUser) {
      console.log('✅ FOUND:');
      console.log(`   Name: ${specificUser.fullName?.firstName} ${specificUser.fullName?.lastName}`);
      console.log(`   Email: ${specificUser.email}`);
      console.log(`   Role: ${specificUser.role}`);
      console.log(`   Status: ${specificUser.accountStatus}`);
      console.log(`   Is Admin: ${['platform_admin', 'recruitment_admin', 'admin'].includes(specificUser.role) ? 'YES' : 'NO'}`);
    } else {
      console.log('❌ NOT FOUND in database');
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('ADMIN USERS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const admins = await User.find({
      role: { $in: ['platform_admin', 'recruitment_admin', 'admin'] }
    }).select('email role accountStatus fullName');
    
    if (admins.length === 0) {
      console.log('❌ No admin users found!\n');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.fullName?.firstName || ''} ${admin.fullName?.lastName || ''}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Status: ${admin.accountStatus}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

listAllUsers();
