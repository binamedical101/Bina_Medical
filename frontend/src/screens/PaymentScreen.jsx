import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { savePaymentMethod } from '../slices/cartSlice';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';

const PaymentScreen = () => {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [navigate, shippingAddress]);

  const [paymentMethod, setPaymentMethod] = useState('PayU');

  const dispatch = useDispatch();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      
      <div className='bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mt-12'>
        <h1 className='text-2xl font-bold text-gray-900 mb-6'>Payment Method</h1>

        <form onSubmit={submitHandler}>
          <div className='mb-6'>
            <label className='block text-gray-700 text-sm font-bold mb-4'>
              Select Method
            </label>
            <div className='flex flex-col gap-4'>
              <label className='flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors'>
                <input
                  type='radio'
                  className='form-radio h-5 w-5 text-blue-600'
                  name='paymentMethod'
                  value='PayU'
                  checked={paymentMethod === 'PayU'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className='ml-3 flex flex-col'>
                  <span className='text-gray-900 font-medium'>PayU / Credit Card</span>
                  <span className='text-gray-500 text-sm'>Pay securely with your credit/debit card</span>
                </span>
              </label>

              <label className='flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors'>
                <input
                  type='radio'
                  className='form-radio h-5 w-5 text-blue-600'
                  name='paymentMethod'
                  value='CashOnDelivery'
                  checked={paymentMethod === 'CashOnDelivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className='ml-3 flex flex-col'>
                  <span className='text-gray-900 font-medium'>Cash on Delivery</span>
                  <span className='text-gray-500 text-sm'>Pay when you receive your order</span>
                </span>
              </label>
            </div>
          </div>

          <button
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors'
            type='submit'
          >
            Continue
          </button>
        </form>
      </div>
    </FormContainer>
  );
};

export default PaymentScreen;
