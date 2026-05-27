import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Medicine from '../models/medicineModel.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  // Aggregate sales
  const totalOrdersCount = await Order.countDocuments();
  
  const orders = await Order.find({});
  const totalSales = orders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);

  const activeUsers = await User.countDocuments();
  
  // Example for low stock: quantity < 10
  const lowStockItems = await Medicine.countDocuments({ stockQuantity: { $lt: 10 } });

  // Get recent 5 orders
  const recentOrders = await Order.find({}).populate('user', 'name').sort({ createdAt: -1 }).limit(5);

  res.status(200).json({
    totalSales: `₹${totalSales.toFixed(2)}`,
    totalOrders: totalOrdersCount,
    activeUsers,
    lowStockItems,
    pendingPrescriptions: 0, // Placeholder
    recentOrders
  });
});

export { getDashboardStats };
