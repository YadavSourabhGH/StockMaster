const Document = require('../models/Document');
const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const { validateDocument } = require('../services/stockEngine');

const getDocuments = async (req, res) => {
  try {
    const {
      type,
      status,
      warehouse,
      dateFrom,
      dateTo,
      productId,
    } = req.query;

    const query = {};

    if (type) {
      query.docType = type;
    }

    if (status) {
      query.status = status;
    }

    if (warehouse) {
      query.$or = [
        { fromWarehouse: warehouse },
        { toWarehouse: warehouse },
      ];
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    if (productId) {
      query['lines.productId'] = productId;
    }

    const documents = await Document.find(query)
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email')
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('lines.productId', 'name sku')
      .sort({ createdAt: -1 });
    // Convert receiptImage buffers to data URLs for frontend
    const docsWithImages = documents.map((d) => {
      const obj = d.toObject();
      if (obj.receiptImage && obj.receiptImage.data) {
        obj.receiptImage = `data:${obj.receiptImage.contentType};base64,${obj.receiptImage.data.toString('base64')}`;
      }
      return obj;
    });

    res.json({
      success: true,
      message: 'Documents retrieved successfully',
      data: docsWithImages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: { details: error.message },
    });
  }
};

const createDocument = async (req, res) => {
  try {
    let {
      docType,
      fromWarehouse,
      toWarehouse,
      counterparty,
      reason,
      lines,
    } = req.body;

    // Parse lines if it comes as JSON string from FormData
    if (typeof lines === 'string') {
      try {
        lines = JSON.parse(lines);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lines format',
          error: { code: 'VALIDATION_ERROR' },
        });
      }
    }

    if (!docType || !lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Document type and at least one line are required',
        error: { code: 'VALIDATION_ERROR' },
      });
    }

    // Validate document type
    const validTypes = ['RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT'];
    if (!validTypes.includes(docType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid document type. Must be one of: ${validTypes.join(', ')}`,
        error: { code: 'INVALID_TYPE' },
      });
    }

    // Validate warehouses based on document type
    if (docType === 'RECEIPT' && !toWarehouse) {
      return res.status(400).json({
        success: false,
        message: 'Receipt must have a destination warehouse',
        error: { code: 'VALIDATION_ERROR' },
      });
    }

    if (docType === 'DELIVERY' && !fromWarehouse) {
      return res.status(400).json({
        success: false,
        message: 'Delivery must have a source warehouse',
        error: { code: 'VALIDATION_ERROR' },
      });
    }

    if (docType === 'TRANSFER' && (!fromWarehouse || !toWarehouse)) {
      return res.status(400).json({
        success: false,
        message: 'Transfer must have both source and destination warehouses',
        error: { code: 'VALIDATION_ERROR' },
      });
    }

    if (docType === 'ADJUSTMENT' && !toWarehouse) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment must have a warehouse',
        error: { code: 'VALIDATION_ERROR' },
      });
    }

    // Validate warehouses exist
    if (fromWarehouse) {
      const fromWH = await Warehouse.findById(fromWarehouse);
      if (!fromWH) {
        return res.status(404).json({
          success: false,
          message: 'Source warehouse not found',
          error: { code: 'WAREHOUSE_NOT_FOUND' },
        });
      }
    }

    if (toWarehouse) {
      const toWH = await Warehouse.findById(toWarehouse);
      if (!toWH) {
        return res.status(404).json({
          success: false,
          message: 'Destination warehouse not found',
          error: { code: 'WAREHOUSE_NOT_FOUND' },
        });
      }
    }

    // Validate products exist
    for (const line of lines) {
      if (!line.productId || !line.quantity || line.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each line must have a valid product and quantity > 0',
          error: { code: 'VALIDATION_ERROR' },
        });
      }

      const product = await Product.findById(line.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${line.productId} not found`,
          error: { code: 'PRODUCT_NOT_FOUND' },
        });
      }
    }

    const document = new Document({
      docType,
      status: 'DRAFT',
      createdBy: req.user._id,
      fromWarehouse,
      toWarehouse,
      counterparty: counterparty || '',
      reason: reason || '',
      lines,
    });

    // If an image was uploaded with the request (e.g., receipt photo), store it
    if (req.file && req.file.buffer) {
      document.receiptImage = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
      // Optionally mark receipt documents as READY if image provided
      if (docType === 'RECEIPT') document.status = 'READY';
    }

    await document.save();

    const populatedDoc = await Document.findById(document._id)
      .populate('createdBy', 'name email')
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('lines.productId', 'name sku');

    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      data: populatedDoc,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating document',
      error: { details: error.message },
    });
  }
};

