import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HeartPulse, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useVerifyEmailMutation } from '../slices/usersApiSlice';

const VerifyEmailScreen = () => {
  const { token } = useParams();
  const [verifyEmail, { isLoading, error, isSuccess }] = useVerifyEmailMutation();
  const [verificationTriggered, setVerificationTriggered] = useState(false);

  useEffect(() => {
    if (token && !verificationTriggered) {
      setVerificationTriggered(true);
      // Fire verify email request
      verifyEmail(token);
    }
  }, [token, verifyEmail, verificationTriggered]);

  return (
    <div className="flex-grow flex items-center justify-center bg-gradient-to-tr from-pe-teal via-[#129a93] to-pe-teal-light py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10 transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pe-orange rounded-full mix-blend-multiply filter blur-3xl opacity-10 transform translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-md w-full space-y-8 z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
            <HeartPulse className="w-6 h-6 text-white" />
            <span className="text-xl font-extrabold text-white tracking-tight">
              Bina Medical
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Account Activation
          </h2>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pe-teal mx-auto mb-6"></div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Verifying your email...</h3>
              <p className="text-sm text-gray-500">
                Please wait while we confirm your email address and activate your account.
              </p>
            </div>
          )}

          {!isLoading && isSuccess && (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-teal-50 border border-pe-teal/20 mb-6">
                <CheckCircle className="h-10 w-10 text-pe-teal" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Account Activated!</h3>
              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                Thank you! Your email address has been successfully verified. Your account is now active and ready to use.
              </p>
              <div>
                <Link
                  to="/login"
                  className="w-full bg-pe-teal hover:bg-pe-teal-dark text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-pe-teal/20 transition-all flex justify-center items-center gap-2 hover:gap-3"
                >
                  Sign In <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}

          {!isLoading && error && (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 border border-red-200 mb-6">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-extrabold text-red-600 mb-2">Activation Failed</h3>
              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                {error?.data?.message || 'The verification link is invalid, expired, or has already been used.'}
              </p>
              <div className="flex gap-4">
                <Link
                  to="/register"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold py-3 px-4 rounded-xl transition-all text-sm text-center"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  className="flex-1 bg-pe-teal hover:bg-pe-teal-dark text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-pe-teal/20 transition-all text-sm text-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailScreen;
