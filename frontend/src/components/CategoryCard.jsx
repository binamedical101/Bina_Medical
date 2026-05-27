import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, ArrowRight } from 'lucide-react'; 

const CategoryCard = ({ category, isExploreMore = false, customLink = null }) => {
  const targetLink = customLink || (isExploreMore ? '/categories' : `/category/${category._id}`);

  return (
    <Link to={targetLink} className='block h-full'>
      <div className='bg-white rounded-lg border border-pe-border p-4 flex flex-col items-center text-center cursor-pointer hover:shadow-md hover:border-pe-teal transition-all duration-300 h-full group'>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${isExploreMore ? 'bg-pe-teal text-white' : 'bg-pe-teal-light text-pe-teal'}`}>
          {isExploreMore ? <ArrowRight className='w-8 h-8' /> : <Pill className='w-8 h-8' />}
        </div>
        <h3 className={`text-sm md:text-base font-bold mb-1 line-clamp-2 ${isExploreMore ? 'text-pe-teal' : 'text-pe-text-main'}`}>
          {isExploreMore ? 'Explore More' : category.name}
        </h3>
        {!isExploreMore && (
          <p className='text-xs text-pe-text-muted line-clamp-2 hidden sm:block'>{category.description}</p>
        )}
      </div>
    </Link>
  );
};

export default CategoryCard;
