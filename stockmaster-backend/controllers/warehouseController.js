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
    const { name, code, address } = req.body;

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
    const { name, address } = req.body;

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

module.exports = {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
};

