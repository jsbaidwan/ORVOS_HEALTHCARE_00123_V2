import React from 'react';

const Help = () => {
  const helpTopics = [
    {
      title: 'Getting Started',
      icon: '📚',
      description: 'Learn the basics of using the Orvos platform and set up your first clinic.',
      color: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-500',
    },
    {
      title: 'Patient Management',
      icon: '👥',
      description: 'Complete guide to managing patient records, images, and status updates.',
      color: 'from-green-50 to-green-100',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-500',
    },
    {
      title: 'Clinic Administration',
      icon: '🏥',
      description: 'How to add, edit, and manage clinic information and settings.',
      color: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      iconBg: 'bg-purple-500',
    },
    {
      title: 'Reports & Analytics',
      icon: '📊',
      description: 'How to generate and export reports for clinic and patient data.',
      color: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      iconBg: 'bg-orange-500',
    },
    {
      title: 'Email Templates',
      icon: '📧',
      description: 'Create and customize email templates for patient communications.',
      color: 'from-pink-50 to-pink-100',
      borderColor: 'border-pink-200',
      iconBg: 'bg-pink-500',
    },
    {
      title: 'Settings & Configuration',
      icon: '⚙️',
      description: 'Customize your system settings, email templates, and preferences.',
      color: 'from-indigo-50 to-indigo-100',
      borderColor: 'border-indigo-200',
      iconBg: 'bg-indigo-500',
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Help & Documentation</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {helpTopics.map((topic, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${topic.color} rounded-lg p-6 border ${topic.borderColor} hover:shadow-md transition-shadow duration-200 cursor-pointer`}
          >
            <div className="flex items-center mb-3">
              <div className={`w-12 h-12 ${topic.iconBg} rounded-lg flex items-center justify-center mr-3 text-2xl`}>
                {topic.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{topic.title}</h3>
            </div>
            <p className="text-gray-700 text-sm">{topic.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Start Guide */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Start Guide</h3>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold mr-3">
              1
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Set Up Your Profile</h4>
              <p className="text-sm text-gray-600">Go to Settings to change your password and configure your preferences.</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold mr-3">
              2
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Add Your First Clinic</h4>
              <p className="text-sm text-gray-600">Navigate to Clinics and click "Add Clinic" to register a medical facility.</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold mr-3">
              3
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Add Patients</h4>
              <p className="text-sm text-gray-600">Go to Patients &gt; Add Patient and fill in the patient information and eye images.</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold mr-3">
              4
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Generate Reports</h4>
              <p className="text-sm text-gray-600">View Reports section to analyze patient data and export information.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Tutorials */}
      <div className="bg-primary border border-primary rounded-lg p-6">
        <h3 className="text-lg font-bold mb-2">Video Tutorials</h3>
        <p className="mb-4">Watch step-by-step video guides to help you get the most out of Orvos.</p>
        <button className="btn-primary">
          Watch Tutorials
        </button>
      </div>
    </div>
  );
};

export default Help;


