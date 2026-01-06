/**
 * Script to make a user an admin by their email
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const targetEmail = process.argv[2] || 'mohammad.rahim.bhuiyan20@gmail.com';

async function makeUserAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/migrateright';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find the user
    const user = await User.findOne({ email: targetEmail });

    if (!user) {
      console.log(`❌ User with email "${targetEmail}" not found!`);
      console.log('\nSearching for similar emails...\n');
      
      const similarUsers = await User.find({
        email: new RegExp(targetEmail.split('@')[0], 'i')
      }).select('email fullName role accountStatus').limit(5);
      
      if (similarUsers.length > 0) {
        console.log('Found similar users:');
        similarUsers.forEach((u, i) => {
          console.log(`${i + 1}. ${u.email} - ${u.fullName?.firstName} ${u.fullName?.lastName} (${u.role})`);
        });
      }
    } else {
      console.log(`📋 Current User Details:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.fullName?.firstName || ''} ${user.fullName?.lastName || ''}`);
      console.log(`   Current Role: ${user.role}`);
      console.log(`   Status: ${user.accountStatus}\n`);

      if (user.role === 'platform_admin' || user.role === 'recruitment_admin' || user.role === 'admin') {
        console.log('✅ User already has admin role!');
      } else {
        console.log('🔄 Updating user role to platform_admin...');
        
        user.role = 'platform_admin';
        if (user.accountStatus !== 'active') {
          user.accountStatus = 'active';
          console.log('   Also activating account...');
        }
        
        await user.save();
        
        console.log('\n✅ Successfully updated user!');
        console.log(`   New Role: ${user.role}`);
        console.log(`   Status: ${user.accountStatus}`);
        console.log('\n🎉 User can now receive admin notifications for emergency SOS alerts!');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
makeUserAdmin();
