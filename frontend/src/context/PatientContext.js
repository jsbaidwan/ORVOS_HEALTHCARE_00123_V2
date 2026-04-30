import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import Api from '../utils/api';
import { handleApiError } from '../utils/errorHandler';

const PatientContext = createContext();

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};

export const PatientProvider = ({ children }) => {
  const { getToken, logout } = useAuth();
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  });

  const getPatients = useCallback(async (page = 1, filters = {}, paginate) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const data = {
        paginate,
        page,
        ...filters,
      };

      const endpoint = 'patients?data=' + encodeURIComponent(JSON.stringify(data));
      const response = await api.call(endpoint, 'GET', null, true);

      if (response.status === 200) {
        const responseData = response.data.patients;

        if (typeof responseData === 'object' && responseData.data && Array.isArray(responseData.data)) {
          setPatients(responseData.data);
          setPagination({
            currentPage: responseData.current_page || 1,
            lastPage: responseData.last_page || 1,
            perPage: responseData.per_page || 10,
            total: responseData.total || 0,
          });
          return responseData;
        } else if (Array.isArray(responseData)) {
          setPatients(responseData);
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

  const getPatientById = useCallback(async (id, options = {}) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      let url = `patients/${id}/edit`;
      if (options?.action && options?.action === 'view') {
        url = `patients/${id}`;
      }
      const response = await api.call(url, 'GET', null, true);

      if (response.status === 200) {
        return { status: 200, patient: response.data.patient };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  }, [getToken, logout]);

  const addPatient = async (patientData) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call('patients', 'POST', patientData, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Patient created successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const updatePatient = async (id, patientData) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      let method = 'PUT';
      if (patientData instanceof FormData) {
        patientData.append('_method', 'PUT');
        method = 'POST';
      }

      const response = await api.call(`patients/${id}`, method, patientData, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Patient updated successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const archivePatient = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call('archive', 'POST', { module: 'patients', id }, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Patient archived successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const unarchivePatient = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call('unarchive', 'POST', { module: 'patients', id }, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Patient unarchived successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const deletePatient = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call(`patients/${id}`, 'DELETE', null, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Patient deleted successfully' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const getExistingPatient = (id) => {
    return patients.find(p => p.id === Number(id)) || null;
  };

  const getPendingPatients = () => {
    return patients.filter((patient) => patient.status === 'Pending');
  };

  const getCompletedPatients = () => {
    return patients.filter((patient) => patient.status === 'Completed');
  };

  const markAsCompleted = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call(`patients/${id}/complete`, 'POST', null, true);

      if (response.status === 200) {
        setPatients(
          patients.map((patient) => (patient.id === id ? { ...patient, status: 'Completed' } : patient))
        );
        return { status: response.status, message: response.data?.message || 'Patient marked as completed' };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  };

  const downloadReport = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call(`patients/pdf/${id}`, 'POST', {}, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Report downloaded successfully', data: response.data };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  }

  const sendReport = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call(`send-pdf`, 'POST', { patient_id: id }, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Report sent successfully', data: response.data };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  }

  const sendFax = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call(`send-fax`, 'POST', { patient_id: id }, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Fax sent successfully', data: response.data };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  }

  const sendDicomFile = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call(`send-dicom`, 'POST', { patient_id: id }, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Dicom file sent successfully', data: response.data };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  }

  const reDiagnosis = async (id) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call(`clone`, 'POST', { patient_id: id }, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Re-diagnosis successfully', data: response.data };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  }

  const exportToExcel = async (filters) => {
    const api = Api(() => getToken());
    if (!api) return;

    try {
      const response = await api.call(`patients/export`, 'POST', filters, true);

      if (response.status === 200) {
        return { status: response.status, message: response.data?.message || 'Exported successfully', data: response.data };
      } else {
        return handleApiError(response.error, logout);
      }
    } catch (err) {
      return handleApiError(err, logout);
    }
  }

  const value = {
    patients,
    setPatients,
    pagination,
    getPatients,
    getPatientById,
    addPatient,
    updatePatient,
    deletePatient,
    archivePatient,
    unarchivePatient,
    getExistingPatient,
    getPendingPatients,
    getCompletedPatients,
    markAsCompleted,
    downloadReport,
    sendReport,
    sendFax,
    sendDicomFile,
    reDiagnosis,
    exportToExcel,
  };

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
};
