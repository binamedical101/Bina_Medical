import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useProfileMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { User, Mail, Lock, CheckCircle, AlertTriangle, X, ShieldCheck } from 'lucide-react';
import Loader from '../components/Loader';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [modalError, setModalError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading }] = useProfileMutation();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleOtpChange = (index, value) => {
    // allow only numbers
    if (value !== '' && !/^[0-9]$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move focus to next input if filled
    if (value !== '' && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      // Focus previous input on backspace if current is empty
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{4}$/.test(pasteData)) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      // Focus the last input
      const lastInput = document.getElementById('otp-3');
      if (lastInput) lastInput.focus();
    }
  };

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

      if (res.emailOtpSent) {
        setShowOtpModal(true);
        setResendCountdown(30);
        setOtp(['', '', '', '']);
        setModalError('');
        // After DOM updates, focus on first input
        setTimeout(() => {
          const firstInput = document.getElementById('otp-0');
          if (firstInput) firstInput.focus();
        }, 100);
      } else {
        dispatch(setCredentials({ ...res }));
        setSuccess('Profile updated successfully');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setMessage(err?.data?.message || err.error);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setModalError('Please enter a 4-digit code');
      return;
    }

    try {
      const res = await updateProfile({
        _id: userInfo._id,
        name,
        email,
        password,
        otp: otpValue,
      }).unwrap();

      dispatch(setCredentials({ ...res }));
      setSuccess('Profile and email updated successfully');
      setPassword('');
      setConfirmPassword('');
      setShowOtpModal(false);
      setOtp(['', '', '', '']);
    } catch (err) {
      setModalError(err?.data?.message || err.error || 'Failed to verify OTP');
    }
  };

  const handleResendOtp = async () => {
    setModalError('');
    try {
      const res = await updateProfile({
        _id: userInfo._id,
        name,
        email,
        password,
      }).unwrap();
      if (res.emailOtpSent) {
        setResendCountdown(30);
      }
    } catch (err) {
      setModalError(err?.data?.message || err.error || 'Failed to resend code');
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

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in'>
          <div className='bg-white rounded-3xl max-w-md w-full p-8 border border-gray-100 shadow-2xl relative transform transition-all scale-100'>
            {/* Close Button */}
            <button
              onClick={() => setShowOtpModal(false)}
              className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors'
            >
              <X className='w-6 h-6' />
            </button>

            <div className='text-center'>
              <div className='w-16 h-16 bg-pe-teal-light rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow'>
                <ShieldCheck className='w-8 h-8 text-pe-teal' />
              </div>
              <h2 className='text-2xl font-extrabold text-gray-900 mb-2'>Verify Your Email</h2>
              <p className='text-gray-500 text-sm mb-6'>
                We sent a 4-digit code to <span className='font-bold text-gray-900'>{email}</span>. Enter it below to verify.
              </p>

              {modalError && (
                <div className='mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold text-left'>
                  <AlertTriangle className='w-5 h-5 shrink-0' />
                  {modalError}
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className='space-y-6'>
                <div className='flex justify-center gap-4 my-6'>
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type='text'
                      maxLength={1}
                      value={otp[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className='w-14 h-14 text-center text-2xl font-extrabold text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-pe-teal focus:ring-2 focus:ring-pe-teal/20 transition-all outline-none'
                    />
                  ))}
                </div>

                <div className='flex flex-col gap-3'>
                  <button
                    type='submit'
                    disabled={isLoading}
                    className='w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-pe-teal/20 text-sm font-extrabold text-white bg-pe-teal hover:bg-pe-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pe-teal transition-all'
                  >
                    {isLoading ? <Loader /> : 'Verify & Save'}
                  </button>

                  <div className='text-sm mt-2'>
                    {resendCountdown > 0 ? (
                      <p className='text-gray-400'>
                        Resend code in <span className='font-bold'>{resendCountdown}s</span>
                      </p>
                    ) : (
                      <button
                        type='button'
                        onClick={handleResendOtp}
                        className='text-pe-teal hover:underline font-bold transition-all'
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;
