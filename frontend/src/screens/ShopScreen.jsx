import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGetMedicinesQuery } from '../slices/medicinesApiSlice';
import { useGetCategoriesQuery } from '../slices/categoriesApiSlice';
import MedicineCard from '../components/MedicineCard';
import Loader from '../components/Loader';
import Message from '../components/Message';

const ShopScreen = () => {
  const { id: urlCategoryId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get('keyword') || '';

  // Fetch all categories
  const { data: categories, isLoading: loadingCategories, error: errorCategories } = useGetCategoriesQuery();

  // Fetch medicines (large page size to get all demo data for grouping)
  const { data: medicinesData, isLoading: loadingMedicines, error: errorMedicines } = useGetMedicinesQuery({ 
    keyword,
    pageSize: 100 // Large page size to fetch all products for the Zomato-style view
  });

  const [activeCategory, setActiveCategory] = useState(null);
  const sectionRefs = useRef({});

  // Group medicines by category ID
  const groupedMedicines = React.useMemo(() => {
    if (!medicinesData?.medicines) return {};
    
    return medicinesData.medicines.reduce((acc, medicine) => {
      // If a medicine doesn't have a category (rare), we can put it in an 'Uncategorized' bucket
      const catId = medicine.category?._id || 'uncategorized';
      if (!acc[catId]) {
        acc[catId] = [];
      }
      acc[catId].push(medicine);
      return acc;
    }, {});
  }, [medicinesData]);

  // Setup Intersection Observer for ScrollSpy
  useEffect(() => {
    if (!categories || Object.keys(groupedMedicines).length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the currently intersecting entry that takes up the most ratio or is simply intersecting
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -70% 0px', // Trigger when section is in the top/middle of the viewport
        threshold: 0,
      }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [categories, groupedMedicines]);

  const scrollToCategory = (categoryId) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(categoryId);
    if (element) {
      // Calculate offset for sticky header if there is one
      const yOffset = -80; // Approximate header height
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Auto-scroll on initial load if navigated via /category/:id
  useEffect(() => {
    if (urlCategoryId && categories && Object.keys(groupedMedicines).length > 0) {
      // Small timeout to ensure rendering is complete
      setTimeout(() => {
        scrollToCategory(`category-${urlCategoryId}`);
      }, 100);
    }
  }, [urlCategoryId, categories, groupedMedicines]);

  const isLoading = loadingCategories || loadingMedicines;
  const error = errorCategories || errorMedicines;

  return (
    <div className='py-0'>
      <div className='mb-6 flex items-center'>
        <button 
          onClick={() => navigate(-1)}
          className='mr-4 p-2 bg-white hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center border border-gray-200 shadow-sm'
          title='Go Back'
        >
          <ArrowLeft className='w-6 h-6 text-gray-600' />
        </button>
      </div>

      {keyword && (
        <div className='mb-6 bg-white p-4 rounded-lg border border-pe-border shadow-sm'>
          <h1 className='text-2xl font-extrabold text-pe-text-main'>
            Search Results for "{keyword}"
          </h1>
          <p className='text-pe-text-muted mt-1'>
            Showing categories containing products matching your search.
          </p>
        </div>
      )}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error || 'An error occurred'}</Message>
      ) : (
        <div className='flex flex-col md:flex-row gap-8 items-start relative'>
          
          {/* Left Sidebar (Sticky Categories) */}
          <div className='w-full md:w-1/4 lg:w-1/5 shrink-0 sticky top-16 md:top-24 z-40 bg-white md:rounded-lg md:border border-pe-border shadow-md md:shadow-sm md:max-h-[calc(100vh-120px)] md:overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 -mx-4 md:mx-0 px-4 md:px-0'>
            <div className='hidden md:block p-4 border-b border-pe-border'>
              <h2 className='font-extrabold text-pe-text-main text-lg'>Categories</h2>
            </div>
            <ul className='flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 md:gap-0 py-3 md:p-2 scrollbar-hide'>
              {categories?.filter(cat => !keyword || (groupedMedicines[cat._id] && groupedMedicines[cat._id].length > 0)).map((category) => (
                <li key={category._id} className="flex-shrink-0 md:flex-shrink-1">
                  <button
                    onClick={() => scrollToCategory(`category-${category._id}`)}
                    className={`whitespace-nowrap w-full text-center md:text-left px-4 py-2 md:py-3 rounded-full md:rounded-md text-sm font-semibold transition-all duration-200 ${
                      activeCategory === `category-${category._id}`
                        ? 'bg-pe-teal text-white md:bg-pe-teal-light md:text-pe-teal md:border-l-4 border-pe-teal'
                        : 'bg-gray-100 text-pe-text-main md:bg-transparent hover:bg-gray-200 md:border-l-4 border-transparent'
                    }`}
                  >
                    {category.name} ({groupedMedicines[category._id]?.length || 0})
                  </button>
                </li>
              ))}
              
              {/* Show uncategorized if they exist */}
              {groupedMedicines['uncategorized'] && (
                <li className="flex-shrink-0 md:flex-shrink-1">
                  <button
                    onClick={() => scrollToCategory('category-uncategorized')}
                    className={`whitespace-nowrap w-full text-center md:text-left px-4 py-2 md:py-3 rounded-full md:rounded-md text-sm font-semibold transition-all duration-200 ${
                      activeCategory === 'category-uncategorized'
                        ? 'bg-pe-teal text-white md:bg-pe-teal-light md:text-pe-teal md:border-l-4 border-pe-teal'
                        : 'bg-gray-100 text-pe-text-main md:bg-transparent hover:bg-gray-200 md:border-l-4 border-transparent'
                    }`}
                  >
                    Other Products ({groupedMedicines['uncategorized'].length})
                  </button>
                </li>
              )}

              {Object.keys(groupedMedicines).length === 0 && (
                <li className='p-4 text-sm text-pe-text-muted text-center w-full'>
                  No categories found.
                </li>
              )}
            </ul>
          </div>

          {/* Right Main Content (Grouped Products) */}
          <div className='w-full md:w-3/4 lg:w-4/5 flex flex-col gap-10'>
            {Object.keys(groupedMedicines).length === 0 ? (
               <div className='bg-white p-12 rounded-lg border border-pe-border text-center shadow-sm'>
                 <h2 className='text-2xl font-bold text-pe-text-main mb-2'>No Products Found</h2>
                 <p className='text-pe-text-muted'>Try adjusting your search keyword.</p>
               </div>
            ) : (
              <>
                {categories?.filter(cat => !keyword || (groupedMedicines[cat._id] && groupedMedicines[cat._id].length > 0)).map((category) => (
                  <section 
                    key={category._id} 
                    id={`category-${category._id}`}
                    ref={(el) => (sectionRefs.current[`category-${category._id}`] = el)}
                    className="scroll-mt-24 bg-white p-6 rounded-lg border border-pe-border shadow-sm"
                  >
                    <div className='mb-6 border-b border-pe-border pb-4'>
                      <h2 className='text-2xl font-extrabold text-pe-text-main'>{category.name}</h2>
                      {category.description && (
                        <p className='text-sm text-pe-text-muted mt-1'>{category.description}</p>
                      )}
                    </div>
                    
                    {groupedMedicines[category._id] && groupedMedicines[category._id].length > 0 ? (
                      <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                        {groupedMedicines[category._id].map((medicine) => (
                          <MedicineCard key={medicine._id} medicine={medicine} />
                        ))}
                      </div>
                    ) : (
                      <div className='py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                        <p className='text-pe-text-muted font-medium'>No products available in this category yet.</p>
                      </div>
                    )}
                  </section>
                ))}

                {/* Render Uncategorized section if necessary */}
                {groupedMedicines['uncategorized'] && (
                  <section 
                    id='category-uncategorized'
                    ref={(el) => (sectionRefs.current['category-uncategorized'] = el)}
                    className="scroll-mt-24 bg-white p-6 rounded-lg border border-pe-border shadow-sm"
                  >
                    <div className='mb-6 border-b border-pe-border pb-4'>
                      <h2 className='text-2xl font-extrabold text-pe-text-main'>Other Products</h2>
                    </div>
                    
                    <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                      {groupedMedicines['uncategorized'].map((medicine) => (
                        <MedicineCard key={medicine._id} medicine={medicine} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
            
            {/* A bottom spacer to ensure the last category can scroll to the top of the viewport */}
            <div className='h-[40vh] w-full'></div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default ShopScreen;
