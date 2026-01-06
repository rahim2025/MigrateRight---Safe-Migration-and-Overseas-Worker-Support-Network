/**
 * Script to check if there are admin users in the database
 * and create one if needed for testing emergency notifications
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');

async function checkAndCreateAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/migrateright';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check for existing admins
    const admins = await User.find({
      role: { $in: ['platform_admin', 'recruitment_admin', 'admin'] }
    }).select('email role fullName accountStatus');
    
    // Also check for the specific user mentioned
    const specificUser = await User.findOne({
      email: 'mohammad.rahim.bhuiyan20@gmail.com'
    }).select('email role fullName accountStatus');
    
    if (specificUser) {
      console.log('\n🔍 Checking specific user: mohammad.rahim.bhuiyan20@gmail.com');
      console.log(`   Name: ${specificUser.fullName?.firstName || ''} ${specificUser.fullName?.lastName || ''}`);
      console.log(`   Role: ${specificUser.role}`);
      console.log(`   Status: ${specificUser.accountStatus}`);
      console.log(`   Is Admin Role?: ${['platform_admin', 'recruitment_admin', 'admin'].includes(specificUser.role) ? 'YES ✅' : 'NO ❌'}`);
      console.log('');
    }

    console.log('\n📋 Current Admin Users:');
    console.log('========================');
    
    if (admins.length === 0) {
      console.log('❌ No admin users found!\n');
      console.log('Creating a test admin user...\n');
      
      // Create a test admin user
      const testAdmin = new User({
        email: 'admin@migrateright.com',
        phoneNumber: '+8801700000000',
        password: 'Admin@123456', // This will be hashed by the pre-save middleware
        role: 'platform_admin',
        accountStatus: 'active',
        fullName: {
          firstName: 'System',
          lastName: 'Administrator'
        },
        dateOfBirth: new Date('1990-01-01'),
        gender: 'prefer_not_to_say',
        isVerified: true
      });

      await testAdmin.save();
      console.log('✅ Created test admin user:');
      console.log('   Email: admin@migrateright.com');
      console.log('   Password: Admin@123456');
      console.log('   Role: platform_admin');
      console.log('\n⚠️  Please change this password in production!\n');
    } else {
      console.log(`Found ${admins.length} admin user(s):\n`);
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.fullName?.firstName || ''} ${admin.fullName?.lastName || ''}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Status: ${admin.accountStatus}`);
        console.log('');
      });

      // Check if all admins are active
      const inactiveAdmins = admins.filter(a => a.accountStatus !== 'active');
      if (inactiveAdmins.length > 0) {
        console.log('⚠️  WARNING: Some admin users are not active!');
        console.log('Emergency notifications will only be sent to active admins.\n');
      }
    }

    // Check recent notifications
    const Notification = require('../models/Notification');
    const recentNotifications = await Notification.find({
      type: 'emergency_sos'
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'email role');

    console.log('\n📬 Recent Emergency SOS Notifications:');
    console.log('=======================================');
    if (recentNotifications.length === 0) {
      console.log('No emergency SOS notifications found.\n');
    } else {
      recentNotifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title}`);
        console.log(`   To: ${notif.userId?.email} (${notif.userId?.role})`);
        console.log(`   Created: ${notif.createdAt}`);
        console.log(`   Read: ${notif.read ? 'Yes' : 'No'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
checkAndCreateAdmin();