const getReceiptImage = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc || !doc.receiptImage || !doc.receiptImage.data) {
      return res.status(404).json({ success: false, message: 'Receipt image not found' });
    }

    res.set('Content-Type', doc.receiptImage.contentType || 'application/octet-stream');
    res.set('Content-Disposition', `inline; filename="receipt-${doc._id}"`);
    res.send(doc.receiptImage.data);
  } catch (error) {
    console.error('Error fetching receipt image', error);
    res.status(500).json({ success: false, message: 'Error fetching receipt image', error: { details: error.message } });
  }
};

const getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email')
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('lines.productId', 'name sku');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
        error: { code: 'NOT_FOUND' },
      });
    }

    const obj = document.toObject();
    if (obj.receiptImage && obj.receiptImage.data) {
      obj.receiptImage = `data:${obj.receiptImage.contentType};base64,${obj.receiptImage.data.toString('base64')}`;
    }
    res.json({
      success: true,
      message: 'Document retrieved successfully',
      data: obj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching document',
      error: { details: error.message },
    });
  }
};

const updateDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
        error: { code: 'NOT_FOUND' },
      });
    }

    if (document.status === 'DONE') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit a document that is already validated (DONE)',
        error: { code: 'DOCUMENT_LOCKED' },
      });
    }

    if (document.status === 'CANCELED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit a canceled document',
        error: { code: 'DOCUMENT_CANCELED' },
      });
    }

    const {
      fromWarehouse,
      toWarehouse,
      counterparty,
      reason,
      lines,
    } = req.body;

    // Validate warehouses if provided
    if (fromWarehouse) {
      const fromWH = await Warehouse.findById(fromWarehouse);
      if (!fromWH) {
        return res.status(404).json({
          success: false,
          message: 'Source warehouse not found',
          error: { code: 'WAREHOUSE_NOT_FOUND' },
        });
      }
      document.fromWarehouse = fromWarehouse;
    }

    if (toWarehouse) {
      const toWH = await Warehouse.findById(toWarehouse);
      if (!toWH) {
        return res.status(404).json({
          success: false,
          message: 'Destination warehouse not found',
          error: { code: 'WAREHOUSE_NOT_FOUND' },
        });
      }
      document.toWarehouse = toWarehouse;
    }

    if (counterparty !== undefined) document.counterparty = counterparty;
    if (reason !== undefined) document.reason = reason;

    if (lines && Array.isArray(lines) && lines.length > 0) {
      // Validate products
      for (const line of lines) {
        if (!line.productId || !line.quantity || line.quantity <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Each line must have a valid product and quantity > 0',
            error: { code: 'VALIDATION_ERROR' },
          });
        }

        const product = await Product.findById(line.productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product ${line.productId} not found`,
            error: { code: 'PRODUCT_NOT_FOUND' },
          });
        }
      }
      document.lines = lines;
    }

    await document.save();

    const updatedDoc = await Document.findById(document._id)
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email')
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('lines.productId', 'name sku');

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: updatedDoc,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating document',
      error: { details: error.message },
    });
  }
};

const validateDocumentEndpoint = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
        error: { code: 'NOT_FOUND' },
      });
    }

    // Check permissions based on document type and user role
    const userRole = req.user.role;
    const docType = document.docType;

    // Staff can only execute, not validate
    if (userRole === 'staff' && document.status !== 'READY') {
      return res.status(403).json({
        success: false,
        message: 'Staff can only execute documents in READY status',
        error: { code: 'INSUFFICIENT_PERMISSIONS' },
      });
    }

    // Manager and Admin can validate
    if (['manager', 'admin'].includes(userRole)) {
      // Validate the document using stock engine
      await validateDocument(req.params.id, req.user._id);

      const updatedDoc = await Document.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('validatedBy', 'name email')
        .populate('fromWarehouse', 'name code')
        .populate('toWarehouse', 'name code')
        .populate('lines.productId', 'name sku');

      res.json({
        success: true,
        message: 'Document validated successfully',
        data: updatedDoc,
      });
    } else {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to validate documents',
        error: { code: 'INSUFFICIENT_PERMISSIONS' },
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error validating document',
      error: { details: error.message },
    });
  }
};

module.exports = {
  getDocuments,
  createDocument,
  getDocument,
  updateDocument,
  validateDocument: validateDocumentEndpoint,
  getReceiptImage,
};

