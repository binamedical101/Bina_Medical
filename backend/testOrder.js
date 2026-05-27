import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Order from './models/orderModel.js';

dotenv.config();

connectDB();

const test = async () => {
  try {
    const order = new Order({
      orderItems: [
        {
          name: "Test Med",
          qty: 1,
          image: "http://example.com/img.jpg",
          price: 100,
          medicine: "64e5d5b7a1b2c3d4e5f6a7b8", // fake ObjectId
        }
      ],
      user: "64e5d5b7a1b2c3d4e5f6a7b8",
      shippingAddress: {
        address: "123", city: "city", postalCode: "123", country: "US"
      },
      paymentMethod: "PayU",
      itemsPrice: 100,
      taxPrice: 5,
      shippingPrice: 0,
      totalPrice: 105,
      isPaid: true,
      paidAt: Date.now(),
      paymentResult: {
        id: "PAYU-test",
        status: "success",
        update_time: new Date().toISOString(),
        email_address: "test@test.com"
      }
    });

    const saved = await order.save();
    console.log("Saved order isPaid:", saved.isPaid);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
