import asyncHandler from 'express-async-handler';
import Medicine from '../models/medicineModel.js';

// @desc    Get inventory status
// @route   GET /api/inventory
// @access  Private/Admin
const getInventoryStatus = asyncHandler(async (req, res) => {
  // Find all medicines, sort by stock quantity (lowest first)
  const allInventory = await Medicine.find({})
    .select('name genericName stockQuantity batchId supplier expiryDate price')
    .sort({ stockQuantity: 1 });

  // Get low stock items (less than 10)
  const lowStockItems = allInventory.filter(item => item.stockQuantity < 10);

  // Get expiring soon items (within next 3 months)
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  
  const expiringSoon = allInventory.filter(item => {
    return new Date(item.expiryDate) < threeMonthsFromNow;
  }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  res.json({
    totalItems: allInventory.length,
    lowStockCount: lowStockItems.length,
    expiringCount: expiringSoon.length,
    allInventory,
    lowStockItems,
    expiringSoon
  });
});

export { getInventoryStatus };
