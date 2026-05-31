import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function checkUsers() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB.');
  const users = await User.find({}).sort({ createdAt: -1 }).limit(5);
  for (const u of users) {
    console.log({
      id: u._id,
      name: u.name,
      email: u.email,
      isVerified: u.isVerified,
      createdAt: u.createdAt,
      verificationToken: u.verificationToken,
    });
  }
  await mongoose.disconnect();
}

checkUsers().catch(err => {
  console.error(err);
  process.exit(1);
});
