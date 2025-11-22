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
const upload = require('../middleware/upload');

// All routes require authentication
router.use(authenticate);

router.get('/', getProducts);
router.get('/:id', getProduct);
// Accept image uploads as multipart/form-data field named 'image'
router.post('/', authorize('admin', 'manager'), upload.single('image'), createProduct);
router.put('/:id', authorize('admin', 'manager'), upload.single('image'), updateProduct);
router.delete('/:id', authorize('admin'), deleteProduct);
router.get('/:id/stock', getProductStock);

module.exports = router;

