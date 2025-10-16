import React, { createContext, useContext, useState } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [emailTemplates, setEmailTemplates] = useState([
    {
      id: 1,
      name: 'Patient Welcome Email',
      subject: 'Welcome to {{clinic_name}}',
      body: 'Dear {{patient_name}},\n\nWelcome to our clinic. We are pleased to have you as our patient.\n\nBest regards,\n{{clinic_name}}',
      status: 'Active',
      useAsReminder: false,
      clinic: '',
    },
    {
      id: 2,
      name: 'Appointment Reminder',
      subject: 'Appointment Reminder - {{appointment_date}}',
      body: 'Dear {{patient_name}},\n\nThis is a reminder about your upcoming appointment on {{appointment_date}}.\n\nIf you need to reschedule, please contact us at {{patient_phone}}.\n\nBest regards,\n{{clinic_name}}',
      status: 'Active',
      useAsReminder: true,
      clinic: '',
    },
  ]);

  const [clinicSettings, setClinicSettings] = useState({
    showPhone: true,
    showPrimaryInsurance: true,
    showSecondaryInsurance: true,
    showAddress: true,
    requireEmail: true,
    enableReminders: true,
    allowPublicAdd: false,
    clinicUrl: '',
  });

  const addEmailTemplate = (template) => {
    const newTemplate = {
      ...template,
      id: Date.now(),
    };
    setEmailTemplates([...emailTemplates, newTemplate]);
    return newTemplate;
  };

  const updateEmailTemplate = (id, updatedTemplate) => {
    setEmailTemplates(
      emailTemplates.map((template) =>
        template.id === id ? { ...template, ...updatedTemplate } : template
      )
    );
  };

  const deleteEmailTemplate = (id) => {
    setEmailTemplates(emailTemplates.filter((template) => template.id !== id));
  };

  const updateClinicSettings = (settings) => {
    setClinicSettings({ ...clinicSettings, ...settings });
  };

  const getTemplateByType = (type) => {
    return emailTemplates.find(t => t.name.toLowerCase().includes(type.toLowerCase()) && t.status === 'Active');
  };

  const renderTemplate = (templateBody, variables) => {
    let rendered = templateBody;
    Object.keys(variables).forEach(key => {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), variables[key]);
    });
    return rendered;
  };

  const value = {
    emailTemplates,
    clinicSettings,
    addEmailTemplate,
    updateEmailTemplate,
    deleteEmailTemplate,
    updateClinicSettings,
    getTemplateByType,
    renderTemplate,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};


