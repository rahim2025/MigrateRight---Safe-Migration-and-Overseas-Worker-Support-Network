const request = require('supertest');
const app = require('../src/app');

describe('Worker Profile Endpoints', () => {
  it('should create profile', async () => {
    const res = await request(app).post('/api/workers/profile').send({
      personalInfo: { fullName: 'Test User', dateOfBirth: '1990-01-01', gender: 'male', nationality: 'BD' },
      contactInfo: { phone: '123', email: 'test@example.com' },
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('workerId');
  });

  it('should require auth on update', async () => {
    const res = await request(app).patch('/api/workers/profile').send({ contactInfo: { phone: '456' } });
    expect(res.status).toBe(401);
  });
});
