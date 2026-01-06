/**
 * Activate the admin user account
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function activateAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/migrateright';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find and update the admin user
    const adminEmail = 'mohammadrahimbhuiyan20@gmail.com';
    
    const admin = await User.findOneAndUpdate(
      { email: adminEmail },
      { 
        accountStatus: 'active',
        isVerified: true 
      },
      { new: true }
    ).select('email role accountStatus isVerified fullName');

    if (admin) {
      console.log('✅ Admin account activated successfully!\n');
      console.log('Admin Details:');
      console.log('═══════════════════════════════════════');
      console.log(`Name: ${admin.fullName?.firstName} ${admin.fullName?.lastName}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Role: ${admin.role}`);
      console.log(`Status: ${admin.accountStatus}`);
      console.log(`Verified: ${admin.isVerified}`);
      console.log('═══════════════════════════════════════\n');
      console.log('✅ This admin will now receive SOS emergency notifications!');
    } else {
      console.log('❌ Admin user not found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

activateAdmin();
