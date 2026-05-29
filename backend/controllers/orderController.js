import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Medicine from '../models/medicineModel.js';
import Setting from '../models/settingModel.js';
import Coupon from '../models/couponModel.js';
import sendEmail from '../utils/sendEmail.js';

// Helper to send order status update email (Disabled per user requirements)
const sendOrderStatusEmail = async (order, statusText) => {
  return;
};

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
      const itemsHtml = createdOrder.orderItems
        .map(
          (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #333333;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #666666; text-align: center;">${item.qty}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #333333; text-align: right;">₹${(item.price * item.qty).toFixed(2)}</td>
        </tr>`
        )
        .join('');

      const couponDiscountRow = createdOrder.couponDiscount > 0
        ? `
        <tr>
          <td colspan="2" style="padding: 6px 12px; font-size: 14px; color: #666666; text-align: right;">Discount (Coupon ${createdOrder.couponCode || ''}):</td>
          <td style="padding: 6px 12px; font-size: 14px; color: #16a34a; font-weight: bold; text-align: right;">-₹${createdOrder.couponDiscount.toFixed(2)}</td>
        </tr>`
        : '';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f6f9fc; padding: 20px 0;">
            <tr>
              <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #eef2f6;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #129a93 0%, #0d7670 100%); padding: 30px; text-align: center; color: #ffffff;">
                      <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Bina Medical</h1>
                      <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Your healthcare, delivered with care</p>
                    </td>
                  </tr>
                  
                  <!-- Body Content -->
                  <tr>
                    <td style="padding: 40px 30px; color: #333333;">
                      <h2 style="margin-top: 0; font-size: 20px; font-weight: 700; color: #111111;">Order Confirmed!</h2>
                      <p style="font-size: 15px; line-height: 1.6; color: #555555; margin-bottom: 25px;">
                        Hi ${req.user.name || 'there'},<br>
                        Thank you for shopping with us! We have received your order and are preparing it for delivery.
                      </p>
                      
                      <!-- Details Box -->
                      <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="font-size: 14px; color: #64748b; padding-bottom: 8px;">Order ID</td>
                            <td style="font-size: 14px; font-weight: bold; color: #1e293b; text-align: right; padding-bottom: 8px;">#${createdOrder._id}</td>
                          </tr>
                          <tr>
                            <td style="font-size: 14px; color: #64748b; padding-bottom: 8px;">Payment Method</td>
                            <td style="font-size: 14px; font-weight: bold; color: #1e293b; text-align: right; padding-bottom: 8px;">${createdOrder.paymentMethod}</td>
                          </tr>
                          <tr>
                            <td style="font-size: 14px; color: #64748b;">Shipping Address</td>
                            <td style="font-size: 14px; font-weight: bold; color: #1e293b; text-align: right;">
                              ${createdOrder.shippingAddress.address}, ${createdOrder.shippingAddress.city}
                            </td>
                          </tr>
                        </table>
                      </div>

                      <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #111111; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Items Ordered</h3>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                        <thead>
                          <tr style="background-color: #f8fafc;">
                            <th style="padding: 10px 12px; font-size: 12px; text-transform: uppercase; color: #64748b; text-align: left; font-weight: 600;">Item Name</th>
                            <th style="padding: 10px 12px; font-size: 12px; text-transform: uppercase; color: #64748b; text-align: center; font-weight: 600;">Qty</th>
                            <th style="padding: 10px 12px; font-size: 12px; text-transform: uppercase; color: #64748b; text-align: right; font-weight: 600;">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsHtml}
                          <!-- Summary Rows -->
                          <tr>
                            <td colspan="2" style="padding: 12px 12px 6px 12px; font-size: 14px; color: #666666; text-align: right;">Subtotal:</td>
                            <td style="padding: 12px 12px 6px 12px; font-size: 14px; color: #333333; text-align: right;">₹${createdOrder.itemsPrice.toFixed(2)}</td>
                          </tr>
                          ${couponDiscountRow}
                          <tr>
                            <td colspan="2" style="padding: 6px 12px; font-size: 14px; color: #666666; text-align: right;">Tax:</td>
                            <td style="padding: 6px 12px; font-size: 14px; color: #333333; text-align: right;">₹${createdOrder.taxPrice.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding: 6px 12px; font-size: 14px; color: #666666; text-align: right;">Shipping:</td>
                            <td style="padding: 6px 12px; font-size: 14px; color: #333333; text-align: right;">
                              ${createdOrder.shippingPrice === 0 ? 'FREE' : '₹' + createdOrder.shippingPrice.toFixed(2)}
                            </td>
                          </tr>
                          <tr style="border-top: 2px solid #eef2f6;">
                            <td colspan="2" style="padding: 12px 12px 0 12px; font-size: 16px; font-weight: 700; color: #111111; text-align: right;">Total Price:</td>
                            <td style="padding: 12px 12px 0 12px; font-size: 18px; font-weight: 800; color: #129a93; text-align: right;">₹${createdOrder.totalPrice.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>

                      <!-- Track Order Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/${createdOrder._id}" style="background-color: #129a93; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(18, 154, 147, 0.2);">Track Your Order</a>
                      </div>

                      <p style="font-size: 14px; color: #64748b; margin-top: 30px; margin-bottom: 0; line-height: 1.5; text-align: center;">
                        If you have any questions, feel free to reply to this email or contact support.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 25px 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
                      &copy; 2026 Bina Medical. All rights reserved.<br>
                      This is an automated order confirmation email. Please do not reply directly.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      // Send email notification (fire and forget)
      sendEmail({
        email: req.user.email,
        subject: `Order Confirmation - Bina Medical #${createdOrder._id}`,
        message: `Thank you for your order!\n\nYour order ID is ${createdOrder._id}. The total price is ₹${createdOrder.totalPrice.toFixed(2)}.\n\nYou can track your order here: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/${createdOrder._id}`,
        html: htmlContent,
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
  const order = await Order.findById(req.params.id).populate('user', 'name email');

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

    // Send order status update email
    sendOrderStatusEmail(updatedOrder, 'Paid / Processing');

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
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    if (order.status === 'Cancelled') {
      res.status(400);
      throw new Error('Cannot deliver a Cancelled order');
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'Delivered';

    const updatedOrder = await order.save();

    // Send order status update email
    sendOrderStatusEmail(updatedOrder, 'Delivered');

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
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    const oldStatus = order.status || 'Processing';
    const oldIsRefunded = order.isRefunded;

    // Enforce irreversible status flow and prevent cancellation after shipping
    if (req.body.status && req.body.status !== oldStatus) {
      if (oldStatus === 'Cancelled') {
        res.status(400);
        throw new Error('Cannot change status of a Cancelled order');
      }
      if (oldStatus === 'Delivered') {
        res.status(400);
        throw new Error('Cannot change status of a Delivered order');
      }

      const statusFlow = ['processing', 'shipped', 'dispatched', 'out for delivery', 'delivered'];
      const oldIndex = statusFlow.indexOf(oldStatus.toLowerCase());

      if (req.body.status.toLowerCase() === 'cancelled') {
        if (oldIndex >= 1) {
          res.status(400);
          throw new Error('Cannot cancel order after it has been shipped');
        }
      } else {
        const newIndex = statusFlow.indexOf(req.body.status.toLowerCase());
        if (oldIndex !== -1 && newIndex !== -1 && newIndex < oldIndex) {
          res.status(400);
          throw new Error(`Cannot revert order status from "${oldStatus}" to "${req.body.status}"`);
        }
      }
    }

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

    // Check if status changed or refunded status changed to send email
    let emailStatusText = '';
    if (oldStatus !== updatedOrder.status) {
      emailStatusText = updatedOrder.status;
    } else if (!oldIsRefunded && updatedOrder.isRefunded) {
      emailStatusText = 'Refunded';
    }

    if (emailStatusText) {
      sendOrderStatusEmail(updatedOrder, emailStatusText);
    }

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
