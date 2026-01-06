/**
 * Comprehensive SOS Notification Test
 * This script will test the entire flow and show exactly what's happening
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const EmergencyEvent = require('../models/EmergencyEvent.model');
const Notification = require('../models/Notification');

async function testSOSFlow() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/migrateright';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Check for admin users
    console.log('Step 1: Checking for admin users...');
    console.log('═══════════════════════════════════════\n');
    
    const admins = await User.find({
      role: { $in: ['platform_admin', 'recruitment_admin', 'admin'] }
    }).select('email role fullName');
    
    console.log(`Found ${admins.length} admin user(s):`);
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.fullName?.firstName} ${admin.fullName?.lastName}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}\n`);
    });
    
    if (admins.length === 0) {
      console.log('❌ ERROR: No admin users found!');
      console.log('Please create an admin user first.\n');
      return;
    }

    // Step 2: Test Notification.createForAllAdmins directly
    console.log('\nStep 2: Testing Notification.createForAllAdmins()...');
    console.log('═══════════════════════════════════════\n');
    
    const testNotifications = await Notification.createForAllAdmins({
      type: 'emergency_sos',
      title: '🚨 TEST Emergency SOS',
      message: 'This is a test emergency notification',
      severity: 'high',
      actionUrl: '/admin/emergencies',
      metadata: {
        workerName: 'Test Worker',
        emergencyType: 'test',
        location: 'Test Location',
      },
    });
    
    console.log(`\n✅ Created ${testNotifications.length} test notification(s)\n`);

    // Step 3: Verify notifications in database
    console.log('Step 3: Verifying notifications in database...');
    console.log('═══════════════════════════════════════\n');
    
    for (const admin of admins) {
      const notifications = await Notification.find({
        userId: admin._id,
        type: 'emergency_sos'
      }).sort({ createdAt: -1 }).limit(5);
      
      console.log(`Admin: ${admin.email}`);
      console.log(`Total SOS notifications: ${notifications.length}`);
      
      if (notifications.length > 0) {
        console.log('Recent notifications:');
        notifications.forEach((notif, index) => {
          console.log(`  ${index + 1}. ${notif.title}`);
          console.log(`     Message: ${notif.message}`);
          console.log(`     Read: ${notif.read ? 'Yes' : 'No'}`);
          console.log(`     Created: ${notif.createdAt}\n`);
        });
      } else {
        console.log('❌ No notifications found for this admin!\n');
      }
    }

    // Step 4: Check recent emergency events
    console.log('\nStep 4: Checking recent emergency events...');
    console.log('═══════════════════════════════════════\n');
    
    const recentEmergencies = await EmergencyEvent.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'email fullName');
    
    console.log(`Found ${recentEmergencies.length} recent emergency event(s):\n`);
    recentEmergencies.forEach((event, index) => {
      console.log(`${index + 1}. ID: ${event._id}`);
      console.log(`   Worker: ${event.workerName}`);
      console.log(`   Type: ${event.emergencyType}`);
      console.log(`   Severity: ${event.severity}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Created: ${event.createdAt}\n`);
    });

    // Step 5: Clean up test notifications
    console.log('Step 5: Cleaning up test notifications...');
    console.log('═══════════════════════════════════════\n');
    
    const deleteResult = await Notification.deleteMany({
      title: '🚨 TEST Emergency SOS'
    });
    
    console.log(`✅ Cleaned up ${deleteResult.deletedCount} test notification(s)\n`);

    // Final Summary
    console.log('\n═══════════════════════════════════════');
    console.log('SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Admin users found: ${admins.length}`);
    console.log(`✅ Notification creation: ${testNotifications.length > 0 ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Recent emergencies: ${recentEmergencies.length}`);
    console.log('═══════════════════════════════════════\n');

    if (testNotifications.length > 0) {
      console.log('✅ TEST PASSED: Notification system is working correctly!');
      console.log('\nNext steps:');
      console.log('1. Make sure backend server is running');
      console.log('2. Try triggering SOS from the frontend');
      console.log('3. Check backend console logs for notification creation');
      console.log('4. Check admin dashboard for notifications\n');
    } else {
      console.log('❌ TEST FAILED: Notifications are not being created');
      console.log('Please check the Notification model and createForAllAdmins method\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testSOSFlow();
