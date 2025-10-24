import React, { useEffect } from 'react';
import Faq from './tabs/Faq';
import Help from './tabs/Help';
import ContactUs from './tabs/ContactUs';
import Breadcrumb from '../Common/Breadcrumb';
import { useLocation } from "react-router-dom";
import { useTitle } from '../../context/TitleContext';
  
const Support = () => {
  const location = useLocation();
 const { setPageTitle } = useTitle();
  const [activeSection, setActiveSection] = React.useState('faq');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get("tab");
    if (tab) {
      setActiveSection(tab);
    }
  }, [location.search]);

  useEffect(() => {
    setPageTitle('Support Center');
  }, [setPageTitle]);

    return (
    <div className="space-y-6">
      <Breadcrumb />
      <div className="bg-primary rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Support Center</h1>
        <p className="text-primary-100">Get help and find answers to common questions</p>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveSection('faq')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 ${
                activeSection === 'faq'
                  ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📚 FAQ
            </button>
            <button
              onClick={() => setActiveSection('help')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 ${
                activeSection === 'help'
                  ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              ❓ Help
            </button>
            <button
              onClick={() => setActiveSection('contact')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 ${
                activeSection === 'contact'
                  ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📧 Contact Us
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeSection === 'faq' && <Faq />}
          {activeSection === 'help' && <Help />}
          {activeSection === 'contact' && <ContactUs />}
        </div>
      </div>
    </div>
  );
};

export default Support;


