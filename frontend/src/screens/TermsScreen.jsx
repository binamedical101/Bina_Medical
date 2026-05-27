import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, AlertCircle, Scale, RefreshCw } from 'lucide-react';

const TermsScreen = () => {
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
              <FileText className='w-6 h-6 text-white' />
            </div>
          </div>
          <h1 className='text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4'>
            Terms of Service
          </h1>
          <p className='text-pe-teal-light text-lg max-w-2xl'>
            Please read these terms carefully before using Bina Medical. They outline your rights and responsibilities when using our platform.
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
                  <Shield className='w-6 h-6 text-pe-teal' />
                </div>
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 mb-3'>1. Acceptance of Terms</h2>
                <p className='text-gray-600 leading-relaxed'>
                  By accessing and using Bina Medical, you accept and agree to be bound by the terms and provision of this agreement.
                  In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className='flex flex-col md:flex-row gap-6'>
              <div className='shrink-0'>
                <div className='w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center'>
                  <RefreshCw className='w-6 h-6 text-blue-500' />
                </div>
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 mb-3'>2. Provision of Services</h2>
                <p className='text-gray-600 leading-relaxed'>
                  Bina Medical is constantly innovating in order to provide the best possible experience for its users. You acknowledge and agree that the form and nature of the services which Bina Medical provides may change from time to time without prior notice to you.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className='flex flex-col md:flex-row gap-6'>
              <div className='shrink-0'>
                <div className='w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center'>
                  <AlertCircle className='w-6 h-6 text-orange-500' />
                </div>
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 mb-3'>3. User Responsibilities</h2>
                <p className='text-gray-600 leading-relaxed'>
                  You agree to use the platform only for lawful purposes. You agree not to take any action that might compromise the security of the site, render the site inaccessible to others, or otherwise cause damage to the site or its content.
                  <br/><br/>
                  <span className='font-semibold text-gray-800'>Providing false prescription information is strictly prohibited and violates these terms.</span>
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className='flex flex-col md:flex-row gap-6'>
              <div className='shrink-0'>
                <div className='w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center'>
                  <Scale className='w-6 h-6 text-red-500' />
                </div>
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 mb-3'>4. Medical Disclaimer</h2>
                <p className='text-gray-600 leading-relaxed'>
                  The content on Bina Medical is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
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

export default TermsScreen;
