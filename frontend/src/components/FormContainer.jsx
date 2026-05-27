import React from 'react';

const FormContainer = ({ children }) => {
  return (
    <div className='flex justify-center'>
      <div className='w-full max-w-md px-4 py-8'>
        {children}
      </div>
    </div>
  );
};

export default FormContainer;
