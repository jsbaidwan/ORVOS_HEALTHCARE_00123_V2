import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useClinic } from '../../context/ClinicContext';
import FormField from '../UI/FormField';

const ClinicSettings = () => {
  const { clinicSettings, updateClinicSettings } = useSettings();
  const { getActiveeClinics } = useClinic();
  const clinics = getActiveeClinics();

  const [formData, setFormData] = useState({
    selectedClinic: '',
    showPhone: clinicSettings?.showPhone || true,
    showPrimaryInsurance: clinicSettings?.showPrimaryInsurance || true,
    showSecondaryInsurance: clinicSettings?.showSecondaryInsurance || true,
    showAddress: clinicSettings?.showAddress || true,
    requireEmail: clinicSettings?.requireEmail || true,
    enableReminders: clinicSettings?.enableReminders || true,
    allowPublicAdd: clinicSettings?.allowPublicAdd || false,
    clinicUrl: clinicSettings?.clinicUrl || '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateClinicSettings(formData);
    alert('Settings saved successfully!');
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Settings</h2>
      <p className="text-gray-600 mb-6">Configure clinic-specific settings</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Clinic Selection */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <FormField
            label="Select Clinic"
            name="selectedClinic"
            type="select"
            value={formData.selectedClinic}
            onChange={handleChange}
            options={[
              { value: '', label: 'All Clinics' },
              ...clinics.map(c => ({ value: c.id, label: c.companyName }))
            ]}
            required
          />
        </div>

        {/* Patient Settings */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Settings</h3>
          
          <div className="space-y-3">
            <FormField
              type="checkbox"
              name="showPhone"
              label="Show Phone Field in Patient Form"
              checked={formData.showPhone}
              onChange={handleChange}
            />
            <FormField
              type="checkbox"
              name="showPrimaryInsurance"
              label="Show Primary Insurance Fields"
              checked={formData.showPrimaryInsurance}
              onChange={handleChange}
            />
            <FormField
              type="checkbox"
              name="showSecondaryInsurance"
              label="Show Secondary Insurance Fields"
              checked={formData.showSecondaryInsurance}
              onChange={handleChange}
            />
            <FormField
              type="checkbox"
              name="showAddress"
              label="Show Patient Address Field"
              checked={formData.showAddress}
              onChange={handleChange}
            />
            <FormField
              type="checkbox"
              name="requireEmail"
              label="Require Email Address (for appointment reminders)"
              checked={formData.requireEmail}
              onChange={handleChange}
            />
            <FormField
              type="checkbox"
              name="enableReminders"
              label="Enable Patient Appointment Reminders (120 days from last image)"
              checked={formData.enableReminders}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Clinic Access */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinic Access</h3>
          
          <FormField
            type="checkbox"
            name="allowPublicAdd"
            label="Allow adding patients without logging in"
            checked={formData.allowPublicAdd}
            onChange={handleChange}
          />
          
          <div className="mt-4">
            <FormField
              label="Clinic URL"
              name="clinicUrl"
              value={formData.clinicUrl}
              onChange={handleChange}
              placeholder="https://yourclinic.com/add-patient"
            />
            <p className="text-xs text-gray-500 mt-1">
              Public URL where patients can submit their information
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button type="submit" className="btn-primary">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClinicSettings;


