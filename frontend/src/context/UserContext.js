import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import Api from '../utils/api';
import { handleApiError } from '../utils/errorHandler';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { getToken, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  });

  const getUsers = useCallback(async (page = 1, filters = {}, paginate) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const data = { paginate, page, ...filters };
      const endpoint = 'users?data=' + encodeURIComponent(JSON.stringify(data));
      const response = await api.call(endpoint, 'GET', null, true);

      if (response.status === 200) {
        const responseData = response.data.users;

        if (typeof responseData === 'object' && responseData.data && Array.isArray(responseData.data)) {
          setUsers(responseData.data);
          setPagination({
            currentPage: responseData.current_page || 1,
            lastPage: responseData.last_page || 1,
            perPage: responseData.per_page || 10,
            total: responseData.total || 0,
          });
          return responseData;
        } else if (Array.isArray(responseData)) {
          setUsers(responseData);
          setPagination({
            currentPage: 1,
            lastPage: 1,
            perPage: responseData.length,
            total: responseData.length,
          });
          return responseData;
        }
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  }, [getToken, logout]);

  const getUserById = useCallback(async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call(`users/${id}/edit`, 'GET', null, true);

      if (response.status === 200) {
        return { status: 200, user: response.data.user };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  }, [getToken, logout]);

  const addUser = async (userData) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call('users', 'POST', userData, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'User created successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const updateUser = async (id, userData) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      let method = 'PUT';
      if (userData instanceof FormData) {
        userData.append('_method', 'PUT');
        method = 'POST';
      }

      const response = await api.call(`users/${id}`, method, userData, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'User updated successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const archiveUser = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call('archive', 'POST', { module: 'users', id }, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'User archived successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const unarchiveUser = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call('unarchive', 'POST', { module: 'users', id }, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'User unarchived successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const deleteUser = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call(`users/${id}`, 'DELETE', null, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'User deleted successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const getExistingUser = (id) => {
    return users.find((u) => u.id === Number(id)) || null;
  };

  const value = {
    users,
    setUsers,
    pagination,
    getUsers,
    getUserById,
    addUser,
    updateUser,
    archiveUser,
    unarchiveUser,
    getExistingUser,
    deleteUser
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
