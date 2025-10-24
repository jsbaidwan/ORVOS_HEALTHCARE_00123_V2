import React, { createContext, useContext, useState } from 'react';
import Api from '../utils/api';
import { handleApiError } from '../utils/errorHandler';
import { useAuth } from './AuthContext';

const ForgotPasswordContext = createContext(null);

export const ForgotPasswordProvider = ({ children }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');

  // Get logout function from AuthContext
  const { logout } = useAuth();

  /**
   * Initialize API instance
   */
  const api = Api();

  /**
   * Send password reset email
   */
  const sendResetEmail = async (emailData) => {
    setIsSubmitting(true);
    
    try {
      const response = await api.call('password/email', 'POST', emailData, false);
      
      if (response?.status === 200) {
       
        setEmail(emailData.email);
        return {
          status: 200,
          message: response?.data?.message || 'Password reset email sent successfully',
        };
      }

      return handleApiError(response.error,logout);
    } catch (err) {
      return handleApiError(err, logout);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Reset password with token
   */
  const resetPassword = async (resetData) => {
    setIsSubmitting(true);
   
    try {
      const response = await api.call('password/reset', 'POST', resetData, false);
      
      if (response?.status === 200) {
        
        return {
          status: 200,
          message: response?.data?.message || 'Password reset successfully',
        };
      }

      // Handle API errors with logout support
      return handleApiError(response.error, logout);
    } catch (err) {
      return handleApiError(err, logout);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Clear all state
   */
  const clearState = () => {
    setIsSubmitting(false);
    
    setEmail('');
  };


  return (
    <ForgotPasswordContext.Provider
      value={{
        // State
        isSubmitting,
        email,
        
        // Actions
        sendResetEmail,
        resetPassword,
        clearState,
        setEmail,
      }}
    >
      {children}
    </ForgotPasswordContext.Provider>
  );
};

/**
 * Custom hook to access forgot password context
 */
export const useForgotPassword = () => {
  const context = useContext(ForgotPasswordContext);
  if (!context) {
    throw new Error('useForgotPassword must be used within a ForgotPasswordProvider');
  }
  return context;
};
