import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const API_URL = 'http://localhost:5000/api/users';

const testUserSchema = new mongoose.Schema({
  email: String,
  isVerified: Boolean,
  verificationToken: String,
});
const TestUser = mongoose.model('TestUser', testUserSchema, 'users');

async function testVerificationFlow() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGO_URI);
  console.log('Database connected.');

  const testEmail = 'test_verification@binamedical.com';
  const testPassword = 'Password123!';

  // Clean up any existing test user
  await TestUser.deleteOne({ email: testEmail });
  console.log('Cleaned up existing test user.');

  // 1. Register the user
  console.log('\n--- 1. Registering user ---');
  const registerRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Verification Tester',
      email: testEmail,
      password: testPassword,
    }),
  });

  const registerData = await registerRes.json();
  console.log(`Register status: ${registerRes.status}`);
  console.log('Register response:', registerData);

  if (registerRes.status !== 201) {
    throw new Error('Registration failed!');
  }

  // 2. Attempt login before verification
  console.log('\n--- 2. Attempting login before verification ---');
  const loginRes1 = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });

  const loginData1 = await loginRes1.json();
  console.log(`Login status (expected 401): ${loginRes1.status}`);
  console.log('Login response:', loginData1);

  if (loginRes1.status !== 401 || !loginData1.message.includes('verify your email')) {
    throw new Error('FAILED: Login was allowed or gave wrong error message!');
  }
  console.log('SUCCESS: Login correctly blocked for unverified user.');

  // 3. Retrieve token from DB
  const user = await TestUser.findOne({ email: testEmail });
  if (!user || !user.verificationToken) {
    throw new Error('Could not find user or verification token in database!');
  }
  console.log(`Found verification token in database: ${user.verificationToken}`);

  // 4. Verify email
  console.log('\n--- 3. Verifying email ---');
  const verifyRes = await fetch(`${API_URL}/verify-email/${user.verificationToken}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });

  const verifyData = await verifyRes.json();
  console.log(`Verify status (expected 200): ${verifyRes.status}`);
  console.log('Verify response:', verifyData);

  if (verifyRes.status !== 200 || !verifyData.success) {
    throw new Error('Email verification failed!');
  }

  // 5. Attempt login after verification
  console.log('\n--- 4. Attempting login after verification ---');
  const loginRes2 = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });

  const loginData2 = await loginRes2.json();
  console.log(`Login status (expected 200): ${loginRes2.status}`);
  console.log('Login response:', loginData2);

  if (loginRes2.status !== 200 || !loginData2._id) {
    throw new Error('FAILED: Login failed after verification!');
  }
  console.log('SUCCESS: Login succeeded for verified user.');

  // Clean up
  await TestUser.deleteOne({ email: testEmail });
  console.log('\nCleaned up test user from database.');
  
  await mongoose.disconnect();
  console.log('Database disconnected.');
}

testVerificationFlow().catch(async (err) => {
  console.error('Test failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
