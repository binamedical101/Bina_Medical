import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'Bina Medical',
    },
    contactEmail: {
      type: String,
      default: 'support@binamedical.com',
    },
    storeAddress: {
      type: String,
      default: '123 Health Ave, Medical District, NY 10001',
    },
    taxRate: {
      type: Number,
      default: 18,
    },
    shippingFee: {
      type: Number,
      default: 50,
    },
    freeShippingThreshold: {
      type: Number,
      default: 1000,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;
