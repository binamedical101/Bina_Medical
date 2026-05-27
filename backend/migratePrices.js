import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Medicine from './models/medicineModel.js';
import Order from './models/orderModel.js';

dotenv.config();

connectDB();

const migrate = async () => {
  try {
    const medicines = await Medicine.find({});
    for (const med of medicines) {
      if (med.price < 100) { // If price is very low, it's USD, convert to INR
        med.price = med.price * 80;
        await med.save();
      }
    }
    
    const orders = await Order.find({});
    for (const order of orders) {
      if (order.totalPrice < 1000) { // If total is very low, it's USD, convert to INR
        order.itemsPrice = order.itemsPrice * 80;
        order.shippingPrice = order.shippingPrice * 80;
        order.taxPrice = order.taxPrice * 80;
        order.totalPrice = order.totalPrice * 80;
        for (const item of order.orderItems) {
           item.price = item.price * 80;
        }
        await order.save();
      }
    }
    
    console.log('Prices Successfully Migrated to INR');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

migrate();
