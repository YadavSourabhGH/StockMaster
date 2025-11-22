const mongoose = require('mongoose');

const documentLineSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01,
  },
}, { _id: false });

const documentSchema = new mongoose.Schema({
  docType: {
    type: String,
    enum: ['RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT'],
    required: true,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED'],
    default: 'DRAFT',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  fromWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
  },
  toWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
  },
  counterparty: {
    type: String,
    trim: true,
  },
  reason: {
    type: String,
    trim: true,
  },
  lines: {
    type: [documentLineSchema],
    required: true,
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'Document must have at least one line',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  validatedAt: {
    type: Date,
  },
}, {
  timestamps: false,
});

documentSchema.index({ docType: 1, status: 1 });
documentSchema.index({ createdBy: 1 });
documentSchema.index({ fromWarehouse: 1 });
documentSchema.index({ toWarehouse: 1 });
documentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);

