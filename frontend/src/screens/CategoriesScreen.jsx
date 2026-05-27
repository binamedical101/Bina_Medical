import React from 'react';
import { useGetCategoriesQuery } from '../slices/categoriesApiSlice';
import CategoryCard from '../components/CategoryCard';
import Loader from '../components/Loader';
import Message from '../components/Message';

const CategoriesScreen = () => {
  const { data: categories, isLoading, error } = useGetCategoriesQuery();

  return (
    <div className='py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-extrabold text-pe-text-main'>All Categories</h1>
        <p className='text-pe-text-muted mt-2'>Browse our complete range of healthcare products</p>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6'>
          {categories.map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesScreen;
