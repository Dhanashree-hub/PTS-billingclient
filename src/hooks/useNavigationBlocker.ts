// hooks/useNavigationBlocker.ts
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';

export const useNavigationBlocker = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Prevent authenticated users from accessing auth pages
      if (user && user.emailVerified && (location.pathname === '/login' || location.pathname === '/register')) {
        navigate('/pos', { replace: true });
      }
      
      // Prevent unauthenticated users from accessing protected routes via browser history
      if (!user && location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/verify-email') {
        navigate('/login', { replace: true, state: { from: location.pathname } });
      }
    });

    return unsubscribe;
  }, [navigate, location]);
};