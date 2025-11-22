const Warehouse = require('../models/Warehouse');

const getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find().sort({ name: 1 });
    res.json({
      success: true,
      message: 'Warehouses retrieved successfully',
      data: warehouses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching warehouses',
      error: { details: error.message },
    });
  }
};

const createWarehouse = async (req, res) => {
  try {
    const { name, code, address, contactPerson, phone, email, type, capacity, status } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Name and code are required',
        error: { code: 'VALIDATION_ERROR' },
      });
    }

    const warehouse = new Warehouse({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      address: address ? address.trim() : '',
      contactPerson: contactPerson ? contactPerson.trim() : '',
      phone: phone ? phone.trim() : '',
      email: email ? email.trim() : '',
      type: type || 'main',
      capacity: capacity || 0,
      status: status || 'active',
    });

    await warehouse.save();

    res.status(201).json({
      success: true,
      message: 'Warehouse created successfully',
      data: warehouse,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse with this code already exists',
        error: { code: 'DUPLICATE_CODE' },
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating warehouse',
      error: { details: error.message },
    });
  }
};

const updateWarehouse = async (req, res) => {
  try {
    const { name, address, contactPerson, phone, email, type, capacity, status } = req.body;

    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
        error: { code: 'NOT_FOUND' },
      });
    }

    if (name) warehouse.name = name.trim();
    if (address !== undefined) warehouse.address = address.trim();
    if (contactPerson !== undefined) warehouse.contactPerson = contactPerson.trim();
    if (phone !== undefined) warehouse.phone = phone.trim();
    if (email !== undefined) warehouse.email = email.trim();
    if (type) warehouse.type = type;
    if (capacity !== undefined) warehouse.capacity = capacity;
    if (status) warehouse.status = status;

    await warehouse.save();

    res.json({
      success: true,
      message: 'Warehouse updated successfully',
      data: warehouse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating warehouse',
      error: { details: error.message },
    });
  }
};

const getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
        error: { code: 'NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      message: 'Warehouse retrieved successfully',
      data: warehouse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching warehouse',
      error: { details: error.message },
    });
  }
};

const deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
        error: { code: 'NOT_FOUND' },
      });
    }

    // Check if warehouse is being used in stock moves or stock levels
    const StockMove = require('../models/StockMove');
    const StockLevel = require('../models/StockLevel');

    const stockMovesCount = await StockMove.countDocuments({ warehouse: req.params.id });
    const stockLevelsCount = await StockLevel.countDocuments({ warehouse: req.params.id });

    if (stockMovesCount > 0 || stockLevelsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete warehouse with existing stock records. Please transfer stock first.',
        error: {
          code: 'WAREHOUSE_IN_USE',
          details: {
            stockMoves: stockMovesCount,
            stockLevels: stockLevelsCount
          }
        },
      });
    }

    await Warehouse.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Warehouse deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting warehouse',
      error: { details: error.message },
    });
  }
};

const getWarehouseStats = async (req, res) => {
  try {
    const totalWarehouses = await Warehouse.countDocuments();
    const activeWarehouses = await Warehouse.countDocuments({ status: 'active' });
    const inactiveWarehouses = await Warehouse.countDocuments({ status: 'inactive' });
    const maintenanceWarehouses = await Warehouse.countDocuments({ status: 'maintenance' });

    const warehousesByType = await Warehouse.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalCapacity = await Warehouse.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$capacity' }
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Warehouse statistics retrieved successfully',
      data: {
        total: totalWarehouses,
        byStatus: {
          active: activeWarehouses,
          inactive: inactiveWarehouses,
          maintenance: maintenanceWarehouses,
        },
        byType: warehousesByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        totalCapacity: totalCapacity.length > 0 ? totalCapacity[0].total : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching warehouse statistics',
      error: { details: error.message },
    });
  }
};

const getWarehouseStock = async (req, res) => {
  try {
    const StockLevel = require('../models/StockLevel');
    const stockLevels = await StockLevel.find({ warehouseId: req.params.id })
      .populate('productId', 'name sku category uom')
      .lean();

    // Filter out any stock levels where product might have been deleted
    const validStockLevels = stockLevels.filter(sl => sl.productId);

    res.json({
      success: true,
      message: 'Warehouse stock retrieved successfully',
      data: validStockLevels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching warehouse stock',
      error: { details: error.message },
    });
  }
};

module.exports = {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  getWarehouseById,
  deleteWarehouse,
  getWarehouseStats,
  getWarehouseStock,
};

