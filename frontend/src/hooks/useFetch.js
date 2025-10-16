import { useState, useEffect, useCallback } from 'react';

const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    method = 'GET',
    headers = {},
    body = null,
    skip = false,
    onSuccess = null,
    onError = null,
  } = options;

  // Fetch function
  const fetchData = useCallback(async (fetchUrl = url, fetchOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
        ...fetchOptions.headers,
      };

      const requestOptions = {
        method: fetchOptions.method || method,
        headers: defaultHeaders,
        ...(fetchOptions.body && { body: JSON.stringify(fetchOptions.body) }),
        ...(body && !fetchOptions.body && { body: JSON.stringify(body) }),
      };

      const response = await fetch(fetchUrl, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      
      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, method, body, headers, onSuccess, onError]);

  // Execute fetch on mount (unless skip is true)
  useEffect(() => {
    if (!skip && url) {
      fetchData();
    }
  }, [fetchData, skip, url]);

  // Refetch function
  const refetch = useCallback((customUrl, customOptions) => {
    return fetchData(customUrl, customOptions);
  }, [fetchData]);

  // GET request
  const get = useCallback((customUrl, customOptions = {}) => {
    return fetchData(customUrl || url, { method: 'GET', ...customOptions });
  }, [fetchData, url]);

  // POST request
  const post = useCallback((customUrl, postBody, customOptions = {}) => {
    return fetchData(customUrl || url, {
      method: 'POST',
      body: postBody,
      ...customOptions,
    });
  }, [fetchData, url]);

  // PUT request
  const put = useCallback((customUrl, putBody, customOptions = {}) => {
    return fetchData(customUrl || url, {
      method: 'PUT',
      body: putBody,
      ...customOptions,
    });
  }, [fetchData, url]);

  // DELETE request
  const del = useCallback((customUrl, customOptions = {}) => {
    return fetchData(customUrl || url, {
      method: 'DELETE',
      ...customOptions,
    });
  }, [fetchData, url]);

  // PATCH request
  const patch = useCallback((customUrl, patchBody, customOptions = {}) => {
    return fetchData(customUrl || url, {
      method: 'PATCH',
      body: patchBody,
      ...customOptions,
    });
  }, [fetchData, url]);

  return {
    data,
    loading,
    error,
    refetch,
    get,
    post,
    put,
    delete: del,
    patch,
  };
};

export default useFetch;


