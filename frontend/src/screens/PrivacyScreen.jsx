import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Share2, CheckSquare } from 'lucide-react';

const PrivacyScreen = () => {
  const navigate = useNavigate();

  return (
    <div className='bg-gray-50 min-h-screen pb-12'>
      {/* Hero Section */}
      <div className='bg-pe-teal relative overflow-hidden pb-24 pt-12 px-4 sm:px-6 lg:px-8'>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pe-orange rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        
        <div className='max-w-4xl mx-auto relative z-10'>
          <div className='flex items-center gap-4 mb-6'>
            <button 
              onClick={() => navigate(-1)}
              className='p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors flex items-center justify-center text-white backdrop-blur-sm'
              title='Go Back'
            >
              <ArrowLeft className='w-6 h-6' />
            </button>
            <div className='bg-white/20 p-2 rounded-lg backdrop-blur-sm'>
              <Shield className='w-6 h-6 text-white' />
            </div>
          </div>
          <h1 className='text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4'>
            Privacy Policy
          </h1>
          <p className='text-pe-teal-light text-lg max-w-2xl'>
            Your privacy is our priority. Learn how we collect, use, and protect your personal and medical information.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20'>
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
          
          <div className='p-8 md:p-12 space-y-12'>
            {/* Section 1 */}
            <section className='flex flex-col md:flex-row gap-6'>
              <div className='shrink-0'>
                <div className='w-12 h-12 bg-pe-teal-light rounded-2xl flex items-center justify-center'>
                  <Eye className='w-6 h-6 text-pe-teal' />
                </div>
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 mb-3'>1. Information We Collect</h2>
                <p className='text-gray-600 leading-relaxed'>
                  We collect information from you when you register on our site, place an order, subscribe to our newsletter, respond to a survey, or fill out a form. 
                  This includes your name, email address, mailing address, phone number, and medical prescriptions when applicable.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className='flex flex-col md:flex-row gap-6'>
              <div className='shrink-0'>
                <div className='w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center'>
                  <CheckSquare className='w-6 h-6 text-blue-500' />
                </div>
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 mb-3'>2. How We Use Your Information</h2>
                <p className='text-gray-600 leading-relaxed'>
                  Any of the information we collect from you may be used in one of the following ways:
                </p>
                <ul className='list-disc pl-5 mt-2 space-y-1 text-gray-600'>
                  <li>To personalize your experience.</li>
                  <li>To improve our website and services.</li>
                  <li>To process transactions quickly and securely.</li>
                  <li>To send periodic emails regarding your order or other products.</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section className='flex flex-col md:flex-row gap-6'>
              <div className='shrink-0'>
                <div className='w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center'>
                  <Lock className='w-6 h-6 text-green-500' />
                </div>
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 mb-3'>3. How We Protect Your Information</h2>
                <p className='text-gray-600 leading-relaxed'>
                  We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.
                  We use encryption for sensitive health data and secure socket layer (SSL) technology for all payment transactions.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className='flex flex-col md:flex-row gap-6'>
              <div className='shrink-0'>
                <div className='w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center'>
                  <Share2 className='w-6 h-6 text-purple-500' />
                </div>
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 mb-3'>4. Third-Party Disclosure</h2>
                <p className='text-gray-600 leading-relaxed'>
                  We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
                </p>
              </div>
            </section>

            <hr className='border-gray-100' />

            <div className='text-sm text-gray-500 text-center'>
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyScreen;
