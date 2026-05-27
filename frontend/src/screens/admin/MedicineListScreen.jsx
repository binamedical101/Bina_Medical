import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import {
  useGetMedicinesQuery,
  useCreateMedicineMutation,
  useDeleteMedicineMutation,
} from '../../slices/medicinesApiSlice';

const MedicineListScreen = () => {
  const { data, isLoading, error, refetch } = useGetMedicinesQuery({ pageNumber: 1 });

  const [createMedicine, { isLoading: loadingCreate, error: errorCreate }] = useCreateMedicineMutation();
  const [deleteMedicine, { isLoading: loadingDelete, error: errorDelete }] = useDeleteMedicineMutation();

  const navigate = useNavigate();

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await deleteMedicine(id);
        refetch();
      } catch (err) {
        console.log(err);
      }
    }
  };

  const createMedicineHandler = async () => {
    if (window.confirm('Are you sure you want to create a new medicine?')) {
      try {
        const res = await createMedicine().unwrap();
        navigate(`/admin/medicine/${res._id}/edit`);
      } catch (err) {
        console.log(err);
      }
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  return (
    <div className='py-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Medicines Management</h1>
        <button
          className='flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors'
          onClick={createMedicineHandler}
          disabled={loadingCreate}
        >
          <Plus className='w-5 h-5 mr-2' />
          Create Medicine
        </button>
      </div>

      {loadingDelete && <Loader />}
      {errorDelete && <Message variant='danger'>{errorDelete?.data?.message || errorDelete.error}</Message>}
      {loadingCreate && <Loader />}
      {errorCreate && <Message variant='danger'>{errorCreate?.data?.message || errorCreate.error}</Message>}

      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-gray-50 border-b border-gray-100'>
                <th className='p-4 font-bold text-gray-700 text-sm uppercase tracking-wider'>ID</th>
                <th className='p-4 font-bold text-gray-700 text-sm uppercase tracking-wider'>NAME</th>
                <th className='p-4 font-bold text-gray-700 text-sm uppercase tracking-wider'>PRICE</th>
                <th className='p-4 font-bold text-gray-700 text-sm uppercase tracking-wider'>CATEGORY</th>
                <th className='p-4 font-bold text-gray-700 text-sm uppercase tracking-wider'>STOCK</th>
                <th className='p-4 font-bold text-gray-700 text-sm uppercase tracking-wider'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {data?.medicines?.map((medicine) => (
                <tr key={medicine._id} className='hover:bg-gray-50 transition-colors'>
                  <td className='p-4 text-sm text-gray-600 font-medium'>{medicine._id}</td>
                  <td className='p-4 text-sm text-gray-900 font-bold'>{medicine.name}</td>
                  <td className='p-4 text-sm text-pe-teal font-bold'>₹{medicine.price.toFixed(2)}</td>
                  <td className='p-4 text-sm text-gray-600'>{medicine.category?.name || 'Uncategorized'}</td>
                  <td className='p-4 text-sm font-bold'>
                    {medicine.stockQuantity > 0 ? (
                      <span className='text-green-600'>{medicine.stockQuantity}</span>
                    ) : (
                      <span className='text-red-600'>Out of Stock</span>
                    )}
                  </td>
                  <td className='p-4 text-right flex justify-end gap-2'>
                    <Link to={`/admin/medicine/${medicine._id}/edit`}>
                      <button className='p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-colors'>
                        <Edit className='w-4 h-4' />
                      </button>
                    </Link>
                    <button
                      className='p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-colors'
                      onClick={() => deleteHandler(medicine._id)}
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicineListScreen;
