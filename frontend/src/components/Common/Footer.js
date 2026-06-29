import React from 'react';
import { useRoutePath } from '../../hooks/useRoutePath';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Footer = () => {

  const getRoutePath = useRoutePath();
  const { isAuthenticated} = useAuth();

  return (
    isAuthenticated() ? (
    <>
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-4 py-2 md:px-6 md:py-4">
        <div className="flex flex-row justify-between items-center">
          <p className="text-xs md:text-sm text-gray-600">
            © {new Date().getFullYear()} Orvos Medical Clinic Management. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 md:space-x-6 ml-3 shrink-0">
            <Link to={getRoutePath("/support?tab=contact")} className="text-xs md:text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200">
              Contact Us
            </Link>
            <Link to={getRoutePath("/support?tab=help")} className="text-xs md:text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200">
              Help
            </Link>
            <Link to={getRoutePath("/support?tab=faq")} className="text-xs md:text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
    </>
    ) : (
      <>
       <footer className="relative bottom-0 left-0 w-full bg-[#083B75] text-white text-center">
          <div className="py-3">
            <a href="https://orvoshealthcare.com" className="hover:underline mx-2">Home</a> | 
            <a href="https://orvoshealthcare.com/about-us" className="hover:underline mx-2">About Us</a> | 
            <a href="https://orvoshealthcare.com/contact-us" className="hover:underline mx-2">Contact Us</a> | 
            <a href="https://orvoshealthcare.com/for-providers" className="hover:underline mx-2">For Providers</a>
          </div>

          <p className="text-primary-200 text-sm pb-2">
            © {new Date().getFullYear()} Orvos. All rights reserved.
          </p>
        </footer>

      </>
    )
  );
};

export default Footer;

