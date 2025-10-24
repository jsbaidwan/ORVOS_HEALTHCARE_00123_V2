import pako from 'pako';

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
 */
const Api = (getToken) => {
  /**
   * Generate headers for the request
   */
  const getHeaders = (useToken = true, isFormData = false) => {
    const headers = {};

    if (!isFormData) headers['Content-Type'] = 'application/json';

    if (useToken) {
      const token = getToken?.();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  /**
   * Handle API response and decode if needed
   */
  const handleResponse = async (response) => {
    try {
      // Read response as text
      const rawText = await response.text();
  
      // Parse JSON (obfuscated or regular)
      let json = {};
      if (response.headers.get('X-Obfuscated')) {
        // Decode Base64 → JSON string
        const bytes = Uint8Array.from(atob(rawText.trim()), (c) => c.charCodeAt(0));
        // Inflate using pako
        const decompressed = pako.inflate(bytes, { to: 'string' });
        json = JSON.parse(decompressed || '{}');
      } else {
        // Regular JSON
        json = rawText ? JSON.parse(rawText) : {};
      }
  
      // If response is not OK, throw ApiError
      if (!response.ok) {
        const apiError = new ApiError(
          response.status,
          json.message || 'An error occurred',
          json
        );
        return { status: response.status, data: json, error: apiError };
      }
  
      return { status: response.status, data: json };
    } catch (err) {
      console.error('Response decode error:', err);
      return {
        status: response.status,
        data: {},
        error: new ApiError(response.status, err.message, { raw: await response.text() }),
        raw: await response.text(),
      };
    }
  };
   
  /**
   * Append app_url to endpoint if not already present
   */
  const addAppUrl = (endpoint, appUrl) => {
    if (endpoint.includes('app_url=')) return endpoint;
    const separator = endpoint.includes('?') ? '&' : '?';
    return `${endpoint}${separator}app_url=${appUrl}`;
  };

  /**
   * Main API call
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
          data.app_url = APP_URL;
          if (method.toUpperCase() !== 'GET') {
            options.body = JSON.stringify(data);
          }
        }
      }

      if (method.toUpperCase() === 'GET') {
        endpoint = addAppUrl(endpoint, APP_URL);
      }

      const response = await fetch(`${BASE_URL}/${endpoint}`, {
        ...options,       
      });
      return await handleResponse(response);
    } catch (error) {
      const status = error?.response?.status || 500;
      const apiError = new ApiError(status, error?.message || 'An error occurred');
      return { status, error: apiError };
    }
  };

  return {
    call,
    get: (endpoint, useToken = true) => call(endpoint, 'GET', null, useToken),
    post: (endpoint, data, useToken = true) => call(endpoint, 'POST', data, useToken),
    put: (endpoint, data, useToken = true) => call(endpoint, 'PUT', data, useToken),
    delete: (endpoint, useToken = true) => call(endpoint, 'DELETE', null, useToken),
  };
};

export { ApiError, Api as createApi };
export default Api;
