const API_NAME = process.env.REACT_APP_API_NAME;
const BASE_URL = `${process.env.REACT_APP_API_URL}/${API_NAME}/api`;
const APP_URL = process.env.REACT_APP_BASE_URL;

/**
 * Custom API Error class for consistent error handling
 */
class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
    this.validationErrors = data?.errors || data?.message || {};
  }
}

/**
 * Factory function to create API instance
 * @param {Function} getToken - Function that returns the current token
 */
const Api = (getToken) => {
  /**
   * Generate headers for the request
   * @param {boolean} useToken - Whether to include Authorization header
   * @param {boolean} isFormData - Whether the request contains FormData
   * @returns {Object} Headers object
   */
  const getHeaders = (useToken = true, isFormData = false) => {
    const headers = {};
    
    // Set Content-Type only for non-FormData requests
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
     
    if (useToken) {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  };

  /**
   * Handle API response and parse JSON safely
   * @param {Response} response - Fetch response object
   * @returns {Promise<{status:number, data:Object, error?:ApiError}>}
   */
  const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const apiError = new ApiError(
        response.status,
        data.message || 'An error occurred',
        data
      );
      return { status: response.status, data, error: apiError };
    }

    return { status: response.status, data };
  };

  /**
   * Append app_url to endpoint if not already present
   * @param {string} endpoint
   * @param {string} appUrl
   * @returns {string}
   */
  const addAppUrl = (endpoint, appUrl) => {
    if (endpoint.includes('app_url=')) return endpoint;
    const separator = endpoint.includes('?') ? '&' : '?';
    return `${endpoint}${separator}app_url=${appUrl}`;
  };

  /**
   * Main API call handler
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object|FormData|null} data - Request body data (JSON object or FormData)
   * @param {boolean} useToken - Include bearer token
   * @returns {Promise<{status:number, data:Object, error?:ApiError}>}
   */
  const call = async (endpoint, method = 'GET', data = null, useToken = true) => {
   
    try {
      const isFormData = data instanceof FormData;
     
      const options = {
        method: method.toUpperCase(),
        headers: getHeaders(useToken, isFormData),
      };

      if (data) {
        if (isFormData) {
          data.append('app_url', APP_URL);
          options.body = data;
        } else {
          // Handle JSON data
          data.app_url = APP_URL;
          if (method.toUpperCase() !== 'GET') {
            options.body = JSON.stringify(data);
          }
        }
      }

      if (method.toUpperCase() === 'GET') {
        endpoint = addAppUrl(endpoint, APP_URL);
      }

      const response = await fetch(`${BASE_URL}/${endpoint}`, options);
      return await handleResponse(response);
    } catch (error) {
      const status = error?.response?.status || 500;
      const apiError = new ApiError(status, error?.message || 'An error occurred');
      return { status, error: apiError };
    }
  };

  // Expose CRUD helper methods
  return {
    call,
    get: (endpoint, useToken = true) => call(endpoint, 'GET', null, useToken),
    post: (endpoint, data, useToken = true) => call(endpoint, 'POST', data, useToken),
    put: (endpoint, data, useToken = true) => call(endpoint, 'PUT', data, useToken),
    delete: (endpoint, useToken = true) => call(endpoint, 'DELETE', null, useToken),
    
  };
};

// Export the ApiError class and Api factory function for external use
export { ApiError, Api as createApi };

export default Api;
