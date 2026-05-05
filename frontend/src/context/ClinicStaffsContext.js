import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import Api from '../utils/api';
import { handleApiError } from '../utils/errorHandler';

const ClinicStaffsContext = createContext();

export const useClinicStaffs = () => {
    const context = useContext(ClinicStaffsContext);
    if (!context) {
        throw new Error('useClinicStaffs must be used within a ClinicStaffsProvider');
    }
    return context;
};

export const ClinicStaffsProvider = ({ children }) => {
    const { getToken, logout } = useAuth();
    const [staffs, setStaffs] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0,
    });

    const getStaffs = useCallback(async (id, page = 1, filters = {}, paginate) => {
        const api = Api(() => getToken());
        if (!api) return;

        try {
            const data = {
                paginate,
                page,
                ...filters,
            };

            const endpoint = `clinics/staff/${id}?data=` + encodeURIComponent(JSON.stringify(data));
            const response = await api.call(endpoint, 'GET', null, true);

            if (response.status === 200) {
                const responseData = response?.data;
                if (typeof responseData === 'object' && responseData.clinicUsers && Array.isArray(responseData.clinicUsers.data)) {
                    setStaffs(responseData.clinicUsers.data);
                    setPagination({
                        currentPage: responseData.clinicUsers.currentPage || 1,
                        lastPage: responseData.clinicUsers.lastPage || 1,
                        perPage: responseData.clinicUsers.perPage || 10,
                        total: responseData.clinicUsers.total || 0,
                    });
                    return responseData;
                } else if (Array.isArray(responseData)) {
                    setStaffs(responseData);
                    setPagination({
                        currentPage: 1,
                        lastPage: 1,
                        perPage: responseData.length,
                        total: responseData.length,
                    });
                    return responseData;
                } else if (typeof responseData === 'object' && responseData.data === undefined && Object.keys(responseData).length > 0) {
                    // handle case if structure is different
                    setStaffs([responseData]);
                }
            } else {
                return handleApiError(response.error, logout);
            }
        } catch (err) {
            return handleApiError(err, logout);
        }
    }, [getToken, logout]);


    const value = {
        staffs,
        setStaffs,
        pagination,
        getStaffs,
    };

    return <ClinicStaffsContext.Provider value={value}>{children}</ClinicStaffsContext.Provider>;
};
