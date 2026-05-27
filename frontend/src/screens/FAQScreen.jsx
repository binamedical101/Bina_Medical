import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "How do I place an order?",
    answer: "You can place an order by browsing our medicines or healthcare products, adding them to your cart, and proceeding to checkout. You will need to log in or create an account to complete the purchase."
  },
  {
    question: "Do I need a prescription to order medicines?",
    answer: "Yes, for prescription-only medicines, you must have a valid prescription from a registered medical practitioner. You will be prompted to upload it during the checkout process if required."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept various payment methods including credit/debit cards, net banking, UPI, and digital wallets. We also have a secure mock payment gateway integrated for seamless transactions."
  },
  {
    question: "How can I track my order?",
    answer: "Once logged in, go to the 'My Orders' section from your profile dropdown or the header navigation. There you can see the status of all your recent and past orders."
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns for damaged, defective, or incorrect items within 7 days of delivery. Please contact our support team to initiate a return request."
  }
];

const FAQScreen = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

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
              <HelpCircle className='w-6 h-6 text-white' />
            </div>
          </div>
          <h1 className='text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4'>
            Frequently Asked Questions
          </h1>
          <p className='text-pe-teal-light text-lg max-w-2xl'>
            Have questions? We're here to help. Find answers to common questions about ordering, prescriptions, and more.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20'>
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
          
          <div className='p-8 md:p-12'>
            <div className='space-y-4'>
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                    openIndex === index ? 'border-pe-teal shadow-md' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className='w-full px-6 py-4 flex justify-between items-center bg-white focus:outline-none text-left'
                  >
                    <span className={`font-bold text-lg ${openIndex === index ? 'text-pe-teal' : 'text-gray-800'}`}>
                      {faq.question}
                    </span>
                    <span className={`shrink-0 ml-4 p-1 rounded-full ${openIndex === index ? 'bg-pe-teal-light text-pe-teal' : 'bg-gray-100 text-gray-500'}`}>
                      {openIndex === index ? <ChevronUp className='w-5 h-5' /> : <ChevronDown className='w-5 h-5' />}
                    </span>
                  </button>
                  
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                      openIndex === index ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className='text-gray-600 leading-relaxed border-t border-gray-100 pt-4 mt-2'>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <hr className='border-gray-100 my-10' />

            <div className='text-center bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300'>
              <h3 className='font-bold text-gray-900 mb-2'>Still have questions?</h3>
              <p className='text-gray-600 mb-4'>We're here to help you with whatever you need.</p>
              <button className='bg-pe-teal text-white font-bold px-6 py-2 rounded-lg hover:bg-pe-teal-dark transition-colors'>
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQScreen;
