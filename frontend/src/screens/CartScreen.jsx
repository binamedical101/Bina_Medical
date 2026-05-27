import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, ShoppingBag } from 'lucide-react';
import { addToCart, removeFromCart } from '../slices/cartSlice';

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const addToCartHandler = async (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };

  return (
    <div className='py-8'>
      <h1 className='text-3xl font-extrabold text-gray-900 mb-8 flex items-center'>
        <ShoppingBag className='w-8 h-8 mr-3 text-blue-600' />
        Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className='bg-blue-50 border border-blue-100 p-8 rounded-2xl text-center'>
          <p className='text-xl text-blue-800 mb-4'>Your cart is empty</p>
          <Link to='/' className='inline-block bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition-colors'>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className='flex flex-col lg:flex-row gap-8'>
          <div className='lg:w-2/3'>
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
              <ul className='divide-y divide-gray-100'>
                {cartItems.map((item) => (
                  <li key={item._id} className='p-6 flex flex-col sm:flex-row items-center gap-6 hover:bg-gray-50 transition-colors'>
                    <img src={item.images?.[0] || '/images/sample.jpg'} alt={item.name} className='w-24 h-24 object-cover rounded-xl shadow-sm' />
                    
                    <div className='flex-1 text-center sm:text-left'>
                      <Link to={`/medicine/${item._id}`} className='text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors'>
                        {item.name}
                      </Link>
                      <div className='text-blue-600 font-extrabold mt-1'>
                        ₹{(item.price * (1 - item.discountPercentage / 100)).toFixed(2)}
                      </div>
                    </div>

                    <div className='flex items-center gap-4'>
                      <select
                        value={item.qty}
                        onChange={(e) => addToCartHandler(item, Number(e.target.value))}
                        className='form-select block w-20 px-3 py-2 text-base font-normal text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      >
                        {[...Array(item.stockQuantity).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </select>

                      <button
                        type='button'
                        onClick={() => removeFromCartHandler(item._id)}
                        className='p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors'
                      >
                        <Trash2 className='w-5 h-5' />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className='lg:w-1/3'>
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24'>
              <h2 className='text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100'>Order Summary</h2>
              
              <div className='flex justify-between mb-4 text-gray-600'>
                <span>Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})</span>
                <span>₹{cart.itemsPrice}</span>
              </div>
              <div className='flex justify-between mb-4 text-gray-600'>
                <span>Shipping</span>
                <span>₹{cart.shippingPrice}</span>
              </div>
              <div className='flex justify-between mb-6 text-gray-600'>
                <span>Tax</span>
                <span>₹{cart.taxPrice}</span>
              </div>
              
              <div className='flex justify-between mb-8 text-xl font-extrabold text-gray-900 pt-4 border-t border-gray-100'>
                <span>Total</span>
                <span>₹{cart.totalPrice}</span>
              </div>

              <button
                type='button'
                className='w-full bg-gradient-to-r from-blue-600 to-teal-400 text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                Proceed To Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartScreen;
