import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, Truck, CreditCard, Tag, X } from 'lucide-react';
import CheckoutSteps from '../components/CheckoutSteps';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { useCreateOrderMutation } from '../slices/ordersApiSlice';
import { clearCartItems, calculateTotals, applyCoupon, removeCoupon } from '../slices/cartSlice';
import { useGetSettingsQuery } from '../slices/settingsApiSlice';
import { useValidateCouponMutation } from '../slices/couponsApiSlice';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const { data: settingsData, isLoading: loadingSettings } = useGetSettingsQuery();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/shipping');
    } else if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  useEffect(() => {
    if (settingsData) {
      dispatch(calculateTotals(settingsData));
    }
  }, [settingsData, cart.cartItems, dispatch]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const [validateCoupon, { isLoading: loadingCoupon }] = useValidateCouponMutation();

  const applyCouponHandler = async () => {
    setCouponError('');
    setCouponSuccess('');
    if (!promoCode) {
      setCouponError('Please enter a coupon code');
      return;
    }
    try {
      const coupon = await validateCoupon({ code: promoCode }).unwrap();
      if (Number(cart.itemsPrice) < coupon.minPurchaseAmount) {
        setCouponError(`Minimum purchase of ₹${coupon.minPurchaseAmount} required for this coupon`);
        return;
      }
      dispatch(applyCoupon(coupon));
      setCouponSuccess(`Coupon "${coupon.code}" applied successfully!`);
      setPromoCode('');
    } catch (err) {
      setCouponError(err?.data?.message || err.error || 'Invalid coupon code');
    }
  };

  const removeCouponHandler = () => {
    dispatch(removeCoupon());
    setCouponError('');
    setCouponSuccess('');
  };

  const placeOrderHandler = () => {
    if (cart.paymentMethod === 'PayU') {
      setShowPaymentModal(true);
    } else {
      executeOrder(undefined);
    }
  };

  const handleMockPaymentSuccess = () => {
    setShowPaymentModal(false);
    const mockPaymentResult = {
      id: `PAYU-${Math.random().toString(36).substr(2, 9)}`, 
      status: 'success', 
      update_time: new Date().toISOString(), 
      email_address: userInfo.email 
    };
    executeOrder(mockPaymentResult);
  };

  const executeOrder = async (mockPaymentResult) => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems.map((item) => ({
          ...item,
          image: item.images?.[0] || '/images/sample.jpg',
        })),
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
        couponCode: cart.coupon ? cart.coupon.code : undefined,
        couponDiscount: cart.couponDiscount || 0,
        paymentResult: mockPaymentResult,
      }).unwrap();
      
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`); 
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className='py-8'>
      <CheckoutSteps step1 step2 step3 step4 />
      
      <div className='flex flex-col lg:flex-row gap-8 mt-12'>
        <div className='lg:w-2/3 flex flex-col gap-8'>
          
          <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
            <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
              <Truck className='w-5 h-5 mr-2 text-blue-600' />
              Shipping
            </h2>
            <p className='text-gray-700'>
              <strong>Address: </strong>
              {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
              {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
            </p>
          </div>

          <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
            <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
              <CreditCard className='w-5 h-5 mr-2 text-blue-600' />
              Payment Method
            </h2>
            <p className='text-gray-700'>
              <strong>Method: </strong>
              {cart.paymentMethod}
            </p>
          </div>

          <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
            <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
              <ShoppingBag className='w-5 h-5 mr-2 text-blue-600' />
              Order Items
            </h2>
            {cart.cartItems.length === 0 ? (
              <Message>Your cart is empty</Message>
            ) : (
              <ul className='divide-y divide-gray-100'>
                {cart.cartItems.map((item, index) => (
                  <li key={index} className='py-4 flex items-center gap-4'>
                    <img src={item.images?.[0] || '/images/sample.jpg'} alt={item.name} className='w-16 h-16 object-cover rounded-lg' />
                    <Link to={`/medicine/${item._id}`} className='flex-1 text-gray-800 font-medium hover:text-blue-600'>
                      {item.name}
                    </Link>
                    <div className='text-gray-600 font-medium'>
                      {item.qty} x ₹{(item.price * (1 - item.discountPercentage / 100)).toFixed(2)} = ₹{(item.qty * (item.price * (1 - item.discountPercentage / 100))).toFixed(2)}
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
              <span>₹{cart.itemsPrice}</span>
            </div>
            <div className='flex justify-between mb-4 text-gray-600'>
              <span>Shipping</span>
              <span>₹{cart.shippingPrice}</span>
            </div>
            <div className='flex justify-between mb-6 text-gray-600 pb-4 border-b border-gray-100'>
              <span>Tax</span>
              <span>₹{cart.taxPrice}</span>
            </div>

            {/* Promo Code Input */}
            <div className='mb-6'>
              <label className='block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider'>
                Promo Code / Coupon
              </label>
              {cart.coupon ? (
                <div className='flex items-center justify-between p-2.5 bg-green-50 border border-green-200 rounded-xl text-sm'>
                  <span className='flex items-center gap-2 font-mono font-bold text-green-700'>
                    <Tag className='w-4 h-4 text-green-600' />
                    {cart.coupon.code} (Applied)
                  </span>
                  <button
                    type='button'
                    onClick={removeCouponHandler}
                    className='p-1 text-gray-400 hover:text-red-500 rounded-full transition-colors'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>
              ) : (
                <div className='flex gap-2'>
                  <input
                    type='text'
                    placeholder='ENTER CODE'
                    className='flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:ring-pe-teal focus:border-pe-teal uppercase'
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  />
                  <button
                    type='button'
                    onClick={applyCouponHandler}
                    className='bg-pe-teal hover:bg-pe-teal-dark text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors'
                    disabled={loadingCoupon}
                  >
                    {loadingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              )}
              {couponError && <p className='text-xs text-red-500 mt-1 font-medium'>{couponError}</p>}
              {couponSuccess && <p className='text-xs text-green-600 mt-1 font-medium'>{couponSuccess}</p>}
            </div>

            {Number(cart.couponDiscount) > 0 && (
              <div className='flex justify-between mb-4 text-green-600 font-bold'>
                <span className='flex items-center gap-1'>
                  <Tag className='w-4 h-4 text-green-600' /> Discount ({cart.coupon?.code})
                </span>
                <span>-₹{cart.couponDiscount}</span>
              </div>
            )}
            
            <div className='flex justify-between mb-8 text-xl font-extrabold text-gray-900 pt-4 border-t border-gray-100'>
              <span>Total</span>
              <span>₹{cart.totalPrice}</span>
            </div>

            {error && <Message variant='danger'>{error?.data?.message || error.error}</Message>}

            <button
              type='button'
              className='w-full bg-blue-600 text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={cart.cartItems.length === 0}
              onClick={placeOrderHandler}
            >
              {cart.paymentMethod === 'PayU' ? 'Pay Now (Mock PayU)' : 'Place Order'}
            </button>
            {isLoading && <Loader />}
          </div>
        </div>
      </div>

      {/* Mock Payment Modal */}
      {showPaymentModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all'>
            <div className='flex items-center justify-center mb-6'>
              <div className='bg-blue-100 p-4 rounded-full'>
                <CreditCard className='w-8 h-8 text-blue-600' />
              </div>
            </div>
            <h3 className='text-2xl font-bold text-center text-gray-900 mb-2'>PayU Checkout</h3>
            <p className='text-center text-gray-600 mb-8'>
              You are securely paying <strong className='text-gray-900 font-bold'>₹{cart.totalPrice}</strong>.
              Please select the outcome of this mock transaction.
            </p>
            <div className='flex flex-col gap-4'>
              <button
                onClick={handleMockPaymentSuccess}
                className='w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors flex justify-center items-center'
              >
                Simulate Successful Payment
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className='w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl transition-colors'
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrderScreen;
