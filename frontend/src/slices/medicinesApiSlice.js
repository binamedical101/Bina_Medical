import { MEDICINES_URL } from '../constants';
import { apiSlice } from './apiSlice';

export const medicinesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMedicines: builder.query({
      query: ({ keyword, pageNumber, category, prescription, isOffer }) => ({
        url: MEDICINES_URL,
        params: { keyword, pageNumber, category, prescription, isOffer },
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Medicine'],
    }),
    getMedicineDetails: builder.query({
      query: (medicineId) => ({
        url: `${MEDICINES_URL}/${medicineId}`,
      }),
      keepUnusedDataFor: 5,
    }),
    createMedicine: builder.mutation({
      query: () => ({
        url: MEDICINES_URL,
        method: 'POST',
      }),
      invalidatesTags: ['Medicine'],
    }),
    updateMedicine: builder.mutation({
      query: (data) => ({
        url: `${MEDICINES_URL}/${data.medicineId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Medicine'],
    }),
    deleteMedicine: builder.mutation({
      query: (medicineId) => ({
        url: `${MEDICINES_URL}/${medicineId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Medicine'],
    }),
    uploadMedicineImage: builder.mutation({
      query: (data) => ({
        url: '/api/upload',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetMedicinesQuery,
  useGetMedicineDetailsQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
  useUploadMedicineImageMutation,
} = medicinesApiSlice;
