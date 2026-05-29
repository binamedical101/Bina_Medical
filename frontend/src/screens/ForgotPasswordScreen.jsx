import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, ArrowLeft, CheckCircle } from 'lucide-react';
import Message from '../components/Message';
import { useForgotPasswordMutation } from '../slices/usersApiSlice';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await forgotPassword({ email }).unwrap();
      setSuccessMsg(res.message || 'Password reset email sent! Check your inbox.');
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
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Enter your email and we'll send you a secure link to reset your password
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20">
          {error && <Message variant='danger'>{error?.data?.message || error.error || 'Something went wrong'}</Message>}

          {!successMsg ? (
            <form className="mt-4 space-y-6" onSubmit={submitHandler}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    className="shadow-sm appearance-none border border-gray-200 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pe-teal focus:border-transparent transition-all"
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
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
                      Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-teal-50 border border-pe-teal/20 mb-6">
                <CheckCircle className="h-10 w-10 text-pe-teal" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Check your email</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                We have sent a secure password reset link to <strong className="text-gray-900">{email}</strong>. Please check your inbox and follow the instructions to reset your password.
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

export default ForgotPasswordScreen;
