const express = require('express');
const { calculateLegalFees, compareLegalFees } = require('../controllers/calculator.controller');

const router = express.Router();

/**
 * @swagger
 * /api/calculator/fees:
 *   post:
 *     summary: Calculate legal fees
 *     tags: [Calculator]
 * /api/calculator/fees/compare:
 *   post:
 *     summary: Compare agency fees with legal limits and warnings
 *     tags: [Calculator]
 */
router.post('/fees', calculateLegalFees);
router.post('/fees/compare', compareLegalFees);

module.exports = router;
