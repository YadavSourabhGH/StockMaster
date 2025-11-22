const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getCategories,
  createCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// All routes require authentication
router.use(authenticate);

router.get('/', getCategories);
router.post('/', authorize('admin', 'manager'), createCategory);
router.delete('/:id', authorize('admin', 'manager'), deleteCategory);

module.exports = router;

