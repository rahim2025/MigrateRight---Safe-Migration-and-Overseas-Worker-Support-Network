/**
 * Comprehensive API Tests
 * Tests all main endpoints to verify functionality
 */

const request = require('supertest');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000/api';

// Test data
let userId;
let agencyId;
let workerId;
let authToken;

describe('MigrateRight API - Comprehensive Tests', () => {
  
  // ==================== HEALTH CHECK ====================
  describe('Health Check API', () => {
    it('should return health status', async () => {
      const res = await request(BASE_URL)
        .get('/health')
        .expect(200);
      
      expect(res.body.status).toBeDefined();
      expect(res.body.success).toBe(true);
    });

    it('should return detailed health status', async () => {
      const res = await request(BASE_URL)
        .get('/health/detailed')
        .expect(200);
      
      expect(res.body.database).toBeDefined();
      expect(res.body.uptime).toBeDefined();
    });
  });

  // ==================== AUTHENTICATION ====================
  describe('Authentication API', () => {
    const testUser = {
      email: `test-${Date.now()}@migrateright.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      userType: 'worker',
      phone: '+8801234567890'
    };

    it('should register a new user', async () => {
      const res = await request(BASE_URL)
        .post('/auth/register')
        .send(testUser)
        .expect(201);
      
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      authToken = res.body.token;
      userId = res.body.user._id;
    });

    it('should login user', async () => {
      const res = await request(BASE_URL)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      authToken = res.body.token;
    });

    it('should get current user', async () => {
      const res = await request(BASE_URL)
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should request password reset', async () => {
      const res = await request(BASE_URL)
        .post('/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);
      
      expect(res.body.success).toBe(true);
    });
  });

  // ==================== COUNTRY GUIDES ====================
  describe('Country Guide API', () => {
    it('should get all country guides', async () => {
      const res = await request(BASE_URL)
        .get('/countries')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should get country guide by code (SA)', async () => {
      const res = await request(BASE_URL)
        .get('/countries/SA')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.countryCode).toBe('SA');
      expect(res.body.data.salaryRanges).toBeDefined();
    });

    it('should get country guide by full name', async () => {
      const res = await request(BASE_URL)
        .get('/countries/Saudi Arabia')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.country).toBe('Saudi Arabia');
    });

    it('should get regions', async () => {
      const res = await request(BASE_URL)
        .get('/countries/meta/regions')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.regions)).toBe(true);
    });

    it('should get job types', async () => {
      const res = await request(BASE_URL)
        .get('/countries/meta/job-types')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.jobTypes)).toBe(true);
    });

    it('should search by job type', async () => {
      const res = await request(BASE_URL)
        .get('/countries/search/job/construction')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get countries by region', async () => {
      const res = await request(BASE_URL)
        .get('/countries/region/Middle East')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by query parameters', async () => {
      const res = await request(BASE_URL)
        .get('/countries?region=Middle East&limit=5')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ==================== CALCULATOR ====================
  describe('Calculator API', () => {
    it('should get available countries', async () => {
      const res = await request(BASE_URL)
        .get('/calculator/countries')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get job types by country', async () => {
      const res = await request(BASE_URL)
        .get('/calculator/countries/SA/jobs')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.jobTypes)).toBe(true);
    });

    it('should get fee rules', async () => {
      const res = await request(BASE_URL)
        .get('/calculator/fee-rules?country=SA&jobType=domestic_work')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should calculate migration cost', async () => {
      const res = await request(BASE_URL)
        .post('/calculator/calculate')
        .send({
          destinationCountry: 'SA',
          jobType: 'domestic_work',
          agencyFee: 2500,
          additionalCosts: {
            airfare: 600,
            documentation: 200
          }
        })
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalUserCosts).toBeDefined();
      expect(res.body.data.feeComparison).toBeDefined();
    });
  });

  // ==================== AGENCIES ====================
  describe('Agency API', () => {
    it('should get all agencies', async () => {
      const res = await request(BASE_URL)
        .get('/agencies')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get agency stats', async () => {
      const res = await request(BASE_URL)
        .get('/agencies/stats')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalAgencies).toBeDefined();
    });

    it('should get top rated agencies', async () => {
      const res = await request(BASE_URL)
        .get('/agencies/top-rated')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get agencies by city', async () => {
      const res = await request(BASE_URL)
        .get('/agencies/city/Dhaka')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ==================== EMERGENCY ====================
  describe('Emergency API', () => {
    it('should get nearest emergency contacts', async () => {
      const res = await request(BASE_URL)
        .get('/emergency/contacts/nearest?country=SA')
        .expect(200);
      
      expect(res.body.success).toBe(true);
    });

    it('should get contacts by country', async () => {
      const res = await request(BASE_URL)
        .get('/emergency/contacts/country/SA')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data) || res.body.data === null).toBe(true);
    });

    it('should trigger SOS with authentication', async () => {
      if (!authToken) {
        console.log('Skipping SOS test - no auth token');
        return;
      }

      const res = await request(BASE_URL)
        .post('/emergency/sos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          country: 'SA',
          description: 'Need urgent help',
          severity: 'high'
        })
        .expect(201);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBeDefined();
    });
  });

  // ==================== SALARY TRACKING ====================
  describe('Salary Tracker API', () => {
    it('should create salary record', async () => {
      if (!authToken) {
        console.log('Skipping salary test - no auth token');
        return;
      }

      const res = await request(BASE_URL)
        .post('/salary')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          month: 'January',
          year: 2026,
          expectedAmount: 5000,
          receivedAmount: 4500,
          currency: 'SAR',
          jobType: 'domestic_work',
          country: 'SA'
        })
        .expect(201);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBeDefined();
    });

    it('should get salary records', async () => {
      if (!authToken) {
        console.log('Skipping salary test - no auth token');
        return;
      }

      const res = await request(BASE_URL)
        .get('/salary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get salary statistics', async () => {
      if (!authToken) {
        console.log('Skipping salary test - no auth token');
        return;
      }

      const res = await request(BASE_URL)
        .get('/salary/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(res.body.success).toBe(true);
    });
  });

  // ==================== USERS ====================
  describe('User API', () => {
    it('should get current user profile', async () => {
      if (!authToken) {
        console.log('Skipping user profile test - no auth token');
        return;
      }

      const res = await request(BASE_URL)
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBeDefined();
    });

    it('should update user profile', async () => {
      if (!authToken) {
        console.log('Skipping user update test - no auth token');
        return;
      }

      const res = await request(BASE_URL)
        .patch('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          phone: '+8801987654321'
        })
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.user.firstName).toBe('Updated');
    });

    it('should get user by ID', async () => {
      if (!userId) {
        console.log('Skipping get user test - no user ID');
        return;
      }

      const res = await request(BASE_URL)
        .get(`/users/${userId}`)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.user._id).toBe(userId);
    });
  });

});

// ==================== CURL COMMAND REFERENCE ====================
/**
 * QUICK TEST COMMANDS (Copy & Paste in Terminal)
 * 
 * HEALTH CHECK:
 * curl http://localhost:5000/api/health
 * 
 * COUNTRY GUIDES:
 * curl http://localhost:5000/api/countries
 * curl http://localhost:5000/api/countries/SA
 * curl "http://localhost:5000/api/countries?region=Middle%20East"
 * 
 * CALCULATOR:
 * curl http://localhost:5000/api/calculator/countries
 * curl http://localhost:5000/api/calculator/countries/SA/jobs
 * curl -X POST http://localhost:5000/api/calculator/calculate \
 *   -H "Content-Type: application/json" \
 *   -d '{"destinationCountry":"SA","jobType":"domestic_work","agencyFee":2500}'
 * 
 * AGENCIES:
 * curl http://localhost:5000/api/agencies
 * curl http://localhost:5000/api/agencies/top-rated
 * curl http://localhost:5000/api/agencies/stats
 * 
 * EMERGENCY:
 * curl "http://localhost:5000/api/emergency/contacts/country/SA"
 * 
 * AUTHENTICATION:
 * curl -X POST http://localhost:5000/api/auth/register \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "email":"test@example.com",
 *     "password":"TestPass123!",
 *     "firstName":"Test",
 *     "lastName":"User",
 *     "userType":"worker",
 *     "phone":"+8801234567890"
 *   }'
 * 
 * curl -X POST http://localhost:5000/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"test@example.com","password":"TestPass123!"}'
 */
