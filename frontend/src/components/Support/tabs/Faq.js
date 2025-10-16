import React, { useState } from 'react';

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How do I add a new patient?',
      answer: 'Navigate to the Patients section and click the "Add Patient" button. Fill in the required information including patient details, insurance information, and upload eye images. All required fields are marked with an asterisk (*).',
    },
    {
      question: 'How do I manage clinics?',
      answer: 'Go to the Clinics section where you can view, add, edit, or archive clinics. Each clinic requires basic information like company name, contact details, and address. You can also upload contract documents and clinic logos.',
    },
    {
      question: 'How do I generate reports?',
      answer: 'Visit the Reports section, select your desired report type (Clinic Patients or Orvos Doctor Review), choose filters like clinic name, and click "Export to CSV" to download the report.',
    },
    {
      question: 'Can I customize email templates?',
      answer: 'Yes! Go to Settings > Email Templates to create and customize email templates for patient communications. You can use variables like {{patient_name}} and {{clinic_name}} in your templates.',
    },
    {
      question: 'How do patient reminders work?',
      answer: 'Patient appointment reminders are automatically sent 120 days from the last image date if the feature is enabled in Settings > Additional Settings. The patient must have a valid email address on file.',
    },
    {
      question: 'What image formats are supported for eye images?',
      answer: 'We support JPG, JPEG, PNG, and WEBP formats. Each image must be under 5MB in size. You can upload multiple images for both left and right eyes.',
    },
    {
      question: 'How do I archive a clinic?',
      answer: 'In the Clinics list, click the archive icon next to the clinic you want to archive. Archived clinics can be viewed by clicking the "Archives" button at the top of the Clinics page.',
    },
    {
      question: 'Can I add patients without logging in?',
      answer: 'This feature can be enabled in Settings > Additional Settings by checking "Allow adding patients without logging in" and providing a public clinic URL.',
    },
    {
      question: 'How do I change my password?',
      answer: 'Go to Settings > Change Password, enter your current password and your new password (minimum 8 characters). Click "Update Password" to save your changes.',
    },
    {
      question: 'What is the difference between pending and completed patients?',
      answer: 'Pending patients are awaiting review or processing, while completed patients have finished their evaluation. You can change a patient\'s status by clicking the complete icon in the patient list.',
    },
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleFaq(index)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200"
            >
              <span className="font-semibold text-gray-900 text-left">{faq.question}</span>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                  openIndex === index ? 'transform rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 text-gray-700 border-t border-gray-100">
                <p className="pt-3">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;


