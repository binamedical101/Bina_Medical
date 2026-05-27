import { createSlice } from '@reduxjs/toolkit';
import { updateCart } from '../utils/cartUtils';

const parsedCart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : null;
const initialState = {
  cartItems: parsedCart?.cartItems || [],
  shippingAddress: parsedCart?.shippingAddress || {},
  paymentMethod: parsedCart?.paymentMethod || 'PayU',
  coupon: parsedCart?.coupon || null,
  couponDiscount: parsedCart?.couponDiscount || 0,
  itemsPrice: parsedCart?.itemsPrice || '0.00',
  shippingPrice: parsedCart?.shippingPrice || '0.00',
  taxPrice: parsedCart?.taxPrice || '0.00',
  totalPrice: parsedCart?.totalPrice || '0.00',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }

      updateCart(state);
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      updateCart(state);
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      updateCart(state);
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      updateCart(state);
    },
    clearCartItems: (state, action) => {
      state.cartItems = [];
      state.coupon = null;
      state.couponDiscount = 0;
      updateCart(state);
    },
    calculateTotals: (state, action) => {
      const settings = action.payload;
      updateCart(state, settings);
    },
    applyCoupon: (state, action) => {
      state.coupon = action.payload;
      updateCart(state);
    },
    removeCoupon: (state) => {
      state.coupon = null;
      state.couponDiscount = 0;
      updateCart(state);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
  calculateTotals,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;

export default cartSlice.reducer;
