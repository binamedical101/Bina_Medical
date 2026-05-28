import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';
import { logout } from './authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include',
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  } else if (!result.error) {
    const { auth } = api.getState();
    if (auth && auth.userInfo) {
      const expirationTime = new Date().getTime() + 15 * 60 * 1000;
      localStorage.setItem('sessionExpiration', expirationTime.toString());
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Medicine', 'Order', 'User', 'Category'],
  endpoints: (builder) => ({}),
});
