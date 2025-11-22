const StockLevel = require('../models/StockLevel');
const StockMove = require('../models/StockMove');
const Document = require('../models/Document');
const mongoose = require('mongoose');

/**
 * Centralized stock engine for all IN/OUT operations
 * Handles: Receipts, Deliveries, Transfers, Adjustments
 */

const updateStockLevel = async (productId, warehouseId, quantityChange) => {
  const stockLevel = await StockLevel.findOneAndUpdate(
    { productId, warehouseId },
    {
      $inc: { quantity: quantityChange },
      $set: { updatedAt: new Date() },
    },
    { upsert: true, new: true }
  );

  // Ensure stock doesn't go negative
  if (stockLevel.quantity < 0) {
    throw new Error(`Insufficient stock. Available: ${stockLevel.quantity + quantityChange}, Requested: ${Math.abs(quantityChange)}`);
  }

  return stockLevel;
};

const getStockLevel = async (productId, warehouseId) => {
  const stockLevel = await StockLevel.findOne({ productId, warehouseId });
  return stockLevel ? stockLevel.quantity : 0;
};

const validateReceipt = async (document, validatedBy) => {
  try {
    if (!document.toWarehouse) {
      throw new Error('Receipt must have a destination warehouse');
    }

    const stockMoves = [];

    for (const line of document.lines) {
      // Increase stock in destination warehouse
      await updateStockLevel(
        line.productId,
        document.toWarehouse,
        line.quantity
      );

      // Create stock move entry
      const stockMove = new StockMove({
        documentId: document._id,
        productId: line.productId,
        toWarehouse: document.toWarehouse,
        quantityChange: line.quantity,
        executedBy: validatedBy,
      });
      stockMoves.push(stockMove);
    }

    await StockMove.insertMany(stockMoves);

    // Update document status
    document.status = 'DONE';
    document.validatedBy = validatedBy;
    document.validatedAt = new Date();
    await document.save();

    return { success: true };
  } catch (error) {
    throw error;
  }
};

const validateDelivery = async (document, validatedBy) => {
  try {
    if (!document.fromWarehouse) {
      throw new Error('Delivery must have a source warehouse');
    }

    // First, check stock availability for all lines
    for (const line of document.lines) {
      const currentStock = await getStockLevel(
        line.productId,
        document.fromWarehouse
      );
      if (currentStock < line.quantity) {
        throw new Error(
          `Insufficient stock for product ${line.productId}. Available: ${currentStock}, Requested: ${line.quantity}`
        );
      }
    }

    const stockMoves = [];

    // Deduct stock from source warehouse
    for (const line of document.lines) {
      await updateStockLevel(
        line.productId,
        document.fromWarehouse,
        -line.quantity
      );

      // Create stock move entry
      const stockMove = new StockMove({
        documentId: document._id,
        productId: line.productId,
        fromWarehouse: document.fromWarehouse,
        quantityChange: -line.quantity,
        executedBy: validatedBy,
      });
      stockMoves.push(stockMove);
    }

    await StockMove.insertMany(stockMoves);

    // Update document status
    document.status = 'DONE';
    document.validatedBy = validatedBy;
    document.validatedAt = new Date();
    await document.save();

    return { success: true };
  } catch (error) {
    throw error;
  }
};

const validateTransfer = async (document, validatedBy) => {
  try {
    if (!document.fromWarehouse || !document.toWarehouse) {
      throw new Error('Transfer must have both source and destination warehouses');
    }

    if (document.fromWarehouse.toString() === document.toWarehouse.toString()) {
      throw new Error('Source and destination warehouses cannot be the same');
    }

    // Check stock availability
    for (const line of document.lines) {
      const currentStock = await getStockLevel(
        line.productId,
        document.fromWarehouse
      );
      if (currentStock < line.quantity) {
        throw new Error(
          `Insufficient stock for product ${line.productId}. Available: ${currentStock}, Requested: ${line.quantity}`
        );
      }
    }

    const stockMoves = [];

    // Transfer stock
    for (const line of document.lines) {
      // Deduct from source
      await updateStockLevel(
        line.productId,
        document.fromWarehouse,
        -line.quantity
      );

      // Add to destination
      await updateStockLevel(
        line.productId,
        document.toWarehouse,
        line.quantity
      );

      // Create stock move entry (single entry showing transfer with both warehouses)
      const stockMove = new StockMove({
        documentId: document._id,
        productId: line.productId,
        fromWarehouse: document.fromWarehouse,
        toWarehouse: document.toWarehouse,
        quantityChange: line.quantity, // Quantity transferred
        executedBy: validatedBy,
      });
      stockMoves.push(stockMove);
    }

    await StockMove.insertMany(stockMoves);

    // Update document status
    document.status = 'DONE';
    document.validatedBy = validatedBy;
    document.validatedAt = new Date();
    await document.save();

    return { success: true };
  } catch (error) {
    throw error;
  }
};

const validateAdjustment = async (document, validatedBy) => {
  try {
    if (!document.toWarehouse) {
      throw new Error('Adjustment must have a warehouse');
    }

    const stockMoves = [];

    for (const line of document.lines) {
      const currentStock = await getStockLevel(
        line.productId,
        document.toWarehouse
      );
      const delta = line.quantity - currentStock;

      // Update stock to the counted quantity
      await StockLevel.findOneAndUpdate(
        { productId: line.productId, warehouseId: document.toWarehouse },
        {
          $set: { quantity: line.quantity, updatedAt: new Date() },
        },
        { upsert: true, new: true }
      );

      // Create stock move entry with the delta
      const stockMove = new StockMove({
        documentId: document._id,
        productId: line.productId,
        toWarehouse: document.toWarehouse,
        quantityChange: delta,
        executedBy: validatedBy,
      });
      stockMoves.push(stockMove);
    }

    await StockMove.insertMany(stockMoves);

    // Update document status
    document.status = 'DONE';
    document.validatedBy = validatedBy;
    document.validatedAt = new Date();
    await document.save();

    return { success: true };
  } catch (error) {
    throw error;
  }
};

const validateDocument = async (documentId, validatedBy) => {
  const document = await Document.findById(documentId).populate('lines.productId');

  if (!document) {
    throw new Error('Document not found');
  }

  if (document.status === 'DONE') {
    throw new Error('Document is already validated');
  }

  if (document.status === 'CANCELED') {
    throw new Error('Cannot validate a canceled document');
  }

  switch (document.docType) {
    case 'RECEIPT':
      return await validateReceipt(document, validatedBy);
    case 'DELIVERY':
      return await validateDelivery(document, validatedBy);
    case 'TRANSFER':
      return await validateTransfer(document, validatedBy);
    case 'ADJUSTMENT':
      return await validateAdjustment(document, validatedBy);
    default:
      throw new Error(`Unknown document type: ${document.docType}`);
  }
};

module.exports = {
  validateDocument,
  getStockLevel,
  updateStockLevel,
};

