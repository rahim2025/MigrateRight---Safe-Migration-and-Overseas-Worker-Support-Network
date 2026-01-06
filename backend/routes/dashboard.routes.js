const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
// Add validation/auth middleware if needed (e.g., protectRoute, restrictTo('platform_admin'))
// const { protect, restrictTo } = require('../middleware/auth.middleware');

// GET /api/dashboard/stats
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
