import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useProfileMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { User, Mail, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import Loader from '../components/Loader';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');

  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading }] = useProfileMutation();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccess('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const res = await updateProfile({
        _id: userInfo._id,
        name,
        email,
        password,
      }).unwrap();
      
      dispatch(setCredentials({ ...res }));
      setSuccess('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage(err?.data?.message || err.error);
    }
  };

  return (
    <div className='max-w-xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
      <div className='bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden'>
        <div className='p-8 md:p-10'>
          
          <div className='text-center mb-8'>
            <div className='w-20 h-20 bg-pe-teal-light rounded-full flex items-center justify-center mx-auto mb-4'>
              <User className='w-10 h-10 text-pe-teal' />
            </div>
            <h1 className='text-3xl font-extrabold text-gray-900'>My Profile</h1>
            <p className='text-gray-500 mt-2'>Manage your account details and password.</p>
          </div>

          {message && (
            <div className='mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold'>
              <AlertTriangle className='w-5 h-5 shrink-0' />
              {message}
            </div>
          )}

          {success && (
            <div className='mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold'>
              <CheckCircle className='w-5 h-5 shrink-0' />
              {success}
            </div>
          )}

          <form onSubmit={submitHandler} className='space-y-6'>
            {/* Name */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                Full Name
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <User className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pe-teal focus:border-transparent transition-all outline-none font-medium text-gray-900'
                  placeholder='Enter your full name'
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                Email Address
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <Mail className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pe-teal focus:border-transparent transition-all outline-none font-medium text-gray-900'
                  placeholder='Enter your email'
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                New Password
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pe-teal focus:border-transparent transition-all outline-none font-medium text-gray-900'
                  placeholder='Leave blank to keep current'
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                Confirm New Password
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pe-teal focus:border-transparent transition-all outline-none font-medium text-gray-900'
                  placeholder='Confirm new password'
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-pe-teal/20 text-sm font-extrabold text-white bg-pe-teal hover:bg-pe-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pe-teal transition-all'
            >
              {isLoading ? <Loader /> : 'Save Changes'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
