import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Api from '../utils/api';
import Loader from '../components/Common/Loader';
// import ErrorHandle from '../components/Common/ErrorHandle';
import { useDecode } from '../hooks/useDecode';
import { handleApiError } from '../utils/errorHandler';

const AuthContext = createContext(null);
const adminPrefix = process.env.REACT_APP_ADMIN_ROUTE_PREFIX || 'admin';

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // State management
  const [user, setUser] = useState(null);
  const [api, setApi] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Initialize API instance with token getter.
   */
  useEffect(() => {
    setApi(Api(() => user?.token));
  }, [user]);

  /**
   * Load stored authentication data on component mount.
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          setUser(authData);
        }
      } catch (error) {
        localStorage.removeItem('auth');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Perform login with provided credentials.
   */
  const login = async (credentials) => {
    
    let endpoint = 'login'
    const url = credentials?.is_admin ? 'admin/'+endpoint : endpoint;
    delete credentials.is_admin;
     
    let formData = new FormData();
    for(let key in credentials) {
      if(credentials[key]) {
        formData.append(key, credentials[key]);
      }
    }

    const response = await api.call(url, 'POST', formData, false);
   
    if (response?.status === 200) {
      
      const auth = response.data.auth;
      setUser(auth);
      localStorage.setItem('auth', JSON.stringify(auth));
      return { status: 200,message: response?.data?.message };
    }
    
    return handleApiError(response.error,logout);
   
  };

  /**
   * Clear user session and redirect based on role.
   */
  const logout = () => {
    const isAdmin = isSuperAdmin();
    setUser(null);
    localStorage.removeItem('auth');
    navigate(isAdmin ? `${adminPrefix}/login` : '/login');
  };

  /**
   * Update user state and persist changes.
   */
  const updateUser = (updatedUser) => {
    updatedUser.token = getToken();
    setUser(updatedUser);
    localStorage.setItem('auth', JSON.stringify(updatedUser));
  };

  /**
   * Check authentication status.
   */
  const isAuthenticated = () => !!user?.token;

  /**
   * Check if current user is Super Admin.
   */
  const isSuperAdmin = () => user?.role_id === 1;

  /**
   * Retrieve current user's token.
   */
  const getToken = () => user?.token;

  /**
   * Decode Google Map API Key (if available).
   */
  const { decodedValue: googleMapApiKey } = useDecode(
    user?.google_map_api_key,
    'password'
  );

  // Show loader while initializing authentication
  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        updateUser,
        login,
        logout,
        isAuthenticated,
        isSuperAdmin,
        getToken,
        api,
        loading,
        googleMapApiKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
