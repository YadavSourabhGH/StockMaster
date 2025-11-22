const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
} = require('../controllers/warehouseController');

// All routes require authentication
router.use(authenticate);

router.get('/', getWarehouses);
router.post('/', authorize('admin'), createWarehouse);
router.put('/:id', authorize('admin'), updateWarehouse);

module.exports = router;

