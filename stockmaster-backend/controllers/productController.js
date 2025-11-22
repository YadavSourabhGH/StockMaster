const Product = require('../models/Product');
const StockLevel = require('../models/StockLevel');
const Document = require('../models/Document');
const { validateDocument } = require('../services/stockEngine');

const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 });

    // Convert image buffers to data URLs for responses
    const productsWithImages = products.map((p) => {
      const obj = p.toObject();
      if (obj.image && obj.image.data) {
        const base64 = obj.image.data.toString('base64');
        obj.image = `data:${obj.image.contentType};base64,${base64}`;
      } else {
        obj.image = '';
      }
      return obj;
    });

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: productsWithImages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: { details: error.message },
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, sku, category, uom, reorderLevel, initialStock, defaultWarehouse } = req.body;

    if (!name || !sku || !category || !uom) {
      return res.status(400).json({
        success: false,
        message: 'Name, SKU, category, and UOM are required',
        error: { code: 'VALIDATION_ERROR' },
      });
    }

    // Check if SKU exists
    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists',
        error: { code: 'SKU_EXISTS' },
      });
    }

    const product = new Product({
      name,
      sku: sku.toUpperCase(),
      category,
      uom,
      reorderLevel: reorderLevel || 0,
      createdBy: req.user._id,
    });

    // Handle uploaded file (multer memory buffer) or legacy base64 image
    if (req.file && req.file.buffer) {
      product.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    } else if (typeof req.body.image === 'string' && req.body.image.startsWith('data:')) {
      const matches = req.body.image.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        product.image = {
          data: Buffer.from(matches[2], 'base64'),
          contentType: matches[1],
        };
      }
    }

    await product.save();

    // Handle initial stock if provided
    // Note: For now, we'll skip automatic stock creation. 
    // Users can create receipts/adjustments manually after product creation.
    // This can be enhanced later to create initial stock automatically.

    const populatedProductDoc = await Product.findById(product._id)
      .populate('createdBy', 'name email');

    // Ensure returned object has image as data URL
    const populatedProduct = populatedProductDoc.toObject();
    if (populatedProduct.image && populatedProduct.image.data) {
      const base64 = populatedProduct.image.data.toString('base64');
      populatedProduct.image = `data:${populatedProduct.image.contentType};base64,${base64}`;
    } else {
      populatedProduct.image = '';
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: { details: error.message },
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: { code: 'NOT_FOUND' },
      });
    }

    const obj = product.toObject();
    if (obj.image && obj.image.data) {
      obj.image = `data:${obj.image.contentType};base64,${obj.image.data.toString('base64')}`;
    } else {
      obj.image = '';
    }
    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: obj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: { details: error.message },
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, category, uom, reorderLevel } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: { code: 'NOT_FOUND' },
      });
    }

    if (name) product.name = name;
    if (category) product.category = category;
    if (uom) product.uom = uom;
    if (reorderLevel !== undefined) product.reorderLevel = reorderLevel;

    // Handle uploaded file or base64 image
    if (req.file && req.file.buffer) {
      product.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    } else if (typeof req.body.image === 'string' && req.body.image.startsWith('data:')) {
      const matches = req.body.image.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        product.image = {
          data: Buffer.from(matches[2], 'base64'),
          contentType: matches[1],
        };
      }
    }

    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: { details: error.message },
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: { code: 'NOT_FOUND' },
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: { details: error.message },
    });
  }
};

const getProductStock = async (req, res) => {
  try {
    const stockLevels = await StockLevel.find({ productId: req.params.id })
      .populate('warehouseId', 'name code')
      .sort({ warehouseId: 1 });

    res.json({
      success: true,
      message: 'Product stock retrieved successfully',
      data: stockLevels.map((sl) => ({
        warehouse: {
          id: sl.warehouseId._id,
          name: sl.warehouseId.name,
          code: sl.warehouseId.code,
        },
        quantity: sl.quantity,
        updatedAt: sl.updatedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product stock',
      error: { details: error.message },
    });
  }
};

module.exports = {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductStock,
};

