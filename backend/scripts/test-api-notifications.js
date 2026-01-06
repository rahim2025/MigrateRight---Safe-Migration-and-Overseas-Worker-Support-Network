/**
 * Test API endpoints to verify notifications are accessible
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testNotificationAPI() {
  try {
    console.log('Testing Notification API...\n');
    console.log('═══════════════════════════════════════\n');

    // Step 1: Login as admin
    console.log('Step 1: Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'mohammadrahimbhuiyan20@gmail.com',
      password: 'your_password_here', // Replace with actual password
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    console.log(`Token: ${token.substring(0, 20)}...\n`);

    // Step 2: Fetch notifications
    console.log('Step 2: Fetching notifications...');
    const notificationsResponse = await axios.get(
      `${API_BASE_URL}/notifications?unreadOnly=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ Notifications fetched successfully');
    console.log(`Total notifications: ${notificationsResponse.data.count}`);
    console.log(`Unread count: ${notificationsResponse.data.unreadCount}\n`);

    if (notificationsResponse.data.data && notificationsResponse.data.data.length > 0) {
      console.log('Recent notifications:');
      notificationsResponse.data.data.forEach((notif, index) => {
        console.log(`\n${index + 1}. ${notif.title}`);
        console.log(`   Message: ${notif.message}`);
        console.log(`   Type: ${notif.type}`);
        console.log(`   Severity: ${notif.severity}`);
        console.log(`   Read: ${notif.read ? 'Yes' : 'No'}`);
        console.log(`   Created: ${notif.createdAt}`);
      });
    } else {
      console.log('No notifications found');
    }

    // Step 3: Fetch all notifications (not just unread)
    console.log('\n\nStep 3: Fetching all notifications...');
    const allNotificationsResponse = await axios.get(
      `${API_BASE_URL}/notifications?limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ All notifications fetched');
    console.log(`Total: ${allNotificationsResponse.data.count}\n`);

    // Step 4: Fetch active emergencies
    console.log('Step 4: Fetching active emergencies...');
    const emergenciesResponse = await axios.get(
      `${API_BASE_URL}/emergency/admin/active`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ Emergencies fetched');
    console.log(`Active emergencies: ${emergenciesResponse.data.count}\n`);

    if (emergenciesResponse.data.data && emergenciesResponse.data.data.length > 0) {
      console.log('Active emergencies:');
      emergenciesResponse.data.data.forEach((emergency, index) => {
        console.log(`\n${index + 1}. ${emergency.workerName}`);
        console.log(`   Type: ${emergency.emergencyType}`);
        console.log(`   Severity: ${emergency.severity}`);
        console.log(`   Status: ${emergency.status}`);
        console.log(`   Created: ${emergency.createdAt}`);
      });
    }

    console.log('\n\n═══════════════════════════════════════');
    console.log('TEST COMPLETED SUCCESSFULLY');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n⚠️  Authentication failed. Please check:');
      console.log('   1. Email and password are correct');
      console.log('   2. Backend server is running on http://localhost:5000');
      console.log('   3. User exists in database\n');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Cannot connect to backend server');
      console.log('   Please make sure the backend is running on http://localhost:5000\n');
    }
  }
}

// Run the test
testNotificationAPI();
