const request = require('supertest');
const app = require('../src/app');

describe('Agency Review and Complaint Endpoints', () => {
  it('should block review without auth', async () => {
    const res = await request(app).post('/api/agencies/123/reviews').send({ rating: 5, workerId: 'w1' });
    expect(res.status).toBe(401);
  });

  it('should reject complaint with short description', async () => {
    const res = await request(app).post('/api/agencies/123/complaints').send({
      workerId: 'w1',
      complaintType: 'other',
      description: 'short',
    });
    expect(res.status).toBe(400);
  });
});
