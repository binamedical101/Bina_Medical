import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-white border-t border-gray-200 mt-auto py-3'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-wrap justify-between items-center'>
          <div className='w-full md:w-1/3 text-center md:text-left mb-4 md:mb-0'>
            <h3 className='text-xl font-bold text-pe-teal'>Bina Medical</h3>
            <p className='text-sm text-gray-500 mt-2'>
              Your trusted partner for health and wellness.
            </p>
          </div>
          <div className='w-full md:w-1/3 text-center mb-4 md:mb-0'>
            <p className='text-sm text-gray-600'>
              &copy; {currentYear} Bina Medical. All rights reserved.
            </p>
          </div>
          <div className='w-full md:w-1/3 text-center md:text-right'>
            <div className='flex justify-center md:justify-end space-x-4'>
              <Link to='/faq' className='text-gray-400 hover:text-pe-teal transition-colors'>
                FAQ
              </Link>
              <Link to='/privacy' className='text-gray-400 hover:text-pe-teal transition-colors'>
                Privacy Policy
              </Link>
              <Link to='/terms' className='text-gray-400 hover:text-pe-teal transition-colors'>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
