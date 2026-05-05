import pako from 'pako';

const API_NAME = process.env.REACT_APP_API_NAME;
const BASE_URL = `${process.env.REACT_APP_API_URL}/${API_NAME}/api`;
const APP_URL = process.env.REACT_APP_BASE_URL;

/**
 * Custom API Error class
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
 * Factory function
 */
const Api = (getToken) => {

  /* =============================
     🔹 Concurrency Control (OPTIONAL)
  ============================== */
  let activeRequests = 0;
  const MAX_CONCURRENT = 5; // change if needed
  const queue = [];

  const next = () => {
    if (queue.length && activeRequests < MAX_CONCURRENT) {
      const resolve = queue.shift();
      resolve();
    }
  };

  const enqueue = () =>
    new Promise((resolve) => {
      if (activeRequests < MAX_CONCURRENT) {
        resolve();
      } else {
        queue.push(resolve);
      }
    });

  /* =============================
     🔹 Headers
  ============================== */
  const getHeaders = (useToken = true, isFormData = false) => {
    const headers = {};

    if (!isFormData) headers['Content-Type'] = 'application/json';

    if (useToken) {
      const token = getToken?.();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  /* =============================
     🔹 Response Handler
  ============================== */
  const handleResponse = async (response) => {
    let rawText = '';

    try {
      rawText = await response.text();

      let json = {};

      if (response.headers.get('X-Obfuscated')) {
        const bytes = Uint8Array.from(
          atob(rawText.trim()),
          (c) => c.charCodeAt(0)
        );
        const decompressed = pako.inflate(bytes, { to: 'string' });
        json = JSON.parse(decompressed || '{}');
      } else {
        json = rawText ? JSON.parse(rawText) : {};
      }

      if (!response.ok) {
        throw new ApiError(
          response.status,
          json.message || 'An error occurred',
          json
        );
      }

      return { status: response.status, data: json };

    } catch (err) {
      return {
        status: response.status,
        data: {},
        error:
          err instanceof ApiError
            ? err
            : new ApiError(response.status, err.message, { raw: rawText }),
        raw: rawText,
      };
    }
  };

  /* =============================
     🔹 Add app_url
  ============================== */
  const addAppUrl = (endpoint) => {
    if (endpoint.includes('app_url=')) return endpoint;
    const separator = endpoint.includes('?') ? '&' : '?';
    return `${endpoint}${separator}app_url=${APP_URL}`;
  };

  /* =============================
     🔹 Main Call
  ============================== */
  const call = async (endpoint, method = 'GET', data = null, useToken = true) => {

    await enqueue();
    activeRequests++;

    try {
      const isFormData = data instanceof FormData;

      const options = {
        method: method.toUpperCase(),
        headers: getHeaders(useToken, isFormData),
      };

      let finalEndpoint = endpoint;

      if (data) {
        if (isFormData) {
          data.append('app_url', APP_URL);
          options.body = data;
        } else {
          data = { ...data, app_url: APP_URL };

          if (method.toUpperCase() !== 'GET') {
            options.body = JSON.stringify(data);
          }
        }
      }

      if (method.toUpperCase() === 'GET') {
        finalEndpoint = addAppUrl(endpoint);
      }

      const response = await fetch(`${BASE_URL}/${finalEndpoint}`, options);

      return await handleResponse(response);

    } catch (error) {
      const status = error?.status || 500;

      let message = error?.message || 'An error occurred';

      if (status === 500) {
        message =
          'An unexpected error has occurred. Please try again later or contact support.';
      }

      return { status, error: new ApiError(status, message) };

    } finally {
      activeRequests--;
      next();
    }
  };

  /* =============================
     🔹 Methods
  ============================== */
  return {
    call,
    get: (endpoint, useToken = true) =>
      call(endpoint, 'GET', null, useToken),

    post: (endpoint, data, useToken = true) =>
      call(endpoint, 'POST', data, useToken),

    put: (endpoint, data, useToken = true) =>
      call(endpoint, 'PUT', data, useToken),

    delete: (endpoint, useToken = true) =>
      call(endpoint, 'DELETE', null, useToken),
  };
};

export { ApiError, Api as createApi };
export default Api;