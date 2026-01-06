/**
 * Script to list all users in the database
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function listAllUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/migrateright';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find({})
      .select('email fullName role accountStatus createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    console.log(`📋 All Users in Database (${users.length} most recent):`);
    console.log('='.repeat(80));
    
    if (users.length === 0) {
      console.log('No users found in database.\n');
    } else {
      users.forEach((user, index) => {
        const isAdmin = ['platform_admin', 'recruitment_admin', 'admin'].includes(user.role);
        console.log(`\n${index + 1}. ${isAdmin ? '👑 ' : ''}${user.fullName?.firstName || ''} ${user.fullName?.lastName || ''}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role} ${isAdmin ? '(ADMIN)' : ''}`);
        console.log(`   Status: ${user.accountStatus}`);
        console.log(`   Created: ${user.createdAt}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    
    // Count by role
    const roleCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 Users by Role:');
    roleCounts.forEach(r => {
      console.log(`   ${r._id}: ${r.count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
listAllUsers();
