import React from 'react';
import { useBusinessHours } from '../../../hooks/useBusinessHours';

const ContactUs = () => {

  const { renderBusinessHours } = useBusinessHours();

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Support</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
          <a
            href={`mailto:${process.env.REACT_APP_SUPPORT_EMAIL}`}
            className="text-sm text-primary hover:underline"
          >
            {process.env.REACT_APP_SUPPORT_EMAIL}
          </a>
        </div>

        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
          <a
            href={`tel:${process.env.REACT_APP_SUPPORT_PHONE_NUMBER.replace(/[^0-9+]/g, '')}`}
            className="text-sm text-primary hover:underline"
          >
            {process.env.REACT_APP_SUPPORT_PHONE_NUMBER}
          </a>
        </div>

        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Hours</h3>
          <p className="text-sm text-gray-600">{process.env.REACT_APP_SUPPORT_HOURS}</p>
        </div>
      </div>

      <div className="text-center p-6 bg-gray-50 rounded-lg mb-3">
        <h2 className="text-2xl font-bold text-gray-800">Contact Us for Diabetic Retinopathy Screening</h2>
      </div>

      {/* <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Send us a message</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input type="text" className="input-field" placeholder="Enter your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="input-field" placeholder="Enter your email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input type="text" className="input-field" placeholder="What can we help you with?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea rows="4" className="input-field resize-none" placeholder="Describe your issue or question"></textarea>
          </div>
          <button type="submit" className="btn-primary">Send Message</button>
        </form>
      </div> */}

      <div className="w-full min-h-screen bg-gray-100 flex flex-col lg:flex-row">

        {/* Left Side Info */}
        <div className="w-full lg:w-6/12 bg-white p-3 border-r border-gray-200">

          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            Better yet, see us in person!
          </h2>

          <p className="text-sm text-gray-600 mb-10 leading-relaxed">
            We love our customers, so feel free to visit during normal business hours.
          </p>

          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {process.env.REACT_APP_NAME}
            </h3>

            <p className="text-md text-gray-600 leading-relaxed">
              {process.env.REACT_APP_SUPPORT_ADDRESS}
            </p>
          </div>

          <div className="mb-3 space-y-1">
            <p className="text-md font-medium text-gray-700">
              <a
                href={`tel:${process.env.REACT_APP_SUPPORT_PHONE_NUMBER.replace(/[^0-9+]/g, '')}`}
                className="text-sm text-primary hover:underline"
              >
                {process.env.REACT_APP_SUPPORT_PHONE_NUMBER}
              </a>
            </p>

            <p className="text-md font-medium text-gray-700">
              <a
                href={`mailto:${process.env.REACT_APP_SUPPORT_EMAIL}`}
                className="text-sm text-primary hover:underline"
              >
                {process.env.REACT_APP_SUPPORT_EMAIL}
              </a>
            </p>
          </div>

          <div>

            <div className="w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Hours
              </h3>

              {/* Dropdown */}
              {renderBusinessHours()}

            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full lg:w-6/12 bg-white">
          <iframe
            src="https://fs26.formsite.com/duxWli/er38rouxqa/index"
            title="Orvos Support"
            className="w-full border-0"
            style={{ height: "100vh" }}
          />
        </div>

      </div>

    </div >
  );
};

export default ContactUs;


