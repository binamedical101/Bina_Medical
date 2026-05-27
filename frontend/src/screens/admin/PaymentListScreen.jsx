import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X, TrendingUp } from 'lucide-react';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';

const PaymentListScreen = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-2xl font-extrabold text-gray-900'>Payments Management</h1>
          <p className='text-gray-500 text-sm mt-1'>View and track customer payments, refunds, and financial transactions.</p>
        </div>
      </div>
      
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-gray-50 border-b border-gray-100'>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Transaction ID</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Customer</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Method</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Total</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Status</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Date</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {orders.map((order) => (
                <tr key={order._id} className='hover:bg-gray-50 transition-colors'>
                  <td className='px-6 py-4 font-mono text-sm text-gray-600'>
                    {order.paymentResult?.id ? order.paymentResult.id.substring(0, 15) + '...' : order._id}
                  </td>
                  <td className='px-6 py-4 text-sm font-bold text-gray-900'>{order.user && order.user.name}</td>
                  <td className='px-6 py-4 text-sm font-bold text-gray-700'>{order.paymentMethod}</td>
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
                  <td className='px-6 py-4 text-sm text-gray-600'>
                    {order.isRefunded && order.refundedAt 
                      ? `Refunded: ${order.refundedAt.substring(0, 10)}` 
                      : order.isPaid && order.paidAt 
                        ? `Paid: ${order.paidAt.substring(0, 10)}`
                        : `Created: ${order.createdAt.substring(0, 10)}`
                    }
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

export default PaymentListScreen;
