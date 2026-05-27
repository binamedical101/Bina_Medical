import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';

const DeliveryListScreen = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-2xl font-extrabold text-gray-900 flex items-center gap-2'>
            <Truck className='w-6 h-6 text-pe-teal' />
            Delivery Management
          </h1>
          <p className='text-gray-500 text-sm mt-1'>Monitor shipping status and delivery progress for all orders.</p>
        </div>
      </div>
      
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-gray-50 border-b border-gray-100'>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Order ID</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Customer</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Shipping Address</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {orders.map((order) => (
                <tr key={order._id} className='hover:bg-gray-50 transition-colors'>
                  <td className='px-6 py-4 font-mono text-sm text-gray-600'>
                    {order._id.substring(18, 24).toUpperCase()}
                  </td>
                  <td className='px-6 py-4 text-sm font-bold text-gray-900'>{order.user && order.user.name}</td>
                  <td className='px-6 py-4 text-sm text-gray-600'>
                    <div className='flex items-start gap-2 max-w-xs'>
                      <MapPin className='w-4 h-4 text-gray-400 shrink-0 mt-0.5' />
                      <span>{order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</span>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex flex-col gap-1 items-start'>
                      <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {order.status === 'Delivered' ? <CheckCircle className='w-3 h-3 mr-1' /> : <Clock className='w-3 h-3 mr-1' />}
                        {order.status || 'Processing'}
                      </span>
                    </div>
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

export default DeliveryListScreen;
