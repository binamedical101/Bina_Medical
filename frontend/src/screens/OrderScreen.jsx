import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Truck, CreditCard, ShoppingBag, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useDeliverOrderMutation,
  useUpdateOrderAdminMutation,
} from '../slices/ordersApiSlice';
import { useSelector } from 'react-redux';

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();
  const [updateOrderAdmin, { isLoading: loadingUpdateAdmin }] = useUpdateOrderAdminMutation();

  const { userInfo } = useSelector((state) => state.auth);

  // Local state for admin controls
  const [orderStatus, setOrderStatus] = useState('');

  useEffect(() => {
    if (order) {
      setOrderStatus(order.status || 'Processing');
    }
  }, [order]);

  // Removed handleMockPayment since payment is now handled pre-order.

  const adminUpdateHandler = async () => {
    try {
      await updateOrderAdmin({
        orderId,
        data: {
          status: orderStatus,
        }
      }).unwrap();
      refetch();
    } catch (err) {
      console.log(err);
    }
  };



  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  return (
    <div className='py-0'>
      <div className='flex items-center mb-8'>
        <h1 className='text-2xl font-bold text-gray-900'>Order: {order._id}</h1>
      </div>

      <div className='flex flex-col lg:flex-row gap-8'>
        <div className='lg:w-2/3 flex flex-col gap-6'>

          <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
            <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
              <Truck className='w-5 h-5 mr-2 text-blue-600' />
              Shipping
            </h2>
            <p className='text-gray-700 mb-2'>
              <strong>Name: </strong> {order.user.name}
            </p>
            <p className='text-gray-700 mb-4'>
              <strong>Email: </strong> <a href={`mailto:${order.user.email}`} className='text-blue-600 hover:underline'>{order.user.email}</a>
            </p>
            <p className='text-gray-700 mb-4'>
              <strong>Address: </strong>
              {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
            <div className='mb-4'>
              {order.status === 'Delivered' ? (
                <Message variant='success'>Delivered on {order.deliveredAt?.substring(0, 10)}</Message>
              ) : order.status === 'Shipped' ? (
                <Message variant='info'>Shipped (On the way)</Message>
              ) : order.status === 'Dispatched' ? (
                <Message variant='info'>Dispatched From Pharmacy</Message>
              ) : order.status === 'Out for delivery' ? (
                <Message variant='info'>Out for delivery</Message>
              ) : order.status === 'Cancelled' ? (
                <Message variant='danger'>Cancelled</Message>
              ) : (
                <Message variant='warning'>Processing</Message>
              )}
            </div>


          </div>

          <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
            <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
              <CreditCard className='w-5 h-5 mr-2 text-blue-600' />
              Payment Method
            </h2>
            <p className='text-gray-700 mb-4'>
              <strong>Method: </strong>
              {order.paymentMethod}
            </p>
            {order.isPaid ? (
              <Message variant='success'>Paid on {order.paidAt?.substring(0, 10)}</Message>
            ) : (
              <Message variant='warning'>Not Paid</Message>
            )}


          </div>

          <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
            <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
              <ShoppingBag className='w-5 h-5 mr-2 text-blue-600' />
              Order Items
            </h2>
            {order.orderItems.length === 0 ? (
              <Message>Order is empty</Message>
            ) : (
              <ul className='divide-y divide-gray-100'>
                {order.orderItems.map((item, index) => (
                  <li key={index} className='py-4 flex items-center gap-4'>
                    <img src={item.image} alt={item.name} className='w-16 h-16 object-cover rounded-lg' />
                    <Link to={`/medicine/${item.medicine}`} className='flex-1 text-gray-800 font-medium hover:text-blue-600'>
                      {item.name}
                    </Link>
                    <div className='text-gray-600 font-medium'>
                      {item.qty} x ₹{item.price.toFixed(2)} = ₹{(item.qty * item.price).toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className='lg:w-1/3'>
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24'>
            <h2 className='text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100'>Order Summary</h2>

            <div className='flex justify-between mb-4 text-gray-600'>
              <span>Items</span>
              <span>₹{order.itemsPrice.toFixed(2)}</span>
            </div>
            <div className='flex justify-between mb-4 text-gray-600'>
              <span>Shipping</span>
              <span>₹{order.shippingPrice.toFixed(2)}</span>
            </div>
            <div className='flex justify-between mb-6 text-gray-600'>
              <span>Tax</span>
              <span>₹{order.taxPrice.toFixed(2)}</span>
            </div>

            {order.couponDiscount > 0 && (
              <div className='flex justify-between mb-4 text-green-600 font-bold'>
                <span>Discount ({order.couponCode})</span>
                <span>-₹{order.couponDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className='flex justify-between mb-8 text-xl font-extrabold text-gray-900 pt-4 border-t border-gray-100'>
              <span>Total</span>
              <span>₹{order.totalPrice.toFixed(2)}</span>
            </div>

            {/* Payment is now handled pre-order */}

            {userInfo && userInfo.role === 'Admin' && (
              <div className='mt-8 border-t border-gray-100 pt-6'>
                <h3 className='text-lg font-bold text-gray-900 mb-4'>Admin Controls</h3>

                <div className='flex flex-col gap-4 mb-4'>
                  <div>
                    <label className='block text-xs font-bold text-gray-700 mb-1'>Order Status</label>
                    <select
                      className='w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-pe-teal focus:border-pe-teal'
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                    >
                      {['Processing', 'Shipped', 'Dispatched', 'Out for delivery', 'Delivered'].map((opt, idx) => {
                        const flow = ['Processing', 'Shipped', 'Dispatched', 'Out for delivery', 'Delivered'];
                        const currentIdx = flow.indexOf(order.status || 'Processing');
                        return (
                          <option key={opt} value={opt} disabled={idx < currentIdx || order.status === 'Cancelled'}>
                            {opt}
                          </option>
                        );
                      })}
                      <option value='Cancelled' disabled={['Shipped', 'Dispatched', 'Out for delivery', 'Delivered'].includes(order.status) || order.status === 'Cancelled'}>
                        Cancelled
                      </option>
                    </select>
                  </div>


                </div>

                <button
                  type='button'
                  className='w-full bg-gray-900 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors mb-3'
                  onClick={adminUpdateHandler}
                  disabled={loadingUpdateAdmin}
                >
                  {loadingUpdateAdmin ? 'Updating...' : 'Save Updates'}
                </button>


              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;
