import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import crypto, { randomUUID } from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import dns from 'dns';

// Helper function to resolve MX records (checks for RFC 7505 Null MX)
const checkMxRecords = (domain) => {
  return new Promise((resolve) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        resolve(false);
      } else {
        const hasValidMx = addresses.some(
          (addr) => addr.exchange && addr.exchange !== '.' && addr.exchange !== ''
        );
        resolve(hasValidMx);
      }
    });
  });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error('Email not found, please register first');
  }

  if (await user.matchPassword(password)) {
    if (!user.isVerified) {
      res.status(401);
      throw new Error('Please verify your email address before logging in');
    }
    const sessionId = randomUUID();
    user.activeSessionId = sessionId;
    await user.save();

    generateToken(res, user._id, sessionId);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please enter a valid email address');
  }

  // 2. Block disposable domains
  const disposableBlacklist = [
    'mailinator.com',
    '10minutemail.com',
    'tempmail.com',
    'yopmail.com',
    'guerrillamail.com',
    'sharklasers.com',
    'dispostable.com',
    'getairmail.com',
    'burnermail.io'
  ];
  const domain = email.split('@')[1].toLowerCase();
  if (disposableBlacklist.includes(domain)) {
    res.status(400);
    throw new Error('Disposable email addresses are not allowed');
  }

  // 3. DNS MX records verification
  console.log(`[MX Check] Checking MX records for domain: ${domain}`);
  const hasMx = await checkMxRecords(domain);
  console.log(`[MX Check] Result for ${domain}: ${hasMx}`);
  if (!hasMx) {
    res.status(400);
    throw new Error('Please enter a valid Email address');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const verificationToken = crypto.randomBytes(20).toString('hex');
  const sessionId = randomUUID();
  const user = await User.create({
    name,
    email,
    password,
    activeSessionId: sessionId,
    isVerified: false,
    verificationToken,
  });

  if (user) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;

    const message = `Thank you for registering at Bina Medical. Please click the link below to verify your email address:\n\n${verificationUrl}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #129a93; text-align: center;">Welcome to Bina Medical!</h2>
        <p>Hello ${user.name},</p>
        <p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #129a93; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #718096; font-size: 0.875rem;">If the button above doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #129a93; font-size: 0.875rem;">${verificationUrl}</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="color: #a0aec0; font-size: 0.75rem; text-align: center;">This is an automated email, please do not reply.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Bina Medical - Verify Your Email Address',
        message,
        html,
      });

      res.status(201).json({
        message: 'Registration successful! Please check your email to verify your account.',
      });
    } catch (error) {
      await User.deleteOne({ _id: user._id });
      res.status(500);
      throw new Error('Verification email could not be sent. Registration cancelled.');
    }
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.activeSessionId = undefined;
    await req.user.save();
  }

  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    if (req.body.email && req.body.email !== user.email) {
      const newEmail = req.body.email;

      if (!req.body.otp) {
        // 1. Email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
          res.status(400);
          throw new Error('Please enter a valid email address');
        }

        // 2. Block disposable domains
        const disposableBlacklist = [
          'mailinator.com',
          '10minutemail.com',
          'tempmail.com',
          'yopmail.com',
          'guerrillamail.com',
          'sharklasers.com',
          'dispostable.com',
          'getairmail.com',
          'burnermail.io'
        ];
        const domain = newEmail.split('@')[1].toLowerCase();
        if (disposableBlacklist.includes(domain)) {
          res.status(400);
          throw new Error('Disposable email addresses are not allowed');
        }

        // 3. DNS MX records verification
        console.log(`[MX Check Profile Update] Checking MX records for domain: ${domain}`);
        const hasMx = await checkMxRecords(domain);
        console.log(`[MX Check Profile Update] Result for ${domain}: ${hasMx}`);
        if (!hasMx) {
          res.status(400);
          throw new Error('Please enter a valid Email address');
        }

        // 4. Duplicate Check
        const emailExists = await User.findOne({ email: newEmail });
        if (emailExists) {
          res.status(400);
          throw new Error('Email already in use');
        }

        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.tempEmail = newEmail;
        user.emailOtp = otp;
        user.emailOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        // Send the verification code email
        const message = `You requested to update your email address. Your 4-digit verification code is:\n\n${otp}\n\nThis code is valid for 10 minutes.`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #129a93; text-align: center;">Verify Your New Email Address</h2>
            <p>Hello ${user.name},</p>
            <p>You requested to update your email address to this one. Please enter the following 4-digit verification code on the profile page to complete the change:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #129a93; background-color: #f7fafc; padding: 10px 20px; border: 1px dashed #129a93; border-radius: 5px; display: inline-block;">${otp}</span>
            </div>
            <p style="color: #718096; font-size: 0.875rem;">This code is valid for 10 minutes. If you did not make this request, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="color: #a0aec0; font-size: 0.75rem; text-align: center;">This is an automated email, please do not reply.</p>
          </div>
        `;

        try {
          await sendEmail({
            email: newEmail,
            subject: 'Bina Medical - Verify Your New Email Address',
            message,
            html,
          });

          return res.json({
            emailOtpSent: true,
            message: 'Verification code sent to new email address',
          });
        } catch (error) {
          user.tempEmail = undefined;
          user.emailOtp = undefined;
          user.emailOtpExpire = undefined;
          await user.save();
          res.status(500);
          throw new Error('Verification email could not be sent. Please try again.');
        }
      } else {
        // OTP is provided, verify it
        if (newEmail !== user.tempEmail) {
          res.status(400);
          throw new Error('Email address does not match the pending verification email');
        }

        if (user.emailOtp !== req.body.otp || user.emailOtpExpire < Date.now()) {
          res.status(400);
          throw new Error('Invalid or expired verification code');
        }

        // OTP is valid, apply new email
        user.email = user.tempEmail;
        user.tempEmail = undefined;
        user.emailOtp = undefined;
        user.emailOtpExpire = undefined;
      }
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === 'Admin') {
      res.status(400);
      throw new Error('Cannot delete admin user');
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User deleted successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  // Create reset url
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password:\n\n${resetUrl}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2b6cb0; text-align: center;">Bina Medical Password Reset</h2>
      <p>Hello ${user.name},</p>
      <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      <p>To reset your password, click the button below. This link is valid for 10 minutes:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #718096; font-size: 0.875rem;">If the button above doesn't work, copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #3182ce; font-size: 0.875rem;">${resetUrl}</p>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="color: #a0aec0; font-size: 0.75rem; text-align: center;">This is an automated email, please do not reply.</p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Bina Medical - Password Reset Request',
      message,
      html,
    });

    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Reset password
// @route   PUT /api/users/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  // Hash token from params
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired password reset token');
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.activeSessionId = undefined; // Invalidate current session for security

  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successful' });
});

// @desc    Verify user email
// @route   PUT /api/users/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({ verificationToken: req.params.token });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired email verification token');
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res.status(200).json({ success: true, message: 'Email verified successfully' });
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
