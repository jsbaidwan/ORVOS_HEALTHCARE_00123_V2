import React, { useState } from 'react';
import ChangePassword from './ChangePassword';
import EmailTemplates from './EmailTemplates';
import ClinicSettings from './ClinicSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('password');

  const tabs = [
    { id: 'password', name: 'Change Password', icon: '🔒' },
    { id: 'email', name: 'Email Templates', icon: '📧' },
    { id: 'clinic', name: 'Additional Settings', icon: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-primary-100">Manage your account and application settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Change Password Tab */}
          {activeTab === 'password' && <ChangePassword />}

          {/* Email Templates Tab */}
          {activeTab === 'email' && <EmailTemplates />}

          {/* Additional Settings Tab */}
          {activeTab === 'clinic' && <ClinicSettings />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
