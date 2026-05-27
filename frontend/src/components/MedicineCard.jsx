import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../slices/cartSlice';
import { Plus, Minus } from 'lucide-react';

const MedicineCard = ({ medicine }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const existItem = cartItems.find((x) => x._id === medicine._id);

  const addToCartHandler = () => {
    dispatch(addToCart({ ...medicine, qty: 1 }));
  };

  const incrementQty = () => {
    if (existItem.qty < medicine.stockQuantity) {
      dispatch(addToCart({ ...medicine, qty: existItem.qty + 1 }));
    }
  };

  const decrementQty = () => {
    if (existItem.qty === 1) {
      dispatch(removeFromCart(medicine._id));
    } else {
      dispatch(addToCart({ ...medicine, qty: existItem.qty - 1 }));
    }
  };

  return (
    <div className='bg-white rounded-xl border border-gray-100 hover:border-pe-teal hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden group relative'>
      
      {/* Tags */}
      <div className='absolute top-2 left-0 right-0 px-2 flex justify-between items-start z-10 pointer-events-none'>
        {medicine.discountPercentage > 0 ? (
          <div className='bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48cGF0aCBkPSJNMCAwaDEwMGwtMTAgNTBMMTAwIDEwMEgwWiIgZmlsbD0iI2Y3NmIxYyIvPjwvc3ZnPg==")] bg-no-repeat bg-contain bg-left py-1 pl-2 pr-4 text-white text-[10px] font-bold tracking-wide'>
            {medicine.discountPercentage}% OFF
          </div>
        ) : (
          <div></div>
        )}
        
        {medicine.prescriptionRequired && (
          <div className='bg-white/90 backdrop-blur-sm text-pe-teal text-[10px] font-bold px-2 py-1 rounded border border-pe-teal/20 shadow-sm'>
            Rx Required
          </div>
        )}
      </div>

      {/* Image Area */}
      <Link to={`/medicine/${medicine._id}`} className='relative p-4 flex items-center justify-center h-36 md:h-48 bg-white cursor-pointer'>
        <img
          src={medicine.images?.[0] || '/images/sample.jpg'}
          alt={medicine.name}
          className='max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300'
        />
      </Link>
      
      {/* Details Area */}
      <div className='p-3 md:p-4 flex flex-col flex-grow bg-white'>
        <Link to={`/medicine/${medicine._id}`}>
          <h3 className='text-sm md:text-[15px] font-bold text-[#30363c] hover:text-pe-teal line-clamp-2 mb-1 leading-snug cursor-pointer'>
            {medicine.name}
          </h3>
        </Link>
        <p className='text-[11px] md:text-xs text-[#828f9a] mb-3 line-clamp-1'>
          {medicine.genericName || medicine.category?.name || 'Healthcare Product'}
        </p>
        
        <div className='mt-auto flex flex-col gap-2'>
          <div className='flex items-end justify-between'>
            <div className='flex flex-col'>
              {medicine.discountPercentage > 0 ? (
                <div className='flex items-center gap-1.5'>
                  <span className='text-[10px] text-[#828f9a] line-through'>
                    MRP ₹{medicine.price.toFixed(2)}
                  </span>
                </div>
              ) : null}
              <span className='text-base md:text-lg font-bold text-[#30363c]'>
                ₹{medicine.discountPercentage > 0 
                    ? (medicine.price * (1 - medicine.discountPercentage / 100)).toFixed(2)
                    : medicine.price.toFixed(2)
                 }
              </span>
            </div>
            
          </div>
          
          {existItem ? (
            <div className='flex items-center justify-between w-full h-10 border border-pe-teal rounded-lg overflow-hidden'>
              <button 
                onClick={decrementQty}
                className='w-1/3 h-full flex items-center justify-center bg-pe-teal-light text-pe-teal hover:bg-pe-teal hover:text-white transition-colors'
              >
                <Minus className='w-4 h-4' />
              </button>
              <span className='w-1/3 text-center text-sm font-bold text-pe-text-main'>
                {existItem.qty}
              </span>
              <button 
                onClick={incrementQty}
                disabled={existItem.qty >= medicine.stockQuantity}
                className={`w-1/3 h-full flex items-center justify-center transition-colors ${
                  existItem.qty >= medicine.stockQuantity 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-pe-teal-light text-pe-teal hover:bg-pe-teal hover:text-white'
                }`}
              >
                <Plus className='w-4 h-4' />
              </button>
            </div>
          ) : (
            <button 
              className={`w-full h-10 rounded-lg text-sm font-bold border transition-colors ${
                medicine.stockQuantity > 0 
                  ? 'border-pe-teal text-pe-teal bg-white hover:bg-pe-teal hover:text-white' 
                  : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
              }`}
              disabled={medicine.stockQuantity === 0}
              onClick={addToCartHandler}
            >
              {medicine.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineCard;
