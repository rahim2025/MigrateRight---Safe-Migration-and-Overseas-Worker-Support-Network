const request = require('supertest');
const app = require('../src/app');

describe('Country Guide Endpoints', () => {
  it('should list countries', async () => {
    const res = await request(app).get('/api/countries');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.countries)).toBe(true);
  });

  it('should get country guide by code', async () => {
    const res = await request(app).get('/api/countries/SA');
    expect(res.status).toBe(200);
    expect(res.body.countryInfo.code).toBe('SA');
  });
});
