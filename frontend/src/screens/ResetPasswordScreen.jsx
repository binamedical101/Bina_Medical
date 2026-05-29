import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { HeartPulse, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Message from '../components/Message';
import { useResetPasswordMutation } from '../slices/usersApiSlice';

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { token } = useParams();
  const navigate = useNavigate();

  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    setValidationError('');

    try {
      const res = await resetPassword({ token, password }).unwrap();
      setSuccessMsg(res.message || 'Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setSuccessMsg('');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gradient-to-tr from-pe-teal via-[#129a93] to-pe-teal-light py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10 transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pe-orange rounded-full mix-blend-multiply filter blur-3xl opacity-10 transform translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-md w-full space-y-8 z-10">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all">
            <HeartPulse className="w-6 h-6 text-white" />
            <span className="text-xl font-extrabold text-white tracking-tight">
              Bina Medical
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Please choose a secure new password for your account
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20">
          {(error || validationError) && (
            <Message variant='danger'>
              {validationError || error?.data?.message || error.error || 'Something went wrong'}
            </Message>
          )}

          {!successMsg ? (
            <form className="mt-4 space-y-6" onSubmit={submitHandler}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      className="shadow-sm appearance-none border border-gray-200 rounded-xl w-full py-3 pl-4 pr-12 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pe-teal focus:border-transparent transition-all"
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-pe-teal transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      className="shadow-sm appearance-none border border-gray-200 rounded-xl w-full py-3 pl-4 pr-12 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pe-teal focus:border-transparent transition-all"
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-pe-teal transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                  className="w-full bg-pe-teal hover:bg-pe-teal-dark text-white font-extrabold py-3.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pe-teal shadow-lg shadow-pe-teal/20 transition-all disabled:opacity-50 flex justify-center items-center"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-teal-50 border border-pe-teal/20 mb-6">
                <CheckCircle className="h-10 w-10 text-pe-teal" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Password Reset Successful</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Your password has been successfully updated. Redirecting you to the sign in page...
              </p>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            <Link
              to="/login"
              className="text-pe-teal hover:text-pe-teal-dark font-extrabold inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
