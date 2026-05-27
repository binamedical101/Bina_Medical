import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User, HeartPulse } from 'lucide-react';
import { logout } from '../slices/authSlice';
import { useLogoutMutation } from '../slices/usersApiSlice';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      dispatch(logout());
      window.location.href = '/';
    }
  };

  return (
    <header className='bg-white shadow-sm sticky top-0 z-50 border-b border-pe-border'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <Link to='/' className='flex items-center gap-2'>
            <div className='bg-pe-teal text-white p-1 rounded-md'>
              <HeartPulse className='w-6 h-6' />
            </div>
            <span className='text-xl font-extrabold text-pe-teal tracking-tight'>
              Bina Medical
            </span>
          </Link>

          {/* Navigation */}
          <nav className='hidden md:flex space-x-8 items-center'>
            <Link
              to='/shop'
              className='text-pe-text-muted hover:text-pe-teal font-semibold transition-colors'
            >
              Healthcare Products
            </Link>
            <Link
              to='/offers'
              className='text-pe-text-muted hover:text-pe-teal font-semibold transition-colors'
            >
              Offers
            </Link>
            {userInfo && (
              <Link
                to='/orders'
                className='text-pe-text-muted hover:text-pe-teal font-semibold transition-colors'
              >
                My Orders
              </Link>
            )}
          </nav>

          {/* Icons & Auth */}
          <div className='flex items-center space-x-6'>
            <Link to='/cart' className='relative flex items-center gap-2 text-pe-text-muted hover:text-pe-teal transition-colors'>
              <div className='relative'>
                <ShoppingCart className='w-6 h-6' />
                {cartItems.length > 0 && (
                  <span className='absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-pe-orange rounded-full'>
                    {cartItems.reduce((a, c) => a + c.qty, 0)}
                  </span>
                )}
              </div>
              <span className='font-semibold hidden sm:inline-block'>Cart</span>
            </Link>

            {userInfo ? (
              <div className='relative group'>
                <button className='flex items-center space-x-2 text-pe-text-muted hover:text-pe-teal focus:outline-none transition-colors'>
                  <div className='w-8 h-8 bg-pe-teal-light text-pe-teal rounded-full flex items-center justify-center font-bold'>
                    {userInfo.name.charAt(0).toUpperCase()}
                  </div>
                  <span className='font-semibold hidden sm:inline-block'>{userInfo.name.split(' ')[0]}</span>
                </button>
                <div className='absolute right-0 w-48 mt-2 py-2 bg-white rounded-lg shadow-xl border border-pe-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right'>
                  <Link
                    to='/profile'
                    className='block px-4 py-2 text-sm text-pe-text-muted hover:bg-pe-teal-light hover:text-pe-teal font-medium'
                  >
                    My Profile
                  </Link>

                  {userInfo.role === 'Admin' && (
                    <>
                      <div className='border-t border-pe-border my-2'></div>
                      <div className='px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider'>
                        Admin Tools
                      </div>
                      <Link
                        to='/admin/orderlist'
                        className='block px-4 py-2 text-sm text-pe-text-muted hover:bg-pe-teal-light hover:text-pe-teal font-medium'
                      >
                        Orders
                      </Link>
                      <Link
                        to='/admin/medicinelist'
                        className='block px-4 py-2 text-sm text-pe-text-muted hover:bg-pe-teal-light hover:text-pe-teal font-medium'
                      >
                        Medicines
                      </Link>
                      <Link
                        to='/admin/userlist'
                        className='block px-4 py-2 text-sm text-pe-text-muted hover:bg-pe-teal-light hover:text-pe-teal font-medium'
                      >
                        Users
                      </Link>
                      <div className='border-t border-pe-border my-2'></div>
                    </>
                  )}
                  <button
                    onClick={logoutHandler}
                    className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium'
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to='/login'
                className='flex items-center space-x-2 text-pe-text-muted hover:text-pe-teal font-semibold transition-colors'
              >
                <User className='w-5 h-5' />
                <span className='hidden sm:inline-block'>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
