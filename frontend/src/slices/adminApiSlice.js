import { apiSlice } from './apiSlice';
import { ORDERS_URL, USERS_URL, MEDICINES_URL } from '../constants';

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => ({
        url: `/api/admin/dashboard`,
      }),
      keepUnusedDataFor: 5,
    }),
    getInventoryStats: builder.query({
      query: () => ({
        url: `/api/inventory`,
      }),
      keepUnusedDataFor: 5,
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetInventoryStatsQuery } = adminApiSlice;
