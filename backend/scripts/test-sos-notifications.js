/**
 * Test script to verify SOS notification flow
 * This script tests the complete flow of:
 * 1. Worker triggering SOS
 * 2. Admin receiving notification
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const EmergencyEvent = require('../models/EmergencyEvent.model');
const Notification = require('../models/Notification');

async function testSOSNotificationFlow() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/migrateright';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Find or create a test worker
    console.log('Step 1: Finding test worker...');
    let worker = await User.findOne({ role: 'worker_abroad', accountStatus: 'active' });
    
    if (!worker) {
      console.log('No active worker found. Creating test worker...');
      worker = new User({
        email: 'worker@test.com',
        phoneNumber: '+8801700000001',
        password: 'Worker@123456',
        role: 'worker_abroad',
        accountStatus: 'active',
        fullName: {
          firstName: 'Test',
          lastName: 'Worker'
        },
        dateOfBirth: new Date('1995-01-01'),
        gender: 'male',
        isVerified: true
      });
      await worker.save();
      console.log('✅ Created test worker');
    } else {
      console.log(`✅ Found worker: ${worker.fullName.firstName} ${worker.fullName.lastName}`);
    }

    // Step 2: Find admin user
    console.log('\nStep 2: Finding admin user...');
    const admin = await User.findOne({ 
      role: { $in: ['platform_admin', 'recruitment_admin'] },
      accountStatus: 'active'
    });
    
    if (!admin) {
      console.log('❌ No active admin found! Please run check-admin-users.js first.');
      return;
    }
    console.log(`✅ Found admin: ${admin.fullName.firstName} ${admin.fullName.lastName} (${admin.email})`);

    // Step 3: Clear old test notifications
    console.log('\nStep 3: Clearing old test notifications...');
    await Notification.deleteMany({ userId: admin._id, type: 'emergency_sos' });
    console.log('✅ Cleared old notifications');

    // Step 4: Create a test emergency SOS event
    console.log('\nStep 4: Creating test SOS emergency event...');
    const emergencyEvent = await EmergencyEvent.create({
      userId: worker._id,
      workerName: `${worker.fullName.firstName} ${worker.fullName.lastName}`,
      workerPhone: worker.phoneNumber,
      emergencyType: 'medical',
      description: 'Test emergency - Medical assistance needed',
      severity: 'high',
      location: {
        type: 'Point',
        coordinates: [90.4125, 23.8103] // Dhaka, Bangladesh coordinates
      },
      locationDetails: {
        country: 'Bangladesh',
        city: 'Dhaka',
        address: 'Test Location'
      },
      nearestContacts: [],
      familyNotifications: [],
      timeline: [
        {
          action: 'sos_triggered',
          description: `Test SOS triggered by ${worker.fullName.firstName} ${worker.fullName.lastName}`,
        },
      ],
    });
    console.log(`✅ Created emergency event: ${emergencyEvent._id}`);

    // Step 5: Create notifications for all admins (simulating controller behavior)
    console.log('\nStep 5: Creating admin notifications...');
    const adminNotifications = await Notification.createForAllAdmins({
      type: 'emergency_sos',
      title: `🚨 ${emergencyEvent.severity.toUpperCase()} Emergency SOS`,
      message: `${worker.fullName.firstName} ${worker.fullName.lastName} triggered an emergency SOS alert (${emergencyEvent.emergencyType.replace('_', ' ')})`,
      severity: emergencyEvent.severity,
      relatedId: emergencyEvent._id,
      relatedModel: 'EmergencyEvent',
      actionUrl: `/admin/emergencies`,
      metadata: {
        workerName: `${worker.fullName.firstName} ${worker.fullName.lastName}`,
        emergencyType: emergencyEvent.emergencyType,
        location: emergencyEvent.locationDetails?.city || 'Unknown location',
      },
    });

    // Step 6: Verify notifications were created
    console.log('\nStep 6: Verifying notifications...');
    const adminNotifs = await Notification.find({
      userId: admin._id,
      type: 'emergency_sos',
      relatedId: emergencyEvent._id
    });

    if (adminNotifs.length > 0) {
      console.log(`✅ SUCCESS! Admin received ${adminNotifs.length} notification(s):`);
      adminNotifs.forEach((notif, index) => {
        console.log(`\n   Notification ${index + 1}:`);
        console.log(`   Title: ${notif.title}`);
        console.log(`   Message: ${notif.message}`);
        console.log(`   Severity: ${notif.severity}`);
        console.log(`   Read: ${notif.read ? 'Yes' : 'No'}`);
        console.log(`   Created: ${notif.createdAt}`);
      });
      
      console.log('\n✅ TEST PASSED: SOS notification flow is working correctly!');
      console.log('\n📝 Next steps:');
      console.log('   1. Try logging in as admin on the frontend');
      console.log('   2. Navigate to the Emergency Alerts page');
      console.log('   3. You should see the SOS alert and notification');
    } else {
      console.log('❌ FAILED: No notifications were created for admin');
      console.log('This indicates a problem with the notification creation logic.');
    }

    // Display summary
    console.log('\n═══════════════════════════════════════');
    console.log('TEST SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Worker: ${worker.email}`);
    console.log(`Admin: ${admin.email}`);
    console.log(`Emergency ID: ${emergencyEvent._id}`);
    console.log(`Notifications Created: ${adminNotifications.length}`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testSOSNotificationFlow();
