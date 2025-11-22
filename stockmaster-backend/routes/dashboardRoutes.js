const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getSummary, getActivity, getChartData } = require('../controllers/dashboardController');

router.get('/summary', authenticate, getSummary);
router.get('/activity', authenticate, getActivity);
router.get('/chart', authenticate, getChartData);

module.exports = router;

