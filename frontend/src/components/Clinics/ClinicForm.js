import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import FormField from '../UI/FormField';

const ClinicForm = ({ clinic, onClose }) => {
  const { addClinic, updateClinic } = useClinic();

  const [formData, setFormData] = useState({
    companyName: clinic?.companyName || '',
    pocEmail: clinic?.pocEmail || '',
    phone: clinic?.phone || '',
    address: clinic?.address || '',
    city: clinic?.city || '',
    state: clinic?.state || '',
    zip: clinic?.zip || '',
    description: clinic?.description || '',
    status: clinic?.status || 'Active',
    dateOfInitiation: clinic?.dateOfInitiation || '',
  });

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
    
    if (clinic) {
      updateClinic(clinic.id, formData);
    } else {
      addClinic(formData);
    }
    
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Company Name"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Enter Company Name"
          required
        />

        <FormField
          label="POC Email"
          name="pocEmail"
          type="email"
          value={formData.pocEmail}
          onChange={handleChange}
          placeholder="Enter POC Email"
          required
        />

        <FormField
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handlePhoneChange}
          placeholder="(xxx) xxx-xxxx"
        />

        <FormField
          label="Date of Initiation"
          name="dateOfInitiation"
          type="date"
          value={formData.dateOfInitiation}
          onChange={handleChange}
          required
        />
      </div>

      <FormField
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Enter Address"
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="Enter City"
          required
        />

        <FormField
          label="State"
          name="state"
          type="select"
          value={formData.state}
          onChange={handleChange}
          options={states}
          required
        />

        <FormField
          label="Zip"
          name="zip"
          value={formData.zip}
          onChange={handleChange}
          placeholder="Enter Zip"
          required
        />
      </div>

      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={formData.description}
        onChange={handleChange}
        placeholder="Enter Description"
        rows={3}
      />

      <FormField
        label="Status"
        name="status"
        type="select"
        value={formData.status}
        onChange={handleChange}
        options={['Active', 'Inactive']}
        required
      />

      <div className="border-t border-gray-200 pt-4">
        <FormField
          label="Contract Documents"
          name="contractDocuments"
          type="file"
          onChange={handleChange}
          placeholder="Upload contract documents (multiple files allowed)"
        />
      </div>

      <div className="border-t border-gray-200 pt-4">
        <FormField
          label="Clinic Logo"
          name="logo"
          type="file"
          onChange={handleChange}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {clinic ? 'Update Clinic' : 'Add Clinic'}
        </button>
      </div>
    </form>
  );
};

export default ClinicForm;

