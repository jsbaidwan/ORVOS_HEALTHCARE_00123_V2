import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import Api from '../utils/api';
import { handleApiError } from '../utils/errorHandler';
const ClinicContext = createContext();
 
export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};

export const ClinicProvider = ({ children }) => {
  const { getToken, logout } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  });
   
  const getClinics = useCallback(async (page = 1, filters = {}, paginate) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const data = {
        paginate,
        page,
        ...filters,
      };

      const endpoint = 'clinics?data=' + encodeURIComponent(JSON.stringify(data));
      const response = await api.call(endpoint, 'GET', null, true);

      if (response.status === 200) {
        const responseData = response.data.clinics;

        if (typeof responseData === 'object' && responseData.data && Array.isArray(responseData.data)) {
          setClinics(responseData.data);
          setPagination({
            currentPage: responseData.current_page || 1,
            lastPage: responseData.last_page || 1,
            perPage: responseData.per_page || 10,
            total: responseData.total || 0,
          });
          return responseData;
        } else if (Array.isArray(responseData)) {
          setClinics(responseData);
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

  const getClinicById = useCallback(async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call(`clinics/${id}/edit`, 'GET', null, true);

      if (response.status === 200) {
        return response.data.clinic;
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  }, [getToken, logout]);

  const addClinic = async (clinicData) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call('clinics', 'POST', clinicData, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Clinic created successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const updateClinic = async (id, clinicData) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      let method = 'PUT';
      if (clinicData instanceof FormData) {
        clinicData.append('_method', 'PUT');
        method = 'POST';
      }

      const response = await api.call(`clinics/${id}`, method, clinicData, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Clinic updated successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const archiveClinic = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call('archive', 'POST', { module: 'clinics', id }, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Clinic archived successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const unarchiveClinic = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call('unarchive', 'POST', { module: 'clinics', id }, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Clinic unarchived successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const deleteClinic = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call(`clinics/${id}`, 'DELETE', null, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Clinic deleted successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const getExistingClinic = (id) => {
    
    return clinics.find(c => c.id === Number(id)) || null;
  };

  const value = {
    clinics,
    setClinics,
    pagination,
    getClinics,
    getClinicById,
    addClinic,
    updateClinic,
    deleteClinic,
    archiveClinic,
    unarchiveClinic,
    getExistingClinic
  };

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
};
