/**
 * Error handling utility for consistent error management across the application
 */

/**
 * Handle API errors with consistent formatting
 * @param {Object} error - The error object from API response
 * @param {Function} logout - Optional logout function for 401 errors
 * @returns {Object} Formatted error response
 */
export const handleApiError = (error, logout = null) => {
   
  // Handle 401 Unauthorized - trigger logout
  if (error?.status === 401) {
    if (logout && typeof logout === 'function') {
      logout();
    }
    return {
      status: 401,
      message: 'Your session has expired. Please log in again.',
      requiresLogin: true,
    };
  }
   
  
  // Handle validation errors (422)
  if (error?.status === 422 && error?.validationErrors) {
    return {
      status: 422,
      errors: error.validationErrors,
      message: 'Please correct the validation errors below.',
    };
  }
 
  // Handle specific error messages
  if (error?.message) {
    return {
      status: error.status || 500,
      message: error.message,
    };
  }
 
  // Handle network or connection errors
  if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
    return {
      status: 0,
      message: 'Network error. Please check your connection and try again.',
    };
  }
 
  // Default error handling
  return {
    status: error?.status || 500,
    message: error?.message || 'An unexpected error occurred. Please try again.',
  };
};

/**
 * Handle form validation errors
 * @param {Object} errors - Validation errors object
 * @returns {Object} Formatted validation errors
 */
export const handleValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return {};
  }

  const formattedErrors = {};
  
  Object.entries(errors).forEach(([field, messages]) => {
    if (Array.isArray(messages)) {
      formattedErrors[field] = messages.join(', ');
    } else if (typeof messages === 'string') {
      formattedErrors[field] = messages;
    }
  });

  return formattedErrors;
};

/**
 * Check if error requires user logout
 * @param {Object} error - The error object
 * @returns {boolean} True if logout is required
 */
export const requiresLogout = (error) => {
  return error?.status === 401 || error?.requiresLogin === true;
};

/**
 * Get user-friendly error message
 * @param {Object} error - The error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (error?.message) {
    return error.message;
  }

  if (error?.status === 401) {
    return 'Your session has expired. Please log in again.';
  }

  if (error?.status === 422) {
    return 'Please correct the validation errors below.';
  }

  if (error?.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  if (error?.status === 404) {
    return 'The requested resource was not found.';
  }

  if (error?.status === 500) {
    return 'Server error. Please try again later.';
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Log error for debugging (development only)
 * @param {Object} error - The error object
 * @param {string} context - Context where error occurred
 */
export const logError = (error, context = 'Unknown') => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}] Error:`, error);
  }
};
 
export const errorsFormatted = (response,setError) => {
    try{
         
        if (response.errors) {
            Object.entries(response?.errors).forEach(([field, message]) => {
            setError(field, {
                type: 'manual',
                message,
            });
            });
        } else if (response.error?.message) {
            setError('general', {
            type: 'manual',
            message: response.error.message,
            });
        } else if (response === false) {
            setError('general', {
            type: 'manual',
            message: 'An unexpected error occurred. Please try again.',
            });
        }else if(response?.message){
            setError('general', {
            type: 'manual',
            message: response?.message,
            });
        }
    } catch(error){
        setError('general', {
            type: 'manual',
            message: 'An unexpected error occurred. Please try again.',
        });
    }

}
