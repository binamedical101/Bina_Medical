import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft, Star, ShoppingCart, Info, AlertTriangle } from 'lucide-react';
import { useGetMedicineDetailsQuery } from '../slices/medicinesApiSlice';
import { addToCart } from '../slices/cartSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const MedicineDetailsScreen = () => {
  const { id: medicineId } = useParams();
  const [qty, setQty] = useState(1);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: medicine, isLoading, error } = useGetMedicineDetailsQuery(medicineId);

  const addToCartHandler = () => {
    dispatch(addToCart({ ...medicine, qty }));
    navigate('/cart');
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  return (
    <div className='py-4'>
      <Link to='/' className='inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors'>
        <ArrowLeft className='w-4 h-4 mr-2' />
        Back to Home
      </Link>

      <div className='bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='flex flex-col md:flex-row'>
          
          {/* Image Section */}
          <div className='md:w-1/2 p-8 bg-gray-50 flex items-center justify-center relative'>
            {medicine.prescriptionRequired && (
              <div className='absolute top-4 right-4 bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full z-10 flex items-center shadow-sm'>
                <AlertTriangle className='w-4 h-4 mr-1' />
                Prescription Required
              </div>
            )}
            <img 
              src={medicine.images?.[0] || '/images/sample.jpg'} 
              alt={medicine.name}
              className='max-w-full h-auto object-contain rounded-xl drop-shadow-xl max-h-[400px]'
            />
          </div>

          {/* Details Section */}
          <div className='md:w-1/2 p-8 md:p-12 flex flex-col'>
            <div className='mb-2 text-sm font-semibold text-blue-600 uppercase tracking-wider'>
              {medicine.category?.name || 'Category'}
            </div>
            
            <h1 className='text-3xl md:text-4xl font-extrabold text-gray-900 mb-2'>
              {medicine.name}
            </h1>
            
            <p className='text-gray-500 italic mb-6'>
              Generic: {medicine.genericName}
            </p>

            <div className='flex items-center mb-6'>
              <div className='flex text-yellow-400'>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < medicine.rating ? 'fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className='ml-2 text-sm text-gray-600'>({medicine.numReviews} reviews)</span>
            </div>

            <div className='mb-8'>
              {medicine.discountPercentage > 0 ? (
                <div className='flex items-end gap-3'>
                  <span className='text-4xl font-extrabold text-blue-600'>
                    ₹{(medicine.price * (1 - medicine.discountPercentage / 100)).toFixed(2)}
                  </span>
                  <span className='text-xl text-gray-400 line-through mb-1'>
                    ₹{medicine.price.toFixed(2)}
                  </span>
                  <span className='bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded mb-2'>
                    Save {medicine.discountPercentage}%
                  </span>
                </div>
              ) : (
                <span className='text-4xl font-extrabold text-gray-900'>
                  ₹{medicine.price.toFixed(2)}
                </span>
              )}
            </div>

            <p className='text-gray-600 mb-8 leading-relaxed'>
              {medicine.description}
            </p>

            {/* Add to Cart Section */}
            <div className='bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-auto'>
              <div className='flex items-center justify-between mb-4'>
                <span className='text-gray-700 font-medium'>Status:</span>
                <span className={`font-bold ${medicine.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {medicine.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              
              {medicine.stockQuantity > 0 && (
                <div className='flex items-center justify-between mb-6'>
                  <span className='text-gray-700 font-medium'>Quantity:</span>
                  <select 
                    value={qty} 
                    onChange={(e) => setQty(Number(e.target.value))}
                    className='form-select block w-24 px-3 py-2 text-base font-normal text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    {[...Array(medicine.stockQuantity).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                className={`w-full flex items-center justify-center py-3 px-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 ${
                  medicine.stockQuantity > 0 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={medicine.stockQuantity === 0}
                onClick={addToCartHandler}
              >
                <ShoppingCart className='w-5 h-5 mr-2' />
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Info Tabs Placeholder */}
        <div className='border-t border-gray-100 p-8 md:p-12'>
          <h3 className='text-2xl font-bold text-gray-900 mb-6 flex items-center'>
            <Info className='w-6 h-6 mr-2 text-blue-600' />
            Medical Information
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div>
              <h4 className='font-bold text-gray-700 mb-2'>Composition</h4>
              <p className='text-gray-600'>{medicine.composition}</p>
            </div>
            <div>
              <h4 className='font-bold text-gray-700 mb-2'>Recommended Dosage</h4>
              <p className='text-gray-600'>{medicine.dosage}</p>
            </div>
            <div>
              <h4 className='font-bold text-gray-700 mb-2'>Manufacturer</h4>
              <p className='text-gray-600'>{medicine.manufacturer}</p>
            </div>
            <div>
              <h4 className='font-bold text-gray-700 mb-2'>Possible Side Effects</h4>
              <p className='text-gray-600'>{medicine.sideEffects || 'Consult your doctor.'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MedicineDetailsScreen;
