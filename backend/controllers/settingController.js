import asyncHandler from 'express-async-handler';
import Setting from '../models/settingModel.js';

// @desc    Get global settings
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();

  // If no settings document exists yet, create a default one
  if (!settings) {
    settings = await Setting.create({});
  }

  res.json(settings);
});

// @desc    Update global settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();

  if (!settings) {
    settings = await Setting.create({});
  }

  const {
    storeName,
    contactEmail,
    storeAddress,
    taxRate,
    shippingFee,
    freeShippingThreshold,
    emailNotifications,
    maintenanceMode,
  } = req.body;

  settings.storeName = storeName !== undefined ? storeName : settings.storeName;
  settings.contactEmail = contactEmail !== undefined ? contactEmail : settings.contactEmail;
  settings.storeAddress = storeAddress !== undefined ? storeAddress : settings.storeAddress;
  settings.taxRate = taxRate !== undefined ? taxRate : settings.taxRate;
  settings.shippingFee = shippingFee !== undefined ? shippingFee : settings.shippingFee;
  settings.freeShippingThreshold = freeShippingThreshold !== undefined ? freeShippingThreshold : settings.freeShippingThreshold;
  settings.emailNotifications = emailNotifications !== undefined ? emailNotifications : settings.emailNotifications;
  settings.maintenanceMode = maintenanceMode !== undefined ? maintenanceMode : settings.maintenanceMode;

  const updatedSettings = await settings.save();
  res.json(updatedSettings);
});

export { getSettings, updateSettings };
