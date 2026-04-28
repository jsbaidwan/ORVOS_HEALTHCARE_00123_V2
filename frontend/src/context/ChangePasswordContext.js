import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import Api from '../utils/api';
import { handleApiError } from '../utils/errorHandler';

const ChangePasswordContext = createContext();

export const useChangePassword = () => {
  const context = useContext(ChangePasswordContext);
  if (!context) {
    throw new Error('useChangePassword must be used within a ChangePasswordProvider');
  }
  return context;
};

export const ChangePasswordProvider = ({ children }) => {
  const { getToken, logout } = useAuth();

  const changePassword = async (payload) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call('change-password', 'POST', payload, true);

      if (response.status === 200) {
        return {
          status: response.status,
          message: response.data?.message || 'Password changed successfully.',
        };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const value = {
    changePassword,
  };

  return (
    <ChangePasswordContext.Provider value={value}>
      {children}
    </ChangePasswordContext.Provider>
  );
};
