const request = require('supertest');
const app = require('../src/app');

describe('Calculator Endpoints', () => {
  it('should calculate legal fees', async () => {
    const res = await request(app).post('/api/calculator/fees').send({ destinationCountry: 'Saudi Arabia' });
    expect(res.status).toBe(200);
    expect(res.body.legalFeeBreakdown).toBeDefined();
  });

  it('should compare fees and return warnings', async () => {
    const res = await request(app).post('/api/calculator/fees/compare').send({
      destinationCountry: 'Saudi Arabia',
      actualFees: { visaApplicationFee: 5000 },
    });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.itemizedComparison)).toBe(true);
  });
});
