const mongoose = require('mongoose');

const unitOfMeasureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Unit of measure name is required'],
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('UnitOfMeasure', unitOfMeasureSchema);

