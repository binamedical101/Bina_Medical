import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Check, X } from 'lucide-react';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';

const OrderListScreen = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-2xl font-extrabold text-gray-900'>Orders Management</h1>
          <p className='text-gray-500 text-sm mt-1'>View and update customer orders, delivery status, and refunds.</p>
        </div>
      </div>
      
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-gray-50 border-b border-gray-100'>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Order ID</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Customer</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Date</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Total</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Payment</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Status</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {orders.map((order) => (
                <tr key={order._id} className='hover:bg-gray-50 transition-colors'>
                  <td className='px-6 py-4 font-mono text-sm text-gray-600'>{order._id}</td>
                  <td className='px-6 py-4 text-sm font-bold text-gray-900'>{order.user && order.user.name}</td>
                  <td className='px-6 py-4 text-sm text-gray-600'>{order.createdAt.substring(0, 10)}</td>
                  <td className='px-6 py-4 text-sm font-bold text-pe-teal'>₹{order.totalPrice.toFixed(2)}</td>
                  <td className='px-6 py-4'>
                    {order.isRefunded ? (
                      <span className='inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800'>
                        Refunded
                      </span>
                    ) : order.isPaid ? (
                      <span className='inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800'>
                        <Check className='w-3 h-3 mr-1' /> Paid
                      </span>
                    ) : (
                      <span className='inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800'>
                        <X className='w-3 h-3 mr-1' /> Unpaid
                      </span>
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {order.status || 'Processing'}
                    </span>
                    {order.trackingId && (
                      <div className='text-xs text-gray-500 mt-1 font-mono'>
                        {order.deliveryPartner}: {order.trackingId}
                      </div>
                    )}
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <Link to={`/order/${order._id}`}>
                      <button className='p-2 text-pe-teal bg-pe-teal-light hover:bg-pe-teal hover:text-white rounded-lg transition-colors' title='Manage Order'>
                        <Eye className='w-4 h-4' />
                      </button>
                    </Link>
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

export default OrderListScreen;
