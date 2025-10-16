import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Orvos Medical Clinic Management. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <a href="/support" className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200">
              Support
            </a>
            <a href="/help" className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200">
              Help
            </a>
            <a href="/faq" className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200">
              FAQ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

