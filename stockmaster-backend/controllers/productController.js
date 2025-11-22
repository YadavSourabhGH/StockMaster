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
      query.categoryId = category;
    }

    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: products,
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
    const { name, sku, categoryId, uom, reorderLevel, initialStock } = req.body;

    if (!name || !sku || !categoryId || !uom) {
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
      categoryId,
      uom,
      reorderLevel: reorderLevel || 0,
      createdBy: req.user._id,
    });

    await product.save();

    // Handle initial stock if provided
    if (initialStock && initialStock.warehouseId && initialStock.quantity > 0) {
      const adjustmentDoc = new Document({
        docType: 'ADJUSTMENT',
        status: 'READY',
        createdBy: req.user._id,
        toWarehouse: initialStock.warehouseId,
        reason: 'Initial stock entry',
        lines: [{
          productId: product._id,
          quantity: initialStock.quantity,
        }],
      });

      await adjustmentDoc.save();

      // Auto-validate initial stock adjustment
      try {
        await validateDocument(adjustmentDoc._id, req.user._id);
      } catch (error) {
        console.error('Error validating initial stock:', error);
        // Continue anyway, document is created
      }
    }

    const populatedProduct = await Product.findById(product._id)
      .populate('categoryId', 'name')
      .populate('createdBy', 'name email');

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
      .populate('categoryId', 'name')
      .populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: { code: 'NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: product,
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
    const { name, categoryId, uom, reorderLevel } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: { code: 'NOT_FOUND' },
      });
    }

    if (name) product.name = name;
    if (categoryId) product.categoryId = categoryId;
    if (uom) product.uom = uom;
    if (reorderLevel !== undefined) product.reorderLevel = reorderLevel;

    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate('categoryId', 'name')
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

