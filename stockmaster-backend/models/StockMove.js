const mongoose = require('mongoose');

const stockMoveSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  fromWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
  },
  toWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
  },
  quantityChange: {
    type: Number,
    required: true,
  },
  executedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
});

stockMoveSchema.index({ documentId: 1 });
stockMoveSchema.index({ productId: 1 });
stockMoveSchema.index({ fromWarehouse: 1 });
stockMoveSchema.index({ toWarehouse: 1 });
stockMoveSchema.index({ timestamp: -1 });

module.exports = mongoose.model('StockMove', stockMoveSchema);

