const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getDocuments,
  createDocument,
  getDocument,
  updateDocument,
  validateDocument,
} = require('../controllers/documentController');

// All routes require authentication
router.use(authenticate);

router.get('/', getDocuments);
router.post('/', authorize('admin', 'manager', 'staff'), createDocument);
router.get('/:id', getDocument);
router.put('/:id', authorize('admin', 'manager', 'staff'), updateDocument);
router.post('/:id/validate', authorize('admin', 'manager'), validateDocument);

module.exports = router;

