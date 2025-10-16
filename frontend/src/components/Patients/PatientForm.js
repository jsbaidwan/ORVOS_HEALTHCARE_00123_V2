import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';
import { useClinic } from '../../context/ClinicContext';
import FormField from '../UI/FormField';
import EyeImageUploader from './EyeImageUploader';
import MedicalHistorySection from './MedicalHistorySection';

const PatientForm = ({ patient }) => {
  const navigate = useNavigate();
  const { addPatient, updatePatient } = usePatient();
  const { getActiveeClinics } = useClinic();

  const clinics = getActiveeClinics();

  const [formData, setFormData] = useState({
    clinic: patient?.clinic || '',
    firstName: patient?.firstName || '',
    lastName: patient?.lastName || '',
    dateOfBirth: patient?.dateOfBirth || '',
    gender: patient?.gender || '',
    phone: patient?.phone || '',
    ehr: patient?.ehr || '',
    email: patient?.email || '',
    address: patient?.address || '',
    primaryInsuranceName: patient?.primaryInsuranceName || '',
    primaryInsuranceGroupNo: patient?.primaryInsuranceGroupNo || '',
    primaryInsuranceMemberNo: patient?.primaryInsuranceMemberNo || '',
    secondaryInsuranceName: patient?.secondaryInsuranceName || '',
    secondaryInsuranceGroupNo: patient?.secondaryInsuranceGroupNo || '',
    secondaryInsuranceMemberNo: patient?.secondaryInsuranceMemberNo || '',
    medicalCondition: patient?.medicalCondition || '',
    medicalHistory: patient?.medicalHistory || [],
  });

  const medicalConditions = ['Type 1 Diabetes', 'Type 2 Diabetes'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      if (value.length > 6) {
        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
      } else if (value.length > 3) {
        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
      } else if (value.length > 0) {
        value = `(${value}`;
      }
      setFormData({ ...formData, phone: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (patient) {
      updatePatient(patient.id, formData);
    } else {
      addPatient(formData);
    }
    
    navigate('/patients');
  };

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {patient ? 'Edit Patient' : 'Add New Patient'}
          </h1>
          <p className="text-gray-600 mt-1">Fill in the patient information below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Clinic"
                name="clinic"
                type="select"
                value={formData.clinic}
                onChange={handleChange}
                options={clinics.map(c => c.companyName)}
                required
              />

              <FormField
                label="EHR #"
                name="ehr"
                value={formData.ehr}
                onChange={handleChange}
                placeholder="Enter MR Number"
                required
              />

              <FormField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter First Name"
                required
              />

              <FormField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter Last Name"
                required
              />

              <FormField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />

              <FormField
                label="Gender"
                name="gender"
                type="select"
                value={formData.gender}
                onChange={handleChange}
                options={['Male', 'Female', 'Other']}
              />

              <FormField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(xxx) xxx-xxxx"
                required
              />

              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                required
              />
            </div>

            <div className="mt-4">
              <FormField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter Address"
                required
              />
            </div>
          </div>

          {/* Insurance Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h2>
            
            {/* Primary Insurance */}
            <h3 className="text-md font-semibold text-gray-700 mb-3">Primary Insurance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormField
                label="Insurance Name"
                name="primaryInsuranceName"
                value={formData.primaryInsuranceName}
                onChange={handleChange}
                placeholder="Enter Primary Insurance Name"
                required
              />

              <FormField
                label="Group No"
                name="primaryInsuranceGroupNo"
                value={formData.primaryInsuranceGroupNo}
                onChange={handleChange}
                placeholder="Enter Group No"
                required
              />

              <FormField
                label="Member No"
                name="primaryInsuranceMemberNo"
                value={formData.primaryInsuranceMemberNo}
                onChange={handleChange}
                placeholder="Enter Member No"
                required
              />
            </div>

            {/* Secondary Insurance */}
            <h3 className="text-md font-semibold text-gray-700 mb-3">Secondary Insurance (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Insurance Name"
                name="secondaryInsuranceName"
                value={formData.secondaryInsuranceName}
                onChange={handleChange}
                placeholder="Enter Secondary Insurance Name"
              />

              <FormField
                label="Group No"
                name="secondaryInsuranceGroupNo"
                value={formData.secondaryInsuranceGroupNo}
                onChange={handleChange}
                placeholder="Enter Group No"
              />

              <FormField
                label="Member No"
                name="secondaryInsuranceMemberNo"
                value={formData.secondaryInsuranceMemberNo}
                onChange={handleChange}
                placeholder="Enter Member No"
              />
            </div>
          </div>

          {/* Eye Images */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Eye Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EyeImageUploader
                label="Left Eye Images"
                name="leftEyeImages"
                onChange={handleChange}
                required
                eyeType="left"
              />

              <EyeImageUploader
                label="Right Eye Images"
                name="rightEyeImages"
                onChange={handleChange}
                required
                eyeType="right"
              />
            </div>
          </div>

          {/* Medical Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h2>
            
            <FormField
              label="Medical Condition"
              name="medicalCondition"
              type="select"
              value={formData.medicalCondition}
              onChange={handleChange}
              options={medicalConditions}
              required
            />

            <div className="mt-4">
              <MedicalHistorySection
                selectedHistory={formData.medicalHistory}
                onChange={(updatedHistory) => setFormData({ ...formData, medicalHistory: updatedHistory })}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/patients')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {patient ? 'Update Patient' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;

