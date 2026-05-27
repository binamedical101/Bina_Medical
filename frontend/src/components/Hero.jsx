import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useGetMedicinesQuery } from '../slices/medicinesApiSlice';

const Hero = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch results based on debounced search term
  const { data, isFetching } = useGetMedicinesQuery(
    { keyword: debouncedSearchTerm },
    { skip: debouncedSearchTerm.trim().length === 0 }
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowDropdown(false);
      navigate(`/shop?keyword=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className='bg-pe-teal-light rounded-2xl p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center justify-between border border-pe-border relative overflow-visible'>

      {/* Abstract Background Element Wrapper with overflow-hidden to prevent horizontal scrollbar */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pe-teal rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pe-orange rounded-full mix-blend-multiply filter blur-3xl opacity-10 transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className='md:w-3/5 relative z-20'>
        <span className='text-sm font-bold text-pe-teal uppercase tracking-widest mb-2 block'>
          India's Leading Pharmacy
        </span>
        <h1 className='text-4xl md:text-5xl font-extrabold text-pe-text-main mb-4 leading-tight'>
          Genuine Medicines, <br />
          <span className='text-pe-teal'>Delivered Fast.</span>
        </h1>
        <p className='text-pe-text-muted text-lg mb-8 max-w-lg'>
          Order your prescription and over-the-counter medicines online with Bina Medical. Up to 20% off on all healthcare products.
        </p>

        {/* Search Bar with Autocomplete */}
        <div className='relative max-w-xl' ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit} className='flex items-center bg-white rounded-full p-2 shadow-sm border border-pe-border relative z-30'>
            <div className='pl-4 pr-2 text-gray-400'>
              <Search className='w-5 h-5' />
            </div>
            <input
              type="text"
              placeholder="Search for Medicines / Healthcare Products"
              className="flex-grow bg-transparent outline-none text-pe-text-main py-2"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => { if (searchTerm.trim()) setShowDropdown(true); }}
            />
            <button type="submit" className='bg-pe-teal hover:bg-pe-teal-dark text-white font-bold py-3 px-8 rounded-full transition-colors'>
              Search
            </button>
          </form>

          {/* Dropdown Overlay */}
          {showDropdown && debouncedSearchTerm.trim().length > 0 && (
            <div className='absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-pe-border max-h-80 overflow-y-auto z-50'>
              {isFetching ? (
                <div className='p-4 text-center text-pe-text-muted'>Loading...</div>
              ) : data && data.medicines.length > 0 ? (
                <ul className='py-2'>
                  {data.medicines.map((medicine) => (
                    <li key={medicine._id}>
                      <Link
                        to={`/medicine/${medicine._id}`}
                        className='flex items-center px-4 py-3 hover:bg-pe-teal-light transition-colors border-b border-pe-border last:border-0'
                        onClick={() => setShowDropdown(false)}
                      >
                        <img
                          src={medicine.images?.[0] || '/images/sample.jpg'}
                          alt={medicine.name}
                          className='w-10 h-10 object-contain mr-4 rounded'
                        />
                        <div className='flex-grow'>
                          <h4 className='text-sm font-bold text-pe-text-main'>{medicine.name}</h4>
                          <p className='text-xs text-pe-text-muted'>{medicine.category?.name || 'Healthcare Product'}</p>
                        </div>
                        <div className='text-sm font-bold text-pe-teal'>
                          ₹{medicine.price.toFixed(2)}
                        </div>
                      </Link>
                    </li>
                  ))}
                  <li className='px-4 py-2 text-center'>
                    <button
                      onClick={handleSearchSubmit}
                      className='text-xs font-bold text-pe-teal hover:underline'
                    >
                      See all results for "{debouncedSearchTerm}"
                    </button>
                  </li>
                </ul>
              ) : (
                <div className='p-4 text-center text-pe-text-muted'>
                  No products found matching "{debouncedSearchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className='md:w-2/5 mt-10 md:mt-0 flex justify-center relative z-10'>
        {/* Abstract Illustration Placeholder */}
        <div className='relative w-full max-w-sm pointer-events-none'>
          <div className='bg-white rounded-3xl p-6 shadow-xl border border-pe-border transform rotate-3 z-10 relative'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-pe-teal-light rounded-full flex items-center justify-center'>
                <span className='text-pe-teal font-bold text-xl'>Rx</span>
              </div>
              <span className='bg-pe-orange text-white text-xs font-bold px-2 py-1 rounded-full'>
                Flat 15% Off
              </span>
            </div>
            <div className='h-4 bg-gray-100 rounded-full w-3/4 mb-3'></div>
            <div className='h-4 bg-gray-100 rounded-full w-1/2 mb-6'></div>
            <div className='flex justify-between items-center'>
              <span className='font-extrabold text-xl text-pe-text-main'>₹350</span>
              <button className='bg-pe-teal text-white px-4 py-2 rounded-full text-sm font-bold'>Add to Cart</button>
            </div>
          </div>
          {/* Decorative backdrop card */}
          <div className='absolute top-0 left-0 w-full h-full bg-pe-teal/10 rounded-3xl transform -rotate-3 z-0 -translate-x-2 -translate-y-2 border border-pe-teal/20'></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
