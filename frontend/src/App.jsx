import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { useSelector } from 'react-redux';
import { useGetSettingsQuery } from './slices/settingsApiSlice';
import Loader from './components/Loader';
import { ShieldAlert } from 'lucide-react';
import useSessionTimeout from './hooks/useSessionTimeout';

function App() {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: settings, isLoading } = useGetSettingsQuery();
  const location = useLocation();

  useSessionTimeout();

  if (isLoading) return <Loader />;

  const isMaintenance = settings?.maintenanceMode && (!userInfo || userInfo.role !== 'Admin');
  const showHeaderFooter =
    location.pathname !== '/login' &&
    location.pathname !== '/register' &&
    location.pathname !== '/forgot-password' &&
    !location.pathname.startsWith('/reset-password') &&
    !location.pathname.startsWith('/verify-email');

  return (
    <div className='min-h-screen flex flex-col bg-pe-bg font-sans'>
      {showHeaderFooter && <Header />}
      <main className={showHeaderFooter ? 'flex-grow container mx-auto px-4 py-8' : 'flex-grow flex flex-col min-h-screen'}>
        {isMaintenance ? (
          <div className='flex flex-col items-center justify-center h-full min-h-[60vh] text-center'>
            <ShieldAlert className='w-24 h-24 text-pe-orange mb-6' />
            <h1 className='text-4xl font-extrabold text-gray-900 mb-4'>We'll be right back!</h1>
            <p className='text-lg text-gray-600 max-w-lg'>
              Our pharmacy platform is currently undergoing scheduled maintenance to improve our services. 
              Please check back shortly.
            </p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      {showHeaderFooter && <Footer />}
    </div>
  );
}

export default App;
