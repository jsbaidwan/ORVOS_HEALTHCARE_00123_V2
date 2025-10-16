import React from 'react';
import { useRoutePath } from '../../hooks/useRoutePath';
import { Link } from 'react-router-dom';

const Footer = () => {

  const getRoutePath = useRoutePath();
  
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Orvos Medical Clinic Management. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link to={getRoutePath("/support?tab=contact")} className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200">
              Contact Us
            </Link>
            <Link to={getRoutePath("/support?tab=help")} className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200">
              Help
            </Link>
            <Link to={getRoutePath("/support?tab=faq")} className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

