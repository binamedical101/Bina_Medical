import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  return (
    <div className='flex justify-center mb-8'>
      <div className='flex items-center w-full max-w-3xl'>
        
        {/* Step 1: Sign In */}
        <div className='flex items-center relative'>
          <div className={`rounded-full h-8 w-8 flex items-center justify-center font-bold ${step1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            {step2 ? <Check className='w-4 h-4' /> : '1'}
          </div>
          <div className='absolute top-10 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600 hidden sm:block'>
            {step1 ? <Link to='/login' className='hover:text-blue-600'>Sign In</Link> : 'Sign In'}
          </div>
        </div>

        <div className={`flex-auto border-t-2 transition-colors duration-300 ${step2 ? 'border-blue-600' : 'border-gray-200'}`}></div>

        {/* Step 2: Shipping */}
        <div className='flex items-center relative'>
          <div className={`rounded-full h-8 w-8 flex items-center justify-center font-bold ${step2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            {step3 ? <Check className='w-4 h-4' /> : '2'}
          </div>
          <div className='absolute top-10 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600 hidden sm:block'>
            {step2 ? <Link to='/shipping' className='hover:text-blue-600'>Shipping</Link> : 'Shipping'}
          </div>
        </div>

        <div className={`flex-auto border-t-2 transition-colors duration-300 ${step3 ? 'border-blue-600' : 'border-gray-200'}`}></div>

        {/* Step 3: Payment */}
        <div className='flex items-center relative'>
          <div className={`rounded-full h-8 w-8 flex items-center justify-center font-bold ${step3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            {step4 ? <Check className='w-4 h-4' /> : '3'}
          </div>
          <div className='absolute top-10 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600 hidden sm:block'>
            {step3 ? <Link to='/payment' className='hover:text-blue-600'>Payment</Link> : 'Payment'}
          </div>
        </div>

        <div className={`flex-auto border-t-2 transition-colors duration-300 ${step4 ? 'border-blue-600' : 'border-gray-200'}`}></div>

        {/* Step 4: Place Order */}
        <div className='flex items-center relative'>
          <div className={`rounded-full h-8 w-8 flex items-center justify-center font-bold ${step4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            4
          </div>
          <div className='absolute top-10 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600 hidden sm:block'>
            {step4 ? <Link to='/placeorder' className='hover:text-blue-600'>Place Order</Link> : 'Place Order'}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutSteps;
