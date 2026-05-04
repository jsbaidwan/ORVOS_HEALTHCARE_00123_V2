import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import Api from '../utils/api';
import { handleApiError } from '../utils/errorHandler';

const ReportContext = createContext();

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};

export const ReportProvider = ({ children }) => {
  const { getToken, logout } = useAuth();
  const [reports, setReports] = useState([]);

  const getDoctorReviewReport = useCallback(async (page = 1, filters = {}, paginate) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const data = {
        paginate,
        page,
        ...filters,
      };

      const endpoint = 'reports/orvos-doctor-review?data=' + encodeURIComponent(JSON.stringify(data));
      const response = await api.call(endpoint, 'GET', null, true);

      if (response.status === 200) {
        setReports(response.data);
        return response.data;
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  }, [getToken, logout]);

  const getClinicPatientsReport = useCallback(async (page = 1, filters = {}, paginate) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const data = {
        paginate,
        page,
        ...filters,
      };

      const endpoint = 'reports/clinic-patient?data=' + encodeURIComponent(JSON.stringify(data));
      const response = await api.call(endpoint, 'GET', null, true);

      if (response.status === 200) {
        setReports(response.data);
        return response.data;
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  }, [getToken, logout]);

  const value = {
    reports,
    setReports,
    getDoctorReviewReport,
    getClinicPatientsReport,
  };

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
};
