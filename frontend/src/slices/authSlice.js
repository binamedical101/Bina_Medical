import { createSlice } from '@reduxjs/toolkit';

const getInitialUserInfo = () => {
  const userInfoStr = localStorage.getItem('userInfo');
  const expiration = localStorage.getItem('sessionExpiration');
  
  if (!userInfoStr || !expiration) {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('sessionExpiration');
    return null;
  }
  
  // If session has expired (older than 15 mins of inactivity)
  if (new Date().getTime() > Number(expiration)) {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('sessionExpiration');
    return null;
  }
  
  return JSON.parse(userInfoStr);
};

const initialState = {
  userInfo: getInitialUserInfo(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
      // Set session expiration for 15 minutes from now
      const expirationTime = new Date().getTime() + 15 * 60 * 1000;
      localStorage.setItem('sessionExpiration', expirationTime.toString());
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
      localStorage.removeItem('sessionExpiration');
      localStorage.removeItem('cart');
      localStorage.removeItem('shippingAddress');
      localStorage.removeItem('paymentMethod');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
