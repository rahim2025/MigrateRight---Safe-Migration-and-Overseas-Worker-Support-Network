const express = require('express');
const { getCountryGuide, getCountries } = require('../controllers/countryGuide.controller');

const router = express.Router();

/**
 * @swagger
 * /api/countries:
 *   get:
 *     summary: List supported countries
 *     tags: [Countries]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema: { type: string }
 *       - in: query
 *         name: jobDemand
 *         schema: { type: string }
 * /api/countries/{countryCode}:
 *   get:
 *     summary: Get country guide by ISO code
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: countryCode
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: language
 *         schema: { type: string }
 */

router.get('/', getCountries);
router.get('/:countryCode', getCountryGuide);

module.exports = router;
