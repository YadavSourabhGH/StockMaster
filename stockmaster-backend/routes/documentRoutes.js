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
const { extractReceipt } = require('../controllers/ocrController');
const upload = require('../middleware/upload');
const { getReceiptImage } = require('../controllers/documentController');

// All routes require authentication
router.use(authenticate);

router.get('/', getDocuments);
router.post('/', authorize('admin', 'manager', 'staff'), upload.single('image'), createDocument);
router.get('/:id', getDocument);
router.put('/:id', authorize('admin', 'manager', 'staff'), updateDocument);
router.post('/:id/validate', authorize('admin', 'manager'), validateDocument);
// OCR extract: accept multipart form-data with field 'image'
router.post('/ocr/extract-receipt', authorize('admin', 'manager', 'staff'), upload.single('image'), extractReceipt);

// Download/serve stored receipt image
router.get('/:id/receipt-image', authorize('admin', 'manager', 'staff'), getReceiptImage);

module.exports = router;

