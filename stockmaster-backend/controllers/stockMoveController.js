const StockMove = require('../models/StockMove');

const getStockMoves = async (req, res) => {
  try {
    const {
      warehouse,
      product,
      dateFrom,
      dateTo,
      documentType,
    } = req.query;

    const query = {};

    if (warehouse) {
      query.$or = [
        { fromWarehouse: warehouse },
        { toWarehouse: warehouse },
      ];
    }

    if (product) {
      query.productId = product;
    }

    if (dateFrom || dateTo) {
      query.timestamp = {};
      if (dateFrom) {
        query.timestamp.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.timestamp.$lte = new Date(dateTo);
      }
    }

    if (documentType) {
      // We need to join with Document to filter by docType
      const Document = require('../models/Document');
      const documents = await Document.find({ docType: documentType }).select('_id');
      const documentIds = documents.map((d) => d._id);
      query.documentId = { $in: documentIds };
    }

    const stockMoves = await StockMove.find(query)
      .populate('productId', 'name sku')
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('executedBy', 'name email')
      .populate({
        path: 'documentId',
        select: 'docType status',
      })
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      message: 'Stock moves retrieved successfully',
      data: stockMoves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stock moves',
      error: { details: error.message },
    });
  }
};

module.exports = {
  getStockMoves,
};

