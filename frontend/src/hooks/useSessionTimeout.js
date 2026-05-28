import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { logout } from '../slices/authSlice';

const useSessionTimeout = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const checkSession = () => {
      const userInfoStr = localStorage.getItem('userInfo');
      const expiration = localStorage.getItem('sessionExpiration');

      if (userInfoStr) {
        if (!expiration || new Date().getTime() > Number(expiration)) {
          dispatch(logout());
        }
      }
    };

    // Check on mount and route changes
    checkSession();

    // Check on window/tab focus
    const handleFocus = () => {
      checkSession();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    // Periodic check every 10 seconds
    const interval = setInterval(checkSession, 10000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      clearInterval(interval);
    };
  }, [location.pathname, dispatch]);
};

export default useSessionTimeout;
