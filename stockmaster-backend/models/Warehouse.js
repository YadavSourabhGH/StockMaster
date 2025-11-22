const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Warehouse name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Warehouse code is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  address: {
    type: String,
    trim: true,
  },
  contactPerson: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        // Allow empty or validate phone format
        return !v || /^[\d\s\-\+\(\)]+$/.test(v);
      },
      message: 'Invalid phone number format'
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        // Allow empty or validate email format
        return !v || /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  type: {
    type: String,
    enum: ['main', 'regional', 'distribution', 'storage', 'other'],
    default: 'main',
  },
  capacity: {
    type: Number,
    min: 0,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp on save
warehouseSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// warehouseSchema.index({ code: 1 }); // Removed duplicate index

module.exports = mongoose.model('Warehouse', warehouseSchema);

