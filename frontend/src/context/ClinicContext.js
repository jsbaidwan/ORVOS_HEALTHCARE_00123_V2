import React, { createContext, useContext, useState } from 'react';

const ClinicContext = createContext();

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};

export const ClinicProvider = ({ children }) => {
  const [clinics, setClinics] = useState([
    {
      id: 1,
      companyName: 'City Medical Center',
      pocEmail: 'contact@citymedical.com',
      phone: '(555) 123-4567',
      address: '123 Medical Ave',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      description: 'Premier medical facility serving the community',
      status: 'Active',
      dateOfInitiation: '2024-01-15',
      contractDocuments: [],
      logo: null,
      isArchived: false,
    },
    {
      id: 2,
      companyName: 'Valley Health Clinic',
      pocEmail: 'info@valleyhealth.com',
      phone: '(555) 987-6543',
      address: '456 Health Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
      description: 'Comprehensive healthcare services',
      status: 'Active',
      dateOfInitiation: '2024-02-20',
      contractDocuments: [],
      logo: null,
      isArchived: false,
    },
  ]);

  const addClinic = (clinic) => {
    const newClinic = {
      ...clinic,
      id: Date.now(),
      isArchived: false,
    };
    setClinics([...clinics, newClinic]);
    return newClinic;
  };

  const updateClinic = (id, updatedClinic) => {
    setClinics(clinics.map((clinic) => (clinic.id === id ? { ...clinic, ...updatedClinic } : clinic)));
  };

  const deleteClinic = (id) => {
    setClinics(clinics.filter((clinic) => clinic.id !== id));
  };

  const archiveClinic = (id) => {
    setClinics(
      clinics.map((clinic) => (clinic.id === id ? { ...clinic, isArchived: true } : clinic))
    );
  };

  const getActiveeClinics = () => {
    return clinics.filter((clinic) => !clinic.isArchived);
  };

  const getArchivedClinics = () => {
    return clinics.filter((clinic) => clinic.isArchived);
  };

  const value = {
    clinics,
    addClinic,
    updateClinic,
    deleteClinic,
    archiveClinic,
    getActiveeClinics,
    getArchivedClinics,
  };

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
};

