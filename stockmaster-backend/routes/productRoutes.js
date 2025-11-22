const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductStock,
} = require('../controllers/productController');

// All routes require authentication
router.use(authenticate);

router.get('/', getProducts);
router.post('/', authorize('admin', 'manager'), createProduct);
router.get('/:id', getProduct);
router.put('/:id', authorize('admin', 'manager'), updateProduct);
router.delete('/:id', authorize('admin'), deleteProduct);
router.get('/:id/stock', getProductStock);

module.exports = router;

