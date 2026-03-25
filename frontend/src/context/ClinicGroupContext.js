import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import Api from '../utils/api';
import { handleApiError } from '../utils/errorHandler';
  
const ClinicGroupContext = createContext();

export const useClinicGroup = () => {
  const context = useContext(ClinicGroupContext);
  if (!context) {
    throw new Error('useClinicGroup must be used within a ClinicGroupProvider');
  }
  return context;
};

export const ClinicGroupProvider = ({ children }) => {
  const { getToken, logout } = useAuth();
  const [clinicGroups, setClinicGroups] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  });
   
  const getClinicGroups = useCallback(async (page = 1, filters = {}, paginate) => {
    const api = Api(() => getToken());
    
    if (!api) {
      return;
    }
    
    try {
        const data = {
            paginate: paginate,
            page,
            ...filters,
        };
        
        const endpoint = 'clinic-groups?data=' + encodeURIComponent(JSON.stringify(data));
        const response = await api.call(endpoint, 'GET', null, true);
        
        if (response.status === 200) {
            const responseData = response.data.clinicGroups;

            // Check if it's a paginated response
            if (typeof responseData === 'object' && responseData.data && Array.isArray(responseData.data)) {
                // Store the data array and update pagination
                setClinicGroups(responseData.data);
                setPagination({
                    currentPage: responseData.current_page || 1,
                    lastPage: responseData.last_page || 1,
                    perPage: responseData.per_page || 10,
                    total: responseData.total || 0,
                });
                return responseData;
            } else if (Array.isArray(responseData)) {
                // Direct array without pagination
                setClinicGroups(responseData);
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

  const getClinicGroupById = useCallback(async (id, options = {}) => {
   
    const api = Api(() => getToken());
    if (!api) {
      return;
    }
    try {
      let url = `clinic-groups/${id}/edit`;
      if(options?.action && options?.action === 'view'){
       url = `clinic-groups/${id}`;
      }
      const response = await api.call(url, 'GET', null, true);

      if (response.status === 200) {
        return {'status': 200,'clinicGroup': response.data.clinicGroup};
        
      } else {
        return handleApiError(response.error, logout);
       
      }
    } catch (err) {
      
      return handleApiError(err, logout);
    }
  }, [getToken, logout]);

  const addClinicGroup = async (clinicGroupData) => {
   
    const api = Api(() => getToken());
    if (!api) {
      return;
    }
    try {
      const response = await api.call('clinic-groups', 'POST', clinicGroupData, true);
      
      if (response.status === 200) {
        
        return { status: response.status, message: response.data?.message || 'Clinic group created successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const updateClinicGroup = async (id, clinicGroupData) => {

    const api = Api(() => getToken());
    if (!api) {
      return;
    }
    try {
      const response = await api.call(`clinic-groups/${id}`, 'PUT', clinicGroupData, true);
      
      if (response.status === 200) {
        // Update the clinic group in the list
          
        return { status: response.status, message: response.data?.message || 'Clinic group updated successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const archiveClinicGroup = async (id) => {
    const api = Api(() => getToken());
    if (!api) {
      return;
    }

    try {
      const response = await api.call(`archive`, 'POST', {module:'clinic-groups','id':id}, true);
      
      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Clinic group archived successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  }

  const unarchiveClinicGroup = async (id) => {
    const api = Api(() => getToken());
    if (!api) {
      return;
    }

    try {
      const response = await api.call(`unarchive`, 'POST', {module:'clinic-groups','id':id}, true);
      
      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Clinic group unarchived successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  }

  const deleteClinicGroup = async (id) => {
    const api = Api(() => getToken());
    if (!api) {
      return;
    }

    try {
      const response = await api.call(`clinic-groups/${id}`, 'DELETE', null, true);
      
      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Clinic group deleted successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const getExistingClinicGroup = (id) => {
    return clinicGroups.find(c => c.id === Number(id)) || null;
 };
  
  const value = {
    clinicGroups,
    setClinicGroups,
    pagination,
    getClinicGroups,
    getClinicGroupById,
    addClinicGroup,
    updateClinicGroup,
    deleteClinicGroup,
    archiveClinicGroup,
    unarchiveClinicGroup,
    getExistingClinicGroup
  };

  return <ClinicGroupContext.Provider value={value}>{children}</ClinicGroupContext.Provider>;
};
