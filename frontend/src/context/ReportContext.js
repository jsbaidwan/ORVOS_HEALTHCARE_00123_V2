import React, { createContext, useContext } from 'react';
import { usePatient } from './PatientContext';

const ReportContext = createContext();

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};

export const ReportProvider = ({ children }) => {
  const { patients } = usePatient();

  const getClinicPatientsReport = (clinicName) => {
    if (!clinicName || clinicName === '') {
      return patients;
    }
    return patients.filter(p => p.clinic === clinicName);
  };

  const getDoctorReviewReport = () => {
    // Return patients pending review
    return patients
      .filter(p => p.status === 'Pending')
      .map(patient => ({
        patient,
        imageCount: (patient.leftEyeImages?.length || 0) + (patient.rightEyeImages?.length || 0),
        status: 'Pending Review',
      }));
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatistics = (clinicName = '') => {
    const filteredPatients = getClinicPatientsReport(clinicName);
    
    return {
      total: filteredPatients.length,
      pending: filteredPatients.filter(p => p.status === 'Pending').length,
      completed: filteredPatients.filter(p => p.status === 'Completed').length,
      byCondition: filteredPatients.reduce((acc, p) => {
        acc[p.medicalCondition] = (acc[p.medicalCondition] || 0) + 1;
        return acc;
      }, {}),
      byClinic: filteredPatients.reduce((acc, p) => {
        acc[p.clinic] = (acc[p.clinic] || 0) + 1;
        return acc;
      }, {}),
    };
  };

  const value = {
    getClinicPatientsReport,
    getDoctorReviewReport,
    exportToCSV,
    getStatistics,
  };

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
};


