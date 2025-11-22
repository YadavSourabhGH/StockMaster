const Product = require('../models/Product');
const StockLevel = require('../models/StockLevel');
const Document = require('../models/Document');
const StockMove = require('../models/StockMove');

const getSummary = async (req, res) => {
  try {
    // Total products
    const totalProducts = await Product.countDocuments();

    // Low stock and out of stock
    const products = await Product.find().select('_id reorderLevel');
    const productIds = products.map((p) => p._id);
    const stockLevels = await StockLevel.find({ productId: { $in: productIds } });

    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((product) => {
      const stock = stockLevels
        .filter((sl) => sl.productId.toString() === product._id.toString())
        .reduce((sum, sl) => sum + sl.quantity, 0);

      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= product.reorderLevel) {
        lowStockCount++;
      }
    });

    // Pending receipts
    const pendingReceipts = await Document.countDocuments({
      docType: 'RECEIPT',
      status: { $in: ['DRAFT', 'WAITING', 'READY'] },
    });

    // Pending deliveries
    const pendingDeliveries = await Document.countDocuments({
      docType: 'DELIVERY',
      status: { $in: ['DRAFT', 'WAITING', 'READY'] },
    });

    // Scheduled transfers (transfers in non-DONE status)
    const scheduledTransfers = await Document.countDocuments({
      docType: 'TRANSFER',
      status: { $in: ['DRAFT', 'WAITING', 'READY'] },
    });

    res.json({
      success: true,
      message: 'Dashboard summary retrieved successfully',
      data: {
        totalProducts,
        lowStockCount,
        outOfStockCount,
        pendingReceipts,
        pendingDeliveries,
        scheduledTransfers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary',
      error: { details: error.message },
    });
  }
};

const getActivity = async (req, res) => {
  try {
    const stockMoves = await StockMove.find()
      .populate('productId', 'name sku')
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('executedBy', 'name email')
      .populate('documentId', 'docType')
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    const formattedMoves = stockMoves.map((move) => ({
      id: move._id,
      product: move.productId ? {
        id: move.productId._id,
        name: move.productId.name,
        sku: move.productId.sku,
      } : null,
      fromWarehouse: move.fromWarehouse ? {
        id: move.fromWarehouse._id,
        name: move.fromWarehouse.name,
        code: move.fromWarehouse.code,
      } : null,
      toWarehouse: move.toWarehouse ? {
        id: move.toWarehouse._id,
        name: move.toWarehouse.name,
        code: move.toWarehouse.code,
      } : null,
      quantityChange: move.quantityChange,
      documentType: move.documentId?.docType || null,
      executedBy: move.executedBy ? {
        id: move.executedBy._id,
        name: move.executedBy.name,
        email: move.executedBy.email,
      } : null,
      timestamp: move.timestamp,
    }));

    res.json({
      success: true,
      message: 'Activity retrieved successfully',
      data: formattedMoves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activity',
      error: { details: error.message },
    });
  }
};

const getChartData = async (req, res) => {
  try {
    // Get data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1); // Start of the month

    const moves = await StockMove.aggregate([
      {
        $match: {
          timestamp: { $gte: sixMonthsAgo }
        }
      },
      {
        $lookup: {
          from: 'documents',
          localField: 'documentId',
          foreignField: '_id',
          as: 'document'
        }
      },
      {
        $unwind: '$document'
      },
      {
        $project: {
          month: { $month: '$timestamp' },
          year: { $year: '$timestamp' },
          type: '$document.docType',
          quantity: { $abs: '$quantityChange' }
        }
      },
      {
        $group: {
          _id: { month: '$month', year: '$year', type: '$type' },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Process data for Chart.js
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    const stockIn = [];
    const stockOut = [];

    // Generate labels for the last 6 months
    const current = new Date(sixMonthsAgo);
    const now = new Date();

    while (current <= now) {
      const monthIdx = current.getMonth();
      const year = current.getFullYear();
      const label = months[monthIdx];
      labels.push(label);

      // Find data for this month
      const inMove = moves.find(m =>
        m._id.month === monthIdx + 1 &&
        m._id.year === year &&
        (m._id.type === 'RECEIPT' || (m._id.type === 'ADJUSTMENT' && m.totalQuantity > 0)) // Simplified logic
      );

      // For simplicity, let's categorize RECEIPT as IN and DELIVERY as OUT
      // TRANSFER is neutral (or both), ADJUSTMENT depends on sign (but we used abs above, so logic needs refinement if strict)
      // Better logic: 
      // IN: RECEIPT
      // OUT: DELIVERY

      const inQty = moves
        .filter(m => m._id.month === monthIdx + 1 && m._id.year === year && m._id.type === 'RECEIPT')
        .reduce((sum, m) => sum + m.totalQuantity, 0);

      const outQty = moves
        .filter(m => m._id.month === monthIdx + 1 && m._id.year === year && m._id.type === 'DELIVERY')
        .reduce((sum, m) => sum + m.totalQuantity, 0);

      stockIn.push(inQty);
      stockOut.push(outQty);

      current.setMonth(current.getMonth() + 1);
    }

    res.json({
      success: true,
      data: {
        labels,
        datasets: [
          { label: 'Stock In', data: stockIn },
          { label: 'Stock Out', data: stockOut }
        ]
      }
    });

  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chart data',
      error: { details: error.message }
    });
  }
};

module.exports = {
  getSummary,
  getActivity,
  getChartData
};
