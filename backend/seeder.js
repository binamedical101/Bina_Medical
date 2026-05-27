import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/userModel.js';
import Category from './models/categoryModel.js';
import Medicine from './models/medicineModel.js';
import Order from './models/orderModel.js';
import categories from './data/categories.js';
import medicines from './data/medicines.js';
import bcrypt from 'bcryptjs';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Order.deleteMany();
    await Medicine.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.create([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123', // Will be hashed by pre-save
        role: 'Admin',
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      }
    ]);

    const createdCategories = await Category.insertMany(categories);

    // Map categories to medicines
    const vitaminStore = createdCategories[0]._id;
    const personalCare = createdCategories[2]._id;
    const skinCare = createdCategories[13]._id;
    const healthConcerns = createdCategories[14]._id;

    const sampleMedicines = medicines.map((med, index) => {
      let categoryId = healthConcerns;
      if (index === 0) categoryId = vitaminStore;
      if (index === 1) categoryId = skinCare;
      if (index === 2) categoryId = personalCare;

      return { ...med, category: categoryId };
    });

    await Medicine.insertMany(sampleMedicines);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  // destroyData();
} else {
  importData();
}
