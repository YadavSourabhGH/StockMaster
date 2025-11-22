const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  getWarehouseById,
  deleteWarehouse,
  getWarehouseStats,
  getWarehouseStock,
} = require('../controllers/warehouseController');

// All routes require authentication
router.use(authenticate);

// Stats endpoint (must be before /:id route)
router.get('/stats', getWarehouseStats);

router.get('/', getWarehouses);
router.post('/', authorize('admin', 'manager'), createWarehouse);
router.get('/:id', getWarehouseById);
router.get('/:id/stock', getWarehouseStock);
router.put('/:id', authorize('admin', 'manager'), updateWarehouse);
router.delete('/:id', authorize('admin', 'manager'), deleteWarehouse);

module.exports = router;

