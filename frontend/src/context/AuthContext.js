import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role = 'user') => {
    try {
      // Simulate API call
      // In production, replace with actual API call
      const userData = {
        id: role === 'admin' ? 1 : 2,
        name: role === 'admin' ? 'Admin User' : 'Medical User',
        email: email,
        role: role,
        role_id: role === 'admin' ? 1 : 2, // 1 = Admin, 2 = User
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', 'sample-jwt-token');
      setUser(userData);

      // Navigate based on role with prefix
      const adminPrefix = process.env.REACT_APP_ADMIN_ROUTE_PREFIX || 'admin';
      const userPrefix = process.env.REACT_APP_USER_ROUTE_PREFIX || '';
      
      if (userData.role_id === 1) {
        navigate(`/${adminPrefix}/dashboard`);
      } else if (userPrefix) {
        navigate(`/${userPrefix}/dashboard`);
      } else {
        navigate('/dashboard');
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

