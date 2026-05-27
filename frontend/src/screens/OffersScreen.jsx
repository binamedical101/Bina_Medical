import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGetMedicinesQuery } from '../slices/medicinesApiSlice';
import MedicineCard from '../components/MedicineCard';
import Loader from '../components/Loader';
import Message from '../components/Message';

const OffersScreen = () => {
  const navigate = useNavigate();

  // Fetch medicines that are on offer
  const { data: medicinesData, isLoading, error } = useGetMedicinesQuery({ 
    isOffer: true,
    pageSize: 100 // Fetch all offers
  });

  return (
    <div className='py-6'>
      <div className='mb-8 bg-pe-teal-light p-8 rounded-2xl border border-pe-teal border-opacity-20 shadow-sm relative overflow-hidden'>
        <div className="absolute top-0 right-0 w-64 h-64 bg-pe-teal rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className='relative z-10 flex items-start gap-4'>
          <button 
            onClick={() => navigate(-1)}
            className='mt-1 p-2 bg-white/50 hover:bg-white rounded-full transition-colors flex items-center justify-center'
            title='Go Back'
          >
            <ArrowLeft className='w-6 h-6 text-pe-teal' />
          </button>
          <div>
            <h1 className='text-3xl font-extrabold text-pe-text-main flex items-center'>
              <span className='bg-pe-orange text-white text-sm font-bold px-3 py-1 rounded-full mr-3 transform -rotate-3'>
                SALE
              </span>
              Special Offers
            </h1>
            <p className='text-pe-text-muted mt-2 max-w-2xl text-lg'>
              Grab the best deals on healthcare products and medicines. Limited time offers with up to 50% discount!
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error || 'An error occurred'}</Message>
      ) : (
        <div className='bg-white p-6 rounded-2xl border border-pe-border shadow-sm'>
          {medicinesData?.medicines && medicinesData.medicines.length > 0 ? (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
              {medicinesData.medicines.map((medicine) => (
                <MedicineCard key={medicine._id} medicine={medicine} />
              ))}
            </div>
          ) : (
            <div className='py-12 text-center'>
              <h2 className='text-2xl font-bold text-pe-text-main mb-2'>No Offers Available</h2>
              <p className='text-pe-text-muted'>Check back later for exciting discounts and offers.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OffersScreen;
