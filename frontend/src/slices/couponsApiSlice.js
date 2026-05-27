import { apiSlice } from './apiSlice';

export const couponsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query({
      query: () => ({
        url: '/api/coupons',
      }),
      keepUnusedDataFor: 5,
    }),
    createCoupon: builder.mutation({
      query: (data) => ({
        url: '/api/coupons',
        method: 'POST',
        body: data,
      }),
    }),
    deleteCoupon: builder.mutation({
      query: (couponId) => ({
        url: `/api/coupons/${couponId}`,
        method: 'DELETE',
      }),
    }),
    validateCoupon: builder.mutation({
      query: (data) => ({
        url: '/api/coupons/validate',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useDeleteCouponMutation,
  useValidateCouponMutation,
} = couponsApiSlice;
