import React from 'react';
import Hero from '../components/Hero';
import MedicineCard from '../components/MedicineCard';
import CategoryCard from '../components/CategoryCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useGetMedicinesQuery } from '../slices/medicinesApiSlice';
import { useGetCategoriesQuery } from '../slices/categoriesApiSlice';

const HomeScreen = () => {
  const {
    data: medicinesData,
    isLoading: loadingMedicines,
    error: errorMedicines,
  } = useGetMedicinesQuery({ keyword: '', pageNumber: 1, category: '', prescription: '' });

  const {
    data: categoriesData,
    isLoading: loadingCategories,
    error: errorCategories,
  } = useGetCategoriesQuery();

  return (
    <>
      <Hero />
      <div className='mb-12'>
        <div className='flex justify-between items-end mb-6'>
          <div>
            <h2 className='text-2xl font-bold text-pe-text-main'>Shop by Category</h2>
            <p className='text-pe-text-muted text-sm mt-1'>Find exactly what you need quickly.</p>
          </div>
        </div>
        
        {loadingCategories ? (
          <Loader />
        ) : errorCategories ? (
          <Message variant='danger'>{errorCategories?.data?.message || errorCategories.error}</Message>
        ) : (
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
            {categoriesData?.slice(0, 11).map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
            <CategoryCard isExploreMore={true} category={{ name: 'Explore More' }} customLink='/shop' />
          </div>
        )}
      </div>
      
      <div className='mb-12'>
        <div className='flex justify-between items-end mb-6'>
          <div>
            <h2 className='text-2xl font-bold text-pe-text-main'>Featured Medicines</h2>
            <p className='text-pe-text-muted text-sm mt-1'>Top quality healthcare products for you.</p>
          </div>
        </div>

        {loadingMedicines ? (
          <Loader />
        ) : errorMedicines ? (
          <Message variant='danger'>{errorMedicines?.data?.message || errorMedicines.error}</Message>
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
            {medicinesData?.medicines?.map((medicine) => (
              <MedicineCard key={medicine._id} medicine={medicine} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default HomeScreen;
