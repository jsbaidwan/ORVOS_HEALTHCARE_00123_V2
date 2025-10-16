import { useAuth } from '../context/AuthContext';

export const useRoutePath = () => {
  const { user } = useAuth();
  const adminPrefix = process.env.REACT_APP_ADMIN_ROUTE_PREFIX || 'admin';
  const userPrefix = process.env.REACT_APP_USER_ROUTE_PREFIX || '';
  
  return (path) => {
    // If user is admin (role_id === 1), add admin prefix
    if (user?.role_id === 1) {
      return `/${adminPrefix}${path}`;
    }
    // If user prefix is set and user is regular user
    if (userPrefix && user?.role_id !== 1) {
      return `/${userPrefix}${path}`;
    }
    // Default - no prefix
    return path;
  };
};

export default useRoutePath;

