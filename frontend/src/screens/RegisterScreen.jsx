import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus, HeartPulse, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [validationError, setValidationError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading, error }] = useRegisterMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    setValidationError('');
    try {
      await register({ name, email, password }).unwrap();
      navigate('/login?registered=true');
    } catch (err) {
      console.log(err);
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
            Create Account
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Join Bina Medical to manage your health and prescriptions online
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20">
          {(error || validationError) && (
            <Message variant='danger'>{validationError || error?.data?.message || error.error}</Message>
          )}

          {!successMsg ? (
            <form className="mt-4 space-y-6" onSubmit={submitHandler}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    className="shadow-sm appearance-none border border-gray-200 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pe-teal focus:border-transparent transition-all"
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

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

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                    Password
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
                  className="w-full bg-pe-teal hover:bg-pe-teal-dark text-white font-extrabold py-3.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pe-teal shadow-lg shadow-pe-teal/20 transition-all disabled:opacity-50"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Register'}
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
                We have sent a verification link to <strong className="text-gray-900">{email}</strong>. Please check your inbox and follow the instructions to activate your account.
              </p>
              <div className="mt-6 text-center text-sm">
                <Link
                  to="/login"
                  className="text-pe-teal hover:text-pe-teal-dark font-extrabold transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {!successMsg && (
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                to={redirect ? `/login?redirect=${redirect}` : '/login'}
                className="text-pe-teal hover:text-pe-teal-dark font-extrabold"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
