import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import Modal from '../Common/Modal';
import EmailTemplateForm from './EmailTemplateForm';

const EmailTemplates = () => {
  const { emailTemplates, deleteEmailTemplate } = useSettings();
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this email template?')) {
      deleteEmailTemplate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Email Templates</h2>
          <p className="text-gray-600 mt-1">Manage email templates for patient communication</p>
        </div>
        <button
          onClick={() => {
            setEditingTemplate(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {emailTemplates.map((template) => (
          <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                template.status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {template.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.body}</p>
            
            {template.useAsReminder && (
              <div className="flex items-center text-xs text-primary-600 mb-4">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>Used as patient reminder</span>
              </div>
            )}
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(template)}
                className="flex-1 btn-secondary text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(template.id)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {emailTemplates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">No email templates found</p>
        </div>
      )}

      {/* Email Template Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTemplate(null);
        }}
        title={editingTemplate ? 'Edit Email Template' : 'New Email Template'}
        size="lg"
      >
        <EmailTemplateForm
          template={editingTemplate}
          onClose={() => {
            setShowModal(false);
            setEditingTemplate(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default EmailTemplates;


