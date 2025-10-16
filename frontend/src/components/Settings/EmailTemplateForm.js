import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useClinic } from '../../context/ClinicContext';
import FormField from '../UI/FormField';

const EmailTemplateForm = ({ template, onClose }) => {
  const { addEmailTemplate, updateEmailTemplate } = useSettings();
  const { getActiveeClinics } = useClinic();
  const clinics = getActiveeClinics();

  const [formData, setFormData] = useState({
    name: template?.name || '',
    status: template?.status || 'Active',
    subject: template?.subject || '',
    body: template?.body || '',
    useAsReminder: template?.useAsReminder || false,
    clinic: template?.clinic || '',
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
    
    if (template) {
      updateEmailTemplate(template.id, formData);
    } else {
      addEmailTemplate(formData);
    }
    
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Template Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter template name"
          required
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
      </div>

      <FormField
        label="Subject"
        name="subject"
        value={formData.subject}
        onChange={handleChange}
        placeholder="Enter email subject"
        required
      />

      <FormField
        label="Body"
        name="body"
        type="textarea"
        value={formData.body}
        onChange={handleChange}
        placeholder="Enter email body content"
        rows={8}
        required
      />

      <div className="border-t border-gray-200 pt-4">
        <FormField
          type="checkbox"
          name="useAsReminder"
          label="Use as Patient Reminder"
          checked={formData.useAsReminder}
          onChange={handleChange}
        />
      </div>

      {formData.useAsReminder && (
        <FormField
          label="Choose Clinic"
          name="clinic"
          type="select"
          value={formData.clinic}
          onChange={handleChange}
          options={clinics.map(c => c.companyName)}
          required
        />
      )}

      {/* Available Variables */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Available Variables</h4>
        <p className="text-sm text-blue-800 mb-2">You can use the following variables in your template:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono text-blue-700">
          <span>{'{{patient_name}}'}</span>
          <span>{'{{clinic_name}}'}</span>
          <span>{'{{appointment_date}}'}</span>
          <span>{'{{doctor_name}}'}</span>
          <span>{'{{patient_email}}'}</span>
          <span>{'{{patient_phone}}'}</span>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {template ? 'Update Template' : 'Create Template'}
        </button>
      </div>
    </form>
  );
};

export default EmailTemplateForm;


