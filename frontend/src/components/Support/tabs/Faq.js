import React, { useState } from 'react';

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'As the Clinic Admin can I create another clinic for my organization?',
      answer: 'No. Clinic Admins can only create users for their respective clinics.',
    },
    {
      question: 'Can there be more than 1 Clinic Admin at each clinic?',
      answer: 'No. There can only be 1 Clinic Admin at each clinic.',
    },
    {
      question: 'What are the different roles at each clinic?',
      answer: (
        <ul className="list-none pl-4 space-y-1">
          <li>(a) Clinic Admin – Create Users, Add Patients, Download Reports, Create PDF Templates, View Patients</li>
          <li>(b) User – Download Reports, View Patients</li>
          <li>(c) Doctors – Add Patients, View Patients, Download Reports</li>
          <li>(d) Medical Assistant - Add Patients, View Patients, Download Reports</li>
        </ul>
      ),
    },
    {
      question: 'How long will it take for me to get a diagnosis back?',
      answer: 'Generally, diagnosis should be returned in 24 hours. In the event there may have been an unforeseen high patient volume that day it may take 48 hours.',
    },
    {
      question: 'Are the Orvos doctors licensed in the state my clinic is in?',
      answer: 'Yes. All of our ophthalmologists have medical licenses in the state the clinic is located in.',
    },
    {
      question: 'Is there a way to chart the patient’s retina history in the Orvos portal?',
      answer: 'No. We recommend storing their specific progression in the clinic’s EMR.',
    },
    {
      question: 'What is the maximum number of images I can send for a patient?',
      answer: 'We recommend 2 images per eye. Although there is not a maximum number of images, there is a maximum 5MB size limit that can be uploaded per patient.',
    },
    {
      question: 'As a Clinic Admin can I assign a user to multiple clinics?',
      answer: 'Yes, if a contract is in place with the patient’s health plan.',
    },
    {
      question: 'Can a patient do Self-Pay with Orvos?',
      answer: 'No. It is against HIPAA for users to share accounts.',
    },
    {
      question: 'Is there a way for Orvos to send reminders to patients based on follow up recommendations?',
      answer: 'Yes. If the patient’s email is added, they will get reminders. This feature is off by default.',
    },
    {
      question: 'Can I export my patient list into Excel?',
      answer: 'Yes. All of a clinic’s patients can be exported into Excel.',
    },
    {
      question: 'Can I add a patient without having to log into the portal?',
      answer: 'Yes. Using a special URL, images can be uploaded to a clinic. This feature must be enabled.',
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
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200 btn-primary-light"
            >
              <span className="font-semibold text-gray-900 text-left">{faq.question}</span>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${openIndex === index ? 'transform rotate-180' : ''
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 text-gray-700 border-t border-gray-100 text-sm">
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


