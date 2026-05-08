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
                if (typeof responseData === 'object' && responseData?.clinicUsers?.data && Array.isArray(responseData.clinicUsers?.data)) {
                    setStaffs(responseData?.clinicUsers?.data);
                    setPagination({
                        currentPage: responseData?.clinicUsers?.current_page || 1,
                        lastPage: responseData?.clinicUsers?.last_page || 1,
                        perPage: responseData?.clinicUsers?.per_page || 10,
                        total: responseData?.clinicUsers?.total || 0,
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
                }
            } else {
                return handleApiError(response.error, logout);
            }
        } catch (err) {
            return handleApiError(err, logout);
        }
    }, [getToken, logout]);


    const removeStaff = useCallback(async (id) => {
        const api = Api(() => getToken());
        if (!api) return;

        try {
            const response = await api.call(`clinics/remove-clinic-staff`, 'POST', { p_id: id }, true);

            if (response.status === 200) {
                return response;
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
        removeStaff,
    };

    return <ClinicStaffsContext.Provider value={value}>{children}</ClinicStaffsContext.Provider>;
};
