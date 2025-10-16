import React, { createContext, useContext, useState } from 'react';

const PatientContext = createContext();

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};

export const PatientProvider = ({ children }) => {
  const [patients, setPatients] = useState([
    {
      id: 1,
      clinic: 'City Medical Center',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1985-06-15',
      gender: 'Male',
      phone: '(555) 111-2222',
      ehr: 'MR-12345',
      email: 'john.doe@email.com',
      address: '789 Patient St, New York, NY 10001',
      primaryInsuranceName: 'Blue Cross',
      primaryInsuranceGroupNo: 'GRP-12345',
      primaryInsuranceMemberNo: 'MEM-67890',
      secondaryInsuranceName: '',
      secondaryInsuranceGroupNo: '',
      secondaryInsuranceMemberNo: '',
      leftEyeImages: [],
      rightEyeImages: [],
      medicalCondition: 'Type 2 Diabetes',
      medicalHistory: ['HgbA1C', 'Hypertension', 'High cholesterol'],
      status: 'Pending',
      createdAt: '2024-10-01',
    },
    {
      id: 2,
      clinic: 'Valley Health Clinic',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1990-03-22',
      gender: 'Female',
      phone: '(555) 333-4444',
      ehr: 'MR-54321',
      email: 'jane.smith@email.com',
      address: '456 Patient Ave, Los Angeles, CA 90001',
      primaryInsuranceName: 'Aetna',
      primaryInsuranceGroupNo: 'GRP-54321',
      primaryInsuranceMemberNo: 'MEM-09876',
      secondaryInsuranceName: 'Medicare',
      secondaryInsuranceGroupNo: 'GRP-99999',
      secondaryInsuranceMemberNo: 'MEM-11111',
      leftEyeImages: [],
      rightEyeImages: [],
      medicalCondition: 'Type 1 Diabetes',
      medicalHistory: ['Family history of glaucoma', 'Obesity'],
      status: 'Completed',
      createdAt: '2024-09-15',
    },
  ]);

  const addPatient = (patient) => {
    const newPatient = {
      ...patient,
      id: Date.now(),
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPatients([...patients, newPatient]);
    return newPatient;
  };

  const updatePatient = (id, updatedPatient) => {
    setPatients(
      patients.map((patient) => (patient.id === id ? { ...patient, ...updatedPatient } : patient))
    );
  };

  const deletePatient = (id) => {
    setPatients(patients.filter((patient) => patient.id !== id));
  };

  const getPendingPatients = () => {
    return patients.filter((patient) => patient.status === 'Pending');
  };

  const getCompletedPatients = () => {
    return patients.filter((patient) => patient.status === 'Completed');
  };

  const markAsCompleted = (id) => {
    setPatients(
      patients.map((patient) => (patient.id === id ? { ...patient, status: 'Completed' } : patient))
    );
  };

  const value = {
    patients,
    addPatient,
    updatePatient,
    deletePatient,
    getPendingPatients,
    getCompletedPatients,
    markAsCompleted,
  };

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
};

