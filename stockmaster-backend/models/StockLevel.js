const mongoose = require('mongoose');

const stockLevelSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
});

// Compound unique index to ensure one record per product-warehouse combination
stockLevelSchema.index({ productId: 1, warehouseId: 1 }, { unique: true });
stockLevelSchema.index({ warehouseId: 1 });
stockLevelSchema.index({ productId: 1 });

module.exports = mongoose.model('StockLevel', stockLevelSchema);

