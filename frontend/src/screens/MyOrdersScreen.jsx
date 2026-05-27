import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import { Package, CheckCircle, XCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import Loader from '../components/Loader';
import Message from '../components/Message';

const MyOrdersScreen = () => {
  const navigate = useNavigate();
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();

  return (
    <div className='max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
      <div className='flex items-center gap-3 mb-8'>
        <button 
          onClick={() => navigate(-1)}
          className='mr-2 p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center'
          title='Go Back'
        >
          <ArrowLeft className='w-6 h-6 text-gray-600' />
        </button>
        <div className='bg-pe-teal-light p-3 rounded-full'>
          <Package className='w-6 h-6 text-pe-teal' />
        </div>
        <h1 className='text-3xl font-extrabold text-pe-text-main tracking-tight'>
          My Orders
        </h1>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : orders.length === 0 ? (
        <div className='bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center'>
          <div className='w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Package className='w-10 h-10 text-gray-300' />
          </div>
          <h2 className='text-2xl font-bold text-pe-text-main mb-2'>No Orders Yet</h2>
          <p className='text-gray-500 mb-6'>You haven't placed any orders on Bina Medical.</p>
          <Link to='/shop' className='inline-block bg-pe-teal text-white font-bold px-8 py-3 rounded-xl hover:bg-pe-teal-dark transition-colors shadow-md hover:shadow-lg'>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500'>
                  <th className='p-4 font-bold'>Order ID</th>
                  <th className='p-4 font-bold'>Date</th>
                  <th className='p-4 font-bold'>Total</th>
                  <th className='p-4 font-bold'>Paid Status</th>
                  <th className='p-4 font-bold'>Delivery</th>
                  <th className='p-4 font-bold text-right'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {orders.map((order) => (
                  <tr key={order._id} className='hover:bg-gray-50/50 transition-colors group'>
                    <td className='p-4'>
                      <span className='font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded'>
                        {order._id.substring(18, 24).toUpperCase()}
                      </span>
                    </td>
                    <td className='p-4 text-sm text-pe-text-main font-medium'>
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className='p-4 font-bold text-pe-text-main'>
                      ₹{order.totalPrice}
                    </td>
                    <td className='p-4'>
                      {order.isPaid ? (
                        <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200'>
                          <CheckCircle className='w-3.5 h-3.5' />
                          Paid
                        </div>
                      ) : (
                        <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-200'>
                          <XCircle className='w-3.5 h-3.5' />
                          Unpaid
                        </div>
                      )}
                    </td>
                    <td className='p-4'>
                      {order.status === 'Delivered' ? (
                        <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200'>
                          <CheckCircle className='w-3.5 h-3.5' />
                          Delivered
                        </div>
                      ) : order.status === 'Shipped' ? (
                        <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200'>
                          Shipped
                        </div>
                      ) : order.status === 'Cancelled' ? (
                        <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-200'>
                          <XCircle className='w-3.5 h-3.5' />
                          Cancelled
                        </div>
                      ) : (
                        <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold border border-orange-200'>
                          Processing
                        </div>
                      )}
                    </td>
                    <td className='p-4 text-right'>
                      <Link 
                        to={`/order/${order._id}`}
                        className='inline-flex items-center gap-1 text-pe-teal hover:text-pe-teal-dark font-bold text-sm bg-pe-teal-light hover:bg-pe-teal hover:text-white px-4 py-2 rounded-lg transition-all'
                      >
                        Details
                        <ChevronRight className='w-4 h-4' />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersScreen;
