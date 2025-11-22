const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getStockMoves } = require('../controllers/stockMoveController');

// All routes require authentication
router.use(authenticate);

router.get('/', getStockMoves);

module.exports = router;

