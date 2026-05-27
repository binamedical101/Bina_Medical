import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Medicine from '../models/medicineModel.js';
import Setting from '../models/settingModel.js';
import Coupon from '../models/couponModel.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentResult,
    couponCode,
    couponDiscount,
  } = req.body;

  console.log("CREATE ORDER BODY:", req.body);

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // 1. Fetch actual products from database to prevent price tampering
    const dbMedicines = await Medicine.find({
      _id: { $in: orderItems.map((item) => item._id) },
    });

    if (dbMedicines.length !== orderItems.length) {
      res.status(400);
      throw new Error('One or more medicines in your order were not found');
    }

    const dbOrderItems = [];
    let calculatedItemsPrice = 0;

    for (const item of orderItems) {
      const dbMedicine = dbMedicines.find(
        (m) => m._id.toString() === item._id.toString()
      );

      if (!dbMedicine) {
        res.status(404);
        throw new Error(`Medicine not found: ${item.name}`);
      }

      // Check stock availability
      if (dbMedicine.stockQuantity < item.qty) {
        res.status(400);
        throw new Error(`Insufficient stock for ${dbMedicine.name}`);
      }

      // Calculate final unit price (applying discount percentage from DB)
      const discount = dbMedicine.discountPercentage || 0;
      const unitPrice = dbMedicine.price * (1 - discount / 100);
      
      dbOrderItems.push({
        name: dbMedicine.name,
        qty: item.qty,
        image: dbMedicine.images?.[0] || '/images/sample.jpg',
        price: unitPrice,
        medicine: dbMedicine._id,
      });

      calculatedItemsPrice += unitPrice * item.qty;
    }

    // 2. Fetch settings and calculate taxes & shipping server-side
    const settings = await Setting.findOne();
    const taxRate = settings?.taxRate ?? 18;
    const baseShippingFee = settings?.shippingFee ?? 50;
    const freeShippingThreshold = settings?.freeShippingThreshold ?? 1000;

    const itemsPriceVal = Math.round(calculatedItemsPrice * 100) / 100;

    // 3. Process and validate coupon if provided
    let coupon = null;
    let couponDiscountVal = 0;

    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (!coupon) {
        res.status(400);
        throw new Error('Invalid or inactive coupon code');
      }

      if (new Date(coupon.expiryDate) < new Date()) {
        res.status(400);
        throw new Error('Coupon has expired');
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        res.status(400);
        throw new Error('Coupon usage limit reached');
      }

      if (itemsPriceVal < coupon.minPurchaseAmount) {
        res.status(400);
        throw new Error(`Minimum purchase amount of ₹${coupon.minPurchaseAmount} not met for this coupon`);
      }

      if (coupon.discountType === 'percentage') {
        let pctDiscount = itemsPriceVal * (coupon.discountAmount / 100);
        if (coupon.maxDiscountAmount) {
          pctDiscount = Math.min(pctDiscount, coupon.maxDiscountAmount);
        }
        couponDiscountVal = pctDiscount;
      } else if (coupon.discountType === 'fixed') {
        couponDiscountVal = coupon.discountAmount;
      }

      // Cap discount at the subtotal
      couponDiscountVal = Math.min(couponDiscountVal, itemsPriceVal);
      couponDiscountVal = Math.round(couponDiscountVal * 100) / 100;
    }

    // Verify client coupon discount matches calculated discount
    if (Math.abs(Number(couponDiscount || 0) - couponDiscountVal) > 1.0) {
      res.status(400);
      throw new Error('Coupon discount validation failed. Potential price tampering detected.');
    }

    const discountedItemsPrice = itemsPriceVal - couponDiscountVal;
    const shippingPriceVal = discountedItemsPrice > freeShippingThreshold ? 0 : baseShippingFee;
    const taxPriceVal = Math.round(((taxRate / 100) * discountedItemsPrice) * 100) / 100;
    const totalPriceVal = Math.round((discountedItemsPrice + shippingPriceVal + taxPriceVal) * 100) / 100;

    // Verify client total matches database-calculated total
    if (Math.abs(Number(totalPrice) - totalPriceVal) > 1.0) {
      res.status(400);
      throw new Error('Order price validation failed. Potential price tampering detected.');
    }

    const order = new Order({
      orderItems: dbOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice: itemsPriceVal,
      taxPrice: taxPriceVal,
      shippingPrice: shippingPriceVal,
      totalPrice: totalPriceVal,
      couponCode: coupon ? coupon.code : undefined,
      couponDiscount: couponDiscountVal,
      isPaid: paymentResult ? true : false,
      paidAt: paymentResult ? Date.now() : undefined,
      paymentResult: paymentResult ? paymentResult : undefined,
    });

    const createdOrder = await order.save();

    // Increment coupon used count if applicable
    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save();
    }

    // Deduct stock for each item in the order
    for (const item of createdOrder.orderItems) {
      const medicine = await Medicine.findById(item.medicine);
      if (medicine) {
        // Prevent stock from going below zero mathematically
        medicine.stockQuantity = Math.max(0, medicine.stockQuantity - item.qty);
        await medicine.save();
      }
    }

    // Check global settings for email notifications
    if (!settings || settings.emailNotifications) {
      // Send email notification (fire and forget)
      sendEmail({
        email: req.user.email,
        subject: `Order Confirmation - Bina Medical #${createdOrder._id}`,
        message: `Thank you for your order!\n\nYour order ID is ${createdOrder._id}. The total price is ₹${createdOrder.totalPrice}.\n\nWe will notify you once it's delivered.`,
      });
    }

    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'Delivered';

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order admin details (delivery, status, refund)
// @route   PUT /api/orders/:id/admin
// @access  Private/Admin
const updateOrderAdmin = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status || order.status;
    order.deliveryPartner = req.body.deliveryPartner || order.deliveryPartner;
    order.trackingId = req.body.trackingId || order.trackingId;
    
    if (req.body.status === 'Delivered' && !order.isDelivered) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    if (req.body.isRefunded && !order.isRefunded) {
      order.isRefunded = true;
      order.refundedAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderAdmin,
  getMyOrders,
  getOrders,
};
